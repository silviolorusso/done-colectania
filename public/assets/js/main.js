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
};

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
    y = setInterval(function() { // launch a random disruption
      disruptions = Object.keys(Disruption)
      Disruption[disruptions[ disruptions.length * Math.random() << 0]]()
    }, 5000)
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
	var y = setInterval(function() {
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
			clearInterval(y);
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
		randCanvas.renderAll();
		// TODO: prevent drop
    console.log('Page ?? is now locked...')
	}
};









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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBHTE9CQUxcblxudmFyIHBhZ2VzID0gJCgnLnBhZ2UnKTtcbnZhciBjcml0aWNQb3B1cCA9ICQoJyNjcml0aWMnKTtcbnZhciBkcm9wRGVsYXkgPSAxMDA7XG52YXIgcGRmUmVhZHkgPSBmYWxzZTtcblxuXG5cblxuXG4vLyAtLS0gR0VORVJBTCBGVU5DVElPTlNcblxuZnVuY3Rpb24gbWFrZUlkKCkge1xuXHR2YXIgcmFuZExldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNikpO1xuXHR2YXIgaWQgPSByYW5kTGV0dGVyICsgRGF0ZS5ub3coKTtcblx0cmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBieXRlQ291bnQocykge1xuICAgIHJldHVybiBlbmNvZGVVUkkocykuc3BsaXQoLyUuLnwuLykubGVuZ3RoIC0gMTtcbn1cblxudmFyIGdldFVybFBhcmFtZXRlciA9IGZ1bmN0aW9uIGdldFVybFBhcmFtZXRlcihzUGFyYW0pIHtcbiAgdmFyIHNQYWdlVVJMID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKSxcbiAgICBzVVJMVmFyaWFibGVzID0gc1BhZ2VVUkwuc3BsaXQoJyYnKSxcbiAgICBzUGFyYW1ldGVyTmFtZSxcbiAgICBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBzVVJMVmFyaWFibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgc1BhcmFtZXRlck5hbWUgPSBzVVJMVmFyaWFibGVzW2ldLnNwbGl0KCc9Jyk7XG5cbiAgICBpZiAoc1BhcmFtZXRlck5hbWVbMF0gPT09IHNQYXJhbSkge1xuICAgICAgICByZXR1cm4gc1BhcmFtZXRlck5hbWVbMV0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBzUGFyYW1ldGVyTmFtZVsxXTtcbiAgICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MsIGNhbGxiYWNrKSB7XG5cdHZhciB0aGVNb3VzZVBvcyA9IG1vdXNlUG9zXG5cdGlmIChlbGVtZW50LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSkge1xuXHRcdGZhYnJpYy5JbWFnZS5mcm9tVVJMKGVsZW1lbnQuZGF0YSwgZnVuY3Rpb24obXlJbWcsIGNhbGxiYWNrKSB7XG4gXHRcdFx0dmFyIGltZyA9IG15SW1nLnNldCh7IGxlZnQ6IDAsIHRvcDogMCwgd2lkdGg6IG15SW1nLndpZHRoLCBoZWlnaHQ6IG15SW1nLmhlaWdodH0pO1xuIFx0XHRcdGlmICggaW1nLndpZHRoID4gY2FudmFzZXNbZWxlbWVudC5wYWdlXS53aWR0aCApIHtcbiBcdFx0XHRcdGltZy5zY2FsZVRvV2lkdGgoY2FudmFzZXNbZWxlbWVudC5wYWdlXS53aWR0aCAvIDEwMCAqIDUwICk7IC8vIDcwJSBvZiB0aGUgY2FudmFzXG4gXHRcdFx0fVxuIFx0XHRcdGltZy5sZWZ0ID0gdGhlTW91c2VQb3MueFxuIFx0XHRcdGltZy50b3AgPSB0aGVNb3VzZVBvcy55XG4gXHRcdFx0aW1nLm9uKCdhZGRlZCcsIGZ1bmN0aW9uKCkge1xuIFx0XHRcdFx0Y2FsbGJhY2s7XG4gXHRcdFx0fSk7XG4gXHRcdFx0Y2FudmFzZXNbZWxlbWVudC5wYWdlXS5hZGQoaW1nKVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBkZUJhc2VkVGV4dCA9IGF0b2IoZWxlbWVudC5kYXRhLnN1YnN0cmluZygyMykpO1xuXHRcdGNhbnZhc2VzW2VsZW1lbnQucGFnZV0uYWRkKG5ldyBmYWJyaWMuVGV4dChkZUJhc2VkVGV4dCwgeyBcbiAgXHRcdGZvbnRGYW1pbHk6ICdBcmlhbCcsIFxuICBcdFx0bGVmdDogbW91c2VQb3MueCwgXG4gIFx0XHR0b3A6IG1vdXNlUG9zLnksXG4gIFx0XHRmb250U2l6ZTogMTUgXG5cdFx0fSkpO1xuXHRcdGNhbGxiYWNrO1xuXHR9XG59XG5cblxuLy8gLS0tIGluaXRpYWxpemUgY2FudmFzZXNcbnZhciBjYW52YXNlcyA9IHt9XG5mdW5jdGlvbiBpbml0Q2FudmFzZXMoKSB7XG5cdCQoJ2NhbnZhcycpLmVhY2goZnVuY3Rpb24oaSkge1xuXHRcdGNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKHRoaXMpO1xuXHQgIGNhbnZhcy5zZXRXaWR0aCggJCh0aGlzKS5jbG9zZXN0KCcucGFnZScpLndpZHRoKCkgKTtcblx0XHRjYW52YXMuc2V0SGVpZ2h0KCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykuaGVpZ2h0KCkgKTtcblx0XHRjYW52YXNlc1sncCcgKyAoaSArIDEpXSA9IGNhbnZhcztcblx0fSk7XG5cdGZhYnJpYy5PYmplY3QucHJvdG90eXBlLm9yaWdpblggPSBmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5vcmlnaW5ZID0gJ2NlbnRlcicgLy8gb3JpZ2luIGF0IHRoZSBjZW50ZXJcblx0dmFyIGluc2VydFRpdGxlID0gbmV3IGZhYnJpYy5UZXh0Ym94KCdJbnNlcnQgVGl0bGUgSGVyZScsIHtcblx0ICB0b3A6IDEyMCxcblx0ICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvLCBzZXJpZicsXG5cdCAgZmlsbDogJyM3NzcnLFxuXHQgIGxpbmVIZWlnaHQ6IDEuMSxcblx0ICBmb250U2l6ZTogMzAsXG5cdCAgZm9udFdlaWdodDogJ2JvbGQnLFxuXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG5cdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG5cdCAgb3JpZ2luWDogJ2xlZnQnLFxuXHQgIG9yaWdpblk6ICd0b3AnXG5cdH0pO1xuXHRjYW52YXNlc1sncDEnXS5hZGQoaW5zZXJ0VGl0bGUpXG5cdHZhciBsaW5lTGVuZ2h0ID0gMjUwXG5cdGNhbnZhc2VzWydwMSddLmFkZChuZXcgZmFicmljLkxpbmUoWzAsIDAsIGxpbmVMZW5naHQsIDBdLCB7XG5cdFx0bGVmdDogKCBjYW52YXNlc1sncDEnXS53aWR0aCAtIGxpbmVMZW5naHQpIC8gMixcblx0ICB0b3A6IDE2MCxcblx0ICBzdHJva2U6ICcjMjIyJyxcblx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcblx0IFx0b3JpZ2luWDogJ2xlZnQnLFxuXHQgIG9yaWdpblk6ICd0b3AnXG5cdH0pKTtcblx0dmFyIGluc2VydEF1dGhvcnMgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBBdXRob3JzIEhlcmUnLCB7XG5cdCAgdG9wOiAxODAsXG5cdCAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybywgc2VyaWYnLFxuXHQgIGZpbGw6ICcjNzc3Jyxcblx0ICBsaW5lSGVpZ2h0OiAxLjEsXG5cdCAgZm9udFNpemU6IDIwLFxuXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG5cdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG5cdCAgb3JpZ2luWDogJ2xlZnQnLFxuXHQgIG9yaWdpblk6ICd0b3AnXG5cdH0pO1xuXHRjYW52YXNlc1sncDEnXS5hZGQoaW5zZXJ0QXV0aG9ycylcblx0Ly8gVE9ETzogb24gY2xpY2ssIHRleHQgaXMgZGVsZXRlZCBcbn1cblxuXG5cblxuXG4vLyAtLS0gTS1WLUNcblxudmFyIFB1YmxpY2F0aW9uID0ge1xuXHQvLyBhbGwgb3VyIHN0YXRlc1xuXHRpZDogbWFrZUlkKCksXG5cdHRpdGxlOiAnVEVTVCBQVUInLFxuXHR0aW1lTGVmdDogOTAwMDAwMCxcblx0ZXhwaXJlZDogZmFsc2UsXG5cdGF1dGhvcnM6IFtdLFxuXHRwYWdlczoge1xuXHRcdHAxOiB7fSxcblx0XHRwMjoge30sXG5cdFx0cDM6IHt9LFxuXHRcdHA0OiB7fSxcblx0XHRwNToge30sXG5cdFx0cDY6IHt9LFxuXHRcdHA3OiB7fSxcblx0XHRwODoge31cblx0fVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihQdWJsaWNhdGlvbiwgaW5wdXQpIHtcblx0aWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkgeyAvLyBub3QgZXhwaXJlZFxuXHRcdHNob3dUaW1lKFB1YmxpY2F0aW9uKTsgLy8gZXhwaXJlZFxuXHR9IGVsc2Uge1xuXHRcdFB1YmxpY2F0aW9uLmV4cGlyZWQgPSB0cnVlO1xuXHRcdHNob3dFeHBpcmVkKFB1YmxpY2F0aW9uKTtcblx0XHRsb2NrRWxlbWVudHMoKVxuXHRcdHNob3dTYXZlTW9kYWwoKTtcblx0fVxuXG5cdGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG5cdFx0Y29uc29sZS5sb2coaW5wdXQpXG5cdFx0c3dpdGNoICh0cnVlKSB7XG5cdFx0XHRjYXNlIGlucHV0LnZpc2libGUgPT0gZmFsc2U6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcblx0XHRcdFx0XHRyZW1vdmVFbGVtZW50KGlucHV0LmlkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0Ynl0ZUNvdW50KGlucHV0LmRhdGEpID4gMTM5ODExNyA6IC8vIGZpbGUgdG9vIGJpZyAoMW1iKVxuXHRcdFx0XHQgXHRFcnJvci50b29CaWcoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IGltYWdlXG5cblx0XHRcdFx0XHR2YXIgcHVibGljYXRpb25VcGRhdGUgPSBmdW5jdGlvbihpbnB1dFBhZ2UpIHsgLy8gdXBkYXRlIGNhbnZhc1xuXHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXRQYWdlXSA9IGNhbnZhc2VzW2lucHV0UGFnZV0udG9KU09OKCkgLy8gc2V0dGltZW91dCBvdGhlcndpc2UgaXQgZG9lc24ndCBnZXQgdGhlIGVsZW1lbnRcblx0XHRcdFx0XHRcdH0sIDEpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zLCBwdWJsaWNhdGlvblVwZGF0ZShpbnB1dC5wYWdlKSk7IC8vIGRyb3AgZWxlbWVudFxuXHRcdFx0XHRcdGFkZHRpbWUoMTAwMCkgLy8gYWRkIGJvbnVzIHRpbWVcblxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJykgJiZcblx0XHRcdFx0aW5wdXQudmlzaWJsZSA9PSB0cnVlOiAvLyBuZXcgdGV4dFxuXG5cdFx0XHRcdFx0dmFyIHB1YmxpY2F0aW9uVXBkYXRlID0gZnVuY3Rpb24oaW5wdXRQYWdlKSB7IC8vIHVwZGF0ZSBjYW52YXNcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFB1YmxpY2F0aW9uLnBhZ2VzW2lucHV0UGFnZV0gPSBjYW52YXNlc1tpbnB1dFBhZ2VdLnRvSlNPTigpIC8vIHNldHRpbWVvdXQgb3RoZXJ3aXNlIGl0IGRvZXNuJ3QgZ2V0IHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0XHR9LCAxKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBpbnB1dC5tb3VzZVBvcywgcHVibGljYXRpb25VcGRhdGUoaW5wdXQucGFnZSkpOyAvLyBkcm9wIGVsZW1lbnRcblx0XHRcdFx0XHRhZGR0aW1lKDEwMDApIC8vIGFkZCBib251cyB0aW1lXG5cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG5cdFx0XHRcdFx0RXJyb3Iubm90QWxsb3dlZCgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQubW92ZSA9PSB0cnVlIDogLy8gbW92aW5nIG9yIHNjYWxpbmcgYW4gaW1hZ2Vcblx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dC5wYWdlXSA9IGNhbnZhc2VzW2lucHV0LnBhZ2VdLnRvSlNPTigpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuaGFzT3duUHJvcGVydHkoJ3RpdGxlJykgOiAvLyBjaGFuZ2luZyB0aXRsZVxuXHRcdFx0XHRcdFB1YmxpY2F0aW9uLnRpdGxlID0gaW5wdXQudGl0bGU7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkge1xuXHRcdC8vIHRvbyBsYXRlXG5cdFx0RXJyb3IudG9vTGF0ZSgpO1xuXHR9XG59XG5cblxuXG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxudmFyIHg7XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0aW5pdENhbnZhc2VzKClcblx0b25Nb2RFbGVtZW50KClcblx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPCAwKSB7XG5cdFx0Ly8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cblx0XHRpZiAoIGdldFVybFBhcmFtZXRlcigndGltZScpICkgeyAvLyBkaWZmaWN1bHR5XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IGdldFVybFBhcmFtZXRlcigndGltZScpO1xuXHRcdH1cblx0XHR4ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC0gMTA7XG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uKTtcblx0XHR9LCAxMClcbiAgICB5ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7IC8vIGxhdW5jaCBhIHJhbmRvbSBkaXNydXB0aW9uXG4gICAgICBkaXNydXB0aW9ucyA9IE9iamVjdC5rZXlzKERpc3J1cHRpb24pXG4gICAgICBEaXNydXB0aW9uW2Rpc3J1cHRpb25zWyBkaXNydXB0aW9ucy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXSgpXG4gICAgfSwgNTAwMClcblx0XHRtb3VzZUNvdW50ZXIoKVxuXHR9IGVsc2UgeyAvLyBzYXZlZCBwdWJsaWNhdGlvblxuXHRcdHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKVxuXHRcdHBkZkRvd25sb2FkKClcblx0XHQkKCdib2R5JykuYWRkQ2xhc3MoJ3NhdmVkJylcblx0fVxufSk7XG5cbmZ1bmN0aW9uIGFkZHRpbWUoYm9udXNUaW1lKSB7XG5cdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgKyBib251c1RpbWU7XG5cdGFuaW1hdGV0aW1lY291bnRlcihib251c1RpbWUpO1xufVxuXG4vLyBtb2RpZnkgZWxlbWVudFxuZnVuY3Rpb24gb25Nb2RFbGVtZW50KCkge1xuXHRmb3IgKHZhciBwYWdlSWQgaW4gY2FudmFzZXMpIHtcblx0XHRjYW52YXNlc1sgcGFnZUlkIF0ub24oJ29iamVjdDptb2RpZmllZCcsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0dmFyIHBhcmVudENhbnZhc0lkID0gZXZ0LnRhcmdldC5jYW52YXMubG93ZXJDYW52YXNFbC5pZFxuXHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyBtb3ZlOiB0cnVlLCBwYWdlOiBwYXJlbnRDYW52YXNJZH0pXG5cdFx0fSlcblx0fVxufVxuXG4vLyBnZXQgbW91c2UgcG9zaXRpb24gb24gY2FudmFzXG5mdW5jdGlvbiBnZXRNb3VzZVBvcyhjYW52YXMsIGUpIHtcbiAgdmFyIHBvaW50ZXIgPSBjYW52YXMuZ2V0UG9pbnRlcihldmVudCwgZSlcbiAgdmFyIHBvc1ggPSBwb2ludGVyLnhcbiAgdmFyIHBvc1kgPSBwb2ludGVyLnlcbiAgcmV0dXJuIHtcbiAgICB4OiBwb3NYLFxuICAgIHk6IHBvc1lcbiAgfVxufVxuXG4vLyBkcm9wIGVsZW1lbnRcbnBhZ2VzLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG5wYWdlcy5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbnBhZ2VzLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdGNvbnNvbGUubG9nKGUpO1xuXHR2YXIgZmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzO1xuXHR2YXIgeSA9IDA7XG5cdGZvciAodmFyIGkgPSBmaWxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0dmFyIHBhZ2VJZCA9ICQodGhpcykuZmluZCgnY2FudmFzJykuYXR0cignaWQnKTtcblx0XHRtb3VzZVBvcyA9IGdldE1vdXNlUG9zKGNhbnZhc2VzW3BhZ2VJZF0sIGUpXG5cdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdFx0XHRcdGRhdGE6IGV2ZW50LnRhcmdldC5yZXN1bHQsXG5cdFx0XHRcdFx0dmlzaWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRwYWdlOiBwYWdlSWQsXG5cdFx0XHRcdFx0bW91c2VQb3M6IG1vdXNlUG9zXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgeSAqIGRyb3BEZWxheSk7XG5cdFx0XHR5ICs9IDE7XG5cdFx0fTtcblx0XHRjb25zb2xlLmxvZyhmaWxlc1tpXSk7XG5cdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZXNbaV0pO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn0pO1xuLy8gcHJldmVudCBkcm9wIG9uIGJvZHlcbiQoJ2JvZHknKS5vbignZHJhZ292ZXInLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFNvdW5kLmVycm9yKCk7XG59KTtcblxuLy8gcmVtb3ZlIGVsZW1lbnQgKFRPRE86IFVQREFURSBGT1IgRkFCUklDKVxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jbG9zZScsIGZ1bmN0aW9uKCkge1xuXHR2YXIgcGFnZUlkID0gJCh0aGlzKVxuXHRcdC5jbG9zZXN0KCcucGFnZScpXG5cdFx0LmF0dHIoJ2lkJyk7XG5cdHZhciBlbGVtZW50SWQgPSAkKHRoaXMpXG5cdFx0LnBhcmVudCgpXG5cdFx0LmF0dHIoJ2lkJyk7XG5cdHZhciBlbGVtZW50RGF0YSA9ICQodGhpcylcblx0XHQuc2libGluZ3MoKVxuXHRcdC5hdHRyKCdzcmMnKTtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdGlkOiBlbGVtZW50SWQsXG5cdFx0ZGF0YTogZWxlbWVudERhdGEsXG5cdFx0cG9zOiBbMCwgMCwgMCwgMCwgMF0sXG5cdFx0dmlzaWJsZTogZmFsc2UsXG5cdFx0cGFnZTogcGFnZUlkXG5cdH0pO1xufSk7XG5cbi8vIGNoYW5naW5nIHRpdGxlXG4kKCcjdGl0bGUnKS5jaGFuZ2UoZnVuY3Rpb24oKSB7XG5cdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHtcblx0XHR0aXRsZTogJCh0aGlzKS52YWwoKVxuXHR9KTtcbn0pXG5cblxuXG5cblxuXG4vLyAtLS0gVklFV1xuXG52YXIgU291bmQgPSB7XG5cdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgYXVkaW8gPSBuZXcgQXVkaW8oJ2Fzc2V0cy9hdWRpby9pbmNvcnJlY3QubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9LFxuXHRkaW5nOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgYXVkaW8gPSBuZXcgQXVkaW8oJ2Fzc2V0cy9hdWRpby9kaW5nLm1wMycpO1xuXHRcdGF1ZGlvLnBsYXkoKTtcblx0fVxufTtcblxuLy8gbWVyZ2UgdGhlc2UgdHdvXG5mdW5jdGlvbiBzaG93VGltZShQdWJsaWNhdGlvbikge1xuXHRzZWNvbmRzID0gUHVibGljYXRpb24udGltZUxlZnQgLyAxMDAwO1xuXHQkKCcjY291bnRlcicpLnNob3coKTtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKS5pbm5lckhUTUwgPVxuXHRcdHNlY29uZHMudG9GaXhlZCgyKSArICcgc2Vjb25kcyBsZWZ0ISc7XG59XG5mdW5jdGlvbiBtb3VzZUNvdW50ZXIoKSB7XG5cdCQoZG9jdW1lbnQpLmJpbmQoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoZS5wYWdlWCA+PSAkKGRvY3VtZW50KS53aWR0aCgpIC8gMikge1xuXHRcdFx0Ly8gaWYgbW91c2Ugb2YgcmlnaHQgc2lkZSBvZiBwYWdlXG5cdFx0XHQkKCcjY291bnRlcicpLmFkZENsYXNzKCdtb3VzZV9yaWdodCcpO1xuXHRcdFx0JCgnI2NvdW50ZXInKS5jc3Moe1xuXHRcdFx0XHRsZWZ0OiBlLnBhZ2VYIC0gMjAgLSAkKCcjY291bnRlcicpLndpZHRoKCksXG5cdFx0XHRcdHRvcDogZS5wYWdlWSArIDUwXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaWYgbW91c2Ugb2YgbGVmdCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykucmVtb3ZlQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggKyAyMCxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIHNob3dFeHBpcmVkKCkge1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLmlubmVySFRNTCA9ICdleHBpcmVkISc7XG5cdCQoJ2JvZHknKS5hZGRDbGFzcygnZXhwaXJlZCcpO1xuXHQvL3NldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0Ly8gIHdpbmRvdy5wcmludCgpO1xuXHQvL30sIDEwMDApO1xuXHRhbmltYXRlVXAoJCgnI3NhdmUtbW9kYWwnKSk7XG5cdGNsZWFySW50ZXJ2YWwoeClcbiAgY2xlYXJJbnRlcnZhbCh5KVxufVxuXG5mdW5jdGlvbiBkcm9wRWxlbWVudChwYWdlSWQsIGRhdGEsIG1vdXNlUG9zLCBjYWxsYmFjaykge1xuXHRjb25zb2xlLmxvZyhtb3VzZVBvcylcblx0dmFyIGVsZW1lbnQgPSB7IGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZCB9O1xuXHR2YXIgZWxlbWVudFBvcyA9IGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MsIGNhbGxiYWNrKTtcblx0U291bmQuZGluZygpO1xufVxuXG5cblxuXG5cblxuXG4vLyBlcnJvcnNcblxudmFyIEVycm9yID0ge1xuXHRub3RBbGxvd2VkOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpXG5cdFx0YWxlcnQoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIG5vdCBhbGxvd2VkIScpXG5cdH0sXG5cdHRvb0JpZzogZnVuY3Rpb24oKSB7XG5cdFx0U291bmQuZXJyb3IoKTtcblx0XHRhbGVydCgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgdG9vIGJpZyEnKTtcblx0fSxcblx0dG9vTGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0U291bmQuZXJyb3IoKTtcblx0XHRhbGVydCgndG9vIGxhdGUgYnJvJyk7XG5cdH1cbn07XG5cbi8vIGxvY2sgZWxlbWVudHNcbmZ1bmN0aW9uIGxvY2tFbGVtZW50cygpIHtcblx0Zm9yICh2YXIgcGFnZUlkIGluIGNhbnZhc2VzKSB7XG5cdFx0Y2FudmFzZXNbcGFnZUlkXS5zZWxlY3Rpb24gPSBmYWxzZTtcblx0XHRmb3IgKG9iamVjdElkIGluIGNhbnZhc2VzW3BhZ2VJZF0uZ2V0T2JqZWN0cygpICkge1xuXHRcdFx0dmFyIG9iamVjdCA9IGNhbnZhc2VzW3BhZ2VJZF0uaXRlbShvYmplY3RJZClcblx0XHRcdG9iamVjdC5zZWxlY3RhYmxlID0gZmFsc2Vcblx0XHRcdG9iamVjdC5ob3ZlckN1cnNvciA9ICdkZWZhdWx0J1xuXHRcdH1cblx0fVxufVxuXG4vLyBUT0RPOiBDT05WRVJUIFRPIEZBQlJJQ1xuZnVuY3Rpb24gcmVtb3ZlRWxlbWVudChpZCkge1xuXHQkKCcjJyArIGlkKS5oaWRlKCk7XG5cdGNvbnNvbGUubG9nKGlkKTtcbn1cblxuLy8gc2hvdyBzYXZlIG1vZGFsXG5cbmZ1bmN0aW9uIHNob3dTYXZlTW9kYWwoKSB7XG5cdCQoJyNzYXZlLW1vZGFsJykuc2hvdygpO1xuXHQkKCcjc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdHNhdmV0b0RiKFB1YmxpY2F0aW9uKTtcblx0XHQvLyBtYWtlUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRnZW5QZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdC8vIGNoZWNrUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdlblBkZihpZCkge1xuXHQkKCcjc2F2ZS1tb2RhbCcpLnNob3coKTtcblx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKCcnKTtcblx0dmFyIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRpZiAocGRmUmVhZHkgPT0gdHJ1ZSkge1xuXHRcdFx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKFxuXHRcdFx0XHQnRG93bmxvYWQgeW91ciBwZGYgPGEgaHJlZj1cImFzc2V0cy9wZGYvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcucGRmP2Rvd25sb2FkPXRydWVcIiB0YXJnZXQ9XCJfYmxhbmtcIj5oZXJlPC9hPiBhbmQgcHJpbnRhYmxlIHBkZiBib29rbGV0IDxhIGhyZWY9XCJhc3NldHMvcGRmLycgK1xuXHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHQnLycgK1xuXHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHQnLWJvb2tsZXQucGRmP2Rvd25sb2FkPXRydWVcIiB0YXJnZXQ9XCJfYmxhbmtcIj5oZXJlPC9hPi4nIC8vIGFkZCBcIm9uIGNsaWNrIGNsb3NlIHNhdmUgbW9kYWxcIlxuXHRcdFx0KTtcblx0XHRcdGNsZWFySW50ZXJ2YWwoeSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vICQoJyNzYXZlLW1vZGFsJykuaHRtbCgnWW91ciBQdWJsaWNhdGlvbiBpcyBiZWluZyBnZW5lcmF0ZWQ8c3BhbiBpZD1cImxvYWRpbmdfZG90c1wiPi4uLjwvc3Bhbj48ZGl2IGlkPVwibG9hZGVyXCI+PGRpdiBpZD1cImxvYWRpbmdiYXJcIj48L2Rpdj48L2Rpdj4nKTtcblx0XHRcdCQoJyNzYXZlLW1vZGFsJykuaHRtbCgnWW91ciBQdWJsaWNhdGlvbiAoPGEgaHJlZj1cImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9wZGY/aWQ9JyArIFB1YmxpY2F0aW9uLmlkICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPmRvd25sb2FkPC9hPikgaXMgYmVpbmcgZ2VuZXJhdGVkPHNwYW4gaWQ9XCJsb2FkaW5nX2RvdHNcIj4uLi48L3NwYW4+PGRpdiBpZD1cInNwaW5uZXJcIj48ZGl2IGlkPVwiYW5pbWF0aW9uXCI+PC9kaXY+PGltZyBzcmM9XCJhc3NldHMvaW1nL3ByaW50ZXIucG5nXCI+PC9kaXY+Jyk7XG5cdFx0fVxuXHR9LCAxMDApO1xufVxuXG4vLyAtLS0gU0FWRURcblxuZnVuY3Rpb24gcmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pIHtcblx0Y2FudmFzZXNbJ3AxJ10uY2xlYXIoKTsgLy8gY2xlYXIgdGl0bGVcblxuXHRmb3IgKHZhciBjYW52YXNJZCBpbiBjYW52YXNlcykge1xuXHRcdHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24ucGFnZXNbY2FudmFzSWRdKTtcblx0XHRjYW52YXNlc1tjYW52YXNJZF0ubG9hZEZyb21KU09OKCBqc29uLCBmdW5jdGlvbigpIHtcblx0XHRcdGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwuYmluZChjYW52YXNlc1tjYW52YXNJZF0pIFxuXHRcdFx0bG9ja0VsZW1lbnRzKClcblx0XHR9KVxuXHR9XG5cbn1cblxuZnVuY3Rpb24gcGRmRG93bmxvYWQoKSB7XG5cdCQoJyNwZGYtZG93bmxvYWQnKS5zaG93KCk7XG5cdCQoJyNwZGYtZG93bmxvYWQnKS5jbGljayhmdW5jdGlvbigpIHtcblx0XHQvLyBtYWtlUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRnZW5QZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdC8vIGNoZWNrUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0fSk7XG59XG5cblxuXG5cblxuXG4vLyAtLS0gQkFDS0VORFxuXG4vLyBzYXZlIHRvIGRiXG5mdW5jdGlvbiBzYXZldG9EYihwdWJsaWNhdGlvbikge1xuXHRmb3IgKHZhciBwYWdlIGluIFB1YmxpY2F0aW9uLnBhZ2VzKSB7XG5cdFx0UHVibGljYXRpb24ucGFnZXNbcGFnZV0gPSBjYW52YXNlc1twYWdlXS50b0pTT04oKSAvLyB1cGRhdGUgYWxsIHBhZ2VzXG5cdH1cblx0JC5hamF4KHtcblx0XHR1cmw6ICcvZGInLFxuXHRcdHR5cGU6ICdwb3N0JywgLy8gcGVyZm9ybWluZyBhIFBPU1QgcmVxdWVzdFxuXHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KFB1YmxpY2F0aW9uKSxcblx0XHRjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuXHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0c3VjY2VzczogZnVuY3Rpb24ocHVibGljYXRpb24pIHtcblx0XHRcdGNvbnNvbGUubG9nKCdwdWJsaWNhdGlvbiBzZW50IHRvIGRhdGFiYXNlLicpO1xuXHRcdH1cblx0fSk7XG5cdGNvbnNvbGUubG9nKCdzYXZlZD9pZD0nICsgUHVibGljYXRpb24uaWQpXG59XG5cblxuXG5cblxuLy8gLS0tIERJU1JVUFRJT05TXG5cbmZ1bmN0aW9uIHJvdGF0ZU9uZShvYmopIHtcbiAgb2JqLm9yaWdpblggPSAnY2VudGVyJ1xuICBvYmoub3JpZ2luWSA9ICdjZW50ZXInXG4gIG9iai5yb3RhdGUoMCkuYW5pbWF0ZSh7IGFuZ2xlOiAzNjAgfSwge1xuICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgIG9uQ2hhbmdlOiBvYmouY2FudmFzLnJlbmRlckFsbC5iaW5kKG9iai5jYW52YXMpLFxuICAgIG9uQ29tcGxldGU6IGZ1bmN0aW9uKCl7IHJvdGF0ZU9uZShvYmopIH0sXG4gICAgZWFzaW5nOiBmdW5jdGlvbih0LCBiLCBjLCBkKSB7IHJldHVybiBjKnQvZCArIGIgfVxuICB9KVxufVxuXG52YXIgRGlzcnVwdGlvbiA9IHtcblx0Y29taWM6IGZ1bmN0aW9uKCkge1xuXHRcdGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcblx0XHRcdHRleHRzID0gY2FudmFzZXNbY2FudmFzSWRdLmdldE9iamVjdHMoJ3RleHQnKVxuXHQgICAgZm9yICh0ZXh0IGluIHRleHRzKSB7XG5cdCAgICAgIHRleHRzW3RleHRdLmZvbnRGYW1pbHkgPSAnXCJDb21pYyBTYW5zIE1TXCInXG5cdCAgICB9XG5cdCAgIFx0dGV4dGJveGVzID0gY2FudmFzZXNbY2FudmFzSWRdLmdldE9iamVjdHMoJ3RleHRib3gnKVxuXHQgICAgZm9yICh0ZXh0Ym94IGluIHRleHRib3hlcykge1xuXHQgICAgICB0ZXh0Ym94ZXNbdGV4dGJveF0uZm9udEZhbWlseSA9ICdcIkNvbWljIFNhbnMgTVNcIidcblx0ICAgIH1cblx0ICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwoKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ1RoZSBjb21taXNzaW9uZXIgYXNrZWQgdG8gc3BpY2UgdGhlIHR5cG9ncmFwaHkgYSBiaXQhJylcblx0fSxcblx0cm90YXRlOiBmdW5jdGlvbigpIHtcblx0XHRmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG5cdFx0XHRpbWdzID0gY2FudmFzZXNbY2FudmFzSWRdLmdldE9iamVjdHMoJ2ltYWdlJylcblx0ICAgIGZvciAoaW1nIGluIGltZ3MpIHtcblx0ICAgICAgcm90YXRlT25lKGltZ3NbaW1nXSlcblx0ICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coJ1lvdXIgZnJpZW5kIHRoaW5rIHRoZSBsYXlvdXQgaXMgYSBiaXQgc3RhdGljLi4uJylcblx0fSxcblx0bG9ja1JhbmRQYWdlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNhbnZhc2VzKVxuICAgIHJhbmRDYW52YXMgPSBjYW52YXNlc1trZXlzWyBrZXlzLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dXG5cdFx0cmFuZENhbnZhcy5iYWNrZ3JvdW5kQ29sb3IgPSAncmVkJ1xuXHRcdHJhbmRDYW52YXMuc2VsZWN0aW9uID0gZmFsc2U7XG5cdFx0Zm9yIChvYmplY3RJZCBpbiByYW5kQ2FudmFzLmdldE9iamVjdHMoKSApIHtcblx0XHRcdHZhciBvYmplY3QgPSByYW5kQ2FudmFzLml0ZW0ob2JqZWN0SWQpXG5cdFx0XHRvYmplY3Quc2VsZWN0YWJsZSA9IGZhbHNlXG5cdFx0XHRvYmplY3QuaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCdcblx0XHR9XG5cdFx0cmFuZENhbnZhcy5hZGQobmV3IGZhYnJpYy5MaW5lKFswLCAwLCByYW5kQ2FudmFzLndpZHRoLCByYW5kQ2FudmFzLmhlaWdodF0sIHtcblx0ICBcdHN0cm9rZTogJyNmZmYnLFxuXHQgIFx0c2VsZWN0YWJsZTogZmFsc2UsXG5cdCAgXHRzdHJva2VXaWR0aDogNFxuXHRcdH0pKVxuICAgIHJhbmRDYW52YXMuYWRkKG5ldyBmYWJyaWMuTGluZShbMCwgcmFuZENhbnZhcy5oZWlnaHQsIHJhbmRDYW52YXMud2lkdGgsIDBdLCB7XG4gICAgICBzdHJva2U6ICcjZmZmJyxcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgc3Ryb2tlV2lkdGg6IDRcbiAgICB9KSlcblx0XHRyYW5kQ2FudmFzLnJlbmRlckFsbCgpO1xuXHRcdC8vIFRPRE86IHByZXZlbnQgZHJvcFxuICAgIGNvbnNvbGUubG9nKCdQYWdlID8/IGlzIG5vdyBsb2NrZWQuLi4nKVxuXHR9XG59O1xuXG5cblxuXG5cblxuXG5cblxuLy8gbW92ZSB0aGVzZSBmdW5jdGlvbnMgdG8gaW50ZXJmYWNlIHBhcnQgb2YganM/IFxuZnVuY3Rpb24gYW5pbWF0ZVVwKG9iaikge1xuXHRvYmouc2hvdygpO1xuXHRvYmouY3NzKCdtYXJnaW4tdG9wJywgJzIwcHgnKTtcblx0b2JqLmFuaW1hdGUoe1xuXHQgICAgb3BhY2l0eTogMSxcblx0ICAgIG1hcmdpblRvcDogXCIwcHhcIixcblx0ICB9LCAzMDAwLCBmdW5jdGlvbigpIHtcblx0ICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cblx0fSk7XG59O1xuXG5mdW5jdGlvbiBhbmltYXRlVXBPdXQob2JqLCB0aW1lKSB7XG5cdG9iai5zaG93KCk7XG5cdG9iai5jc3MoJ21hcmdpbi10b3AnLCAnMjBweCcpO1xuXHRvYmouYW5pbWF0ZSh7XG5cdCAgICBvcGFjaXR5OiAxLFxuXHQgICAgbWFyZ2luVG9wOiBcIjBweFwiLFxuXHQgIH0sIHRpbWUvMiwgZnVuY3Rpb24oKSB7XG5cdCAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG5cdH0pO1xuXHRvYmouYW5pbWF0ZSh7XG5cdCAgICBvcGFjaXR5OiAwLFxuXHQgICAgbWFyZ2luVG9wOiBcIjIwcHhcIixcblx0ICB9LCB0aW1lLzIsIGZ1bmN0aW9uKCkge1xuXHQgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuXHR9KTtcbn07XG4iXSwiZmlsZSI6Im1haW4uanMifQ==
