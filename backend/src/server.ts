import app from './app.js';
import { env } from './config/env.js';
import prisma from './config/prisma.js';

const server = app.listen(env.port, () => {
  console.log(`ZeroWaste backend listening on http://localhost:${env.port}`);
});

function shutdown(signal: NodeJS.Signals): void {
  server.close((error) => {
    if (error) {
      console.error(`Backend server failed to close after ${signal}`, error.name);
      process.exitCode = 1;
    }
    void prisma.$disconnect().catch((disconnectError: unknown) => {
      console.error('Prisma client failed to disconnect', disconnectError instanceof Error ? disconnectError.name : 'UnknownError');
      process.exitCode = 1;
    });
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
