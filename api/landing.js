const settings = require("../settings");
const fetch = require('node-fetch');

module.exports.load = async function(app, db) {

  app.get("/api/users", async (req, res) => {
    const response = await fetch(settings.pterodactyl.domain + "/api/application/users", {
      "method": "GET",
      "headers": {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.pterodactyl.key}`
      }
    });
    const json = await response.json();
    const totalUsers = json.meta.pagination.total;
    res.json({ totalUsers });
  });

  app.get("/api/nodes", async (req, res) => {
    const response = await fetch(settings.pterodactyl.domain + "/api/application/nodes", {
      "method": "GET",
      "headers": {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.pterodactyl.key}`
      }
    });
    const json = await response.json();
    const totalNodes = json.meta.pagination.total;
    res.json({ totalNodes });
  });
  

}