// routes/transactionRoutes.js
const express = require('express');
const { processTransaction } = require('../controllers/transactionController');

const router = express.Router();
router.post('/', processTransaction);

module.exports = router;
