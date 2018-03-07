const mongoose = require('mongoose')

mongoose.connect('mongodb://admin:donecolectania2018@ds135820.mlab.com:35820/done-colectania', { useMongoClient: true })
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

Publication.remove(function (err) {
  if (err) return handleError(err);
  // removed!
});