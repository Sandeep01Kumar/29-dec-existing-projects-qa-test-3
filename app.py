"""
Flask Application Entry Point

This module provides HTTP server functionality equivalent to the original Node.js server.js.
Handles all HTTP requests with a catch-all route returning "Hello, World!\n" response
with text/plain content type and HTTP 200 status code. Server binds to 127.0.0.1:3000.

Transformation mapping from Node.js:
- require('http') → from flask import Flask, Response
- const hostname = '127.0.0.1' → HOST = '127.0.0.1'
- const port = 3000 → PORT = 3000
- http.createServer(callback) → Flask(__name__) with route decorators
- res.statusCode = 200 → Default Flask response (200)
- res.setHeader('Content-Type', 'text/plain') → mimetype='text/plain' in Response
- res.end('Hello, World!\n') → return Response('Hello, World!\n', mimetype='text/plain')
- server.listen(port, hostname) → app.run(host=HOST, port=PORT)
"""

from flask import Flask, Response

# Server configuration constants (equivalent to Node.js const declarations)
HOST = '127.0.0.1'
PORT = 3000

# Create Flask application instance (equivalent to http.createServer())
app = Flask(__name__)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def hello(path):
    """
    Catch-all route handler that responds to all HTTP requests.
    
    This function is equivalent to the Node.js server callback:
        (req, res) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Hello, World!\n');
        }
    
    Args:
        path: The request path (captured by catch-all route, but not used).
              All paths return the same response to match original behavior.
    
    Returns:
        Response: A Flask Response object with:
            - Body: 'Hello, World!\n' (exact string with newline)
            - Content-Type: text/plain
            - Status Code: 200 (Flask default)
    """
    return Response('Hello, World!\n', mimetype='text/plain')


if __name__ == '__main__':
    # Start the Flask development server
    # Equivalent to Node.js: server.listen(port, hostname, () => {...})
    # Flask automatically logs: "Running on http://127.0.0.1:3000"
    # which is equivalent to Node.js: console.log(`Server running at http://${hostname}:${port}/`)
    app.run(host=HOST, port=PORT)
