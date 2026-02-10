"""
Unit tests for HTTP header validation of the Flask application.

Verifies that the Content-Type header is 'text/plain' as specified by the
mimetype='text/plain' parameter in app.py line 52. Tests Content-Type via
response.content_type and response.headers['Content-Type'], validates
Content-Length header consistency with the 14-byte response body
("Hello, World!\n"), and checks for standard Flask response headers.

Uses the 'client' fixture from conftest.py via pytest's automatic fixture
injection — no explicit import of the fixture is needed.

Test categories covered:
    - Content-Type verification (value, format, charset)
    - Content-Length consistency (exact value, body length match)
    - Standard header presence (Content-Type, Content-Length keys)
    - Header consistency across all catch-all route paths
"""

import pytest


# ---------------------------------------------------------------------------
# Content-Type header tests
# ---------------------------------------------------------------------------


def test_root_content_type(client):
    """Verify GET / returns a response whose Content-Type contains 'text/plain'.

    The Flask application sets mimetype='text/plain' on the Response object
    (app.py line 52).  Flask automatically appends '; charset=utf-8', so the
    full Content-Type is 'text/plain; charset=utf-8'.  This test checks that
    'text/plain' is present in response.content_type regardless of the charset
    suffix.
    """
    response = client.get('/')
    assert 'text/plain' in response.content_type


def test_content_type_header_direct(client):
    """Verify the raw Content-Type header value starts with 'text/plain'.

    Accesses the header directly via response.headers['Content-Type'] to
    confirm the MIME type portion precedes any parameters (e.g. charset).
    This mirrors how downstream HTTP clients parse the header.
    """
    response = client.get('/')
    content_type_value = response.headers['Content-Type']
    assert content_type_value.startswith('text/plain')


def test_content_type_includes_charset(client):
    """Verify the Content-Type header includes charset=utf-8 (Flask default).

    Flask's Response class appends 'charset=utf-8' when the mimetype is a
    text type.  The full expected value is 'text/plain; charset=utf-8'.
    This test ensures the charset parameter is present so clients know the
    encoding of the response body.
    """
    response = client.get('/')
    assert 'charset=utf-8' in response.content_type


# ---------------------------------------------------------------------------
# Content-Length header tests
# ---------------------------------------------------------------------------


def test_content_length_header(client):
    """Verify Content-Length header equals '14' for the root route.

    The response body is the 14-byte string "Hello, World!\\n" (13 printable
    characters plus one newline).  Flask sets Content-Length automatically
    based on the encoded body size.  The header value is a string
    representation of the integer byte count.
    """
    response = client.get('/')
    assert response.headers['Content-Length'] == '14'


def test_content_length_matches_body(client):
    """Verify Content-Length header matches the actual response body length.

    Converts the Content-Length header to an integer and compares it to
    len(response.data) to ensure consistency.  This guards against any
    mismatch between the declared and actual payload sizes.
    """
    response = client.get('/')
    content_length = int(response.headers['Content-Length'])
    assert content_length == len(response.data)


# ---------------------------------------------------------------------------
# Standard header presence tests
# ---------------------------------------------------------------------------


def test_response_has_content_type_header(client):
    """Verify the 'Content-Type' key exists in the response headers.

    Every well-formed HTTP response from the Flask application must include
    the Content-Type header so that clients can correctly interpret the body.
    This test checks for key presence without asserting a specific value.
    """
    response = client.get('/')
    assert 'Content-Type' in response.headers


def test_response_has_content_length_header(client):
    """Verify the 'Content-Length' key exists in the response headers.

    Flask automatically sets Content-Length for responses with a known body
    size.  This test ensures the header is present so that clients can
    allocate the right buffer and detect truncated responses.
    """
    response = client.get('/')
    assert 'Content-Length' in response.headers


# ---------------------------------------------------------------------------
# Parametrized header consistency tests across multiple paths
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("path", [
    '/',
    '/test',
    '/a/b/c',
    '/hello/world',
    '/nested/path/here',
])
def test_headers_consistent_across_paths(client, path):
    """Verify Content-Type and Content-Length headers are identical for all routes.

    The catch-all route decorators at app.py lines 29-30 ensure every path
    returns the same "Hello, World!\\n" response.  This parametrized test
    confirms that the header contract holds for root, single-segment,
    multi-segment, and deeply nested paths alike.

    Args:
        client: Flask test client fixture injected from conftest.py.
        path: URL path to request (provided by pytest.mark.parametrize).
    """
    response = client.get(path)
    # Content-Type must be text/plain for every path
    assert 'text/plain' in response.content_type
    # Standard headers must be present for every path
    assert 'Content-Type' in response.headers
    assert 'Content-Length' in response.headers
    # Content-Length must be 14 for every path (same body)
    assert response.headers['Content-Length'] == '14'
