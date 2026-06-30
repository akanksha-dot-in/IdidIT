import fs from 'node:fs';
import path from 'node:path';

console.log("=== Listing /app/control-plane-api ===");
try {
  const files = fs.readdirSync('/app/control-plane-api');
  console.log(files);
} catch (err: any) {
  console.error("Failed to list /app/control-plane-api:", err.message);
}
