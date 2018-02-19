// var s = $.makeArray($('.spread'));
//
// var count = 0;
// $('.spread').each(function () {
//   console.log(count);
//   count++
//   if (count === 2) {
//     console.log(this);
//   }
// })

var s = document.getElementsByClassName('spread');
$('.spread').hide();
$('.spread').first().show()

var count = 0;
$('.spread').click(function () {
});

$('.page').click(function (e) {

  var num = $('.page').index(this);
  if (num%2 === 0) {
    s[count].style.display = 'none';
    count++;
    s[count].style.display = 'block';
  } else {
    s[count].style.display = 'none';
    count--;
    s[count].style.display = 'block';
  }

});
