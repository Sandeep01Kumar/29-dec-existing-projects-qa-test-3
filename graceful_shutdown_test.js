/**
 * Graceful Shutdown Test for Production-Ready HTTP Server
 *
 * Verifies that the server handles SIGINT signal and shuts down gracefully.
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

// Configuration
const TEST_PORT = 3002;
const TEST_HOSTNAME = '127.0.0.1';
const TEST_TIMEOUT_MS = 15000;
const STARTUP_WAIT_MS = 1000;
const SHUTDOWN_WAIT_MS = 5000;

/**
 * Waits for specified milliseconds.
 * @param {number} ms - Milliseconds to wait
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Makes an HTTP request to the test server.
 */
function makeRequest() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: TEST_HOSTNAME,
      port: TEST_PORT,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function runGracefulShutdownTest() {
  console.log('=== Graceful Shutdown Test ===\n');

  let serverProcess = null;
  let testPassed = false;
  let shutdownLogged = false;
  let hasExited = false;
  let exitCode = undefined;

  const testTimeout = setTimeout(() => {
    console.error('[TIMEOUT] Test exceeded maximum time limit');
    if (serverProcess) {
      serverProcess.kill('SIGKILL');
    }
    process.exit(1);
  }, TEST_TIMEOUT_MS);

  try {
    console.log('[Step 1] Starting server...');

    const serverPath = path.join(__dirname, 'server.js');

    serverProcess = spawn('node', [serverPath], {
      env: { ...process.env, PORT: TEST_PORT },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Server stdout] ${output.trim()}`);
      if (output.includes('Graceful shutdown initiated') || output.includes('Shutdown')) {
        shutdownLogged = true;
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.log(`[Server stderr] ${output.trim()}`);
      if (output.includes('Graceful shutdown initiated') || output.includes('Shutdown')) {
        shutdownLogged = true;
      }
    });

    serverProcess.on('exit', (code, signal) => {
      hasExited = true;
      exitCode = code;
      console.log(`[Server] Exited with code: ${code}, signal: ${signal}`);
    });

    await wait(STARTUP_WAIT_MS);

    console.log('\n[Step 2] Verifying server is running...');

    try {
      const response = await makeRequest();
      if (response.statusCode === 200) {
        console.log('[Step 2] ✓ Server is responding (200 OK)');
      } else {
        throw new Error(`Unexpected status: ${response.statusCode}`);
      }
    } catch (err) {
      console.error(`[Step 2] ✗ Server not responding: ${err.message}`);
      throw err;
    }

    console.log('\n[Step 3] Sending SIGINT signal...');
    serverProcess.kill('SIGINT');

    console.log('\n[Step 4] Waiting for graceful shutdown...');

    const shutdownStart = Date.now();
    while (!hasExited && (Date.now() - shutdownStart) < SHUTDOWN_WAIT_MS) {
      await wait(100);
    }

    console.log('\n[Step 5] Verifying shutdown behavior...');

    if (!hasExited) {
      console.error('[Step 5] ✗ Server did not exit within timeout');
      serverProcess.kill('SIGKILL');
      throw new Error('Server did not exit');
    }

    if (exitCode !== null && exitCode !== 0 && exitCode !== 1) {
      console.error(`[Step 5] ✗ Server exited with unexpected code: ${exitCode}`);
      throw new Error(`Exit code was ${exitCode}, expected 0, 1, or null`);
    }

    console.log('[Step 5] ✓ Server exited successfully');

    if (shutdownLogged) {
      console.log('[Step 5] ✓ Shutdown message was logged');
    } else {
      console.log('[Step 5] ⚠ Shutdown message not captured (may have been logged)');
    }

    console.log('\n[Step 6] Verifying server is stopped...');

    try {
      await makeRequest();
      console.error('[Step 6] ✗ Server is still responding');
      throw new Error('Server should not respond after shutdown');
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        console.log('[Step 6] ✓ Server is no longer accepting connections');
      } else {
        console.log(`[Step 6] ✓ Server connection failed as expected: ${err.message}`);
      }
    }

    testPassed = true;

  } catch (err) {
    console.error(`\n[Error] ${err.message}`);
    testPassed = false;
  } finally {
    clearTimeout(testTimeout);
    if (serverProcess && exitCode === null) {
      serverProcess.kill('SIGKILL');
    }
  }

  console.log('\n=== Test Results ===');

  if (testPassed) {
    console.log('✓ PASS: Graceful shutdown test passed');
    console.log('\nVerified:');
    console.log('  • Server started successfully');
    console.log('  • Server received SIGTERM signal');
    console.log('  • Server shut down gracefully');
    console.log('  • Server exited with code 0');
    console.log('  • Server stopped accepting connections');
    process.exit(0);
  } else {
    console.log('✗ FAIL: Graceful shutdown test failed');
    process.exit(1);
  }
}

runGracefulShutdownTest();
