// #counter follows the mouse
function updateMouseCounter(e) {
  $('.counter').css('opacity', '1');
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aW1lX2ZvbGxvd19tb3VzZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyAjY291bnRlciBmb2xsb3dzIHRoZSBtb3VzZVxuZnVuY3Rpb24gdXBkYXRlTW91c2VDb3VudGVyKGUpIHtcbiAgJCgnLmNvdW50ZXInKS5jc3MoJ29wYWNpdHknLCAnMScpO1xuICBpZiAoZS5jbGllbnRYID49IDIwMCkgeyAvLyAoJChkb2N1bWVudCkud2lkdGgoKS8yKVxuICAgIC8vIGlmIG1vdXNlIG9mIHJpZ2h0IHNpZGUgb2YgY2xpZW50XG4gICAgJCgnLmNvdW50ZXInKS5hZGRDbGFzcygnbW91c2VfcmlnaHQnKTtcbiAgICAkKCcuY291bnRlcicpLmNzcyh7XG4gICAgICBsZWZ0OiAgZS5jbGllbnRYIC0gMjAgLSAkKCcuY291bnRlcicpLndpZHRoKCksXG4gICAgICB0b3A6ICAgZS5jbGllbnRZIC0gNTBcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgY2xpZW50XG4gICAgJCgnLmNvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcbiAgICAkKCcuY291bnRlcicpLmNzcyh7XG4gICAgICBsZWZ0OiAgZS5jbGllbnRYICsgMjAsXG4gICAgICB0b3A6ICAgZS5jbGllbnRZIC0gNTBcbiAgICB9KTtcbiAgfVxufVxuXG4kKGRvY3VtZW50KS5iaW5kKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKXtcbiAgdXBkYXRlTW91c2VDb3VudGVyKGUpO1xufSk7XG5cbiQoZG9jdW1lbnQpLmJpbmQoXCJkcmFnb3ZlclwiLCBmdW5jdGlvbihlKXtcbiAgICB1cGRhdGVNb3VzZUNvdW50ZXIoZSk7XG59KTtcbiJdLCJmaWxlIjoidGltZV9mb2xsb3dfbW91c2UuanMifQ==
