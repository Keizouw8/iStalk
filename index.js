//Port to expose server to internet on
const PORT = 8080;

//Imports
const fs = require("fs");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const gis = require("g-i-s");
var googleIt = require('google-it');

//Server routing
app.use("/static", express.static("./static/"))
app.set("view engine", "ejs");
app.get("/", function(req, res){
    res.render("pages/test")
})
app.get("/results", function(req, res){
    res.render("pages/results", {q: req.query.q})
})

io.on("connection", function(socket){
    socket.on("stalkperson",function (name,callback){
        name = replaceAll(replaceAll(name, "+", "%2b")," ","+");
        googleIt({limit: 25,query: name}).then(function(res){
            var wtc = ["facebook.com","instagram.com","snapchat.com","linkedin.com","tiktok.com","wikipedia.org", "twitter.com"];
            var fw = {
                "facebook.com": [],
                "instagram.com": [],
                "snapchat.com": [],
                "linkedin.com": [],
                "tiktok.com": [],
                "wikipedia.org": [],
                "twitter.com": []
            };
            var i = 0;
            var top5 = [];
            res.forEach(function (result){
                if(i<5){
                    top5.push(result);
                }
                wtc.forEach(function (swtc){
                    if(result.link.includes(swtc)){
                        fw[swtc].push(result);
                    }
                });
                i++;
            });
            gis(name, function(err, ans){
                if(err){
                    console.error(err);
                }
                callback([true,fw,ans[0]["url"],top5]);
            })
        });
    })
})

//Other functions
function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

//Exposing server to internet
server.listen(PORT, console.log(`Listening to port ${PORT}`));