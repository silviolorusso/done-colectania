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

$(window).ready(function () {
  console.log('ready');
  Disruption.ads()
})

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBPUFRJT05TXG5cbnZhciBkaXNydXB0aW9uc09uID0gdHJ1ZVxudmFyIGRyb3BEZWxheSA9IDEwMFxuXG5cblxuXG5cblxuLy8gLS0tIEdMT0JBTFxuXG5jb25zdCBwYWdlcyA9ICQoJy5wYWdlJylcblxuXG5cblxuXG4vLyAtLS0gR0VORVJBTCBGVU5DVElPTlNcblxuZnVuY3Rpb24gbWFrZUlkKCkge1xuXHR2YXIgcmFuZExldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNikpO1xuXHR2YXIgaWQgPSByYW5kTGV0dGVyICsgRGF0ZS5ub3coKTtcblx0cmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBieXRlQ291bnQocykge1xuICAgIHJldHVybiBlbmNvZGVVUkkocykuc3BsaXQoLyUuLnwuLykubGVuZ3RoIC0gMTtcbn1cblxudmFyIGdldFVybFBhcmFtZXRlciA9IGZ1bmN0aW9uIGdldFVybFBhcmFtZXRlcihzUGFyYW0pIHtcbiAgdmFyIHNQYWdlVVJMID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKSxcbiAgICBzVVJMVmFyaWFibGVzID0gc1BhZ2VVUkwuc3BsaXQoJyYnKSxcbiAgICBzUGFyYW1ldGVyTmFtZSxcbiAgICBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBzVVJMVmFyaWFibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgc1BhcmFtZXRlck5hbWUgPSBzVVJMVmFyaWFibGVzW2ldLnNwbGl0KCc9Jyk7XG5cbiAgICBpZiAoc1BhcmFtZXRlck5hbWVbMF0gPT09IHNQYXJhbSkge1xuICAgICAgICByZXR1cm4gc1BhcmFtZXRlck5hbWVbMV0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBzUGFyYW1ldGVyTmFtZVsxXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycmF5KSB7XG4gIGZvciAodmFyIGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgdmFyIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcbiAgICB2YXIgdGVtcCA9IGFycmF5W2ldO1xuICAgIGFycmF5W2ldID0gYXJyYXlbal07XG4gICAgYXJyYXlbal0gPSB0ZW1wO1xuICB9XG59XG5cblxuXG5cblxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KGVsZW1lbnQsIG1vdXNlUG9zLCBjYWxsYmFjaykge1xuXHR2YXIgdGhlTW91c2VQb3MgPSBtb3VzZVBvc1xuXHRpZiAoZWxlbWVudC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykpIHtcblx0XHRmYWJyaWMuSW1hZ2UuZnJvbVVSTChlbGVtZW50LmRhdGEsIGZ1bmN0aW9uKG15SW1nLCBjYWxsYmFjaykge1xuIFx0XHRcdHZhciBpbWcgPSBteUltZy5zZXQoeyBsZWZ0OiAwLCB0b3A6IDAsIHdpZHRoOiBteUltZy53aWR0aCwgaGVpZ2h0OiBteUltZy5oZWlnaHR9KTtcbiBcdFx0XHRpZiAoIGltZy53aWR0aCA+IGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggKSB7XG4gXHRcdFx0XHRpbWcuc2NhbGVUb1dpZHRoKGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggLyAxMDAgKiA1MCApOyAvLyA3MCUgb2YgdGhlIGNhbnZhc1xuIFx0XHRcdH1cbiBcdFx0XHRpbWcubGVmdCA9IHRoZU1vdXNlUG9zLnhcbiBcdFx0XHRpbWcudG9wID0gdGhlTW91c2VQb3MueVxuIFx0XHRcdGltZy5vbignYWRkZWQnLCBmdW5jdGlvbigpIHtcbiBcdFx0XHRcdGNhbGxiYWNrO1xuIFx0XHRcdH0pO1xuIFx0XHRcdGNhbnZhc2VzW2VsZW1lbnQucGFnZV0uYWRkKGltZylcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR2YXIgZGVCYXNlZFRleHQgPSBhdG9iKGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpKTtcblx0XHRjYW52YXNlc1tlbGVtZW50LnBhZ2VdLmFkZChuZXcgZmFicmljLlRleHQoZGVCYXNlZFRleHQsIHtcbiAgXHRcdGZvbnRGYW1pbHk6ICdBcmlhbCcsXG4gIFx0XHRsZWZ0OiBtb3VzZVBvcy54LFxuICBcdFx0dG9wOiBtb3VzZVBvcy55LFxuICBcdFx0Zm9udFNpemU6IDE1XG5cdFx0fSkpO1xuXHRcdGNhbGxiYWNrO1xuXHR9XG59XG5cblxuLy8gLS0tIGluaXRpYWxpemUgY2FudmFzZXNcbnZhciBjYW52YXNlcyA9IHt9XG5mdW5jdGlvbiBpbml0Q2FudmFzZXMoKSB7XG5cdCQoJ2NhbnZhcycpLmVhY2goZnVuY3Rpb24oaSkge1xuXHRcdGNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKHRoaXMpO1xuXHQgIGNhbnZhcy5zZXRXaWR0aCggJCh0aGlzKS5jbG9zZXN0KCcucGFnZScpLndpZHRoKCkgKTtcblx0XHRjYW52YXMuc2V0SGVpZ2h0KCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykuaGVpZ2h0KCkgKTtcblx0XHRjYW52YXNlc1sncCcgKyAoaSArIDEpXSA9IGNhbnZhcztcblx0fSk7XG5cdGZhYnJpYy5PYmplY3QucHJvdG90eXBlLm9yaWdpblggPSBmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5vcmlnaW5ZID0gJ2NlbnRlcicgLy8gb3JpZ2luIGF0IHRoZSBjZW50ZXJcblx0dmFyIGluc2VydFRpdGxlID0gbmV3IGZhYnJpYy5UZXh0Ym94KCdJbnNlcnQgVGl0bGUgSGVyZScsIHtcblx0ICB0b3A6IDEyMCxcblx0ICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvLCBzZXJpZicsXG5cdCAgZmlsbDogJyM3NzcnLFxuXHQgIGxpbmVIZWlnaHQ6IDEuMSxcblx0ICBmb250U2l6ZTogMzAsXG5cdCAgZm9udFdlaWdodDogJ2JvbGQnLFxuXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG5cdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG5cdCAgb3JpZ2luWDogJ2xlZnQnLFxuXHQgIG9yaWdpblk6ICd0b3AnXG5cdH0pO1xuXHRjYW52YXNlc1sncDEnXS5hZGQoaW5zZXJ0VGl0bGUpXG5cdHZhciBsaW5lTGVuZ2h0ID0gMjUwXG5cdGNhbnZhc2VzWydwMSddLmFkZChuZXcgZmFicmljLkxpbmUoWzAsIDAsIGxpbmVMZW5naHQsIDBdLCB7XG5cdFx0bGVmdDogKCBjYW52YXNlc1sncDEnXS53aWR0aCAtIGxpbmVMZW5naHQpIC8gMixcblx0ICB0b3A6IDE2MCxcblx0ICBzdHJva2U6ICcjMjIyJyxcblx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcblx0IFx0b3JpZ2luWDogJ2xlZnQnLFxuXHQgIG9yaWdpblk6ICd0b3AnXG5cdH0pKTtcblx0dmFyIGluc2VydEF1dGhvcnMgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBBdXRob3JzIEhlcmUnLCB7XG5cdCAgdG9wOiAxODAsXG5cdCAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybywgc2VyaWYnLFxuXHQgIGZpbGw6ICcjNzc3Jyxcblx0ICBsaW5lSGVpZ2h0OiAxLjEsXG5cdCAgZm9udFNpemU6IDIwLFxuXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG5cdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG5cdCAgb3JpZ2luWDogJ2xlZnQnLFxuXHQgIG9yaWdpblk6ICd0b3AnXG5cdH0pO1xuXHRjYW52YXNlc1sncDEnXS5hZGQoaW5zZXJ0QXV0aG9ycylcblx0Ly8gVE9ETzogb24gY2xpY2ssIHRleHQgaXMgZGVsZXRlZFxufVxuXG5cblxuXG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG5cdC8vIGFsbCBvdXIgc3RhdGVzXG5cdGlkOiBtYWtlSWQoKSxcblx0dGl0bGU6ICdURVNUIFBVQicsXG5cdHRpbWVMZWZ0OiA5MDAwMDAwLFxuXHRleHBpcmVkOiBmYWxzZSxcblx0YXV0aG9yczogW10sXG5cdHBhZ2VzOiB7XG5cdFx0cDE6IHt9LFxuXHRcdHAyOiB7fSxcblx0XHRwMzoge30sXG5cdFx0cDQ6IHt9LFxuXHRcdHA1OiB7fSxcblx0XHRwNjoge30sXG5cdFx0cDc6IHt9LFxuXHRcdHA4OiB7fVxuXHR9XG59O1xuXG5mdW5jdGlvbiBjb250cm9sbGVyKFB1YmxpY2F0aW9uLCBpbnB1dCkge1xuXHRpZiAoUHVibGljYXRpb24udGltZUxlZnQgPiAwKSB7IC8vIG5vdCBleHBpcmVkXG5cdFx0c2hvd1RpbWUoUHVibGljYXRpb24pOyAvLyBleHBpcmVkXG5cdH0gZWxzZSB7XG5cdFx0UHVibGljYXRpb24uZXhwaXJlZCA9IHRydWU7XG5cdFx0c2hvd0V4cGlyZWQoUHVibGljYXRpb24pO1xuXHRcdGxvY2tFbGVtZW50cygpXG5cdFx0Ly8gc2hvd1NhdmVNb2RhbCgpO1xuXHR9XG5cblx0aWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gZmFsc2UpIHtcblx0XHRjb25zb2xlLmxvZyhpbnB1dClcblx0XHRzd2l0Y2ggKHRydWUpIHtcblx0XHRcdGNhc2UgaW5wdXQudmlzaWJsZSA9PSBmYWxzZTogLy8gZGVsZXRpbmcgYW4gZWxlbWVudFxuXHRcdFx0XHRcdHJlbW92ZUVsZW1lbnQoaW5wdXQuaWQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRieXRlQ291bnQoaW5wdXQuZGF0YSkgPiAxMzk4MTE3IDogLy8gZmlsZSB0b28gYmlnICgxbWIpXG5cdFx0XHRcdCBcdEVycm9yLnRvb0JpZygpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0aW5wdXQudmlzaWJsZSA9PSB0cnVlOiAvLyBuZXcgaW1hZ2VcblxuXHRcdFx0XHRcdHZhciBwdWJsaWNhdGlvblVwZGF0ZSA9IGZ1bmN0aW9uKGlucHV0UGFnZSkgeyAvLyB1cGRhdGUgY2FudmFzXG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dFBhZ2VdID0gY2FudmFzZXNbaW5wdXRQYWdlXS50b0pTT04oKSAvLyBzZXR0aW1lb3V0IG90aGVyd2lzZSBpdCBkb2Vzbid0IGdldCB0aGUgZWxlbWVudFxuXHRcdFx0XHRcdFx0fSwgMSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQubW91c2VQb3MsIHB1YmxpY2F0aW9uVXBkYXRlKGlucHV0LnBhZ2UpKTsgLy8gZHJvcCBlbGVtZW50XG5cdFx0XHRcdFx0YWRkdGltZSgxMDAwKSAvLyBhZGQgYm9udXMgdGltZVxuXHRcdFx0XHRcdGNyaXRpY1NheXMoKTtcblxuXG5cdFx0XHRcdFx0Ly8gY3JpdGljU2F5cygnZGFuY2UgZGFuY2UnLCAnY2F0Jyk7XG5cdFx0XHRcdFx0Ly8gb3Jcblx0XHRcdFx0XHQvLyBjcml0aWNTYXlzKCdkYW5jZSBkYW5jZScpO1xuXHRcdFx0XHRcdC8vIG9yXG5cdFx0XHRcdFx0Ly8gY3JpdGljU2F5cygpO1xuXG5cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IHRleHRcblxuXHRcdFx0XHRcdHZhciBwdWJsaWNhdGlvblVwZGF0ZSA9IGZ1bmN0aW9uKGlucHV0UGFnZSkgeyAvLyB1cGRhdGUgY2FudmFzXG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dFBhZ2VdID0gY2FudmFzZXNbaW5wdXRQYWdlXS50b0pTT04oKSAvLyBzZXR0aW1lb3V0IG90aGVyd2lzZSBpdCBkb2Vzbid0IGdldCB0aGUgZWxlbWVudFxuXHRcdFx0XHRcdFx0fSwgMSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQubW91c2VQb3MsIHB1YmxpY2F0aW9uVXBkYXRlKGlucHV0LnBhZ2UpKTsgLy8gZHJvcCBlbGVtZW50XG5cdFx0XHRcdFx0YWRkdGltZSgxMDAwKSAvLyBhZGQgYm9udXMgdGltZVxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKTogLy8gbmVpdGhlciBhbiBpbWFnZSBub3IgdGV4dFxuXHRcdFx0XHRcdEVycm9yLm5vdEFsbG93ZWQoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0Lm1vdmUgPT0gdHJ1ZSA6IC8vIG1vdmluZyBvciBzY2FsaW5nIGFuIGltYWdlXG5cdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXQucGFnZV0gPSBjYW52YXNlc1tpbnB1dC5wYWdlXS50b0pTT04oKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0Lmhhc093blByb3BlcnR5KCd0aXRsZScpIDogLy8gY2hhbmdpbmcgdGl0bGVcblx0XHRcdFx0XHRQdWJsaWNhdGlvbi50aXRsZSA9IGlucHV0LnRpdGxlO1xuXHRcdH1cblx0fSBlbHNlIGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IHRydWUpIHtcblx0XHQvLyB0b28gbGF0ZVxuXHRcdEVycm9yLnRvb0xhdGUoKTtcblx0fVxufVxuXG5cblxuXG5cbi8vIC0tLSBDT05UUk9MTEVSXG5cbnZhciB4O1xuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cdGluaXRDYW52YXNlcygpXG5cdG9uTW9kRWxlbWVudCgpXG5cdGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpIDwgMCkge1xuXHRcdC8vIGlmIG5vdCBhIHNhdmVkIHB1YmxpY2F0aW9uXG5cdFx0aWYgKCBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKSApIHsgLy8gZGlmZmljdWx0eVxuXHRcdFx0UHVibGljYXRpb24udGltZUxlZnQgPSBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKTtcblx0XHR9XG5cdFx0eCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0UHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAtIDEwO1xuXHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbik7XG5cdFx0fSwgMTApXG4gICAgaWYgKGRpc3J1cHRpb25zT24gPT0gdHJ1ZSkge1xuICAgICAgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkgeyAvLyBsYXVuY2ggYSByYW5kb20gZGlzcnVwdGlvblxuICAgICAgICBkaXNydXB0aW9ucyA9IE9iamVjdC5rZXlzKERpc3J1cHRpb24pXG4gICAgICAgIERpc3J1cHRpb25bZGlzcnVwdGlvbnNbIGRpc3J1cHRpb25zLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dKClcbiAgICAgIH0sIDUwMDApXG4gICAgfVxuXHRcdG1vdXNlQ291bnRlcigpXG5cdH0gZWxzZSB7IC8vIHNhdmVkIHB1YmxpY2F0aW9uXG5cdFx0cmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pXG5cdFx0cGRmRG93bmxvYWQoKVxuXHRcdCQoJ2JvZHknKS5hZGRDbGFzcygnc2F2ZWQnKVxuXHR9XG59KTtcblxuZnVuY3Rpb24gYWRkdGltZShib251c1RpbWUpIHtcblx0UHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCArIGJvbnVzVGltZTtcblx0YW5pbWF0ZXRpbWVjb3VudGVyKGJvbnVzVGltZSk7XG59XG5cbi8vIG1vZGlmeSBlbGVtZW50IGxpc3RlbmVyXG5mdW5jdGlvbiBvbk1vZEVsZW1lbnQoKSB7XG5cdGZvciAodmFyIHBhZ2VJZCBpbiBjYW52YXNlcykge1xuXHRcdGNhbnZhc2VzWyBwYWdlSWQgXS5vbignb2JqZWN0Om1vZGlmaWVkJywgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgcGFyZW50Q2FudmFzSWQgPSBldnQudGFyZ2V0LmNhbnZhcy5sb3dlckNhbnZhc0VsLmlkXG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IG1vdmU6IHRydWUsIHBhZ2U6IHBhcmVudENhbnZhc0lkfSlcblx0XHR9KVxuXHR9XG59XG5cbi8vIGdldCBtb3VzZSBwb3NpdGlvbiBvbiBjYW52YXNcbmZ1bmN0aW9uIGdldE1vdXNlUG9zKGNhbnZhcywgZSkge1xuICB2YXIgcG9pbnRlciA9IGNhbnZhcy5nZXRQb2ludGVyKGV2ZW50LCBlKVxuICB2YXIgcG9zWCA9IHBvaW50ZXIueFxuICB2YXIgcG9zWSA9IHBvaW50ZXIueVxuICByZXR1cm4ge1xuICAgIHg6IHBvc1gsXG4gICAgeTogcG9zWVxuICB9XG59XG5cbi8vIGRyb3AgZWxlbWVudFxucGFnZXMub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbnBhZ2VzLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xucGFnZXMub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0Y29uc29sZS5sb2coZSk7XG5cdHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdHZhciB5ID0gMDtcblx0Zm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0cmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHR2YXIgcGFnZUlkID0gJCh0aGlzKS5maW5kKCdjYW52YXMnKS5hdHRyKCdpZCcpO1xuXHRcdG1vdXNlUG9zID0gZ2V0TW91c2VQb3MoY2FudmFzZXNbcGFnZUlkXSwgZSlcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0XHRcdFx0ZGF0YTogZXZlbnQudGFyZ2V0LnJlc3VsdCxcblx0XHRcdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHBhZ2U6IHBhZ2VJZCxcblx0XHRcdFx0XHRtb3VzZVBvczogbW91c2VQb3Ncblx0XHRcdFx0fSk7XG5cdFx0XHR9LCB5ICogZHJvcERlbGF5KTtcblx0XHRcdHkgKz0gMTtcblx0XHR9O1xuXHRcdGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcblx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0U291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudCAoVE9ETzogVVBEQVRFIEZPUiBGQUJSSUMpXG4kKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNsb3NlJywgZnVuY3Rpb24oKSB7XG5cdHZhciBwYWdlSWQgPSAkKHRoaXMpXG5cdFx0LmNsb3Nlc3QoJy5wYWdlJylcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnRJZCA9ICQodGhpcylcblx0XHQucGFyZW50KClcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnREYXRhID0gJCh0aGlzKVxuXHRcdC5zaWJsaW5ncygpXG5cdFx0LmF0dHIoJ3NyYycpO1xuXHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0aWQ6IGVsZW1lbnRJZCxcblx0XHRkYXRhOiBlbGVtZW50RGF0YSxcblx0XHRwb3M6IFswLCAwLCAwLCAwLCAwXSxcblx0XHR2aXNpYmxlOiBmYWxzZSxcblx0XHRwYWdlOiBwYWdlSWRcblx0fSk7XG59KTtcblxuLy8gY2hhbmdpbmcgdGl0bGVcbiQoJyN0aXRsZScpLmNoYW5nZShmdW5jdGlvbigpIHtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdHRpdGxlOiAkKHRoaXMpLnZhbCgpXG5cdH0pO1xufSlcblxuXG5cblxuXG5cbi8vIC0tLSBWSUVXXG5cbnZhciBTb3VuZCA9IHtcblx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2luY29ycmVjdC5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH0sXG5cdGRpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9XG59O1xuXG4vLyBtZXJnZSB0aGVzZSB0d29cbmZ1bmN0aW9uIHNob3dUaW1lKFB1YmxpY2F0aW9uKSB7XG5cdHNlY29uZHMgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDEwMDA7XG5cdCQoJyNjb3VudGVyJykuc2hvdygpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLmlubmVySFRNTCA9XG5cdFx0c2Vjb25kcy50b0ZpeGVkKDIpICsgJyBzZWNvbmRzIGxlZnQhJztcbn1cbmZ1bmN0aW9uIG1vdXNlQ291bnRlcigpIHtcblx0JChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXHRcdGlmIChlLnBhZ2VYID49ICQoZG9jdW1lbnQpLndpZHRoKCkgLyAyKSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCArIDIwLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID0gJ2V4cGlyZWQhJztcblx0JCgnYm9keScpLmFkZENsYXNzKCdleHBpcmVkJyk7XG5cblx0ZXhwaXJlZFRpbWUoKTtcblx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0JCgnLndyYXBwZXInKS5hZGRDbGFzcygnc2F2ZWRfdmlldycpO1xuXHRcdHNhdmVkU3RhdGUoKTtcblx0fSwgNTAwKTtcblx0Ly8gYW5jaG9ya2V5XG5cdC8vc2V0VGltZW91dChmdW5jdGlvbigpe1xuXHQvLyAgd2luZG93LnByaW50KCk7XG5cdC8vfSwgMTAwMCk7XG5cdC8vIGFuaW1hdGVVcCgkKCcjc2F2ZS1tb2RhbCcpKTtcblx0Ly8gY2xlYXJJbnRlcnZhbCh4KTtcblx0Ly8gYW5pbWF0ZVVwKCQoJyNzYXZlLW1vZGFsJykpO1xuXHRjbGVhckludGVydmFsKHgpXG4gIGNsZWFySW50ZXJ2YWwoeSlcbn1cblxuZnVuY3Rpb24gZHJvcEVsZW1lbnQocGFnZUlkLCBkYXRhLCBtb3VzZVBvcywgY2FsbGJhY2spIHtcblx0Y29uc29sZS5sb2cobW91c2VQb3MpXG5cdHZhciBlbGVtZW50ID0geyBkYXRhOiBkYXRhLCBwYWdlOiBwYWdlSWQgfTtcblx0dmFyIGVsZW1lbnRQb3MgPSBjcmVhdGVFbGVtZW50KGVsZW1lbnQsIG1vdXNlUG9zLCBjYWxsYmFjayk7XG5cdFNvdW5kLmRpbmcoKTtcblx0Ly8gYWNoaWV2ZW1lbnQoMjAwLCAnWW91ciBtb20gYm91Z2h0IDEyIGNvcGllcycpO1xufVxuXG5cblxuXG5cblxuXG4vLyBlcnJvcnNcblxudmFyIEVycm9yID0ge1xuXHRub3RBbGxvd2VkOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpXG5cdFx0YWxlcnRNZXNzYWdlKCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyBub3QgYWxsb3dlZCEnKVxuXHR9LFxuXHR0b29CaWc6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKCk7XG5cdFx0YWxlcnRNZXNzYWdlKCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyB0b28gYmlnIScpO1xuXHR9LFxuXHR0b29MYXRlOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpO1xuXHRcdGFsZXJ0TWVzc2FnZSgndG9vIGxhdGUgYnJvJyk7XG5cdH1cbn07XG5cbi8vIGxvY2sgZWxlbWVudHNcbmZ1bmN0aW9uIGxvY2tFbGVtZW50cygpIHtcblx0Zm9yICh2YXIgcGFnZUlkIGluIGNhbnZhc2VzKSB7XG5cdFx0Y2FudmFzZXNbcGFnZUlkXS5zZWxlY3Rpb24gPSBmYWxzZTtcblx0XHRmb3IgKG9iamVjdElkIGluIGNhbnZhc2VzW3BhZ2VJZF0uZ2V0T2JqZWN0cygpICkge1xuXHRcdFx0dmFyIG9iamVjdCA9IGNhbnZhc2VzW3BhZ2VJZF0uaXRlbShvYmplY3RJZClcblx0XHRcdG9iamVjdC5zZWxlY3RhYmxlID0gZmFsc2Vcblx0XHRcdG9iamVjdC5ob3ZlckN1cnNvciA9ICdkZWZhdWx0J1xuXHRcdH1cblx0fVxufVxuXG4vLyBUT0RPOiBDT05WRVJUIFRPIEZBQlJJQ1xuZnVuY3Rpb24gcmVtb3ZlRWxlbWVudChpZCkge1xuXHQkKCcjJyArIGlkKS5oaWRlKCk7XG5cdGNvbnNvbGUubG9nKGlkKTtcbn1cblxuLy8gc2hvdyBzYXZlIG1vZGFsXG5cbmZ1bmN0aW9uIHNob3dTYXZlTW9kYWwoKSB7XG5cdCQoJyNzYXZlLW1vZGFsJykuc2hvdygpO1xuXHQkKCcjc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdHNhdmV0b0RiKFB1YmxpY2F0aW9uKTtcblx0XHQvLyBtYWtlUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRnZW5QZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdC8vIGNoZWNrUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdlblBkZihpZCkge1xuXHQkKCcjc2F2ZS1tb2RhbCcpLnNob3coKTtcblx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKCcnKTtcblx0dmFyIHogPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRpZiAocGRmUmVhZHkgPT0gdHJ1ZSkge1xuXHRcdFx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKFxuXHRcdFx0XHQnRG93bmxvYWQgeW91ciBwZGYgPGEgaHJlZj1cImFzc2V0cy9wZGYvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcucGRmP2Rvd25sb2FkPXRydWVcIiB0YXJnZXQ9XCJfYmxhbmtcIj5oZXJlPC9hPiBhbmQgcHJpbnRhYmxlIHBkZiBib29rbGV0IDxhIGhyZWY9XCJhc3NldHMvcGRmLycgK1xuXHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHQnLycgK1xuXHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHQnLWJvb2tsZXQucGRmP2Rvd25sb2FkPXRydWVcIiB0YXJnZXQ9XCJfYmxhbmtcIj5oZXJlPC9hPi4nIC8vIGFkZCBcIm9uIGNsaWNrIGNsb3NlIHNhdmUgbW9kYWxcIlxuXHRcdFx0KTtcblx0XHRcdGNsZWFySW50ZXJ2YWwoeik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vICQoJyNzYXZlLW1vZGFsJykuaHRtbCgnWW91ciBQdWJsaWNhdGlvbiBpcyBiZWluZyBnZW5lcmF0ZWQ8c3BhbiBpZD1cImxvYWRpbmdfZG90c1wiPi4uLjwvc3Bhbj48ZGl2IGlkPVwibG9hZGVyXCI+PGRpdiBpZD1cImxvYWRpbmdiYXJcIj48L2Rpdj48L2Rpdj4nKTtcblx0XHRcdCQoJyNzYXZlLW1vZGFsJykuaHRtbCgnWW91ciBQdWJsaWNhdGlvbiAoPGEgaHJlZj1cImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9wZGY/aWQ9JyArIFB1YmxpY2F0aW9uLmlkICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPmRvd25sb2FkPC9hPikgaXMgYmVpbmcgZ2VuZXJhdGVkPHNwYW4gaWQ9XCJsb2FkaW5nX2RvdHNcIj4uLi48L3NwYW4+PGRpdiBpZD1cInNwaW5uZXJcIj48ZGl2IGlkPVwiYW5pbWF0aW9uXCI+PC9kaXY+PGltZyBzcmM9XCJhc3NldHMvaW1nL3ByaW50ZXIucG5nXCI+PC9kaXY+Jyk7XG5cdFx0fVxuXHR9LCAxMDApO1xufVxuXG4vLyAtLS0gU0FWRURcblxuZnVuY3Rpb24gcmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pIHtcblx0Y2FudmFzZXNbJ3AxJ10uY2xlYXIoKTsgLy8gY2xlYXIgdGl0bGVcblxuXHRmb3IgKHZhciBjYW52YXNJZCBpbiBjYW52YXNlcykge1xuXHRcdHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24ucGFnZXNbY2FudmFzSWRdKTtcblx0XHRjYW52YXNlc1tjYW52YXNJZF0ubG9hZEZyb21KU09OKCBqc29uLCBmdW5jdGlvbigpIHtcblx0XHRcdGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwuYmluZChjYW52YXNlc1tjYW52YXNJZF0pXG5cdFx0XHRsb2NrRWxlbWVudHMoKVxuXHRcdH0pXG5cdH1cblxufVxuXG5mdW5jdGlvbiBwZGZEb3dubG9hZCgpIHtcblx0JCgnI3BkZi1kb3dubG9hZCcpLnNob3coKTtcblx0JCgnI3BkZi1kb3dubG9hZCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdC8vIG1ha2VQZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdGdlblBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Ly8gY2hlY2tQZGYoUHVibGljYXRpb24uaWQpO1xuXHR9KTtcbn1cblxuXG5cblxuXG5cbi8vIC0tLSBCQUNLRU5EXG5cbi8vIHNhdmUgdG8gZGJcbmZ1bmN0aW9uIHNhdmV0b0RiKHB1YmxpY2F0aW9uKSB7XG5cdGZvciAodmFyIHBhZ2UgaW4gUHVibGljYXRpb24ucGFnZXMpIHtcblx0XHRQdWJsaWNhdGlvbi5wYWdlc1twYWdlXSA9IGNhbnZhc2VzW3BhZ2VdLnRvSlNPTigpIC8vIHVwZGF0ZSBhbGwgcGFnZXNcblx0fVxuXHQkLmFqYXgoe1xuXHRcdHVybDogJy9kYicsXG5cdFx0dHlwZTogJ3Bvc3QnLCAvLyBwZXJmb3JtaW5nIGEgUE9TVCByZXF1ZXN0XG5cdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24pLFxuXHRcdGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG5cdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRzdWNjZXNzOiBmdW5jdGlvbihwdWJsaWNhdGlvbikge1xuXHRcdFx0Y29uc29sZS5sb2coJ3B1YmxpY2F0aW9uIHNlbnQgdG8gZGF0YWJhc2UuJyk7XG5cdFx0fVxuXHR9KTtcblx0Y29uc29sZS5sb2coJ3NhdmVkP2lkPScgKyBQdWJsaWNhdGlvbi5pZClcbn1cblxuXG5cblxuXG4vLyAtLS0gSU5URVJGQUNFIEZYXG5cblxuLy8gbW92ZSB0aGVzZSBmdW5jdGlvbnMgdG8gaW50ZXJmYWNlIHBhcnQgb2YganM/XG5mdW5jdGlvbiBhbmltYXRlVXAob2JqKSB7XG4gIG9iai5zaG93KCk7XG4gIG9iai5jc3MoJ21hcmdpbi10b3AnLCAnMjBweCcpO1xuICBvYmouYW5pbWF0ZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgbWFyZ2luVG9wOiBcIjBweFwiLFxuICAgIH0sIDMwMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICB9KTtcbn07XG5cbmZ1bmN0aW9uIGFuaW1hdGVVcE91dChvYmosIHRpbWUpIHtcbiAgb2JqLnNob3coKTtcbiAgb2JqLmNzcygnbWFyZ2luLXRvcCcsICcyMHB4Jyk7XG4gIG9iai5hbmltYXRlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICBtYXJnaW5Ub3A6IFwiMHB4XCIsXG4gICAgfSwgdGltZS8yLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cbiAgfSk7XG4gIG9iai5hbmltYXRlKHtcbiAgICAgIG9wYWNpdHk6IDAsXG4gICAgICBtYXJnaW5Ub3A6IFwiMjBweFwiLFxuICAgIH0sIHRpbWUvMiwgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG4gIH0pO1xufTtcblxuZnVuY3Rpb24gc2hha2Uob2JqLCB0aW1lKSB7XG4gIGlmICghdGltZSkgKFxuICAgIHRpbWUgPSA1MDBcbiAgKVxuICBvYmouYWRkQ2xhc3MoICdzaGFrZSBzaGFrZS1jb25zdGFudCcgKVxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgb2JqLnJlbW92ZUNsYXNzKCAnc2hha2Ugc2hha2UtY29uc3RhbnQnIClcbiAgfSwgdGltZSk7XG59XG5cblxuXG5cblxuXG4vLyAtLS0gRElTUlVQVElPTlNcblxuZnVuY3Rpb24gcm90YXRlT25lKG9iaikge1xuICBvYmoub3JpZ2luWCA9ICdjZW50ZXInXG4gIG9iai5vcmlnaW5ZID0gJ2NlbnRlcidcbiAgb2JqLnJvdGF0ZSgwKS5hbmltYXRlKHsgYW5nbGU6IDM2MCB9LCB7XG4gICAgZHVyYXRpb246IDMwMDAsXG4gICAgb25DaGFuZ2U6IG9iai5jYW52YXMucmVuZGVyQWxsLmJpbmQob2JqLmNhbnZhcyksXG4gICAgb25Db21wbGV0ZTogZnVuY3Rpb24oKXsgcm90YXRlT25lKG9iaikgfSxcbiAgICBlYXNpbmc6IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHsgcmV0dXJuIGMqdC9kICsgYiB9XG4gIH0pXG59XG5cbnZhciBEaXNydXB0aW9uID0ge1xuXHRjb21pYzogZnVuY3Rpb24oKSB7XG5cdFx0Zm9yIChjYW52YXNJZCBpbiBjYW52YXNlcykge1xuXHRcdFx0dGV4dHMgPSBjYW52YXNlc1tjYW52YXNJZF0uZ2V0T2JqZWN0cygndGV4dCcpXG5cdCAgICBmb3IgKHRleHQgaW4gdGV4dHMpIHtcblx0ICAgICAgdGV4dHNbdGV4dF0uZm9udEZhbWlseSA9ICdcIkNvbWljIFNhbnMgTVNcIidcblx0ICAgIH1cblx0ICAgXHR0ZXh0Ym94ZXMgPSBjYW52YXNlc1tjYW52YXNJZF0uZ2V0T2JqZWN0cygndGV4dGJveCcpXG5cdCAgICBmb3IgKHRleHRib3ggaW4gdGV4dGJveGVzKSB7XG5cdCAgICAgIHRleHRib3hlc1t0ZXh0Ym94XS5mb250RmFtaWx5ID0gJ1wiQ29taWMgU2FucyBNU1wiJ1xuXHQgICAgfVxuICAgICAgc2hha2UoJCgnLnBhZ2UnKSlcblx0ICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwoKTtcbiAgICB9XG4gICAgY3JpdGljU2F5cygnVGhlIGNvbW1pc3Npb25lciBhc2tlZCB0byBzcGljZSB0aGUgdHlwb2dyYXBoeSBhIGJpdCEnLCAnR3V0ZW5iZXJnJylcblx0fSxcblx0cm90YXRlOiBmdW5jdGlvbigpIHtcblx0XHRmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG5cdFx0XHRpbWdzID0gY2FudmFzZXNbY2FudmFzSWRdLmdldE9iamVjdHMoJ2ltYWdlJylcblx0ICAgIGZvciAoaW1nIGluIGltZ3MpIHtcblx0ICAgICAgcm90YXRlT25lKGltZ3NbaW1nXSlcblx0ICAgIH1cbiAgICB9XG4gICAgc2hha2UoJCgnLnBhZ2UnKSlcbiAgICBjb25zb2xlLmxvZygnWW91ciBmcmllbmQgdGhpbmsgdGhlIGxheW91dCBpcyBhIGJpdCBzdGF0aWMuLi4nKVxuXHR9LFxuXHRsb2NrUmFuZFBhZ2U6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FudmFzZXMpXG4gICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cblx0XHRyYW5kQ2FudmFzLmJhY2tncm91bmRDb2xvciA9ICdyZWQnXG5cdFx0cmFuZENhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZTtcblx0XHRmb3IgKG9iamVjdElkIGluIHJhbmRDYW52YXMuZ2V0T2JqZWN0cygpICkge1xuXHRcdFx0dmFyIG9iamVjdCA9IHJhbmRDYW52YXMuaXRlbShvYmplY3RJZClcblx0XHRcdG9iamVjdC5zZWxlY3RhYmxlID0gZmFsc2Vcblx0XHRcdG9iamVjdC5ob3ZlckN1cnNvciA9ICdkZWZhdWx0J1xuXHRcdH1cblx0XHRyYW5kQ2FudmFzLmFkZChuZXcgZmFicmljLkxpbmUoWzAsIDAsIHJhbmRDYW52YXMud2lkdGgsIHJhbmRDYW52YXMuaGVpZ2h0XSwge1xuXHQgIFx0c3Ryb2tlOiAnI2ZmZicsXG5cdCAgXHRzZWxlY3RhYmxlOiBmYWxzZSxcblx0ICBcdHN0cm9rZVdpZHRoOiA0XG5cdFx0fSkpXG4gICAgcmFuZENhbnZhcy5hZGQobmV3IGZhYnJpYy5MaW5lKFswLCByYW5kQ2FudmFzLmhlaWdodCwgcmFuZENhbnZhcy53aWR0aCwgMF0sIHtcbiAgICAgIHN0cm9rZTogJyNmZmYnLFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBzdHJva2VXaWR0aDogNFxuICAgIH0pKVxuICAgIHNoYWtlKCQoJy5wYWdlJykpXG5cdFx0cmFuZENhbnZhcy5yZW5kZXJBbGwoKTtcblx0XHQvLyBUT0RPOiBwcmV2ZW50IGRyb3BcbiAgICBjcml0aWNTYXlzKCdQYWdlID8/IGlzIG5vdyBsb2NrZWQuLi4nLCAnR3V0ZW5iZXJnJykgLy8gVE9ET1xuXHR9LFxuICBzaHVmZmxlUGFnZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0b1NodWZmbGUgPSBbXVxuICAgIHZhciBpID0gMFxuICAgIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmIChpID4gMCkgeyAvLyBwcmV2ZW50IHNodWZmbGluZyBmaXJzdCBwYWdlXG4gICAgICAgIHRvU2h1ZmZsZS5wdXNoKCBjYW52YXNlc1tjYW52YXNJZF0udG9KU09OKCkgKVxuICAgICAgfVxuICAgICAgaSArPSAxXG4gICAgfVxuICAgIHNodWZmbGVBcnJheSh0b1NodWZmbGUpXG4gICAgdmFyIHkgPSAwXG4gICAgZm9yIChjYW52YXNJZCBpbiBjYW52YXNlcykge1xuICAgICAgaWYgKHkgPiAwKSB7XG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5sb2FkRnJvbUpTT04odG9TaHVmZmxlW3kgLSAxXSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbC5iaW5kKGNhbnZhc2VzW2NhbnZhc0lkXSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHkgKz0gMVxuICAgIH1cbiAgICBzaGFrZSgkKCcucGFnZScpKVxuICAgIGNyaXRpY1NheXMoJ1RoZSByeXRobSBvZiB0aGlzIHB1YmxpY2F0aW9uIGlzIGEgYml0IHdlYWsuIERvblxcJ3QgeW91IHRoaW5rPycsICdHdXRlbmJlcmcnKVxuICB9LFxuXHRhZHM6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FudmFzZXMpXG4gICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cblx0XHRyYW5kQ2FudmFzLmFkZChuZXcgZmFicmljLlJlY3Qoe1xuXHRcdFx0d2lkdGg6IHJhbmRDYW52YXMud2lkdGgsXG5cdFx0XHRoZWlnaHQ6IDMwLFxuXHRcdFx0ZmlsbDogJyMwRDIxM0UnLFxuXHRcdFx0bG9ja01vdmVtZW50WDogdHJ1ZSxcblx0XHRcdGxvY2tNb3ZlbWVudFk6IHRydWUsXG5cdFx0XHRsb2NrUm90YXRpb246IHRydWUsXG5cdFx0XHRoYXNDb250cm9sczogZmFsc2UsXG5cdFx0XHRsZWZ0OiByYW5kQ2FudmFzLndpZHRoLzIsXG5cdFx0XHR0b3A6IDE1XG5cdFx0fSkpO1xuXHRcdGZhYnJpYy5JbWFnZS5mcm9tVVJMKCcvYXNzZXRzL2ltZy9raW5rby5wbmcnLCBmdW5jdGlvbihpbWcpe1xuXHRcdFx0XHRpbWcuaGFzQm9yZGVycyA9IGZhbHNlO1xuXHRcdFx0XHRpbWcuaGFzQ29udHJvbHMgPSBmYWxzZTtcblx0XHRcdFx0aW1nLnNjYWxlKDAuMik7XG5cdFx0XHRcdGltZy5sZWZ0ID0gcmFuZENhbnZhcy53aWR0aC0xMDA7XG5cdFx0XHRcdGltZy50b3AgPSA1MDtcblx0XHRcdFx0aW1nLmxvY2tNb3ZlbWVudFggPSB0cnVlO1xuXHRcdFx0XHRpbWcubG9ja01vdmVtZW50WSA9IHRydWU7XG5cdFx0XHRcdGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuXHRcdFx0XHRpbWcuc2V0Q29udHJvbHNWaXNpYmlsaXR5ID0gZmFsc2U7XG5cdFx0XHRcdHJhbmRDYW52YXMuaW5zZXJ0QXQoaW1nLDMpO1xuXHRcdFx0XHQvLyBUT0RPOiBpdCBvbmx5IHdvcmtzIHdpdGggb25lIGltYWdlIGZvciBzb21lIHJlYXNvbi4gcnVubmluZyB0aGUgZnVuY3Rpb24gbXVsdGlwbGUgdGltZXMgaXQgYWRkcyBtb3JlIHRvcCBiYXJzIGJ1dCBqdXN0IG1vdmVzIGFsbCB0aGUgaW1hZ2VzIHRvIHRoZSBzYW1lIHBsYWNlXG5cdFx0fSk7XG5cdH1cbn07XG5cbiQod2luZG93KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKCdyZWFkeScpO1xuICBEaXNydXB0aW9uLmFkcygpXG59KVxuIl0sImZpbGUiOiJtYWluLmpzIn0=
