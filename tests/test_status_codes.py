"""
Unit tests for HTTP status code validation.

Verifies that all supported routes return HTTP 200 OK status code as defined
by the default Flask response behavior at app.py line 52. Includes parametrized
tests for root path, single-segment paths, and multi-segment paths. Also tests
method-specific status codes to verify Flask's 405 Method Not Allowed for
unsupported methods.
"""

import pytest


class TestRootStatusCode:
    """Tests verifying the HTTP status code for the root path."""

    def test_root_returns_200(self, client):
        """Verify GET / returns HTTP 200 status code."""
        response = client.get('/')
        assert response.status_code == 200

    def test_root_status_string(self, client):
        """Verify GET / returns the full '200 OK' status string."""
        response = client.get('/')
        assert response.status == '200 OK'


@pytest.mark.parametrize("path", [
    '/test',
    '/hello',
    '/page',
])
def test_subpath_returns_200(client, path):
    """Verify single-segment subpaths return HTTP 200 status code.

    Args:
        client: Flask test client fixture.
        path: URL path to request.
    """
    response = client.get(path)
    assert response.status_code == 200


@pytest.mark.parametrize("path", [
    '/a/b/c',
    '/deep/nested/path',
    '/x/y/z/w/v',
])
def test_nested_path_returns_200(client, path):
    """Verify multi-segment nested paths return HTTP 200 status code.

    Args:
        client: Flask test client fixture.
        path: URL path with multiple segments to request.
    """
    response = client.get(path)
    assert response.status_code == 200


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

    Args:
        client: Flask test client fixture.
        path: URL path to request.
    """
    response = client.get(path)
    assert response.status_code == 200


class TestMethodSpecificStatusCodes:
    """Tests verifying status codes for different HTTP methods."""

    def test_post_method_status_code(self, client):
        """Verify POST / returns 405 Method Not Allowed (route only supports GET)."""
        response = client.post('/')
        assert response.status_code == 405

    def test_head_method_returns_200(self, client):
        """Verify HEAD / returns 200 (Flask auto-supports HEAD for GET routes)."""
        response = client.head('/')
        assert response.status_code == 200
