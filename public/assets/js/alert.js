function alertMessage(message) {
  var messageArray = [
    "default alert message",
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbGVydC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBhbGVydE1lc3NhZ2UobWVzc2FnZSkge1xuICB2YXIgbWVzc2FnZUFycmF5ID0gW1xuICAgIFwiZGVmYXVsdCBhbGVydCBtZXNzYWdlXCIsXG4gIF1cbiAgaWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIGlmIG5vIG1lc3NhZ2UgY2hvb3NlIGEgcmFuZG9tIGRlZmF1bHQgb25lXG4gICAgdmFyIG1lc3NhZ2UgPSBtZXNzYWdlQXJyYXlbcmFuZG9tTnVtKG1lc3NhZ2VBcnJheS5sZW5ndGgpXVxuICB9XG5cbiAgdmFyIG1lc3NhZ2VIVE1MID0gJCgnPGRpdiBjbGFzcz1cImFsZXJ0IGRyYWdnYWJsZVwiPjxkaXYgY2xhc3M9XCJ0b3BiYXIgZHJhZ2dhYmxlLWhhbmRsZXJcIj48c3BhbiBjbGFzcz1cInRpdGxlXCI+PGltZyBzcmM9XCIvYXNzZXRzL2ltZy9mYXZpY29uL2Zhdmljb24tMjB4MjAucG5nXCIgLz5BbGVydCBNZXNzYWdlPC9zcGFuPjwvZGl2PjxzcGFuIGNsYXNzPVwiY2xvc2UgY2xvc2VBbGVydFwiPvCdl6s8L3NwYW4+PGgyIGNsYXNzPVwiYWxlcnRUaXRsZVwiPkFsZXJ0PC9oMj48ZGl2IGNsYXNzPVwiYWxlcnRNZXNzYWdlXCI+JyArIG1lc3NhZ2UgKyAnPC9kaXY+PGRpdiBjbGFzcz1cImJ1dHRvbnNcIj48ZGl2IGNsYXNzPVwiYnV0dG9uIGNsb3NlQWxlcnRcIj5Db250aW51ZTwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b24gY2xvc2VBbGVydFwiPkNhbmNlbDwvZGl2PjwvZGl2PjwvZGl2PicpO1xuICAkKCdib2R5JykuYXBwZW5kKG1lc3NhZ2VIVE1MKVxuICBtZXNzYWdlSFRNTC5zaG93KCk7XG4gIC8vIGNyZWF0ZWpzLlNvdW5kLnBsYXkoXCJiZWVwXCIpXG5cdG1lc3NhZ2VIVE1MLmNzcygnbGVmdCcsIHJhbmRvbU51bSh3aW5kb3cuaW5uZXJXaWR0aC0zMDApKydweCcpO1xuICBtZXNzYWdlSFRNTC5jc3MoJ3RvcCcsIHJhbmRvbU51bSh3aW5kb3cuaW5uZXJIZWlnaHQtMTUwKSsncHgnKTtcbn1cblxudmFyIHppbmRleCA9IDEwMDtcbiQoZG9jdW1lbnQpLm9uKCdtb3VzZWRvd24nLCBcIi5kcmFnZ2FibGUtaGFuZGxlclwiLCBmdW5jdGlvbihlKSB7XG4gIGRyYWcgPSAkKHRoaXMpLmNsb3Nlc3QoJy5kcmFnZ2FibGUnKVxuICBkcmFnLmFkZENsYXNzKCdkcmFnZ2luZycpXG4gIGRyYWcuY3NzKCd6LWluZGV4JywgemluZGV4KVxuICB6aW5kZXgrK1xuICBkcmFnLmNzcygnbGVmdCcsIGUuY2xpZW50WC0kKHRoaXMpLndpZHRoKCkvMilcbiAgZHJhZy5jc3MoJ3RvcCcsIGUuY2xpZW50WS0kKHRoaXMpLmhlaWdodCgpLzIgLSAxMClcbiAgJCh0aGlzKS5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSl7XG4gICAgZHJhZy5jc3MoJ2xlZnQnLCBlLmNsaWVudFgtJCh0aGlzKS53aWR0aCgpLzIpXG4gICAgZHJhZy5jc3MoJ3RvcCcsIGUuY2xpZW50WS0kKHRoaXMpLmhlaWdodCgpLzIgLSAxMClcbiAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKClcbiAgfSlcbn0pO1xuXG4kKGRvY3VtZW50KS5vbignbW91c2VsZWF2ZScsIFwiLmRyYWdnYWJsZS1oYW5kbGVyXCIsIGZ1bmN0aW9uKGUpIHtcbiAgc3RvcERyYWdnaW5nKCk7XG59KTtcblxuJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBcIi5kcmFnZ2FibGUtaGFuZGxlclwiLCBmdW5jdGlvbihlKSB7XG4gIHN0b3BEcmFnZ2luZygpO1xufSk7XG5cbmZ1bmN0aW9uIHN0b3BEcmFnZ2luZygpe1xuICBkcmFnID0gJCh0aGlzKS5jbG9zZXN0KCcuZHJhZ2dhYmxlJylcbiAgZHJhZy5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKVxuICAkKHRoaXMpLm9mZignbW91c2Vtb3ZlJylcbn1cblxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgXCIuY2xvc2VBbGVydFwiLCBmdW5jdGlvbigpIHtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5hbGVydCcpLnJlbW92ZSgpO1xufSk7XG4iXSwiZmlsZSI6ImFsZXJ0LmpzIn0=
