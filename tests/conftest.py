"""
Shared pytest fixtures for the Flask application test suite.

This module provides the central test fixtures consumed by all test modules
in the tests/ package via pytest's automatic fixture injection mechanism.
Defines the 'app' fixture that returns the Flask application instance from
app.py, and the 'client' fixture that creates a Flask test client for making
HTTP requests without running a live server.

Both fixtures are function-scoped (default) to ensure each test function
receives a fresh test client, preventing state leaks between tests.
"""

import pytest

from app import app as flask_app


@pytest.fixture
def app():
    """Provide the Flask application instance for testing.

    Imports the Flask application from app.py and configures it for testing
    by setting the TESTING flag to True. This fixture is the foundation for
    all test modules — the 'client' fixture depends on it.

    Yields:
        Flask: The configured Flask application instance with TESTING=True.
    """
    flask_app.config['TESTING'] = True
    yield flask_app


@pytest.fixture
def client(app):
    """Provide a Flask test client for making HTTP requests.

    Creates and returns a test client from the Flask application. The test
    client allows sending HTTP requests to the application without binding
    to a network port or running a live server. Each test function receives
    a fresh client instance due to function-level scoping.

    Args:
        app: The Flask application fixture (injected automatically by pytest).

    Returns:
        FlaskClient: A Flask test client for making HTTP requests.
    """
    return app.test_client()
