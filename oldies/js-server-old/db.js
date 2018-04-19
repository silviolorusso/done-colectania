var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

  var publicationSchema = mongoose.Schema({
    title: String,
    date: Number,
    expired: Boolean,
    elements: Array
  });

  var Publication = mongoose.model('Publication', publicationSchema);

  // example of publication
  var testPub = new Publication({
    title: 'Test Publication',
    date: 1515503190,
    expired: true,
    elements: [
      ['src', 0, 0, 0, 0]
    ]
  });

  testPub.save(function (err, testPub) {
    if (err) return console.error(err);

      Publication.find(function (err, publications) {
        if (err) return console.error(err);
        console.log(publications);
      })

  });


});

