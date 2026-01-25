# hello-world-express

A beginner-friendly tutorial project demonstrating Express.js with multiple greeting endpoints. This server provides four simple HTTP GET endpoints that return different greeting messages as plain text.

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

Or alternatively:

```bash
node server.js
```

The server will start on `http://127.0.0.1:3000`.

## Available Endpoints

| Endpoint | Method | Response |
|----------|--------|----------|
| `/` | GET | `Hello world` |
| `/good-morning` | GET | `Good morning` |
| `/good-afternoon` | GET | `Good afternoon` |
| `/good-evening` | GET | `Good evening` |

## Testing

You can test the endpoints using curl or your web browser:

```bash
# Test root endpoint
curl http://127.0.0.1:3000/

# Test good morning endpoint
curl http://127.0.0.1:3000/good-morning

# Test good afternoon endpoint
curl http://127.0.0.1:3000/good-afternoon

# Test good evening endpoint
curl http://127.0.0.1:3000/good-evening
```

Or simply open any of the URLs in your web browser.

## Project Structure

```
.
├── server.js        # Express.js application entry point
├── package.json     # npm package manifest with dependencies
└── README.md        # Project documentation
```
