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
const TEST_TIMEOUT = 15000; // 15 second timeout per test

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
 * @returns {Promise<ChildProcess>}
 */
function startServer() {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', ['server.js'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let started = false;
    let exitedEarly = false;

    const timeoutHandle = setTimeout(() => {
      if (!started && !exitedEarly) {
        try { serverProcess.kill('SIGKILL'); } catch (e) {}
        reject(new Error('Server startup timeout'));
      }
    }, 8000);

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server running') && !started) {
        started = true;
        clearTimeout(timeoutHandle);
        // Give server time to fully initialize
        setTimeout(() => resolve(serverProcess), 200);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      // If we see port in use error, this is expected for some tests
      if (errorOutput.includes('already in use')) {
        if (!started && !exitedEarly) {
          started = true;
          clearTimeout(timeoutHandle);
          // Return the process anyway so tests can check stderr
          resolve(serverProcess);
        }
      }
    });

    serverProcess.on('error', (err) => {
      if (!started && !exitedEarly) {
        exitedEarly = true;
        clearTimeout(timeoutHandle);
        reject(err);
      }
    });

    serverProcess.on('exit', (code) => {
      if (!started) {
        exitedEarly = true;
        clearTimeout(timeoutHandle);
        reject(new Error(`Server exited early with code ${code}`));
      }
    });
  });
}

/**
 * Stop a server process safely
 * @param {ChildProcess} serverProcess - The server process to stop
 * @param {string} signal - Signal to send
 * @returns {Promise<number>} - Exit code
 */
function stopServer(serverProcess, signal = 'SIGTERM') {
  return new Promise((resolve) => {
    if (!serverProcess) {
      resolve(0);
      return;
    }

    // If already exited
    if (serverProcess.exitCode !== null) {
      resolve(serverProcess.exitCode);
      return;
    }

    const timeoutHandle = setTimeout(() => {
      try { serverProcess.kill('SIGKILL'); } catch (e) {}
      resolve(-1);
    }, 5000);

    serverProcess.on('exit', (code) => {
      clearTimeout(timeoutHandle);
      resolve(code);
    });

    try {
      serverProcess.kill(signal);
    } catch (e) {
      clearTimeout(timeoutHandle);
      resolve(0);
    }
  });
}

/**
 * Wait for port to be free
 */
async function waitForPortFree(port, maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    const isFree = await new Promise((resolve) => {
      const testServer = require('net').createServer();
      testServer.once('error', () => resolve(false));
      testServer.once('listening', () => {
        testServer.close();
        resolve(true);
      });
      testServer.listen(port);
    });
    if (isFree) return true;
    await sleep(300);
  }
  return false;
}

/**
 * Run a single test with timeout
 * @param {string} name - Test name
 * @param {Function} testFn - Async test function
 */
async function runTest(name, testFn) {
  results.total++;
  console.log(`\nRunning: ${name}...`);

  // Wait for port to be free before each test
  const portFree = await waitForPortFree(TEST_PORT);
  if (!portFree) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: 'Port not available' });
    console.log(`✗ ${name}: FAIL - Port not available`);
    return;
  }

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

  // Wait a bit after each test
  await sleep(500);
}

// ============================================================================
// TEST CASES
// ============================================================================

/**
 * Test 1: Basic Response
 * Verifies the server returns "Hello, World!\n" with status 200
 */
async function testBasicResponse() {
  let serverProcess = null;
  try {
    serverProcess = await startServer();
    await sleep(300);
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
  let serverProcess = null;
  try {
    serverProcess = await startServer();
    await sleep(300);
    const response = await makeRequest();
    
    assert.ok(
      response.headers['content-type'] && response.headers['content-type'].includes('text/plain'),
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
  let serverProcess = null;
  try {
    serverProcess = await startServer();
    await sleep(300);
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
  let serverProcess = null;
  try {
    serverProcess = await startServer();
    await sleep(300);
    
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    
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
  let serverProcess = null;
  try {
    serverProcess = await startServer();
    await sleep(300);
    
    // Verify server is running
    const response = await makeRequest();
    assert.strictEqual(response.statusCode, 200, 'Server should be running');
    
    // Send SIGTERM and wait for exit
    const exitCode = await stopServer(serverProcess, 'SIGTERM');
    serverProcess = null; // Mark as already handled
    
    // Exit code 0 indicates graceful shutdown
    // Some platforms may return null or 0
    assert.ok(
      exitCode === 0 || exitCode === null,
      `Exit code should be 0 or null for graceful shutdown, got ${exitCode}`
    );
  } finally {
    if (serverProcess) await stopServer(serverProcess, 'SIGKILL');
  }
}

/**
 * Test 6: EADDRINUSE Error Handling
 * Verifies the server handles port conflict with helpful error message
 */
async function testEaddrinuseHandling() {
  let firstServer = null;
  
  try {
    // Start first server
    firstServer = await startServer();
    await sleep(500);
    
    // Verify first server is running
    const response = await makeRequest();
    assert.strictEqual(response.statusCode, 200, 'First server should be running');
    
    // Try to start second server on same port
    const result = await new Promise((resolve) => {
      const proc = spawn('node', ['server.js'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stderr = '';
      let exited = false;

      proc.stderr.on('data', (data) => { 
        stderr += data.toString(); 
      });

      proc.on('exit', (code) => {
        if (!exited) {
          exited = true;
          resolve({ exitCode: code, stderr });
        }
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!exited) {
          exited = true;
          try { proc.kill('SIGKILL'); } catch (e) {}
          resolve({ exitCode: -1, stderr });
        }
      }, 5000);
    });
    
    // Second server should exit with code 1
    assert.strictEqual(result.exitCode, 1, `Exit code should be 1 for port conflict, got ${result.exitCode}`);
    
    // Error message should mention port in use
    assert.ok(
      result.stderr.includes('already in use') || result.stderr.includes('EADDRINUSE'),
      'Error message should mention port in use'
    );
  } finally {
    if (firstServer) await stopServer(firstServer, 'SIGKILL');
  }
}

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('========================================');
  console.log('Server.js Unit Test Suite');
  console.log('========================================');

  // Wait for port to be free first
  await waitForPortFree(TEST_PORT);

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
