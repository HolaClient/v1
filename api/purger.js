const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();
const settings = require("../settings.json")
const apiUrl = `${settings.pterodactyl.domain}/api/application`;

module.exports.load = async function(app, db) {
app.post('/api/purge', (req, res) => {
    axios.get(`${apiUrl}/servers`, {
      headers: {
        'Authorization': `Bearer ${settings.pterodactyl.key}`,
        'Content-Type': 'application/json'
      }
    })
    .then((response) => {
      const servers = response.data.data;
      const inactiveServers = servers.filter(server => !server.attributes.name.includes(settings.purge.keyword));
      inactiveServers.forEach(server => {
        axios.delete(`${apiUrl}/servers/${server.attributes.identifier}`, {
          headers: {
            'Authorization': `Bearer ${settings.pterodactyl.key}`,
            'Content-Type': 'application/json'
          }
        })
        .then(() => {
          console.log(`Deleted server ${server.attributes.name}`);
        })
        .catch((error) => {
          console.error(`Failed to delete server ${server.attributes.name}: ${error}`);
        });
      });
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error(`Failed to get server list: ${error}`);
      res.sendStatus(500);
    });  
});
}