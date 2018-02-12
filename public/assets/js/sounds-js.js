// script(src='assets/js/sounds-js.js')


console.log('hi guys!');

createjs.Sound.registerSound('assets/audio/beep.mp3', 'beep');
createjs.Sound.registerSound('assets/audio/ding.mp3', 'ding');

// printer soundjs
createjs.Sound.registerSound(
  'assets/audio/printer/matrix-short.wav',
  'printer-short'
);
createjs.Sound.registerSound(
  'assets/audio/printer/matrix-long.wav',
  'printer-long'
);
createjs.Sound.registerSound(
  'assets/audio/printer/load_paper.wav',
  'load_paper'
);

document.onkeydown = checkKey;
$(document).click(function () {
  checkKey();
});


function checkKey() {
  console.log('brah');
  createjs.Sound.play('ding');
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvdW5kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzb3VuZHMtanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzY3JpcHQoc3JjPSdhc3NldHMvanMvc291bmRzLWpzLmpzJylcblxuXG5jb25zb2xlLmxvZygnaGkgZ3V5cyEnKTtcblxuY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZCgnYXNzZXRzL2F1ZGlvL2JlZXAubXAzJywgJ2JlZXAnKTtcbmNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoJ2Fzc2V0cy9hdWRpby9kaW5nLm1wMycsICdkaW5nJyk7XG5cbi8vIHByaW50ZXIgc291bmRqc1xuY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcbiAgJ2Fzc2V0cy9hdWRpby9wcmludGVyL21hdHJpeC1zaG9ydC53YXYnLFxuICAncHJpbnRlci1zaG9ydCdcbik7XG5jcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFxuICAnYXNzZXRzL2F1ZGlvL3ByaW50ZXIvbWF0cml4LWxvbmcud2F2JyxcbiAgJ3ByaW50ZXItbG9uZydcbik7XG5jcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFxuICAnYXNzZXRzL2F1ZGlvL3ByaW50ZXIvbG9hZF9wYXBlci53YXYnLFxuICAnbG9hZF9wYXBlcidcbik7XG5cbmRvY3VtZW50Lm9ua2V5ZG93biA9IGNoZWNrS2V5O1xuJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24gKCkge1xuICBjaGVja0tleSgpO1xufSk7XG5cblxuZnVuY3Rpb24gY2hlY2tLZXkoKSB7XG4gIGNvbnNvbGUubG9nKCdicmFoJyk7XG4gIGNyZWF0ZWpzLlNvdW5kLnBsYXkoJ2RpbmcnKTtcbn07XG4iXX0=
