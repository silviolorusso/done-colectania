// --- OPTIONS

disruptions = true



// --- GLOBAL

var pages = $('.page');
var criticPopup = $('#critic');
var dropDelay = 100;
var pdfReady = false;





// --- GENERAL FUNCTIONS

function makeId() {
	var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
	var id = randLetter + Date.now();
	return id;
}

function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}






function createElement(element, mousePos, callback) {
	var theMousePos = mousePos
	if (element.data.includes('data:image')) {
		fabric.Image.fromURL(element.data, function(myImg, callback) {
 			var img = myImg.set({ left: 0, top: 0, width: myImg.width, height: myImg.height});
 			if ( img.width > canvases[element.page].width ) {
 				img.scaleToWidth(canvases[element.page].width / 100 * 50 ); // 70% of the canvas
 			}
 			img.left = theMousePos.x
 			img.top = theMousePos.y
 			img.on('added', function() {
 				callback;
 			});
 			canvases[element.page].add(img)
		});
	} else {
		var deBasedText = atob(element.data.substring(23));
		canvases[element.page].add(new fabric.Text(deBasedText, { 
  		fontFamily: 'Arial', 
  		left: mousePos.x, 
  		top: mousePos.y,
  		fontSize: 15 
		}));
		callback;
	}
}


// --- initialize canvases
var canvases = {}
function initCanvases() {
	$('canvas').each(function(i) {
		canvas = new fabric.Canvas(this);
	  canvas.setWidth( $(this).closest('.page').width() );
		canvas.setHeight( $(this).closest('.page').height() );
		canvases['p' + (i + 1)] = canvas;
	});
	fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center' // origin at the center
	var insertTitle = new fabric.Textbox('Insert Title Here', {
	  top: 120,
	  fontFamily: 'AGaramondPro, serif',
	  fill: '#777',
	  lineHeight: 1.1,
	  fontSize: 30,
	  fontWeight: 'bold',
	  textAlign: 'center',
	  width: canvases['p1'].width,
	  selectable: false,
	  hoverCursor: 'default',
	  originX: 'left',
	  originY: 'top'
	});
	canvases['p1'].add(insertTitle)
	var lineLenght = 250
	canvases['p1'].add(new fabric.Line([0, 0, lineLenght, 0], {
		left: ( canvases['p1'].width - lineLenght) / 2,
	  top: 160,
	  stroke: '#222',
	  selectable: false,
	 	originX: 'left',
	  originY: 'top'
	}));
	var insertAuthors = new fabric.Textbox('Insert Authors Here', {
	  top: 180,
	  fontFamily: 'AGaramondPro, serif',
	  fill: '#777',
	  lineHeight: 1.1,
	  fontSize: 20,
	  textAlign: 'center',
	  width: canvases['p1'].width,
	  selectable: false,
	  hoverCursor: 'default',
	  originX: 'left',
	  originY: 'top'
	});
	canvases['p1'].add(insertAuthors)
	// TODO: on click, text is deleted 
}





// --- M-V-C

var Publication = {
	// all our states
	id: makeId(),
	title: 'TEST PUB',
	timeLeft: 9000000,
	expired: false,
	authors: [],
	pages: {
		p1: {},
		p2: {},
		p3: {},
		p4: {},
		p5: {},
		p6: {},
		p7: {},
		p8: {}
	}
};

function controller(Publication, input) {
	if (Publication.timeLeft > 0) { // not expired
		showTime(Publication); // expired
	} else {
		Publication.expired = true;
		showExpired(Publication);
		lockElements()
		showSaveModal();
	}

	if (input && Publication.expired == false) {
		console.log(input)
		switch (true) {
			case input.visible == false: // deleting an element
					removeElement(input.id)
					break
			case input.data &&
				byteCount(input.data) > 1398117 : // file too big (1mb)
				 	Error.tooBig()
					break
			case input.data &&
				input.data.includes('data:image') &&
				input.visible == true: // new image

					var publicationUpdate = function(inputPage) { // update canvas
						setTimeout(function() {
							Publication.pages[inputPage] = canvases[inputPage].toJSON() // settimeout otherwise it doesn't get the element
						}, 1)
					}
					dropElement(input.page, input.data, input.mousePos, publicationUpdate(input.page)); // drop element
					addtime(1000) // add bonus time

					break
			case input.data &&
				input.data.includes('data:text/plain') &&
				input.visible == true: // new text

					var publicationUpdate = function(inputPage) { // update canvas
						setTimeout(function() {
							Publication.pages[inputPage] = canvases[inputPage].toJSON() // settimeout otherwise it doesn't get the element
						}, 1)
					}
					dropElement(input.page, input.data, input.mousePos, publicationUpdate(input.page)); // drop element
					addtime(1000) // add bonus time

					break
			case input.data &&
				!input.data.includes('data:image') &&
				!input.data.includes('data:text/plain'): // neither an image nor text
					Error.notAllowed()
					break
			case input.move == true : // moving or scaling an image
					Publication.pages[input.page] = canvases[input.page].toJSON()
					break
			case input.hasOwnProperty('title') : // changing title
					Publication.title = input.title;
		}
	} else if (input && Publication.expired == true) {
		// too late
		Error.tooLate();
	}
}





// --- CONTROLLER

var x;
$(document).ready(function() {
	initCanvases()
	onModElement()
	if (window.location.href.indexOf('saved') < 0) {
		// if not a saved publication
		if ( getUrlParameter('time') ) { // difficulty
			Publication.timeLeft = getUrlParameter('time');
		}
		x = setInterval(function() {
			Publication.timeLeft = Publication.timeLeft - 10;
			controller(Publication);
		}, 10)
    if (disruptions == true) {
      y = setInterval(function() { // launch a random disruption
        disruptions = Object.keys(Disruption)
        Disruption[disruptions[ disruptions.length * Math.random() << 0]]()
      }, 5000)
    }
		mouseCounter()
	} else { // saved publication
		renderPublication(Publication)
		pdfDownload()
		$('body').addClass('saved')
	}
});

function addtime(bonusTime) {
	Publication.timeLeft = Publication.timeLeft + bonusTime;
	animatetimecounter(bonusTime);
}

// modify element
function onModElement() {
	for (var pageId in canvases) {
		canvases[ pageId ].on('object:modified', function(evt) {
			var parentCanvasId = evt.target.canvas.lowerCanvasEl.id
			controller(Publication, { move: true, page: parentCanvasId})
		})
	}
}

// get mouse position on canvas
function getMousePos(canvas, e) {
  var pointer = canvas.getPointer(event, e)
  var posX = pointer.x
  var posY = pointer.y
  return {
    x: posX,
    y: posY
  }
}

// drop element
pages.on('dragover', function(e) {
	e.preventDefault();
});
pages.on('dragleave', function(e) {
	e.preventDefault();
});
pages.on('drop', function(e) {
	e.preventDefault();
	console.log(e);
	var files = e.originalEvent.dataTransfer.files;
	var y = 0;
	for (var i = files.length - 1; i >= 0; i--) {
		reader = new FileReader();
		var pageId = $(this).find('canvas').attr('id');
		mousePos = getMousePos(canvases[pageId], e)
		reader.onload = function(event) {
			console.log(event.target);
			setTimeout(function() {
				controller(Publication, {
					data: event.target.result,
					visible: true,
					page: pageId,
					mousePos: mousePos
				});
			}, y * dropDelay);
			y += 1;
		};
		console.log(files[i]);
		reader.readAsDataURL(files[i]);
	}
	return false;
});
// prevent drop on body
$('body').on('dragover', function(e) {
	e.preventDefault();
});
$('body').on('dragleave', function(e) {
	e.preventDefault();
});
$('body').on('drop', function(e) {
	e.preventDefault();
	Sound.error();
});

// remove element (TODO: UPDATE FOR FABRIC)
$(document).on('click', '.close', function() {
	var pageId = $(this)
		.closest('.page')
		.attr('id');
	var elementId = $(this)
		.parent()
		.attr('id');
	var elementData = $(this)
		.siblings()
		.attr('src');
	controller(Publication, {
		id: elementId,
		data: elementData,
		pos: [0, 0, 0, 0, 0],
		visible: false,
		page: pageId
	});
});

// changing title
$('#title').change(function() {
	controller(Publication, {
		title: $(this).val()
	});
})






// --- VIEW

var Sound = {
	error: function() {
		var audio = new Audio('assets/audio/incorrect.mp3');
		audio.play();
	},
	ding: function() {
		var audio = new Audio('assets/audio/ding.mp3');
		audio.play();
	}
};

// merge these two
function showTime(Publication) {
	seconds = Publication.timeLeft / 1000;
	$('#counter').show();
	document.getElementById('counter').innerHTML =
		seconds.toFixed(2) + ' seconds left!';
}
function mouseCounter() {
	$(document).bind('mousemove', function(e) {
		if (e.pageX >= $(document).width() / 2) {
			// if mouse of right side of page
			$('#counter').addClass('mouse_right');
			$('#counter').css({
				left: e.pageX - 20 - $('#counter').width(),
				top: e.pageY + 50
			});
		} else {
			// if mouse of left side of page
			$('#counter').removeClass('mouse_right');
			$('#counter').css({
				left: e.pageX + 20,
				top: e.pageY + 50
			});
		}
	});
}

function showExpired() {
	document.getElementById('counter').innerHTML = 'expired!';
	$('body').addClass('expired');
	//setTimeout(function(){
	//  window.print();
	//}, 1000);
	animateUp($('#save-modal'));
	clearInterval(x)
  clearInterval(y)
}

function dropElement(pageId, data, mousePos, callback) {
	console.log(mousePos)
	var element = { data: data, page: pageId };
	var elementPos = createElement(element, mousePos, callback);
	Sound.ding();
}







// errors

var Error = {
	notAllowed: function() {
		Sound.error()
		alert('The file you dropped is not allowed!')
	},
	tooBig: function() {
		Sound.error();
		alert('The file you dropped is too big!');
	},
	tooLate: function() {
		Sound.error();
		alert('too late bro');
	}
};

// lock elements
function lockElements() {
	for (var pageId in canvases) {
		canvases[pageId].selection = false;
		for (objectId in canvases[pageId].getObjects() ) {
			var object = canvases[pageId].item(objectId)
			object.selectable = false
			object.hoverCursor = 'default'
		}
	}
}

// TODO: CONVERT TO FABRIC
function removeElement(id) {
	$('#' + id).hide();
	console.log(id);
}

// show save modal

function showSaveModal() {
	$('#save-modal').show();
	$('#save').click(function() {
		savetoDb(Publication);
		// makePdf(Publication.id);
		genPdf(Publication.id);
		// checkPdf(Publication.id);
	});
}

function genPdf(id) {
	$('#save-modal').show();
	$('#save-modal').html('');
	var z = setInterval(function() {
		if (pdfReady == true) {
			$('#save-modal').html(
				'Download your pdf <a href="assets/pdf/' +
					id +
					'/' +
					id +
					'.pdf?download=true" target="_blank">here</a> and printable pdf booklet <a href="assets/pdf/' +
					id +
					'/' +
					id +
					'-booklet.pdf?download=true" target="_blank">here</a>.' // add "on click close save modal"
			);
			clearInterval(z);
		} else {
			// $('#save-modal').html('Your Publication is being generated<span id="loading_dots">...</span><div id="loader"><div id="loadingbar"></div></div>');
			$('#save-modal').html('Your Publication (<a href="http://localhost:3000/pdf?id=' + Publication.id + '" target="_blank">download</a>) is being generated<span id="loading_dots">...</span><div id="spinner"><div id="animation"></div><img src="assets/img/printer.png"></div>');
		}
	}, 100);
}

// --- SAVED

function renderPublication(Publication) {
	canvases['p1'].clear(); // clear title

	for (var canvasId in canvases) {
		var json = JSON.stringify(Publication.pages[canvasId]);
		canvases[canvasId].loadFromJSON( json, function() {
			canvases[canvasId].renderAll.bind(canvases[canvasId]) 
			lockElements()
		})
	}

}

function pdfDownload() {
	$('#pdf-download').show();
	$('#pdf-download').click(function() {
		// makePdf(Publication.id);
		genPdf(Publication.id);
		// checkPdf(Publication.id);
	});
}






// --- BACKEND

// save to db
function savetoDb(publication) {
	for (var page in Publication.pages) {
		Publication.pages[page] = canvases[page].toJSON() // update all pages
	}
	$.ajax({
		url: '/db',
		type: 'post', // performing a POST request
		data: JSON.stringify(Publication),
		contentType: 'application/json',
		dataType: 'json',
		success: function(publication) {
			console.log('publication sent to database.');
		}
	});
	console.log('saved?id=' + Publication.id)
}





// --- INTERFACE FX


// move these functions to interface part of js? 
function animateUp(obj) {
  obj.show();
  obj.css('margin-top', '20px');
  obj.animate({
      opacity: 1,
      marginTop: "0px",
    }, 3000, function() {
      // Animation complete.
  });
};

function animateUpOut(obj, time) {
  obj.show();
  obj.css('margin-top', '20px');
  obj.animate({
      opacity: 1,
      marginTop: "0px",
    }, time/2, function() {
      // Animation complete.
  });
  obj.animate({
      opacity: 0,
      marginTop: "20px",
    }, time/2, function() {
      // Animation complete.
  });
};

function shake(obj, time) {
  if (!time) (
    time = 500
  )
  obj.addClass( 'shake shake-constant' )
  setTimeout(function(){
    obj.removeClass( 'shake shake-constant' )
  }, time);
}






// --- DISRUPTIONS

function rotateOne(obj) {
  obj.originX = 'center'
  obj.originY = 'center'
  obj.rotate(0).animate({ angle: 360 }, {
    duration: 3000,
    onChange: obj.canvas.renderAll.bind(obj.canvas),
    onComplete: function(){ rotateOne(obj) },
    easing: function(t, b, c, d) { return c*t/d + b }
  })
}

var Disruption = {
	comic: function() {
		for (canvasId in canvases) {
			texts = canvases[canvasId].getObjects('text')
	    for (text in texts) {
	      texts[text].fontFamily = '"Comic Sans MS"'
	    }
	   	textboxes = canvases[canvasId].getObjects('textbox')
	    for (textbox in textboxes) {
	      textboxes[textbox].fontFamily = '"Comic Sans MS"'
	    }
      shake($('.page'))
	    canvases[canvasId].renderAll();
    }
    console.log('The commissioner asked to spice the typography a bit!')
	},
	rotate: function() {
		for (canvasId in canvases) {
			imgs = canvases[canvasId].getObjects('image')
	    for (img in imgs) {
	      rotateOne(imgs[img])
	    }
    }
    shake($('.page'))
    console.log('Your friend think the layout is a bit static...')
	},
	lockRandPage: function() {
    var keys = Object.keys(canvases)
    randCanvas = canvases[keys[ keys.length * Math.random() << 0]]
		randCanvas.backgroundColor = 'red'
		randCanvas.selection = false;
		for (objectId in randCanvas.getObjects() ) {
			var object = randCanvas.item(objectId)
			object.selectable = false
			object.hoverCursor = 'default'
		}
		randCanvas.add(new fabric.Line([0, 0, randCanvas.width, randCanvas.height], {
	  	stroke: '#fff',
	  	selectable: false,
	  	strokeWidth: 4
		}))
    randCanvas.add(new fabric.Line([0, randCanvas.height, randCanvas.width, 0], {
      stroke: '#fff',
      selectable: false,
      strokeWidth: 4
    }))
    shake($('.page'))
		randCanvas.renderAll();
		// TODO: prevent drop
    console.log('Page ?? is now locked...') // TODO
	},
  shufflePages: function() {
    var toShuffle = []
    var i = 0
    for (canvasId in canvases) {
      if (i > 0) { // prevent shuffling first page
        toShuffle.push( canvases[canvasId].toJSON() )
      }
      i += 1
    }
    shuffleArray(toShuffle)
    var y = 0 
    for (canvasId in canvases) {
      if (y > 0) {
        canvases[canvasId].loadFromJSON(toShuffle[y - 1], function() {
          canvases[canvasId].renderAll.bind(canvases[canvasId])
        })
      }
      y += 1
    }
    shake($('.page'))
    console.log('According to Margreet, the rythm of this publication is a bit weak')
  }
};








//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBPUFRJT05TXG5cbmRpc3J1cHRpb25zID0gdHJ1ZVxuXG5cblxuLy8gLS0tIEdMT0JBTFxuXG52YXIgcGFnZXMgPSAkKCcucGFnZScpO1xudmFyIGNyaXRpY1BvcHVwID0gJCgnI2NyaXRpYycpO1xudmFyIGRyb3BEZWxheSA9IDEwMDtcbnZhciBwZGZSZWFkeSA9IGZhbHNlO1xuXG5cblxuXG5cbi8vIC0tLSBHRU5FUkFMIEZVTkNUSU9OU1xuXG5mdW5jdGlvbiBtYWtlSWQoKSB7XG5cdHZhciByYW5kTGV0dGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI2KSk7XG5cdHZhciBpZCA9IHJhbmRMZXR0ZXIgKyBEYXRlLm5vdygpO1xuXHRyZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIGJ5dGVDb3VudChzKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSShzKS5zcGxpdCgvJS4ufC4vKS5sZW5ndGggLSAxO1xufVxuXG52YXIgZ2V0VXJsUGFyYW1ldGVyID0gZnVuY3Rpb24gZ2V0VXJsUGFyYW1ldGVyKHNQYXJhbSkge1xuICB2YXIgc1BhZ2VVUkwgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpLFxuICAgIHNVUkxWYXJpYWJsZXMgPSBzUGFnZVVSTC5zcGxpdCgnJicpLFxuICAgIHNQYXJhbWV0ZXJOYW1lLFxuICAgIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IHNVUkxWYXJpYWJsZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzUGFyYW1ldGVyTmFtZSA9IHNVUkxWYXJpYWJsZXNbaV0uc3BsaXQoJz0nKTtcblxuICAgIGlmIChzUGFyYW1ldGVyTmFtZVswXSA9PT0gc1BhcmFtKSB7XG4gICAgICAgIHJldHVybiBzUGFyYW1ldGVyTmFtZVsxXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHNQYXJhbWV0ZXJOYW1lWzFdO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaHVmZmxlQXJyYXkoYXJyYXkpIHtcbiAgZm9yICh2YXIgaSA9IGFycmF5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICB2YXIgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgIHZhciB0ZW1wID0gYXJyYXlbaV07XG4gICAgYXJyYXlbaV0gPSBhcnJheVtqXTtcbiAgICBhcnJheVtqXSA9IHRlbXA7XG4gIH1cbn1cblxuXG5cblxuXG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MsIGNhbGxiYWNrKSB7XG5cdHZhciB0aGVNb3VzZVBvcyA9IG1vdXNlUG9zXG5cdGlmIChlbGVtZW50LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSkge1xuXHRcdGZhYnJpYy5JbWFnZS5mcm9tVVJMKGVsZW1lbnQuZGF0YSwgZnVuY3Rpb24obXlJbWcsIGNhbGxiYWNrKSB7XG4gXHRcdFx0dmFyIGltZyA9IG15SW1nLnNldCh7IGxlZnQ6IDAsIHRvcDogMCwgd2lkdGg6IG15SW1nLndpZHRoLCBoZWlnaHQ6IG15SW1nLmhlaWdodH0pO1xuIFx0XHRcdGlmICggaW1nLndpZHRoID4gY2FudmFzZXNbZWxlbWVudC5wYWdlXS53aWR0aCApIHtcbiBcdFx0XHRcdGltZy5zY2FsZVRvV2lkdGgoY2FudmFzZXNbZWxlbWVudC5wYWdlXS53aWR0aCAvIDEwMCAqIDUwICk7IC8vIDcwJSBvZiB0aGUgY2FudmFzXG4gXHRcdFx0fVxuIFx0XHRcdGltZy5sZWZ0ID0gdGhlTW91c2VQb3MueFxuIFx0XHRcdGltZy50b3AgPSB0aGVNb3VzZVBvcy55XG4gXHRcdFx0aW1nLm9uKCdhZGRlZCcsIGZ1bmN0aW9uKCkge1xuIFx0XHRcdFx0Y2FsbGJhY2s7XG4gXHRcdFx0fSk7XG4gXHRcdFx0Y2FudmFzZXNbZWxlbWVudC5wYWdlXS5hZGQoaW1nKVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBkZUJhc2VkVGV4dCA9IGF0b2IoZWxlbWVudC5kYXRhLnN1YnN0cmluZygyMykpO1xuXHRcdGNhbnZhc2VzW2VsZW1lbnQucGFnZV0uYWRkKG5ldyBmYWJyaWMuVGV4dChkZUJhc2VkVGV4dCwgeyBcbiAgXHRcdGZvbnRGYW1pbHk6ICdBcmlhbCcsIFxuICBcdFx0bGVmdDogbW91c2VQb3MueCwgXG4gIFx0XHR0b3A6IG1vdXNlUG9zLnksXG4gIFx0XHRmb250U2l6ZTogMTUgXG5cdFx0fSkpO1xuXHRcdGNhbGxiYWNrO1xuXHR9XG59XG5cblxuLy8gLS0tIGluaXRpYWxpemUgY2FudmFzZXNcbnZhciBjYW52YXNlcyA9IHt9XG5mdW5jdGlvbiBpbml0Q2FudmFzZXMoKSB7XG5cdCQoJ2NhbnZhcycpLmVhY2goZnVuY3Rpb24oaSkge1xuXHRcdGNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKHRoaXMpO1xuXHQgIGNhbnZhcy5zZXRXaWR0aCggJCh0aGlzKS5jbG9zZXN0KCcucGFnZScpLndpZHRoKCkgKTtcblx0XHRjYW52YXMuc2V0SGVpZ2h0KCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykuaGVpZ2h0KCkgKTtcblx0XHRjYW52YXNlc1sncCcgKyAoaSArIDEpXSA9IGNhbnZhcztcblx0fSk7XG5cdGZhYnJpYy5PYmplY3QucHJvdG90eXBlLm9yaWdpblggPSBmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5vcmlnaW5ZID0gJ2NlbnRlcicgLy8gb3JpZ2luIGF0IHRoZSBjZW50ZXJcblx0dmFyIGluc2VydFRpdGxlID0gbmV3IGZhYnJpYy5UZXh0Ym94KCdJbnNlcnQgVGl0bGUgSGVyZScsIHtcblx0ICB0b3A6IDEyMCxcblx0ICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvLCBzZXJpZicsXG5cdCAgZmlsbDogJyM3NzcnLFxuXHQgIGxpbmVIZWlnaHQ6IDEuMSxcblx0ICBmb250U2l6ZTogMzAsXG5cdCAgZm9udFdlaWdodDogJ2JvbGQnLFxuXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG5cdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG5cdCAgb3JpZ2luWDogJ2xlZnQnLFxuXHQgIG9yaWdpblk6ICd0b3AnXG5cdH0pO1xuXHRjYW52YXNlc1sncDEnXS5hZGQoaW5zZXJ0VGl0bGUpXG5cdHZhciBsaW5lTGVuZ2h0ID0gMjUwXG5cdGNhbnZhc2VzWydwMSddLmFkZChuZXcgZmFicmljLkxpbmUoWzAsIDAsIGxpbmVMZW5naHQsIDBdLCB7XG5cdFx0bGVmdDogKCBjYW52YXNlc1sncDEnXS53aWR0aCAtIGxpbmVMZW5naHQpIC8gMixcblx0ICB0b3A6IDE2MCxcblx0ICBzdHJva2U6ICcjMjIyJyxcblx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcblx0IFx0b3JpZ2luWDogJ2xlZnQnLFxuXHQgIG9yaWdpblk6ICd0b3AnXG5cdH0pKTtcblx0dmFyIGluc2VydEF1dGhvcnMgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBBdXRob3JzIEhlcmUnLCB7XG5cdCAgdG9wOiAxODAsXG5cdCAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybywgc2VyaWYnLFxuXHQgIGZpbGw6ICcjNzc3Jyxcblx0ICBsaW5lSGVpZ2h0OiAxLjEsXG5cdCAgZm9udFNpemU6IDIwLFxuXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG5cdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG5cdCAgb3JpZ2luWDogJ2xlZnQnLFxuXHQgIG9yaWdpblk6ICd0b3AnXG5cdH0pO1xuXHRjYW52YXNlc1sncDEnXS5hZGQoaW5zZXJ0QXV0aG9ycylcblx0Ly8gVE9ETzogb24gY2xpY2ssIHRleHQgaXMgZGVsZXRlZCBcbn1cblxuXG5cblxuXG4vLyAtLS0gTS1WLUNcblxudmFyIFB1YmxpY2F0aW9uID0ge1xuXHQvLyBhbGwgb3VyIHN0YXRlc1xuXHRpZDogbWFrZUlkKCksXG5cdHRpdGxlOiAnVEVTVCBQVUInLFxuXHR0aW1lTGVmdDogOTAwMDAwMCxcblx0ZXhwaXJlZDogZmFsc2UsXG5cdGF1dGhvcnM6IFtdLFxuXHRwYWdlczoge1xuXHRcdHAxOiB7fSxcblx0XHRwMjoge30sXG5cdFx0cDM6IHt9LFxuXHRcdHA0OiB7fSxcblx0XHRwNToge30sXG5cdFx0cDY6IHt9LFxuXHRcdHA3OiB7fSxcblx0XHRwODoge31cblx0fVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihQdWJsaWNhdGlvbiwgaW5wdXQpIHtcblx0aWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkgeyAvLyBub3QgZXhwaXJlZFxuXHRcdHNob3dUaW1lKFB1YmxpY2F0aW9uKTsgLy8gZXhwaXJlZFxuXHR9IGVsc2Uge1xuXHRcdFB1YmxpY2F0aW9uLmV4cGlyZWQgPSB0cnVlO1xuXHRcdHNob3dFeHBpcmVkKFB1YmxpY2F0aW9uKTtcblx0XHRsb2NrRWxlbWVudHMoKVxuXHRcdHNob3dTYXZlTW9kYWwoKTtcblx0fVxuXG5cdGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG5cdFx0Y29uc29sZS5sb2coaW5wdXQpXG5cdFx0c3dpdGNoICh0cnVlKSB7XG5cdFx0XHRjYXNlIGlucHV0LnZpc2libGUgPT0gZmFsc2U6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcblx0XHRcdFx0XHRyZW1vdmVFbGVtZW50KGlucHV0LmlkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0Ynl0ZUNvdW50KGlucHV0LmRhdGEpID4gMTM5ODExNyA6IC8vIGZpbGUgdG9vIGJpZyAoMW1iKVxuXHRcdFx0XHQgXHRFcnJvci50b29CaWcoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IGltYWdlXG5cblx0XHRcdFx0XHR2YXIgcHVibGljYXRpb25VcGRhdGUgPSBmdW5jdGlvbihpbnB1dFBhZ2UpIHsgLy8gdXBkYXRlIGNhbnZhc1xuXHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXRQYWdlXSA9IGNhbnZhc2VzW2lucHV0UGFnZV0udG9KU09OKCkgLy8gc2V0dGltZW91dCBvdGhlcndpc2UgaXQgZG9lc24ndCBnZXQgdGhlIGVsZW1lbnRcblx0XHRcdFx0XHRcdH0sIDEpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zLCBwdWJsaWNhdGlvblVwZGF0ZShpbnB1dC5wYWdlKSk7IC8vIGRyb3AgZWxlbWVudFxuXHRcdFx0XHRcdGFkZHRpbWUoMTAwMCkgLy8gYWRkIGJvbnVzIHRpbWVcblxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJykgJiZcblx0XHRcdFx0aW5wdXQudmlzaWJsZSA9PSB0cnVlOiAvLyBuZXcgdGV4dFxuXG5cdFx0XHRcdFx0dmFyIHB1YmxpY2F0aW9uVXBkYXRlID0gZnVuY3Rpb24oaW5wdXRQYWdlKSB7IC8vIHVwZGF0ZSBjYW52YXNcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFB1YmxpY2F0aW9uLnBhZ2VzW2lucHV0UGFnZV0gPSBjYW52YXNlc1tpbnB1dFBhZ2VdLnRvSlNPTigpIC8vIHNldHRpbWVvdXQgb3RoZXJ3aXNlIGl0IGRvZXNuJ3QgZ2V0IHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0XHR9LCAxKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBpbnB1dC5tb3VzZVBvcywgcHVibGljYXRpb25VcGRhdGUoaW5wdXQucGFnZSkpOyAvLyBkcm9wIGVsZW1lbnRcblx0XHRcdFx0XHRhZGR0aW1lKDEwMDApIC8vIGFkZCBib251cyB0aW1lXG5cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG5cdFx0XHRcdFx0RXJyb3Iubm90QWxsb3dlZCgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQubW92ZSA9PSB0cnVlIDogLy8gbW92aW5nIG9yIHNjYWxpbmcgYW4gaW1hZ2Vcblx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dC5wYWdlXSA9IGNhbnZhc2VzW2lucHV0LnBhZ2VdLnRvSlNPTigpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuaGFzT3duUHJvcGVydHkoJ3RpdGxlJykgOiAvLyBjaGFuZ2luZyB0aXRsZVxuXHRcdFx0XHRcdFB1YmxpY2F0aW9uLnRpdGxlID0gaW5wdXQudGl0bGU7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkge1xuXHRcdC8vIHRvbyBsYXRlXG5cdFx0RXJyb3IudG9vTGF0ZSgpO1xuXHR9XG59XG5cblxuXG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxudmFyIHg7XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0aW5pdENhbnZhc2VzKClcblx0b25Nb2RFbGVtZW50KClcblx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPCAwKSB7XG5cdFx0Ly8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cblx0XHRpZiAoIGdldFVybFBhcmFtZXRlcigndGltZScpICkgeyAvLyBkaWZmaWN1bHR5XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IGdldFVybFBhcmFtZXRlcigndGltZScpO1xuXHRcdH1cblx0XHR4ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC0gMTA7XG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uKTtcblx0XHR9LCAxMClcbiAgICBpZiAoZGlzcnVwdGlvbnMgPT0gdHJ1ZSkge1xuICAgICAgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkgeyAvLyBsYXVuY2ggYSByYW5kb20gZGlzcnVwdGlvblxuICAgICAgICBkaXNydXB0aW9ucyA9IE9iamVjdC5rZXlzKERpc3J1cHRpb24pXG4gICAgICAgIERpc3J1cHRpb25bZGlzcnVwdGlvbnNbIGRpc3J1cHRpb25zLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dKClcbiAgICAgIH0sIDUwMDApXG4gICAgfVxuXHRcdG1vdXNlQ291bnRlcigpXG5cdH0gZWxzZSB7IC8vIHNhdmVkIHB1YmxpY2F0aW9uXG5cdFx0cmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pXG5cdFx0cGRmRG93bmxvYWQoKVxuXHRcdCQoJ2JvZHknKS5hZGRDbGFzcygnc2F2ZWQnKVxuXHR9XG59KTtcblxuZnVuY3Rpb24gYWRkdGltZShib251c1RpbWUpIHtcblx0UHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCArIGJvbnVzVGltZTtcblx0YW5pbWF0ZXRpbWVjb3VudGVyKGJvbnVzVGltZSk7XG59XG5cbi8vIG1vZGlmeSBlbGVtZW50XG5mdW5jdGlvbiBvbk1vZEVsZW1lbnQoKSB7XG5cdGZvciAodmFyIHBhZ2VJZCBpbiBjYW52YXNlcykge1xuXHRcdGNhbnZhc2VzWyBwYWdlSWQgXS5vbignb2JqZWN0Om1vZGlmaWVkJywgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgcGFyZW50Q2FudmFzSWQgPSBldnQudGFyZ2V0LmNhbnZhcy5sb3dlckNhbnZhc0VsLmlkXG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IG1vdmU6IHRydWUsIHBhZ2U6IHBhcmVudENhbnZhc0lkfSlcblx0XHR9KVxuXHR9XG59XG5cbi8vIGdldCBtb3VzZSBwb3NpdGlvbiBvbiBjYW52YXNcbmZ1bmN0aW9uIGdldE1vdXNlUG9zKGNhbnZhcywgZSkge1xuICB2YXIgcG9pbnRlciA9IGNhbnZhcy5nZXRQb2ludGVyKGV2ZW50LCBlKVxuICB2YXIgcG9zWCA9IHBvaW50ZXIueFxuICB2YXIgcG9zWSA9IHBvaW50ZXIueVxuICByZXR1cm4ge1xuICAgIHg6IHBvc1gsXG4gICAgeTogcG9zWVxuICB9XG59XG5cbi8vIGRyb3AgZWxlbWVudFxucGFnZXMub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbnBhZ2VzLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xucGFnZXMub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0Y29uc29sZS5sb2coZSk7XG5cdHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdHZhciB5ID0gMDtcblx0Zm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0cmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHR2YXIgcGFnZUlkID0gJCh0aGlzKS5maW5kKCdjYW52YXMnKS5hdHRyKCdpZCcpO1xuXHRcdG1vdXNlUG9zID0gZ2V0TW91c2VQb3MoY2FudmFzZXNbcGFnZUlkXSwgZSlcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0XHRcdFx0ZGF0YTogZXZlbnQudGFyZ2V0LnJlc3VsdCxcblx0XHRcdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHBhZ2U6IHBhZ2VJZCxcblx0XHRcdFx0XHRtb3VzZVBvczogbW91c2VQb3Ncblx0XHRcdFx0fSk7XG5cdFx0XHR9LCB5ICogZHJvcERlbGF5KTtcblx0XHRcdHkgKz0gMTtcblx0XHR9O1xuXHRcdGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcblx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0U291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudCAoVE9ETzogVVBEQVRFIEZPUiBGQUJSSUMpXG4kKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNsb3NlJywgZnVuY3Rpb24oKSB7XG5cdHZhciBwYWdlSWQgPSAkKHRoaXMpXG5cdFx0LmNsb3Nlc3QoJy5wYWdlJylcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnRJZCA9ICQodGhpcylcblx0XHQucGFyZW50KClcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnREYXRhID0gJCh0aGlzKVxuXHRcdC5zaWJsaW5ncygpXG5cdFx0LmF0dHIoJ3NyYycpO1xuXHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0aWQ6IGVsZW1lbnRJZCxcblx0XHRkYXRhOiBlbGVtZW50RGF0YSxcblx0XHRwb3M6IFswLCAwLCAwLCAwLCAwXSxcblx0XHR2aXNpYmxlOiBmYWxzZSxcblx0XHRwYWdlOiBwYWdlSWRcblx0fSk7XG59KTtcblxuLy8gY2hhbmdpbmcgdGl0bGVcbiQoJyN0aXRsZScpLmNoYW5nZShmdW5jdGlvbigpIHtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdHRpdGxlOiAkKHRoaXMpLnZhbCgpXG5cdH0pO1xufSlcblxuXG5cblxuXG5cbi8vIC0tLSBWSUVXXG5cbnZhciBTb3VuZCA9IHtcblx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2luY29ycmVjdC5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH0sXG5cdGRpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9XG59O1xuXG4vLyBtZXJnZSB0aGVzZSB0d29cbmZ1bmN0aW9uIHNob3dUaW1lKFB1YmxpY2F0aW9uKSB7XG5cdHNlY29uZHMgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDEwMDA7XG5cdCQoJyNjb3VudGVyJykuc2hvdygpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLmlubmVySFRNTCA9XG5cdFx0c2Vjb25kcy50b0ZpeGVkKDIpICsgJyBzZWNvbmRzIGxlZnQhJztcbn1cbmZ1bmN0aW9uIG1vdXNlQ291bnRlcigpIHtcblx0JChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXHRcdGlmIChlLnBhZ2VYID49ICQoZG9jdW1lbnQpLndpZHRoKCkgLyAyKSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCArIDIwLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID0gJ2V4cGlyZWQhJztcblx0JCgnYm9keScpLmFkZENsYXNzKCdleHBpcmVkJyk7XG5cdC8vc2V0VGltZW91dChmdW5jdGlvbigpe1xuXHQvLyAgd2luZG93LnByaW50KCk7XG5cdC8vfSwgMTAwMCk7XG5cdGFuaW1hdGVVcCgkKCcjc2F2ZS1tb2RhbCcpKTtcblx0Y2xlYXJJbnRlcnZhbCh4KVxuICBjbGVhckludGVydmFsKHkpXG59XG5cbmZ1bmN0aW9uIGRyb3BFbGVtZW50KHBhZ2VJZCwgZGF0YSwgbW91c2VQb3MsIGNhbGxiYWNrKSB7XG5cdGNvbnNvbGUubG9nKG1vdXNlUG9zKVxuXHR2YXIgZWxlbWVudCA9IHsgZGF0YTogZGF0YSwgcGFnZTogcGFnZUlkIH07XG5cdHZhciBlbGVtZW50UG9zID0gY3JlYXRlRWxlbWVudChlbGVtZW50LCBtb3VzZVBvcywgY2FsbGJhY2spO1xuXHRTb3VuZC5kaW5nKCk7XG59XG5cblxuXG5cblxuXG5cbi8vIGVycm9yc1xuXG52YXIgRXJyb3IgPSB7XG5cdG5vdEFsbG93ZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKClcblx0XHRhbGVydCgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgbm90IGFsbG93ZWQhJylcblx0fSxcblx0dG9vQmlnOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpO1xuXHRcdGFsZXJ0KCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyB0b28gYmlnIScpO1xuXHR9LFxuXHR0b29MYXRlOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpO1xuXHRcdGFsZXJ0KCd0b28gbGF0ZSBicm8nKTtcblx0fVxufTtcblxuLy8gbG9jayBlbGVtZW50c1xuZnVuY3Rpb24gbG9ja0VsZW1lbnRzKCkge1xuXHRmb3IgKHZhciBwYWdlSWQgaW4gY2FudmFzZXMpIHtcblx0XHRjYW52YXNlc1twYWdlSWRdLnNlbGVjdGlvbiA9IGZhbHNlO1xuXHRcdGZvciAob2JqZWN0SWQgaW4gY2FudmFzZXNbcGFnZUlkXS5nZXRPYmplY3RzKCkgKSB7XG5cdFx0XHR2YXIgb2JqZWN0ID0gY2FudmFzZXNbcGFnZUlkXS5pdGVtKG9iamVjdElkKVxuXHRcdFx0b2JqZWN0LnNlbGVjdGFibGUgPSBmYWxzZVxuXHRcdFx0b2JqZWN0LmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnXG5cdFx0fVxuXHR9XG59XG5cbi8vIFRPRE86IENPTlZFUlQgVE8gRkFCUklDXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50KGlkKSB7XG5cdCQoJyMnICsgaWQpLmhpZGUoKTtcblx0Y29uc29sZS5sb2coaWQpO1xufVxuXG4vLyBzaG93IHNhdmUgbW9kYWxcblxuZnVuY3Rpb24gc2hvd1NhdmVNb2RhbCgpIHtcblx0JCgnI3NhdmUtbW9kYWwnKS5zaG93KCk7XG5cdCQoJyNzYXZlJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0c2F2ZXRvRGIoUHVibGljYXRpb24pO1xuXHRcdC8vIG1ha2VQZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdGdlblBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Ly8gY2hlY2tQZGYoUHVibGljYXRpb24uaWQpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gZ2VuUGRmKGlkKSB7XG5cdCQoJyNzYXZlLW1vZGFsJykuc2hvdygpO1xuXHQkKCcjc2F2ZS1tb2RhbCcpLmh0bWwoJycpO1xuXHR2YXIgeiA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdGlmIChwZGZSZWFkeSA9PSB0cnVlKSB7XG5cdFx0XHQkKCcjc2F2ZS1tb2RhbCcpLmh0bWwoXG5cdFx0XHRcdCdEb3dubG9hZCB5b3VyIHBkZiA8YSBocmVmPVwiYXNzZXRzL3BkZi8nICtcblx0XHRcdFx0XHRpZCArXG5cdFx0XHRcdFx0Jy8nICtcblx0XHRcdFx0XHRpZCArXG5cdFx0XHRcdFx0Jy5wZGY/ZG93bmxvYWQ9dHJ1ZVwiIHRhcmdldD1cIl9ibGFua1wiPmhlcmU8L2E+IGFuZCBwcmludGFibGUgcGRmIGJvb2tsZXQgPGEgaHJlZj1cImFzc2V0cy9wZGYvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCctYm9va2xldC5wZGY/ZG93bmxvYWQ9dHJ1ZVwiIHRhcmdldD1cIl9ibGFua1wiPmhlcmU8L2E+LicgLy8gYWRkIFwib24gY2xpY2sgY2xvc2Ugc2F2ZSBtb2RhbFwiXG5cdFx0XHQpO1xuXHRcdFx0Y2xlYXJJbnRlcnZhbCh6KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gJCgnI3NhdmUtbW9kYWwnKS5odG1sKCdZb3VyIFB1YmxpY2F0aW9uIGlzIGJlaW5nIGdlbmVyYXRlZDxzcGFuIGlkPVwibG9hZGluZ19kb3RzXCI+Li4uPC9zcGFuPjxkaXYgaWQ9XCJsb2FkZXJcIj48ZGl2IGlkPVwibG9hZGluZ2JhclwiPjwvZGl2PjwvZGl2PicpO1xuXHRcdFx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKCdZb3VyIFB1YmxpY2F0aW9uICg8YSBocmVmPVwiaHR0cDovL2xvY2FsaG9zdDozMDAwL3BkZj9pZD0nICsgUHVibGljYXRpb24uaWQgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+ZG93bmxvYWQ8L2E+KSBpcyBiZWluZyBnZW5lcmF0ZWQ8c3BhbiBpZD1cImxvYWRpbmdfZG90c1wiPi4uLjwvc3Bhbj48ZGl2IGlkPVwic3Bpbm5lclwiPjxkaXYgaWQ9XCJhbmltYXRpb25cIj48L2Rpdj48aW1nIHNyYz1cImFzc2V0cy9pbWcvcHJpbnRlci5wbmdcIj48L2Rpdj4nKTtcblx0XHR9XG5cdH0sIDEwMCk7XG59XG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbikge1xuXHRjYW52YXNlc1sncDEnXS5jbGVhcigpOyAvLyBjbGVhciB0aXRsZVxuXG5cdGZvciAodmFyIGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG5cdFx0dmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeShQdWJsaWNhdGlvbi5wYWdlc1tjYW52YXNJZF0pO1xuXHRcdGNhbnZhc2VzW2NhbnZhc0lkXS5sb2FkRnJvbUpTT04oIGpzb24sIGZ1bmN0aW9uKCkge1xuXHRcdFx0Y2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbC5iaW5kKGNhbnZhc2VzW2NhbnZhc0lkXSkgXG5cdFx0XHRsb2NrRWxlbWVudHMoKVxuXHRcdH0pXG5cdH1cblxufVxuXG5mdW5jdGlvbiBwZGZEb3dubG9hZCgpIHtcblx0JCgnI3BkZi1kb3dubG9hZCcpLnNob3coKTtcblx0JCgnI3BkZi1kb3dubG9hZCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdC8vIG1ha2VQZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdGdlblBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Ly8gY2hlY2tQZGYoUHVibGljYXRpb24uaWQpO1xuXHR9KTtcbn1cblxuXG5cblxuXG5cbi8vIC0tLSBCQUNLRU5EXG5cbi8vIHNhdmUgdG8gZGJcbmZ1bmN0aW9uIHNhdmV0b0RiKHB1YmxpY2F0aW9uKSB7XG5cdGZvciAodmFyIHBhZ2UgaW4gUHVibGljYXRpb24ucGFnZXMpIHtcblx0XHRQdWJsaWNhdGlvbi5wYWdlc1twYWdlXSA9IGNhbnZhc2VzW3BhZ2VdLnRvSlNPTigpIC8vIHVwZGF0ZSBhbGwgcGFnZXNcblx0fVxuXHQkLmFqYXgoe1xuXHRcdHVybDogJy9kYicsXG5cdFx0dHlwZTogJ3Bvc3QnLCAvLyBwZXJmb3JtaW5nIGEgUE9TVCByZXF1ZXN0XG5cdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24pLFxuXHRcdGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG5cdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRzdWNjZXNzOiBmdW5jdGlvbihwdWJsaWNhdGlvbikge1xuXHRcdFx0Y29uc29sZS5sb2coJ3B1YmxpY2F0aW9uIHNlbnQgdG8gZGF0YWJhc2UuJyk7XG5cdFx0fVxuXHR9KTtcblx0Y29uc29sZS5sb2coJ3NhdmVkP2lkPScgKyBQdWJsaWNhdGlvbi5pZClcbn1cblxuXG5cblxuXG4vLyAtLS0gSU5URVJGQUNFIEZYXG5cblxuLy8gbW92ZSB0aGVzZSBmdW5jdGlvbnMgdG8gaW50ZXJmYWNlIHBhcnQgb2YganM/IFxuZnVuY3Rpb24gYW5pbWF0ZVVwKG9iaikge1xuICBvYmouc2hvdygpO1xuICBvYmouY3NzKCdtYXJnaW4tdG9wJywgJzIwcHgnKTtcbiAgb2JqLmFuaW1hdGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIG1hcmdpblRvcDogXCIwcHhcIixcbiAgICB9LCAzMDAwLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cbiAgfSk7XG59O1xuXG5mdW5jdGlvbiBhbmltYXRlVXBPdXQob2JqLCB0aW1lKSB7XG4gIG9iai5zaG93KCk7XG4gIG9iai5jc3MoJ21hcmdpbi10b3AnLCAnMjBweCcpO1xuICBvYmouYW5pbWF0ZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgbWFyZ2luVG9wOiBcIjBweFwiLFxuICAgIH0sIHRpbWUvMiwgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG4gIH0pO1xuICBvYmouYW5pbWF0ZSh7XG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgbWFyZ2luVG9wOiBcIjIwcHhcIixcbiAgICB9LCB0aW1lLzIsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICB9KTtcbn07XG5cbmZ1bmN0aW9uIHNoYWtlKG9iaiwgdGltZSkge1xuICBpZiAoIXRpbWUpIChcbiAgICB0aW1lID0gNTAwXG4gIClcbiAgb2JqLmFkZENsYXNzKCAnc2hha2Ugc2hha2UtY29uc3RhbnQnIClcbiAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgIG9iai5yZW1vdmVDbGFzcyggJ3NoYWtlIHNoYWtlLWNvbnN0YW50JyApXG4gIH0sIHRpbWUpO1xufVxuXG5cblxuXG5cblxuLy8gLS0tIERJU1JVUFRJT05TXG5cbmZ1bmN0aW9uIHJvdGF0ZU9uZShvYmopIHtcbiAgb2JqLm9yaWdpblggPSAnY2VudGVyJ1xuICBvYmoub3JpZ2luWSA9ICdjZW50ZXInXG4gIG9iai5yb3RhdGUoMCkuYW5pbWF0ZSh7IGFuZ2xlOiAzNjAgfSwge1xuICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgIG9uQ2hhbmdlOiBvYmouY2FudmFzLnJlbmRlckFsbC5iaW5kKG9iai5jYW52YXMpLFxuICAgIG9uQ29tcGxldGU6IGZ1bmN0aW9uKCl7IHJvdGF0ZU9uZShvYmopIH0sXG4gICAgZWFzaW5nOiBmdW5jdGlvbih0LCBiLCBjLCBkKSB7IHJldHVybiBjKnQvZCArIGIgfVxuICB9KVxufVxuXG52YXIgRGlzcnVwdGlvbiA9IHtcblx0Y29taWM6IGZ1bmN0aW9uKCkge1xuXHRcdGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcblx0XHRcdHRleHRzID0gY2FudmFzZXNbY2FudmFzSWRdLmdldE9iamVjdHMoJ3RleHQnKVxuXHQgICAgZm9yICh0ZXh0IGluIHRleHRzKSB7XG5cdCAgICAgIHRleHRzW3RleHRdLmZvbnRGYW1pbHkgPSAnXCJDb21pYyBTYW5zIE1TXCInXG5cdCAgICB9XG5cdCAgIFx0dGV4dGJveGVzID0gY2FudmFzZXNbY2FudmFzSWRdLmdldE9iamVjdHMoJ3RleHRib3gnKVxuXHQgICAgZm9yICh0ZXh0Ym94IGluIHRleHRib3hlcykge1xuXHQgICAgICB0ZXh0Ym94ZXNbdGV4dGJveF0uZm9udEZhbWlseSA9ICdcIkNvbWljIFNhbnMgTVNcIidcblx0ICAgIH1cbiAgICAgIHNoYWtlKCQoJy5wYWdlJykpXG5cdCAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsKCk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdUaGUgY29tbWlzc2lvbmVyIGFza2VkIHRvIHNwaWNlIHRoZSB0eXBvZ3JhcGh5IGEgYml0IScpXG5cdH0sXG5cdHJvdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0Zm9yIChjYW52YXNJZCBpbiBjYW52YXNlcykge1xuXHRcdFx0aW1ncyA9IGNhbnZhc2VzW2NhbnZhc0lkXS5nZXRPYmplY3RzKCdpbWFnZScpXG5cdCAgICBmb3IgKGltZyBpbiBpbWdzKSB7XG5cdCAgICAgIHJvdGF0ZU9uZShpbWdzW2ltZ10pXG5cdCAgICB9XG4gICAgfVxuICAgIHNoYWtlKCQoJy5wYWdlJykpXG4gICAgY29uc29sZS5sb2coJ1lvdXIgZnJpZW5kIHRoaW5rIHRoZSBsYXlvdXQgaXMgYSBiaXQgc3RhdGljLi4uJylcblx0fSxcblx0bG9ja1JhbmRQYWdlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNhbnZhc2VzKVxuICAgIHJhbmRDYW52YXMgPSBjYW52YXNlc1trZXlzWyBrZXlzLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dXG5cdFx0cmFuZENhbnZhcy5iYWNrZ3JvdW5kQ29sb3IgPSAncmVkJ1xuXHRcdHJhbmRDYW52YXMuc2VsZWN0aW9uID0gZmFsc2U7XG5cdFx0Zm9yIChvYmplY3RJZCBpbiByYW5kQ2FudmFzLmdldE9iamVjdHMoKSApIHtcblx0XHRcdHZhciBvYmplY3QgPSByYW5kQ2FudmFzLml0ZW0ob2JqZWN0SWQpXG5cdFx0XHRvYmplY3Quc2VsZWN0YWJsZSA9IGZhbHNlXG5cdFx0XHRvYmplY3QuaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCdcblx0XHR9XG5cdFx0cmFuZENhbnZhcy5hZGQobmV3IGZhYnJpYy5MaW5lKFswLCAwLCByYW5kQ2FudmFzLndpZHRoLCByYW5kQ2FudmFzLmhlaWdodF0sIHtcblx0ICBcdHN0cm9rZTogJyNmZmYnLFxuXHQgIFx0c2VsZWN0YWJsZTogZmFsc2UsXG5cdCAgXHRzdHJva2VXaWR0aDogNFxuXHRcdH0pKVxuICAgIHJhbmRDYW52YXMuYWRkKG5ldyBmYWJyaWMuTGluZShbMCwgcmFuZENhbnZhcy5oZWlnaHQsIHJhbmRDYW52YXMud2lkdGgsIDBdLCB7XG4gICAgICBzdHJva2U6ICcjZmZmJyxcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgc3Ryb2tlV2lkdGg6IDRcbiAgICB9KSlcbiAgICBzaGFrZSgkKCcucGFnZScpKVxuXHRcdHJhbmRDYW52YXMucmVuZGVyQWxsKCk7XG5cdFx0Ly8gVE9ETzogcHJldmVudCBkcm9wXG4gICAgY29uc29sZS5sb2coJ1BhZ2UgPz8gaXMgbm93IGxvY2tlZC4uLicpIC8vIFRPRE9cblx0fSxcbiAgc2h1ZmZsZVBhZ2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdG9TaHVmZmxlID0gW11cbiAgICB2YXIgaSA9IDBcbiAgICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoaSA+IDApIHsgLy8gcHJldmVudCBzaHVmZmxpbmcgZmlyc3QgcGFnZVxuICAgICAgICB0b1NodWZmbGUucHVzaCggY2FudmFzZXNbY2FudmFzSWRdLnRvSlNPTigpIClcbiAgICAgIH1cbiAgICAgIGkgKz0gMVxuICAgIH1cbiAgICBzaHVmZmxlQXJyYXkodG9TaHVmZmxlKVxuICAgIHZhciB5ID0gMCBcbiAgICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoeSA+IDApIHtcbiAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLmxvYWRGcm9tSlNPTih0b1NodWZmbGVbeSAtIDFdLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsLmJpbmQoY2FudmFzZXNbY2FudmFzSWRdKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgeSArPSAxXG4gICAgfVxuICAgIHNoYWtlKCQoJy5wYWdlJykpXG4gICAgY29uc29sZS5sb2coJ0FjY29yZGluZyB0byBNYXJncmVldCwgdGhlIHJ5dGhtIG9mIHRoaXMgcHVibGljYXRpb24gaXMgYSBiaXQgd2VhaycpXG4gIH1cbn07XG5cblxuXG5cblxuXG5cbiJdLCJmaWxlIjoibWFpbi5qcyJ9
