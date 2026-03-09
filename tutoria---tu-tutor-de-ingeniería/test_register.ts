import fetch from 'node-fetch';

async function testRegister() {
  const res = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', password: 'password123', name: 'Test User' })
  });
  const data = await res.json();
  console.log(data);
}

testRegister();
