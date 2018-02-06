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

		$(window).ready(function() {
			var i = 1;
			var interval = setInterval(step, 100);


			function step() {
				console.log('print');
				context.fillStyle = '#D0D0D0';
				context.globalAlpha = 0.5;
				context.fill();
				var radius = 5;
				context.arc((35*i), -10, radius, 0, Math.PI * 2);
				context.arc(-120, (25*i), radius, 0, Math.PI * 2);
				i++

				if(i === 350){
					console.log('clear');
					clearInterval(interval);
					return
				}
			}
		})
	}
	resizeCanvas();



})();
