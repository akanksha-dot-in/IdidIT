import fs from 'node:fs';

console.log("=== Reading /etc/resolv.conf ===");
try {
  const content = fs.readFileSync('/etc/resolv.conf', 'utf8');
  console.log(content);
} catch (err: any) {
  console.error("Failed to read /etc/resolv.conf:", err.message);
}
