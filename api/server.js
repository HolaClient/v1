const settings = require("../settings");
const fetch = require('node-fetch');

module.exports.load = async function(app, db) {
    app.get("/api/servers", async (req, res) => {
        const response = await fetch(settings.pterodactyl.domain + "/api/application/nodes?include=servers", {
            "method": "GET",
            "headers": {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${settings.pterodactyl.key}`
            }
        });
        const json = await response.json();
        let totalServers = 0;
        json.data.forEach((node) => {
            totalServers += node.attributes.relationships.servers.data.length;
        });
        res.json({ totalServers });
    });   
}