const newsettings = require("../settings");
const fs = require('fs');
const path = require('path');
const indexjs = require("../index.js");
const arciotext = (require("./arcio.js")).text;
const fetch = require('node-fetch');
const { ViewApi } = require("@fullcalendar/core");
const ejs = require("ejs");

module.exports.load = async function(app, db) {

    app.set('view engine', 'ejs');

    app.set('views', './themes/Dark');


    app.get("/api/nodes", async (req, res) => {
        let theme = indexjs.get(req);
        if(newsettings.nodes_status.enabled == false) return four0four(req, res, theme);

        const node = [];
const nodeStats = new Promise(async (resolve, reject) => {
    const response = await fetch(newsettings.pterodactyl.domain + "/api/application/nodes", {
        "method": "GET",
        "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${newsettings.pterodactyl.key}`
        }
    });
    const json = await response.json();

    const promises = json.data.map(async (data) => {
        const body = {
            id: data.attributes.id,
            name: data.attributes.name,
            memory: data.attributes.memory,
            disk: data.attributes.disk
        };

        try {
            const healthResponse = await fetch("https://" + data.attributes.fqdn + ":" + data.attributes.daemon_listen + "/health", {
                "method": "GET",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${newsettings.pterodactyl.key}`
                }
            });
            if (healthResponse.status >= 500 && healthResponse.status <= 599) {
                body.status = 'offline';
            } else {
                body.status = 'online';
            }
        } catch (error) {
            body.status = "offline";
        }
        return body;
    });

    Promise.all(promises).then((nodes) => {
        node.push(...nodes);
        resolve();
    }).catch((error) => {
        reject(error);
    });
});

nodeStats.then(() => {
    res.send(node);
}).catch((error) => {
    console.error(error);
});

    })

    async function four0four(req, res, theme) {
        ejs.renderFile(
            `./themes/${theme.name}/${theme.settings.notfound}`, 
            await eval(indexjs.renderdataeval),
            null,
        function (err, str) {
            delete req.session.newaccount;
            if (err) {
                console.log(`[WEBSITE] An error has occured on path ${req._parsedUrl.pathname}:`);
                console.log(err);
                return res.send("An error has occured while attempting to load this page. Please contact an administrator to fix this.");
            };
            res.status(404);
            res.send(str);
        });
    }
}

