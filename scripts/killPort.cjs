/**
 * Kill whatever process is using PORT before starting dev server.
 * Works on Windows, macOS, Linux.
 */
const net = require('net');
const { execSync } = require('child_process');

const PORT = process.env.PORT || 5000;

const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[pre-dev] Port ${PORT} in use — killing it...`);
    try {
      if (process.platform === 'win32') {
        // Windows: find and kill the PID
        const result = execSync(
          `netstat -ano | findstr :${PORT} | findstr LISTENING`,
          { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
        );
        const pid = result.trim().split(/\s+/).pop();
        if (pid && !isNaN(pid)) {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          console.log(`[pre-dev] Killed PID ${pid} on port ${PORT}`);
        }
      } else {
        // macOS / Linux
        execSync(`lsof -ti:${PORT} | xargs kill -9`, { stdio: 'ignore' });
        console.log(`[pre-dev] Killed process on port ${PORT}`);
      }
    } catch {
      console.log(`[pre-dev] Could not auto-kill port ${PORT}. Run manually: npx kill-port ${PORT}`);
    }
  }
  server.close();
});

server.once('listening', () => {
  // Port is free, nothing to do
  server.close();
});

server.listen(PORT);
