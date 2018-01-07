// rgb color calc = https://www.shodor.org/stella2java/rgbint.html
var auth = require("./Config/auth.json");
const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
    console.log("Systems initialized");
    client.user.setPresence({game: {name: "humans like a chessboard", type: 0}});
    client.user.setUsername("Samaritan");
});

client.on("messageUpdate", (message, newMessage) => {
    console.log("updated message");

    if (message.author.bot) return;

    var config = require("./Config/config.json");

    if (config.logMessages === true) {
        var username = message.member.guild.members.get(message.author.id).nickname;
        username = username === null ? message.author.username + "#" + message.author.discriminator : username;
        var channel = message.channel.name;
        var logMessage = username + " changed message in `" + channel + "` from: ```" + message.content + "```to: ```" + newMessage.content + "```";
        for (var [id, user] of message.mentions.users) {
            var mentionedName = message.member.guild.members.get(id).nickname;
            mentionedName = mentionedName === null ? user.username + "#" + user.discriminator : mentionedName;
            logMessage = logMessage.replace(`<@!${id}>`, `${mentionedName}`);
            logMessage = logMessage.replace(`<@${id}>`, `${mentionedName}`);
        }
        for (var [id, user] of newMessage.mentions.users) {
            var mentionedName = newMessage.member.guild.members.get(id).nickname;
            mentionedName = mentionedName === null ? user.username + "#" + user.discriminator : mentionedName;
            logMessage = logMessage.replace(`<@!${id}>`, `${mentionedName}`);
            logMessage = logMessage.replace(`<@${id}>`, `${mentionedName}`);
        }
        message.guild.channels.find("name", "bot-logs").send(logMessage);
    }

    if (message.channel.name == config.tbRecords) {
        console.log("updated message detected in tb records channel");
        message.channel.send("Recalculating gp totals")
        .then(sentMessage => {
            setTimeout(function() {
                sentMessage.delete();
                recalculateGP(message);
            }, 2000);
        });
    }
});

client.on("messageDelete", (message) => {
    console.log("deleted message");

    if (message.author.bot) return;

    var config = require("./Config/config.json");

    if (config.logMessages === true) {
        var username = message.member.guild.members.get(message.author.id).nickname;
        username = username === null ? message.author.username + "#" + message.author.discriminator : username;
        var channel = message.channel.name;
        var mentions = message.mentions.users;
        var logMessage = "A message by " + username + " was deleted in `" + channel + "`: ```" + message.content + "```";
        for (var [id, user] of mentions) {
            var mentionedName = message.member.guild.members.get(id).nickname;
            mentionedName = mentionedName === null ? user.username + "#" + user.discriminator : mentionedName;
            logMessage = logMessage.replace(`<@!${id}>`, `${mentionedName}`);
            logMessage = logMessage.replace(`<@${id}>`, `${mentionedName}`);
        }
        message.guild.channels.find("name", "bot-logs").send(logMessage);
    }

    if (message.channel.name == config.tbRecords) {
        console.log("deleted message detected in tb records channel");
        message.channel.send("Recalculating gp totals")
        .then(sentMessage => {
            setTimeout(function() {
                sentMessage.delete();
                recalculateGP(message);
            }, 2000);
        });
    }
    // else {
    //     message.channel.send("You deleted a message! Are you trying to hide something?..")
    //     .then(sentMessage => {
    //         sentMessage.delete();
    //     });
    // }
});

client.on("message", (message) => {
    if (message.author.bot) return;

    var config = require("./Config/config.json");

    if (config.logMessages === true) {
        var username = message.member.guild.members.get(message.author.id).nickname;
        username = username === null ? message.author.username + "#" + message.author.discriminator : username;
        var channel = message.channel.name;
        var mentions = message.mentions.users;
        var logMessage = username + " said in `" + channel + "`: ```" + message.content + "```";
        for (var [id, user] of mentions) {
            var mentionedName = message.member.guild.members.get(id).nickname;
            mentionedName = mentionedName === null ? user.username + "#" + user.discriminator : mentionedName;
            logMessage = logMessage.replace(`<@!${id}>`, `${mentionedName}`);
            logMessage = logMessage.replace(`<@${id}>`, `${mentionedName}`);
        }
        message.guild.channels.find("name", "bot-logs").send(logMessage);
    }

    try {
        if (message.mentions.users.first() != undefined && message.mentions.users.first().username == client.user.username) {
            message.channel.send("Yes?..");
        }
    } catch (error) {
        console.log(error);
    }
    if (message.content.toLowerCase() === "lol") {
        message.channel.send("LOLOLOLOLOL! Hilarious...")
        .then(sentMessage => {
            setTimeout( function() {
                sentMessage.delete();
            }, 2000);
            message.react("😆");
            message.react("😂");
        });
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
    if (message.channel.type == "dm") {
        message.channel.send("Ooh, a personal chat, shall we gossip?");
    }
    if (message.content.startsWith(config.commandPrefix)) {
        var args = message.content.slice(config.commandPrefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        switch(command) {
            case "tw-info":
                console.log("tw-info command triggered");
                var url = config.twguild;
                var char = args.join(" ");
                if (char === "") {
                    message.channel.send("Please specify a character");
                    break;
                }
                message.channel.send("Calculating the fate of the universe...")
                .then(sentMessage => {
                    getGuildInfo(url, char, function(data) {
                        console.log(JSON.stringify(data));
                        var gear12s = data.filter(function(user) {
                            return user.stats.gear == 12;
                        });
                        var gear11s = data.filter(function(user) {
                            return user.stats.gear == 11;
                        });
                        var gear10s = data.filter(function(user) {
                            return user.stats.gear == 10;
                        });
                        var star7s = data.filter(function(user) {
                            return user.stats.stars == 7;
                        });
                        var star6s = data.filter(function(user) {
                            return user.stats.stars == 6;
                        });
                        var star5s = data.filter(function(user) {
                            return user.stats.stars == 5;
                        });
                        var zetas = {};
                        for (var userIndex = 0; userIndex < data.length; userIndex++) {
                            for (var charIndex = 0; charIndex < data[userIndex].zeta.zetas.length; charIndex++) {
                                var name = data[userIndex].zeta.zetas[charIndex].name;
                                if (!zetas.hasOwnProperty(name)) {
                                    zetas[name] = {};
                                }
                                for (var zetaIndex = 0; zetaIndex < data[userIndex].zeta.zetas[charIndex].zetas.length; zetaIndex++) {
                                    var zeta = data[userIndex].zeta.zetas[charIndex].zetas[zetaIndex];
                                    if (!zetas[name].hasOwnProperty(zeta)) {
                                        zetas[name][zeta] = 0;
                                    }
                                    zetas[name][zeta] += 1;
                                }
                            }
                        }
                        // console.log(JSON.stringify(zetas));
                        var gearDetailsContent = message.guild.emojis.find("name", "gear12") + ": " + gear12s.length;
                        gearDetailsContent += "\n" + message.guild.emojis.find("name", "gear11") + ": " + gear11s.length;
                        gearDetailsContent += "\n" + message.guild.emojis.find("name", "gear10") + ": " + gear10s.length;
                        var starDetailsContent = "\n7" + message.guild.emojis.find("name", "swgohstar") + ": " + star7s.length;
                        starDetailsContent += "\n6" + message.guild.emojis.find("name", "swgohstar") + ": " + star6s.length;
                        starDetailsContent += "\n5" + message.guild.emojis.find("name", "swgohstar") + ": " + star5s.length;
                        var otherDetailsContent = "Coming soon...";
                        console.log(JSON.stringify(Object.keys(zetas)));
                        var fields = [
                            {
                                name: "Gear Details",
                                value: gearDetailsContent,
                                inline: true
                            },{
                                name: "Star Details",
                                value: starDetailsContent,
                                inline: true
                            }, {
                                name: "Other Details",
                                value: otherDetailsContent,
                                inline: true
                            }
                        ];
                        message.channel.send({
                            embed: {
                                author: {
                                  name: client.user.username + " (Spy version)",
                                  icon_url: client.user.avatarURL
                                },
                                title: "Info on your opponents " + char,
                                fields: fields,
                                timestamp: new Date(),
                                footer: {
                                  icon_url: client.user.avatarURL,
                                  text: ""
                                }
                            }
                        });
                        sentMessage.delete();
                    });
                });
                break;
            case "tw-zetas":
                console.log("tw-info command triggered");
                var url = config.twguild;
                message.channel.send("Calculating the fate of the universe...")
                .then(sentMessage => {
                    getGuildZetas(url, function(data) {
                        console.log(JSON.stringify(data));
                        var zetas = {};
                        for (var userIndex = 0; userIndex < data.length; userIndex++) {
                            for (var charIndex = 0; charIndex < data[userIndex].zeta.zetas.length; charIndex++) {
                                var name = data[userIndex].zeta.zetas[charIndex].name;
                                if (!zetas.hasOwnProperty(name)) {
                                    zetas[name] = {};
                                }
                                for (var zetaIndex = 0; zetaIndex < data[userIndex].zeta.zetas[charIndex].zetas.length; zetaIndex++) {
                                    var zeta = data[userIndex].zeta.zetas[charIndex].zetas[zetaIndex];
                                    if (!zetas[name].hasOwnProperty(zeta)) {
                                        zetas[name][zeta] = 0;
                                    }
                                    zetas[name][zeta] += 1;
                                }
                            }
                        }
                        var zetasList = [];
                        var fields = [];
                        Object.keys(zetas).forEach(
                            function(charName, charIndex, listObj) {
                                console.log(charName);
                                var zetaList = {};
                                zetaList.name = charName;
                                zetaList.num = 0;
                                zetaList.list = [];
                                Object.keys(zetas[charName]).forEach(
                                    function(zetaName, zetaIndex, listObj) {
                                        console.log(zetaName);
                                        var zetaInfo = {}
                                        zetaInfo.name = zetaName;
                                        zetaInfo.num = zetas[charName][zetaName];
                                        zetaList.num += zetas[charName][zetaName];
                                        zetaList.list.push(zetaInfo);
                                    }
                                );
                                zetasList.push(zetaList);
                            }
                        );

                        for (var i = 0; i < zetasList.length - 1; i++) {
                            for (var k = i + 1; k < zetasList.length; k++) {
                                if (zetasList[i].num < zetasList[k].num) {
                                    var temp = zetasList[i];
                                    zetasList[i] = zetasList[k];
                                    zetasList[k] = temp;
                                }
                                if (zetasList[i].num === zetasList[k].num) {
                                    if (zetasList[i].list.length < zetasList[k].list.length) {
                                        var temp = zetasList[i];
                                        zetasList[i] = zetasList[k];
                                        zetasList[k] = temp;
                                    }
                                }
                            }
                        }

                        for (var i = 0; i < zetasList.length; i++) {
                            if (zetasList[i].list.length > 1) {
                                for (var l = 0; l < zetasList[i].list.length - 1; l++) {
                                    for (var m = l + 1; m < zetasList[i].list.length; m++) {
                                        if (zetasList[i].list[l].num < zetasList[i].list[m].num) {
                                            var temp = zetasList[i].list[l];
                                            zetasList[i].list[l] = zetasList[i].list[m];
                                            zetasList[i].list[m] = temp;
                                        }
                                    }
                                }
                            }
                        }
                        console.log(JSON.stringify(zetasList));
                        for (var charIndex = 0; charIndex < zetasList.length; charIndex++) {
                            var charName = zetasList[charIndex].name;
                            var field = {
                                name: charName + ` (${zetasList[charIndex].num})`,
                                value: "",
                                inline: true
                            };
                            for (var zetaIndex = 0; zetaIndex < zetasList[charIndex].list.length; zetaIndex++) {
                                var zetaName = zetasList[charIndex].list[zetaIndex].name;
                                var zetaNum = zetasList[charIndex].list[zetaIndex].num;
                                field.value += `${zetaName}: ${zetaNum}\n`;
                            }
                            fields.push(field);
                        }
                        message.channel.send({
                            embed: {
                                author: {
                                  name: client.user.username + " (Spy version)",
                                  icon_url: client.user.avatarURL
                                },
                                title: "Info on your opponents zetas",
                                fields: fields,
                                timestamp: new Date(),
                                footer: {
                                  icon_url: client.user.avatarURL,
                                  text: ""
                                }
                            }
                        });
                        sentMessage.delete();
                    });
                });
                break;
            case "events":
                console.log("events command triggered");
                message.channel.send("Forecasting the future like a boss...")
                .then(sentMessage => {
                    getSwgohEvents(function(data) {
                        var fields = [];
                        var list = {};

                        for (var i = 0; i < data.length; i++) {
                            if (list[data[i].date] == undefined) {
                                list[data[i].date] = [];
                            }
                            list[data[i].date].push(data[i]);
                        }

                        var keys = [];
                        for (var date in list) {
                            if (list.hasOwnProperty(date)) {
                                keys.push(date);
                            }
                        }
                        keys.sort();

                        var confirmedOnly = args.indexOf("-confirmed") === -1 ? false : true;
                        var estimatedOnly = args.indexOf("-estimated") === -1 ? false : true;
                        var unknownOnly = args.indexOf("-unknown") === -1 ? false : true;

                        if (confirmedOnly) {
                            args.splice(args.indexOf("-confirmed"), 1);
                        }

                        if (estimatedOnly) {
                            args.splice(args.indexOf("-estimated"), 1);
                        }

                        if (unknownOnly) {
                            args.splice(args.indexOf("-unknown"), 1);
                        }

                        for (var j = 0; j < keys.length; j++) {
                            var date = keys[j];
                            var events = "";
                            for (var i = 0; i < list[date].length; i++) {
                                if (confirmedOnly && list[date][i].state.toLowerCase() !== "confirmed") {
                                    continue;
                                }
                                if (estimatedOnly && list[date][i].state.toLowerCase() !== "estimated") {
                                    continue;
                                }
                                if (unknownOnly && list[date][i].state.toLowerCase() !== "unknown") {
                                    continue;
                                }

                                if (args.length !== 0) {
                                    var addThisOne = false;
                                    for (var k = 0; k < args.length; k++) {
                                        if (list[date][i].name.toLowerCase().indexOf(args[k]) !== -1) {
                                            if (addThisOne == false) {
                                                addThisOne = true;
                                            }
                                        }
                                    }
                                    if (addThisOne) {
                                        events += list[date][i].name + " (" + list[date][i].state + ")\n";
                                    }
                                } else {
                                    events += list[date][i].name + " (" + list[date][i].state + ")\n";
                                }
                            }
                            if (events === "") {
                                continue;
                            }
                            var field = {
                                name: "Events On " + date,
                                value: events,
                                inline: true
                            };
                            fields.push(field);
                        }
                        if (fields.length === 0) {
                            message.channel.send("No events matching the search terms unfortunately");
                        } else {
                            message.channel.send({
                                embed: {
                                    author: {
                                      name: client.user.username,
                                      icon_url: client.user.avatarURL
                                    },
                                    title: "Future SWGOH Events",
                                    fields: fields,
                                    timestamp: new Date(),
                                    footer: {
                                      icon_url: client.user.avatarURL,
                                      text: ""
                                    }
                                }
                            });
                            sentMessage.delete();
                        }
                    });
                });
                break;
            case "gp":
                console.log("gp command triggered");
                message.channel.send("Sure thing")
                .then(sentMessage => {
                    var swgohName = getSwgohName(message);
                    if (swgohName) {
                        getGp(swgohName, function(data) {
                            message.channel.send(`Your Character GP: ${data.characterGp}\nYour Ships GP: ${data.shipGp}\nTotal GP: ${data.totalGp}`);
                        });
                    } else {
                        sendSwgohNameError(message);
                    }
                    sentMessage.delete();
                });
                break;
            case "tbgp":
                console.log("tbgp command triggered");
                var url = config.guild;
                message.channel.send("Calculating the fate of the universe...")
                .then(sentMessage => {
                    getGuildGp(url, function(data) {
                        // console.log(JSON.stringify(data));
                        // var list = "";
                        data = data.sort(function(a, b) {
                            return a.user.name.toLowerCase().localeCompare(b.user.name.toLowerCase());
                        });
                        var totalGuildGP = 0;
                        var messages = [];
                        var listMessage = "";
                        for (var i = 0; i < data.length; i++) {
                            var name = data[i].user.name;
                            var charGP = parseInt(data[i].gp.characterGp.replace(/,/g, ""));
                            var shipGP = parseInt(data[i].gp.shipGp.replace(/,/g, ""));
                            var totalGP = (parseInt(charGP) * 6) + (parseInt(shipGP) * 4);
                            totalGuildGP += totalGP;
                            totalGP = totalGP.toLocaleString();
                            var entry = name + ":\n\tChars: " + charGP.toLocaleString() + " GP Points\n\tShips: " + shipGP.toLocaleString() + " GP Points\n\tTotal: " + totalGP.toLocaleString() + " GP Points\n";
                            if (listMessage.length + entry.length > 2000) {
                                messages.push(listMessage);
                                listMessage = "";
                            }
                            listMessage += entry;
                            // list += entry;
                        }
                        var totalMessage = "\n==================\n\nTotal: " + totalGuildGP.toLocaleString() + " GP Points";
                        if ((listMessage.length + totalMessage.length) > 2000) {
                            messages.push(listMessage);
                            listMessage = "";
                        }
                        listMessage += totalMessage;
                        messages.push(listMessage);
                        sentMessage.delete();
                        for (var i = 0; i < messages.length; i++) {
                            message.channel.send(messages[i]);
                        }
                    });
                });
                break;
            case "add":
                const whatToAdd = args.shift();
                switch (whatToAdd) {
                    case "user":
                        console.log("add user command triggered");
                        var fs = require("fs");
                        var users = require("./Config/users.json");
                        if (message.mentions.users.first() === undefined) {
                            users[message.author.id] = encodeURI(args.join(" "));
                        } else {
                            var doesHeHaveThePower = false;
                            message.member.roles.forEach(
                                function(role, currentIndex, listObj) {
                                    if (role.name === "Officers" || role.name === "admin") {
                                        doesHeHaveThePower = true;
                                    }
                                }
                            );
                            if (doesHeHaveThePower) {
                                var name = args.join(" ").toLowerCase().replace(/<.*>/g, "").trim();
                                if (args[0].startsWith("<@") && args[0].endsWith(">")) {
                                    args.shift();
                                    users[message.mentions.users.first().id] = encodeURI(name);
                                } else {
                                    users[message.mentions.users.first().id] = encodeURI(name);
                                }
                            } else {
                                message.channel.send("Sorry, but you don't have the access to add users for other people")
                                .then(sentMessage => {
                                    setTimeout(
                                        function () {
                                            sentMessage.delete();
                                        },
                                        3000
                                    );
                                });
                            }
                        }
                        fs.writeFile("./Config/users.json", JSON.stringify(users, null, 4), "utf8", function(err, data) {
                            if (err) {
                                message.channel.send("Whoops, i couldn't add your user")
                                .then(sentMessage => {
                                    setTimeout(
                                        function () {
                                            sentMessage.delete();
                                        },
                                        3000
                                    );
                                });
                            } else {
                                message.channel.send("Successfully added user")
                                .then(sentMessage => {
                                    setTimeout(
                                        function () {
                                            sentMessage.delete();
                                        },
                                        3000
                                    );
                                });
                            }
                        });
                        break;
                    case "alias":
                        console.log("add alias command triggered");
                        var fs = require("fs");
                        var aliases = require("./Config/aliases.json");
                        var doesHeHaveThePower = false;
                        message.member.roles.forEach(
                            function(role, currentIndex, listObj) {
                                if (role.name === "Officers" || role.name === "admin") {
                                    doesHeHaveThePower = true;
                                }
                            }
                        );
                        if (doesHeHaveThePower) {
                            var name = args.shift().toLowerCase();
                            var alias = args.join(" ").toLowerCase();
                            aliases[alias] = name;
                        } else {
                            message.channel.send("Sorry, but you don't have the access to add aliases")
                            .then(sentMessage => {
                                setTimeout(
                                    function () {
                                        sentMessage.delete();
                                    },
                                    3000
                                );
                            });
                        }
                        fs.writeFile("./Config/aliases.json", JSON.stringify(aliases, null, 4), "utf8", function(err, data) {
                            if (err) {
                                message.channel.send("Whoops, i couldn't add your alias")
                                .then(sentMessage => {
                                    setTimeout(
                                        function () {
                                            sentMessage.delete();
                                        },
                                        3000
                                    );
                                });
                            } else {
                                message.channel.send("Successfully added alias")
                                .then(sentMessage => {
                                    setTimeout(
                                        function () {
                                            sentMessage.delete();
                                        },
                                        3000
                                    );
                                });
                            }
                        });
                        break;
                    default:
                        console.log("unknown add command: " + whatToAdd + ": " + args);
                }
                break;
            case "removeuser":
                console.log("remove user command triggered");
                var fs = require("fs");
                var users = require("./Config/users.json");
                if (message.mentions.users.first() === undefined) {
                    delete users[message.author.id];
                } else {
                    var doesHeHaveThePower = false;
                    message.member.roles.forEach(
                        function(role, currentIndex, listObj) {
                            if (role.name === "Officers" || role.name === "admin") {
                                doesHeHaveThePower = true;
                            }
                        }
                    );
                    if (doesHeHaveThePower) {
                        delete users[message.mentions.users.first().id];
                    } else {
                        message.channel.send("Sorry, but you don't have the access to add users for other people")
                        .then(sentMessage => {
                            setTimeout(
                                function () {
                                    sentMessage.delete();
                                },
                                3000
                            );
                        });
                    }
                }
                fs.writeFile("./Config/users.json", JSON.stringify(users, null, 4), "utf8", function(err, data) {
                    if (err) {
                        message.channel.send("Whoops, i couldn't remove your user")
                        .then(sentMessage => {
                            setTimeout(
                                function () {
                                    sentMessage.delete();
                                },
                                3000
                            );
                        });
                    } else {
                        message.channel.send("Successfully removed user")
                        .then(sentMessage => {
                            setTimeout(
                                function () {
                                    sentMessage.delete();
                                },
                                3000
                            );
                        });
                    }
                });
                break;
            case "list":
                const whatToList = args.shift();
                switch (whatToList) {
                    case "user":
                    case "users":
                        console.log("list users command triggered");
                        var fs = require("fs");
                        var users = require("./Config/users.json");
                        var doesHeHaveThePower = false;
                        message.member.roles.forEach(
                            function(role, currentIndex, listObj) {
                                if (role.name === "Officers" || role.name === "admin") {
                                    doesHeHaveThePower = true;
                                }
                            }
                        );
                        if (doesHeHaveThePower) {
                            var list = "";
                            for (var userId in users) {
                                var username;
                                if (message.channel.guild.members.get(userId) === undefined) {
                                    continue;
                                }
                                if (message.channel.guild.members.get(userId).nickname === null) {
                                    username = message.channel.guild.members.get(userId).user.username;
                                } else {
                                    username = message.channel.guild.members.get(userId).nickname;
                                }
                                list += `${username} has swgoh name: ${decodeURI(users[userId])}\n`;
                            }
                            message.channel.send(list);
                        } else {
                            message.channel.send("Sorry, but you don't have the access to list users")
                            .then(sentMessage => {
                                setTimeout(
                                    function () {
                                        sentMessage.delete();
                                    },
                                    3000
                                );
                            });
                        }
                        break;
                    case "alias":
                    case "aliases":
                        console.log("list alias command triggered");
                        var fs = require("fs");
                        var aliases = require("./Config/aliases.json");
                        var list = "";
                        var messages = [];
                        for (var aliasName in aliases) {
                            var content = `\`${aliasName}\` has alias: \`${aliases[aliasName]}\`\n`;
                            if (list.length + content.length > 2000) {
                                messages.push(list);
                                list = "";
                            }
                            list += content;
                        }
                        if (messages.length == 0) {
                            if (list == "") {
                                messages.push("None yet");
                            } else {
                                messages.push(list);
                            }
                        }
                        for (var i = 0; i < messages.length; i++) {
                            message.channel.send(messages[i]);
                        }
                        break;
                    default:
                        console.log("unknown list command: " + whatToList + ": " + args);
                }
                break;
            case "time":
                console.log("time command triggered");
                message.channel.send(`:clock12:`)
                .then(sentMessage => {
                    for (var i = 0; i < 12*5; i++) {
                        setTimeout(sendTime, (i + 1) * 500, sentMessage, i + 1);
                    }
                    function sendTime(sentMessage, num) {
                        sentMessage.edit(`:clock` + ((num % 12) + 1) + `:`);
                    }
                });
                break;
            case "face":
                console.log("face command triggered");
                message.channel.send(`${config.emoji.faces[0]}`)
                .then(sentMessage => {
                    for (var i = 0; i < 4*5; i++) {
                        setTimeout(sendTime, (i + 1) * 500, sentMessage, i);
                    }
                    function sendTime(sentMessage, num) {
                        sentMessage.edit(`${config.emoji.faces[num % 4]}`);
                    }
                });
                break;
            case "purge":
                console.log("purge command triggered");
                var doesHeHaveThePower = false;
                message.member.roles.forEach(
                    function(role, currentIndex, listObj) {
                        if (role.name === "Officers" || role.name === "admin") {
                            doesHeHaveThePower = true;
                        }
                    }
                );
                if (doesHeHaveThePower) {
                    message.channel.send('Are you sure? Answer yes or no')
                    .then(sentMessage => {
                        message.channel.awaitMessages(response => (response.content.toLowerCase() === 'yes' || response.content.toLowerCase() === 'no'), {
                            max: 1,
                            time: 30000,
                            errors: ['time'],
                        })
                        .then((collected) => {
                            if (collected.first().content.toLowerCase() === "yes") {
                                message.channel.send(`Ok, purging channel...`)
                                .then(sentMessage2 => {
                                    setTimeout(function() {
                                        sentMessage2.delete();
                                        collected.first().delete();
                                        sentMessage.delete();
                                        message.delete();
                                        purgeChannel(message);
                                    }, 5000);
                                });
                            } else if (collected.first().content.toLowerCase() === "no") {
                                message.channel.send(`Next time be sure before you ask me ${config.emoji.angry}`)
                                .then(sentMessage2 => {
                                    setTimeout(function() {
                                        sentMessage2.delete();
                                        collected.first().delete();
                                        sentMessage.delete();
                                        message.delete();
                                    }, 5000);
                                });
                            } else {
                                message.channel.send(`Unknown response ${config.emoji.shrug}`)
                                .then(sentMessage2 => {
                                    setTimeout(function() {
                                        sentMessage2.delete();
                                        collected.first().delete();
                                        sentMessage.delete();
                                        message.delete();
                                    }, 5000);
                                });
                            }
                        })
                        .catch(() => {
                            message.channel.send(`You took to long! ${config.emoji.shrug} I\'m not doing it any more`)
                            .then(sentMessage2 => {
                                setTimeout(function() {
                                    message.delete();
                                    sentMessage.delete();
                                    sentMessage2.delete();
                                }, 5000);
                            });
                        });
                    });
                } else {
                    message.channel.send(`<@${message.author.id}>, Sorry but you don't have the power`);
                }
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
                    if (message.mentions.channels.first() !== undefined) {
                        args.shift();
                    }
                    remindMe(howManyTimesToRun, timeToWait,
                        function() {
                            if (message.mentions.channels.first() == undefined) {
                                message.channel.send(args.join(" "));
                            } else {
                                var id = message.mentions.channels.first().id;
                                client.channels.get(id).send(args.join(" "));
                            }
                        }
                    );
                });
                break;
            case "help":
                console.log("help command triggered");
                var helpCommand = args.shift();
                switch (message.content.toLowerCase()) {
                    case config.commandPrefix + "help admin":
                        var content = `Hello <@${message.author.id}>. Here's my admin available commands so far:\n`;
                            content += `\n\t\t${config.commandPrefix}**help** **Admin**- This list. Only people with admin or botadmin roles can run these commands.`;
                            content += `\n\t\t${config.commandPrefix}**add User** *(your swgoh name)* - If you mention someone in this message, it will assign the name to them.`;
                            content += `\n\t\t${config.commandPrefix}**add alias** *The character name on swgoh* *The alias to use* - Adds an alias for the bot to use.`;
                            content += `\n\t\t${config.commandPrefix}**removeUser** - Removes your swgoh name from the bot. If you mention someone it will remove their name.`;
                            content += `\n\t\t${config.commandPrefix}**list Users** - Lists all users swgoh names that the bot has.`;
                            content += `\n\t\t${config.commandPrefix}**purge** - Purges the TB records channel.`;
                        message.channel.send(content);
                        break;
                    default:
                        var content = `Hello <@${message.author.id}>. Here's my available commands so far:\n`;
                            content += `\n\t\t${config.commandPrefix}**help** - This list.`;
                            content += `\n\t\t${config.commandPrefix}**time** - A ticking clock.`;
                            content += `\n\t\t${config.commandPrefix}**face** - A moving face emoji.`;
                            content += `\n\t\t${config.commandPrefix}**remind** *(how many times)* *(how many minutes to wait inbetween)* *channel* *message* - Takes the message you typed and sends it back to the channel later. If you mention a channel it sends the message there instead`;
                            content += `\n\t\t${config.commandPrefix}**meta** - Gets pictures of the current meta report.`;
                            content += `\n\t\t${config.commandPrefix}**link** - Gets your swgoh.gg link.`;
                            content += `\n\t\t${config.commandPrefix}**mods** *character* - Gets a picture of your current mods on a character.`;
                            content += `\n\t\t${config.commandPrefix}**info** *character* - Gives you important info on a character.`;
                            content += `\n\t\t${config.commandPrefix}**zeta** - Gives you a list of all the zetas you have.`;
                            content += `\n\t\t${config.commandPrefix}**gear** *character* - Gets a picture of the gear level on a character.`;
                            content += `\n\t\t${config.commandPrefix}**gearNeeded** *character* - Gets a picture of the gear needed to get to the next level on a character.`;
                            content += `\n\t\t${config.commandPrefix}**skills** *character* - Gets you the ability levels on a character.`;
                            content += `\n\t\t${config.commandPrefix}**faction** *faction* - Gets a picture of all characters for a faction.`;
                            content += `\n\t\t${config.commandPrefix}**arena** - Gets a picture of your arena team.`;
                            content += `\n\t\t${config.commandPrefix}**shipSkills** *ship* - Gets a picture of the ability levels on a ship.`;
                            content += `\n\t\t${config.commandPrefix}**shipFaction** *faction* - Gets a picture of all ships for a faction.`;
                            content += `\n${config.emoji.construction} ${config.commandPrefix}**guild-info** *character* - Gives you a list of how many people have a certain character at different star and gear level`;
                            content += `\n${config.emoji.construction} ${config.commandPrefix}**guild-list** *character* *gear/star* *level* - Gives you a list of who has a certain character at certain star or gear level`;
                            content += `\n\nThat's all folks!`;
                        message.channel.send(content);
                }
                break;
            case "zeta":
                console.log("zeta command triggered");
                var swgohName = getSwgohName(message);
                console.log(swgohName);
                if (swgohName) {
                    message.channel.send("Fetching your zeta's..")
                    .then(sentMessage => {
                        getZetas(swgohName, function(data) {
                            console.log("got final data " + JSON.stringify(data));
                            sentMessage.delete();
                            var fields = [];

                            for (var i = 0; i < data.zetas.length; i++) {
                                var text = data.zetas[i].zetas.join("\n");
                                var field = {
                                    name: data.zetas[i].name,
                                    value: text,
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
                                        color: 7609788,
                                        title: "You have " + data.num + " zeta's",
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
                } else {
                    sendSwgohNameError(message);
                }
                console.log("finished message processing");
                break;
            case "meta":
                console.log("meta command triggered");
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
                console.log("link command triggered");
                var swgohName = getSwgohName(message);
                console.log(swgohName);
                if (swgohName) {
                    message.channel.send(`https://swgoh.gg/u/${swgohName}/`);
                } else {
                    sendSwgohNameError(message);
                }
                break;
            case "mods":
                console.log("mods command triggered");
                var swgohName = getSwgohName(message);
                console.log(swgohName);
                if (swgohName) {
                    message.channel.send("Sure thing <@" + message.author.id + ">. Give me a moment...")
                    .then(sentMessage => {
                        var charName = args.join(" ").toLowerCase();
                        var aliases = require("./Config/aliases.json");
                        charName = aliases[charName] === undefined ? charName : aliases[charName];
                        charName = charName.replace(" ", "-");
                        getMods(swgohName, charName, function (uuid) {
                            sentMessage.delete();
                            var result = message.channel.send(
                                `Here's ${swgohName} mods on ${decodeURI(charName)}`,
                                {
                                    files: [
                                        "/tmp/" + uuid + ".png"
                                    ]
                                }
                            );
                        });
                    });
                } else {
                    sendSwgohNameError(message);
                }
                break;
            case "info":
                console.log("info command triggered");
                var swgohName = getSwgohName(message);
                console.log(swgohName);
                if (swgohName) {
                    message.channel.send("Compiling data <@" + message.author.id + ">")
                    .then(sentMessage => {
                        var charName = args.join(" ").toLowerCase();
                        var aliases = require("./Config/aliases.json");
                        charName = aliases[charName] === undefined ? charName : aliases[charName];
                        charName = charName.replace(" ", "-");
                        getInfo(swgohName, charName, function (data) {
                            sentMessage.delete();
                            const gear = message.guild.emojis.find("name", "gear" + data.gear);
                            message.channel.send({
                                embed: {
                                    author: {
                                        name: client.user.username,
                                        icon_url: client.user.avatarURL
                                    },
                                    color: 59120,
                                    title: charName + " Stats",
                                    url: "https://swgoh.gg/u/" + swgohName + "/collection/" + charName + "/",
                                    fields: [
                                        {
                                            name: "Info",
                                            value: "Lvl " + data.level + " " + data.stars + config.emoji.star + " " + gear,
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
                                            name: "Defense",
                                            value: data.defense,
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
                } else {
                    sendSwgohNameError(message);
                }
                break;
            case "gear":
                console.log("gear command triggered");
                var swgohName = getSwgohName(message);
                console.log(swgohName);
                if (swgohName) {
                    message.channel.send("I'll get right on that <@" + message.author.id + ">")
                    .then(sentMessage => {
                        var charName = args.join(" ").toLowerCase();
                        var aliases = require("./Config/aliases.json");
                        charName = aliases[charName] === undefined ? charName : aliases[charName];
                        charName = charName.replace(" ", "-");
                        getGearLevel(swgohName, charName, function (uuid, data) {
                            sentMessage.delete();
                            message.channel.send(
                                `Here's ${swgohName} gear level for ${decodeURI(charName)}`,
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
                                        url: "https://swgoh.gg/u/" + swgohName + "/collection/" + charName + "/",
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
                } else {
                    sendSwgohNameError(message);
                }
                break;
            case "gearneeded":
                console.log("gear command triggered");
                var swgohName = getSwgohName(message);
                console.log(swgohName);
                if (swgohName) {
                    message.channel.send("So demanding <@" + message.author.id + ">...")
                    .then(sentMessage => {
                        var charName = args.join(" ").toLowerCase();
                        var aliases = require("./Config/aliases.json");
                        charName = aliases[charName] === undefined ? charName : aliases[charName];
                        charName = charName.replace(" ", "-");
                        getGearNeeded(swgohName, charName, function (uuid) {
                            sentMessage.delete();
                            var result = message.channel.send(
                                `Here's ${swgohName} gear needed for ${decodeURI(charName)}`,
                                {
                                    files: [
                                        "/tmp/" + uuid + ".png"
                                    ]
                                }
                            );
                        });
                    });
                } else {
                    sendSwgohNameError(message);
                }
                break;
            case "skills":
                console.log("skills command triggered");
                var swgohName = getSwgohName(message);
                console.log(swgohName);
                if (swgohName) {
                    message.channel.send("Its on the way via carrier pigeon <@" + message.author.id + ">")
                    .then(sentMessage => {
                        var charName = args.join(" ").toLowerCase();
                        var aliases = require("./Config/aliases.json");
                        charName = aliases[charName] === undefined ? charName : aliases[charName];
                        charName = charName.replace(" ", "-");
                        getSkills(swgohName, charName, function (data) {
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
                                color: 7929720,
                                title: "Abilities for " + charName,
                                url: "https://swgoh.gg/u/" + swgohName + "/collection/" + charName + "/",
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
                } else {
                    sendSwgohNameError(message);
                }
                break;
            case "faction":
                console.log("faction command triggered");
                var swgohName = getSwgohName(message);
                console.log(swgohName);
                if (swgohName) {
                    message.channel.send("Fine, i will fetch it for you <@" + message.author.id + ">")
                    .then(sentMessage => {
                        var factionName = args.join(" ").toLowerCase();
                        var aliases = require("./Config/aliases.json");
                        factionName = aliases[factionName] === undefined ? factionName : aliases[factionName];
                        factionName = factionName.replace(" ", "-");
                        getFaction(swgohName, factionName, function (uuid) {
                            sentMessage.delete();
                            var result = message.channel.send(
                                `Here's ${swgohName} characters for ${factionName} faction`,
                                {
                                    files: [
                                        "/tmp/" + uuid + ".png"
                                    ]
                                }
                            );
                        });
                    });
                } else {
                    sendSwgohNameError(message);
                }
                break;
            case "arena":
                console.log("arena command triggered");
                var swgohName = getSwgohName(message);
                console.log(swgohName);
                if (swgohName) {
                    message.channel.send("Formulating data...")
                    .then(sentMessage => {
                        getArena(swgohName, function (uuid, data) {
                            sentMessage.delete();
                            message.channel.send(
                                swgohName + " current arena team",
                                {
                                    files: [
                                        "/tmp/" + uuid + ".png"
                                    ]
                                }
                            );
                            var fields = [];
                            for (var i = 0; i < data.length; i++) {
                                const gear = message.guild.emojis.find("name", "gear" + data[i].data.gear);
                                var field = {
                                    name: data[i].data.stars + config.emoji.star + " " + gear + " " + data[i].name,
                                    value: data[i].data.speed + " Speed\n" + data[i].data.health + " Health\n" + data[i].data.protection + " Protection",
                                    inline: true
                                };
                                fields.push(field);
                            };
                            setTimeout( function() {
                                var rankState = parseInt(data.currentRank) < parseInt(data.averageRank);
                                message.channel.send({
                                    embed: {
                                        author: {
                                          name: client.user.username,
                                          icon_url: client.user.avatarURL
                                        },
                                        color: rankState ? 65280 : 16711680,
                                        title: "Some basic details on your team",
                                        description: (rankState ? "Good work, your arena rank is improving" : "Unfortunatley your arena rank is dropping") + `. Your current rank is ${data.currentRank} which is ` + (rankState ? "better" : "worse") + ` than your average rank of ${data.averageRank}.\nHighest recorded rank is ${data.highestRank}\nLowest recorded rank is ${data.lowestRank}`,
                                        url: "https://swgoh.gg/u/" + swgohName,
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
                } else {
                    sendSwgohNameError(message);
                }
                break;
            case "shipskills":
                console.log("skills command triggered");
                var swgohName = getSwgohName(message);
                console.log(swgohName);
                if (swgohName) {
                    message.channel.send("Its on it's way <@" + message.author.id + ">")
                    .then(sentMessage => {
                        var shipName = args.join(" ").toLowerCase();
                        var aliases = require("./Config/aliases.json");
                        shipName = aliases[shipName] === undefined ? shipName : aliases[shipName];
                        shipName = shipName.replace(" ", "-");
                        getShipSkills(swgohName, shipName, function (data) {
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
                                title: "Abilities for " + shipName,
                                url: "https://swgoh.gg/u/" + swgohName + "/collection/" + shipName + "/",
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
                } else {
                    sendSwgohNameError(message);
                }
                break;
            case "shipfaction":
                console.log("ship faction command triggered");
                var swgohName = getSwgohName(message);
                console.log(swgohName);
                if (swgohName) {
                    message.channel.send("Ok, collecting data <@" + message.author.id + ">")
                    .then(sentMessage => {
                        var factionName = args.join(" ").toLowerCase();
                        var aliases = require("./Config/aliases.json");
                        factionName = aliases[factionName] === undefined ? factionName : aliases[factionName];
                        factionName = factionName.replace(" ", "-");
                        getShipFaction(swgohName, factionName, function (uuid) {
                            sentMessage.delete();
                            var result = message.channel.send(
                                `Here's ${swgohName} ships for ${factionName} faction`,
                                {
                                    files: [
                                        "/tmp/" + uuid + ".png"
                                    ]
                                }
                            );
                        });
                    });
                } else {
                    sendSwgohNameError(message);
                }
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

function sendSwgohNameError(message) {
    var config = require("./Config/config.json");
    message.channel.send("I apologise <@" + message.author.id + "> but i don't know who you are, please add your swgoh name by typing the following command\n\`\`\`" + config.commandPrefix + "adduser \"your swgoh name\"\`\`\`");
}

function getSwgohName(message) {
    var users = require("./Config/users.json");
    var swgohName;
    if (message.mentions.users.first() !== undefined) {
        console.log("asking for " + message.mentions.users.first().username);
        swgohName = decodeURI(users[message.mentions.users.first().id]);
    } else if (users.hasOwnProperty(message.author.id)) {
        console.log("asking for self");
        swgohName = decodeURI(users[message.author.id]);
    } else {
        console.log("unknown");
        swgohName = false;
    }
    return encodeURI(swgohName);
}

function getSwgohEvents(callback) {
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
        callback(data);
      } else {
        console.log("We’ve encountered an error: " + error);
      }
    });
}

function getGuildInfo(url, char, callback) {
    console.log("getting list of users in guild");
    getGuildList(url, function(data) {
        var list = [];
        var infoIndex = 0;
        var zetaIndex = 0;
        var info = data;
        for (var i = 0; i < info.length; i++) {
            var name = info[i].link.substring(3, info[i].link.length - 1);
            list[i] = {};
            getZetas(name, function(zetaInfo) {
                var name = zetaInfo.name;
                var ind = 0;
                var userData = {};
                for (var k = 0; k < info.length; k++) {
                    if (info[k].link.toLowerCase() === `/u/${name.toLowerCase()}/`) {
                        ind = k;
                        break;
                    }
                }
                list[zetaIndex].user = info[ind];
                list[zetaIndex].zeta = zetaInfo;
                zetaIndex = zetaIndex + 1;
                if (infoIndex == data.length && zetaIndex == data.length) {
                    callback(list);
                }
            });
            getInfo(name, char, function(charInfo) {
                var name = charInfo.name;
                var ind = 0;
                var userData = {};
                for (var k = 0; k < info.length; k++) {
                    if (info[k].link.toLowerCase() === `/u/${name.toLowerCase()}/`) {
                        ind = k;
                        break;
                    }
                }
                list[infoIndex].user = info[ind];
                list[infoIndex].stats = charInfo;
                infoIndex = infoIndex + 1;
                if (infoIndex == data.length && zetaIndex == data.length) {
                    callback(list);
                }
            });
        }
    });
}

function getGuildZetas(url, callback) {
    console.log("getting list of users in guild");
    getGuildList(url, function(data) {
        var list = [];
        var infoIndex = 0;
        var zetaIndex = 0;
        var info = data;
        for (var i = 0; i < info.length; i++) {
            var name = info[i].link.substring(3, info[i].link.length - 1);
            list[i] = {};
            getZetas(name, function(zetaInfo) {
                var name = zetaInfo.name;
                var ind = 0;
                var userData = {};
                for (var k = 0; k < info.length; k++) {
                    if (info[k].link.toLowerCase() === `/u/${name.toLowerCase()}/`) {
                        ind = k;
                        break;
                    }
                }
                list[zetaIndex].user = info[ind];
                list[zetaIndex].zeta = zetaInfo;
                zetaIndex = zetaIndex + 1;
                if (zetaIndex == data.length) {
                    callback(list);
                }
            });
        }
    });
}

function getGuildGp(url, callback) {
    console.log("getting gp of users in guild");
    getGuildList(url, function(data) {
        var list = [];
        var index = 0;
        var info = data;
        for (var i = 0; i < info.length; i++) {
            var name = info[i].link.substring(3, info[i].link.length - 1);
            var user = getGp(name, function(userGp) {
                var name = userGp.name;
                var ind = 0;
                var userData = {};
                for (var k = 0; k < info.length; k++) {
                    if (info[k].link === `/u/${name}/`) {
                        ind = k;
                        break;
                    }
                }
                userData.user = info[ind];
                userData.gp = userGp;
                list[index] = userData;
                index = index + 1;
                if ((index) == data.length) {
                    callback(list);
                }
            });
        }
    });
}

function getGuildList(url, callback) {
    console.log("getting list of users in guild");

    var request = require('request');
    var cheerio = require('cheerio');

    request(url, function (error, response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            var data = [];
            var numUsers = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.list-group-item.p-a > h1 > small").html();
            var numUsers = parseInt(numUsers.substring(numUsers.indexOf("/") + 2, numUsers.indexOf("Profiles") - 1));
            for (var i = 0; i < numUsers; i++) {
                var link = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody > tr:nth-child(" + (i + 1) + ") > td > a").attr("href");
                var name = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody > tr:nth-child(" + (i + 1) + ") > td > a > strong").html();
                var user = {};
                user.link = link;
                user.name = name;
                data.push(user);
            }
            callback(data);
        } else {
            console.log("We’ve encountered an error: " + error);
        }
    });
}

function getGp(user, callback) {
    console.log("getting gp for " + user );
    var url = 'https://swgoh.gg/u/' + user;

    var request = require('request');
    var cheerio = require('cheerio');

    request(url, function (error, response, body) {
      if (!error) {
        var $ = cheerio.load(body);
        var data = {};
        var decode = require('decode-html');
        var characterGp = $("body > div.container.p-t-md > div.content-container > div.content-container-aside > div:nth-child(4) > div > div > p:nth-child(3) > strong").html();
        var shipGp = $("body > div.container.p-t-md > div.content-container > div.content-container-aside > div:nth-child(4) > div > div > p:nth-child(4) > strong").html();
        var totalGp = $("body > div.container.p-t-md > div.content-container > div.content-container-aside > div:nth-child(4) > div > div > p:nth-child(2) > strong").html();
        data.characterGp = characterGp;
        data.shipGp = shipGp;
        data.totalGp = totalGp;
        data.name = user;
        callback(data);
      } else {
        console.log("We’ve encountered an error: " + error);
      }
    });
}

function recalculateGP(message) {
    var config = require("./Config/config.json");
    var channel = message.guild.channels.find("name", config.tbRecords);

    var allMessages = [];
    fetchMessages(message.channel, allMessages, null, function(totalMessages){
        totalMessages = totalMessages.sort(function(a, b) {
            return a.createdTimestamp - b.createdTimestamp;
        });
        var lastMessageWasABot = true;
        var lastMessageValue = false;
        var total = 0;
        var amount = 0;
        var num = 0;
        totalMessages.forEach(
            function(currentValue, currentIndex, listObj) {
                // console.log(currentValue.content);
                // console.log("lastMessageWasABot: " + lastMessageWasABot);
                // console.log();
                if (currentValue == message) {
                    // console.log("encountered same message as deleted message");
                    return;
                }
                if (lastMessageWasABot && currentValue.author.bot) {
                    // console.log("encountered 2nd message from bot meaning a record was deleted");
                    currentValue.delete();
                    lastMessageWasABot = currentValue.author.bot;
                    return;
                }
                if (lastMessageWasABot && !currentValue.author.bot) {
                    // console.log("last message was a bot and this one isn't meaning its a player record");
                    amount = getNum(currentValue);
                    if (amount.toString() !== "NaN") {
                        total += amount;
                    }
                    num += 1;
                }
                if (!lastMessageWasABot && currentValue.author.bot) {
                    // console.log("last message was a person and this one is a bot meaning assign the new value");
                    currentValue.edit(`${num}) ${total.toLocaleString()} GP available`);
                }
                lastMessageWasABot = currentValue.author.bot;
            }
        );
        // console.log(totalMessages[0]);
    });
}

function fetchMessages(channel, allMessages, lastMessageID, callback) {
    var pageMessages = [];
    if (lastMessageID == null) {
        channel.fetchMessages({
            limit: 100,
        }).then((messages) => {
            console.log("messages.size: " + messages.size);
            messages.forEach(
                function(currentValue, currentIndex, listObj) {
                    // console.log(currentValue.id + " at " + new Date(currentValue.createdTimestamp));
                    pageMessages.push(currentValue);
                }
            );
            allMessages = allMessages.concat(pageMessages);
            if (pageMessages.length == 100) {
                fetchMessages(channel, allMessages, pageMessages[99].id, callback);
            } else {
                callback(allMessages);
            }
        });
    } else {
        channel.fetchMessages({
            limit: 100,
            before: lastMessageID
        }).then((messages) => {
            console.log("messages.size: " + messages.size);
            messages.forEach(
                function(currentValue, currentIndex, listObj) {
                    // console.log("675 " + currentValue.id + " at " + new Date(currentValue.createdTimestamp));
                    pageMessages.push(currentValue);
                }
            );
            allMessages = allMessages.concat(pageMessages);
            if (pageMessages.length == 100) {
                fetchMessages(channel, allMessages, pageMessages[0].id, callback);
            } else {
                callback(allMessages);
            }
        });
    } // end else
}

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
                if (amount.toString() !== "NaN") {
                    total += amount;
                }
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
        if (content.indexOf(")") !== -1) {
            // console.log("bracket");
            amount = getNum(content.substring(content.indexOf(")") + 1, content.length).trim());
        }
        else if (content.endsWith("k")) {
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
        else if (content.endsWith("mill")) {
            // console.log("mil 3");
            amount = parseInt(content.substring(0, content.length - 4).trim() * 1000000);
        }
        else if (content.endsWith("million")) {
            // console.log("mil 4");
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

function getZetas(user, callback) {
    console.log("getting zetas for " + user);
    var userURL = 'https://swgoh.gg/u/' + user;

    var request = require('request');
    var cheerio = require('cheerio');
    request(userURL, function (error, response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            var guildURL = $("body > div.container.p-t-md > div.content-container > div.content-container-aside > div.panel.panel-default.panel-profile.m-b-sm > div.panel-body > p:nth-child(4) > strong > a").attr("href");
            guildURL = "https://swgoh.gg" + guildURL + "zetas/";
            getZeta(guildURL, callback);
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
                console.log("num users in guild = " + numUsers.length);
                for (var i = 0; i < (numUsers.length - 1); i++) {
                    var username = $("body > div.container.p-t-md > div.content-container > div.content-container-primary.character-list > ul > li.media.list-group-item.p-0.b-t-0 > div > table > tbody > tr:nth-child(" + (i + 1) + ") > td > a").attr("href");
                    console.log(username  + " <> " + `/u/${user}/`);
                    if (username.toLowerCase() == `/u/${user.toLowerCase()}/`) {
                        console.log("found user");
                        var data = {};
                        data.name = user;
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
                        callback(data);
                        break;
                    }
                }
            }
        });
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
    var url = '/u/' + user + '/collection/' + char + '/';
    getStats(url, function(data) {
        data.name = user;
        callback(data);
    });
}

function getStats(url, callback) {
    var config = require("./Config/config.json");
    var url = 'https://swgoh.gg' + url;
    console.log("getting stats for " + url);
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
        var defense = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(5) > .media-body > .media-body > .pc-stat:nth-child(1) > .pc-stat-value").html();
        var basic_crit_chance = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(4) > .media-body > .media-body > .pc-stat:nth-child(2) > .pc-stat-value").html();
        var special_crit_chance = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(6) > .media-body > .media-body > .pc-stat:nth-child(2) > .pc-stat-value").html();
        var basic_damage = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(4) > .media-body > .media-body > .pc-stat:nth-child(1) > .pc-stat-value").html();
        var special_damage = $(".content-container-primary-aside > .list-group.media-list.media-list-stream > .media.list-group-item.p-sm:nth-child(6) > .media-body > .media-body > .pc-stat:nth-child(1) > .pc-stat-value").html();
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
        var gearLevel = config.gears[gear];
        var data = {
            "level": level,
            "stars": stars,
            "gear": gearLevel,
            "health": health,
            "protection": protection,
            "speed": speed,
            "potency": potency,
            "tenacity": tenacity,
            "defense": defense,
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
