// services/fraudService.js
const axios = require('axios');

async function evaluateTransaction(data) {
  // Replace this with actual ML API call
  const mockScore = Math.random(); // Replace with model output
  return {
    isFraudulent: mockScore > 0.8,
    fraudScore: mockScore,
  };
}

module.exports = { evaluateTransaction };
