const mongoose = require('mongoose')

mongoose.connect('mongodb://admin:donecolectania2018@ds135820.mlab.com:35820/done-colectania', { useMongoClient: true })
const db = mongoose.connection;

var publicationSchema = mongoose.Schema({
  id: String,
  title: String,
  expired: Boolean,
  authors: String,
  date: String,
  imagesAmount: Number,
  textAmount: Number,
  timeElapsed: Number,
  achievementsAmount: Number,
  pages: Object,
  thumb: String
})

var Publication = mongoose.model('Publication', publicationSchema)

Publication.remove(function (err) {
  if (err) return handleError(err);
  console.log('removed ')
});