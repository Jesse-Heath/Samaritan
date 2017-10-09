var char = "wedge-antilles";
var user = "jessinator";
function getStats(url, callback) {
    var url = 'https://swgoh.gg' + url;

    var request = require('request');
    var cheerio = require('cheerio');

    request(url, function (error, response, body) {
      if (!error) {
        var $ = cheerio.load(body);

        var health = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(3) > .media-body > .media-body > .pc-stat:nth-child(1) > .pc-stat-value").html();
        var protection = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(3) > .media-body > .media-body > .pc-stat:nth-child(2) > .pc-stat-value").html();
        var speed = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(3) > .media-body > .media-body > .pc-stat:nth-child(3) > .pc-stat-value").html();
        var crit_damage = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(3) > .media-body > .media-body > .pc-stat:nth-child(4) > .pc-stat-value").html();
        var potency = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(3) > .media-body > .media-body > .pc-stat:nth-child(5) > .pc-stat-value").html();
        var tenacity = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(3) > .media-body > .media-body > .pc-stat:nth-child(6) > .pc-stat-value").html();
        var basic_crit_chance = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(4) > .media-body > .media-body > .pc-stat:nth-child(1) > .pc-stat-value").html();
        var special_crit_chance = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(4) > .media-body > .media-body > .pc-stat:nth-child(2) > .pc-stat-value").html();
        var basic_damage = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(6) > .media-body > .media-body > .pc-stat:nth-child(1) > .pc-stat-value").html();
        var special_damage = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(6) > .media-body > .media-body > .pc-stat:nth-child(2) > .pc-stat-value").html();
        var level = $(".char-portrait-full-level").html();
        var stars = $(".star-inactive").toString();
        if (stars == "") {
            stars = "7"
        } else {
            num = stars.split("inactive");
            stars = 7 - (num.length - 1);
        }
        var gear = $(".pc-heading").html();
        var gearLevel = 0;
        if (gear == "XII") {
            gearLevel = 12;
        }
        if (gear == "XI") {
            gearLevel = 11;
        }
        if (gear == "X") {
            gearLevel = 10;
        }
        if (gear == "IX") {
            gearLevel = 9;
        }
        if (gear == "VIII") {
            gearLevel = 8;
        }
        if (gear == "VII") {
            gearLevel = 7;
        }
        if (gear == "VI") {
            gearLevel = 6;
        }
        if (gear == "V") {
            gearLevel = 5;
        }
        if (gear == "IV") {
            gearLevel = 4;
        }
        if (gear == "II") {
            gearLevel = 3;
        }
        if (gear == "II") {
            gearLevel = 2;
        }
        if (gear == "I") {
            gearLevel = 1;
        }
        var data = {
            "level": level,
            "stars": stars,
            "gear": "G" + gearLevel,
            "health": health,
            "protection": protection,
            "speed": speed,
            "potency": potency,
            "tenacity": tenacity,
            "crit_damage": crit_damage,
            "basic_crit_chance": basic_crit_chance,
            "special_crit_chance": special_crit_chance,
            "basic_damage": basic_damage,
            "special_damage": special_damage,
        };
        callback(data);
      } else {
        console.log("We’ve encountered an error: " + error);
      }
    });
}
    console.log("getting arena team for " + user);
    var url = 'https://swgoh.gg/u/' + user;
    console.log("start");

    var request = require('request');
    var cheerio = require('cheerio');
    request(url, function (error, response, body) {
      if (!error) {
        var $ = cheerio.load(body);
        var data = [];
        var decode = require('decode-html');
        for (var i = 0; i < 5; i++) {
            var char = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li:nth-child(5) > div > div.current-rank > div.current-rank-team > div > div.team-listing-member:nth-child(" + (i + 1) + ") > div > a").attr("href");
            var name = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li:nth-child(5) > div > div.current-rank > div.current-rank-team > div > div.team-listing-member:nth-child(" + (i + 1) + ") > div").attr("title");
            var member = {
                "name": name,
                "url": char
            };
            // var stats = getStats(char, function() {
            //
            // });
            // console.log(JSON.stringify(stats));
            data.push(member);
        }
        getStats(data[0].url, function (data1) {
            getStats(data[1].url, function (data2) {
                getStats(data[2].url, function (data3) {
                    getStats(data[3].url, function (data4) {
                        getStats(data[4].url, function (data5) {
                            data[0]["data"] = data1;
                            data[1]["data"] = data2;
                            data[2]["data"] = data3;
                            data[3]["data"] = data4;
                            data[4]["data"] = data5;
                            console.log(JSON.stringify(data));
                        });
                    });
                });
            });
        });
      } else {
        console.log("We’ve encountered an error: " + error);
      }
    });
    // callback(data);
