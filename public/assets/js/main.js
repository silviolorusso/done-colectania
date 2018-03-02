// --- OPTIONS

var disruptionsOn = true
var dropDelay = 100






// --- GLOBAL

const pages = $('.page')





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
 				img.scaleToWidth(canvases[element.page].width / 100 * 50 ); // 50% of the canvas
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
		canvases[element.page].add(new fabric.Textbox(deBasedText, {
  		fontFamily: 'Arial',
  		left: mousePos.x,
  		top: mousePos.y,
  		fontSize: 15,
      width: canvases[element.page].width / 100 * 90,
      breakWords: true
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
		// showSaveModal();
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
					criticSays();


					// criticSays('dance dance', 'cat');
					// or
					// criticSays('dance dance');
					// or
					// criticSays();


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
    if (disruptionsOn == true) {
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

// modify element listener
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

	expiredTime();
	setTimeout(function () {
		$('.wrapper').addClass('saved_view');
		savedState();
	}, 500);
	// anchorkey
	//setTimeout(function(){
	//  window.print();
	//}, 1000);
	// animateUp($('#save-modal'));
	// clearInterval(x);
	// animateUp($('#save-modal'));
	clearInterval(x)
  clearInterval(y)
}

function dropElement(pageId, data, mousePos, callback) {
	console.log(mousePos)
	var element = { data: data, page: pageId };
	var elementPos = createElement(element, mousePos, callback);
	Sound.ding();
	// achievement(200, 'Your mom bought 12 copies');
}







// errors

var Error = {
	notAllowed: function() {
		Sound.error()
		alertMessage('The file you dropped is not allowed!')
	},
	tooBig: function() {
		Sound.error();
		alertMessage('The file you dropped is too big!');
	},
	tooLate: function() {
		Sound.error();
		alertMessage('too late bro');
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
    criticSays('The commissioner asked to spice the typography a bit!', 'Gutenberg')
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
    criticSays('Page ?? is now locked...', 'Gutenberg') // TODO
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
    criticSays('The rythm of this publication is a bit weak. Don\'t you think?', 'Gutenberg')
  },
	ads: function () {

		var keys = Object.keys(canvases)
    randCanvas = canvases[keys[ keys.length * Math.random() << 0]]
		randCanvas.add(new fabric.Rect({
			width: randCanvas.width,
			height: 30,
			fill: '#0D213E',
			lockMovementX: true,
			lockMovementY: true,
			lockRotation: true,
			hasControls: false,
			left: randCanvas.width/2,
			top: 15
		}));
		fabric.Image.fromURL('/assets/img/kinko.png', function(img){
				img.hasBorders = false;
				img.hasControls = false;
				img.scale(0.2);
				img.left = randCanvas.width-100;
				img.top = 50;
				img.lockMovementX = true;
				img.lockMovementY = true;
				img.lockRotation = true;
				img.setControlsVisibility = false;
				randCanvas.insertAt(img,3);
				// TODO: it only works with one image for some reason. running the function multiple times it adds more top bars but just moves all the images to the same place
		});
	}
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBPUFRJT05TXG5cbnZhciBkaXNydXB0aW9uc09uID0gdHJ1ZVxudmFyIGRyb3BEZWxheSA9IDEwMFxuXG5cblxuXG5cblxuLy8gLS0tIEdMT0JBTFxuXG5jb25zdCBwYWdlcyA9ICQoJy5wYWdlJylcblxuXG5cblxuXG4vLyAtLS0gR0VORVJBTCBGVU5DVElPTlNcblxuZnVuY3Rpb24gbWFrZUlkKCkge1xuXHR2YXIgcmFuZExldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNikpO1xuXHR2YXIgaWQgPSByYW5kTGV0dGVyICsgRGF0ZS5ub3coKTtcblx0cmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBieXRlQ291bnQocykge1xuICAgIHJldHVybiBlbmNvZGVVUkkocykuc3BsaXQoLyUuLnwuLykubGVuZ3RoIC0gMTtcbn1cblxudmFyIGdldFVybFBhcmFtZXRlciA9IGZ1bmN0aW9uIGdldFVybFBhcmFtZXRlcihzUGFyYW0pIHtcbiAgdmFyIHNQYWdlVVJMID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKSxcbiAgICBzVVJMVmFyaWFibGVzID0gc1BhZ2VVUkwuc3BsaXQoJyYnKSxcbiAgICBzUGFyYW1ldGVyTmFtZSxcbiAgICBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBzVVJMVmFyaWFibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgc1BhcmFtZXRlck5hbWUgPSBzVVJMVmFyaWFibGVzW2ldLnNwbGl0KCc9Jyk7XG5cbiAgICBpZiAoc1BhcmFtZXRlck5hbWVbMF0gPT09IHNQYXJhbSkge1xuICAgICAgICByZXR1cm4gc1BhcmFtZXRlck5hbWVbMV0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBzUGFyYW1ldGVyTmFtZVsxXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycmF5KSB7XG4gIGZvciAodmFyIGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgdmFyIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcbiAgICB2YXIgdGVtcCA9IGFycmF5W2ldO1xuICAgIGFycmF5W2ldID0gYXJyYXlbal07XG4gICAgYXJyYXlbal0gPSB0ZW1wO1xuICB9XG59XG5cblxuXG5cblxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KGVsZW1lbnQsIG1vdXNlUG9zLCBjYWxsYmFjaykge1xuXHR2YXIgdGhlTW91c2VQb3MgPSBtb3VzZVBvc1xuXHRpZiAoZWxlbWVudC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykpIHtcblx0XHRmYWJyaWMuSW1hZ2UuZnJvbVVSTChlbGVtZW50LmRhdGEsIGZ1bmN0aW9uKG15SW1nLCBjYWxsYmFjaykge1xuIFx0XHRcdHZhciBpbWcgPSBteUltZy5zZXQoeyBsZWZ0OiAwLCB0b3A6IDAsIHdpZHRoOiBteUltZy53aWR0aCwgaGVpZ2h0OiBteUltZy5oZWlnaHR9KTtcbiBcdFx0XHRpZiAoIGltZy53aWR0aCA+IGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggKSB7XG4gXHRcdFx0XHRpbWcuc2NhbGVUb1dpZHRoKGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggLyAxMDAgKiA1MCApOyAvLyA1MCUgb2YgdGhlIGNhbnZhc1xuIFx0XHRcdH1cbiBcdFx0XHRpbWcubGVmdCA9IHRoZU1vdXNlUG9zLnhcbiBcdFx0XHRpbWcudG9wID0gdGhlTW91c2VQb3MueVxuIFx0XHRcdGltZy5vbignYWRkZWQnLCBmdW5jdGlvbigpIHtcbiBcdFx0XHRcdGNhbGxiYWNrO1xuIFx0XHRcdH0pO1xuIFx0XHRcdGNhbnZhc2VzW2VsZW1lbnQucGFnZV0uYWRkKGltZylcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR2YXIgZGVCYXNlZFRleHQgPSBhdG9iKGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpKTtcblx0XHRjYW52YXNlc1tlbGVtZW50LnBhZ2VdLmFkZChuZXcgZmFicmljLlRleHRib3goZGVCYXNlZFRleHQsIHtcbiAgXHRcdGZvbnRGYW1pbHk6ICdBcmlhbCcsXG4gIFx0XHRsZWZ0OiBtb3VzZVBvcy54LFxuICBcdFx0dG9wOiBtb3VzZVBvcy55LFxuICBcdFx0Zm9udFNpemU6IDE1LFxuICAgICAgd2lkdGg6IGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggLyAxMDAgKiA5MCxcbiAgICAgIGJyZWFrV29yZHM6IHRydWVcblx0XHR9KSk7XG5cdFx0Y2FsbGJhY2s7XG5cdH1cbn1cblxuXG4vLyAtLS0gaW5pdGlhbGl6ZSBjYW52YXNlc1xudmFyIGNhbnZhc2VzID0ge31cbmZ1bmN0aW9uIGluaXRDYW52YXNlcygpIHtcblx0JCgnY2FudmFzJykuZWFjaChmdW5jdGlvbihpKSB7XG5cdFx0Y2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXModGhpcyk7XG5cdCAgY2FudmFzLnNldFdpZHRoKCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykud2lkdGgoKSApO1xuXHRcdGNhbnZhcy5zZXRIZWlnaHQoICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5oZWlnaHQoKSApO1xuXHRcdGNhbnZhc2VzWydwJyArIChpICsgMSldID0gY2FudmFzO1xuXHR9KTtcblx0ZmFicmljLk9iamVjdC5wcm90b3R5cGUub3JpZ2luWCA9IGZhYnJpYy5PYmplY3QucHJvdG90eXBlLm9yaWdpblkgPSAnY2VudGVyJyAvLyBvcmlnaW4gYXQgdGhlIGNlbnRlclxuXHR2YXIgaW5zZXJ0VGl0bGUgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBUaXRsZSBIZXJlJywge1xuXHQgIHRvcDogMTIwLFxuXHQgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8sIHNlcmlmJyxcblx0ICBmaWxsOiAnIzc3NycsXG5cdCAgbGluZUhlaWdodDogMS4xLFxuXHQgIGZvbnRTaXplOiAzMCxcblx0ICBmb250V2VpZ2h0OiAnYm9sZCcsXG5cdCAgdGV4dEFsaWduOiAnY2VudGVyJyxcblx0ICB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG5cdCAgc2VsZWN0YWJsZTogZmFsc2UsXG5cdCAgaG92ZXJDdXJzb3I6ICdkZWZhdWx0Jyxcblx0ICBvcmlnaW5YOiAnbGVmdCcsXG5cdCAgb3JpZ2luWTogJ3RvcCdcblx0fSk7XG5cdGNhbnZhc2VzWydwMSddLmFkZChpbnNlcnRUaXRsZSlcblx0dmFyIGxpbmVMZW5naHQgPSAyNTBcblx0Y2FudmFzZXNbJ3AxJ10uYWRkKG5ldyBmYWJyaWMuTGluZShbMCwgMCwgbGluZUxlbmdodCwgMF0sIHtcblx0XHRsZWZ0OiAoIGNhbnZhc2VzWydwMSddLndpZHRoIC0gbGluZUxlbmdodCkgLyAyLFxuXHQgIHRvcDogMTYwLFxuXHQgIHN0cm9rZTogJyMyMjInLFxuXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgXHRvcmlnaW5YOiAnbGVmdCcsXG5cdCAgb3JpZ2luWTogJ3RvcCdcblx0fSkpO1xuXHR2YXIgaW5zZXJ0QXV0aG9ycyA9IG5ldyBmYWJyaWMuVGV4dGJveCgnSW5zZXJ0IEF1dGhvcnMgSGVyZScsIHtcblx0ICB0b3A6IDE4MCxcblx0ICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvLCBzZXJpZicsXG5cdCAgZmlsbDogJyM3NzcnLFxuXHQgIGxpbmVIZWlnaHQ6IDEuMSxcblx0ICBmb250U2l6ZTogMjAsXG5cdCAgdGV4dEFsaWduOiAnY2VudGVyJyxcblx0ICB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG5cdCAgc2VsZWN0YWJsZTogZmFsc2UsXG5cdCAgaG92ZXJDdXJzb3I6ICdkZWZhdWx0Jyxcblx0ICBvcmlnaW5YOiAnbGVmdCcsXG5cdCAgb3JpZ2luWTogJ3RvcCdcblx0fSk7XG5cdGNhbnZhc2VzWydwMSddLmFkZChpbnNlcnRBdXRob3JzKVxuXHQvLyBUT0RPOiBvbiBjbGljaywgdGV4dCBpcyBkZWxldGVkXG59XG5cblxuXG5cblxuLy8gLS0tIE0tVi1DXG5cbnZhciBQdWJsaWNhdGlvbiA9IHtcblx0Ly8gYWxsIG91ciBzdGF0ZXNcblx0aWQ6IG1ha2VJZCgpLFxuXHR0aXRsZTogJ1RFU1QgUFVCJyxcblx0dGltZUxlZnQ6IDkwMDAwMDAsXG5cdGV4cGlyZWQ6IGZhbHNlLFxuXHRhdXRob3JzOiBbXSxcblx0cGFnZXM6IHtcblx0XHRwMToge30sXG5cdFx0cDI6IHt9LFxuXHRcdHAzOiB7fSxcblx0XHRwNDoge30sXG5cdFx0cDU6IHt9LFxuXHRcdHA2OiB7fSxcblx0XHRwNzoge30sXG5cdFx0cDg6IHt9XG5cdH1cbn07XG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIGlucHV0KSB7XG5cdGlmIChQdWJsaWNhdGlvbi50aW1lTGVmdCA+IDApIHsgLy8gbm90IGV4cGlyZWRcblx0XHRzaG93VGltZShQdWJsaWNhdGlvbik7IC8vIGV4cGlyZWRcblx0fSBlbHNlIHtcblx0XHRQdWJsaWNhdGlvbi5leHBpcmVkID0gdHJ1ZTtcblx0XHRzaG93RXhwaXJlZChQdWJsaWNhdGlvbik7XG5cdFx0bG9ja0VsZW1lbnRzKClcblx0XHQvLyBzaG93U2F2ZU1vZGFsKCk7XG5cdH1cblxuXHRpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSBmYWxzZSkge1xuXHRcdGNvbnNvbGUubG9nKGlucHV0KVxuXHRcdHN3aXRjaCAodHJ1ZSkge1xuXHRcdFx0Y2FzZSBpbnB1dC52aXNpYmxlID09IGZhbHNlOiAvLyBkZWxldGluZyBhbiBlbGVtZW50XG5cdFx0XHRcdFx0cmVtb3ZlRWxlbWVudChpbnB1dC5pZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGJ5dGVDb3VudChpbnB1dC5kYXRhKSA+IDEzOTgxMTcgOiAvLyBmaWxlIHRvbyBiaWcgKDFtYilcblx0XHRcdFx0IFx0RXJyb3IudG9vQmlnKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyBpbWFnZVxuXG5cdFx0XHRcdFx0dmFyIHB1YmxpY2F0aW9uVXBkYXRlID0gZnVuY3Rpb24oaW5wdXRQYWdlKSB7IC8vIHVwZGF0ZSBjYW52YXNcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFB1YmxpY2F0aW9uLnBhZ2VzW2lucHV0UGFnZV0gPSBjYW52YXNlc1tpbnB1dFBhZ2VdLnRvSlNPTigpIC8vIHNldHRpbWVvdXQgb3RoZXJ3aXNlIGl0IGRvZXNuJ3QgZ2V0IHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0XHR9LCAxKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBpbnB1dC5tb3VzZVBvcywgcHVibGljYXRpb25VcGRhdGUoaW5wdXQucGFnZSkpOyAvLyBkcm9wIGVsZW1lbnRcblx0XHRcdFx0XHRhZGR0aW1lKDEwMDApIC8vIGFkZCBib251cyB0aW1lXG5cdFx0XHRcdFx0Y3JpdGljU2F5cygpO1xuXG5cblx0XHRcdFx0XHQvLyBjcml0aWNTYXlzKCdkYW5jZSBkYW5jZScsICdjYXQnKTtcblx0XHRcdFx0XHQvLyBvclxuXHRcdFx0XHRcdC8vIGNyaXRpY1NheXMoJ2RhbmNlIGRhbmNlJyk7XG5cdFx0XHRcdFx0Ly8gb3Jcblx0XHRcdFx0XHQvLyBjcml0aWNTYXlzKCk7XG5cblxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJykgJiZcblx0XHRcdFx0aW5wdXQudmlzaWJsZSA9PSB0cnVlOiAvLyBuZXcgdGV4dFxuXG5cdFx0XHRcdFx0dmFyIHB1YmxpY2F0aW9uVXBkYXRlID0gZnVuY3Rpb24oaW5wdXRQYWdlKSB7IC8vIHVwZGF0ZSBjYW52YXNcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFB1YmxpY2F0aW9uLnBhZ2VzW2lucHV0UGFnZV0gPSBjYW52YXNlc1tpbnB1dFBhZ2VdLnRvSlNPTigpIC8vIHNldHRpbWVvdXQgb3RoZXJ3aXNlIGl0IGRvZXNuJ3QgZ2V0IHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0XHR9LCAxKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBpbnB1dC5tb3VzZVBvcywgcHVibGljYXRpb25VcGRhdGUoaW5wdXQucGFnZSkpOyAvLyBkcm9wIGVsZW1lbnRcblx0XHRcdFx0XHRhZGR0aW1lKDEwMDApIC8vIGFkZCBib251cyB0aW1lXG5cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG5cdFx0XHRcdFx0RXJyb3Iubm90QWxsb3dlZCgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQubW92ZSA9PSB0cnVlIDogLy8gbW92aW5nIG9yIHNjYWxpbmcgYW4gaW1hZ2Vcblx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dC5wYWdlXSA9IGNhbnZhc2VzW2lucHV0LnBhZ2VdLnRvSlNPTigpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuaGFzT3duUHJvcGVydHkoJ3RpdGxlJykgOiAvLyBjaGFuZ2luZyB0aXRsZVxuXHRcdFx0XHRcdFB1YmxpY2F0aW9uLnRpdGxlID0gaW5wdXQudGl0bGU7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkge1xuXHRcdC8vIHRvbyBsYXRlXG5cdFx0RXJyb3IudG9vTGF0ZSgpO1xuXHR9XG59XG5cblxuXG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxudmFyIHg7XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0aW5pdENhbnZhc2VzKClcblx0b25Nb2RFbGVtZW50KClcblx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPCAwKSB7XG5cdFx0Ly8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cblx0XHRpZiAoIGdldFVybFBhcmFtZXRlcigndGltZScpICkgeyAvLyBkaWZmaWN1bHR5XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IGdldFVybFBhcmFtZXRlcigndGltZScpO1xuXHRcdH1cblx0XHR4ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC0gMTA7XG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uKTtcblx0XHR9LCAxMClcbiAgICBpZiAoZGlzcnVwdGlvbnNPbiA9PSB0cnVlKSB7XG4gICAgICB5ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7IC8vIGxhdW5jaCBhIHJhbmRvbSBkaXNydXB0aW9uXG4gICAgICAgIGRpc3J1cHRpb25zID0gT2JqZWN0LmtleXMoRGlzcnVwdGlvbilcbiAgICAgICAgRGlzcnVwdGlvbltkaXNydXB0aW9uc1sgZGlzcnVwdGlvbnMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV0oKVxuICAgICAgfSwgNTAwMClcbiAgICB9XG5cdFx0bW91c2VDb3VudGVyKClcblx0fSBlbHNlIHsgLy8gc2F2ZWQgcHVibGljYXRpb25cblx0XHRyZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbilcblx0XHRwZGZEb3dubG9hZCgpXG5cdFx0JCgnYm9keScpLmFkZENsYXNzKCdzYXZlZCcpXG5cdH1cbn0pO1xuXG5mdW5jdGlvbiBhZGR0aW1lKGJvbnVzVGltZSkge1xuXHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICsgYm9udXNUaW1lO1xuXHRhbmltYXRldGltZWNvdW50ZXIoYm9udXNUaW1lKTtcbn1cblxuLy8gbW9kaWZ5IGVsZW1lbnQgbGlzdGVuZXJcbmZ1bmN0aW9uIG9uTW9kRWxlbWVudCgpIHtcblx0Zm9yICh2YXIgcGFnZUlkIGluIGNhbnZhc2VzKSB7XG5cdFx0Y2FudmFzZXNbIHBhZ2VJZCBdLm9uKCdvYmplY3Q6bW9kaWZpZWQnLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBwYXJlbnRDYW52YXNJZCA9IGV2dC50YXJnZXQuY2FudmFzLmxvd2VyQ2FudmFzRWwuaWRcblx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgbW92ZTogdHJ1ZSwgcGFnZTogcGFyZW50Q2FudmFzSWR9KVxuXHRcdH0pXG5cdH1cbn1cblxuLy8gZ2V0IG1vdXNlIHBvc2l0aW9uIG9uIGNhbnZhc1xuZnVuY3Rpb24gZ2V0TW91c2VQb3MoY2FudmFzLCBlKSB7XG4gIHZhciBwb2ludGVyID0gY2FudmFzLmdldFBvaW50ZXIoZXZlbnQsIGUpXG4gIHZhciBwb3NYID0gcG9pbnRlci54XG4gIHZhciBwb3NZID0gcG9pbnRlci55XG4gIHJldHVybiB7XG4gICAgeDogcG9zWCxcbiAgICB5OiBwb3NZXG4gIH1cbn1cblxuLy8gZHJvcCBlbGVtZW50XG5wYWdlcy5vbignZHJhZ292ZXInLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xucGFnZXMub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG5wYWdlcy5vbignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRjb25zb2xlLmxvZyhlKTtcblx0dmFyIGZpbGVzID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5maWxlcztcblx0dmFyIHkgPSAwO1xuXHRmb3IgKHZhciBpID0gZmlsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRyZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdHZhciBwYWdlSWQgPSAkKHRoaXMpLmZpbmQoJ2NhbnZhcycpLmF0dHIoJ2lkJyk7XG5cdFx0bW91c2VQb3MgPSBnZXRNb3VzZVBvcyhjYW52YXNlc1twYWdlSWRdLCBlKVxuXHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0Y29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHtcblx0XHRcdFx0XHRkYXRhOiBldmVudC50YXJnZXQucmVzdWx0LFxuXHRcdFx0XHRcdHZpc2libGU6IHRydWUsXG5cdFx0XHRcdFx0cGFnZTogcGFnZUlkLFxuXHRcdFx0XHRcdG1vdXNlUG9zOiBtb3VzZVBvc1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sIHkgKiBkcm9wRGVsYXkpO1xuXHRcdFx0eSArPSAxO1xuXHRcdH07XG5cdFx0Y29uc29sZS5sb2coZmlsZXNbaV0pO1xuXHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGVzW2ldKTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59KTtcbi8vIHByZXZlbnQgZHJvcCBvbiBib2R5XG4kKCdib2R5Jykub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRTb3VuZC5lcnJvcigpO1xufSk7XG5cbi8vIHJlbW92ZSBlbGVtZW50IChUT0RPOiBVUERBVEUgRk9SIEZBQlJJQylcbiQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuY2xvc2UnLCBmdW5jdGlvbigpIHtcblx0dmFyIHBhZ2VJZCA9ICQodGhpcylcblx0XHQuY2xvc2VzdCgnLnBhZ2UnKVxuXHRcdC5hdHRyKCdpZCcpO1xuXHR2YXIgZWxlbWVudElkID0gJCh0aGlzKVxuXHRcdC5wYXJlbnQoKVxuXHRcdC5hdHRyKCdpZCcpO1xuXHR2YXIgZWxlbWVudERhdGEgPSAkKHRoaXMpXG5cdFx0LnNpYmxpbmdzKClcblx0XHQuYXR0cignc3JjJyk7XG5cdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHtcblx0XHRpZDogZWxlbWVudElkLFxuXHRcdGRhdGE6IGVsZW1lbnREYXRhLFxuXHRcdHBvczogWzAsIDAsIDAsIDAsIDBdLFxuXHRcdHZpc2libGU6IGZhbHNlLFxuXHRcdHBhZ2U6IHBhZ2VJZFxuXHR9KTtcbn0pO1xuXG4vLyBjaGFuZ2luZyB0aXRsZVxuJCgnI3RpdGxlJykuY2hhbmdlKGZ1bmN0aW9uKCkge1xuXHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0dGl0bGU6ICQodGhpcykudmFsKClcblx0fSk7XG59KVxuXG5cblxuXG5cblxuLy8gLS0tIFZJRVdcblxudmFyIFNvdW5kID0ge1xuXHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vaW5jb3JyZWN0Lm1wMycpO1xuXHRcdGF1ZGlvLnBsYXkoKTtcblx0fSxcblx0ZGluZzogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vZGluZy5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH1cbn07XG5cbi8vIG1lcmdlIHRoZXNlIHR3b1xuZnVuY3Rpb24gc2hvd1RpbWUoUHVibGljYXRpb24pIHtcblx0c2Vjb25kcyA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMTAwMDtcblx0JCgnI2NvdW50ZXInKS5zaG93KCk7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID1cblx0XHRzZWNvbmRzLnRvRml4ZWQoMikgKyAnIHNlY29uZHMgbGVmdCEnO1xufVxuZnVuY3Rpb24gbW91c2VDb3VudGVyKCkge1xuXHQkKGRvY3VtZW50KS5iaW5kKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUucGFnZVggPj0gJChkb2N1bWVudCkud2lkdGgoKSAvIDIpIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIHJpZ2h0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5hZGRDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCAtIDIwIC0gJCgnI2NvdW50ZXInKS53aWR0aCgpLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIGxlZnQgc2lkZSBvZiBwYWdlXG5cdFx0XHQkKCcjY291bnRlcicpLnJlbW92ZUNsYXNzKCdtb3VzZV9yaWdodCcpO1xuXHRcdFx0JCgnI2NvdW50ZXInKS5jc3Moe1xuXHRcdFx0XHRsZWZ0OiBlLnBhZ2VYICsgMjAsXG5cdFx0XHRcdHRvcDogZS5wYWdlWSArIDUwXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzaG93RXhwaXJlZCgpIHtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKS5pbm5lckhUTUwgPSAnZXhwaXJlZCEnO1xuXHQkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKTtcblxuXHRleHBpcmVkVGltZSgpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHQkKCcud3JhcHBlcicpLmFkZENsYXNzKCdzYXZlZF92aWV3Jyk7XG5cdFx0c2F2ZWRTdGF0ZSgpO1xuXHR9LCA1MDApO1xuXHQvLyBhbmNob3JrZXlcblx0Ly9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdC8vICB3aW5kb3cucHJpbnQoKTtcblx0Ly99LCAxMDAwKTtcblx0Ly8gYW5pbWF0ZVVwKCQoJyNzYXZlLW1vZGFsJykpO1xuXHQvLyBjbGVhckludGVydmFsKHgpO1xuXHQvLyBhbmltYXRlVXAoJCgnI3NhdmUtbW9kYWwnKSk7XG5cdGNsZWFySW50ZXJ2YWwoeClcbiAgY2xlYXJJbnRlcnZhbCh5KVxufVxuXG5mdW5jdGlvbiBkcm9wRWxlbWVudChwYWdlSWQsIGRhdGEsIG1vdXNlUG9zLCBjYWxsYmFjaykge1xuXHRjb25zb2xlLmxvZyhtb3VzZVBvcylcblx0dmFyIGVsZW1lbnQgPSB7IGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZCB9O1xuXHR2YXIgZWxlbWVudFBvcyA9IGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MsIGNhbGxiYWNrKTtcblx0U291bmQuZGluZygpO1xuXHQvLyBhY2hpZXZlbWVudCgyMDAsICdZb3VyIG1vbSBib3VnaHQgMTIgY29waWVzJyk7XG59XG5cblxuXG5cblxuXG5cbi8vIGVycm9yc1xuXG52YXIgRXJyb3IgPSB7XG5cdG5vdEFsbG93ZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKClcblx0XHRhbGVydE1lc3NhZ2UoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIG5vdCBhbGxvd2VkIScpXG5cdH0sXG5cdHRvb0JpZzogZnVuY3Rpb24oKSB7XG5cdFx0U291bmQuZXJyb3IoKTtcblx0XHRhbGVydE1lc3NhZ2UoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIHRvbyBiaWchJyk7XG5cdH0sXG5cdHRvb0xhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKCk7XG5cdFx0YWxlcnRNZXNzYWdlKCd0b28gbGF0ZSBicm8nKTtcblx0fVxufTtcblxuLy8gbG9jayBlbGVtZW50c1xuZnVuY3Rpb24gbG9ja0VsZW1lbnRzKCkge1xuXHRmb3IgKHZhciBwYWdlSWQgaW4gY2FudmFzZXMpIHtcblx0XHRjYW52YXNlc1twYWdlSWRdLnNlbGVjdGlvbiA9IGZhbHNlO1xuXHRcdGZvciAob2JqZWN0SWQgaW4gY2FudmFzZXNbcGFnZUlkXS5nZXRPYmplY3RzKCkgKSB7XG5cdFx0XHR2YXIgb2JqZWN0ID0gY2FudmFzZXNbcGFnZUlkXS5pdGVtKG9iamVjdElkKVxuXHRcdFx0b2JqZWN0LnNlbGVjdGFibGUgPSBmYWxzZVxuXHRcdFx0b2JqZWN0LmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnXG5cdFx0fVxuXHR9XG59XG5cbi8vIFRPRE86IENPTlZFUlQgVE8gRkFCUklDXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50KGlkKSB7XG5cdCQoJyMnICsgaWQpLmhpZGUoKTtcblx0Y29uc29sZS5sb2coaWQpO1xufVxuXG4vLyBzaG93IHNhdmUgbW9kYWxcblxuZnVuY3Rpb24gc2hvd1NhdmVNb2RhbCgpIHtcblx0JCgnI3NhdmUtbW9kYWwnKS5zaG93KCk7XG5cdCQoJyNzYXZlJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0c2F2ZXRvRGIoUHVibGljYXRpb24pO1xuXHRcdC8vIG1ha2VQZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdGdlblBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Ly8gY2hlY2tQZGYoUHVibGljYXRpb24uaWQpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gZ2VuUGRmKGlkKSB7XG5cdCQoJyNzYXZlLW1vZGFsJykuc2hvdygpO1xuXHQkKCcjc2F2ZS1tb2RhbCcpLmh0bWwoJycpO1xuXHR2YXIgeiA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdGlmIChwZGZSZWFkeSA9PSB0cnVlKSB7XG5cdFx0XHQkKCcjc2F2ZS1tb2RhbCcpLmh0bWwoXG5cdFx0XHRcdCdEb3dubG9hZCB5b3VyIHBkZiA8YSBocmVmPVwiYXNzZXRzL3BkZi8nICtcblx0XHRcdFx0XHRpZCArXG5cdFx0XHRcdFx0Jy8nICtcblx0XHRcdFx0XHRpZCArXG5cdFx0XHRcdFx0Jy5wZGY/ZG93bmxvYWQ9dHJ1ZVwiIHRhcmdldD1cIl9ibGFua1wiPmhlcmU8L2E+IGFuZCBwcmludGFibGUgcGRmIGJvb2tsZXQgPGEgaHJlZj1cImFzc2V0cy9wZGYvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCctYm9va2xldC5wZGY/ZG93bmxvYWQ9dHJ1ZVwiIHRhcmdldD1cIl9ibGFua1wiPmhlcmU8L2E+LicgLy8gYWRkIFwib24gY2xpY2sgY2xvc2Ugc2F2ZSBtb2RhbFwiXG5cdFx0XHQpO1xuXHRcdFx0Y2xlYXJJbnRlcnZhbCh6KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gJCgnI3NhdmUtbW9kYWwnKS5odG1sKCdZb3VyIFB1YmxpY2F0aW9uIGlzIGJlaW5nIGdlbmVyYXRlZDxzcGFuIGlkPVwibG9hZGluZ19kb3RzXCI+Li4uPC9zcGFuPjxkaXYgaWQ9XCJsb2FkZXJcIj48ZGl2IGlkPVwibG9hZGluZ2JhclwiPjwvZGl2PjwvZGl2PicpO1xuXHRcdFx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKCdZb3VyIFB1YmxpY2F0aW9uICg8YSBocmVmPVwiaHR0cDovL2xvY2FsaG9zdDozMDAwL3BkZj9pZD0nICsgUHVibGljYXRpb24uaWQgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+ZG93bmxvYWQ8L2E+KSBpcyBiZWluZyBnZW5lcmF0ZWQ8c3BhbiBpZD1cImxvYWRpbmdfZG90c1wiPi4uLjwvc3Bhbj48ZGl2IGlkPVwic3Bpbm5lclwiPjxkaXYgaWQ9XCJhbmltYXRpb25cIj48L2Rpdj48aW1nIHNyYz1cImFzc2V0cy9pbWcvcHJpbnRlci5wbmdcIj48L2Rpdj4nKTtcblx0XHR9XG5cdH0sIDEwMCk7XG59XG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbikge1xuXHRjYW52YXNlc1sncDEnXS5jbGVhcigpOyAvLyBjbGVhciB0aXRsZVxuXG5cdGZvciAodmFyIGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG5cdFx0dmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeShQdWJsaWNhdGlvbi5wYWdlc1tjYW52YXNJZF0pO1xuXHRcdGNhbnZhc2VzW2NhbnZhc0lkXS5sb2FkRnJvbUpTT04oIGpzb24sIGZ1bmN0aW9uKCkge1xuXHRcdFx0Y2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbC5iaW5kKGNhbnZhc2VzW2NhbnZhc0lkXSlcblx0XHRcdGxvY2tFbGVtZW50cygpXG5cdFx0fSlcblx0fVxuXG59XG5cbmZ1bmN0aW9uIHBkZkRvd25sb2FkKCkge1xuXHQkKCcjcGRmLWRvd25sb2FkJykuc2hvdygpO1xuXHQkKCcjcGRmLWRvd25sb2FkJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0Ly8gbWFrZVBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Z2VuUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHQvLyBjaGVja1BkZihQdWJsaWNhdGlvbi5pZCk7XG5cdH0pO1xufVxuXG5cblxuXG5cblxuLy8gLS0tIEJBQ0tFTkRcblxuLy8gc2F2ZSB0byBkYlxuZnVuY3Rpb24gc2F2ZXRvRGIocHVibGljYXRpb24pIHtcblx0Zm9yICh2YXIgcGFnZSBpbiBQdWJsaWNhdGlvbi5wYWdlcykge1xuXHRcdFB1YmxpY2F0aW9uLnBhZ2VzW3BhZ2VdID0gY2FudmFzZXNbcGFnZV0udG9KU09OKCkgLy8gdXBkYXRlIGFsbCBwYWdlc1xuXHR9XG5cdCQuYWpheCh7XG5cdFx0dXJsOiAnL2RiJyxcblx0XHR0eXBlOiAncG9zdCcsIC8vIHBlcmZvcm1pbmcgYSBQT1NUIHJlcXVlc3Rcblx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeShQdWJsaWNhdGlvbiksXG5cdFx0Y29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcblx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHB1YmxpY2F0aW9uKSB7XG5cdFx0XHRjb25zb2xlLmxvZygncHVibGljYXRpb24gc2VudCB0byBkYXRhYmFzZS4nKTtcblx0XHR9XG5cdH0pO1xuXHRjb25zb2xlLmxvZygnc2F2ZWQ/aWQ9JyArIFB1YmxpY2F0aW9uLmlkKVxufVxuXG5cblxuXG5cbi8vIC0tLSBJTlRFUkZBQ0UgRlhcblxuXG4vLyBtb3ZlIHRoZXNlIGZ1bmN0aW9ucyB0byBpbnRlcmZhY2UgcGFydCBvZiBqcz9cbmZ1bmN0aW9uIGFuaW1hdGVVcChvYmopIHtcbiAgb2JqLnNob3coKTtcbiAgb2JqLmNzcygnbWFyZ2luLXRvcCcsICcyMHB4Jyk7XG4gIG9iai5hbmltYXRlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICBtYXJnaW5Ub3A6IFwiMHB4XCIsXG4gICAgfSwgMzAwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG4gIH0pO1xufTtcblxuZnVuY3Rpb24gYW5pbWF0ZVVwT3V0KG9iaiwgdGltZSkge1xuICBvYmouc2hvdygpO1xuICBvYmouY3NzKCdtYXJnaW4tdG9wJywgJzIwcHgnKTtcbiAgb2JqLmFuaW1hdGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIG1hcmdpblRvcDogXCIwcHhcIixcbiAgICB9LCB0aW1lLzIsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICB9KTtcbiAgb2JqLmFuaW1hdGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIG1hcmdpblRvcDogXCIyMHB4XCIsXG4gICAgfSwgdGltZS8yLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cbiAgfSk7XG59O1xuXG5mdW5jdGlvbiBzaGFrZShvYmosIHRpbWUpIHtcbiAgaWYgKCF0aW1lKSAoXG4gICAgdGltZSA9IDUwMFxuICApXG4gIG9iai5hZGRDbGFzcyggJ3NoYWtlIHNoYWtlLWNvbnN0YW50JyApXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICBvYmoucmVtb3ZlQ2xhc3MoICdzaGFrZSBzaGFrZS1jb25zdGFudCcgKVxuICB9LCB0aW1lKTtcbn1cblxuXG5cblxuXG5cbi8vIC0tLSBESVNSVVBUSU9OU1xuXG5mdW5jdGlvbiByb3RhdGVPbmUob2JqKSB7XG4gIG9iai5vcmlnaW5YID0gJ2NlbnRlcidcbiAgb2JqLm9yaWdpblkgPSAnY2VudGVyJ1xuICBvYmoucm90YXRlKDApLmFuaW1hdGUoeyBhbmdsZTogMzYwIH0sIHtcbiAgICBkdXJhdGlvbjogMzAwMCxcbiAgICBvbkNoYW5nZTogb2JqLmNhbnZhcy5yZW5kZXJBbGwuYmluZChvYmouY2FudmFzKSxcbiAgICBvbkNvbXBsZXRlOiBmdW5jdGlvbigpeyByb3RhdGVPbmUob2JqKSB9LFxuICAgIGVhc2luZzogZnVuY3Rpb24odCwgYiwgYywgZCkgeyByZXR1cm4gYyp0L2QgKyBiIH1cbiAgfSlcbn1cblxudmFyIERpc3J1cHRpb24gPSB7XG5cdGNvbWljOiBmdW5jdGlvbigpIHtcblx0XHRmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG5cdFx0XHR0ZXh0cyA9IGNhbnZhc2VzW2NhbnZhc0lkXS5nZXRPYmplY3RzKCd0ZXh0Jylcblx0ICAgIGZvciAodGV4dCBpbiB0ZXh0cykge1xuXHQgICAgICB0ZXh0c1t0ZXh0XS5mb250RmFtaWx5ID0gJ1wiQ29taWMgU2FucyBNU1wiJ1xuXHQgICAgfVxuXHQgICBcdHRleHRib3hlcyA9IGNhbnZhc2VzW2NhbnZhc0lkXS5nZXRPYmplY3RzKCd0ZXh0Ym94Jylcblx0ICAgIGZvciAodGV4dGJveCBpbiB0ZXh0Ym94ZXMpIHtcblx0ICAgICAgdGV4dGJveGVzW3RleHRib3hdLmZvbnRGYW1pbHkgPSAnXCJDb21pYyBTYW5zIE1TXCInXG5cdCAgICB9XG4gICAgICBzaGFrZSgkKCcucGFnZScpKVxuXHQgICAgY2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbCgpO1xuICAgIH1cbiAgICBjcml0aWNTYXlzKCdUaGUgY29tbWlzc2lvbmVyIGFza2VkIHRvIHNwaWNlIHRoZSB0eXBvZ3JhcGh5IGEgYml0IScsICdHdXRlbmJlcmcnKVxuXHR9LFxuXHRyb3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcblx0XHRcdGltZ3MgPSBjYW52YXNlc1tjYW52YXNJZF0uZ2V0T2JqZWN0cygnaW1hZ2UnKVxuXHQgICAgZm9yIChpbWcgaW4gaW1ncykge1xuXHQgICAgICByb3RhdGVPbmUoaW1nc1tpbWddKVxuXHQgICAgfVxuICAgIH1cbiAgICBzaGFrZSgkKCcucGFnZScpKVxuICAgIGNvbnNvbGUubG9nKCdZb3VyIGZyaWVuZCB0aGluayB0aGUgbGF5b3V0IGlzIGEgYml0IHN0YXRpYy4uLicpXG5cdH0sXG5cdGxvY2tSYW5kUGFnZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhjYW52YXNlcylcbiAgICByYW5kQ2FudmFzID0gY2FudmFzZXNba2V5c1sga2V5cy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXVxuXHRcdHJhbmRDYW52YXMuYmFja2dyb3VuZENvbG9yID0gJ3JlZCdcblx0XHRyYW5kQ2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlO1xuXHRcdGZvciAob2JqZWN0SWQgaW4gcmFuZENhbnZhcy5nZXRPYmplY3RzKCkgKSB7XG5cdFx0XHR2YXIgb2JqZWN0ID0gcmFuZENhbnZhcy5pdGVtKG9iamVjdElkKVxuXHRcdFx0b2JqZWN0LnNlbGVjdGFibGUgPSBmYWxzZVxuXHRcdFx0b2JqZWN0LmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnXG5cdFx0fVxuXHRcdHJhbmRDYW52YXMuYWRkKG5ldyBmYWJyaWMuTGluZShbMCwgMCwgcmFuZENhbnZhcy53aWR0aCwgcmFuZENhbnZhcy5oZWlnaHRdLCB7XG5cdCAgXHRzdHJva2U6ICcjZmZmJyxcblx0ICBcdHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIFx0c3Ryb2tlV2lkdGg6IDRcblx0XHR9KSlcbiAgICByYW5kQ2FudmFzLmFkZChuZXcgZmFicmljLkxpbmUoWzAsIHJhbmRDYW52YXMuaGVpZ2h0LCByYW5kQ2FudmFzLndpZHRoLCAwXSwge1xuICAgICAgc3Ryb2tlOiAnI2ZmZicsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIHN0cm9rZVdpZHRoOiA0XG4gICAgfSkpXG4gICAgc2hha2UoJCgnLnBhZ2UnKSlcblx0XHRyYW5kQ2FudmFzLnJlbmRlckFsbCgpO1xuXHRcdC8vIFRPRE86IHByZXZlbnQgZHJvcFxuICAgIGNyaXRpY1NheXMoJ1BhZ2UgPz8gaXMgbm93IGxvY2tlZC4uLicsICdHdXRlbmJlcmcnKSAvLyBUT0RPXG5cdH0sXG4gIHNodWZmbGVQYWdlczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRvU2h1ZmZsZSA9IFtdXG4gICAgdmFyIGkgPSAwXG4gICAgZm9yIChjYW52YXNJZCBpbiBjYW52YXNlcykge1xuICAgICAgaWYgKGkgPiAwKSB7IC8vIHByZXZlbnQgc2h1ZmZsaW5nIGZpcnN0IHBhZ2VcbiAgICAgICAgdG9TaHVmZmxlLnB1c2goIGNhbnZhc2VzW2NhbnZhc0lkXS50b0pTT04oKSApXG4gICAgICB9XG4gICAgICBpICs9IDFcbiAgICB9XG4gICAgc2h1ZmZsZUFycmF5KHRvU2h1ZmZsZSlcbiAgICB2YXIgeSA9IDBcbiAgICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoeSA+IDApIHtcbiAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLmxvYWRGcm9tSlNPTih0b1NodWZmbGVbeSAtIDFdLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsLmJpbmQoY2FudmFzZXNbY2FudmFzSWRdKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgeSArPSAxXG4gICAgfVxuICAgIHNoYWtlKCQoJy5wYWdlJykpXG4gICAgY3JpdGljU2F5cygnVGhlIHJ5dGhtIG9mIHRoaXMgcHVibGljYXRpb24gaXMgYSBiaXQgd2Vhay4gRG9uXFwndCB5b3UgdGhpbms/JywgJ0d1dGVuYmVyZycpXG4gIH0sXG5cdGFkczogZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhjYW52YXNlcylcbiAgICByYW5kQ2FudmFzID0gY2FudmFzZXNba2V5c1sga2V5cy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXVxuXHRcdHJhbmRDYW52YXMuYWRkKG5ldyBmYWJyaWMuUmVjdCh7XG5cdFx0XHR3aWR0aDogcmFuZENhbnZhcy53aWR0aCxcblx0XHRcdGhlaWdodDogMzAsXG5cdFx0XHRmaWxsOiAnIzBEMjEzRScsXG5cdFx0XHRsb2NrTW92ZW1lbnRYOiB0cnVlLFxuXHRcdFx0bG9ja01vdmVtZW50WTogdHJ1ZSxcblx0XHRcdGxvY2tSb3RhdGlvbjogdHJ1ZSxcblx0XHRcdGhhc0NvbnRyb2xzOiBmYWxzZSxcblx0XHRcdGxlZnQ6IHJhbmRDYW52YXMud2lkdGgvMixcblx0XHRcdHRvcDogMTVcblx0XHR9KSk7XG5cdFx0ZmFicmljLkltYWdlLmZyb21VUkwoJy9hc3NldHMvaW1nL2tpbmtvLnBuZycsIGZ1bmN0aW9uKGltZyl7XG5cdFx0XHRcdGltZy5oYXNCb3JkZXJzID0gZmFsc2U7XG5cdFx0XHRcdGltZy5oYXNDb250cm9scyA9IGZhbHNlO1xuXHRcdFx0XHRpbWcuc2NhbGUoMC4yKTtcblx0XHRcdFx0aW1nLmxlZnQgPSByYW5kQ2FudmFzLndpZHRoLTEwMDtcblx0XHRcdFx0aW1nLnRvcCA9IDUwO1xuXHRcdFx0XHRpbWcubG9ja01vdmVtZW50WCA9IHRydWU7XG5cdFx0XHRcdGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcblx0XHRcdFx0aW1nLmxvY2tSb3RhdGlvbiA9IHRydWU7XG5cdFx0XHRcdGltZy5zZXRDb250cm9sc1Zpc2liaWxpdHkgPSBmYWxzZTtcblx0XHRcdFx0cmFuZENhbnZhcy5pbnNlcnRBdChpbWcsMyk7XG5cdFx0XHRcdC8vIFRPRE86IGl0IG9ubHkgd29ya3Mgd2l0aCBvbmUgaW1hZ2UgZm9yIHNvbWUgcmVhc29uLiBydW5uaW5nIHRoZSBmdW5jdGlvbiBtdWx0aXBsZSB0aW1lcyBpdCBhZGRzIG1vcmUgdG9wIGJhcnMgYnV0IGp1c3QgbW92ZXMgYWxsIHRoZSBpbWFnZXMgdG8gdGhlIHNhbWUgcGxhY2Vcblx0XHR9KTtcblx0fVxufTsiXSwiZmlsZSI6Im1haW4uanMifQ==
