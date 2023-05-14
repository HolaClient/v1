const settings = require("../settings");
const fetch = require("node-fetch");

module.exports.load = async function(app, db) {

  app.get("/api/admin/servers", async (req,res) => {

    const server = [];
    const Serverinfo = new Promise(async (resolve, reject) => {
    const response = await fetch(settings.pterodactyl.domain + "/api/application/servers", {
    "method": "GET",
    "headers": {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.pterodactyl.key}`
    }
    });
    const json = await response.json();

    const promises = json.data.map(async (data) => {
     const body = {
        id: data.attributes.id,
        name: data.attributes.name,
        node: data.attributes.node,
        egg: data.attributes.egg,
        ram: data.attributes.limits.memory,
        cpu: data.attributes.limits.cpu,
        disk: data.attributes.limits.disk
    };
    return body;
});

Promise.all(promises).then((servers) => {
    server.push(...servers);
    resolve();
}).catch((error) => {
    reject(error);
});
});

Serverinfo.then(() => {
res.send(server);
}).catch((error) => {
console.error(error);
});
  })
};
