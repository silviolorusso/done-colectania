function criticSays(message, actor) {
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
    // choose a random default one
    var message = messageArray[randomNum(messageArray.length)]
  }

  var actorArray = [
    "Stef",
    "Silvio",
    "Obama",
    "Clippy"
  ]
  if (actor === undefined) {
    // choose a random default one
    var actor = actorArray[randomNum(actorArray.length)]
  }


  var messageHTML = $('<div class="comment"><div class="message">' + actor + ': ' + message + '</div><div class="image"><img src="assets/img/critic/' + actor + '.jpg"></div></div>');
  messageHTML.css('opacity', '0');
  messageHTML.hide();
  $('.suggestions').append(messageHTML)
  messageHTML.show();
	messageHTML.css('left', '-100px');
	messageHTML.animate({
	    opacity: 1,
	    left: "0px",
	  }, 500, function() {
	    // Animation complete.
      setTimeout(function () {
        messageHTML.animate({
            opacity: 0,
            left: "-100px",
          }, 500, function() {
            // Animation complete.
        });
      }, 6000);
	});
}

function randomNum(max) {
  max = max-1;
  var num = Math.round(Math.random() * (max - 0) + 0);
  return num
  // TODO: Not allowing duplicate messages
}


// EXAMPLES

// criticSays('dance dance', 'cat');
// or
// criticSays('dance dance');
// or
// criticSays();
