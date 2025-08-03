const http = require('http');

// Test the server
const options = {
  hostname: 'localhost',
  port: 3004,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('✅ Server is running');
    console.log('Response:', data);
    
    // Now test the provider dashboard route
    testProviderDashboard();
  });
});

req.on('error', (err) => {
  console.log('❌ Server is not running');
  console.log('Please start the server with: node server.js');
});

req.end();

function testProviderDashboard() {
  const options2 = {
    hostname: 'localhost',
    port: 3004,
    path: '/service-providerdashboard.html',
    method: 'GET'
  };

  const req2 = http.request(options2, (res) => {
    console.log('✅ Provider dashboard route working');
    console.log('Status:', res.statusCode);
    console.log('You can now access: http://localhost:3004/service-providerdashboard.html');
  });

  req2.on('error', (err) => {
    console.log('❌ Provider dashboard route failed:', err.message);
  });

  req2.end();
}
