const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function run() {
  const bundle = await fetch('https://www.skydive.com/assets/index-DbwB1rkk.js');
  const d = bundle.data;
  
  // Find all occurrences of posts or post
  const re = /\/posts\/[a-zA-Z0-9_\-]+|posts:[a-zA-Z0-9_]+|post\.[a-zA-Z0-9_]+/g;
  const matches = [...new Set(d.match(re) || [])];
  console.log('Matches:', matches);

  // Look for trpc procedures
  const trpc = [...new Set(d.match(/trpc\.[a-zA-Z0-9_.]+/g) || [])];
  console.log('tRPC:', trpc.slice(0, 30));

  // Search for the specific id
  const targetId = '01a09348-f1ba-702d-b9c6-38d858b03ded';
  const refId = '01a08356-1b4f-7c11-8a0e-a5a84b2e0af6';
  console.log('targetId in bundle:', d.includes(targetId));
  console.log('refId in bundle:', d.includes(refId));

  // Check if there is an edge function or API for posts
  // Test common trpc paths: e.g. /api/v1/trpc/posts.get?input=... or /api/v1/trpc/post.byId?input=...
  const trpcEndpoints = [
    `/api/v1/trpc/posts.getById?batch=1&input=${encodeURIComponent(JSON.stringify({ "0": { id: targetId } }))}`,
    `/api/v1/trpc/posts.get?batch=1&input=${encodeURIComponent(JSON.stringify({ "0": { id: targetId } }))}`,
    `/api/v1/trpc/post.get?batch=1&input=${encodeURIComponent(JSON.stringify({ "0": { id: targetId } }))}`,
    `/api/v1/trpc/post.byId?batch=1&input=${encodeURIComponent(JSON.stringify({ "0": { id: targetId } }))}`,
    `/api/v1/trpc/feed.post?batch=1&input=${encodeURIComponent(JSON.stringify({ "0": { id: targetId } }))}`
  ];

  for (const ep of trpcEndpoints) {
    const res = await fetch(`https://www.skydive.com${ep}`);
    console.log(ep.split('?')[0], '->', res.status, res.data.slice(0, 100));
  }
}

run().catch(console.error);
