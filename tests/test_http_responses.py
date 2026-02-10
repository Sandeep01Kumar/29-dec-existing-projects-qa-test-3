"""
Unit tests for HTTP response body content validation.

Verifies that the hello(path) handler at app.py lines 31-52 returns the exact
response body 'Hello, World!\n' (14 bytes including trailing newline) for all
routes. Tests use Flask's test client via the client fixture from conftest.py.
Validates both byte-level (response.data) and text-level
(response.get_data(as_text=True)) response content.

Test coverage areas:
- Root path (/) response body as bytes and text
- Exact byte length verification (14 bytes)
- UTF-8 encoding correctness
- Single-segment subpath response uniformity
- Deeply nested path response uniformity
"""

import pytest


# ---------------------------------------------------------------------------
# Root path response body tests
# ---------------------------------------------------------------------------


def test_root_returns_hello_world(client):
    """Verify GET / returns the exact 'Hello, World!\\n' bytes response.

    Sends a GET request to the root path and asserts the raw response data
    matches the expected byte string b"Hello, World!\\n", confirming the
    Response('Hello, World!\\n', mimetype='text/plain') at app.py line 52
    produces the correct binary output.
    """
    response = client.get('/')
    assert response.data == b"Hello, World!\n"


def test_root_response_as_text(client):
    """Verify GET / returns the exact 'Hello, World!\\n' text response.

    Uses Flask's get_data(as_text=True) helper to decode the response body
    and asserts the resulting Python string matches "Hello, World!\\n"
    exactly, including the trailing newline character that mirrors the
    original Node.js res.end('Hello, World!\\n') behavior.
    """
    response = client.get('/')
    assert response.get_data(as_text=True) == "Hello, World!\n"


def test_response_body_exact_length(client):
    """Verify the response body is exactly 14 bytes long.

    The string 'Hello, World!\\n' consists of 13 printable ASCII characters
    plus one newline character, totaling 14 bytes in UTF-8 encoding. This
    test guards against accidental whitespace additions or truncations in
    the response body constructed at app.py line 52.
    """
    response = client.get('/')
    assert len(response.data) == 14


def test_response_encoding(client):
    """Verify the response body decodes correctly as UTF-8.

    Explicitly decodes the raw response bytes using UTF-8 and asserts the
    decoded string matches the expected text. This confirms that no encoding
    issues exist between Flask's Response object and the test client, and
    that the response is valid UTF-8 as implied by the text/plain mimetype.
    """
    response = client.get('/')
    decoded = response.data.decode('utf-8')
    assert decoded == "Hello, World!\n"


# ---------------------------------------------------------------------------
# Parametrized single-segment subpath response body tests
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("path", [
    '/test',
    '/hello',
    '/any/path',
    '/page',
    '/about',
])
def test_subpath_returns_hello_world(client, path):
    """Verify single-segment and two-segment subpaths return the exact response.

    The catch-all route decorator @app.route('/<path:path>') at app.py line 30
    captures all non-root paths. This parametrized test confirms that each
    subpath produces an identical 'Hello, World!\\n' response body in both
    byte and text representations, matching the root path behavior.

    Args:
        client: Flask test client fixture injected from conftest.py.
        path: URL path to request, parametrized across common subpath patterns.
    """
    response = client.get(path)
    assert response.data == b"Hello, World!\n"
    assert response.get_data(as_text=True) == "Hello, World!\n"


# ---------------------------------------------------------------------------
# Parametrized deeply nested path response body tests
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("path", [
    '/a/b/c',
    '/x/y/z/w',
    '/deep/nested/path/here',
    '/one/two/three/four/five',
])
def test_nested_path_returns_hello_world(client, path):
    """Verify deeply nested paths return the exact 'Hello, World!\\n' response.

    Tests paths with three or more segments to confirm the Flask catch-all
    route at app.py lines 29-30 handles arbitrary nesting depth. Validates
    both the raw byte content and the exact byte length of 14, ensuring no
    path-dependent variation in the response body.

    Args:
        client: Flask test client fixture injected from conftest.py.
        path: Deeply nested URL path, parametrized with multiple segment depths.
    """
    response = client.get(path)
    assert response.data == b"Hello, World!\n"
    assert response.get_data(as_text=True) == "Hello, World!\n"
    assert len(response.data) == 14
