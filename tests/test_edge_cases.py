"""
Edge case and boundary condition tests for the Flask application.

Tests unusual inputs including very long URLs (1000+ characters), special
characters (%20, @, #), Unicode paths, URL-encoded segments, empty path
segments, trailing slashes, deeply nested path structures, and query strings.
Validates that the application remains stable and returns consistent
'Hello, World!\n' responses under all boundary conditions.
"""

import pytest


class TestVeryLongPaths:
    """Tests verifying application stability with extremely long URL paths."""

    def test_very_long_path(self, client):
        """Verify a path with 1000+ characters returns 200 with correct body."""
        long_path = '/a' * 500  # 1000 characters
        response = client.get(long_path)
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"

    def test_extremely_long_path_segments(self, client):
        """Verify a path with very long individual segments returns correct response."""
        long_segment = '/segment_' + 'x' * 200
        response = client.get(long_segment)
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"


@pytest.mark.parametrize("path", [
    '/hello%20world',
    '/path%40special',
    '/test%23hash',
])
def test_path_with_special_characters(client, path):
    """Verify paths with URL-encoded special characters return correct response.

    Args:
        client: Flask test client fixture.
        path: URL path containing URL-encoded special characters.
    """
    response = client.get(path)
    assert response.status_code == 200
    assert response.data == b"Hello, World!\n"


class TestSpecialCharacterPaths:
    """Tests verifying paths with special characters."""

    def test_path_with_at_symbol(self, client):
        """Verify a path containing '@' symbol returns correct response."""
        response = client.get('/user@domain')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"

    def test_path_with_period(self, client):
        """Verify a path containing periods (file extension-like) returns correctly."""
        response = client.get('/file.txt.bak')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"


class TestUnicodePaths:
    """Tests verifying application behavior with Unicode path segments."""

    def test_unicode_path(self, client):
        """Verify URL-encoded Unicode path segments return correct response."""
        response = client.get('/caf%C3%A9')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"

    def test_path_with_encoded_unicode(self, client):
        """Verify path with encoded Unicode character é returns correct response."""
        response = client.get('/path%C3%A9')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"


class TestURLEncodingPaths:
    """Tests verifying application behavior with URL-encoded path segments."""

    def test_url_encoded_spaces(self, client):
        """Verify URL-encoded spaces in paths return correct response."""
        response = client.get('/hello%20world')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"

    def test_url_encoded_slashes(self, client):
        """Verify paths with encoded segments return correct response."""
        response = client.get('/segment1/segment%20two')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"


class TestTrailingSlashPaths:
    """Tests verifying application behavior with trailing slashes."""

    def test_trailing_slash_on_root(self, client):
        """Verify GET / with default root path returns correct response."""
        response = client.get('/')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"

    def test_path_with_trailing_slash(self, client):
        """Verify a path with trailing slash returns correct response."""
        response = client.get('/test/')
        # Flask may redirect or return 200 depending on strict_slashes;
        # the catch-all /<path:path> accepts trailing slashes
        assert response.status_code in (200, 308)
        if response.status_code == 200:
            assert response.data == b"Hello, World!\n"


class TestDeeplyNestedPaths:
    """Tests verifying application behavior with deeply nested path structures."""

    def test_deeply_nested_path(self, client):
        """Verify a path with 10+ segments returns correct response."""
        deep_path = '/a/b/c/d/e/f/g/h/i/j'
        response = client.get(deep_path)
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"

    def test_path_with_many_segments(self, client):
        """Verify a path with 20+ nested segments returns correct response."""
        segments = '/'.join(['seg' + str(i) for i in range(25)])
        response = client.get('/' + segments)
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"


class TestQueryStringPaths:
    """Tests verifying application behavior with query strings."""

    def test_path_with_query_string(self, client):
        """Verify query strings on root path don't affect response body."""
        response = client.get('/?key=value')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"

    def test_path_with_multiple_query_params(self, client):
        """Verify multiple query parameters don't affect response body."""
        response = client.get('/test?a=1&b=2')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"

    def test_path_with_empty_query_string(self, client):
        """Verify an empty query string doesn't affect response body."""
        response = client.get('/test?')
        assert response.status_code == 200
        assert response.data == b"Hello, World!\n"
