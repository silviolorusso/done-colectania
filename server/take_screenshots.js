var system = require('system');
var args = system.args;

var myHeight = 1274;
var myWidth =  900;

var page = require('webpage').create();
page.viewportSize = { width: 900, height: 3000 }; // A4, 72 dpi in pixel
// page.onCallback = function(data){
//   if (data.exit) {
//     for (var i = 0; i <= 7; i++) {
//       page.clipRect = { top: myHeight * i, left: 0, width: myWidth, height: myHeight };
//       page.render('public/assets/pdf/print-test-0' + i + '.png');
//     }
//     phantom.exit();
//   }
// };
// page.onLoadFinished = function(status) {
//   // window.setTimeout(function() {
//   //   for (var i = 0; i <= 7; i++) {
//   //     page.clipRect = { top: myHeight * i, left: 0, width: myWidth, height: myHeight };
//   //     page.render('public/assets/pdf/print-test-0' + i + '.png');
//   //   }
//   //   phantom.exit();
//   // }, 5000)
//   page.evaluate(function() {

//     $(".page").click();

//     window.callPhantom({ exit: true });
//   });
// };

function onPageReady() {
    setTimeout(function() {
      for (var i = 0; i <= 7; i++) {
        page.clipRect = { top: myHeight * i, left: 0, width: myWidth, height: myHeight };
        page.render('public/assets/pdf/print-test-0' + i + '.png');
      }
      phantom.exit();
    }, 30000)
}

page.open(args[1], function() {
  function checkReadyState() {
    setTimeout(function () {
        var readyState = page.evaluate(function () {
            return document.readyState;
        });

        if ("complete" === readyState) {
            onPageReady();
        } else {
            checkReadyState();
        }
    });
  }

  checkReadyState();
});