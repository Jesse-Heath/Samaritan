var system = require('system');
var args = system.args;

var page = require('webpage').create();
//the rest of the code is the same as the previous example
var file = args[1];
var user = args[2];
var char = args[3];
console.log('starting image grab');
var url = 'https://swgoh.gg/u/' + user + '/collection/' + char + '/';
console.log(url);
page.open(url, function(status) {
    //viewportSize being the actual size of the headless browser
    page.viewportSize = { width: 1500, height: 2048 };

    console.log('wait');
    setTimeout(function() {
        var main = page.evaluate(function(){
            return document.querySelector('.content-container-primary > .list-group.media-list.media-list-stream:nth-child(4)').getBoundingClientRect();
        });
        // var clipRect = document.querySelector('.list-group.media-list.media-list-stream:nth-child(2)').getBoundingClientRect();
        page.clipRect = {
            top:    main.top,
            left:   main.left,
            width:  main.width,
            height: main.height
        };
        console.log('render');
        page.render('/tmp/' + file + '.png');
        phantom.exit();
    }, 2000);
});
console.log('done grabbing image');
