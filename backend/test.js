// Node.js 18+ has global fetch, no import needed
async function test() {
  try {
    console.log('Testing GET /api/shop-info...');
    const res = await fetch('http://localhost:5000/api/shop-info');
    const data = await res.json();
    console.log('GET Response:', JSON.stringify(data, null, 2));

    console.log('\nTesting POST /api/generate without API key...');
    const genRes = await fetch('http://localhost:5000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: 'Do you have Rice in stock?',
        shopInfo: data,
        language: 'English'
      })
    });
    const genData = await genRes.json();
    console.log('POST Response Status:', genRes.status);
    console.log('POST Response:', JSON.stringify(genData, null, 2));
  } catch (err) {
    console.error('Error during testing:', err);
  }
}

test();
