import { execSync } from 'node:child_process';

function runCmd(cmd: string) {
  console.log(`=== Running: ${cmd} ===`);
  try {
    const out = execSync(cmd, { encoding: 'utf8' });
    console.log(out);
  } catch (err: any) {
    console.log(`Exit code/Error: ${err.message}`);
    if (err.stdout) console.log(`Stdout: ${err.stdout}`);
    if (err.stderr) console.log(`Stderr: ${err.stderr}`);
  }
}

runCmd('which stitch');
runCmd('find /usr -name "*stitch*"');
runCmd('find /etc -name "*stitch*"');
runCmd('find /var -name "*stitch*"');
runCmd('find /opt -name "*stitch*"');
