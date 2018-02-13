// script(src='assets/js/sounds-js.js')
createjs.Sound.registerSound('assets/audio/beep.mp3', 'beep');
createjs.Sound.registerSound('assets/audio/background_loop.mp3', 'music');


document.onkeydown = checkKey;
$(document).click(function () {
  checkKey();
});


function checkKey() {
  // createjs.Sound.play('music');

};


console.log();

$('.sound').click(function () {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvdW5kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic291bmRzLWpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gc2NyaXB0KHNyYz0nYXNzZXRzL2pzL3NvdW5kcy1qcy5qcycpXG5jcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKCdhc3NldHMvYXVkaW8vYmVlcC5tcDMnLCAnYmVlcCcpO1xuY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZCgnYXNzZXRzL2F1ZGlvL2JhY2tncm91bmRfbG9vcC5tcDMnLCAnbXVzaWMnKTtcblxuXG5kb2N1bWVudC5vbmtleWRvd24gPSBjaGVja0tleTtcbiQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgY2hlY2tLZXkoKTtcbn0pO1xuXG5cbmZ1bmN0aW9uIGNoZWNrS2V5KCkge1xuICAvLyBjcmVhdGVqcy5Tb3VuZC5wbGF5KCdtdXNpYycpO1xuXG59O1xuXG5cbmNvbnNvbGUubG9nKCk7XG5cbiQoJy5zb3VuZCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgY2hlY2tTb3VuZElmTXV0ZWQoKTtcblxufSlcblxuZnVuY3Rpb24gY2hlY2tTb3VuZElmTXV0ZWQoKSB7XG4gIGlmICgkKCcuc291bmQnKS5oYXNDbGFzcygnbXV0ZScpKSB7XG4gICAgLy8gdHJ1ZTogYXVkaW8gaXMgbXV0ZWRcbiAgICBjcmVhdGVqcy5Tb3VuZC5zdG9wKCdtdXNpYycpO1xuICAgICQoJy5zb3VuZCcpLnJlbW92ZUNsYXNzKCdtdXRlJyk7XG4gICAgcmV0dXJuIHRydWVcbiAgfSBlbHNlIHtcbiAgICAvLyBmYWxzZTogYXVkaW8gaXMgbm90IG11dGVkXG4gICAgY3JlYXRlanMuU291bmQucGxheSgnbXVzaWMnLCcuMycpO1xuICAgICQoJy5zb3VuZCcpLmFkZENsYXNzKCdtdXRlJyk7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cbiJdfQ==
