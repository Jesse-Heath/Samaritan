var char = "wedge-antilles";
var user = "jessinator";
    console.log("getting gear level for " + user + ", character: " + char);
    var url = 'https://swgoh.gg/u/' + user + '/collection/' + char + '/';
    console.log("start");

    var request = require('request');
    var cheerio = require('cheerio');

    request(url, function (error, response, body) {
      if (!error) {
        var $ = cheerio.load(body);
        var data = [];
        var decode = require('decode-html');
        for (var i = 0; i < 6; i++) {
            var gear = $(".content-container-aside > .list-group.media-list.media-list-stream.m-b-sm > .media.list-group-item > .pc-gear > .pc-gear-list > .pc-slot.pc-slot" + (i + 1)).attr("class");
            var name = $(".content-container-aside > .list-group.media-list.media-list-stream.m-b-sm > .media.list-group-item > .pc-gear > .pc-gear-list > .pc-slot.pc-slot" + (i + 1) + " > .pc-slot-preview > .gear-icon").attr("title");
            if (gear.includes("needed")) {
                data.push(decode(name));
            }
        }
        callback(data);
      } else {
        console.log("We’ve encountered an error: " + error);
      }
    });
