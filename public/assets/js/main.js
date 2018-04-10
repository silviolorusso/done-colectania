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
var canvasZoom = 550
var maxFileSize = 1048576 + 400000 // 1mb + some margin
var maxPublicationSize = 10485760 // 10mb


loremIpsum = 'Proceduralize put your feelers out lean into that problem or cross-pollination, or prethink, or wheelhouse. Vertical integration highlights . Design thinking sacred cow, yet race without a finish line goalposts.'


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

function formatBytes(a,b){if(0==a)return"0 bytes";var c=1024,d=b||2,e=["bytes","kb","mb","gb","tb","pb","eb","zb","yb"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+e[f]}

function updateFilesizePubLeft(data) {
  filesizePubLeft = filesizePubLeft - data.length
  if (filesizePubLeft > 0) {
    $('.filesizePubLeft').text( formatBytes(filesizePubLeft) + ' ' )
  } else {
    $('.filesizePubLeft').text( '0mb ' )
  }
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
var filesizePubLeft = maxPublicationSize
let title
let authors
let pubDate
let coverLine
let isLockedEditing = false
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

    // title
  	title = new fabric.Textbox('Insert Title', {
  	  top: 120,
  	  fontFamily: 'AGaramondPro',
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
      isLockedEditing = true
    }).on('changed', function(e) {
      Publication.title = this.text.replace(/</g, "&lt;").replace(/>/g, "&gt;") // prevent code injection
      this.text = this.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }).on('editing:exited', function(e) {
      this.selectable = false
      isLockedEditing = false
      if (this.text == '') {
        this.text = 'Insert Title'
      }
    })
  	canvases['p1'].add(title)

    // line
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

    // authors
  	authors = new fabric.Textbox('Insert Authors', {
  	  top: 180,
  	  fontFamily: 'AGaramondPro',
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
      isLockedEditing = true
    }).on('changed', function(e) {
      Publication.authors = this.text.replace(/</g, "&lt;").replace(/>/g, "&gt;") // prevent code injection
      this.text = this.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }).on('editing:exited', function(e) {
      this.selectable = false
      isLockedEditing = false
      if (this.text == '') {
        this.text = 'Insert Authors'
      }
    })
    canvases['p1'].add(authors)

    // date
    pubDate = new fabric.Text( timeConverter(Publication.date), {
      top: 600,
      left: canvases['p8'].width/2,
      fontFamily: 'AGaramondPro',
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
    // fabric.Image.fromURL(logoFotocolectaniaBase64, function(img){
    //   img.hasBorders = false;
    //   img.hasControls = false;
    //   img.selectable = false;
    //   img.scale(0.12);
    //   img.left = canvases['p8'].width/2;
    //   img.top = 530;
    //   img.lockMovementX = true;
    //   img.lockMovementY = true;
    //   img.lockRotation = true;
    //   img.setControlsVisibility = false;
    //   img.hoverCursor = 'default';
    //   img.id = 'lock';
    //   canvases['p8'].add(img);
    // })
  }

  for (canvas in canvases) {

    canvases[canvas].on('mouse:dblclick', function(e) { // on double click create textbox

      obj = this.getActiveObject()
      if (obj) {
        var isEditing = obj.isEditing
      }
      if (isLockedEditing != true && !obj && typeof isEditing == 'undefined') { // if not editing title and authors and there is no selected object and not edting anything else
        textWidth = 250
        try {
          mousePos = getMousePos(this)
        } catch(err) { // firefox NaN bug
          var mousePos = {
            x: this.width / 2 - textWidth/2,
            y: this.height / 2.5
          }
        }

        loremTextbox = new fabric.Textbox(loremIpsum, {
            fontFamily: 'Helvetica',
            left: parseInt(mousePos.x), // to avoid blur
            top: parseInt(mousePos.y),
            fontSize: fontSize,
            fill: fontColor,
            width: 250,
            breakWords: true,
            originX: 'left',
            originY: 'top'
          })
        this.add(loremTextbox)
        sfx.button()
      }

    })

  }

  for (canvas in canvases) { // when selecting an object, deselect all the objects on other canvases
    canvases[canvas].on('object:selected', function(e) {
      thisCanvas = e.target.canvas.id
      for (canvas in canvases) {
        if (canvas !== e.target.canvas.id) {
          canvases[canvas].discardActiveObject().renderAll()
        }
      }
    })
  }

  $(document).keydown(function(e) { // del or backspace to delete
    if( e.which == 8 || e.which == 46) {
      for (canvas in canvases) {
        obj = canvases[canvas].getActiveObject()
        if (obj) {
          var isEditing = obj.isEditing
        }
        if ( obj && isEditing != true ) {  // removing object

          canvases[canvas].remove(canvases[canvas].getActiveObject());
          controller(Publication, { remove: true })

          e.preventDefault()
        }
      }
    }
  })

}


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
        filesizePubLeft <= 0: // publication is 10mb
          Error.pubTooBig()
          addTime(-bonusTime)
          criticSays('Enough!')
          break
			case input.data &&
				byteCount(input.data) > maxFileSize : // file too big (1mb)
				 	Error.tooBig()
          addTime(-bonusTime)
          criticSays('This is not a server farm.')
					break
			case input.data &&
				input.data.includes('data:image') &&
				input.visible == true: // new image

          if (!input.data.includes('data:image/gif')) { // not a gif

  					dropElement(input.page, input.data, input.mousePos); // drop element

            updateFilesizePubLeft(input.data)

            Publication.imagesAmount += 1 // achievement every x imgs
            if (Publication.imagesAmount%achievementSpan == 0) {
              achievement(100 * Publication.imagesAmount, Publication.imagesAmount + ' images added!')
              Publication.achievementsAmount += 1
            }
            if (Publication.imagesAmount == 3) { // save pub after loading 3 images
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

            updateFilesizePubLeft(input.data)

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
	} else if (input && input.move !== true && Publication.expired == true) {
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
			if (minutes <= 0 && seconds <= 20) {

				var size = (1.34444444 - (seconds / 60));
				$('.counter').css('transform', 'scale(' + size + ')');

				switch (seconds) {
					case 5:
						sfx.error()
						break;
					case 4:
						sfx.error()
						break;
					case 3:
						sfx.error()
						break;
					case 2:
						sfx.error()
						break;
					case 1:
						sfx.error()
						break;
					default:

				}
			}
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
    soundtrack.stop()
    Publication.expired = true

    // locking elements
    lockElements(allElements())
    if (title.text == 'Insert Title') {
      title.text = defaultTitle
    }
    if (authors.text == 'Insert Authors') {
      authors.text = defaultAuthors
    }
    title.exitEditing()
    authors.exitEditing()
    title.selectable = title.authors = false
    for (canvas in canvases) {
      canvases[canvas].selectable = false
      canvases[canvas].discardActiveObject().renderAll()
    }

    elementsAmount = 0
    for (canvas in canvases) {
      elementsAmount = elementsAmount + canvases[canvas].getObjects().length
    }
    if (elementsAmount <= 5) {
      $('.tryagain').css('display','inline-block')
      $('.save').hide()
      setTimeout(function(){
        Error.noContent()
      }, 2000)
    } else {

    }

    showPublicationData(Publication)

    if ( document.getElementById('counter') ) {
  	 document.getElementById('counter').style.display = 'none'
    }
  	$('body').addClass('expired')
  	expiredTime()
    sfx.perished()
  	setTimeout(function () {
  		$('.wrapper').addClass('saved_view');
  		savedState()
  	}, 500)
  	clearInterval(x) // clear controller
    if (typeof y !== 'undefined') { // if disruptions
      clearInterval(y) // clear disruptions
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
  pubTooBig: function() {
    alertMessage('You reached the limit of 10mb for this publication. You can still work on the layout and save the publication.')
  },
  noGifs: function() {
    alertMessage('Gifs are not allowed. (This sucks, I know...)')
  },
	tooLate: function() {
		alertMessage('Too late amigo')
    sfx.error()
	},
  codeInjection: function() {
    alertMessage('Hey hacker, you\'re trying to inject code. Please don\'t.')
  },
  noContent: function() {
    alertMessage('You didn\'t upload any image or text :(')
    sfx.error()
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

      Publication.pages[page] = canvases[page].toDataURL('image/jpeg', 1) // update all pages

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
        $('.achievements h3').addClass('arrowed')
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBERUZBVUxUU1xuXG52YXIgdGltZUxlZnQgPSA5OTk5OTk5OTk5OTk5OVxudmFyIGRpc3J1cHRpb25zT24gPSB0cnVlXG52YXIgZHJvcERlbGF5ID0gMTAwXG52YXIgZGlzcnVwdGlvbkludGVydmFsID0gMTAwMDBcbnZhciBib251c1RpbWUgPSA1MDAwXG52YXIgdGV4dENodW5rc0xlbmd0aCA9IDE1MDBcbnZhciBmb250U2l6ZSA9IDE1XG52YXIgZm9udENvbG9yID0gJyMwMDAnXG52YXIgc2NhbGVGb250ID0gMS41XG52YXIgc2NhbGVVcEltZ3MgPSAwLjdcbnZhciBzY2FsZURvd25JbWdzID0gMC43XG52YXIgYWNoaWV2ZW1lbnRTcGFuID0gM1xudmFyIGRyYXdpbmdNb2RlVGltZSA9IDEwMDAwXG52YXIgaW5maW5pdGVUaW1lID0gZmFsc2VcbnZhciBkZWZhdWx0VGl0bGUgPSAnVW50aXRsZWQnXG52YXIgZGVmYXVsdEF1dGhvcnMgPSAnQW5vbnltb3VzJ1xudmFyIGNhbnZhc1pvb20gPSA1NTBcbnZhciBtYXhGaWxlU2l6ZSA9IDEwNDg1NzYgKyA0MDAwMDAgLy8gMW1iICsgc29tZSBtYXJnaW5cbnZhciBtYXhQdWJsaWNhdGlvblNpemUgPSAxMDQ4NTc2MCAvLyAxMG1iXG5cblxubG9yZW1JcHN1bSA9ICdQcm9jZWR1cmFsaXplIHB1dCB5b3VyIGZlZWxlcnMgb3V0IGxlYW4gaW50byB0aGF0IHByb2JsZW0gb3IgY3Jvc3MtcG9sbGluYXRpb24sIG9yIHByZXRoaW5rLCBvciB3aGVlbGhvdXNlLiBWZXJ0aWNhbCBpbnRlZ3JhdGlvbiBoaWdobGlnaHRzIC4gRGVzaWduIHRoaW5raW5nIHNhY3JlZCBjb3csIHlldCByYWNlIHdpdGhvdXQgYSBmaW5pc2ggbGluZSBnb2FscG9zdHMuJ1xuXG5cbi8vIC0tLSBHRU5FUkFMIEZVTkNUSU9OU1xuXG5mdW5jdGlvbiBtYWtlSWQoKSB7XG5cdHZhciByYW5kTGV0dGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI2KSk7XG5cdHZhciBpZCA9IHJhbmRMZXR0ZXIgKyBEYXRlLm5vdygpO1xuXHRyZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIGJ5dGVDb3VudChzKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSShzKS5zcGxpdCgvJS4ufC4vKS5sZW5ndGggLSAxO1xufVxuXG52YXIgZ2V0VXJsUGFyYW1ldGVyID0gZnVuY3Rpb24gZ2V0VXJsUGFyYW1ldGVyKHNQYXJhbSkge1xuICB2YXIgc1BhZ2VVUkwgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpLFxuICAgIHNVUkxWYXJpYWJsZXMgPSBzUGFnZVVSTC5zcGxpdCgnJicpLFxuICAgIHNQYXJhbWV0ZXJOYW1lLFxuICAgIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IHNVUkxWYXJpYWJsZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzUGFyYW1ldGVyTmFtZSA9IHNVUkxWYXJpYWJsZXNbaV0uc3BsaXQoJz0nKTtcblxuICAgIGlmIChzUGFyYW1ldGVyTmFtZVswXSA9PT0gc1BhcmFtKSB7XG4gICAgICAgIHJldHVybiBzUGFyYW1ldGVyTmFtZVsxXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHNQYXJhbWV0ZXJOYW1lWzFdO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaHVmZmxlQXJyYXkoYXJyYXkpIHtcbiAgZm9yICh2YXIgaSA9IGFycmF5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICB2YXIgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgIHZhciB0ZW1wID0gYXJyYXlbaV07XG4gICAgYXJyYXlbaV0gPSBhcnJheVtqXTtcbiAgICBhcnJheVtqXSA9IHRlbXA7XG4gIH1cbn1cblxuZnVuY3Rpb24gdGltZUNvbnZlcnRlcihVTklYX3RpbWVzdGFtcCl7XG4gIHZhciBhID0gbmV3IERhdGUoVU5JWF90aW1lc3RhbXApO1xuICB2YXIgbW9udGhzID0gWydKYW4nLCdGZWInLCdNYXInLCdBcHInLCdNYXknLCdKdW4nLCdKdWwnLCdBdWcnLCdTZXAnLCdPY3QnLCdOb3YnLCdEZWMnXTtcbiAgdmFyIHllYXIgPSBhLmdldEZ1bGxZZWFyKCk7XG4gIHZhciBtb250aCA9IG1vbnRoc1thLmdldE1vbnRoKCldO1xuICB2YXIgZGF0ZSA9IGEuZ2V0RGF0ZSgpO1xuICB2YXIgdGltZSA9IGRhdGUgKyAnICcgKyBtb250aCArICcgJyArIHllYXI7XG4gIHJldHVybiB0aW1lO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRCeXRlcyhhLGIpe2lmKDA9PWEpcmV0dXJuXCIwIGJ5dGVzXCI7dmFyIGM9MTAyNCxkPWJ8fDIsZT1bXCJieXRlc1wiLFwia2JcIixcIm1iXCIsXCJnYlwiLFwidGJcIixcInBiXCIsXCJlYlwiLFwiemJcIixcInliXCJdLGY9TWF0aC5mbG9vcihNYXRoLmxvZyhhKS9NYXRoLmxvZyhjKSk7cmV0dXJuIHBhcnNlRmxvYXQoKGEvTWF0aC5wb3coYyxmKSkudG9GaXhlZChkKSkrZVtmXX1cblxuZnVuY3Rpb24gdXBkYXRlRmlsZXNpemVQdWJMZWZ0KGRhdGEpIHtcbiAgZmlsZXNpemVQdWJMZWZ0ID0gZmlsZXNpemVQdWJMZWZ0IC0gZGF0YS5sZW5ndGhcbiAgaWYgKGZpbGVzaXplUHViTGVmdCA+IDApIHtcbiAgICAkKCcuZmlsZXNpemVQdWJMZWZ0JykudGV4dCggZm9ybWF0Qnl0ZXMoZmlsZXNpemVQdWJMZWZ0KSArICcgJyApXG4gIH0gZWxzZSB7XG4gICAgJCgnLmZpbGVzaXplUHViTGVmdCcpLnRleHQoICcwbWIgJyApXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudChlbGVtZW50LCBtb3VzZVBvcykge1xuICBmdW5jdGlvbiBjaHVua1N0cmluZyhzdHIsIGxlbmd0aCkge1xuICAgIHJldHVybiBzdHIubWF0Y2gobmV3IFJlZ0V4cCgney4xLCcgKyBsZW5ndGggKyAnfScsICdnJykpO1xuICB9XG5cdHZhciB0aGVNb3VzZVBvcyA9IG1vdXNlUG9zXG5cdGlmIChlbGVtZW50LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSkge1xuXHRcdGZhYnJpYy5JbWFnZS5mcm9tVVJMKGVsZW1lbnQuZGF0YSwgZnVuY3Rpb24obXlJbWcsIGNhbGxiYWNrKSB7XG4gXHRcdFx0dmFyIGltZyA9IG15SW1nLnNldCh7IGxlZnQ6IDAsIHRvcDogMCwgd2lkdGg6IG15SW1nLndpZHRoLCBoZWlnaHQ6IG15SW1nLmhlaWdodH0pO1xuIFx0XHRcdGlmICggaW1nLndpZHRoID4gY2FudmFzZXNbZWxlbWVudC5wYWdlXS53aWR0aCApIHtcbiBcdFx0XHRcdGltZy5zY2FsZVRvV2lkdGgoY2FudmFzZXNbZWxlbWVudC5wYWdlXS53aWR0aCAvIDEwMCAqIDUwICk7IC8vIDUwJSBvZiB0aGUgY2FudmFzXG4gXHRcdFx0fVxuIFx0XHRcdGltZy5sZWZ0ID0gdGhlTW91c2VQb3MueFxuIFx0XHRcdGltZy50b3AgPSB0aGVNb3VzZVBvcy55XG4gXHRcdFx0aW1nLm9uKCdhZGRlZCcsIGZ1bmN0aW9uKCkge1xuIFx0XHRcdFx0Y2FsbGJhY2tcbiBcdFx0XHR9KVxuIFx0XHRcdGNhbnZhc2VzW2VsZW1lbnQucGFnZV0uYWRkKGltZylcblx0XHR9KVxuXHR9IGVsc2Uge1xuXHRcdHZhciBkZUJhc2VkVGV4dCA9IGF0b2IoZWxlbWVudC5kYXRhLnN1YnN0cmluZygyMykpO1xuICAgIGNodW5rcyA9IGRlQmFzZWRUZXh0Lm1hdGNoKG5ldyBSZWdFeHAoJygufFtcXHJcXG5dKXsxLCcgKyB0ZXh0Q2h1bmtzTGVuZ3RoICsgJ30nLCAnZycpKVxuICAgIHZhciBjdXJyUGFnZSA9IHBhcnNlSW50KCBlbGVtZW50LnBhZ2Uuc3Vic3RyKGVsZW1lbnQucGFnZS5sZW5ndGggLSAxKSApXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaHVua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChjYW52YXNlc1sncCcgKyAoY3VyclBhZ2UgKyBpKV0pIHtcbiAgICAgICAgY2FudmFzZXNbJ3AnICsgKGN1cnJQYWdlICsgaSldLmFkZChuZXcgZmFicmljLlRleHRib3goY2h1bmtzW2ldLCB7XG4gICAgICAgICAgZm9udEZhbWlseTogJ0hlbHZldGljYScsXG4gICAgICAgICAgbGVmdDogMjAsXG4gICAgICAgICAgdG9wOiAyMCxcbiAgICAgICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICAgICAgZmlsbDogZm9udENvbG9yLFxuICAgICAgICAgIHdpZHRoOiA0MTAsXG4gICAgICAgICAgYnJlYWtXb3JkczogdHJ1ZSxcbiAgICAgICAgICBvcmlnaW5YOiAnbGVmdCcsXG4gICAgICAgICAgb3JpZ2luWTogJ3RvcCdcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfVxuXHR9XG59XG5cblxuLy8gLS0tIGluaXRpYWxpemUgY2FudmFzZXNcbnZhciBjYW52YXNlcyA9IHt9XG52YXIgZmlsZXNpemVQdWJMZWZ0ID0gbWF4UHVibGljYXRpb25TaXplXG5sZXQgdGl0bGVcbmxldCBhdXRob3JzXG5sZXQgcHViRGF0ZVxubGV0IGNvdmVyTGluZVxubGV0IGlzTG9ja2VkRWRpdGluZyA9IGZhbHNlXG5mdW5jdGlvbiBpbml0Q2FudmFzZXMoKSB7XG4gIGZhYnJpYy5PYmplY3QucHJvdG90eXBlLm9yaWdpblggPSBmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5vcmlnaW5ZID0gJ2NlbnRlcicgLy8gb3JpZ2luIGF0IHRoZSBjZW50ZXJcbiAgLy8gY3V0b21pemVkIGNvbnRyb2xzXG4gIGZhYnJpYy5PYmplY3QucHJvdG90eXBlLmJvcmRlckNvbG9yID0gZmFicmljLk9iamVjdC5wcm90b3R5cGUuY29ybmVyQ29sb3IgPSAnI2NjYydcbiAgZmFicmljLk9iamVjdC5wcm90b3R5cGUuY29ybmVyU2l6ZSA9IDhcblxuXHQkKCdjYW52YXMnKS5lYWNoKGZ1bmN0aW9uKGkpIHtcblx0XHRjYW52YXMgPSBuZXcgZmFicmljLkNhbnZhcyh0aGlzKTtcblx0ICBjYW52YXMuc2V0V2lkdGgoICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS53aWR0aCgpICk7XG5cdFx0Y2FudmFzLnNldEhlaWdodCggJCh0aGlzKS5jbG9zZXN0KCcucGFnZScpLmhlaWdodCgpICk7XG4gICAgY2FudmFzLmJhY2tncm91bmRDb2xvciA9ICd3aGl0ZSc7XG4gICAgY2FudmFzLmlkID0gJ3AnICsgKGkrMSk7XG5cblx0XHRjYW52YXNlc1sncCcgKyAoaSArIDEpXSA9IGNhbnZhcztcblxuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpID49IDApIHsgLy8gaWYgIHNhdmVkXG4gICAgICBjYW52YXMuc2VsZWN0aW9uID0gZmFsc2VcbiAgICB9XG5cblx0fSk7XG4gIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpIDwgMCkgeyAvLyBpZiBub3Qgc2F2ZWRcblxuICAgIC8vIHRpdGxlXG4gIFx0dGl0bGUgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBUaXRsZScsIHtcbiAgXHQgIHRvcDogMTIwLFxuICBcdCAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybycsXG4gIFx0ICBmaWxsOiAnIzc3NycsXG4gIFx0ICBsaW5lSGVpZ2h0OiAxLjEsXG4gIFx0ICBmb250U2l6ZTogMzAsXG4gIFx0ICBmb250V2VpZ2h0OiAnYm9sZCcsXG4gIFx0ICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICBcdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuICBcdCAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXG4gIFx0ICBob3ZlckN1cnNvcjogJ2RlZmF1bHQnLFxuICBcdCAgb3JpZ2luWDogJ2xlZnQnLFxuICBcdCAgb3JpZ2luWTogJ3RvcCcsXG4gICAgICBpZDogJ2xvY2snLFxuICAgICAgY2FjaGU6IGZhbHNlXG4gIFx0fSkub24oJ2VkaXRpbmc6ZW50ZXJlZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aGlzLnRleHQgPT0gJ0luc2VydCBUaXRsZScpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJydcbiAgICAgICAgdGhpcy5oaWRkZW5UZXh0YXJlYS52YWx1ZSA9ICcnXG4gICAgICB9XG4gICAgICBpc0xvY2tlZEVkaXRpbmcgPSB0cnVlXG4gICAgfSkub24oJ2NoYW5nZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBQdWJsaWNhdGlvbi50aXRsZSA9IHRoaXMudGV4dC5yZXBsYWNlKC88L2csIFwiJmx0O1wiKS5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKSAvLyBwcmV2ZW50IGNvZGUgaW5qZWN0aW9uXG4gICAgICB0aGlzLnRleHQgPSB0aGlzLnRleHQucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIilcbiAgICB9KS5vbignZWRpdGluZzpleGl0ZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnNlbGVjdGFibGUgPSBmYWxzZVxuICAgICAgaXNMb2NrZWRFZGl0aW5nID0gZmFsc2VcbiAgICAgIGlmICh0aGlzLnRleHQgPT0gJycpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJ0luc2VydCBUaXRsZSdcbiAgICAgIH1cbiAgICB9KVxuICBcdGNhbnZhc2VzWydwMSddLmFkZCh0aXRsZSlcblxuICAgIC8vIGxpbmVcbiAgXHR2YXIgbGluZUxlbmdodCA9IDI1MFxuICBcdGNvdmVyTGluZSA9IG5ldyBmYWJyaWMuTGluZShbMCwgMCwgbGluZUxlbmdodCwgMF0sIHtcbiAgXHRcdGxlZnQ6ICggY2FudmFzZXNbJ3AxJ10ud2lkdGggLSBsaW5lTGVuZ2h0KSAvIDIsXG4gIFx0ICB0b3A6IDE2MCxcbiAgXHQgIHN0cm9rZTogJyMyMjInLFxuICBcdCAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXG4gIFx0IFx0b3JpZ2luWDogJ2xlZnQnLFxuICBcdCAgb3JpZ2luWTogJ3RvcCdcbiAgXHR9KVxuICAgIGNhbnZhc2VzWydwMSddLmFkZChjb3ZlckxpbmUpXG5cbiAgICAvLyBhdXRob3JzXG4gIFx0YXV0aG9ycyA9IG5ldyBmYWJyaWMuVGV4dGJveCgnSW5zZXJ0IEF1dGhvcnMnLCB7XG4gIFx0ICB0b3A6IDE4MCxcbiAgXHQgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8nLFxuICBcdCAgZmlsbDogJyM3NzcnLFxuICBcdCAgbGluZUhlaWdodDogMS4xLFxuICBcdCAgZm9udFNpemU6IDIwLFxuICBcdCAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgXHQgIHdpZHRoOiBjYW52YXNlc1sncDEnXS53aWR0aCxcbiAgXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxuICBcdCAgaG92ZXJDdXJzb3I6ICdkZWZhdWx0JyxcbiAgXHQgIG9yaWdpblg6ICdsZWZ0JyxcbiAgXHQgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJyxcbiAgICAgIGNhY2hlOiBmYWxzZVxuICBcdH0pLm9uKCdlZGl0aW5nOmVudGVyZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGhpcy50ZXh0ID09ICdJbnNlcnQgQXV0aG9ycycpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJydcbiAgICAgICAgdGhpcy5oaWRkZW5UZXh0YXJlYS52YWx1ZSA9ICcnXG4gICAgICB9XG4gICAgICBpc0xvY2tlZEVkaXRpbmcgPSB0cnVlXG4gICAgfSkub24oJ2NoYW5nZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBQdWJsaWNhdGlvbi5hdXRob3JzID0gdGhpcy50ZXh0LnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpIC8vIHByZXZlbnQgY29kZSBpbmplY3Rpb25cbiAgICAgIHRoaXMudGV4dCA9IHRoaXMudGV4dC5yZXBsYWNlKC88L2csIFwiJmx0O1wiKS5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKVxuICAgIH0pLm9uKCdlZGl0aW5nOmV4aXRlZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMuc2VsZWN0YWJsZSA9IGZhbHNlXG4gICAgICBpc0xvY2tlZEVkaXRpbmcgPSBmYWxzZVxuICAgICAgaWYgKHRoaXMudGV4dCA9PSAnJykge1xuICAgICAgICB0aGlzLnRleHQgPSAnSW5zZXJ0IEF1dGhvcnMnXG4gICAgICB9XG4gICAgfSlcbiAgICBjYW52YXNlc1sncDEnXS5hZGQoYXV0aG9ycylcblxuICAgIC8vIGRhdGVcbiAgICBwdWJEYXRlID0gbmV3IGZhYnJpYy5UZXh0KCB0aW1lQ29udmVydGVyKFB1YmxpY2F0aW9uLmRhdGUpLCB7XG4gICAgICB0b3A6IDYwMCxcbiAgICAgIGxlZnQ6IGNhbnZhc2VzWydwOCddLndpZHRoLzIsXG4gICAgICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvJyxcbiAgICAgIGZpbGw6ICcjNzc3JyxcbiAgICAgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgICAgIGZvbnRTaXplOiAxNCxcbiAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgICAgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gICAgICBvcmlnaW5YOiAnY2VudGVyJyxcbiAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJ1xuICAgIH0pXG4gICAgY2FudmFzZXNbJ3A4J10uYWRkKHB1YkRhdGUpO1xuICAgIC8vIGZhYnJpYy5JbWFnZS5mcm9tVVJMKGxvZ29Gb3RvY29sZWN0YW5pYUJhc2U2NCwgZnVuY3Rpb24oaW1nKXtcbiAgICAvLyAgIGltZy5oYXNCb3JkZXJzID0gZmFsc2U7XG4gICAgLy8gICBpbWcuaGFzQ29udHJvbHMgPSBmYWxzZTtcbiAgICAvLyAgIGltZy5zZWxlY3RhYmxlID0gZmFsc2U7XG4gICAgLy8gICBpbWcuc2NhbGUoMC4xMik7XG4gICAgLy8gICBpbWcubGVmdCA9IGNhbnZhc2VzWydwOCddLndpZHRoLzI7XG4gICAgLy8gICBpbWcudG9wID0gNTMwO1xuICAgIC8vICAgaW1nLmxvY2tNb3ZlbWVudFggPSB0cnVlO1xuICAgIC8vICAgaW1nLmxvY2tNb3ZlbWVudFkgPSB0cnVlO1xuICAgIC8vICAgaW1nLmxvY2tSb3RhdGlvbiA9IHRydWU7XG4gICAgLy8gICBpbWcuc2V0Q29udHJvbHNWaXNpYmlsaXR5ID0gZmFsc2U7XG4gICAgLy8gICBpbWcuaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgLy8gICBpbWcuaWQgPSAnbG9jayc7XG4gICAgLy8gICBjYW52YXNlc1sncDgnXS5hZGQoaW1nKTtcbiAgICAvLyB9KVxuICB9XG5cbiAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcblxuICAgIGNhbnZhc2VzW2NhbnZhc10ub24oJ21vdXNlOmRibGNsaWNrJywgZnVuY3Rpb24oZSkgeyAvLyBvbiBkb3VibGUgY2xpY2sgY3JlYXRlIHRleHRib3hcblxuICAgICAgb2JqID0gdGhpcy5nZXRBY3RpdmVPYmplY3QoKVxuICAgICAgaWYgKG9iaikge1xuICAgICAgICB2YXIgaXNFZGl0aW5nID0gb2JqLmlzRWRpdGluZ1xuICAgICAgfVxuICAgICAgaWYgKGlzTG9ja2VkRWRpdGluZyAhPSB0cnVlICYmICFvYmogJiYgdHlwZW9mIGlzRWRpdGluZyA9PSAndW5kZWZpbmVkJykgeyAvLyBpZiBub3QgZWRpdGluZyB0aXRsZSBhbmQgYXV0aG9ycyBhbmQgdGhlcmUgaXMgbm8gc2VsZWN0ZWQgb2JqZWN0IGFuZCBub3QgZWR0aW5nIGFueXRoaW5nIGVsc2VcbiAgICAgICAgdGV4dFdpZHRoID0gMjUwXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbW91c2VQb3MgPSBnZXRNb3VzZVBvcyh0aGlzKVxuICAgICAgICB9IGNhdGNoKGVycikgeyAvLyBmaXJlZm94IE5hTiBidWdcbiAgICAgICAgICB2YXIgbW91c2VQb3MgPSB7XG4gICAgICAgICAgICB4OiB0aGlzLndpZHRoIC8gMiAtIHRleHRXaWR0aC8yLFxuICAgICAgICAgICAgeTogdGhpcy5oZWlnaHQgLyAyLjVcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsb3JlbVRleHRib3ggPSBuZXcgZmFicmljLlRleHRib3gobG9yZW1JcHN1bSwge1xuICAgICAgICAgICAgZm9udEZhbWlseTogJ0hlbHZldGljYScsXG4gICAgICAgICAgICBsZWZ0OiBwYXJzZUludChtb3VzZVBvcy54KSwgLy8gdG8gYXZvaWQgYmx1clxuICAgICAgICAgICAgdG9wOiBwYXJzZUludChtb3VzZVBvcy55KSxcbiAgICAgICAgICAgIGZvbnRTaXplOiBmb250U2l6ZSxcbiAgICAgICAgICAgIGZpbGw6IGZvbnRDb2xvcixcbiAgICAgICAgICAgIHdpZHRoOiAyNTAsXG4gICAgICAgICAgICBicmVha1dvcmRzOiB0cnVlLFxuICAgICAgICAgICAgb3JpZ2luWDogJ2xlZnQnLFxuICAgICAgICAgICAgb3JpZ2luWTogJ3RvcCdcbiAgICAgICAgICB9KVxuICAgICAgICB0aGlzLmFkZChsb3JlbVRleHRib3gpXG4gICAgICAgIHNmeC5idXR0b24oKVxuICAgICAgfVxuXG4gICAgfSlcblxuICB9XG5cbiAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHsgLy8gd2hlbiBzZWxlY3RpbmcgYW4gb2JqZWN0LCBkZXNlbGVjdCBhbGwgdGhlIG9iamVjdHMgb24gb3RoZXIgY2FudmFzZXNcbiAgICBjYW52YXNlc1tjYW52YXNdLm9uKCdvYmplY3Q6c2VsZWN0ZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzQ2FudmFzID0gZS50YXJnZXQuY2FudmFzLmlkXG4gICAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgICBpZiAoY2FudmFzICE9PSBlLnRhcmdldC5jYW52YXMuaWQpIHtcbiAgICAgICAgICBjYW52YXNlc1tjYW52YXNdLmRpc2NhcmRBY3RpdmVPYmplY3QoKS5yZW5kZXJBbGwoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gICQoZG9jdW1lbnQpLmtleWRvd24oZnVuY3Rpb24oZSkgeyAvLyBkZWwgb3IgYmFja3NwYWNlIHRvIGRlbGV0ZVxuICAgIGlmKCBlLndoaWNoID09IDggfHwgZS53aGljaCA9PSA0Nikge1xuICAgICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgICAgb2JqID0gY2FudmFzZXNbY2FudmFzXS5nZXRBY3RpdmVPYmplY3QoKVxuICAgICAgICBpZiAob2JqKSB7XG4gICAgICAgICAgdmFyIGlzRWRpdGluZyA9IG9iai5pc0VkaXRpbmdcbiAgICAgICAgfVxuICAgICAgICBpZiAoIG9iaiAmJiBpc0VkaXRpbmcgIT0gdHJ1ZSApIHsgIC8vIHJlbW92aW5nIG9iamVjdFxuXG4gICAgICAgICAgY2FudmFzZXNbY2FudmFzXS5yZW1vdmUoY2FudmFzZXNbY2FudmFzXS5nZXRBY3RpdmVPYmplY3QoKSk7XG4gICAgICAgICAgY29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyByZW1vdmU6IHRydWUgfSlcblxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KVxuXG59XG5cblxuLy8gLS0tIE0tVi1DXG5cbnZhciBQdWJsaWNhdGlvbiA9IHtcblx0Ly8gYWxsIG91ciBzdGF0ZXNcblx0aWQ6IG1ha2VJZCgpLFxuXHR0aXRsZTogZGVmYXVsdFRpdGxlLFxuXHR0aW1lTGVmdDogdGltZUxlZnQsXG5cdGV4cGlyZWQ6IGZhbHNlLFxuXHRhdXRob3JzOiBkZWZhdWx0QXV0aG9ycyxcbiAgZGF0ZTogRGF0ZS5ub3coKSxcbiAgaW1hZ2VzQW1vdW50OiAwLFxuICB0ZXh0QW1vdW50OiAwLFxuICB0aW1lRWxhcHNlZDogMCxcbiAgYWNoaWV2ZW1lbnRzQW1vdW50OiAwLFxuXHRwYWdlczoge1xuXHRcdHAxOiB7fSxcblx0XHRwMjoge30sXG5cdFx0cDM6IHt9LFxuXHRcdHA0OiB7fSxcblx0XHRwNToge30sXG5cdFx0cDY6IHt9LFxuXHRcdHA3OiB7fSxcblx0XHRwODoge31cblx0fVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihQdWJsaWNhdGlvbiwgaW5wdXQpIHtcblx0aWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkgeyAvLyBub3QgZXhwaXJlZFxuXHRcdHNob3dUaW1lKFB1YmxpY2F0aW9uKVxuXHR9IGVsc2UgeyAgLy8gZXhwaXJlZFxuXHRcdHNob3dFeHBpcmVkKClcblx0fVxuXG5cdGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG5cdFx0c3dpdGNoICh0cnVlKSB7XG5cdFx0XHRjYXNlIGlucHV0LnJlbW92ZSA9PSB0cnVlOiAvLyBkZWxldGluZyBhbiBlbGVtZW50XG4gICAgICAgICAgYWRkVGltZSgtYm9udXNUaW1lKVxuICAgICAgICAgIGNyaXRpY1NheXMoJ1RoaW5rIHR3aWNlIG5leHQgdGltZS4uLicpXG5cdFx0XHRcdFx0YnJlYWtcbiAgICAgIGNhc2UgaW5wdXQuZGF0YSAmJlxuICAgICAgICBmaWxlc2l6ZVB1YkxlZnQgPD0gMDogLy8gcHVibGljYXRpb24gaXMgMTBtYlxuICAgICAgICAgIEVycm9yLnB1YlRvb0JpZygpXG4gICAgICAgICAgYWRkVGltZSgtYm9udXNUaW1lKVxuICAgICAgICAgIGNyaXRpY1NheXMoJ0Vub3VnaCEnKVxuICAgICAgICAgIGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0Ynl0ZUNvdW50KGlucHV0LmRhdGEpID4gbWF4RmlsZVNpemUgOiAvLyBmaWxlIHRvbyBiaWcgKDFtYilcblx0XHRcdFx0IFx0RXJyb3IudG9vQmlnKClcbiAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG4gICAgICAgICAgY3JpdGljU2F5cygnVGhpcyBpcyBub3QgYSBzZXJ2ZXIgZmFybS4nKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IGltYWdlXG5cbiAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UvZ2lmJykpIHsgLy8gbm90IGEgZ2lmXG5cbiAgXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zKTsgLy8gZHJvcCBlbGVtZW50XG5cbiAgICAgICAgICAgIHVwZGF0ZUZpbGVzaXplUHViTGVmdChpbnB1dC5kYXRhKVxuXG4gICAgICAgICAgICBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKz0gMSAvLyBhY2hpZXZlbWVudCBldmVyeSB4IGltZ3NcbiAgICAgICAgICAgIGlmIChQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQlYWNoaWV2ZW1lbnRTcGFuID09IDApIHtcbiAgICAgICAgICAgICAgYWNoaWV2ZW1lbnQoMTAwICogUHVibGljYXRpb24uaW1hZ2VzQW1vdW50LCBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKyAnIGltYWdlcyBhZGRlZCEnKVxuICAgICAgICAgICAgICBQdWJsaWNhdGlvbi5hY2hpZXZlbWVudHNBbW91bnQgKz0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCA9PSAzKSB7IC8vIHNhdmUgcHViIGFmdGVyIGxvYWRpbmcgMyBpbWFnZXNcbiAgICAgICAgICAgICAgJCgnI2RvbmUnKS5jc3MoJ2Rpc3BsYXknLCdpbmxpbmUtYmxvY2snKVxuICAgICAgICAgICAgICBjcml0aWNTYXlzKCdZb3UgY2FuIG5vdyBzYXZlIHlvdXIgcHVibGljYXRpb24hJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHN0YXJ0IGRpc3J1cHRpb25zIGFmdGVyIGZpcnN0IGltYWdlXG4gICAgICAgICAgICBpZiAoICBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgPT0gMSAmJlxuICAgICAgICAgICAgICAgICAgZ2V0VXJsUGFyYW1ldGVyKCdkaXNydXB0aW9ucycpICE9ICdmYWxzZScgJiZcbiAgICAgICAgICAgICAgICAgIGRpc3J1cHRpb25zT24gPT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgICAgdHlwZW9mIHkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHsgLy8gbGF1bmNoIGEgcmFuZG9tIGRpc3J1cHRpb25cbiAgICAgICAgICAgICAgICBkaXNydXB0aW9ucyA9IE9iamVjdC5rZXlzKERpc3J1cHRpb24pXG4gICAgICAgICAgICAgICAgRGlzcnVwdGlvbltkaXNydXB0aW9uc1sgZGlzcnVwdGlvbnMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV0oKVxuICAgICAgICAgICAgICAgIHNoYWtlKHBhZ2VzKVxuICAgICAgICAgICAgICAgIHNmeC5kaXNydXB0aW9uKClcbiAgICAgICAgICAgICAgfSwgZGlzcnVwdGlvbkludGVydmFsKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhZGRUaW1lKGJvbnVzVGltZSlcbiAgXHRcdFx0XHRcdGNyaXRpY1NheXMoKVxuXG4gICAgICAgICAgfSBlbHNlIHsgLy8gYSBnaWZcbiAgICAgICAgICAgIEVycm9yLm5vR2lmcygpXG4gICAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG4gICAgICAgICAgfVxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyB0ZXh0XG5cbiAgICAgICAgICB2YXIgZGVCYXNlZElucHV0ID0gYXRvYihpbnB1dC5kYXRhLnN1YnN0cmluZygyMykpO1xuICAgICAgICAgIGlmIChkZUJhc2VkSW5wdXQuaW5jbHVkZXMoJzxzY3JpcHQ+JykpIHsgLy8gY29kZSBpbmplY3Rpb25cblxuICAgICAgICAgICAgRXJyb3IuY29kZUluamVjdGlvbigpXG4gICAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG4gICAgICAgICAgICBjcml0aWNTYXlzKCdZb3UgZGVzZXJ2ZSB0byBiZSBwdW5pc2hlZC4nKVxuXG4gICAgICAgICAgfSBlbHNlIHtcblxuICBcdFx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQubW91c2VQb3MpIC8vIGRyb3AgZWxlbWVudFxuXG4gICAgICAgICAgICB1cGRhdGVGaWxlc2l6ZVB1YkxlZnQoaW5wdXQuZGF0YSlcblxuICAgICAgICAgICAgUHVibGljYXRpb24udGV4dEFtb3VudCArPSBpbnB1dC5kYXRhLmxlbmd0aFxuICAgICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLnRleHRBbW91bnQgPj0gNTAwKSB7XG4gICAgICAgICAgICAgIGFjaGlldmVtZW50KDUwMCwgJ01vcmUgdGhhbiA1MDAgY2hhcmFjdGVycyBhZGRlZCcpXG4gICAgICAgICAgICAgIFB1YmxpY2F0aW9uLmFjaGlldmVtZW50c0Ftb3VudCArPSAxXG4gICAgICAgICAgICB9XG5cbiAgXHRcdFx0XHRcdGFkZFRpbWUoYm9udXNUaW1lICogMilcbiAgICAgICAgICAgIGNyaXRpY1NheXMoJ1RoaXMgaXMgZ29ubmEgYmUgYSBnb29vb29vZCByZWFkJylcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJyk6IC8vIG5laXRoZXIgYW4gaW1hZ2Ugbm9yIHRleHRcblx0XHRcdFx0XHRFcnJvci5ub3RBbGxvd2VkKClcbiAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQubW92ZSA9PSB0cnVlIDogLy8gbW92aW5nIG9yIHNjYWxpbmcgYW4gaW1hZ2Vcblx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dC5wYWdlXSA9IGNhbnZhc2VzW2lucHV0LnBhZ2VdLnRvSlNPTigpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH0gZWxzZSBpZiAoaW5wdXQgJiYgaW5wdXQubW92ZSAhPT0gdHJ1ZSAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IHRydWUpIHtcblx0XHQvLyB0b28gbGF0ZVxuXHRcdEVycm9yLnRvb0xhdGUoKTtcblx0fVxufVxuXG5cblxuXG5cbi8vIC0tLSBDT05UUk9MTEVSXG5cbnZhciB4O1xuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cdGluaXRDYW52YXNlcygpXG5cdG9uTW9kRWxlbWVudCgpXG5cdGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpIDwgMCkge1xuXHRcdC8vIGlmIG5vdCBhIHNhdmVkIHB1YmxpY2F0aW9uXG5cdFx0aWYgKCBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKSApIHsgLy8gZGlmZmljdWx0eVxuXHRcdFx0UHVibGljYXRpb24udGltZUxlZnQgPSB0aW1lU2V0ID0gZ2V0VXJsUGFyYW1ldGVyKCd0aW1lJylcblx0XHR9IGVsc2Uge1xuICAgICAgaW5maW5pdGVUaW1lID0gdHJ1ZVxuICAgIH1cblx0XHR4ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC0gMTA7XG4gICAgICBpZiAoaW5maW5pdGVUaW1lID09IGZhbHNlKSB7XG4gICAgICAgIFB1YmxpY2F0aW9uLnRpbWVFbGFwc2VkID0gcGFyc2VJbnQoICh0aW1lU2V0IC0gUHVibGljYXRpb24udGltZUxlZnQpIC8gMTAwMCApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBQdWJsaWNhdGlvbi50aW1lRWxhcHNlZCA9IDBcbiAgICAgIH1cblx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24pO1xuXHRcdH0sIDEwKVxuXHRcdG1vdXNlQ291bnRlcigpXG5cdH0gZWxzZSB7IC8vIHNhdmVkIHB1YmxpY2F0aW9uXG5cdFx0cmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pXG5cdH1cbn0pO1xuXG5mdW5jdGlvbiBhZGRUaW1lKGJvbnVzVGltZSkge1xuXHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICsgYm9udXNUaW1lO1xuXHRhbmltYXRldGltZWNvdW50ZXIoYm9udXNUaW1lLzEwMDApO1xuICBpZiAoYm9udXNUaW1lID49IDApIHtcbiAgICBzZnguYWRkVGltZVBsdXMoKVxuICB9IGVsc2Uge1xuICAgIHNmeC5hZGRUaW1lTWludXMoKVxuICB9XG59XG5cbi8vIG1vZGlmeSBlbGVtZW50IGxpc3RlbmVyXG5mdW5jdGlvbiBvbk1vZEVsZW1lbnQoKSB7XG5cdGZvciAodmFyIHBhZ2VJZCBpbiBjYW52YXNlcykge1xuXHRcdGNhbnZhc2VzWyBwYWdlSWQgXS5vbignb2JqZWN0Om1vZGlmaWVkJywgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgcGFyZW50Q2FudmFzSWQgPSBldnQudGFyZ2V0LmNhbnZhcy5sb3dlckNhbnZhc0VsLmlkXG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IG1vdmU6IHRydWUsIHBhZ2U6IHBhcmVudENhbnZhc0lkfSlcblx0XHR9KVxuXHR9XG59XG5cbi8vIGdldCBtb3VzZSBwb3NpdGlvbiBvbiBjYW52YXNcbmZ1bmN0aW9uIGdldE1vdXNlUG9zKGNhbnZhcywgZSkge1xuICB2YXIgcG9pbnRlciA9IGNhbnZhcy5nZXRQb2ludGVyKGUpXG4gIHZhciBwb3NYID0gcG9pbnRlci54XG4gIHZhciBwb3NZID0gcG9pbnRlci55XG4gIHJldHVybiB7XG4gICAgeDogcG9zWCxcbiAgICB5OiBwb3NZXG4gIH1cbn1cblxuY29uc3QgcGFnZXMgPSAkKCcucGFnZScpXG4vLyBkcm9wIGVsZW1lbnRcbnBhZ2VzLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKHRoaXMpLmFkZENsYXNzKCdkcm9wcGFibGUnKTtcbn0pO1xucGFnZXMub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKCcuZHJvcHBhYmxlJykucmVtb3ZlQ2xhc3MoJ2Ryb3BwYWJsZScpO1xufSk7XG5wYWdlcy5vbignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKCcuZHJvcHBhYmxlJykucmVtb3ZlQ2xhc3MoJ2Ryb3BwYWJsZScpO1xuXHR2YXIgZmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzO1xuXHR2YXIgeSA9IDA7XG5cdGZvciAodmFyIGkgPSBmaWxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0dmFyIHBhZ2VJZCA9ICQodGhpcykuZmluZCgnY2FudmFzJykuYXR0cignaWQnKTtcblx0XHRtb3VzZVBvcyA9IGdldE1vdXNlUG9zKGNhbnZhc2VzW3BhZ2VJZF0sIGUpXG5cdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdFx0XHRcdGRhdGE6IGV2ZW50LnRhcmdldC5yZXN1bHQsXG5cdFx0XHRcdFx0dmlzaWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRwYWdlOiBwYWdlSWQsXG5cdFx0XHRcdFx0bW91c2VQb3M6IG1vdXNlUG9zXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgeSAqIGRyb3BEZWxheSk7XG5cdFx0XHR5ICs9IDE7XG5cdFx0fVxuXHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGVzW2ldKVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn0pO1xuLy8gcHJldmVudCBkcm9wIG9uIGJvZHlcbiQoJ2JvZHknKS5vbignZHJhZ292ZXInLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKVxufSlcbiQoJ2JvZHknKS5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KClcbn0pXG4kKCdib2R5Jykub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKVxuICBzZnguZXJyb3IoKVxufSlcblxuXG5cblxuXG5cblxuLy8gLS0tIFZJRVdcblxuXG4vLyBUT0RPOiBtZXJnZSB0aGVzZSB0d29cbmZ1bmN0aW9uIHBhZChuLCBsZW4pIHtcbiAgcmV0dXJuIChuZXcgQXJyYXkobGVuICsgMSkuam9pbignMCcpICsgbikuc2xpY2UoLWxlbik7XG59XG5cblxuZnVuY3Rpb24gc2hvd1RpbWUoUHVibGljYXRpb24pIHtcblx0c2Vjb25kcyA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMTAwMDtcblx0JCgnI2NvdW50ZXInKS5zaG93KCk7XG5cdHZhciBtaW51dGVzID0gTWF0aC5mbG9vcihzZWNvbmRzIC8gNjApO1xuXHR2YXIgc2Vjb25kcyA9IHNlY29uZHMgJSA2MDtcblx0dmFyIG1zO1xuXHRpZiAoISFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpKSB7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgZCA9IG5ldyBEYXRlKCk7XG5cdFx0XHRtcyA9IGQuZ2V0TWlsbGlzZWNvbmRzKCk7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLmlubmVySFRNTCA9IHBhZChtaW51dGVzLCAyKSArICc6JyArIHBhZChzZWNvbmRzLnRvRml4ZWQoMCksIDIpICsgJzonICsgcGFkKG1zLnRvU3RyaW5nKCkuc3Vic3RyKDAsMiksIDIpICsgJyBsZWZ0ISc7XG5cdFx0XHRpZiAobWludXRlcyA8PSAwICYmIHNlY29uZHMgPD0gMjApIHtcblxuXHRcdFx0XHR2YXIgc2l6ZSA9ICgxLjM0NDQ0NDQ0IC0gKHNlY29uZHMgLyA2MCkpO1xuXHRcdFx0XHQkKCcuY291bnRlcicpLmNzcygndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyBzaXplICsgJyknKTtcblxuXHRcdFx0XHRzd2l0Y2ggKHNlY29uZHMpIHtcblx0XHRcdFx0XHRjYXNlIDU6XG5cdFx0XHRcdFx0XHRzZnguZXJyb3IoKVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRcdFx0c2Z4LmVycm9yKClcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRcdHNmeC5lcnJvcigpXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdFx0XHRzZnguZXJyb3IoKVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRcdFx0c2Z4LmVycm9yKClcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sIDEpXG5cdH0gZWxzZSB7XG5cdFx0Ly8gY29uc29sZS5sb2coJ2Vycm9yJyk7XG5cdH1cbn1cbmZ1bmN0aW9uIG1vdXNlQ291bnRlcigpIHtcblx0JChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXHRcdGlmIChlLnBhZ2VYID49ICQoZG9jdW1lbnQpLndpZHRoKCkgLyAyKSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCArIDIwLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG4gIGlmIChQdWJsaWNhdGlvbi5leHBpcmVkICE9IHRydWUpIHtcbiAgICBzb3VuZHRyYWNrLnN0b3AoKVxuICAgIFB1YmxpY2F0aW9uLmV4cGlyZWQgPSB0cnVlXG5cbiAgICAvLyBsb2NraW5nIGVsZW1lbnRzXG4gICAgbG9ja0VsZW1lbnRzKGFsbEVsZW1lbnRzKCkpXG4gICAgaWYgKHRpdGxlLnRleHQgPT0gJ0luc2VydCBUaXRsZScpIHtcbiAgICAgIHRpdGxlLnRleHQgPSBkZWZhdWx0VGl0bGVcbiAgICB9XG4gICAgaWYgKGF1dGhvcnMudGV4dCA9PSAnSW5zZXJ0IEF1dGhvcnMnKSB7XG4gICAgICBhdXRob3JzLnRleHQgPSBkZWZhdWx0QXV0aG9yc1xuICAgIH1cbiAgICB0aXRsZS5leGl0RWRpdGluZygpXG4gICAgYXV0aG9ycy5leGl0RWRpdGluZygpXG4gICAgdGl0bGUuc2VsZWN0YWJsZSA9IHRpdGxlLmF1dGhvcnMgPSBmYWxzZVxuICAgIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgICBjYW52YXNlc1tjYW52YXNdLnNlbGVjdGFibGUgPSBmYWxzZVxuICAgICAgY2FudmFzZXNbY2FudmFzXS5kaXNjYXJkQWN0aXZlT2JqZWN0KCkucmVuZGVyQWxsKClcbiAgICB9XG5cbiAgICBlbGVtZW50c0Ftb3VudCA9IDBcbiAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgZWxlbWVudHNBbW91bnQgPSBlbGVtZW50c0Ftb3VudCArIGNhbnZhc2VzW2NhbnZhc10uZ2V0T2JqZWN0cygpLmxlbmd0aFxuICAgIH1cbiAgICBpZiAoZWxlbWVudHNBbW91bnQgPD0gNSkge1xuICAgICAgJCgnLnRyeWFnYWluJykuY3NzKCdkaXNwbGF5JywnaW5saW5lLWJsb2NrJylcbiAgICAgICQoJy5zYXZlJykuaGlkZSgpXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIEVycm9yLm5vQ29udGVudCgpXG4gICAgICB9LCAyMDAwKVxuICAgIH0gZWxzZSB7XG5cbiAgICB9XG5cbiAgICBzaG93UHVibGljYXRpb25EYXRhKFB1YmxpY2F0aW9uKVxuXG4gICAgaWYgKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpICkge1xuICBcdCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICB9XG4gIFx0JCgnYm9keScpLmFkZENsYXNzKCdleHBpcmVkJylcbiAgXHRleHBpcmVkVGltZSgpXG4gICAgc2Z4LnBlcmlzaGVkKClcbiAgXHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgXHRcdCQoJy53cmFwcGVyJykuYWRkQ2xhc3MoJ3NhdmVkX3ZpZXcnKTtcbiAgXHRcdHNhdmVkU3RhdGUoKVxuICBcdH0sIDUwMClcbiAgXHRjbGVhckludGVydmFsKHgpIC8vIGNsZWFyIGNvbnRyb2xsZXJcbiAgICBpZiAodHlwZW9mIHkgIT09ICd1bmRlZmluZWQnKSB7IC8vIGlmIGRpc3J1cHRpb25zXG4gICAgICBjbGVhckludGVydmFsKHkpIC8vIGNsZWFyIGRpc3J1cHRpb25zXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRyb3BFbGVtZW50KHBhZ2VJZCwgZGF0YSwgbW91c2VQb3MpIHtcblx0dmFyIGVsZW1lbnQgPSB7IGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZCB9XG5cdHZhciBlbGVtZW50UG9zID0gY3JlYXRlRWxlbWVudChlbGVtZW50LCBtb3VzZVBvcylcbn1cblxuXG5cblxuXG5cblxuXG4vLyBlcnJvcnNcblxudmFyIEVycm9yID0ge1xuXHRub3RBbGxvd2VkOiBmdW5jdGlvbigpIHtcblx0XHRhbGVydE1lc3NhZ2UoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIG5vdCBhbGxvd2VkIScpXG5cdH0sXG5cdHRvb0JpZzogZnVuY3Rpb24oKSB7XG5cdFx0YWxlcnRNZXNzYWdlKCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyB0b28gYmlnIScpXG5cdH0sXG4gIHB1YlRvb0JpZzogZnVuY3Rpb24oKSB7XG4gICAgYWxlcnRNZXNzYWdlKCdZb3UgcmVhY2hlZCB0aGUgbGltaXQgb2YgMTBtYiBmb3IgdGhpcyBwdWJsaWNhdGlvbi4gWW91IGNhbiBzdGlsbCB3b3JrIG9uIHRoZSBsYXlvdXQgYW5kIHNhdmUgdGhlIHB1YmxpY2F0aW9uLicpXG4gIH0sXG4gIG5vR2lmczogZnVuY3Rpb24oKSB7XG4gICAgYWxlcnRNZXNzYWdlKCdHaWZzIGFyZSBub3QgYWxsb3dlZC4gKFRoaXMgc3Vja3MsIEkga25vdy4uLiknKVxuICB9LFxuXHR0b29MYXRlOiBmdW5jdGlvbigpIHtcblx0XHRhbGVydE1lc3NhZ2UoJ1RvbyBsYXRlIGFtaWdvJylcbiAgICBzZnguZXJyb3IoKVxuXHR9LFxuICBjb2RlSW5qZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICBhbGVydE1lc3NhZ2UoJ0hleSBoYWNrZXIsIHlvdVxcJ3JlIHRyeWluZyB0byBpbmplY3QgY29kZS4gUGxlYXNlIGRvblxcJ3QuJylcbiAgfSxcbiAgbm9Db250ZW50OiBmdW5jdGlvbigpIHtcbiAgICBhbGVydE1lc3NhZ2UoJ1lvdSBkaWRuXFwndCB1cGxvYWQgYW55IGltYWdlIG9yIHRleHQgOignKVxuICAgIHNmeC5lcnJvcigpXG4gIH1cbn1cblxuXG5cblxuXG4vLyAtLS0gU0FWRURcblxuZnVuY3Rpb24gc2hvd1B1YmxpY2F0aW9uRGF0YShQdWJsaWNhdGlvbikge1xuICAkKCcudGl0bGUnKS50ZXh0KCBQdWJsaWNhdGlvbi50aXRsZSApXG4gICQoJy5hdXRob3JzIHNwYW46bGFzdC1jaGlsZCcpLnRleHQoIFB1YmxpY2F0aW9uLmF1dGhvcnMgKVxuICAkKCcuZGF0ZSBzcGFuOmxhc3QtY2hpbGQnKS50ZXh0KCB0aW1lQ29udmVydGVyKCBOdW1iZXIoUHVibGljYXRpb24uZGF0ZSkpIClcbiAgJCgnLmltYWdlc2Ftb3VudCBzcGFuOmxhc3QtY2hpbGQnKS50ZXh0KCBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKVxuICAkKCcudGV4dGFtb3VudCBzcGFuOmxhc3QtY2hpbGQnKS50ZXh0KCBQdWJsaWNhdGlvbi50ZXh0QW1vdW50ICsgJyBjaGFycycgKVxuICAkKCcuZWxhcHNlZHRpbWUgc3BhbjpsYXN0LWNoaWxkJykudGV4dCggUHVibGljYXRpb24udGltZUVsYXBzZWQgKyAnIHMnIClcbiAgJCgnLmFjaGlldmVtZW50c2Ftb3VudCBzcGFuOmxhc3QtY2hpbGQnKS50ZXh0KCBQdWJsaWNhdGlvbi5hY2hpZXZlbWVudHNBbW91bnQgKVxufVxuXG5mdW5jdGlvbiByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbikge1xuICBmdW5jdGlvbiByZW5kZXJQYWdlKGltZywgY2FudmFzSWQpIHtcbiAgICBmYWJyaWMuSW1hZ2UuZnJvbVVSTChpbWcsIGZ1bmN0aW9uKGltZyl7XG4gICAgICAgIGltZy5oYXNCb3JkZXJzID0gZmFsc2U7XG4gICAgICAgIGltZy5oYXNDb250cm9scyA9IGZhbHNlO1xuICAgICAgICBpbWcuc2VsZWN0YWJsZSA9IGZhbHNlO1xuICAgICAgICBpbWcubGVmdCA9IGNhbnZhc2VzW2NhbnZhc0lkXS53aWR0aCAvIDI7XG4gICAgICAgIGltZy50b3AgPSBjYW52YXNlc1tjYW52YXNJZF0uaGVpZ2h0IC8gMjtcbiAgICAgICAgaW1nLnNjYWxlWCA9IGNhbnZhc2VzW2NhbnZhc0lkXS53aWR0aCAvIGltZy53aWR0aDtcbiAgICAgICAgaW1nLnNjYWxlWSA9IGNhbnZhc2VzW2NhbnZhc0lkXS5oZWlnaHQgLyBpbWcuaGVpZ2h0O1xuICAgICAgICBpbWcubG9ja01vdmVtZW50WCA9IHRydWU7XG4gICAgICAgIGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcbiAgICAgICAgaW1nLmxvY2tSb3RhdGlvbiA9IHRydWU7XG4gICAgICAgIGltZy5zZXRDb250cm9sc1Zpc2liaWxpdHkgPSBmYWxzZTtcbiAgICAgICAgaW1nLmlkID0gJ2xvY2snXG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5hZGQoaW1nKTtcbiAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbC5iaW5kKGNhbnZhc2VzW2NhbnZhc0lkXSlcbiAgICB9KVxuICB9XG4gIGZvciAodmFyIGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgcmVuZGVyUGFnZShQdWJsaWNhdGlvbi5wYWdlc1tjYW52YXNJZF0sIGNhbnZhc0lkKVxuICB9XG4gIHNob3dQdWJsaWNhdGlvbkRhdGEoUHVibGljYXRpb24pXG59XG5cblxuXG5cblxuLy8gLS0tIEJBQ0tFTkRcblxuLy8gc2F2ZSB0byBkYlxudmFyIHNhdmluZyA9IGZhbHNlXG5mdW5jdGlvbiBzYXZldG9EYihwdWJsaWNhdGlvbikge1xuICBpZiAoc2F2aW5nID09IGZhbHNlKSB7XG4gIFx0Zm9yICh2YXIgcGFnZSBpbiBQdWJsaWNhdGlvbi5wYWdlcykge1xuICAgICAgdmFyIG9yaWdpbldpZHRoID0gY2FudmFzZXNbcGFnZV0uZ2V0V2lkdGgoKTtcblxuICAgICAgZnVuY3Rpb24gem9vbSAod2lkdGgpIHtcbiAgICAgICAgdmFyIHNjYWxlID0gd2lkdGggLyBjYW52YXNlc1twYWdlXS5nZXRXaWR0aCgpO1xuICAgICAgICBoZWlnaHQgPSBzY2FsZSAqIGNhbnZhc2VzW3BhZ2VdLmdldEhlaWdodCgpO1xuXG4gICAgICAgIGNhbnZhc2VzW3BhZ2VdLnNldERpbWVuc2lvbnMoe1xuICAgICAgICAgICAgXCJ3aWR0aFwiOiB3aWR0aCxcbiAgICAgICAgICAgIFwiaGVpZ2h0XCI6IGhlaWdodFxuICAgICAgICB9KTtcblxuICAgICAgICBjYW52YXNlc1twYWdlXS5jYWxjT2Zmc2V0KCk7XG4gICAgICAgIHZhciBvYmplY3RzID0gY2FudmFzZXNbcGFnZV0uZ2V0T2JqZWN0cygpO1xuICAgICAgICBmb3IgKHZhciBpIGluIG9iamVjdHMpIHtcbiAgICAgICAgICAgIHZhciBzY2FsZVggPSBvYmplY3RzW2ldLnNjYWxlWDtcbiAgICAgICAgICAgIHZhciBzY2FsZVkgPSBvYmplY3RzW2ldLnNjYWxlWTtcbiAgICAgICAgICAgIHZhciBsZWZ0ID0gb2JqZWN0c1tpXS5sZWZ0O1xuICAgICAgICAgICAgdmFyIHRvcCA9IG9iamVjdHNbaV0udG9wO1xuXG4gICAgICAgICAgICBvYmplY3RzW2ldLnNjYWxlWCA9IHNjYWxlWCAqIHNjYWxlO1xuICAgICAgICAgICAgb2JqZWN0c1tpXS5zY2FsZVkgPSBzY2FsZVkgKiBzY2FsZTtcbiAgICAgICAgICAgIG9iamVjdHNbaV0ubGVmdCA9IGxlZnQgKiBzY2FsZTtcbiAgICAgICAgICAgIG9iamVjdHNbaV0udG9wID0gdG9wICogc2NhbGU7XG5cbiAgICAgICAgICAgIG9iamVjdHNbaV0uc2V0Q29vcmRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzZXNbcGFnZV0ucmVuZGVyQWxsKCk7XG4gICAgICB9XG4gICAgICB6b29tKGNhbnZhc1pvb20pXG5cbiAgICAgIFB1YmxpY2F0aW9uLnBhZ2VzW3BhZ2VdID0gY2FudmFzZXNbcGFnZV0udG9EYXRhVVJMKCdpbWFnZS9qcGVnJywgMSkgLy8gdXBkYXRlIGFsbCBwYWdlc1xuXG4gICAgICB6b29tIChvcmlnaW5XaWR0aCk7XG4gIFx0fVxuICAgICQoJy5idXR0b24uc2F2ZSAuc3R5bGl6ZWQnKS5odG1sKCdTYXZpbmcgPHNwYW4+Ljwvc3Bhbj48c3Bhbj4uPC9zcGFuPjxzcGFuPi48L3NwYW4+JykuYWRkQ2xhc3MoJ3NhdmluZycpLnJlbW92ZUNsYXNzKCdzdHlsaXplZCcpXG4gICAgJCgnLmJ1dHRvbi5zYXZlJykuY3NzKCdiYWNrZ3JvdW5kQ29sb3InLCAnI2VlZScpXG4gIFx0JC5hamF4KHtcbiAgXHRcdHVybDogJy9kYicsXG4gIFx0XHR0eXBlOiAncG9zdCcsIC8vIHBlcmZvcm1pbmcgYSBQT1NUIHJlcXVlc3RcbiAgXHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KFB1YmxpY2F0aW9uKSxcbiAgXHRcdGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gIFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuICBcdFx0c3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHNmeC5yZWFkeSgpXG4gICAgICAgICQoJy5idXR0b24uc2F2ZScpLmhpZGUoKVxuICAgICAgICAkKCcuYnV0dG9uLnBkZiwgLmJ1dHRvbi5ib29rbGV0JykuY3NzKCdkaXNwbGF5JywnaW5saW5lLWJsb2NrJylcblxuICAgICAgICAkKCcudGl0bGUnKS5lbXB0eSgpXG4gICAgICAgICQoJy5hY2hpZXZlbWVudHMgaDMnKS5hZGRDbGFzcygnYXJyb3dlZCcpXG4gICAgICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcbiAgICAgICAgJChhKS50ZXh0KFB1YmxpY2F0aW9uLnRpdGxlKS5hdHRyKFwiaHJlZlwiLCAnL3NhdmVkP2lkPScgKyBQdWJsaWNhdGlvbi5pZClcbiAgICAgICAgJChhKS5hcHBlbmRUbygkKCcudGl0bGUnKSlcblxuICBcdFx0XHRjb25zb2xlLmxvZygncHVibGljYXRpb24gc2VudCB0byBkYXRhYmFzZS4nKTtcbiAgXHRcdH1cbiAgXHR9KTtcbiAgXHRjb25zb2xlLmxvZygnc2F2ZWQ/aWQ9JyArIFB1YmxpY2F0aW9uLmlkKVxuICAgIHNhdmluZyA9IHRydWVcbiAgfVxufVxuXG5cblxuXG4vLyAtLS0gRElTUlVQVElPTlNcblxuXG5mdW5jdGlvbiBhbGxFbGVtZW50cyh0eXBlKSB7XG4gIHZhciBvYmpzID0gW11cbiAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICBpZiAodHlwZSkge1xuICAgICAgY2FudmFzT2JqcyA9IGNhbnZhc2VzW2NhbnZhc10uZ2V0T2JqZWN0cyh0eXBlKVxuICAgIH0gZWxzZSB7XG4gICAgICBjYW52YXNPYmpzID0gY2FudmFzZXNbY2FudmFzXS5nZXRPYmplY3RzKClcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IGNhbnZhc09ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGlmIChjYW52YXNPYmpzW2ldLmlkICE9ICdsb2NrJykgeyAvLyB1c2UgdGhpcyB0byBsb2NrXG4gICAgICAgIG9ianMucHVzaCggY2FudmFzT2Jqc1tpXSApXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmpzXG59XG5cbmZ1bmN0aW9uIGxvY2tFbGVtZW50cyhvYmpzKSB7XG4gIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgb2Jqc1tpXS5zZWxlY3RhYmxlID0gZmFsc2VcbiAgICBvYmpzW2ldLmhhc0NvbnRyb2xzID0gZmFsc2VcbiAgICBvYmpzW2ldLmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyQWxsQ2FudmFzZXMoKSB7XG4gIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsKClcbiAgfVxufVxuXG5mdW5jdGlvbiBmaWx0ZXJJbWdzKG9ianMsIGZpbHRlcikge1xuICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIG9ianNbaV0uZmlsdGVycy5wdXNoKGZpbHRlcilcbiAgICBvYmpzW2ldLmFwcGx5RmlsdGVycygpXG4gIH1cbiAgcmVuZGVyQWxsQ2FudmFzZXMoKVxufVxuXG52YXIgRGlzcnVwdGlvbiA9IHtcblx0Y29taWM6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9jb21pYyhvYmpzKSB7XG4gICAgICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBvYmpzW2ldLmZvbnRGYW1pbHkgPSAnXCJDb21pYyBTYW5zIE1TXCInXG4gICAgICB9XG4gICAgfVxuICAgIF9jb21pYyggYWxsRWxlbWVudHMoJ3RleHQnKSApXG4gICAgX2NvbWljKCBhbGxFbGVtZW50cygndGV4dGJveCcpIClcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnQ2FuXFwndCB5b3Ugc3BpY2UgdGhlIHR5cG9ncmFwaHkgYSBiaXQ/Jylcblx0fSxcblx0cm90YXRlSW1nc1JhbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9yb3RhdGVJbWdzUmFuZChvYmpzKSB7XG4gICAgICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBvYmpzW2ldLm9yaWdpblggPSAnY2VudGVyJ1xuICAgICAgICBvYmpzW2ldLm9yaWdpblkgPSAnY2VudGVyJ1xuICAgICAgICBvYmpzW2ldLmFuaW1hdGUoeyBhbmdsZTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSB9LCB7XG4gICAgICAgICAgZHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgb25DaGFuZ2U6IG9ianNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKG9ianNbaV0uY2FudmFzKSxcbiAgICAgICAgICBlYXNpbmc6IGZ1bmN0aW9uKHQsIGIsIGMsIGQpIHsgcmV0dXJuIGMqdC9kICsgYiB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIF9yb3RhdGVJbWdzUmFuZChhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICBjcml0aWNTYXlzKCdJIGZpbmQgdGhpcyBsYXlvdXQgYSBiaXQgc3RhdGljLi4uJylcblx0fSxcblx0bG9ja1JhbmRQYWdlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNhbnZhc2VzKVxuICAgIHJhbmRDYW52YXMgPSBjYW52YXNlc1trZXlzWyBrZXlzLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dXG5cdFx0cmFuZENhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZTtcblx0XHRmb3IgKG9iamVjdElkIGluIHJhbmRDYW52YXMuZ2V0T2JqZWN0cygpICkge1xuXHRcdFx0dmFyIG9iamVjdCA9IHJhbmRDYW52YXMuaXRlbShvYmplY3RJZClcblx0XHRcdG9iamVjdC5zZWxlY3RhYmxlID0gZmFsc2Vcblx0XHRcdG9iamVjdC5ob3ZlckN1cnNvciA9ICdkZWZhdWx0J1xuXHRcdH1cblx0XHRyYW5kQ2FudmFzLmFkZChuZXcgZmFicmljLkxpbmUoWzAsIDAsIHJhbmRDYW52YXMud2lkdGgsIHJhbmRDYW52YXMuaGVpZ2h0XSwge1xuXHQgIFx0c3Ryb2tlOiAncmVkJyxcblx0ICBcdHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIFx0c3Ryb2tlV2lkdGg6IDIsXG4gICAgICBob3ZlckN1cnNvcjonZGVmYXVsdCcsXG4gICAgICBpZDogJ2xvY2snXG5cdFx0fSkpXG5cdFx0cmFuZENhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICBjcml0aWNTYXlzKCdQYWdlICcgKyByYW5kQ2FudmFzLmlkWzFdICsgJyBpcyBub3cgbG9ja2VkLi4uJylcblx0fSxcbiAgc2h1ZmZsZVBhZ2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdG9TaHVmZmxlID0gW11cbiAgICB2YXIgaSA9IDBcbiAgICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoaSA+IDAgJiYgaSA8PSA2KSB7IC8vIHByZXZlbnQgc2h1ZmZsaW5nIGZpcnN0IHBhZ2VcbiAgICAgICAgdG9TaHVmZmxlLnB1c2goIGNhbnZhc2VzW2NhbnZhc0lkXS50b0pTT04oKSApXG4gICAgICB9XG4gICAgICBpICs9IDFcbiAgICB9XG4gICAgc2h1ZmZsZUFycmF5KHRvU2h1ZmZsZSlcbiAgICB2YXIgeSA9IDBcbiAgICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoeSA+IDAgJiYgeSA8PSA2KSB7XG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5sb2FkRnJvbUpTT04odG9TaHVmZmxlW3kgLSAxXSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbC5iaW5kKGNhbnZhc2VzW2NhbnZhc0lkXSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHkgKz0gMVxuICAgIH1cbiAgICBjcml0aWNTYXlzKCdUaGUgcnl0aG0gb2YgdGhpcyBwdWJsaWNhdGlvbiBpcyBhIGJpdCB3ZWFrLiBEb25cXCd0IHlvdSB0aGluaz8nKVxuICB9LFxuXHRhZHM6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNhbnZhc2VzKVxuICAgIHJhbmRDYW52YXMgPSBjYW52YXNlc1trZXlzWyBrZXlzLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dXG5cdFx0cmFuZENhbnZhcy5hZGQobmV3IGZhYnJpYy5SZWN0KHtcblx0XHRcdHdpZHRoOiByYW5kQ2FudmFzLndpZHRoLFxuXHRcdFx0aGVpZ2h0OiAzMCxcblx0XHRcdGZpbGw6ICcjMEQyMTNFJyxcblx0XHRcdGxvY2tNb3ZlbWVudFg6IHRydWUsXG5cdFx0XHRsb2NrTW92ZW1lbnRZOiB0cnVlLFxuXHRcdFx0bG9ja1JvdGF0aW9uOiB0cnVlLFxuXHRcdFx0aGFzQ29udHJvbHM6IGZhbHNlLFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG5cdFx0XHRsZWZ0OiByYW5kQ2FudmFzLndpZHRoLzIsXG5cdFx0XHR0b3A6IDE1LFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBpZDogJ2xvY2snXG5cdFx0fSkpO1xuXHRcdGZhYnJpYy5JbWFnZS5mcm9tVVJMKGtpbmtvQmFzZTY0LCBmdW5jdGlvbihpbWcpe1xuXHRcdFx0XHRpbWcuaGFzQm9yZGVycyA9IGZhbHNlO1xuXHRcdFx0XHRpbWcuaGFzQ29udHJvbHMgPSBmYWxzZTtcbiAgICAgICAgaW1nLnNlbGVjdGFibGUgPSBmYWxzZTtcblx0XHRcdFx0aW1nLnNjYWxlKDAuMik7XG5cdFx0XHRcdGltZy5sZWZ0ID0gcmFuZENhbnZhcy53aWR0aC0xMDA7XG5cdFx0XHRcdGltZy50b3AgPSA1MDtcblx0XHRcdFx0aW1nLmxvY2tNb3ZlbWVudFggPSB0cnVlO1xuXHRcdFx0XHRpbWcubG9ja01vdmVtZW50WSA9IHRydWU7XG5cdFx0XHRcdGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuXHRcdFx0XHRpbWcuc2V0Q29udHJvbHNWaXNpYmlsaXR5ID0gZmFsc2U7XG4gICAgICAgIGltZy5pZCA9ICdsb2NrJ1xuXHRcdFx0XHRyYW5kQ2FudmFzLmFkZChpbWcpO1xuXHRcdH0pXG4gICAgY3JpdGljU2F5cygnSSBmb3VuZCBhIHNwb25zb3IhJylcblx0fSxcbiAgaGFsZlRpbWU6IGZ1bmN0aW9uICgpIHtcbiAgICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMlxuICAgIGNyaXRpY1NheXMoJ1RoaXMgaXMgdGFraW5nIHRvbyBsb25nLi4uJylcbiAgfSxcbiAgZG91YmxlVGltZTogZnVuY3Rpb24gKCkge1xuICAgIFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgKiAyXG4gICAgY3JpdGljU2F5cygnVGFrZSB5b3VyIHRpbWUuLi4nKVxuICB9LFxuICBncmV5c2NhbGVJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuR3JheXNjYWxlKCkgKVxuICAgIGNyaXRpY1NheXMoJ1NoYWxsIHdlIG1ha2UgaXQgbG9vayBjbGFzc2ljPycpXG4gIH0sXG4gIGludmVydEltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5JbnZlcnQoKSApXG4gICAgY3JpdGljU2F5cygnVGhlIHZpc3VhbHMgbmVlZCBzb21lIGVkZ3kgY29sb3JzJylcbiAgfSxcbiAgc2VwaWFJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuU2VwaWEoKSApXG4gICAgY3JpdGljU2F5cygnRXZlciBoZWFyZCBvZiBJbnN0YWdyYW0/JylcbiAgfSxcbiAgYmxhY2t3aGl0ZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5CbGFja1doaXRlKCkgKVxuICAgIGNyaXRpY1NheXMoJ1RoaXMgc2hvdWxkIGxvb2sgbGlrZSBhIHppbmUhJylcbiAgfSxcbiAgcGl4ZWxhdGVJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuUGl4ZWxhdGUoe2Jsb2Nrc2l6ZTogMjB9KSApXG4gICAgY3JpdGljU2F5cygnSXNuXFwndCB0aGlzIGEgdmlkZW9nYW1lIGFmdGVyIGFsbD8nKVxuICB9LFxuICBub2lzZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5Ob2lzZSh7bm9pc2U6IDIwMH0pIClcbiAgICBjcml0aWNTYXlzKCdNQUtFIFNPTUUgTk9PSVNFISEnKVxuICB9LFxuICBmb250U2l6ZUJpZ2dlcjogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2ZvbnRTaXplQmlnZ2VyKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCgnZm9udFNpemUnLCBlbGVtZW50c1tpXS5mb250U2l6ZSAqIHNjYWxlRm9udCk7XG4gICAgICB9XG4gICAgfVxuICAgIF9mb250U2l6ZUJpZ2dlcihhbGxFbGVtZW50cygndGV4dGJveCcpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdDYW5cXCd0IHJlYWQgYW55dGhpbmcgOignKVxuICB9LFxuICBmb250U2l6ZVNtYWxsZXI6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9mb250U2l6ZVNtYWxsZXIoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KCdmb250U2l6ZScsIGVsZW1lbnRzW2ldLmZvbnRTaXplIC8gc2NhbGVGb250KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2ZvbnRTaXplU21hbGxlcihhbGxFbGVtZW50cygndGV4dGJveCcpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdJXFwnbSBub3QgYmxpbmQhJylcbiAgfSxcbiAgYmlnZ2VySW1nczogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2JpZ2dlckltZ3MoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBzY2FsZVk6IHNjYWxlVXBJbWdzLFxuICAgICAgICAgIHNjYWxlWDogc2NhbGVVcEltZ3NcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIF9iaWdnZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdCTE9XIFVQIScpXG4gIH0sXG4gIHNtYWxsZXJJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfc21hbGxlckltZ3MoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBzY2FsZVk6IHNjYWxlRG93bkltZ3MsXG4gICAgICAgICAgc2NhbGVYOiBzY2FsZURvd25JbWdzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBfc21hbGxlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0JMT1cgVVAhJylcbiAgfSxcbiAgbG9ja0FsbEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcbiAgICBsb2NrRWxlbWVudHMoYWxsRWxlbWVudHMoKSlcbiAgICBjcml0aWNTYXlzKCdUaGluZ3MgYXJlIHBlcmZlY3QgYXMgdGhleSBhcmUuJylcbiAgfSxcbiAgc2tld0FsbEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfc2tld0FsbEVsZW1lbnRzKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7XG4gICAgICAgICAgc2NhbGVZOiBzY2FsZVVwSW1ncyxcbiAgICAgICAgICBzY2FsZVg6IHNjYWxlVXBJbWdzLFxuICAgICAgICAgIHRyYW5zZm9ybU1hdHJpeDogWzEsIC41MCwgMCwgMSwgMCwgMF1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgX3NrZXdBbGxFbGVtZW50cyhhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnU3RyZXRjaCB0aG9zZSBpbWFnZXMsIGNvbWUgb24hJylcbiAgfSxcbiAgZmxpcEFsbEltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9mbGlwQWxsSW1ncyhlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIGFuZ2xlOiAnLTE4MCcsXG4gICAgICAgICAgZmxpcFk6IHRydWVcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgX2ZsaXBBbGxJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdGbGlwIHRob3NlIGltYWdlcywgY29tZSBvbiEnKVxuICB9LFxuICBiaXRMZWZ0Yml0UmlnaHRBbGxJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfYml0TGVmdGJpdFJpZ2h0QWxsSW1ncyhlbGVtZW50cywgZGlzdGFuY2UpIHtcbiAgICAgIHZhciBkdXJhdGlvbiA9IDIwMFxuICAgICAgdmFyIHBhdXNlID0gMTAwXG5cbiAgICAgIGZ1bmN0aW9uIGxlZnQxKGksIGVsZW1lbnRzKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBlbGVtZW50c1tpXS5hbmltYXRlKCdsZWZ0JywgZWxlbWVudHNbaV0ubGVmdCArIGRpc3RhbmNlICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApLCB7IC8vIGEgYml0IG9mIHJhbmRvbW5lc3MgdG8gbWFrZSBpdCBtb3JlIGh1bWFuXG4gICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApLFxuICAgICAgICAgICAgb25DaGFuZ2U6IGVsZW1lbnRzW2ldLmNhbnZhcy5yZW5kZXJBbGwuYmluZChlbGVtZW50c1tpXS5jYW52YXMpLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sIDApXG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBsZWZ0MihpLCBlbGVtZW50cykge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgZWxlbWVudHNbaV0uYW5pbWF0ZSgnbGVmdCcsIGVsZW1lbnRzW2ldLmxlZnQgKyBkaXN0YW5jZSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKSwge1xuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBlbGVtZW50c1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQoZWxlbWVudHNbaV0uY2FudmFzKSxcbiAgICAgICAgICB9KVxuICAgICAgICB9LCBkdXJhdGlvbiArIHBhdXNlKVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gcmlnaHQxKGksIGVsZW1lbnRzKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBlbGVtZW50c1tpXS5hbmltYXRlKCdsZWZ0JywgZWxlbWVudHNbaV0ubGVmdCAtIGRpc3RhbmNlIC0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApLCB7XG4gICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApLFxuICAgICAgICAgICAgb25DaGFuZ2U6IGVsZW1lbnRzW2ldLmNhbnZhcy5yZW5kZXJBbGwuYmluZChlbGVtZW50c1tpXS5jYW52YXMpLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sIChkdXJhdGlvbiArIHBhdXNlKSAqIDIgKVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gcmlnaHQyKGksIGVsZW1lbnRzKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBlbGVtZW50c1tpXS5hbmltYXRlKCdsZWZ0JywgZWxlbWVudHNbaV0ubGVmdCAtIGRpc3RhbmNlIC0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApLCB7XG4gICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApLFxuICAgICAgICAgICAgb25DaGFuZ2U6IGVsZW1lbnRzW2ldLmNhbnZhcy5yZW5kZXJBbGwuYmluZChlbGVtZW50c1tpXS5jYW52YXMpLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sIChkdXJhdGlvbiArIHBhdXNlKSAqIDMgKVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZWZ0MShpLCBlbGVtZW50cylcbiAgICAgICAgbGVmdDIoaSwgZWxlbWVudHMpXG4gICAgICAgIHJpZ2h0MShpLCBlbGVtZW50cylcbiAgICAgICAgcmlnaHQyKGksIGVsZW1lbnRzKVxuICAgICAgfVxuICAgIH1cbiAgICBfYml0TGVmdGJpdFJpZ2h0QWxsSW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgNzApXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0EgYml0IHRvIHRoZSByaWdodC4uLiBObyBubywgYSBiaXQgdG8gdGhlIGxlZnQuLi4nKVxuICB9LFxuICByaWdpZE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9yaWdpZE1vZGUoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBsb2NrTW92ZW1lbnRZOiB0cnVlLFxuICAgICAgICAgIGxvY2tSb3RhdGlvbjogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfcmlnaWRNb2RlKGFsbEVsZW1lbnRzKCdpbWFnZScpLCA3MClcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnUmVzcGVjdCB0aGUgZ3JpZCEnKVxuICB9LFxuICBiZXR0ZXJUaXRsZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRpdGxlcyA9IFtcbiAgICAgICdEb24gUXVpeG90ZScsXG4gICAgICAnSW4gU2VhcmNoIG9mIExvc3QgVGltZScsXG4gICAgICAnVWx5c3NlcycsXG4gICAgICAnVGhlIE9keXNzZXknLFxuICAgICAgJ1dhciBhbmQgUGVhY2UnLFxuICAgICAgJ01vYnkgRGljaycsXG4gICAgICAnVGhlIERpdmluZSBDb21lZHknLFxuICAgICAgJ0hhbWxldCcsXG4gICAgICAnVGhlIEdyZWF0IEdhdHNieScsXG4gICAgICAnVGhlIElsaWFkJ1xuICAgIF1cbiAgICB2YXIgcmFuZFRpdGxlID0gdGl0bGVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRpdGxlcy5sZW5ndGgpXVxuICAgIHRpdGxlLnRleHQgPSByYW5kVGl0bGVcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgUHVibGljYXRpb24udGl0bGUgPSByYW5kVGl0bGVcbiAgICBjcml0aWNTYXlzKCdJIHN1Z2dlc3QgYSBjYXRjaGllciB0aXRsZScpXG4gIH0sXG4gIGJldHRlckF1dGhvcnM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aGVfYXV0aG9ycyA9IFtcbiAgICAgICdMZW8gVG9sc3RveScsXG4gICAgICAnRnlvZG9yIERvc3RvZXZza3knLFxuICAgICAgJ1dpbGxpYW0gU2hha2VzcGVhcmUnLFxuICAgICAgJ0NoYXJsZXMgRGlja2VucycsXG4gICAgICAnSG9tZXInLFxuICAgICAgJ0ouIFIuIFIuIFRvbGtpZW4nLFxuICAgICAgJ0dlb3JnZSBPcndlbGwnLFxuICAgICAgJ0VkZ2FyIEFsbGFuIFBvZScsXG4gICAgICAnTWFyayBUd2FpbicsXG4gICAgICAnVmljdG9yIEh1Z28nXG4gICAgXVxuICAgIHZhciByYW5kQXV0aG9yID0gdGhlX2F1dGhvcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhlX2F1dGhvcnMubGVuZ3RoKV1cbiAgICBhdXRob3JzLnRleHQgPSByYW5kQXV0aG9yXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIFB1YmxpY2F0aW9uLmF1dGhvcnMgPSByYW5kQXV0aG9yXG4gICAgY3JpdGljU2F5cygnV2UgbmVlZCBhIHdlbGwta25vd24gdGVzdGltb25pYWwuJylcbiAgfSxcbiAgZHJhd2luZ01vZGU6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgICBjYW52YXNlc1tjYW52YXNdLmlzRHJhd2luZ01vZGUgPSB0cnVlXG4gICAgICBjYW52YXNlc1tjYW52YXNdLmJhY2tncm91bmRDb2xvciA9ICcjZmZmZmFhJ1xuICAgICAgY2FudmFzZXNbY2FudmFzXS5yZW5kZXJBbGwoKVxuICAgIH1cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgICAgY2FudmFzZXNbY2FudmFzXS5pc0RyYXdpbmdNb2RlID0gZmFsc2VcbiAgICAgICAgY2FudmFzZXNbY2FudmFzXS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2ZmZmZmZidcbiAgICAgICAgY2FudmFzZXNbY2FudmFzXS5yZW5kZXJBbGwoKVxuICAgICAgfVxuICAgIH0sIGRyYXdpbmdNb2RlVGltZSlcbiAgICBjcml0aWNTYXlzKCdEbyB5b3UgbGlrZSB0byBkcmF3PycpXG4gIH0sXG4gIGJsYWNrYm9hcmRNb2RlOiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgY2FudmFzZXNbY2FudmFzXS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzAwMDAwMCdcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10ucmVuZGVyQWxsKClcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGxFbGVtZW50cygndGV4dCcpLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhbGxFbGVtZW50cygndGV4dCcpW2ldLnNldCh7ZmlsbDogJyNmZmYnfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHdoaXRlVGV4dChlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe2ZpbGw6ICcjZmZmJ30pO1xuICAgICAgfVxuICAgIH1cbiAgICB3aGl0ZVRleHQoYWxsRWxlbWVudHMoJ3RleHRib3gnKSlcbiAgICB3aGl0ZVRleHQoW3RpdGxlLGF1dGhvcnMscHViRGF0ZV0pXG4gICAgZm9udENvbG9yID0gJyNmZmYnXG4gICAgdmFyIGxpbmVMZW5naHQgPSAyNTBcbiAgICBjb3ZlckxpbmUgPSBuZXcgZmFicmljLkxpbmUoWzAsIDAsIGxpbmVMZW5naHQsIDBdLCB7XG4gICAgICBsZWZ0OiAoIGNhbnZhc2VzWydwMSddLndpZHRoIC0gbGluZUxlbmdodCkgLyAyLFxuICAgICAgdG9wOiAxNjAsXG4gICAgICBzdHJva2U6ICcjZmZmJyxcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxuICAgICAgb3JpZ2luWDogJ2xlZnQnLFxuICAgICAgb3JpZ2luWTogJ3RvcCdcbiAgICB9KVxuICAgIGNhbnZhc2VzWydwMSddLmFkZChjb3ZlckxpbmUpIC8vIG5vdCBzdXJlIHdoeSBJIGNhbid0IHNpbXBseSBjaGFuZ2UgdGhlIHN0cm9rZVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdUaGluayBvZiB0aGUgcGFnZSBhcyBhIGJsYWNrYm9hcmQnKVxuICB9LFxuICBjbGFzc2lmaWVkTW9kZTogZnVuY3Rpb24oKSB7XG4gICAgZmFicmljLkltYWdlLmZyb21VUkwoY2xhc3NpZmllZEJhc2U2NCwgZnVuY3Rpb24oaW1nKXtcbiAgICAgIGltZy5oYXNCb3JkZXJzID0gZmFsc2U7XG4gICAgICBpbWcuaGFzQ29udHJvbHMgPSBmYWxzZTtcbiAgICAgIGltZy5zZWxlY3RhYmxlID0gZmFsc2U7XG4gICAgICBpbWcuc2NhbGUoMC44KTtcbiAgICAgIGltZy5sZWZ0ID0gY2FudmFzZXNbJ3AxJ10ud2lkdGggLyAyO1xuICAgICAgaW1nLnRvcCA9IDMwMDtcbiAgICAgIGltZy5sb2NrTW92ZW1lbnRYID0gdHJ1ZTtcbiAgICAgIGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcbiAgICAgIGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuICAgICAgaW1nLnNldENvbnRyb2xzVmlzaWJpbGl0eSA9IGZhbHNlO1xuICAgICAgaW1nLmlkID0gJ2xvY2snO1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhjYW52YXNlcylcbiAgICAgIHJhbmRDYW52YXMgPSBjYW52YXNlc1trZXlzWyBrZXlzLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dXG4gICAgICByYW5kQ2FudmFzLmFkZChpbWcpXG4gICAgfSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnVGhlIHB1YmxpYyBtdXN0IG5vdCBrbm93LicpXG4gIH1cbn1cbiJdLCJmaWxlIjoibWFpbi5qcyJ9
