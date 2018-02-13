function countdownWrapper() {
	function loadSound() {
		console.log('load sound!');
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
	}

	loadSound();

	// when page is ready do this
	$(document).ready(function() {


		animateUp($('#counter'));


		function countdown(startTime) {
			animateUpOut($('#countdownWrapper'), 2000);

			switch (startTime) {
				case 4:
					$('#countdown').html('<span>Prepare your <span class="perish">Assets!</span></span>');
					break;
				case 3:
					$('#countdown').html('<span>Type your <span class="perish">Type!</span></span>');
					break;
				case 2:
					$('#countdown').html('<span>Create your <span class="perish">Layout!</span></span>');
					break;
				case 1:
					$('#countdown').html('<span>Publish or <span class="perish">Perish!</span></span>');
					break;
				default:
			}

			startTime = startTime - 1;
			if (startTime >= 1) {
				setTimeout(function () {
					console.log(startTime);
					countdown(startTime);
				}, 2000);
			} else {
				return
			}
		}

		var startTime = 4;
		countdown(startTime);


	});
}

countdownWrapper();




// countdown timer
// function countdown(startTime) {
// 	if (startTime >= 1) {
// 		createjs.Sound.play('printer-short');
// 		setTimeout(function() {
// 			$('#countdown').html(startTime); // set current time in #countdown
// 			countdown(startTime); // repeat function
// 		}, 1000);
// 	} else {
// 		$('#countdown').html('start game!'); // set to start game message
// 		setTimeout(function() {
// 			// wait a bit
// 			$('#countdown').fadeOut(1000); // fade out the #countdown
// 			// TODO: start time!
// 		}, 200);
// 		createjs.Sound.play('ding');
// 	}
// }
