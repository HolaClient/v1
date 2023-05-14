const express = require("express");
const axios = require("axios");
const settings = require("../settings.json")
const app = express();

app.use(express.json());
module.exports.load = async function(app, db) {
app.post('/api/monitor', (req, res) => {
  const { url } = req.body;
  axios.get(url)
    .then((response) => {
      console.log(`URL ${url} is up and running!`);
      res.json({ message: `URL ${url} is up and running!` });
    })
    .catch((error) => {
      console.error(`Error monitoring URL ${url}: ${error.message}`);
      res.status(500).json({ message: `Error monitoring URL ${url}: ${error.message}` });
    });
});
}