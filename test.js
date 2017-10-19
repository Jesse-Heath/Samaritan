var user = "tigle";

    console.log("getting zetas for " + user);
    var userURL = 'https://swgoh.gg/u/' + user;

    var request = require('request');
    var cheerio = require('cheerio');
    request(userURL, function (error, response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            var guildURL = $("body > div.container.p-t-md > div.content-container > div.content-container-aside > div.panel.panel-default.panel-profile.m-b-sm > div.panel-body > p:nth-child(4) > strong > a").attr("href");
            guildURL = "https://swgoh.gg" + guildURL + "?stats=zetas";
            getZeta(guildURL, function(data) {
                console.log(data);
            });
        }
    });

    function getZeta(guildURL, callback) {
        var request = require('request');
        var cheerio = require('cheerio');
        request(guildURL , function (error, response, body) {
            if (!error) {
                var $ = cheerio.load(body);
                var numUsers = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody").html();
                numUsers = numUsers.split("<tr>");
                for (var i = 0; i < (numUsers.length - 1); i++) {
                    var username = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody > tr:nth-child(" + (i + 1) + ") > td > a").attr("href");
                    if (username == `/u/${user}/`) {
                        var data = {};
                        var numTotalZetas = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody > tr:nth-child(" + (i + 1) + ") > td.text-center").html();
                        data.num = numTotalZetas;
                        var chars = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody > tr:nth-child(" + (i + 1) + ") > td:nth-child(3)").html();
                        chars = chars.split("<div class=\"guild-member-zeta\">");
                        data.zetas = [];
                        for (var k = 0; k < (chars.length - 1); k++) {
                            var char = {};
                            var name = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody > tr:nth-child(" + (i + 1) + ") > td:nth-child(3) > div:nth-child(" + (k + 1) + ") > div.guild-member-zeta-character > div").attr("title");
                            char.name = name;
                            var numZetas = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody > tr:nth-child(" + (i + 1) + ") > td:nth-child(3) > div:nth-child(" + (k + 1) + ") > div.guild-member-zeta-abilities").html();
                            numZetas = numZetas.split("<img class=\"guild-member-zeta-ability\"");
                            char.zetas = [];
                            for (var j = 0; j < (numZetas.length - 1); j++) {
                                var zeta = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody > tr:nth-child(" + (i + 1) + ") > td:nth-child(3) > div:nth-child(" + (k + 1) + ") > div.guild-member-zeta-abilities > img:nth-child(" + (j + 1) + ")").attr("title");
                                char.zetas.push(zeta);
                            }
                            data.zetas.push(char);
                        }
                        console.log(JSON.stringify(data));
                        break;
                    }
                }
            }
        });
    }
