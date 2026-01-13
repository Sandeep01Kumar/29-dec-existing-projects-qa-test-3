/**
 * @fileoverview Minimal HTTP server returning "Hello, World!" for all requests.
 *               Test project for backprop integration.
 * @module server
 * @author hxu
 * @version 1.0.0
 * @license MIT
 * @see {@link https://nodejs.org/api/http.html} Node.js HTTP module documentation
 */

// Import Node.js built-in HTTP module for server creation
const http = require('http');

/**
 * Server hostname - binds to localhost only (not accessible from other machines)
 * @const {string}
 * @default '127.0.0.1'
 */
// Bind to localhost only (not accessible from other machines)
const hostname = '127.0.0.1';

/**
 * Server port number for HTTP connections
 * @const {number}
 * @default 3000
 */
// Default development port
const port = 3000;

/**
 * HTTP server instance with request handler callback
 * @type {http.Server}
 * @description Creates HTTP server that returns "Hello, World!" for all requests.
 *              The request handler processes all incoming HTTP requests regardless
 *              of path or method, responding with a plain text greeting.
 * @param {http.IncomingMessage} req - The incoming HTTP request object
 * @param {http.ServerResponse} res - The HTTP response object
 */
// Create HTTP server with request handler callback
const server = http.createServer((req, res) => {
  // Set HTTP 200 OK status code
  res.statusCode = 200;
  // Declare plain text response format
  res.setHeader('Content-Type', 'text/plain');
  // Send response body and terminate connection
  res.end('Hello, World!\n');
});

/**
 * Start the server and bind to specified host:port
 * @description Begins listening for HTTP connections on configured hostname and port.
 *              When the server successfully binds, the callback logs the server URL.
 * @callback listenCallback - Callback executed when server starts successfully
 */
// Start server and bind to specified host:port
server.listen(port, hostname, () => {
  // Log URL when server is ready to accept connections
  console.log(`Server running at http://${hostname}:${port}/`);
});
