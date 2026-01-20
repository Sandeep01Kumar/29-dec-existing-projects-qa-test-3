/**
 * Comprehensive Test Suite for Production-Ready HTTP Server
 * 
 * Tests all 9 key functionality areas:
 * 1. GET / returns 200 OK with Hello World
 * 2. HEAD / returns 200 with no body
 * 3. OPTIONS / returns 204 with Allow header
 * 4. POST / returns 405 Method Not Allowed
 * 5. PUT / returns 405 Method Not Allowed
 * 6. DELETE / returns 405 Method Not Allowed
 * 7. Path traversal with ".." returns 400 Bad Request
 * 8. GET /anything returns 200 OK
 * 9. Server handles concurrent requests
 * 
 * @module server.test
 */

const http = require('http');

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_PORT = 3001;  // Use different port to avoid conflicts
const TEST_HOSTNAME = '127.0.0.1';
const TEST_TIMEOUT = 10000;  // 10 seconds timeout for each test

// ============================================================================
// Test Results Tracking
// ============================================================================

let passed = 0;
let failed = 0;
const testResults = [];

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Makes an HTTP request and returns a promise with the response
 * @param {object} options - HTTP request options
 * @returns {Promise<{statusCode: number, headers: object, body: string}>}
 */
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timeout after ${TEST_TIMEOUT}ms`));
    }, TEST_TIMEOUT);

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        clearTimeout(timeoutId);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
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
 * Records a test result
 * @param {string} name - Test name
 * @param {boolean} success - Whether test passed
 * @param {string} [message] - Optional message for failed tests
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

// ============================================================================
// Test Server Setup
// ============================================================================

let testServer = null;

/**
 * Starts a test server on the test port
 */
function startTestServer() {
  return new Promise((resolve, reject) => {
    // Clear the require cache to get a fresh server instance
    delete require.cache[require.resolve('./server.js')];
    
    // Create a new server for testing
    const httpModule = require('http');
    const { requestHandler } = require('./server.js');
    
    testServer = httpModule.createServer(requestHandler);
    
    testServer.on('error', (err) => {
      reject(err);
    });
    
    testServer.listen(TEST_PORT, TEST_HOSTNAME, () => {
      console.log(`[Server] Server running at http://${TEST_HOSTNAME}:${TEST_PORT}/`);
      resolve();
    });
  });
}

/**
 * Stops the test server
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

// ============================================================================
// Test Cases
// ============================================================================

/**
 * Test 1: GET / returns 200 OK with Hello World
 */
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

/**
 * Test 2: HEAD / returns 200 with no body
 */
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

/**
 * Test 3: OPTIONS / returns 204 with Allow header
 */
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

/**
 * Test 4: POST / returns 405 Method Not Allowed
 */
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

/**
 * Test 5: PUT / returns 405 Method Not Allowed
 */
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

/**
 * Test 6: DELETE / returns 405 Method Not Allowed
 */
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

/**
 * Test 7: Path traversal with ".." returns 400 Bad Request
 */
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

/**
 * Test 8: GET /anything returns 200 OK
 */
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

/**
 * Test 9: Server handles concurrent requests
 */
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

// ============================================================================
// Test Runner
// ============================================================================

async function runAllTests() {
  console.log('=== Starting Test Suite ===\n');
  
  try {
    // Setup: Start test server
    await startTestServer();
    console.log('[Setup] Server started successfully\n');
    
    // Run all tests
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
    // Cleanup: Stop test server
    console.log('\n[Cleanup] Stopping server...');
    await stopTestServer();
  }
  
  // Print summary
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

// Run tests
runAllTests();
