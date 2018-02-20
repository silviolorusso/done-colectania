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
    "Clippy",
    "Gutenberg"
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjcml0aWMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gY3JpdGljU2F5cyhtZXNzYWdlLCBhY3Rvcikge1xuICB2YXIgbWVzc2FnZUFycmF5ID0gW1xuICAgIFwiU28gZG9wZSBkdWRlLiBzbyBkb3BlLlwiLFxuICAgIFwiV293Li4uIGEgYm9vayBmaWxsZWQgd2l0aCBzY3JlZW5zaG90cywgdGhhdCBsb29rcyBsaWtlIG1vZGVybiBhcnRcIixcbiAgICBcIldoYXQgaWYgdGhpcyBpbWFnZSB3YXMgcm9hdGVkIDUgZGVncmVlc1wiLFxuICAgIFwi8J+RjCAgR3JlYXQgam9iXCIsXG4gICAgXCJJdCB0b29rIHlvdSBhIHdoaWxlXCIsXG4gICAgXCJIZXJlIGhhdmUgYSBwaWN0dXJlIG9mIFRydW1wXCIsXG4gICAgXCJJIHRoaW5rIGl0IHdvdWxkIGJlIGJldHRlciB0byBjaGFuZ2UgdGhlIGZvbnQgdG8gb3VyIGNvbXBhbnkgZm9udCAnQ29taWMgU2FucydcIlxuICBdXG4gIGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQpIHtcbiAgICAvLyBjaG9vc2UgYSByYW5kb20gZGVmYXVsdCBvbmVcbiAgICB2YXIgbWVzc2FnZSA9IG1lc3NhZ2VBcnJheVtyYW5kb21OdW0obWVzc2FnZUFycmF5Lmxlbmd0aCldXG4gIH1cblxuICB2YXIgYWN0b3JBcnJheSA9IFtcbiAgICBcIlN0ZWZcIixcbiAgICBcIlNpbHZpb1wiLFxuICAgIFwiT2JhbWFcIixcbiAgICBcIkNsaXBweVwiLFxuICAgIFwiR3V0ZW5iZXJnXCJcbiAgXVxuICBpZiAoYWN0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIGNob29zZSBhIHJhbmRvbSBkZWZhdWx0IG9uZVxuICAgIHZhciBhY3RvciA9IGFjdG9yQXJyYXlbcmFuZG9tTnVtKGFjdG9yQXJyYXkubGVuZ3RoKV1cbiAgfVxuXG5cbiAgdmFyIG1lc3NhZ2VIVE1MID0gJCgnPGRpdiBjbGFzcz1cImNvbW1lbnRcIj48ZGl2IGNsYXNzPVwibWVzc2FnZVwiPicgKyBhY3RvciArICc6ICcgKyBtZXNzYWdlICsgJzwvZGl2PjxkaXYgY2xhc3M9XCJpbWFnZVwiPjxpbWcgc3JjPVwiYXNzZXRzL2ltZy9jcml0aWMvJyArIGFjdG9yICsgJy5qcGdcIj48L2Rpdj48L2Rpdj4nKTtcbiAgbWVzc2FnZUhUTUwuY3NzKCdvcGFjaXR5JywgJzAnKTtcbiAgbWVzc2FnZUhUTUwuaGlkZSgpO1xuICAkKCcuc3VnZ2VzdGlvbnMnKS5hcHBlbmQobWVzc2FnZUhUTUwpXG4gIG1lc3NhZ2VIVE1MLnNob3coKTtcblx0bWVzc2FnZUhUTUwuY3NzKCdsZWZ0JywgJy0xMDBweCcpO1xuXHRtZXNzYWdlSFRNTC5hbmltYXRlKHtcblx0ICAgIG9wYWNpdHk6IDEsXG5cdCAgICBsZWZ0OiBcIjBweFwiLFxuXHQgIH0sIDUwMCwgZnVuY3Rpb24oKSB7XG5cdCAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbWVzc2FnZUhUTUwuYW5pbWF0ZSh7XG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgbGVmdDogXCItMTAwcHhcIixcbiAgICAgICAgICB9LCA1MDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICAgICAgICB9KTtcbiAgICAgIH0sIDYwMDApO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gcmFuZG9tTnVtKG1heCkge1xuICBtYXggPSBtYXgtMTtcbiAgdmFyIG51bSA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIChtYXggLSAwKSArIDApO1xuICByZXR1cm4gbnVtXG4gIC8vIFRPRE86IE5vdCBhbGxvd2luZyBkdXBsaWNhdGUgbWVzc2FnZXNcbn1cblxuXG4vLyBFWEFNUExFU1xuXG4vLyBjcml0aWNTYXlzKCdkYW5jZSBkYW5jZScsICdjYXQnKTtcbi8vIG9yXG4vLyBjcml0aWNTYXlzKCdkYW5jZSBkYW5jZScpO1xuLy8gb3Jcbi8vIGNyaXRpY1NheXMoKTtcbiJdLCJmaWxlIjoiY3JpdGljLmpzIn0=
