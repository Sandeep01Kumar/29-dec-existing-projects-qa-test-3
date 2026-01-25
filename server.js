/**
 * Express.js Application Entry Point
 * 
 * This file provides an HTTP server using Express.js framework with four greeting endpoints.
 * Each endpoint responds with a plain text greeting message.
 * 
 * Available Endpoints:
 * - GET /              → Returns "Hello world"
 * - GET /good-morning  → Returns "Good morning"
 * - GET /good-afternoon → Returns "Good afternoon"
 * - GET /good-evening  → Returns "Good evening"
 * 
 * Server Configuration:
 * - Host: 127.0.0.1 (localhost)
 * - Port: 3000
 * 
 * To run this server:
 * 1. Install dependencies: npm install
 * 2. Start the server: npm start (or node server.js)
 * 3. Open your browser or use curl to test the endpoints
 */

// =============================================================================
// MODULE IMPORTS
// =============================================================================
// Import the Express.js framework - this provides all the HTTP server functionality
const express = require('express');

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================
// Server host address - 127.0.0.1 means the server only accepts local connections
const HOST = '127.0.0.1';

// Server port number - 3000 is a common port for development servers
const PORT = 3000;

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================
// Create an Express application instance
// This app object is used to define routes and start the server
const app = express();

// =============================================================================
// ROUTE HANDLERS
// =============================================================================
// Each route handler responds to HTTP GET requests at a specific path
// The res.send() method automatically sets Content-Type to text/plain for strings

/**
 * Root endpoint handler
 * Responds with "Hello world" when accessing the root URL
 */
app.get('/', (req, res) => {
  res.send('Hello world');
});

/**
 * Good morning endpoint handler
 * Responds with "Good morning" greeting
 */
app.get('/good-morning', (req, res) => {
  res.send('Good morning');
});

/**
 * Good afternoon endpoint handler
 * Responds with "Good afternoon" greeting
 */
app.get('/good-afternoon', (req, res) => {
  res.send('Good afternoon');
});

/**
 * Good evening endpoint handler
 * Responds with "Good evening" greeting
 */
app.get('/good-evening', (req, res) => {
  res.send('Good evening');
});

// =============================================================================
// SERVER STARTUP
// =============================================================================
// Start the server and listen for incoming HTTP requests
// The callback function runs once the server is successfully started
app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
