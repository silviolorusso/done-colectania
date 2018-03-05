// --- OPTIONS

var disruptionsOn = true
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
    canvas.backgroundColor = 'white';
		canvases['p' + (i + 1)] = canvas;
    if (window.location.href.indexOf('saved') >= 0) { // if  saved
      canvas.selection = false
    }
	});
	fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center' // origin at the center
  if (window.location.href.indexOf('saved') < 0) { // if not saved
  	var title = new fabric.Textbox('Insert Title', {
  	  top: 120,
  	  fontFamily: 'AGaramondPro, serif',
  	  fill: '#777',
  	  lineHeight: 1.1,
  	  fontSize: 30,
  	  fontWeight: 'bold',
  	  textAlign: 'center',
  	  width: canvases['p1'].width,
  	  selectable: false,
      hasControls: false,
  	  hoverCursor: 'default',
  	  originX: 'left',
  	  originY: 'top',
      id: 'lock',
      cache: false
  	}).on('editing:entered', function(e) {
      if (this.text = 'Insert Title') {
        this.text = ''
        this.hiddenTextarea.value = ''
      }
    })
  	canvases['p1'].add(title)
  	var lineLenght = 250
  	canvases['p1'].add(new fabric.Line([0, 0, lineLenght, 0], {
  		left: ( canvases['p1'].width - lineLenght) / 2,
  	  top: 160,
  	  stroke: '#222',
  	  selectable: false,
  	 	originX: 'left',
  	  originY: 'top'
  	}));
  	var authors = new fabric.Textbox('Insert Authors', {
  	  top: 180,
  	  fontFamily: 'AGaramondPro, serif',
  	  fill: '#777',
  	  lineHeight: 1.1,
  	  fontSize: 20,
  	  textAlign: 'center',
  	  width: canvases['p1'].width,
  	  selectable: false,
      hasControls: false,
  	  hoverCursor: 'default',
  	  originX: 'left',
  	  originY: 'top',
      id: 'lock'
  	}).on('editing:entered', function(e) {
      if (this.text = 'Insert Authors') {
        this.text = ''
        this.hiddenTextarea.value = ''
      }
    })
  	canvases['p1'].add(authors)
  }
}





// --- M-V-C

var Publication = {
	// all our states
	id: makeId(),
	title: 'Untitled',
	timeLeft: 9000000,
	expired: false,
	authors: 'Anonymous',
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
		Publication.expired = true
		showExpired(Publication)
		lockElements(allElements())
    for (canvas in canvases) {
      canvases[canvas].selection = false
    }
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
    if ( getUrlParameter('disruptions') != 'false' && disruptionsOn == true) {
      y = setInterval(function() { // launch a random disruption
        disruptions = Object.keys(Disruption)
        Disruption[disruptions[ disruptions.length * Math.random() << 0]]()
        shake(pages)
      }, disruptionInterval)
    }
		mouseCounter()
	} else { // saved publication
		renderPublication(Publication)
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



// TODO: CONVERT TO FABRIC
function removeElement(id) {
	$('#' + id).hide();
	console.log(id);
}

// --- SAVED

function renderPublication(Publication) {
  // TODO update title and authors

	for (var canvasId in canvases) {
		var json = JSON.stringify(Publication.pages[canvasId]);
		canvases[canvasId].loadFromJSON( json, function() {
      lockElements(allElements())
			canvases[canvasId].renderAll.bind(canvases[canvasId])
		})
	}

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
    if (type) {
      canvasObjs = canvases[canvas].getObjects(type)
    } else {
      canvasObjs = canvases[canvas].getObjects()
    }
    for (var i = canvasObjs.length - 1; i >= 0; i--) {
      if (canvasObjs[i].id != 'lock') { // use this to lock 
        objs.push( canvasObjs[i] )
      }
    }
  }
  return objs
}

// lock elements
function lockElements(objs) {
  for (var i = objs.length - 1; i >= 0; i--) {
    objs[i].selectable = false
    objs[i].hasControls = false 
    objs[i].hoverCursor = 'default'
  }
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
    function _comic(objs) {
      for (var i = objs.length - 1; i >= 0; i--) {
        objs[i].fontFamily = '"Comic Sans MS"'
      }
    }
    _comic( allElements('text') )
    _comic( allElements('textbox') )
    renderAllCanvases()
    criticSays('Can\'t you spice the typography a bit?', 'Gutenberg')
	},
	rotateImgsNostop: function() {
    function _rotateImgsNostop(objs) {
      for (var i = objs.length - 1; i >= 0; i--) {
        objs[i].originX = 'center'
        objs[i].originY = 'center'
        objs[i].rotate(0).animate({ angle: 360 }, {
          duration: 3000,
          onChange: objs[i].canvas.renderAll.bind(objs[i].canvas),
          onComplete: function(){ _rotateImgsNostop(objs) },
          easing: function(t, b, c, d) { return c*t/d + b }
        })
      }
    }
    _rotateImgsNostop(allElements('image'))
    criticSays('I find this layout a bit static...', 'Gutenberg')
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
	  	strokeWidth: 2,
      id: 'lock'
		}))
		randCanvas.renderAll();
		// TODO: prevent drop
    criticSays('Page ' + randCanvas.id + ' is now locked...', 'Gutenberg') // TODO
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
      selectable: false,
			left: randCanvas.width/2,
			top: 15,
      selectable: false,
      id: 'lock'
		}));
		fabric.Image.fromURL('/assets/img/kinko.png', function(img){
				img.hasBorders = false;
				img.hasControls = false;
        img.selectable = false;
				img.scale(0.2);
				img.left = randCanvas.width-100;
				img.top = 50;
				img.lockMovementX = true;
				img.lockMovementY = true;
				img.lockRotation = true;
				img.setControlsVisibility = false;
				randCanvas.insertAt(img,3);
        img.id = 'lock'
				// TODO: it only works with one image for some reason. running the function multiple times it adds more top bars but just moves all the images to the same place
		});

    criticSays('I found a sponsor!', 'Gutenberg')
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
    criticSays('BLOW UP!', 'Gutenberg')
  },
  lockAllElements: function() {
    lockElements(allElements())
    criticSays('Things are perfect as they are.', 'Gutenberg')    
  }

};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBPUFRJT05TXG5cbnZhciBkaXNydXB0aW9uc09uID0gdHJ1ZVxudmFyIGRyb3BEZWxheSA9IDEwMFxudmFyIGRpc3J1cHRpb25JbnRlcnZhbCA9IDUwMDBcbnZhciBib251c1RpbWUgPSAxMDAwXG52YXIgdGV4dENodW5rc0xlbmd0aCA9IDE1MDBcbnZhciBmb250U2l6ZSA9IDE1XG52YXIgc2NhbGVGb250ID0gMS41XG52YXIgc2NhbGVJbWdzID0gMC43XG5cblxuXG5cblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcblx0dmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcblx0dmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG5cdHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gYnl0ZUNvdW50KHMpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJKHMpLnNwbGl0KC8lLi58Li8pLmxlbmd0aCAtIDE7XG59XG5cbnZhciBnZXRVcmxQYXJhbWV0ZXIgPSBmdW5jdGlvbiBnZXRVcmxQYXJhbWV0ZXIoc1BhcmFtKSB7XG4gIHZhciBzUGFnZVVSTCA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSksXG4gICAgc1VSTFZhcmlhYmxlcyA9IHNQYWdlVVJMLnNwbGl0KCcmJyksXG4gICAgc1BhcmFtZXRlck5hbWUsXG4gICAgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgc1VSTFZhcmlhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgIHNQYXJhbWV0ZXJOYW1lID0gc1VSTFZhcmlhYmxlc1tpXS5zcGxpdCgnPScpO1xuXG4gICAgaWYgKHNQYXJhbWV0ZXJOYW1lWzBdID09PSBzUGFyYW0pIHtcbiAgICAgICAgcmV0dXJuIHNQYXJhbWV0ZXJOYW1lWzFdID09PSB1bmRlZmluZWQgPyB0cnVlIDogc1BhcmFtZXRlck5hbWVbMV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNodWZmbGVBcnJheShhcnJheSkge1xuICBmb3IgKHZhciBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgIHZhciBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgdmFyIHRlbXAgPSBhcnJheVtpXTtcbiAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgIGFycmF5W2pdID0gdGVtcDtcbiAgfVxufVxuXG5cblxuXG5cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudChlbGVtZW50LCBtb3VzZVBvcywgY2FsbGJhY2spIHtcbiAgZnVuY3Rpb24gY2h1bmtTdHJpbmcoc3RyLCBsZW5ndGgpIHtcbiAgICByZXR1cm4gc3RyLm1hdGNoKG5ldyBSZWdFeHAoJ3suMSwnICsgbGVuZ3RoICsgJ30nLCAnZycpKTtcbiAgfVxuXHR2YXIgdGhlTW91c2VQb3MgPSBtb3VzZVBvc1xuXHRpZiAoZWxlbWVudC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykpIHtcblx0XHRmYWJyaWMuSW1hZ2UuZnJvbVVSTChlbGVtZW50LmRhdGEsIGZ1bmN0aW9uKG15SW1nLCBjYWxsYmFjaykge1xuIFx0XHRcdHZhciBpbWcgPSBteUltZy5zZXQoeyBsZWZ0OiAwLCB0b3A6IDAsIHdpZHRoOiBteUltZy53aWR0aCwgaGVpZ2h0OiBteUltZy5oZWlnaHR9KTtcbiBcdFx0XHRpZiAoIGltZy53aWR0aCA+IGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggKSB7XG4gXHRcdFx0XHRpbWcuc2NhbGVUb1dpZHRoKGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggLyAxMDAgKiA1MCApOyAvLyA1MCUgb2YgdGhlIGNhbnZhc1xuIFx0XHRcdH1cbiBcdFx0XHRpbWcubGVmdCA9IHRoZU1vdXNlUG9zLnhcbiBcdFx0XHRpbWcudG9wID0gdGhlTW91c2VQb3MueVxuIFx0XHRcdGltZy5vbignYWRkZWQnLCBmdW5jdGlvbigpIHtcbiBcdFx0XHRcdGNhbGxiYWNrO1xuIFx0XHRcdH0pO1xuIFx0XHRcdGNhbnZhc2VzW2VsZW1lbnQucGFnZV0uYWRkKGltZylcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR2YXIgZGVCYXNlZFRleHQgPSBhdG9iKGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpKTtcbiAgICBjaHVua3MgPSBkZUJhc2VkVGV4dC5tYXRjaChuZXcgUmVnRXhwKCcoLnxbXFxyXFxuXSl7MSwnICsgdGV4dENodW5rc0xlbmd0aCArICd9JywgJ2cnKSlcbiAgICB2YXIgY3VyclBhZ2UgPSBwYXJzZUludCggZWxlbWVudC5wYWdlLnN1YnN0cihlbGVtZW50LnBhZ2UubGVuZ3RoIC0gMSkgKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY2FudmFzZXNbJ3AnICsgKGN1cnJQYWdlICsgaSldKSB7XG4gICAgICAgIGNhbnZhc2VzWydwJyArIChjdXJyUGFnZSArIGkpXS5hZGQobmV3IGZhYnJpYy5UZXh0Ym94KGNodW5rc1tpXSArICctJywge1xuICAgICAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXG4gICAgICAgICAgbGVmdDogMjAsXG4gICAgICAgICAgdG9wOiAyMCxcbiAgICAgICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICAgICAgd2lkdGg6IDQxMCxcbiAgICAgICAgICBicmVha1dvcmRzOiB0cnVlLFxuICAgICAgICAgIG9yaWdpblg6ICdsZWZ0JyxcbiAgICAgICAgICBvcmlnaW5ZOiAndG9wJ1xuICAgICAgICB9KSlcbiAgICAgIH1cbiAgICB9XG5cdFx0Y2FsbGJhY2s7XG5cdH1cbn1cblxuXG4vLyAtLS0gaW5pdGlhbGl6ZSBjYW52YXNlc1xudmFyIGNhbnZhc2VzID0ge31cbmZ1bmN0aW9uIGluaXRDYW52YXNlcygpIHtcblx0JCgnY2FudmFzJykuZWFjaChmdW5jdGlvbihpKSB7XG5cdFx0Y2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXModGhpcyk7XG5cdCAgY2FudmFzLnNldFdpZHRoKCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykud2lkdGgoKSApO1xuXHRcdGNhbnZhcy5zZXRIZWlnaHQoICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5oZWlnaHQoKSApO1xuICAgIGNhbnZhcy5iYWNrZ3JvdW5kQ29sb3IgPSAnd2hpdGUnO1xuXHRcdGNhbnZhc2VzWydwJyArIChpICsgMSldID0gY2FudmFzO1xuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpID49IDApIHsgLy8gaWYgIHNhdmVkXG4gICAgICBjYW52YXMuc2VsZWN0aW9uID0gZmFsc2VcbiAgICB9XG5cdH0pO1xuXHRmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5vcmlnaW5YID0gZmFicmljLk9iamVjdC5wcm90b3R5cGUub3JpZ2luWSA9ICdjZW50ZXInIC8vIG9yaWdpbiBhdCB0aGUgY2VudGVyXG4gIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpIDwgMCkgeyAvLyBpZiBub3Qgc2F2ZWRcbiAgXHR2YXIgdGl0bGUgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBUaXRsZScsIHtcbiAgXHQgIHRvcDogMTIwLFxuICBcdCAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybywgc2VyaWYnLFxuICBcdCAgZmlsbDogJyM3NzcnLFxuICBcdCAgbGluZUhlaWdodDogMS4xLFxuICBcdCAgZm9udFNpemU6IDMwLFxuICBcdCAgZm9udFdlaWdodDogJ2JvbGQnLFxuICBcdCAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgXHQgIHdpZHRoOiBjYW52YXNlc1sncDEnXS53aWR0aCxcbiAgXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxuICBcdCAgaG92ZXJDdXJzb3I6ICdkZWZhdWx0JyxcbiAgXHQgIG9yaWdpblg6ICdsZWZ0JyxcbiAgXHQgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJyxcbiAgICAgIGNhY2hlOiBmYWxzZVxuICBcdH0pLm9uKCdlZGl0aW5nOmVudGVyZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGhpcy50ZXh0ID0gJ0luc2VydCBUaXRsZScpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJydcbiAgICAgICAgdGhpcy5oaWRkZW5UZXh0YXJlYS52YWx1ZSA9ICcnXG4gICAgICB9XG4gICAgfSlcbiAgXHRjYW52YXNlc1sncDEnXS5hZGQodGl0bGUpXG4gIFx0dmFyIGxpbmVMZW5naHQgPSAyNTBcbiAgXHRjYW52YXNlc1sncDEnXS5hZGQobmV3IGZhYnJpYy5MaW5lKFswLCAwLCBsaW5lTGVuZ2h0LCAwXSwge1xuICBcdFx0bGVmdDogKCBjYW52YXNlc1sncDEnXS53aWR0aCAtIGxpbmVMZW5naHQpIC8gMixcbiAgXHQgIHRvcDogMTYwLFxuICBcdCAgc3Ryb2tlOiAnIzIyMicsXG4gIFx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgXHQgXHRvcmlnaW5YOiAnbGVmdCcsXG4gIFx0ICBvcmlnaW5ZOiAndG9wJ1xuICBcdH0pKTtcbiAgXHR2YXIgYXV0aG9ycyA9IG5ldyBmYWJyaWMuVGV4dGJveCgnSW5zZXJ0IEF1dGhvcnMnLCB7XG4gIFx0ICB0b3A6IDE4MCxcbiAgXHQgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8sIHNlcmlmJyxcbiAgXHQgIGZpbGw6ICcjNzc3JyxcbiAgXHQgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgXHQgIGZvbnRTaXplOiAyMCxcbiAgXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gIFx0ICB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG4gIFx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gIFx0ICBvcmlnaW5YOiAnbGVmdCcsXG4gIFx0ICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgIGlkOiAnbG9jaydcbiAgXHR9KS5vbignZWRpdGluZzplbnRlcmVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRoaXMudGV4dCA9ICdJbnNlcnQgQXV0aG9ycycpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJydcbiAgICAgICAgdGhpcy5oaWRkZW5UZXh0YXJlYS52YWx1ZSA9ICcnXG4gICAgICB9XG4gICAgfSlcbiAgXHRjYW52YXNlc1sncDEnXS5hZGQoYXV0aG9ycylcbiAgfVxufVxuXG5cblxuXG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG5cdC8vIGFsbCBvdXIgc3RhdGVzXG5cdGlkOiBtYWtlSWQoKSxcblx0dGl0bGU6ICdVbnRpdGxlZCcsXG5cdHRpbWVMZWZ0OiA5MDAwMDAwLFxuXHRleHBpcmVkOiBmYWxzZSxcblx0YXV0aG9yczogJ0Fub255bW91cycsXG5cdHBhZ2VzOiB7XG5cdFx0cDE6IHt9LFxuXHRcdHAyOiB7fSxcblx0XHRwMzoge30sXG5cdFx0cDQ6IHt9LFxuXHRcdHA1OiB7fSxcblx0XHRwNjoge30sXG5cdFx0cDc6IHt9LFxuXHRcdHA4OiB7fVxuXHR9XG59O1xuXG5mdW5jdGlvbiBjb250cm9sbGVyKFB1YmxpY2F0aW9uLCBpbnB1dCkge1xuXHRpZiAoUHVibGljYXRpb24udGltZUxlZnQgPiAwKSB7IC8vIG5vdCBleHBpcmVkXG5cdFx0c2hvd1RpbWUoUHVibGljYXRpb24pOyAvLyBleHBpcmVkXG5cdH0gZWxzZSB7XG5cdFx0UHVibGljYXRpb24uZXhwaXJlZCA9IHRydWVcblx0XHRzaG93RXhwaXJlZChQdWJsaWNhdGlvbilcblx0XHRsb2NrRWxlbWVudHMoYWxsRWxlbWVudHMoKSlcbiAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgY2FudmFzZXNbY2FudmFzXS5zZWxlY3Rpb24gPSBmYWxzZVxuICAgIH1cblx0fVxuXG5cdGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG5cdFx0Y29uc29sZS5sb2coaW5wdXQpXG5cdFx0c3dpdGNoICh0cnVlKSB7XG5cdFx0XHRjYXNlIGlucHV0LnZpc2libGUgPT0gZmFsc2U6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcblx0XHRcdFx0XHRyZW1vdmVFbGVtZW50KGlucHV0LmlkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0Ynl0ZUNvdW50KGlucHV0LmRhdGEpID4gMTM5ODExNyA6IC8vIGZpbGUgdG9vIGJpZyAoMW1iKVxuXHRcdFx0XHQgXHRFcnJvci50b29CaWcoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IGltYWdlXG5cblx0XHRcdFx0XHR2YXIgcHVibGljYXRpb25VcGRhdGUgPSBmdW5jdGlvbihpbnB1dFBhZ2UpIHsgLy8gdXBkYXRlIGNhbnZhc1xuXHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXRQYWdlXSA9IGNhbnZhc2VzW2lucHV0UGFnZV0udG9KU09OKCkgLy8gc2V0dGltZW91dCBvdGhlcndpc2UgaXQgZG9lc24ndCBnZXQgdGhlIGVsZW1lbnRcblx0XHRcdFx0XHRcdH0sIDEpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zLCBwdWJsaWNhdGlvblVwZGF0ZShpbnB1dC5wYWdlKSk7IC8vIGRyb3AgZWxlbWVudFxuXHRcdFx0XHRcdGFkZHRpbWUoYm9udXNUaW1lKSAvLyBhZGQgYm9udXMgdGltZVxuXHRcdFx0XHRcdGNyaXRpY1NheXMoKVxuXG5cblx0XHRcdFx0XHQvLyBjcml0aWNTYXlzKCdkYW5jZSBkYW5jZScsICdjYXQnKTtcblx0XHRcdFx0XHQvLyBvclxuXHRcdFx0XHRcdC8vIGNyaXRpY1NheXMoJ2RhbmNlIGRhbmNlJyk7XG5cdFx0XHRcdFx0Ly8gb3Jcblx0XHRcdFx0XHQvLyBjcml0aWNTYXlzKCk7XG5cblxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJykgJiZcblx0XHRcdFx0aW5wdXQudmlzaWJsZSA9PSB0cnVlOiAvLyBuZXcgdGV4dFxuXG5cdFx0XHRcdFx0dmFyIHB1YmxpY2F0aW9uVXBkYXRlID0gZnVuY3Rpb24oaW5wdXRQYWdlKSB7IC8vIHVwZGF0ZSBjYW52YXNcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFB1YmxpY2F0aW9uLnBhZ2VzW2lucHV0UGFnZV0gPSBjYW52YXNlc1tpbnB1dFBhZ2VdLnRvSlNPTigpIC8vIHNldHRpbWVvdXQgb3RoZXJ3aXNlIGl0IGRvZXNuJ3QgZ2V0IHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0XHR9LCAxKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBpbnB1dC5tb3VzZVBvcywgcHVibGljYXRpb25VcGRhdGUoaW5wdXQucGFnZSkpOyAvLyBkcm9wIGVsZW1lbnRcblx0XHRcdFx0XHRhZGR0aW1lKDEwMDApIC8vIGFkZCBib251cyB0aW1lXG5cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG5cdFx0XHRcdFx0RXJyb3Iubm90QWxsb3dlZCgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQubW92ZSA9PSB0cnVlIDogLy8gbW92aW5nIG9yIHNjYWxpbmcgYW4gaW1hZ2Vcblx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dC5wYWdlXSA9IGNhbnZhc2VzW2lucHV0LnBhZ2VdLnRvSlNPTigpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuaGFzT3duUHJvcGVydHkoJ3RpdGxlJykgOiAvLyBjaGFuZ2luZyB0aXRsZVxuXHRcdFx0XHRcdFB1YmxpY2F0aW9uLnRpdGxlID0gaW5wdXQudGl0bGU7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkge1xuXHRcdC8vIHRvbyBsYXRlXG5cdFx0RXJyb3IudG9vTGF0ZSgpO1xuXHR9XG59XG5cblxuXG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxudmFyIHg7XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0aW5pdENhbnZhc2VzKClcblx0b25Nb2RFbGVtZW50KClcblx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPCAwKSB7XG5cdFx0Ly8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cblx0XHRpZiAoIGdldFVybFBhcmFtZXRlcigndGltZScpICkgeyAvLyBkaWZmaWN1bHR5XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IGdldFVybFBhcmFtZXRlcigndGltZScpO1xuXHRcdH1cblx0XHR4ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC0gMTA7XG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uKTtcblx0XHR9LCAxMClcbiAgICBpZiAoIGdldFVybFBhcmFtZXRlcignZGlzcnVwdGlvbnMnKSAhPSAnZmFsc2UnICYmIGRpc3J1cHRpb25zT24gPT0gdHJ1ZSkge1xuICAgICAgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkgeyAvLyBsYXVuY2ggYSByYW5kb20gZGlzcnVwdGlvblxuICAgICAgICBkaXNydXB0aW9ucyA9IE9iamVjdC5rZXlzKERpc3J1cHRpb24pXG4gICAgICAgIERpc3J1cHRpb25bZGlzcnVwdGlvbnNbIGRpc3J1cHRpb25zLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dKClcbiAgICAgICAgc2hha2UocGFnZXMpXG4gICAgICB9LCBkaXNydXB0aW9uSW50ZXJ2YWwpXG4gICAgfVxuXHRcdG1vdXNlQ291bnRlcigpXG5cdH0gZWxzZSB7IC8vIHNhdmVkIHB1YmxpY2F0aW9uXG5cdFx0cmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pXG5cdH1cbn0pO1xuXG5mdW5jdGlvbiBhZGR0aW1lKGJvbnVzVGltZSkge1xuXHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICsgYm9udXNUaW1lO1xuXHRhbmltYXRldGltZWNvdW50ZXIoYm9udXNUaW1lKTtcbn1cblxuLy8gbW9kaWZ5IGVsZW1lbnQgbGlzdGVuZXJcbmZ1bmN0aW9uIG9uTW9kRWxlbWVudCgpIHtcblx0Zm9yICh2YXIgcGFnZUlkIGluIGNhbnZhc2VzKSB7XG5cdFx0Y2FudmFzZXNbIHBhZ2VJZCBdLm9uKCdvYmplY3Q6bW9kaWZpZWQnLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBwYXJlbnRDYW52YXNJZCA9IGV2dC50YXJnZXQuY2FudmFzLmxvd2VyQ2FudmFzRWwuaWRcblx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgbW92ZTogdHJ1ZSwgcGFnZTogcGFyZW50Q2FudmFzSWR9KVxuXHRcdH0pXG5cdH1cbn1cblxuLy8gZ2V0IG1vdXNlIHBvc2l0aW9uIG9uIGNhbnZhc1xuZnVuY3Rpb24gZ2V0TW91c2VQb3MoY2FudmFzLCBlKSB7XG4gIHZhciBwb2ludGVyID0gY2FudmFzLmdldFBvaW50ZXIoZXZlbnQsIGUpXG4gIHZhciBwb3NYID0gcG9pbnRlci54XG4gIHZhciBwb3NZID0gcG9pbnRlci55XG4gIHJldHVybiB7XG4gICAgeDogcG9zWCxcbiAgICB5OiBwb3NZXG4gIH1cbn1cblxuY29uc3QgcGFnZXMgPSAkKCcucGFnZScpXG4vLyBkcm9wIGVsZW1lbnRcbnBhZ2VzLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG5wYWdlcy5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbnBhZ2VzLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdGNvbnNvbGUubG9nKGUpO1xuXHR2YXIgZmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzO1xuXHR2YXIgeSA9IDA7XG5cdGZvciAodmFyIGkgPSBmaWxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0dmFyIHBhZ2VJZCA9ICQodGhpcykuZmluZCgnY2FudmFzJykuYXR0cignaWQnKTtcblx0XHRtb3VzZVBvcyA9IGdldE1vdXNlUG9zKGNhbnZhc2VzW3BhZ2VJZF0sIGUpXG5cdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdFx0XHRcdGRhdGE6IGV2ZW50LnRhcmdldC5yZXN1bHQsXG5cdFx0XHRcdFx0dmlzaWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRwYWdlOiBwYWdlSWQsXG5cdFx0XHRcdFx0bW91c2VQb3M6IG1vdXNlUG9zXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgeSAqIGRyb3BEZWxheSk7XG5cdFx0XHR5ICs9IDE7XG5cdFx0fTtcblx0XHRjb25zb2xlLmxvZyhmaWxlc1tpXSk7XG5cdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZXNbaV0pO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn0pO1xuLy8gcHJldmVudCBkcm9wIG9uIGJvZHlcbiQoJ2JvZHknKS5vbignZHJhZ292ZXInLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFNvdW5kLmVycm9yKCk7XG59KTtcblxuLy8gcmVtb3ZlIGVsZW1lbnQgKFRPRE86IFVQREFURSBGT1IgRkFCUklDKVxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jbG9zZScsIGZ1bmN0aW9uKCkge1xuXHR2YXIgcGFnZUlkID0gJCh0aGlzKVxuXHRcdC5jbG9zZXN0KCcucGFnZScpXG5cdFx0LmF0dHIoJ2lkJyk7XG5cdHZhciBlbGVtZW50SWQgPSAkKHRoaXMpXG5cdFx0LnBhcmVudCgpXG5cdFx0LmF0dHIoJ2lkJyk7XG5cdHZhciBlbGVtZW50RGF0YSA9ICQodGhpcylcblx0XHQuc2libGluZ3MoKVxuXHRcdC5hdHRyKCdzcmMnKTtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdGlkOiBlbGVtZW50SWQsXG5cdFx0ZGF0YTogZWxlbWVudERhdGEsXG5cdFx0cG9zOiBbMCwgMCwgMCwgMCwgMF0sXG5cdFx0dmlzaWJsZTogZmFsc2UsXG5cdFx0cGFnZTogcGFnZUlkXG5cdH0pO1xufSk7XG5cbi8vIGNoYW5naW5nIHRpdGxlIC8vIFRPRE8gVXBkYXRlXG4kKCcjdGl0bGUnKS5jaGFuZ2UoZnVuY3Rpb24oKSB7XG5cdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHtcblx0XHR0aXRsZTogJCh0aGlzKS52YWwoKVxuXHR9KTtcbn0pXG5cblxuXG5cblxuXG4vLyAtLS0gVklFV1xuXG52YXIgU291bmQgPSB7XG5cdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgYXVkaW8gPSBuZXcgQXVkaW8oJ2Fzc2V0cy9hdWRpby9pbmNvcnJlY3QubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9LFxuXHRkaW5nOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgYXVkaW8gPSBuZXcgQXVkaW8oJ2Fzc2V0cy9hdWRpby9kaW5nLm1wMycpO1xuXHRcdGF1ZGlvLnBsYXkoKTtcblx0fVxufTtcblxuLy8gVE9ETzogbWVyZ2UgdGhlc2UgdHdvXG5mdW5jdGlvbiBzaG93VGltZShQdWJsaWNhdGlvbikge1xuXHRzZWNvbmRzID0gUHVibGljYXRpb24udGltZUxlZnQgLyAxMDAwO1xuXHQkKCcjY291bnRlcicpLnNob3coKTtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKS5pbm5lckhUTUwgPVxuXHRcdHNlY29uZHMudG9GaXhlZCgyKSArICcgc2Vjb25kcyBsZWZ0ISc7XG59XG5mdW5jdGlvbiBtb3VzZUNvdW50ZXIoKSB7XG5cdCQoZG9jdW1lbnQpLmJpbmQoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoZS5wYWdlWCA+PSAkKGRvY3VtZW50KS53aWR0aCgpIC8gMikge1xuXHRcdFx0Ly8gaWYgbW91c2Ugb2YgcmlnaHQgc2lkZSBvZiBwYWdlXG5cdFx0XHQkKCcjY291bnRlcicpLmFkZENsYXNzKCdtb3VzZV9yaWdodCcpO1xuXHRcdFx0JCgnI2NvdW50ZXInKS5jc3Moe1xuXHRcdFx0XHRsZWZ0OiBlLnBhZ2VYIC0gMjAgLSAkKCcjY291bnRlcicpLndpZHRoKCksXG5cdFx0XHRcdHRvcDogZS5wYWdlWSArIDUwXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaWYgbW91c2Ugb2YgbGVmdCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykucmVtb3ZlQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggKyAyMCxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIHNob3dFeHBpcmVkKCkge1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLmlubmVySFRNTCA9ICdleHBpcmVkISc7XG5cdCQoJ2JvZHknKS5hZGRDbGFzcygnZXhwaXJlZCcpO1xuXG5cdGV4cGlyZWRUaW1lKCk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdCQoJy53cmFwcGVyJykuYWRkQ2xhc3MoJ3NhdmVkX3ZpZXcnKTtcblx0XHRzYXZlZFN0YXRlKCk7XG5cdH0sIDUwMCk7XG5cdC8vIGFuY2hvcmtleVxuXHQvL3NldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0Ly8gIHdpbmRvdy5wcmludCgpO1xuXHQvL30sIDEwMDApO1xuXHQvLyBhbmltYXRlVXAoJCgnI3NhdmUtbW9kYWwnKSk7XG5cdC8vIGNsZWFySW50ZXJ2YWwoeCk7XG5cdC8vIGFuaW1hdGVVcCgkKCcjc2F2ZS1tb2RhbCcpKTtcblx0Y2xlYXJJbnRlcnZhbCh4KVxuICBjbGVhckludGVydmFsKHkpXG59XG5cbmZ1bmN0aW9uIGRyb3BFbGVtZW50KHBhZ2VJZCwgZGF0YSwgbW91c2VQb3MsIGNhbGxiYWNrKSB7XG5cdGNvbnNvbGUubG9nKG1vdXNlUG9zKVxuXHR2YXIgZWxlbWVudCA9IHsgZGF0YTogZGF0YSwgcGFnZTogcGFnZUlkIH07XG5cdHZhciBlbGVtZW50UG9zID0gY3JlYXRlRWxlbWVudChlbGVtZW50LCBtb3VzZVBvcywgY2FsbGJhY2spO1xuXHRTb3VuZC5kaW5nKCk7XG5cdC8vIGFjaGlldmVtZW50KDIwMCwgJ1lvdXIgbW9tIGJvdWdodCAxMiBjb3BpZXMnKTtcbn1cblxuXG5cblxuXG5cblxuLy8gZXJyb3JzXG5cbnZhciBFcnJvciA9IHtcblx0bm90QWxsb3dlZDogZnVuY3Rpb24oKSB7XG5cdFx0U291bmQuZXJyb3IoKVxuXHRcdGFsZXJ0TWVzc2FnZSgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgbm90IGFsbG93ZWQhJylcblx0fSxcblx0dG9vQmlnOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpO1xuXHRcdGFsZXJ0TWVzc2FnZSgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgdG9vIGJpZyEnKTtcblx0fSxcblx0dG9vTGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0U291bmQuZXJyb3IoKTtcblx0XHRhbGVydE1lc3NhZ2UoJ3RvbyBsYXRlIGJybycpO1xuXHR9XG59O1xuXG5cblxuLy8gVE9ETzogQ09OVkVSVCBUTyBGQUJSSUNcbmZ1bmN0aW9uIHJlbW92ZUVsZW1lbnQoaWQpIHtcblx0JCgnIycgKyBpZCkuaGlkZSgpO1xuXHRjb25zb2xlLmxvZyhpZCk7XG59XG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbikge1xuICAvLyBUT0RPIHVwZGF0ZSB0aXRsZSBhbmQgYXV0aG9yc1xuXG5cdGZvciAodmFyIGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG5cdFx0dmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeShQdWJsaWNhdGlvbi5wYWdlc1tjYW52YXNJZF0pO1xuXHRcdGNhbnZhc2VzW2NhbnZhc0lkXS5sb2FkRnJvbUpTT04oIGpzb24sIGZ1bmN0aW9uKCkge1xuICAgICAgbG9ja0VsZW1lbnRzKGFsbEVsZW1lbnRzKCkpXG5cdFx0XHRjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsLmJpbmQoY2FudmFzZXNbY2FudmFzSWRdKVxuXHRcdH0pXG5cdH1cblxufVxuXG5cblxuXG4vLyAtLS0gQkFDS0VORFxuXG4vLyBzYXZlIHRvIGRiXG5mdW5jdGlvbiBzYXZldG9EYihwdWJsaWNhdGlvbikge1xuXHRmb3IgKHZhciBwYWdlIGluIFB1YmxpY2F0aW9uLnBhZ2VzKSB7XG5cdFx0UHVibGljYXRpb24ucGFnZXNbcGFnZV0gPSBjYW52YXNlc1twYWdlXS50b0pTT04oKSAvLyB1cGRhdGUgYWxsIHBhZ2VzXG5cdH1cblx0JC5hamF4KHtcblx0XHR1cmw6ICcvZGInLFxuXHRcdHR5cGU6ICdwb3N0JywgLy8gcGVyZm9ybWluZyBhIFBPU1QgcmVxdWVzdFxuXHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KFB1YmxpY2F0aW9uKSxcblx0XHRjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuXHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0c3VjY2VzczogZnVuY3Rpb24ocHVibGljYXRpb24pIHtcblx0XHRcdGNvbnNvbGUubG9nKCdwdWJsaWNhdGlvbiBzZW50IHRvIGRhdGFiYXNlLicpO1xuXHRcdH1cblx0fSk7XG5cdGNvbnNvbGUubG9nKCdzYXZlZD9pZD0nICsgUHVibGljYXRpb24uaWQpXG59XG5cblxuXG5cblxuLy8gLS0tIElOVEVSRkFDRSBGWFxuXG5cbi8vIG1vdmUgdGhlc2UgZnVuY3Rpb25zIHRvIGludGVyZmFjZSBwYXJ0IG9mIGpzP1xuZnVuY3Rpb24gYW5pbWF0ZVVwKG9iaikge1xuICBvYmouc2hvdygpO1xuICBvYmouY3NzKCdtYXJnaW4tdG9wJywgJzIwcHgnKTtcbiAgb2JqLmFuaW1hdGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIG1hcmdpblRvcDogXCIwcHhcIixcbiAgICB9LCAzMDAwLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cbiAgfSk7XG59O1xuXG5mdW5jdGlvbiBhbmltYXRlVXBPdXQob2JqLCB0aW1lKSB7XG4gIG9iai5zaG93KCk7XG4gIG9iai5jc3MoJ21hcmdpbi10b3AnLCAnMjBweCcpO1xuICBvYmouYW5pbWF0ZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgbWFyZ2luVG9wOiBcIjBweFwiLFxuICAgIH0sIHRpbWUvMiwgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG4gIH0pO1xuICBvYmouYW5pbWF0ZSh7XG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgbWFyZ2luVG9wOiBcIjIwcHhcIixcbiAgICB9LCB0aW1lLzIsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICB9KTtcbn07XG5cbmZ1bmN0aW9uIHNoYWtlKG9iaiwgdGltZSkge1xuICBpZiAoIXRpbWUpIChcbiAgICB0aW1lID0gNTAwXG4gIClcbiAgb2JqLmFkZENsYXNzKCAnc2hha2Ugc2hha2UtY29uc3RhbnQnIClcbiAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgIG9iai5yZW1vdmVDbGFzcyggJ3NoYWtlIHNoYWtlLWNvbnN0YW50JyApXG4gIH0sIHRpbWUpO1xufVxuXG5cblxuXG5cblxuLy8gLS0tIERJU1JVUFRJT05TXG5cblxuZnVuY3Rpb24gYWxsRWxlbWVudHModHlwZSkge1xuICB2YXIgb2JqcyA9IFtdXG4gIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIGNhbnZhc09ianMgPSBjYW52YXNlc1tjYW52YXNdLmdldE9iamVjdHModHlwZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY2FudmFzT2JqcyA9IGNhbnZhc2VzW2NhbnZhc10uZ2V0T2JqZWN0cygpXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSBjYW52YXNPYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAoY2FudmFzT2Jqc1tpXS5pZCAhPSAnbG9jaycpIHsgLy8gdXNlIHRoaXMgdG8gbG9jayBcbiAgICAgICAgb2Jqcy5wdXNoKCBjYW52YXNPYmpzW2ldIClcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9ianNcbn1cblxuLy8gbG9jayBlbGVtZW50c1xuZnVuY3Rpb24gbG9ja0VsZW1lbnRzKG9ianMpIHtcbiAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBvYmpzW2ldLnNlbGVjdGFibGUgPSBmYWxzZVxuICAgIG9ianNbaV0uaGFzQ29udHJvbHMgPSBmYWxzZSBcbiAgICBvYmpzW2ldLmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyQWxsQ2FudmFzZXMoKSB7XG4gIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsKClcbiAgfVxufVxuXG5mdW5jdGlvbiBmaWx0ZXJJbWdzKG9ianMsIGZpbHRlcikge1xuICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIG9ianNbaV0uZmlsdGVycy5wdXNoKGZpbHRlcilcbiAgICBvYmpzW2ldLmFwcGx5RmlsdGVycygpXG4gIH1cbiAgcmVuZGVyQWxsQ2FudmFzZXMoKVxufVxuXG52YXIgRGlzcnVwdGlvbiA9IHtcblx0Y29taWM6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9jb21pYyhvYmpzKSB7XG4gICAgICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBvYmpzW2ldLmZvbnRGYW1pbHkgPSAnXCJDb21pYyBTYW5zIE1TXCInXG4gICAgICB9XG4gICAgfVxuICAgIF9jb21pYyggYWxsRWxlbWVudHMoJ3RleHQnKSApXG4gICAgX2NvbWljKCBhbGxFbGVtZW50cygndGV4dGJveCcpIClcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnQ2FuXFwndCB5b3Ugc3BpY2UgdGhlIHR5cG9ncmFwaHkgYSBiaXQ/JywgJ0d1dGVuYmVyZycpXG5cdH0sXG5cdHJvdGF0ZUltZ3NOb3N0b3A6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9yb3RhdGVJbWdzTm9zdG9wKG9ianMpIHtcbiAgICAgIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIG9ianNbaV0ub3JpZ2luWCA9ICdjZW50ZXInXG4gICAgICAgIG9ianNbaV0ub3JpZ2luWSA9ICdjZW50ZXInXG4gICAgICAgIG9ianNbaV0ucm90YXRlKDApLmFuaW1hdGUoeyBhbmdsZTogMzYwIH0sIHtcbiAgICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgICBvbkNoYW5nZTogb2Jqc1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQob2Jqc1tpXS5jYW52YXMpLFxuICAgICAgICAgIG9uQ29tcGxldGU6IGZ1bmN0aW9uKCl7IF9yb3RhdGVJbWdzTm9zdG9wKG9ianMpIH0sXG4gICAgICAgICAgZWFzaW5nOiBmdW5jdGlvbih0LCBiLCBjLCBkKSB7IHJldHVybiBjKnQvZCArIGIgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfcm90YXRlSW1nc05vc3RvcChhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICBjcml0aWNTYXlzKCdJIGZpbmQgdGhpcyBsYXlvdXQgYSBiaXQgc3RhdGljLi4uJywgJ0d1dGVuYmVyZycpXG5cdH0sXG5cdGxvY2tSYW5kUGFnZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhjYW52YXNlcylcbiAgICByYW5kQ2FudmFzID0gY2FudmFzZXNba2V5c1sga2V5cy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXVxuXHRcdHJhbmRDYW52YXMuc2VsZWN0aW9uID0gZmFsc2U7XG5cdFx0Zm9yIChvYmplY3RJZCBpbiByYW5kQ2FudmFzLmdldE9iamVjdHMoKSApIHtcblx0XHRcdHZhciBvYmplY3QgPSByYW5kQ2FudmFzLml0ZW0ob2JqZWN0SWQpXG5cdFx0XHRvYmplY3Quc2VsZWN0YWJsZSA9IGZhbHNlXG5cdFx0XHRvYmplY3QuaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCdcblx0XHR9XG5cdFx0cmFuZENhbnZhcy5hZGQobmV3IGZhYnJpYy5MaW5lKFswLCAwLCByYW5kQ2FudmFzLndpZHRoLCByYW5kQ2FudmFzLmhlaWdodF0sIHtcblx0ICBcdHN0cm9rZTogJ3JlZCcsXG5cdCAgXHRzZWxlY3RhYmxlOiBmYWxzZSxcblx0ICBcdHN0cm9rZVdpZHRoOiAyLFxuICAgICAgaWQ6ICdsb2NrJ1xuXHRcdH0pKVxuXHRcdHJhbmRDYW52YXMucmVuZGVyQWxsKCk7XG5cdFx0Ly8gVE9ETzogcHJldmVudCBkcm9wXG4gICAgY3JpdGljU2F5cygnUGFnZSAnICsgcmFuZENhbnZhcy5pZCArICcgaXMgbm93IGxvY2tlZC4uLicsICdHdXRlbmJlcmcnKSAvLyBUT0RPXG5cdH0sXG4gIHNodWZmbGVQYWdlczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRvU2h1ZmZsZSA9IFtdXG4gICAgdmFyIGkgPSAwXG4gICAgZm9yIChjYW52YXNJZCBpbiBjYW52YXNlcykge1xuICAgICAgaWYgKGkgPiAwKSB7IC8vIHByZXZlbnQgc2h1ZmZsaW5nIGZpcnN0IHBhZ2VcbiAgICAgICAgdG9TaHVmZmxlLnB1c2goIGNhbnZhc2VzW2NhbnZhc0lkXS50b0pTT04oKSApXG4gICAgICB9XG4gICAgICBpICs9IDFcbiAgICB9XG4gICAgc2h1ZmZsZUFycmF5KHRvU2h1ZmZsZSlcbiAgICB2YXIgeSA9IDBcbiAgICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoeSA+IDApIHtcbiAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLmxvYWRGcm9tSlNPTih0b1NodWZmbGVbeSAtIDFdLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsLmJpbmQoY2FudmFzZXNbY2FudmFzSWRdKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgeSArPSAxXG4gICAgfVxuICAgIGNyaXRpY1NheXMoJ1RoZSByeXRobSBvZiB0aGlzIHB1YmxpY2F0aW9uIGlzIGEgYml0IHdlYWsuIERvblxcJ3QgeW91IHRoaW5rPycsICdHdXRlbmJlcmcnKVxuICB9LFxuXHRhZHM6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNhbnZhc2VzKVxuICAgIHJhbmRDYW52YXMgPSBjYW52YXNlc1trZXlzWyBrZXlzLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dXG5cdFx0cmFuZENhbnZhcy5hZGQobmV3IGZhYnJpYy5SZWN0KHtcblx0XHRcdHdpZHRoOiByYW5kQ2FudmFzLndpZHRoLFxuXHRcdFx0aGVpZ2h0OiAzMCxcblx0XHRcdGZpbGw6ICcjMEQyMTNFJyxcblx0XHRcdGxvY2tNb3ZlbWVudFg6IHRydWUsXG5cdFx0XHRsb2NrTW92ZW1lbnRZOiB0cnVlLFxuXHRcdFx0bG9ja1JvdGF0aW9uOiB0cnVlLFxuXHRcdFx0aGFzQ29udHJvbHM6IGZhbHNlLFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG5cdFx0XHRsZWZ0OiByYW5kQ2FudmFzLndpZHRoLzIsXG5cdFx0XHR0b3A6IDE1LFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBpZDogJ2xvY2snXG5cdFx0fSkpO1xuXHRcdGZhYnJpYy5JbWFnZS5mcm9tVVJMKCcvYXNzZXRzL2ltZy9raW5rby5wbmcnLCBmdW5jdGlvbihpbWcpe1xuXHRcdFx0XHRpbWcuaGFzQm9yZGVycyA9IGZhbHNlO1xuXHRcdFx0XHRpbWcuaGFzQ29udHJvbHMgPSBmYWxzZTtcbiAgICAgICAgaW1nLnNlbGVjdGFibGUgPSBmYWxzZTtcblx0XHRcdFx0aW1nLnNjYWxlKDAuMik7XG5cdFx0XHRcdGltZy5sZWZ0ID0gcmFuZENhbnZhcy53aWR0aC0xMDA7XG5cdFx0XHRcdGltZy50b3AgPSA1MDtcblx0XHRcdFx0aW1nLmxvY2tNb3ZlbWVudFggPSB0cnVlO1xuXHRcdFx0XHRpbWcubG9ja01vdmVtZW50WSA9IHRydWU7XG5cdFx0XHRcdGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuXHRcdFx0XHRpbWcuc2V0Q29udHJvbHNWaXNpYmlsaXR5ID0gZmFsc2U7XG5cdFx0XHRcdHJhbmRDYW52YXMuaW5zZXJ0QXQoaW1nLDMpO1xuICAgICAgICBpbWcuaWQgPSAnbG9jaydcblx0XHRcdFx0Ly8gVE9ETzogaXQgb25seSB3b3JrcyB3aXRoIG9uZSBpbWFnZSBmb3Igc29tZSByZWFzb24uIHJ1bm5pbmcgdGhlIGZ1bmN0aW9uIG11bHRpcGxlIHRpbWVzIGl0IGFkZHMgbW9yZSB0b3AgYmFycyBidXQganVzdCBtb3ZlcyBhbGwgdGhlIGltYWdlcyB0byB0aGUgc2FtZSBwbGFjZVxuXHRcdH0pO1xuXG4gICAgY3JpdGljU2F5cygnSSBmb3VuZCBhIHNwb25zb3IhJywgJ0d1dGVuYmVyZycpXG5cdH0sXG4gIGhhbGZUaW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDJcbiAgICBjcml0aWNTYXlzKCdUaGlzIGlzIHRha2luZyB0b28gbG9uZy4uLicsICdHdXRlbmJlcmcnKVxuICB9LFxuICBkb3VibGVUaW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAqIDJcbiAgICBjcml0aWNTYXlzKCdUYWtlIHlvdXIgdGltZS4uLicsICdHdXRlbmJlcmcnKVxuICB9LFxuICBncmV5c2NhbGVJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuR3JheXNjYWxlKCkgKVxuICAgIGNyaXRpY1NheXMoJ1NoYWxsIHdlIG1ha2UgaXQgbG9vayBjbGFzc2ljPycsICdHdXRlbmJlcmcnKVxuICB9LFxuICBpbnZlcnRJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuSW52ZXJ0KCkgKVxuICAgIGNyaXRpY1NheXMoJ1RoZSB2aXN1YWxzIG5lZWQgc29tZSBlZGd5IGNvbG9ycycsICdHdXRlbmJlcmcnKVxuICB9LFxuICBzZXBpYUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5TZXBpYSgpIClcbiAgICBjcml0aWNTYXlzKCdFdmVyIGhlYXJkIG9mIEluc3RhZ3JhbT8nLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgYmxhY2t3aGl0ZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5CbGFja1doaXRlKCkgKVxuICAgIGNyaXRpY1NheXMoJ1RoaXMgc2hvdWxkIGxvb2sgbGlrZSBhIHppbmUhJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIHBpeGVsYXRlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLlBpeGVsYXRlKHtibG9ja3NpemU6IDIwfSkgKVxuICAgIGNyaXRpY1NheXMoJ0lzblxcJ3QgdGhpcyBhIHZpZGVvZ2FtZSBhZnRlciBhbGw/JywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIG5vaXNlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLk5vaXNlKHtub2lzZTogMjAwfSkgKVxuICAgIGNyaXRpY1NheXMoJ01BS0UgU09NRSBOT09JU0UhIScsICdHdXRlbmJlcmcnKVxuICB9LFxuICBmb250U2l6ZUJpZ2dlcjogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2ZvbnRTaXplQmlnZ2VyKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCgnZm9udFNpemUnLCBlbGVtZW50c1tpXS5mb250U2l6ZSAqIHNjYWxlRm9udCk7XG4gICAgICB9XG4gICAgfVxuICAgIF9mb250U2l6ZUJpZ2dlcihhbGxFbGVtZW50cygndGV4dGJveCcpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdDYW5cXCd0IHJlYWQgYW55dGhpbmcgOignLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgZm9udFNpemVTbWFsbGVyOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfZm9udFNpemVCaWdnZXIoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KCdmb250U2l6ZScsIGVsZW1lbnRzW2ldLmZvbnRTaXplIC8gc2NhbGVGb250KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2ZvbnRTaXplQmlnZ2VyKGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0lcXCdtIG5vdCBibGluZCEnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgYmlnZ2VySW1nczogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2JpZ2dlckltZ3MoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBzY2FsZVk6IHNjYWxlSW1ncyxcbiAgICAgICAgICBzY2FsZVg6IHNjYWxlSW1nc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2JpZ2dlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0JMT1cgVVAhJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGxvY2tBbGxFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgbG9ja0VsZW1lbnRzKGFsbEVsZW1lbnRzKCkpXG4gICAgY3JpdGljU2F5cygnVGhpbmdzIGFyZSBwZXJmZWN0IGFzIHRoZXkgYXJlLicsICdHdXRlbmJlcmcnKSAgICBcbiAgfVxuXG59OyJdLCJmaWxlIjoibWFpbi5qcyJ9
