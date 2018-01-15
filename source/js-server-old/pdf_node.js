var fs = require('fs');
var pdf = require('html-pdf');
var html = fs.readFileSync('public/pages-test-pdf.html', 'utf8');
var options = { format: 'A4' };
 
pdf.create(html, options).toFile('public/pdf-test/test_node.pdf', function(err, res) {
  if (err) return console.log(err);
  console.log(res);
});