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

// i moved this stuff to soundfx.js

// $('.sound').click(function () {
//   checkSoundIfMuted();

// })

// function checkSoundIfMuted() {
//   if ($('.sound').hasClass('mute')) {
//     // true: audio is muted
//     createjs.Sound.stop('music');
//     $('.sound').removeClass('mute');
//     return true
//   } else {
//     // false: audio is not muted
//     createjs.Sound.play('music','.3');
//     $('.sound').addClass('mute');
//     return false
//   }
// }

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvdW5kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNvdW5kcy1qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHNjcmlwdChzcmM9J2Fzc2V0cy9qcy9zb3VuZHMtanMuanMnKVxuY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZCgnYXNzZXRzL2F1ZGlvL2JlZXAubXAzJywgJ2JlZXAnKTtcbmNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoJ2Fzc2V0cy9hdWRpby9iYWNrZ3JvdW5kX2xvb3AubXAzJywgJ211c2ljJyk7XG5cblxuZG9jdW1lbnQub25rZXlkb3duID0gY2hlY2tLZXk7XG4kKGRvY3VtZW50KS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGNoZWNrS2V5KCk7XG59KTtcblxuXG5mdW5jdGlvbiBjaGVja0tleSgpIHtcbiAgLy8gY3JlYXRlanMuU291bmQucGxheSgnbXVzaWMnKTtcblxufTtcblxuXG5jb25zb2xlLmxvZygpO1xuXG4vLyBpIG1vdmVkIHRoaXMgc3R1ZmYgdG8gc291bmRmeC5qc1xuXG4vLyAkKCcuc291bmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4vLyAgIGNoZWNrU291bmRJZk11dGVkKCk7XG5cbi8vIH0pXG5cbi8vIGZ1bmN0aW9uIGNoZWNrU291bmRJZk11dGVkKCkge1xuLy8gICBpZiAoJCgnLnNvdW5kJykuaGFzQ2xhc3MoJ211dGUnKSkge1xuLy8gICAgIC8vIHRydWU6IGF1ZGlvIGlzIG11dGVkXG4vLyAgICAgY3JlYXRlanMuU291bmQuc3RvcCgnbXVzaWMnKTtcbi8vICAgICAkKCcuc291bmQnKS5yZW1vdmVDbGFzcygnbXV0ZScpO1xuLy8gICAgIHJldHVybiB0cnVlXG4vLyAgIH0gZWxzZSB7XG4vLyAgICAgLy8gZmFsc2U6IGF1ZGlvIGlzIG5vdCBtdXRlZFxuLy8gICAgIGNyZWF0ZWpzLlNvdW5kLnBsYXkoJ211c2ljJywnLjMnKTtcbi8vICAgICAkKCcuc291bmQnKS5hZGRDbGFzcygnbXV0ZScpO1xuLy8gICAgIHJldHVybiBmYWxzZVxuLy8gICB9XG4vLyB9XG4iXX0=
