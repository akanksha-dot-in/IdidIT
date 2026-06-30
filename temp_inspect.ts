import fs from 'node:fs';
import path from 'node:path';

console.log("=== Reading /etc/hosts ===");
try {
  const hosts = fs.readFileSync('/etc/hosts', 'utf8');
  console.log(hosts);
} catch (err: any) {
  console.error("Failed to read /etc/hosts:", err.message);
}

console.log("=== Listing /app directory ===");
try {
  const listApp = fs.readdirSync('/app');
  console.log(listApp);
} catch (err: any) {
  console.error("Failed to list /app:", err.message);
}

console.log("=== Search for 'stitch' files in /app ===");
function searchFiles(dir: string, results: string[] = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fullPath.includes('node_modules') || fullPath.includes('.git') || fullPath.includes('.next') || fullPath.includes('dist')) continue;
      
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchFiles(fullPath, results);
      } else {
        if (file.toLowerCase().includes('stitch') || fullPath.toLowerCase().includes('stitch')) {
          results.push(fullPath);
        }
      }
    }
  } catch (err: any) {
    // ignore errors for unreadable dirs
  }
  return results;
}

const found = searchFiles('/app');
console.log("Found stitch files:", found);
