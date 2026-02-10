"""
Unit tests for error handling and unsupported HTTP method behavior.

Tests that non-GET HTTP methods (POST, PUT, DELETE, PATCH) receive appropriate
Flask error responses (405 Method Not Allowed) since the route decorators at
app.py lines 29-30 only register GET handlers. Also tests HEAD method behavior
(returns headers without body as per Flask's automatic HEAD support for GET
routes) and OPTIONS method behavior (Flask auto-generates an Allow header
listing permitted methods).

Uses the ``client`` fixture from conftest.py via pytest's automatic fixture
injection.  Every test function is standalone (no test classes) following
standard pytest conventions adopted for this repository.
"""

import pytest


# ---------------------------------------------------------------------------
# Individual unsupported HTTP method tests (each returns 405 Method Not Allowed)
# ---------------------------------------------------------------------------

def test_post_method_not_allowed(client):
    """Verify that POST / returns 405 Method Not Allowed.

    The route decorators in app.py (lines 29-30) only register GET handlers.
    Sending a POST request to the root path must be rejected by Flask with a
    405 status code indicating the method is not allowed for this endpoint.
    """
    response = client.post('/')
    assert response.status_code == 405


def test_put_method_not_allowed(client):
    """Verify that PUT / returns 405 Method Not Allowed.

    PUT is not among the allowed HTTP methods for the catch-all route defined
    in app.py.  Flask's routing layer intercepts the request before it reaches
    the ``hello`` handler and returns a 405 response.
    """
    response = client.put('/')
    assert response.status_code == 405


def test_delete_method_not_allowed(client):
    """Verify that DELETE / returns 405 Method Not Allowed.

    DELETE requests are not supported by the catch-all route.  Flask correctly
    rejects the request with a 405 status code rather than invoking the
    ``hello`` handler.
    """
    response = client.delete('/')
    assert response.status_code == 405


def test_patch_method_not_allowed(client):
    """Verify that PATCH / returns 405 Method Not Allowed.

    PATCH is not registered as an allowed method on the route.  The Flask
    application must respond with 405 to indicate the method is unsupported.
    """
    response = client.patch('/')
    assert response.status_code == 405


# ---------------------------------------------------------------------------
# Parametrized unsupported method test
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("method", [
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
])
def test_unsupported_methods_return_405(client, method):
    """Verify that all unsupported HTTP methods return 405 on the root path.

    This parametrized test exercises every HTTP method that is *not* registered
    on the catch-all route defined in app.py (lines 29-30).  The route only
    allows GET (plus HEAD and OPTIONS which Flask handles automatically), so
    POST, PUT, DELETE, and PATCH must all result in a 405 Method Not Allowed
    response from Flask's routing layer.

    Args:
        client: Flask test client fixture (injected from conftest.py).
        method: The HTTP method name to test (upper-case string).
    """
    response = getattr(client, method.lower())('/')
    assert response.status_code == 405


# ---------------------------------------------------------------------------
# OPTIONS method test
# ---------------------------------------------------------------------------

def test_options_method_response(client):
    """Verify that OPTIONS / returns Flask's default OPTIONS response.

    Flask automatically handles OPTIONS requests for routes by returning a
    200 response with an ``Allow`` header listing all HTTP methods that the
    endpoint supports.  For a GET-only route Flask includes GET, HEAD, and
    OPTIONS in the Allow header.
    """
    response = client.options('/')
    assert response.status_code == 200

    # Flask auto-generates an Allow header enumerating permitted methods.
    allow_header = response.headers.get('Allow', '')
    assert 'GET' in allow_header
    assert 'HEAD' in allow_header
    assert 'OPTIONS' in allow_header


# ---------------------------------------------------------------------------
# HEAD method tests (Flask auto-supports HEAD for GET routes)
# ---------------------------------------------------------------------------

def test_head_method_returns_200(client):
    """Verify that HEAD / returns HTTP 200 status code.

    Flask automatically supports the HEAD method for every route that allows
    GET.  A HEAD request is identical to GET except the server must not return
    a message body.  The status code should still be 200 OK.
    """
    response = client.head('/')
    assert response.status_code == 200


def test_head_method_returns_empty_body(client):
    """Verify that HEAD / returns an empty response body.

    Per the HTTP/1.1 specification (RFC 7231 Section 4.3.2), a HEAD response
    must not include a message body.  Flask's test client enforces this by
    returning ``b''`` as the response data for HEAD requests.
    """
    response = client.head('/')
    assert response.data == b''


def test_head_method_has_content_type(client):
    """Verify that HEAD / still includes the Content-Type header.

    Even though the body is empty for a HEAD response, the server should
    return the same headers that a GET request would produce — including
    ``Content-Type: text/plain`` as specified in app.py line 52.
    """
    response = client.head('/')
    assert 'Content-Type' in response.headers
    assert 'text/plain' in response.headers['Content-Type']


# ---------------------------------------------------------------------------
# Error responses on subpaths
# ---------------------------------------------------------------------------

def test_post_to_subpath_not_allowed(client):
    """Verify that POST /some/path returns 405 Method Not Allowed.

    The catch-all ``/<path:path>`` route in app.py (line 30) only registers
    the GET method.  Sending POST to an arbitrary subpath must be rejected
    with a 405 status code, confirming the method restriction applies to all
    matched paths — not only the root.
    """
    response = client.post('/some/path')
    assert response.status_code == 405


def test_put_to_subpath_not_allowed(client):
    """Verify that PUT /any/nested/path returns 405 Method Not Allowed.

    Similar to the root path, deeply nested subpaths captured by the
    ``/<path:path>`` converter must also reject unsupported HTTP methods
    with a 405 response.
    """
    response = client.put('/any/nested/path')
    assert response.status_code == 405
