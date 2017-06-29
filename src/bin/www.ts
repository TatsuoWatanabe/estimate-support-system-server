import * as debugModule from 'debug';
import * as http        from 'http';
import { app }          from '../app';

const debug = debugModule('express:server');

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

// --- start server --------------------------------
(() => {
  /**
   * Get port from environment and store in Express.
   */
  const port = normalizePort(process.env.PORT || 5000);
  console.log(`Server listening on Port:${port}`);
  app.set('port', port);

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port);
  server.on('error', serverErrorHandler);
  server.on('listening', onListening);
})();
// --------------------------------------------------

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: any): number|string|boolean {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // name pipe
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server 'error' event.
 */
function serverErrorHandler(err, req, res, next) {
  res.status(500).json({
    message: err.message,
    error: err,
    description: 'server error occured.'
  });
}

/**
 * Event listener for HTTP server 'listening' event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
