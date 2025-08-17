//* Import modules, adapters
import dotEnv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import type * as express from 'express';
import { createServer } from 'http';
import { app } from './app';
import { SocketManager } from './SocketManager';
import { verifyToken } from './utils/jwt';
import { sequelize } from './db';

// * Define base variables
const configEnv: dotEnv.DotenvConfigOutput = dotEnv.config();
dotenvExpand.expand(configEnv);
const PORT: number = Number(process.env.PORT || 3000);

let serverRunning = false;

// * Base server manage functions
async function start(): Promise<void> {
  // * DB connection
  if (process.env.NODE_ENV !== 'production') {
    // await sequelize.sync({ alter: true }); // dev only - если успею разобраться с миграциями, добавлю миграции
  }
  // * Start http server
  const httpServer = createServer(app);

  const socketManager = new SocketManager({
    verifyToken: async (token) => {
      const raw = typeof token === 'string' && token.startsWith('Bearer ') ? token.slice(7) : token;
      const payload = verifyToken(raw);
      return payload ? { userId: payload.userId } : null;
    },
  });

  socketManager.init(httpServer);

  (app as express.Application).locals.socketManager = socketManager;

  httpServer.listen(PORT, () => {
    serverRunning = true;
    console.log(`Server listening on http://localhost:${PORT}`);
  });

  const shutdown = async (reason = 'SIGTERM') => {
    if (!serverRunning) {
      console.log('Shutdown called but server not running; exiting');
      process.exit(0);
    }

    console.log('Shutdown start', reason);
    try {
      await new Promise<void>((resolve, reject) => {
        httpServer?.close((err) => (err ? reject(err) : resolve()));
      });
      console.log('HTTP server closed');

      await socketManager?.close();
      console.log('SocketManager closed');

      await sequelize.close();
      console.log('Sequelize closed');

      setTimeout(() => process.exit(0), 100);
    } catch (err) {
      console.error('Shutdown error', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    console.error('uncaughtException', err);
    shutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection', reason);
    shutdown('unhandledRejection');
  });
}

start().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});
