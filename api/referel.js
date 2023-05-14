const settings = require("../settings.json");
const fs = require('fs');

const indexjs = require("../index.js");
const arciotext = (require("./arcio.js")).text;
const fetch = require('node-fetch');

module.exports.load = async function(app, db) {
    app.get("/client/api/referal/use", async (req, res) => {
      if (!req.session.pterodactyl) return res.redirect("/");
      let theme = indexjs.get(req);
      let failredirect = ('/settings')

      let referid = req.query.referid // referel id
      let userid = req.query.userid // id of the user who is using refer system
      let reffered = await db.get("referred-" + userid)
      if (!referid || !userid) return res.redirect(failredirect +'?err=INVALIDDETAILS')
      if (reffered == true) return res.redirect(failredirect + '?err=ALREADYREFFERED')
      let ridusr = await db.get("referuserid-" + referid)
      let usr1coin = await db.get("coins-" + userid) ?? 0
      let oldcoinsusr1 = parseFloat(usr1coin);
      let newcoinsusr1 = oldcoinsusr1 + 50;
      let ee = await db.set("coins-" + userid, newcoinsusr1)
      let eee = await db.set("referred-" + userid, true)

      let usr2coin = await db.get("coins-" + ridusr.userid) ?? 0
      let oldcoinsusr2 = parseFloat(usr2coin);
      let newcoinsusr2 = oldcoinsusr2 + 50;
      let e = await db.set("coins-" + ridusr.userid, newcoinsusr2)

      let successredirect = theme.settings.redirect.referred
      res.redirect(successredirect + '?REFERRED')
    });

    async function generateReferralCode(db) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let referralCode;
      let referralCodeExists = true;
      
      while (referralCodeExists) {
        referralCode = '';
        for (let i = 0; i < 8; i++) {
          referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        const referidcheck = await db.get('referuserid-' + referralCode) || { inuse: false };
        referralCodeExists = referidcheck.inuse;
      }
    
      return referralCode;
    }
        
      app.get('/generater', async (req, res) => {
        if (!req.session.pterodactyl) return res.redirect('/');
        let newid = req.query.referid
        let userid = req.query.userid
        let currentid = req.query.currentid
        let theme = indexjs.get(req);
        let failredirect = ('/settings')
        const referralCode = await generateReferralCode(db);
        if (!newid || !userid || !currentid) return res.redirect(failredirect +'?err=INVALIDDETAILS')
        let referidcheck = await db.get("referuserid-" + newid) ?? false
        if (referidcheck.inuse == true) return res.send("already in use")
        await db.delete("referuserid-" + currentid)
        const referid = {
          userid: userid,
          inuse: true
        }
        await db.set("referuserid-" + newid, referid)
        await db.set("referiduser-" + userid, newid)
  
        let successredirect = ('/settings')
        res.redirect(successredirect + "?success=UPDATEDREFERID")
      })
    };
