const express  = require('express');
const cors     = require('cors');
const path     = require('path');
require('dotenv').config();

const connectDB = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../login.html')));

app.use('/api/auth',   require('./routes/auth'));
app.use('/api/game',   require('./routes/game'));
app.use('/api/wallet', require('./routes/wallet'));

app.use((err, req, res, next) => {
  console.error('EXPRESS ERROR:', err.message);
  res.status(500).json({ error: err.message });
});

connectDB().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
});