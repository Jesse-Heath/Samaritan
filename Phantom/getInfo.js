var system = require('system');
var args = system.args;

var page = require('webpage').create();
//the rest of the code is the same as the previous example
var uuid = args[1];
var user = args[2];
var char = args[3];
console.log('starting grab');
var url = 'https://swgoh.gg/u/' + user + '/collection/' + char + '/';
console.log(url);
page.open(url, function(status) {
    var health = page.evaluate(function(){
        return document.querySelector(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(3) > .media-body > .media-body > .pc-stat:nth-child(1) > .pc-stat-value").innerHTML;
    });
    console.log("health: " + health);
    var protection = page.evaluate(function(){
        return document.querySelector(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(3) > .media-body > .media-body > .pc-stat:nth-child(2) > .pc-stat-value").innerHTML;
    });
    console.log("protection: " + protection);
    var speed = page.evaluate(function(){
        return document.querySelector(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(3) > .media-body > .media-body > .pc-stat:nth-child(3) > .pc-stat-value").innerHTML;
    });
    console.log("speed: " + speed);
    var crit_damage = page.evaluate(function(){
        return document.querySelector(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(3) > .media-body > .media-body > .pc-stat:nth-child(4) > .pc-stat-value").innerHTML;
    });
    console.log("crit_damage: " + crit_damage);
    var potency = page.evaluate(function(){
        return document.querySelector(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(3) > .media-body > .media-body > .pc-stat:nth-child(5) > .pc-stat-value").innerHTML;
    });
    console.log("potency: " + potency);
    var tenacity = page.evaluate(function(){
        return document.querySelector(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(3) > .media-body > .media-body > .pc-stat:nth-child(6) > .pc-stat-value").innerHTML;
    });
    console.log("tenacity: " + tenacity);
    var basic_crit_chance = page.evaluate(function(){
        return document.querySelector(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(4) > .media-body > .media-body > .pc-stat:nth-child(1) > .pc-stat-value").innerHTML;
    });
    console.log("basic_crit_chance: " + basic_crit_chance);
    var special_crit_chance = page.evaluate(function(){
        return document.querySelector(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(4) > .media-body > .media-body > .pc-stat:nth-child(2) > .pc-stat-value").innerHTML;
    });
    console.log("special_crit_chance: " + special_crit_chance);
    var basic_damage = page.evaluate(function(){
        return document.querySelector(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(6) > .media-body > .media-body > .pc-stat:nth-child(1) > .pc-stat-value").innerHTML;
    });
    console.log("basic_damage: " + basic_damage);
    var special_damage = page.evaluate(function(){
        return document.querySelector(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(6) > .media-body > .media-body > .pc-stat:nth-child(2) > .pc-stat-value").innerHTML;
    });
    console.log("special_damage: " + special_damage);
    var data = {
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
    // var fs = require('fs');
    console.log("/tmp/" + uuid + ".json");
    console.log(JSON.stringify(data));
    // fs.writeFile("/tmp/" + uuid + ".json", JSON.stringify(data));
    console.log(JSON.stringify(data));
    phantom.exit(data);
    return data;
});
console.log('done grabbing image');
