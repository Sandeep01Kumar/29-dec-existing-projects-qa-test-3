"""
Unit tests for HTTP header validation.

Verifies that the Content-Type header is 'text/plain' as specified by the
mimetype='text/plain' parameter in app.py line 52. Tests Content-Type via
response.content_type and response.headers['Content-Type'], validates
Content-Length header consistency with the 14-byte response body, and checks
for standard Flask response headers.
"""

import pytest


class TestContentTypeHeaders:
    """Tests verifying the Content-Type header in responses."""

    def test_root_content_type(self, client):
        """Verify GET / returns a Content-Type containing 'text/plain'."""
        response = client.get('/')
        assert 'text/plain' in response.content_type

    def test_content_type_header_direct(self, client):
        """Verify the Content-Type header starts with 'text/plain'."""
        response = client.get('/')
        assert response.headers['Content-Type'].startswith('text/plain')

    def test_content_type_includes_charset(self, client):
        """Verify the Content-Type header includes charset=utf-8 (Flask default)."""
        response = client.get('/')
        assert 'charset=utf-8' in response.content_type


class TestContentLengthHeaders:
    """Tests verifying the Content-Length header in responses."""

    def test_content_length_header(self, client):
        """Verify Content-Length header equals 14 (matching 'Hello, World!\n' body)."""
        response = client.get('/')
        assert response.headers['Content-Length'] == '14'

    def test_content_length_matches_body(self, client):
        """Verify Content-Length header value matches the actual response body length."""
        response = client.get('/')
        content_length = int(response.headers['Content-Length'])
        assert content_length == len(response.data)


class TestStandardHeaderPresence:
    """Tests verifying the presence of standard response headers."""

    def test_response_has_content_type_header(self, client):
        """Verify the Content-Type header key exists in the response."""
        response = client.get('/')
        assert 'Content-Type' in response.headers

    def test_response_has_content_length_header(self, client):
        """Verify the Content-Length header key exists in the response."""
        response = client.get('/')
        assert 'Content-Length' in response.headers


@pytest.mark.parametrize("path", [
    '/',
    '/test',
    '/a/b/c',
    '/hello/world',
    '/nested/path/here',
])
def test_headers_consistent_across_paths(client, path):
    """Verify Content-Type header is identical for all routes.

    Args:
        client: Flask test client fixture.
        path: URL path to request.
    """
    response = client.get(path)
    assert 'text/plain' in response.content_type
    assert 'Content-Type' in response.headers
    assert 'Content-Length' in response.headers
