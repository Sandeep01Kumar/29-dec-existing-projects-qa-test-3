"""
Unit tests for server configuration constants and Flask application instance.

Validates that HOST equals '127.0.0.1', PORT equals 3000, the app is a Flask
instance, and that app.run() receives correct host and port parameters when
invoked through the __main__ block. Uses unittest.mock.patch to intercept
app.run() without binding a network port.

Test module: tests/test_server_config.py
Source under test: app.py (lines 22-26, 55-60)
"""

import runpy
from unittest.mock import patch

import pytest
from flask import Flask

from app import HOST, PORT, app


class TestConfigurationConstants:
    """Tests verifying server configuration constant values and types.

    Validates the HOST and PORT constants defined at app.py lines 22-23
    are set to their expected values with correct data types for server
    binding configuration.
    """

    def test_host_is_localhost(self):
        """Verify HOST constant equals '127.0.0.1' (app.py line 22).

        The HOST constant must be set to the IPv4 loopback address to
        ensure the server binds to localhost only, matching the original
        Node.js server behavior: const hostname = '127.0.0.1'.
        """
        assert HOST == '127.0.0.1'

    def test_port_is_3000(self):
        """Verify PORT constant equals 3000 (app.py line 23).

        The PORT constant must be set to 3000 to match the original
        Node.js server behavior: const port = 3000.
        """
        assert PORT == 3000

    def test_port_is_integer(self):
        """Verify PORT is an integer type, not a string representation.

        Flask's app.run(port=...) requires an integer for the port
        parameter. A string value would cause a runtime error.
        """
        assert isinstance(PORT, int)

    def test_host_is_string(self):
        """Verify HOST is a string type.

        Flask's app.run(host=...) requires a string for the host
        parameter. A non-string value would cause a runtime error.
        """
        assert isinstance(HOST, str)

    @pytest.mark.parametrize("constant_value,expected,expected_type", [
        (HOST, '127.0.0.1', str),
        (PORT, 3000, int),
    ], ids=['HOST-127.0.0.1-str', 'PORT-3000-int'])
    def test_config_constant_value_and_type(self, constant_value, expected, expected_type):
        """Verify each configuration constant has the correct value and type.

        Uses parametrize to validate both HOST and PORT constants in a
        data-driven manner, ensuring consistent validation across all
        server configuration values defined at app.py lines 22-23.

        Args:
            constant_value: The actual value of the configuration constant.
            expected: The expected value to compare against.
            expected_type: The expected Python type of the constant.
        """
        assert constant_value == expected, (
            f"Configuration constant expected {expected!r}, got {constant_value!r}"
        )
        assert isinstance(constant_value, expected_type), (
            f"Configuration constant expected type {expected_type.__name__}, "
            f"got {type(constant_value).__name__}"
        )


class TestFlaskAppInstance:
    """Tests verifying Flask application instance properties.

    Validates the Flask app created at app.py line 26 is properly
    configured with the correct name and has all expected URL rules
    registered by the route decorators at app.py lines 29-30.
    """

    def test_app_is_flask_instance(self):
        """Verify app is an instance of Flask (app.py line 26).

        The app variable must be a Flask instance created via
        Flask(__name__), matching the original Node.js pattern of
        http.createServer(callback).
        """
        assert isinstance(app, Flask)

    def test_app_name_matches_module(self):
        """Verify app.name matches the 'app' module name.

        Flask(__name__) sets the application name to the module's __name__,
        which is 'app' when imported from app.py. This ensures the Flask
        app was created with the correct module reference.
        """
        assert app.name == 'app'

    def test_app_has_route_for_root(self):
        """Verify the '/' route is registered in the Flask app's URL rules.

        The root route is defined at app.py line 29 using the decorator
        @app.route('/', defaults={'path': ''}) which ensures the root
        path maps to the hello(path) handler.
        """
        rules = [rule.rule for rule in app.url_map.iter_rules()]
        assert '/' in rules

    def test_app_has_catch_all_route(self):
        """Verify the '/<path:path>' catch-all route is registered.

        The catch-all route is defined at app.py line 30 using the
        decorator @app.route('/<path:path>') which captures any URL
        path and passes it to the hello(path) handler.
        """
        rules = [rule.rule for rule in app.url_map.iter_rules()]
        assert '/<path:path>' in rules

    @pytest.mark.parametrize("expected_route", [
        '/',
        '/<path:path>',
    ], ids=['root-path', 'catch-all-path'])
    def test_app_has_expected_route(self, expected_route):
        """Verify each expected route is registered in the Flask app's URL rules.

        Parametrized to validate both the root '/' route and the catch-all
        '/<path:path>' route are properly registered by the dual decorators
        at app.py lines 29-30. Together these routes ensure every possible
        URL path is handled by the hello(path) function.

        Args:
            expected_route: The URL rule pattern expected to be registered.
        """
        rules = [rule.rule for rule in app.url_map.iter_rules()]
        assert expected_route in rules, (
            f"Route '{expected_route}' not found in registered URL rules: {rules}"
        )


class TestServerStartup:
    """Tests verifying app.run() startup configuration via __main__ guard.

    Uses patch on Flask.run at the class level so that when runpy.run_module
    re-executes app.py as __main__, the newly created Flask instance's run()
    method is intercepted, preventing actual network port binding while
    allowing assertion on call arguments.

    Tests target app.py lines 55-60 (__main__ guard block):
        if __name__ == '__main__':
            app.run(host=HOST, port=PORT)
    """

    @patch('flask.Flask.run')
    def test_app_run_called_with_correct_params(self, mock_run):
        """Verify app.run() is called with host='127.0.0.1' and port=3000.

        Uses runpy.run_module to execute app.py with __name__='__main__',
        triggering the __main__ guard block at app.py lines 55-60. The
        Flask.run method is patched at the class level to intercept the
        call without actually binding a network port.
        """
        runpy.run_module('app', run_name='__main__', alter_sys=False)
        mock_run.assert_called_once_with(host='127.0.0.1', port=3000)

    @patch('flask.Flask.run')
    def test_app_run_uses_host_constant(self, mock_run):
        """Verify the host parameter passed to app.run() matches the HOST constant.

        Ensures the __main__ block uses the HOST constant ('127.0.0.1')
        rather than a hardcoded value for the server bind address. This
        validates the indirection through the HOST variable at app.py line 60.
        """
        runpy.run_module('app', run_name='__main__', alter_sys=False)
        call_kwargs = mock_run.call_args
        assert call_kwargs[1].get('host') == HOST, (
            f"app.run() host parameter expected '{HOST}', "
            f"got '{call_kwargs[1].get('host')}'"
        )

    @patch('flask.Flask.run')
    def test_app_run_uses_port_constant(self, mock_run):
        """Verify the port parameter passed to app.run() matches the PORT constant.

        Ensures the __main__ block uses the PORT constant (3000) rather than
        a hardcoded value for the server listen port. This validates the
        indirection through the PORT variable at app.py line 60.
        """
        runpy.run_module('app', run_name='__main__', alter_sys=False)
        call_kwargs = mock_run.call_args
        assert call_kwargs[1].get('port') == PORT, (
            f"app.run() port parameter expected {PORT}, "
            f"got {call_kwargs[1].get('port')}"
        )
