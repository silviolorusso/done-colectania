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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJpbnRlcmZhY2UtanMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyksXG4gIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAvLyByZXNpemUgdGhlIGNhbnZhcyB0byBmaWxsIGJyb3dzZXIgd2luZG93IGR5bmFtaWNhbGx5XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemVDYW52YXMsIGZhbHNlKTtcblxuICBmdW5jdGlvbiByZXNpemVDYW52YXMoKSB7XG4gICAgdmFyIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGgqMjtcbiAgICB2YXIgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0KjI7XG4gICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICQod2luZG93KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpID0gMTtcbiAgICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKHN0ZXAsIDMwKTtcblxuXG4gICAgICBmdW5jdGlvbiBzdGVwKCkge1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjRDBEMEQwJztcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuNTtcbiAgICAgICAgY29udGV4dC5maWxsKCk7XG4gICAgICAgIHZhciByYWRpdXMgPSA1O1xuICAgICAgICBjb250ZXh0LmFyYygoMzUqaSksIC0xMCwgcmFkaXVzLCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgIGNvbnRleHQuYXJjKC0xMjAsICgyNSppKSwgcmFkaXVzLCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgIGkrK1xuXG4gICAgICAgIGlmKGkgPT09IDM1MCl7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2NsZWFyJyk7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHJlc2l6ZUNhbnZhcygpO1xuXG5cblxufSkoKTtcblxuJCgnLndyYXBwZXInKS5jc3MoJ29wYWNpdHknLCAnMCcpO1xuJCgnLmxvYWRpbmdiYXInKS5jc3MoJ29wYWNpdHknLCAnMCcpO1xuJCgnI21lc3NhZ2UnKS5hZGRDbGFzcygnYmxpbmsnKTtcblxudmFyIGFsbG93ZWQgPSB0cnVlO1xuXG5pZigkKCcjYXJjaGl2ZScpLmNzcygnZGlzcGxheScpID09ICdub25lJykge1xuICAvLyBjb25zb2xlLmxvZygnaW52aXNpYmxlJyk7XG59IGVsc2Uge1xuICAkKCBcIi53cmFwcGVyXCIgKS5kZWxheSgzMDAwKS5hbmltYXRlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICBwYWRkaW5nVG9wOiBcIjgwcHhcIixcbiAgICB9LCAzMDAwLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cbiAgICAgICQoJyNtZXNzYWdlJykuaHRtbCgncHJlc3MgRU5URVIgdG8gc3RhcnQnKTtcbiAgICAgIGRvY3VtZW50Lm9ua2V5ZG93biA9IGNoZWNrS2V5O1xuICAgICAgJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGVja0tleSgpO1xuICAgICAgfSlcblxuXG4gICAgICBmdW5jdGlvbiBjaGVja0tleSgpIHtcbiAgICAgICAgaWYgKGFsbG93ZWQpIHtcbiAgICAgICAgICBsb2FkZ2FtZSgpXG4gICAgICAgICAgYWxsb3dlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gIH0pO1xufVxuXG5cblxuZnVuY3Rpb24gbG9hZGdhbWUoKSB7XG4gICQoJ2JvZHknKS5jc3MoJ2N1cnNvcicsICd3YWl0Jyk7XG4gICQoJyNtZXNzYWdlJykucmVtb3ZlQ2xhc3MoJ2JsaW5rJyk7XG4gICQoJy5sb2FkaW5nYmFyJykuY3NzKCdvcGFjaXR5JywgJzEnKTtcblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICcxMCcrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCcxMCUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdsb2FkaW5nIGFzc2V0cycpO1xuICB9LCAxMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICcyNScrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCcyNSUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdjcmVhdGluZyBzcHJlYWRzJyk7XG4gIH0sIDYwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzM1JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzM1JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ3dhaXRpbmcgZm9yIGNvbnRlbnQnKTtcbiAgfSwgMTIwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzQyJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzQyJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2NyYWNraW5nIFBob3Rvc2hvcCcpO1xuICB9LCAyMjAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnNDMnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnNDMlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnaW5zdGFsbGluZyBwcmludGVyIGRyaXZlcnMnKTtcbiAgfSwgMjMwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzU1JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzU1JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2J1eWluZyB0b25lcicpO1xuICB9LCAzMDAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnNjInKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnNjIlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnZm9sZGluZyBjb3JuZXJzJyk7XG4gIH0sIDM2MDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc2NicrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc2NiUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdjbGlwcGluZyBtYXNrcycpO1xuICB9LCA0MzAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnNzEnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnNzElICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnZmlsbGluZyBmaWxscycpO1xuICB9LCA1MDAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnNzcnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnNzclICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnc3F1YXJpbmcgYm9yZGVycycpO1xuICB9LCA1MzAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnODInKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnODIlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgncGFkZGluZyBwYWdlcycpO1xuICB9LCA2MzAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnODQnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnODQlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnbWFyZ2luYWxpemluZyBpbWFnZXMnKTtcbiAgfSwgNjYwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzg4JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzg4JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ3N1Ym1pdHRpbmcgZm9yIHJldmlldycpO1xuICB9LCA3MDAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnOTAnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnOTAlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnY2hlY2tpbmcgZ3JhbW1hcicpO1xuICB9LCA3NjAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnOTQnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnOTQlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnc2VuZGluZyBvdXQgcHJvb2ZzJyk7XG4gIH0sIDgwMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc5OCcrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc5OCUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdhcHBseWluZyBmb3IgZnVuZGluZycpO1xuICB9LCA5MjAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnMTAwJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzEwMCUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdhY3R1YWxseSBwdWJsaXNoaW5nJyk7XG4gIH0sIDEwMDAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnYm9keScpLmNzcygnY3Vyc29yJywgJ2F1dG8nKTtcbiAgICAkKCBcIi53cmFwcGVyXCIgKS5hbmltYXRlKHtcbiAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgcGFkZGluZ1RvcDogXCIxMDBweFwiLFxuICAgICAgfSwgMTAwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIHNlbmQgcGFnZSB0byBnYW1lXG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCAnL2RpZmZpY3VsdHknKTtcbiAgICB9KTtcblxuICB9LCAxMjAwMCk7XG5cbiAgJCgnI2xvYWRlcicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2NoYW5nZScpO1xuICB9KVxufSJdLCJmaWxlIjoiaW50ZXJmYWNlLWpzLmpzIn0=
