
    console.log("getting list of users in guild");
    var url = 'https://swgoh.gg/g/20619/chaos-warriors-unite/';

    var request = require('request');
    var cheerio = require('cheerio');

    request(url, function (error, response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            var data = [];
            var numUsers = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.list-group-item.p-a > h1 > small").html();
            var numUsers = parseInt(numUsers.substring(numUsers.indexOf("/") + 2, numUsers.indexOf("Profiles") - 1));
            console.log(numUsers);
            for (var i = 0; i < numUsers; i++) {
                var link = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody > tr:nth-child(" + (i + 1) + ") > td > a").attr("href");
                var name = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody > tr:nth-child(" + (i + 1) + ") > td > a > strong").html();
                var user = {};
                user.link = link;
                user.name = name;
                data.push(user);
            }
            console.log(JSON.stringify(data));
        } else {
            console.log("We’ve encountered an error: " + error);
        }
    });
