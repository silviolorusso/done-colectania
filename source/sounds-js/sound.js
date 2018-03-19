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
