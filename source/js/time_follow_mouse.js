// #counter follows the mouse
$(document).bind('mousemove', function(e){
  if (e.pageX >= ($(document).width()/2)) {
    // if mouse of right side of page
    $('#counter').addClass('mouse_right');
    $('#counter').css({
      left:  e.pageX - 20 - $('#counter').width(),
      top:   e.pageY
    });
  } else {
    // if mouse of left side of page
    $('#counter').removeClass('mouse_right');
    $('#counter').css({
      left:  e.pageX + 20,
      top:   e.pageY
    });
  }

});
