import fs from 'node:fs';

console.log("=== Reading /etc/nginx/nginx_auth.conf.include ===");
try {
  const content = fs.readFileSync('/etc/nginx/nginx_auth.conf.include', 'utf8');
  console.log(content);
} catch (err: any) {
  console.error("Failed to read /etc/nginx/nginx_auth.conf.include:", err.message);
}
