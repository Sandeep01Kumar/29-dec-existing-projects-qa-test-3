/**
 * Production-Ready HTTP Server
 *
 * A robust HTTP server with comprehensive error handling, graceful shutdown,
 * input validation, and security protections.
 */

const http = require('http');

// Configuration
const HOSTNAME = '127.0.0.1';
const PORT = process.env.PORT || 3000;
const REQUEST_TIMEOUT_MS = 30000;
const KEEP_ALIVE_TIMEOUT_MS = 5000;
const HEADERS_TIMEOUT_MS = 60000;
const SHUTDOWN_TIMEOUT_MS = 10000;
const ALLOWED_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Server state
let isShuttingDown = false;

/**
 * Validates that a path does not contain path traversal sequences.
 * @param {string} urlPath - The URL path to validate
 * @returns {boolean} True if path is safe, false otherwise
 */
function isValidPath(urlPath) {
  return !urlPath.includes('..') && !urlPath.includes('\0');
}

/**
 * Handles incoming HTTP requests with validation and error handling.
 * @param {http.IncomingMessage} req - The incoming request
 * @param {http.ServerResponse} res - The server response
 */
function requestHandler(req, res) {
  if (isShuttingDown) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Connection', 'close');
    res.end('Service Unavailable: Server is shutting down\n');
    return;
  }

  req.setTimeout(REQUEST_TIMEOUT_MS);

  req.on('error', (err) => {
    console.error(`[Request Error] ${err.message}`);
    if (!res.headersSent) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Bad Request\n');
    }
  });

  res.on('error', (err) => {
    console.error(`[Response Error] ${err.message}`);
  });

  const method = req.method || 'GET';

  if (!ALLOWED_METHODS.includes(method)) {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Allow', ALLOWED_METHODS.join(', '));
    res.end('Method Not Allowed\n');
    return;
  }

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Allow', ALLOWED_METHODS.join(', '));
    res.setHeader('Content-Length', '0');
    res.end();
    return;
  }

  const urlPath = req.url || '/';

  if (!isValidPath(urlPath)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Bad Request: Invalid path\n');
    return;
  }

  if (method === 'HEAD') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', '14');
    res.end();
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
}

// Server creation and timeout configuration
const server = http.createServer(requestHandler);
server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT_MS;
server.headersTimeout = HEADERS_TIMEOUT_MS;
server.requestTimeout = REQUEST_TIMEOUT_MS;

// Server error handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server Error] Port ${PORT} is already in use.`);
    console.error('Please stop the other process or use a different port:');
    console.error('  PORT=<different_port> node server.js');
    process.exit(1);
  } else if (err.code === 'EACCES') {
    console.error(`[Server Error] Permission denied for port ${PORT}.`);
    console.error('Try using a port number above 1024, or run with elevated privileges.');
    process.exit(1);
  } else {
    console.error(`[Server Error] ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
});

server.on('clientError', (err, socket) => {
  console.error(`[Client Error] ${err.message}`);
  if (socket.writable) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  }
});

/**
 * Gracefully shuts down the server.
 * @param {string} signal - The signal that triggered shutdown
 */
function gracefulShutdown(signal) {
  if (isShuttingDown) {
    console.log('[Shutdown] Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;
  console.log(`[Shutdown] Received ${signal}. Graceful shutdown initiated...`);

  const forceExitTimeout = setTimeout(() => {
    console.error('[Shutdown] Graceful shutdown timeout. Forcing exit...');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  forceExitTimeout.unref();

  server.close((err) => {
    clearTimeout(forceExitTimeout);
    if (err) {
      console.error(`[Shutdown] Error during server close: ${err.message}`);
      process.exit(1);
    }
    console.log('[Shutdown] Server closed successfully. Exiting...');
    process.exit(0);
  });
}

// Signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Global exception handlers
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err.message);
  console.error(err.stack);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] Promise:', promise);
  console.error('[Unhandled Rejection] Reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start server if run directly
if (require.main === module) {
  server.listen(PORT, HOSTNAME, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
    console.log('Press Ctrl+C to stop the server gracefully.');
  });
}

// Exports for testing
module.exports = { server, gracefulShutdown, isValidPath, requestHandler, port: PORT, hostname: HOSTNAME };
