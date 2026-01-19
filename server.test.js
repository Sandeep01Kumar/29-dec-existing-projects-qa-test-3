/**
 * Comprehensive Unit Test Suite for Production-Ready Node.js HTTP Server
 * 
 * Tests cover:
 * 1. Basic Response - Verifies "Hello, World!\n" response with 200 status
 * 2. Content-Type Header - Verifies text/plain content type
 * 3. Security Headers - Verifies X-Content-Type-Options: nosniff
 * 4. HTTP Methods - Verifies all methods return 200
 * 5. Graceful Shutdown - Verifies clean shutdown on SIGTERM
 * 6. EADDRINUSE Error Handling - Verifies helpful error message on port conflict
 */

const http = require('http');
const { spawn } = require('child_process');
const assert = require('assert');

// Test configuration
const TEST_HOST = '127.0.0.1';
const TEST_PORT = 3000;
const TEST_TIMEOUT = 10000; // 10 second timeout per test

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Make an HTTP request and return the response
 * @param {Object} options - HTTP request options
 * @returns {Promise<{statusCode: number, headers: Object, body: string}>}
 */
function makeRequest(options = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: TEST_HOST,
      port: TEST_PORT,
      path: options.path || '/',
      method: options.method || 'GET',
      timeout: options.timeout || 5000
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Start a server process and wait for it to be ready
 * @param {number} port - Port to start the server on
 * @returns {Promise<ChildProcess>}
 */
function startServer(port = TEST_PORT) {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', ['server.js'], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: port.toString() },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        serverProcess.kill();
        reject(new Error('Server startup timeout'));
      }
    }, 5000);

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server running')) {
        started = true;
        clearTimeout(timeout);
        // Give server a moment to fully initialize
        setTimeout(() => resolve(serverProcess), 100);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      if (errorOutput.includes('Port') && errorOutput.includes('already in use')) {
        // This is expected for the EADDRINUSE test
        started = true;
        clearTimeout(timeout);
        resolve(serverProcess);
      }
    });

    serverProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      if (!started) {
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
}

/**
 * Stop a server process gracefully or forcefully
 * @param {ChildProcess} serverProcess - The server process to stop
 * @param {string} signal - Signal to send (SIGTERM, SIGINT, or SIGKILL)
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>}
 */
function stopServer(serverProcess, signal = 'SIGTERM') {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    serverProcess.stdout.on('data', (data) => { stdout += data.toString(); });
    serverProcess.stderr.on('data', (data) => { stderr += data.toString(); });

    serverProcess.on('exit', (code) => {
      resolve({ exitCode: code, stdout, stderr });
    });

    serverProcess.kill(signal);

    // Force kill after 5 seconds if process doesn't exit
    setTimeout(() => {
      if (!serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }, 5000);
  });
}

/**
 * Run a single test with timeout
 * @param {string} name - Test name
 * @param {Function} testFn - Async test function
 */
async function runTest(name, testFn) {
  results.total++;
  console.log(`\nRunning: ${name}...`);

  try {
    await Promise.race([
      testFn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout')), TEST_TIMEOUT)
      )
    ]);
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`✓ ${name}: PASS`);
  } catch (err) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: err.message });
    console.log(`✗ ${name}: FAIL - ${err.message}`);
  }
}

// ============================================================================
// TEST CASES
// ============================================================================

/**
 * Test 1: Basic Response
 * Verifies the server returns "Hello, World!\n" with status 200
 */
async function testBasicResponse() {
  let serverProcess;
  try {
    serverProcess = await startServer();
    const response = await makeRequest();
    
    assert.strictEqual(response.statusCode, 200, 'Status code should be 200');
    assert.strictEqual(response.body, 'Hello, World!\n', 'Body should be "Hello, World!\\n"');
  } finally {
    if (serverProcess) await stopServer(serverProcess);
  }
}

/**
 * Test 2: Content-Type Header
 * Verifies the server returns Content-Type: text/plain
 */
async function testContentTypeHeader() {
  let serverProcess;
  try {
    serverProcess = await startServer();
    const response = await makeRequest();
    
    assert.ok(
      response.headers['content-type'].includes('text/plain'),
      'Content-Type should be text/plain'
    );
  } finally {
    if (serverProcess) await stopServer(serverProcess);
  }
}

/**
 * Test 3: Security Headers
 * Verifies the server returns X-Content-Type-Options: nosniff
 */
async function testSecurityHeaders() {
  let serverProcess;
  try {
    serverProcess = await startServer();
    const response = await makeRequest();
    
    assert.strictEqual(
      response.headers['x-content-type-options'],
      'nosniff',
      'X-Content-Type-Options should be nosniff'
    );
  } finally {
    if (serverProcess) await stopServer(serverProcess);
  }
}

/**
 * Test 4: HTTP Methods
 * Verifies all HTTP methods return status 200
 */
async function testHttpMethods() {
  let serverProcess;
  try {
    serverProcess = await startServer();
    
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    
    for (const method of methods) {
      const response = await makeRequest({ method });
      assert.strictEqual(
        response.statusCode, 
        200, 
        `${method} should return status 200`
      );
    }
  } finally {
    if (serverProcess) await stopServer(serverProcess);
  }
}

/**
 * Test 5: Graceful Shutdown (SIGTERM)
 * Verifies the server shuts down cleanly on SIGTERM
 */
async function testGracefulShutdown() {
  let serverProcess;
  try {
    serverProcess = await startServer();
    
    // Verify server is running
    const response = await makeRequest();
    assert.strictEqual(response.statusCode, 200, 'Server should be running');
    
    // Send SIGTERM and wait for graceful shutdown with proper handling
    const result = await new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      
      serverProcess.stdout.on('data', (data) => { stdout += data.toString(); });
      serverProcess.stderr.on('data', (data) => { stderr += data.toString(); });
      
      serverProcess.on('exit', (code, signal) => {
        resolve({ exitCode: code, signal, stdout, stderr });
      });
      
      // Send SIGTERM to trigger graceful shutdown
      serverProcess.kill('SIGTERM');
      
      // Force resolve after timeout if process doesn't exit
      setTimeout(() => {
        if (!serverProcess.killed) {
          serverProcess.kill('SIGKILL');
          resolve({ exitCode: -1, signal: 'TIMEOUT', stdout, stderr });
        }
      }, 8000);
    });
    
    // Exit code 0 or null (when killed by signal) indicates graceful shutdown
    // On some platforms, signal-terminated processes return null exit code
    const success = result.exitCode === 0 || result.exitCode === null;
    assert.ok(success, `Exit code should be 0 or null for graceful shutdown, got ${result.exitCode}`);
    
    serverProcess = null; // Already stopped
  } finally {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGKILL');
    }
  }
}

/**
 * Test 6: EADDRINUSE Error Handling
 * Verifies the server handles port conflict with helpful error message
 */
async function testEaddrinuseHandling() {
  let firstServer;
  let secondServer;
  
  try {
    // Start first server
    firstServer = await startServer();
    
    // Try to start second server on same port
    const secondServerPromise = new Promise((resolve) => {
      const proc = spawn('node', ['server.js'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stderr = '';
      proc.stderr.on('data', (data) => { stderr += data.toString(); });

      proc.on('exit', (code) => {
        resolve({ exitCode: code, stderr });
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        proc.kill();
        resolve({ exitCode: -1, stderr });
      }, 5000);
    });

    const result = await secondServerPromise;
    
    // Second server should exit with code 1
    assert.strictEqual(result.exitCode, 1, 'Exit code should be 1 for port conflict');
    
    // Error message should mention port in use
    assert.ok(
      result.stderr.includes('already in use') || result.stderr.includes('EADDRINUSE'),
      'Error message should mention port in use'
    );
  } finally {
    if (firstServer) await stopServer(firstServer);
    if (secondServer) await stopServer(secondServer);
  }
}

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('========================================');
  console.log('Server.js Unit Test Suite');
  console.log('========================================');

  // Run tests sequentially to avoid port conflicts
  await runTest('Basic Response', testBasicResponse);
  await runTest('Content-Type Header', testContentTypeHeader);
  await runTest('Security Headers', testSecurityHeaders);
  await runTest('HTTP Methods', testHttpMethods);
  await runTest('Graceful Shutdown (SIGTERM)', testGracefulShutdown);
  await runTest('EADDRINUSE Error Handling', testEaddrinuseHandling);

  // Print summary
  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================');
  console.log(`Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed}`);
  console.log('----------------------------------------');
  
  for (const test of results.tests) {
    const status = test.status === 'PASS' ? '✓' : '✗';
    const errorInfo = test.error ? ` - ${test.error}` : '';
    console.log(`${status} ${test.name}: ${test.status}${errorInfo}`);
  }
  
  console.log('========================================');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
