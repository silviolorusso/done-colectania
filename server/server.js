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

mongoose.Promise = global.Promise
mongoose.connect('mongodb://admin:donecolectania2018@ds135820.mlab.com:35820/done-colectania', { useMongoClient: true })
const db = mongoose.connection

var publicationSchema = mongoose.Schema({
  id: String,
  title: String,
  expired: Boolean,
  authors: String,
  date: { type: String, index: true },
  imagesAmount: Number,
  textAmount: Number,
  timeElapsed: Number,
  achievementsAmount: Number,
  pages: Object,
  thumb: String
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
  res.render(__dirname + '/../source/views/intro')
  console.log('serving intro')
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
  var publication_id = req.query['id'] // e.g. http://localhost:3000/cover?id=R1520262399067

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

  function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = date + ' ' + month + ' ' + year;
    return time;
  }

  var perPage = 15
  pageParam = req.query['page']
  if (pageParam == null) {
    pageParam = 0
  }
  var page = Math.max(0, pageParam)

  // find all publications
  Publication.find().limit(perPage).skip(perPage * page).sort('-date').exec(function (err, _publications) {
    if (err) return console.error(err)

    for (id in _publications) { // convert date to text
      _publications[id].date = timeConverter( Number(_publications[id].date) )
    }

    Publication.find().limit(perPage).skip(perPage * (page + 1) ).count({},function(err, count) { // check if it's last page
      if (err) return console.error(err)

      if (count == 0) {
        nextPage = false
      } else {
        nextPage = page + 1
      }

      res.render(__dirname + '/../source/views/archive', {
        publications: _publications,
        nextPage: nextPage,
        prevPage: page - 1
      })
      
    })

    console.log('serving archive')
  })

})

// splash
app.get('/about', function (req, res) {
  res.render(__dirname + '/../source/views/about')
  console.log('serving about by ' + process.pid)
})

// save to db
app.post('/db', function(req, res) {
    var publication = new Publication( req.body )

    // save thumb
    const coverWidth = 450
    const coverHeight = 636
    const cover = new fabric.StaticCanvas('c')
    cover.setWidth(coverWidth)
    cover.setHeight(coverHeight)
    cover.loadFromJSON(publication.pages.p1)
    coverImg = cover.toSVG()

    svg2img(cover.toSVG(), function(error, buffer) {
      publication.thumb = 'data:image/png;base64,' + buffer.toString('base64')
      publication.save(function (err, publication) {
        if (err) return console.error(err);
        console.log('saved to db')
        res.status(200).json({status:"ok"})
      });

    })

    console.log('saving to db');
});

// show saved
app.get('/saved', function (req, res) {
  var publication_id = req.query['id'] // e.g. http://localhost:3000/saved?id=R1516627472029

  // find publication
  var publication_model
  Publication.findOne({ 'id': publication_id }, function (err, publication) {
    if (err) return console.error(err)

    publication_model = publication

    if (publication_model) { // publication found

      publication_model = JSON.stringify(publication_model)
      var publication_script = '<script>var Publication = ' +  publication_model + ';</script>'     // script to insert the saved model into saved
      res.render(__dirname + '/../source/views/saved', { publication_script: publication_script })

    } else { // publication not found
      res.redirect('/')
    }
  })
  console.log('serving saved publication')
})


// serve pdf 
app.get('/pdf-test', function (req, res) {
  var publication_id = req.query['id'] // e.g. http://localhost:3000/pdf?id=I1519673917344
  var booklet = req.query['booklet'] // e.g. http://localhost:3000/pdf?id=I15196739173440&booklet=true

  const canvasWidth = 450
  const canvasHeight = 636
  const pageWidth = canvasWidth/1.34
  const pageHeight = canvasHeight/1.34

  Publication.findOne({ 'id': publication_id }, function (err, publication) {
    if (err) return console.error(err)
    console.log('found pub')

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Access-Control-Allow-Origin': '*',
      'Content-Disposition': 'filename=' + publication_id + '.pdf'
    });

    doc = new PDFDocument({size:[pageWidth, pageHeight]})

    for (var i = 1; i < 9; i++) {
      canvas = new fabric.StaticCanvas()
      canvas.setWidth(canvasWidth)
      canvas.setHeight(canvasHeight)
      if ( publication && publication.pages.hasOwnProperty('p' + i) ) { // if not empty
        canvas.loadFromJSON(publication.pages['p' + i])
        delete publication.pages['p' + i]
        SVGtoPDF(doc, canvas.toSVG(), 0, 0)
        canvas.clear()
        canvas.dispose()
        global.gc()
        if (i != 8) {
          doc.addPage()
        }
      }
      delete publication
      delete canvas
    }

    doc.pipe(res).on('finish', function() {
      console.log('single page pdf was successfully created by ' + process.pid)
    })

    doc.end()

  })

  console.log('serving pdf')
})

// serve pdf 
app.get('/pdf', function (req, res) {
  var publication_id = req.query['id'] // e.g. http://localhost:3000/pdf?id=I1519673917344
  var booklet = req.query['booklet'] // e.g. http://localhost:3000/pdf?id=I15196739173440&booklet=true

  const canvasWidth = 450
  const canvasHeight = 636
  const pageWidth = canvasWidth/1.34
  const pageHeight = canvasHeight/1.34

  var canvases = []
  var _publication

  const tasks = [
    function findPublication(callback) {
      Publication.findOne({ 'id': publication_id }, function (err, publication) {
        if (err) return console.error(err)
          _publication = publication
        console.log('found pub')
        callback(null)
      })
    },
    function makeCanvases(callback) {
      for (var i = 1; i < 9; i++) {
        var canvas = new fabric.StaticCanvas('c') // random name
        canvas.setWidth(canvasWidth)
        canvas.setHeight(canvasHeight)
        if ( _publication && _publication.pages.hasOwnProperty('p' + i) ) { // if not empty
          var pages = _publication.pages
          canvas.loadFromJSON(pages['p' + i]);
        }
        canvases.push(canvas)
      }
      console.log('made canvases')
      callback(null)
    },
    function makePdf(callback) {

      fonts = function(family, bold, italic, fontOptions) {
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
        } else if (family.match(/(?:^|,)\s*Helvetica\s*$/)) {
          if (bold && italic) {return 'Helvetica-BoldOblique';}
          if (bold && !italic) {return 'Helvetica-Bold';}
          if (!bold && italic) {return 'Helvetica-Oblique';}
          if (!bold && !italic) {return 'Helvetica';}
        } else {
          if (bold && italic) {return '"Comic Sans MS"';}
          if (bold && !italic) {return '"Comic Sans MS-bold"';}
          if (!bold && italic) {return '"Comic Sans MS"';}
          if (!bold && !italic) {return '"Comic Sans MS"';}
        }
      }

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'filename=' + publication_id + '.pdf'
      });

      if (booklet != 'true') {

        doc = new PDFDocument({size:[pageWidth, pageHeight]})
        doc.registerFont('"Comic Sans MS"', __dirname + '/../public/assets/fonts/comic.ttf')
        doc.registerFont('"Comic Sans MS-bold"', __dirname + '/../public/assets/fonts/comic-bold.ttf')
        doc.registerFont('"Comic Sans MS-italic"', __dirname + '/../public/assets/fonts/comic-italic.ttf')
        doc.registerFont('"Comic Sans MS-bolditalic"', __dirname + '/../public/assets/fonts/comic-bolditalic.ttf')

        var i = 0

        canvases.forEach(function(canvas) {
          SVGtoPDF(doc, canvas.toSVG(), 0, 0, {fontCallback: fonts })
          if (i != canvases.length - 1) {
            doc.addPage()
          }
          i++
        })

        doc.pipe(res).on('finish', function() {
          console.log('single page pdf was successfully created by ' + process.pid)
        })

        doc.end()

      } else {

        doc = new PDFDocument({size:[pageWidth*2, pageHeight]})
        doc.registerFont('"Comic Sans MS"', __dirname + '/../public/assets/fonts/comic.ttf')
        doc.registerFont('"Comic Sans MS-bold"', __dirname + '/../public/assets/fonts/comic-bold.ttf')
        doc.registerFont('"Comic Sans MS-italic"', __dirname + '/../public/assets/fonts/comic-italic.ttf')
        doc.registerFont('"Comic Sans MS-bolditalic"', __dirname + '/../public/assets/fonts/comic-bolditalic.ttf')

        // all the -1 to have a normal page number
        SVGtoPDF(doc, canvases[8-1].toSVG(), 0, 0, {fontCallback: fonts });
        SVGtoPDF(doc, canvases[1-1].toSVG(), pageWidth, 0, {fontCallback: fonts });
        doc.addPage()
        SVGtoPDF(doc, canvases[2-1].toSVG(), 0, 0, {fontCallback: fonts });
        SVGtoPDF(doc, canvases[7-1].toSVG(), pageWidth, 0, {fontCallback: fonts });
        doc.addPage()
        SVGtoPDF(doc, canvases[6-1].toSVG(), 0, 0, {fontCallback: fonts });
        SVGtoPDF(doc, canvases[3-1].toSVG(), pageWidth, 0, {fontCallback: fonts });
        doc.addPage()
        SVGtoPDF(doc, canvases[4-1].toSVG(), 0, 0, {fontCallback: fonts });
        SVGtoPDF(doc, canvases[5-1].toSVG(), pageWidth, 0, {fontCallback: fonts });

        doc.pipe(res).on('finish', function() {
          console.log('booklet pdf was successfully created by ' + process.pid)
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