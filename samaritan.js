var auth = require("./Config/auth.json");
const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
    console.log("Systems initialized");
    client.user.setPresence({game: {name: "with my code", type: 0}});
});

client.on("message", (message) => {
    if (message.author.bot) return;
    var config = require("./Config/config.json");
    try {
        if (message.mentions.users.first() != undefined && message.mentions.users.first().username == client.user.username) {
            message.channel.send("Yes?..");
        }
    } catch (error) {
        console.log(error);
    }
    if (message.channel.name == config.tbRecords) {
        var content = message.content.toString().replace(/,/g, "").replace(/\s/g, "");
        var amount = getNum(message);
        if (amount.toString() == "NaN") {
            message.reply("Sorry but i couldn't understand that, please try a different format.\neg: 800k, 1.2mil, 950 000, 500000\nI'm going to delete your message for records sake")
            .then(sentMessage => {
                setTimeout( function() {
                    sentMessage.delete();
                    message.delete();
                }, 5000);
            });
        }
        else {
            calculateGP(message);
        }
    }
    if (message.content.startsWith(config.commandPrefix)) {
        var args = message.content.slice(config.commandPrefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        switch(command) {
            case "everyone":
                console.log("everyone command triggered");
                message.channel.send("Hi @ everyone")
                    .then(sentMessage => {
                        setTimeout(function() {
                            sentMessage.delete();
                        },
                        2000);
                    });
                break;
            case "purge":
                purgeChannel(message);
                break;
            case "remind":
                console.log("remind command triggered");
                message.channel.send("Setting reminders...")
                .then(sentMessage => {
                    setTimeout(function() {
                        sentMessage.delete();
                        message.delete();
                    },
                    2000);
                    var howManyTimesToRun = args.shift();
                    var timeToWait = parseInt(args.shift()) * 1000 * 60;
                    remindMe(howManyTimesToRun, timeToWait,
                        function() {
                            if (message.mentions.channels.first() == undefined) {
                                message.channel.send(args.join(" "));
                            } else {
                                args.shift();
                                var id = message.mentions.channels.first().id;
                                client.channels.get(id).send(args.join(" "));
                            }
                        }
                    );
                });
                break;
            case "help":
                console.log("help command triggered");
                var content = `Hello <@${message.author.id}>. Here's my available commands so far:\n`;
                    content += `\n\t\t${config.commandPrefix}**help** - This list.`;
                    content += `\n\t\t${config.commandPrefix}**everyone** - Calls everyone.`;
                    content += `\n\t\t${config.commandPrefix}**remind** *(how many times)* *(how many minutes to wait inbetween)* *channel* *message* - Takes the message you typed and sends it back to the channel later. If you mention a channel it sends the message there instead`;
                    content += `\n\t\t${config.commandPrefix}**meta** - Gets pictures of the current meta report.`;
                    content += `\n\t\t${config.commandPrefix}**link** - Gets your swgoh.gg link.`;
                    content += `\n\t\t${config.commandPrefix}**mods** *user* *character* - Gets a picture of your current mods on a character.`;
                    content += `\n\t\t${config.commandPrefix}**info** *user* *character* - Gives you important info on a character.`;
                    content += `\n\t\t${config.commandPrefix}**gear** *user* *character* - Gets a picture of the gear level on a character.`;
                    content += `\n\t\t${config.commandPrefix}**gear-needed** *user* *character* - Gets a picture of the gear needed to get to the next level on a character.`;
                    content += `\n\t\t${config.commandPrefix}**skills** *user* *character* - Gets you the ability levels on a character.`;
                    content += `\n\t\t${config.commandPrefix}**faction** *user* *faction* - Gets a picture of all characters for a faction.`;
                    content += `\n\t\t${config.commandPrefix}**arena** *user* - Gets a picture of your arena team.`;
                    content += `\n\t\t${config.commandPrefix}**ship-skills** *user* *ship* - Gets a picture of the ability levels on a ship.`;
                    content += `\n\t\t${config.commandPrefix}**ship-faction** *user* *faction* - Gets a picture of all ships for a faction.`;
                    content += `\n${config.emoji.construction} ${config.commandPrefix}**guild-info** *character* - Gives you a list of how many people have a certain character at different star and gear level`;
                    content += `\n${config.emoji.construction} ${config.commandPrefix}**guild-list** *character* *gear/star* *level* - Gives you a list of who has a certain character at certain star or gear level`;
                    content += `\n\nThat's all folks!`;
                message.channel.send(content);
                break;
            case "meta":
                message.channel.send("Roger roger, compiling meta report...")
                .then(sentMessage => {
                    getMeta(1, function (uuid1) {
                        getMeta(2, function (uuid2) {
                            sentMessage.delete();
                            message.channel.send(
                                "Meta Report:",
                                {
                                    files: [
                                        "/tmp/" + uuid1 + ".png",
                                        "/tmp/" + uuid2 + ".png"
                                    ]
                                }
                            );
                        });
                    });
                });
                // message.channel.send(`${config.emoji.construction} Currently in development ${config.emoji.worker}`);
                break;
            case "link":
                message.channel.send(`https://swgoh.gg/u/${args[0]}/`);
                break;
            case "mods":
                console.log("mods command triggered");
                message.channel.send("Sure thing <@" + message.author.id + ">. Give me a moment...")
                .then(sentMessage => {
                    getMods(args[0], args[1], function (uuid) {
                        sentMessage.delete();
                        var result = message.channel.send(
                            `Here's ${args[0]} mods on ${args[1]}`,
                            {
                                files: [
                                    "/tmp/" + uuid + ".png"
                                ]
                            }
                        );
                    });
                });
                break;
            case "info":
                console.log("info command triggered");
                message.channel.send("Compiling data <@" + message.author.id + ">")
                .then(sentMessage => {
                    getInfo(args[0], args[1], function (data) {
                        sentMessage.delete();
                        message.channel.send({
                            embed: {
                                author: {
                                    name: client.user.username,
                                    icon_url: client.user.avatarURL
                                },
                                title: args[1] + " Stats",
                                url: "https://swgoh.gg/u/" + args[0] + "/collection/" + args[1] + "/",
                                fields: [
                                    {
                                        name: "Info",
                                        value: `Lvl ${data.level} ${data.stars}:star: ${data.gear}.`,
                                        inline: true
                                    },
                                    {
                                        name: "Health",
                                        value: data.health,
                                        inline: true
                                    },
                                    {
                                        name: "Protection",
                                        value: data.protection,
                                        inline: true
                                    },
                                    {
                                        name: "Speed",
                                        value: data.speed,
                                        inline: true
                                    },
                                    {
                                        name: "Potency",
                                        value: data.potency,
                                        inline: true
                                    },
                                    {
                                        name: "Tenacity",
                                        value: data.tenacity,
                                        inline: true
                                    },
                                    {
                                        name: "Crit Damage",
                                        value: data.crit_damage,
                                        inline: true
                                    },
                                    {
                                        name: "Basic Crit Chance",
                                        value: data.basic_crit_chance,
                                        inline: true
                                    },
                                    {
                                        name: "Special Crit Chance",
                                        value: data.special_crit_chance,
                                        inline: true
                                    },
                                    {
                                        name: "Basic Damage",
                                        value: data.basic_damage,
                                        inline: true
                                    },
                                    {
                                        name: "Special Damage",
                                        value: data.special_damage,
                                        inline: true
                                    }
                                ],
                                timestamp: new Date(),
                                footer: {
                                    icon_url: client.user.avatarURL,
                                }
                            }
                        });
                    });
                });
                break;
            case "gear":
                console.log("gear command triggered");
                message.channel.send("I'll get right on that <@" + message.author.id + ">")
                .then(sentMessage => {
                    getGearLevel(args[0], args[1], function (uuid, data) {
                        sentMessage.delete();
                        message.channel.send(
                            `Here's ${args[0]} gear level for ${args[1]}`,
                            {
                                files: [
                                    "/tmp/" + uuid + ".png"
                                ]
                            }
                        );
                        var fields = [];
                        for (var i = 0; i < data.length; i++) {
                            var field = {
                                name: "Needed:",
                                value: data[i],
                                inline: true
                            };
                            fields.push(field);
                        };
                        setTimeout( function() {
                            message.channel.send({
                                embed: {
                                    author: {
                                      name: client.user.username,
                                      icon_url: client.user.avatarURL
                                    },
                                    title: "Your also need these gear",
                                    url: "https://swgoh.gg/u/" + args[0] + "/collection/" + args[1] + "/",
                                    fields: fields,
                                    timestamp: new Date(),
                                    footer: {
                                      icon_url: client.user.avatarURL,
                                      text: ""
                                    }
                                }
                            });
                        }, 2000);
                    });
                });
                break;
            case "gear-needed":
                console.log("gear command triggered");
                message.channel.send("So demanding <@" + message.author.id + ">...")
                .then(sentMessage => {
                    getGearNeeded(args[0], args[1], function (uuid) {
                        sentMessage.delete();
                        var result = message.channel.send(
                            `Here's ${args[0]} gear needed for ${args[1]}`,
                            {
                                files: [
                                    "/tmp/" + uuid + ".png"
                                ]
                            }
                        );
                    });
                });
                break;
            case "skills":
                console.log("skills command triggered");
                message.channel.send("Its on the way via carrier pigeon <@" + message.author.id + ">")
                .then(sentMessage => {
                    getSkills(args[0], args[1], function (data) {
                        var fields = [];
                        var numMaxed = 0;
                        for (var i = 0; i < data.count; i++) {
                            var field = {
                                name: `${data[i].name} (${data[i].abilityType})`,
                                value: data[i].level,
                                inline: true
                            };
                            fields[i] = field;
                            if (field.value.endsWith("(MAXED)")) {
                                numMaxed += 1;
                            }
                        };
                        var descriptionText =
                            numMaxed == 0
                                ? `Awww, not one ability maxed here... ${config.emoji.disappointed}`
                                : (
                                    numMaxed == fields.length
                                        ? `Awesome job ${config.emoji.thumbsUp} All your abilities are maxed out`
                                        : (
                                            numMaxed > (fields.length / 2)
                                                ? `Good job! You've almost maxed all abilities`
                                                : `You're getting there, but you should work on your abilities a bit more ${config.emoji.slightSmile}`
                                        )
                                );
                        sentMessage.delete();
                        message.channel.send({embed: {
                            author: {
                              name: client.user.username,
                              icon_url: client.user.avatarURL
                            },
                            title: "Abilities for " + args[1],
                            url: "https://swgoh.gg/u/" + args[0] + "/collection/" + args[1] + "/",
                            description: descriptionText,
                            fields: fields,
                            timestamp: new Date(),
                            footer: {
                              icon_url: client.user.avatarURL,
                              text: "Generated on "
                            }
                          }
                        });
                    });
                });
                break;
            case "faction":
                console.log("faction command triggered");
                message.channel.send("Fine, i will fetch it for you <@" + message.author.id + ">")
                .then(sentMessage => {
                    getFaction(args[0], args[1], function (uuid) {
                        sentMessage.delete();
                        var result = message.channel.send(
                            `Here's ${args[0]} characters for ${args[1]} faction`,
                            {
                                files: [
                                    "/tmp/" + uuid + ".png"
                                ]
                            }
                        );
                    });
                });
                break;
            case "arena":
                message.channel.send("Formulating data...")
                .then(sentMessage => {
                    getArena(args[0], function (uuid, data) {
                        sentMessage.delete();
                        message.channel.send(
                            args[0] + " current arena team",
                            {
                                files: [
                                    "/tmp/" + uuid + ".png"
                                ]
                            }
                        );
                        var fields = [];
                        for (var i = 0; i < data.length; i++) {
                            var field = {
                                name: data[i].data.stars + ":star: " + data[i].data.gear + " " + data[i].name,
                                value: data[i].data.speed + " Speed\n" + data[i].data.health + " Health\n" + data[i].data.protection + " Protection",
                                inline: true
                            };
                            fields.push(field);
                        };
                        setTimeout( function() {
                            var rankState = data.currentRank > data.averageRank;
                            message.channel.send({
                                embed: {
                                    author: {
                                      name: client.user.username,
                                      icon_url: client.user.avatarURL
                                    },
                                    title: "Some basic details on your team",
                                    description: (rankState ? "Good work, your arena rank is improving" : "Unfortunatley your arena rank is dropping") + `. Your current rank is ${data.currentRank} which is ` + (rankState ? "better" : "worse") + ` than your average rank of ${data.averageRank}.\nHighest recorded rank is ${data.highestRank}\nLowest recorded rank is ${data.lowestRank}`,
                                    url: "https://swgoh.gg/u/" + args[0],
                                    fields: fields,
                                    timestamp: new Date(),
                                    footer: {
                                      icon_url: client.user.avatarURL,
                                      text: ""
                                    }
                                }
                            });
                        }, 2000);
                    });
                });
                break;
            case "ship-skills":
                console.log("skills command triggered");
                message.channel.send("Its on it's way <@" + message.author.id + ">")
                .then(sentMessage => {
                    getShipSkills(args[0], args[1], function (data) {
                        var fields = [];
                        var numMaxed = 0;
                        for (var i = 0; i < data.count; i++) {
                            var field = {
                                name: `${data[i].name} (${data[i].abilityType})`,
                                value: data[i].level + (data[i].crew ? `\n${data[i].crew}` : ""),
                                inline: true
                            };
                            fields[i] = field;
                            if (field.value.endsWith("(MAXED)")) {
                                numMaxed += 1;
                            }
                        };
                        var descriptionText =
                            numMaxed == 0
                                ? `Awww, not one ability maxed here... ${config.emoji.disappointed}`
                                : (
                                    numMaxed == fields.length
                                        ? `Awesome job ${config.emoji.thumbsUp} All your abilities are maxed out`
                                        : (
                                            numMaxed > (fields.length / 2)
                                                ? `Good job! You've almost maxed all abilities`
                                                : `You're getting there, but you should work on your abilities a bit more ${config.emoji.slightSmile}`
                                        )
                                );
                        sentMessage.delete();
                        message.channel.send({embed: {
                            author: {
                                name: client.user.username,
                                icon_url: client.user.avatarURL
                            },
                            title: "Abilities for " + args[1],
                            url: "https://swgoh.gg/u/" + args[0] + "/collection/" + args[1] + "/",
                            description: descriptionText,
                            fields: fields,
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "Generated on "
                            }
                          }
                        });
                    });
                });
                break;
            case "ship-faction":
                console.log("ship faction command triggered");
                message.channel.send("Ok, collecting data <@" + message.author.id + ">")
                .then(sentMessage => {
                    getShipFaction(args[0], args[1], function (uuid) {
                        sentMessage.delete();
                        var result = message.channel.send(
                            `Here's ${args[0]} ships for ${args[1]} faction`,
                            {
                                files: [
                                    "/tmp/" + uuid + ".png"
                                ]
                            }
                        );
                    });
                });
                break;
            case "guild-info":
                message.channel.send(`${config.emoji.construction} Currently in development ${config.emoji.worker}`);
                break;
            case "guild-list":
                message.channel.send(`${config.emoji.construction} Currently in development ${config.emoji.worker}`);
                break;
        }
        console.log("done");
    }
    console.log("finished message processing");
});

client.login(auth.token);

function calculateGP(message) {
    var config = require("./Config/config.json");
    var channel = message.guild.channels.find("name", config.tbRecords);
    channel.fetchMessages({
        limit: 100,
    }).then((messages) => {
        var total = 0;
        var num = 0;
        messages.forEach(
            function(currentValue, currentIndex, listObj) {
                if (currentValue.author.bot) return;
                var amount = getNum(currentValue);
                total += amount;
                num += 1;
            }
        );
        message.channel.send(num + ") " + total.toLocaleString() + " GP available");
    });

}

function getNum(currentValue) {
    var content = currentValue.toString().replace(/,/g, "").replace(/\s/g, "");
    var amount = 0;
    try {
        if (content.endsWith("k")) {
            // console.log("thousand");
            amount = parseInt(content.substring(0, content.length - 1).trim() * 1000);
        }
        else if (content.endsWith("m")) {
            // console.log("mil 1");
            amount = parseInt(content.substring(0, content.length - 1).trim() * 1000000);
        }
        else if (content.endsWith("mil")) {
            // console.log("mil 2");
            amount = parseInt(content.substring(0, content.length - 3).trim() * 1000000);
        }
        else if (content.endsWith("million")) {
            // console.log("mil 3");
            amount = parseInt(content.substring(0, content.length - 7).trim() * 1000000);
        }
        else {
            // console.log("normal");
            amount = parseInt(content);
        }
    } catch (e) {
        console.log("Couldn't parse " + content);
    }
    // console.log("value(" + currentValue + "): " + amount);
    return amount;
}

function purgeChannel(message) {
    var config = require("./Config/config.json");
    var channel = message.guild.channels.find("name", config.tbRecords);
    channel.fetchMessages({
        limit: 100,
    }).then((messages) => {
        if (messages.size == 100) {
            purgeChannel(message);
        }
        channel.bulkDelete(messages).catch(error => console.log(error.stack));
    });
}

function remindMe(howManyTimesToRun, timeToWait, callback) {
    for (var i = 0; i < howManyTimesToRun; i++) {
        setTimeout(
            function(){
                callback();
            },
            timeToWait * (i + 1)
        );
    }
}

function getArena(user, callback) {
    console.log("getting arena team for " + user);
    const uuid = guid();
    console.log("uuid: " + uuid);
    var phantomjs = require("phantomjs-prebuilt");
    var program = phantomjs.exec("./Phantom/getArena.js", uuid, user);
    program.stdout.pipe(process.stdout);
    program.stderr.pipe(process.stderr);
    program.on("exit", code => {
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
                        "name": decode(name),
                        "url": char
                    };
                    data.push(member);
                }
                data["currentRank"] = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li:nth-child(5) > div > div.current-rank > div.current-rank-info > div.current-rank-value").html();
                data["highestRank"] = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li:nth-child(5) > div > div.stat-listing.stats-arena > div:nth-child(1) > div.stat-item-info > div.stat-item-value").html();
                data["lowestRank"] = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li:nth-child(5) > div > div.stat-listing.stats-arena > div:nth-child(2) > div.stat-item-info > div.stat-item-value").html();
                data["averageRank"] = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li:nth-child(5) > div > div.stat-listing.stats-arena > div:nth-child(3) > div.stat-item-info > div.stat-item-value").html();
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
                                    callback(uuid, data);
                                });
                            });
                        });
                    });
                });
            } else {
                console.log("We’ve encountered an error: " + error);
            }
        });
    });
}
function getMeta(which, callback) {
    console.log("getting meta report for " + which);
    const uuid = guid();
    console.log("uuid: " + uuid);
    var phantomjs = require("phantomjs-prebuilt");
    var program = phantomjs.exec("./Phantom/getMeta.js", uuid, which);
    program.stdout.pipe(process.stdout);
    program.stderr.pipe(process.stderr);
    program.on("exit", code => {
        callback(uuid);
    });
}
function getMods(user, char, callback) {
    console.log("getting image for " + user + ", character: " + char);
    const uuid = guid();
    console.log("uuid: " + uuid);
    var phantomjs = require("phantomjs-prebuilt");
    var program = phantomjs.exec("./Phantom/getMods.js", uuid, user, char);
    program.stdout.pipe(process.stdout);
    program.stderr.pipe(process.stderr);
    program.on("exit", code => {
        callback(uuid);
    });
}
function getGearLevel(user, char, callback) {
    console.log("getting gear level for " + user + ", character: " + char);
    const uuid = guid();
    console.log("uuid: " + uuid);
    var phantomjs = require("phantomjs-prebuilt");
    var program = phantomjs.exec("./Phantom/getGearLevel.js", uuid, user, char);
    program.stdout.pipe(process.stdout);
    program.stderr.pipe(process.stderr);
    program.on("exit", code => {
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
            callback(uuid, data);
          } else {
            console.log("We’ve encountered an error: " + error);
          }
        });
    });
}
function getGearNeeded(user, char, callback) {
    console.log("getting gear needed for " + user + ", character: " + char);
    const uuid = guid();
    console.log("uuid: " + uuid);
    var phantomjs = require("phantomjs-prebuilt");
    var program = phantomjs.exec("./Phantom/getGearNeeded.js", uuid, user, char);
    program.stdout.pipe(process.stdout);
    program.stderr.pipe(process.stderr);
    program.on("exit", code => {
        callback(uuid);
    });
}
function getSkills(user, char, callback) {
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
            var abilityTypes = {};
            for (var i = 0; i < data.count; i++) {
                var abilityName = $("body > div.container.p-t-sm > div.content-container > div.content-container-primary > ul > li:nth-child(" + ((i + 1) * 2) + ") > a > div > div > h5").html();
                var abilityData = $("body > div.container.p-t-sm > div.content-container > div.content-container-primary > ul > li:nth-child(" + ((i + 1) * 2) + ") > a > div > div > small").html();
                var abilityArray = abilityData.split("&#xB7;")
                var abilityType = decode(abilityArray[1]).trim();
                abilityName = decode(abilityName).trim();
                if (abilityName.includes("<")) {
                    abilityName = abilityName.substring(0, abilityName.indexOf("<")).trim();
                }
                abilityTypes[abilityName] = abilityType;
            }
            for (var i = 0; i < data.count; i++) {
                data[i].abilityType = abilityTypes[data[i].name];
            }
            callback(data);
          } else {
            console.log("We’ve encountered an error: " + error);
          }
        });
    }
}
function getFaction(user, faction, callback) {
    console.log("getting characters for " + user + ", faction: " + faction);
    const uuid = guid();
    console.log("uuid: " + uuid);
    var phantomjs = require("phantomjs-prebuilt");
    var program = phantomjs.exec("./Phantom/getFaction.js", uuid, user, faction);
    program.stdout.pipe(process.stdout);
    program.stderr.pipe(process.stderr);
    program.on("exit", code => {
        callback(uuid);
    });
}
function getShipFaction(user, faction, callback) {
    console.log("getting ships for " + user + ", faction: " + faction);
    const uuid = guid();
    console.log("uuid: " + uuid);
    var phantomjs = require("phantomjs-prebuilt");
    var program = phantomjs.exec("./Phantom/getShipFaction.js", uuid, user, faction);
    program.stdout.pipe(process.stdout);
    program.stderr.pipe(process.stderr);
    program.on("exit", code => {
        callback(uuid);
    });
}
function getShipSkills(user, ship, callback) {
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
            getAbilityType(ship, data, callback);
        } else {
            console.log("We’ve encountered an error: " + error);
        }
    });

    function getAbilityType(ship, data, callback) {
        var request = require('request');
        var cheerio = require('cheerio');

        request("https://swgoh.gg/ships/" + ship + "/", function (error, response, body) {
          if (!error) {
            var $ = cheerio.load(body);
            var decode = require('decode-html');
            var abilityTypes = {};
            for (var i = 0; i < data.count; i++) {
                var abilityName = $("body > div.container.p-t-sm > div.content-container > div.content-container-primary > ul > li:nth-child(" + ((i + 1) * 2) + ") > a > div > div > h5").html();
                var abilityData = $("body > div.container.p-t-sm > div.content-container > div.content-container-primary > ul > li:nth-child(" + ((i + 1) * 2) + ") > a > div > div > small").html();
                var abilityArray = abilityData.split("&#xB7;")
                var abilityType = decode(abilityArray[1]).trim();
                abilityName = decode(abilityName).trim();
                if (abilityName.includes("<")) {
                    abilityName = abilityName.substring(0, abilityName.indexOf("<")).trim();
                }
                abilityTypes[abilityName] = abilityType;
            }
            for (var i = 0; i < data.count; i++) {
                data[i].abilityType = abilityTypes[data[i].name];
            }
            callback(data);
          } else {
            console.log("We’ve encountered an error: " + error);
          }
        });
    }
}
function getInfo(user, char, callback) {
    console.log("getting info for " + char + " on profile " + user);
    var url = 'https://swgoh.gg/u/' + user + '/collection/' + char + '/';

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
        var basic_damage = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(4) > .media-body > .media-body > .pc-stat:nth-child(1) > .pc-stat-value").html();
        var basic_crit_chance = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(4) > .media-body > .media-body > .pc-stat:nth-child(2) > .pc-stat-value").html();
        var special_damage = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(6) > .media-body > .media-body > .pc-stat:nth-child(1) > .pc-stat-value").html();
        var special_crit_chance = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(6) > .media-body > .media-body > .pc-stat:nth-child(2) > .pc-stat-value").html();
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

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}
