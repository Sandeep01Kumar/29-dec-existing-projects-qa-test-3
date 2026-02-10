"""
Edge case and boundary condition tests for the Flask application.

This module validates that the Flask application remains stable and returns
consistent 'Hello, World!\\n' responses under unusual or extreme input
conditions. Test categories include:

- Very long URL paths (1000+ characters)
- Special characters in paths (%20, @, #, periods)
- Unicode path segments (URL-encoded multibyte characters)
- URL-encoded path segments (spaces, slashes)
- Empty and minimal path scenarios (trailing slashes, root path)
- Deeply nested path structures (10+ and 20+ segments)
- Query string variations (single, multiple, empty parameters)

All tests use the 'client' fixture from conftest.py via pytest's automatic
fixture injection to make HTTP requests without running a live server.
"""

import pytest


# ---------------------------------------------------------------------------
# Expected response constants used across all edge case assertions
# ---------------------------------------------------------------------------
EXPECTED_BODY = b"Hello, World!\n"
EXPECTED_BODY_TEXT = "Hello, World!\n"
EXPECTED_CONTENT_TYPE = "text/plain; charset=utf-8"


# ===========================================================================
# Very Long URL Tests
# ===========================================================================


def test_very_long_path(client):
    """Verify a GET request with a 1000+ character path returns 200 with the
    correct 'Hello, World!\\n' body.

    Constructs a path by repeating '/a' 500 times, producing a 1000-character
    URL path. The catch-all route in app.py must handle arbitrarily long paths
    without error or truncation.
    """
    long_path = "/a" * 500  # 1000 characters total
    response = client.get(long_path)
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


def test_extremely_long_path_segments(client):
    """Verify a GET request with a very long individual path segment returns
    the correct response.

    Creates a single path segment of 200+ characters to test that the Flask
    application does not impose unexpected segment-length restrictions.
    """
    long_segment = "/segment_" + "x" * 200
    response = client.get(long_segment)
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


# ===========================================================================
# Special Character Tests
# ===========================================================================


@pytest.mark.parametrize(
    "path",
    [
        "/hello%20world",
        "/path%40special",
        "/test%23hash",
    ],
    ids=[
        "url-encoded-space-%20",
        "url-encoded-at-%40",
        "url-encoded-hash-%23",
    ],
)
def test_path_with_special_characters(client, path):
    """Verify paths containing URL-encoded special characters return the
    correct 'Hello, World!\\n' response with status 200.

    Args:
        client: Flask test client fixture injected from conftest.py.
        path: URL path containing URL-encoded special characters such as
              %20 (space), %40 (@), and %23 (#).
    """
    response = client.get(path)
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


def test_path_with_at_symbol(client):
    """Verify a GET request to '/user@domain' (containing an @ symbol)
    returns 200 with the correct response body.

    The @ character is valid in URL path segments and should be handled
    by the catch-all route without any special treatment.
    """
    response = client.get("/user@domain")
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


def test_path_with_period(client):
    """Verify a GET request to '/file.txt.bak' (containing periods) returns
    200 with the correct response body.

    Periods in paths resemble file extensions. The catch-all route must not
    attempt static-file lookups and should return the standard response.
    """
    response = client.get("/file.txt.bak")
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


# ===========================================================================
# Unicode Path Tests
# ===========================================================================


def test_unicode_path(client):
    """Verify a GET request with URL-encoded Unicode path segments returns
    the consistent 'Hello, World!\\n' response.

    Uses the URL-encoded form of 'café' (%C3%A9 = UTF-8 encoding of 'é')
    to ensure multibyte Unicode characters in paths do not break routing.
    """
    response = client.get("/caf%C3%A9")
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


def test_path_with_encoded_unicode(client):
    """Verify a GET request to '/path%C3%A9' (encoded Unicode é character)
    returns the correct response.

    Tests that the application handles URL-encoded multibyte UTF-8 sequences
    without decoding errors or routing failures.
    """
    response = client.get("/path%C3%A9")
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


# ===========================================================================
# URL Encoding Tests
# ===========================================================================


def test_url_encoded_spaces(client):
    """Verify a GET request to '/hello%20world' (URL-encoded space) returns
    200 with the exact 'Hello, World!\\n' body.

    The %20 encoding represents a space character. The catch-all route must
    accept URL-encoded spaces in any path position.
    """
    response = client.get("/hello%20world")
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


def test_url_encoded_slashes(client):
    """Verify a GET request with URL-encoded segments containing spaces
    returns the correct response.

    Tests a multi-segment path where one segment contains an encoded space
    character, ensuring URL decoding does not interfere with routing.
    """
    response = client.get("/segment1/segment%20two")
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


# ===========================================================================
# Empty / Minimal Path Tests (Trailing Slashes)
# ===========================================================================


def test_trailing_slash_on_root(client):
    """Verify a GET request to the root path '/' returns 200 with the
    correct 'Hello, World!\\n' body.

    The root path is handled by the @app.route('/', defaults={'path': ''})
    decorator in app.py. This test confirms the root-path edge case is
    properly covered by the catch-all route configuration.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


def test_path_with_trailing_slash(client):
    """Verify a GET request to '/test/' (path with trailing slash) returns
    a valid response.

    Flask's strict_slashes behavior may return a 308 redirect to '/test' or
    serve the response directly (200). Both outcomes are acceptable; when a
    200 is returned, the body must be 'Hello, World!\\n'.
    """
    response = client.get("/test/")
    assert response.status_code in (200, 308)
    if response.status_code == 200:
        assert response.data == EXPECTED_BODY
        assert EXPECTED_CONTENT_TYPE in response.content_type


# ===========================================================================
# Deeply Nested Path Tests
# ===========================================================================


def test_deeply_nested_path(client):
    """Verify a GET request with 10 nested path segments returns 200 with
    the correct response body.

    The path '/a/b/c/d/e/f/g/h/i/j' contains 10 segments. The catch-all
    /<path:path> route accepts arbitrarily deep nesting.
    """
    deep_path = "/a/b/c/d/e/f/g/h/i/j"
    response = client.get(deep_path)
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


def test_path_with_many_segments(client):
    """Verify a GET request with 25 nested path segments returns 200 with
    the correct response body.

    Generates '/seg0/seg1/seg2/.../seg24' to exercise deeply nested path
    handling and ensure no segment-count limitations exist.
    """
    segments = "/".join(["seg" + str(i) for i in range(25)])
    response = client.get("/" + segments)
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


# ===========================================================================
# Query String Tests
# ===========================================================================


def test_path_with_query_string(client):
    """Verify a GET request to '/?key=value' returns 200 with the
    'Hello, World!\\n' body, unaffected by query parameters.

    Query strings are not part of the path and must not alter the catch-all
    route handler's response content or status code.
    """
    response = client.get("/?key=value")
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


def test_path_with_multiple_query_params(client):
    """Verify a GET request to '/test?a=1&b=2' returns 200 with the correct
    body, unaffected by multiple query parameters.

    Multiple query string key-value pairs should have no effect on the
    application's response content, status code, or content type.
    """
    response = client.get("/test?a=1&b=2")
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type


def test_path_with_empty_query_string(client):
    """Verify a GET request to '/test?' (empty query string) returns 200
    with the correct body.

    A trailing '?' with no parameters is a valid URL format and must not
    cause any routing or response errors.
    """
    response = client.get("/test?")
    assert response.status_code == 200
    assert response.data == EXPECTED_BODY
    assert EXPECTED_CONTENT_TYPE in response.content_type
