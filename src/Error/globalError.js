const globalError = (err, req, res, next) => {
  const message = err.message ? err.message : 'Server is Occure';
  const status = err.status ? err.status : 500;
  res.status(status).json({ message: message });
};

module.exports = globalError;
