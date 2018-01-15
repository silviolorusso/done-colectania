const express = require('express')
const mongoose = require('mongoose')

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

    res.render(__dirname + '../../views/level', { p_ids: publication_ids });

    console.log('serving level')

  })

})

// pages
app.get('/pages', function (req, res) {
  res.render(__dirname + '../../views/pages')
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

    res.render(__dirname + '../../views/archive', { p_ids: publication_ids })

  })

})

// make-pdf
app.get('/make-pdf', function (req, res) {
  res.render(__dirname + '../../views/')
  console.log('serving pages')
})


// test for print
app.get('/print-test', function (req, res) {
  res.render(__dirname + '../../views/pages-test-pdf.pug')
  console.log('serving print-test')
})


// listen
app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})