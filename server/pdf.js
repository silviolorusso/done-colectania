var path = require('path')
var fs = require('fs')
var childProcess = require('child_process')
var phantomjs = require('phantomjs-prebuilt')
var binPath = phantomjs.path

function makePdf() {

  var phantomArgs = [
    path.join(__dirname, 'take_screenshots.js'),
    'http://localhost:3000/print-test', // read
    'public/assets/pdf/print-test-0' //dest
  ]

  var convertArgs = [
    'public/assets/pdf/print-test-00.png',
    'public/assets/pdf/print-test-01.png',
    'public/assets/pdf/print-test-02.png',
    'public/assets/pdf/print-test-03.png',
    'public/assets/pdf/print-test-04.png',
    'public/assets/pdf/print-test-05.png',
    'public/assets/pdf/print-test-06.png',
    'public/assets/pdf/print-test-07.png',
    'public/assets/pdf/print-test.pdf' // output
  ]
   
  childProcess.execFile(binPath, phantomArgs, function(err, stdout, stderr) {
    console.log(err);
    // merge screenshots into PDF
    childProcess.execFile('/usr/local/bin/convert', convertArgs, function(err, stdout, stderr) {
      // remove temp images
      for (var i = 0; i < convertArgs.length -1; i++) { // minus one cause i don't want to delete the output
        fs.unlink(convertArgs[i]);
      }
    })
  })

}

module.exports = {
    makePdf: makePdf
};

// need to eliminate padding from page, convert "translate" to margin