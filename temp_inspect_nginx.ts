import fs from 'node:fs';

console.log("=== Reading /etc/nginx/nginx.conf ===");
try {
  const content = fs.readFileSync('/etc/nginx/nginx.conf', 'utf8');
  console.log(content);
} catch (err: any) {
  console.error("Failed to read /etc/nginx/nginx.conf:", err.message);
}
