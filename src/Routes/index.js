const router = require('express').Router();
const userRoutes = require('./user');

router.use('/api/v1/user', userRoutes);

module.exports = router;
