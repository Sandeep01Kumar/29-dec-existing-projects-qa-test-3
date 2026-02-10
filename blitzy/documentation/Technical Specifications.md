# Technical Specification

# 0. Agent Action Plan

## 0.1 Intent Clarification


### 0.1.1 Core Testing Objective

Based on the provided requirements, the Blitzy platform understands that the testing objective is to **create a comprehensive unit test suite for the HTTP server functionality** currently implemented in this repository. The user's original request references `server.js`, however, repository analysis reveals that `server.js` is an empty zero-byte placeholder file and the actual server implementation has been migrated to `app.py` — a Python Flask application. The Blitzy platform will therefore map the user's intent to the actual codebase where the server logic resides.

**Request Category:** Add new tests (the repository contains zero existing test files or test infrastructure)

The testing requirements, enhanced with implicit needs, are:

- **HTTP Response Content Testing** — Verify the server returns the exact response body `"Hello, World!\n"` (14 bytes) including the trailing newline character, matching the original Node.js server behavior documented in `app.py` lines 1–17
- **HTTP Status Code Testing** — Validate all routes return HTTP 200 status code as the default Flask response behavior defined in `app.py` line 52
- **HTTP Header Testing** — Assert the `Content-Type` header is `text/plain` as specified by the `mimetype='text/plain'` parameter in `app.py` line 52
- **Server Configuration Testing** — Confirm `HOST = '127.0.0.1'` and `PORT = 3000` constants at `app.py` lines 22–23 are correctly defined for server binding
- **Catch-All Route Testing** — Test that both the root path `/` and arbitrary nested paths (e.g., `/any/path/here`) return identical responses, as implemented by the dual route decorators at `app.py` lines 29–30
- **Error Handling & Edge Case Testing** — Cover boundary conditions including empty paths, deeply nested paths, special characters in URLs, various HTTP methods, and malformed requests
- **Server Startup/Shutdown Testing** — Verify the Flask application instance is created correctly and the `app.run()` configuration is properly defined

### 0.1.2 Special Instructions and Constraints

- **Critical Repository Constraint:** The `README.md` at line 3 states: `"Do not touch!"` — This means source code (`app.py`) must not be modified; only test files and test configurations will be added
- **Framework Adaptation:** The user requested "Jest or Mocha" but since the codebase is Python/Flask (not Node.js), the equivalent Python testing framework **pytest** with **pytest-flask** will be used. This is the idiomatic and recommended approach per the tech spec section 6.6.7.1 and Flask's official documentation
- **User Setup Instruction:** `npm run` — This command is not functional since `package.json` is empty (zero bytes). The Python-equivalent setup uses `pip install` and `pytest` commands
- **Environment Variables:** `DB_HOST` and `DB_HOST1` are available but not referenced by `app.py`, so they are not relevant to the current testing scope
- **No Existing Test Patterns:** The repository has no existing test files to reference for conventions, so standard pytest conventions will be adopted

### 0.1.3 Technical Interpretation

These testing requirements translate to the following technical test implementation strategy:

- To **test HTTP responses**, we will **create** `tests/test_app.py` using Flask's built-in test client (`app.test_client()`) to make requests without running a live server, verifying response body content matches `"Hello, World!\n"` exactly
- To **test status codes**, we will **create** assertions in `tests/test_app.py` checking `response.status_code == 200` for all route patterns
- To **test headers**, we will **create** assertions in `tests/test_app.py` validating `response.content_type == 'text/plain'` and inspecting the full header set
- To **test server configuration**, we will **create** `tests/test_server_config.py` that imports and validates `HOST`, `PORT`, and `app` constants from `app.py`
- To **test catch-all routing**, we will **create** parametrized tests in `tests/test_app.py` that send requests to multiple paths (`/`, `/test`, `/a/b/c`, `/special%20chars`) and verify uniform responses
- To **test edge cases**, we will **create** `tests/test_edge_cases.py` covering unusual HTTP methods, very long paths, special characters, concurrent-like request patterns, and boundary conditions
- To **configure the test infrastructure**, we will **create** `tests/conftest.py` with pytest fixtures for the Flask app and test client, plus `pytest.ini` for test runner configuration

### 0.1.4 Coverage Requirements Interpretation

- **Explicit coverage target:** Not specified by the user; the word "comprehensive" implies maximum achievable coverage
- **Implicit coverage expectation:** Given the 61-line codebase with deterministic behavior, the target is **100% line coverage** and **100% branch coverage** for `app.py`
- **Industry standard:** For a small Flask application, pytest-cov with 100% coverage is the standard expectation per Flask's official testing documentation
- **Coverage scope:** All executable lines in `app.py` (imports, constants, Flask app creation, route decorators, handler function, response construction, and `__main__` guard) must be exercised by at least one test
- To achieve comprehensive testing, coverage should include every route pattern, response attribute, and configuration constant, ensuring no untested code paths remain in the 61-line application


## 0.2 Test Discovery and Analysis


### 0.2.1 Existing Test Infrastructure Assessment

A comprehensive repository search was conducted to discover any existing test infrastructure. The following search patterns were applied across the entire repository:

- `*test*`, `*spec*`, `test_*`, `spec_*`, `*_test.*`, `*_spec.*` — No matching executable test files found
- `jest.config.*`, `pytest.ini`, `.mocharc.*`, `karma.conf.*`, `vitest.config.*` — No test configuration files found
- `package.json` — Empty zero-byte file; no Node.js testing dependencies present
- `requirements.txt` — Contains only `Flask>=3.1.0`; no testing dependencies declared
- `conftest.py`, `setup.cfg`, `pyproject.toml`, `tox.ini` — None exist in the repository

**Files found with "test" in their name (all non-functional):**

| File | Size | Content | Status |
|------|------|---------|--------|
| `test.py - Copy.txt` | 0 bytes | Empty | Non-functional artifact |
| `test.py.txt` | 0 bytes | Empty | Non-functional artifact |
| `test.txt.txt` | 0 bytes | Empty | Non-functional artifact |
| `LoginTest.java` | Non-zero | Incomplete/broken Java code | Irrelevant to Python project |

Repository analysis reveals **zero test infrastructure** — no testing framework is installed, no test configuration exists, no test fixtures or factories are present, and no coverage tools are configured. The entire testing foundation must be built from scratch.

**Current Test Infrastructure Summary:**

- **Testing framework:** None installed (pytest 9.0.2 to be introduced)
- **Test runner configuration:** None (pytest.ini to be created)
- **Coverage tools:** None (pytest-cov 7.0.0 to be introduced)
- **Mock/stub libraries:** None required (Flask's test client is self-contained)
- **Test data fixtures/factories:** None (conftest.py with app fixture to be created)

### 0.2.2 Web Search Research Conducted

The following research was conducted to ensure best practices are followed:

- **pytest + pytest-flask compatibility with Python 3.12:** Confirmed compatible. pytest-flask 1.3.0 explicitly added support for Python 3.10, 3.11, and 3.12, and fixed Flask 3.0 compatibility. pytest 9.0.2 supports Python 3.10 through 3.14.
- **Flask test client best practices:** Flask's built-in `test_client()` provides a fully self-contained HTTP client that requires no live server, supporting all HTTP methods and response inspection
- **pytest-cov coverage measurement for Flask:** The standard approach uses `pytest --cov=app --cov-report=term-missing` for line-by-line coverage analysis
- **Common pitfalls with Flask catch-all routes in testing:** The `/<path:path>` converter does not match the root `/` path, requiring the `defaults={'path': ''}` pattern used in `app.py` — tests must verify both route patterns independently
- **Test organization conventions for Python:** Standard pytest discovery uses `tests/` directory with `test_*.py` naming; `conftest.py` provides shared fixtures at each directory level


## 0.3 Testing Scope Analysis


### 0.3.1 Test Target Identification

**Primary code to be tested:**

- **Module:** `app` at `app.py` — requires unit tests, integration tests, and edge case tests
- **Functions and components to test:**
  - `hello(path)` at line 31 — The catch-all route handler; requires happy-path, edge-case, and error-handling tests
  - `app` (Flask instance) at line 26 — Requires configuration validation tests
  - `HOST` constant at line 22 — Requires value assertion test
  - `PORT` constant at line 23 — Requires value assertion test
  - `app.run(host=HOST, port=PORT)` at line 60 — Requires startup configuration test (guarded by `__main__`)
  - Route decorators at lines 29–30 — Require routing behavior tests for both `/` and `/<path:path>`

**Existing test file mapping:**

| Source File | Existing Test File | Test Categories Present |
|-------------|-------------------|------------------------|
| `app.py` | None | None — all tests to be created |

**Dependencies requiring mocking:**

- No external services to mock — `app.py` has no database, API, or file system calls
- No environment variable dependencies — `DB_HOST` and `DB_HOST1` are not referenced in `app.py`
- `app.run()` in the `__main__` block requires patching to test startup without actually binding a port
- Flask's internal `werkzeug` server is not tested directly; only the application-level behavior is in scope

### 0.3.2 Version Compatibility Research

Based on the repository's Python 3.12 runtime and `Flask>=3.1.0` requirement, the recommended testing stack is:

| Component | Package | Version | Compatibility Rationale |
|-----------|---------|---------|------------------------|
| Runtime | Python | 3.12.3 | Highest version installed and verified; supported by all testing tools |
| Web Framework | Flask | 3.1.2 | Installed from `requirements.txt`; the code under test |
| Testing Framework | pytest | 9.0.2 | Latest stable release; Python 3.12 support confirmed; dropped Python 3.9 |
| Flask Test Plugin | pytest-flask | 1.3.0 | Explicitly added Python 3.12 support and Flask 3.0+ compatibility |
| Coverage Tool | pytest-cov | 7.0.0 | Compatible with pytest 9.x and Python 3.12; wraps coverage.py |
| HTTP Toolkit | Werkzeug | 3.1.3 | Installed as Flask dependency; provides test client infrastructure |

**Version conflicts identified:** None. All packages in the stack are mutually compatible and have been verified through installation in the `testvenv` virtual environment.


## 0.4 Test Implementation Design


### 0.4.1 Test Strategy Selection

**Test types to implement:**

- **Unit tests:** Focus on the isolated `hello(path)` handler function and server configuration constants (`HOST`, `PORT`, `app`). These tests use Flask's test client without a live server.
- **Integration tests:** Cover the full Flask application request-response cycle, verifying that route decorators, the handler function, and Flask's Response object work together to produce correct HTTP responses.
- **Edge case tests:** Address boundary conditions including empty paths, very long URLs, special characters, Unicode paths, URL-encoded segments, and deeply nested path structures.
- **Error handling tests:** Verify behavior for unsupported HTTP methods (POST, PUT, DELETE, PATCH, OPTIONS, HEAD), malformed URLs, and invalid request patterns.
- **Server configuration tests:** Validate that the Flask app instance is configured correctly and that `app.run()` receives the proper host and port parameters when invoked through the `__main__` guard.

### 0.4.2 Test Case Blueprint

```
Component: hello(path) - Route Handler
Test Categories:
- Happy path: GET /, GET /test, GET /a/b/c all return "Hello, World!\n"
- Edge cases: Empty path, trailing slashes, unicode paths, URL-encoded chars
- Error cases: Non-GET methods, extremely long paths
- Response validation: Status 200, Content-Type text/plain, exact body match
```

```
Component: Flask App Configuration
Test Categories:
- Happy path: HOST=='127.0.0.1', PORT==3000, app is Flask instance
- Edge cases: Verify app.name matches __name__ convention
- Error cases: N/A (constants are deterministic)
- Startup validation: app.run() called with correct parameters
```

```
Component: Catch-All Routing
Test Categories:
- Happy path: Root path /, single segment /page, nested /a/b/c
- Edge cases: Paths with dots /file.txt, query strings ?key=val
- Error cases: N/A (catch-all accepts all valid paths)
- Uniformity: All paths produce identical response body and headers
```

### 0.4.3 Existing Test Extension Strategy

Since no existing tests exist in the repository, this section is replaced by a **greenfield test creation strategy**:

- **No tests to extend** — All test files are new creations
- **No tests to refactor** — No legacy test patterns to update
- **No tests to fix** — No broken test files identified
- **Convention source:** Standard pytest + pytest-flask conventions will be adopted since the repository establishes no existing test patterns. The `conftest.py` fixture approach will serve as the foundation for all test modules.

### 0.4.4 Test Data and Fixtures Design

**Required test data structures:**

- **Path test data:** A parametrized list of URL paths covering root, single-segment, multi-segment, special-character, and edge-case paths
- **HTTP method test data:** A parametrized list of HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS) for method-handling tests
- **Expected response constants:** The exact expected body (`"Hello, World!\n"`), status code (`200`), and content type (`text/plain; charset=utf-8`)

**Fixture organization strategy:**

- `tests/conftest.py` — Central fixture file containing:
  - `app` fixture: Returns the Flask application instance imported from `app.py`
  - `client` fixture: Returns `app.test_client()` for making HTTP requests
  - Path data fixtures for parametrized tests

**Mock object specifications:**

- `unittest.mock.patch` for `app.run()` — Intercepts the server startup call to validate parameters without binding a network port
- No other mocks required — the application has no external dependencies

**Test state management:**

- Each test uses a fresh test client via the `client` fixture (function-scoped by default in pytest)
- No database state to manage
- No cleanup required between tests (stateless application)


## 0.5 Test File Transformation Mapping


### 0.5.1 File-by-File Test Plan

Every test file to be created, updated, or deleted is mapped below with the target file listed first:

| Target Test File | Transformation | Source File/Reference | Purpose/Changes |
|-----------------|----------------|----------------------|-----------------|
| `tests/__init__.py` | CREATE | N/A | Empty init file to make `tests/` a Python package for proper imports |
| `tests/conftest.py` | CREATE | `app.py` | Shared pytest fixtures: `app` fixture returning Flask app instance, `client` fixture returning test client |
| `tests/test_http_responses.py` | CREATE | `app.py` (lines 29–52) | Unit tests for HTTP response body content — verify exact `"Hello, World!\n"` string for all routes |
| `tests/test_status_codes.py` | CREATE | `app.py` (lines 29–52) | Unit tests for HTTP status codes — verify 200 OK for all supported routes and methods |
| `tests/test_headers.py` | CREATE | `app.py` (line 52) | Unit tests for HTTP headers — verify `Content-Type: text/plain`, `Content-Length`, and standard Flask headers |
| `tests/test_server_config.py` | CREATE | `app.py` (lines 22–26, 55–60) | Unit tests for server configuration constants (HOST, PORT) and Flask app instance properties |
| `tests/test_routing.py` | CREATE | `app.py` (lines 29–30) | Unit tests for catch-all routing behavior — verify `/` and `/<path:path>` decorators work uniformly |
| `tests/test_error_handling.py` | CREATE | `app.py` (lines 29–52) | Unit tests for error handling — test unsupported HTTP methods, verify Flask's default error responses |
| `tests/test_edge_cases.py` | CREATE | `app.py` (lines 29–52) | Edge case tests — long URLs, special characters, Unicode paths, URL encoding, deeply nested paths |
| `pytest.ini` | CREATE | N/A | Test runner configuration: test discovery paths, markers, and output settings |

### 0.5.2 New Test Files Detail

- **`tests/__init__.py`** — Empty package init
  - Purpose: Enable Python package imports within the test directory

- **`tests/conftest.py`** — Shared fixtures
  - Fixture `app`: Imports and returns the Flask application from `app.py`
  - Fixture `client`: Creates and returns `app.test_client()` for HTTP request testing
  - Scope: Function-level (fresh client per test for isolation)

- **`tests/test_http_responses.py`** — Response body validation
  - Test categories: Happy path (root, subpath, nested path), exact string match, encoding verification
  - Mock dependencies: None
  - Assertions focus: `response.data == b"Hello, World!\n"` and `response.get_data(as_text=True) == "Hello, World!\n"`

- **`tests/test_status_codes.py`** — Status code validation
  - Test categories: 200 for GET on root, 200 for GET on subpaths, method-specific status codes
  - Mock dependencies: None
  - Assertions focus: `response.status_code == 200` across all test paths

- **`tests/test_headers.py`** — Header validation
  - Test categories: Content-Type verification, Content-Length consistency, standard header presence
  - Mock dependencies: None
  - Assertions focus: `response.content_type`, `response.headers['Content-Type']`, header key existence

- **`tests/test_server_config.py`** — Configuration validation
  - Test categories: Constant values, Flask app properties, `app.run()` parameter verification
  - Mock dependencies: `unittest.mock.patch` on `app.run` to intercept startup without port binding
  - Assertions focus: `HOST == '127.0.0.1'`, `PORT == 3000`, `isinstance(app, Flask)`

- **`tests/test_routing.py`** — Route behavior validation
  - Test categories: Root path, single-segment paths, multi-segment paths, path parameter handling
  - Mock dependencies: None
  - Assertions focus: Uniform response across all path patterns; parametrized with diverse paths

- **`tests/test_error_handling.py`** — Error scenario validation
  - Test categories: POST/PUT/DELETE/PATCH method responses, HEAD method behavior, OPTIONS method behavior
  - Mock dependencies: None
  - Assertions focus: Flask's default 405 Method Not Allowed for unsupported methods; HEAD returns headers without body

- **`tests/test_edge_cases.py`** — Boundary condition validation
  - Test categories: Very long paths (1000+ characters), special characters (`%20`, `@`, `#`), Unicode paths, empty segments, trailing slashes, query strings
  - Mock dependencies: None
  - Assertions focus: Application stability and consistent response under unusual inputs

### 0.5.3 Test Files to Modify Detail

No existing test files require modification. All files in the transformation map are newly created (CREATE mode). The repository's existing `test.py - Copy.txt`, `test.py.txt`, and `test.txt.txt` files are empty zero-byte artifacts and will not be modified or referenced.

### 0.5.4 Test Configuration Updates

- **`pytest.ini`** (CREATE): Root-level test configuration file
  - `[pytest]` section with `testpaths = tests`
  - `python_files = test_*.py`
  - `python_classes = Test*`
  - `python_functions = test_*`
  - `addopts = -v --tb=short`
  - Marker definitions for test categorization

### 0.5.5 Cross-File Test Dependencies

- **Shared fixtures:** `tests/conftest.py` provides `app` and `client` fixtures consumed by all test modules (`test_http_responses.py`, `test_status_codes.py`, `test_headers.py`, `test_routing.py`, `test_error_handling.py`, `test_edge_cases.py`)
- **Mock objects:** `unittest.mock.patch` from the Python standard library is used exclusively in `tests/test_server_config.py` for patching `app.run()`
- **Test utilities:** No separate utility module is needed; pytest's built-in `parametrize` decorator handles test data variation
- **Import dependencies:** All test files import the `client` fixture from `conftest.py` implicitly via pytest's fixture injection; `test_server_config.py` additionally imports `HOST`, `PORT`, and `app` directly from the `app` module


## 0.6 Dependency Inventory


### 0.6.1 Testing Dependencies

All testing packages required for this exercise are listed below with exact verified versions:

| Registry | Package Name | Version | Purpose |
|----------|-------------|---------|---------|
| pip | pytest | 9.0.2 | Core testing framework — test discovery, execution, assertions, and parametrize |
| pip | pytest-flask | 1.3.0 | Flask-specific pytest plugin — provides app and client fixtures for Flask testing |
| pip | pytest-cov | 7.0.0 | Coverage measurement — wraps coverage.py for pytest integration and reporting |
| pip | Flask | 3.1.2 | Application under test — already declared in `requirements.txt` as `Flask>=3.1.0` |
| pip | Werkzeug | 3.1.3 | HTTP toolkit — installed as Flask dependency; provides the test client implementation |
| stdlib | unittest.mock | (built-in) | Standard library mocking — `patch` decorator used for `app.run()` interception |

All versions above have been installed and verified in the `testvenv` virtual environment. No placeholder or "latest" versions are used.

### 0.6.2 Import Updates

Since all test files are newly created, there are no existing import statements to transform. The import patterns to be established in each new test file are:

- **`tests/conftest.py`:**
  - `from app import app as flask_app` — Imports the Flask application instance

- **`tests/test_http_responses.py`, `tests/test_status_codes.py`, `tests/test_headers.py`, `tests/test_routing.py`, `tests/test_edge_cases.py`:**
  - Implicit `client` fixture injection from `conftest.py` — no explicit import needed
  - `import pytest` — For parametrize decorators and markers

- **`tests/test_server_config.py`:**
  - `from app import app, HOST, PORT` — Direct import of constants and app instance
  - `from unittest.mock import patch` — For mocking `app.run()` in startup tests

- **`tests/test_error_handling.py`:**
  - Implicit `client` fixture injection from `conftest.py`
  - `import pytest` — For parametrize decorators


## 0.7 Coverage and Quality Targets


### 0.7.1 Coverage Metrics

- **Current coverage:** 0% — No tests exist in the repository
- **Target coverage:** 100% line coverage and 100% branch coverage for `app.py`
- **Rationale:** The application is 61 lines with a single code path and no conditional logic except the `__main__` guard. Achieving full coverage is both feasible and expected for a codebase of this size.

**Coverage gaps to address:**

| Component | Current | Target | Focus Areas |
|-----------|---------|--------|-------------|
| `app.py` imports (line 19) | 0% | 100% | Exercised by any test that imports the module |
| `HOST`, `PORT` constants (lines 22–23) | 0% | 100% | Validated by `test_server_config.py` |
| `app = Flask(__name__)` (line 26) | 0% | 100% | Exercised by conftest.py fixture import |
| Route decorators (lines 29–30) | 0% | 100% | Tested by `test_routing.py` and `test_http_responses.py` |
| `hello(path)` handler (lines 31–52) | 0% | 100% | Core test target across all test modules |
| `__main__` guard (lines 55–60) | 0% | 100% | Tested via `unittest.mock.patch` in `test_server_config.py` |

**Per-file coverage expectations:**
- `app.py` overall: 100% (all 61 lines exercised including docstrings and comments excluded by default)
- Executable lines: 8 statements (import, HOST, PORT, app creation, two decorators, handler body, `__main__` block) — all must be covered

### 0.7.2 Test Quality Criteria

- **Assertion density:** Each test function must contain at least one meaningful assertion; tests verifying HTTP responses should assert status code, body content, and content type together where applicable
- **Test isolation:** Every test function operates on a fresh test client instance (function-scoped `client` fixture ensures no state leaks between tests)
- **Performance constraints:** The full test suite must complete in under 5 seconds since all tests use Flask's in-process test client with no network I/O or live server
- **Maintainability standards:**
  - Each test file focuses on a single test concern (responses, status codes, headers, routing, errors, edge cases, config)
  - Parametrized tests are used instead of copy-paste repetition for path variations
  - Descriptive test function names follow `test_<subject>_<scenario>_<expected_outcome>` convention
  - Docstrings on test functions explain the intent, not just the mechanics
- **Repository convention adherence:** Since no existing test conventions exist, the standard pytest community conventions are adopted as the baseline — `tests/` directory, `test_*.py` naming, `conftest.py` fixtures, and `pytest.ini` configuration


## 0.8 Scope Boundaries


### 0.8.1 Exhaustively In Scope

**New test files:**
- `tests/__init__.py` — Package initializer
- `tests/conftest.py` — Shared pytest fixtures (app, client)
- `tests/test_http_responses.py` — Response body unit tests
- `tests/test_status_codes.py` — Status code unit tests
- `tests/test_headers.py` — HTTP header unit tests
- `tests/test_server_config.py` — Server configuration and startup tests
- `tests/test_routing.py` — Catch-all route behavior tests
- `tests/test_error_handling.py` — Error scenario and HTTP method tests
- `tests/test_edge_cases.py` — Boundary condition and edge case tests

**Test file updates:**
- None — all tests are new creations

**Test configuration:**
- `pytest.ini` — Test runner configuration with paths, markers, and output formatting

**Test utilities and helpers:**
- `tests/conftest.py` — Central fixture provider (serves as both fixture and utility)
- `unittest.mock` (standard library) — Used for `app.run()` patching in server config tests

**Source file under test:**
- `app.py` — The sole source file containing all server logic (read-only; not modified)

**Documentation updates:**
- None explicitly required — the test files are self-documenting with docstrings

### 0.8.2 Explicitly Out of Scope

- **Source code modifications to `app.py`:** The `README.md` states `"Do not touch!"` — `app.py` must remain unmodified. All testing is non-invasive.
- **Node.js/JavaScript testing:** `server.js` is an empty zero-byte file with no code to test. Jest and Mocha are not applicable since there is no JavaScript logic in the repository.
- **`package.json` modifications:** The file is empty (zero bytes) and no Node.js infrastructure exists to configure.
- **Refactoring beyond testing:** No refactoring of `app.py` for testability; the application is already fully testable via Flask's test client.
- **Feature additions:** No new routes, handlers, or functionality will be added to `app.py`.
- **Unrelated test files:** The existing empty artifacts (`test.py - Copy.txt`, `test.py.txt`, `test.txt.txt`) and `LoginTest.java` are not part of this testing scope and will not be modified or cleaned up.
- **Performance optimization:** No performance profiling or optimization; only functional correctness is tested.
- **Database testing:** `app.py` has no database interactions; the environment variables `DB_HOST` and `DB_HOST1` are unused by the application.
- **Deployment or CI/CD configuration:** No pipeline files, Dockerfiles, or deployment scripts are in scope.
- **End-to-end testing with live server:** All tests use Flask's in-process test client; no live server binding or network-level testing is included.


## 0.9 Execution Parameters


### 0.9.1 Testing-Specific Instructions

**Environment activation (prerequisite for all commands):**
```bash
cd /tmp/blitzy/29-dec-existing-projects-qa-test-3/QABranch08jan/
source testvenv/bin/activate
```

**Test execution command (run full suite):**
```bash
CI=true pytest tests/ -v --tb=short
```

**Coverage measurement command:**
```bash
pytest tests/ --cov=app --cov-report=term-missing --cov-report=html
```

**Single test file execution pattern:**
```bash
pytest tests/test_http_responses.py -v
```

**Single test function execution pattern:**
```bash
pytest tests/test_http_responses.py::test_root_returns_hello_world -v
```

**Debug mode execution:**
```bash
pytest tests/ -v --tb=long -s --log-cli-level=DEBUG
```

**Specific test patterns to follow in the repository:**
- All test functions are prefixed with `test_`
- All test files are prefixed with `test_`
- Fixtures are defined in `conftest.py` and auto-discovered by pytest
- Parametrized tests use `@pytest.mark.parametrize` for data-driven variations
- No test classes are required; standalone test functions are the primary pattern

**Excluded test categories per project constraints:**
- No live server tests (no `live_server` fixture usage)
- No async tests (the Flask application is synchronous)
- No load/stress tests (functional correctness only)

**Environment setup requirements for tests:**
- Python 3.12.3 virtual environment with `pytest`, `pytest-flask`, `pytest-cov`, and `Flask` installed
- Working directory set to the repository root where `app.py` resides
- No environment variables are required for test execution (the application does not read any)


## 0.10 Special Instructions for Testing


### 0.10.1 Testing-Specific Requirements

The following special instructions apply to this testing exercise, derived from repository constraints and the user's original request:

- **DO NOT modify `app.py`:** The `README.md` explicitly states `"Do not touch!"` for the source code. All testing must be performed non-invasively using Flask's test client and external assertions only. No source code changes for testability are permitted.

- **Framework Translation Directive:** The user requested "Jest or Mocha" for `server.js`. Since the actual server implementation is Python Flask (`app.py`), the equivalent Python testing ecosystem is used:
  - Jest → **pytest** (test runner and assertion framework)
  - Mocha → **pytest** (alternative test runner; pytest is the de facto standard)
  - Jest's `describe/it` blocks → **pytest test functions** with descriptive names
  - Jest's `expect()` → **Python `assert` statements** (pytest's native assertion introspection)
  - Jest's `beforeEach/afterEach` → **pytest fixtures** with function scope in `conftest.py`
  - Supertest (HTTP testing) → **Flask's `test_client()`** (built-in; no additional package needed)

- **Maintain test isolation:** Each test function must be completely independent. The function-scoped `client` fixture in `conftest.py` guarantees a fresh test client per test, preventing state leaks. Tests must be executable in any order and in parallel.

- **Follow standard pytest naming conventions:** Test files use `test_*.py`, test functions use `test_*`, and fixture files use `conftest.py`. This ensures automatic discovery without custom configuration.

- **Preserve the exact expected response:** The response body must be tested as `"Hello, World!\n"` (14 bytes, including the trailing newline) — matching the original Node.js `res.end('Hello, World!\n')` behavior documented in `app.py` line 15.

- **Test the server behavior, not the framework:** Tests should verify the application's observable HTTP behavior (response content, status codes, headers, routing) rather than testing Flask's internal mechanisms. The goal is to validate that `app.py` correctly implements the specification.

- **Coverage enforcement:** Run `pytest --cov=app --cov-report=term-missing` after all tests are created to verify 100% coverage of `app.py`. Any uncovered lines must be addressed before the testing exercise is considered complete.

- **No additional dependencies beyond those listed:** Only `pytest`, `pytest-flask`, `pytest-cov`, and the standard library `unittest.mock` are permitted. No additional testing libraries should be introduced.


