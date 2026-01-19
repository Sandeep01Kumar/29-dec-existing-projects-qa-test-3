'use strict';

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const SERVER_PATH = path.join(__dirname, 'server.js');
const SERVER_URL = 'http://127.0.0.1:3000/';

let passedTests = 0;
let failedTests = 0;

function logResult(passed, message) {
  console.log(`  ${passed ? '✓' : '✗'} ${message}`);
  passed ? passedTests++ : failedTests++;
}

function spawnServer() {
  return spawn('node', [SERVER_PATH], { stdio: ['pipe', 'pipe', 'pipe'] });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    }).on('error', reject);
  });
}

function captureStdout(proc) {
  const lines = [];
  proc.stdout.on('data', data => lines.push(data.toString()));
  return lines;
}

function captureStderr(proc) {
  const lines = [];
  proc.stderr.on('data', data => lines.push(data.toString()));
  return lines;
}

async function test1_ServerRespondsCorrectly() {
  console.log('\nTest 1: Server starts and responds correctly');
  const server = spawnServer();
  captureStdout(server);
  
  try {
    await wait(2000);
    const response = await httpGet(SERVER_URL);
    
    logResult(response.statusCode === 200, 
      response.statusCode === 200 ? 'Server responds with status 200' : `Expected 200, got ${response.statusCode}`);
    
    logResult(response.body === 'Hello, World!\n',
      response.body === 'Hello, World!\n' ? 'Response body is correct' : `Unexpected body: "${response.body}"`);
  } catch (error) {
    logResult(false, `Error: ${error.message}`);
  } finally {
    server.kill('SIGTERM');
    await wait(500);
  }
}

async function test2_GracefulShutdownSIGTERM() {
  console.log('\nTest 2: Graceful shutdown on SIGTERM');
  const server = spawnServer();
  captureStdout(server);
  
  try {
    await wait(2000);
    
    const exitPromise = new Promise(resolve => {
      server.on('exit', code => resolve(code));
    });
    
    server.kill('SIGTERM');
    
    const exitCode = await Promise.race([
      exitPromise,
      wait(5000).then(() => 'timeout')
    ]);
    
    logResult(exitCode !== 'timeout', 
      exitCode !== 'timeout' ? 'SIGTERM triggers graceful shutdown' : 'Server did not shutdown within timeout');
    
    logResult(exitCode === 0, 
      exitCode === 0 ? 'Exit code is 0' : `Expected exit code 0, got ${exitCode}`);
  } catch (error) {
    logResult(false, `Error: ${error.message}`);
    server.kill('SIGKILL');
  }
}

async function test3_GracefulShutdownSIGINT() {
  console.log('\nTest 3: Graceful shutdown on SIGINT');
  const server = spawnServer();
  captureStdout(server);
  
  try {
    await wait(2000);
    
    const exitPromise = new Promise(resolve => {
      server.on('exit', code => resolve(code));
    });
    
    server.kill('SIGINT');
    
    const exitCode = await Promise.race([
      exitPromise,
      wait(5000).then(() => 'timeout')
    ]);
    
    logResult(exitCode !== 'timeout',
      exitCode !== 'timeout' ? 'SIGINT triggers graceful shutdown' : 'Server did not shutdown within timeout');
    
    logResult(exitCode === 0,
      exitCode === 0 ? 'Exit code is 0' : `Expected exit code 0, got ${exitCode}`);
  } catch (error) {
    logResult(false, `Error: ${error.message}`);
    server.kill('SIGKILL');
  }
}

async function test4_EADDRINUSEErrorHandling() {
  console.log('\nTest 4: EADDRINUSE error handling');
  const server1 = spawnServer();
  let server2 = null;
  
  try {
    await wait(2000);
    
    server2 = spawnServer();
    const stderrLines = captureStderr(server2);
    
    const exitPromise = new Promise(resolve => {
      server2.on('exit', code => resolve({ code, stderr: stderrLines.join('') }));
    });
    
    const result = await Promise.race([
      exitPromise,
      wait(5000).then(() => ({ code: 'timeout', stderr: '' }))
    ]);
    
    const errorHandled = result.code !== 'timeout' && 
      (result.stderr.includes('EADDRINUSE') || result.stderr.includes('already in use'));
    logResult(errorHandled, errorHandled ? 'EADDRINUSE error is handled' : 'Error was not properly handled');
    
    logResult(result.code === 1, 
      result.code === 1 ? 'Exit code is 1 on error' : `Expected exit code 1, got ${result.code}`);
  } catch (error) {
    logResult(false, `Error: ${error.message}`);
  } finally {
    server1.kill('SIGTERM');
    if (server2) server2.kill('SIGKILL');
    await wait(500);
  }
}

async function test5_RequestLogging() {
  console.log('\nTest 5: Request logging');
  const server = spawnServer();
  const stdoutLines = captureStdout(server);
  
  try {
    await wait(2000);
    await httpGet(SERVER_URL);
    await wait(500);
    
    const output = stdoutLines.join('');
    const loggingWorks = output.includes('[') && output.includes(']') && 
                         output.includes('GET') && output.includes('/');
    
    logResult(loggingWorks, loggingWorks ? 'Request logging works' : 'Request logging is incomplete');
  } catch (error) {
    logResult(false, `Error: ${error.message}`);
  } finally {
    server.kill('SIGTERM');
    await wait(500);
  }
}

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

runTests();
