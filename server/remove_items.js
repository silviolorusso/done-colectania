const mongoose = require('mongoose')

const theIds = [
  'D1523887121993',
  'M1523519639890',
  'J1523374599561',
  'I1523370319462',
  
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


