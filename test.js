var amt1 = "1000000";
var amt2 = "1,000,000";
var amt3 = "900k";
var amt4 = "1m";
var amt5 = "1 mil";
var amt6 = "900 000";

var num1 = getNum(amt1);
var num2 = getNum(amt2);
var num3 = getNum(amt3);
var num4 = getNum(amt4);
var num5 = getNum(amt5);
var num6 = getNum(amt6);
var total = num1 + num2 + num3 + num4 + num5 + num6;
console.log(total.toLocaleString());

function getNum(currentValue) {
    var total = 0;
    var content = currentValue.toString().replace(/,/g, "").replace(/\s/g, "");
    try {
        if (content.endsWith("k")) {
            console.log("thousand");
            var amount = parseInt(content.substring(0, content.length - 1).trim()) * 1000;
            total += amount;
        }
        else if (content.endsWith("m")) {
            console.log("mil 1");
            var amount = parseInt(content.substring(0, content.length - 1).trim()) * 1000000;
            total += amount;
        }
        else if (content.endsWith("mil")) {
            console.log("mil 2");
            var amount = parseInt(content.substring(0, content.length - 3).trim()) * 1000000;
            total += amount;
        }
        else {
            console.log("normal");
            var amount = parseInt(content);
            total += amount;
        }
    } catch (e) {
        console.log("Couldn't parse " + content);
    }
    console.log("value(" + currentValue + "): " + total);
    return total;
}
