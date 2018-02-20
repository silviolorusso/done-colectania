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
