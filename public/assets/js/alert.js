function alertMessage(message) {
  var messageArray = [
    "So dope dude. so dope.",
    "Wow... a book filled with screenshots, that looks like modern art",
    "What if this image was roated 5 degrees",
    "👌  Great job",
    "It took you a while",
    "Here have a picture of Trump",
    "I think it would be better to change the font to our company font 'Comic Sans'"
  ]
  if (message === undefined) {
    // if no message choose a random default one
    var message = messageArray[randomNum(messageArray.length)]
  }

  var messageHTML = $('<div class="alert draggable"><div class="topbar draggable-handler"><span class="title"><img src="/assets/img/favicon/favicon-20x20.png" />Alert Message</span></div><span class="close closeAlert">𝗫</span><h2 class="alertTitle">Alert</h2><div class="alertMessage">' + message + '</div><div class="buttons"><div class="button closeAlert">Continue</div><div class="button closeAlert">Cancel</div></div></div>');
  $('body').append(messageHTML)
  messageHTML.show();
  // createjs.Sound.play("beep")
	messageHTML.css('left', randomNum(window.innerWidth-300)+'px');
  messageHTML.css('top', randomNum(window.innerHeight-150)+'px');
}

var zindex = 100;
$(document).on('mousedown', ".draggable-handler", function(e) {
  drag = $(this).closest('.draggable')
  drag.addClass('dragging')
  drag.css('z-index', zindex)
  zindex++
  drag.css('left', e.clientX-$(this).width()/2)
  drag.css('top', e.clientY-$(this).height()/2 - 10)
  $(this).on('mousemove', function(e){
    drag.css('left', e.clientX-$(this).width()/2)
    drag.css('top', e.clientY-$(this).height()/2 - 10)
    window.getSelection().removeAllRanges()
  })
});

$(document).on('mouseleave', ".draggable-handler", function(e) {
  stopDragging();
});

$(document).on('mouseup', ".draggable-handler", function(e) {
  stopDragging();
});

function stopDragging(){
  drag = $(this).closest('.draggable')
  drag.removeClass('dragging')
  $(this).off('mousemove')
}

$(document).on('click', ".closeAlert", function() {
    $(this).closest('.alert').remove();
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbGVydC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBhbGVydE1lc3NhZ2UobWVzc2FnZSkge1xuICB2YXIgbWVzc2FnZUFycmF5ID0gW1xuICAgIFwiU28gZG9wZSBkdWRlLiBzbyBkb3BlLlwiLFxuICAgIFwiV293Li4uIGEgYm9vayBmaWxsZWQgd2l0aCBzY3JlZW5zaG90cywgdGhhdCBsb29rcyBsaWtlIG1vZGVybiBhcnRcIixcbiAgICBcIldoYXQgaWYgdGhpcyBpbWFnZSB3YXMgcm9hdGVkIDUgZGVncmVlc1wiLFxuICAgIFwi8J+RjCAgR3JlYXQgam9iXCIsXG4gICAgXCJJdCB0b29rIHlvdSBhIHdoaWxlXCIsXG4gICAgXCJIZXJlIGhhdmUgYSBwaWN0dXJlIG9mIFRydW1wXCIsXG4gICAgXCJJIHRoaW5rIGl0IHdvdWxkIGJlIGJldHRlciB0byBjaGFuZ2UgdGhlIGZvbnQgdG8gb3VyIGNvbXBhbnkgZm9udCAnQ29taWMgU2FucydcIlxuICBdXG4gIGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQpIHtcbiAgICAvLyBpZiBubyBtZXNzYWdlIGNob29zZSBhIHJhbmRvbSBkZWZhdWx0IG9uZVxuICAgIHZhciBtZXNzYWdlID0gbWVzc2FnZUFycmF5W3JhbmRvbU51bShtZXNzYWdlQXJyYXkubGVuZ3RoKV1cbiAgfVxuXG4gIHZhciBtZXNzYWdlSFRNTCA9ICQoJzxkaXYgY2xhc3M9XCJhbGVydCBkcmFnZ2FibGVcIj48ZGl2IGNsYXNzPVwidG9wYmFyIGRyYWdnYWJsZS1oYW5kbGVyXCI+PHNwYW4gY2xhc3M9XCJ0aXRsZVwiPjxpbWcgc3JjPVwiL2Fzc2V0cy9pbWcvZmF2aWNvbi9mYXZpY29uLTIweDIwLnBuZ1wiIC8+QWxlcnQgTWVzc2FnZTwvc3Bhbj48L2Rpdj48c3BhbiBjbGFzcz1cImNsb3NlIGNsb3NlQWxlcnRcIj7wnZerPC9zcGFuPjxoMiBjbGFzcz1cImFsZXJ0VGl0bGVcIj5BbGVydDwvaDI+PGRpdiBjbGFzcz1cImFsZXJ0TWVzc2FnZVwiPicgKyBtZXNzYWdlICsgJzwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b25zXCI+PGRpdiBjbGFzcz1cImJ1dHRvbiBjbG9zZUFsZXJ0XCI+Q29udGludWU8L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uIGNsb3NlQWxlcnRcIj5DYW5jZWw8L2Rpdj48L2Rpdj48L2Rpdj4nKTtcbiAgJCgnYm9keScpLmFwcGVuZChtZXNzYWdlSFRNTClcbiAgbWVzc2FnZUhUTUwuc2hvdygpO1xuICAvLyBjcmVhdGVqcy5Tb3VuZC5wbGF5KFwiYmVlcFwiKVxuXHRtZXNzYWdlSFRNTC5jc3MoJ2xlZnQnLCByYW5kb21OdW0od2luZG93LmlubmVyV2lkdGgtMzAwKSsncHgnKTtcbiAgbWVzc2FnZUhUTUwuY3NzKCd0b3AnLCByYW5kb21OdW0od2luZG93LmlubmVySGVpZ2h0LTE1MCkrJ3B4Jyk7XG59XG5cbnZhciB6aW5kZXggPSAxMDA7XG4kKGRvY3VtZW50KS5vbignbW91c2Vkb3duJywgXCIuZHJhZ2dhYmxlLWhhbmRsZXJcIiwgZnVuY3Rpb24oZSkge1xuICBkcmFnID0gJCh0aGlzKS5jbG9zZXN0KCcuZHJhZ2dhYmxlJylcbiAgZHJhZy5hZGRDbGFzcygnZHJhZ2dpbmcnKVxuICBkcmFnLmNzcygnei1pbmRleCcsIHppbmRleClcbiAgemluZGV4KytcbiAgZHJhZy5jc3MoJ2xlZnQnLCBlLmNsaWVudFgtJCh0aGlzKS53aWR0aCgpLzIpXG4gIGRyYWcuY3NzKCd0b3AnLCBlLmNsaWVudFktJCh0aGlzKS5oZWlnaHQoKS8yIC0gMTApXG4gICQodGhpcykub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpe1xuICAgIGRyYWcuY3NzKCdsZWZ0JywgZS5jbGllbnRYLSQodGhpcykud2lkdGgoKS8yKVxuICAgIGRyYWcuY3NzKCd0b3AnLCBlLmNsaWVudFktJCh0aGlzKS5oZWlnaHQoKS8yIC0gMTApXG4gICAgd2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpXG4gIH0pXG59KTtcblxuJChkb2N1bWVudCkub24oJ21vdXNlbGVhdmUnLCBcIi5kcmFnZ2FibGUtaGFuZGxlclwiLCBmdW5jdGlvbihlKSB7XG4gIHN0b3BEcmFnZ2luZygpO1xufSk7XG5cbiQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgXCIuZHJhZ2dhYmxlLWhhbmRsZXJcIiwgZnVuY3Rpb24oZSkge1xuICBzdG9wRHJhZ2dpbmcoKTtcbn0pO1xuXG5mdW5jdGlvbiBzdG9wRHJhZ2dpbmcoKXtcbiAgZHJhZyA9ICQodGhpcykuY2xvc2VzdCgnLmRyYWdnYWJsZScpXG4gIGRyYWcucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJylcbiAgJCh0aGlzKS5vZmYoJ21vdXNlbW92ZScpXG59XG5cbiQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiLmNsb3NlQWxlcnRcIiwgZnVuY3Rpb24oKSB7XG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuYWxlcnQnKS5yZW1vdmUoKTtcbn0pO1xuIl0sImZpbGUiOiJhbGVydC5qcyJ9
