const express = require('express')
const app = express()
const port = 3000

app.set('view engine', 'pug')
app.use(express.static('public'))

app.get('/', function (req, res) {
  res.render(__dirname + '../../views/level')
})

app.get('/archive', function (req, res) {
  res.render(__dirname + '../../views/archive')
})


app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})