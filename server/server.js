const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const fs = require('fs')
const fabric = require('fabric').fabric
const stream = require('stream')
const path = require('path')
const PDFDocument = require('pdfkit')


const express = require('express')
const app = express()
const port = 3000


// --- DB STUFF
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

var url = process.env.MONGO_URI;

mongoose.Promise = global.Promise
mongoose.connect(url, { useMongoClient: true })
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
  pages: Object
})

var Publication = mongoose.model('Publication', publicationSchema)





// --- SERVER STUFF

app.set('view engine', 'pug')
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({ extended: true, limit: '50mb'}))


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

  var perPage = 6
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
  console.log('serving about')
})

// save to db
app.post('/db', function(req, res) {
    var publication = new Publication( req.body )

    publication.save(function (err, publication) {
      if (err) return console.error(err);
      console.log('saved to db')
      res.status(200).json({status:"ok"})
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
app.get('/pdf', function (req, res) {
  var publication_id = req.query['id'] // e.g. http://localhost:3000/pdf?id=I1519673917344
  var booklet = req.query['booklet'] // e.g. http://localhost:3000/pdf?id=I15196739173440&booklet=true

  Publication.findOne({ 'id': publication_id }, function (err, publication) {
    if (err) return console.error(err)

    if (publication) {

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'filename=' + publication_id + '.pdf'
      })

      if (booklet != 'true') {

        doc = new PDFDocument({size:'A5'})

        for (var i = 1; i < 9; i++) {
          doc.image(publication.pages['p' + i], 0, 0, { width: doc.page.width, height: doc.page.height})
          if (i != 8) {
            doc.addPage()
          }
        }

        doc.pipe(res).on('finish', function() {
          console.log('single page pdf was successfully created')
        })

        doc.end()

      } else {

        doc = new PDFDocument({size:'A4', layout: 'landscape'})
        pageWidth = doc.page.width/2

        doc.image(publication.pages['p' + 8], 0, 0, { width: pageWidth })
        doc.image(publication.pages['p' + 1], pageWidth, 0, { width: pageWidth})
        doc.addPage()
        doc.image(publication.pages['p' + 2], 0, 0, { width: pageWidth})
        doc.image(publication.pages['p' + 7], pageWidth, 0, { width: pageWidth})
        doc.addPage()
        doc.image(publication.pages['p' + 6], 0, 0, { width: pageWidth})
        doc.image(publication.pages['p' + 3], pageWidth, 0, { width: pageWidth})
        doc.addPage()
        doc.image(publication.pages['p' + 4], 0, 0, { width: pageWidth})
        doc.image(publication.pages['p' + 5], pageWidth, 0, { width: pageWidth})

        doc.pipe(res).on('finish', function() {
          console.log('booklet pdf was successfully created by ' + process.pid)
        })

        doc.end()

      }

    } else { // no publication
      res.redirect('/')
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

// app.use(function(req, res, next){
//     res.status(404).render('about', {
//       url: req.url
//     });
// });

app.use(function(req, res) {
     res.status(400);
    res.render(__dirname + '/../source/views/404', {
      url: req.url
    });
 });

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
