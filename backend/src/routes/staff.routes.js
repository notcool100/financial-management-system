const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');

// Get all staff
router.get('/staff', staffController.getStaff);

// Get staff by ID
router.get('/staff/:id', staffController.getStaffById);

// Create new staff
router.post('/staff', staffController.createStaff);

// Update staff by ID
router.put('/staff/:id', staffController.updateStaff);

// Delete staff by ID
router.delete('/staff/:id', staffController.deleteStaff);

module.exports = router;
