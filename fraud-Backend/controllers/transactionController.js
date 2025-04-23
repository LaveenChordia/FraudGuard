// controllers/transactionController.js
const Transaction = require('../models/Transaction');
const { evaluateTransaction } = require('../services/fraudService');

async function processTransaction(req, res) {
  try {
    const { userId, amount, location, deviceInfo } = req.body;
    const timestamp = new Date();

    const { isFraudulent, fraudScore } = await evaluateTransaction({
      userId, amount, location, deviceInfo, timestamp,
    });

    const transaction = new Transaction({
      userId,
      amount,
      location,
      deviceInfo,
      timestamp,
      isFraudulent,
      fraudScore,
    });

    await transaction.save();

    res.status(200).json({ status: isFraudulent ? 'fraud' : 'approved', fraudScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { processTransaction };
