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
		$('#countdown').html('Get ready!');
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb3VudGRvd24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gY291bnRkb3duV3JhcHBlcigpIHtcblx0ZnVuY3Rpb24gbG9hZFNvdW5kKCkge1xuXHRcdGNvbnNvbGUubG9nKCdsb2FkIHNvdW5kIScpO1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoJ2Fzc2V0cy9hdWRpby9iZWVwLm1wMycsICdiZWVwJyk7XG5cdFx0Y3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZCgnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJywgJ2RpbmcnKTtcblxuXHRcdC8vIHByaW50ZXIgc291bmRqc1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXG5cdFx0XHQnYXNzZXRzL2F1ZGlvL3ByaW50ZXIvbWF0cml4LXNob3J0LndhdicsXG5cdFx0XHQncHJpbnRlci1zaG9ydCdcblx0XHQpO1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXG5cdFx0XHQnYXNzZXRzL2F1ZGlvL3ByaW50ZXIvbWF0cml4LWxvbmcud2F2Jyxcblx0XHRcdCdwcmludGVyLWxvbmcnXG5cdFx0KTtcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFxuXHRcdFx0J2Fzc2V0cy9hdWRpby9wcmludGVyL2xvYWRfcGFwZXIud2F2Jyxcblx0XHRcdCdsb2FkX3BhcGVyJ1xuXHRcdCk7XG5cdH1cblxuXHRsb2FkU291bmQoKTtcblxuXHQvLyB3aGVuIHBhZ2UgaXMgcmVhZHkgZG8gdGhpc1xuXHQkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0XHQkKCcjY291bnRkb3duJykuaHRtbCgnR2V0IHJlYWR5IScpO1xuXHRcdC8vIGNvdW50ZG93biB0aW1lclxuXHRcdGZ1bmN0aW9uIGNvdW50ZG93bihzdGFydFRpbWUpIHtcblx0XHRcdGlmIChzdGFydFRpbWUgPj0gMSkge1xuXHRcdFx0XHRjcmVhdGVqcy5Tb3VuZC5wbGF5KCdwcmludGVyLXNob3J0Jyk7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c3RhcnRUaW1lID0gc3RhcnRUaW1lIC0gMTtcblx0XHRcdFx0XHQkKCcjY291bnRkb3duJykuaHRtbChzdGFydFRpbWUpOyAvLyBzZXQgY3VycmVudCB0aW1lIGluICNjb3VudGRvd25cblx0XHRcdFx0XHRjb3VudGRvd24oc3RhcnRUaW1lKTsgLy8gcmVwZWF0IGZ1bmN0aW9uXG5cdFx0XHRcdH0sIDEwMDApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCgnI2NvdW50ZG93bicpLmh0bWwoJ3N0YXJ0IGdhbWUhJyk7IC8vIHNldCB0byBzdGFydCBnYW1lIG1lc3NhZ2Vcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQvLyB3YWl0IGEgYml0XG5cdFx0XHRcdFx0JCgnI2NvdW50ZG93bicpLmZhZGVPdXQoMTAwMCk7IC8vIGZhZGUgb3V0IHRoZSAjY291bnRkb3duXG5cdFx0XHRcdFx0Ly8gVE9ETzogc3RhcnQgdGltZSFcblx0XHRcdFx0fSwgMjAwKTtcblx0XHRcdFx0Y3JlYXRlanMuU291bmQucGxheSgnZGluZycpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBzdGFydFRpbWUgPSA0O1xuXHRcdGNvdW50ZG93bihzdGFydFRpbWUpO1xuXHRcdCQoJyNjb3VudGRvd24nKS5odG1sKHN0YXJ0VGltZSk7XG5cdH0pO1xufVxuIl0sImZpbGUiOiJjb3VudGRvd24uanMifQ==
