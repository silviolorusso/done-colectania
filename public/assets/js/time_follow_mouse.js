// #counter follows the mouse
function updateMouseCounter(e) {
  if (e.clientX >= 200) { // ($(document).width()/2)
    // if mouse of right side of client
    $('.counter').addClass('mouse_right');
    $('.counter').css({
      left:  e.clientX - 20 - $('.counter').width(),
      top:   e.clientY - 50
    });
  } else {
    // if mouse of left side of client
    $('.counter').removeClass('mouse_right');
    $('.counter').css({
      left:  e.clientX + 20,
      top:   e.clientY - 50
    });
  }
}

$(document).bind('mousemove', function(e){
  updateMouseCounter(e);
});

$(document).bind("dragover", function(e){
    updateMouseCounter(e);
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aW1lX2ZvbGxvd19tb3VzZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyAjY291bnRlciBmb2xsb3dzIHRoZSBtb3VzZVxuZnVuY3Rpb24gdXBkYXRlTW91c2VDb3VudGVyKGUpIHtcbiAgaWYgKGUuY2xpZW50WCA+PSAyMDApIHsgLy8gKCQoZG9jdW1lbnQpLndpZHRoKCkvMilcbiAgICAvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIGNsaWVudFxuICAgICQoJy5jb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG4gICAgJCgnLmNvdW50ZXInKS5jc3Moe1xuICAgICAgbGVmdDogIGUuY2xpZW50WCAtIDIwIC0gJCgnLmNvdW50ZXInKS53aWR0aCgpLFxuICAgICAgdG9wOiAgIGUuY2xpZW50WSAtIDUwXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gaWYgbW91c2Ugb2YgbGVmdCBzaWRlIG9mIGNsaWVudFxuICAgICQoJy5jb3VudGVyJykucmVtb3ZlQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG4gICAgJCgnLmNvdW50ZXInKS5jc3Moe1xuICAgICAgbGVmdDogIGUuY2xpZW50WCArIDIwLFxuICAgICAgdG9wOiAgIGUuY2xpZW50WSAtIDUwXG4gICAgfSk7XG4gIH1cbn1cblxuJChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSl7XG4gIHVwZGF0ZU1vdXNlQ291bnRlcihlKTtcbn0pO1xuXG4kKGRvY3VtZW50KS5iaW5kKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSl7XG4gICAgdXBkYXRlTW91c2VDb3VudGVyKGUpO1xufSk7XG4iXSwiZmlsZSI6InRpbWVfZm9sbG93X21vdXNlLmpzIn0=
