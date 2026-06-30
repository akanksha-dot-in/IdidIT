import fs from 'node:fs';

console.log("=== Reading /app/.dev.env.json ===");
try {
  const content = fs.readFileSync('/app/.dev.env.json', 'utf8');
  console.log(content);
} catch (err: any) {
  console.error("Failed to read /app/.dev.env.json:", err.message);
}
