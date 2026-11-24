require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stores', require('./routes/stores'));

app.use((err, req, res, next) => {
  if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API on :${port}`));
