import fs from 'node:fs';

console.log("=== Reading /etc/nginx/user_auth_verification.lua ===");
try {
  const content = fs.readFileSync('/etc/nginx/user_auth_verification.lua', 'utf8');
  console.log(content);
} catch (err: any) {
  console.error("Failed to read /etc/nginx/user_auth_verification.lua:", err.message);
}
