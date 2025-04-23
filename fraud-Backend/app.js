// app.js
const express = require('express');
const dotenv = require('dotenv');
const transactionRoutes = require('./routes/transactionRoutes');
const sequelize = require('./config/db');

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  console.log('Database connected & synced');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('Unable to connect to the database:', err);
});
