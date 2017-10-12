var char = "wedge-antilles";
var ship = "ghost";
var user = "jessinator";
console.log("getting ship skills for " + ship + " on profile " + user);
var url = 'https://swgoh.gg/u/' + user + '/ships/' + ship + '/';
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
        var level = $("body > div.container.p-t-sm > div.content-container > div.content-container-primary > ul:nth-child(2) > li > div > div > div:nth-child(" + (i + 1) + ") > a > div.pc-skill-levels").attr("data-title");
        var name = $("body > div.container.p-t-sm > div.content-container > div.content-container-primary > ul:nth-child(2) > li > div > div > div:nth-child(" + (i + 1) + ") > a > div.pc-skill-name").html();
        var crew = $("body > div.container.p-t-sm > div.content-container > div.content-container-primary > ul:nth-child(2) > li > div > div > div:nth-child(" + (i + 1) + ") > div > div > a > div > img").attr("alt");
        var ability = {
            "name": decode(name),
            "level": level
        };
        if (crew != undefined) {
            ability.crew = decode(crew);
        }
        data[i] = ability;
    }
    data["count"] = skills.length;
    // callback(data);
  } else {
    console.log("We’ve encountered an error: " + error);
  }
});
