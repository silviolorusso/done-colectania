var path = require('path')
var fs = require('fs')
var childProcess = require('child_process')
var phantomjs = require('phantomjs-prebuilt')
var binPath = phantomjs.path
 
var phantomArgs = [
  path.join(__dirname, 'source/js/pdf_pure-phantom.js'),
  'public/pages-test-pdf.html', // read
  'public/pdf-test/test_pure-phantom-0' //dest
]

var convertArgs = [
  'public/pdf-test/test_pure-phantom-00.png',
  'public/pdf-test/test_pure-phantom-01.png',
  'public/pdf-test/test_pure-phantom-02.png',
  'public/pdf-test/test_pure-phantom-03.png',
  'public/pdf-test/test_pure-phantom-04.png',
  'public/pdf-test/test_pure-phantom-05.png',
  'public/pdf-test/test_pure-phantom-06.png',
  'public/pdf-test/test_pure-phantom-07.png',
  'public/pdf-test/pp.pdf' // output
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

// need to eliminate padding from page, convert "translate" to margin