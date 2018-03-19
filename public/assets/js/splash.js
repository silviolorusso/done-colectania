(function() {
$('.sound').css('opacity', '0');
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
    $('#message').html('checking grammar');
  }, 7600);
  setTimeout(function () {
    $('#loader').css('width', '94'+ '%');
    $('#percentage').html('94% ');
    $('#message').html('sending out proofs');
  }, 8000);
  setTimeout(function () {
    $('#loader').css('width', '98'+ '%');
    $('#percentage').html('98% ');
    $('#message').html('applying for funding');
  }, 9200);
  setTimeout(function () {
    $('#loader').css('width', '100'+ '%');
    $('#percentage').html('100% ');
    $('#message').html('actually publishing');
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzcGxhc2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuJCgnLnNvdW5kJykuY3NzKCdvcGFjaXR5JywgJzAnKTtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSxcbiAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIC8vIHJlc2l6ZSB0aGUgY2FudmFzIHRvIGZpbGwgYnJvd3NlciB3aW5kb3cgZHluYW1pY2FsbHlcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZUNhbnZhcywgZmFsc2UpO1xuXG4gIGZ1bmN0aW9uIHJlc2l6ZUNhbnZhcygpIHtcbiAgICB2YXIgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCoyO1xuICAgIHZhciBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQqMjtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgJCh3aW5kb3cpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGkgPSAxO1xuICAgICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoc3RlcCwgMzApO1xuXG5cbiAgICAgIGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyNEMEQwRDAnO1xuICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gMC41O1xuICAgICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAgICAgdmFyIHJhZGl1cyA9IDU7XG4gICAgICAgIGNvbnRleHQuYXJjKCgzNSppKSwgLTEwLCByYWRpdXMsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgICAgY29udGV4dC5hcmMoLTEyMCwgKDI1KmkpLCByYWRpdXMsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgICAgaSsrXG5cbiAgICAgICAgaWYoaSA9PT0gMzUwKXtcbiAgICAgICAgICBjb25zb2xlLmxvZygnY2xlYXInKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcmVzaXplQ2FudmFzKCk7XG5cblxuXG59KSgpO1xuXG4kKCcud3JhcHBlcicpLmNzcygnb3BhY2l0eScsICcwJyk7XG4kKCcubG9hZGluZ2JhcicpLmNzcygnb3BhY2l0eScsICcwJyk7XG4kKCcjbWVzc2FnZScpLmFkZENsYXNzKCdibGluaycpO1xuXG52YXIgYWxsb3dlZCA9IHRydWU7XG5cbmlmKCQoJyNhcmNoaXZlJykuY3NzKCdkaXNwbGF5JykgPT0gJ25vbmUnKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdpbnZpc2libGUnKTtcbn0gZWxzZSB7XG4gICQoIFwiLndyYXBwZXJcIiApLmRlbGF5KDMwMDApLmFuaW1hdGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIHBhZGRpbmdUb3A6IFwiODBweFwiLFxuICAgIH0sIDMwMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICAgICAgJCgnI21lc3NhZ2UnKS5odG1sKCdwcmVzcyBFTlRFUiB0byBzdGFydCcpO1xuICAgICAgZG9jdW1lbnQub25rZXlkb3duID0gY2hlY2tLZXk7XG4gICAgICAkKGRvY3VtZW50KS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoZWNrS2V5KCk7XG4gICAgICB9KVxuXG5cbiAgICAgIGZ1bmN0aW9uIGNoZWNrS2V5KCkge1xuICAgICAgICBpZiAoYWxsb3dlZCkge1xuICAgICAgICAgIGxvYWRnYW1lKClcbiAgICAgICAgICBhbGxvd2VkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgfSk7XG59XG5cblxuXG5mdW5jdGlvbiBsb2FkZ2FtZSgpIHtcbiAgJCgnYm9keScpLmNzcygnY3Vyc29yJywgJ3dhaXQnKTtcbiAgJCgnI21lc3NhZ2UnKS5yZW1vdmVDbGFzcygnYmxpbmsnKTtcbiAgJCgnLmxvYWRpbmdiYXInKS5jc3MoJ29wYWNpdHknLCAnMScpO1xuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzEwJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzEwJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2xvYWRpbmcgYXNzZXRzJyk7XG4gIH0sIDEwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzI1JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzI1JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2NyZWF0aW5nIHNwcmVhZHMnKTtcbiAgfSwgNjAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnMzUnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnMzUlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnd2FpdGluZyBmb3IgY29udGVudCcpO1xuICB9LCAxMjAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnNDInKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnNDIlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnY3JhY2tpbmcgUGhvdG9zaG9wJyk7XG4gIH0sIDIyMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc0MycrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc0MyUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdpbnN0YWxsaW5nIHByaW50ZXIgZHJpdmVycycpO1xuICB9LCAyMzAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnNTUnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnNTUlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnYnV5aW5nIHRvbmVyJyk7XG4gIH0sIDMwMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc2MicrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc2MiUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdmb2xkaW5nIGNvcm5lcnMnKTtcbiAgfSwgMzYwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzY2JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzY2JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2NsaXBwaW5nIG1hc2tzJyk7XG4gIH0sIDQzMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc3MScrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc3MSUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdmaWxsaW5nIGZpbGxzJyk7XG4gIH0sIDUwMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc3NycrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc3NyUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdzcXVhcmluZyBib3JkZXJzJyk7XG4gIH0sIDUzMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc4MicrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc4MiUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdwYWRkaW5nIHBhZ2VzJyk7XG4gIH0sIDYzMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc4NCcrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc4NCUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdtYXJnaW5hbGl6aW5nIGltYWdlcycpO1xuICB9LCA2NjAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnODgnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnODglICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnc3VibWl0dGluZyBmb3IgcmV2aWV3Jyk7XG4gIH0sIDcwMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc5MCcrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc5MCUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdjaGVja2luZyBncmFtbWFyJyk7XG4gIH0sIDc2MDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc5NCcrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc5NCUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdzZW5kaW5nIG91dCBwcm9vZnMnKTtcbiAgfSwgODAwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzk4JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzk4JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2FwcGx5aW5nIGZvciBmdW5kaW5nJyk7XG4gIH0sIDkyMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICcxMDAnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnMTAwJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2FjdHVhbGx5IHB1Ymxpc2hpbmcnKTtcbiAgfSwgMTAwMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnYXV0bycpO1xuICAgICQoIFwiLndyYXBwZXJcIiApLmFuaW1hdGUoe1xuICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICBwYWRkaW5nVG9wOiBcIjEwMHB4XCIsXG4gICAgICB9LCAxMDAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gc2VuZCBwYWdlIHRvIGdhbWVcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsICcvZGlmZmljdWx0eScpO1xuICAgIH0pO1xuXG4gIH0sIDEyMDAwKTtcblxuICAkKCcjbG9hZGVyJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnY2hhbmdlJyk7XG4gIH0pXG59XG4iXSwiZmlsZSI6InNwbGFzaC5qcyJ9
