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
