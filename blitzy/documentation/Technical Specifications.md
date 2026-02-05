# Technical Specification

# 0. Agent Action Plan

## 0.1 Intent Clarification

### 0.1.1 Core Feature Objective

Based on the prompt, the Blitzy platform understands that the new feature requirement involves enhancing the existing **hao-backprop-test** repository, which currently implements a minimal Flask HTTP server for Backprop integration validation.

**Current System Context:**

| Attribute | Value |
|-----------|-------|
| Project Name | hao-backprop-test |
| Current Technology | Python Flask (migrated from Node.js) |
| Primary Function | HTTP server responding with "Hello, World!\n" |
| Binding Address | 127.0.0.1:3000 |
| Purpose | Backprop integration testing |

**Critical Observation:**

The user's input describes the existing codebase functionality but **does not specify what new feature should be added**. The provided context states:

> "The main responsibility of this codebase is to spin up a basic HTTP server that responds with Hello, World! for any incoming request. It's a classic minimal Node.js server used to verify that the environment, dependencies, and Backprop integration work end-to-end."

**Implicit Requirements Identified:**

- Any new feature must maintain backward compatibility with existing Backprop integration testing
- The "Hello, World!" response behavior on the root path must be preserved
- The server must continue binding to 127.0.0.1:3000
- The existing project warning ("Do not touch!") suggests caution when modifying this test artifact

**Feature Addition Readiness Assessment:**

| Readiness Dimension | Status | Notes |
|---------------------|--------|-------|
| Codebase Understanding | ✅ Complete | Full repository analysis performed |
| Technology Stack | ✅ Documented | Flask 3.1.2, Python 3.12 |
| Integration Points | ✅ Identified | Single-file architecture with clear entry point |
| Specific Feature Requirements | ⚠️ MISSING | User must specify desired feature |

### 0.1.2 Special Instructions and Constraints

**Repository-Level Constraints:**

The README.md contains an explicit warning:
> "Python Flask test project for backprop integration. Do not touch!"

This constraint indicates that the repository serves as a **protected test artifact** and any feature additions must:
- Preserve existing test verification capabilities
- Maintain the current behavioral parity with the original Node.js implementation
- Not introduce complexity that could interfere with Backprop integration testing

**Architectural Constraints:**

| Constraint | Requirement |
|------------|-------------|
| Backward Compatibility | Existing `/` endpoint must return "Hello, World!\n" |
| Port Preservation | Server must continue binding to port 3000 |
| Content-Type Consistency | text/plain responses must remain available |
| Single-File Preference | Current architecture uses single `app.py` |

**Environment Variables Available:**

| Variable | Status | Current Usage |
|----------|--------|---------------|
| `DB_HOST` | Set in environment | Not used by existing application |
| `DB_HOST1` | Set in environment | Not used by existing application |

These environment variables are available for potential database-related feature additions if required.

### 0.1.3 Technical Interpretation

Since no specific feature has been requested, this section documents the **technical foundation** available for feature addition:

**Available Extension Points:**

- **Route Addition**: Flask's decorator-based routing allows adding new endpoints alongside the existing catch-all route
- **Service Layer**: New service modules can be created in the project root or a new `services/` directory
- **Configuration**: Environment variables `DB_HOST` and `DB_HOST1` are available for database integration
- **Middleware**: Flask supports middleware for cross-cutting concerns

**Technical Transformation Pattern:**

To implement a new feature in this codebase, the following approach would be used:

| Action | Implementation Strategy |
|--------|------------------------|
| Add new endpoint | Create new route decorator in `app.py` or split into blueprints |
| Add database support | Use `DB_HOST`/`DB_HOST1` environment variables with SQLAlchemy or similar |
| Add new service | Create new Python module and import into `app.py` |
| Extend response types | Add JSON/XML response handlers alongside text/plain |

**Framework for Feature Addition:**

```
For [any new feature], we will:
1. CREATE: New route handler(s) in app.py
2. CREATE: Supporting service modules (if business logic required)
3. MODIFY: requirements.txt (if new dependencies needed)
4. CREATE: Test files for new functionality
5. UPDATE: README.md with new feature documentation
6. PRESERVE: Existing "Hello, World!" endpoint behavior
```

**Awaiting Clarification:**

To proceed with a concrete implementation plan, the following information is needed:
- Specific feature functionality requirements
- Expected API endpoints and responses
- Data storage requirements (if any)
- Integration requirements with external services
- UI/frontend requirements (if applicable)

## 0.2 Repository Scope Discovery

### 0.2.1 Comprehensive File Analysis

A systematic repository analysis was conducted to identify all files that may require modification or serve as integration points for new features.

**Search Patterns Applied:**

| Pattern | Files Found | Purpose |
|---------|-------------|---------|
| `*.py` | `app.py` | Primary application code |
| `*.txt` | `requirements.txt`, `test.py.txt`, `test.py - Copy.txt`, `test.txt.txt` | Dependencies and placeholders |
| `*.md` | `README.md`, `blitzy/documentation/*.md` | Documentation |
| `*.json` | `package.json`, `package-lock.json` | Legacy Node.js (empty/non-functional) |
| `*.js` | `server.js`, `server - Copy.js` | Legacy Node.js (empty placeholders) |
| `*.java` | `LoginTest.java`, `LoginTest - Copy.java` | Non-functional stubs |
| `*.csv` | `industry.csv`, `industry - Copy.csv` | Static data files |

**Complete Repository Structure:**

```
/
├── app.py                          [ACTIVE - Flask application entry point]
├── requirements.txt                [ACTIVE - Python dependencies: Flask>=3.1.0]
├── README.md                       [ACTIVE - Project documentation]
├── package.json                    [EMPTY - Legacy Node.js placeholder]
├── package-lock.json               [EMPTY - Legacy npm lockfile]
├── server.js                       [EMPTY - Legacy Node.js placeholder]
├── server - Copy.js                [EMPTY - Duplicate placeholder]
├── LoginTest.java                  [NON-FUNCTIONAL - Java stub with syntax errors]
├── LoginTest - Copy.java           [NON-FUNCTIONAL - Duplicate Java stub]
├── industry.csv                    [STATIC DATA - Industry category vocabulary]
├── industry - Copy.csv             [STATIC DATA - Duplicate of above]
├── test.py.txt                     [EMPTY - Zero-byte placeholder]
├── test.py - Copy.txt              [EMPTY - Zero-byte placeholder]
├── test.txt.txt                    [EMPTY - Zero-byte placeholder]
└── blitzy/
    └── documentation/
        ├── Project Guide.md        [DOCUMENTATION - Migration runbook]
        └── Technical Specifications.md [DOCUMENTATION - Technical spec]
```

### 0.2.2 Files Available for Modification

**Primary Application Files:**

| File | Lines | Purpose | Modification Potential |
|------|-------|---------|----------------------|
| `app.py` | 61 | Flask HTTP server with catch-all routing | HIGH - Main integration point for new features |
| `requirements.txt` | 1 | Python dependency manifest | HIGH - Will need updates for new dependencies |
| `README.md` | 31 | Project setup and run instructions | MEDIUM - Update with new feature documentation |

**app.py Current Implementation Summary:**

| Component | Implementation |
|-----------|----------------|
| Imports | `from flask import Flask, Response` |
| Constants | `HOST = '127.0.0.1'`, `PORT = 3000` |
| App Instance | `app = Flask(__name__)` |
| Route Handlers | Catch-all route at `/` and `/<path:path>` |
| Response | `Response('Hello, World!\n', mimetype='text/plain')` |
| Entry Point | `app.run(host=HOST, port=PORT)` |

### 0.2.3 Integration Point Discovery

**Current Integration Points in app.py:**

| Location | Line(s) | Integration Type | Purpose |
|----------|---------|------------------|---------|
| Import section | 19 | Module imports | Add new Flask extensions or custom modules |
| After constants | 22-23 | Configuration | Add feature-specific settings |
| Route decorators | 29-30 | Route registration | Add new endpoint handlers |
| After `hello()` function | 52+ | New handlers | Define additional route handlers |
| Before `app.run()` | 55-60 | Initialization | Add startup logic or middleware |

**Potential New Route Patterns:**

| Route Pattern | Purpose |
|---------------|---------|
| `/api/*` | RESTful API endpoints |
| `/health` | Health check endpoint |
| `/metrics` | Observability endpoint |
| `/admin/*` | Administrative functions |

### 0.2.4 New File Requirements Template

When a specific feature is defined, the following new files may need to be created:

**New Source Files Template:**

| File Path | Purpose |
|-----------|---------|
| `src/[feature_name]/core.py` | Main feature logic implementation |
| `src/[feature_name]/models.py` | Data models for feature |
| `src/[feature_name]/routes.py` | Feature-specific route handlers |
| `config/[feature]_settings.py` | Feature configuration |

**New Test Files Template:**

| File Path | Purpose |
|-----------|---------|
| `tests/unit/test_[feature].py` | Unit test coverage |
| `tests/integration/test_[feature]_integration.py` | Integration test scenarios |

**Alternative: Single-File Enhancement:**

Given the current minimal architecture, new features could also be added directly to `app.py`:

```python
# Add after line 52 in app.py

@app.route('/new_feature')
def new_feature_handler():
    return Response('...', mimetype='...')
```

### 0.2.5 Data Files Analysis

**Available Data Resources:**

| File | Content | Potential Use |
|------|---------|---------------|
| `industry.csv` | 44 industry category labels | Reference data for industry classification features |

The `industry.csv` file contains a curated taxonomy:

| Column | Type | Sample Values |
|--------|------|---------------|
| Industry | String | Accounting/Finance, Agriculture, Banking, etc. |

This data file could support features requiring industry categorization or classification.

### 0.2.6 Documentation Files

**Documentation Location:** `blitzy/documentation/`

| File | Purpose | Status |
|------|---------|--------|
| `Project Guide.md` | Migration runbook and validation evidence | REFERENCE |
| `Technical Specifications.md` | Detailed technical specification | REFERENCE |

These files provide extensive context on the Node.js to Flask migration and behavioral parity requirements that must be maintained when adding new features.

## 0.3 Dependency Inventory

### 0.3.1 Current Dependency Manifest

**requirements.txt Content:**

```
Flask>=3.1.0
```

**Installed Package Versions (verified via pip freeze):**

| Registry | Package | Version | Purpose |
|----------|---------|---------|---------|
| PyPI | Flask | 3.1.2 | Core web framework for HTTP server |
| PyPI | Werkzeug | 3.1.5 | WSGI utilities and HTTP handling (Flask dependency) |
| PyPI | Jinja2 | 3.1.6 | Template engine (Flask dependency, not actively used) |
| PyPI | itsdangerous | 2.2.0 | Cryptographic signing (Flask dependency) |
| PyPI | click | 8.3.1 | CLI utilities (Flask dependency) |
| PyPI | blinker | 1.9.0 | Signal support (Flask dependency) |
| PyPI | MarkupSafe | 3.0.3 | Safe string handling (Jinja2 dependency) |

### 0.3.2 Runtime Environment Requirements

**Python Runtime:**

| Requirement | Installed | Required | Status |
|-------------|-----------|----------|--------|
| Python Version | 3.12.3 | ≥3.9 | ✅ Compatible |
| pip Version | 25.3 | Any recent | ✅ Compatible |
| Virtual Environment | venv | Recommended | ✅ Available |

**Environment Setup Commands:**

```bash
# Create virtual environment

python3 -m venv venv

#### Activate (Linux/macOS)

source venv/bin/activate

#### Install dependencies

pip install -r requirements.txt
```

### 0.3.3 Dependency Update Considerations

When adding a new feature, the following dependency patterns may be required:

**Common Feature Dependencies:**

| Feature Type | Potential Dependencies | Version |
|--------------|----------------------|---------|
| Database Integration | SQLAlchemy, Flask-SQLAlchemy | ≥2.0.0 |
| REST API Enhancement | Flask-RESTful, marshmallow | ≥0.3.10 |
| Authentication | Flask-Login, Flask-JWT-Extended | ≥0.6.0 |
| Form Handling | Flask-WTF, WTForms | ≥1.2.0 |
| Testing | pytest, pytest-flask | ≥8.0.0 |
| CORS Support | Flask-CORS | ≥4.0.0 |

**requirements.txt Update Template:**

```
Flask>=3.1.0
# Add new dependencies below based on feature requirements

#### [dependency_name]>=[version]
```

### 0.3.4 Import Update Patterns

**Current Imports in app.py:**

```python
from flask import Flask, Response
```

**Common Import Expansions:**

| Feature Addition | Import Modification |
|------------------|---------------------|
| JSON Responses | `from flask import Flask, Response, jsonify` |
| Request Handling | `from flask import Flask, Response, request` |
| Blueprints | `from flask import Flask, Response, Blueprint` |
| Templates | `from flask import Flask, Response, render_template` |

### 0.3.5 External Reference Updates

**Files Requiring Updates When Dependencies Change:**

| File Pattern | Update Required |
|--------------|-----------------|
| `requirements.txt` | Add new package specifications |
| `app.py` | Add new import statements |
| `README.md` | Update setup instructions if needed |

**No Updates Required For:**

| File | Reason |
|------|--------|
| `package.json` | Empty placeholder (not used) |
| `package-lock.json` | Empty placeholder (not used) |
| `*.java` files | Out of scope |

### 0.3.6 Environment Variables

**Available Environment Variables:**

| Variable | Value Status | Potential Usage |
|----------|--------------|-----------------|
| `DB_HOST` | Set in environment | Database connection host for data persistence features |
| `DB_HOST1` | Set in environment | Secondary/replica database host |

**Environment Variable Access Pattern:**

```python
import os
db_host = os.environ.get('DB_HOST', 'localhost')
```

**Note:** These variables are currently unused by the application but available for feature additions requiring database connectivity.

## 0.4 Integration Analysis

### 0.4.1 Existing Code Touchpoints

**Primary Integration Point: app.py**

The single-file architecture provides clear touchpoints for feature integration:

| Location | Line Range | Touchpoint Type | Integration Action |
|----------|------------|-----------------|-------------------|
| Import Block | Lines 19 | Module imports | Add new Flask extensions or custom modules |
| Constants Block | Lines 21-23 | Configuration | Add feature-specific constants |
| Route Decorators | Lines 29-30 | Route registration | Add new route patterns |
| View Function | Lines 31-52 | Request handlers | Create new handler functions |
| Main Guard | Lines 55-60 | Startup logic | Add initialization code |

**Direct Modification Points:**

| Modification Area | Purpose | Current Content |
|-------------------|---------|-----------------|
| `app.py` Line 19 | Import additions | `from flask import Flask, Response` |
| `app.py` Line 26 | After app creation | `app = Flask(__name__)` |
| `app.py` Line 52 | After hello() function | Route handler ends |
| `app.py` Line 55 | Before app.run() | Main guard section |

### 0.4.2 Route Handler Architecture

**Current Catch-All Route Pattern:**

```python
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def hello(path):
    return Response('Hello, World!\n', mimetype='text/plain')
```

**Integration Considerations:**

| Aspect | Current Behavior | New Feature Impact |
|--------|------------------|-------------------|
| Route Priority | Catch-all captures everything | New specific routes must be defined BEFORE catch-all |
| Path Handling | All paths return same response | New routes need specific path patterns |
| HTTP Methods | Implicit GET only | New routes may need POST, PUT, DELETE |

**Recommended Route Integration Order:**

```python
# 1. Specific routes first

@app.route('/api/feature')
def feature_endpoint():
    # New feature logic
    pass

#### Catch-all route last (existing)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def hello(path):
    return Response('Hello, World!\n', mimetype='text/plain')
```

### 0.4.3 Service Layer Integration

**Current State:** No dedicated service layer exists.

**Recommended Pattern for Feature Addition:**

| Layer | Purpose | Implementation |
|-------|---------|----------------|
| Routes | HTTP endpoint handling | `app.py` or Flask Blueprint |
| Services | Business logic | New `services/` directory |
| Models | Data structures | New `models/` directory |
| Config | Settings management | New `config.py` or environment variables |

**Service Integration Example:**

```python
# services/feature_service.py

class FeatureService:
    def process(self, data):
        # Business logic here
        pass
```

### 0.4.4 Configuration Integration

**Current Configuration:**

| Config Item | Location | Value |
|-------------|----------|-------|
| HOST | `app.py` constant | `'127.0.0.1'` |
| PORT | `app.py` constant | `3000` |
| Flask config | Default | Flask development defaults |

**Environment Variables Available:**

| Variable | Integration Pattern |
|----------|-------------------|
| `DB_HOST` | `os.environ.get('DB_HOST')` |
| `DB_HOST1` | `os.environ.get('DB_HOST1')` |

**Configuration Extension Pattern:**

```python
# Add to app.py or new config.py

app.config.update(
    FEATURE_ENABLED=True,
    FEATURE_SETTING='value'
)
```

### 0.4.5 External System Integration Points

**Potential Integration Categories:**

| Integration Type | Available Hook | Notes |
|------------------|----------------|-------|
| Database | `DB_HOST`, `DB_HOST1` env vars | Environment variables pre-configured |
| External APIs | HTTP client in route handlers | Requires additional dependencies |
| Message Queues | N/A | Would require new infrastructure |
| Authentication | N/A | Would require new dependency (Flask-Login, etc.) |

**Database Integration Template:**

```python
import os
from flask_sqlalchemy import SQLAlchemy

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"postgresql://{os.environ.get('DB_HOST')}/dbname"
)
db = SQLAlchemy(app)
```

### 0.4.6 Testing Integration

**Current Testing Infrastructure:** None implemented.

**Recommended Testing Integration:**

| Test Type | Location | Framework |
|-----------|----------|-----------|
| Unit Tests | `tests/unit/` | pytest |
| Integration Tests | `tests/integration/` | pytest-flask |
| API Tests | `tests/api/` | pytest + requests |

**Test File Pattern:**

```python
# tests/test_app.py

import pytest
from app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_hello_world(client):
    response = client.get('/')
    assert response.status_code == 200
    assert response.data == b'Hello, World!\n'
```

### 0.4.7 Backprop Integration Preservation

**Critical Requirement:**

The existing Backprop integration test functionality must be preserved. Any new feature additions must:

| Requirement | Action |
|-------------|--------|
| Maintain `/` endpoint | Keep catch-all route functional |
| Preserve response format | "Hello, World!\n" with text/plain |
| Keep port binding | Continue using port 3000 |
| Ensure backward compatibility | New features additive, not replacing |

## 0.5 Technical Implementation

### 0.5.1 Implementation Framework

Since no specific feature has been requested, this section provides the **implementation framework** for adding features to the hao-backprop-test repository.

**Implementation Approach:**

| Phase | Action | Deliverables |
|-------|--------|--------------|
| Foundation | Establish feature structure | New modules, routes, configs |
| Integration | Connect with existing systems | Modified app.py, updated imports |
| Quality | Implement comprehensive tests | Test files, coverage reports |
| Documentation | Document usage and configuration | Updated README.md, API docs |

### 0.5.2 File-by-File Execution Template

**Group 1 - Core Feature Files (CREATE):**

| File | Purpose | Implementation Notes |
|------|---------|---------------------|
| `app.py` | MODIFY - Add new route handlers | Insert before catch-all route |
| `services/[feature]_service.py` | CREATE - Business logic | New service module |
| `models/[feature]_model.py` | CREATE - Data structures | If data persistence needed |

**Group 2 - Supporting Infrastructure (MODIFY/CREATE):**

| File | Purpose | Implementation Notes |
|------|---------|---------------------|
| `requirements.txt` | MODIFY - Add dependencies | Append new package requirements |
| `config.py` | CREATE - Centralized config | Optional, for complex features |
| `.env.example` | CREATE - Environment template | Document required variables |

**Group 3 - Tests and Documentation (CREATE/MODIFY):**

| File | Purpose | Implementation Notes |
|------|---------|---------------------|
| `tests/test_[feature].py` | CREATE - Test coverage | pytest-based tests |
| `README.md` | MODIFY - Documentation | Add feature usage section |
| `docs/[feature].md` | CREATE - Detailed docs | Optional, for complex features |

### 0.5.3 Implementation Patterns

**Pattern 1: Simple Endpoint Addition**

For adding a single new endpoint without complex business logic:

```python
# Add to app.py before catch-all route

@app.route('/new-endpoint')
def new_endpoint():
    return Response('New response', mimetype='text/plain')
```

**Pattern 2: Feature Module Addition**

For adding a feature with business logic:

```
project/
├── app.py              # Import and register blueprint
├── features/
│   └── [feature]/
│       ├── __init__.py
│       ├── routes.py   # Feature routes as Blueprint
│       └── service.py  # Business logic
```

**Pattern 3: Database-Connected Feature**

For features requiring data persistence:

```python
# In app.py

import os
from flask_sqlalchemy import SQLAlchemy

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"postgresql://{os.environ.get('DB_HOST')}/db"
)
db = SQLAlchemy(app)
```

### 0.5.4 Critical Implementation Rules

**Must Preserve:**

| Element | Current Value | Reason |
|---------|---------------|--------|
| Root endpoint response | "Hello, World!\n" | Backprop integration test |
| HTTP status 200 | Default Flask | Backprop verification |
| Content-Type | text/plain | Backprop verification |
| Port binding | 3000 | Backprop test configuration |
| Host binding | 127.0.0.1 | Backprop test configuration |

**Must Avoid:**

| Anti-Pattern | Risk |
|--------------|------|
| Replacing catch-all route | Breaks Backprop integration |
| Changing default port | Breaks existing test scripts |
| Removing "Hello, World!" response | Breaks verification tests |
| Adding authentication to root path | Breaks unauthenticated tests |

### 0.5.5 Route Priority Management

Flask processes routes in registration order. For new features:

**Correct Order:**

```python
# 1. Health check (specific path)

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy'})

#### API routes (specific paths)

@app.route('/api/v1/resource')
def api_resource():
    return jsonify({'data': []})

#### Existing catch-all (LAST)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def hello(path):
    return Response('Hello, World!\n', mimetype='text/plain')
```

### 0.5.6 Dependency Installation Workflow

When adding new feature dependencies:

```bash
# 1. Activate virtual environment

source venv/bin/activate

#### Install new dependency

pip install [new-package]>=version

#### Update requirements.txt

pip freeze | grep -i [package-name] >> requirements.txt
#### OR manually add with version constraint

#### Verify installation

python -c "import [package_name]; print([package_name].__version__)"
```

### 0.5.7 User Interface Design

**Figma URLs Provided:** None

**Current UI State:** This is a backend HTTP server with no frontend UI.

**If UI is Required:**

| Approach | Implementation |
|----------|----------------|
| Server-rendered | Jinja2 templates (already included with Flask) |
| Static files | Flask static file serving |
| SPA integration | CORS headers, API endpoints |

### 0.5.8 Verification and Testing

**Manual Verification Commands:**

```bash
# Start server

python app.py

#### Test existing endpoint (preserve this)

curl http://127.0.0.1:3000/
#### Expected: Hello, World!

#### Test new endpoint (when added)

curl http://127.0.0.1:3000/new-feature
```

**Automated Testing Setup:**

```bash
# Install test dependencies

pip install pytest pytest-flask

#### Run tests

pytest tests/ -v
```

## 0.6 Scope Boundaries

### 0.6.1 Exhaustively In Scope

**Core Application Files:**

| File/Pattern | Status | Purpose |
|--------------|--------|---------|
| `app.py` | MODIFY | Primary integration point for new features |
| `requirements.txt` | MODIFY | Add new dependencies |
| `README.md` | MODIFY | Update documentation with feature usage |

**New Files to Create (when feature specified):**

| File Pattern | Purpose |
|--------------|---------|
| `services/**/*.py` | Business logic modules |
| `models/**/*.py` | Data model definitions |
| `tests/**/*.py` | Test coverage |
| `config/*.py` | Feature configuration |
| `docs/features/*.md` | Feature documentation |

**Configuration Files:**

| File | Status | Purpose |
|------|--------|---------|
| `.env.example` | CREATE (if needed) | Document environment variables |
| `config.py` | CREATE (if needed) | Centralized configuration |
| `pytest.ini` | CREATE (if needed) | Test configuration |

**Environment Variables in Scope:**

| Variable | Usage Status | Available For |
|----------|--------------|---------------|
| `DB_HOST` | Unused currently | Database integration features |
| `DB_HOST1` | Unused currently | Database replica/secondary |

### 0.6.2 Explicitly Out of Scope

**Files That Must NOT Be Modified:**

| File | Reason |
|------|--------|
| `server.js` | Legacy placeholder, empty |
| `server - Copy.js` | Legacy placeholder, empty |
| `package.json` | Legacy placeholder, empty |
| `package-lock.json` | Legacy placeholder, empty |
| `LoginTest.java` | Non-functional Java stub |
| `LoginTest - Copy.java` | Non-functional Java stub |
| `test.py.txt` | Empty placeholder |
| `test.py - Copy.txt` | Empty placeholder |
| `test.txt.txt` | Empty placeholder |
| `industry.csv` | Static data file |
| `industry - Copy.csv` | Duplicate data file |

**Documentation Files (Reference Only):**

| File | Status |
|------|--------|
| `blitzy/documentation/Project Guide.md` | DO NOT MODIFY |
| `blitzy/documentation/Technical Specifications.md` | DO NOT MODIFY |

**Functionality Out of Scope:**

| Exclusion | Rationale |
|-----------|-----------|
| Modifying "Hello, World!" response | Protected for Backprop testing |
| Changing port from 3000 | Breaking change to test infrastructure |
| Changing host from 127.0.0.1 | Breaking change to test infrastructure |
| Removing catch-all route | Breaks existing behavior |
| Production WSGI configuration | Beyond current project scope |
| Docker/containerization | Not in current architecture |
| CI/CD pipeline setup | Not specified in requirements |

### 0.6.3 Scope Preservation Rules

**Must Preserve (Non-Negotiable):**

| Element | Value | Enforcement |
|---------|-------|-------------|
| Root response body | "Hello, World!\n" | Exact string including newline |
| Root HTTP status | 200 | Backprop test verification |
| Root Content-Type | text/plain | Backprop test verification |
| Port binding | 3000 | Test infrastructure dependency |
| Host binding | 127.0.0.1 | Test infrastructure dependency |
| Catch-all routing | All paths work | Test scenario coverage |

**May Extend:**

| Element | Extension Type | Constraint |
|---------|---------------|------------|
| New routes | Add specific paths | Must be before catch-all |
| New dependencies | Add to requirements.txt | Must not conflict with Flask 3.1+ |
| New modules | Create new .py files | Follow Python best practices |
| New tests | Create test files | Use pytest framework |
| Documentation | Update README.md | Keep existing sections intact |

### 0.6.4 Scope Validation Checklist

Before implementing any feature, verify:

| Check | Question | Required Answer |
|-------|----------|-----------------|
| Backward Compatibility | Does `/` still return "Hello, World!\n"? | YES |
| Port Preservation | Does server still bind to 3000? | YES |
| Host Preservation | Does server still bind to 127.0.0.1? | YES |
| No Breaking Changes | Do all existing tests pass? | YES |
| Dependency Compatibility | Are new deps Flask 3.1+ compatible? | YES |
| Documentation Updated | Is README.md updated? | YES |

### 0.6.5 File Scope Summary

**Total Files Currently in Repository:** 15

| Category | Count | Status |
|----------|-------|--------|
| Active application files | 3 | IN SCOPE |
| Legacy placeholders | 4 | OUT OF SCOPE |
| Non-functional stubs | 2 | OUT OF SCOPE |
| Static data files | 2 | OUT OF SCOPE |
| Empty placeholders | 3 | OUT OF SCOPE |
| Documentation | 2 | REFERENCE ONLY |

**New Files (Template for Feature Addition):**

| Category | Estimated Count | Status |
|----------|-----------------|--------|
| Feature source files | 1-5 | TO CREATE |
| Test files | 1-3 | TO CREATE |
| Configuration files | 0-2 | TO CREATE |
| Documentation files | 1-2 | TO CREATE |

## 0.7 Rules for Feature Addition

### 0.7.1 User-Specified Rules

**Repository Warning (from README.md):**

> "Python Flask test project for backprop integration. Do not touch!"

**Interpretation:**

This warning indicates the repository is a protected test artifact. New features must:
- Preserve existing test validation capabilities
- Be additive rather than replacement-based
- Not interfere with Backprop integration testing

### 0.7.2 Behavioral Preservation Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BPR-001 | Root endpoint must return "Hello, World!\n" | Exact string match |
| BPR-002 | HTTP status code must be 200 for root | Default or explicit |
| BPR-003 | Content-Type must be text/plain for root | Explicit mimetype |
| BPR-004 | Server must bind to 127.0.0.1:3000 | No port/host changes |
| BPR-005 | Catch-all routing must remain functional | Route priority maintained |
| BPR-006 | Flask startup logging preserved | Default Flask behavior |

### 0.7.3 Technical Implementation Rules

| Rule ID | Rule | Application |
|---------|------|-------------|
| TIR-001 | Use Flask 3.x patterns | Modern Flask conventions |
| TIR-002 | Python 3.9+ compatibility required | Flask 3.x requirement |
| TIR-003 | New routes before catch-all | Flask route priority |
| TIR-004 | Explicit dependency versioning | requirements.txt updates |
| TIR-005 | No conflicting Flask extensions | Verify compatibility |
| TIR-006 | Follow PEP 8 style | Python code standards |

### 0.7.4 Code Quality Rules

| Rule ID | Rule | Implementation |
|---------|------|----------------|
| CQR-001 | Follow PEP 8 style guidelines | Python formatting |
| CQR-002 | Use type hints where applicable | Python 3.9+ typing |
| CQR-003 | Document functions with docstrings | Google/NumPy style |
| CQR-004 | Keep imports organized | Standard → Third-party → Local |
| CQR-005 | No unused imports | Clean implementation |
| CQR-006 | Explicit error handling | Try/except where needed |

### 0.7.5 Integration Rules

| Rule ID | Rule | Rationale |
|---------|------|-----------|
| INT-001 | Use environment variables for config | `DB_HOST`, `DB_HOST1` available |
| INT-002 | Graceful degradation for optional features | Don't break core functionality |
| INT-003 | Document all integration points | README.md updates |
| INT-004 | Test integration with existing endpoints | Preserve Backprop testing |

### 0.7.6 Security Considerations

| Rule ID | Rule | Application |
|---------|------|-------------|
| SEC-001 | No hardcoded secrets | Use environment variables |
| SEC-002 | Input validation on new endpoints | Prevent injection attacks |
| SEC-003 | Secure database connections | If DB features added |
| SEC-004 | CORS configuration if API expanded | Flask-CORS if needed |

### 0.7.7 Testing Requirements

| Requirement | Implementation |
|-------------|----------------|
| Minimum test coverage | 80% for new code |
| Test framework | pytest |
| Integration tests | pytest-flask |
| Existing behavior verification | Test root endpoint still works |

**Test Verification Template:**

```python
def test_root_endpoint_preserved(client):
    """Verify existing behavior is preserved."""
    response = client.get('/')
    assert response.status_code == 200
    assert response.data == b'Hello, World!\n'
    assert response.content_type == 'text/plain; charset=utf-8'
```

### 0.7.8 Documentation Requirements

| Requirement | Location |
|-------------|----------|
| Feature usage documentation | README.md |
| API endpoint documentation | README.md or docs/ |
| Configuration documentation | README.md |
| Environment variable documentation | .env.example |

### 0.7.9 Verification Checklist

**Pre-Implementation:**

| Check | Status |
|-------|--------|
| Feature requirements clearly defined | □ |
| Dependencies identified | □ |
| Integration points mapped | □ |
| Scope boundaries confirmed | □ |

**Post-Implementation:**

| Check | Status |
|-------|--------|
| Root endpoint returns "Hello, World!\n" | □ |
| HTTP 200 status on root | □ |
| Content-Type text/plain on root | □ |
| Server binds to 127.0.0.1:3000 | □ |
| All tests passing | □ |
| Documentation updated | □ |

### 0.7.10 Exception Handling

**Acceptable Exceptions:**

| Exception | Condition |
|-----------|-----------|
| Additional routes | May add before catch-all |
| New dependencies | Must be Flask 3.x compatible |
| New response types | On new endpoints only |
| Different status codes | On new endpoints only |

**Unacceptable Exceptions:**

| Exception | Reason |
|-----------|--------|
| Modifying root response | Breaks Backprop tests |
| Changing port | Breaks test infrastructure |
| Removing catch-all | Breaks universal path handling |
| Incompatible dependencies | May break Flask server |

## 0.8 References

### 0.8.1 Repository Files Examined

**Core Application Files:**

| File Path | Lines | Purpose | Analysis Status |
|-----------|-------|---------|-----------------|
| `app.py` | 61 | Flask HTTP server entry point | ✅ Fully analyzed |
| `requirements.txt` | 1 | Python dependency manifest | ✅ Fully analyzed |
| `README.md` | 31 | Project documentation | ✅ Fully analyzed |

**Legacy and Placeholder Files:**

| File Path | Status | Analysis Notes |
|-----------|--------|----------------|
| `package.json` | Empty (0 bytes) | Legacy Node.js placeholder |
| `package-lock.json` | Empty (0 bytes) | Legacy npm lockfile |
| `server.js` | Empty (0 bytes) | Legacy Node.js placeholder |
| `server - Copy.js` | Empty (0 bytes) | Duplicate placeholder |
| `LoginTest.java` | Non-functional | Java stub with syntax errors |
| `LoginTest - Copy.java` | Non-functional | Duplicate Java stub |
| `test.py.txt` | Empty (0 bytes) | Placeholder file |
| `test.py - Copy.txt` | Empty (0 bytes) | Placeholder file |
| `test.txt.txt` | Empty (0 bytes) | Placeholder file |

**Data Files:**

| File Path | Content | Relevance |
|-----------|---------|-----------|
| `industry.csv` | 44 industry categories | Available for feature use |
| `industry - Copy.csv` | Duplicate of above | Out of scope |

**Documentation Files:**

| File Path | Purpose | Analysis Status |
|-----------|---------|-----------------|
| `blitzy/documentation/Project Guide.md` | Migration runbook | ✅ Referenced |
| `blitzy/documentation/Technical Specifications.md` | Technical specification | ✅ Referenced |

### 0.8.2 Folder Structure Examined

| Folder Path | Contents | Status |
|-------------|----------|--------|
| `/` (root) | 12 files, 1 folder | ✅ Fully analyzed |
| `/blitzy/` | 1 subfolder (documentation) | ✅ Fully analyzed |
| `/blitzy/documentation/` | 2 markdown files | ✅ Fully analyzed |

### 0.8.3 Technical Specification Sections Referenced

| Section | Key Information Retrieved |
|---------|--------------------------|
| 1.1 Executive Summary | Project purpose, stakeholders, migration context |
| 1.3 Scope | In-scope/out-of-scope boundaries, exclusions |
| 2.2 Feature Catalog | F-001 Hello World HTTP Server feature details |

### 0.8.4 External Resources Consulted

**Package Version Verification:**

| Resource | Information Retrieved |
|----------|----------------------|
| PyPI (Flask) | Flask 3.1.2 is latest stable version |
| Flask documentation | Requires Python ≥3.9 |
| pip freeze output | Verified installed dependency versions |

**Installed Package Versions Verified:**

| Package | Version |
|---------|---------|
| Flask | 3.1.2 |
| Werkzeug | 3.1.5 |
| Jinja2 | 3.1.6 |
| itsdangerous | 2.2.0 |
| click | 8.3.1 |
| blinker | 1.9.0 |
| MarkupSafe | 3.0.3 |

### 0.8.5 Attachments and User-Provided Files

**File Attachments:**

| Status | Details |
|--------|---------|
| Attachments Provided | None |
| Attachment Location | `/tmp/environments_files` - Empty |

**Figma URLs:**

| Status | Details |
|--------|---------|
| Figma URLs Provided | None |
| UI Design Requirements | Not applicable |

### 0.8.6 Environment Configuration

**Environment Variables:**

| Variable | Status | Usage |
|----------|--------|-------|
| `DB_HOST` | Available in environment | Not used by current application |
| `DB_HOST1` | Available in environment | Not used by current application |

**Secrets:**

| Status | Details |
|--------|---------|
| Secrets Provided | None |

**Runtime Environment:**

| Component | Version | Status |
|-----------|---------|--------|
| Python | 3.12.3 | ✅ Installed and verified |
| pip | 25.3 | ✅ Available |
| Virtual Environment | venv | ✅ Created at /tmp/env_test |

### 0.8.7 Search and Analysis Summary

**Repository Searches Conducted:**

| Search Type | Target | Result |
|-------------|--------|--------|
| .blitzyignore lookup | Entire filesystem | No files found |
| Root folder analysis | Repository root | 12 files, 1 folder identified |
| Python files | `*.py` | 1 file (app.py) |
| Dependency files | `requirements.txt` | 1 file found |
| Configuration files | `*.yaml`, `*.yml`, `*.toml` | None found |
| Documentation | `*.md` | 3 files found |

**Tool Invocations:**

| Tool | Invocations | Purpose |
|------|-------------|---------|
| `bash` | 6 | Environment setup, file system exploration |
| `get_source_folder_contents` | 3 | Folder structure analysis |
| `read_file` | 5 | File content retrieval |
| `get_tech_spec_section` | 3 | Technical specification context |

### 0.8.8 Analysis Gaps Identified

**Critical Gap:**

| Gap | Impact | Resolution Required |
|-----|--------|---------------------|
| No specific feature requested | Cannot create concrete implementation plan | User must specify desired feature |

The user's input describes the existing codebase but does not specify what new feature should be added. This Agent Action Plan provides the comprehensive framework for feature addition, but specific implementation details await feature requirements clarification.

### 0.8.9 Document Cross-References

| Section | Dependencies |
|---------|--------------|
| 0.1 Intent Clarification | User input, README.md |
| 0.2 Repository Scope Discovery | All repository files |
| 0.3 Dependency Inventory | requirements.txt, pip freeze |
| 0.4 Integration Analysis | app.py structure |
| 0.5 Technical Implementation | All previous sections |
| 0.6 Scope Boundaries | 0.2 Repository Scope Discovery |
| 0.7 Rules for Feature Addition | README.md, behavioral requirements |
| 0.8 References | All analysis performed |

