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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzYXZlZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2YXIgcyA9ICQubWFrZUFycmF5KCQoJy5zcHJlYWQnKSk7XG4vL1xuLy8gdmFyIGNvdW50ID0gMDtcbi8vICQoJy5zcHJlYWQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcbi8vICAgY29uc29sZS5sb2coY291bnQpO1xuLy8gICBjb3VudCsrXG4vLyAgIGlmIChjb3VudCA9PT0gMikge1xuLy8gICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuLy8gICB9XG4vLyB9KVxuXG52YXIgcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NwcmVhZCcpO1xuJCgnLnNwcmVhZCcpLmhpZGUoKTtcbiQoJy5zcHJlYWQnKS5maXJzdCgpLnNob3coKVxuXG52YXIgY291bnQgPSAwO1xuJCgnLnNwcmVhZCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbn0pO1xuXG4kKCcucGFnZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG5cbiAgdmFyIG51bSA9ICQoJy5wYWdlJykuaW5kZXgodGhpcyk7XG4gIGlmIChudW0lMiA9PT0gMCkge1xuICAgIHNbY291bnRdLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgY291bnQrKztcbiAgICBzW2NvdW50XS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgfSBlbHNlIHtcbiAgICBzW2NvdW50XS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGNvdW50LS07XG4gICAgc1tjb3VudF0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIH1cblxufSk7XG4iXSwiZmlsZSI6InNhdmVkLmpzIn0=
