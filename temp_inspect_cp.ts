import http from 'node:http';

function getUrl(url: string) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function run() {
  console.log("=== Querying Control Plane ===");
  const r1 = await getUrl('http://localhost:8000/health');
  console.log("http://localhost:8000/health:", JSON.stringify(r1, null, 2));

  const r2 = await getUrl('http://localhost:8000/');
  console.log("http://localhost:8000/:", JSON.stringify(r2, null, 2));

  const r3 = await getUrl('http://localhost:8000/api');
  console.log("http://localhost:8000/api:", JSON.stringify(r3, null, 2));

  const r4 = await getUrl('http://localhost:8000/stitch');
  console.log("http://localhost:8000/stitch:", JSON.stringify(r4, null, 2));
}

run();
