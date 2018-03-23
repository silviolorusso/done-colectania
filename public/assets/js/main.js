// --- DEFAULTS

var timeLeft = 99999999999999
var disruptionsOn = true
var dropDelay = 100
var disruptionInterval = 10000
var bonusTime = 5000
var textChunksLength = 1500
var fontSize = 15
var fontColor = '#000'
var scaleFont = 1.5
var scaleUpImgs = 0.7
var scaleDownImgs = 0.7
var achievementSpan = 3
var drawingModeTime = 10000
var infiniteTime = false
var defaultTitle = 'Untitled'
var defaultAuthors = 'Anonymous'
var canvasZoom = 1000





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




function createElement(element, mousePos) {
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
 				callback
 			})
 			canvases[element.page].add(img)
		})
	} else {
		var deBasedText = atob(element.data.substring(23));
    chunks = deBasedText.match(new RegExp('(.|[\r\n]){1,' + textChunksLength + '}', 'g'))
    var currPage = parseInt( element.page.substr(element.page.length - 1) )
    for (var i = 0; i < chunks.length; i++) {
      if (canvases['p' + (currPage + i)]) {
        canvases['p' + (currPage + i)].add(new fabric.Textbox(chunks[i], {
          fontFamily: 'Helvetica',
          left: 20,
          top: 20,
          fontSize: fontSize,
          fill: fontColor,
          width: 410,
          breakWords: true,
          originX: 'left',
          originY: 'top'
        }))
      }
    }
	}
}


// --- initialize canvases
var canvases = {}
let title
let authors
function initCanvases() {
  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center' // origin at the center
  // cutomized controls
  fabric.Object.prototype.borderColor = fabric.Object.prototype.cornerColor = '#ccc'
  fabric.Object.prototype.cornerSize = 8

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
      if (this.text == 'Insert Title') {
        this.text = ''
        this.hiddenTextarea.value = ''
      }
    }).on('changed', function(e) {
      Publication.title = this.text.replace(/</g, "&lt;").replace(/>/g, "&gt;") // prevent code injection
      this.text = this.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")
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
      id: 'lock',
      cache: false
  	}).on('editing:entered', function(e) {
      if (this.text == 'Insert Authors') {
        this.text = ''
        this.hiddenTextarea.value = ''
      }
    }).on('changed', function(e) {
      Publication.authors = this.text.replace(/</g, "&lt;").replace(/>/g, "&gt;") // prevent code injection
      this.text = this.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")
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
      selectable: false,
      hasControls: false,
      hoverCursor: 'default',
      originX: 'center',
      originY: 'top',
      id: 'lock'
    })
    canvases['p8'].add(date);
    fabric.Image.fromURL(logoFotocolectaniaBase64, function(img){
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
      canvases['p8'].add(img);
    })
  }
}
$(document).keydown(function(e) { // del or backspace to delete
  if( e.which == 8 || e.which == 46) {
    for (canvas in canvases) {
      if (canvases[canvas].getActiveObject()) {
        canvases[canvas].remove(canvases[canvas].getActiveObject());
        controller(Publication, { remove: true })
      }
    }
  }
})



// --- M-V-C

var Publication = {
	// all our states
	id: makeId(),
	title: defaultTitle,
	timeLeft: timeLeft,
	expired: false,
	authors: defaultAuthors,
  date: Date.now(),
  imagesAmount: 0,
  textAmount: 0,
  timeElapsed: 0,
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
		switch (true) {
			case input.remove == true: // deleting an element
          addTime(-bonusTime)
          criticSays('Think twice next time...')
					break
			case input.data &&
				byteCount(input.data) > 1398117 : // file too big (1mb)
				 	Error.tooBig()
          addTime(-bonusTime)
          criticSays('This is not a server farm.')
					break
			case input.data &&
				input.data.includes('data:image') &&
				input.visible == true: // new image

          if (!input.data.includes('data:image/gif')) { // not a gif

  					dropElement(input.page, input.data, input.mousePos); // drop element


            Publication.imagesAmount += 1 // achievement every x imgs
            if (Publication.imagesAmount%achievementSpan == 0) {
              achievement(100 * Publication.imagesAmount, Publication.imagesAmount + ' images added!')
              Publication.achievementsAmount += 1
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
                sfx.disruption()
              }, disruptionInterval)
            }

            addTime(bonusTime)
  					criticSays()

          } else { // a gif
            Error.noGifs()
            addTime(-bonusTime)
          }

					break
			case input.data &&
				input.data.includes('data:text/plain') &&
				input.visible == true: // new text

          var deBasedInput = atob(input.data.substring(23));
          if (deBasedInput.includes('<script>')) { // code injection

            Error.codeInjection()
            addTime(-bonusTime)
            criticSays('You deserve to be punished.')

          } else {

  					dropElement(input.page, input.data, input.mousePos) // drop element

            Publication.textAmount += input.data.length
            if (Publication.textAmount >= 500) {
              achievement(500, 'More than 500 characters added')
              Publication.achievementsAmount += 1
            }

  					addTime(bonusTime * 2)
            criticSays('This is gonna be a gooooood read')

          }
					
          break
			case input.data &&
				!input.data.includes('data:image') &&
				!input.data.includes('data:text/plain'): // neither an image nor text
					Error.notAllowed()
          addTime(-bonusTime)
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
		} else {
      infiniteTime = true
    }
		x = setInterval(function() {
			Publication.timeLeft = Publication.timeLeft - 10;
      if (infiniteTime == false) {
        Publication.timeElapsed = parseInt( (timeSet - Publication.timeLeft) / 1000 )
      } else {
        Publication.timeElapsed = 0
      }
			controller(Publication);
		}, 10)
		mouseCounter()
	} else { // saved publication
		renderPublication(Publication)
	}
});

function addTime(bonusTime) {
	Publication.timeLeft = Publication.timeLeft + bonusTime;
	animatetimecounter(bonusTime/1000);
  if (bonusTime >= 0) {
    sfx.addTimePlus()
  } else {
    sfx.addTimeMinus()
  }
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
  $(this).addClass('droppable');
});
pages.on('dragleave', function(e) {
	e.preventDefault();
  $('.droppable').removeClass('droppable');
});
pages.on('drop', function(e) {
	e.preventDefault();
  $('.droppable').removeClass('droppable');
	var files = e.originalEvent.dataTransfer.files;
	var y = 0;
	for (var i = files.length - 1; i >= 0; i--) {
		reader = new FileReader();
		var pageId = $(this).find('canvas').attr('id');
		mousePos = getMousePos(canvases[pageId], e)
		reader.onload = function(event) {
			// console.log(event.target);
			setTimeout(function() {
				controller(Publication, {
					data: event.target.result,
					visible: true,
					page: pageId,
					mousePos: mousePos
				});
			}, y * dropDelay);
			y += 1;
		}
		reader.readAsDataURL(files[i])
	}
	return false;
});
// prevent drop on body
$('body').on('dragover', function(e) {
	e.preventDefault()
})
$('body').on('dragleave', function(e) {
	e.preventDefault()
})
$('body').on('drop', function(e) {
	e.preventDefault()
  sfx.error()
})







// --- VIEW


// TODO: merge these two
function pad(n, len) {
  return (new Array(len + 1).join('0') + n).slice(-len);
}


function showTime(Publication) {
	seconds = Publication.timeLeft / 1000;
	$('#counter').show();
	var minutes = Math.floor(seconds / 60);
	var seconds = seconds % 60;
	var ms;
	if (!!document.getElementById('counter')) {
		setTimeout(function () {
			var d = new Date();
			ms = d.getMilliseconds();
			document.getElementById('counter').innerHTML = pad(minutes, 2) + ':' + pad(seconds.toFixed(0), 2) + ':' + pad(ms.toString().substr(0,2), 2) + ' left!';
		}, 1)
	} else {
		// console.log('error');
	}
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
    Publication.expired = true
    lockElements(allElements())
    if (title.text == 'Insert Title') {
      title.text = defaultTitle
    }
    if (authors.text == 'Insert Authors') {
      authors.text = defaultAuthors
    }
    renderAllCanvases()
    showPublicationData(Publication)
    if ( document.getElementById('counter') ) {
  	 document.getElementById('counter').style.display = 'none'
    }
  	$('body').addClass('expired')
  	expiredTime()
    sfx.perished()
    for (canvas in canvases) {
      canvases[canvas].selection = false
      canvases[canvas].discardActiveObject().renderAll()
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

function dropElement(pageId, data, mousePos) {
	var element = { data: data, page: pageId }
	var elementPos = createElement(element, mousePos)
}








// errors

var Error = {
	notAllowed: function() {
		alertMessage('The file you dropped is not allowed!')
	},
	tooBig: function() {
		alertMessage('The file you dropped is too big!')
	},
  noGifs: function() {
    alertMessage('Gifs are not allowed. (This sucks, I know...)')
  },
	tooLate: function() {
		alertMessage('Too late amigo')
	},
  codeInjection: function() {
    alertMessage('Hey hacker, you\'re trying to inject code. Please don\'t.')
  }
}





// --- SAVED

function showPublicationData(Publication) {
  $('.title').text( Publication.title )
  $('.authors span:last-child').text( Publication.authors )
  $('.date span:last-child').text( timeConverter( Number(Publication.date)) ) 
  $('.imagesamount span:last-child').text( Publication.imagesAmount ) 
  $('.textamount span:last-child').text( Publication.textAmount + ' chars' ) 
  $('.elapsedtime span:last-child').text( Publication.timeElapsed + ' s' )
  $('.achievementsamount span:last-child').text( Publication.achievementsAmount )  
}

function renderPublication(Publication) {
  function renderPage(img, canvasId) {
    fabric.Image.fromURL(img, function(img){
        img.hasBorders = false;
        img.hasControls = false;
        img.selectable = false;
        img.left = canvases[canvasId].width / 2;
        img.top = canvases[canvasId].height / 2;
        img.scaleX = canvases[canvasId].width / img.width;
        img.scaleY = canvases[canvasId].height / img.height;
        img.lockMovementX = true;
        img.lockMovementY = true;
        img.lockRotation = true;
        img.setControlsVisibility = false;
        img.id = 'lock'
        canvases[canvasId].add(img);
        canvases[canvasId].renderAll.bind(canvases[canvasId])
    })
  }
  for (var canvasId in canvases) {
    renderPage(Publication.pages[canvasId], canvasId)
  }
  showPublicationData(Publication)
}





// --- BACKEND

// save to db
var saving = false
function savetoDb(publication) {
  if (saving == false) {
  	for (var page in Publication.pages) {
      var originWidth = canvases[page].getWidth();

      function zoom (width) {
        var scale = width / canvases[page].getWidth();
        height = scale * canvases[page].getHeight();

        canvases[page].setDimensions({
            "width": width,
            "height": height
        });

        canvases[page].calcOffset();
        var objects = canvases[page].getObjects();
        for (var i in objects) {
            var scaleX = objects[i].scaleX;
            var scaleY = objects[i].scaleY;
            var left = objects[i].left;
            var top = objects[i].top;

            objects[i].scaleX = scaleX * scale;
            objects[i].scaleY = scaleY * scale;
            objects[i].left = left * scale;
            objects[i].top = top * scale;

            objects[i].setCoords();
        }
        canvases[page].renderAll();
      }

      zoom(canvasZoom)

      Publication.pages[page] = canvases[page].toDataURL('image/png', 1) // update all pages

      zoom (originWidth);
  	}
    $('.button.save .stylized').html('Saving <span>.</span><span>.</span><span>.</span>').addClass('saving').removeClass('stylized')
    $('.button.save').css('backgroundColor', '#eee')
  	$.ajax({
  		url: '/db',
  		type: 'post', // performing a POST request
  		data: JSON.stringify(Publication),
  		contentType: 'application/json',
  		dataType: 'json',
  		success: function() {
        sfx.ready()
        $('.button.save').hide()
        $('.button.pdf, .button.booklet').css('display','inline-block')

        $('.title').empty()
        a = document.createElement('a')
        $(a).text(Publication.title).attr("href", '/saved?id=' + Publication.id)
        $(a).appendTo($('.title'))

  			console.log('publication sent to database.');
  		}
  	});
  	console.log('saved?id=' + Publication.id)
    saving = true
  }
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
    criticSays('Can\'t you spice the typography a bit?')
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
    criticSays('I find this layout a bit static...')
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
    criticSays('Page ' + randCanvas.id[1] + ' is now locked...')
	},
  shufflePages: function() {
    var toShuffle = []
    var i = 0
    for (canvasId in canvases) {
      if (i > 0 && i <= 6) { // prevent shuffling first page
        toShuffle.push( canvases[canvasId].toJSON() )
      }
      i += 1
    }
    shuffleArray(toShuffle)
    var y = 0
    for (canvasId in canvases) {
      if (y > 0 && y <= 6) {
        canvases[canvasId].loadFromJSON(toShuffle[y - 1], function() {
          canvases[canvasId].renderAll.bind(canvases[canvasId])
        })
      }
      y += 1
    }
    criticSays('The rythm of this publication is a bit weak. Don\'t you think?')
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
		fabric.Image.fromURL(kinkoBase64, function(img){
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
				randCanvas.add(img);
		})
    criticSays('I found a sponsor!')
	},
  halfTime: function () {
    Publication.timeLeft = Publication.timeLeft / 2
    criticSays('This is taking too long...')
  },
  doubleTime: function () {
    Publication.timeLeft = Publication.timeLeft * 2
    criticSays('Take your time...')
  },
  greyscaleImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Grayscale() )
    criticSays('Shall we make it look classic?')
  },
  invertImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Invert() )
    criticSays('The visuals need some edgy colors')
  },
  sepiaImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Sepia() )
    criticSays('Ever heard of Instagram?')
  },
  blackwhiteImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.BlackWhite() )
    criticSays('This should look like a zine!')
  },
  pixelateImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Pixelate({blocksize: 20}) )
    criticSays('Isn\'t this a videogame after all?')
  },
  noiseImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Noise({noise: 200}) )
    criticSays('MAKE SOME NOOISE!!')
  },
  fontSizeBigger: function() {
    function _fontSizeBigger(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set('fontSize', elements[i].fontSize * scaleFont);
      }
    }
    _fontSizeBigger(allElements('textbox'))
    renderAllCanvases()
    criticSays('Can\'t read anything :(')
  },
  fontSizeSmaller: function() {
    function _fontSizeSmaller(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set('fontSize', elements[i].fontSize / scaleFont);
      }
    }
    _fontSizeSmaller(allElements('textbox'))
    renderAllCanvases()
    criticSays('I\'m not blind!')
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
    criticSays('BLOW UP!')
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
    criticSays('BLOW UP!')
  },
  lockAllElements: function() {
    lockElements(allElements())
    criticSays('Things are perfect as they are.')
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
    criticSays('Stretch those images, come on!')
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
    criticSays('Flip those images, come on!')
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
    criticSays('A bit to the right... No no, a bit to the left...')
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
    criticSays('Respect the grid!')
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
    criticSays('I suggest a catchier title')
  },
  betterAuthors: function() {
    var the_authors = [
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
    var randAuthor = the_authors[Math.floor(Math.random() * the_authors.length)]
    authors.text = randAuthor
    renderAllCanvases()
    Publication.authors = randAuthor
    criticSays('We need a well-known testimonial.')
  },
  drawingMode: function() {
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
    criticSays('Do you like to draw?')
  },
  blackboardMode: function() {
    for (canvas in canvases) {
      canvases[canvas].backgroundColor = '#000000'
      canvases[canvas].renderAll()
    }
    for (var i = 0; i < allElements('text').length; i++) {
      allElements('text')[i].set({fill: '#fff'});
    }
    function whiteText(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set({fill: '#fff'});
      }
    }
    whiteText(allElements('textbox'))
    whiteText([title,authors])
    fontColor = '#fff'
    renderAllCanvases()
    criticSays('Think of the page as a blackboard')
  },
  classifiedMode: function() {
    fabric.Image.fromURL(classifiedBase64, function(img){
      img.hasBorders = false;
      img.hasControls = false;
      img.selectable = false;
      img.scale(0.8);
      img.left = canvases['p1'].width / 2;
      img.top = 300;
      img.lockMovementX = true;
      img.lockMovementY = true;
      img.lockRotation = true;
      img.setControlsVisibility = false;
      img.id = 'lock';
      for (canvas in canvases) {
        canvases[canvas].add(img);
      }
    })
    renderAllCanvases()
    criticSays('The public must not know.')
  }
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBERUZBVUxUU1xuXG52YXIgdGltZUxlZnQgPSA5OTk5OTk5OTk5OTk5OVxudmFyIGRpc3J1cHRpb25zT24gPSB0cnVlXG52YXIgZHJvcERlbGF5ID0gMTAwXG52YXIgZGlzcnVwdGlvbkludGVydmFsID0gMTAwMDBcbnZhciBib251c1RpbWUgPSA1MDAwXG52YXIgdGV4dENodW5rc0xlbmd0aCA9IDE1MDBcbnZhciBmb250U2l6ZSA9IDE1XG52YXIgZm9udENvbG9yID0gJyMwMDAnXG52YXIgc2NhbGVGb250ID0gMS41XG52YXIgc2NhbGVVcEltZ3MgPSAwLjdcbnZhciBzY2FsZURvd25JbWdzID0gMC43XG52YXIgYWNoaWV2ZW1lbnRTcGFuID0gM1xudmFyIGRyYXdpbmdNb2RlVGltZSA9IDEwMDAwXG52YXIgaW5maW5pdGVUaW1lID0gZmFsc2VcbnZhciBkZWZhdWx0VGl0bGUgPSAnVW50aXRsZWQnXG52YXIgZGVmYXVsdEF1dGhvcnMgPSAnQW5vbnltb3VzJ1xudmFyIGNhbnZhc1pvb20gPSAxMDAwXG5cblxuXG5cblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcblx0dmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcblx0dmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG5cdHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gYnl0ZUNvdW50KHMpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJKHMpLnNwbGl0KC8lLi58Li8pLmxlbmd0aCAtIDE7XG59XG5cbnZhciBnZXRVcmxQYXJhbWV0ZXIgPSBmdW5jdGlvbiBnZXRVcmxQYXJhbWV0ZXIoc1BhcmFtKSB7XG4gIHZhciBzUGFnZVVSTCA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSksXG4gICAgc1VSTFZhcmlhYmxlcyA9IHNQYWdlVVJMLnNwbGl0KCcmJyksXG4gICAgc1BhcmFtZXRlck5hbWUsXG4gICAgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgc1VSTFZhcmlhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgIHNQYXJhbWV0ZXJOYW1lID0gc1VSTFZhcmlhYmxlc1tpXS5zcGxpdCgnPScpO1xuXG4gICAgaWYgKHNQYXJhbWV0ZXJOYW1lWzBdID09PSBzUGFyYW0pIHtcbiAgICAgICAgcmV0dXJuIHNQYXJhbWV0ZXJOYW1lWzFdID09PSB1bmRlZmluZWQgPyB0cnVlIDogc1BhcmFtZXRlck5hbWVbMV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNodWZmbGVBcnJheShhcnJheSkge1xuICBmb3IgKHZhciBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgIHZhciBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgdmFyIHRlbXAgPSBhcnJheVtpXTtcbiAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgIGFycmF5W2pdID0gdGVtcDtcbiAgfVxufVxuXG5mdW5jdGlvbiB0aW1lQ29udmVydGVyKFVOSVhfdGltZXN0YW1wKXtcbiAgdmFyIGEgPSBuZXcgRGF0ZShVTklYX3RpbWVzdGFtcCk7XG4gIHZhciBtb250aHMgPSBbJ0phbicsJ0ZlYicsJ01hcicsJ0FwcicsJ01heScsJ0p1bicsJ0p1bCcsJ0F1ZycsJ1NlcCcsJ09jdCcsJ05vdicsJ0RlYyddO1xuICB2YXIgeWVhciA9IGEuZ2V0RnVsbFllYXIoKTtcbiAgdmFyIG1vbnRoID0gbW9udGhzW2EuZ2V0TW9udGgoKV07XG4gIHZhciBkYXRlID0gYS5nZXREYXRlKCk7XG4gIHZhciB0aW1lID0gZGF0ZSArICcgJyArIG1vbnRoICsgJyAnICsgeWVhcjtcbiAgcmV0dXJuIHRpbWU7XG59XG5cblxuXG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MpIHtcbiAgZnVuY3Rpb24gY2h1bmtTdHJpbmcoc3RyLCBsZW5ndGgpIHtcbiAgICByZXR1cm4gc3RyLm1hdGNoKG5ldyBSZWdFeHAoJ3suMSwnICsgbGVuZ3RoICsgJ30nLCAnZycpKTtcbiAgfVxuXHR2YXIgdGhlTW91c2VQb3MgPSBtb3VzZVBvc1xuXHRpZiAoZWxlbWVudC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykpIHtcblx0XHRmYWJyaWMuSW1hZ2UuZnJvbVVSTChlbGVtZW50LmRhdGEsIGZ1bmN0aW9uKG15SW1nLCBjYWxsYmFjaykge1xuIFx0XHRcdHZhciBpbWcgPSBteUltZy5zZXQoeyBsZWZ0OiAwLCB0b3A6IDAsIHdpZHRoOiBteUltZy53aWR0aCwgaGVpZ2h0OiBteUltZy5oZWlnaHR9KTtcbiBcdFx0XHRpZiAoIGltZy53aWR0aCA+IGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggKSB7XG4gXHRcdFx0XHRpbWcuc2NhbGVUb1dpZHRoKGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggLyAxMDAgKiA1MCApOyAvLyA1MCUgb2YgdGhlIGNhbnZhc1xuIFx0XHRcdH1cbiBcdFx0XHRpbWcubGVmdCA9IHRoZU1vdXNlUG9zLnhcbiBcdFx0XHRpbWcudG9wID0gdGhlTW91c2VQb3MueVxuIFx0XHRcdGltZy5vbignYWRkZWQnLCBmdW5jdGlvbigpIHtcbiBcdFx0XHRcdGNhbGxiYWNrXG4gXHRcdFx0fSlcbiBcdFx0XHRjYW52YXNlc1tlbGVtZW50LnBhZ2VdLmFkZChpbWcpXG5cdFx0fSlcblx0fSBlbHNlIHtcblx0XHR2YXIgZGVCYXNlZFRleHQgPSBhdG9iKGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpKTtcbiAgICBjaHVua3MgPSBkZUJhc2VkVGV4dC5tYXRjaChuZXcgUmVnRXhwKCcoLnxbXFxyXFxuXSl7MSwnICsgdGV4dENodW5rc0xlbmd0aCArICd9JywgJ2cnKSlcbiAgICB2YXIgY3VyclBhZ2UgPSBwYXJzZUludCggZWxlbWVudC5wYWdlLnN1YnN0cihlbGVtZW50LnBhZ2UubGVuZ3RoIC0gMSkgKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY2FudmFzZXNbJ3AnICsgKGN1cnJQYWdlICsgaSldKSB7XG4gICAgICAgIGNhbnZhc2VzWydwJyArIChjdXJyUGFnZSArIGkpXS5hZGQobmV3IGZhYnJpYy5UZXh0Ym94KGNodW5rc1tpXSwge1xuICAgICAgICAgIGZvbnRGYW1pbHk6ICdIZWx2ZXRpY2EnLFxuICAgICAgICAgIGxlZnQ6IDIwLFxuICAgICAgICAgIHRvcDogMjAsXG4gICAgICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgICAgIGZpbGw6IGZvbnRDb2xvcixcbiAgICAgICAgICB3aWR0aDogNDEwLFxuICAgICAgICAgIGJyZWFrV29yZHM6IHRydWUsXG4gICAgICAgICAgb3JpZ2luWDogJ2xlZnQnLFxuICAgICAgICAgIG9yaWdpblk6ICd0b3AnXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH1cblx0fVxufVxuXG5cbi8vIC0tLSBpbml0aWFsaXplIGNhbnZhc2VzXG52YXIgY2FudmFzZXMgPSB7fVxubGV0IHRpdGxlXG5sZXQgYXV0aG9yc1xuZnVuY3Rpb24gaW5pdENhbnZhc2VzKCkge1xuICBmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5vcmlnaW5YID0gZmFicmljLk9iamVjdC5wcm90b3R5cGUub3JpZ2luWSA9ICdjZW50ZXInIC8vIG9yaWdpbiBhdCB0aGUgY2VudGVyXG4gIC8vIGN1dG9taXplZCBjb250cm9sc1xuICBmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5ib3JkZXJDb2xvciA9IGZhYnJpYy5PYmplY3QucHJvdG90eXBlLmNvcm5lckNvbG9yID0gJyNjY2MnXG4gIGZhYnJpYy5PYmplY3QucHJvdG90eXBlLmNvcm5lclNpemUgPSA4XG5cblx0JCgnY2FudmFzJykuZWFjaChmdW5jdGlvbihpKSB7XG5cdFx0Y2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXModGhpcyk7XG5cdCAgY2FudmFzLnNldFdpZHRoKCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykud2lkdGgoKSApO1xuXHRcdGNhbnZhcy5zZXRIZWlnaHQoICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5oZWlnaHQoKSApO1xuICAgIGNhbnZhcy5iYWNrZ3JvdW5kQ29sb3IgPSAnd2hpdGUnO1xuICAgIGNhbnZhcy5pZCA9ICdwJyArIChpKzEpO1xuXG5cdFx0Y2FudmFzZXNbJ3AnICsgKGkgKyAxKV0gPSBjYW52YXM7XG5cbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA+PSAwKSB7IC8vIGlmICBzYXZlZFxuICAgICAgY2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlXG4gICAgfVxuXG5cdH0pO1xuICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA8IDApIHsgLy8gaWYgbm90IHNhdmVkXG4gIFx0dGl0bGUgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBUaXRsZScsIHtcbiAgXHQgIHRvcDogMTIwLFxuICBcdCAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybywgc2VyaWYnLFxuICBcdCAgZmlsbDogJyM3NzcnLFxuICBcdCAgbGluZUhlaWdodDogMS4xLFxuICBcdCAgZm9udFNpemU6IDMwLFxuICBcdCAgZm9udFdlaWdodDogJ2JvbGQnLFxuICBcdCAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgXHQgIHdpZHRoOiBjYW52YXNlc1sncDEnXS53aWR0aCxcbiAgXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxuICBcdCAgaG92ZXJDdXJzb3I6ICdkZWZhdWx0JyxcbiAgXHQgIG9yaWdpblg6ICdsZWZ0JyxcbiAgXHQgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJyxcbiAgICAgIGNhY2hlOiBmYWxzZVxuICBcdH0pLm9uKCdlZGl0aW5nOmVudGVyZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGhpcy50ZXh0ID09ICdJbnNlcnQgVGl0bGUnKSB7XG4gICAgICAgIHRoaXMudGV4dCA9ICcnXG4gICAgICAgIHRoaXMuaGlkZGVuVGV4dGFyZWEudmFsdWUgPSAnJ1xuICAgICAgfVxuICAgIH0pLm9uKCdjaGFuZ2VkJywgZnVuY3Rpb24oZSkge1xuICAgICAgUHVibGljYXRpb24udGl0bGUgPSB0aGlzLnRleHQucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIikgLy8gcHJldmVudCBjb2RlIGluamVjdGlvblxuICAgICAgdGhpcy50ZXh0ID0gdGhpcy50ZXh0LnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpXG4gICAgICB0aGlzLnNlbGVjdGFibGUgPSBmYWxzZVxuICAgICAgdGhpcy5oYXNDb250cm9scyA9IGZhbHNlXG4gICAgfSlcbiAgXHRjYW52YXNlc1sncDEnXS5hZGQodGl0bGUpXG4gIFx0dmFyIGxpbmVMZW5naHQgPSAyNTBcbiAgXHRjYW52YXNlc1sncDEnXS5hZGQobmV3IGZhYnJpYy5MaW5lKFswLCAwLCBsaW5lTGVuZ2h0LCAwXSwge1xuICBcdFx0bGVmdDogKCBjYW52YXNlc1sncDEnXS53aWR0aCAtIGxpbmVMZW5naHQpIC8gMixcbiAgXHQgIHRvcDogMTYwLFxuICBcdCAgc3Ryb2tlOiAnIzIyMicsXG4gIFx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgXHQgXHRvcmlnaW5YOiAnbGVmdCcsXG4gIFx0ICBvcmlnaW5ZOiAndG9wJ1xuICBcdH0pKTtcbiAgXHRhdXRob3JzID0gbmV3IGZhYnJpYy5UZXh0Ym94KCdJbnNlcnQgQXV0aG9ycycsIHtcbiAgXHQgIHRvcDogMTgwLFxuICBcdCAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybywgc2VyaWYnLFxuICBcdCAgZmlsbDogJyM3NzcnLFxuICBcdCAgbGluZUhlaWdodDogMS4xLFxuICBcdCAgZm9udFNpemU6IDIwLFxuICBcdCAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgXHQgIHdpZHRoOiBjYW52YXNlc1sncDEnXS53aWR0aCxcbiAgXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxuICBcdCAgaG92ZXJDdXJzb3I6ICdkZWZhdWx0JyxcbiAgXHQgIG9yaWdpblg6ICdsZWZ0JyxcbiAgXHQgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJyxcbiAgICAgIGNhY2hlOiBmYWxzZVxuICBcdH0pLm9uKCdlZGl0aW5nOmVudGVyZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGhpcy50ZXh0ID09ICdJbnNlcnQgQXV0aG9ycycpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJydcbiAgICAgICAgdGhpcy5oaWRkZW5UZXh0YXJlYS52YWx1ZSA9ICcnXG4gICAgICB9XG4gICAgfSkub24oJ2NoYW5nZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBQdWJsaWNhdGlvbi5hdXRob3JzID0gdGhpcy50ZXh0LnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpIC8vIHByZXZlbnQgY29kZSBpbmplY3Rpb25cbiAgICAgIHRoaXMudGV4dCA9IHRoaXMudGV4dC5yZXBsYWNlKC88L2csIFwiJmx0O1wiKS5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKVxuICAgICAgdGhpcy5zZWxlY3RhYmxlID0gZmFsc2VcbiAgICAgIHRoaXMuaGFzQ29udHJvbHMgPSBmYWxzZVxuICAgIH0pXG4gIFx0Y2FudmFzZXNbJ3AxJ10uYWRkKGF1dGhvcnMpXG4gICAgdmFyIGRhdGUgPSBuZXcgZmFicmljLlRleHQoIHRpbWVDb252ZXJ0ZXIoUHVibGljYXRpb24uZGF0ZSksIHtcbiAgICAgIHRvcDogNjAwLFxuICAgICAgbGVmdDogY2FudmFzZXNbJ3A4J10ud2lkdGgvMixcbiAgICAgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8sIHNlcmlmJyxcbiAgICAgIGZpbGw6ICcjNzc3JyxcbiAgICAgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgICAgIGZvbnRTaXplOiAxNCxcbiAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgICAgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gICAgICBvcmlnaW5YOiAnY2VudGVyJyxcbiAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJ1xuICAgIH0pXG4gICAgY2FudmFzZXNbJ3A4J10uYWRkKGRhdGUpO1xuICAgIGZhYnJpYy5JbWFnZS5mcm9tVVJMKGxvZ29Gb3RvY29sZWN0YW5pYUJhc2U2NCwgZnVuY3Rpb24oaW1nKXtcbiAgICAgIGltZy5oYXNCb3JkZXJzID0gZmFsc2U7XG4gICAgICBpbWcuaGFzQ29udHJvbHMgPSBmYWxzZTtcbiAgICAgIGltZy5zZWxlY3RhYmxlID0gZmFsc2U7XG4gICAgICBpbWcuc2NhbGUoMC4xMik7XG4gICAgICBpbWcubGVmdCA9IGNhbnZhc2VzWydwOCddLndpZHRoLzI7XG4gICAgICBpbWcudG9wID0gNTMwO1xuICAgICAgaW1nLmxvY2tNb3ZlbWVudFggPSB0cnVlO1xuICAgICAgaW1nLmxvY2tNb3ZlbWVudFkgPSB0cnVlO1xuICAgICAgaW1nLmxvY2tSb3RhdGlvbiA9IHRydWU7XG4gICAgICBpbWcuc2V0Q29udHJvbHNWaXNpYmlsaXR5ID0gZmFsc2U7XG4gICAgICBpbWcuaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICBpbWcuaWQgPSAnbG9jayc7XG4gICAgICBjYW52YXNlc1sncDgnXS5hZGQoaW1nKTtcbiAgICB9KVxuICB9XG59XG4kKGRvY3VtZW50KS5rZXlkb3duKGZ1bmN0aW9uKGUpIHsgLy8gZGVsIG9yIGJhY2tzcGFjZSB0byBkZWxldGVcbiAgaWYoIGUud2hpY2ggPT0gOCB8fCBlLndoaWNoID09IDQ2KSB7XG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmIChjYW52YXNlc1tjYW52YXNdLmdldEFjdGl2ZU9iamVjdCgpKSB7XG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc10ucmVtb3ZlKGNhbnZhc2VzW2NhbnZhc10uZ2V0QWN0aXZlT2JqZWN0KCkpO1xuICAgICAgICBjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IHJlbW92ZTogdHJ1ZSB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxufSlcblxuXG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG5cdC8vIGFsbCBvdXIgc3RhdGVzXG5cdGlkOiBtYWtlSWQoKSxcblx0dGl0bGU6IGRlZmF1bHRUaXRsZSxcblx0dGltZUxlZnQ6IHRpbWVMZWZ0LFxuXHRleHBpcmVkOiBmYWxzZSxcblx0YXV0aG9yczogZGVmYXVsdEF1dGhvcnMsXG4gIGRhdGU6IERhdGUubm93KCksXG4gIGltYWdlc0Ftb3VudDogMCxcbiAgdGV4dEFtb3VudDogMCxcbiAgdGltZUVsYXBzZWQ6IDAsXG4gIGFjaGlldmVtZW50c0Ftb3VudDogMCxcblx0cGFnZXM6IHtcblx0XHRwMToge30sXG5cdFx0cDI6IHt9LFxuXHRcdHAzOiB7fSxcblx0XHRwNDoge30sXG5cdFx0cDU6IHt9LFxuXHRcdHA2OiB7fSxcblx0XHRwNzoge30sXG5cdFx0cDg6IHt9XG5cdH1cbn07XG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIGlucHV0KSB7XG5cdGlmIChQdWJsaWNhdGlvbi50aW1lTGVmdCA+IDApIHsgLy8gbm90IGV4cGlyZWRcblx0XHRzaG93VGltZShQdWJsaWNhdGlvbilcblx0fSBlbHNlIHsgIC8vIGV4cGlyZWRcblx0XHRzaG93RXhwaXJlZCgpXG5cdH1cblxuXHRpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSBmYWxzZSkge1xuXHRcdHN3aXRjaCAodHJ1ZSkge1xuXHRcdFx0Y2FzZSBpbnB1dC5yZW1vdmUgPT0gdHJ1ZTogLy8gZGVsZXRpbmcgYW4gZWxlbWVudFxuICAgICAgICAgIGFkZFRpbWUoLWJvbnVzVGltZSlcbiAgICAgICAgICBjcml0aWNTYXlzKCdUaGluayB0d2ljZSBuZXh0IHRpbWUuLi4nKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0Ynl0ZUNvdW50KGlucHV0LmRhdGEpID4gMTM5ODExNyA6IC8vIGZpbGUgdG9vIGJpZyAoMW1iKVxuXHRcdFx0XHQgXHRFcnJvci50b29CaWcoKVxuICAgICAgICAgIGFkZFRpbWUoLWJvbnVzVGltZSlcbiAgICAgICAgICBjcml0aWNTYXlzKCdUaGlzIGlzIG5vdCBhIHNlcnZlciBmYXJtLicpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0aW5wdXQudmlzaWJsZSA9PSB0cnVlOiAvLyBuZXcgaW1hZ2VcblxuICAgICAgICAgIGlmICghaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZS9naWYnKSkgeyAvLyBub3QgYSBnaWZcblxuICBcdFx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQubW91c2VQb3MpOyAvLyBkcm9wIGVsZW1lbnRcblxuXG4gICAgICAgICAgICBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKz0gMSAvLyBhY2hpZXZlbWVudCBldmVyeSB4IGltZ3NcbiAgICAgICAgICAgIGlmIChQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQlYWNoaWV2ZW1lbnRTcGFuID09IDApIHtcbiAgICAgICAgICAgICAgYWNoaWV2ZW1lbnQoMTAwICogUHVibGljYXRpb24uaW1hZ2VzQW1vdW50LCBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKyAnIGltYWdlcyBhZGRlZCEnKVxuICAgICAgICAgICAgICBQdWJsaWNhdGlvbi5hY2hpZXZlbWVudHNBbW91bnQgKz0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCA9PSAzKSB7XG4gICAgICAgICAgICAgICQoJyNkb25lJykuY3NzKCdkaXNwbGF5JywnaW5saW5lLWJsb2NrJylcbiAgICAgICAgICAgICAgY3JpdGljU2F5cygnWW91IGNhbiBub3cgc2F2ZSB5b3VyIHB1YmxpY2F0aW9uIScpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBzdGFydCBkaXNydXB0aW9ucyBhZnRlciBmaXJzdCBpbWFnZVxuICAgICAgICAgICAgaWYgKCAgUHVibGljYXRpb24uaW1hZ2VzQW1vdW50ID09IDEgJiZcbiAgICAgICAgICAgICAgICAgIGdldFVybFBhcmFtZXRlcignZGlzcnVwdGlvbnMnKSAhPSAnZmFsc2UnICYmXG4gICAgICAgICAgICAgICAgICBkaXNydXB0aW9uc09uID09IHRydWUgJiZcbiAgICAgICAgICAgICAgICAgIHR5cGVvZiB5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICB5ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7IC8vIGxhdW5jaCBhIHJhbmRvbSBkaXNydXB0aW9uXG4gICAgICAgICAgICAgICAgZGlzcnVwdGlvbnMgPSBPYmplY3Qua2V5cyhEaXNydXB0aW9uKVxuICAgICAgICAgICAgICAgIERpc3J1cHRpb25bZGlzcnVwdGlvbnNbIGRpc3J1cHRpb25zLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dKClcbiAgICAgICAgICAgICAgICBzaGFrZShwYWdlcylcbiAgICAgICAgICAgICAgICBzZnguZGlzcnVwdGlvbigpXG4gICAgICAgICAgICAgIH0sIGRpc3J1cHRpb25JbnRlcnZhbClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWRkVGltZShib251c1RpbWUpXG4gIFx0XHRcdFx0XHRjcml0aWNTYXlzKClcblxuICAgICAgICAgIH0gZWxzZSB7IC8vIGEgZ2lmXG4gICAgICAgICAgICBFcnJvci5ub0dpZnMoKVxuICAgICAgICAgICAgYWRkVGltZSgtYm9udXNUaW1lKVxuICAgICAgICAgIH1cblxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJykgJiZcblx0XHRcdFx0aW5wdXQudmlzaWJsZSA9PSB0cnVlOiAvLyBuZXcgdGV4dFxuXG4gICAgICAgICAgdmFyIGRlQmFzZWRJbnB1dCA9IGF0b2IoaW5wdXQuZGF0YS5zdWJzdHJpbmcoMjMpKTtcbiAgICAgICAgICBpZiAoZGVCYXNlZElucHV0LmluY2x1ZGVzKCc8c2NyaXB0PicpKSB7IC8vIGNvZGUgaW5qZWN0aW9uXG5cbiAgICAgICAgICAgIEVycm9yLmNvZGVJbmplY3Rpb24oKVxuICAgICAgICAgICAgYWRkVGltZSgtYm9udXNUaW1lKVxuICAgICAgICAgICAgY3JpdGljU2F5cygnWW91IGRlc2VydmUgdG8gYmUgcHVuaXNoZWQuJylcblxuICAgICAgICAgIH0gZWxzZSB7XG5cbiAgXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zKSAvLyBkcm9wIGVsZW1lbnRcblxuICAgICAgICAgICAgUHVibGljYXRpb24udGV4dEFtb3VudCArPSBpbnB1dC5kYXRhLmxlbmd0aFxuICAgICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLnRleHRBbW91bnQgPj0gNTAwKSB7XG4gICAgICAgICAgICAgIGFjaGlldmVtZW50KDUwMCwgJ01vcmUgdGhhbiA1MDAgY2hhcmFjdGVycyBhZGRlZCcpXG4gICAgICAgICAgICAgIFB1YmxpY2F0aW9uLmFjaGlldmVtZW50c0Ftb3VudCArPSAxXG4gICAgICAgICAgICB9XG5cbiAgXHRcdFx0XHRcdGFkZFRpbWUoYm9udXNUaW1lICogMilcbiAgICAgICAgICAgIGNyaXRpY1NheXMoJ1RoaXMgaXMgZ29ubmEgYmUgYSBnb29vb29vZCByZWFkJylcblxuICAgICAgICAgIH1cblx0XHRcdFx0XHRcbiAgICAgICAgICBicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG5cdFx0XHRcdFx0RXJyb3Iubm90QWxsb3dlZCgpXG4gICAgICAgICAgYWRkVGltZSgtYm9udXNUaW1lKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0Lm1vdmUgPT0gdHJ1ZSA6IC8vIG1vdmluZyBvciBzY2FsaW5nIGFuIGltYWdlXG5cdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXQucGFnZV0gPSBjYW52YXNlc1tpbnB1dC5wYWdlXS50b0pTT04oKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkge1xuXHRcdC8vIHRvbyBsYXRlXG5cdFx0RXJyb3IudG9vTGF0ZSgpO1xuXHR9XG59XG5cblxuXG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxudmFyIHg7XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0aW5pdENhbnZhc2VzKClcblx0b25Nb2RFbGVtZW50KClcblx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPCAwKSB7XG5cdFx0Ly8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cblx0XHRpZiAoIGdldFVybFBhcmFtZXRlcigndGltZScpICkgeyAvLyBkaWZmaWN1bHR5XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IHRpbWVTZXQgPSBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKVxuXHRcdH0gZWxzZSB7XG4gICAgICBpbmZpbml0ZVRpbWUgPSB0cnVlXG4gICAgfVxuXHRcdHggPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgLSAxMDtcbiAgICAgIGlmIChpbmZpbml0ZVRpbWUgPT0gZmFsc2UpIHtcbiAgICAgICAgUHVibGljYXRpb24udGltZUVsYXBzZWQgPSBwYXJzZUludCggKHRpbWVTZXQgLSBQdWJsaWNhdGlvbi50aW1lTGVmdCkgLyAxMDAwIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFB1YmxpY2F0aW9uLnRpbWVFbGFwc2VkID0gMFxuICAgICAgfVxuXHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbik7XG5cdFx0fSwgMTApXG5cdFx0bW91c2VDb3VudGVyKClcblx0fSBlbHNlIHsgLy8gc2F2ZWQgcHVibGljYXRpb25cblx0XHRyZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbilcblx0fVxufSk7XG5cbmZ1bmN0aW9uIGFkZFRpbWUoYm9udXNUaW1lKSB7XG5cdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgKyBib251c1RpbWU7XG5cdGFuaW1hdGV0aW1lY291bnRlcihib251c1RpbWUvMTAwMCk7XG4gIGlmIChib251c1RpbWUgPj0gMCkge1xuICAgIHNmeC5hZGRUaW1lUGx1cygpXG4gIH0gZWxzZSB7XG4gICAgc2Z4LmFkZFRpbWVNaW51cygpXG4gIH1cbn1cblxuLy8gbW9kaWZ5IGVsZW1lbnQgbGlzdGVuZXJcbmZ1bmN0aW9uIG9uTW9kRWxlbWVudCgpIHtcblx0Zm9yICh2YXIgcGFnZUlkIGluIGNhbnZhc2VzKSB7XG5cdFx0Y2FudmFzZXNbIHBhZ2VJZCBdLm9uKCdvYmplY3Q6bW9kaWZpZWQnLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBwYXJlbnRDYW52YXNJZCA9IGV2dC50YXJnZXQuY2FudmFzLmxvd2VyQ2FudmFzRWwuaWRcblx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgbW92ZTogdHJ1ZSwgcGFnZTogcGFyZW50Q2FudmFzSWR9KVxuXHRcdH0pXG5cdH1cbn1cblxuLy8gZ2V0IG1vdXNlIHBvc2l0aW9uIG9uIGNhbnZhc1xuZnVuY3Rpb24gZ2V0TW91c2VQb3MoY2FudmFzLCBlKSB7XG4gIHZhciBwb2ludGVyID0gY2FudmFzLmdldFBvaW50ZXIoZSlcbiAgdmFyIHBvc1ggPSBwb2ludGVyLnhcbiAgdmFyIHBvc1kgPSBwb2ludGVyLnlcbiAgcmV0dXJuIHtcbiAgICB4OiBwb3NYLFxuICAgIHk6IHBvc1lcbiAgfVxufVxuXG5jb25zdCBwYWdlcyA9ICQoJy5wYWdlJylcbi8vIGRyb3AgZWxlbWVudFxucGFnZXMub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG4gICQodGhpcykuYWRkQ2xhc3MoJ2Ryb3BwYWJsZScpO1xufSk7XG5wYWdlcy5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG4gICQoJy5kcm9wcGFibGUnKS5yZW1vdmVDbGFzcygnZHJvcHBhYmxlJyk7XG59KTtcbnBhZ2VzLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG4gICQoJy5kcm9wcGFibGUnKS5yZW1vdmVDbGFzcygnZHJvcHBhYmxlJyk7XG5cdHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdHZhciB5ID0gMDtcblx0Zm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0cmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHR2YXIgcGFnZUlkID0gJCh0aGlzKS5maW5kKCdjYW52YXMnKS5hdHRyKCdpZCcpO1xuXHRcdG1vdXNlUG9zID0gZ2V0TW91c2VQb3MoY2FudmFzZXNbcGFnZUlkXSwgZSlcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0XHRcdFx0ZGF0YTogZXZlbnQudGFyZ2V0LnJlc3VsdCxcblx0XHRcdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHBhZ2U6IHBhZ2VJZCxcblx0XHRcdFx0XHRtb3VzZVBvczogbW91c2VQb3Ncblx0XHRcdFx0fSk7XG5cdFx0XHR9LCB5ICogZHJvcERlbGF5KTtcblx0XHRcdHkgKz0gMTtcblx0XHR9XG5cdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZXNbaV0pXG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpXG59KVxuJCgnYm9keScpLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKVxufSlcbiQoJ2JvZHknKS5vbignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpXG4gIHNmeC5lcnJvcigpXG59KVxuXG5cblxuXG5cblxuXG4vLyAtLS0gVklFV1xuXG5cbi8vIFRPRE86IG1lcmdlIHRoZXNlIHR3b1xuZnVuY3Rpb24gcGFkKG4sIGxlbikge1xuICByZXR1cm4gKG5ldyBBcnJheShsZW4gKyAxKS5qb2luKCcwJykgKyBuKS5zbGljZSgtbGVuKTtcbn1cblxuXG5mdW5jdGlvbiBzaG93VGltZShQdWJsaWNhdGlvbikge1xuXHRzZWNvbmRzID0gUHVibGljYXRpb24udGltZUxlZnQgLyAxMDAwO1xuXHQkKCcjY291bnRlcicpLnNob3coKTtcblx0dmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKHNlY29uZHMgLyA2MCk7XG5cdHZhciBzZWNvbmRzID0gc2Vjb25kcyAlIDYwO1xuXHR2YXIgbXM7XG5cdGlmICghIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykpIHtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBkID0gbmV3IERhdGUoKTtcblx0XHRcdG1zID0gZC5nZXRNaWxsaXNlY29uZHMoKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID0gcGFkKG1pbnV0ZXMsIDIpICsgJzonICsgcGFkKHNlY29uZHMudG9GaXhlZCgwKSwgMikgKyAnOicgKyBwYWQobXMudG9TdHJpbmcoKS5zdWJzdHIoMCwyKSwgMikgKyAnIGxlZnQhJztcblx0XHR9LCAxKVxuXHR9IGVsc2Uge1xuXHRcdC8vIGNvbnNvbGUubG9nKCdlcnJvcicpO1xuXHR9XG59XG5mdW5jdGlvbiBtb3VzZUNvdW50ZXIoKSB7XG5cdCQoZG9jdW1lbnQpLmJpbmQoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoZS5wYWdlWCA+PSAkKGRvY3VtZW50KS53aWR0aCgpIC8gMikge1xuXHRcdFx0Ly8gaWYgbW91c2Ugb2YgcmlnaHQgc2lkZSBvZiBwYWdlXG5cdFx0XHQkKCcjY291bnRlcicpLmFkZENsYXNzKCdtb3VzZV9yaWdodCcpO1xuXHRcdFx0JCgnI2NvdW50ZXInKS5jc3Moe1xuXHRcdFx0XHRsZWZ0OiBlLnBhZ2VYIC0gMjAgLSAkKCcjY291bnRlcicpLndpZHRoKCksXG5cdFx0XHRcdHRvcDogZS5wYWdlWSArIDUwXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaWYgbW91c2Ugb2YgbGVmdCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykucmVtb3ZlQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggKyAyMCxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIHNob3dFeHBpcmVkKCkge1xuICBpZiAoUHVibGljYXRpb24uZXhwaXJlZCAhPSB0cnVlKSB7XG4gICAgUHVibGljYXRpb24uZXhwaXJlZCA9IHRydWVcbiAgICBsb2NrRWxlbWVudHMoYWxsRWxlbWVudHMoKSlcbiAgICBpZiAodGl0bGUudGV4dCA9PSAnSW5zZXJ0IFRpdGxlJykge1xuICAgICAgdGl0bGUudGV4dCA9IGRlZmF1bHRUaXRsZVxuICAgIH1cbiAgICBpZiAoYXV0aG9ycy50ZXh0ID09ICdJbnNlcnQgQXV0aG9ycycpIHtcbiAgICAgIGF1dGhvcnMudGV4dCA9IGRlZmF1bHRBdXRob3JzXG4gICAgfVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBzaG93UHVibGljYXRpb25EYXRhKFB1YmxpY2F0aW9uKVxuICAgIGlmICggZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKSApIHtcbiAgXHQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgfVxuICBcdCQoJ2JvZHknKS5hZGRDbGFzcygnZXhwaXJlZCcpXG4gIFx0ZXhwaXJlZFRpbWUoKVxuICAgIHNmeC5wZXJpc2hlZCgpXG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uc2VsZWN0aW9uID0gZmFsc2VcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uZGlzY2FyZEFjdGl2ZU9iamVjdCgpLnJlbmRlckFsbCgpXG4gICAgfVxuICBcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICBcdFx0JCgnLndyYXBwZXInKS5hZGRDbGFzcygnc2F2ZWRfdmlldycpO1xuICBcdFx0c2F2ZWRTdGF0ZSgpXG4gIFx0fSwgNTAwKVxuICBcdGNsZWFySW50ZXJ2YWwoeClcbiAgICBpZiAodHlwZW9mIHkgIT09ICd1bmRlZmluZWQnKSB7IC8vIGlmIGRpc3J1cHRpb25zXG4gICAgICBjbGVhckludGVydmFsKHkpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRyb3BFbGVtZW50KHBhZ2VJZCwgZGF0YSwgbW91c2VQb3MpIHtcblx0dmFyIGVsZW1lbnQgPSB7IGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZCB9XG5cdHZhciBlbGVtZW50UG9zID0gY3JlYXRlRWxlbWVudChlbGVtZW50LCBtb3VzZVBvcylcbn1cblxuXG5cblxuXG5cblxuXG4vLyBlcnJvcnNcblxudmFyIEVycm9yID0ge1xuXHRub3RBbGxvd2VkOiBmdW5jdGlvbigpIHtcblx0XHRhbGVydE1lc3NhZ2UoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIG5vdCBhbGxvd2VkIScpXG5cdH0sXG5cdHRvb0JpZzogZnVuY3Rpb24oKSB7XG5cdFx0YWxlcnRNZXNzYWdlKCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyB0b28gYmlnIScpXG5cdH0sXG4gIG5vR2lmczogZnVuY3Rpb24oKSB7XG4gICAgYWxlcnRNZXNzYWdlKCdHaWZzIGFyZSBub3QgYWxsb3dlZC4gKFRoaXMgc3Vja3MsIEkga25vdy4uLiknKVxuICB9LFxuXHR0b29MYXRlOiBmdW5jdGlvbigpIHtcblx0XHRhbGVydE1lc3NhZ2UoJ1RvbyBsYXRlIGFtaWdvJylcblx0fSxcbiAgY29kZUluamVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgYWxlcnRNZXNzYWdlKCdIZXkgaGFja2VyLCB5b3VcXCdyZSB0cnlpbmcgdG8gaW5qZWN0IGNvZGUuIFBsZWFzZSBkb25cXCd0LicpXG4gIH1cbn1cblxuXG5cblxuXG4vLyAtLS0gU0FWRURcblxuZnVuY3Rpb24gc2hvd1B1YmxpY2F0aW9uRGF0YShQdWJsaWNhdGlvbikge1xuICAkKCcudGl0bGUnKS50ZXh0KCBQdWJsaWNhdGlvbi50aXRsZSApXG4gICQoJy5hdXRob3JzIHNwYW46bGFzdC1jaGlsZCcpLnRleHQoIFB1YmxpY2F0aW9uLmF1dGhvcnMgKVxuICAkKCcuZGF0ZSBzcGFuOmxhc3QtY2hpbGQnKS50ZXh0KCB0aW1lQ29udmVydGVyKCBOdW1iZXIoUHVibGljYXRpb24uZGF0ZSkpICkgXG4gICQoJy5pbWFnZXNhbW91bnQgc3BhbjpsYXN0LWNoaWxkJykudGV4dCggUHVibGljYXRpb24uaW1hZ2VzQW1vdW50ICkgXG4gICQoJy50ZXh0YW1vdW50IHNwYW46bGFzdC1jaGlsZCcpLnRleHQoIFB1YmxpY2F0aW9uLnRleHRBbW91bnQgKyAnIGNoYXJzJyApIFxuICAkKCcuZWxhcHNlZHRpbWUgc3BhbjpsYXN0LWNoaWxkJykudGV4dCggUHVibGljYXRpb24udGltZUVsYXBzZWQgKyAnIHMnIClcbiAgJCgnLmFjaGlldmVtZW50c2Ftb3VudCBzcGFuOmxhc3QtY2hpbGQnKS50ZXh0KCBQdWJsaWNhdGlvbi5hY2hpZXZlbWVudHNBbW91bnQgKSAgXG59XG5cbmZ1bmN0aW9uIHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKSB7XG4gIGZ1bmN0aW9uIHJlbmRlclBhZ2UoaW1nLCBjYW52YXNJZCkge1xuICAgIGZhYnJpYy5JbWFnZS5mcm9tVVJMKGltZywgZnVuY3Rpb24oaW1nKXtcbiAgICAgICAgaW1nLmhhc0JvcmRlcnMgPSBmYWxzZTtcbiAgICAgICAgaW1nLmhhc0NvbnRyb2xzID0gZmFsc2U7XG4gICAgICAgIGltZy5zZWxlY3RhYmxlID0gZmFsc2U7XG4gICAgICAgIGltZy5sZWZ0ID0gY2FudmFzZXNbY2FudmFzSWRdLndpZHRoIC8gMjtcbiAgICAgICAgaW1nLnRvcCA9IGNhbnZhc2VzW2NhbnZhc0lkXS5oZWlnaHQgLyAyO1xuICAgICAgICBpbWcuc2NhbGVYID0gY2FudmFzZXNbY2FudmFzSWRdLndpZHRoIC8gaW1nLndpZHRoO1xuICAgICAgICBpbWcuc2NhbGVZID0gY2FudmFzZXNbY2FudmFzSWRdLmhlaWdodCAvIGltZy5oZWlnaHQ7XG4gICAgICAgIGltZy5sb2NrTW92ZW1lbnRYID0gdHJ1ZTtcbiAgICAgICAgaW1nLmxvY2tNb3ZlbWVudFkgPSB0cnVlO1xuICAgICAgICBpbWcubG9ja1JvdGF0aW9uID0gdHJ1ZTtcbiAgICAgICAgaW1nLnNldENvbnRyb2xzVmlzaWJpbGl0eSA9IGZhbHNlO1xuICAgICAgICBpbWcuaWQgPSAnbG9jaydcbiAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLmFkZChpbWcpO1xuICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsLmJpbmQoY2FudmFzZXNbY2FudmFzSWRdKVxuICAgIH0pXG4gIH1cbiAgZm9yICh2YXIgY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICByZW5kZXJQYWdlKFB1YmxpY2F0aW9uLnBhZ2VzW2NhbnZhc0lkXSwgY2FudmFzSWQpXG4gIH1cbiAgc2hvd1B1YmxpY2F0aW9uRGF0YShQdWJsaWNhdGlvbilcbn1cblxuXG5cblxuXG4vLyAtLS0gQkFDS0VORFxuXG4vLyBzYXZlIHRvIGRiXG52YXIgc2F2aW5nID0gZmFsc2VcbmZ1bmN0aW9uIHNhdmV0b0RiKHB1YmxpY2F0aW9uKSB7XG4gIGlmIChzYXZpbmcgPT0gZmFsc2UpIHtcbiAgXHRmb3IgKHZhciBwYWdlIGluIFB1YmxpY2F0aW9uLnBhZ2VzKSB7XG4gICAgICB2YXIgb3JpZ2luV2lkdGggPSBjYW52YXNlc1twYWdlXS5nZXRXaWR0aCgpO1xuXG4gICAgICBmdW5jdGlvbiB6b29tICh3aWR0aCkge1xuICAgICAgICB2YXIgc2NhbGUgPSB3aWR0aCAvIGNhbnZhc2VzW3BhZ2VdLmdldFdpZHRoKCk7XG4gICAgICAgIGhlaWdodCA9IHNjYWxlICogY2FudmFzZXNbcGFnZV0uZ2V0SGVpZ2h0KCk7XG5cbiAgICAgICAgY2FudmFzZXNbcGFnZV0uc2V0RGltZW5zaW9ucyh7XG4gICAgICAgICAgICBcIndpZHRoXCI6IHdpZHRoLFxuICAgICAgICAgICAgXCJoZWlnaHRcIjogaGVpZ2h0XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNhbnZhc2VzW3BhZ2VdLmNhbGNPZmZzZXQoKTtcbiAgICAgICAgdmFyIG9iamVjdHMgPSBjYW52YXNlc1twYWdlXS5nZXRPYmplY3RzKCk7XG4gICAgICAgIGZvciAodmFyIGkgaW4gb2JqZWN0cykge1xuICAgICAgICAgICAgdmFyIHNjYWxlWCA9IG9iamVjdHNbaV0uc2NhbGVYO1xuICAgICAgICAgICAgdmFyIHNjYWxlWSA9IG9iamVjdHNbaV0uc2NhbGVZO1xuICAgICAgICAgICAgdmFyIGxlZnQgPSBvYmplY3RzW2ldLmxlZnQ7XG4gICAgICAgICAgICB2YXIgdG9wID0gb2JqZWN0c1tpXS50b3A7XG5cbiAgICAgICAgICAgIG9iamVjdHNbaV0uc2NhbGVYID0gc2NhbGVYICogc2NhbGU7XG4gICAgICAgICAgICBvYmplY3RzW2ldLnNjYWxlWSA9IHNjYWxlWSAqIHNjYWxlO1xuICAgICAgICAgICAgb2JqZWN0c1tpXS5sZWZ0ID0gbGVmdCAqIHNjYWxlO1xuICAgICAgICAgICAgb2JqZWN0c1tpXS50b3AgPSB0b3AgKiBzY2FsZTtcblxuICAgICAgICAgICAgb2JqZWN0c1tpXS5zZXRDb29yZHMoKTtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXNlc1twYWdlXS5yZW5kZXJBbGwoKTtcbiAgICAgIH1cblxuICAgICAgem9vbShjYW52YXNab29tKVxuXG4gICAgICBQdWJsaWNhdGlvbi5wYWdlc1twYWdlXSA9IGNhbnZhc2VzW3BhZ2VdLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJywgMSkgLy8gdXBkYXRlIGFsbCBwYWdlc1xuXG4gICAgICB6b29tIChvcmlnaW5XaWR0aCk7XG4gIFx0fVxuICAgICQoJy5idXR0b24uc2F2ZSAuc3R5bGl6ZWQnKS5odG1sKCdTYXZpbmcgPHNwYW4+Ljwvc3Bhbj48c3Bhbj4uPC9zcGFuPjxzcGFuPi48L3NwYW4+JykuYWRkQ2xhc3MoJ3NhdmluZycpLnJlbW92ZUNsYXNzKCdzdHlsaXplZCcpXG4gICAgJCgnLmJ1dHRvbi5zYXZlJykuY3NzKCdiYWNrZ3JvdW5kQ29sb3InLCAnI2VlZScpXG4gIFx0JC5hamF4KHtcbiAgXHRcdHVybDogJy9kYicsXG4gIFx0XHR0eXBlOiAncG9zdCcsIC8vIHBlcmZvcm1pbmcgYSBQT1NUIHJlcXVlc3RcbiAgXHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KFB1YmxpY2F0aW9uKSxcbiAgXHRcdGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gIFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuICBcdFx0c3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHNmeC5yZWFkeSgpXG4gICAgICAgICQoJy5idXR0b24uc2F2ZScpLmhpZGUoKVxuICAgICAgICAkKCcuYnV0dG9uLnBkZiwgLmJ1dHRvbi5ib29rbGV0JykuY3NzKCdkaXNwbGF5JywnaW5saW5lLWJsb2NrJylcblxuICAgICAgICAkKCcudGl0bGUnKS5lbXB0eSgpXG4gICAgICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcbiAgICAgICAgJChhKS50ZXh0KFB1YmxpY2F0aW9uLnRpdGxlKS5hdHRyKFwiaHJlZlwiLCAnL3NhdmVkP2lkPScgKyBQdWJsaWNhdGlvbi5pZClcbiAgICAgICAgJChhKS5hcHBlbmRUbygkKCcudGl0bGUnKSlcblxuICBcdFx0XHRjb25zb2xlLmxvZygncHVibGljYXRpb24gc2VudCB0byBkYXRhYmFzZS4nKTtcbiAgXHRcdH1cbiAgXHR9KTtcbiAgXHRjb25zb2xlLmxvZygnc2F2ZWQ/aWQ9JyArIFB1YmxpY2F0aW9uLmlkKVxuICAgIHNhdmluZyA9IHRydWVcbiAgfVxufVxuXG5cblxuXG4vLyAtLS0gRElTUlVQVElPTlNcblxuXG5mdW5jdGlvbiBhbGxFbGVtZW50cyh0eXBlKSB7XG4gIHZhciBvYmpzID0gW11cbiAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICBpZiAodHlwZSkge1xuICAgICAgY2FudmFzT2JqcyA9IGNhbnZhc2VzW2NhbnZhc10uZ2V0T2JqZWN0cyh0eXBlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjYW52YXNPYmpzID0gY2FudmFzZXNbY2FudmFzXS5nZXRPYmplY3RzKClcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IGNhbnZhc09ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGlmIChjYW52YXNPYmpzW2ldLmlkICE9ICdsb2NrJykgeyAvLyB1c2UgdGhpcyB0byBsb2NrXG4gICAgICAgIG9ianMucHVzaCggY2FudmFzT2Jqc1tpXSApXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmpzXG59XG5cbmZ1bmN0aW9uIGxvY2tFbGVtZW50cyhvYmpzKSB7XG4gIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgb2Jqc1tpXS5zZWxlY3RhYmxlID0gZmFsc2VcbiAgICBvYmpzW2ldLmhhc0NvbnRyb2xzID0gZmFsc2VcbiAgICBvYmpzW2ldLmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyQWxsQ2FudmFzZXMoKSB7XG4gIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsKClcbiAgfVxufVxuXG5mdW5jdGlvbiBmaWx0ZXJJbWdzKG9ianMsIGZpbHRlcikge1xuICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIG9ianNbaV0uZmlsdGVycy5wdXNoKGZpbHRlcilcbiAgICBvYmpzW2ldLmFwcGx5RmlsdGVycygpXG4gIH1cbiAgcmVuZGVyQWxsQ2FudmFzZXMoKVxufVxuXG52YXIgRGlzcnVwdGlvbiA9IHtcblx0Y29taWM6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9jb21pYyhvYmpzKSB7XG4gICAgICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBvYmpzW2ldLmZvbnRGYW1pbHkgPSAnXCJDb21pYyBTYW5zIE1TXCInXG4gICAgICB9XG4gICAgfVxuICAgIF9jb21pYyggYWxsRWxlbWVudHMoJ3RleHQnKSApXG4gICAgX2NvbWljKCBhbGxFbGVtZW50cygndGV4dGJveCcpIClcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnQ2FuXFwndCB5b3Ugc3BpY2UgdGhlIHR5cG9ncmFwaHkgYSBiaXQ/Jylcblx0fSxcblx0cm90YXRlSW1nc1JhbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9yb3RhdGVJbWdzUmFuZChvYmpzKSB7XG4gICAgICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBvYmpzW2ldLm9yaWdpblggPSAnY2VudGVyJ1xuICAgICAgICBvYmpzW2ldLm9yaWdpblkgPSAnY2VudGVyJ1xuICAgICAgICBvYmpzW2ldLmFuaW1hdGUoeyBhbmdsZTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSB9LCB7XG4gICAgICAgICAgZHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgb25DaGFuZ2U6IG9ianNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKG9ianNbaV0uY2FudmFzKSxcbiAgICAgICAgICBlYXNpbmc6IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHsgcmV0dXJuIGMqdC9kICsgYiB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIF9yb3RhdGVJbWdzUmFuZChhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICBjcml0aWNTYXlzKCdJIGZpbmQgdGhpcyBsYXlvdXQgYSBiaXQgc3RhdGljLi4uJylcblx0fSxcblx0bG9ja1JhbmRQYWdlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNhbnZhc2VzKVxuICAgIHJhbmRDYW52YXMgPSBjYW52YXNlc1trZXlzWyBrZXlzLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dXG5cdFx0cmFuZENhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZTtcblx0XHRmb3IgKG9iamVjdElkIGluIHJhbmRDYW52YXMuZ2V0T2JqZWN0cygpICkge1xuXHRcdFx0dmFyIG9iamVjdCA9IHJhbmRDYW52YXMuaXRlbShvYmplY3RJZClcblx0XHRcdG9iamVjdC5zZWxlY3RhYmxlID0gZmFsc2Vcblx0XHRcdG9iamVjdC5ob3ZlckN1cnNvciA9ICdkZWZhdWx0J1xuXHRcdH1cblx0XHRyYW5kQ2FudmFzLmFkZChuZXcgZmFicmljLkxpbmUoWzAsIDAsIHJhbmRDYW52YXMud2lkdGgsIHJhbmRDYW52YXMuaGVpZ2h0XSwge1xuXHQgIFx0c3Ryb2tlOiAncmVkJyxcblx0ICBcdHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIFx0c3Ryb2tlV2lkdGg6IDIsXG4gICAgICBob3ZlckN1cnNvcjonZGVmYXVsdCcsXG4gICAgICBpZDogJ2xvY2snXG5cdFx0fSkpXG5cdFx0cmFuZENhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICBjcml0aWNTYXlzKCdQYWdlICcgKyByYW5kQ2FudmFzLmlkWzFdICsgJyBpcyBub3cgbG9ja2VkLi4uJylcblx0fSxcbiAgc2h1ZmZsZVBhZ2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdG9TaHVmZmxlID0gW11cbiAgICB2YXIgaSA9IDBcbiAgICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoaSA+IDAgJiYgaSA8PSA2KSB7IC8vIHByZXZlbnQgc2h1ZmZsaW5nIGZpcnN0IHBhZ2VcbiAgICAgICAgdG9TaHVmZmxlLnB1c2goIGNhbnZhc2VzW2NhbnZhc0lkXS50b0pTT04oKSApXG4gICAgICB9XG4gICAgICBpICs9IDFcbiAgICB9XG4gICAgc2h1ZmZsZUFycmF5KHRvU2h1ZmZsZSlcbiAgICB2YXIgeSA9IDBcbiAgICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoeSA+IDAgJiYgeSA8PSA2KSB7XG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5sb2FkRnJvbUpTT04odG9TaHVmZmxlW3kgLSAxXSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbC5iaW5kKGNhbnZhc2VzW2NhbnZhc0lkXSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHkgKz0gMVxuICAgIH1cbiAgICBjcml0aWNTYXlzKCdUaGUgcnl0aG0gb2YgdGhpcyBwdWJsaWNhdGlvbiBpcyBhIGJpdCB3ZWFrLiBEb25cXCd0IHlvdSB0aGluaz8nKVxuICB9LFxuXHRhZHM6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNhbnZhc2VzKVxuICAgIHJhbmRDYW52YXMgPSBjYW52YXNlc1trZXlzWyBrZXlzLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dXG5cdFx0cmFuZENhbnZhcy5hZGQobmV3IGZhYnJpYy5SZWN0KHtcblx0XHRcdHdpZHRoOiByYW5kQ2FudmFzLndpZHRoLFxuXHRcdFx0aGVpZ2h0OiAzMCxcblx0XHRcdGZpbGw6ICcjMEQyMTNFJyxcblx0XHRcdGxvY2tNb3ZlbWVudFg6IHRydWUsXG5cdFx0XHRsb2NrTW92ZW1lbnRZOiB0cnVlLFxuXHRcdFx0bG9ja1JvdGF0aW9uOiB0cnVlLFxuXHRcdFx0aGFzQ29udHJvbHM6IGZhbHNlLFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG5cdFx0XHRsZWZ0OiByYW5kQ2FudmFzLndpZHRoLzIsXG5cdFx0XHR0b3A6IDE1LFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBpZDogJ2xvY2snXG5cdFx0fSkpO1xuXHRcdGZhYnJpYy5JbWFnZS5mcm9tVVJMKGtpbmtvQmFzZTY0LCBmdW5jdGlvbihpbWcpe1xuXHRcdFx0XHRpbWcuaGFzQm9yZGVycyA9IGZhbHNlO1xuXHRcdFx0XHRpbWcuaGFzQ29udHJvbHMgPSBmYWxzZTtcbiAgICAgICAgaW1nLnNlbGVjdGFibGUgPSBmYWxzZTtcblx0XHRcdFx0aW1nLnNjYWxlKDAuMik7XG5cdFx0XHRcdGltZy5sZWZ0ID0gcmFuZENhbnZhcy53aWR0aC0xMDA7XG5cdFx0XHRcdGltZy50b3AgPSA1MDtcblx0XHRcdFx0aW1nLmxvY2tNb3ZlbWVudFggPSB0cnVlO1xuXHRcdFx0XHRpbWcubG9ja01vdmVtZW50WSA9IHRydWU7XG5cdFx0XHRcdGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuXHRcdFx0XHRpbWcuc2V0Q29udHJvbHNWaXNpYmlsaXR5ID0gZmFsc2U7XG4gICAgICAgIGltZy5pZCA9ICdsb2NrJ1xuXHRcdFx0XHRyYW5kQ2FudmFzLmFkZChpbWcpO1xuXHRcdH0pXG4gICAgY3JpdGljU2F5cygnSSBmb3VuZCBhIHNwb25zb3IhJylcblx0fSxcbiAgaGFsZlRpbWU6IGZ1bmN0aW9uICgpIHtcbiAgICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMlxuICAgIGNyaXRpY1NheXMoJ1RoaXMgaXMgdGFraW5nIHRvbyBsb25nLi4uJylcbiAgfSxcbiAgZG91YmxlVGltZTogZnVuY3Rpb24gKCkge1xuICAgIFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgKiAyXG4gICAgY3JpdGljU2F5cygnVGFrZSB5b3VyIHRpbWUuLi4nKVxuICB9LFxuICBncmV5c2NhbGVJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuR3JheXNjYWxlKCkgKVxuICAgIGNyaXRpY1NheXMoJ1NoYWxsIHdlIG1ha2UgaXQgbG9vayBjbGFzc2ljPycpXG4gIH0sXG4gIGludmVydEltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5JbnZlcnQoKSApXG4gICAgY3JpdGljU2F5cygnVGhlIHZpc3VhbHMgbmVlZCBzb21lIGVkZ3kgY29sb3JzJylcbiAgfSxcbiAgc2VwaWFJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuU2VwaWEoKSApXG4gICAgY3JpdGljU2F5cygnRXZlciBoZWFyZCBvZiBJbnN0YWdyYW0/JylcbiAgfSxcbiAgYmxhY2t3aGl0ZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5CbGFja1doaXRlKCkgKVxuICAgIGNyaXRpY1NheXMoJ1RoaXMgc2hvdWxkIGxvb2sgbGlrZSBhIHppbmUhJylcbiAgfSxcbiAgcGl4ZWxhdGVJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuUGl4ZWxhdGUoe2Jsb2Nrc2l6ZTogMjB9KSApXG4gICAgY3JpdGljU2F5cygnSXNuXFwndCB0aGlzIGEgdmlkZW9nYW1lIGFmdGVyIGFsbD8nKVxuICB9LFxuICBub2lzZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5Ob2lzZSh7bm9pc2U6IDIwMH0pIClcbiAgICBjcml0aWNTYXlzKCdNQUtFIFNPTUUgTk9PSVNFISEnKVxuICB9LFxuICBmb250U2l6ZUJpZ2dlcjogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2ZvbnRTaXplQmlnZ2VyKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCgnZm9udFNpemUnLCBlbGVtZW50c1tpXS5mb250U2l6ZSAqIHNjYWxlRm9udCk7XG4gICAgICB9XG4gICAgfVxuICAgIF9mb250U2l6ZUJpZ2dlcihhbGxFbGVtZW50cygndGV4dGJveCcpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdDYW5cXCd0IHJlYWQgYW55dGhpbmcgOignKVxuICB9LFxuICBmb250U2l6ZVNtYWxsZXI6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9mb250U2l6ZVNtYWxsZXIoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KCdmb250U2l6ZScsIGVsZW1lbnRzW2ldLmZvbnRTaXplIC8gc2NhbGVGb250KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2ZvbnRTaXplU21hbGxlcihhbGxFbGVtZW50cygndGV4dGJveCcpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdJXFwnbSBub3QgYmxpbmQhJylcbiAgfSxcbiAgYmlnZ2VySW1nczogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2JpZ2dlckltZ3MoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBzY2FsZVk6IHNjYWxlVXBJbWdzLFxuICAgICAgICAgIHNjYWxlWDogc2NhbGVVcEltZ3NcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIF9iaWdnZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdCTE9XIFVQIScpXG4gIH0sXG4gIHNtYWxsZXJJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfc21hbGxlckltZ3MoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBzY2FsZVk6IHNjYWxlRG93bkltZ3MsXG4gICAgICAgICAgc2NhbGVYOiBzY2FsZURvd25JbWdzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBfc21hbGxlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0JMT1cgVVAhJylcbiAgfSxcbiAgbG9ja0FsbEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcbiAgICBsb2NrRWxlbWVudHMoYWxsRWxlbWVudHMoKSlcbiAgICBjcml0aWNTYXlzKCdUaGluZ3MgYXJlIHBlcmZlY3QgYXMgdGhleSBhcmUuJylcbiAgfSxcbiAgc2tld0FsbEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfc2tld0FsbEVsZW1lbnRzKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7XG4gICAgICAgICAgc2NhbGVZOiBzY2FsZVVwSW1ncyxcbiAgICAgICAgICBzY2FsZVg6IHNjYWxlVXBJbWdzLFxuICAgICAgICAgIHRyYW5zZm9ybU1hdHJpeDogWzEsIC41MCwgMCwgMSwgMCwgMF1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgX3NrZXdBbGxFbGVtZW50cyhhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnU3RyZXRjaCB0aG9zZSBpbWFnZXMsIGNvbWUgb24hJylcbiAgfSxcbiAgZmxpcEFsbEltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9mbGlwQWxsSW1ncyhlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIGFuZ2xlOiAnLTE4MCcsXG4gICAgICAgICAgZmxpcFk6IHRydWVcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgX2ZsaXBBbGxJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdGbGlwIHRob3NlIGltYWdlcywgY29tZSBvbiEnKVxuICB9LFxuICBiaXRMZWZ0Yml0UmlnaHRBbGxJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfYml0TGVmdGJpdFJpZ2h0QWxsSW1ncyhlbGVtZW50cywgZGlzdGFuY2UpIHtcbiAgICAgIHZhciBkdXJhdGlvbiA9IDIwMFxuICAgICAgdmFyIHBhdXNlID0gMTAwXG5cbiAgICAgIGZ1bmN0aW9uIGxlZnQxKGksIGVsZW1lbnRzKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBlbGVtZW50c1tpXS5hbmltYXRlKCdsZWZ0JywgZWxlbWVudHNbaV0ubGVmdCArIGRpc3RhbmNlICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApLCB7IC8vIGEgYml0IG9mIHJhbmRvbW5lc3MgdG8gbWFrZSBpdCBtb3JlIGh1bWFuXG4gICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApLFxuICAgICAgICAgICAgb25DaGFuZ2U6IGVsZW1lbnRzW2ldLmNhbnZhcy5yZW5kZXJBbGwuYmluZChlbGVtZW50c1tpXS5jYW52YXMpLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sIDApXG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBsZWZ0MihpLCBlbGVtZW50cykge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgZWxlbWVudHNbaV0uYW5pbWF0ZSgnbGVmdCcsIGVsZW1lbnRzW2ldLmxlZnQgKyBkaXN0YW5jZSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKSwge1xuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBlbGVtZW50c1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQoZWxlbWVudHNbaV0uY2FudmFzKSxcbiAgICAgICAgICB9KVxuICAgICAgICB9LCBkdXJhdGlvbiArIHBhdXNlKVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gcmlnaHQxKGksIGVsZW1lbnRzKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBlbGVtZW50c1tpXS5hbmltYXRlKCdsZWZ0JywgZWxlbWVudHNbaV0ubGVmdCAtIGRpc3RhbmNlIC0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApLCB7XG4gICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApLFxuICAgICAgICAgICAgb25DaGFuZ2U6IGVsZW1lbnRzW2ldLmNhbnZhcy5yZW5kZXJBbGwuYmluZChlbGVtZW50c1tpXS5jYW52YXMpLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sIChkdXJhdGlvbiArIHBhdXNlKSAqIDIgKVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gcmlnaHQyKGksIGVsZW1lbnRzKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBlbGVtZW50c1tpXS5hbmltYXRlKCdsZWZ0JywgZWxlbWVudHNbaV0ubGVmdCAtIGRpc3RhbmNlIC0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApLCB7XG4gICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApLFxuICAgICAgICAgICAgb25DaGFuZ2U6IGVsZW1lbnRzW2ldLmNhbnZhcy5yZW5kZXJBbGwuYmluZChlbGVtZW50c1tpXS5jYW52YXMpLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sIChkdXJhdGlvbiArIHBhdXNlKSAqIDMgKVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZWZ0MShpLCBlbGVtZW50cylcbiAgICAgICAgbGVmdDIoaSwgZWxlbWVudHMpXG4gICAgICAgIHJpZ2h0MShpLCBlbGVtZW50cylcbiAgICAgICAgcmlnaHQyKGksIGVsZW1lbnRzKVxuICAgICAgfVxuICAgIH1cbiAgICBfYml0TGVmdGJpdFJpZ2h0QWxsSW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgNzApXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0EgYml0IHRvIHRoZSByaWdodC4uLiBObyBubywgYSBiaXQgdG8gdGhlIGxlZnQuLi4nKVxuICB9LFxuICByaWdpZE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9yaWdpZE1vZGUoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBsb2NrTW92ZW1lbnRZOiB0cnVlLFxuICAgICAgICAgIGxvY2tSb3RhdGlvbjogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfcmlnaWRNb2RlKGFsbEVsZW1lbnRzKCdpbWFnZScpLCA3MClcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnUmVzcGVjdCB0aGUgZ3JpZCEnKVxuICB9LFxuICBiZXR0ZXJUaXRsZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRpdGxlcyA9IFtcbiAgICAgICdEb24gUXVpeG90ZScsXG4gICAgICAnSW4gU2VhcmNoIG9mIExvc3QgVGltZScsXG4gICAgICAnVWx5c3NlcycsXG4gICAgICAnVGhlIE9keXNzZXknLFxuICAgICAgJ1dhciBhbmQgUGVhY2UnLFxuICAgICAgJ01vYnkgRGljaycsXG4gICAgICAnVGhlIERpdmluZSBDb21lZHknLFxuICAgICAgJ0hhbWxldCcsXG4gICAgICAnVGhlIEdyZWF0IEdhdHNieScsXG4gICAgICAnVGhlIElsaWFkJ1xuICAgIF1cbiAgICB2YXIgcmFuZFRpdGxlID0gdGl0bGVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRpdGxlcy5sZW5ndGgpXVxuICAgIHRpdGxlLnRleHQgPSByYW5kVGl0bGVcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgUHVibGljYXRpb24udGl0bGUgPSByYW5kVGl0bGVcbiAgICBjcml0aWNTYXlzKCdJIHN1Z2dlc3QgYSBjYXRjaGllciB0aXRsZScpXG4gIH0sXG4gIGJldHRlckF1dGhvcnM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aGVfYXV0aG9ycyA9IFtcbiAgICAgICdMZW8gVG9sc3RveScsXG4gICAgICAnRnlvZG9yIERvc3RvZXZza3knLFxuICAgICAgJ1dpbGxpYW0gU2hha2VzcGVhcmUnLFxuICAgICAgJ0NoYXJsZXMgRGlja2VucycsXG4gICAgICAnSG9tZXInLFxuICAgICAgJ0ouIFIuIFIuIFRvbGtpZW4nLFxuICAgICAgJ0dlb3JnZSBPcndlbGwnLFxuICAgICAgJ0VkZ2FyIEFsbGFuIFBvZScsXG4gICAgICAnTWFyayBUd2FpbicsXG4gICAgICAnVmljdG9yIEh1Z28nXG4gICAgXVxuICAgIHZhciByYW5kQXV0aG9yID0gdGhlX2F1dGhvcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhlX2F1dGhvcnMubGVuZ3RoKV1cbiAgICBhdXRob3JzLnRleHQgPSByYW5kQXV0aG9yXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIFB1YmxpY2F0aW9uLmF1dGhvcnMgPSByYW5kQXV0aG9yXG4gICAgY3JpdGljU2F5cygnV2UgbmVlZCBhIHdlbGwta25vd24gdGVzdGltb25pYWwuJylcbiAgfSxcbiAgZHJhd2luZ01vZGU6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgICBjYW52YXNlc1tjYW52YXNdLmlzRHJhd2luZ01vZGUgPSB0cnVlXG4gICAgICBjYW52YXNlc1tjYW52YXNdLmJhY2tncm91bmRDb2xvciA9ICcjZmZmZmFhJ1xuICAgICAgY2FudmFzZXNbY2FudmFzXS5yZW5kZXJBbGwoKVxuICAgIH1cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgICAgY2FudmFzZXNbY2FudmFzXS5pc0RyYXdpbmdNb2RlID0gZmFsc2VcbiAgICAgICAgY2FudmFzZXNbY2FudmFzXS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2ZmZmZmZidcbiAgICAgICAgY2FudmFzZXNbY2FudmFzXS5yZW5kZXJBbGwoKVxuICAgICAgfVxuICAgIH0sIGRyYXdpbmdNb2RlVGltZSlcbiAgICBjcml0aWNTYXlzKCdEbyB5b3UgbGlrZSB0byBkcmF3PycpXG4gIH0sXG4gIGJsYWNrYm9hcmRNb2RlOiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgY2FudmFzZXNbY2FudmFzXS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzAwMDAwMCdcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10ucmVuZGVyQWxsKClcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGxFbGVtZW50cygndGV4dCcpLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhbGxFbGVtZW50cygndGV4dCcpW2ldLnNldCh7ZmlsbDogJyNmZmYnfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHdoaXRlVGV4dChlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe2ZpbGw6ICcjZmZmJ30pO1xuICAgICAgfVxuICAgIH1cbiAgICB3aGl0ZVRleHQoYWxsRWxlbWVudHMoJ3RleHRib3gnKSlcbiAgICB3aGl0ZVRleHQoW3RpdGxlLGF1dGhvcnNdKVxuICAgIGZvbnRDb2xvciA9ICcjZmZmJ1xuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdUaGluayBvZiB0aGUgcGFnZSBhcyBhIGJsYWNrYm9hcmQnKVxuICB9LFxuICBjbGFzc2lmaWVkTW9kZTogZnVuY3Rpb24oKSB7XG4gICAgZmFicmljLkltYWdlLmZyb21VUkwoY2xhc3NpZmllZEJhc2U2NCwgZnVuY3Rpb24oaW1nKXtcbiAgICAgIGltZy5oYXNCb3JkZXJzID0gZmFsc2U7XG4gICAgICBpbWcuaGFzQ29udHJvbHMgPSBmYWxzZTtcbiAgICAgIGltZy5zZWxlY3RhYmxlID0gZmFsc2U7XG4gICAgICBpbWcuc2NhbGUoMC44KTtcbiAgICAgIGltZy5sZWZ0ID0gY2FudmFzZXNbJ3AxJ10ud2lkdGggLyAyO1xuICAgICAgaW1nLnRvcCA9IDMwMDtcbiAgICAgIGltZy5sb2NrTW92ZW1lbnRYID0gdHJ1ZTtcbiAgICAgIGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcbiAgICAgIGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuICAgICAgaW1nLnNldENvbnRyb2xzVmlzaWJpbGl0eSA9IGZhbHNlO1xuICAgICAgaW1nLmlkID0gJ2xvY2snO1xuICAgICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgICAgY2FudmFzZXNbY2FudmFzXS5hZGQoaW1nKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdUaGUgcHVibGljIG11c3Qgbm90IGtub3cuJylcbiAgfVxufVxuIl0sImZpbGUiOiJtYWluLmpzIn0=
