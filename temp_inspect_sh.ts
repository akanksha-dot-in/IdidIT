import fs from 'node:fs';

console.log("=== Reading /app/start.sh ===");
try {
  const content = fs.readFileSync('/app/start.sh', 'utf8');
  console.log(content);
} catch (err: any) {
  console.error("Failed to read /app/start.sh:", err.message);
}
