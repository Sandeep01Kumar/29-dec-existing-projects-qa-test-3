"""
Unit tests for HTTP status code validation.

Verifies that all supported routes return HTTP 200 OK status code as defined
by the default Flask response behavior at app.py line 52. Includes parametrized
tests for root path, single-segment paths, and multi-segment paths, all
asserting response.status_code == 200. Also tests method-specific status codes
to verify Flask's 405 Method Not Allowed for unsupported methods and Flask's
automatic HEAD support for GET routes.

Uses the 'client' fixture from conftest.py via pytest's automatic fixture
injection for making HTTP requests without a live server.
"""

import pytest


# ---------------------------------------------------------------------------
# Root path status code tests
# ---------------------------------------------------------------------------


def test_root_returns_200(client):
    """Verify GET / returns HTTP 200 status code.

    Sends a GET request to the root path and asserts that the Flask
    application responds with the standard HTTP 200 OK status code,
    confirming the catch-all route handler at app.py line 52 is active.

    Args:
        client: Flask test client fixture injected from conftest.py.
    """
    response = client.get('/')
    assert response.status_code == 200


def test_root_status_string(client):
    """Verify GET / returns the full '200 OK' status string.

    Validates the complete HTTP status line representation returned by
    Flask's Response object, ensuring both the numeric code and reason
    phrase are correctly formed for the root path.

    Args:
        client: Flask test client fixture injected from conftest.py.
    """
    response = client.get('/')
    assert response.status == '200 OK'


# ---------------------------------------------------------------------------
# Parametrized single-segment subpath status code tests
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("path", [
    '/test',
    '/hello',
    '/page',
])
def test_subpath_returns_200(client, path):
    """Verify single-segment subpaths return HTTP 200 status code.

    Uses parametrize to test multiple single-segment URL paths against
    the catch-all route defined at app.py lines 29-30, confirming that
    the /<path:path> route decorator captures each segment and the
    handler returns a 200 status code.

    Args:
        client: Flask test client fixture injected from conftest.py.
        path: URL path with a single segment to request.
    """
    response = client.get(path)
    assert response.status_code == 200


# ---------------------------------------------------------------------------
# Parametrized multi-segment nested path status code tests
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("path", [
    '/a/b/c',
    '/deep/nested/path',
    '/x/y/z/w/v',
])
def test_nested_path_returns_200(client, path):
    """Verify multi-segment nested paths return HTTP 200 status code.

    Uses parametrize to test URL paths containing multiple segments
    separated by forward slashes. Confirms that the /<path:path> route
    converter at app.py line 30 correctly matches deeply nested paths
    and the handler responds with 200.

    Args:
        client: Flask test client fixture injected from conftest.py.
        path: URL path with multiple segments to request.
    """
    response = client.get(path)
    assert response.status_code == 200


# ---------------------------------------------------------------------------
# Comprehensive diverse path status code tests
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("path", [
    '/',
    '/test',
    '/a/b/c',
    '/hello/world',
    '/page/subpage',
    '/x/y/z',
])
def test_various_paths_all_return_200(client, path):
    """Verify a comprehensive set of diverse paths all return HTTP 200.

    Exercises the full range of path patterns supported by the dual route
    decorators at app.py lines 29-30 — from the root path (captured via
    defaults={'path': ''}) through single-segment and multi-segment paths
    (captured via /<path:path>). All paths must produce an identical 200
    status code, confirming the catch-all routing behavior.

    Args:
        client: Flask test client fixture injected from conftest.py.
        path: URL path to request, covering root, single, and multi-segment.
    """
    response = client.get(path)
    assert response.status_code == 200


# ---------------------------------------------------------------------------
# Method-specific status code tests
# ---------------------------------------------------------------------------


def test_post_method_status_code(client):
    """Verify POST / returns 405 Method Not Allowed.

    The route decorators at app.py lines 29-30 define only GET method
    handling (Flask's default). Sending a POST request should trigger
    Flask's built-in 405 Method Not Allowed response since POST is not
    in the allowed methods list for the catch-all route.

    Args:
        client: Flask test client fixture injected from conftest.py.
    """
    response = client.post('/')
    assert response.status_code == 405


def test_head_method_returns_200(client):
    """Verify HEAD / returns 200 with empty body.

    Flask automatically supports the HEAD method for any route that
    accepts GET requests. A HEAD response must include the same status
    code and headers as a GET response but with an empty response body.
    This test confirms both the 200 status code and the empty body
    characteristic of HEAD responses.

    Args:
        client: Flask test client fixture injected from conftest.py.
    """
    response = client.head('/')
    assert response.status_code == 200
    assert response.data == b''
