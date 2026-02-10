"""
Unit tests for catch-all routing behavior validation.

Tests that both the root path '/' and arbitrary nested paths (e.g.,
'/any/path/here') return identical responses, as implemented by the dual
route decorators at app.py lines 29-30:

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')

The /<path:path> converter does not match the root '/' path, so the first
decorator with defaults={'path': ''} is required to handle root requests.
Tests must verify both route patterns independently to ensure the catch-all
routing covers every possible URL pattern.

Validates response uniformity across all path patterns using parametrized
tests. Uses the 'client' fixture from conftest.py via pytest's automatic
fixture injection mechanism — no explicit import of conftest is needed.
"""

import pytest


# =============================================================================
# Expected response constants for assertion consistency
# =============================================================================
EXPECTED_BODY = b"Hello, World!\n"
EXPECTED_BODY_TEXT = "Hello, World!\n"
EXPECTED_STATUS = 200
EXPECTED_CONTENT_TYPE_PREFIX = "text/plain"


# =============================================================================
# Root Path Routing Tests
# =============================================================================


def test_root_path_accessible_returns_200(client):
    """Verify GET / returns a valid response with HTTP 200 status code.

    Tests the root path which uses the defaults={'path': ''} pattern
    from the first route decorator at app.py line 29. This is the primary
    entry point for the application.
    """
    response = client.get('/')
    assert response.status_code == EXPECTED_STATUS


def test_root_path_returns_expected_body(client):
    """Verify GET / returns the exact 'Hello, World!\\n' response body.

    The response body must be exactly 14 bytes matching the original
    Node.js server behavior documented at app.py line 15:
    res.end('Hello, World!\\n'). Both the binary and text representations
    of the response data are validated.
    """
    response = client.get('/')
    assert response.data == EXPECTED_BODY
    assert response.get_data(as_text=True) == EXPECTED_BODY_TEXT


# =============================================================================
# Single-Segment Path Tests (Parametrized)
# =============================================================================


@pytest.mark.parametrize("path", [
    '/test',
    '/hello',
    '/page',
    '/about',
    '/file.txt',
])
def test_single_segment_paths(client, path):
    """Verify single-segment paths return the same response as the root path.

    Tests the /<path:path> route decorator at app.py line 30 with various
    single-segment URL paths. Each path should produce an identical response
    to GET /, confirming the catch-all routing works for top-level segments.

    Args:
        client: Flask test client fixture from conftest.py.
        path: Single-segment URL path to test.
    """
    response = client.get(path)
    assert response.status_code == EXPECTED_STATUS
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE_PREFIX in response.content_type


# =============================================================================
# Multi-Segment / Nested Path Tests (Parametrized)
# =============================================================================


@pytest.mark.parametrize("path", [
    '/a/b/c',
    '/deep/nested/path/here',
    '/x/y/z/w',
    '/one/two/three',
    '/api/v1/users/123/profile',
])
def test_nested_paths(client, path):
    """Verify multi-segment nested paths return the same response as the root.

    Tests that deeply nested paths handled by the /<path:path> converter
    at app.py line 30 produce identical responses regardless of nesting
    depth. The path parameter is captured but not used in the response.

    Args:
        client: Flask test client fixture from conftest.py.
        path: Multi-segment nested URL path to test.
    """
    response = client.get(path)
    assert response.status_code == EXPECTED_STATUS
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE_PREFIX in response.content_type


# =============================================================================
# Response Uniformity Tests
# =============================================================================


def test_all_paths_return_identical_response(client):
    """Compare response body, status code, and content type across multiple paths.

    Verifies that the root path and several subpaths all produce exactly
    identical HTTP responses, confirming the catch-all routing works uniformly
    for both the defaults={'path': ''} decorator (line 29) and the
    /<path:path> decorator (line 30). This is the core uniformity assertion
    that validates the dual-decorator pattern functions as a true catch-all.
    """
    paths = ['/', '/test', '/a/b/c', '/hello/world', '/deep/nested/path']
    responses = [client.get(path) for path in paths]

    # Use the root path response as the reference for comparison
    reference = responses[0]
    for i, response in enumerate(responses[1:], start=1):
        assert response.data == reference.data, (
            f"Path '{paths[i]}' body differs from root '/': "
            f"got {response.data!r}, expected {reference.data!r}"
        )
        assert response.status_code == reference.status_code, (
            f"Path '{paths[i]}' status code differs from root '/': "
            f"got {response.status_code}, expected {reference.status_code}"
        )
        assert response.content_type == reference.content_type, (
            f"Path '{paths[i]}' content-type differs from root '/': "
            f"got {response.content_type!r}, expected {reference.content_type!r}"
        )


def test_path_parameter_not_used_in_response(client):
    """Verify that different path values do not affect the response content.

    The hello(path) handler at app.py line 31 receives the path parameter
    but intentionally ignores it when constructing the response. This test
    confirms that the response body remains constant regardless of what
    path value is passed to the handler.
    """
    response_root = client.get('/')
    response_subpath = client.get('/completely/different/path')
    response_another = client.get('/yet/another/unique/path/value')

    assert response_root.data == response_subpath.data
    assert response_root.data == response_another.data
    assert response_subpath.data == response_another.data


# =============================================================================
# Special Path Pattern Tests
# =============================================================================


def test_path_with_dots_returns_same_response(client):
    """Verify paths containing dots (like file extensions) route correctly.

    Paths such as '/file.txt' or '/document.pdf' should be caught by the
    /<path:path> converter and return the standard response, not trigger
    any static file handling or 404 errors.
    """
    response = client.get('/file.txt')
    assert response.status_code == EXPECTED_STATUS
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE_PREFIX in response.content_type


def test_path_with_query_string_returns_same_response(client):
    """Verify query strings do not affect the routing or response content.

    Query parameters like ?key=val are separate from the URL path component
    and should not influence the catch-all route handler's response. The
    Flask router strips query strings before matching routes, so the same
    handler is invoked regardless of query parameters.
    """
    response_with_query = client.get('/test?key=val')
    assert response_with_query.status_code == EXPECTED_STATUS
    assert response_with_query.data == EXPECTED_BODY

    # Verify the response matches the same path without query string
    response_without_query = client.get('/test')
    assert response_with_query.data == response_without_query.data
    assert response_with_query.status_code == response_without_query.status_code


# =============================================================================
# Catch-All Decorator Verification Tests
# =============================================================================


def test_root_uses_defaults_pattern(client):
    """Verify GET / works via the defaults={'path': ''} decorator at app.py line 29.

    The first route decorator @app.route('/', defaults={'path': ''}) is
    essential because Flask's <path:path> converter does not match the empty
    root path '/'. Without this defaults pattern, GET / would return a 404.
    This test confirms the defaults decorator correctly routes root requests
    to the hello(path) handler.
    """
    response = client.get('/')
    assert response.status_code == EXPECTED_STATUS
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE_PREFIX in response.content_type


def test_subpath_uses_path_converter(client):
    """Verify GET /any/path works via the /<path:path> decorator at app.py line 30.

    The second route decorator @app.route('/<path:path>') handles all
    non-root paths by capturing the entire URL path segment into the 'path'
    parameter. This test confirms the path converter correctly captures
    and routes arbitrary subpaths to the hello(path) handler.
    """
    response = client.get('/any/path')
    assert response.status_code == EXPECTED_STATUS
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE_PREFIX in response.content_type
