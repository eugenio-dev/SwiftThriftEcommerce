const express = require('express');
const app = express.Router();
const path = require('path');

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'about.html'));
});

// Ty's page
app.get('/about/ty', (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'ty.html'));
});

// Eugenio's page
app.get('/about/eugenio', (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'eugenio.html'));
});

// Julia's page
app.get('/about/julia', (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'julia.html'));
});

// Michael's page
app.get('/about/michael', (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'michael.html'));
});

// Prince's page
app.get('/about/prince', (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'prince.html'));
});



module.exports = app;