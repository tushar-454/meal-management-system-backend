const logger = (req, res, next) => {
  const reqInfo = {
    path: req.url,
    method: req.method,
    status: res.statusCode,
  };
  console.log(reqInfo);
  next();
};

module.exports = logger;
