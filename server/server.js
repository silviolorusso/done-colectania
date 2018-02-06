const mongoose = require('mongoose')
const pdf = require('./pdf.js')
const bodyParser = require('body-parser');
const fs = require('fs')
const rmdir = require('rimraf')

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
  elements: Array
})

var Publication = mongoose.model('Publication', publicationSchema)





// --- SERVER STUFF

app.set('view engine', 'pug')
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' })); // support encoded bodies

// static
app.use('/assets/pdf', function(req, res, next) {
  download = req.param('download')
  if (download) { // if a used downloaded the pdf, download it
    pub_id = req.url.split( '/' )[1]
    setTimeout(function() {
      rmdir('public/assets/pdf/' + pub_id, function(err){
        if (err) {
            console.log("failed to delete pdf: " + err)
        } else {
            console.log('successfully deleted pdf')
        }
      })
    }, 5000) // delete after 5 sec
    console.log('user download')
  }
  next(); // Continue on to the next middleware/route handler
});
app.use(express.static('public'))

// home
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


// pages
app.get('/difficulty', function (req, res) {
  res.render(__dirname + '/../source/views/difficulty')
  console.log('serving difficulty')
})


// pages
app.get('/game', function (req, res) {
  res.render(__dirname + '/../source/views/game')
  console.log('serving game')
})

// archive
app.get('/archive', function (req, res) {

  // find all publications
  Publication.find(function (err, publications) {
    if (err) return console.error(err);

    res.render(__dirname + '/../source/views/archive', {
      publications: publications
    })

    console.log('serving archive')
  })

})

// make-pdf
app.get('/pdf', function (req, res) {

  var publication_id = req.param('id');

  pdf.makePdf(publication_id)
  res.send('Pdf is in the making.')
  console.log('making-pdf')

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
