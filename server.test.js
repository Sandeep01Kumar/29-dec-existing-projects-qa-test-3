/**
 * Comprehensive Unit Test Suite for server.js
 * Tests server response correctness, graceful shutdown behavior,
 * EADDRINUSE error handling, and request logging functionality.
 * Uses Node.js built-in modules only (no external test frameworks).
 */
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

// Test configuration
const SERVER_PATH = path.join(__dirname, 'server.js');
const HOSTNAME = '127.0.0.1';
const PORT = 3000;
const SERVER_URL = `http://${HOSTNAME}:${PORT}/`;

// Test result tracking
let passedTests = 0;
let failedTests = 0;
const testResults = [];

/**
 * Helper function to log test results
 * @param {string} testName - Name of the test
 * @param {boolean} passed - Whether the test passed
 * @param {string} message - Additional message
 */
function logTestResult(testName, passed, message) {
  const symbol = passed ? '✓' : '✗';
  const result = `  ${symbol} ${message}`;
  console.log(result);
  testResults.push({ testName, passed, message });
  if (passed) {
    passedTests++;
  } else {
    failedTests++;
  }
}

/**
 * Helper function to spawn server process
 * @returns {ChildProcess} The spawned server process
 */
function spawnServer() {
  const serverProcess = spawn('node', [SERVER_PATH], {
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: false
  });
  return serverProcess;
}

/**
 * Helper function to wait for server to start
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after timeout
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper function to make HTTP GET request
 * @param {string} url - URL to request
 * @returns {Promise<{statusCode: number, body: string}>}
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    }).on('error', reject);
  });
}

/**
 * Helper function to capture stdout from a process
 * @param {ChildProcess} proc - The process to capture from
 * @returns {string[]} Array of stdout lines
 */
function captureStdout(proc) {
  const lines = [];
  proc.stdout.on('data', (data) => {
    lines.push(data.toString());
  });
  return lines;
}

/**
 * Helper function to capture stderr from a process
 * @param {ChildProcess} proc - The process to capture from
 * @returns {string[]} Array of stderr lines
 */
function captureStderr(proc) {
  const lines = [];
  proc.stderr.on('data', (data) => {
    lines.push(data.toString());
  });
  return lines;
}

/**
 * Test 1: Server starts and responds correctly
 */
async function test1_ServerRespondsCorrectly() {
  console.log('\nTest 1: Server starts and responds correctly');
  
  const server = spawnServer();
  const stdoutLines = captureStdout(server);
  
  try {
    // Wait for server to start
    await wait(2000);
    
    // Make HTTP request
    const response = await httpGet(SERVER_URL);
    
    // Verify status code
    const statusCodePassed = response.statusCode === 200;
    logTestResult('Test 1', statusCodePassed, 
      statusCodePassed ? 'Server responds with status 200' : `Expected status 200, got ${response.statusCode}`);
    
    // Verify response body
    const bodyPassed = response.body === 'Hello, World!\n';
    logTestResult('Test 1', bodyPassed, 
      bodyPassed ? 'Response body is correct' : `Expected "Hello, World!\\n", got "${response.body}"`);
    
  } catch (error) {
    logTestResult('Test 1', false, `Error: ${error.message}`);
  } finally {
    server.kill('SIGTERM');
    await wait(500);
  }
}

/**
 * Test 2: Graceful shutdown on SIGTERM
 */
async function test2_GracefulShutdownSIGTERM() {
  console.log('\nTest 2: Graceful shutdown on SIGTERM');
  
  const server = spawnServer();
  const stdoutLines = captureStdout(server);
  
  try {
    // Wait for server to start
    await wait(2000);
    
    // Create promise to wait for exit
    const exitPromise = new Promise((resolve) => {
      server.on('exit', (code) => {
        resolve(code);
      });
    });
    
    // Send SIGTERM
    server.kill('SIGTERM');
    
    // Wait for exit with timeout
    const exitCode = await Promise.race([
      exitPromise,
      wait(5000).then(() => 'timeout')
    ]);
    
    // Verify shutdown was triggered
    const shutdownTriggered = exitCode !== 'timeout';
    logTestResult('Test 2', shutdownTriggered, 
      shutdownTriggered ? 'SIGTERM triggers graceful shutdown' : 'Server did not shutdown within timeout');
    
    // Verify exit code
    const exitCodeCorrect = exitCode === 0;
    logTestResult('Test 2', exitCodeCorrect, 
      exitCodeCorrect ? 'Exit code is 0' : `Expected exit code 0, got ${exitCode}`);
    
  } catch (error) {
    logTestResult('Test 2', false, `Error: ${error.message}`);
    server.kill('SIGKILL');
  }
}

/**
 * Test 3: Graceful shutdown on SIGINT
 */
async function test3_GracefulShutdownSIGINT() {
  console.log('\nTest 3: Graceful shutdown on SIGINT');
  
  const server = spawnServer();
  const stdoutLines = captureStdout(server);
  
  try {
    // Wait for server to start
    await wait(2000);
    
    // Create promise to wait for exit
    const exitPromise = new Promise((resolve) => {
      server.on('exit', (code) => {
        resolve(code);
      });
    });
    
    // Send SIGINT
    server.kill('SIGINT');
    
    // Wait for exit with timeout
    const exitCode = await Promise.race([
      exitPromise,
      wait(5000).then(() => 'timeout')
    ]);
    
    // Verify shutdown was triggered
    const shutdownTriggered = exitCode !== 'timeout';
    logTestResult('Test 3', shutdownTriggered, 
      shutdownTriggered ? 'SIGINT triggers graceful shutdown' : 'Server did not shutdown within timeout');
    
    // Verify exit code
    const exitCodeCorrect = exitCode === 0;
    logTestResult('Test 3', exitCodeCorrect, 
      exitCodeCorrect ? 'Exit code is 0' : `Expected exit code 0, got ${exitCode}`);
    
  } catch (error) {
    logTestResult('Test 3', false, `Error: ${error.message}`);
    server.kill('SIGKILL');
  }
}

/**
 * Test 4: EADDRINUSE error handling
 */
async function test4_EADDRINUSEErrorHandling() {
  console.log('\nTest 4: EADDRINUSE error handling');
  
  const server1 = spawnServer();
  let server2 = null;
  
  try {
    // Wait for first server to start
    await wait(2000);
    
    // Spawn second server (should fail)
    server2 = spawnServer();
    const stderrLines = captureStderr(server2);
    
    // Create promise to wait for second server exit
    const exitPromise = new Promise((resolve) => {
      server2.on('exit', (code) => {
        resolve({ code, stderr: stderrLines.join('') });
      });
    });
    
    // Wait for exit with timeout
    const result = await Promise.race([
      exitPromise,
      wait(5000).then(() => ({ code: 'timeout', stderr: '' }))
    ]);
    
    // Verify error was handled
    const errorHandled = result.code !== 'timeout' && 
      (result.stderr.includes('EADDRINUSE') || result.stderr.includes('already in use'));
    logTestResult('Test 4', errorHandled, 
      errorHandled ? 'EADDRINUSE error is handled' : 'Error was not properly handled');
    
    // Verify exit code is 1
    const exitCodeCorrect = result.code === 1;
    logTestResult('Test 4', exitCodeCorrect, 
      exitCodeCorrect ? 'Exit code is 1 on error' : `Expected exit code 1, got ${result.code}`);
    
  } catch (error) {
    logTestResult('Test 4', false, `Error: ${error.message}`);
  } finally {
    server1.kill('SIGTERM');
    if (server2) {
      server2.kill('SIGKILL');
    }
    await wait(500);
  }
}

/**
 * Test 5: Request logging
 */
async function test5_RequestLogging() {
  console.log('\nTest 5: Request logging');
  
  const server = spawnServer();
  const stdoutLines = captureStdout(server);
  
  try {
    // Wait for server to start
    await wait(2000);
    
    // Make HTTP request
    await httpGet(SERVER_URL);
    
    // Wait a bit for logging
    await wait(500);
    
    // Check stdout for request log
    const combinedOutput = stdoutLines.join('');
    const hasTimestamp = combinedOutput.includes('[') && combinedOutput.includes(']');
    const hasMethod = combinedOutput.includes('GET');
    const hasPath = combinedOutput.includes('/');
    
    const loggingWorks = hasTimestamp && hasMethod && hasPath;
    logTestResult('Test 5', loggingWorks, 
      loggingWorks ? 'Request logging works' : 'Request logging is incomplete or missing');
    
  } catch (error) {
    logTestResult('Test 5', false, `Error: ${error.message}`);
  } finally {
    server.kill('SIGTERM');
    await wait(500);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('=== Server.js Unit Tests ===');
  
  try {
    await test1_ServerRespondsCorrectly();
    await test2_GracefulShutdownSIGTERM();
    await test3_GracefulShutdownSIGINT();
    await test4_EADDRINUSEErrorHandling();
    await test5_RequestLogging();
  } catch (error) {
    console.error('Test runner error:', error.message);
    failedTests++;
  }
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  
  if (failedTests === 0) {
    console.log('\n=== All Tests Passed! ===');
    process.exit(0);
  } else {
    console.log(`\n=== ${failedTests} Test(s) Failed ===`);
    process.exit(1);
  }
}

// Run tests
runTests();
