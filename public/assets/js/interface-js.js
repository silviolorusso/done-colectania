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
			var interval = setInterval(step, 30);


			function step() {
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

$('.wrapper').css('opacity', '0');
$('.loadingbar').css('opacity', '0');
$('#message').addClass('blink');

var allowed = true;

if($('#archive').css('display') == 'none') {
  // console.log('invisible');
} else {
  $( ".wrapper" ).delay(3000).animate({
      opacity: 1,
      paddingTop: "80px",
    }, 3000, function() {
      // Animation complete.
      $('#message').html('press ENTER to start');
      document.onkeydown = checkKey;
      $(document).click(function () {
        checkKey();
      })


      function checkKey() {
        if (allowed) {
          loadgame()
          allowed = false;
        }
      }
  });
}



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
        $(location).attr('href', '/difficulty');
    });

  }, 12000);

  $('#loader').on('change', function () {
    console.log('change');
  })
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImxvYWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiaW50ZXJmYWNlLWpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gLS0tLS0tLS0tLS0tIEJhY2tncm91bmQgQ2FudmFzIC0tLS0tLS0tLS0tLSAvL1xuKGZ1bmN0aW9uKCkge1xuXG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyksXG5cdGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHQvLyByZXNpemUgdGhlIGNhbnZhcyB0byBmaWxsIGJyb3dzZXIgd2luZG93IGR5bmFtaWNhbGx5XG5cdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemVDYW52YXMsIGZhbHNlKTtcblxuXHRmdW5jdGlvbiByZXNpemVDYW52YXMoKSB7XG4gICAgdmFyIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGgqMjtcbiAgICB2YXIgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0KjI7XG5cdFx0Y2FudmFzLndpZHRoID0gd2lkdGg7XG5cdFx0Y2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuXHRcdCQod2luZG93KS5yZWFkeShmdW5jdGlvbigpIHtcblx0XHRcdHZhciBpID0gMTtcblx0XHRcdHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKHN0ZXAsIDMwKTtcblxuXG5cdFx0XHRmdW5jdGlvbiBzdGVwKCkge1xuXHRcdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9ICcjRDBEMEQwJztcblx0XHRcdFx0Y29udGV4dC5nbG9iYWxBbHBoYSA9IDAuNTtcblx0XHRcdFx0Y29udGV4dC5maWxsKCk7XG5cdFx0XHRcdHZhciByYWRpdXMgPSA1O1xuXHRcdFx0XHRjb250ZXh0LmFyYygoMzUqaSksIC0xMCwgcmFkaXVzLCAwLCBNYXRoLlBJICogMik7XG5cdFx0XHRcdGNvbnRleHQuYXJjKC0xMjAsICgyNSppKSwgcmFkaXVzLCAwLCBNYXRoLlBJICogMik7XG5cdFx0XHRcdGkrK1xuXG5cdFx0XHRcdGlmKGkgPT09IDM1MCl7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ2NsZWFyJyk7XG5cdFx0XHRcdFx0Y2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cdHJlc2l6ZUNhbnZhcygpO1xuXG5cblxufSkoKTtcbiIsIiQoJy53cmFwcGVyJykuY3NzKCdvcGFjaXR5JywgJzAnKTtcbiQoJy5sb2FkaW5nYmFyJykuY3NzKCdvcGFjaXR5JywgJzAnKTtcbiQoJyNtZXNzYWdlJykuYWRkQ2xhc3MoJ2JsaW5rJyk7XG5cbnZhciBhbGxvd2VkID0gdHJ1ZTtcblxuaWYoJCgnI2FyY2hpdmUnKS5jc3MoJ2Rpc3BsYXknKSA9PSAnbm9uZScpIHtcbiAgLy8gY29uc29sZS5sb2coJ2ludmlzaWJsZScpO1xufSBlbHNlIHtcbiAgJCggXCIud3JhcHBlclwiICkuZGVsYXkoMzAwMCkuYW5pbWF0ZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgcGFkZGluZ1RvcDogXCI4MHB4XCIsXG4gICAgfSwgMzAwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG4gICAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ3ByZXNzIEVOVEVSIHRvIHN0YXJ0Jyk7XG4gICAgICBkb2N1bWVudC5vbmtleWRvd24gPSBjaGVja0tleTtcbiAgICAgICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hlY2tLZXkoKTtcbiAgICAgIH0pXG5cblxuICAgICAgZnVuY3Rpb24gY2hlY2tLZXkoKSB7XG4gICAgICAgIGlmIChhbGxvd2VkKSB7XG4gICAgICAgICAgbG9hZGdhbWUoKVxuICAgICAgICAgIGFsbG93ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICB9KTtcbn1cblxuXG5cbmZ1bmN0aW9uIGxvYWRnYW1lKCkge1xuICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnd2FpdCcpO1xuICAkKCcjbWVzc2FnZScpLnJlbW92ZUNsYXNzKCdibGluaycpO1xuICAkKCcubG9hZGluZ2JhcicpLmNzcygnb3BhY2l0eScsICcxJyk7XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnMTAnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnMTAlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnbG9hZGluZyBhc3NldHMnKTtcbiAgfSwgMTAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnMjUnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnMjUlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnY3JlYXRpbmcgc3ByZWFkcycpO1xuICB9LCA2MDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICczNScrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCczNSUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCd3YWl0aW5nIGZvciBjb250ZW50Jyk7XG4gIH0sIDEyMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc0MicrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc0MiUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdjcmFja2luZyBQaG90b3Nob3AnKTtcbiAgfSwgMjIwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzQzJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzQzJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2luc3RhbGxpbmcgcHJpbnRlciBkcml2ZXJzJyk7XG4gIH0sIDIzMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc1NScrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc1NSUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdidXlpbmcgdG9uZXInKTtcbiAgfSwgMzAwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzYyJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzYyJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2ZvbGRpbmcgY29ybmVycycpO1xuICB9LCAzNjAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnNjYnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnNjYlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnY2xpcHBpbmcgbWFza3MnKTtcbiAgfSwgNDMwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzcxJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzcxJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2ZpbGxpbmcgZmlsbHMnKTtcbiAgfSwgNTAwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzc3JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzc3JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ3NxdWFyaW5nIGJvcmRlcnMnKTtcbiAgfSwgNTMwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzgyJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzgyJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ3BhZGRpbmcgcGFnZXMnKTtcbiAgfSwgNjMwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzg0JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzg0JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ21hcmdpbmFsaXppbmcgaW1hZ2VzJyk7XG4gIH0sIDY2MDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc4OCcrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc4OCUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdzdWJtaXR0aW5nIGZvciByZXZpZXcnKTtcbiAgfSwgNzAwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzkwJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzkwJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2dyYW1tYXIgY2hlY2tpbmcnKTtcbiAgfSwgNzYwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzk0JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzk0JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ3NlbmRpbmcgb3V0IGZvciBwcm9vZmluZycpO1xuICB9LCA4MDAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnOTgnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnOTglICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnYXBwbHlpbmcgZm9yIGZ1bmRpbmcnKTtcbiAgfSwgOTIwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzEwMCcrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCcxMDAlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnYWN0dWFsbHkgd3JpdGluZycpO1xuICB9LCAxMDAwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJ2JvZHknKS5jc3MoJ2N1cnNvcicsICdhdXRvJyk7XG4gICAgJCggXCIud3JhcHBlclwiICkuYW5pbWF0ZSh7XG4gICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgIHBhZGRpbmdUb3A6IFwiMTAwcHhcIixcbiAgICAgIH0sIDEwMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBzZW5kIHBhZ2UgdG8gZ2FtZVxuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgJy9kaWZmaWN1bHR5Jyk7XG4gICAgfSk7XG5cbiAgfSwgMTIwMDApO1xuXG4gICQoJyNsb2FkZXInKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdjaGFuZ2UnKTtcbiAgfSlcbn1cbiJdfQ==
