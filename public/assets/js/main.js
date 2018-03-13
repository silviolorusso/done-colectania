// --- DEFAULTS

var disruptionsOn = true
var dropDelay = 100
var disruptionInterval = 5000
var bonusTime = 1000
var textChunksLength = 1500
var fontSize = 15
var scaleFont = 1.5
var scaleUpImgs = 0.7
var scaleDownImgs = 0.7
var achievementSpan = 3
var drawingModeTime = 10000



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

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var time = date + ' ' + month + ' ' + year;
  return time;
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
var title
var authors
function initCanvases() {
	$('canvas').each(function(i) {
		canvas = new fabric.Canvas(this);
	  canvas.setWidth( $(this).closest('.page').width() );
		canvas.setHeight( $(this).closest('.page').height() );
    canvas.backgroundColor = 'white';
    canvas.id = 'p' + (i+1);

		canvases['p' + (i + 1)] = canvas;

    if (window.location.href.indexOf('saved') >= 0) { // if  saved
      canvas.selection = false
    }

	});
	fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center' // origin at the center
  if (window.location.href.indexOf('saved') < 0) { // if not saved
  	title = new fabric.Textbox('Insert Title', {
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
    }).on('editing:exited', function(e) {
      Publication.title = this.text
      this.selectable = false
      this.hasControls = false
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
  	authors = new fabric.Textbox('Insert Authors', {
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
    }).on('editing:exited', function(e) {
      Publication.authors = this.text
      this.selectable = false
      this.hasControls = false
    })
  	canvases['p1'].add(authors)
    var date = new fabric.Text( timeConverter(Publication.date), {
      top: 600,
      left: canvases['p8'].width/2,
      fontFamily: 'AGaramondPro, serif',
      fill: '#777',
      lineHeight: 1.1,
      fontSize: 14,
      textAlign: 'center',
      // width: canvases['p1'].width,
      selectable: false,
      hasControls: false,
      hoverCursor: 'default',
      originX: 'center',
      originY: 'top',
      id: 'lock'
    })
    canvases['p8'].add(date);
    fabric.Image.fromURL('/assets/img/fotocolectania-logo.png', function(img){
      img.hasBorders = false;
      img.hasControls = false;
      img.selectable = false;
      img.scale(0.12);
      img.left = canvases['p8'].width/2;
      img.top = 530;
      img.lockMovementX = true;
      img.lockMovementY = true;
      img.lockRotation = true;
      img.setControlsVisibility = false;
      img.hoverCursor = 'default';
      img.id = 'lock';
      canvases['p8'].insertAt(img);
    })
  }
}
$(document).keydown(function(e) { // del or backspace to delete
  if( e.which == 8 || e.which == 46) {
    for (canvas in canvases) {
      if (canvases[canvas].getActiveObject()) {
        canvases[canvas].remove(canvases[canvas].getActiveObject());
      }
    }
  }
})



// --- M-V-C

var Publication = {
	// all our states
	id: makeId(),
	title: 'Untitled',
	timeLeft: 9000000,
	expired: false,
	authors: 'Anonymous',
  date: Date.now(),
  imagesAmount: 0,
  textAmount: 0,
  timeElapsed: 0, // TODO set this when time expires
  achievementsAmount: 0,
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
		showTime(Publication)
	} else {  // expired
		showExpired()
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


          Publication.imagesAmount += 1 // achievement every x imgs
          if (Publication.imagesAmount%achievementSpan == 0) {
            achievement(100 * Publication.imagesAmount, Publication.imagesAmount + ' images added!')
          }
          if (Publication.imagesAmount == 3) {
            $('#done').css('display','inline-block')
            criticSays('You can now save your publication!')
          }
          // start disruptions after first image
          if (  Publication.imagesAmount == 1 &&
                getUrlParameter('disruptions') != 'false' &&
                disruptionsOn == true &&
                typeof y === 'undefined') {
            y = setInterval(function() { // launch a random disruption
              disruptions = Object.keys(Disruption)
              Disruption[disruptions[ disruptions.length * Math.random() << 0]]()
              shake(pages)
            }, disruptionInterval)
          }

          addtime(bonusTime)
					criticSays()

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

          Publication.textAmount += input.data.length
          if (Publication.textAmount >= 500) {
            achievement(500, 'More than 500 characters added')
          }

					addtime(bonusTime * 2)
          criticSays('This is gonna be a goood read')

					break
			case input.data &&
				!input.data.includes('data:image') &&
				!input.data.includes('data:text/plain'): // neither an image nor text
					Error.notAllowed()
					break
			case input.move == true : // moving or scaling an image
					Publication.pages[input.page] = canvases[input.page].toJSON()
					break
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
			Publication.timeLeft = timeSet = getUrlParameter('time')
		}
		x = setInterval(function() {
			Publication.timeLeft = Publication.timeLeft - 10;
			controller(Publication);
		}, 10)
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
  var pointer = canvas.getPointer(e)
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
  if (Publication.expired != true) {
    Publication.timeElapsed = timeSet - Publication.timeLeft
    Publication.expired = true
    lockElements(allElements())
    setTimeout(function(){
      $('.suggestions').hide()
    }, 800)
  	document.getElementById('counter').style.display = 'none';
  	$('body').addClass('expired')
  	expiredTime()
    for (canvas in canvases) {
      canvases[canvas].selection = false
    }
  	setTimeout(function () {
  		$('.wrapper').addClass('saved_view');
  		savedState()
  	}, 500)
  	clearInterval(x)
    if (typeof y !== 'undefined') { // if disruptions
      clearInterval(y)
    }
  }
}

function dropElement(pageId, data, mousePos, callback) {
	console.log(mousePos)
	var element = { data: data, page: pageId }
	var elementPos = createElement(element, mousePos, callback)
	Sound.ding()
	$('.droppable').removeClass('droppable');
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
		alertMessage('Too late amigo');
	}
}





// --- SAVED

function renderPublication(Publication) {
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
	rotateImgsRand: function() {
    function _rotateImgsRand(objs) {
      for (var i = objs.length - 1; i >= 0; i--) {
        objs[i].originX = 'center'
        objs[i].originY = 'center'
        objs[i].animate({ angle: Math.floor(Math.random() * 360) }, {
          duration: 1000,
          onChange: objs[i].canvas.renderAll.bind(objs[i].canvas),
          easing: function(t, b, c, d) { return c*t/d + b }
        })
      }
    }
    _rotateImgsRand(allElements('image'))
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
      hoverCursor:'default',
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
        img.id = 'lock'
				randCanvas.insertAt(img,3);
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
    _fontSizeSmaller(allElements('textbox'))
    renderAllCanvases()
    criticSays('I\'m not blind!', 'Gutenberg')
  },
  biggerImgs: function() {
    function _biggerImgs(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set({
          scaleY: scaleUpImgs,
          scaleX: scaleUpImgs
        });
      }
    }
    _biggerImgs(allElements('image'))
    renderAllCanvases()
    criticSays('BLOW UP!', 'Gutenberg')
  },
  smallerImgs: function() {
    function _smallerImgs(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set({
          scaleY: scaleDownImgs,
          scaleX: scaleDownImgs
        });
      }
    }
    _smallerImgs(allElements('image'))
    renderAllCanvases()
    criticSays('BLOW UP!', 'Gutenberg')
  },
  lockAllElements: function() {
    lockElements(allElements())
    criticSays('Things are perfect as they are.', 'Gutenberg')
  },
  skewAllElements: function() {
    function _skewAllElements(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set({
          scaleY: scaleUpImgs,
          scaleX: scaleUpImgs,
          transformMatrix: [1, .50, 0, 1, 0, 0]
        })
      }
    }
    _skewAllElements(allElements('image'))
    renderAllCanvases()
    criticSays('Stretch those images, come on!', 'Gutenberg')
  },
  flipAllImgs: function() {
    function _flipAllImgs(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set({
          angle: '-180',
          flipY: true
        })
      }
    }
    _flipAllImgs(allElements('image'))
    renderAllCanvases()
    criticSays('Flip those images, come on!', 'Gutenberg')
  },
  bitLeftbitRightAllImgs: function() {
    function _bitLeftbitRightAllImgs(elements, distance) {
      var duration = 200
      var pause = 100

      function left1(i, elements) {
        setTimeout(function(){
          elements[i].animate('left', elements[i].left + distance + Math.floor(Math.random() * 10), { // a bit of randomness to make it more human
            duration: duration + Math.floor(Math.random() * 100),
            onChange: elements[i].canvas.renderAll.bind(elements[i].canvas),
          })
        }, 0)
      }
      function left2(i, elements) {
        setTimeout(function(){
          elements[i].animate('left', elements[i].left + distance + Math.floor(Math.random() * 10), {
            duration: duration + Math.floor(Math.random() * 100),
            onChange: elements[i].canvas.renderAll.bind(elements[i].canvas),
          })
        }, duration + pause)
      }
      function right1(i, elements) {
        setTimeout(function(){
          elements[i].animate('left', elements[i].left - distance - Math.floor(Math.random() * 10), {
            duration: duration + Math.floor(Math.random() * 100),
            onChange: elements[i].canvas.renderAll.bind(elements[i].canvas),
          })
        }, (duration + pause) * 2 )
      }
      function right2(i, elements) {
        setTimeout(function(){
          elements[i].animate('left', elements[i].left - distance - Math.floor(Math.random() * 10), {
            duration: duration + Math.floor(Math.random() * 100),
            onChange: elements[i].canvas.renderAll.bind(elements[i].canvas),
          })
        }, (duration + pause) * 3 )
      }
      for (var i = 0; i < elements.length; i++) {
        left1(i, elements)
        left2(i, elements)
        right1(i, elements)
        right2(i, elements)
      }
    }
    _bitLeftbitRightAllImgs(allElements('image'), 70)
    renderAllCanvases()
    criticSays('A bit to the right... No no, a bit to the left...', 'Gutenberg')
  },
  rigidMode: function() {
    function _rigidMode(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set({
          lockMovementY: true,
          lockRotation: true
        })
      }
    }
    _rigidMode(allElements('image'), 70)
    renderAllCanvases()
    criticSays('Respect the grid!', 'Gutenberg')
  },
  betterTitle: function() {
    var titles = [
      'Don Quixote',
      'In Search of Lost Time',
      'Ulysses',
      'The Odyssey',
      'War and Peace',
      'Moby Dick',
      'The Divine Comedy',
      'Hamlet',
      'The Great Gatsby',
      'The Iliad'
    ]
    var randTitle = titles[Math.floor(Math.random() * titles.length)]
    title.text = randTitle
    renderAllCanvases()
    Publication.title = randTitle
    criticSays('I suggest a catchier title', 'Gutenberg')
  },
  betterAuthors: function() { // TODO: not sure why this doesn't work
    var authors = [
      'Leo Tolstoy',
      'Fyodor Dostoevsky',
      'William Shakespeare',
      'Charles Dickens',
      'Homer',
      'J. R. R. Tolkien',
      'George Orwell',
      'Edgar Allan Poe',
      'Mark Twain',
      'Victor Hugo'
    ]
    var randAuthor = authors[Math.floor(Math.random() * authors.length)]
    authors.text = randAuthor
    renderAllCanvases()
    Publication.authors = randAuthor
    criticSays('We need a well-known testimonial.', 'Gutenberg')
  },
  drawingMode: function() { // TODO: not sure why this doesn't work
    for (canvas in canvases) {
      canvases[canvas].isDrawingMode = true
      canvases[canvas].backgroundColor = '#ffffaa'
      canvases[canvas].renderAll()
    }
    setTimeout(function() {
      for (canvas in canvases) {
        canvases[canvas].isDrawingMode = false
        canvases[canvas].backgroundColor = '#ffffff'
        canvases[canvas].renderAll()
      }
    }, drawingModeTime)
    criticSays('Do you like to draw?', 'Gutenberg')
  }
}





// --- INTERFACE BUTTONS

$('.button.save').click(function() {
  $('.button.save').hide()
  $('.button.pdf, .button.booklet').css('display','inline-block')
})

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBERUZBVUxUU1xuXG52YXIgZGlzcnVwdGlvbnNPbiA9IHRydWVcbnZhciBkcm9wRGVsYXkgPSAxMDBcbnZhciBkaXNydXB0aW9uSW50ZXJ2YWwgPSA1MDAwXG52YXIgYm9udXNUaW1lID0gMTAwMFxudmFyIHRleHRDaHVua3NMZW5ndGggPSAxNTAwXG52YXIgZm9udFNpemUgPSAxNVxudmFyIHNjYWxlRm9udCA9IDEuNVxudmFyIHNjYWxlVXBJbWdzID0gMC43XG52YXIgc2NhbGVEb3duSW1ncyA9IDAuN1xudmFyIGFjaGlldmVtZW50U3BhbiA9IDNcbnZhciBkcmF3aW5nTW9kZVRpbWUgPSAxMDAwMFxuXG5cblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcblx0dmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcblx0dmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG5cdHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gYnl0ZUNvdW50KHMpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJKHMpLnNwbGl0KC8lLi58Li8pLmxlbmd0aCAtIDE7XG59XG5cbnZhciBnZXRVcmxQYXJhbWV0ZXIgPSBmdW5jdGlvbiBnZXRVcmxQYXJhbWV0ZXIoc1BhcmFtKSB7XG4gIHZhciBzUGFnZVVSTCA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSksXG4gICAgc1VSTFZhcmlhYmxlcyA9IHNQYWdlVVJMLnNwbGl0KCcmJyksXG4gICAgc1BhcmFtZXRlck5hbWUsXG4gICAgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgc1VSTFZhcmlhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgIHNQYXJhbWV0ZXJOYW1lID0gc1VSTFZhcmlhYmxlc1tpXS5zcGxpdCgnPScpO1xuXG4gICAgaWYgKHNQYXJhbWV0ZXJOYW1lWzBdID09PSBzUGFyYW0pIHtcbiAgICAgICAgcmV0dXJuIHNQYXJhbWV0ZXJOYW1lWzFdID09PSB1bmRlZmluZWQgPyB0cnVlIDogc1BhcmFtZXRlck5hbWVbMV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNodWZmbGVBcnJheShhcnJheSkge1xuICBmb3IgKHZhciBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgIHZhciBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgdmFyIHRlbXAgPSBhcnJheVtpXTtcbiAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgIGFycmF5W2pdID0gdGVtcDtcbiAgfVxufVxuXG5mdW5jdGlvbiB0aW1lQ29udmVydGVyKFVOSVhfdGltZXN0YW1wKXtcbiAgdmFyIGEgPSBuZXcgRGF0ZShVTklYX3RpbWVzdGFtcCk7XG4gIHZhciBtb250aHMgPSBbJ0phbicsJ0ZlYicsJ01hcicsJ0FwcicsJ01heScsJ0p1bicsJ0p1bCcsJ0F1ZycsJ1NlcCcsJ09jdCcsJ05vdicsJ0RlYyddO1xuICB2YXIgeWVhciA9IGEuZ2V0RnVsbFllYXIoKTtcbiAgdmFyIG1vbnRoID0gbW9udGhzW2EuZ2V0TW9udGgoKV07XG4gIHZhciBkYXRlID0gYS5nZXREYXRlKCk7XG4gIHZhciB0aW1lID0gZGF0ZSArICcgJyArIG1vbnRoICsgJyAnICsgeWVhcjtcbiAgcmV0dXJuIHRpbWU7XG59XG5cblxuXG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MsIGNhbGxiYWNrKSB7XG4gIGZ1bmN0aW9uIGNodW5rU3RyaW5nKHN0ciwgbGVuZ3RoKSB7XG4gICAgcmV0dXJuIHN0ci5tYXRjaChuZXcgUmVnRXhwKCd7LjEsJyArIGxlbmd0aCArICd9JywgJ2cnKSk7XG4gIH1cblx0dmFyIHRoZU1vdXNlUG9zID0gbW91c2VQb3Ncblx0aWYgKGVsZW1lbnQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpKSB7XG5cdFx0ZmFicmljLkltYWdlLmZyb21VUkwoZWxlbWVudC5kYXRhLCBmdW5jdGlvbihteUltZywgY2FsbGJhY2spIHtcbiBcdFx0XHR2YXIgaW1nID0gbXlJbWcuc2V0KHsgbGVmdDogMCwgdG9wOiAwLCB3aWR0aDogbXlJbWcud2lkdGgsIGhlaWdodDogbXlJbWcuaGVpZ2h0fSk7XG4gXHRcdFx0aWYgKCBpbWcud2lkdGggPiBjYW52YXNlc1tlbGVtZW50LnBhZ2VdLndpZHRoICkge1xuIFx0XHRcdFx0aW1nLnNjYWxlVG9XaWR0aChjYW52YXNlc1tlbGVtZW50LnBhZ2VdLndpZHRoIC8gMTAwICogNTAgKTsgLy8gNTAlIG9mIHRoZSBjYW52YXNcbiBcdFx0XHR9XG4gXHRcdFx0aW1nLmxlZnQgPSB0aGVNb3VzZVBvcy54XG4gXHRcdFx0aW1nLnRvcCA9IHRoZU1vdXNlUG9zLnlcbiBcdFx0XHRpbWcub24oJ2FkZGVkJywgZnVuY3Rpb24oKSB7XG4gXHRcdFx0XHRjYWxsYmFjaztcbiBcdFx0XHR9KTtcbiBcdFx0XHRjYW52YXNlc1tlbGVtZW50LnBhZ2VdLmFkZChpbWcpXG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGRlQmFzZWRUZXh0ID0gYXRvYihlbGVtZW50LmRhdGEuc3Vic3RyaW5nKDIzKSk7XG4gICAgY2h1bmtzID0gZGVCYXNlZFRleHQubWF0Y2gobmV3IFJlZ0V4cCgnKC58W1xcclxcbl0pezEsJyArIHRleHRDaHVua3NMZW5ndGggKyAnfScsICdnJykpXG4gICAgdmFyIGN1cnJQYWdlID0gcGFyc2VJbnQoIGVsZW1lbnQucGFnZS5zdWJzdHIoZWxlbWVudC5wYWdlLmxlbmd0aCAtIDEpIClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGNhbnZhc2VzWydwJyArIChjdXJyUGFnZSArIGkpXSkge1xuICAgICAgICBjYW52YXNlc1sncCcgKyAoY3VyclBhZ2UgKyBpKV0uYWRkKG5ldyBmYWJyaWMuVGV4dGJveChjaHVua3NbaV0gKyAnLScsIHtcbiAgICAgICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgICAgICAgIGxlZnQ6IDIwLFxuICAgICAgICAgIHRvcDogMjAsXG4gICAgICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgICAgIHdpZHRoOiA0MTAsXG4gICAgICAgICAgYnJlYWtXb3JkczogdHJ1ZSxcbiAgICAgICAgICBvcmlnaW5YOiAnbGVmdCcsXG4gICAgICAgICAgb3JpZ2luWTogJ3RvcCdcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfVxuXHRcdGNhbGxiYWNrO1xuXHR9XG59XG5cblxuLy8gLS0tIGluaXRpYWxpemUgY2FudmFzZXNcbnZhciBjYW52YXNlcyA9IHt9XG52YXIgdGl0bGVcbnZhciBhdXRob3JzXG5mdW5jdGlvbiBpbml0Q2FudmFzZXMoKSB7XG5cdCQoJ2NhbnZhcycpLmVhY2goZnVuY3Rpb24oaSkge1xuXHRcdGNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKHRoaXMpO1xuXHQgIGNhbnZhcy5zZXRXaWR0aCggJCh0aGlzKS5jbG9zZXN0KCcucGFnZScpLndpZHRoKCkgKTtcblx0XHRjYW52YXMuc2V0SGVpZ2h0KCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykuaGVpZ2h0KCkgKTtcbiAgICBjYW52YXMuYmFja2dyb3VuZENvbG9yID0gJ3doaXRlJztcbiAgICBjYW52YXMuaWQgPSAncCcgKyAoaSsxKTtcblxuXHRcdGNhbnZhc2VzWydwJyArIChpICsgMSldID0gY2FudmFzO1xuXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPj0gMCkgeyAvLyBpZiAgc2F2ZWRcbiAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZVxuICAgIH1cblxuXHR9KTtcblx0ZmFicmljLk9iamVjdC5wcm90b3R5cGUub3JpZ2luWCA9IGZhYnJpYy5PYmplY3QucHJvdG90eXBlLm9yaWdpblkgPSAnY2VudGVyJyAvLyBvcmlnaW4gYXQgdGhlIGNlbnRlclxuICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA8IDApIHsgLy8gaWYgbm90IHNhdmVkXG4gIFx0dGl0bGUgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBUaXRsZScsIHtcbiAgXHQgIHRvcDogMTIwLFxuICBcdCAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybywgc2VyaWYnLFxuICBcdCAgZmlsbDogJyM3NzcnLFxuICBcdCAgbGluZUhlaWdodDogMS4xLFxuICBcdCAgZm9udFNpemU6IDMwLFxuICBcdCAgZm9udFdlaWdodDogJ2JvbGQnLFxuICBcdCAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgXHQgIHdpZHRoOiBjYW52YXNlc1sncDEnXS53aWR0aCxcbiAgXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxuICBcdCAgaG92ZXJDdXJzb3I6ICdkZWZhdWx0JyxcbiAgXHQgIG9yaWdpblg6ICdsZWZ0JyxcbiAgXHQgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJyxcbiAgICAgIGNhY2hlOiBmYWxzZVxuICBcdH0pLm9uKCdlZGl0aW5nOmVudGVyZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGhpcy50ZXh0ID0gJ0luc2VydCBUaXRsZScpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJydcbiAgICAgICAgdGhpcy5oaWRkZW5UZXh0YXJlYS52YWx1ZSA9ICcnXG4gICAgICB9XG4gICAgfSkub24oJ2VkaXRpbmc6ZXhpdGVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgUHVibGljYXRpb24udGl0bGUgPSB0aGlzLnRleHRcbiAgICAgIHRoaXMuc2VsZWN0YWJsZSA9IGZhbHNlXG4gICAgICB0aGlzLmhhc0NvbnRyb2xzID0gZmFsc2VcbiAgICB9KVxuICBcdGNhbnZhc2VzWydwMSddLmFkZCh0aXRsZSlcbiAgXHR2YXIgbGluZUxlbmdodCA9IDI1MFxuICBcdGNhbnZhc2VzWydwMSddLmFkZChuZXcgZmFicmljLkxpbmUoWzAsIDAsIGxpbmVMZW5naHQsIDBdLCB7XG4gIFx0XHRsZWZ0OiAoIGNhbnZhc2VzWydwMSddLndpZHRoIC0gbGluZUxlbmdodCkgLyAyLFxuICBcdCAgdG9wOiAxNjAsXG4gIFx0ICBzdHJva2U6ICcjMjIyJyxcbiAgXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuICBcdCBcdG9yaWdpblg6ICdsZWZ0JyxcbiAgXHQgIG9yaWdpblk6ICd0b3AnXG4gIFx0fSkpO1xuICBcdGF1dGhvcnMgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBBdXRob3JzJywge1xuICBcdCAgdG9wOiAxODAsXG4gIFx0ICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvLCBzZXJpZicsXG4gIFx0ICBmaWxsOiAnIzc3NycsXG4gIFx0ICBsaW5lSGVpZ2h0OiAxLjEsXG4gIFx0ICBmb250U2l6ZTogMjAsXG4gIFx0ICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICBcdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuICBcdCAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXG4gIFx0ICBob3ZlckN1cnNvcjogJ2RlZmF1bHQnLFxuICBcdCAgb3JpZ2luWDogJ2xlZnQnLFxuICBcdCAgb3JpZ2luWTogJ3RvcCcsXG4gICAgICBpZDogJ2xvY2snXG4gIFx0fSkub24oJ2VkaXRpbmc6ZW50ZXJlZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aGlzLnRleHQgPSAnSW5zZXJ0IEF1dGhvcnMnKSB7XG4gICAgICAgIHRoaXMudGV4dCA9ICcnXG4gICAgICAgIHRoaXMuaGlkZGVuVGV4dGFyZWEudmFsdWUgPSAnJ1xuICAgICAgfVxuICAgIH0pLm9uKCdlZGl0aW5nOmV4aXRlZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIFB1YmxpY2F0aW9uLmF1dGhvcnMgPSB0aGlzLnRleHRcbiAgICAgIHRoaXMuc2VsZWN0YWJsZSA9IGZhbHNlXG4gICAgICB0aGlzLmhhc0NvbnRyb2xzID0gZmFsc2VcbiAgICB9KVxuICBcdGNhbnZhc2VzWydwMSddLmFkZChhdXRob3JzKVxuICAgIHZhciBkYXRlID0gbmV3IGZhYnJpYy5UZXh0KCB0aW1lQ29udmVydGVyKFB1YmxpY2F0aW9uLmRhdGUpLCB7XG4gICAgICB0b3A6IDYwMCxcbiAgICAgIGxlZnQ6IGNhbnZhc2VzWydwOCddLndpZHRoLzIsXG4gICAgICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvLCBzZXJpZicsXG4gICAgICBmaWxsOiAnIzc3NycsXG4gICAgICBsaW5lSGVpZ2h0OiAxLjEsXG4gICAgICBmb250U2l6ZTogMTQsXG4gICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgLy8gd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXG4gICAgICBob3ZlckN1cnNvcjogJ2RlZmF1bHQnLFxuICAgICAgb3JpZ2luWDogJ2NlbnRlcicsXG4gICAgICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgIGlkOiAnbG9jaydcbiAgICB9KVxuICAgIGNhbnZhc2VzWydwOCddLmFkZChkYXRlKTtcbiAgICBmYWJyaWMuSW1hZ2UuZnJvbVVSTCgnL2Fzc2V0cy9pbWcvZm90b2NvbGVjdGFuaWEtbG9nby5wbmcnLCBmdW5jdGlvbihpbWcpe1xuICAgICAgaW1nLmhhc0JvcmRlcnMgPSBmYWxzZTtcbiAgICAgIGltZy5oYXNDb250cm9scyA9IGZhbHNlO1xuICAgICAgaW1nLnNlbGVjdGFibGUgPSBmYWxzZTtcbiAgICAgIGltZy5zY2FsZSgwLjEyKTtcbiAgICAgIGltZy5sZWZ0ID0gY2FudmFzZXNbJ3A4J10ud2lkdGgvMjtcbiAgICAgIGltZy50b3AgPSA1MzA7XG4gICAgICBpbWcubG9ja01vdmVtZW50WCA9IHRydWU7XG4gICAgICBpbWcubG9ja01vdmVtZW50WSA9IHRydWU7XG4gICAgICBpbWcubG9ja1JvdGF0aW9uID0gdHJ1ZTtcbiAgICAgIGltZy5zZXRDb250cm9sc1Zpc2liaWxpdHkgPSBmYWxzZTtcbiAgICAgIGltZy5ob3ZlckN1cnNvciA9ICdkZWZhdWx0JztcbiAgICAgIGltZy5pZCA9ICdsb2NrJztcbiAgICAgIGNhbnZhc2VzWydwOCddLmluc2VydEF0KGltZyk7XG4gICAgfSlcbiAgfVxufVxuJChkb2N1bWVudCkua2V5ZG93bihmdW5jdGlvbihlKSB7IC8vIGRlbCBvciBiYWNrc3BhY2UgdG8gZGVsZXRlXG4gIGlmKCBlLndoaWNoID09IDggfHwgZS53aGljaCA9PSA0Nikge1xuICAgIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoY2FudmFzZXNbY2FudmFzXS5nZXRBY3RpdmVPYmplY3QoKSkge1xuICAgICAgICBjYW52YXNlc1tjYW52YXNdLnJlbW92ZShjYW52YXNlc1tjYW52YXNdLmdldEFjdGl2ZU9iamVjdCgpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cblxuXG4vLyAtLS0gTS1WLUNcblxudmFyIFB1YmxpY2F0aW9uID0ge1xuXHQvLyBhbGwgb3VyIHN0YXRlc1xuXHRpZDogbWFrZUlkKCksXG5cdHRpdGxlOiAnVW50aXRsZWQnLFxuXHR0aW1lTGVmdDogOTAwMDAwMCxcblx0ZXhwaXJlZDogZmFsc2UsXG5cdGF1dGhvcnM6ICdBbm9ueW1vdXMnLFxuICBkYXRlOiBEYXRlLm5vdygpLFxuICBpbWFnZXNBbW91bnQ6IDAsXG4gIHRleHRBbW91bnQ6IDAsXG4gIHRpbWVFbGFwc2VkOiAwLCAvLyBUT0RPIHNldCB0aGlzIHdoZW4gdGltZSBleHBpcmVzXG4gIGFjaGlldmVtZW50c0Ftb3VudDogMCxcblx0cGFnZXM6IHtcblx0XHRwMToge30sXG5cdFx0cDI6IHt9LFxuXHRcdHAzOiB7fSxcblx0XHRwNDoge30sXG5cdFx0cDU6IHt9LFxuXHRcdHA2OiB7fSxcblx0XHRwNzoge30sXG5cdFx0cDg6IHt9XG5cdH1cbn07XG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIGlucHV0KSB7XG5cdGlmIChQdWJsaWNhdGlvbi50aW1lTGVmdCA+IDApIHsgLy8gbm90IGV4cGlyZWRcblx0XHRzaG93VGltZShQdWJsaWNhdGlvbilcblx0fSBlbHNlIHsgIC8vIGV4cGlyZWRcblx0XHRzaG93RXhwaXJlZCgpXG5cdH1cblxuXHRpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSBmYWxzZSkge1xuXHRcdGNvbnNvbGUubG9nKGlucHV0KVxuXHRcdHN3aXRjaCAodHJ1ZSkge1xuXHRcdFx0Y2FzZSBpbnB1dC52aXNpYmxlID09IGZhbHNlOiAvLyBkZWxldGluZyBhbiBlbGVtZW50XG5cdFx0XHRcdFx0cmVtb3ZlRWxlbWVudChpbnB1dC5pZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGJ5dGVDb3VudChpbnB1dC5kYXRhKSA+IDEzOTgxMTcgOiAvLyBmaWxlIHRvbyBiaWcgKDFtYilcblx0XHRcdFx0IFx0RXJyb3IudG9vQmlnKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyBpbWFnZVxuXG5cdFx0XHRcdFx0dmFyIHB1YmxpY2F0aW9uVXBkYXRlID0gZnVuY3Rpb24oaW5wdXRQYWdlKSB7IC8vIHVwZGF0ZSBjYW52YXNcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFB1YmxpY2F0aW9uLnBhZ2VzW2lucHV0UGFnZV0gPSBjYW52YXNlc1tpbnB1dFBhZ2VdLnRvSlNPTigpIC8vIHNldHRpbWVvdXQgb3RoZXJ3aXNlIGl0IGRvZXNuJ3QgZ2V0IHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0XHR9LCAxKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBpbnB1dC5tb3VzZVBvcywgcHVibGljYXRpb25VcGRhdGUoaW5wdXQucGFnZSkpOyAvLyBkcm9wIGVsZW1lbnRcblxuXG4gICAgICAgICAgUHVibGljYXRpb24uaW1hZ2VzQW1vdW50ICs9IDEgLy8gYWNoaWV2ZW1lbnQgZXZlcnkgeCBpbWdzXG4gICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCVhY2hpZXZlbWVudFNwYW4gPT0gMCkge1xuICAgICAgICAgICAgYWNoaWV2ZW1lbnQoMTAwICogUHVibGljYXRpb24uaW1hZ2VzQW1vdW50LCBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKyAnIGltYWdlcyBhZGRlZCEnKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoUHVibGljYXRpb24uaW1hZ2VzQW1vdW50ID09IDMpIHtcbiAgICAgICAgICAgICQoJyNkb25lJykuY3NzKCdkaXNwbGF5JywnaW5saW5lLWJsb2NrJylcbiAgICAgICAgICAgIGNyaXRpY1NheXMoJ1lvdSBjYW4gbm93IHNhdmUgeW91ciBwdWJsaWNhdGlvbiEnKVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBzdGFydCBkaXNydXB0aW9ucyBhZnRlciBmaXJzdCBpbWFnZVxuICAgICAgICAgIGlmICggIFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCA9PSAxICYmXG4gICAgICAgICAgICAgICAgZ2V0VXJsUGFyYW1ldGVyKCdkaXNydXB0aW9ucycpICE9ICdmYWxzZScgJiZcbiAgICAgICAgICAgICAgICBkaXNydXB0aW9uc09uID09IHRydWUgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgeSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHsgLy8gbGF1bmNoIGEgcmFuZG9tIGRpc3J1cHRpb25cbiAgICAgICAgICAgICAgZGlzcnVwdGlvbnMgPSBPYmplY3Qua2V5cyhEaXNydXB0aW9uKVxuICAgICAgICAgICAgICBEaXNydXB0aW9uW2Rpc3J1cHRpb25zWyBkaXNydXB0aW9ucy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXSgpXG4gICAgICAgICAgICAgIHNoYWtlKHBhZ2VzKVxuICAgICAgICAgICAgfSwgZGlzcnVwdGlvbkludGVydmFsKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGFkZHRpbWUoYm9udXNUaW1lKVxuXHRcdFx0XHRcdGNyaXRpY1NheXMoKVxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyB0ZXh0XG5cblx0XHRcdFx0XHR2YXIgcHVibGljYXRpb25VcGRhdGUgPSBmdW5jdGlvbihpbnB1dFBhZ2UpIHsgLy8gdXBkYXRlIGNhbnZhc1xuXHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXRQYWdlXSA9IGNhbnZhc2VzW2lucHV0UGFnZV0udG9KU09OKCkgLy8gc2V0dGltZW91dCBvdGhlcndpc2UgaXQgZG9lc24ndCBnZXQgdGhlIGVsZW1lbnRcblx0XHRcdFx0XHRcdH0sIDEpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zLCBwdWJsaWNhdGlvblVwZGF0ZShpbnB1dC5wYWdlKSk7IC8vIGRyb3AgZWxlbWVudFxuXG4gICAgICAgICAgUHVibGljYXRpb24udGV4dEFtb3VudCArPSBpbnB1dC5kYXRhLmxlbmd0aFxuICAgICAgICAgIGlmIChQdWJsaWNhdGlvbi50ZXh0QW1vdW50ID49IDUwMCkge1xuICAgICAgICAgICAgYWNoaWV2ZW1lbnQoNTAwLCAnTW9yZSB0aGFuIDUwMCBjaGFyYWN0ZXJzIGFkZGVkJylcbiAgICAgICAgICB9XG5cblx0XHRcdFx0XHRhZGR0aW1lKGJvbnVzVGltZSAqIDIpXG4gICAgICAgICAgY3JpdGljU2F5cygnVGhpcyBpcyBnb25uYSBiZSBhIGdvb29kIHJlYWQnKVxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKTogLy8gbmVpdGhlciBhbiBpbWFnZSBub3IgdGV4dFxuXHRcdFx0XHRcdEVycm9yLm5vdEFsbG93ZWQoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0Lm1vdmUgPT0gdHJ1ZSA6IC8vIG1vdmluZyBvciBzY2FsaW5nIGFuIGltYWdlXG5cdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXQucGFnZV0gPSBjYW52YXNlc1tpbnB1dC5wYWdlXS50b0pTT04oKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkge1xuXHRcdC8vIHRvbyBsYXRlXG5cdFx0RXJyb3IudG9vTGF0ZSgpO1xuXHR9XG59XG5cblxuXG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxudmFyIHg7XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0aW5pdENhbnZhc2VzKClcblx0b25Nb2RFbGVtZW50KClcblx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPCAwKSB7XG5cdFx0Ly8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cblx0XHRpZiAoIGdldFVybFBhcmFtZXRlcigndGltZScpICkgeyAvLyBkaWZmaWN1bHR5XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IHRpbWVTZXQgPSBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKVxuXHRcdH1cblx0XHR4ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC0gMTA7XG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uKTtcblx0XHR9LCAxMClcblx0XHRtb3VzZUNvdW50ZXIoKVxuXHR9IGVsc2UgeyAvLyBzYXZlZCBwdWJsaWNhdGlvblxuXHRcdHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKVxuXHR9XG59KTtcblxuZnVuY3Rpb24gYWRkdGltZShib251c1RpbWUpIHtcblx0UHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCArIGJvbnVzVGltZTtcblx0YW5pbWF0ZXRpbWVjb3VudGVyKGJvbnVzVGltZSk7XG59XG5cbi8vIG1vZGlmeSBlbGVtZW50IGxpc3RlbmVyXG5mdW5jdGlvbiBvbk1vZEVsZW1lbnQoKSB7XG5cdGZvciAodmFyIHBhZ2VJZCBpbiBjYW52YXNlcykge1xuXHRcdGNhbnZhc2VzWyBwYWdlSWQgXS5vbignb2JqZWN0Om1vZGlmaWVkJywgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgcGFyZW50Q2FudmFzSWQgPSBldnQudGFyZ2V0LmNhbnZhcy5sb3dlckNhbnZhc0VsLmlkXG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IG1vdmU6IHRydWUsIHBhZ2U6IHBhcmVudENhbnZhc0lkfSlcblx0XHR9KVxuXHR9XG59XG5cbi8vIGdldCBtb3VzZSBwb3NpdGlvbiBvbiBjYW52YXNcbmZ1bmN0aW9uIGdldE1vdXNlUG9zKGNhbnZhcywgZSkge1xuICB2YXIgcG9pbnRlciA9IGNhbnZhcy5nZXRQb2ludGVyKGUpXG4gIHZhciBwb3NYID0gcG9pbnRlci54XG4gIHZhciBwb3NZID0gcG9pbnRlci55XG4gIHJldHVybiB7XG4gICAgeDogcG9zWCxcbiAgICB5OiBwb3NZXG4gIH1cbn1cblxuY29uc3QgcGFnZXMgPSAkKCcucGFnZScpXG4vLyBkcm9wIGVsZW1lbnRcbnBhZ2VzLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG5wYWdlcy5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbnBhZ2VzLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdGNvbnNvbGUubG9nKGUpO1xuXHR2YXIgZmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzO1xuXHR2YXIgeSA9IDA7XG5cdGZvciAodmFyIGkgPSBmaWxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0dmFyIHBhZ2VJZCA9ICQodGhpcykuZmluZCgnY2FudmFzJykuYXR0cignaWQnKTtcblx0XHRtb3VzZVBvcyA9IGdldE1vdXNlUG9zKGNhbnZhc2VzW3BhZ2VJZF0sIGUpXG5cdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdFx0XHRcdGRhdGE6IGV2ZW50LnRhcmdldC5yZXN1bHQsXG5cdFx0XHRcdFx0dmlzaWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRwYWdlOiBwYWdlSWQsXG5cdFx0XHRcdFx0bW91c2VQb3M6IG1vdXNlUG9zXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgeSAqIGRyb3BEZWxheSk7XG5cdFx0XHR5ICs9IDE7XG5cdFx0fTtcblx0XHRjb25zb2xlLmxvZyhmaWxlc1tpXSk7XG5cdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZXNbaV0pO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn0pO1xuLy8gcHJldmVudCBkcm9wIG9uIGJvZHlcbiQoJ2JvZHknKS5vbignZHJhZ292ZXInLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFNvdW5kLmVycm9yKCk7XG59KTtcblxuLy8gcmVtb3ZlIGVsZW1lbnQgKFRPRE86IFVQREFURSBGT1IgRkFCUklDKVxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jbG9zZScsIGZ1bmN0aW9uKCkge1xuXHR2YXIgcGFnZUlkID0gJCh0aGlzKVxuXHRcdC5jbG9zZXN0KCcucGFnZScpXG5cdFx0LmF0dHIoJ2lkJyk7XG5cdHZhciBlbGVtZW50SWQgPSAkKHRoaXMpXG5cdFx0LnBhcmVudCgpXG5cdFx0LmF0dHIoJ2lkJyk7XG5cdHZhciBlbGVtZW50RGF0YSA9ICQodGhpcylcblx0XHQuc2libGluZ3MoKVxuXHRcdC5hdHRyKCdzcmMnKTtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdGlkOiBlbGVtZW50SWQsXG5cdFx0ZGF0YTogZWxlbWVudERhdGEsXG5cdFx0cG9zOiBbMCwgMCwgMCwgMCwgMF0sXG5cdFx0dmlzaWJsZTogZmFsc2UsXG5cdFx0cGFnZTogcGFnZUlkXG5cdH0pO1xufSlcblxuXG5cblxuXG4vLyAtLS0gVklFV1xuXG52YXIgU291bmQgPSB7XG5cdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgYXVkaW8gPSBuZXcgQXVkaW8oJ2Fzc2V0cy9hdWRpby9pbmNvcnJlY3QubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9LFxuXHRkaW5nOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgYXVkaW8gPSBuZXcgQXVkaW8oJ2Fzc2V0cy9hdWRpby9kaW5nLm1wMycpO1xuXHRcdGF1ZGlvLnBsYXkoKTtcblx0fVxufTtcblxuLy8gVE9ETzogbWVyZ2UgdGhlc2UgdHdvXG5mdW5jdGlvbiBzaG93VGltZShQdWJsaWNhdGlvbikge1xuXHRzZWNvbmRzID0gUHVibGljYXRpb24udGltZUxlZnQgLyAxMDAwO1xuXHQkKCcjY291bnRlcicpLnNob3coKTtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKS5pbm5lckhUTUwgPVxuXHRcdHNlY29uZHMudG9GaXhlZCgyKSArICcgc2Vjb25kcyBsZWZ0ISc7XG59XG5mdW5jdGlvbiBtb3VzZUNvdW50ZXIoKSB7XG5cdCQoZG9jdW1lbnQpLmJpbmQoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoZS5wYWdlWCA+PSAkKGRvY3VtZW50KS53aWR0aCgpIC8gMikge1xuXHRcdFx0Ly8gaWYgbW91c2Ugb2YgcmlnaHQgc2lkZSBvZiBwYWdlXG5cdFx0XHQkKCcjY291bnRlcicpLmFkZENsYXNzKCdtb3VzZV9yaWdodCcpO1xuXHRcdFx0JCgnI2NvdW50ZXInKS5jc3Moe1xuXHRcdFx0XHRsZWZ0OiBlLnBhZ2VYIC0gMjAgLSAkKCcjY291bnRlcicpLndpZHRoKCksXG5cdFx0XHRcdHRvcDogZS5wYWdlWSArIDUwXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaWYgbW91c2Ugb2YgbGVmdCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykucmVtb3ZlQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggKyAyMCxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIHNob3dFeHBpcmVkKCkge1xuICBpZiAoUHVibGljYXRpb24uZXhwaXJlZCAhPSB0cnVlKSB7XG4gICAgUHVibGljYXRpb24udGltZUVsYXBzZWQgPSB0aW1lU2V0IC0gUHVibGljYXRpb24udGltZUxlZnRcbiAgICBQdWJsaWNhdGlvbi5leHBpcmVkID0gdHJ1ZVxuICAgIGxvY2tFbGVtZW50cyhhbGxFbGVtZW50cygpKVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICQoJy5zdWdnZXN0aW9ucycpLmhpZGUoKVxuICAgIH0sIDgwMClcbiAgXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIFx0JCgnYm9keScpLmFkZENsYXNzKCdleHBpcmVkJylcbiAgXHRleHBpcmVkVGltZSgpXG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uc2VsZWN0aW9uID0gZmFsc2VcbiAgICB9XG4gIFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gIFx0XHQkKCcud3JhcHBlcicpLmFkZENsYXNzKCdzYXZlZF92aWV3Jyk7XG4gIFx0XHRzYXZlZFN0YXRlKClcbiAgXHR9LCA1MDApXG4gIFx0Y2xlYXJJbnRlcnZhbCh4KVxuICAgIGlmICh0eXBlb2YgeSAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gaWYgZGlzcnVwdGlvbnNcbiAgICAgIGNsZWFySW50ZXJ2YWwoeSlcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJvcEVsZW1lbnQocGFnZUlkLCBkYXRhLCBtb3VzZVBvcywgY2FsbGJhY2spIHtcblx0Y29uc29sZS5sb2cobW91c2VQb3MpXG5cdHZhciBlbGVtZW50ID0geyBkYXRhOiBkYXRhLCBwYWdlOiBwYWdlSWQgfVxuXHR2YXIgZWxlbWVudFBvcyA9IGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MsIGNhbGxiYWNrKVxuXHRTb3VuZC5kaW5nKClcblx0JCgnLmRyb3BwYWJsZScpLnJlbW92ZUNsYXNzKCdkcm9wcGFibGUnKTtcbn1cblxuXG5cblxuXG5cblxuLy8gZXJyb3JzXG5cbnZhciBFcnJvciA9IHtcblx0bm90QWxsb3dlZDogZnVuY3Rpb24oKSB7XG5cdFx0U291bmQuZXJyb3IoKVxuXHRcdGFsZXJ0TWVzc2FnZSgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgbm90IGFsbG93ZWQhJylcblx0fSxcblx0dG9vQmlnOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpO1xuXHRcdGFsZXJ0TWVzc2FnZSgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgdG9vIGJpZyEnKTtcblx0fSxcblx0dG9vTGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0U291bmQuZXJyb3IoKTtcblx0XHRhbGVydE1lc3NhZ2UoJ1RvbyBsYXRlIGFtaWdvJyk7XG5cdH1cbn1cblxuXG5cblxuXG4vLyAtLS0gU0FWRURcblxuZnVuY3Rpb24gcmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pIHtcblx0Zm9yICh2YXIgY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcblx0XHR2YXIganNvbiA9IEpTT04uc3RyaW5naWZ5KFB1YmxpY2F0aW9uLnBhZ2VzW2NhbnZhc0lkXSk7XG5cdFx0Y2FudmFzZXNbY2FudmFzSWRdLmxvYWRGcm9tSlNPTigganNvbiwgZnVuY3Rpb24oKSB7XG4gICAgICBsb2NrRWxlbWVudHMoYWxsRWxlbWVudHMoKSlcblx0XHRcdGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwuYmluZChjYW52YXNlc1tjYW52YXNJZF0pXG5cdFx0fSlcblx0fVxufVxuXG5cblxuXG4vLyAtLS0gQkFDS0VORFxuXG4vLyBzYXZlIHRvIGRiXG5mdW5jdGlvbiBzYXZldG9EYihwdWJsaWNhdGlvbikge1xuXHRmb3IgKHZhciBwYWdlIGluIFB1YmxpY2F0aW9uLnBhZ2VzKSB7XG5cdFx0UHVibGljYXRpb24ucGFnZXNbcGFnZV0gPSBjYW52YXNlc1twYWdlXS50b0pTT04oKSAvLyB1cGRhdGUgYWxsIHBhZ2VzXG5cdH1cblx0JC5hamF4KHtcblx0XHR1cmw6ICcvZGInLFxuXHRcdHR5cGU6ICdwb3N0JywgLy8gcGVyZm9ybWluZyBhIFBPU1QgcmVxdWVzdFxuXHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KFB1YmxpY2F0aW9uKSxcblx0XHRjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuXHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0c3VjY2VzczogZnVuY3Rpb24ocHVibGljYXRpb24pIHtcblx0XHRcdGNvbnNvbGUubG9nKCdwdWJsaWNhdGlvbiBzZW50IHRvIGRhdGFiYXNlLicpO1xuXHRcdH1cblx0fSk7XG5cdGNvbnNvbGUubG9nKCdzYXZlZD9pZD0nICsgUHVibGljYXRpb24uaWQpXG59XG5cblxuXG5cblxuLy8gLS0tIElOVEVSRkFDRSBGWFxuXG5cbi8vIG1vdmUgdGhlc2UgZnVuY3Rpb25zIHRvIGludGVyZmFjZSBwYXJ0IG9mIGpzP1xuZnVuY3Rpb24gYW5pbWF0ZVVwKG9iaikge1xuICBvYmouc2hvdygpO1xuICBvYmouY3NzKCdtYXJnaW4tdG9wJywgJzIwcHgnKTtcbiAgb2JqLmFuaW1hdGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIG1hcmdpblRvcDogXCIwcHhcIixcbiAgICB9LCAzMDAwLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cbiAgfSk7XG59O1xuXG5mdW5jdGlvbiBhbmltYXRlVXBPdXQob2JqLCB0aW1lKSB7XG4gIG9iai5zaG93KCk7XG4gIG9iai5jc3MoJ21hcmdpbi10b3AnLCAnMjBweCcpO1xuICBvYmouYW5pbWF0ZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgbWFyZ2luVG9wOiBcIjBweFwiLFxuICAgIH0sIHRpbWUvMiwgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG4gIH0pO1xuICBvYmouYW5pbWF0ZSh7XG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgbWFyZ2luVG9wOiBcIjIwcHhcIixcbiAgICB9LCB0aW1lLzIsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICB9KTtcbn07XG5cbmZ1bmN0aW9uIHNoYWtlKG9iaiwgdGltZSkge1xuICBpZiAoIXRpbWUpIChcbiAgICB0aW1lID0gNTAwXG4gIClcbiAgb2JqLmFkZENsYXNzKCAnc2hha2Ugc2hha2UtY29uc3RhbnQnIClcbiAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgIG9iai5yZW1vdmVDbGFzcyggJ3NoYWtlIHNoYWtlLWNvbnN0YW50JyApXG4gIH0sIHRpbWUpO1xufVxuXG5cblxuXG5cblxuLy8gLS0tIERJU1JVUFRJT05TXG5cblxuZnVuY3Rpb24gYWxsRWxlbWVudHModHlwZSkge1xuICB2YXIgb2JqcyA9IFtdXG4gIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIGNhbnZhc09ianMgPSBjYW52YXNlc1tjYW52YXNdLmdldE9iamVjdHModHlwZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY2FudmFzT2JqcyA9IGNhbnZhc2VzW2NhbnZhc10uZ2V0T2JqZWN0cygpXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSBjYW52YXNPYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAoY2FudmFzT2Jqc1tpXS5pZCAhPSAnbG9jaycpIHsgLy8gdXNlIHRoaXMgdG8gbG9ja1xuICAgICAgICBvYmpzLnB1c2goIGNhbnZhc09ianNbaV0gKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gb2Jqc1xufVxuXG5mdW5jdGlvbiBsb2NrRWxlbWVudHMob2Jqcykge1xuICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIG9ianNbaV0uc2VsZWN0YWJsZSA9IGZhbHNlXG4gICAgb2Jqc1tpXS5oYXNDb250cm9scyA9IGZhbHNlXG4gICAgb2Jqc1tpXS5ob3ZlckN1cnNvciA9ICdkZWZhdWx0J1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFsbENhbnZhc2VzKCkge1xuICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgY2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbCgpXG4gIH1cbn1cblxuZnVuY3Rpb24gZmlsdGVySW1ncyhvYmpzLCBmaWx0ZXIpIHtcbiAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBvYmpzW2ldLmZpbHRlcnMucHVzaChmaWx0ZXIpXG4gICAgb2Jqc1tpXS5hcHBseUZpbHRlcnMoKVxuICB9XG4gIHJlbmRlckFsbENhbnZhc2VzKClcbn1cblxudmFyIERpc3J1cHRpb24gPSB7XG5cdGNvbWljOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfY29taWMob2Jqcykge1xuICAgICAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgb2Jqc1tpXS5mb250RmFtaWx5ID0gJ1wiQ29taWMgU2FucyBNU1wiJ1xuICAgICAgfVxuICAgIH1cbiAgICBfY29taWMoIGFsbEVsZW1lbnRzKCd0ZXh0JykgKVxuICAgIF9jb21pYyggYWxsRWxlbWVudHMoJ3RleHRib3gnKSApXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0NhblxcJ3QgeW91IHNwaWNlIHRoZSB0eXBvZ3JhcGh5IGEgYml0PycsICdHdXRlbmJlcmcnKVxuXHR9LFxuXHRyb3RhdGVJbWdzUmFuZDogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX3JvdGF0ZUltZ3NSYW5kKG9ianMpIHtcbiAgICAgIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIG9ianNbaV0ub3JpZ2luWCA9ICdjZW50ZXInXG4gICAgICAgIG9ianNbaV0ub3JpZ2luWSA9ICdjZW50ZXInXG4gICAgICAgIG9ianNbaV0uYW5pbWF0ZSh7IGFuZ2xlOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApIH0sIHtcbiAgICAgICAgICBkdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICBvbkNoYW5nZTogb2Jqc1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQob2Jqc1tpXS5jYW52YXMpLFxuICAgICAgICAgIGVhc2luZzogZnVuY3Rpb24odCwgYiwgYywgZCkgeyByZXR1cm4gYyp0L2QgKyBiIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgX3JvdGF0ZUltZ3NSYW5kKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIGNyaXRpY1NheXMoJ0kgZmluZCB0aGlzIGxheW91dCBhIGJpdCBzdGF0aWMuLi4nLCAnR3V0ZW5iZXJnJylcblx0fSxcblx0bG9ja1JhbmRQYWdlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNhbnZhc2VzKVxuICAgIHJhbmRDYW52YXMgPSBjYW52YXNlc1trZXlzWyBrZXlzLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dXG5cdFx0cmFuZENhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZTtcblx0XHRmb3IgKG9iamVjdElkIGluIHJhbmRDYW52YXMuZ2V0T2JqZWN0cygpICkge1xuXHRcdFx0dmFyIG9iamVjdCA9IHJhbmRDYW52YXMuaXRlbShvYmplY3RJZClcblx0XHRcdG9iamVjdC5zZWxlY3RhYmxlID0gZmFsc2Vcblx0XHRcdG9iamVjdC5ob3ZlckN1cnNvciA9ICdkZWZhdWx0J1xuXHRcdH1cblx0XHRyYW5kQ2FudmFzLmFkZChuZXcgZmFicmljLkxpbmUoWzAsIDAsIHJhbmRDYW52YXMud2lkdGgsIHJhbmRDYW52YXMuaGVpZ2h0XSwge1xuXHQgIFx0c3Ryb2tlOiAncmVkJyxcblx0ICBcdHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIFx0c3Ryb2tlV2lkdGg6IDIsXG4gICAgICBob3ZlckN1cnNvcjonZGVmYXVsdCcsXG4gICAgICBpZDogJ2xvY2snXG5cdFx0fSkpXG5cdFx0cmFuZENhbnZhcy5yZW5kZXJBbGwoKTtcblx0XHQvLyBUT0RPOiBwcmV2ZW50IGRyb3BcbiAgICBjcml0aWNTYXlzKCdQYWdlICcgKyByYW5kQ2FudmFzLmlkICsgJyBpcyBub3cgbG9ja2VkLi4uJywgJ0d1dGVuYmVyZycpIC8vIFRPRE9cblx0fSxcbiAgc2h1ZmZsZVBhZ2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdG9TaHVmZmxlID0gW11cbiAgICB2YXIgaSA9IDBcbiAgICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoaSA+IDApIHsgLy8gcHJldmVudCBzaHVmZmxpbmcgZmlyc3QgcGFnZVxuICAgICAgICB0b1NodWZmbGUucHVzaCggY2FudmFzZXNbY2FudmFzSWRdLnRvSlNPTigpIClcbiAgICAgIH1cbiAgICAgIGkgKz0gMVxuICAgIH1cbiAgICBzaHVmZmxlQXJyYXkodG9TaHVmZmxlKVxuICAgIHZhciB5ID0gMFxuICAgIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmICh5ID4gMCkge1xuICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ubG9hZEZyb21KU09OKHRvU2h1ZmZsZVt5IC0gMV0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwuYmluZChjYW52YXNlc1tjYW52YXNJZF0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB5ICs9IDFcbiAgICB9XG4gICAgY3JpdGljU2F5cygnVGhlIHJ5dGhtIG9mIHRoaXMgcHVibGljYXRpb24gaXMgYSBiaXQgd2Vhay4gRG9uXFwndCB5b3UgdGhpbms/JywgJ0d1dGVuYmVyZycpXG4gIH0sXG5cdGFkczogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FudmFzZXMpXG4gICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cblx0XHRyYW5kQ2FudmFzLmFkZChuZXcgZmFicmljLlJlY3Qoe1xuXHRcdFx0d2lkdGg6IHJhbmRDYW52YXMud2lkdGgsXG5cdFx0XHRoZWlnaHQ6IDMwLFxuXHRcdFx0ZmlsbDogJyMwRDIxM0UnLFxuXHRcdFx0bG9ja01vdmVtZW50WDogdHJ1ZSxcblx0XHRcdGxvY2tNb3ZlbWVudFk6IHRydWUsXG5cdFx0XHRsb2NrUm90YXRpb246IHRydWUsXG5cdFx0XHRoYXNDb250cm9sczogZmFsc2UsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcblx0XHRcdGxlZnQ6IHJhbmRDYW52YXMud2lkdGgvMixcblx0XHRcdHRvcDogMTUsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGlkOiAnbG9jaydcblx0XHR9KSk7XG5cdFx0ZmFicmljLkltYWdlLmZyb21VUkwoJy9hc3NldHMvaW1nL2tpbmtvLnBuZycsIGZ1bmN0aW9uKGltZyl7XG5cdFx0XHRcdGltZy5oYXNCb3JkZXJzID0gZmFsc2U7XG5cdFx0XHRcdGltZy5oYXNDb250cm9scyA9IGZhbHNlO1xuICAgICAgICBpbWcuc2VsZWN0YWJsZSA9IGZhbHNlO1xuXHRcdFx0XHRpbWcuc2NhbGUoMC4yKTtcblx0XHRcdFx0aW1nLmxlZnQgPSByYW5kQ2FudmFzLndpZHRoLTEwMDtcblx0XHRcdFx0aW1nLnRvcCA9IDUwO1xuXHRcdFx0XHRpbWcubG9ja01vdmVtZW50WCA9IHRydWU7XG5cdFx0XHRcdGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcblx0XHRcdFx0aW1nLmxvY2tSb3RhdGlvbiA9IHRydWU7XG5cdFx0XHRcdGltZy5zZXRDb250cm9sc1Zpc2liaWxpdHkgPSBmYWxzZTtcbiAgICAgICAgaW1nLmlkID0gJ2xvY2snXG5cdFx0XHRcdHJhbmRDYW52YXMuaW5zZXJ0QXQoaW1nLDMpO1xuXHRcdFx0XHQvLyBUT0RPOiBpdCBvbmx5IHdvcmtzIHdpdGggb25lIGltYWdlIGZvciBzb21lIHJlYXNvbi4gcnVubmluZyB0aGUgZnVuY3Rpb24gbXVsdGlwbGUgdGltZXMgaXQgYWRkcyBtb3JlIHRvcCBiYXJzIGJ1dCBqdXN0IG1vdmVzIGFsbCB0aGUgaW1hZ2VzIHRvIHRoZSBzYW1lIHBsYWNlXG5cdFx0fSk7XG5cbiAgICBjcml0aWNTYXlzKCdJIGZvdW5kIGEgc3BvbnNvciEnLCAnR3V0ZW5iZXJnJylcblx0fSxcbiAgaGFsZlRpbWU6IGZ1bmN0aW9uICgpIHtcbiAgICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMlxuICAgIGNyaXRpY1NheXMoJ1RoaXMgaXMgdGFraW5nIHRvbyBsb25nLi4uJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGRvdWJsZVRpbWU6IGZ1bmN0aW9uICgpIHtcbiAgICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICogMlxuICAgIGNyaXRpY1NheXMoJ1Rha2UgeW91ciB0aW1lLi4uJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGdyZXlzY2FsZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5HcmF5c2NhbGUoKSApXG4gICAgY3JpdGljU2F5cygnU2hhbGwgd2UgbWFrZSBpdCBsb29rIGNsYXNzaWM/JywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGludmVydEltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5JbnZlcnQoKSApXG4gICAgY3JpdGljU2F5cygnVGhlIHZpc3VhbHMgbmVlZCBzb21lIGVkZ3kgY29sb3JzJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIHNlcGlhSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLlNlcGlhKCkgKVxuICAgIGNyaXRpY1NheXMoJ0V2ZXIgaGVhcmQgb2YgSW5zdGFncmFtPycsICdHdXRlbmJlcmcnKVxuICB9LFxuICBibGFja3doaXRlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLkJsYWNrV2hpdGUoKSApXG4gICAgY3JpdGljU2F5cygnVGhpcyBzaG91bGQgbG9vayBsaWtlIGEgemluZSEnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgcGl4ZWxhdGVJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuUGl4ZWxhdGUoe2Jsb2Nrc2l6ZTogMjB9KSApXG4gICAgY3JpdGljU2F5cygnSXNuXFwndCB0aGlzIGEgdmlkZW9nYW1lIGFmdGVyIGFsbD8nLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgbm9pc2VJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuTm9pc2Uoe25vaXNlOiAyMDB9KSApXG4gICAgY3JpdGljU2F5cygnTUFLRSBTT01FIE5PT0lTRSEhJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGZvbnRTaXplQmlnZ2VyOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfZm9udFNpemVCaWdnZXIoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KCdmb250U2l6ZScsIGVsZW1lbnRzW2ldLmZvbnRTaXplICogc2NhbGVGb250KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2ZvbnRTaXplQmlnZ2VyKGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0NhblxcJ3QgcmVhZCBhbnl0aGluZyA6KCcsICdHdXRlbmJlcmcnKVxuICB9LFxuICBmb250U2l6ZVNtYWxsZXI6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9mb250U2l6ZUJpZ2dlcihlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoJ2ZvbnRTaXplJywgZWxlbWVudHNbaV0uZm9udFNpemUgLyBzY2FsZUZvbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBfZm9udFNpemVTbWFsbGVyKGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0lcXCdtIG5vdCBibGluZCEnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgYmlnZ2VySW1nczogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2JpZ2dlckltZ3MoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBzY2FsZVk6IHNjYWxlVXBJbWdzLFxuICAgICAgICAgIHNjYWxlWDogc2NhbGVVcEltZ3NcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIF9iaWdnZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdCTE9XIFVQIScsICdHdXRlbmJlcmcnKVxuICB9LFxuICBzbWFsbGVySW1nczogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX3NtYWxsZXJJbWdzKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7XG4gICAgICAgICAgc2NhbGVZOiBzY2FsZURvd25JbWdzLFxuICAgICAgICAgIHNjYWxlWDogc2NhbGVEb3duSW1nc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX3NtYWxsZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdCTE9XIFVQIScsICdHdXRlbmJlcmcnKVxuICB9LFxuICBsb2NrQWxsRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgIGxvY2tFbGVtZW50cyhhbGxFbGVtZW50cygpKVxuICAgIGNyaXRpY1NheXMoJ1RoaW5ncyBhcmUgcGVyZmVjdCBhcyB0aGV5IGFyZS4nLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgc2tld0FsbEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfc2tld0FsbEVsZW1lbnRzKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7XG4gICAgICAgICAgc2NhbGVZOiBzY2FsZVVwSW1ncyxcbiAgICAgICAgICBzY2FsZVg6IHNjYWxlVXBJbWdzLFxuICAgICAgICAgIHRyYW5zZm9ybU1hdHJpeDogWzEsIC41MCwgMCwgMSwgMCwgMF1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgX3NrZXdBbGxFbGVtZW50cyhhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnU3RyZXRjaCB0aG9zZSBpbWFnZXMsIGNvbWUgb24hJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGZsaXBBbGxJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfZmxpcEFsbEltZ3MoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBhbmdsZTogJy0xODAnLFxuICAgICAgICAgIGZsaXBZOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIF9mbGlwQWxsSW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnRmxpcCB0aG9zZSBpbWFnZXMsIGNvbWUgb24hJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGJpdExlZnRiaXRSaWdodEFsbEltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9iaXRMZWZ0Yml0UmlnaHRBbGxJbWdzKGVsZW1lbnRzLCBkaXN0YW5jZSkge1xuICAgICAgdmFyIGR1cmF0aW9uID0gMjAwXG4gICAgICB2YXIgcGF1c2UgPSAxMDBcblxuICAgICAgZnVuY3Rpb24gbGVmdDEoaSwgZWxlbWVudHMpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmFuaW1hdGUoJ2xlZnQnLCBlbGVtZW50c1tpXS5sZWZ0ICsgZGlzdGFuY2UgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCksIHsgLy8gYSBiaXQgb2YgcmFuZG9tbmVzcyB0byBtYWtlIGl0IG1vcmUgaHVtYW5cbiAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCksXG4gICAgICAgICAgICBvbkNoYW5nZTogZWxlbWVudHNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKGVsZW1lbnRzW2ldLmNhbnZhcyksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgMClcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGxlZnQyKGksIGVsZW1lbnRzKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBlbGVtZW50c1tpXS5hbmltYXRlKCdsZWZ0JywgZWxlbWVudHNbaV0ubGVmdCArIGRpc3RhbmNlICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApLCB7XG4gICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApLFxuICAgICAgICAgICAgb25DaGFuZ2U6IGVsZW1lbnRzW2ldLmNhbnZhcy5yZW5kZXJBbGwuYmluZChlbGVtZW50c1tpXS5jYW52YXMpLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sIGR1cmF0aW9uICsgcGF1c2UpXG4gICAgICB9XG4gICAgICBmdW5jdGlvbiByaWdodDEoaSwgZWxlbWVudHMpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmFuaW1hdGUoJ2xlZnQnLCBlbGVtZW50c1tpXS5sZWZ0IC0gZGlzdGFuY2UgLSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCksIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCksXG4gICAgICAgICAgICBvbkNoYW5nZTogZWxlbWVudHNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKGVsZW1lbnRzW2ldLmNhbnZhcyksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgKGR1cmF0aW9uICsgcGF1c2UpICogMiApXG4gICAgICB9XG4gICAgICBmdW5jdGlvbiByaWdodDIoaSwgZWxlbWVudHMpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmFuaW1hdGUoJ2xlZnQnLCBlbGVtZW50c1tpXS5sZWZ0IC0gZGlzdGFuY2UgLSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCksIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCksXG4gICAgICAgICAgICBvbkNoYW5nZTogZWxlbWVudHNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKGVsZW1lbnRzW2ldLmNhbnZhcyksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgKGR1cmF0aW9uICsgcGF1c2UpICogMyApXG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxlZnQxKGksIGVsZW1lbnRzKVxuICAgICAgICBsZWZ0MihpLCBlbGVtZW50cylcbiAgICAgICAgcmlnaHQxKGksIGVsZW1lbnRzKVxuICAgICAgICByaWdodDIoaSwgZWxlbWVudHMpXG4gICAgICB9XG4gICAgfVxuICAgIF9iaXRMZWZ0Yml0UmlnaHRBbGxJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCA3MClcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnQSBiaXQgdG8gdGhlIHJpZ2h0Li4uIE5vIG5vLCBhIGJpdCB0byB0aGUgbGVmdC4uLicsICdHdXRlbmJlcmcnKVxuICB9LFxuICByaWdpZE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9yaWdpZE1vZGUoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBsb2NrTW92ZW1lbnRZOiB0cnVlLFxuICAgICAgICAgIGxvY2tSb3RhdGlvbjogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfcmlnaWRNb2RlKGFsbEVsZW1lbnRzKCdpbWFnZScpLCA3MClcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnUmVzcGVjdCB0aGUgZ3JpZCEnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgYmV0dGVyVGl0bGU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aXRsZXMgPSBbXG4gICAgICAnRG9uIFF1aXhvdGUnLFxuICAgICAgJ0luIFNlYXJjaCBvZiBMb3N0IFRpbWUnLFxuICAgICAgJ1VseXNzZXMnLFxuICAgICAgJ1RoZSBPZHlzc2V5JyxcbiAgICAgICdXYXIgYW5kIFBlYWNlJyxcbiAgICAgICdNb2J5IERpY2snLFxuICAgICAgJ1RoZSBEaXZpbmUgQ29tZWR5JyxcbiAgICAgICdIYW1sZXQnLFxuICAgICAgJ1RoZSBHcmVhdCBHYXRzYnknLFxuICAgICAgJ1RoZSBJbGlhZCdcbiAgICBdXG4gICAgdmFyIHJhbmRUaXRsZSA9IHRpdGxlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aXRsZXMubGVuZ3RoKV1cbiAgICB0aXRsZS50ZXh0ID0gcmFuZFRpdGxlXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIFB1YmxpY2F0aW9uLnRpdGxlID0gcmFuZFRpdGxlXG4gICAgY3JpdGljU2F5cygnSSBzdWdnZXN0IGEgY2F0Y2hpZXIgdGl0bGUnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgYmV0dGVyQXV0aG9yczogZnVuY3Rpb24oKSB7IC8vIFRPRE86IG5vdCBzdXJlIHdoeSB0aGlzIGRvZXNuJ3Qgd29ya1xuICAgIHZhciBhdXRob3JzID0gW1xuICAgICAgJ0xlbyBUb2xzdG95JyxcbiAgICAgICdGeW9kb3IgRG9zdG9ldnNreScsXG4gICAgICAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gICAgICAnQ2hhcmxlcyBEaWNrZW5zJyxcbiAgICAgICdIb21lcicsXG4gICAgICAnSi4gUi4gUi4gVG9sa2llbicsXG4gICAgICAnR2VvcmdlIE9yd2VsbCcsXG4gICAgICAnRWRnYXIgQWxsYW4gUG9lJyxcbiAgICAgICdNYXJrIFR3YWluJyxcbiAgICAgICdWaWN0b3IgSHVnbydcbiAgICBdXG4gICAgdmFyIHJhbmRBdXRob3IgPSBhdXRob3JzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGF1dGhvcnMubGVuZ3RoKV1cbiAgICBhdXRob3JzLnRleHQgPSByYW5kQXV0aG9yXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIFB1YmxpY2F0aW9uLmF1dGhvcnMgPSByYW5kQXV0aG9yXG4gICAgY3JpdGljU2F5cygnV2UgbmVlZCBhIHdlbGwta25vd24gdGVzdGltb25pYWwuJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGRyYXdpbmdNb2RlOiBmdW5jdGlvbigpIHsgLy8gVE9ETzogbm90IHN1cmUgd2h5IHRoaXMgZG9lc24ndCB3b3JrXG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uaXNEcmF3aW5nTW9kZSA9IHRydWVcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uYmFja2dyb3VuZENvbG9yID0gJyNmZmZmYWEnXG4gICAgICBjYW52YXNlc1tjYW52YXNdLnJlbmRlckFsbCgpXG4gICAgfVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgICBjYW52YXNlc1tjYW52YXNdLmlzRHJhd2luZ01vZGUgPSBmYWxzZVxuICAgICAgICBjYW52YXNlc1tjYW52YXNdLmJhY2tncm91bmRDb2xvciA9ICcjZmZmZmZmJ1xuICAgICAgICBjYW52YXNlc1tjYW52YXNdLnJlbmRlckFsbCgpXG4gICAgICB9XG4gICAgfSwgZHJhd2luZ01vZGVUaW1lKVxuICAgIGNyaXRpY1NheXMoJ0RvIHlvdSBsaWtlIHRvIGRyYXc/JywgJ0d1dGVuYmVyZycpXG4gIH1cbn1cblxuXG5cblxuXG4vLyAtLS0gSU5URVJGQUNFIEJVVFRPTlNcblxuJCgnLmJ1dHRvbi5zYXZlJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICQoJy5idXR0b24uc2F2ZScpLmhpZGUoKVxuICAkKCcuYnV0dG9uLnBkZiwgLmJ1dHRvbi5ib29rbGV0JykuY3NzKCdkaXNwbGF5JywnaW5saW5lLWJsb2NrJylcbn0pXG4iXSwiZmlsZSI6Im1haW4uanMifQ==
