// script(src='assets/js/sounds-js.js')
createjs.Sound.registerSound('assets/audio/beep.mp3', 'beep');
createjs.Sound.registerSound('assets/audio/background_loop.mp3', 'music');


console.log('loaded');

$(document).ready(function () {
  $('.sound').click(function () {
    console.log('click');
    checkSoundIfMuted();

  })

  function checkSoundIfMuted() {
    if ($('.sound').hasClass('mute')) {
      // true: audio is muted
      createjs.Sound.stop('music');
      $('.sound').removeClass('mute');
      return true
    } else {
      // false: audio is not muted
      createjs.Sound.play('music','.3');
      $('.sound').addClass('mute');
      return false
    }
  }

})

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvdW5kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzb3VuZHMtanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzY3JpcHQoc3JjPSdhc3NldHMvanMvc291bmRzLWpzLmpzJylcbmNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoJ2Fzc2V0cy9hdWRpby9iZWVwLm1wMycsICdiZWVwJyk7XG5jcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKCdhc3NldHMvYXVkaW8vYmFja2dyb3VuZF9sb29wLm1wMycsICdtdXNpYycpO1xuXG5cbmNvbnNvbGUubG9nKCdsb2FkZWQnKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAkKCcuc291bmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2NsaWNrJyk7XG4gICAgY2hlY2tTb3VuZElmTXV0ZWQoKTtcblxuICB9KVxuXG4gIGZ1bmN0aW9uIGNoZWNrU291bmRJZk11dGVkKCkge1xuICAgIGlmICgkKCcuc291bmQnKS5oYXNDbGFzcygnbXV0ZScpKSB7XG4gICAgICAvLyB0cnVlOiBhdWRpbyBpcyBtdXRlZFxuICAgICAgY3JlYXRlanMuU291bmQuc3RvcCgnbXVzaWMnKTtcbiAgICAgICQoJy5zb3VuZCcpLnJlbW92ZUNsYXNzKCdtdXRlJyk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBmYWxzZTogYXVkaW8gaXMgbm90IG11dGVkXG4gICAgICBjcmVhdGVqcy5Tb3VuZC5wbGF5KCdtdXNpYycsJy4zJyk7XG4gICAgICAkKCcuc291bmQnKS5hZGRDbGFzcygnbXV0ZScpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbn0pXG4iXX0=
