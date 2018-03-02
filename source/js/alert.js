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
