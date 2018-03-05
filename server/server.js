const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const fs = require('fs')
const fabric = require('fabric').fabric
const stream = require('stream')
const path = require('path')
const async = require('async')
const PDFDocument = require('pdfkit')
const SVGtoPDF = require('svg-to-pdfkit')
const svg2img = require('svg2img')

const express = require('express')
const app = express()
const port = 3000



// --- DB STUFF

mongoose.connect('mongodb://admin:donecolectania2018@ds135820.mlab.com:35820/done-colectania', { useMongoClient: true })
const db = mongoose.connection;

// how to avoid declaring the publication schema here?
var publicationSchema = mongoose.Schema({
  id: String,
  title: String,
  date: Number,
  expired: Boolean,
  pages: Object
})

var Publication = mongoose.model('Publication', publicationSchema)





// --- SERVER STUFF

app.set('view engine', 'pug')
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({ extended: true, limit: '50mb'}));
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

// cover
app.get('/cover', function (req, res) {
  var publication_id = req.param('id'); // e.g. http://localhost:3000/cover?id=R1520262399067

  Publication.findOne({ 'id': publication_id }, function (err, publication) {
    if (err) return console.error(err)

    const coverWidth = 450
    const coverHeight = 636
    const cover = new fabric.StaticCanvas('c')
    cover.setWidth(coverWidth)
    cover.setHeight(coverHeight)
    cover.loadFromJSON(publication.pages.p1)
    coverImg = cover.toSVG()

    svg2img(cover.toSVG(), function(error, buffer) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-disposition': 'filename=' + publication_id,
      });
      res.end(buffer)
    })

    //res.send(cover.toSVG())
  })
})

// archive
app.get('/archive', function (req, res) {

  // find all publications
  Publication.find(function (err, _publications) {
    if (err) return console.error(err);

    res.render(__dirname + '/../source/views/archive', {
      publications: _publications
    })

    console.log('serving archive')
  })

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

  // find publication
  var publication_model
  Publication.findOne({ 'id': publication_id }, function (err, publication) {
    if (err) return console.error(err);

    publication_model = publication
    publication_model = JSON.stringify(publication_model)

    // script to insert the saved model into saved
    var publication_script = '<script>var Publication = ' +  publication_model + ';</script>'

    res.render(__dirname + '/../source/views/saved', { publication_script: publication_script })
  })
  console.log('serving saved publication')
})


// serve pdf
app.get('/pdf', function (req, res) {
  var publication_id = req.param('id'); // e.g. http://localhost:3000/pdf?id=I1519673917344
  var booklet = req.param('booklet'); // e.g. http://localhost:3000/pdf?id=I15196739173440&booklet=true

  const canvasWidth = 450
  const canvasHeight = 636
  const pageWidth = canvasWidth/1.34
  const pageHeight = canvasHeight/1.34

  // find publication
  var publication_model
  Publication.findOne({ 'id': publication_id }, function (err, publication) {
    if (err) return console.error(err);

    var canvases = []

    const tasks = [
      function makeCanvases(callback) {
        for (var i = 1; i < 9; i++) {
          var canvas = new fabric.StaticCanvas('c') // random name
          canvas.setWidth(canvasWidth)
          canvas.setHeight(canvasHeight)
          var pages = publication.pages
          if ( pages.hasOwnProperty('p' + i) ) { // if not empty
            canvas.loadFromJSON(pages['p' + i]);
          }
          canvases.push(canvas)
        }

        callback(null)
      },
      function makePdf(callback) {

        fonts = function(family, bold, italic, fontOptions) { // remember to choose fonts and change them
          if (family.match(/(?:^|,)\s*serif\s*$/)) {
            if (bold && italic) {return 'Times-BoldItalic';}
            if (bold && !italic) {return 'Times-Bold';}
            if (!bold && italic) {return 'Times-Italic';}
            if (!bold && !italic) {return 'Times-Roman';}
          } else if (family.match(/(?:^|,)\s*monospace\s*$/)) {
            if (bold && italic) {return 'Courier-BoldOblique';}
            if (bold && !italic) {return 'Courier-Bold';}
            if (!bold && italic) {return 'Courier-Oblique';}
            if (!bold && !italic) {return 'Courier';}
          } else if (family.match(/(?:^|,)\s*Comic Sans MS\s*$/)) {
            if (bold && italic) {return '"Comic Sans MS"';}
            if (bold && !italic) {return '"Comic Sans MS-bold"';}
            if (!bold && italic) {return '"Comic Sans MS"';}
            if (!bold && !italic) {return '"Comic Sans MS"';}
          } else if (family.match(/(?:^|,)\s*sans-serif\s*$/) || true) {
            if (bold && italic) {return 'Helvetica-BoldOblique';}
            if (bold && !italic) {return 'Helvetica-Bold';}
            if (!bold && italic) {return 'Helvetica-Oblique';}
            if (!bold && !italic) {return 'Helvetica';}
          } 
        }

        if (booklet != 'true') {

          doc = new PDFDocument({size:[pageWidth, pageHeight]})
          doc.registerFont('"Comic Sans MS"', __dirname + '/../public/assets/fonts/comic.ttf')
          doc.registerFont('"Comic Sans MS-bold"', __dirname + '/../public/assets/fonts/comic-bold.ttf')
          doc.registerFont('"Comic Sans MS-italic"', __dirname + '/../public/assets/fonts/comic-italic.ttf')
          doc.registerFont('"Comic Sans MS-bolditalic"', __dirname + '/../public/assets/fonts/comic-bolditalic.ttf')

          var i = 0

          canvases.forEach(function(canvas) {
            SVGtoPDF(doc, canvas.toSVG(), 0, 0, {fontCallback: fonts }) // TODO: preserve fonts
            if (i != canvases.length - 1) {
              doc.addPage()
            }
            i++
          })

          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Access-Control-Allow-Origin': '*',
            'Content-Disposition': 'filename=' + publication_id + '.pdf'
          });

          doc.pipe(res).on('finish', function() {
            console.log('single page pdf was successfully created')
          })

          doc.end()

        } else {

          doc = new PDFDocument({size:[pageWidth*2, pageHeight]})
          doc.registerFont('"Comic Sans MS"', __dirname + '/../public/assets/fonts/comic.ttf')
          doc.registerFont('"Comic Sans MS-bold"', __dirname + '/../public/assets/fonts/comic-bold.ttf')
          doc.registerFont('"Comic Sans MS-italic"', __dirname + '/../public/assets/fonts/comic-italic.ttf')
          doc.registerFont('"Comic Sans MS-bolditalic"', __dirname + '/../public/assets/fonts/comic-bolditalic.ttf')

          // all the -1 to have a normal page number
          SVGtoPDF(doc, canvases[8-1].toSVG(), 0, 0);
          SVGtoPDF(doc, canvases[1-1].toSVG(), pageWidth, 0);
          doc.addPage()
          SVGtoPDF(doc, canvases[2-1].toSVG(), 0, 0);
          SVGtoPDF(doc, canvases[7-1].toSVG(), pageWidth, 0);
          doc.addPage()
          SVGtoPDF(doc, canvases[6-1].toSVG(), 0, 0);
          SVGtoPDF(doc, canvases[3-1].toSVG(), pageWidth, 0);
          doc.addPage()
          SVGtoPDF(doc, canvases[4-1].toSVG(), 0, 0);
          SVGtoPDF(doc, canvases[5-1].toSVG(), pageWidth, 0);

          doc.pipe(res).on('finish', function() {
            console.log('booklet pdf was successfully created')
          })

          doc.end()

        }
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

// ------------------------------------------
// set the port of our application
// process.env.PORT lets the port be set by Heroku
var portset = process.env.PORT || port;

app.listen(portset, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

	console.log('server is listening on http://localhost:' + portset);
});
