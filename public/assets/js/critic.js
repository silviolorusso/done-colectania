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
		setTimeout(function() {
			messageHTML.animate({
				opacity: 0,
				left: "-100px",
			}, 500, function() {
				// Animation complete.
				messageHTML.remove()
			});
		}, 6000);
	});
}

function randomNum(max) {
	max = max - 1;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjcml0aWMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gY3JpdGljU2F5cyhtZXNzYWdlLCBhY3Rvcikge1xuXHR2YXIgbWVzc2FnZUFycmF5ID0gW1xuICAgIFwiU28gZG9wZSBkdWRlLiBzbyBkb3BlLlwiLFxuICAgIFwiV293Li4uIGEgYm9vayBmaWxsZWQgd2l0aCBzY3JlZW5zaG90cywgdGhhdCBsb29rcyBsaWtlIG1vZGVybiBhcnRcIixcbiAgICBcIldoYXQgaWYgdGhpcyBpbWFnZSB3YXMgcm9hdGVkIDUgZGVncmVlc1wiLFxuICAgIFwi8J+RjCAgR3JlYXQgam9iXCIsXG4gICAgXCJJdCB0b29rIHlvdSBhIHdoaWxlXCIsXG4gICAgXCJIZXJlIGhhdmUgYSBwaWN0dXJlIG9mIFRydW1wXCIsXG4gICAgXCJJIHRoaW5rIGl0IHdvdWxkIGJlIGJldHRlciB0byBjaGFuZ2UgdGhlIGZvbnQgdG8gb3VyIGNvbXBhbnkgZm9udCAnQ29taWMgU2FucydcIlxuICBdXG5cdGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQpIHtcblx0XHQvLyBjaG9vc2UgYSByYW5kb20gZGVmYXVsdCBvbmVcblx0XHR2YXIgbWVzc2FnZSA9IG1lc3NhZ2VBcnJheVtyYW5kb21OdW0obWVzc2FnZUFycmF5Lmxlbmd0aCldXG5cdH1cblxuXHR2YXIgYWN0b3JBcnJheSA9IFtcbiAgICBcIlN0ZWZcIixcbiAgICBcIlNpbHZpb1wiLFxuICAgIFwiT2JhbWFcIixcbiAgICBcIkNsaXBweVwiLFxuICAgIFwiR3V0ZW5iZXJnXCJcbiAgXVxuXHRpZiAoYWN0b3IgPT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIGNob29zZSBhIHJhbmRvbSBkZWZhdWx0IG9uZVxuXHRcdHZhciBhY3RvciA9IGFjdG9yQXJyYXlbcmFuZG9tTnVtKGFjdG9yQXJyYXkubGVuZ3RoKV1cblx0fVxuXG5cblx0dmFyIG1lc3NhZ2VIVE1MID0gJCgnPGRpdiBjbGFzcz1cImNvbW1lbnRcIj48ZGl2IGNsYXNzPVwibWVzc2FnZVwiPicgKyBhY3RvciArICc6ICcgKyBtZXNzYWdlICsgJzwvZGl2PjxkaXYgY2xhc3M9XCJpbWFnZVwiPjxpbWcgc3JjPVwiYXNzZXRzL2ltZy9jcml0aWMvJyArIGFjdG9yICsgJy5qcGdcIj48L2Rpdj48L2Rpdj4nKTtcblx0bWVzc2FnZUhUTUwuY3NzKCdvcGFjaXR5JywgJzAnKTtcblx0bWVzc2FnZUhUTUwuaGlkZSgpO1xuXHQkKCcuc3VnZ2VzdGlvbnMnKS5hcHBlbmQobWVzc2FnZUhUTUwpXG5cdG1lc3NhZ2VIVE1MLnNob3coKTtcblx0bWVzc2FnZUhUTUwuY3NzKCdsZWZ0JywgJy0xMDBweCcpO1xuXHRtZXNzYWdlSFRNTC5hbmltYXRlKHtcblx0XHRvcGFjaXR5OiAxLFxuXHRcdGxlZnQ6IFwiMHB4XCIsXG5cdH0sIDUwMCwgZnVuY3Rpb24oKSB7XG5cdFx0Ly8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRtZXNzYWdlSFRNTC5hbmltYXRlKHtcblx0XHRcdFx0b3BhY2l0eTogMCxcblx0XHRcdFx0bGVmdDogXCItMTAwcHhcIixcblx0XHRcdH0sIDUwMCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cblx0XHRcdFx0bWVzc2FnZUhUTUwucmVtb3ZlKClcblx0XHRcdH0pO1xuXHRcdH0sIDYwMDApO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gcmFuZG9tTnVtKG1heCkge1xuXHRtYXggPSBtYXggLSAxO1xuXHR2YXIgbnVtID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKG1heCAtIDApICsgMCk7XG5cdHJldHVybiBudW1cblx0Ly8gVE9ETzogTm90IGFsbG93aW5nIGR1cGxpY2F0ZSBtZXNzYWdlc1xufVxuXG5cbi8vIEVYQU1QTEVTXG5cbi8vIGNyaXRpY1NheXMoJ2RhbmNlIGRhbmNlJywgJ2NhdCcpO1xuLy8gb3Jcbi8vIGNyaXRpY1NheXMoJ2RhbmNlIGRhbmNlJyk7XG4vLyBvclxuLy8gY3JpdGljU2F5cygpOyJdLCJmaWxlIjoiY3JpdGljLmpzIn0=
