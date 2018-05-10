const mongoose = require('mongoose')

const theIds = [
  'E1524579067999'
] 


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
  console.log('load');
}
console.log(process.env.MONGO_URI);

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


Publication.find({ id: { $in: theIds} }).remove(function (err) {
  if (err) return handleError(err);
  console.log('removed ' + theIds )
});


