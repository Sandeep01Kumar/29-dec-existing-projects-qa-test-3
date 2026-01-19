/**
 * Production-Ready Node.js HTTP Server
 * 
 * This implementation addresses the following issues identified in the bug fix:
 * 1. Error Handling - server.on('error') for EADDRINUSE, EACCES, etc.
 * 2. Graceful Shutdown - SIGTERM/SIGINT handlers with connection draining
 * 3. Input Validation - Request timeout configuration
 * 4. Resource Cleanup - Proper shutdown state and forced timeout
 * 5. Security Headers - X-Content-Type-Options: nosniff
 */

const http = require('http');

// Configuration constants
const hostname = '127.0.0.1';
const port = 3000;
const REQUEST_TIMEOUT = 30000; // 30 seconds for request timeout
const SHUTDOWN_TIMEOUT = 10000; // 10 seconds max for graceful shutdown

// Server state tracking
let isShuttingDown = false;
let server = null;

/**
 * Request handler with comprehensive error handling and security features
 * @param {http.IncomingMessage} req - The incoming HTTP request
 * @param {http.ServerResponse} res - The HTTP response object
 */
function requestHandler(req, res) {
  // Reject new requests during shutdown
  if (isShuttingDown) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end('Service Unavailable\n');
    return;
  }

  // Set request timeout to prevent hanging connections
  req.setTimeout(REQUEST_TIMEOUT, () => {
    console.error('Request timeout occurred');
    res.statusCode = 408;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end('Request Timeout\n');
  });

  // Handle request stream errors
  req.on('error', (err) => {
    console.error('Request error:', err.message);
    if (!res.headersSent) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end('Bad Request\n');
    }
  });

  // Handle response stream errors
  res.on('error', (err) => {
    console.error('Response error:', err.message);
  });

  // Send successful response with security headers
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end('Hello, World!\n');
}

// Create HTTP server with request handler
server = http.createServer(requestHandler);

/**
 * Server error handler for startup failures
 * Handles EADDRINUSE (port in use), EACCES (permission denied), and other errors
 */
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Error: Port ${port} is already in use.`);
    console.error('Please stop the other process or use a different port.');
    process.exit(1);
  } else if (err.code === 'EACCES') {
    console.error(`Error: Permission denied to bind to port ${port}.`);
    console.error('Try using a port number above 1024 or run with elevated privileges.');
    process.exit(1);
  } else {
    console.error('Server error:', err.message);
    process.exit(1);
  }
});

/**
 * Graceful shutdown function
 * Stops accepting new connections, waits for existing requests to complete,
 * and forces exit after timeout if connections don't close gracefully
 * @param {string} signal - The signal that triggered shutdown (SIGTERM/SIGINT)
 */
function gracefulShutdown(signal) {
  // Prevent multiple shutdown attempts
  if (isShuttingDown) {
    console.log('Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('All connections closed. Server shut down gracefully.');
    process.exit(0);
  });

  // Force shutdown after timeout
  const shutdownTimer = setTimeout(() => {
    console.error('Shutdown timeout reached. Forcing exit...');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  // Don't keep process alive just for the timer
  shutdownTimer.unref();
}

// Register signal handlers for graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions with graceful degradation
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error(err.stack);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// Export for testing purposes
module.exports = { server, gracefulShutdown, requestHandler };
