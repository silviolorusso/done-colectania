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

// play splash sound
$(document).ready(function(){
  setTimeout(function(){
    sfx.splash()
  }, 3000)
})

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
  sfx.button()
  $('body').css('cursor', 'wait');
  $('#message').removeClass('blink');
  $('.loadingbar').css('opacity', '1');

  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '10'+ '%');
    $('#percentage').html('10% ');
    $('#message').html('loading assets');
  }, 100);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '25'+ '%');
    $('#percentage').html('25% ');
    $('#message').html('creating spreads');
  }, 600);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '35'+ '%');
    $('#percentage').html('35% ');
    $('#message').html('waiting for content');
  }, 1200);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '42'+ '%');
    $('#percentage').html('42% ');
    $('#message').html('cracking Photoshop');
  }, 2200);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '43'+ '%');
    $('#percentage').html('43% ');
    $('#message').html('installing printer drivers');
  }, 2300);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '55'+ '%');
    $('#percentage').html('55% ');
    $('#message').html('buying toner');
  }, 3000);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '62'+ '%');
    $('#percentage').html('62% ');
    $('#message').html('folding corners');
  }, 3600);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '66'+ '%');
    $('#percentage').html('66% ');
    $('#message').html('clipping masks');
  }, 4300);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '71'+ '%');
    $('#percentage').html('71% ');
    $('#message').html('filling fills');
  }, 5000);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '77'+ '%');
    $('#percentage').html('77% ');
    $('#message').html('squaring borders');
  }, 5300);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '82'+ '%');
    $('#percentage').html('82% ');
    $('#message').html('padding pages');
  }, 6300);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '84'+ '%');
    $('#percentage').html('84% ');
    $('#message').html('marginalizing images');
  }, 6600);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '88'+ '%');
    $('#percentage').html('88% ');
    $('#message').html('submitting for review');
  }, 7000);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '90'+ '%');
    $('#percentage').html('90% ');
    $('#message').html('checking grammar');
  }, 7600);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '94'+ '%');
    $('#percentage').html('94% ');
    $('#message').html('sending out proofs');
  }, 8000);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '98'+ '%');
    $('#percentage').html('98% ');
    $('#message').html('applying for funding');
  }, 9200);
  setTimeout(function () {
    sfx.loading()
    $('#loader').css('width', '100'+ '%');
    $('#percentage').html('100% ');
    $('#message').html('actually publishing');
  }, 10000);
  setTimeout(function () {
    sfx.loaded()
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzcGxhc2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuJCgnLnNvdW5kJykuY3NzKCdvcGFjaXR5JywgJzAnKTtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSxcbiAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIC8vIHJlc2l6ZSB0aGUgY2FudmFzIHRvIGZpbGwgYnJvd3NlciB3aW5kb3cgZHluYW1pY2FsbHlcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZUNhbnZhcywgZmFsc2UpO1xuXG4gIGZ1bmN0aW9uIHJlc2l6ZUNhbnZhcygpIHtcbiAgICB2YXIgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCoyO1xuICAgIHZhciBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQqMjtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgJCh3aW5kb3cpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGkgPSAxO1xuICAgICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoc3RlcCwgMzApO1xuXG4gICAgICBmdW5jdGlvbiBzdGVwKCkge1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjRDBEMEQwJztcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuNTtcbiAgICAgICAgY29udGV4dC5maWxsKCk7XG4gICAgICAgIHZhciByYWRpdXMgPSA1O1xuICAgICAgICBjb250ZXh0LmFyYygoMzUqaSksIC0xMCwgcmFkaXVzLCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgIGNvbnRleHQuYXJjKC0xMjAsICgyNSppKSwgcmFkaXVzLCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgIGkrK1xuXG4gICAgICAgIGlmKGkgPT09IDM1MCl7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2NsZWFyJyk7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHJlc2l6ZUNhbnZhcygpO1xuXG59KSgpO1xuXG4vLyBwbGF5IHNwbGFzaCBzb3VuZFxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcbiAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgIHNmeC5zcGxhc2goKVxuICB9LCAzMDAwKVxufSlcblxuJCgnLndyYXBwZXInKS5jc3MoJ29wYWNpdHknLCAnMCcpO1xuJCgnLmxvYWRpbmdiYXInKS5jc3MoJ29wYWNpdHknLCAnMCcpO1xuJCgnI21lc3NhZ2UnKS5hZGRDbGFzcygnYmxpbmsnKTtcblxudmFyIGFsbG93ZWQgPSB0cnVlO1xuXG5pZigkKCcjYXJjaGl2ZScpLmNzcygnZGlzcGxheScpID09ICdub25lJykge1xuICAvLyBjb25zb2xlLmxvZygnaW52aXNpYmxlJyk7XG59IGVsc2Uge1xuICAkKCBcIi53cmFwcGVyXCIgKS5kZWxheSgzMDAwKS5hbmltYXRlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICBwYWRkaW5nVG9wOiBcIjgwcHhcIixcbiAgICB9LCAzMDAwLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cbiAgICAgICQoJyNtZXNzYWdlJykuaHRtbCgncHJlc3MgRU5URVIgdG8gc3RhcnQnKTtcbiAgICAgIGRvY3VtZW50Lm9ua2V5ZG93biA9IGNoZWNrS2V5O1xuICAgICAgJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGVja0tleSgpO1xuICAgICAgfSlcblxuXG4gICAgICBmdW5jdGlvbiBjaGVja0tleSgpIHtcbiAgICAgICAgaWYgKGFsbG93ZWQpIHtcbiAgICAgICAgICBsb2FkZ2FtZSgpXG4gICAgICAgICAgYWxsb3dlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gIH0pO1xufVxuXG5cblxuZnVuY3Rpb24gbG9hZGdhbWUoKSB7XG4gIHNmeC5idXR0b24oKVxuICAkKCdib2R5JykuY3NzKCdjdXJzb3InLCAnd2FpdCcpO1xuICAkKCcjbWVzc2FnZScpLnJlbW92ZUNsYXNzKCdibGluaycpO1xuICAkKCcubG9hZGluZ2JhcicpLmNzcygnb3BhY2l0eScsICcxJyk7XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgc2Z4LmxvYWRpbmcoKVxuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzEwJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzEwJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2xvYWRpbmcgYXNzZXRzJyk7XG4gIH0sIDEwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIHNmeC5sb2FkaW5nKClcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICcyNScrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCcyNSUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdjcmVhdGluZyBzcHJlYWRzJyk7XG4gIH0sIDYwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIHNmeC5sb2FkaW5nKClcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICczNScrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCczNSUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCd3YWl0aW5nIGZvciBjb250ZW50Jyk7XG4gIH0sIDEyMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBzZngubG9hZGluZygpXG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnNDInKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnNDIlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnY3JhY2tpbmcgUGhvdG9zaG9wJyk7XG4gIH0sIDIyMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBzZngubG9hZGluZygpXG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnNDMnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnNDMlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnaW5zdGFsbGluZyBwcmludGVyIGRyaXZlcnMnKTtcbiAgfSwgMjMwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIHNmeC5sb2FkaW5nKClcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc1NScrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc1NSUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdidXlpbmcgdG9uZXInKTtcbiAgfSwgMzAwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIHNmeC5sb2FkaW5nKClcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc2MicrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc2MiUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdmb2xkaW5nIGNvcm5lcnMnKTtcbiAgfSwgMzYwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIHNmeC5sb2FkaW5nKClcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc2NicrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc2NiUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdjbGlwcGluZyBtYXNrcycpO1xuICB9LCA0MzAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgc2Z4LmxvYWRpbmcoKVxuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzcxJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzcxJSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2ZpbGxpbmcgZmlsbHMnKTtcbiAgfSwgNTAwMCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIHNmeC5sb2FkaW5nKClcbiAgICAkKCcjbG9hZGVyJykuY3NzKCd3aWR0aCcsICc3NycrICclJyk7XG4gICAgJCgnI3BlcmNlbnRhZ2UnKS5odG1sKCc3NyUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdzcXVhcmluZyBib3JkZXJzJyk7XG4gIH0sIDUzMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBzZngubG9hZGluZygpXG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnODInKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnODIlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgncGFkZGluZyBwYWdlcycpO1xuICB9LCA2MzAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgc2Z4LmxvYWRpbmcoKVxuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzg0JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzg0JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ21hcmdpbmFsaXppbmcgaW1hZ2VzJyk7XG4gIH0sIDY2MDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBzZngubG9hZGluZygpXG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnODgnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnODglICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnc3VibWl0dGluZyBmb3IgcmV2aWV3Jyk7XG4gIH0sIDcwMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBzZngubG9hZGluZygpXG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnOTAnKyAnJScpO1xuICAgICQoJyNwZXJjZW50YWdlJykuaHRtbCgnOTAlICcpO1xuICAgICQoJyNtZXNzYWdlJykuaHRtbCgnY2hlY2tpbmcgZ3JhbW1hcicpO1xuICB9LCA3NjAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgc2Z4LmxvYWRpbmcoKVxuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzk0JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzk0JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ3NlbmRpbmcgb3V0IHByb29mcycpO1xuICB9LCA4MDAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgc2Z4LmxvYWRpbmcoKVxuICAgICQoJyNsb2FkZXInKS5jc3MoJ3dpZHRoJywgJzk4JysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzk4JSAnKTtcbiAgICAkKCcjbWVzc2FnZScpLmh0bWwoJ2FwcGx5aW5nIGZvciBmdW5kaW5nJyk7XG4gIH0sIDkyMDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBzZngubG9hZGluZygpXG4gICAgJCgnI2xvYWRlcicpLmNzcygnd2lkdGgnLCAnMTAwJysgJyUnKTtcbiAgICAkKCcjcGVyY2VudGFnZScpLmh0bWwoJzEwMCUgJyk7XG4gICAgJCgnI21lc3NhZ2UnKS5odG1sKCdhY3R1YWxseSBwdWJsaXNoaW5nJyk7XG4gIH0sIDEwMDAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgc2Z4LmxvYWRlZCgpXG4gICAgJCgnYm9keScpLmNzcygnY3Vyc29yJywgJ2F1dG8nKTtcbiAgICAkKCBcIi53cmFwcGVyXCIgKS5hbmltYXRlKHtcbiAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgcGFkZGluZ1RvcDogXCIxMDBweFwiLFxuICAgICAgfSwgMTAwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIHNlbmQgcGFnZSB0byBnYW1lXG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCAnL2RpZmZpY3VsdHknKTtcbiAgICB9KTtcblxuICB9LCAxMjAwMCk7XG5cbiAgJCgnI2xvYWRlcicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2NoYW5nZScpO1xuICB9KVxufVxuIl0sImZpbGUiOiJzcGxhc2guanMifQ==
