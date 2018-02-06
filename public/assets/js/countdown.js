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
		$('#countdown').html('Get ready!').show();
		// countdown timer
		function countdown(startTime) {
			if (startTime >= 1) {
				createjs.Sound.play('printer-short');
				setTimeout(function() {
					startTime = startTime - 1;
					$('#countdown').html(startTime); // set current time in #countdown
					countdown(startTime); // repeat function
				}, 1000);
			} else {
				$('#countdown').html('start game!'); // set to start game message
				setTimeout(function() {
					// wait a bit
					$('#countdown').fadeOut(1000); // fade out the #countdown
					// TODO: start time!
				}, 200);
				createjs.Sound.play('ding');
			}
		}

		var startTime = 4;
		countdown(startTime);
		$('#countdown').html(startTime);
	});
}

countdownWrapper();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb3VudGRvd24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gY291bnRkb3duV3JhcHBlcigpIHtcblx0ZnVuY3Rpb24gbG9hZFNvdW5kKCkge1xuXHRcdGNvbnNvbGUubG9nKCdsb2FkIHNvdW5kIScpO1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoJ2Fzc2V0cy9hdWRpby9iZWVwLm1wMycsICdiZWVwJyk7XG5cdFx0Y3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZCgnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJywgJ2RpbmcnKTtcblxuXHRcdC8vIHByaW50ZXIgc291bmRqc1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXG5cdFx0XHQnYXNzZXRzL2F1ZGlvL3ByaW50ZXIvbWF0cml4LXNob3J0LndhdicsXG5cdFx0XHQncHJpbnRlci1zaG9ydCdcblx0XHQpO1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXG5cdFx0XHQnYXNzZXRzL2F1ZGlvL3ByaW50ZXIvbWF0cml4LWxvbmcud2F2Jyxcblx0XHRcdCdwcmludGVyLWxvbmcnXG5cdFx0KTtcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFxuXHRcdFx0J2Fzc2V0cy9hdWRpby9wcmludGVyL2xvYWRfcGFwZXIud2F2Jyxcblx0XHRcdCdsb2FkX3BhcGVyJ1xuXHRcdCk7XG5cdH1cblxuXHRsb2FkU291bmQoKTtcblxuXHQvLyB3aGVuIHBhZ2UgaXMgcmVhZHkgZG8gdGhpc1xuXHQkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0XHQkKCcjY291bnRkb3duJykuaHRtbCgnR2V0IHJlYWR5IScpLnNob3coKTtcblx0XHQvLyBjb3VudGRvd24gdGltZXJcblx0XHRmdW5jdGlvbiBjb3VudGRvd24oc3RhcnRUaW1lKSB7XG5cdFx0XHRpZiAoc3RhcnRUaW1lID49IDEpIHtcblx0XHRcdFx0Y3JlYXRlanMuU291bmQucGxheSgncHJpbnRlci1zaG9ydCcpO1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHN0YXJ0VGltZSA9IHN0YXJ0VGltZSAtIDE7XG5cdFx0XHRcdFx0JCgnI2NvdW50ZG93bicpLmh0bWwoc3RhcnRUaW1lKTsgLy8gc2V0IGN1cnJlbnQgdGltZSBpbiAjY291bnRkb3duXG5cdFx0XHRcdFx0Y291bnRkb3duKHN0YXJ0VGltZSk7IC8vIHJlcGVhdCBmdW5jdGlvblxuXHRcdFx0XHR9LCAxMDAwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoJyNjb3VudGRvd24nKS5odG1sKCdzdGFydCBnYW1lIScpOyAvLyBzZXQgdG8gc3RhcnQgZ2FtZSBtZXNzYWdlXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Ly8gd2FpdCBhIGJpdFxuXHRcdFx0XHRcdCQoJyNjb3VudGRvd24nKS5mYWRlT3V0KDEwMDApOyAvLyBmYWRlIG91dCB0aGUgI2NvdW50ZG93blxuXHRcdFx0XHRcdC8vIFRPRE86IHN0YXJ0IHRpbWUhXG5cdFx0XHRcdH0sIDIwMCk7XG5cdFx0XHRcdGNyZWF0ZWpzLlNvdW5kLnBsYXkoJ2RpbmcnKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgc3RhcnRUaW1lID0gNDtcblx0XHRjb3VudGRvd24oc3RhcnRUaW1lKTtcblx0XHQkKCcjY291bnRkb3duJykuaHRtbChzdGFydFRpbWUpO1xuXHR9KTtcbn1cblxuY291bnRkb3duV3JhcHBlcigpO1xuIl0sImZpbGUiOiJjb3VudGRvd24uanMifQ==
