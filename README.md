# Hello World Express

A tutorial project demonstrating Express.js with multiple greeting endpoints. This server provides four HTTP GET endpoints, each returning a different greeting message in plain text.

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

## Installation

Install the project dependencies:

```bash
npm install
```

## Running the Server

Start the server using npm:

```bash
npm start
```

Or directly with Node.js:

```bash
node server.js
```

The server will start and display: `Server running at http://127.0.0.1:3000/`

## Available Endpoints

| Endpoint | Method | Response |
|----------|--------|----------|
| `/` | GET | `Hello world` |
| `/good-morning` | GET | `Good morning` |
| `/good-afternoon` | GET | `Good afternoon` |
| `/good-evening` | GET | `Good evening` |

## Testing the Endpoints

You can test the endpoints using curl:

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

Or open the URLs directly in your web browser.

## Project Structure

```
├── server.js        # Express.js application entry point
├── package.json     # npm package manifest
├── package-lock.json # Dependency lock file (auto-generated)
└── node_modules/    # Installed dependencies (auto-generated)
```
