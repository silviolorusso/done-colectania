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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjcml0aWMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gY3JpdGljU2F5cyhtZXNzYWdlLCBhY3Rvcikge1xuICB2YXIgbWVzc2FnZUFycmF5ID0gW1xuICAgIFwiU28gZG9wZSBkdWRlLiBzbyBkb3BlLlwiLFxuICAgIFwiV293Li4uIGEgYm9vayBmaWxsZWQgd2l0aCBzY3JlZW5zaG90cywgdGhhdCBsb29rcyBsaWtlIG1vZGVybiBhcnRcIixcbiAgICBcIldoYXQgaWYgdGhpcyBpbWFnZSB3YXMgcm9hdGVkIDUgZGVncmVlc1wiLFxuICAgIFwi8J+RjCAgR3JlYXQgam9iXCIsXG4gICAgXCJJdCB0b29rIHlvdSBhIHdoaWxlXCIsXG4gICAgXCJIZXJlIGhhdmUgYSBwaWN0dXJlIG9mIFRydW1wXCIsXG4gICAgXCJJIHRoaW5rIGl0IHdvdWxkIGJlIGJldHRlciB0byBjaGFuZ2UgdGhlIGZvbnQgdG8gb3VyIGNvbXBhbnkgZm9udCAnQ29taWMgU2FucydcIlxuICBdXG4gIGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQpIHtcbiAgICAvLyBjaG9vc2UgYSByYW5kb20gZGVmYXVsdCBvbmVcbiAgICB2YXIgbWVzc2FnZSA9IG1lc3NhZ2VBcnJheVtyYW5kb21OdW0obWVzc2FnZUFycmF5Lmxlbmd0aCldXG4gIH1cblxuICB2YXIgYWN0b3JBcnJheSA9IFtcbiAgICBcIlN0ZWZcIixcbiAgICBcIlNpbHZpb1wiLFxuICAgIFwiT2JhbWFcIixcbiAgICBcIkNsaXBweVwiXG4gIF1cbiAgaWYgKGFjdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAvLyBjaG9vc2UgYSByYW5kb20gZGVmYXVsdCBvbmVcbiAgICB2YXIgYWN0b3IgPSBhY3RvckFycmF5W3JhbmRvbU51bShhY3RvckFycmF5Lmxlbmd0aCldXG4gIH1cblxuXG4gIHZhciBtZXNzYWdlSFRNTCA9ICQoJzxkaXYgY2xhc3M9XCJjb21tZW50XCI+PGRpdiBjbGFzcz1cIm1lc3NhZ2VcIj4nICsgYWN0b3IgKyAnOiAnICsgbWVzc2FnZSArICc8L2Rpdj48ZGl2IGNsYXNzPVwiaW1hZ2VcIj48aW1nIHNyYz1cImFzc2V0cy9pbWcvY3JpdGljLycgKyBhY3RvciArICcuanBnXCI+PC9kaXY+PC9kaXY+Jyk7XG4gIG1lc3NhZ2VIVE1MLmNzcygnb3BhY2l0eScsICcwJyk7XG4gIG1lc3NhZ2VIVE1MLmhpZGUoKTtcbiAgJCgnLnN1Z2dlc3Rpb25zJykuYXBwZW5kKG1lc3NhZ2VIVE1MKVxuICBtZXNzYWdlSFRNTC5zaG93KCk7XG5cdG1lc3NhZ2VIVE1MLmNzcygnbGVmdCcsICctMTAwcHgnKTtcblx0bWVzc2FnZUhUTUwuYW5pbWF0ZSh7XG5cdCAgICBvcGFjaXR5OiAxLFxuXHQgICAgbGVmdDogXCIwcHhcIixcblx0ICB9LCA1MDAsIGZ1bmN0aW9uKCkge1xuXHQgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIG1lc3NhZ2VIVE1MLmFuaW1hdGUoe1xuICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgIGxlZnQ6IFwiLTEwMHB4XCIsXG4gICAgICAgICAgfSwgNTAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cbiAgICAgICAgfSk7XG4gICAgICB9LCA2MDAwKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIHJhbmRvbU51bShtYXgpIHtcbiAgbWF4ID0gbWF4LTE7XG4gIHZhciBudW0gPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gMCkgKyAwKTtcbiAgcmV0dXJuIG51bVxuICAvLyBUT0RPOiBOb3QgYWxsb3dpbmcgZHVwbGljYXRlIG1lc3NhZ2VzXG59XG5cblxuLy8gRVhBTVBMRVNcblxuLy8gY3JpdGljU2F5cygnZGFuY2UgZGFuY2UnLCAnY2F0Jyk7XG4vLyBvclxuLy8gY3JpdGljU2F5cygnZGFuY2UgZGFuY2UnKTtcbi8vIG9yXG4vLyBjcml0aWNTYXlzKCk7XG4iXSwiZmlsZSI6ImNyaXRpYy5qcyJ9
