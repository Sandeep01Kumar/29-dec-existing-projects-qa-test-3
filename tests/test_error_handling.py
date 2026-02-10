"""
Unit tests for error handling and unsupported HTTP method behavior.

Tests that non-GET HTTP methods (POST, PUT, DELETE, PATCH) receive appropriate
Flask error responses (405 Method Not Allowed) since the route decorators at
app.py lines 29-30 only register GET handlers. Also tests HEAD method behavior
(returns headers without body) and OPTIONS method behavior.
"""

import pytest


class TestUnsupportedMethodsOnRoot:
    """Tests verifying 405 Method Not Allowed for unsupported methods on root path."""

    def test_post_method_not_allowed(self, client):
        """Verify POST / returns 405 Method Not Allowed."""
        response = client.post('/')
        assert response.status_code == 405

    def test_put_method_not_allowed(self, client):
        """Verify PUT / returns 405 Method Not Allowed."""
        response = client.put('/')
        assert response.status_code == 405

    def test_delete_method_not_allowed(self, client):
        """Verify DELETE / returns 405 Method Not Allowed."""
        response = client.delete('/')
        assert response.status_code == 405

    def test_patch_method_not_allowed(self, client):
        """Verify PATCH / returns 405 Method Not Allowed."""
        response = client.patch('/')
        assert response.status_code == 405


@pytest.mark.parametrize("method", [
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
])
def test_unsupported_methods_return_405(client, method):
    """Verify unsupported HTTP methods return 405 on the root path.

    Args:
        client: Flask test client fixture.
        method: HTTP method name to test.
    """
    response = getattr(client, method.lower())('/')
    assert response.status_code == 405


class TestOptionsMethod:
    """Tests verifying Flask's default OPTIONS method behavior."""

    def test_options_method_response(self, client):
        """Verify OPTIONS / returns Flask's default response with allowed methods."""
        response = client.options('/')
        assert response.status_code == 200
        # Flask auto-generates OPTIONS responses listing allowed methods
        allow_header = response.headers.get('Allow', '')
        assert 'GET' in allow_header
        assert 'HEAD' in allow_header
        assert 'OPTIONS' in allow_header


class TestHeadMethod:
    """Tests verifying HEAD method behavior (Flask auto-supports HEAD for GET routes)."""

    def test_head_method_returns_200(self, client):
        """Verify HEAD / returns 200 status code."""
        response = client.head('/')
        assert response.status_code == 200

    def test_head_method_returns_empty_body(self, client):
        """Verify HEAD / returns an empty body (HEAD sends headers only)."""
        response = client.head('/')
        assert response.data == b''

    def test_head_method_has_content_type(self, client):
        """Verify HEAD / still includes the Content-Type header."""
        response = client.head('/')
        assert 'Content-Type' in response.headers
        assert 'text/plain' in response.headers['Content-Type']


class TestUnsupportedMethodsOnSubpaths:
    """Tests verifying 405 for unsupported methods on sub-paths."""

    def test_post_to_subpath_not_allowed(self, client):
        """Verify POST /some/path returns 405 Method Not Allowed."""
        response = client.post('/some/path')
        assert response.status_code == 405

    def test_put_to_subpath_not_allowed(self, client):
        """Verify PUT /any/nested/path returns 405 Method Not Allowed."""
        response = client.put('/any/nested/path')
        assert response.status_code == 405
