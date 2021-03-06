const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const games = require('./routes/games');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/api/v1/games', games);

app.use(express.static(path.join(__dirname, 'public')));

// handle 404s
app.use(function(req, res, next) {
  res.status(404).send('Route not available');
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
