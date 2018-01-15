const express = require('express')
const mongoose = require('mongoose')
const pdf = require('./pdf.js')

const app = express()
const port = 3000

mongoose.connect('mongodb://localhost/test')
const db = mongoose.connection;

// how to avoid declaring the publication schema here?
var publicationSchema = mongoose.Schema({
  title: String,
  date: Number,
  expired: Boolean,
  elements: Array
})

var Publication = mongoose.model('Publication', publicationSchema)

app.set('view engine', 'pug')
app.use(express.static('public'))

// home
app.get('/', function (req, res) {

  // find all publications
  Publication.find(function (err, publications) {
    if (err) return console.error(err);
    // get ids
    var publication_ids = [];
    for (var i = 0; i < publications.length; i++) {
      publication_ids.push( publications[i]._id );
    }
    res.render(__dirname + '/../source/views/intro', { p_ids: publication_ids })

    console.log('serving intro')

  })

})

// pages
app.get('/game', function (req, res) {
  res.render(__dirname + '/../source/views/game')
  console.log('serving pages')
})

// archive
app.get('/archive', function (req, res) {

  // find all publications
  Publication.find(function (err, publications) {
    if (err) return console.error(err);
    // get ids
    var publication_ids = [];
    for (var i = 0; i < publications.length; i++) {
      publication_ids.push( publications[i]._id )
    }
    res.render(__dirname + '/../source/views/archive', { p_ids: publication_ids })

    console.log('serving archive')
  })

})

// make-pdf
app.get('/pdf', function (req, res) {
  pdf.makePdf()
  res.send('Pdf is in the making.')
  console.log('making-pdf')
})

// test for print
app.get('/print-test', function (req, res) {
  res.render(__dirname + '/../source/views/game-test-pdf.pug')
  console.log('serving print-test')
})


// listen
app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})