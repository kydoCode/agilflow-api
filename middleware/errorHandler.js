import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  logger.error('Erreur capturée', {
    error: message,
    stack: err.stack,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const response = {
    success: false,
    message
  };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
