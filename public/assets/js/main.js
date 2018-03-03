// --- OPTIONS

var disruptionsOn = false
var dropDelay = 100
var disruptionInterval = 5000
var bonusTime = 1000
var textChunksLength = 1500
var fontSize = 15
var scaleFont = 1.5
var scaleImgs = 0.7





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
  function chunkString(str, length) {
    return str.match(new RegExp('{.1,' + length + '}', 'g'));
  }
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
    chunks = deBasedText.match(new RegExp('(.|[\r\n]){1,' + textChunksLength + '}', 'g'))
    var currPage = parseInt( element.page.substr(element.page.length - 1) )
    for (var i = 0; i < chunks.length; i++) {
      if (canvases['p' + (currPage + i)]) {
        canvases['p' + (currPage + i)].add(new fabric.Textbox(chunks[i] + '-', {
          fontFamily: 'Arial',
          left: 20,
          top: 20,
          fontSize: fontSize,
          width: 410,
          breakWords: true,
          originX: 'left',
          originY: 'top'
        }))
      }
    }
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
					addtime(bonusTime) // add bonus time
					criticSays()


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
        shake(pages)
      }, disruptionInterval)
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

const pages = $('.page')
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

// changing title // TODO Update
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

// TODO: merge these two
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


function allElements(type) {
  var objs = []
  for (canvas in canvases) {
    canvasObjs = canvases[canvas].getObjects(type)
    for (var i = canvasObjs.length - 1; i >= 0; i--) {
      objs.push( canvasObjs[i] )
    }
  }
  return objs
}

function renderAllCanvases() {
  for (canvasId in canvases) {
    canvases[canvasId].renderAll()
  }
}



function filterImgs(objs, filter) {
  for (var i = objs.length - 1; i >= 0; i--) {
    objs[i].filters.push(filter)
    objs[i].applyFilters()
  }
  renderAllCanvases()
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
    criticSays('The commissioner asked to spice the typography a bit!', 'Gutenberg')
	},
	rotateImgsNostop: function() {
    function _rotateImgsNostop(objs) {
      for (var i = objs.length - 1; i >= 0; i--) {
        objs[i].originX = 'center'
        objs[i].originY = 'center'
        objs[i].rotate(0).animate({ angle: 360 }, {
          duration: 3000,
          onChange: objs[i].canvas.renderAll.bind(objs[i].canvas),
          onComplete: function(){ rotateOne(objs[i]) },
          easing: function(t, b, c, d) { return c*t/d + b }
        })
      }
    }
    _rotateImgsNostop(allElements('image'))
    console.log('Your friend think the layout is a bit static...')
	},
	lockRandPage: function() {
    var keys = Object.keys(canvases)
    randCanvas = canvases[keys[ keys.length * Math.random() << 0]]
		randCanvas.selection = false;
		for (objectId in randCanvas.getObjects() ) {
			var object = randCanvas.item(objectId)
			object.selectable = false
			object.hoverCursor = 'default'
		}
		randCanvas.add(new fabric.Line([0, 0, randCanvas.width, randCanvas.height], {
	  	stroke: 'red',
	  	selectable: false,
	  	strokeWidth: 2
		}))
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
			top: 15,
      selectable: false
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

    // insert critic
	},
  halfTime: function () {
    Publication.timeLeft = Publication.timeLeft / 2
    criticSays('This is taking too long...', 'Gutenberg')
  },
  doubleTime: function () {
    Publication.timeLeft = Publication.timeLeft * 2
    criticSays('Take your time...', 'Gutenberg')
  },
  greyscaleImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Grayscale() )
    criticSays('Shall we make it look classic?', 'Gutenberg')
  },
  invertImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Invert() )
    criticSays('The visuals need some edgy colors', 'Gutenberg')
  },
  sepiaImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Sepia() )
    criticSays('Ever heard of Instagram?', 'Gutenberg')
  },
  blackwhiteImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.BlackWhite() )
    criticSays('This should look like a zine!', 'Gutenberg')
  },
  pixelateImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Pixelate({blocksize: 20}) )
    criticSays('Isn\'t this a videogame after all?', 'Gutenberg')
  },
  noiseImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Noise({noise: 200}) )
    criticSays('MAKE SOME NOOISE!!', 'Gutenberg')
  },
  fontSizeBigger: function() {
    function _fontSizeBigger(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set('fontSize', elements[i].fontSize * scaleFont);
      }
    }
    _fontSizeBigger(allElements('textbox'))
    renderAllCanvases()
    criticSays('Can\'t read anything :(', 'Gutenberg')
  },
  fontSizeSmaller: function() {
    function _fontSizeBigger(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set('fontSize', elements[i].fontSize / scaleFont);
      }
    }
    _fontSizeBigger(allElements('textbox'))
    renderAllCanvases()
    criticSays('I\'m not blind!', 'Gutenberg')
  },
  biggerImgs: function() {
    function _biggerImgs(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set({
          scaleY: scaleImgs,
          scaleX: scaleImgs
        });
      }
    }
    _biggerImgs(allElements('image'))
    renderAllCanvases()
  }
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBPUFRJT05TXG5cbnZhciBkaXNydXB0aW9uc09uID0gZmFsc2VcbnZhciBkcm9wRGVsYXkgPSAxMDBcbnZhciBkaXNydXB0aW9uSW50ZXJ2YWwgPSA1MDAwXG52YXIgYm9udXNUaW1lID0gMTAwMFxudmFyIHRleHRDaHVua3NMZW5ndGggPSAxNTAwXG52YXIgZm9udFNpemUgPSAxNVxudmFyIHNjYWxlRm9udCA9IDEuNVxudmFyIHNjYWxlSW1ncyA9IDAuN1xuXG5cblxuXG5cbi8vIC0tLSBHRU5FUkFMIEZVTkNUSU9OU1xuXG5mdW5jdGlvbiBtYWtlSWQoKSB7XG5cdHZhciByYW5kTGV0dGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI2KSk7XG5cdHZhciBpZCA9IHJhbmRMZXR0ZXIgKyBEYXRlLm5vdygpO1xuXHRyZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIGJ5dGVDb3VudChzKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSShzKS5zcGxpdCgvJS4ufC4vKS5sZW5ndGggLSAxO1xufVxuXG52YXIgZ2V0VXJsUGFyYW1ldGVyID0gZnVuY3Rpb24gZ2V0VXJsUGFyYW1ldGVyKHNQYXJhbSkge1xuICB2YXIgc1BhZ2VVUkwgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpLFxuICAgIHNVUkxWYXJpYWJsZXMgPSBzUGFnZVVSTC5zcGxpdCgnJicpLFxuICAgIHNQYXJhbWV0ZXJOYW1lLFxuICAgIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IHNVUkxWYXJpYWJsZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzUGFyYW1ldGVyTmFtZSA9IHNVUkxWYXJpYWJsZXNbaV0uc3BsaXQoJz0nKTtcblxuICAgIGlmIChzUGFyYW1ldGVyTmFtZVswXSA9PT0gc1BhcmFtKSB7XG4gICAgICAgIHJldHVybiBzUGFyYW1ldGVyTmFtZVsxXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHNQYXJhbWV0ZXJOYW1lWzFdO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaHVmZmxlQXJyYXkoYXJyYXkpIHtcbiAgZm9yICh2YXIgaSA9IGFycmF5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICB2YXIgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgIHZhciB0ZW1wID0gYXJyYXlbaV07XG4gICAgYXJyYXlbaV0gPSBhcnJheVtqXTtcbiAgICBhcnJheVtqXSA9IHRlbXA7XG4gIH1cbn1cblxuXG5cblxuXG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MsIGNhbGxiYWNrKSB7XG4gIGZ1bmN0aW9uIGNodW5rU3RyaW5nKHN0ciwgbGVuZ3RoKSB7XG4gICAgcmV0dXJuIHN0ci5tYXRjaChuZXcgUmVnRXhwKCd7LjEsJyArIGxlbmd0aCArICd9JywgJ2cnKSk7XG4gIH1cblx0dmFyIHRoZU1vdXNlUG9zID0gbW91c2VQb3Ncblx0aWYgKGVsZW1lbnQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpKSB7XG5cdFx0ZmFicmljLkltYWdlLmZyb21VUkwoZWxlbWVudC5kYXRhLCBmdW5jdGlvbihteUltZywgY2FsbGJhY2spIHtcbiBcdFx0XHR2YXIgaW1nID0gbXlJbWcuc2V0KHsgbGVmdDogMCwgdG9wOiAwLCB3aWR0aDogbXlJbWcud2lkdGgsIGhlaWdodDogbXlJbWcuaGVpZ2h0fSk7XG4gXHRcdFx0aWYgKCBpbWcud2lkdGggPiBjYW52YXNlc1tlbGVtZW50LnBhZ2VdLndpZHRoICkge1xuIFx0XHRcdFx0aW1nLnNjYWxlVG9XaWR0aChjYW52YXNlc1tlbGVtZW50LnBhZ2VdLndpZHRoIC8gMTAwICogNTAgKTsgLy8gNTAlIG9mIHRoZSBjYW52YXNcbiBcdFx0XHR9XG4gXHRcdFx0aW1nLmxlZnQgPSB0aGVNb3VzZVBvcy54XG4gXHRcdFx0aW1nLnRvcCA9IHRoZU1vdXNlUG9zLnlcbiBcdFx0XHRpbWcub24oJ2FkZGVkJywgZnVuY3Rpb24oKSB7XG4gXHRcdFx0XHRjYWxsYmFjaztcbiBcdFx0XHR9KTtcbiBcdFx0XHRjYW52YXNlc1tlbGVtZW50LnBhZ2VdLmFkZChpbWcpXG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGRlQmFzZWRUZXh0ID0gYXRvYihlbGVtZW50LmRhdGEuc3Vic3RyaW5nKDIzKSk7XG4gICAgY2h1bmtzID0gZGVCYXNlZFRleHQubWF0Y2gobmV3IFJlZ0V4cCgnKC58W1xcclxcbl0pezEsJyArIHRleHRDaHVua3NMZW5ndGggKyAnfScsICdnJykpXG4gICAgdmFyIGN1cnJQYWdlID0gcGFyc2VJbnQoIGVsZW1lbnQucGFnZS5zdWJzdHIoZWxlbWVudC5wYWdlLmxlbmd0aCAtIDEpIClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGNhbnZhc2VzWydwJyArIChjdXJyUGFnZSArIGkpXSkge1xuICAgICAgICBjYW52YXNlc1sncCcgKyAoY3VyclBhZ2UgKyBpKV0uYWRkKG5ldyBmYWJyaWMuVGV4dGJveChjaHVua3NbaV0gKyAnLScsIHtcbiAgICAgICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgICAgICAgIGxlZnQ6IDIwLFxuICAgICAgICAgIHRvcDogMjAsXG4gICAgICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgICAgIHdpZHRoOiA0MTAsXG4gICAgICAgICAgYnJlYWtXb3JkczogdHJ1ZSxcbiAgICAgICAgICBvcmlnaW5YOiAnbGVmdCcsXG4gICAgICAgICAgb3JpZ2luWTogJ3RvcCdcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfVxuXHRcdGNhbGxiYWNrO1xuXHR9XG59XG5cblxuLy8gLS0tIGluaXRpYWxpemUgY2FudmFzZXNcbnZhciBjYW52YXNlcyA9IHt9XG5mdW5jdGlvbiBpbml0Q2FudmFzZXMoKSB7XG5cdCQoJ2NhbnZhcycpLmVhY2goZnVuY3Rpb24oaSkge1xuXHRcdGNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKHRoaXMpO1xuXHQgIGNhbnZhcy5zZXRXaWR0aCggJCh0aGlzKS5jbG9zZXN0KCcucGFnZScpLndpZHRoKCkgKTtcblx0XHRjYW52YXMuc2V0SGVpZ2h0KCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykuaGVpZ2h0KCkgKTtcblx0XHRjYW52YXNlc1sncCcgKyAoaSArIDEpXSA9IGNhbnZhcztcblx0fSk7XG5cdGZhYnJpYy5PYmplY3QucHJvdG90eXBlLm9yaWdpblggPSBmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5vcmlnaW5ZID0gJ2NlbnRlcicgLy8gb3JpZ2luIGF0IHRoZSBjZW50ZXJcblx0dmFyIGluc2VydFRpdGxlID0gbmV3IGZhYnJpYy5UZXh0Ym94KCdJbnNlcnQgVGl0bGUgSGVyZScsIHtcblx0ICB0b3A6IDEyMCxcblx0ICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvLCBzZXJpZicsXG5cdCAgZmlsbDogJyM3NzcnLFxuXHQgIGxpbmVIZWlnaHQ6IDEuMSxcblx0ICBmb250U2l6ZTogMzAsXG5cdCAgZm9udFdlaWdodDogJ2JvbGQnLFxuXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG5cdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG5cdCAgb3JpZ2luWDogJ2xlZnQnLFxuXHQgIG9yaWdpblk6ICd0b3AnXG5cdH0pO1xuXHRjYW52YXNlc1sncDEnXS5hZGQoaW5zZXJ0VGl0bGUpXG5cdHZhciBsaW5lTGVuZ2h0ID0gMjUwXG5cdGNhbnZhc2VzWydwMSddLmFkZChuZXcgZmFicmljLkxpbmUoWzAsIDAsIGxpbmVMZW5naHQsIDBdLCB7XG5cdFx0bGVmdDogKCBjYW52YXNlc1sncDEnXS53aWR0aCAtIGxpbmVMZW5naHQpIC8gMixcblx0ICB0b3A6IDE2MCxcblx0ICBzdHJva2U6ICcjMjIyJyxcblx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcblx0IFx0b3JpZ2luWDogJ2xlZnQnLFxuXHQgIG9yaWdpblk6ICd0b3AnXG5cdH0pKTtcblx0dmFyIGluc2VydEF1dGhvcnMgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBBdXRob3JzIEhlcmUnLCB7XG5cdCAgdG9wOiAxODAsXG5cdCAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybywgc2VyaWYnLFxuXHQgIGZpbGw6ICcjNzc3Jyxcblx0ICBsaW5lSGVpZ2h0OiAxLjEsXG5cdCAgZm9udFNpemU6IDIwLFxuXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG5cdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG5cdCAgb3JpZ2luWDogJ2xlZnQnLFxuXHQgIG9yaWdpblk6ICd0b3AnXG5cdH0pO1xuXHRjYW52YXNlc1sncDEnXS5hZGQoaW5zZXJ0QXV0aG9ycylcblx0Ly8gVE9ETzogb24gY2xpY2ssIHRleHQgaXMgZGVsZXRlZFxufVxuXG5cblxuXG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG5cdC8vIGFsbCBvdXIgc3RhdGVzXG5cdGlkOiBtYWtlSWQoKSxcblx0dGl0bGU6ICdURVNUIFBVQicsXG5cdHRpbWVMZWZ0OiA5MDAwMDAwLFxuXHRleHBpcmVkOiBmYWxzZSxcblx0YXV0aG9yczogW10sXG5cdHBhZ2VzOiB7XG5cdFx0cDE6IHt9LFxuXHRcdHAyOiB7fSxcblx0XHRwMzoge30sXG5cdFx0cDQ6IHt9LFxuXHRcdHA1OiB7fSxcblx0XHRwNjoge30sXG5cdFx0cDc6IHt9LFxuXHRcdHA4OiB7fVxuXHR9XG59O1xuXG5mdW5jdGlvbiBjb250cm9sbGVyKFB1YmxpY2F0aW9uLCBpbnB1dCkge1xuXHRpZiAoUHVibGljYXRpb24udGltZUxlZnQgPiAwKSB7IC8vIG5vdCBleHBpcmVkXG5cdFx0c2hvd1RpbWUoUHVibGljYXRpb24pOyAvLyBleHBpcmVkXG5cdH0gZWxzZSB7XG5cdFx0UHVibGljYXRpb24uZXhwaXJlZCA9IHRydWU7XG5cdFx0c2hvd0V4cGlyZWQoUHVibGljYXRpb24pO1xuXHRcdGxvY2tFbGVtZW50cygpXG5cdFx0Ly8gc2hvd1NhdmVNb2RhbCgpO1xuXHR9XG5cblx0aWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gZmFsc2UpIHtcblx0XHRjb25zb2xlLmxvZyhpbnB1dClcblx0XHRzd2l0Y2ggKHRydWUpIHtcblx0XHRcdGNhc2UgaW5wdXQudmlzaWJsZSA9PSBmYWxzZTogLy8gZGVsZXRpbmcgYW4gZWxlbWVudFxuXHRcdFx0XHRcdHJlbW92ZUVsZW1lbnQoaW5wdXQuaWQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRieXRlQ291bnQoaW5wdXQuZGF0YSkgPiAxMzk4MTE3IDogLy8gZmlsZSB0b28gYmlnICgxbWIpXG5cdFx0XHRcdCBcdEVycm9yLnRvb0JpZygpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0aW5wdXQudmlzaWJsZSA9PSB0cnVlOiAvLyBuZXcgaW1hZ2VcblxuXHRcdFx0XHRcdHZhciBwdWJsaWNhdGlvblVwZGF0ZSA9IGZ1bmN0aW9uKGlucHV0UGFnZSkgeyAvLyB1cGRhdGUgY2FudmFzXG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dFBhZ2VdID0gY2FudmFzZXNbaW5wdXRQYWdlXS50b0pTT04oKSAvLyBzZXR0aW1lb3V0IG90aGVyd2lzZSBpdCBkb2Vzbid0IGdldCB0aGUgZWxlbWVudFxuXHRcdFx0XHRcdFx0fSwgMSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQubW91c2VQb3MsIHB1YmxpY2F0aW9uVXBkYXRlKGlucHV0LnBhZ2UpKTsgLy8gZHJvcCBlbGVtZW50XG5cdFx0XHRcdFx0YWRkdGltZShib251c1RpbWUpIC8vIGFkZCBib251cyB0aW1lXG5cdFx0XHRcdFx0Y3JpdGljU2F5cygpXG5cblxuXHRcdFx0XHRcdC8vIGNyaXRpY1NheXMoJ2RhbmNlIGRhbmNlJywgJ2NhdCcpO1xuXHRcdFx0XHRcdC8vIG9yXG5cdFx0XHRcdFx0Ly8gY3JpdGljU2F5cygnZGFuY2UgZGFuY2UnKTtcblx0XHRcdFx0XHQvLyBvclxuXHRcdFx0XHRcdC8vIGNyaXRpY1NheXMoKTtcblxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyB0ZXh0XG5cblx0XHRcdFx0XHR2YXIgcHVibGljYXRpb25VcGRhdGUgPSBmdW5jdGlvbihpbnB1dFBhZ2UpIHsgLy8gdXBkYXRlIGNhbnZhc1xuXHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXRQYWdlXSA9IGNhbnZhc2VzW2lucHV0UGFnZV0udG9KU09OKCkgLy8gc2V0dGltZW91dCBvdGhlcndpc2UgaXQgZG9lc24ndCBnZXQgdGhlIGVsZW1lbnRcblx0XHRcdFx0XHRcdH0sIDEpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zLCBwdWJsaWNhdGlvblVwZGF0ZShpbnB1dC5wYWdlKSk7IC8vIGRyb3AgZWxlbWVudFxuXHRcdFx0XHRcdGFkZHRpbWUoMTAwMCkgLy8gYWRkIGJvbnVzIHRpbWVcblxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJyk6IC8vIG5laXRoZXIgYW4gaW1hZ2Ugbm9yIHRleHRcblx0XHRcdFx0XHRFcnJvci5ub3RBbGxvd2VkKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5tb3ZlID09IHRydWUgOiAvLyBtb3Zpbmcgb3Igc2NhbGluZyBhbiBpbWFnZVxuXHRcdFx0XHRcdFB1YmxpY2F0aW9uLnBhZ2VzW2lucHV0LnBhZ2VdID0gY2FudmFzZXNbaW5wdXQucGFnZV0udG9KU09OKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5oYXNPd25Qcm9wZXJ0eSgndGl0bGUnKSA6IC8vIGNoYW5naW5nIHRpdGxlXG5cdFx0XHRcdFx0UHVibGljYXRpb24udGl0bGUgPSBpbnB1dC50aXRsZTtcblx0XHR9XG5cdH0gZWxzZSBpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSB0cnVlKSB7XG5cdFx0Ly8gdG9vIGxhdGVcblx0XHRFcnJvci50b29MYXRlKCk7XG5cdH1cbn1cblxuXG5cblxuXG4vLyAtLS0gQ09OVFJPTExFUlxuXG52YXIgeDtcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHRpbml0Q2FudmFzZXMoKVxuXHRvbk1vZEVsZW1lbnQoKVxuXHRpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA8IDApIHtcblx0XHQvLyBpZiBub3QgYSBzYXZlZCBwdWJsaWNhdGlvblxuXHRcdGlmICggZ2V0VXJsUGFyYW1ldGVyKCd0aW1lJykgKSB7IC8vIGRpZmZpY3VsdHlcblx0XHRcdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gZ2V0VXJsUGFyYW1ldGVyKCd0aW1lJyk7XG5cdFx0fVxuXHRcdHggPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgLSAxMDtcblx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24pO1xuXHRcdH0sIDEwKVxuICAgIGlmIChkaXNydXB0aW9uc09uID09IHRydWUpIHtcbiAgICAgIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHsgLy8gbGF1bmNoIGEgcmFuZG9tIGRpc3J1cHRpb25cbiAgICAgICAgZGlzcnVwdGlvbnMgPSBPYmplY3Qua2V5cyhEaXNydXB0aW9uKVxuICAgICAgICBEaXNydXB0aW9uW2Rpc3J1cHRpb25zWyBkaXNydXB0aW9ucy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXSgpXG4gICAgICAgIHNoYWtlKHBhZ2VzKVxuICAgICAgfSwgZGlzcnVwdGlvbkludGVydmFsKVxuICAgIH1cblx0XHRtb3VzZUNvdW50ZXIoKVxuXHR9IGVsc2UgeyAvLyBzYXZlZCBwdWJsaWNhdGlvblxuXHRcdHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKVxuXHRcdHBkZkRvd25sb2FkKClcblx0XHQkKCdib2R5JykuYWRkQ2xhc3MoJ3NhdmVkJylcblx0fVxufSk7XG5cbmZ1bmN0aW9uIGFkZHRpbWUoYm9udXNUaW1lKSB7XG5cdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgKyBib251c1RpbWU7XG5cdGFuaW1hdGV0aW1lY291bnRlcihib251c1RpbWUpO1xufVxuXG4vLyBtb2RpZnkgZWxlbWVudCBsaXN0ZW5lclxuZnVuY3Rpb24gb25Nb2RFbGVtZW50KCkge1xuXHRmb3IgKHZhciBwYWdlSWQgaW4gY2FudmFzZXMpIHtcblx0XHRjYW52YXNlc1sgcGFnZUlkIF0ub24oJ29iamVjdDptb2RpZmllZCcsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0dmFyIHBhcmVudENhbnZhc0lkID0gZXZ0LnRhcmdldC5jYW52YXMubG93ZXJDYW52YXNFbC5pZFxuXHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyBtb3ZlOiB0cnVlLCBwYWdlOiBwYXJlbnRDYW52YXNJZH0pXG5cdFx0fSlcblx0fVxufVxuXG4vLyBnZXQgbW91c2UgcG9zaXRpb24gb24gY2FudmFzXG5mdW5jdGlvbiBnZXRNb3VzZVBvcyhjYW52YXMsIGUpIHtcbiAgdmFyIHBvaW50ZXIgPSBjYW52YXMuZ2V0UG9pbnRlcihldmVudCwgZSlcbiAgdmFyIHBvc1ggPSBwb2ludGVyLnhcbiAgdmFyIHBvc1kgPSBwb2ludGVyLnlcbiAgcmV0dXJuIHtcbiAgICB4OiBwb3NYLFxuICAgIHk6IHBvc1lcbiAgfVxufVxuXG5jb25zdCBwYWdlcyA9ICQoJy5wYWdlJylcbi8vIGRyb3AgZWxlbWVudFxucGFnZXMub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbnBhZ2VzLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xucGFnZXMub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0Y29uc29sZS5sb2coZSk7XG5cdHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdHZhciB5ID0gMDtcblx0Zm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0cmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHR2YXIgcGFnZUlkID0gJCh0aGlzKS5maW5kKCdjYW52YXMnKS5hdHRyKCdpZCcpO1xuXHRcdG1vdXNlUG9zID0gZ2V0TW91c2VQb3MoY2FudmFzZXNbcGFnZUlkXSwgZSlcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0XHRcdFx0ZGF0YTogZXZlbnQudGFyZ2V0LnJlc3VsdCxcblx0XHRcdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHBhZ2U6IHBhZ2VJZCxcblx0XHRcdFx0XHRtb3VzZVBvczogbW91c2VQb3Ncblx0XHRcdFx0fSk7XG5cdFx0XHR9LCB5ICogZHJvcERlbGF5KTtcblx0XHRcdHkgKz0gMTtcblx0XHR9O1xuXHRcdGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcblx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0U291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudCAoVE9ETzogVVBEQVRFIEZPUiBGQUJSSUMpXG4kKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNsb3NlJywgZnVuY3Rpb24oKSB7XG5cdHZhciBwYWdlSWQgPSAkKHRoaXMpXG5cdFx0LmNsb3Nlc3QoJy5wYWdlJylcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnRJZCA9ICQodGhpcylcblx0XHQucGFyZW50KClcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnREYXRhID0gJCh0aGlzKVxuXHRcdC5zaWJsaW5ncygpXG5cdFx0LmF0dHIoJ3NyYycpO1xuXHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0aWQ6IGVsZW1lbnRJZCxcblx0XHRkYXRhOiBlbGVtZW50RGF0YSxcblx0XHRwb3M6IFswLCAwLCAwLCAwLCAwXSxcblx0XHR2aXNpYmxlOiBmYWxzZSxcblx0XHRwYWdlOiBwYWdlSWRcblx0fSk7XG59KTtcblxuLy8gY2hhbmdpbmcgdGl0bGUgLy8gVE9ETyBVcGRhdGVcbiQoJyN0aXRsZScpLmNoYW5nZShmdW5jdGlvbigpIHtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdHRpdGxlOiAkKHRoaXMpLnZhbCgpXG5cdH0pO1xufSlcblxuXG5cblxuXG5cbi8vIC0tLSBWSUVXXG5cbnZhciBTb3VuZCA9IHtcblx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2luY29ycmVjdC5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH0sXG5cdGRpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9XG59O1xuXG4vLyBUT0RPOiBtZXJnZSB0aGVzZSB0d29cbmZ1bmN0aW9uIHNob3dUaW1lKFB1YmxpY2F0aW9uKSB7XG5cdHNlY29uZHMgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDEwMDA7XG5cdCQoJyNjb3VudGVyJykuc2hvdygpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLmlubmVySFRNTCA9XG5cdFx0c2Vjb25kcy50b0ZpeGVkKDIpICsgJyBzZWNvbmRzIGxlZnQhJztcbn1cbmZ1bmN0aW9uIG1vdXNlQ291bnRlcigpIHtcblx0JChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXHRcdGlmIChlLnBhZ2VYID49ICQoZG9jdW1lbnQpLndpZHRoKCkgLyAyKSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCArIDIwLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID0gJ2V4cGlyZWQhJztcblx0JCgnYm9keScpLmFkZENsYXNzKCdleHBpcmVkJyk7XG5cblx0ZXhwaXJlZFRpbWUoKTtcblx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0JCgnLndyYXBwZXInKS5hZGRDbGFzcygnc2F2ZWRfdmlldycpO1xuXHRcdHNhdmVkU3RhdGUoKTtcblx0fSwgNTAwKTtcblx0Ly8gYW5jaG9ya2V5XG5cdC8vc2V0VGltZW91dChmdW5jdGlvbigpe1xuXHQvLyAgd2luZG93LnByaW50KCk7XG5cdC8vfSwgMTAwMCk7XG5cdC8vIGFuaW1hdGVVcCgkKCcjc2F2ZS1tb2RhbCcpKTtcblx0Ly8gY2xlYXJJbnRlcnZhbCh4KTtcblx0Ly8gYW5pbWF0ZVVwKCQoJyNzYXZlLW1vZGFsJykpO1xuXHRjbGVhckludGVydmFsKHgpXG4gIGNsZWFySW50ZXJ2YWwoeSlcbn1cblxuZnVuY3Rpb24gZHJvcEVsZW1lbnQocGFnZUlkLCBkYXRhLCBtb3VzZVBvcywgY2FsbGJhY2spIHtcblx0Y29uc29sZS5sb2cobW91c2VQb3MpXG5cdHZhciBlbGVtZW50ID0geyBkYXRhOiBkYXRhLCBwYWdlOiBwYWdlSWQgfTtcblx0dmFyIGVsZW1lbnRQb3MgPSBjcmVhdGVFbGVtZW50KGVsZW1lbnQsIG1vdXNlUG9zLCBjYWxsYmFjayk7XG5cdFNvdW5kLmRpbmcoKTtcblx0Ly8gYWNoaWV2ZW1lbnQoMjAwLCAnWW91ciBtb20gYm91Z2h0IDEyIGNvcGllcycpO1xufVxuXG5cblxuXG5cblxuXG4vLyBlcnJvcnNcblxudmFyIEVycm9yID0ge1xuXHRub3RBbGxvd2VkOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpXG5cdFx0YWxlcnRNZXNzYWdlKCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyBub3QgYWxsb3dlZCEnKVxuXHR9LFxuXHR0b29CaWc6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKCk7XG5cdFx0YWxlcnRNZXNzYWdlKCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyB0b28gYmlnIScpO1xuXHR9LFxuXHR0b29MYXRlOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpO1xuXHRcdGFsZXJ0TWVzc2FnZSgndG9vIGxhdGUgYnJvJyk7XG5cdH1cbn07XG5cbi8vIGxvY2sgZWxlbWVudHNcbmZ1bmN0aW9uIGxvY2tFbGVtZW50cygpIHtcblx0Zm9yICh2YXIgcGFnZUlkIGluIGNhbnZhc2VzKSB7XG5cdFx0Y2FudmFzZXNbcGFnZUlkXS5zZWxlY3Rpb24gPSBmYWxzZTtcblx0XHRmb3IgKG9iamVjdElkIGluIGNhbnZhc2VzW3BhZ2VJZF0uZ2V0T2JqZWN0cygpICkge1xuXHRcdFx0dmFyIG9iamVjdCA9IGNhbnZhc2VzW3BhZ2VJZF0uaXRlbShvYmplY3RJZClcblx0XHRcdG9iamVjdC5zZWxlY3RhYmxlID0gZmFsc2Vcblx0XHRcdG9iamVjdC5ob3ZlckN1cnNvciA9ICdkZWZhdWx0J1xuXHRcdH1cblx0fVxufVxuXG4vLyBUT0RPOiBDT05WRVJUIFRPIEZBQlJJQ1xuZnVuY3Rpb24gcmVtb3ZlRWxlbWVudChpZCkge1xuXHQkKCcjJyArIGlkKS5oaWRlKCk7XG5cdGNvbnNvbGUubG9nKGlkKTtcbn1cblxuLy8gc2hvdyBzYXZlIG1vZGFsXG5cbmZ1bmN0aW9uIHNob3dTYXZlTW9kYWwoKSB7XG5cdCQoJyNzYXZlLW1vZGFsJykuc2hvdygpO1xuXHQkKCcjc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdHNhdmV0b0RiKFB1YmxpY2F0aW9uKTtcblx0XHQvLyBtYWtlUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRnZW5QZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdC8vIGNoZWNrUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdlblBkZihpZCkge1xuXHQkKCcjc2F2ZS1tb2RhbCcpLnNob3coKTtcblx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKCcnKTtcblx0dmFyIHogPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRpZiAocGRmUmVhZHkgPT0gdHJ1ZSkge1xuXHRcdFx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKFxuXHRcdFx0XHQnRG93bmxvYWQgeW91ciBwZGYgPGEgaHJlZj1cImFzc2V0cy9wZGYvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcucGRmP2Rvd25sb2FkPXRydWVcIiB0YXJnZXQ9XCJfYmxhbmtcIj5oZXJlPC9hPiBhbmQgcHJpbnRhYmxlIHBkZiBib29rbGV0IDxhIGhyZWY9XCJhc3NldHMvcGRmLycgK1xuXHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHQnLycgK1xuXHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHQnLWJvb2tsZXQucGRmP2Rvd25sb2FkPXRydWVcIiB0YXJnZXQ9XCJfYmxhbmtcIj5oZXJlPC9hPi4nIC8vIGFkZCBcIm9uIGNsaWNrIGNsb3NlIHNhdmUgbW9kYWxcIlxuXHRcdFx0KTtcblx0XHRcdGNsZWFySW50ZXJ2YWwoeik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vICQoJyNzYXZlLW1vZGFsJykuaHRtbCgnWW91ciBQdWJsaWNhdGlvbiBpcyBiZWluZyBnZW5lcmF0ZWQ8c3BhbiBpZD1cImxvYWRpbmdfZG90c1wiPi4uLjwvc3Bhbj48ZGl2IGlkPVwibG9hZGVyXCI+PGRpdiBpZD1cImxvYWRpbmdiYXJcIj48L2Rpdj48L2Rpdj4nKTtcblx0XHRcdCQoJyNzYXZlLW1vZGFsJykuaHRtbCgnWW91ciBQdWJsaWNhdGlvbiAoPGEgaHJlZj1cImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9wZGY/aWQ9JyArIFB1YmxpY2F0aW9uLmlkICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPmRvd25sb2FkPC9hPikgaXMgYmVpbmcgZ2VuZXJhdGVkPHNwYW4gaWQ9XCJsb2FkaW5nX2RvdHNcIj4uLi48L3NwYW4+PGRpdiBpZD1cInNwaW5uZXJcIj48ZGl2IGlkPVwiYW5pbWF0aW9uXCI+PC9kaXY+PGltZyBzcmM9XCJhc3NldHMvaW1nL3ByaW50ZXIucG5nXCI+PC9kaXY+Jyk7XG5cdFx0fVxuXHR9LCAxMDApO1xufVxuXG4vLyAtLS0gU0FWRURcblxuZnVuY3Rpb24gcmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pIHtcblx0Y2FudmFzZXNbJ3AxJ10uY2xlYXIoKTsgLy8gY2xlYXIgdGl0bGVcblxuXHRmb3IgKHZhciBjYW52YXNJZCBpbiBjYW52YXNlcykge1xuXHRcdHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24ucGFnZXNbY2FudmFzSWRdKTtcblx0XHRjYW52YXNlc1tjYW52YXNJZF0ubG9hZEZyb21KU09OKCBqc29uLCBmdW5jdGlvbigpIHtcblx0XHRcdGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwuYmluZChjYW52YXNlc1tjYW52YXNJZF0pXG5cdFx0XHRsb2NrRWxlbWVudHMoKVxuXHRcdH0pXG5cdH1cblxufVxuXG5mdW5jdGlvbiBwZGZEb3dubG9hZCgpIHtcblx0JCgnI3BkZi1kb3dubG9hZCcpLnNob3coKTtcblx0JCgnI3BkZi1kb3dubG9hZCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdC8vIG1ha2VQZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdGdlblBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Ly8gY2hlY2tQZGYoUHVibGljYXRpb24uaWQpO1xuXHR9KTtcbn1cblxuXG5cblxuXG5cbi8vIC0tLSBCQUNLRU5EXG5cbi8vIHNhdmUgdG8gZGJcbmZ1bmN0aW9uIHNhdmV0b0RiKHB1YmxpY2F0aW9uKSB7XG5cdGZvciAodmFyIHBhZ2UgaW4gUHVibGljYXRpb24ucGFnZXMpIHtcblx0XHRQdWJsaWNhdGlvbi5wYWdlc1twYWdlXSA9IGNhbnZhc2VzW3BhZ2VdLnRvSlNPTigpIC8vIHVwZGF0ZSBhbGwgcGFnZXNcblx0fVxuXHQkLmFqYXgoe1xuXHRcdHVybDogJy9kYicsXG5cdFx0dHlwZTogJ3Bvc3QnLCAvLyBwZXJmb3JtaW5nIGEgUE9TVCByZXF1ZXN0XG5cdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24pLFxuXHRcdGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG5cdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRzdWNjZXNzOiBmdW5jdGlvbihwdWJsaWNhdGlvbikge1xuXHRcdFx0Y29uc29sZS5sb2coJ3B1YmxpY2F0aW9uIHNlbnQgdG8gZGF0YWJhc2UuJyk7XG5cdFx0fVxuXHR9KTtcblx0Y29uc29sZS5sb2coJ3NhdmVkP2lkPScgKyBQdWJsaWNhdGlvbi5pZClcbn1cblxuXG5cblxuXG4vLyAtLS0gSU5URVJGQUNFIEZYXG5cblxuLy8gbW92ZSB0aGVzZSBmdW5jdGlvbnMgdG8gaW50ZXJmYWNlIHBhcnQgb2YganM/XG5mdW5jdGlvbiBhbmltYXRlVXAob2JqKSB7XG4gIG9iai5zaG93KCk7XG4gIG9iai5jc3MoJ21hcmdpbi10b3AnLCAnMjBweCcpO1xuICBvYmouYW5pbWF0ZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgbWFyZ2luVG9wOiBcIjBweFwiLFxuICAgIH0sIDMwMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICB9KTtcbn07XG5cbmZ1bmN0aW9uIGFuaW1hdGVVcE91dChvYmosIHRpbWUpIHtcbiAgb2JqLnNob3coKTtcbiAgb2JqLmNzcygnbWFyZ2luLXRvcCcsICcyMHB4Jyk7XG4gIG9iai5hbmltYXRlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICBtYXJnaW5Ub3A6IFwiMHB4XCIsXG4gICAgfSwgdGltZS8yLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cbiAgfSk7XG4gIG9iai5hbmltYXRlKHtcbiAgICAgIG9wYWNpdHk6IDAsXG4gICAgICBtYXJnaW5Ub3A6IFwiMjBweFwiLFxuICAgIH0sIHRpbWUvMiwgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG4gIH0pO1xufTtcblxuZnVuY3Rpb24gc2hha2Uob2JqLCB0aW1lKSB7XG4gIGlmICghdGltZSkgKFxuICAgIHRpbWUgPSA1MDBcbiAgKVxuICBvYmouYWRkQ2xhc3MoICdzaGFrZSBzaGFrZS1jb25zdGFudCcgKVxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgb2JqLnJlbW92ZUNsYXNzKCAnc2hha2Ugc2hha2UtY29uc3RhbnQnIClcbiAgfSwgdGltZSk7XG59XG5cblxuXG5cblxuXG4vLyAtLS0gRElTUlVQVElPTlNcblxuXG5mdW5jdGlvbiBhbGxFbGVtZW50cyh0eXBlKSB7XG4gIHZhciBvYmpzID0gW11cbiAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICBjYW52YXNPYmpzID0gY2FudmFzZXNbY2FudmFzXS5nZXRPYmplY3RzKHR5cGUpXG4gICAgZm9yICh2YXIgaSA9IGNhbnZhc09ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIG9ianMucHVzaCggY2FudmFzT2Jqc1tpXSApXG4gICAgfVxuICB9XG4gIHJldHVybiBvYmpzXG59XG5cbmZ1bmN0aW9uIHJlbmRlckFsbENhbnZhc2VzKCkge1xuICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgY2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbCgpXG4gIH1cbn1cblxuXG5cbmZ1bmN0aW9uIGZpbHRlckltZ3Mob2JqcywgZmlsdGVyKSB7XG4gIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgb2Jqc1tpXS5maWx0ZXJzLnB1c2goZmlsdGVyKVxuICAgIG9ianNbaV0uYXBwbHlGaWx0ZXJzKClcbiAgfVxuICByZW5kZXJBbGxDYW52YXNlcygpXG59XG5cblxudmFyIERpc3J1cHRpb24gPSB7XG5cdGNvbWljOiBmdW5jdGlvbigpIHtcblx0XHRmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG5cdFx0XHR0ZXh0cyA9IGNhbnZhc2VzW2NhbnZhc0lkXS5nZXRPYmplY3RzKCd0ZXh0Jylcblx0ICAgIGZvciAodGV4dCBpbiB0ZXh0cykge1xuXHQgICAgICB0ZXh0c1t0ZXh0XS5mb250RmFtaWx5ID0gJ1wiQ29taWMgU2FucyBNU1wiJ1xuXHQgICAgfVxuXHQgICBcdHRleHRib3hlcyA9IGNhbnZhc2VzW2NhbnZhc0lkXS5nZXRPYmplY3RzKCd0ZXh0Ym94Jylcblx0ICAgIGZvciAodGV4dGJveCBpbiB0ZXh0Ym94ZXMpIHtcblx0ICAgICAgdGV4dGJveGVzW3RleHRib3hdLmZvbnRGYW1pbHkgPSAnXCJDb21pYyBTYW5zIE1TXCInXG5cdCAgICB9XG5cblx0ICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwoKTtcbiAgICB9XG4gICAgY3JpdGljU2F5cygnVGhlIGNvbW1pc3Npb25lciBhc2tlZCB0byBzcGljZSB0aGUgdHlwb2dyYXBoeSBhIGJpdCEnLCAnR3V0ZW5iZXJnJylcblx0fSxcblx0cm90YXRlSW1nc05vc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX3JvdGF0ZUltZ3NOb3N0b3Aob2Jqcykge1xuICAgICAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgb2Jqc1tpXS5vcmlnaW5YID0gJ2NlbnRlcidcbiAgICAgICAgb2Jqc1tpXS5vcmlnaW5ZID0gJ2NlbnRlcidcbiAgICAgICAgb2Jqc1tpXS5yb3RhdGUoMCkuYW5pbWF0ZSh7IGFuZ2xlOiAzNjAgfSwge1xuICAgICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICAgIG9uQ2hhbmdlOiBvYmpzW2ldLmNhbnZhcy5yZW5kZXJBbGwuYmluZChvYmpzW2ldLmNhbnZhcyksXG4gICAgICAgICAgb25Db21wbGV0ZTogZnVuY3Rpb24oKXsgcm90YXRlT25lKG9ianNbaV0pIH0sXG4gICAgICAgICAgZWFzaW5nOiBmdW5jdGlvbih0LCBiLCBjLCBkKSB7IHJldHVybiBjKnQvZCArIGIgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfcm90YXRlSW1nc05vc3RvcChhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICBjb25zb2xlLmxvZygnWW91ciBmcmllbmQgdGhpbmsgdGhlIGxheW91dCBpcyBhIGJpdCBzdGF0aWMuLi4nKVxuXHR9LFxuXHRsb2NrUmFuZFBhZ2U6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FudmFzZXMpXG4gICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cblx0XHRyYW5kQ2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlO1xuXHRcdGZvciAob2JqZWN0SWQgaW4gcmFuZENhbnZhcy5nZXRPYmplY3RzKCkgKSB7XG5cdFx0XHR2YXIgb2JqZWN0ID0gcmFuZENhbnZhcy5pdGVtKG9iamVjdElkKVxuXHRcdFx0b2JqZWN0LnNlbGVjdGFibGUgPSBmYWxzZVxuXHRcdFx0b2JqZWN0LmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnXG5cdFx0fVxuXHRcdHJhbmRDYW52YXMuYWRkKG5ldyBmYWJyaWMuTGluZShbMCwgMCwgcmFuZENhbnZhcy53aWR0aCwgcmFuZENhbnZhcy5oZWlnaHRdLCB7XG5cdCAgXHRzdHJva2U6ICdyZWQnLFxuXHQgIFx0c2VsZWN0YWJsZTogZmFsc2UsXG5cdCAgXHRzdHJva2VXaWR0aDogMlxuXHRcdH0pKVxuXHRcdHJhbmRDYW52YXMucmVuZGVyQWxsKCk7XG5cdFx0Ly8gVE9ETzogcHJldmVudCBkcm9wXG4gICAgY3JpdGljU2F5cygnUGFnZSA/PyBpcyBub3cgbG9ja2VkLi4uJywgJ0d1dGVuYmVyZycpIC8vIFRPRE9cblx0fSxcbiAgc2h1ZmZsZVBhZ2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdG9TaHVmZmxlID0gW11cbiAgICB2YXIgaSA9IDBcbiAgICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoaSA+IDApIHsgLy8gcHJldmVudCBzaHVmZmxpbmcgZmlyc3QgcGFnZVxuICAgICAgICB0b1NodWZmbGUucHVzaCggY2FudmFzZXNbY2FudmFzSWRdLnRvSlNPTigpIClcbiAgICAgIH1cbiAgICAgIGkgKz0gMVxuICAgIH1cbiAgICBzaHVmZmxlQXJyYXkodG9TaHVmZmxlKVxuICAgIHZhciB5ID0gMFxuICAgIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmICh5ID4gMCkge1xuICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ubG9hZEZyb21KU09OKHRvU2h1ZmZsZVt5IC0gMV0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwuYmluZChjYW52YXNlc1tjYW52YXNJZF0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB5ICs9IDFcbiAgICB9XG4gICAgY3JpdGljU2F5cygnVGhlIHJ5dGhtIG9mIHRoaXMgcHVibGljYXRpb24gaXMgYSBiaXQgd2Vhay4gRG9uXFwndCB5b3UgdGhpbms/JywgJ0d1dGVuYmVyZycpXG4gIH0sXG5cdGFkczogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FudmFzZXMpXG4gICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cblx0XHRyYW5kQ2FudmFzLmFkZChuZXcgZmFicmljLlJlY3Qoe1xuXHRcdFx0d2lkdGg6IHJhbmRDYW52YXMud2lkdGgsXG5cdFx0XHRoZWlnaHQ6IDMwLFxuXHRcdFx0ZmlsbDogJyMwRDIxM0UnLFxuXHRcdFx0bG9ja01vdmVtZW50WDogdHJ1ZSxcblx0XHRcdGxvY2tNb3ZlbWVudFk6IHRydWUsXG5cdFx0XHRsb2NrUm90YXRpb246IHRydWUsXG5cdFx0XHRoYXNDb250cm9sczogZmFsc2UsXG5cdFx0XHRsZWZ0OiByYW5kQ2FudmFzLndpZHRoLzIsXG5cdFx0XHR0b3A6IDE1LFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2Vcblx0XHR9KSk7XG5cdFx0ZmFicmljLkltYWdlLmZyb21VUkwoJy9hc3NldHMvaW1nL2tpbmtvLnBuZycsIGZ1bmN0aW9uKGltZyl7XG5cdFx0XHRcdGltZy5oYXNCb3JkZXJzID0gZmFsc2U7XG5cdFx0XHRcdGltZy5oYXNDb250cm9scyA9IGZhbHNlO1xuXHRcdFx0XHRpbWcuc2NhbGUoMC4yKTtcblx0XHRcdFx0aW1nLmxlZnQgPSByYW5kQ2FudmFzLndpZHRoLTEwMDtcblx0XHRcdFx0aW1nLnRvcCA9IDUwO1xuXHRcdFx0XHRpbWcubG9ja01vdmVtZW50WCA9IHRydWU7XG5cdFx0XHRcdGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcblx0XHRcdFx0aW1nLmxvY2tSb3RhdGlvbiA9IHRydWU7XG5cdFx0XHRcdGltZy5zZXRDb250cm9sc1Zpc2liaWxpdHkgPSBmYWxzZTtcblx0XHRcdFx0cmFuZENhbnZhcy5pbnNlcnRBdChpbWcsMyk7XG5cdFx0XHRcdC8vIFRPRE86IGl0IG9ubHkgd29ya3Mgd2l0aCBvbmUgaW1hZ2UgZm9yIHNvbWUgcmVhc29uLiBydW5uaW5nIHRoZSBmdW5jdGlvbiBtdWx0aXBsZSB0aW1lcyBpdCBhZGRzIG1vcmUgdG9wIGJhcnMgYnV0IGp1c3QgbW92ZXMgYWxsIHRoZSBpbWFnZXMgdG8gdGhlIHNhbWUgcGxhY2Vcblx0XHR9KTtcblxuICAgIC8vIGluc2VydCBjcml0aWNcblx0fSxcbiAgaGFsZlRpbWU6IGZ1bmN0aW9uICgpIHtcbiAgICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMlxuICAgIGNyaXRpY1NheXMoJ1RoaXMgaXMgdGFraW5nIHRvbyBsb25nLi4uJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGRvdWJsZVRpbWU6IGZ1bmN0aW9uICgpIHtcbiAgICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICogMlxuICAgIGNyaXRpY1NheXMoJ1Rha2UgeW91ciB0aW1lLi4uJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGdyZXlzY2FsZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5HcmF5c2NhbGUoKSApXG4gICAgY3JpdGljU2F5cygnU2hhbGwgd2UgbWFrZSBpdCBsb29rIGNsYXNzaWM/JywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGludmVydEltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5JbnZlcnQoKSApXG4gICAgY3JpdGljU2F5cygnVGhlIHZpc3VhbHMgbmVlZCBzb21lIGVkZ3kgY29sb3JzJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIHNlcGlhSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLlNlcGlhKCkgKVxuICAgIGNyaXRpY1NheXMoJ0V2ZXIgaGVhcmQgb2YgSW5zdGFncmFtPycsICdHdXRlbmJlcmcnKVxuICB9LFxuICBibGFja3doaXRlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLkJsYWNrV2hpdGUoKSApXG4gICAgY3JpdGljU2F5cygnVGhpcyBzaG91bGQgbG9vayBsaWtlIGEgemluZSEnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgcGl4ZWxhdGVJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuUGl4ZWxhdGUoe2Jsb2Nrc2l6ZTogMjB9KSApXG4gICAgY3JpdGljU2F5cygnSXNuXFwndCB0aGlzIGEgdmlkZW9nYW1lIGFmdGVyIGFsbD8nLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgbm9pc2VJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuTm9pc2Uoe25vaXNlOiAyMDB9KSApXG4gICAgY3JpdGljU2F5cygnTUFLRSBTT01FIE5PT0lTRSEhJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGZvbnRTaXplQmlnZ2VyOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfZm9udFNpemVCaWdnZXIoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KCdmb250U2l6ZScsIGVsZW1lbnRzW2ldLmZvbnRTaXplICogc2NhbGVGb250KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2ZvbnRTaXplQmlnZ2VyKGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0NhblxcJ3QgcmVhZCBhbnl0aGluZyA6KCcsICdHdXRlbmJlcmcnKVxuICB9LFxuICBmb250U2l6ZVNtYWxsZXI6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9mb250U2l6ZUJpZ2dlcihlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoJ2ZvbnRTaXplJywgZWxlbWVudHNbaV0uZm9udFNpemUgLyBzY2FsZUZvbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBfZm9udFNpemVCaWdnZXIoYWxsRWxlbWVudHMoJ3RleHRib3gnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnSVxcJ20gbm90IGJsaW5kIScsICdHdXRlbmJlcmcnKVxuICB9LFxuICBiaWdnZXJJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfYmlnZ2VySW1ncyhlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIHNjYWxlWTogc2NhbGVJbWdzLFxuICAgICAgICAgIHNjYWxlWDogc2NhbGVJbWdzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBfYmlnZ2VySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gIH1cbn07Il0sImZpbGUiOiJtYWluLmpzIn0=
