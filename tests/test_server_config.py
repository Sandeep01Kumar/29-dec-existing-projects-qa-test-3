"""
Unit tests for server configuration constants and Flask application instance.

Validates that HOST equals '127.0.0.1', PORT equals 3000, the app is a Flask
instance, and that app.run() receives correct host and port parameters when
invoked through the __main__ block. Uses unittest.mock.patch to intercept
app.run() without binding a network port.
"""

import runpy
from unittest.mock import patch

import pytest
from flask import Flask

from app import HOST, PORT, app


class TestConfigurationConstants:
    """Tests verifying server configuration constant values."""

    def test_host_is_localhost(self):
        """Verify HOST constant equals '127.0.0.1' (app.py line 22)."""
        assert HOST == '127.0.0.1'

    def test_port_is_3000(self):
        """Verify PORT constant equals 3000 (app.py line 23)."""
        assert PORT == 3000

    def test_port_is_integer(self):
        """Verify PORT is an integer type, not a string."""
        assert isinstance(PORT, int)

    def test_host_is_string(self):
        """Verify HOST is a string type."""
        assert isinstance(HOST, str)


class TestFlaskAppInstance:
    """Tests verifying Flask application instance properties."""

    def test_app_is_flask_instance(self):
        """Verify app is an instance of Flask (app.py line 26)."""
        assert isinstance(app, Flask)

    def test_app_name_matches_module(self):
        """Verify app.name matches the 'app' module name (Flask(__name__) convention)."""
        assert app.name == 'app'

    def test_app_has_route_for_root(self):
        """Verify the '/' route is registered in the Flask app's URL rules."""
        rules = [rule.rule for rule in app.url_map.iter_rules()]
        assert '/' in rules

    def test_app_has_catch_all_route(self):
        """Verify the '/<path:path>' catch-all route is registered."""
        rules = [rule.rule for rule in app.url_map.iter_rules()]
        assert '/<path:path>' in rules


class TestServerStartup:
    """Tests verifying app.run() startup configuration via __main__ guard.

    Uses patch on Flask.run at the class level so that when runpy.run_module
    re-executes app.py as __main__, the newly created Flask instance's run()
    method is intercepted, preventing actual network port binding.
    """

    @patch('flask.Flask.run')
    def test_app_run_called_with_correct_params(self, mock_run):
        """Verify app.run() is called with host='127.0.0.1' and port=3000.

        Uses runpy.run_module to execute app.py with __name__='__main__',
        triggering the __main__ guard block at app.py lines 55-60.
        """
        runpy.run_module('app', run_name='__main__', alter_sys=False)
        mock_run.assert_called_once_with(host='127.0.0.1', port=3000)

    @patch('flask.Flask.run')
    def test_app_run_uses_host_constant(self, mock_run):
        """Verify the host parameter passed to app.run() matches the HOST constant."""
        runpy.run_module('app', run_name='__main__', alter_sys=False)
        call_kwargs = mock_run.call_args
        assert call_kwargs[1].get('host') == HOST

    @patch('flask.Flask.run')
    def test_app_run_uses_port_constant(self, mock_run):
        """Verify the port parameter passed to app.run() matches the PORT constant."""
        runpy.run_module('app', run_name='__main__', alter_sys=False)
        call_kwargs = mock_run.call_args
        assert call_kwargs[1].get('port') == PORT
