/**
 * Robust Node.js HTTP Server
 * Features: Error handling, graceful shutdown,
 * process-level handlers, resource cleanup
 */
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

/**
 * Create HTTP server with enhanced request handler
 * Includes request logging and error isolation via try-catch
 */
const server = http.createServer((req, res) => {
  // Log incoming request with timestamp, method, and URL path
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  try {
    // Original response logic preserved
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, World!\n');
  } catch (err) {
    // Handle synchronous errors in request processing
    console.error('Request handler error:', err.message);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Internal Server Error\n');
    }
  }
});

/**
 * Handle server-level errors
 * Catches critical errors like EADDRINUSE (port in use) and EACCES (permission denied)
 */
server.on('error', (err) => {
  console.error('Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please free the port or use a different one.`);
  } else if (err.code === 'EACCES') {
    console.error(`Permission denied to bind to port ${port}. Try using a port > 1024 or run with elevated privileges.`);
  }
  process.exit(1);
});

/**
 * Handle client connection errors
 * Responds with 400 Bad Request for malformed HTTP requests
 */
server.on('clientError', (err, socket) => {
  console.error('Client error:', err.message);
  if (socket.writable) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  }
});

/**
 * Graceful shutdown function
 * Stops accepting new connections while completing existing requests
 * Forces shutdown after timeout period
 * @param {string} signal - The signal or event that triggered shutdown
 */
function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close((err) => {
    if (err) {
      console.error('Error during server close:', err.message);
      process.exit(1);
    }
    console.log('Server closed successfully. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful close hasn't completed
  // Using .unref() allows the process to exit if this is the only timer
  setTimeout(() => {
    console.error('Graceful shutdown timed out after 10 seconds. Forcing exit.');
    process.exit(1);
  }, 10000).unref();
}

/**
 * Register signal handlers for graceful shutdown
 * SIGTERM: Sent by process managers (e.g., Docker, Kubernetes) for termination
 * SIGINT: Sent when user presses Ctrl+C
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Handle uncaught exceptions
 * Logs the error and initiates graceful shutdown
 */
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error('Stack trace:', err.stack);
  gracefulShutdown('uncaughtException');
});

/**
 * Handle unhandled promise rejections
 * Logs the rejection reason and initiates graceful shutdown
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  gracefulShutdown('unhandledRejection');
});

/**
 * Start the server
 */
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log('Press Ctrl+C to stop the server gracefully.');
});
