var callback;
var char = "wedge-antilles";
var ship = "ghost";
var user = "jessinator";
    console.log("getting skills for " + char + " on profile " + user);
    var url = 'https://swgoh.gg/u/' + user + '/collection/' + char + '/';
    console.log("start");

    var request = require('request');
    var cheerio = require('cheerio');

    request(url, function (error, response, body) {
      if (!error) {
        var $ = cheerio.load(body);
        var skills = $(".pc-skill");
        var data = {};
        var decode = require('decode-html');
        for (var i = 0; i < skills.length; i++) {
            var level = $(".content-container-primary > .list-group.media-list.media-list-stream.m-b-sm:nth-child(3) > .media.list-group-item:nth-child(1) > .pc-skills > .pc-skills-list > .pc-skill:nth-child(" + (i + 1) + ") > .pc-skill-link > .pc-skill-levels").attr("data-title");
            var name = $(".content-container-primary > .list-group.media-list.media-list-stream.m-b-sm:nth-child(3) > .media.list-group-item:nth-child(1) > .pc-skills > .pc-skills-list > .pc-skill:nth-child(" + (i + 1) + ") > .pc-skill-link > .pc-skill-name").html();
            var abilityURL = $("");
            var ability = {
                "name": decode(name),
                "level": level
            };
            data[i] = ability;
        }
        data["count"] = skills.length;
        getAbilityType(char, data, callback);
      } else {
        console.log("We’ve encountered an error: " + error);
      }
    });
function getAbilityType(char, data, callback) {
    var request = require('request');
    var cheerio = require('cheerio');

    request("https://swgoh.gg/characters/" + char + "/", function (error, response, body) {
      if (!error) {
        var $ = cheerio.load(body);
        var decode = require('decode-html');
        for (var i = 0; i < data.count; i++) {
            var abilityData = $("body > div.container.p-t-sm > div.content-container > div.content-container-primary > ul > li:nth-child(" + ((i + 1) * 2) + ") > a > div > div > small").html();
            var abilityArray = abilityData.split("&#xB7;")
            var abilityType = decode(abilityArray[1]).trim();
            data[i].abilityType = abilityType;
        }
        console.log(JSON.stringify(data));
        // callback(data);
      } else {
        console.log("We’ve encountered an error: " + error);
      }
    });
}
