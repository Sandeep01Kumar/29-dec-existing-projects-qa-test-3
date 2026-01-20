/**
 * Comprehensive Test Suite for Production-Ready HTTP Server
 *
 * Tests 9 key functionality areas: GET, HEAD, OPTIONS support,
 * method rejection (POST/PUT/DELETE), path traversal protection,
 * routing, and concurrent request handling.
 */

const http = require('http');

// Configuration
const TEST_PORT = 3001;
const TEST_HOSTNAME = '127.0.0.1';
const TEST_TIMEOUT_MS = 10000;

// Results tracking
let passed = 0;
let failed = 0;
const testResults = [];

/**
 * Makes an HTTP request and returns a promise with the response.
 * @param {object} options - HTTP request options
 * @returns {Promise<{statusCode: number, headers: object, body: string}>}
 */
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timeout after ${TEST_TIMEOUT_MS}ms`));
    }, TEST_TIMEOUT_MS);

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        clearTimeout(timeoutId);
        resolve({ statusCode: res.statusCode, headers: res.headers, body });
      });
    });

    req.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });

    req.end();
  });
}

/**
 * Records a test result.
 * @param {string} name - Test name
 * @param {boolean} success - Whether test passed
 * @param {string} message - Optional failure message
 */
function recordResult(name, success, message = '') {
  if (success) {
    passed++;
    console.log(`✓ PASS: ${name}`);
  } else {
    failed++;
    console.log(`✗ FAIL: ${name}${message ? ` - ${message}` : ''}`);
  }
  testResults.push({ name, success, message });
}

// Test server instance
let testServer = null;

/**
 * Starts a test server on the test port.
 */
function startTestServer() {
  return new Promise((resolve, reject) => {
    delete require.cache[require.resolve('./server.js')];

    const httpModule = require('http');
    const { requestHandler } = require('./server.js');

    testServer = httpModule.createServer(requestHandler);

    testServer.on('error', reject);

    testServer.listen(TEST_PORT, TEST_HOSTNAME, () => {
      console.log(`[Server] Server running at http://${TEST_HOSTNAME}:${TEST_PORT}/`);
      resolve();
    });
  });
}

/**
 * Stops the test server.
 */
function stopTestServer() {
  return new Promise((resolve) => {
    if (testServer) {
      testServer.close(() => {
        console.log('[Cleanup] Server stopped');
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Test Cases

async function testGetRoot() {
  try {
    const response = await makeRequest({
      hostname: TEST_HOSTNAME,
      port: TEST_PORT,
      path: '/',
      method: 'GET'
    });

    const success =
      response.statusCode === 200 &&
      response.body === 'Hello, World!\n' &&
      response.headers['content-type'] === 'text/plain';

    recordResult(
      'GET / returns 200 OK with Hello World',
      success,
      success ? '' : `Got status ${response.statusCode}, body: "${response.body}"`
    );
  } catch (err) {
    recordResult('GET / returns 200 OK with Hello World', false, err.message);
  }
}

async function testHeadRoot() {
  try {
    const response = await makeRequest({
      hostname: TEST_HOSTNAME,
      port: TEST_PORT,
      path: '/',
      method: 'HEAD'
    });

    const success =
      response.statusCode === 200 &&
      response.body === '' &&
      response.headers['content-type'] === 'text/plain';

    recordResult(
      'HEAD / returns 200 with no body',
      success,
      success ? '' : `Got status ${response.statusCode}, body length: ${response.body.length}`
    );
  } catch (err) {
    recordResult('HEAD / returns 200 with no body', false, err.message);
  }
}

async function testOptionsRoot() {
  try {
    const response = await makeRequest({
      hostname: TEST_HOSTNAME,
      port: TEST_PORT,
      path: '/',
      method: 'OPTIONS'
    });

    const allowHeader = response.headers['allow'];
    const success =
      response.statusCode === 204 &&
      allowHeader &&
      allowHeader.includes('GET') &&
      allowHeader.includes('HEAD') &&
      allowHeader.includes('OPTIONS');

    recordResult(
      'OPTIONS / returns 204 with Allow header',
      success,
      success ? '' : `Got status ${response.statusCode}, Allow: "${allowHeader}"`
    );
  } catch (err) {
    recordResult('OPTIONS / returns 204 with Allow header', false, err.message);
  }
}

async function testPostRejected() {
  try {
    const response = await makeRequest({
      hostname: TEST_HOSTNAME,
      port: TEST_PORT,
      path: '/',
      method: 'POST'
    });

    const success =
      response.statusCode === 405 &&
      response.headers['allow'] &&
      response.body.includes('Method Not Allowed');

    recordResult(
      'POST / returns 405 Method Not Allowed',
      success,
      success ? '' : `Got status ${response.statusCode}`
    );
  } catch (err) {
    recordResult('POST / returns 405 Method Not Allowed', false, err.message);
  }
}

async function testPutRejected() {
  try {
    const response = await makeRequest({
      hostname: TEST_HOSTNAME,
      port: TEST_PORT,
      path: '/',
      method: 'PUT'
    });

    const success =
      response.statusCode === 405 &&
      response.headers['allow'] &&
      response.body.includes('Method Not Allowed');

    recordResult(
      'PUT / returns 405 Method Not Allowed',
      success,
      success ? '' : `Got status ${response.statusCode}`
    );
  } catch (err) {
    recordResult('PUT / returns 405 Method Not Allowed', false, err.message);
  }
}

async function testDeleteRejected() {
  try {
    const response = await makeRequest({
      hostname: TEST_HOSTNAME,
      port: TEST_PORT,
      path: '/',
      method: 'DELETE'
    });

    const success =
      response.statusCode === 405 &&
      response.headers['allow'] &&
      response.body.includes('Method Not Allowed');

    recordResult(
      'DELETE / returns 405 Method Not Allowed',
      success,
      success ? '' : `Got status ${response.statusCode}`
    );
  } catch (err) {
    recordResult('DELETE / returns 405 Method Not Allowed', false, err.message);
  }
}

async function testPathTraversalRejected() {
  try {
    const response = await makeRequest({
      hostname: TEST_HOSTNAME,
      port: TEST_PORT,
      path: '/../../../etc/passwd',
      method: 'GET'
    });

    const success =
      response.statusCode === 400 &&
      response.body.includes('Bad Request');

    recordResult(
      'Path traversal with ".." returns 400 Bad Request',
      success,
      success ? '' : `Got status ${response.statusCode}, body: "${response.body}"`
    );
  } catch (err) {
    recordResult('Path traversal with ".." returns 400 Bad Request', false, err.message);
  }
}

async function testGetAnyPath() {
  try {
    const response = await makeRequest({
      hostname: TEST_HOSTNAME,
      port: TEST_PORT,
      path: '/anything',
      method: 'GET'
    });

    const success =
      response.statusCode === 200 &&
      response.body === 'Hello, World!\n';

    recordResult(
      'GET /anything returns 200 OK',
      success,
      success ? '' : `Got status ${response.statusCode}`
    );
  } catch (err) {
    recordResult('GET /anything returns 200 OK', false, err.message);
  }
}

async function testConcurrentRequests() {
  try {
    const concurrentCount = 5;
    const promises = [];

    for (let i = 0; i < concurrentCount; i++) {
      promises.push(makeRequest({
        hostname: TEST_HOSTNAME,
        port: TEST_PORT,
        path: '/',
        method: 'GET'
      }));
    }

    const responses = await Promise.all(promises);
    const allSuccessful = responses.every(
      (res) => res.statusCode === 200 && res.body === 'Hello, World!\n'
    );

    recordResult(
      'Server handles concurrent requests',
      allSuccessful,
      allSuccessful ? '' : 'Some concurrent requests failed'
    );
  } catch (err) {
    recordResult('Server handles concurrent requests', false, err.message);
  }
}

// Test Runner

async function runAllTests() {
  console.log('=== Starting Test Suite ===\n');

  try {
    await startTestServer();
    console.log('[Setup] Server started successfully\n');

    await testGetRoot();
    await testHeadRoot();
    await testOptionsRoot();
    await testPostRejected();
    await testPutRejected();
    await testDeleteRejected();
    await testPathTraversalRejected();
    await testGetAnyPath();
    await testConcurrentRequests();

  } catch (err) {
    console.error(`[Error] Test setup failed: ${err.message}`);
    failed++;
  } finally {
    console.log('\n[Cleanup] Stopping server...');
    await stopTestServer();
  }

  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);

  if (failed === 0) {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed.');
    process.exit(1);
  }
}

runAllTests();
