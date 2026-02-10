"""
Unit tests for HTTP response body content validation.

Verifies that the hello(path) handler at app.py lines 31-52 returns the exact
response body 'Hello, World!\n' (14 bytes including trailing newline) for all
routes. Tests use Flask's test client via the client fixture from conftest.py.
Validates both byte-level (response.data) and text-level
(response.get_data(as_text=True)) response content.
"""

import pytest


class TestRootResponseBody:
    """Tests verifying the response body content for the root path."""

    def test_root_returns_hello_world(self, client):
        """Verify GET / returns the exact 'Hello, World!\n' bytes response."""
        response = client.get('/')
        assert response.data == b"Hello, World!\n"

    def test_root_response_as_text(self, client):
        """Verify GET / returns the exact 'Hello, World!\n' text response."""
        response = client.get('/')
        assert response.get_data(as_text=True) == "Hello, World!\n"

    def test_response_body_exact_length(self, client):
        """Verify the response body is exactly 14 bytes long."""
        response = client.get('/')
        assert len(response.data) == 14

    def test_response_encoding(self, client):
        """Verify the response body decodes correctly as UTF-8."""
        response = client.get('/')
        decoded = response.data.decode('utf-8')
        assert decoded == "Hello, World!\n"


@pytest.mark.parametrize("path", [
    '/test',
    '/hello',
    '/any/path',
    '/page',
    '/about',
])
def test_subpath_returns_hello_world(client, path):
    """Verify single-segment subpaths return the exact 'Hello, World!\n' response.

    Args:
        client: Flask test client fixture.
        path: URL path to request.
    """
    response = client.get(path)
    assert response.data == b"Hello, World!\n"
    assert response.get_data(as_text=True) == "Hello, World!\n"


@pytest.mark.parametrize("path", [
    '/a/b/c',
    '/x/y/z/w',
    '/deep/nested/path/here',
    '/one/two/three/four/five',
])
def test_nested_path_returns_hello_world(client, path):
    """Verify deeply nested paths return the exact 'Hello, World!\n' response.

    Args:
        client: Flask test client fixture.
        path: URL path with multiple segments to request.
    """
    response = client.get(path)
    assert response.data == b"Hello, World!\n"
    assert len(response.data) == 14
