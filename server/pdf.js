var path = require('path')
var fs = require('fs')
var childProcess = require('child_process')
var phantomjs = require('phantomjs-prebuilt')
var binPath = phantomjs.path

function makePdf(publication_id) {

  publication_dir = 'public/assets/pdf/' + publication_id

  if (!fs.existsSync(publication_dir)){
    fs.mkdirSync(publication_dir);
  }

  var phantomArgs = [
    path.join(__dirname, 'take_screenshots.js'),
    'http://localhost:3000/saved?print=true&id=' + publication_id, // e.g. http://localhost:3000/saved?print=true&id=Y1516628075388
    publication_dir //dest
  ]

  publication_dir + '/' + publication_id + '.pdf'

  var convertArgs = [
    publication_dir + '/' + '00.png',
    publication_dir + '/' + '01.png',
    publication_dir + '/' + '02.png',
    publication_dir + '/' + '03.png',
    publication_dir + '/' + '04.png',
    publication_dir + '/' + '05.png',
    publication_dir + '/' + '06.png',
    publication_dir + '/' + '07.png',
    publication_dir + '/' + publication_id + '.pdf' // output
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

// test
makePdf('Y1516628075388')

// need to eliminate padding from page, convert "translate" to margin