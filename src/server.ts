import colors from 'colors';
import mongoose from 'mongoose';



// import seedSuperAdmin from './DB';
import http from 'http';
import { errorLogger, logger } from './shared/logger';

import redisClient from './util/redisClient';
import app from './app';
import { setupSocket } from './socket/socket';
import config from './config';

//uncaught exception
process.on('uncaughtException', error => {
  errorLogger.error('UnhandledException Detected', error, error);
  process.exit(1);
});
export const server = http.createServer(app);
async function main() {
  try {
    // seedSuperAdmin();
    mongoose.connect(config.database_url as string);
    logger.info(colors.green('🚀 Database connected successfully'));

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);
      console.log(port, 'port');
      await redisClient.connect();
    server.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(`♻️  Application listening ${config.ip_address} on port:${config.port}`)
      );
    });
    
    //socket
    setupSocket(server);
  } catch (error) {
    console.log(error);
    errorLogger.error(colors.red('🤢 Failed to connect Database'));
  }

  
  //handle unhandledRejection
  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorLogger.error('UnhandledRejection Detected', error, error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();

//SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM IS RECEIVE');
  if (server) {
    server.close();
  }
});
