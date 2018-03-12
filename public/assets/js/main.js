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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBERUZBVUxUU1xuXG52YXIgZGlzcnVwdGlvbnNPbiA9IHRydWVcbnZhciBkcm9wRGVsYXkgPSAxMDBcbnZhciBkaXNydXB0aW9uSW50ZXJ2YWwgPSA1MDAwXG52YXIgYm9udXNUaW1lID0gMTAwMFxudmFyIHRleHRDaHVua3NMZW5ndGggPSAxNTAwXG52YXIgZm9udFNpemUgPSAxNVxudmFyIHNjYWxlRm9udCA9IDEuNVxudmFyIHNjYWxlVXBJbWdzID0gMC43XG52YXIgc2NhbGVEb3duSW1ncyA9IDAuN1xudmFyIGFjaGlldmVtZW50U3BhbiA9IDNcbnZhciBkcmF3aW5nTW9kZVRpbWUgPSAxMDAwMFxuXG5cblxuXG4vLyAtLS0gR0VORVJBTCBGVU5DVElPTlNcblxuZnVuY3Rpb24gbWFrZUlkKCkge1xuXHR2YXIgcmFuZExldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNikpO1xuXHR2YXIgaWQgPSByYW5kTGV0dGVyICsgRGF0ZS5ub3coKTtcblx0cmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBieXRlQ291bnQocykge1xuICAgIHJldHVybiBlbmNvZGVVUkkocykuc3BsaXQoLyUuLnwuLykubGVuZ3RoIC0gMTtcbn1cblxudmFyIGdldFVybFBhcmFtZXRlciA9IGZ1bmN0aW9uIGdldFVybFBhcmFtZXRlcihzUGFyYW0pIHtcbiAgdmFyIHNQYWdlVVJMID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKSxcbiAgICBzVVJMVmFyaWFibGVzID0gc1BhZ2VVUkwuc3BsaXQoJyYnKSxcbiAgICBzUGFyYW1ldGVyTmFtZSxcbiAgICBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBzVVJMVmFyaWFibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgc1BhcmFtZXRlck5hbWUgPSBzVVJMVmFyaWFibGVzW2ldLnNwbGl0KCc9Jyk7XG5cbiAgICBpZiAoc1BhcmFtZXRlck5hbWVbMF0gPT09IHNQYXJhbSkge1xuICAgICAgICByZXR1cm4gc1BhcmFtZXRlck5hbWVbMV0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBzUGFyYW1ldGVyTmFtZVsxXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycmF5KSB7XG4gIGZvciAodmFyIGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgdmFyIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcbiAgICB2YXIgdGVtcCA9IGFycmF5W2ldO1xuICAgIGFycmF5W2ldID0gYXJyYXlbal07XG4gICAgYXJyYXlbal0gPSB0ZW1wO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRpbWVDb252ZXJ0ZXIoVU5JWF90aW1lc3RhbXApe1xuICB2YXIgYSA9IG5ldyBEYXRlKFVOSVhfdGltZXN0YW1wKTtcbiAgdmFyIG1vbnRocyA9IFsnSmFuJywnRmViJywnTWFyJywnQXByJywnTWF5JywnSnVuJywnSnVsJywnQXVnJywnU2VwJywnT2N0JywnTm92JywnRGVjJ107XG4gIHZhciB5ZWFyID0gYS5nZXRGdWxsWWVhcigpO1xuICB2YXIgbW9udGggPSBtb250aHNbYS5nZXRNb250aCgpXTtcbiAgdmFyIGRhdGUgPSBhLmdldERhdGUoKTtcbiAgdmFyIHRpbWUgPSBkYXRlICsgJyAnICsgbW9udGggKyAnICcgKyB5ZWFyO1xuICByZXR1cm4gdGltZTtcbn1cblxuXG5cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudChlbGVtZW50LCBtb3VzZVBvcywgY2FsbGJhY2spIHtcbiAgZnVuY3Rpb24gY2h1bmtTdHJpbmcoc3RyLCBsZW5ndGgpIHtcbiAgICByZXR1cm4gc3RyLm1hdGNoKG5ldyBSZWdFeHAoJ3suMSwnICsgbGVuZ3RoICsgJ30nLCAnZycpKTtcbiAgfVxuXHR2YXIgdGhlTW91c2VQb3MgPSBtb3VzZVBvc1xuXHRpZiAoZWxlbWVudC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykpIHtcblx0XHRmYWJyaWMuSW1hZ2UuZnJvbVVSTChlbGVtZW50LmRhdGEsIGZ1bmN0aW9uKG15SW1nLCBjYWxsYmFjaykge1xuIFx0XHRcdHZhciBpbWcgPSBteUltZy5zZXQoeyBsZWZ0OiAwLCB0b3A6IDAsIHdpZHRoOiBteUltZy53aWR0aCwgaGVpZ2h0OiBteUltZy5oZWlnaHR9KTtcbiBcdFx0XHRpZiAoIGltZy53aWR0aCA+IGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggKSB7XG4gXHRcdFx0XHRpbWcuc2NhbGVUb1dpZHRoKGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggLyAxMDAgKiA1MCApOyAvLyA1MCUgb2YgdGhlIGNhbnZhc1xuIFx0XHRcdH1cbiBcdFx0XHRpbWcubGVmdCA9IHRoZU1vdXNlUG9zLnhcbiBcdFx0XHRpbWcudG9wID0gdGhlTW91c2VQb3MueVxuIFx0XHRcdGltZy5vbignYWRkZWQnLCBmdW5jdGlvbigpIHtcbiBcdFx0XHRcdGNhbGxiYWNrO1xuIFx0XHRcdH0pO1xuIFx0XHRcdGNhbnZhc2VzW2VsZW1lbnQucGFnZV0uYWRkKGltZylcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR2YXIgZGVCYXNlZFRleHQgPSBhdG9iKGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpKTtcbiAgICBjaHVua3MgPSBkZUJhc2VkVGV4dC5tYXRjaChuZXcgUmVnRXhwKCcoLnxbXFxyXFxuXSl7MSwnICsgdGV4dENodW5rc0xlbmd0aCArICd9JywgJ2cnKSlcbiAgICB2YXIgY3VyclBhZ2UgPSBwYXJzZUludCggZWxlbWVudC5wYWdlLnN1YnN0cihlbGVtZW50LnBhZ2UubGVuZ3RoIC0gMSkgKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY2FudmFzZXNbJ3AnICsgKGN1cnJQYWdlICsgaSldKSB7XG4gICAgICAgIGNhbnZhc2VzWydwJyArIChjdXJyUGFnZSArIGkpXS5hZGQobmV3IGZhYnJpYy5UZXh0Ym94KGNodW5rc1tpXSArICctJywge1xuICAgICAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXG4gICAgICAgICAgbGVmdDogMjAsXG4gICAgICAgICAgdG9wOiAyMCxcbiAgICAgICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICAgICAgd2lkdGg6IDQxMCxcbiAgICAgICAgICBicmVha1dvcmRzOiB0cnVlLFxuICAgICAgICAgIG9yaWdpblg6ICdsZWZ0JyxcbiAgICAgICAgICBvcmlnaW5ZOiAndG9wJ1xuICAgICAgICB9KSlcbiAgICAgIH1cbiAgICB9XG5cdFx0Y2FsbGJhY2s7XG5cdH1cbn1cblxuXG4vLyAtLS0gaW5pdGlhbGl6ZSBjYW52YXNlc1xudmFyIGNhbnZhc2VzID0ge31cbnZhciB0aXRsZVxudmFyIGF1dGhvcnNcbmZ1bmN0aW9uIGluaXRDYW52YXNlcygpIHtcblx0JCgnY2FudmFzJykuZWFjaChmdW5jdGlvbihpKSB7XG5cdFx0Y2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXModGhpcyk7XG5cdCAgY2FudmFzLnNldFdpZHRoKCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykud2lkdGgoKSApO1xuXHRcdGNhbnZhcy5zZXRIZWlnaHQoICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5oZWlnaHQoKSApO1xuICAgIGNhbnZhcy5iYWNrZ3JvdW5kQ29sb3IgPSAnd2hpdGUnO1xuICAgIGNhbnZhcy5pZCA9ICdwJyArIChpKzEpO1xuXG5cdFx0Y2FudmFzZXNbJ3AnICsgKGkgKyAxKV0gPSBjYW52YXM7XG5cbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA+PSAwKSB7IC8vIGlmICBzYXZlZFxuICAgICAgY2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlXG4gICAgfVxuXG5cdH0pO1xuXHRmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5vcmlnaW5YID0gZmFicmljLk9iamVjdC5wcm90b3R5cGUub3JpZ2luWSA9ICdjZW50ZXInIC8vIG9yaWdpbiBhdCB0aGUgY2VudGVyXG4gIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpIDwgMCkgeyAvLyBpZiBub3Qgc2F2ZWRcbiAgXHR0aXRsZSA9IG5ldyBmYWJyaWMuVGV4dGJveCgnSW5zZXJ0IFRpdGxlJywge1xuICBcdCAgdG9wOiAxMjAsXG4gIFx0ICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvLCBzZXJpZicsXG4gIFx0ICBmaWxsOiAnIzc3NycsXG4gIFx0ICBsaW5lSGVpZ2h0OiAxLjEsXG4gIFx0ICBmb250U2l6ZTogMzAsXG4gIFx0ICBmb250V2VpZ2h0OiAnYm9sZCcsXG4gIFx0ICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICBcdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuICBcdCAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXG4gIFx0ICBob3ZlckN1cnNvcjogJ2RlZmF1bHQnLFxuICBcdCAgb3JpZ2luWDogJ2xlZnQnLFxuICBcdCAgb3JpZ2luWTogJ3RvcCcsXG4gICAgICBpZDogJ2xvY2snLFxuICAgICAgY2FjaGU6IGZhbHNlXG4gIFx0fSkub24oJ2VkaXRpbmc6ZW50ZXJlZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aGlzLnRleHQgPSAnSW5zZXJ0IFRpdGxlJykge1xuICAgICAgICB0aGlzLnRleHQgPSAnJ1xuICAgICAgICB0aGlzLmhpZGRlblRleHRhcmVhLnZhbHVlID0gJydcbiAgICAgIH1cbiAgICB9KS5vbignZWRpdGluZzpleGl0ZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBQdWJsaWNhdGlvbi50aXRsZSA9IHRoaXMudGV4dFxuICAgICAgdGhpcy5zZWxlY3RhYmxlID0gZmFsc2VcbiAgICAgIHRoaXMuaGFzQ29udHJvbHMgPSBmYWxzZVxuICAgIH0pXG4gIFx0Y2FudmFzZXNbJ3AxJ10uYWRkKHRpdGxlKVxuICBcdHZhciBsaW5lTGVuZ2h0ID0gMjUwXG4gIFx0Y2FudmFzZXNbJ3AxJ10uYWRkKG5ldyBmYWJyaWMuTGluZShbMCwgMCwgbGluZUxlbmdodCwgMF0sIHtcbiAgXHRcdGxlZnQ6ICggY2FudmFzZXNbJ3AxJ10ud2lkdGggLSBsaW5lTGVuZ2h0KSAvIDIsXG4gIFx0ICB0b3A6IDE2MCxcbiAgXHQgIHN0cm9rZTogJyMyMjInLFxuICBcdCAgc2VsZWN0YWJsZTogZmFsc2UsXG4gIFx0IFx0b3JpZ2luWDogJ2xlZnQnLFxuICBcdCAgb3JpZ2luWTogJ3RvcCdcbiAgXHR9KSk7XG4gIFx0YXV0aG9ycyA9IG5ldyBmYWJyaWMuVGV4dGJveCgnSW5zZXJ0IEF1dGhvcnMnLCB7XG4gIFx0ICB0b3A6IDE4MCxcbiAgXHQgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8sIHNlcmlmJyxcbiAgXHQgIGZpbGw6ICcjNzc3JyxcbiAgXHQgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgXHQgIGZvbnRTaXplOiAyMCxcbiAgXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gIFx0ICB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG4gIFx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gIFx0ICBvcmlnaW5YOiAnbGVmdCcsXG4gIFx0ICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgIGlkOiAnbG9jaydcbiAgXHR9KS5vbignZWRpdGluZzplbnRlcmVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRoaXMudGV4dCA9ICdJbnNlcnQgQXV0aG9ycycpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJydcbiAgICAgICAgdGhpcy5oaWRkZW5UZXh0YXJlYS52YWx1ZSA9ICcnXG4gICAgICB9XG4gICAgfSkub24oJ2VkaXRpbmc6ZXhpdGVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgUHVibGljYXRpb24uYXV0aG9ycyA9IHRoaXMudGV4dFxuICAgICAgdGhpcy5zZWxlY3RhYmxlID0gZmFsc2VcbiAgICAgIHRoaXMuaGFzQ29udHJvbHMgPSBmYWxzZVxuICAgIH0pXG4gIFx0Y2FudmFzZXNbJ3AxJ10uYWRkKGF1dGhvcnMpXG4gICAgdmFyIGRhdGUgPSBuZXcgZmFicmljLlRleHQoIHRpbWVDb252ZXJ0ZXIoUHVibGljYXRpb24uZGF0ZSksIHtcbiAgICAgIHRvcDogNjAwLFxuICAgICAgbGVmdDogY2FudmFzZXNbJ3A4J10ud2lkdGgvMixcbiAgICAgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8sIHNlcmlmJyxcbiAgICAgIGZpbGw6ICcjNzc3JyxcbiAgICAgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgICAgIGZvbnRTaXplOiAxNCxcbiAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAvLyB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgICAgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gICAgICBvcmlnaW5YOiAnY2VudGVyJyxcbiAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJ1xuICAgIH0pXG4gICAgY2FudmFzZXNbJ3A4J10uYWRkKGRhdGUpO1xuICAgIGZhYnJpYy5JbWFnZS5mcm9tVVJMKCcvYXNzZXRzL2ltZy9mb3RvY29sZWN0YW5pYS1sb2dvLnBuZycsIGZ1bmN0aW9uKGltZyl7XG4gICAgICBpbWcuaGFzQm9yZGVycyA9IGZhbHNlO1xuICAgICAgaW1nLmhhc0NvbnRyb2xzID0gZmFsc2U7XG4gICAgICBpbWcuc2VsZWN0YWJsZSA9IGZhbHNlO1xuICAgICAgaW1nLnNjYWxlKDAuMTIpO1xuICAgICAgaW1nLmxlZnQgPSBjYW52YXNlc1sncDgnXS53aWR0aC8yO1xuICAgICAgaW1nLnRvcCA9IDUzMDtcbiAgICAgIGltZy5sb2NrTW92ZW1lbnRYID0gdHJ1ZTtcbiAgICAgIGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcbiAgICAgIGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuICAgICAgaW1nLnNldENvbnRyb2xzVmlzaWJpbGl0eSA9IGZhbHNlO1xuICAgICAgaW1nLmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgICAgaW1nLmlkID0gJ2xvY2snO1xuICAgICAgY2FudmFzZXNbJ3A4J10uaW5zZXJ0QXQoaW1nKTtcbiAgICB9KVxuICB9XG59XG4kKGRvY3VtZW50KS5rZXlkb3duKGZ1bmN0aW9uKGUpIHsgLy8gZGVsIG9yIGJhY2tzcGFjZSB0byBkZWxldGVcbiAgaWYoIGUud2hpY2ggPT0gOCB8fCBlLndoaWNoID09IDQ2KSB7XG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmIChjYW52YXNlc1tjYW52YXNdLmdldEFjdGl2ZU9iamVjdCgpKSB7XG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc10ucmVtb3ZlKGNhbnZhc2VzW2NhbnZhc10uZ2V0QWN0aXZlT2JqZWN0KCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSlcblxuXG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG5cdC8vIGFsbCBvdXIgc3RhdGVzXG5cdGlkOiBtYWtlSWQoKSxcblx0dGl0bGU6ICdVbnRpdGxlZCcsXG5cdHRpbWVMZWZ0OiA5MDAwMDAwLFxuXHRleHBpcmVkOiBmYWxzZSxcblx0YXV0aG9yczogJ0Fub255bW91cycsXG4gIGRhdGU6IERhdGUubm93KCksXG4gIGltYWdlc0Ftb3VudDogMCxcbiAgdGV4dEFtb3VudDogMCxcbiAgdGltZUVsYXBzZWQ6IDAsIC8vIFRPRE8gc2V0IHRoaXMgd2hlbiB0aW1lIGV4cGlyZXNcbiAgYWNoaWV2ZW1lbnRzQW1vdW50OiAwLFxuXHRwYWdlczoge1xuXHRcdHAxOiB7fSxcblx0XHRwMjoge30sXG5cdFx0cDM6IHt9LFxuXHRcdHA0OiB7fSxcblx0XHRwNToge30sXG5cdFx0cDY6IHt9LFxuXHRcdHA3OiB7fSxcblx0XHRwODoge31cblx0fVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihQdWJsaWNhdGlvbiwgaW5wdXQpIHtcblx0aWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkgeyAvLyBub3QgZXhwaXJlZFxuXHRcdHNob3dUaW1lKFB1YmxpY2F0aW9uKVxuXHR9IGVsc2UgeyAgLy8gZXhwaXJlZFxuXHRcdHNob3dFeHBpcmVkKClcblx0fVxuXG5cdGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG5cdFx0Y29uc29sZS5sb2coaW5wdXQpXG5cdFx0c3dpdGNoICh0cnVlKSB7XG5cdFx0XHRjYXNlIGlucHV0LnZpc2libGUgPT0gZmFsc2U6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcblx0XHRcdFx0XHRyZW1vdmVFbGVtZW50KGlucHV0LmlkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0Ynl0ZUNvdW50KGlucHV0LmRhdGEpID4gMTM5ODExNyA6IC8vIGZpbGUgdG9vIGJpZyAoMW1iKVxuXHRcdFx0XHQgXHRFcnJvci50b29CaWcoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IGltYWdlXG5cblx0XHRcdFx0XHR2YXIgcHVibGljYXRpb25VcGRhdGUgPSBmdW5jdGlvbihpbnB1dFBhZ2UpIHsgLy8gdXBkYXRlIGNhbnZhc1xuXHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXRQYWdlXSA9IGNhbnZhc2VzW2lucHV0UGFnZV0udG9KU09OKCkgLy8gc2V0dGltZW91dCBvdGhlcndpc2UgaXQgZG9lc24ndCBnZXQgdGhlIGVsZW1lbnRcblx0XHRcdFx0XHRcdH0sIDEpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zLCBwdWJsaWNhdGlvblVwZGF0ZShpbnB1dC5wYWdlKSk7IC8vIGRyb3AgZWxlbWVudFxuXG5cbiAgICAgICAgICBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKz0gMSAvLyBhY2hpZXZlbWVudCBldmVyeSB4IGltZ3NcbiAgICAgICAgICBpZiAoUHVibGljYXRpb24uaW1hZ2VzQW1vdW50JWFjaGlldmVtZW50U3BhbiA9PSAwKSB7XG4gICAgICAgICAgICBhY2hpZXZlbWVudCgxMDAgKiBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQsIFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCArICcgaW1hZ2VzIGFkZGVkIScpXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgPT0gMykge1xuICAgICAgICAgICAgJCgnI2RvbmUnKS5jc3MoJ2Rpc3BsYXknLCdpbmxpbmUtYmxvY2snKVxuICAgICAgICAgICAgY3JpdGljU2F5cygnWW91IGNhbiBub3cgc2F2ZSB5b3VyIHB1YmxpY2F0aW9uIScpXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHN0YXJ0IGRpc3J1cHRpb25zIGFmdGVyIGZpcnN0IGltYWdlXG4gICAgICAgICAgaWYgKCAgUHVibGljYXRpb24uaW1hZ2VzQW1vdW50ID09IDEgJiZcbiAgICAgICAgICAgICAgICBnZXRVcmxQYXJhbWV0ZXIoJ2Rpc3J1cHRpb25zJykgIT0gJ2ZhbHNlJyAmJlxuICAgICAgICAgICAgICAgIGRpc3J1cHRpb25zT24gPT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiB5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkgeyAvLyBsYXVuY2ggYSByYW5kb20gZGlzcnVwdGlvblxuICAgICAgICAgICAgICBkaXNydXB0aW9ucyA9IE9iamVjdC5rZXlzKERpc3J1cHRpb24pXG4gICAgICAgICAgICAgIERpc3J1cHRpb25bZGlzcnVwdGlvbnNbIGRpc3J1cHRpb25zLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dKClcbiAgICAgICAgICAgICAgc2hha2UocGFnZXMpXG4gICAgICAgICAgICB9LCBkaXNydXB0aW9uSW50ZXJ2YWwpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYWRkdGltZShib251c1RpbWUpXG5cdFx0XHRcdFx0Y3JpdGljU2F5cygpXG5cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IHRleHRcblxuXHRcdFx0XHRcdHZhciBwdWJsaWNhdGlvblVwZGF0ZSA9IGZ1bmN0aW9uKGlucHV0UGFnZSkgeyAvLyB1cGRhdGUgY2FudmFzXG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dFBhZ2VdID0gY2FudmFzZXNbaW5wdXRQYWdlXS50b0pTT04oKSAvLyBzZXR0aW1lb3V0IG90aGVyd2lzZSBpdCBkb2Vzbid0IGdldCB0aGUgZWxlbWVudFxuXHRcdFx0XHRcdFx0fSwgMSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQubW91c2VQb3MsIHB1YmxpY2F0aW9uVXBkYXRlKGlucHV0LnBhZ2UpKTsgLy8gZHJvcCBlbGVtZW50XG5cbiAgICAgICAgICBQdWJsaWNhdGlvbi50ZXh0QW1vdW50ICs9IGlucHV0LmRhdGEubGVuZ3RoXG4gICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLnRleHRBbW91bnQgPj0gNTAwKSB7XG4gICAgICAgICAgICBhY2hpZXZlbWVudCg1MDAsICdNb3JlIHRoYW4gNTAwIGNoYXJhY3RlcnMgYWRkZWQnKVxuICAgICAgICAgIH1cblxuXHRcdFx0XHRcdGFkZHRpbWUoYm9udXNUaW1lICogMilcbiAgICAgICAgICBjcml0aWNTYXlzKCdUaGlzIGlzIGdvbm5hIGJlIGEgZ29vb2QgcmVhZCcpXG5cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG5cdFx0XHRcdFx0RXJyb3Iubm90QWxsb3dlZCgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQubW92ZSA9PSB0cnVlIDogLy8gbW92aW5nIG9yIHNjYWxpbmcgYW4gaW1hZ2Vcblx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dC5wYWdlXSA9IGNhbnZhc2VzW2lucHV0LnBhZ2VdLnRvSlNPTigpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH0gZWxzZSBpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSB0cnVlKSB7XG5cdFx0Ly8gdG9vIGxhdGVcblx0XHRFcnJvci50b29MYXRlKCk7XG5cdH1cbn1cblxuXG5cblxuXG4vLyAtLS0gQ09OVFJPTExFUlxuXG52YXIgeDtcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHRpbml0Q2FudmFzZXMoKVxuXHRvbk1vZEVsZW1lbnQoKVxuXHRpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA8IDApIHtcblx0XHQvLyBpZiBub3QgYSBzYXZlZCBwdWJsaWNhdGlvblxuXHRcdGlmICggZ2V0VXJsUGFyYW1ldGVyKCd0aW1lJykgKSB7IC8vIGRpZmZpY3VsdHlcblx0XHRcdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gdGltZVNldCA9IGdldFVybFBhcmFtZXRlcigndGltZScpXG5cdFx0fVxuXHRcdHggPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgLSAxMDtcblx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24pO1xuXHRcdH0sIDEwKVxuXHRcdG1vdXNlQ291bnRlcigpXG5cdH0gZWxzZSB7IC8vIHNhdmVkIHB1YmxpY2F0aW9uXG5cdFx0cmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pXG5cdH1cbn0pO1xuXG5mdW5jdGlvbiBhZGR0aW1lKGJvbnVzVGltZSkge1xuXHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICsgYm9udXNUaW1lO1xuXHRhbmltYXRldGltZWNvdW50ZXIoYm9udXNUaW1lKTtcbn1cblxuLy8gbW9kaWZ5IGVsZW1lbnQgbGlzdGVuZXJcbmZ1bmN0aW9uIG9uTW9kRWxlbWVudCgpIHtcblx0Zm9yICh2YXIgcGFnZUlkIGluIGNhbnZhc2VzKSB7XG5cdFx0Y2FudmFzZXNbIHBhZ2VJZCBdLm9uKCdvYmplY3Q6bW9kaWZpZWQnLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBwYXJlbnRDYW52YXNJZCA9IGV2dC50YXJnZXQuY2FudmFzLmxvd2VyQ2FudmFzRWwuaWRcblx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgbW92ZTogdHJ1ZSwgcGFnZTogcGFyZW50Q2FudmFzSWR9KVxuXHRcdH0pXG5cdH1cbn1cblxuLy8gZ2V0IG1vdXNlIHBvc2l0aW9uIG9uIGNhbnZhc1xuZnVuY3Rpb24gZ2V0TW91c2VQb3MoY2FudmFzLCBlKSB7XG4gIHZhciBwb2ludGVyID0gY2FudmFzLmdldFBvaW50ZXIoZSlcbiAgdmFyIHBvc1ggPSBwb2ludGVyLnhcbiAgdmFyIHBvc1kgPSBwb2ludGVyLnlcbiAgcmV0dXJuIHtcbiAgICB4OiBwb3NYLFxuICAgIHk6IHBvc1lcbiAgfVxufVxuXG5jb25zdCBwYWdlcyA9ICQoJy5wYWdlJylcbi8vIGRyb3AgZWxlbWVudFxucGFnZXMub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbnBhZ2VzLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xucGFnZXMub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0Y29uc29sZS5sb2coZSk7XG5cdHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdHZhciB5ID0gMDtcblx0Zm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0cmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHR2YXIgcGFnZUlkID0gJCh0aGlzKS5maW5kKCdjYW52YXMnKS5hdHRyKCdpZCcpO1xuXHRcdG1vdXNlUG9zID0gZ2V0TW91c2VQb3MoY2FudmFzZXNbcGFnZUlkXSwgZSlcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0XHRcdFx0ZGF0YTogZXZlbnQudGFyZ2V0LnJlc3VsdCxcblx0XHRcdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHBhZ2U6IHBhZ2VJZCxcblx0XHRcdFx0XHRtb3VzZVBvczogbW91c2VQb3Ncblx0XHRcdFx0fSk7XG5cdFx0XHR9LCB5ICogZHJvcERlbGF5KTtcblx0XHRcdHkgKz0gMTtcblx0XHR9O1xuXHRcdGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcblx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0U291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudCAoVE9ETzogVVBEQVRFIEZPUiBGQUJSSUMpXG4kKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNsb3NlJywgZnVuY3Rpb24oKSB7XG5cdHZhciBwYWdlSWQgPSAkKHRoaXMpXG5cdFx0LmNsb3Nlc3QoJy5wYWdlJylcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnRJZCA9ICQodGhpcylcblx0XHQucGFyZW50KClcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnREYXRhID0gJCh0aGlzKVxuXHRcdC5zaWJsaW5ncygpXG5cdFx0LmF0dHIoJ3NyYycpO1xuXHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0aWQ6IGVsZW1lbnRJZCxcblx0XHRkYXRhOiBlbGVtZW50RGF0YSxcblx0XHRwb3M6IFswLCAwLCAwLCAwLCAwXSxcblx0XHR2aXNpYmxlOiBmYWxzZSxcblx0XHRwYWdlOiBwYWdlSWRcblx0fSk7XG59KVxuXG5cblxuXG5cbi8vIC0tLSBWSUVXXG5cbnZhciBTb3VuZCA9IHtcblx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2luY29ycmVjdC5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH0sXG5cdGRpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9XG59O1xuXG4vLyBUT0RPOiBtZXJnZSB0aGVzZSB0d29cbmZ1bmN0aW9uIHNob3dUaW1lKFB1YmxpY2F0aW9uKSB7XG5cdHNlY29uZHMgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDEwMDA7XG5cdCQoJyNjb3VudGVyJykuc2hvdygpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLmlubmVySFRNTCA9XG5cdFx0c2Vjb25kcy50b0ZpeGVkKDIpICsgJyBzZWNvbmRzIGxlZnQhJztcbn1cbmZ1bmN0aW9uIG1vdXNlQ291bnRlcigpIHtcblx0JChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXHRcdGlmIChlLnBhZ2VYID49ICQoZG9jdW1lbnQpLndpZHRoKCkgLyAyKSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCArIDIwLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG4gIGlmIChQdWJsaWNhdGlvbi5leHBpcmVkICE9IHRydWUpIHtcbiAgICBQdWJsaWNhdGlvbi50aW1lRWxhcHNlZCA9IHRpbWVTZXQgLSBQdWJsaWNhdGlvbi50aW1lTGVmdFxuICAgIFB1YmxpY2F0aW9uLmV4cGlyZWQgPSB0cnVlXG4gICAgbG9ja0VsZW1lbnRzKGFsbEVsZW1lbnRzKCkpXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgJCgnLnN1Z2dlc3Rpb25zJykuaGlkZSgpXG4gICAgfSwgODAwKVxuICBcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgXHQkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKVxuICBcdGV4cGlyZWRUaW1lKClcbiAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgY2FudmFzZXNbY2FudmFzXS5zZWxlY3Rpb24gPSBmYWxzZVxuICAgIH1cbiAgXHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgXHRcdCQoJy53cmFwcGVyJykuYWRkQ2xhc3MoJ3NhdmVkX3ZpZXcnKTtcbiAgXHRcdHNhdmVkU3RhdGUoKVxuICBcdH0sIDUwMClcbiAgXHRjbGVhckludGVydmFsKHgpXG4gICAgaWYgKHR5cGVvZiB5ICE9PSAndW5kZWZpbmVkJykgeyAvLyBpZiBkaXNydXB0aW9uc1xuICAgICAgY2xlYXJJbnRlcnZhbCh5KVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkcm9wRWxlbWVudChwYWdlSWQsIGRhdGEsIG1vdXNlUG9zLCBjYWxsYmFjaykge1xuXHRjb25zb2xlLmxvZyhtb3VzZVBvcylcblx0dmFyIGVsZW1lbnQgPSB7IGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZCB9XG5cdHZhciBlbGVtZW50UG9zID0gY3JlYXRlRWxlbWVudChlbGVtZW50LCBtb3VzZVBvcywgY2FsbGJhY2spXG5cdFNvdW5kLmRpbmcoKVxufVxuXG5cblxuXG5cblxuXG4vLyBlcnJvcnNcblxudmFyIEVycm9yID0ge1xuXHRub3RBbGxvd2VkOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpXG5cdFx0YWxlcnRNZXNzYWdlKCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyBub3QgYWxsb3dlZCEnKVxuXHR9LFxuXHR0b29CaWc6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKCk7XG5cdFx0YWxlcnRNZXNzYWdlKCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyB0b28gYmlnIScpO1xuXHR9LFxuXHR0b29MYXRlOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpO1xuXHRcdGFsZXJ0TWVzc2FnZSgnVG9vIGxhdGUgYW1pZ28nKTtcblx0fVxufVxuXG5cblxuXG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbikge1xuXHRmb3IgKHZhciBjYW52YXNJZCBpbiBjYW52YXNlcykge1xuXHRcdHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24ucGFnZXNbY2FudmFzSWRdKTtcblx0XHRjYW52YXNlc1tjYW52YXNJZF0ubG9hZEZyb21KU09OKCBqc29uLCBmdW5jdGlvbigpIHtcbiAgICAgIGxvY2tFbGVtZW50cyhhbGxFbGVtZW50cygpKVxuXHRcdFx0Y2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbC5iaW5kKGNhbnZhc2VzW2NhbnZhc0lkXSlcblx0XHR9KVxuXHR9XG59XG5cblxuXG5cbi8vIC0tLSBCQUNLRU5EXG5cbi8vIHNhdmUgdG8gZGJcbmZ1bmN0aW9uIHNhdmV0b0RiKHB1YmxpY2F0aW9uKSB7XG5cdGZvciAodmFyIHBhZ2UgaW4gUHVibGljYXRpb24ucGFnZXMpIHtcblx0XHRQdWJsaWNhdGlvbi5wYWdlc1twYWdlXSA9IGNhbnZhc2VzW3BhZ2VdLnRvSlNPTigpIC8vIHVwZGF0ZSBhbGwgcGFnZXNcblx0fVxuXHQkLmFqYXgoe1xuXHRcdHVybDogJy9kYicsXG5cdFx0dHlwZTogJ3Bvc3QnLCAvLyBwZXJmb3JtaW5nIGEgUE9TVCByZXF1ZXN0XG5cdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24pLFxuXHRcdGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG5cdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRzdWNjZXNzOiBmdW5jdGlvbihwdWJsaWNhdGlvbikge1xuXHRcdFx0Y29uc29sZS5sb2coJ3B1YmxpY2F0aW9uIHNlbnQgdG8gZGF0YWJhc2UuJyk7XG5cdFx0fVxuXHR9KTtcblx0Y29uc29sZS5sb2coJ3NhdmVkP2lkPScgKyBQdWJsaWNhdGlvbi5pZClcbn1cblxuXG5cblxuXG4vLyAtLS0gSU5URVJGQUNFIEZYXG5cblxuLy8gbW92ZSB0aGVzZSBmdW5jdGlvbnMgdG8gaW50ZXJmYWNlIHBhcnQgb2YganM/XG5mdW5jdGlvbiBhbmltYXRlVXAob2JqKSB7XG4gIG9iai5zaG93KCk7XG4gIG9iai5jc3MoJ21hcmdpbi10b3AnLCAnMjBweCcpO1xuICBvYmouYW5pbWF0ZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgbWFyZ2luVG9wOiBcIjBweFwiLFxuICAgIH0sIDMwMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICB9KTtcbn07XG5cbmZ1bmN0aW9uIGFuaW1hdGVVcE91dChvYmosIHRpbWUpIHtcbiAgb2JqLnNob3coKTtcbiAgb2JqLmNzcygnbWFyZ2luLXRvcCcsICcyMHB4Jyk7XG4gIG9iai5hbmltYXRlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICBtYXJnaW5Ub3A6IFwiMHB4XCIsXG4gICAgfSwgdGltZS8yLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cbiAgfSk7XG4gIG9iai5hbmltYXRlKHtcbiAgICAgIG9wYWNpdHk6IDAsXG4gICAgICBtYXJnaW5Ub3A6IFwiMjBweFwiLFxuICAgIH0sIHRpbWUvMiwgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG4gIH0pO1xufTtcblxuZnVuY3Rpb24gc2hha2Uob2JqLCB0aW1lKSB7XG4gIGlmICghdGltZSkgKFxuICAgIHRpbWUgPSA1MDBcbiAgKVxuICBvYmouYWRkQ2xhc3MoICdzaGFrZSBzaGFrZS1jb25zdGFudCcgKVxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgb2JqLnJlbW92ZUNsYXNzKCAnc2hha2Ugc2hha2UtY29uc3RhbnQnIClcbiAgfSwgdGltZSk7XG59XG5cblxuXG5cblxuXG4vLyAtLS0gRElTUlVQVElPTlNcblxuXG5mdW5jdGlvbiBhbGxFbGVtZW50cyh0eXBlKSB7XG4gIHZhciBvYmpzID0gW11cbiAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICBpZiAodHlwZSkge1xuICAgICAgY2FudmFzT2JqcyA9IGNhbnZhc2VzW2NhbnZhc10uZ2V0T2JqZWN0cyh0eXBlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjYW52YXNPYmpzID0gY2FudmFzZXNbY2FudmFzXS5nZXRPYmplY3RzKClcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IGNhbnZhc09ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGlmIChjYW52YXNPYmpzW2ldLmlkICE9ICdsb2NrJykgeyAvLyB1c2UgdGhpcyB0byBsb2NrXG4gICAgICAgIG9ianMucHVzaCggY2FudmFzT2Jqc1tpXSApXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmpzXG59XG5cbmZ1bmN0aW9uIGxvY2tFbGVtZW50cyhvYmpzKSB7XG4gIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgb2Jqc1tpXS5zZWxlY3RhYmxlID0gZmFsc2VcbiAgICBvYmpzW2ldLmhhc0NvbnRyb2xzID0gZmFsc2VcbiAgICBvYmpzW2ldLmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyQWxsQ2FudmFzZXMoKSB7XG4gIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsKClcbiAgfVxufVxuXG5mdW5jdGlvbiBmaWx0ZXJJbWdzKG9ianMsIGZpbHRlcikge1xuICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIG9ianNbaV0uZmlsdGVycy5wdXNoKGZpbHRlcilcbiAgICBvYmpzW2ldLmFwcGx5RmlsdGVycygpXG4gIH1cbiAgcmVuZGVyQWxsQ2FudmFzZXMoKVxufVxuXG52YXIgRGlzcnVwdGlvbiA9IHtcblx0Y29taWM6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9jb21pYyhvYmpzKSB7XG4gICAgICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBvYmpzW2ldLmZvbnRGYW1pbHkgPSAnXCJDb21pYyBTYW5zIE1TXCInXG4gICAgICB9XG4gICAgfVxuICAgIF9jb21pYyggYWxsRWxlbWVudHMoJ3RleHQnKSApXG4gICAgX2NvbWljKCBhbGxFbGVtZW50cygndGV4dGJveCcpIClcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnQ2FuXFwndCB5b3Ugc3BpY2UgdGhlIHR5cG9ncmFwaHkgYSBiaXQ/JywgJ0d1dGVuYmVyZycpXG5cdH0sXG5cdHJvdGF0ZUltZ3NSYW5kOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfcm90YXRlSW1nc1JhbmQob2Jqcykge1xuICAgICAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgb2Jqc1tpXS5vcmlnaW5YID0gJ2NlbnRlcidcbiAgICAgICAgb2Jqc1tpXS5vcmlnaW5ZID0gJ2NlbnRlcidcbiAgICAgICAgb2Jqc1tpXS5hbmltYXRlKHsgYW5nbGU6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgfSwge1xuICAgICAgICAgIGR1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgIG9uQ2hhbmdlOiBvYmpzW2ldLmNhbnZhcy5yZW5kZXJBbGwuYmluZChvYmpzW2ldLmNhbnZhcyksXG4gICAgICAgICAgZWFzaW5nOiBmdW5jdGlvbih0LCBiLCBjLCBkKSB7IHJldHVybiBjKnQvZCArIGIgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfcm90YXRlSW1nc1JhbmQoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgY3JpdGljU2F5cygnSSBmaW5kIHRoaXMgbGF5b3V0IGEgYml0IHN0YXRpYy4uLicsICdHdXRlbmJlcmcnKVxuXHR9LFxuXHRsb2NrUmFuZFBhZ2U6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FudmFzZXMpXG4gICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cblx0XHRyYW5kQ2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlO1xuXHRcdGZvciAob2JqZWN0SWQgaW4gcmFuZENhbnZhcy5nZXRPYmplY3RzKCkgKSB7XG5cdFx0XHR2YXIgb2JqZWN0ID0gcmFuZENhbnZhcy5pdGVtKG9iamVjdElkKVxuXHRcdFx0b2JqZWN0LnNlbGVjdGFibGUgPSBmYWxzZVxuXHRcdFx0b2JqZWN0LmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnXG5cdFx0fVxuXHRcdHJhbmRDYW52YXMuYWRkKG5ldyBmYWJyaWMuTGluZShbMCwgMCwgcmFuZENhbnZhcy53aWR0aCwgcmFuZENhbnZhcy5oZWlnaHRdLCB7XG5cdCAgXHRzdHJva2U6ICdyZWQnLFxuXHQgIFx0c2VsZWN0YWJsZTogZmFsc2UsXG5cdCAgXHRzdHJva2VXaWR0aDogMixcbiAgICAgIGhvdmVyQ3Vyc29yOidkZWZhdWx0JyxcbiAgICAgIGlkOiAnbG9jaydcblx0XHR9KSlcblx0XHRyYW5kQ2FudmFzLnJlbmRlckFsbCgpO1xuXHRcdC8vIFRPRE86IHByZXZlbnQgZHJvcFxuICAgIGNyaXRpY1NheXMoJ1BhZ2UgJyArIHJhbmRDYW52YXMuaWQgKyAnIGlzIG5vdyBsb2NrZWQuLi4nLCAnR3V0ZW5iZXJnJykgLy8gVE9ET1xuXHR9LFxuICBzaHVmZmxlUGFnZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0b1NodWZmbGUgPSBbXVxuICAgIHZhciBpID0gMFxuICAgIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmIChpID4gMCkgeyAvLyBwcmV2ZW50IHNodWZmbGluZyBmaXJzdCBwYWdlXG4gICAgICAgIHRvU2h1ZmZsZS5wdXNoKCBjYW52YXNlc1tjYW52YXNJZF0udG9KU09OKCkgKVxuICAgICAgfVxuICAgICAgaSArPSAxXG4gICAgfVxuICAgIHNodWZmbGVBcnJheSh0b1NodWZmbGUpXG4gICAgdmFyIHkgPSAwXG4gICAgZm9yIChjYW52YXNJZCBpbiBjYW52YXNlcykge1xuICAgICAgaWYgKHkgPiAwKSB7XG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5sb2FkRnJvbUpTT04odG9TaHVmZmxlW3kgLSAxXSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbC5iaW5kKGNhbnZhc2VzW2NhbnZhc0lkXSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHkgKz0gMVxuICAgIH1cbiAgICBjcml0aWNTYXlzKCdUaGUgcnl0aG0gb2YgdGhpcyBwdWJsaWNhdGlvbiBpcyBhIGJpdCB3ZWFrLiBEb25cXCd0IHlvdSB0aGluaz8nLCAnR3V0ZW5iZXJnJylcbiAgfSxcblx0YWRzOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhjYW52YXNlcylcbiAgICByYW5kQ2FudmFzID0gY2FudmFzZXNba2V5c1sga2V5cy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXVxuXHRcdHJhbmRDYW52YXMuYWRkKG5ldyBmYWJyaWMuUmVjdCh7XG5cdFx0XHR3aWR0aDogcmFuZENhbnZhcy53aWR0aCxcblx0XHRcdGhlaWdodDogMzAsXG5cdFx0XHRmaWxsOiAnIzBEMjEzRScsXG5cdFx0XHRsb2NrTW92ZW1lbnRYOiB0cnVlLFxuXHRcdFx0bG9ja01vdmVtZW50WTogdHJ1ZSxcblx0XHRcdGxvY2tSb3RhdGlvbjogdHJ1ZSxcblx0XHRcdGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHRcdFx0bGVmdDogcmFuZENhbnZhcy53aWR0aC8yLFxuXHRcdFx0dG9wOiAxNSxcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaWQ6ICdsb2NrJ1xuXHRcdH0pKTtcblx0XHRmYWJyaWMuSW1hZ2UuZnJvbVVSTCgnL2Fzc2V0cy9pbWcva2lua28ucG5nJywgZnVuY3Rpb24oaW1nKXtcblx0XHRcdFx0aW1nLmhhc0JvcmRlcnMgPSBmYWxzZTtcblx0XHRcdFx0aW1nLmhhc0NvbnRyb2xzID0gZmFsc2U7XG4gICAgICAgIGltZy5zZWxlY3RhYmxlID0gZmFsc2U7XG5cdFx0XHRcdGltZy5zY2FsZSgwLjIpO1xuXHRcdFx0XHRpbWcubGVmdCA9IHJhbmRDYW52YXMud2lkdGgtMTAwO1xuXHRcdFx0XHRpbWcudG9wID0gNTA7XG5cdFx0XHRcdGltZy5sb2NrTW92ZW1lbnRYID0gdHJ1ZTtcblx0XHRcdFx0aW1nLmxvY2tNb3ZlbWVudFkgPSB0cnVlO1xuXHRcdFx0XHRpbWcubG9ja1JvdGF0aW9uID0gdHJ1ZTtcblx0XHRcdFx0aW1nLnNldENvbnRyb2xzVmlzaWJpbGl0eSA9IGZhbHNlO1xuICAgICAgICBpbWcuaWQgPSAnbG9jaydcblx0XHRcdFx0cmFuZENhbnZhcy5pbnNlcnRBdChpbWcsMyk7XG5cdFx0XHRcdC8vIFRPRE86IGl0IG9ubHkgd29ya3Mgd2l0aCBvbmUgaW1hZ2UgZm9yIHNvbWUgcmVhc29uLiBydW5uaW5nIHRoZSBmdW5jdGlvbiBtdWx0aXBsZSB0aW1lcyBpdCBhZGRzIG1vcmUgdG9wIGJhcnMgYnV0IGp1c3QgbW92ZXMgYWxsIHRoZSBpbWFnZXMgdG8gdGhlIHNhbWUgcGxhY2Vcblx0XHR9KTtcblxuICAgIGNyaXRpY1NheXMoJ0kgZm91bmQgYSBzcG9uc29yIScsICdHdXRlbmJlcmcnKVxuXHR9LFxuICBoYWxmVGltZTogZnVuY3Rpb24gKCkge1xuICAgIFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgLyAyXG4gICAgY3JpdGljU2F5cygnVGhpcyBpcyB0YWtpbmcgdG9vIGxvbmcuLi4nLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgZG91YmxlVGltZTogZnVuY3Rpb24gKCkge1xuICAgIFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgKiAyXG4gICAgY3JpdGljU2F5cygnVGFrZSB5b3VyIHRpbWUuLi4nLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgZ3JleXNjYWxlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLkdyYXlzY2FsZSgpIClcbiAgICBjcml0aWNTYXlzKCdTaGFsbCB3ZSBtYWtlIGl0IGxvb2sgY2xhc3NpYz8nLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgaW52ZXJ0SW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLkludmVydCgpIClcbiAgICBjcml0aWNTYXlzKCdUaGUgdmlzdWFscyBuZWVkIHNvbWUgZWRneSBjb2xvcnMnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgc2VwaWFJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuU2VwaWEoKSApXG4gICAgY3JpdGljU2F5cygnRXZlciBoZWFyZCBvZiBJbnN0YWdyYW0/JywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGJsYWNrd2hpdGVJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuQmxhY2tXaGl0ZSgpIClcbiAgICBjcml0aWNTYXlzKCdUaGlzIHNob3VsZCBsb29rIGxpa2UgYSB6aW5lIScsICdHdXRlbmJlcmcnKVxuICB9LFxuICBwaXhlbGF0ZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5QaXhlbGF0ZSh7YmxvY2tzaXplOiAyMH0pIClcbiAgICBjcml0aWNTYXlzKCdJc25cXCd0IHRoaXMgYSB2aWRlb2dhbWUgYWZ0ZXIgYWxsPycsICdHdXRlbmJlcmcnKVxuICB9LFxuICBub2lzZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5Ob2lzZSh7bm9pc2U6IDIwMH0pIClcbiAgICBjcml0aWNTYXlzKCdNQUtFIFNPTUUgTk9PSVNFISEnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgZm9udFNpemVCaWdnZXI6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9mb250U2l6ZUJpZ2dlcihlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoJ2ZvbnRTaXplJywgZWxlbWVudHNbaV0uZm9udFNpemUgKiBzY2FsZUZvbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBfZm9udFNpemVCaWdnZXIoYWxsRWxlbWVudHMoJ3RleHRib3gnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnQ2FuXFwndCByZWFkIGFueXRoaW5nIDooJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGZvbnRTaXplU21hbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2ZvbnRTaXplQmlnZ2VyKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCgnZm9udFNpemUnLCBlbGVtZW50c1tpXS5mb250U2l6ZSAvIHNjYWxlRm9udCk7XG4gICAgICB9XG4gICAgfVxuICAgIF9mb250U2l6ZVNtYWxsZXIoYWxsRWxlbWVudHMoJ3RleHRib3gnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnSVxcJ20gbm90IGJsaW5kIScsICdHdXRlbmJlcmcnKVxuICB9LFxuICBiaWdnZXJJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfYmlnZ2VySW1ncyhlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIHNjYWxlWTogc2NhbGVVcEltZ3MsXG4gICAgICAgICAgc2NhbGVYOiBzY2FsZVVwSW1nc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2JpZ2dlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0JMT1cgVVAhJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIHNtYWxsZXJJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfc21hbGxlckltZ3MoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBzY2FsZVk6IHNjYWxlRG93bkltZ3MsXG4gICAgICAgICAgc2NhbGVYOiBzY2FsZURvd25JbWdzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBfc21hbGxlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0JMT1cgVVAhJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGxvY2tBbGxFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgbG9ja0VsZW1lbnRzKGFsbEVsZW1lbnRzKCkpXG4gICAgY3JpdGljU2F5cygnVGhpbmdzIGFyZSBwZXJmZWN0IGFzIHRoZXkgYXJlLicsICdHdXRlbmJlcmcnKVxuICB9LFxuICBza2V3QWxsRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9za2V3QWxsRWxlbWVudHMoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBzY2FsZVk6IHNjYWxlVXBJbWdzLFxuICAgICAgICAgIHNjYWxlWDogc2NhbGVVcEltZ3MsXG4gICAgICAgICAgdHJhbnNmb3JtTWF0cml4OiBbMSwgLjUwLCAwLCAxLCAwLCAwXVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfc2tld0FsbEVsZW1lbnRzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdTdHJldGNoIHRob3NlIGltYWdlcywgY29tZSBvbiEnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgZmxpcEFsbEltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9mbGlwQWxsSW1ncyhlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIGFuZ2xlOiAnLTE4MCcsXG4gICAgICAgICAgZmxpcFk6IHRydWVcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgX2ZsaXBBbGxJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdGbGlwIHRob3NlIGltYWdlcywgY29tZSBvbiEnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgYml0TGVmdGJpdFJpZ2h0QWxsSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2JpdExlZnRiaXRSaWdodEFsbEltZ3MoZWxlbWVudHMsIGRpc3RhbmNlKSB7XG4gICAgICB2YXIgZHVyYXRpb24gPSAyMDBcbiAgICAgIHZhciBwYXVzZSA9IDEwMFxuXG4gICAgICBmdW5jdGlvbiBsZWZ0MShpLCBlbGVtZW50cykge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgZWxlbWVudHNbaV0uYW5pbWF0ZSgnbGVmdCcsIGVsZW1lbnRzW2ldLmxlZnQgKyBkaXN0YW5jZSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKSwgeyAvLyBhIGJpdCBvZiByYW5kb21uZXNzIHRvIG1ha2UgaXQgbW9yZSBodW1hblxuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBlbGVtZW50c1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQoZWxlbWVudHNbaV0uY2FudmFzKSxcbiAgICAgICAgICB9KVxuICAgICAgICB9LCAwKVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gbGVmdDIoaSwgZWxlbWVudHMpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmFuaW1hdGUoJ2xlZnQnLCBlbGVtZW50c1tpXS5sZWZ0ICsgZGlzdGFuY2UgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCksIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCksXG4gICAgICAgICAgICBvbkNoYW5nZTogZWxlbWVudHNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKGVsZW1lbnRzW2ldLmNhbnZhcyksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgZHVyYXRpb24gKyBwYXVzZSlcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHJpZ2h0MShpLCBlbGVtZW50cykge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgZWxlbWVudHNbaV0uYW5pbWF0ZSgnbGVmdCcsIGVsZW1lbnRzW2ldLmxlZnQgLSBkaXN0YW5jZSAtIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKSwge1xuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBlbGVtZW50c1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQoZWxlbWVudHNbaV0uY2FudmFzKSxcbiAgICAgICAgICB9KVxuICAgICAgICB9LCAoZHVyYXRpb24gKyBwYXVzZSkgKiAyIClcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHJpZ2h0MihpLCBlbGVtZW50cykge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgZWxlbWVudHNbaV0uYW5pbWF0ZSgnbGVmdCcsIGVsZW1lbnRzW2ldLmxlZnQgLSBkaXN0YW5jZSAtIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKSwge1xuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBlbGVtZW50c1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQoZWxlbWVudHNbaV0uY2FudmFzKSxcbiAgICAgICAgICB9KVxuICAgICAgICB9LCAoZHVyYXRpb24gKyBwYXVzZSkgKiAzIClcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGVmdDEoaSwgZWxlbWVudHMpXG4gICAgICAgIGxlZnQyKGksIGVsZW1lbnRzKVxuICAgICAgICByaWdodDEoaSwgZWxlbWVudHMpXG4gICAgICAgIHJpZ2h0MihpLCBlbGVtZW50cylcbiAgICAgIH1cbiAgICB9XG4gICAgX2JpdExlZnRiaXRSaWdodEFsbEltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIDcwKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdBIGJpdCB0byB0aGUgcmlnaHQuLi4gTm8gbm8sIGEgYml0IHRvIHRoZSBsZWZ0Li4uJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIHJpZ2lkTW9kZTogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX3JpZ2lkTW9kZShlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIGxvY2tNb3ZlbWVudFk6IHRydWUsXG4gICAgICAgICAgbG9ja1JvdGF0aW9uOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIF9yaWdpZE1vZGUoYWxsRWxlbWVudHMoJ2ltYWdlJyksIDcwKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdSZXNwZWN0IHRoZSBncmlkIScsICdHdXRlbmJlcmcnKVxuICB9LFxuICBiZXR0ZXJUaXRsZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRpdGxlcyA9IFtcbiAgICAgICdEb24gUXVpeG90ZScsXG4gICAgICAnSW4gU2VhcmNoIG9mIExvc3QgVGltZScsXG4gICAgICAnVWx5c3NlcycsXG4gICAgICAnVGhlIE9keXNzZXknLFxuICAgICAgJ1dhciBhbmQgUGVhY2UnLFxuICAgICAgJ01vYnkgRGljaycsXG4gICAgICAnVGhlIERpdmluZSBDb21lZHknLFxuICAgICAgJ0hhbWxldCcsXG4gICAgICAnVGhlIEdyZWF0IEdhdHNieScsXG4gICAgICAnVGhlIElsaWFkJ1xuICAgIF1cbiAgICB2YXIgcmFuZFRpdGxlID0gdGl0bGVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRpdGxlcy5sZW5ndGgpXVxuICAgIHRpdGxlLnRleHQgPSByYW5kVGl0bGVcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgUHVibGljYXRpb24udGl0bGUgPSByYW5kVGl0bGVcbiAgICBjcml0aWNTYXlzKCdJIHN1Z2dlc3QgYSBjYXRjaGllciB0aXRsZScsICdHdXRlbmJlcmcnKVxuICB9LFxuICBiZXR0ZXJBdXRob3JzOiBmdW5jdGlvbigpIHsgLy8gVE9ETzogbm90IHN1cmUgd2h5IHRoaXMgZG9lc24ndCB3b3JrXG4gICAgdmFyIGF1dGhvcnMgPSBbXG4gICAgICAnTGVvIFRvbHN0b3knLFxuICAgICAgJ0Z5b2RvciBEb3N0b2V2c2t5JyxcbiAgICAgICdXaWxsaWFtIFNoYWtlc3BlYXJlJyxcbiAgICAgICdDaGFybGVzIERpY2tlbnMnLFxuICAgICAgJ0hvbWVyJyxcbiAgICAgICdKLiBSLiBSLiBUb2xraWVuJyxcbiAgICAgICdHZW9yZ2UgT3J3ZWxsJyxcbiAgICAgICdFZGdhciBBbGxhbiBQb2UnLFxuICAgICAgJ01hcmsgVHdhaW4nLFxuICAgICAgJ1ZpY3RvciBIdWdvJ1xuICAgIF1cbiAgICB2YXIgcmFuZEF1dGhvciA9IGF1dGhvcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXV0aG9ycy5sZW5ndGgpXVxuICAgIGF1dGhvcnMudGV4dCA9IHJhbmRBdXRob3JcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgUHVibGljYXRpb24uYXV0aG9ycyA9IHJhbmRBdXRob3JcbiAgICBjcml0aWNTYXlzKCdXZSBuZWVkIGEgd2VsbC1rbm93biB0ZXN0aW1vbmlhbC4nLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgZHJhd2luZ01vZGU6IGZ1bmN0aW9uKCkgeyAvLyBUT0RPOiBub3Qgc3VyZSB3aHkgdGhpcyBkb2Vzbid0IHdvcmtcbiAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgY2FudmFzZXNbY2FudmFzXS5pc0RyYXdpbmdNb2RlID0gdHJ1ZVxuICAgICAgY2FudmFzZXNbY2FudmFzXS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2ZmZmZhYSdcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10ucmVuZGVyQWxsKClcbiAgICB9XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc10uaXNEcmF3aW5nTW9kZSA9IGZhbHNlXG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc10uYmFja2dyb3VuZENvbG9yID0gJyNmZmZmZmYnXG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc10ucmVuZGVyQWxsKClcbiAgICAgIH1cbiAgICB9LCBkcmF3aW5nTW9kZVRpbWUpXG4gICAgY3JpdGljU2F5cygnRG8geW91IGxpa2UgdG8gZHJhdz8nLCAnR3V0ZW5iZXJnJylcbiAgfVxufVxuXG5cblxuXG5cbi8vIC0tLSBJTlRFUkZBQ0UgQlVUVE9OU1xuXG4kKCcuYnV0dG9uLnNhdmUnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgJCgnLmJ1dHRvbi5zYXZlJykuaGlkZSgpXG4gICQoJy5idXR0b24ucGRmLCAuYnV0dG9uLmJvb2tsZXQnKS5jc3MoJ2Rpc3BsYXknLCdpbmxpbmUtYmxvY2snKVxufSlcbiJdLCJmaWxlIjoibWFpbi5qcyJ9
