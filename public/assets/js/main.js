// --- DEFAULTS

var disruptionsOn = true
var dropDelay = 100
var disruptionInterval = 5000
var bonusTime = 1000
var textChunksLength = 1500
var fontSize = 15
var scaleFont = 1.5
var scaleImgs = 0.7
var achievementSpan = 3




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
  if (Publication.expired != true) {
    Publication.timeElapsed = timeSet - Publication.timeLeft
    Publication.expired = true
    lockElements(allElements())
    setTimeout(function(){
      $('.suggestions').hide()
    }, 800)
  	document.getElementById('counter').innerHTML = 'expired!';
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
  },
  skewAllElements: function() {
    function _skewAllElements(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set({
          scaleY: scaleImgs,
          scaleX: scaleImgs,
          transformMatrix: [1, .50, 0, 1, 0, 0]
        })
      }
    }
    _skewAllElements(allElements('image'))
    renderAllCanvases()
    criticSays('Stretch those images, come on!', 'Gutenberg')
  },
  flipAllElements: function() {
    function _flipAllElements(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set({
          angle: '-180',
          flipY: true
        })
      }
    }
    _flipAllElements(allElements('image'))
    renderAllCanvases()
    criticSays('Stretch those images, come on!', 'Gutenberg')
  }
};


// --- INTERFACE BUTTONS

$('.button.save').click(function() {
  $('.button.save').hide()
  $('.button.pdf, .button.booklet').css('display','inline-block')
})
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBERUZBVUxUU1xuXG52YXIgZGlzcnVwdGlvbnNPbiA9IHRydWVcbnZhciBkcm9wRGVsYXkgPSAxMDBcbnZhciBkaXNydXB0aW9uSW50ZXJ2YWwgPSA1MDAwXG52YXIgYm9udXNUaW1lID0gMTAwMFxudmFyIHRleHRDaHVua3NMZW5ndGggPSAxNTAwXG52YXIgZm9udFNpemUgPSAxNVxudmFyIHNjYWxlRm9udCA9IDEuNVxudmFyIHNjYWxlSW1ncyA9IDAuN1xudmFyIGFjaGlldmVtZW50U3BhbiA9IDNcblxuXG5cblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcblx0dmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcblx0dmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG5cdHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gYnl0ZUNvdW50KHMpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJKHMpLnNwbGl0KC8lLi58Li8pLmxlbmd0aCAtIDE7XG59XG5cbnZhciBnZXRVcmxQYXJhbWV0ZXIgPSBmdW5jdGlvbiBnZXRVcmxQYXJhbWV0ZXIoc1BhcmFtKSB7XG4gIHZhciBzUGFnZVVSTCA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSksXG4gICAgc1VSTFZhcmlhYmxlcyA9IHNQYWdlVVJMLnNwbGl0KCcmJyksXG4gICAgc1BhcmFtZXRlck5hbWUsXG4gICAgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgc1VSTFZhcmlhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgIHNQYXJhbWV0ZXJOYW1lID0gc1VSTFZhcmlhYmxlc1tpXS5zcGxpdCgnPScpO1xuXG4gICAgaWYgKHNQYXJhbWV0ZXJOYW1lWzBdID09PSBzUGFyYW0pIHtcbiAgICAgICAgcmV0dXJuIHNQYXJhbWV0ZXJOYW1lWzFdID09PSB1bmRlZmluZWQgPyB0cnVlIDogc1BhcmFtZXRlck5hbWVbMV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNodWZmbGVBcnJheShhcnJheSkge1xuICBmb3IgKHZhciBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgIHZhciBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgdmFyIHRlbXAgPSBhcnJheVtpXTtcbiAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgIGFycmF5W2pdID0gdGVtcDtcbiAgfVxufVxuXG5mdW5jdGlvbiB0aW1lQ29udmVydGVyKFVOSVhfdGltZXN0YW1wKXtcbiAgdmFyIGEgPSBuZXcgRGF0ZShVTklYX3RpbWVzdGFtcCk7XG4gIHZhciBtb250aHMgPSBbJ0phbicsJ0ZlYicsJ01hcicsJ0FwcicsJ01heScsJ0p1bicsJ0p1bCcsJ0F1ZycsJ1NlcCcsJ09jdCcsJ05vdicsJ0RlYyddO1xuICB2YXIgeWVhciA9IGEuZ2V0RnVsbFllYXIoKTtcbiAgdmFyIG1vbnRoID0gbW9udGhzW2EuZ2V0TW9udGgoKV07XG4gIHZhciBkYXRlID0gYS5nZXREYXRlKCk7XG4gIHZhciB0aW1lID0gZGF0ZSArICcgJyArIG1vbnRoICsgJyAnICsgeWVhcjtcbiAgcmV0dXJuIHRpbWU7XG59XG5cblxuXG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MsIGNhbGxiYWNrKSB7XG4gIGZ1bmN0aW9uIGNodW5rU3RyaW5nKHN0ciwgbGVuZ3RoKSB7XG4gICAgcmV0dXJuIHN0ci5tYXRjaChuZXcgUmVnRXhwKCd7LjEsJyArIGxlbmd0aCArICd9JywgJ2cnKSk7XG4gIH1cblx0dmFyIHRoZU1vdXNlUG9zID0gbW91c2VQb3Ncblx0aWYgKGVsZW1lbnQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpKSB7XG5cdFx0ZmFicmljLkltYWdlLmZyb21VUkwoZWxlbWVudC5kYXRhLCBmdW5jdGlvbihteUltZywgY2FsbGJhY2spIHtcbiBcdFx0XHR2YXIgaW1nID0gbXlJbWcuc2V0KHsgbGVmdDogMCwgdG9wOiAwLCB3aWR0aDogbXlJbWcud2lkdGgsIGhlaWdodDogbXlJbWcuaGVpZ2h0fSk7XG4gXHRcdFx0aWYgKCBpbWcud2lkdGggPiBjYW52YXNlc1tlbGVtZW50LnBhZ2VdLndpZHRoICkge1xuIFx0XHRcdFx0aW1nLnNjYWxlVG9XaWR0aChjYW52YXNlc1tlbGVtZW50LnBhZ2VdLndpZHRoIC8gMTAwICogNTAgKTsgLy8gNTAlIG9mIHRoZSBjYW52YXNcbiBcdFx0XHR9XG4gXHRcdFx0aW1nLmxlZnQgPSB0aGVNb3VzZVBvcy54XG4gXHRcdFx0aW1nLnRvcCA9IHRoZU1vdXNlUG9zLnlcbiBcdFx0XHRpbWcub24oJ2FkZGVkJywgZnVuY3Rpb24oKSB7XG4gXHRcdFx0XHRjYWxsYmFjaztcbiBcdFx0XHR9KTtcbiBcdFx0XHRjYW52YXNlc1tlbGVtZW50LnBhZ2VdLmFkZChpbWcpXG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGRlQmFzZWRUZXh0ID0gYXRvYihlbGVtZW50LmRhdGEuc3Vic3RyaW5nKDIzKSk7XG4gICAgY2h1bmtzID0gZGVCYXNlZFRleHQubWF0Y2gobmV3IFJlZ0V4cCgnKC58W1xcclxcbl0pezEsJyArIHRleHRDaHVua3NMZW5ndGggKyAnfScsICdnJykpXG4gICAgdmFyIGN1cnJQYWdlID0gcGFyc2VJbnQoIGVsZW1lbnQucGFnZS5zdWJzdHIoZWxlbWVudC5wYWdlLmxlbmd0aCAtIDEpIClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGNhbnZhc2VzWydwJyArIChjdXJyUGFnZSArIGkpXSkge1xuICAgICAgICBjYW52YXNlc1sncCcgKyAoY3VyclBhZ2UgKyBpKV0uYWRkKG5ldyBmYWJyaWMuVGV4dGJveChjaHVua3NbaV0gKyAnLScsIHtcbiAgICAgICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgICAgICAgIGxlZnQ6IDIwLFxuICAgICAgICAgIHRvcDogMjAsXG4gICAgICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgICAgIHdpZHRoOiA0MTAsXG4gICAgICAgICAgYnJlYWtXb3JkczogdHJ1ZSxcbiAgICAgICAgICBvcmlnaW5YOiAnbGVmdCcsXG4gICAgICAgICAgb3JpZ2luWTogJ3RvcCdcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfVxuXHRcdGNhbGxiYWNrO1xuXHR9XG59XG5cblxuLy8gLS0tIGluaXRpYWxpemUgY2FudmFzZXNcbnZhciBjYW52YXNlcyA9IHt9XG5mdW5jdGlvbiBpbml0Q2FudmFzZXMoKSB7XG5cdCQoJ2NhbnZhcycpLmVhY2goZnVuY3Rpb24oaSkge1xuXHRcdGNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKHRoaXMpO1xuXHQgIGNhbnZhcy5zZXRXaWR0aCggJCh0aGlzKS5jbG9zZXN0KCcucGFnZScpLndpZHRoKCkgKTtcblx0XHRjYW52YXMuc2V0SGVpZ2h0KCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykuaGVpZ2h0KCkgKTtcbiAgICBjYW52YXMuYmFja2dyb3VuZENvbG9yID0gJ3doaXRlJztcbiAgICBjYW52YXMuaWQgPSAncCcgKyAoaSsxKTtcblxuXHRcdGNhbnZhc2VzWydwJyArIChpICsgMSldID0gY2FudmFzO1xuXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPj0gMCkgeyAvLyBpZiAgc2F2ZWRcbiAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZVxuICAgIH1cblxuXHR9KTtcblx0ZmFicmljLk9iamVjdC5wcm90b3R5cGUub3JpZ2luWCA9IGZhYnJpYy5PYmplY3QucHJvdG90eXBlLm9yaWdpblkgPSAnY2VudGVyJyAvLyBvcmlnaW4gYXQgdGhlIGNlbnRlclxuICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA8IDApIHsgLy8gaWYgbm90IHNhdmVkXG4gIFx0dmFyIHRpdGxlID0gbmV3IGZhYnJpYy5UZXh0Ym94KCdJbnNlcnQgVGl0bGUnLCB7XG4gIFx0ICB0b3A6IDEyMCxcbiAgXHQgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8sIHNlcmlmJyxcbiAgXHQgIGZpbGw6ICcjNzc3JyxcbiAgXHQgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgXHQgIGZvbnRTaXplOiAzMCxcbiAgXHQgIGZvbnRXZWlnaHQ6ICdib2xkJyxcbiAgXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gIFx0ICB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG4gIFx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gIFx0ICBvcmlnaW5YOiAnbGVmdCcsXG4gIFx0ICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgIGlkOiAnbG9jaycsXG4gICAgICBjYWNoZTogZmFsc2VcbiAgXHR9KS5vbignZWRpdGluZzplbnRlcmVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRoaXMudGV4dCA9ICdJbnNlcnQgVGl0bGUnKSB7XG4gICAgICAgIHRoaXMudGV4dCA9ICcnXG4gICAgICAgIHRoaXMuaGlkZGVuVGV4dGFyZWEudmFsdWUgPSAnJ1xuICAgICAgfVxuICAgIH0pLm9uKCdlZGl0aW5nOmV4aXRlZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIFB1YmxpY2F0aW9uLnRpdGxlID0gdGhpcy50ZXh0XG4gICAgICB0aGlzLnNlbGVjdGFibGUgPSBmYWxzZVxuICAgICAgdGhpcy5oYXNDb250cm9scyA9IGZhbHNlXG4gICAgfSlcbiAgXHRjYW52YXNlc1sncDEnXS5hZGQodGl0bGUpXG4gIFx0dmFyIGxpbmVMZW5naHQgPSAyNTBcbiAgXHRjYW52YXNlc1sncDEnXS5hZGQobmV3IGZhYnJpYy5MaW5lKFswLCAwLCBsaW5lTGVuZ2h0LCAwXSwge1xuICBcdFx0bGVmdDogKCBjYW52YXNlc1sncDEnXS53aWR0aCAtIGxpbmVMZW5naHQpIC8gMixcbiAgXHQgIHRvcDogMTYwLFxuICBcdCAgc3Ryb2tlOiAnIzIyMicsXG4gIFx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgXHQgXHRvcmlnaW5YOiAnbGVmdCcsXG4gIFx0ICBvcmlnaW5ZOiAndG9wJ1xuICBcdH0pKTtcbiAgXHR2YXIgYXV0aG9ycyA9IG5ldyBmYWJyaWMuVGV4dGJveCgnSW5zZXJ0IEF1dGhvcnMnLCB7XG4gIFx0ICB0b3A6IDE4MCxcbiAgXHQgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8sIHNlcmlmJyxcbiAgXHQgIGZpbGw6ICcjNzc3JyxcbiAgXHQgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgXHQgIGZvbnRTaXplOiAyMCxcbiAgXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gIFx0ICB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG4gIFx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gIFx0ICBvcmlnaW5YOiAnbGVmdCcsXG4gIFx0ICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgIGlkOiAnbG9jaydcbiAgXHR9KS5vbignZWRpdGluZzplbnRlcmVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRoaXMudGV4dCA9ICdJbnNlcnQgQXV0aG9ycycpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJydcbiAgICAgICAgdGhpcy5oaWRkZW5UZXh0YXJlYS52YWx1ZSA9ICcnXG4gICAgICB9XG4gICAgfSkub24oJ2VkaXRpbmc6ZXhpdGVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgUHVibGljYXRpb24uYXV0aG9ycyA9IHRoaXMudGV4dFxuICAgICAgdGhpcy5zZWxlY3RhYmxlID0gZmFsc2VcbiAgICAgIHRoaXMuaGFzQ29udHJvbHMgPSBmYWxzZVxuICAgIH0pXG4gIFx0Y2FudmFzZXNbJ3AxJ10uYWRkKGF1dGhvcnMpXG4gICAgdmFyIGRhdGUgPSBuZXcgZmFicmljLlRleHQoIHRpbWVDb252ZXJ0ZXIoUHVibGljYXRpb24uZGF0ZSksIHtcbiAgICAgIHRvcDogNjAwLFxuICAgICAgbGVmdDogY2FudmFzZXNbJ3A4J10ud2lkdGgvMixcbiAgICAgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8sIHNlcmlmJyxcbiAgICAgIGZpbGw6ICcjNzc3JyxcbiAgICAgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgICAgIGZvbnRTaXplOiAxNCxcbiAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAvLyB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgICAgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gICAgICBvcmlnaW5YOiAnY2VudGVyJyxcbiAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJ1xuICAgIH0pXG4gICAgY2FudmFzZXNbJ3A4J10uYWRkKGRhdGUpO1xuICAgIGZhYnJpYy5JbWFnZS5mcm9tVVJMKCcvYXNzZXRzL2ltZy9mb3RvY29sZWN0YW5pYS1sb2dvLnBuZycsIGZ1bmN0aW9uKGltZyl7XG4gICAgICBpbWcuaGFzQm9yZGVycyA9IGZhbHNlO1xuICAgICAgaW1nLmhhc0NvbnRyb2xzID0gZmFsc2U7XG4gICAgICBpbWcuc2VsZWN0YWJsZSA9IGZhbHNlO1xuICAgICAgaW1nLnNjYWxlKDAuMTIpO1xuICAgICAgaW1nLmxlZnQgPSBjYW52YXNlc1sncDgnXS53aWR0aC8yO1xuICAgICAgaW1nLnRvcCA9IDUzMDtcbiAgICAgIGltZy5sb2NrTW92ZW1lbnRYID0gdHJ1ZTtcbiAgICAgIGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcbiAgICAgIGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuICAgICAgaW1nLnNldENvbnRyb2xzVmlzaWJpbGl0eSA9IGZhbHNlO1xuICAgICAgaW1nLmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgICAgaW1nLmlkID0gJ2xvY2snO1xuICAgICAgY2FudmFzZXNbJ3A4J10uaW5zZXJ0QXQoaW1nKTtcbiAgICB9KVxuICB9XG59XG4kKGRvY3VtZW50KS5rZXlkb3duKGZ1bmN0aW9uKGUpIHsgLy8gZGVsIG9yIGJhY2tzcGFjZSB0byBkZWxldGVcbiAgaWYoIGUud2hpY2ggPT0gOCB8fCBlLndoaWNoID09IDQ2KSB7XG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmIChjYW52YXNlc1tjYW52YXNdLmdldEFjdGl2ZU9iamVjdCgpKSB7XG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc10ucmVtb3ZlKGNhbnZhc2VzW2NhbnZhc10uZ2V0QWN0aXZlT2JqZWN0KCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSlcblxuXG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG5cdC8vIGFsbCBvdXIgc3RhdGVzXG5cdGlkOiBtYWtlSWQoKSxcblx0dGl0bGU6ICdVbnRpdGxlZCcsXG5cdHRpbWVMZWZ0OiA5MDAwMDAwLFxuXHRleHBpcmVkOiBmYWxzZSxcblx0YXV0aG9yczogJ0Fub255bW91cycsXG4gIGRhdGU6IERhdGUubm93KCksXG4gIGltYWdlc0Ftb3VudDogMCxcbiAgdGV4dEFtb3VudDogMCxcbiAgdGltZUVsYXBzZWQ6IDAsIC8vIFRPRE8gc2V0IHRoaXMgd2hlbiB0aW1lIGV4cGlyZXNcbiAgYWNoaWV2ZW1lbnRzQW1vdW50OiAwLFxuXHRwYWdlczoge1xuXHRcdHAxOiB7fSxcblx0XHRwMjoge30sXG5cdFx0cDM6IHt9LFxuXHRcdHA0OiB7fSxcblx0XHRwNToge30sXG5cdFx0cDY6IHt9LFxuXHRcdHA3OiB7fSxcblx0XHRwODoge31cblx0fVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihQdWJsaWNhdGlvbiwgaW5wdXQpIHtcblx0aWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkgeyAvLyBub3QgZXhwaXJlZFxuXHRcdHNob3dUaW1lKFB1YmxpY2F0aW9uKVxuXHR9IGVsc2UgeyAgLy8gZXhwaXJlZFxuXHRcdHNob3dFeHBpcmVkKClcblx0fVxuXG5cdGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG5cdFx0Y29uc29sZS5sb2coaW5wdXQpXG5cdFx0c3dpdGNoICh0cnVlKSB7XG5cdFx0XHRjYXNlIGlucHV0LnZpc2libGUgPT0gZmFsc2U6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcblx0XHRcdFx0XHRyZW1vdmVFbGVtZW50KGlucHV0LmlkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0Ynl0ZUNvdW50KGlucHV0LmRhdGEpID4gMTM5ODExNyA6IC8vIGZpbGUgdG9vIGJpZyAoMW1iKVxuXHRcdFx0XHQgXHRFcnJvci50b29CaWcoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IGltYWdlXG5cblx0XHRcdFx0XHR2YXIgcHVibGljYXRpb25VcGRhdGUgPSBmdW5jdGlvbihpbnB1dFBhZ2UpIHsgLy8gdXBkYXRlIGNhbnZhc1xuXHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXRQYWdlXSA9IGNhbnZhc2VzW2lucHV0UGFnZV0udG9KU09OKCkgLy8gc2V0dGltZW91dCBvdGhlcndpc2UgaXQgZG9lc24ndCBnZXQgdGhlIGVsZW1lbnRcblx0XHRcdFx0XHRcdH0sIDEpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zLCBwdWJsaWNhdGlvblVwZGF0ZShpbnB1dC5wYWdlKSk7IC8vIGRyb3AgZWxlbWVudFxuXHRcdFx0XHRcdFxuXG4gICAgICAgICAgUHVibGljYXRpb24uaW1hZ2VzQW1vdW50ICs9IDEgLy8gYWNoaWV2ZW1lbnQgZXZlcnkgeCBpbWdzXG4gICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCVhY2hpZXZlbWVudFNwYW4gPT0gMCkge1xuICAgICAgICAgICAgYWNoaWV2ZW1lbnQoMTAwICogUHVibGljYXRpb24uaW1hZ2VzQW1vdW50LCBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKyAnIGltYWdlcyBhZGRlZCEnKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoUHVibGljYXRpb24uaW1hZ2VzQW1vdW50ID09IDMpIHtcbiAgICAgICAgICAgICQoJyNkb25lJykuY3NzKCdkaXNwbGF5JywnaW5saW5lLWJsb2NrJylcbiAgICAgICAgICAgIGNyaXRpY1NheXMoJ1lvdSBjYW4gbm93IHNhdmUgeW91ciBwdWJsaWNhdGlvbiEnKVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBzdGFydCBkaXNydXB0aW9ucyBhZnRlciBmaXJzdCBpbWFnZVxuICAgICAgICAgIGlmICggIFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCA9PSAxICYmIFxuICAgICAgICAgICAgICAgIGdldFVybFBhcmFtZXRlcignZGlzcnVwdGlvbnMnKSAhPSAnZmFsc2UnICYmIFxuICAgICAgICAgICAgICAgIGRpc3J1cHRpb25zT24gPT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiB5ID09PSAndW5kZWZpbmVkJykgeyBcbiAgICAgICAgICAgIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHsgLy8gbGF1bmNoIGEgcmFuZG9tIGRpc3J1cHRpb25cbiAgICAgICAgICAgICAgZGlzcnVwdGlvbnMgPSBPYmplY3Qua2V5cyhEaXNydXB0aW9uKVxuICAgICAgICAgICAgICBEaXNydXB0aW9uW2Rpc3J1cHRpb25zWyBkaXNydXB0aW9ucy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXSgpXG4gICAgICAgICAgICAgIHNoYWtlKHBhZ2VzKVxuICAgICAgICAgICAgfSwgZGlzcnVwdGlvbkludGVydmFsKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGFkZHRpbWUoYm9udXNUaW1lKVxuXHRcdFx0XHRcdGNyaXRpY1NheXMoKVxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyB0ZXh0XG5cblx0XHRcdFx0XHR2YXIgcHVibGljYXRpb25VcGRhdGUgPSBmdW5jdGlvbihpbnB1dFBhZ2UpIHsgLy8gdXBkYXRlIGNhbnZhc1xuXHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXRQYWdlXSA9IGNhbnZhc2VzW2lucHV0UGFnZV0udG9KU09OKCkgLy8gc2V0dGltZW91dCBvdGhlcndpc2UgaXQgZG9lc24ndCBnZXQgdGhlIGVsZW1lbnRcblx0XHRcdFx0XHRcdH0sIDEpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zLCBwdWJsaWNhdGlvblVwZGF0ZShpbnB1dC5wYWdlKSk7IC8vIGRyb3AgZWxlbWVudFxuXG4gICAgICAgICAgUHVibGljYXRpb24udGV4dEFtb3VudCArPSBpbnB1dC5kYXRhLmxlbmd0aFxuICAgICAgICAgIGlmIChQdWJsaWNhdGlvbi50ZXh0QW1vdW50ID49IDUwMCkge1xuICAgICAgICAgICAgYWNoaWV2ZW1lbnQoNTAwLCAnTW9yZSB0aGFuIDUwMCBjaGFyYWN0ZXJzIGFkZGVkJylcbiAgICAgICAgICB9XG5cblx0XHRcdFx0XHRhZGR0aW1lKGJvbnVzVGltZSAqIDIpXG4gICAgICAgICAgY3JpdGljU2F5cygnVGhpcyBpcyBnb25uYSBiZSBhIGdvb29kIHJlYWQnKVxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKTogLy8gbmVpdGhlciBhbiBpbWFnZSBub3IgdGV4dFxuXHRcdFx0XHRcdEVycm9yLm5vdEFsbG93ZWQoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0Lm1vdmUgPT0gdHJ1ZSA6IC8vIG1vdmluZyBvciBzY2FsaW5nIGFuIGltYWdlXG5cdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXQucGFnZV0gPSBjYW52YXNlc1tpbnB1dC5wYWdlXS50b0pTT04oKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0Lmhhc093blByb3BlcnR5KCd0aXRsZScpIDogLy8gY2hhbmdpbmcgdGl0bGVcblx0XHRcdFx0XHRQdWJsaWNhdGlvbi50aXRsZSA9IGlucHV0LnRpdGxlO1xuXHRcdH1cblx0fSBlbHNlIGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IHRydWUpIHtcblx0XHQvLyB0b28gbGF0ZVxuXHRcdEVycm9yLnRvb0xhdGUoKTtcblx0fVxufVxuXG5cblxuXG5cbi8vIC0tLSBDT05UUk9MTEVSXG5cbnZhciB4O1xuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cdGluaXRDYW52YXNlcygpXG5cdG9uTW9kRWxlbWVudCgpXG5cdGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpIDwgMCkge1xuXHRcdC8vIGlmIG5vdCBhIHNhdmVkIHB1YmxpY2F0aW9uXG5cdFx0aWYgKCBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKSApIHsgLy8gZGlmZmljdWx0eVxuXHRcdFx0UHVibGljYXRpb24udGltZUxlZnQgPSB0aW1lU2V0ID0gZ2V0VXJsUGFyYW1ldGVyKCd0aW1lJylcblx0XHR9XG5cdFx0eCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0UHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAtIDEwO1xuXHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbik7XG5cdFx0fSwgMTApXG5cdFx0bW91c2VDb3VudGVyKClcblx0fSBlbHNlIHsgLy8gc2F2ZWQgcHVibGljYXRpb25cblx0XHRyZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbilcblx0fVxufSk7XG5cbmZ1bmN0aW9uIGFkZHRpbWUoYm9udXNUaW1lKSB7XG5cdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgKyBib251c1RpbWU7XG5cdGFuaW1hdGV0aW1lY291bnRlcihib251c1RpbWUpO1xufVxuXG4vLyBtb2RpZnkgZWxlbWVudCBsaXN0ZW5lclxuZnVuY3Rpb24gb25Nb2RFbGVtZW50KCkge1xuXHRmb3IgKHZhciBwYWdlSWQgaW4gY2FudmFzZXMpIHtcblx0XHRjYW52YXNlc1sgcGFnZUlkIF0ub24oJ29iamVjdDptb2RpZmllZCcsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0dmFyIHBhcmVudENhbnZhc0lkID0gZXZ0LnRhcmdldC5jYW52YXMubG93ZXJDYW52YXNFbC5pZFxuXHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyBtb3ZlOiB0cnVlLCBwYWdlOiBwYXJlbnRDYW52YXNJZH0pXG5cdFx0fSlcblx0fVxufVxuXG4vLyBnZXQgbW91c2UgcG9zaXRpb24gb24gY2FudmFzXG5mdW5jdGlvbiBnZXRNb3VzZVBvcyhjYW52YXMsIGUpIHtcbiAgdmFyIHBvaW50ZXIgPSBjYW52YXMuZ2V0UG9pbnRlcihldmVudCwgZSlcbiAgdmFyIHBvc1ggPSBwb2ludGVyLnhcbiAgdmFyIHBvc1kgPSBwb2ludGVyLnlcbiAgcmV0dXJuIHtcbiAgICB4OiBwb3NYLFxuICAgIHk6IHBvc1lcbiAgfVxufVxuXG5jb25zdCBwYWdlcyA9ICQoJy5wYWdlJylcbi8vIGRyb3AgZWxlbWVudFxucGFnZXMub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbnBhZ2VzLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xucGFnZXMub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0Y29uc29sZS5sb2coZSk7XG5cdHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdHZhciB5ID0gMDtcblx0Zm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0cmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHR2YXIgcGFnZUlkID0gJCh0aGlzKS5maW5kKCdjYW52YXMnKS5hdHRyKCdpZCcpO1xuXHRcdG1vdXNlUG9zID0gZ2V0TW91c2VQb3MoY2FudmFzZXNbcGFnZUlkXSwgZSlcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0XHRcdFx0ZGF0YTogZXZlbnQudGFyZ2V0LnJlc3VsdCxcblx0XHRcdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHBhZ2U6IHBhZ2VJZCxcblx0XHRcdFx0XHRtb3VzZVBvczogbW91c2VQb3Ncblx0XHRcdFx0fSk7XG5cdFx0XHR9LCB5ICogZHJvcERlbGF5KTtcblx0XHRcdHkgKz0gMTtcblx0XHR9O1xuXHRcdGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcblx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0U291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudCAoVE9ETzogVVBEQVRFIEZPUiBGQUJSSUMpXG4kKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNsb3NlJywgZnVuY3Rpb24oKSB7XG5cdHZhciBwYWdlSWQgPSAkKHRoaXMpXG5cdFx0LmNsb3Nlc3QoJy5wYWdlJylcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnRJZCA9ICQodGhpcylcblx0XHQucGFyZW50KClcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnREYXRhID0gJCh0aGlzKVxuXHRcdC5zaWJsaW5ncygpXG5cdFx0LmF0dHIoJ3NyYycpO1xuXHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0aWQ6IGVsZW1lbnRJZCxcblx0XHRkYXRhOiBlbGVtZW50RGF0YSxcblx0XHRwb3M6IFswLCAwLCAwLCAwLCAwXSxcblx0XHR2aXNpYmxlOiBmYWxzZSxcblx0XHRwYWdlOiBwYWdlSWRcblx0fSk7XG59KTtcblxuLy8gY2hhbmdpbmcgdGl0bGUgLy8gVE9ETyBVcGRhdGVcbiQoJyN0aXRsZScpLmNoYW5nZShmdW5jdGlvbigpIHtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdHRpdGxlOiAkKHRoaXMpLnZhbCgpXG5cdH0pO1xufSlcblxuXG5cblxuXG5cbi8vIC0tLSBWSUVXXG5cbnZhciBTb3VuZCA9IHtcblx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2luY29ycmVjdC5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH0sXG5cdGRpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9XG59O1xuXG4vLyBUT0RPOiBtZXJnZSB0aGVzZSB0d29cbmZ1bmN0aW9uIHNob3dUaW1lKFB1YmxpY2F0aW9uKSB7XG5cdHNlY29uZHMgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDEwMDA7XG5cdCQoJyNjb3VudGVyJykuc2hvdygpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLmlubmVySFRNTCA9XG5cdFx0c2Vjb25kcy50b0ZpeGVkKDIpICsgJyBzZWNvbmRzIGxlZnQhJztcbn1cbmZ1bmN0aW9uIG1vdXNlQ291bnRlcigpIHtcblx0JChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXHRcdGlmIChlLnBhZ2VYID49ICQoZG9jdW1lbnQpLndpZHRoKCkgLyAyKSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCArIDIwLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG4gIGlmIChQdWJsaWNhdGlvbi5leHBpcmVkICE9IHRydWUpIHtcbiAgICBQdWJsaWNhdGlvbi50aW1lRWxhcHNlZCA9IHRpbWVTZXQgLSBQdWJsaWNhdGlvbi50aW1lTGVmdFxuICAgIFB1YmxpY2F0aW9uLmV4cGlyZWQgPSB0cnVlXG4gICAgbG9ja0VsZW1lbnRzKGFsbEVsZW1lbnRzKCkpXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgJCgnLnN1Z2dlc3Rpb25zJykuaGlkZSgpXG4gICAgfSwgODAwKVxuICBcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID0gJ2V4cGlyZWQhJztcbiAgXHQkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKVxuICBcdGV4cGlyZWRUaW1lKClcbiAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgY2FudmFzZXNbY2FudmFzXS5zZWxlY3Rpb24gPSBmYWxzZVxuICAgIH1cbiAgXHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgXHRcdCQoJy53cmFwcGVyJykuYWRkQ2xhc3MoJ3NhdmVkX3ZpZXcnKTtcbiAgXHRcdHNhdmVkU3RhdGUoKVxuICBcdH0sIDUwMClcbiAgXHRjbGVhckludGVydmFsKHgpXG4gICAgaWYgKHR5cGVvZiB5ICE9PSAndW5kZWZpbmVkJykgeyAvLyBpZiBkaXNydXB0aW9uc1xuICAgICAgY2xlYXJJbnRlcnZhbCh5KVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkcm9wRWxlbWVudChwYWdlSWQsIGRhdGEsIG1vdXNlUG9zLCBjYWxsYmFjaykge1xuXHRjb25zb2xlLmxvZyhtb3VzZVBvcylcblx0dmFyIGVsZW1lbnQgPSB7IGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZCB9XG5cdHZhciBlbGVtZW50UG9zID0gY3JlYXRlRWxlbWVudChlbGVtZW50LCBtb3VzZVBvcywgY2FsbGJhY2spXG5cdFNvdW5kLmRpbmcoKVxufVxuXG5cblxuXG5cblxuXG4vLyBlcnJvcnNcblxudmFyIEVycm9yID0ge1xuXHRub3RBbGxvd2VkOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpXG5cdFx0YWxlcnRNZXNzYWdlKCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyBub3QgYWxsb3dlZCEnKVxuXHR9LFxuXHR0b29CaWc6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKCk7XG5cdFx0YWxlcnRNZXNzYWdlKCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyB0b28gYmlnIScpO1xuXHR9LFxuXHR0b29MYXRlOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpO1xuXHRcdGFsZXJ0TWVzc2FnZSgnVG9vIGxhdGUgYW1pZ28nKTtcblx0fVxufTtcblxuXG5cbi8vIFRPRE86IENPTlZFUlQgVE8gRkFCUklDXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50KGlkKSB7XG5cdCQoJyMnICsgaWQpLmhpZGUoKTtcblx0Y29uc29sZS5sb2coaWQpO1xufVxuXG4vLyAtLS0gU0FWRURcblxuZnVuY3Rpb24gcmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pIHtcbiAgLy8gVE9ETyB1cGRhdGUgdGl0bGUgYW5kIGF1dGhvcnNcblxuXHRmb3IgKHZhciBjYW52YXNJZCBpbiBjYW52YXNlcykge1xuXHRcdHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24ucGFnZXNbY2FudmFzSWRdKTtcblx0XHRjYW52YXNlc1tjYW52YXNJZF0ubG9hZEZyb21KU09OKCBqc29uLCBmdW5jdGlvbigpIHtcbiAgICAgIGxvY2tFbGVtZW50cyhhbGxFbGVtZW50cygpKVxuXHRcdFx0Y2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbC5iaW5kKGNhbnZhc2VzW2NhbnZhc0lkXSlcblx0XHR9KVxuXHR9XG5cbn1cblxuXG5cblxuLy8gLS0tIEJBQ0tFTkRcblxuLy8gc2F2ZSB0byBkYlxuZnVuY3Rpb24gc2F2ZXRvRGIocHVibGljYXRpb24pIHtcblx0Zm9yICh2YXIgcGFnZSBpbiBQdWJsaWNhdGlvbi5wYWdlcykge1xuXHRcdFB1YmxpY2F0aW9uLnBhZ2VzW3BhZ2VdID0gY2FudmFzZXNbcGFnZV0udG9KU09OKCkgLy8gdXBkYXRlIGFsbCBwYWdlc1xuXHR9XG5cdCQuYWpheCh7XG5cdFx0dXJsOiAnL2RiJyxcblx0XHR0eXBlOiAncG9zdCcsIC8vIHBlcmZvcm1pbmcgYSBQT1NUIHJlcXVlc3Rcblx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeShQdWJsaWNhdGlvbiksXG5cdFx0Y29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcblx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHB1YmxpY2F0aW9uKSB7XG5cdFx0XHRjb25zb2xlLmxvZygncHVibGljYXRpb24gc2VudCB0byBkYXRhYmFzZS4nKTtcblx0XHR9XG5cdH0pO1xuXHRjb25zb2xlLmxvZygnc2F2ZWQ/aWQ9JyArIFB1YmxpY2F0aW9uLmlkKVxufVxuXG5cblxuXG5cbi8vIC0tLSBJTlRFUkZBQ0UgRlhcblxuXG4vLyBtb3ZlIHRoZXNlIGZ1bmN0aW9ucyB0byBpbnRlcmZhY2UgcGFydCBvZiBqcz9cbmZ1bmN0aW9uIGFuaW1hdGVVcChvYmopIHtcbiAgb2JqLnNob3coKTtcbiAgb2JqLmNzcygnbWFyZ2luLXRvcCcsICcyMHB4Jyk7XG4gIG9iai5hbmltYXRlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICBtYXJnaW5Ub3A6IFwiMHB4XCIsXG4gICAgfSwgMzAwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG4gIH0pO1xufTtcblxuZnVuY3Rpb24gYW5pbWF0ZVVwT3V0KG9iaiwgdGltZSkge1xuICBvYmouc2hvdygpO1xuICBvYmouY3NzKCdtYXJnaW4tdG9wJywgJzIwcHgnKTtcbiAgb2JqLmFuaW1hdGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIG1hcmdpblRvcDogXCIwcHhcIixcbiAgICB9LCB0aW1lLzIsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICB9KTtcbiAgb2JqLmFuaW1hdGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIG1hcmdpblRvcDogXCIyMHB4XCIsXG4gICAgfSwgdGltZS8yLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cbiAgfSk7XG59O1xuXG5mdW5jdGlvbiBzaGFrZShvYmosIHRpbWUpIHtcbiAgaWYgKCF0aW1lKSAoXG4gICAgdGltZSA9IDUwMFxuICApXG4gIG9iai5hZGRDbGFzcyggJ3NoYWtlIHNoYWtlLWNvbnN0YW50JyApXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICBvYmoucmVtb3ZlQ2xhc3MoICdzaGFrZSBzaGFrZS1jb25zdGFudCcgKVxuICB9LCB0aW1lKTtcbn1cblxuXG5cblxuXG5cbi8vIC0tLSBESVNSVVBUSU9OU1xuXG5cbmZ1bmN0aW9uIGFsbEVsZW1lbnRzKHR5cGUpIHtcbiAgdmFyIG9ianMgPSBbXVxuICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgIGlmICh0eXBlKSB7XG4gICAgICBjYW52YXNPYmpzID0gY2FudmFzZXNbY2FudmFzXS5nZXRPYmplY3RzKHR5cGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbnZhc09ianMgPSBjYW52YXNlc1tjYW52YXNdLmdldE9iamVjdHMoKVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gY2FudmFzT2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKGNhbnZhc09ianNbaV0uaWQgIT0gJ2xvY2snKSB7IC8vIHVzZSB0aGlzIHRvIGxvY2tcbiAgICAgICAgb2Jqcy5wdXNoKCBjYW52YXNPYmpzW2ldIClcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9ianNcbn1cblxuLy8gbG9jayBlbGVtZW50c1xuZnVuY3Rpb24gbG9ja0VsZW1lbnRzKG9ianMpIHtcbiAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBvYmpzW2ldLnNlbGVjdGFibGUgPSBmYWxzZVxuICAgIG9ianNbaV0uaGFzQ29udHJvbHMgPSBmYWxzZVxuICAgIG9ianNbaV0uaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCdcbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJBbGxDYW52YXNlcygpIHtcbiAgZm9yIChjYW52YXNJZCBpbiBjYW52YXNlcykge1xuICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwoKVxuICB9XG59XG5cbmZ1bmN0aW9uIGZpbHRlckltZ3Mob2JqcywgZmlsdGVyKSB7XG4gIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgb2Jqc1tpXS5maWx0ZXJzLnB1c2goZmlsdGVyKVxuICAgIG9ianNbaV0uYXBwbHlGaWx0ZXJzKClcbiAgfVxuICByZW5kZXJBbGxDYW52YXNlcygpXG59XG5cbnZhciBEaXNydXB0aW9uID0ge1xuXHRjb21pYzogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2NvbWljKG9ianMpIHtcbiAgICAgIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIG9ianNbaV0uZm9udEZhbWlseSA9ICdcIkNvbWljIFNhbnMgTVNcIidcbiAgICAgIH1cbiAgICB9XG4gICAgX2NvbWljKCBhbGxFbGVtZW50cygndGV4dCcpIClcbiAgICBfY29taWMoIGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykgKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdDYW5cXCd0IHlvdSBzcGljZSB0aGUgdHlwb2dyYXBoeSBhIGJpdD8nLCAnR3V0ZW5iZXJnJylcblx0fSxcblx0cm90YXRlSW1nc1JhbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9yb3RhdGVJbWdzUmFuZChvYmpzKSB7XG4gICAgICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBvYmpzW2ldLm9yaWdpblggPSAnY2VudGVyJ1xuICAgICAgICBvYmpzW2ldLm9yaWdpblkgPSAnY2VudGVyJ1xuICAgICAgICBvYmpzW2ldLmFuaW1hdGUoeyBhbmdsZTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSB9LCB7XG4gICAgICAgICAgZHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgb25DaGFuZ2U6IG9ianNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKG9ianNbaV0uY2FudmFzKSxcbiAgICAgICAgICBlYXNpbmc6IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHsgcmV0dXJuIGMqdC9kICsgYiB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIF9yb3RhdGVJbWdzUmFuZChhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICBjcml0aWNTYXlzKCdJIGZpbmQgdGhpcyBsYXlvdXQgYSBiaXQgc3RhdGljLi4uJywgJ0d1dGVuYmVyZycpXG5cdH0sXG5cdGxvY2tSYW5kUGFnZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhjYW52YXNlcylcbiAgICByYW5kQ2FudmFzID0gY2FudmFzZXNba2V5c1sga2V5cy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXVxuXHRcdHJhbmRDYW52YXMuc2VsZWN0aW9uID0gZmFsc2U7XG5cdFx0Zm9yIChvYmplY3RJZCBpbiByYW5kQ2FudmFzLmdldE9iamVjdHMoKSApIHtcblx0XHRcdHZhciBvYmplY3QgPSByYW5kQ2FudmFzLml0ZW0ob2JqZWN0SWQpXG5cdFx0XHRvYmplY3Quc2VsZWN0YWJsZSA9IGZhbHNlXG5cdFx0XHRvYmplY3QuaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCdcblx0XHR9XG5cdFx0cmFuZENhbnZhcy5hZGQobmV3IGZhYnJpYy5MaW5lKFswLCAwLCByYW5kQ2FudmFzLndpZHRoLCByYW5kQ2FudmFzLmhlaWdodF0sIHtcblx0ICBcdHN0cm9rZTogJ3JlZCcsXG5cdCAgXHRzZWxlY3RhYmxlOiBmYWxzZSxcblx0ICBcdHN0cm9rZVdpZHRoOiAyLFxuICAgICAgaG92ZXJDdXJzb3I6J2RlZmF1bHQnLFxuICAgICAgaWQ6ICdsb2NrJ1xuXHRcdH0pKVxuXHRcdHJhbmRDYW52YXMucmVuZGVyQWxsKCk7XG5cdFx0Ly8gVE9ETzogcHJldmVudCBkcm9wXG4gICAgY3JpdGljU2F5cygnUGFnZSAnICsgcmFuZENhbnZhcy5pZCArICcgaXMgbm93IGxvY2tlZC4uLicsICdHdXRlbmJlcmcnKSAvLyBUT0RPXG5cdH0sXG4gIHNodWZmbGVQYWdlczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRvU2h1ZmZsZSA9IFtdXG4gICAgdmFyIGkgPSAwXG4gICAgZm9yIChjYW52YXNJZCBpbiBjYW52YXNlcykge1xuICAgICAgaWYgKGkgPiAwKSB7IC8vIHByZXZlbnQgc2h1ZmZsaW5nIGZpcnN0IHBhZ2VcbiAgICAgICAgdG9TaHVmZmxlLnB1c2goIGNhbnZhc2VzW2NhbnZhc0lkXS50b0pTT04oKSApXG4gICAgICB9XG4gICAgICBpICs9IDFcbiAgICB9XG4gICAgc2h1ZmZsZUFycmF5KHRvU2h1ZmZsZSlcbiAgICB2YXIgeSA9IDBcbiAgICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoeSA+IDApIHtcbiAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLmxvYWRGcm9tSlNPTih0b1NodWZmbGVbeSAtIDFdLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsLmJpbmQoY2FudmFzZXNbY2FudmFzSWRdKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgeSArPSAxXG4gICAgfVxuICAgIGNyaXRpY1NheXMoJ1RoZSByeXRobSBvZiB0aGlzIHB1YmxpY2F0aW9uIGlzIGEgYml0IHdlYWsuIERvblxcJ3QgeW91IHRoaW5rPycsICdHdXRlbmJlcmcnKVxuICB9LFxuXHRhZHM6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNhbnZhc2VzKVxuICAgIHJhbmRDYW52YXMgPSBjYW52YXNlc1trZXlzWyBrZXlzLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dXG5cdFx0cmFuZENhbnZhcy5hZGQobmV3IGZhYnJpYy5SZWN0KHtcblx0XHRcdHdpZHRoOiByYW5kQ2FudmFzLndpZHRoLFxuXHRcdFx0aGVpZ2h0OiAzMCxcblx0XHRcdGZpbGw6ICcjMEQyMTNFJyxcblx0XHRcdGxvY2tNb3ZlbWVudFg6IHRydWUsXG5cdFx0XHRsb2NrTW92ZW1lbnRZOiB0cnVlLFxuXHRcdFx0bG9ja1JvdGF0aW9uOiB0cnVlLFxuXHRcdFx0aGFzQ29udHJvbHM6IGZhbHNlLFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG5cdFx0XHRsZWZ0OiByYW5kQ2FudmFzLndpZHRoLzIsXG5cdFx0XHR0b3A6IDE1LFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBpZDogJ2xvY2snXG5cdFx0fSkpO1xuXHRcdGZhYnJpYy5JbWFnZS5mcm9tVVJMKCcvYXNzZXRzL2ltZy9raW5rby5wbmcnLCBmdW5jdGlvbihpbWcpe1xuXHRcdFx0XHRpbWcuaGFzQm9yZGVycyA9IGZhbHNlO1xuXHRcdFx0XHRpbWcuaGFzQ29udHJvbHMgPSBmYWxzZTtcbiAgICAgICAgaW1nLnNlbGVjdGFibGUgPSBmYWxzZTtcblx0XHRcdFx0aW1nLnNjYWxlKDAuMik7XG5cdFx0XHRcdGltZy5sZWZ0ID0gcmFuZENhbnZhcy53aWR0aC0xMDA7XG5cdFx0XHRcdGltZy50b3AgPSA1MDtcblx0XHRcdFx0aW1nLmxvY2tNb3ZlbWVudFggPSB0cnVlO1xuXHRcdFx0XHRpbWcubG9ja01vdmVtZW50WSA9IHRydWU7XG5cdFx0XHRcdGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuXHRcdFx0XHRpbWcuc2V0Q29udHJvbHNWaXNpYmlsaXR5ID0gZmFsc2U7XG4gICAgICAgIGltZy5pZCA9ICdsb2NrJ1xuXHRcdFx0XHRyYW5kQ2FudmFzLmluc2VydEF0KGltZywzKTtcblx0XHRcdFx0Ly8gVE9ETzogaXQgb25seSB3b3JrcyB3aXRoIG9uZSBpbWFnZSBmb3Igc29tZSByZWFzb24uIHJ1bm5pbmcgdGhlIGZ1bmN0aW9uIG11bHRpcGxlIHRpbWVzIGl0IGFkZHMgbW9yZSB0b3AgYmFycyBidXQganVzdCBtb3ZlcyBhbGwgdGhlIGltYWdlcyB0byB0aGUgc2FtZSBwbGFjZVxuXHRcdH0pO1xuXG4gICAgY3JpdGljU2F5cygnSSBmb3VuZCBhIHNwb25zb3IhJywgJ0d1dGVuYmVyZycpXG5cdH0sXG4gIGhhbGZUaW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDJcbiAgICBjcml0aWNTYXlzKCdUaGlzIGlzIHRha2luZyB0b28gbG9uZy4uLicsICdHdXRlbmJlcmcnKVxuICB9LFxuICBkb3VibGVUaW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAqIDJcbiAgICBjcml0aWNTYXlzKCdUYWtlIHlvdXIgdGltZS4uLicsICdHdXRlbmJlcmcnKVxuICB9LFxuICBncmV5c2NhbGVJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuR3JheXNjYWxlKCkgKVxuICAgIGNyaXRpY1NheXMoJ1NoYWxsIHdlIG1ha2UgaXQgbG9vayBjbGFzc2ljPycsICdHdXRlbmJlcmcnKVxuICB9LFxuICBpbnZlcnRJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuSW52ZXJ0KCkgKVxuICAgIGNyaXRpY1NheXMoJ1RoZSB2aXN1YWxzIG5lZWQgc29tZSBlZGd5IGNvbG9ycycsICdHdXRlbmJlcmcnKVxuICB9LFxuICBzZXBpYUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5TZXBpYSgpIClcbiAgICBjcml0aWNTYXlzKCdFdmVyIGhlYXJkIG9mIEluc3RhZ3JhbT8nLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgYmxhY2t3aGl0ZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5CbGFja1doaXRlKCkgKVxuICAgIGNyaXRpY1NheXMoJ1RoaXMgc2hvdWxkIGxvb2sgbGlrZSBhIHppbmUhJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIHBpeGVsYXRlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLlBpeGVsYXRlKHtibG9ja3NpemU6IDIwfSkgKVxuICAgIGNyaXRpY1NheXMoJ0lzblxcJ3QgdGhpcyBhIHZpZGVvZ2FtZSBhZnRlciBhbGw/JywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIG5vaXNlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLk5vaXNlKHtub2lzZTogMjAwfSkgKVxuICAgIGNyaXRpY1NheXMoJ01BS0UgU09NRSBOT09JU0UhIScsICdHdXRlbmJlcmcnKVxuICB9LFxuICBmb250U2l6ZUJpZ2dlcjogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2ZvbnRTaXplQmlnZ2VyKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCgnZm9udFNpemUnLCBlbGVtZW50c1tpXS5mb250U2l6ZSAqIHNjYWxlRm9udCk7XG4gICAgICB9XG4gICAgfVxuICAgIF9mb250U2l6ZUJpZ2dlcihhbGxFbGVtZW50cygndGV4dGJveCcpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdDYW5cXCd0IHJlYWQgYW55dGhpbmcgOignLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgZm9udFNpemVTbWFsbGVyOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfZm9udFNpemVCaWdnZXIoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KCdmb250U2l6ZScsIGVsZW1lbnRzW2ldLmZvbnRTaXplIC8gc2NhbGVGb250KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2ZvbnRTaXplU21hbGxlcihhbGxFbGVtZW50cygndGV4dGJveCcpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdJXFwnbSBub3QgYmxpbmQhJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGJpZ2dlckltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9iaWdnZXJJbWdzKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7XG4gICAgICAgICAgc2NhbGVZOiBzY2FsZUltZ3MsXG4gICAgICAgICAgc2NhbGVYOiBzY2FsZUltZ3NcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIF9iaWdnZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdCTE9XIFVQIScsICdHdXRlbmJlcmcnKVxuICB9LFxuICBsb2NrQWxsRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgIGxvY2tFbGVtZW50cyhhbGxFbGVtZW50cygpKVxuICAgIGNyaXRpY1NheXMoJ1RoaW5ncyBhcmUgcGVyZmVjdCBhcyB0aGV5IGFyZS4nLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgc2tld0FsbEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfc2tld0FsbEVsZW1lbnRzKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7XG4gICAgICAgICAgc2NhbGVZOiBzY2FsZUltZ3MsXG4gICAgICAgICAgc2NhbGVYOiBzY2FsZUltZ3MsXG4gICAgICAgICAgdHJhbnNmb3JtTWF0cml4OiBbMSwgLjUwLCAwLCAxLCAwLCAwXVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfc2tld0FsbEVsZW1lbnRzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdTdHJldGNoIHRob3NlIGltYWdlcywgY29tZSBvbiEnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgZmxpcEFsbEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfZmxpcEFsbEVsZW1lbnRzKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7XG4gICAgICAgICAgYW5nbGU6ICctMTgwJyxcbiAgICAgICAgICBmbGlwWTogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfZmxpcEFsbEVsZW1lbnRzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdTdHJldGNoIHRob3NlIGltYWdlcywgY29tZSBvbiEnLCAnR3V0ZW5iZXJnJylcbiAgfVxufTtcblxuXG4vLyAtLS0gSU5URVJGQUNFIEJVVFRPTlNcblxuJCgnLmJ1dHRvbi5zYXZlJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICQoJy5idXR0b24uc2F2ZScpLmhpZGUoKVxuICAkKCcuYnV0dG9uLnBkZiwgLmJ1dHRvbi5ib29rbGV0JykuY3NzKCdkaXNwbGF5JywnaW5saW5lLWJsb2NrJylcbn0pIl0sImZpbGUiOiJtYWluLmpzIn0=
