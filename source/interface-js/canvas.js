// ------------ Background Canvas ------------ //
(function() {
	var canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d');

	// resize the canvas to fill browser window dynamically
	window.addEventListener('resize', resizeCanvas, false);

	function resizeCanvas() {
    var width = window.innerWidth*2;
    var height = window.innerHeight*2;
		canvas.width = width;
		canvas.height = height;
		function drawStuff() {
      function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }

			for (var i = 0; i < 160; i++) {
				context.fillStyle = 'red';
				context.fill();
				var radius = 1;
				context.arc((15*i), -15, radius, 0, Math.PI * 2);
				context.arc(-15, (10*i), radius, 0, Math.PI * 2);
			}
		}
		$(window).ready(function() {
			// drawStuff();
			drawStuff();
		})
	}
	resizeCanvas();

})();
