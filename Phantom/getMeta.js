var system = require('system');
var args = system.args;

var page = require('webpage').create();
//the rest of the code is the same as the previous example
var file = args[1];
var which = args[2];
console.log('starting image grab');
page.open('https://swgoh.gg/meta-report/', function(status) {
    //viewportSize being the actual size of the headless browser
    page.viewportSize = { width: 2000, height: 6048 };

    console.log('wait');
    setTimeout(waitFor(which), 2000);
});

function waitFor(which) {
    //the clipRect is the portion of the page you are taking a screenshot of
    var main;
    if (which == 1) {
        console.log('getting first chart');
        main = page.evaluate(function(){
            return document.querySelector('.chart1').getBoundingClientRect();
        });
    }
    if (which == 2) {
        console.log('getting second chart');
        main = page.evaluate(function(){
            return document.querySelector('.chart2').getBoundingClientRect();
        });
    }
    // var clipRect = document.querySelector('.list-group.media-list.media-list-stream:nth-child(2)').getBoundingClientRect();
    page.clipRect = {
        top:    main.top,
        left:   main.left,
        width:  main.width,
        height: main.height
    };
    console.log('render');
    setTimeout(function() {
        page.render('/tmp/' + file + '.png');
        phantom.exit();
    }, 2000);
}
console.log('done grabbing image');
