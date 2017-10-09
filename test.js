var char = "grand-admiral-thrawn";
var user = "jessinator";
    console.log("getting info for " + char + " on profile " + user);
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
            var ability = {
                "name": decode(name),
                "level": level
            };
            data[i] = ability;
        }
        console.log(data);
      } else {
        console.log("We’ve encountered an error: " + error);
      }
    });
