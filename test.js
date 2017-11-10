
    console.log("Getting upcoming swgoh events");
    var url = "http://swgohevents.com/";

    var request = require('request');
    var cheerio = require('cheerio');

    request(url, function (error, response, body) {
      if (!error) {
        var $ = cheerio.load(body);
        var data = [];
        var decode = require('decode-html');
        var eventsList = $("body > div > div > div.events").find(".event");

        for (var i = 0; i < eventsList.length; i++) {
            var events = eventsList;
            for (var j = 0; j < i; j++) {
                events = events.next();
            }
            var event = {};
            event.name = decode(events.children(".event_name").children("a").html());
            event.date = events.children(".event_details").children("span").html();
            event.state = "Unknown";
            event.state = events.children(".event_details").children("span").attr("class");
            event.details = events.children(".event_details").text();
            event.details = event.details.replace(/\n/g, "").trim();
            if (event.date == null) {
                event.date = "Unknown";
            }
            if (event.state == null) {
                event.state = "Unknown";
            }
            data.push(event);
        }
        // console.log(JSON.stringify(data));
        console.log(data.length);

        // var sort = data.sort(function(a, b) {
        //     // console.log("Comparing:\n" + JSON.stringify(a) + "\nTo:\n" + JSON.stringify(b));
        //     console.log(a.date + " > " + b.date + " = " + (a.date < b.date));
        //     return a.date < b.date;
        // });
        console.log(JSON.stringify(sort));

        // callback(data);
      } else {
        console.log("We’ve encountered an error: " + error);
      }
    });
