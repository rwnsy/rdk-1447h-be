const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

// CREATE a new donation record
router.post('/donations', donationController.createDonation);

// GET all donation records
router.get('/donations', donationController.getAllDonations);

// GET a single donation record by ID
router.get('/donations/:id', donationController.getDonationById);

// UPDATE a donation record by ID
router.put('/donations/:id', donationController.updateDonation);

// DELETE a donation record by ID
router.delete('/donations/:id', donationController.deleteDonation);

module.exports = router;