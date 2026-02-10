"""
Unit tests for catch-all routing behavior validation.

Tests that both the root path '/' and arbitrary nested paths (e.g.,
'/any/path/here') return identical responses, as implemented by the dual
route decorators at app.py lines 29-30. Validates response uniformity
across all path patterns using parametrized tests.
"""

import pytest


class TestRootPathRouting:
    """Tests verifying the root path routing behavior."""

    def test_root_path_accessible(self, client):
        """Verify GET / returns a valid response with status 200."""
        response = client.get('/')
        assert response.status_code == 200

    def test_root_path_returns_expected_body(self, client):
        """Verify GET / returns the expected 'Hello, World!\n' body."""
        response = client.get('/')
        assert response.data == b"Hello, World!\n"


@pytest.mark.parametrize("path", [
    '/test',
    '/hello',
    '/page',
    '/about',
    '/file.txt',
])
def test_single_segment_paths(client, path):
    """Verify single-segment paths return the same response as the root.

    Args:
        client: Flask test client fixture.
        path: Single-segment URL path to request.
    """
    response = client.get(path)
    assert response.status_code == 200
    assert response.data == b"Hello, World!\n"


@pytest.mark.parametrize("path", [
    '/a/b/c',
    '/deep/nested/path/here',
    '/x/y/z/w',
    '/one/two/three',
])
def test_nested_paths(client, path):
    """Verify multi-segment nested paths return the same response as the root.

    Args:
        client: Flask test client fixture.
        path: Multi-segment URL path to request.
    """
    response = client.get(path)
    assert response.status_code == 200
    assert response.data == b"Hello, World!\n"


class TestResponseUniformity:
    """Tests verifying all paths produce identical responses."""

    def test_all_paths_return_identical_response(self, client):
        """Compare response body, status code, and content type from / and subpaths.

        All paths should produce exactly identical HTTP responses.
        """
        paths = ['/', '/test', '/a/b/c', '/hello/world', '/deep/nested']
        responses = [client.get(path) for path in paths]

        # All responses must match the first response
        reference = responses[0]
        for i, response in enumerate(responses[1:], start=1):
            assert response.data == reference.data, \
                f"Path {paths[i]} body differs from root"
            assert response.status_code == reference.status_code, \
                f"Path {paths[i]} status differs from root"
            assert response.content_type == reference.content_type, \
                f"Path {paths[i]} content-type differs from root"

    def test_path_parameter_not_used_in_response(self, client):
        """Verify that different path values don't affect the response content."""
        response_root = client.get('/')
        response_path = client.get('/completely/different/path')
        assert response_root.data == response_path.data


class TestSpecialPathPatterns:
    """Tests verifying routing works with special path patterns."""

    def test_path_with_dots(self, client):
        """Verify paths with dots (like file extensions) return the same response."""
        response = client.get('/file.txt')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"

    def test_path_with_query_string(self, client):
        """Verify query strings don't affect the route handler's response."""
        response = client.get('/test?key=val')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"


class TestCatchAllDecoratorVerification:
    """Tests verifying both route decorators work correctly."""

    def test_root_uses_defaults_pattern(self, client):
        """Verify GET / works via the defaults={'path': ''} decorator (app.py line 29)."""
        response = client.get('/')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"

    def test_subpath_uses_path_converter(self, client):
        """Verify GET /any/path works via the /<path:path> decorator (app.py line 30)."""
        response = client.get('/any/path')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"
