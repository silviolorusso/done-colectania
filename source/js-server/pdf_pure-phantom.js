var system = require('system');
var args = system.args;

var myHeight = 1274;
var myWidth =  900;

var page = require('webpage').create();
page.viewportSize = { width: 900, height: 3000 }; // A4, 72 dpi in pixel
page.open(args[1], function() {
  for (var i = 0; i <= 7; i++) {
    page.clipRect = { top: myHeight * i, left: 0, width: myWidth, height: myHeight };
    page.render('public/pdf-test/test_pure-phantom-0' + i + '.png');
  }
  phantom.exit();
});