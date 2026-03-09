async function check() {
  console.log('Waiting for server...');
  await new Promise(r => setTimeout(r, 5000));
  try {
    const res = await fetch('http://localhost:3000/api/subjects');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', data.length, 'subjects found');
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
check();
