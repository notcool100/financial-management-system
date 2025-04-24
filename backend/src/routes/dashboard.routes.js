const express = require('express');
const { getDashboardChart } = require('../controllers/dashboard.controller');
const { authenticate, isAdmin, isStaff } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/chart:
 *   get:
 *     summary: Get dashboard chart data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard chart data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get('/chart', authenticate, isStaff, getDashboardChart);

module.exports = router;