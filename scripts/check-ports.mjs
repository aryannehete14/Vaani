// Runs before `npm run dev`. On Windows, Ctrl+C can leave the API running in the
// background, which silently blocks the next start. Detect that and say what to do.
const PORTS = [8787, 5173];

async function inUse(port) {
  try {
    await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(800) });
    return true;
  } catch (err) {
    // Refused means nothing is listening; anything else (a reply, a hang) means the port is taken.
    return err?.cause?.code !== 'ECONNREFUSED';
  }
}

const busy = [];
for (const port of PORTS) if (await inUse(port)) busy.push(port);

if (busy.length) {
  console.error(`\n  Port ${busy.join(' and ')} is already in use, probably by a Vaani server left over from an earlier run.`);
  console.error('  Free it with:  npm run stop');
  console.error('  Then start again with:  npm run dev\n');
  process.exit(1);
}
