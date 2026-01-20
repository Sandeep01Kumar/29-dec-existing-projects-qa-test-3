/**
 * Production-Ready HTTP Server
 * 
 * A robust HTTP server with comprehensive error handling, graceful shutdown,
 * input validation, and security protections.
 * 
 * @module server
 */

const http = require('http');

// ============================================================================
// Configuration Constants
// ============================================================================

const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;
const REQUEST_TIMEOUT = 30000;      // 30 seconds - max time for entire request
const KEEP_ALIVE_TIMEOUT = 5000;    // 5 seconds - keep-alive connection timeout
const HEADERS_TIMEOUT = 60000;      // 60 seconds - timeout for receiving headers
const SHUTDOWN_TIMEOUT = 10000;     // 10 seconds - max time for graceful shutdown

// ============================================================================
// Server State
// ============================================================================

let isShuttingDown = false;

// ============================================================================
// Allowed HTTP Methods and Paths
// ============================================================================

const ALLOWED_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Validates that a path does not contain path traversal sequences
 * @param {string} path - The URL path to validate
 * @returns {boolean} - True if path is safe, false if it contains traversal sequences
 */
function isValidPath(path) {
  // Reject paths containing ".." (path traversal) or null bytes
  if (path.includes('..') || path.includes('\0')) {
    return false;
  }
  return true;
}

// ============================================================================
// Request Handler
// ============================================================================

/**
 * Handles incoming HTTP requests with validation and error handling
 * @param {http.IncomingMessage} req - The incoming request object
 * @param {http.ServerResponse} res - The server response object
 */
function requestHandler(req, res) {
  // Check if server is shutting down
  if (isShuttingDown) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Connection', 'close');
    res.end('Service Unavailable: Server is shutting down\n');
    return;
  }

  // Set request timeout
  req.setTimeout(REQUEST_TIMEOUT);

  // Handle request errors (e.g., client disconnect, network issues)
  req.on('error', (err) => {
    console.error(`[Request Error] ${err.message}`);
    if (!res.headersSent) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Bad Request\n');
    }
  });

  // Handle response errors (e.g., write errors)
  res.on('error', (err) => {
    console.error(`[Response Error] ${err.message}`);
  });

  // Validate HTTP method
  const method = req.method || 'GET';
  if (!ALLOWED_METHODS.includes(method)) {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Allow', ALLOWED_METHODS.join(', '));
    res.end('Method Not Allowed\n');
    return;
  }

  // Handle OPTIONS request (CORS preflight support)
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Allow', ALLOWED_METHODS.join(', '));
    res.setHeader('Content-Length', '0');
    res.end();
    return;
  }

  // Validate path (protect against path traversal)
  const urlPath = req.url || '/';
  if (!isValidPath(urlPath)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Bad Request: Invalid path\n');
    return;
  }

  // Handle HEAD request (return headers only, no body)
  if (method === 'HEAD') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', '14'); // Length of "Hello, World!\n"
    res.end();
    return;
  }

  // Handle GET request - return Hello World response
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
}

// ============================================================================
// Server Creation and Configuration
// ============================================================================

const server = http.createServer(requestHandler);

// Configure server timeouts
server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT;
server.headersTimeout = HEADERS_TIMEOUT;
server.requestTimeout = REQUEST_TIMEOUT;

// ============================================================================
// Server Error Handling
// ============================================================================

/**
 * Handles server-level errors (binding errors, etc.)
 */
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server Error] Port ${port} is already in use.`);
    console.error('Please stop the other process or use a different port:');
    console.error(`  PORT=<different_port> node server.js`);
    process.exit(1);
  } else if (err.code === 'EACCES') {
    console.error(`[Server Error] Permission denied for port ${port}.`);
    console.error('Try using a port number above 1024, or run with elevated privileges.');
    process.exit(1);
  } else {
    console.error(`[Server Error] ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
});

/**
 * Handles client errors (malformed requests, etc.)
 */
server.on('clientError', (err, socket) => {
  console.error(`[Client Error] ${err.message}`);
  if (socket.writable) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  }
});

// ============================================================================
// Graceful Shutdown
// ============================================================================

/**
 * Gracefully shuts down the server
 * @param {string} signal - The signal that triggered shutdown
 */
function gracefulShutdown(signal) {
  // Prevent duplicate shutdown calls
  if (isShuttingDown) {
    console.log('[Shutdown] Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;
  console.log(`[Shutdown] Received ${signal}. Graceful shutdown initiated...`);

  // Set a timeout to force exit if graceful shutdown takes too long
  const forceExitTimeout = setTimeout(() => {
    console.error('[Shutdown] Graceful shutdown timeout. Forcing exit...');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  // Prevent the timeout from keeping the process alive
  forceExitTimeout.unref();

  // Stop accepting new connections and close existing ones
  server.close((err) => {
    if (err) {
      console.error(`[Shutdown] Error during server close: ${err.message}`);
      clearTimeout(forceExitTimeout);
      process.exit(1);
    }
    
    console.log('[Shutdown] Server closed successfully. Exiting...');
    clearTimeout(forceExitTimeout);
    process.exit(0);
  });
}

// ============================================================================
// Signal Handlers
// ============================================================================

// Handle SIGTERM (sent by orchestrators like Docker, Kubernetes, PM2)
process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM');
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  gracefulShutdown('SIGINT');
});

// ============================================================================
// Global Exception Handlers
// ============================================================================

/**
 * Handles uncaught synchronous exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err.message);
  console.error(err.stack);
  gracefulShutdown('uncaughtException');
});

/**
 * Handles unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] Promise:', promise);
  console.error('[Unhandled Rejection] Reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// ============================================================================
// Server Startup
// ============================================================================

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log('Press Ctrl+C to stop the server gracefully.');
  });
}

// Export for testing purposes
module.exports = { server, gracefulShutdown, isValidPath, requestHandler, port, hostname };
