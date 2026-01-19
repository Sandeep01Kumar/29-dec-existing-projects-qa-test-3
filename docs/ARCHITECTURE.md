# Architecture Documentation

This document provides a detailed overview of the hao-backprop-test system architecture.

## Table of Contents

- [System Overview](#system-overview)
- [Component Architecture](#component-architecture)
- [Request Flow](#request-flow)
- [Technology Stack](#technology-stack)
- [Code Structure](#code-structure)
- [Configuration](#configuration)
- [Deployment Model](#deployment-model)

## System Overview

The hao-backprop-test project is a minimal HTTP server designed for Backprop integration testing. It follows a single-file, zero-dependency architecture pattern.

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| Simplicity | Single-file server with no external dependencies |
| Predictability | Fixed response for all requests |
| Portability | Uses only Node.js built-in modules |
| Testability | Consistent behavior for integration tests |

### System Context

```mermaid
C4Context
    title System Context Diagram
    
    Person(tester, "Tester", "Integration test runner")
    System(server, "hao-backprop-test", "Minimal HTTP server returning Hello, World!")
    System_Ext(backprop, "Backprop", "Integration testing system")
    
    Rel(tester, server, "HTTP GET /")
    Rel(backprop, server, "Integration tests")
```

## Component Architecture

### High-Level Architecture

```mermaid
flowchart TB
    subgraph NodeJS["Node.js Runtime"]
        subgraph Server["HTTP Server"]
            HTTP[http module]
            Handler[Request Handler]
        end
    end
    
    Client[HTTP Client] -->|GET /| HTTP
    HTTP --> Handler
    Handler -->|200 OK| Client
```

### Component Description

| Component | Description | Source |
|-----------|-------------|--------|
| HTTP Module | Node.js built-in HTTP server | `require('http')` |
| Server Instance | HTTP server created via `http.createServer()` | `server.js:6` |
| Request Handler | Callback function processing requests | `server.js:6-10` |
| Response Writer | Sends HTTP response with status and body | `server.js:7-9` |

## Request Flow

### Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant S as HTTP Server
    participant H as Request Handler
    
    C->>S: HTTP GET /
    S->>H: Invoke callback(req, res)
    H->>H: Set statusCode = 200
    H->>H: Set Content-Type header
    H->>H: Write response body
    H-->>S: Response complete
    S-->>C: HTTP 200 OK<br/>"Hello, World!"
```

### Request Processing Steps

| Step | Action | Code Reference |
|------|--------|----------------|
| 1 | Client sends HTTP request | External |
| 2 | Server receives request | `server.listen()` |
| 3 | Handler sets status code to 200 | `server.js:7` |
| 4 | Handler sets Content-Type header | `server.js:8` |
| 5 | Handler writes response body | `server.js:9` |
| 6 | Response sent to client | Automatic |

### Server Startup Flow

```mermaid
flowchart LR
    A[Start: node server.js] --> B[Load http module]
    B --> C[Define configuration]
    C --> D[Create HTTP server]
    D --> E[Attach request handler]
    E --> F[Bind to host:port]
    F --> G[Log startup message]
    G --> H[Accept connections]
    
    style A fill:#e1f5fe
    style H fill:#c8e6c9
```

## Technology Stack

### Runtime Environment

```mermaid
flowchart TB
    subgraph Stack["Technology Stack"]
        OS[Operating System]
        NODE[Node.js Runtime v14+]
        V8[V8 JavaScript Engine]
        HTTP[HTTP Module]
        APP[server.js]
    end
    
    OS --> NODE
    NODE --> V8
    V8 --> HTTP
    HTTP --> APP
```

### Stack Components

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Application | JavaScript | ES6+ | Server logic |
| Runtime | Node.js | 14.x+ | JavaScript execution |
| HTTP | http module | Built-in | HTTP server functionality |
| Engine | V8 | (bundled) | JavaScript compilation |

### Dependencies

```mermaid
pie title Dependencies
    "Built-in (http)" : 100
    "External" : 0
```

This project has **zero external dependencies**, using only the Node.js built-in `http` module.

## Code Structure

### File Organization

```
hao-backprop-test/
├── server.js           # Main server implementation (14 lines)
├── package.json        # npm package configuration
├── package-lock.json   # Dependency lock (empty deps)
└── docs/
    └── ARCHITECTURE.md # This file
```

### Server.js Structure

```mermaid
flowchart TB
    subgraph serverjs["server.js"]
        IMP[Line 1: Import http module]
        CFG[Lines 3-4: Configuration constants]
        SRV[Lines 6-10: Server creation & handler]
        LSN[Lines 12-14: Server startup]
    end
    
    IMP --> CFG
    CFG --> SRV
    SRV --> LSN
```

### Code Anatomy

| Lines | Purpose | Description |
|-------|---------|-------------|
| 1 | Import | Load Node.js http module |
| 3-4 | Configuration | Define hostname and port constants |
| 6-10 | Server Logic | Create server with request handler |
| 12-14 | Startup | Start listening and log message |

## Configuration

### Configuration Values

```mermaid
flowchart LR
    subgraph Config["Configuration"]
        H[hostname: 127.0.0.1]
        P[port: 3000]
        CT[Content-Type: text/plain]
        SC[statusCode: 200]
    end
    
    H --> Server
    P --> Server
    subgraph Response["Response Config"]
        CT
        SC
    end
    Server --> Response
```

### Configuration Matrix

| Parameter | Value | Type | Modifiable | Location |
|-----------|-------|------|------------|----------|
| hostname | `127.0.0.1` | string | Source code only | `server.js:3` |
| port | `3000` | number | Source code only | `server.js:4` |
| statusCode | `200` | number | Source code only | `server.js:7` |
| Content-Type | `text/plain` | string | Source code only | `server.js:8` |
| Response body | `Hello, World!\n` | string | Source code only | `server.js:9` |

## Deployment Model

### Local Development

```mermaid
flowchart TB
    subgraph Local["Local Machine"]
        DEV[Developer Terminal]
        NODE[Node.js Process]
        SERVER[HTTP Server<br/>127.0.0.1:3000]
    end
    
    DEV -->|node server.js| NODE
    NODE --> SERVER
    CURL[curl/browser] -->|HTTP GET| SERVER
    SERVER -->|Hello, World!| CURL
```

### Limitations

| Aspect | Current State | Reason |
|--------|---------------|--------|
| Network Access | Localhost only | Bound to 127.0.0.1 |
| Scalability | Single instance | Test project |
| High Availability | None | Not required |
| Containerization | Not implemented | Minimal scope |

---

## References

- **Source Code**: [server.js](../server.js)
- **Configuration**: [package.json](../package.json)
- **Main Documentation**: [README.md](../README.md)

[← Back to README](../README.md)
