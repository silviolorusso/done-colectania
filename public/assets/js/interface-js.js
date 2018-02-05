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

$('.wrapper').css('opacity', '0');
$('.loadingbar').css('opacity', '0');
$('#message').addClass('blink');


$( ".wrapper" ).animate({
    opacity: 1,
    paddingTop: "80px",
  }, 3000, function() {
    // Animation complete.
    $('#message').html('press ENTER to start');
    document.onkeydown = checkKey;

    function checkKey(e) {
        if (e.keyCode) {
          loadgame()
      }
    }
});


function loadgame() {
  $('body').css('cursor', 'wait');
  $('#message').removeClass('blink');
  $('.loadingbar').css('opacity', '1');

  setTimeout(function () {
    $('#loader').css('width', '10'+ '%');
    $('#percentage').html('10% ');
    $('#message').html('loading assets');
  }, 100);
  setTimeout(function () {
    $('#loader').css('width', '25'+ '%');
    $('#percentage').html('25% ');
    $('#message').html('creating spreads');
  }, 600);
  setTimeout(function () {
    $('#loader').css('width', '35'+ '%');
    $('#percentage').html('35% ');
    $('#message').html('waiting for content');
  }, 1200);
  setTimeout(function () {
    $('#loader').css('width', '42'+ '%');
    $('#percentage').html('42% ');
    $('#message').html('cracking Photoshop');
  }, 2200);
  setTimeout(function () {
    $('#loader').css('width', '43'+ '%');
    $('#percentage').html('43% ');
    $('#message').html('installing printer drivers');
  }, 2300);
  setTimeout(function () {
    $('#loader').css('width', '55'+ '%');
    $('#percentage').html('55% ');
    $('#message').html('buying toner');
  }, 3000);
  setTimeout(function () {
    $('#loader').css('width', '62'+ '%');
    $('#percentage').html('62% ');
    $('#message').html('folding corners');
  }, 3600);
  setTimeout(function () {
    $('#loader').css('width', '66'+ '%');
    $('#percentage').html('66% ');
    $('#message').html('clipping masks');
  }, 4300);
  setTimeout(function () {
    $('#loader').css('width', '71'+ '%');
    $('#percentage').html('71% ');
    $('#message').html('filling fills');
  }, 5000);
  setTimeout(function () {
    $('#loader').css('width', '77'+ '%');
    $('#percentage').html('77% ');
    $('#message').html('squaring borders');
  }, 5300);
  setTimeout(function () {
    $('#loader').css('width', '82'+ '%');
    $('#percentage').html('82% ');
    $('#message').html('padding pages');
  }, 6300);
  setTimeout(function () {
    $('#loader').css('width', '84'+ '%');
    $('#percentage').html('84% ');
    $('#message').html('marginalizing images');
  }, 6600);
  setTimeout(function () {
    $('#loader').css('width', '88'+ '%');
    $('#percentage').html('88% ');
    $('#message').html('submitting for review');
  }, 7000);
  setTimeout(function () {
    $('#loader').css('width', '90'+ '%');
    $('#percentage').html('90% ');
    $('#message').html('grammar checking');
  }, 7600);
  setTimeout(function () {
    $('#loader').css('width', '94'+ '%');
    $('#percentage').html('94% ');
    $('#message').html('sending out for proofing');
  }, 8000);
  setTimeout(function () {
    $('#loader').css('width', '98'+ '%');
    $('#percentage').html('98% ');
    $('#message').html('applying for funding');
  }, 9200);
  setTimeout(function () {
    $('#loader').css('width', '100'+ '%');
    $('#percentage').html('100% ');
    $('#message').html('actually writing');
  }, 10000);
  setTimeout(function () {
    $('body').css('cursor', 'auto');
    $( ".wrapper" ).animate({
        opacity: 0,
        paddingTop: "100px",
      }, 1000, function() {
        // send page to game
    });

  }, 12000);

  $('#loader').on('change', function () {
    console.log('change');
  })
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImxvYWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJpbnRlcmZhY2UtanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0tLS0tLS0tLS0gQmFja2dyb3VuZCBDYW52YXMgLS0tLS0tLS0tLS0tIC8vXG4oZnVuY3Rpb24oKSB7XG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyksXG5cdFx0Y29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdC8vIHJlc2l6ZSB0aGUgY2FudmFzIHRvIGZpbGwgYnJvd3NlciB3aW5kb3cgZHluYW1pY2FsbHlcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZUNhbnZhcywgZmFsc2UpO1xuXG5cdGZ1bmN0aW9uIHJlc2l6ZUNhbnZhcygpIHtcbiAgICB2YXIgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCoyO1xuICAgIHZhciBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQqMjtcblx0XHRjYW52YXMud2lkdGggPSB3aWR0aDtcblx0XHRjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXHRcdGZ1bmN0aW9uIGRyYXdTdHVmZigpIHtcblxuICAgICAgLy8gc3R5bGluZ1xuXHRcdFx0Y29udGV4dC5maWxsU3R5bGUgPSBcInJnYmEoMjAwLDIwMCwyMDAsMSlcIjtcblxuICAgICAgdmFyIGNoYXJzID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6JztcbiAgICAgIHZhciBhcnJheSA9IGNoYXJzLnNwbGl0KCcnKTtcblxuICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tSW50KG1heCkge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5mbG9vcihtYXgpKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dC5mb250ID0gJzEycHggc2VyaWYnO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDYwMDsgaSsrKSB7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQoYXJyYXlbZ2V0UmFuZG9tSW50KGFycmF5Lmxlbmd0aCldLCBnZXRSYW5kb21JbnQod2lkdGgpLCBnZXRSYW5kb21JbnQoaGVpZ2h0KSk7XG4gICAgICB9XG5cblxuXHRcdH1cblx0XHQkKHdpbmRvdykucmVhZHkoZnVuY3Rpb24oKSB7XG5cdFx0XHRkcmF3U3R1ZmYoKTtcblx0XHR9KVxuXHR9XG5cdHJlc2l6ZUNhbnZhcygpO1xuXG59KSgpO1xuIiwiJCgnLndyYXBwZXInKS5jc3MoJ29wYWNpdHknLCAnMCcpO1xuJCgnLmxvYWRpbmdiYXInKS5jc3MoJ29wYWNpdHknLCAnMCcpO1xuJCgnI21lc3NhZ2UnKS5hZGRDbGFzcygnYmxpbmsnKTtcblxuXG4kKCBcIi53cmFwcGVyXCIgKS5hbmltYXRlKHtcbiAgICBvcGFjaXR5OiAxLFxuICAgIHBhZGRpbmdUb3A6IFwiODBweFwiLFxuICB9LCAzMDAwLCBmdW5jdGlvbigpIHtcbiAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdwcmVzcyBFTlRFUiB0byBzdGFydCcpO1xuICAgIGRvY3VtZW50Lm9ua2V5ZG93biA9IGNoZWNrS2V5O1xuXG4gICAgZnVuY3Rpb24gY2hlY2tLZXkoZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlKSB7XG4gICAgICAgICAgbG9hZGdhbWUoKVxuICAgICAgfVxuICAgIH1cbn0pO1xuXG5cbmZ1bmN0aW9uIGxvYWRnYW1lKCkge1xuICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnd2FpdCcpO1xuICAkKCcjbWVzc2FnZScpLnJlbW92ZUNsYXNzKCdibGluaycpO1xuICAkKCcubG9hZGluZ2JhcicpLmNzcygnb3BhY2l0eScsICcxJyk7XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnMTAnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnMTAlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnbG9hZGluZyBhc3NldHMnKTtcbiAgfSwgMTAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnMjUnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnMjUlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnY3JlYXRpbmcgc3ByZWFkcycpO1xuICB9LCA2MDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICczNScrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCczNSUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCd3YWl0aW5nIGZvciBjb250ZW50Jyk7XG4gIH0sIDEyMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc0MicrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc0MiUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdjcmFja2luZyBQaG90b3Nob3AnKTtcbiAgfSwgMjIwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzQzJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzQzJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2luc3RhbGxpbmcgcHJpbnRlciBkcml2ZXJzJyk7XG4gIH0sIDIzMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc1NScrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc1NSUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdidXlpbmcgdG9uZXInKTtcbiAgfSwgMzAwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzYyJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzYyJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2ZvbGRpbmcgY29ybmVycycpO1xuICB9LCAzNjAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnNjYnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnNjYlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnY2xpcHBpbmcgbWFza3MnKTtcbiAgfSwgNDMwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzcxJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzcxJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2ZpbGxpbmcgZmlsbHMnKTtcbiAgfSwgNTAwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzc3JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzc3JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ3NxdWFyaW5nIGJvcmRlcnMnKTtcbiAgfSwgNTMwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzgyJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzgyJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ3BhZGRpbmcgcGFnZXMnKTtcbiAgfSwgNjMwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzg0JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzg0JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ21hcmdpbmFsaXppbmcgaW1hZ2VzJyk7XG4gIH0sIDY2MDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc4OCcrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc4OCUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdzdWJtaXR0aW5nIGZvciByZXZpZXcnKTtcbiAgfSwgNzAwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzkwJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzkwJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2dyYW1tYXIgY2hlY2tpbmcnKTtcbiAgfSwgNzYwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzk0JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzk0JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ3NlbmRpbmcgb3V0IGZvciBwcm9vZmluZycpO1xuICB9LCA4MDAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnOTgnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnOTglICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnYXBwbHlpbmcgZm9yIGZ1bmRpbmcnKTtcbiAgfSwgOTIwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzEwMCcrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCcxMDAlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnYWN0dWFsbHkgd3JpdGluZycpO1xuICB9LCAxMDAwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJ2JvZHknKS5jc3MoJ2N1cnNvcicsICdhdXRvJyk7XG4gICAgJCggXCIud3JhcHBlclwiICkuYW5pbWF0ZSh7XG4gICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgIHBhZGRpbmdUb3A6IFwiMTAwcHhcIixcbiAgICAgIH0sIDEwMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBzZW5kIHBhZ2UgdG8gZ2FtZVxuICAgIH0pO1xuXG4gIH0sIDEyMDAwKTtcblxuICAkKCcjbG9hZGVyJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnY2hhbmdlJyk7XG4gIH0pXG59XG4iXX0=
