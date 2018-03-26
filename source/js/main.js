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
let pubDate
let coverLine
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
  	coverLine = new fabric.Line([0, 0, lineLenght, 0], {
  		left: ( canvases['p1'].width - lineLenght) / 2,
  	  top: 160,
  	  stroke: '#222',
  	  selectable: false,
      hasControls: false,
  	 	originX: 'left',
  	  originY: 'top'
  	})
    canvases['p1'].add(coverLine)
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
    pubDate = new fabric.Text( timeConverter(Publication.date), {
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
    canvases['p8'].add(pubDate);
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
    whiteText([title,authors,pubDate])
    fontColor = '#fff'
    var lineLenght = 250
    coverLine = new fabric.Line([0, 0, lineLenght, 0], {
      left: ( canvases['p1'].width - lineLenght) / 2,
      top: 160,
      stroke: '#fff',
      selectable: false,
      hasControls: false,
      originX: 'left',
      originY: 'top'
    })
    canvases['p1'].add(coverLine) // not sure why I can't simply change the stroke
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
      var keys = Object.keys(canvases)
      randCanvas = canvases[keys[ keys.length * Math.random() << 0]]
      randCanvas.add(img)
    })
    renderAllCanvases()
    criticSays('The public must not know.')
  }
}
