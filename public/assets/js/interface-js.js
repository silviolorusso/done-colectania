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

$('.wrapper').css('opacity', '0');
$('.loadingbar').css('opacity', '0');
$('#message').addClass('blink');


$( ".wrapper" ).delay(3000).animate({
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImxvYWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJpbnRlcmZhY2UtanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0tLS0tLS0tLS0gQmFja2dyb3VuZCBDYW52YXMgLS0tLS0tLS0tLS0tIC8vXG4oZnVuY3Rpb24oKSB7XG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyksXG5cdGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHQvLyByZXNpemUgdGhlIGNhbnZhcyB0byBmaWxsIGJyb3dzZXIgd2luZG93IGR5bmFtaWNhbGx5XG5cdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemVDYW52YXMsIGZhbHNlKTtcblxuXHRmdW5jdGlvbiByZXNpemVDYW52YXMoKSB7XG4gICAgdmFyIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGgqMjtcbiAgICB2YXIgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0KjI7XG5cdFx0Y2FudmFzLndpZHRoID0gd2lkdGg7XG5cdFx0Y2FudmFzLmhlaWdodCA9IGhlaWdodDtcblx0XHRmdW5jdGlvbiBkcmF3U3R1ZmYoKSB7XG4gICAgICBmdW5jdGlvbiBnZXRSYW5kb21JbnQobWF4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNYXRoLmZsb29yKG1heCkpO1xuICAgICAgfVxuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDE2MDsgaSsrKSB7XG5cdFx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gJ3JlZCc7XG5cdFx0XHRcdGNvbnRleHQuZmlsbCgpO1xuXHRcdFx0XHR2YXIgcmFkaXVzID0gMTtcblx0XHRcdFx0Y29udGV4dC5hcmMoKDE1KmkpLCAtMTUsIHJhZGl1cywgMCwgTWF0aC5QSSAqIDIpO1xuXHRcdFx0XHRjb250ZXh0LmFyYygtMTUsICgxMCppKSwgcmFkaXVzLCAwLCBNYXRoLlBJICogMik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCQod2luZG93KS5yZWFkeShmdW5jdGlvbigpIHtcblx0XHRcdC8vIGRyYXdTdHVmZigpO1xuXHRcdFx0ZHJhd1N0dWZmKCk7XG5cdFx0fSlcblx0fVxuXHRyZXNpemVDYW52YXMoKTtcblxufSkoKTtcbiIsIiQoJy53cmFwcGVyJykuY3NzKCdvcGFjaXR5JywgJzAnKTtcbiQoJy5sb2FkaW5nYmFyJykuY3NzKCdvcGFjaXR5JywgJzAnKTtcbiQoJyNtZXNzYWdlJykuYWRkQ2xhc3MoJ2JsaW5rJyk7XG5cblxuJCggXCIud3JhcHBlclwiICkuZGVsYXkoMzAwMCkuYW5pbWF0ZSh7XG4gICAgb3BhY2l0eTogMSxcbiAgICBwYWRkaW5nVG9wOiBcIjgwcHhcIixcbiAgfSwgMzAwMCwgZnVuY3Rpb24oKSB7XG4gICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICAgICQoJyNtZXNzYWdlJykuaHRtbCgncHJlc3MgRU5URVIgdG8gc3RhcnQnKTtcbiAgICBkb2N1bWVudC5vbmtleWRvd24gPSBjaGVja0tleTtcblxuICAgIGZ1bmN0aW9uIGNoZWNrS2V5KGUpIHtcbiAgICAgICAgaWYgKGUua2V5Q29kZSkge1xuICAgICAgICAgIGxvYWRnYW1lKClcbiAgICAgIH1cbiAgICB9XG59KTtcblxuXG5mdW5jdGlvbiBsb2FkZ2FtZSgpIHtcbiAgJCgnYm9keScpLmNzcygnY3Vyc29yJywgJ3dhaXQnKTtcbiAgJCgnI21lc3NhZ2UnKS5yZW1vdmVDbGFzcygnYmxpbmsnKTtcbiAgJCgnLmxvYWRpbmdiYXInKS5jc3MoJ29wYWNpdHknLCAnMScpO1xuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzEwJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzEwJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2xvYWRpbmcgYXNzZXRzJyk7XG4gIH0sIDEwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzI1JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzI1JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2NyZWF0aW5nIHNwcmVhZHMnKTtcbiAgfSwgNjAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnMzUnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnMzUlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnd2FpdGluZyBmb3IgY29udGVudCcpO1xuICB9LCAxMjAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnNDInKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnNDIlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnY3JhY2tpbmcgUGhvdG9zaG9wJyk7XG4gIH0sIDIyMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc0MycrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc0MyUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdpbnN0YWxsaW5nIHByaW50ZXIgZHJpdmVycycpO1xuICB9LCAyMzAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnNTUnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnNTUlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnYnV5aW5nIHRvbmVyJyk7XG4gIH0sIDMwMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc2MicrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc2MiUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdmb2xkaW5nIGNvcm5lcnMnKTtcbiAgfSwgMzYwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzY2JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzY2JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2NsaXBwaW5nIG1hc2tzJyk7XG4gIH0sIDQzMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc3MScrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc3MSUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdmaWxsaW5nIGZpbGxzJyk7XG4gIH0sIDUwMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc3NycrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc3NyUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdzcXVhcmluZyBib3JkZXJzJyk7XG4gIH0sIDUzMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc4MicrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc4MiUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdwYWRkaW5nIHBhZ2VzJyk7XG4gIH0sIDYzMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc4NCcrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc4NCUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdtYXJnaW5hbGl6aW5nIGltYWdlcycpO1xuICB9LCA2NjAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnODgnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnODglICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnc3VibWl0dGluZyBmb3IgcmV2aWV3Jyk7XG4gIH0sIDcwMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc5MCcrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc5MCUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdncmFtbWFyIGNoZWNraW5nJyk7XG4gIH0sIDc2MDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc5NCcrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc5NCUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdzZW5kaW5nIG91dCBmb3IgcHJvb2ZpbmcnKTtcbiAgfSwgODAwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzk4JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzk4JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2FwcGx5aW5nIGZvciBmdW5kaW5nJyk7XG4gIH0sIDkyMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICcxMDAnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnMTAwJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2FjdHVhbGx5IHdyaXRpbmcnKTtcbiAgfSwgMTAwMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnYXV0bycpO1xuICAgICQoIFwiLndyYXBwZXJcIiApLmFuaW1hdGUoe1xuICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICBwYWRkaW5nVG9wOiBcIjEwMHB4XCIsXG4gICAgICB9LCAxMDAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gc2VuZCBwYWdlIHRvIGdhbWVcbiAgICB9KTtcblxuICB9LCAxMjAwMCk7XG5cbiAgJCgnI2xvYWRlcicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2NoYW5nZScpO1xuICB9KVxufVxuIl19
