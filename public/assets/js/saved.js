function savedState() {
  var s = document.getElementsByClassName('spread');
  $('.spread').hide();
  $('.spread').first().show()

  var count = 0;
  $('.spread').click(function () {
  });

  $('.page').click(function (e) {
    var num = $('.page').index(this);
    if (num%2 === 0) {
      s[count].style.display = 'none';
      count++;
      s[count].style.display = 'block';
    } else {
      s[count].style.display = 'none';
      count--;
      s[count].style.display = 'block';
    }
  });
}

// load only when div has saved_view class
if ($('div').hasClass('saved_view')) {
  savedState()
}

function expiredTime() {
  $('body').append('<div id="overlay_flash"><h1>Time has Expired</h1></div>');
  $('#overlay_flash').height($(window).height());
  setTimeout(function () {
    $('#overlay_flash').css('top','unset');
    $('#overlay_flash').css('bottom','0');
    $('#overlay_flash').height(0);
  }, 1000);
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzYXZlZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBzYXZlZFN0YXRlKCkge1xuICB2YXIgcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NwcmVhZCcpO1xuICAkKCcuc3ByZWFkJykuaGlkZSgpO1xuICAkKCcuc3ByZWFkJykuZmlyc3QoKS5zaG93KClcblxuICB2YXIgY291bnQgPSAwO1xuICAkKCcuc3ByZWFkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICB9KTtcblxuICAkKCcucGFnZScpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIG51bSA9ICQoJy5wYWdlJykuaW5kZXgodGhpcyk7XG4gICAgaWYgKG51bSUyID09PSAwKSB7XG4gICAgICBzW2NvdW50XS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgY291bnQrKztcbiAgICAgIHNbY291bnRdLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIH0gZWxzZSB7XG4gICAgICBzW2NvdW50XS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgY291bnQtLTtcbiAgICAgIHNbY291bnRdLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIGxvYWQgb25seSB3aGVuIGRpdiBoYXMgc2F2ZWRfdmlldyBjbGFzc1xuaWYgKCQoJ2RpdicpLmhhc0NsYXNzKCdzYXZlZF92aWV3JykpIHtcbiAgc2F2ZWRTdGF0ZSgpXG59XG5cbmZ1bmN0aW9uIGV4cGlyZWRUaW1lKCkge1xuICAkKCdib2R5JykuYXBwZW5kKCc8ZGl2IGlkPVwib3ZlcmxheV9mbGFzaFwiPjxoMT5UaW1lIGhhcyBFeHBpcmVkPC9oMT48L2Rpdj4nKTtcbiAgJCgnI292ZXJsYXlfZmxhc2gnKS5oZWlnaHQoJCh3aW5kb3cpLmhlaWdodCgpKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgJCgnI292ZXJsYXlfZmxhc2gnKS5jc3MoJ3RvcCcsJ3Vuc2V0Jyk7XG4gICAgJCgnI292ZXJsYXlfZmxhc2gnKS5jc3MoJ2JvdHRvbScsJzAnKTtcbiAgICAkKCcjb3ZlcmxheV9mbGFzaCcpLmhlaWdodCgwKTtcbiAgfSwgMTAwMCk7XG59XG4iXSwiZmlsZSI6InNhdmVkLmpzIn0=
