const router = require('express').Router();
const userRoutes = require('./user');
const mealRoutes = require('./meal');
const costRoutes = require('./cost');
const moneyRoutes = require('./money');

router.use('/api/v1/user', userRoutes);
router.use('/api/v1/meal', mealRoutes);
router.use('/api/v1/cost', costRoutes);
router.use('/api/v1/money', moneyRoutes);

module.exports = router;
