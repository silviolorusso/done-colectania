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

      // styling
			context.fillStyle = "rgba(200,200,200,1)";

      var chars = 'abcdefghijklmnopqrstuvwxyz';
      var array = chars.split('');

      function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }

      context.font = '12px serif';

      for (var i = 0; i < 600; i++) {
        context.fillText(array[getRandomInt(array.length)], getRandomInt(width), getRandomInt(height));
      }


		}
		$(window).ready(function() {
			drawStuff();
		})
	}
	resizeCanvas();

})();
