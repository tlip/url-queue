import http from 'http';
import signale from 'signale';
import { createConnection } from 'typeorm';
import ormConfig from './db/orm.config';

/**
 * Production check
 */
const isProduction = process.env.NODE_ENV === 'production';


/**
 * INITAL MODULES
 */
let app = require('./server').default;


/**
 * CREATE INITIAL SERVERS
 */
const server = http.createServer(app);


/**
 * CREATE CURRENT EXPRESS EVENT HANDLER
 */
let currentApp = app;


/**
 * First create DB Connection, then start the server
 */
const bootstrap = async () => {
  // CONNECT TO THE DATABASE
  try {
    await createConnection(ormConfig);
  } catch (err) {
    signale.fatal(err);
    signale.fatal('Error connecting to the database');
    throw err;
  }
  // START SERVER
  server.listen(process.env.PORT, (error: Error) => {
    if (error) { signale.error(error); }
    signale.success(`🚀 Server started`);
  });
};


/**
 * HOT RELOADING
 */
const initializeHMR = () => {
  if (module.hot && !isProduction) {
    signale.success('✅  Server-side HMR Enabled!');

    module.hot.accept('./server', () => {
      signale.info('🔁  HMR Reloading `./server`...');

      try {
        app = require('./server').default;
        server.removeListener('request', currentApp);
        server.on('request', app);
        currentApp = app;
      } catch (error) {
        signale.error(error);
      }
    });
  }
};


/**
 * BOOM, BABY
 */
(function main() {
  bootstrap().then(initializeHMR);
})();

