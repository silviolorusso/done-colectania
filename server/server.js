const mongoose = require('mongoose')
const pdf = require('./pdf.js')
const bodyParser = require('body-parser')
const fs = require('fs')
const rmdir = require('rimraf')
const fabric = require('fabric').fabric
const Rsvg = require('librsvg').Rsvg
const stream = require('stream')
const merge = require('easy-pdf-merge')
const path = require('path')
const async = require('async')
const rimraf = require('rimraf')
const childProcess = require('child_process')

const express = require('express')
const app = express()
const port = 3000





// --- DB STUFF

mongoose.connect('mongodb://localhost/test', { useMongoClient: true })
const db = mongoose.connection;

// how to avoid declaring the publication schema here?
var publicationSchema = mongoose.Schema({
  id: String,
  title: String,
  date: Number,
  expired: Boolean,
  elements: Array, // remove this after fabric works
  pages: Object
})

var Publication = mongoose.model('Publication', publicationSchema)





// --- SERVER STUFF

app.set('view engine', 'pug')
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' })); // support encoded bodies

// static
app.use(express.static('public'))

// intro
app.get('/', function (req, res) {

  // find all publications
  Publication.find(function (err, publications) {
    if (err) return console.error(err);

    res.render(__dirname + '/../source/views/intro', {
      publications: publications
    })

    console.log('serving intro')
  })
})

// splash
app.get('/splash', function (req, res) {
  res.render(__dirname + '/../source/views/splash')
  console.log('serving splash')
})


// difficulty
app.get('/difficulty', function (req, res) {
  res.render(__dirname + '/../source/views/difficulty')
  console.log('serving difficulty')
})

// game
app.get('/game', function (req, res) {
  res.render(__dirname + '/../source/views/game')
  console.log('serving game')
})

// archive
app.get('/archive', function (req, res) {

  // find all publications
  Publication.find(function (err, publications) {
    if (err) return console.error(err);
    // get ids
    var publication_ids = [];
    for (var i = 0; i < publications.length; i++) {
      publication_ids.push( publications[i].id )
    }
    res.render(__dirname + '/../source/views/archive', { p_ids: publication_ids })

    console.log('serving archive')
  })

})

// test for print
app.get('/print-test', function (req, res) {
  res.render(__dirname + '/../source/views/game-test-pdf.pug')
  console.log('serving print-test')
})

// save to db
app.post('/db', function(req, res) {
    var publication = new Publication( req.body )
    publication.save(function (err, publication) {
      if (err) return console.error(err);
      console.log('saved to db')
    });

    console.log('saving to db');
});

// show saved
app.get('/saved', function (req, res) {
  var publication_id = req.param('id'); // e.g. http://localhost:3000/saved?id=R1516627472029
  var print = req.param('print');

  // find publication
  var publication_model
  Publication.findOne({ 'id': publication_id }, function (err, publication) {
    if (err) return console.error(err);

    publication_model = publication
    publication_model = JSON.stringify(publication_model)
    console.log(publication_model)

    // code to insert print
    if (print) {
      var print_code = '<link rel="stylesheet" href="assets/css/pdf.css"/>'
    }

    // script to insert the saved model into saved
    var publication_script = '<script>var Publication = ' +  publication_model + ';</script>'

    res.render(__dirname + '/../source/views/game', { print_code: print_code, publication_script: publication_script })
  })
  console.log('serving saved publication')

  console.log(publication_model)
})


// serve pdf
app.get('/pdf', function (req, res) {
  var publication_id = req.param('id'); // e.g. http://localhost:3000/pdf?id=P1518452006750

  // find publication
  var publication_model
  Publication.findOne({ 'id': publication_id }, function (err, publication) {
    if (err) return console.error(err);
    
    var canvases = []
    var pub = publication
    pdfParts = []
    for (var i = 1; i < 9; i++) {
      pdfParts.push('tmp/' + publication_id + '/' + publication_id + '-' + i + '.pdf')
    }

    const tasks = [
      function makeDir(callback) {
        dir = 'tmp/' + publication_id
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
        callback(null)
      },
      function makeCanvases(callback) {
        for (var i = 1; i < 9; i++) {
          var canvas = new fabric.StaticCanvas('c') // random name
          canvas.setWidth(450)
          canvas.setHeight(636)
          var pages = pub.pages
          if ( pages.hasOwnProperty('p' + i) ) { // if not empty
            canvas.loadFromJSON(pages['p' + i]);
          }
          canvases.push(canvas)
        }
        callback(null)
      },
      function makeSvg(callback) {
        var i = 1
        canvases.forEach(function(canvas) {

          var svg = new Rsvg();
          svg.on('finish', function() {

            var pdf = svg.render({
              format: 'pdf',
              width: 450,
              height: 636
            }).data;

            fs.writeFile('tmp/' + publication_id + '/' + publication_id + '-' + i + '.pdf', pdf, function(err) {
              if(err) { 
                console.log(err);
              } else {
                console.log('pdf part successfully created');
              }
            })
            i += 1
          })

          var bufferStream = new stream.PassThrough();
          bufferStream.end(new Buffer( canvas.toSVG() ));
          bufferStream.pipe(svg)

        });
        callback(null)
      },
      function mergePdfs(callback) {
        fileName = 'tmp/' + publication_id + '/' + publication_id + '.pdf'
        merge(pdfParts, fileName, function(err){ // merge pdf
          if(err) {
            return console.log(err);
          } else {
            var fullPdfPath = path.resolve(fileName)
            // res.sendFile(fullPdfPath, function (err) { // send file
            //   if (err) {
            //     throw err;
            //   } else {
            //     try {
            //       // rimraf('tmp/' + publication_id, function () { console.log('directory removed'); });
            //     } catch(e) {
            //       console.log("error removing path"); 
            //     }
            //   }
            // });
            console.log('full pdf successfully created')
            callback(null)
          }
        })
      },
      function makeBooklet(callback) { 
        fileName = 'tmp/' + publication_id + '/' + publication_id + '.pdf'
        bookletFileName = 'tmp/' + publication_id + '/' + publication_id + '-booklet.pdf'
        childProcess.execFile( 'server/make-booklet.sh', [ fileName ], function(err, stdout, stderr) {
          console.log(err)
          console.log(stdout)
          console.log('successfully created booklet')
          var fullBookletPath = path.resolve(bookletFileName)
          res.sendFile(fullBookletPath, function (err) {
            if (err) {
              throw err;
            } else {
              try {
                rimraf('tmp/' + publication_id, function () { console.log('directory removed'); });
              } catch(e) {
                console.log("error removing path"); 
              }
            }
          });
          callback(null)
        })
      }
    ]

    async.series(tasks, (err) => {
        if (err) {
            return next(err);
        }
    })

  })

  console.log('serving pdf')

})

// show all publications in console
app.get('/overview', function (req, res) {
  Publication.find(function (err, publications) {
    if (err) return console.error(err);
    console.log(publications);
  })
})

// listen
app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})
