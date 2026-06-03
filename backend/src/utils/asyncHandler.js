// Wraps async route handlers so errors reach the global error middleware.
module.exports = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
