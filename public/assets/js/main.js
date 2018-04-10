// --- DEFAULTS

var timeLeft = 99999999999999
var disruptionsOn = true
var dropDelay = 100
var disruptionInterval = 10000
var bonusTime = 5000
var textChunksLength = 1500
var fontSize = 13
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

      if (window.location.href.indexOf('saved') < 0) { // if it's not saved

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBERUZBVUxUU1xuXG52YXIgdGltZUxlZnQgPSA5OTk5OTk5OTk5OTk5OVxudmFyIGRpc3J1cHRpb25zT24gPSB0cnVlXG52YXIgZHJvcERlbGF5ID0gMTAwXG52YXIgZGlzcnVwdGlvbkludGVydmFsID0gMTAwMDBcbnZhciBib251c1RpbWUgPSA1MDAwXG52YXIgdGV4dENodW5rc0xlbmd0aCA9IDE1MDBcbnZhciBmb250U2l6ZSA9IDEzXG52YXIgZm9udENvbG9yID0gJyMwMDAnXG52YXIgc2NhbGVGb250ID0gMS41XG52YXIgc2NhbGVVcEltZ3MgPSAwLjdcbnZhciBzY2FsZURvd25JbWdzID0gMC43XG52YXIgYWNoaWV2ZW1lbnRTcGFuID0gM1xudmFyIGRyYXdpbmdNb2RlVGltZSA9IDEwMDAwXG52YXIgaW5maW5pdGVUaW1lID0gZmFsc2VcbnZhciBkZWZhdWx0VGl0bGUgPSAnVW50aXRsZWQnXG52YXIgZGVmYXVsdEF1dGhvcnMgPSAnQW5vbnltb3VzJ1xudmFyIGNhbnZhc1pvb20gPSA1NTBcbnZhciBtYXhGaWxlU2l6ZSA9IDEwNDg1NzYgKyA0MDAwMDAgLy8gMW1iICsgc29tZSBtYXJnaW5cbnZhciBtYXhQdWJsaWNhdGlvblNpemUgPSAxMDQ4NTc2MCAvLyAxMG1iXG5cblxubG9yZW1JcHN1bSA9ICdQcm9jZWR1cmFsaXplIHB1dCB5b3VyIGZlZWxlcnMgb3V0IGxlYW4gaW50byB0aGF0IHByb2JsZW0gb3IgY3Jvc3MtcG9sbGluYXRpb24sIG9yIHByZXRoaW5rLCBvciB3aGVlbGhvdXNlLiBWZXJ0aWNhbCBpbnRlZ3JhdGlvbiBoaWdobGlnaHRzIC4gRGVzaWduIHRoaW5raW5nIHNhY3JlZCBjb3csIHlldCByYWNlIHdpdGhvdXQgYSBmaW5pc2ggbGluZSBnb2FscG9zdHMuJ1xuXG5cbi8vIC0tLSBHRU5FUkFMIEZVTkNUSU9OU1xuXG5mdW5jdGlvbiBtYWtlSWQoKSB7XG5cdHZhciByYW5kTGV0dGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI2KSk7XG5cdHZhciBpZCA9IHJhbmRMZXR0ZXIgKyBEYXRlLm5vdygpO1xuXHRyZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIGJ5dGVDb3VudChzKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSShzKS5zcGxpdCgvJS4ufC4vKS5sZW5ndGggLSAxO1xufVxuXG52YXIgZ2V0VXJsUGFyYW1ldGVyID0gZnVuY3Rpb24gZ2V0VXJsUGFyYW1ldGVyKHNQYXJhbSkge1xuICB2YXIgc1BhZ2VVUkwgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpLFxuICAgIHNVUkxWYXJpYWJsZXMgPSBzUGFnZVVSTC5zcGxpdCgnJicpLFxuICAgIHNQYXJhbWV0ZXJOYW1lLFxuICAgIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IHNVUkxWYXJpYWJsZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzUGFyYW1ldGVyTmFtZSA9IHNVUkxWYXJpYWJsZXNbaV0uc3BsaXQoJz0nKTtcblxuICAgIGlmIChzUGFyYW1ldGVyTmFtZVswXSA9PT0gc1BhcmFtKSB7XG4gICAgICAgIHJldHVybiBzUGFyYW1ldGVyTmFtZVsxXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHNQYXJhbWV0ZXJOYW1lWzFdO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaHVmZmxlQXJyYXkoYXJyYXkpIHtcbiAgZm9yICh2YXIgaSA9IGFycmF5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICB2YXIgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgIHZhciB0ZW1wID0gYXJyYXlbaV07XG4gICAgYXJyYXlbaV0gPSBhcnJheVtqXTtcbiAgICBhcnJheVtqXSA9IHRlbXA7XG4gIH1cbn1cblxuZnVuY3Rpb24gdGltZUNvbnZlcnRlcihVTklYX3RpbWVzdGFtcCl7XG4gIHZhciBhID0gbmV3IERhdGUoVU5JWF90aW1lc3RhbXApO1xuICB2YXIgbW9udGhzID0gWydKYW4nLCdGZWInLCdNYXInLCdBcHInLCdNYXknLCdKdW4nLCdKdWwnLCdBdWcnLCdTZXAnLCdPY3QnLCdOb3YnLCdEZWMnXTtcbiAgdmFyIHllYXIgPSBhLmdldEZ1bGxZZWFyKCk7XG4gIHZhciBtb250aCA9IG1vbnRoc1thLmdldE1vbnRoKCldO1xuICB2YXIgZGF0ZSA9IGEuZ2V0RGF0ZSgpO1xuICB2YXIgdGltZSA9IGRhdGUgKyAnICcgKyBtb250aCArICcgJyArIHllYXI7XG4gIHJldHVybiB0aW1lO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRCeXRlcyhhLGIpe2lmKDA9PWEpcmV0dXJuXCIwIGJ5dGVzXCI7dmFyIGM9MTAyNCxkPWJ8fDIsZT1bXCJieXRlc1wiLFwia2JcIixcIm1iXCIsXCJnYlwiLFwidGJcIixcInBiXCIsXCJlYlwiLFwiemJcIixcInliXCJdLGY9TWF0aC5mbG9vcihNYXRoLmxvZyhhKS9NYXRoLmxvZyhjKSk7cmV0dXJuIHBhcnNlRmxvYXQoKGEvTWF0aC5wb3coYyxmKSkudG9GaXhlZChkKSkrZVtmXX1cblxuZnVuY3Rpb24gdXBkYXRlRmlsZXNpemVQdWJMZWZ0KGRhdGEpIHtcbiAgZmlsZXNpemVQdWJMZWZ0ID0gZmlsZXNpemVQdWJMZWZ0IC0gZGF0YS5sZW5ndGhcbiAgaWYgKGZpbGVzaXplUHViTGVmdCA+IDApIHtcbiAgICAkKCcuZmlsZXNpemVQdWJMZWZ0JykudGV4dCggZm9ybWF0Qnl0ZXMoZmlsZXNpemVQdWJMZWZ0KSArICcgJyApXG4gIH0gZWxzZSB7XG4gICAgJCgnLmZpbGVzaXplUHViTGVmdCcpLnRleHQoICcwbWIgJyApXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudChlbGVtZW50LCBtb3VzZVBvcykge1xuICBmdW5jdGlvbiBjaHVua1N0cmluZyhzdHIsIGxlbmd0aCkge1xuICAgIHJldHVybiBzdHIubWF0Y2gobmV3IFJlZ0V4cCgney4xLCcgKyBsZW5ndGggKyAnfScsICdnJykpO1xuICB9XG5cdHZhciB0aGVNb3VzZVBvcyA9IG1vdXNlUG9zXG5cdGlmIChlbGVtZW50LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSkge1xuXHRcdGZhYnJpYy5JbWFnZS5mcm9tVVJMKGVsZW1lbnQuZGF0YSwgZnVuY3Rpb24obXlJbWcsIGNhbGxiYWNrKSB7XG4gXHRcdFx0dmFyIGltZyA9IG15SW1nLnNldCh7IGxlZnQ6IDAsIHRvcDogMCwgd2lkdGg6IG15SW1nLndpZHRoLCBoZWlnaHQ6IG15SW1nLmhlaWdodH0pO1xuIFx0XHRcdGlmICggaW1nLndpZHRoID4gY2FudmFzZXNbZWxlbWVudC5wYWdlXS53aWR0aCApIHtcbiBcdFx0XHRcdGltZy5zY2FsZVRvV2lkdGgoY2FudmFzZXNbZWxlbWVudC5wYWdlXS53aWR0aCAvIDEwMCAqIDUwICk7IC8vIDUwJSBvZiB0aGUgY2FudmFzXG4gXHRcdFx0fVxuIFx0XHRcdGltZy5sZWZ0ID0gdGhlTW91c2VQb3MueFxuIFx0XHRcdGltZy50b3AgPSB0aGVNb3VzZVBvcy55XG4gXHRcdFx0aW1nLm9uKCdhZGRlZCcsIGZ1bmN0aW9uKCkge1xuIFx0XHRcdFx0Y2FsbGJhY2tcbiBcdFx0XHR9KVxuIFx0XHRcdGNhbnZhc2VzW2VsZW1lbnQucGFnZV0uYWRkKGltZylcblx0XHR9KVxuXHR9IGVsc2Uge1xuXHRcdHZhciBkZUJhc2VkVGV4dCA9IGF0b2IoZWxlbWVudC5kYXRhLnN1YnN0cmluZygyMykpO1xuICAgIGNodW5rcyA9IGRlQmFzZWRUZXh0Lm1hdGNoKG5ldyBSZWdFeHAoJygufFtcXHJcXG5dKXsxLCcgKyB0ZXh0Q2h1bmtzTGVuZ3RoICsgJ30nLCAnZycpKVxuICAgIHZhciBjdXJyUGFnZSA9IHBhcnNlSW50KCBlbGVtZW50LnBhZ2Uuc3Vic3RyKGVsZW1lbnQucGFnZS5sZW5ndGggLSAxKSApXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaHVua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChjYW52YXNlc1sncCcgKyAoY3VyclBhZ2UgKyBpKV0pIHtcbiAgICAgICAgY2FudmFzZXNbJ3AnICsgKGN1cnJQYWdlICsgaSldLmFkZChuZXcgZmFicmljLlRleHRib3goY2h1bmtzW2ldLCB7XG4gICAgICAgICAgZm9udEZhbWlseTogJ0hlbHZldGljYScsXG4gICAgICAgICAgbGVmdDogMjAsXG4gICAgICAgICAgdG9wOiAyMCxcbiAgICAgICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICAgICAgZmlsbDogZm9udENvbG9yLFxuICAgICAgICAgIHdpZHRoOiA0MTAsXG4gICAgICAgICAgYnJlYWtXb3JkczogdHJ1ZSxcbiAgICAgICAgICBvcmlnaW5YOiAnbGVmdCcsXG4gICAgICAgICAgb3JpZ2luWTogJ3RvcCdcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfVxuXHR9XG59XG5cblxuLy8gLS0tIGluaXRpYWxpemUgY2FudmFzZXNcbnZhciBjYW52YXNlcyA9IHt9XG52YXIgZmlsZXNpemVQdWJMZWZ0ID0gbWF4UHVibGljYXRpb25TaXplXG5sZXQgdGl0bGVcbmxldCBhdXRob3JzXG5sZXQgcHViRGF0ZVxubGV0IGNvdmVyTGluZVxubGV0IGlzTG9ja2VkRWRpdGluZyA9IGZhbHNlXG5mdW5jdGlvbiBpbml0Q2FudmFzZXMoKSB7XG4gIGZhYnJpYy5PYmplY3QucHJvdG90eXBlLm9yaWdpblggPSBmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5vcmlnaW5ZID0gJ2NlbnRlcicgLy8gb3JpZ2luIGF0IHRoZSBjZW50ZXJcbiAgLy8gY3V0b21pemVkIGNvbnRyb2xzXG4gIGZhYnJpYy5PYmplY3QucHJvdG90eXBlLmJvcmRlckNvbG9yID0gZmFicmljLk9iamVjdC5wcm90b3R5cGUuY29ybmVyQ29sb3IgPSAnI2NjYydcbiAgZmFicmljLk9iamVjdC5wcm90b3R5cGUuY29ybmVyU2l6ZSA9IDhcblxuXHQkKCdjYW52YXMnKS5lYWNoKGZ1bmN0aW9uKGkpIHtcblx0XHRjYW52YXMgPSBuZXcgZmFicmljLkNhbnZhcyh0aGlzKTtcblx0ICBjYW52YXMuc2V0V2lkdGgoICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS53aWR0aCgpICk7XG5cdFx0Y2FudmFzLnNldEhlaWdodCggJCh0aGlzKS5jbG9zZXN0KCcucGFnZScpLmhlaWdodCgpICk7XG4gICAgY2FudmFzLmJhY2tncm91bmRDb2xvciA9ICd3aGl0ZSc7XG4gICAgY2FudmFzLmlkID0gJ3AnICsgKGkrMSk7XG5cblx0XHRjYW52YXNlc1sncCcgKyAoaSArIDEpXSA9IGNhbnZhcztcblxuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpID49IDApIHsgLy8gaWYgIHNhdmVkXG4gICAgICBjYW52YXMuc2VsZWN0aW9uID0gZmFsc2VcbiAgICB9XG5cblx0fSk7XG4gIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpIDwgMCkgeyAvLyBpZiBub3Qgc2F2ZWRcblxuICAgIC8vIHRpdGxlXG4gIFx0dGl0bGUgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBUaXRsZScsIHtcbiAgXHQgIHRvcDogMTIwLFxuICBcdCAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybycsXG4gIFx0ICBmaWxsOiAnIzc3NycsXG4gIFx0ICBsaW5lSGVpZ2h0OiAxLjEsXG4gIFx0ICBmb250U2l6ZTogMzAsXG4gIFx0ICBmb250V2VpZ2h0OiAnYm9sZCcsXG4gIFx0ICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICBcdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuICBcdCAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXG4gIFx0ICBob3ZlckN1cnNvcjogJ2RlZmF1bHQnLFxuICBcdCAgb3JpZ2luWDogJ2xlZnQnLFxuICBcdCAgb3JpZ2luWTogJ3RvcCcsXG4gICAgICBpZDogJ2xvY2snLFxuICAgICAgY2FjaGU6IGZhbHNlXG4gIFx0fSkub24oJ2VkaXRpbmc6ZW50ZXJlZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aGlzLnRleHQgPT0gJ0luc2VydCBUaXRsZScpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJydcbiAgICAgICAgdGhpcy5oaWRkZW5UZXh0YXJlYS52YWx1ZSA9ICcnXG4gICAgICB9XG4gICAgICBpc0xvY2tlZEVkaXRpbmcgPSB0cnVlXG4gICAgfSkub24oJ2NoYW5nZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBQdWJsaWNhdGlvbi50aXRsZSA9IHRoaXMudGV4dC5yZXBsYWNlKC88L2csIFwiJmx0O1wiKS5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKSAvLyBwcmV2ZW50IGNvZGUgaW5qZWN0aW9uXG4gICAgICB0aGlzLnRleHQgPSB0aGlzLnRleHQucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIilcbiAgICB9KS5vbignZWRpdGluZzpleGl0ZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnNlbGVjdGFibGUgPSBmYWxzZVxuICAgICAgaXNMb2NrZWRFZGl0aW5nID0gZmFsc2VcbiAgICAgIGlmICh0aGlzLnRleHQgPT0gJycpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJ0luc2VydCBUaXRsZSdcbiAgICAgIH1cbiAgICB9KVxuICBcdGNhbnZhc2VzWydwMSddLmFkZCh0aXRsZSlcblxuICAgIC8vIGxpbmVcbiAgXHR2YXIgbGluZUxlbmdodCA9IDI1MFxuICBcdGNvdmVyTGluZSA9IG5ldyBmYWJyaWMuTGluZShbMCwgMCwgbGluZUxlbmdodCwgMF0sIHtcbiAgXHRcdGxlZnQ6ICggY2FudmFzZXNbJ3AxJ10ud2lkdGggLSBsaW5lTGVuZ2h0KSAvIDIsXG4gIFx0ICB0b3A6IDE2MCxcbiAgXHQgIHN0cm9rZTogJyMyMjInLFxuICBcdCAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXG4gIFx0IFx0b3JpZ2luWDogJ2xlZnQnLFxuICBcdCAgb3JpZ2luWTogJ3RvcCdcbiAgXHR9KVxuICAgIGNhbnZhc2VzWydwMSddLmFkZChjb3ZlckxpbmUpXG5cbiAgICAvLyBhdXRob3JzXG4gIFx0YXV0aG9ycyA9IG5ldyBmYWJyaWMuVGV4dGJveCgnSW5zZXJ0IEF1dGhvcnMnLCB7XG4gIFx0ICB0b3A6IDE4MCxcbiAgXHQgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8nLFxuICBcdCAgZmlsbDogJyM3NzcnLFxuICBcdCAgbGluZUhlaWdodDogMS4xLFxuICBcdCAgZm9udFNpemU6IDIwLFxuICBcdCAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgXHQgIHdpZHRoOiBjYW52YXNlc1sncDEnXS53aWR0aCxcbiAgXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxuICBcdCAgaG92ZXJDdXJzb3I6ICdkZWZhdWx0JyxcbiAgXHQgIG9yaWdpblg6ICdsZWZ0JyxcbiAgXHQgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJyxcbiAgICAgIGNhY2hlOiBmYWxzZVxuICBcdH0pLm9uKCdlZGl0aW5nOmVudGVyZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGhpcy50ZXh0ID09ICdJbnNlcnQgQXV0aG9ycycpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJydcbiAgICAgICAgdGhpcy5oaWRkZW5UZXh0YXJlYS52YWx1ZSA9ICcnXG4gICAgICB9XG4gICAgICBpc0xvY2tlZEVkaXRpbmcgPSB0cnVlXG4gICAgfSkub24oJ2NoYW5nZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBQdWJsaWNhdGlvbi5hdXRob3JzID0gdGhpcy50ZXh0LnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpIC8vIHByZXZlbnQgY29kZSBpbmplY3Rpb25cbiAgICAgIHRoaXMudGV4dCA9IHRoaXMudGV4dC5yZXBsYWNlKC88L2csIFwiJmx0O1wiKS5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKVxuICAgIH0pLm9uKCdlZGl0aW5nOmV4aXRlZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMuc2VsZWN0YWJsZSA9IGZhbHNlXG4gICAgICBpc0xvY2tlZEVkaXRpbmcgPSBmYWxzZVxuICAgICAgaWYgKHRoaXMudGV4dCA9PSAnJykge1xuICAgICAgICB0aGlzLnRleHQgPSAnSW5zZXJ0IEF1dGhvcnMnXG4gICAgICB9XG4gICAgfSlcbiAgICBjYW52YXNlc1sncDEnXS5hZGQoYXV0aG9ycylcblxuICAgIC8vIGRhdGVcbiAgICBwdWJEYXRlID0gbmV3IGZhYnJpYy5UZXh0KCB0aW1lQ29udmVydGVyKFB1YmxpY2F0aW9uLmRhdGUpLCB7XG4gICAgICB0b3A6IDYwMCxcbiAgICAgIGxlZnQ6IGNhbnZhc2VzWydwOCddLndpZHRoLzIsXG4gICAgICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvJyxcbiAgICAgIGZpbGw6ICcjNzc3JyxcbiAgICAgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgICAgIGZvbnRTaXplOiAxNCxcbiAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgICAgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gICAgICBvcmlnaW5YOiAnY2VudGVyJyxcbiAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJ1xuICAgIH0pXG4gICAgY2FudmFzZXNbJ3A4J10uYWRkKHB1YkRhdGUpO1xuICAgIC8vIGZhYnJpYy5JbWFnZS5mcm9tVVJMKGxvZ29Gb3RvY29sZWN0YW5pYUJhc2U2NCwgZnVuY3Rpb24oaW1nKXtcbiAgICAvLyAgIGltZy5oYXNCb3JkZXJzID0gZmFsc2U7XG4gICAgLy8gICBpbWcuaGFzQ29udHJvbHMgPSBmYWxzZTtcbiAgICAvLyAgIGltZy5zZWxlY3RhYmxlID0gZmFsc2U7XG4gICAgLy8gICBpbWcuc2NhbGUoMC4xMik7XG4gICAgLy8gICBpbWcubGVmdCA9IGNhbnZhc2VzWydwOCddLndpZHRoLzI7XG4gICAgLy8gICBpbWcudG9wID0gNTMwO1xuICAgIC8vICAgaW1nLmxvY2tNb3ZlbWVudFggPSB0cnVlO1xuICAgIC8vICAgaW1nLmxvY2tNb3ZlbWVudFkgPSB0cnVlO1xuICAgIC8vICAgaW1nLmxvY2tSb3RhdGlvbiA9IHRydWU7XG4gICAgLy8gICBpbWcuc2V0Q29udHJvbHNWaXNpYmlsaXR5ID0gZmFsc2U7XG4gICAgLy8gICBpbWcuaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgLy8gICBpbWcuaWQgPSAnbG9jayc7XG4gICAgLy8gICBjYW52YXNlc1sncDgnXS5hZGQoaW1nKTtcbiAgICAvLyB9KVxuICB9XG5cbiAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcblxuICAgIGNhbnZhc2VzW2NhbnZhc10ub24oJ21vdXNlOmRibGNsaWNrJywgZnVuY3Rpb24oZSkgeyAvLyBvbiBkb3VibGUgY2xpY2sgY3JlYXRlIHRleHRib3hcblxuICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPCAwKSB7IC8vIGlmIGl0J3Mgbm90IHNhdmVkXG5cbiAgICAgICAgb2JqID0gdGhpcy5nZXRBY3RpdmVPYmplY3QoKVxuICAgICAgICBpZiAob2JqKSB7XG4gICAgICAgICAgdmFyIGlzRWRpdGluZyA9IG9iai5pc0VkaXRpbmdcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNMb2NrZWRFZGl0aW5nICE9IHRydWUgJiYgIW9iaiAmJiB0eXBlb2YgaXNFZGl0aW5nID09ICd1bmRlZmluZWQnKSB7IC8vIGlmIG5vdCBlZGl0aW5nIHRpdGxlIGFuZCBhdXRob3JzIGFuZCB0aGVyZSBpcyBubyBzZWxlY3RlZCBvYmplY3QgYW5kIG5vdCBlZHRpbmcgYW55dGhpbmcgZWxzZVxuICAgICAgICAgIHRleHRXaWR0aCA9IDI1MFxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBtb3VzZVBvcyA9IGdldE1vdXNlUG9zKHRoaXMpXG4gICAgICAgICAgfSBjYXRjaChlcnIpIHsgLy8gZmlyZWZveCBOYU4gYnVnXG4gICAgICAgICAgICB2YXIgbW91c2VQb3MgPSB7XG4gICAgICAgICAgICAgIHg6IHRoaXMud2lkdGggLyAyIC0gdGV4dFdpZHRoLzIsXG4gICAgICAgICAgICAgIHk6IHRoaXMuaGVpZ2h0IC8gMi41XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbG9yZW1UZXh0Ym94ID0gbmV3IGZhYnJpYy5UZXh0Ym94KGxvcmVtSXBzdW0sIHtcbiAgICAgICAgICAgICAgZm9udEZhbWlseTogJ0hlbHZldGljYScsXG4gICAgICAgICAgICAgIGxlZnQ6IHBhcnNlSW50KG1vdXNlUG9zLngpLCAvLyB0byBhdm9pZCBibHVyXG4gICAgICAgICAgICAgIHRvcDogcGFyc2VJbnQobW91c2VQb3MueSksXG4gICAgICAgICAgICAgIGZvbnRTaXplOiBmb250U2l6ZSxcbiAgICAgICAgICAgICAgZmlsbDogZm9udENvbG9yLFxuICAgICAgICAgICAgICB3aWR0aDogMjUwLFxuICAgICAgICAgICAgICBicmVha1dvcmRzOiB0cnVlLFxuICAgICAgICAgICAgICBvcmlnaW5YOiAnbGVmdCcsXG4gICAgICAgICAgICAgIG9yaWdpblk6ICd0b3AnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIHRoaXMuYWRkKGxvcmVtVGV4dGJveClcbiAgICAgICAgICBzZnguYnV0dG9uKClcbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICB9KVxuXG4gIH1cblxuICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykgeyAvLyB3aGVuIHNlbGVjdGluZyBhbiBvYmplY3QsIGRlc2VsZWN0IGFsbCB0aGUgb2JqZWN0cyBvbiBvdGhlciBjYW52YXNlc1xuICAgIGNhbnZhc2VzW2NhbnZhc10ub24oJ29iamVjdDpzZWxlY3RlZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXNDYW52YXMgPSBlLnRhcmdldC5jYW52YXMuaWRcbiAgICAgIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgICAgIGlmIChjYW52YXMgIT09IGUudGFyZ2V0LmNhbnZhcy5pZCkge1xuICAgICAgICAgIGNhbnZhc2VzW2NhbnZhc10uZGlzY2FyZEFjdGl2ZU9iamVjdCgpLnJlbmRlckFsbCgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgJChkb2N1bWVudCkua2V5ZG93bihmdW5jdGlvbihlKSB7IC8vIGRlbCBvciBiYWNrc3BhY2UgdG8gZGVsZXRlXG4gICAgaWYoIGUud2hpY2ggPT0gOCB8fCBlLndoaWNoID09IDQ2KSB7XG4gICAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgICBvYmogPSBjYW52YXNlc1tjYW52YXNdLmdldEFjdGl2ZU9iamVjdCgpXG4gICAgICAgIGlmIChvYmopIHtcbiAgICAgICAgICB2YXIgaXNFZGl0aW5nID0gb2JqLmlzRWRpdGluZ1xuICAgICAgICB9XG4gICAgICAgIGlmICggb2JqICYmIGlzRWRpdGluZyAhPSB0cnVlICkgeyAgLy8gcmVtb3Zpbmcgb2JqZWN0XG5cbiAgICAgICAgICBjYW52YXNlc1tjYW52YXNdLnJlbW92ZShjYW52YXNlc1tjYW52YXNdLmdldEFjdGl2ZU9iamVjdCgpKTtcbiAgICAgICAgICBjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IHJlbW92ZTogdHJ1ZSB9KVxuXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbn1cblxuXG4vLyAtLS0gTS1WLUNcblxudmFyIFB1YmxpY2F0aW9uID0ge1xuXHQvLyBhbGwgb3VyIHN0YXRlc1xuXHRpZDogbWFrZUlkKCksXG5cdHRpdGxlOiBkZWZhdWx0VGl0bGUsXG5cdHRpbWVMZWZ0OiB0aW1lTGVmdCxcblx0ZXhwaXJlZDogZmFsc2UsXG5cdGF1dGhvcnM6IGRlZmF1bHRBdXRob3JzLFxuICBkYXRlOiBEYXRlLm5vdygpLFxuICBpbWFnZXNBbW91bnQ6IDAsXG4gIHRleHRBbW91bnQ6IDAsXG4gIHRpbWVFbGFwc2VkOiAwLFxuICBhY2hpZXZlbWVudHNBbW91bnQ6IDAsXG5cdHBhZ2VzOiB7XG5cdFx0cDE6IHt9LFxuXHRcdHAyOiB7fSxcblx0XHRwMzoge30sXG5cdFx0cDQ6IHt9LFxuXHRcdHA1OiB7fSxcblx0XHRwNjoge30sXG5cdFx0cDc6IHt9LFxuXHRcdHA4OiB7fVxuXHR9XG59O1xuXG5mdW5jdGlvbiBjb250cm9sbGVyKFB1YmxpY2F0aW9uLCBpbnB1dCkge1xuXHRpZiAoUHVibGljYXRpb24udGltZUxlZnQgPiAwKSB7IC8vIG5vdCBleHBpcmVkXG5cdFx0c2hvd1RpbWUoUHVibGljYXRpb24pXG5cdH0gZWxzZSB7ICAvLyBleHBpcmVkXG5cdFx0c2hvd0V4cGlyZWQoKVxuXHR9XG5cblx0aWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gZmFsc2UpIHtcblx0XHRzd2l0Y2ggKHRydWUpIHtcblx0XHRcdGNhc2UgaW5wdXQucmVtb3ZlID09IHRydWU6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcbiAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG4gICAgICAgICAgY3JpdGljU2F5cygnVGhpbmsgdHdpY2UgbmV4dCB0aW1lLi4uJylcblx0XHRcdFx0XHRicmVha1xuICAgICAgY2FzZSBpbnB1dC5kYXRhICYmXG4gICAgICAgIGZpbGVzaXplUHViTGVmdCA8PSAwOiAvLyBwdWJsaWNhdGlvbiBpcyAxMG1iXG4gICAgICAgICAgRXJyb3IucHViVG9vQmlnKClcbiAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG4gICAgICAgICAgY3JpdGljU2F5cygnRW5vdWdoIScpXG4gICAgICAgICAgYnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRieXRlQ291bnQoaW5wdXQuZGF0YSkgPiBtYXhGaWxlU2l6ZSA6IC8vIGZpbGUgdG9vIGJpZyAoMW1iKVxuXHRcdFx0XHQgXHRFcnJvci50b29CaWcoKVxuICAgICAgICAgIGFkZFRpbWUoLWJvbnVzVGltZSlcbiAgICAgICAgICBjcml0aWNTYXlzKCdUaGlzIGlzIG5vdCBhIHNlcnZlciBmYXJtLicpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0aW5wdXQudmlzaWJsZSA9PSB0cnVlOiAvLyBuZXcgaW1hZ2VcblxuICAgICAgICAgIGlmICghaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZS9naWYnKSkgeyAvLyBub3QgYSBnaWZcblxuICBcdFx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQubW91c2VQb3MpOyAvLyBkcm9wIGVsZW1lbnRcblxuICAgICAgICAgICAgdXBkYXRlRmlsZXNpemVQdWJMZWZ0KGlucHV0LmRhdGEpXG5cbiAgICAgICAgICAgIFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCArPSAxIC8vIGFjaGlldmVtZW50IGV2ZXJ5IHggaW1nc1xuICAgICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCVhY2hpZXZlbWVudFNwYW4gPT0gMCkge1xuICAgICAgICAgICAgICBhY2hpZXZlbWVudCgxMDAgKiBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQsIFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCArICcgaW1hZ2VzIGFkZGVkIScpXG4gICAgICAgICAgICAgIFB1YmxpY2F0aW9uLmFjaGlldmVtZW50c0Ftb3VudCArPSAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoUHVibGljYXRpb24uaW1hZ2VzQW1vdW50ID09IDMpIHsgLy8gc2F2ZSBwdWIgYWZ0ZXIgbG9hZGluZyAzIGltYWdlc1xuICAgICAgICAgICAgICAkKCcjZG9uZScpLmNzcygnZGlzcGxheScsJ2lubGluZS1ibG9jaycpXG4gICAgICAgICAgICAgIGNyaXRpY1NheXMoJ1lvdSBjYW4gbm93IHNhdmUgeW91ciBwdWJsaWNhdGlvbiEnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gc3RhcnQgZGlzcnVwdGlvbnMgYWZ0ZXIgZmlyc3QgaW1hZ2VcbiAgICAgICAgICAgIGlmICggIFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCA9PSAxICYmXG4gICAgICAgICAgICAgICAgICBnZXRVcmxQYXJhbWV0ZXIoJ2Rpc3J1cHRpb25zJykgIT0gJ2ZhbHNlJyAmJlxuICAgICAgICAgICAgICAgICAgZGlzcnVwdGlvbnNPbiA9PSB0cnVlICYmXG4gICAgICAgICAgICAgICAgICB0eXBlb2YgeSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkgeyAvLyBsYXVuY2ggYSByYW5kb20gZGlzcnVwdGlvblxuICAgICAgICAgICAgICAgIGRpc3J1cHRpb25zID0gT2JqZWN0LmtleXMoRGlzcnVwdGlvbilcbiAgICAgICAgICAgICAgICBEaXNydXB0aW9uW2Rpc3J1cHRpb25zWyBkaXNydXB0aW9ucy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXSgpXG4gICAgICAgICAgICAgICAgc2hha2UocGFnZXMpXG4gICAgICAgICAgICAgICAgc2Z4LmRpc3J1cHRpb24oKVxuICAgICAgICAgICAgICB9LCBkaXNydXB0aW9uSW50ZXJ2YWwpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFkZFRpbWUoYm9udXNUaW1lKVxuICBcdFx0XHRcdFx0Y3JpdGljU2F5cygpXG5cbiAgICAgICAgICB9IGVsc2UgeyAvLyBhIGdpZlxuICAgICAgICAgICAgRXJyb3Iubm9HaWZzKClcbiAgICAgICAgICAgIGFkZFRpbWUoLWJvbnVzVGltZSlcbiAgICAgICAgICB9XG5cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IHRleHRcblxuICAgICAgICAgIHZhciBkZUJhc2VkSW5wdXQgPSBhdG9iKGlucHV0LmRhdGEuc3Vic3RyaW5nKDIzKSk7XG4gICAgICAgICAgaWYgKGRlQmFzZWRJbnB1dC5pbmNsdWRlcygnPHNjcmlwdD4nKSkgeyAvLyBjb2RlIGluamVjdGlvblxuXG4gICAgICAgICAgICBFcnJvci5jb2RlSW5qZWN0aW9uKClcbiAgICAgICAgICAgIGFkZFRpbWUoLWJvbnVzVGltZSlcbiAgICAgICAgICAgIGNyaXRpY1NheXMoJ1lvdSBkZXNlcnZlIHRvIGJlIHB1bmlzaGVkLicpXG5cbiAgICAgICAgICB9IGVsc2Uge1xuXG4gIFx0XHRcdFx0XHRkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBpbnB1dC5tb3VzZVBvcykgLy8gZHJvcCBlbGVtZW50XG5cbiAgICAgICAgICAgIHVwZGF0ZUZpbGVzaXplUHViTGVmdChpbnB1dC5kYXRhKVxuXG4gICAgICAgICAgICBQdWJsaWNhdGlvbi50ZXh0QW1vdW50ICs9IGlucHV0LmRhdGEubGVuZ3RoXG4gICAgICAgICAgICBpZiAoUHVibGljYXRpb24udGV4dEFtb3VudCA+PSA1MDApIHtcbiAgICAgICAgICAgICAgYWNoaWV2ZW1lbnQoNTAwLCAnTW9yZSB0aGFuIDUwMCBjaGFyYWN0ZXJzIGFkZGVkJylcbiAgICAgICAgICAgICAgUHVibGljYXRpb24uYWNoaWV2ZW1lbnRzQW1vdW50ICs9IDFcbiAgICAgICAgICAgIH1cblxuICBcdFx0XHRcdFx0YWRkVGltZShib251c1RpbWUgKiAyKVxuICAgICAgICAgICAgY3JpdGljU2F5cygnVGhpcyBpcyBnb25uYSBiZSBhIGdvb29vb29kIHJlYWQnKVxuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKTogLy8gbmVpdGhlciBhbiBpbWFnZSBub3IgdGV4dFxuXHRcdFx0XHRcdEVycm9yLm5vdEFsbG93ZWQoKVxuICAgICAgICAgIGFkZFRpbWUoLWJvbnVzVGltZSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5tb3ZlID09IHRydWUgOiAvLyBtb3Zpbmcgb3Igc2NhbGluZyBhbiBpbWFnZVxuXHRcdFx0XHRcdFB1YmxpY2F0aW9uLnBhZ2VzW2lucHV0LnBhZ2VdID0gY2FudmFzZXNbaW5wdXQucGFnZV0udG9KU09OKClcblx0XHRcdFx0XHRicmVha1xuXHRcdH1cblx0fSBlbHNlIGlmIChpbnB1dCAmJiBpbnB1dC5tb3ZlICE9PSB0cnVlICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkge1xuXHRcdC8vIHRvbyBsYXRlXG5cdFx0RXJyb3IudG9vTGF0ZSgpO1xuXHR9XG59XG5cblxuXG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxudmFyIHg7XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0aW5pdENhbnZhc2VzKClcblx0b25Nb2RFbGVtZW50KClcblx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPCAwKSB7XG5cdFx0Ly8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cblx0XHRpZiAoIGdldFVybFBhcmFtZXRlcigndGltZScpICkgeyAvLyBkaWZmaWN1bHR5XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IHRpbWVTZXQgPSBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKVxuXHRcdH0gZWxzZSB7XG4gICAgICBpbmZpbml0ZVRpbWUgPSB0cnVlXG4gICAgfVxuXHRcdHggPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgLSAxMDtcbiAgICAgIGlmIChpbmZpbml0ZVRpbWUgPT0gZmFsc2UpIHtcbiAgICAgICAgUHVibGljYXRpb24udGltZUVsYXBzZWQgPSBwYXJzZUludCggKHRpbWVTZXQgLSBQdWJsaWNhdGlvbi50aW1lTGVmdCkgLyAxMDAwIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFB1YmxpY2F0aW9uLnRpbWVFbGFwc2VkID0gMFxuICAgICAgfVxuXHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbik7XG5cdFx0fSwgMTApXG5cdFx0bW91c2VDb3VudGVyKClcblx0fSBlbHNlIHsgLy8gc2F2ZWQgcHVibGljYXRpb25cblx0XHRyZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbilcblx0fVxufSk7XG5cbmZ1bmN0aW9uIGFkZFRpbWUoYm9udXNUaW1lKSB7XG5cdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgKyBib251c1RpbWU7XG5cdGFuaW1hdGV0aW1lY291bnRlcihib251c1RpbWUvMTAwMCk7XG4gIGlmIChib251c1RpbWUgPj0gMCkge1xuICAgIHNmeC5hZGRUaW1lUGx1cygpXG4gIH0gZWxzZSB7XG4gICAgc2Z4LmFkZFRpbWVNaW51cygpXG4gIH1cbn1cblxuLy8gbW9kaWZ5IGVsZW1lbnQgbGlzdGVuZXJcbmZ1bmN0aW9uIG9uTW9kRWxlbWVudCgpIHtcblx0Zm9yICh2YXIgcGFnZUlkIGluIGNhbnZhc2VzKSB7XG5cdFx0Y2FudmFzZXNbIHBhZ2VJZCBdLm9uKCdvYmplY3Q6bW9kaWZpZWQnLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBwYXJlbnRDYW52YXNJZCA9IGV2dC50YXJnZXQuY2FudmFzLmxvd2VyQ2FudmFzRWwuaWRcblx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgbW92ZTogdHJ1ZSwgcGFnZTogcGFyZW50Q2FudmFzSWR9KVxuXHRcdH0pXG5cdH1cbn1cblxuLy8gZ2V0IG1vdXNlIHBvc2l0aW9uIG9uIGNhbnZhc1xuZnVuY3Rpb24gZ2V0TW91c2VQb3MoY2FudmFzLCBlKSB7XG4gIHZhciBwb2ludGVyID0gY2FudmFzLmdldFBvaW50ZXIoZSlcbiAgdmFyIHBvc1ggPSBwb2ludGVyLnhcbiAgdmFyIHBvc1kgPSBwb2ludGVyLnlcbiAgcmV0dXJuIHtcbiAgICB4OiBwb3NYLFxuICAgIHk6IHBvc1lcbiAgfVxufVxuXG5jb25zdCBwYWdlcyA9ICQoJy5wYWdlJylcbi8vIGRyb3AgZWxlbWVudFxucGFnZXMub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG4gICQodGhpcykuYWRkQ2xhc3MoJ2Ryb3BwYWJsZScpO1xufSk7XG5wYWdlcy5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG4gICQoJy5kcm9wcGFibGUnKS5yZW1vdmVDbGFzcygnZHJvcHBhYmxlJyk7XG59KTtcbnBhZ2VzLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG4gICQoJy5kcm9wcGFibGUnKS5yZW1vdmVDbGFzcygnZHJvcHBhYmxlJyk7XG5cdHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdHZhciB5ID0gMDtcblx0Zm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0cmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHR2YXIgcGFnZUlkID0gJCh0aGlzKS5maW5kKCdjYW52YXMnKS5hdHRyKCdpZCcpO1xuXHRcdG1vdXNlUG9zID0gZ2V0TW91c2VQb3MoY2FudmFzZXNbcGFnZUlkXSwgZSlcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0XHRcdFx0ZGF0YTogZXZlbnQudGFyZ2V0LnJlc3VsdCxcblx0XHRcdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHBhZ2U6IHBhZ2VJZCxcblx0XHRcdFx0XHRtb3VzZVBvczogbW91c2VQb3Ncblx0XHRcdFx0fSk7XG5cdFx0XHR9LCB5ICogZHJvcERlbGF5KTtcblx0XHRcdHkgKz0gMTtcblx0XHR9XG5cdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZXNbaV0pXG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpXG59KVxuJCgnYm9keScpLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKVxufSlcbiQoJ2JvZHknKS5vbignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpXG4gIHNmeC5lcnJvcigpXG59KVxuXG5cblxuXG5cblxuXG4vLyAtLS0gVklFV1xuXG5cbi8vIFRPRE86IG1lcmdlIHRoZXNlIHR3b1xuZnVuY3Rpb24gcGFkKG4sIGxlbikge1xuICByZXR1cm4gKG5ldyBBcnJheShsZW4gKyAxKS5qb2luKCcwJykgKyBuKS5zbGljZSgtbGVuKTtcbn1cblxuXG5mdW5jdGlvbiBzaG93VGltZShQdWJsaWNhdGlvbikge1xuXHRzZWNvbmRzID0gUHVibGljYXRpb24udGltZUxlZnQgLyAxMDAwO1xuXHQkKCcjY291bnRlcicpLnNob3coKTtcblx0dmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKHNlY29uZHMgLyA2MCk7XG5cdHZhciBzZWNvbmRzID0gc2Vjb25kcyAlIDYwO1xuXHR2YXIgbXM7XG5cdGlmICghIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykpIHtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBkID0gbmV3IERhdGUoKTtcblx0XHRcdG1zID0gZC5nZXRNaWxsaXNlY29uZHMoKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID0gcGFkKG1pbnV0ZXMsIDIpICsgJzonICsgcGFkKHNlY29uZHMudG9GaXhlZCgwKSwgMikgKyAnOicgKyBwYWQobXMudG9TdHJpbmcoKS5zdWJzdHIoMCwyKSwgMikgKyAnIGxlZnQhJztcblx0XHRcdGlmIChtaW51dGVzIDw9IDAgJiYgc2Vjb25kcyA8PSAyMCkge1xuXG5cdFx0XHRcdHZhciBzaXplID0gKDEuMzQ0NDQ0NDQgLSAoc2Vjb25kcyAvIDYwKSk7XG5cdFx0XHRcdCQoJy5jb3VudGVyJykuY3NzKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIHNpemUgKyAnKScpO1xuXG5cdFx0XHRcdHN3aXRjaCAoc2Vjb25kcykge1xuXHRcdFx0XHRcdGNhc2UgNTpcblx0XHRcdFx0XHRcdHNmeC5lcnJvcigpXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0XHRzZnguZXJyb3IoKVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdFx0c2Z4LmVycm9yKClcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0XHRcdHNmeC5lcnJvcigpXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdFx0XHRzZnguZXJyb3IoKVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSwgMSlcblx0fSBlbHNlIHtcblx0XHQvLyBjb25zb2xlLmxvZygnZXJyb3InKTtcblx0fVxufVxuZnVuY3Rpb24gbW91c2VDb3VudGVyKCkge1xuXHQkKGRvY3VtZW50KS5iaW5kKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUucGFnZVggPj0gJChkb2N1bWVudCkud2lkdGgoKSAvIDIpIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIHJpZ2h0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5hZGRDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCAtIDIwIC0gJCgnI2NvdW50ZXInKS53aWR0aCgpLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIGxlZnQgc2lkZSBvZiBwYWdlXG5cdFx0XHQkKCcjY291bnRlcicpLnJlbW92ZUNsYXNzKCdtb3VzZV9yaWdodCcpO1xuXHRcdFx0JCgnI2NvdW50ZXInKS5jc3Moe1xuXHRcdFx0XHRsZWZ0OiBlLnBhZ2VYICsgMjAsXG5cdFx0XHRcdHRvcDogZS5wYWdlWSArIDUwXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzaG93RXhwaXJlZCgpIHtcbiAgaWYgKFB1YmxpY2F0aW9uLmV4cGlyZWQgIT0gdHJ1ZSkge1xuICAgIHNvdW5kdHJhY2suc3RvcCgpXG4gICAgUHVibGljYXRpb24uZXhwaXJlZCA9IHRydWVcblxuICAgIC8vIGxvY2tpbmcgZWxlbWVudHNcbiAgICBsb2NrRWxlbWVudHMoYWxsRWxlbWVudHMoKSlcbiAgICBpZiAodGl0bGUudGV4dCA9PSAnSW5zZXJ0IFRpdGxlJykge1xuICAgICAgdGl0bGUudGV4dCA9IGRlZmF1bHRUaXRsZVxuICAgIH1cbiAgICBpZiAoYXV0aG9ycy50ZXh0ID09ICdJbnNlcnQgQXV0aG9ycycpIHtcbiAgICAgIGF1dGhvcnMudGV4dCA9IGRlZmF1bHRBdXRob3JzXG4gICAgfVxuICAgIHRpdGxlLmV4aXRFZGl0aW5nKClcbiAgICBhdXRob3JzLmV4aXRFZGl0aW5nKClcbiAgICB0aXRsZS5zZWxlY3RhYmxlID0gdGl0bGUuYXV0aG9ycyA9IGZhbHNlXG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uc2VsZWN0YWJsZSA9IGZhbHNlXG4gICAgICBjYW52YXNlc1tjYW52YXNdLmRpc2NhcmRBY3RpdmVPYmplY3QoKS5yZW5kZXJBbGwoKVxuICAgIH1cblxuICAgIGVsZW1lbnRzQW1vdW50ID0gMFxuICAgIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgICBlbGVtZW50c0Ftb3VudCA9IGVsZW1lbnRzQW1vdW50ICsgY2FudmFzZXNbY2FudmFzXS5nZXRPYmplY3RzKCkubGVuZ3RoXG4gICAgfVxuICAgIGlmIChlbGVtZW50c0Ftb3VudCA8PSA1KSB7XG4gICAgICAkKCcudHJ5YWdhaW4nKS5jc3MoJ2Rpc3BsYXknLCdpbmxpbmUtYmxvY2snKVxuICAgICAgJCgnLnNhdmUnKS5oaWRlKClcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgRXJyb3Iubm9Db250ZW50KClcbiAgICAgIH0sIDIwMDApXG4gICAgfSBlbHNlIHtcblxuICAgIH1cblxuICAgIHNob3dQdWJsaWNhdGlvbkRhdGEoUHVibGljYXRpb24pXG5cbiAgICBpZiAoIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykgKSB7XG4gIFx0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIH1cbiAgXHQkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKVxuICBcdGV4cGlyZWRUaW1lKClcbiAgICBzZngucGVyaXNoZWQoKVxuICBcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICBcdFx0JCgnLndyYXBwZXInKS5hZGRDbGFzcygnc2F2ZWRfdmlldycpO1xuICBcdFx0c2F2ZWRTdGF0ZSgpXG4gIFx0fSwgNTAwKVxuICBcdGNsZWFySW50ZXJ2YWwoeCkgLy8gY2xlYXIgY29udHJvbGxlclxuICAgIGlmICh0eXBlb2YgeSAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gaWYgZGlzcnVwdGlvbnNcbiAgICAgIGNsZWFySW50ZXJ2YWwoeSkgLy8gY2xlYXIgZGlzcnVwdGlvbnNcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJvcEVsZW1lbnQocGFnZUlkLCBkYXRhLCBtb3VzZVBvcykge1xuXHR2YXIgZWxlbWVudCA9IHsgZGF0YTogZGF0YSwgcGFnZTogcGFnZUlkIH1cblx0dmFyIGVsZW1lbnRQb3MgPSBjcmVhdGVFbGVtZW50KGVsZW1lbnQsIG1vdXNlUG9zKVxufVxuXG5cblxuXG5cblxuXG5cbi8vIGVycm9yc1xuXG52YXIgRXJyb3IgPSB7XG5cdG5vdEFsbG93ZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdGFsZXJ0TWVzc2FnZSgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgbm90IGFsbG93ZWQhJylcblx0fSxcblx0dG9vQmlnOiBmdW5jdGlvbigpIHtcblx0XHRhbGVydE1lc3NhZ2UoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIHRvbyBiaWchJylcblx0fSxcbiAgcHViVG9vQmlnOiBmdW5jdGlvbigpIHtcbiAgICBhbGVydE1lc3NhZ2UoJ1lvdSByZWFjaGVkIHRoZSBsaW1pdCBvZiAxMG1iIGZvciB0aGlzIHB1YmxpY2F0aW9uLiBZb3UgY2FuIHN0aWxsIHdvcmsgb24gdGhlIGxheW91dCBhbmQgc2F2ZSB0aGUgcHVibGljYXRpb24uJylcbiAgfSxcbiAgbm9HaWZzOiBmdW5jdGlvbigpIHtcbiAgICBhbGVydE1lc3NhZ2UoJ0dpZnMgYXJlIG5vdCBhbGxvd2VkLiAoVGhpcyBzdWNrcywgSSBrbm93Li4uKScpXG4gIH0sXG5cdHRvb0xhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdGFsZXJ0TWVzc2FnZSgnVG9vIGxhdGUgYW1pZ28nKVxuICAgIHNmeC5lcnJvcigpXG5cdH0sXG4gIGNvZGVJbmplY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIGFsZXJ0TWVzc2FnZSgnSGV5IGhhY2tlciwgeW91XFwncmUgdHJ5aW5nIHRvIGluamVjdCBjb2RlLiBQbGVhc2UgZG9uXFwndC4nKVxuICB9LFxuICBub0NvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuICAgIGFsZXJ0TWVzc2FnZSgnWW91IGRpZG5cXCd0IHVwbG9hZCBhbnkgaW1hZ2Ugb3IgdGV4dCA6KCcpXG4gICAgc2Z4LmVycm9yKClcbiAgfVxufVxuXG5cblxuXG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiBzaG93UHVibGljYXRpb25EYXRhKFB1YmxpY2F0aW9uKSB7XG4gICQoJy50aXRsZScpLnRleHQoIFB1YmxpY2F0aW9uLnRpdGxlIClcbiAgJCgnLmF1dGhvcnMgc3BhbjpsYXN0LWNoaWxkJykudGV4dCggUHVibGljYXRpb24uYXV0aG9ycyApXG4gICQoJy5kYXRlIHNwYW46bGFzdC1jaGlsZCcpLnRleHQoIHRpbWVDb252ZXJ0ZXIoIE51bWJlcihQdWJsaWNhdGlvbi5kYXRlKSkgKVxuICAkKCcuaW1hZ2VzYW1vdW50IHNwYW46bGFzdC1jaGlsZCcpLnRleHQoIFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCApXG4gICQoJy50ZXh0YW1vdW50IHNwYW46bGFzdC1jaGlsZCcpLnRleHQoIFB1YmxpY2F0aW9uLnRleHRBbW91bnQgKyAnIGNoYXJzJyApXG4gICQoJy5lbGFwc2VkdGltZSBzcGFuOmxhc3QtY2hpbGQnKS50ZXh0KCBQdWJsaWNhdGlvbi50aW1lRWxhcHNlZCArICcgcycgKVxuICAkKCcuYWNoaWV2ZW1lbnRzYW1vdW50IHNwYW46bGFzdC1jaGlsZCcpLnRleHQoIFB1YmxpY2F0aW9uLmFjaGlldmVtZW50c0Ftb3VudCApXG59XG5cbmZ1bmN0aW9uIHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKSB7XG4gIGZ1bmN0aW9uIHJlbmRlclBhZ2UoaW1nLCBjYW52YXNJZCkge1xuICAgIGZhYnJpYy5JbWFnZS5mcm9tVVJMKGltZywgZnVuY3Rpb24oaW1nKXtcbiAgICAgICAgaW1nLmhhc0JvcmRlcnMgPSBmYWxzZTtcbiAgICAgICAgaW1nLmhhc0NvbnRyb2xzID0gZmFsc2U7XG4gICAgICAgIGltZy5zZWxlY3RhYmxlID0gZmFsc2U7XG4gICAgICAgIGltZy5sZWZ0ID0gY2FudmFzZXNbY2FudmFzSWRdLndpZHRoIC8gMjtcbiAgICAgICAgaW1nLnRvcCA9IGNhbnZhc2VzW2NhbnZhc0lkXS5oZWlnaHQgLyAyO1xuICAgICAgICBpbWcuc2NhbGVYID0gY2FudmFzZXNbY2FudmFzSWRdLndpZHRoIC8gaW1nLndpZHRoO1xuICAgICAgICBpbWcuc2NhbGVZID0gY2FudmFzZXNbY2FudmFzSWRdLmhlaWdodCAvIGltZy5oZWlnaHQ7XG4gICAgICAgIGltZy5sb2NrTW92ZW1lbnRYID0gdHJ1ZTtcbiAgICAgICAgaW1nLmxvY2tNb3ZlbWVudFkgPSB0cnVlO1xuICAgICAgICBpbWcubG9ja1JvdGF0aW9uID0gdHJ1ZTtcbiAgICAgICAgaW1nLnNldENvbnRyb2xzVmlzaWJpbGl0eSA9IGZhbHNlO1xuICAgICAgICBpbWcuaWQgPSAnbG9jaydcbiAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLmFkZChpbWcpO1xuICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsLmJpbmQoY2FudmFzZXNbY2FudmFzSWRdKVxuICAgIH0pXG4gIH1cbiAgZm9yICh2YXIgY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICByZW5kZXJQYWdlKFB1YmxpY2F0aW9uLnBhZ2VzW2NhbnZhc0lkXSwgY2FudmFzSWQpXG4gIH1cbiAgc2hvd1B1YmxpY2F0aW9uRGF0YShQdWJsaWNhdGlvbilcbn1cblxuXG5cblxuXG4vLyAtLS0gQkFDS0VORFxuXG4vLyBzYXZlIHRvIGRiXG52YXIgc2F2aW5nID0gZmFsc2VcbmZ1bmN0aW9uIHNhdmV0b0RiKHB1YmxpY2F0aW9uKSB7XG4gIGlmIChzYXZpbmcgPT0gZmFsc2UpIHtcbiAgXHRmb3IgKHZhciBwYWdlIGluIFB1YmxpY2F0aW9uLnBhZ2VzKSB7XG4gICAgICB2YXIgb3JpZ2luV2lkdGggPSBjYW52YXNlc1twYWdlXS5nZXRXaWR0aCgpO1xuXG4gICAgICBmdW5jdGlvbiB6b29tICh3aWR0aCkge1xuICAgICAgICB2YXIgc2NhbGUgPSB3aWR0aCAvIGNhbnZhc2VzW3BhZ2VdLmdldFdpZHRoKCk7XG4gICAgICAgIGhlaWdodCA9IHNjYWxlICogY2FudmFzZXNbcGFnZV0uZ2V0SGVpZ2h0KCk7XG5cbiAgICAgICAgY2FudmFzZXNbcGFnZV0uc2V0RGltZW5zaW9ucyh7XG4gICAgICAgICAgICBcIndpZHRoXCI6IHdpZHRoLFxuICAgICAgICAgICAgXCJoZWlnaHRcIjogaGVpZ2h0XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNhbnZhc2VzW3BhZ2VdLmNhbGNPZmZzZXQoKTtcbiAgICAgICAgdmFyIG9iamVjdHMgPSBjYW52YXNlc1twYWdlXS5nZXRPYmplY3RzKCk7XG4gICAgICAgIGZvciAodmFyIGkgaW4gb2JqZWN0cykge1xuICAgICAgICAgICAgdmFyIHNjYWxlWCA9IG9iamVjdHNbaV0uc2NhbGVYO1xuICAgICAgICAgICAgdmFyIHNjYWxlWSA9IG9iamVjdHNbaV0uc2NhbGVZO1xuICAgICAgICAgICAgdmFyIGxlZnQgPSBvYmplY3RzW2ldLmxlZnQ7XG4gICAgICAgICAgICB2YXIgdG9wID0gb2JqZWN0c1tpXS50b3A7XG5cbiAgICAgICAgICAgIG9iamVjdHNbaV0uc2NhbGVYID0gc2NhbGVYICogc2NhbGU7XG4gICAgICAgICAgICBvYmplY3RzW2ldLnNjYWxlWSA9IHNjYWxlWSAqIHNjYWxlO1xuICAgICAgICAgICAgb2JqZWN0c1tpXS5sZWZ0ID0gbGVmdCAqIHNjYWxlO1xuICAgICAgICAgICAgb2JqZWN0c1tpXS50b3AgPSB0b3AgKiBzY2FsZTtcblxuICAgICAgICAgICAgb2JqZWN0c1tpXS5zZXRDb29yZHMoKTtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXNlc1twYWdlXS5yZW5kZXJBbGwoKTtcbiAgICAgIH1cbiAgICAgIHpvb20oY2FudmFzWm9vbSlcblxuICAgICAgUHVibGljYXRpb24ucGFnZXNbcGFnZV0gPSBjYW52YXNlc1twYWdlXS50b0RhdGFVUkwoJ2ltYWdlL2pwZWcnLCAxKSAvLyB1cGRhdGUgYWxsIHBhZ2VzXG5cbiAgICAgIHpvb20gKG9yaWdpbldpZHRoKTtcbiAgXHR9XG4gICAgJCgnLmJ1dHRvbi5zYXZlIC5zdHlsaXplZCcpLmh0bWwoJ1NhdmluZyA8c3Bhbj4uPC9zcGFuPjxzcGFuPi48L3NwYW4+PHNwYW4+Ljwvc3Bhbj4nKS5hZGRDbGFzcygnc2F2aW5nJykucmVtb3ZlQ2xhc3MoJ3N0eWxpemVkJylcbiAgICAkKCcuYnV0dG9uLnNhdmUnKS5jc3MoJ2JhY2tncm91bmRDb2xvcicsICcjZWVlJylcbiAgXHQkLmFqYXgoe1xuICBcdFx0dXJsOiAnL2RiJyxcbiAgXHRcdHR5cGU6ICdwb3N0JywgLy8gcGVyZm9ybWluZyBhIFBPU1QgcmVxdWVzdFxuICBcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24pLFxuICBcdFx0Y29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgXHRcdGRhdGFUeXBlOiAnanNvbicsXG4gIFx0XHRzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2Z4LnJlYWR5KClcbiAgICAgICAgJCgnLmJ1dHRvbi5zYXZlJykuaGlkZSgpXG4gICAgICAgICQoJy5idXR0b24ucGRmLCAuYnV0dG9uLmJvb2tsZXQnKS5jc3MoJ2Rpc3BsYXknLCdpbmxpbmUtYmxvY2snKVxuXG4gICAgICAgICQoJy50aXRsZScpLmVtcHR5KClcbiAgICAgICAgJCgnLmFjaGlldmVtZW50cyBoMycpLmFkZENsYXNzKCdhcnJvd2VkJylcbiAgICAgICAgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICAgICAgICAkKGEpLnRleHQoUHVibGljYXRpb24udGl0bGUpLmF0dHIoXCJocmVmXCIsICcvc2F2ZWQ/aWQ9JyArIFB1YmxpY2F0aW9uLmlkKVxuICAgICAgICAkKGEpLmFwcGVuZFRvKCQoJy50aXRsZScpKVxuXG4gIFx0XHRcdGNvbnNvbGUubG9nKCdwdWJsaWNhdGlvbiBzZW50IHRvIGRhdGFiYXNlLicpO1xuICBcdFx0fVxuICBcdH0pO1xuICBcdGNvbnNvbGUubG9nKCdzYXZlZD9pZD0nICsgUHVibGljYXRpb24uaWQpXG4gICAgc2F2aW5nID0gdHJ1ZVxuICB9XG59XG5cblxuXG5cbi8vIC0tLSBESVNSVVBUSU9OU1xuXG5cbmZ1bmN0aW9uIGFsbEVsZW1lbnRzKHR5cGUpIHtcbiAgdmFyIG9ianMgPSBbXVxuICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgIGlmICh0eXBlKSB7XG4gICAgICBjYW52YXNPYmpzID0gY2FudmFzZXNbY2FudmFzXS5nZXRPYmplY3RzKHR5cGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbnZhc09ianMgPSBjYW52YXNlc1tjYW52YXNdLmdldE9iamVjdHMoKVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gY2FudmFzT2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKGNhbnZhc09ianNbaV0uaWQgIT0gJ2xvY2snKSB7IC8vIHVzZSB0aGlzIHRvIGxvY2tcbiAgICAgICAgb2Jqcy5wdXNoKCBjYW52YXNPYmpzW2ldIClcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9ianNcbn1cblxuZnVuY3Rpb24gbG9ja0VsZW1lbnRzKG9ianMpIHtcbiAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBvYmpzW2ldLnNlbGVjdGFibGUgPSBmYWxzZVxuICAgIG9ianNbaV0uaGFzQ29udHJvbHMgPSBmYWxzZVxuICAgIG9ianNbaV0uaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCdcbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJBbGxDYW52YXNlcygpIHtcbiAgZm9yIChjYW52YXNJZCBpbiBjYW52YXNlcykge1xuICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwoKVxuICB9XG59XG5cbmZ1bmN0aW9uIGZpbHRlckltZ3Mob2JqcywgZmlsdGVyKSB7XG4gIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgb2Jqc1tpXS5maWx0ZXJzLnB1c2goZmlsdGVyKVxuICAgIG9ianNbaV0uYXBwbHlGaWx0ZXJzKClcbiAgfVxuICByZW5kZXJBbGxDYW52YXNlcygpXG59XG5cbnZhciBEaXNydXB0aW9uID0ge1xuXHRjb21pYzogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2NvbWljKG9ianMpIHtcbiAgICAgIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIG9ianNbaV0uZm9udEZhbWlseSA9ICdcIkNvbWljIFNhbnMgTVNcIidcbiAgICAgIH1cbiAgICB9XG4gICAgX2NvbWljKCBhbGxFbGVtZW50cygndGV4dCcpIClcbiAgICBfY29taWMoIGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykgKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdDYW5cXCd0IHlvdSBzcGljZSB0aGUgdHlwb2dyYXBoeSBhIGJpdD8nKVxuXHR9LFxuXHRyb3RhdGVJbWdzUmFuZDogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX3JvdGF0ZUltZ3NSYW5kKG9ianMpIHtcbiAgICAgIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIG9ianNbaV0ub3JpZ2luWCA9ICdjZW50ZXInXG4gICAgICAgIG9ianNbaV0ub3JpZ2luWSA9ICdjZW50ZXInXG4gICAgICAgIG9ianNbaV0uYW5pbWF0ZSh7IGFuZ2xlOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApIH0sIHtcbiAgICAgICAgICBkdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICBvbkNoYW5nZTogb2Jqc1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQob2Jqc1tpXS5jYW52YXMpLFxuICAgICAgICAgIGVhc2luZzogZnVuY3Rpb24odCwgYiwgYywgZCkgeyByZXR1cm4gYyp0L2QgKyBiIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgX3JvdGF0ZUltZ3NSYW5kKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIGNyaXRpY1NheXMoJ0kgZmluZCB0aGlzIGxheW91dCBhIGJpdCBzdGF0aWMuLi4nKVxuXHR9LFxuXHRsb2NrUmFuZFBhZ2U6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FudmFzZXMpXG4gICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cblx0XHRyYW5kQ2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlO1xuXHRcdGZvciAob2JqZWN0SWQgaW4gcmFuZENhbnZhcy5nZXRPYmplY3RzKCkgKSB7XG5cdFx0XHR2YXIgb2JqZWN0ID0gcmFuZENhbnZhcy5pdGVtKG9iamVjdElkKVxuXHRcdFx0b2JqZWN0LnNlbGVjdGFibGUgPSBmYWxzZVxuXHRcdFx0b2JqZWN0LmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnXG5cdFx0fVxuXHRcdHJhbmRDYW52YXMuYWRkKG5ldyBmYWJyaWMuTGluZShbMCwgMCwgcmFuZENhbnZhcy53aWR0aCwgcmFuZENhbnZhcy5oZWlnaHRdLCB7XG5cdCAgXHRzdHJva2U6ICdyZWQnLFxuXHQgIFx0c2VsZWN0YWJsZTogZmFsc2UsXG5cdCAgXHRzdHJva2VXaWR0aDogMixcbiAgICAgIGhvdmVyQ3Vyc29yOidkZWZhdWx0JyxcbiAgICAgIGlkOiAnbG9jaydcblx0XHR9KSlcblx0XHRyYW5kQ2FudmFzLnJlbmRlckFsbCgpO1xuICAgIGNyaXRpY1NheXMoJ1BhZ2UgJyArIHJhbmRDYW52YXMuaWRbMV0gKyAnIGlzIG5vdyBsb2NrZWQuLi4nKVxuXHR9LFxuICBzaHVmZmxlUGFnZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0b1NodWZmbGUgPSBbXVxuICAgIHZhciBpID0gMFxuICAgIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmIChpID4gMCAmJiBpIDw9IDYpIHsgLy8gcHJldmVudCBzaHVmZmxpbmcgZmlyc3QgcGFnZVxuICAgICAgICB0b1NodWZmbGUucHVzaCggY2FudmFzZXNbY2FudmFzSWRdLnRvSlNPTigpIClcbiAgICAgIH1cbiAgICAgIGkgKz0gMVxuICAgIH1cbiAgICBzaHVmZmxlQXJyYXkodG9TaHVmZmxlKVxuICAgIHZhciB5ID0gMFxuICAgIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmICh5ID4gMCAmJiB5IDw9IDYpIHtcbiAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLmxvYWRGcm9tSlNPTih0b1NodWZmbGVbeSAtIDFdLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsLmJpbmQoY2FudmFzZXNbY2FudmFzSWRdKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgeSArPSAxXG4gICAgfVxuICAgIGNyaXRpY1NheXMoJ1RoZSByeXRobSBvZiB0aGlzIHB1YmxpY2F0aW9uIGlzIGEgYml0IHdlYWsuIERvblxcJ3QgeW91IHRoaW5rPycpXG4gIH0sXG5cdGFkczogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FudmFzZXMpXG4gICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cblx0XHRyYW5kQ2FudmFzLmFkZChuZXcgZmFicmljLlJlY3Qoe1xuXHRcdFx0d2lkdGg6IHJhbmRDYW52YXMud2lkdGgsXG5cdFx0XHRoZWlnaHQ6IDMwLFxuXHRcdFx0ZmlsbDogJyMwRDIxM0UnLFxuXHRcdFx0bG9ja01vdmVtZW50WDogdHJ1ZSxcblx0XHRcdGxvY2tNb3ZlbWVudFk6IHRydWUsXG5cdFx0XHRsb2NrUm90YXRpb246IHRydWUsXG5cdFx0XHRoYXNDb250cm9sczogZmFsc2UsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcblx0XHRcdGxlZnQ6IHJhbmRDYW52YXMud2lkdGgvMixcblx0XHRcdHRvcDogMTUsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGlkOiAnbG9jaydcblx0XHR9KSk7XG5cdFx0ZmFicmljLkltYWdlLmZyb21VUkwoa2lua29CYXNlNjQsIGZ1bmN0aW9uKGltZyl7XG5cdFx0XHRcdGltZy5oYXNCb3JkZXJzID0gZmFsc2U7XG5cdFx0XHRcdGltZy5oYXNDb250cm9scyA9IGZhbHNlO1xuICAgICAgICBpbWcuc2VsZWN0YWJsZSA9IGZhbHNlO1xuXHRcdFx0XHRpbWcuc2NhbGUoMC4yKTtcblx0XHRcdFx0aW1nLmxlZnQgPSByYW5kQ2FudmFzLndpZHRoLTEwMDtcblx0XHRcdFx0aW1nLnRvcCA9IDUwO1xuXHRcdFx0XHRpbWcubG9ja01vdmVtZW50WCA9IHRydWU7XG5cdFx0XHRcdGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcblx0XHRcdFx0aW1nLmxvY2tSb3RhdGlvbiA9IHRydWU7XG5cdFx0XHRcdGltZy5zZXRDb250cm9sc1Zpc2liaWxpdHkgPSBmYWxzZTtcbiAgICAgICAgaW1nLmlkID0gJ2xvY2snXG5cdFx0XHRcdHJhbmRDYW52YXMuYWRkKGltZyk7XG5cdFx0fSlcbiAgICBjcml0aWNTYXlzKCdJIGZvdW5kIGEgc3BvbnNvciEnKVxuXHR9LFxuICBoYWxmVGltZTogZnVuY3Rpb24gKCkge1xuICAgIFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgLyAyXG4gICAgY3JpdGljU2F5cygnVGhpcyBpcyB0YWtpbmcgdG9vIGxvbmcuLi4nKVxuICB9LFxuICBkb3VibGVUaW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAqIDJcbiAgICBjcml0aWNTYXlzKCdUYWtlIHlvdXIgdGltZS4uLicpXG4gIH0sXG4gIGdyZXlzY2FsZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5HcmF5c2NhbGUoKSApXG4gICAgY3JpdGljU2F5cygnU2hhbGwgd2UgbWFrZSBpdCBsb29rIGNsYXNzaWM/JylcbiAgfSxcbiAgaW52ZXJ0SW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLkludmVydCgpIClcbiAgICBjcml0aWNTYXlzKCdUaGUgdmlzdWFscyBuZWVkIHNvbWUgZWRneSBjb2xvcnMnKVxuICB9LFxuICBzZXBpYUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5TZXBpYSgpIClcbiAgICBjcml0aWNTYXlzKCdFdmVyIGhlYXJkIG9mIEluc3RhZ3JhbT8nKVxuICB9LFxuICBibGFja3doaXRlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLkJsYWNrV2hpdGUoKSApXG4gICAgY3JpdGljU2F5cygnVGhpcyBzaG91bGQgbG9vayBsaWtlIGEgemluZSEnKVxuICB9LFxuICBwaXhlbGF0ZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5QaXhlbGF0ZSh7YmxvY2tzaXplOiAyMH0pIClcbiAgICBjcml0aWNTYXlzKCdJc25cXCd0IHRoaXMgYSB2aWRlb2dhbWUgYWZ0ZXIgYWxsPycpXG4gIH0sXG4gIG5vaXNlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLk5vaXNlKHtub2lzZTogMjAwfSkgKVxuICAgIGNyaXRpY1NheXMoJ01BS0UgU09NRSBOT09JU0UhIScpXG4gIH0sXG4gIGZvbnRTaXplQmlnZ2VyOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfZm9udFNpemVCaWdnZXIoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KCdmb250U2l6ZScsIGVsZW1lbnRzW2ldLmZvbnRTaXplICogc2NhbGVGb250KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2ZvbnRTaXplQmlnZ2VyKGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0NhblxcJ3QgcmVhZCBhbnl0aGluZyA6KCcpXG4gIH0sXG4gIGZvbnRTaXplU21hbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2ZvbnRTaXplU21hbGxlcihlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoJ2ZvbnRTaXplJywgZWxlbWVudHNbaV0uZm9udFNpemUgLyBzY2FsZUZvbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBfZm9udFNpemVTbWFsbGVyKGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0lcXCdtIG5vdCBibGluZCEnKVxuICB9LFxuICBiaWdnZXJJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfYmlnZ2VySW1ncyhlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIHNjYWxlWTogc2NhbGVVcEltZ3MsXG4gICAgICAgICAgc2NhbGVYOiBzY2FsZVVwSW1nc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2JpZ2dlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0JMT1cgVVAhJylcbiAgfSxcbiAgc21hbGxlckltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9zbWFsbGVySW1ncyhlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIHNjYWxlWTogc2NhbGVEb3duSW1ncyxcbiAgICAgICAgICBzY2FsZVg6IHNjYWxlRG93bkltZ3NcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIF9zbWFsbGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnQkxPVyBVUCEnKVxuICB9LFxuICBsb2NrQWxsRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgIGxvY2tFbGVtZW50cyhhbGxFbGVtZW50cygpKVxuICAgIGNyaXRpY1NheXMoJ1RoaW5ncyBhcmUgcGVyZmVjdCBhcyB0aGV5IGFyZS4nKVxuICB9LFxuICBza2V3QWxsRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9za2V3QWxsRWxlbWVudHMoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBzY2FsZVk6IHNjYWxlVXBJbWdzLFxuICAgICAgICAgIHNjYWxlWDogc2NhbGVVcEltZ3MsXG4gICAgICAgICAgdHJhbnNmb3JtTWF0cml4OiBbMSwgLjUwLCAwLCAxLCAwLCAwXVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfc2tld0FsbEVsZW1lbnRzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdTdHJldGNoIHRob3NlIGltYWdlcywgY29tZSBvbiEnKVxuICB9LFxuICBmbGlwQWxsSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2ZsaXBBbGxJbWdzKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7XG4gICAgICAgICAgYW5nbGU6ICctMTgwJyxcbiAgICAgICAgICBmbGlwWTogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfZmxpcEFsbEltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0ZsaXAgdGhvc2UgaW1hZ2VzLCBjb21lIG9uIScpXG4gIH0sXG4gIGJpdExlZnRiaXRSaWdodEFsbEltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9iaXRMZWZ0Yml0UmlnaHRBbGxJbWdzKGVsZW1lbnRzLCBkaXN0YW5jZSkge1xuICAgICAgdmFyIGR1cmF0aW9uID0gMjAwXG4gICAgICB2YXIgcGF1c2UgPSAxMDBcblxuICAgICAgZnVuY3Rpb24gbGVmdDEoaSwgZWxlbWVudHMpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmFuaW1hdGUoJ2xlZnQnLCBlbGVtZW50c1tpXS5sZWZ0ICsgZGlzdGFuY2UgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCksIHsgLy8gYSBiaXQgb2YgcmFuZG9tbmVzcyB0byBtYWtlIGl0IG1vcmUgaHVtYW5cbiAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCksXG4gICAgICAgICAgICBvbkNoYW5nZTogZWxlbWVudHNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKGVsZW1lbnRzW2ldLmNhbnZhcyksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgMClcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGxlZnQyKGksIGVsZW1lbnRzKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBlbGVtZW50c1tpXS5hbmltYXRlKCdsZWZ0JywgZWxlbWVudHNbaV0ubGVmdCArIGRpc3RhbmNlICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApLCB7XG4gICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApLFxuICAgICAgICAgICAgb25DaGFuZ2U6IGVsZW1lbnRzW2ldLmNhbnZhcy5yZW5kZXJBbGwuYmluZChlbGVtZW50c1tpXS5jYW52YXMpLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sIGR1cmF0aW9uICsgcGF1c2UpXG4gICAgICB9XG4gICAgICBmdW5jdGlvbiByaWdodDEoaSwgZWxlbWVudHMpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmFuaW1hdGUoJ2xlZnQnLCBlbGVtZW50c1tpXS5sZWZ0IC0gZGlzdGFuY2UgLSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCksIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCksXG4gICAgICAgICAgICBvbkNoYW5nZTogZWxlbWVudHNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKGVsZW1lbnRzW2ldLmNhbnZhcyksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgKGR1cmF0aW9uICsgcGF1c2UpICogMiApXG4gICAgICB9XG4gICAgICBmdW5jdGlvbiByaWdodDIoaSwgZWxlbWVudHMpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmFuaW1hdGUoJ2xlZnQnLCBlbGVtZW50c1tpXS5sZWZ0IC0gZGlzdGFuY2UgLSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCksIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCksXG4gICAgICAgICAgICBvbkNoYW5nZTogZWxlbWVudHNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKGVsZW1lbnRzW2ldLmNhbnZhcyksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgKGR1cmF0aW9uICsgcGF1c2UpICogMyApXG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxlZnQxKGksIGVsZW1lbnRzKVxuICAgICAgICBsZWZ0MihpLCBlbGVtZW50cylcbiAgICAgICAgcmlnaHQxKGksIGVsZW1lbnRzKVxuICAgICAgICByaWdodDIoaSwgZWxlbWVudHMpXG4gICAgICB9XG4gICAgfVxuICAgIF9iaXRMZWZ0Yml0UmlnaHRBbGxJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCA3MClcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnQSBiaXQgdG8gdGhlIHJpZ2h0Li4uIE5vIG5vLCBhIGJpdCB0byB0aGUgbGVmdC4uLicpXG4gIH0sXG4gIHJpZ2lkTW9kZTogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX3JpZ2lkTW9kZShlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIGxvY2tNb3ZlbWVudFk6IHRydWUsXG4gICAgICAgICAgbG9ja1JvdGF0aW9uOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIF9yaWdpZE1vZGUoYWxsRWxlbWVudHMoJ2ltYWdlJyksIDcwKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdSZXNwZWN0IHRoZSBncmlkIScpXG4gIH0sXG4gIGJldHRlclRpdGxlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGl0bGVzID0gW1xuICAgICAgJ0RvbiBRdWl4b3RlJyxcbiAgICAgICdJbiBTZWFyY2ggb2YgTG9zdCBUaW1lJyxcbiAgICAgICdVbHlzc2VzJyxcbiAgICAgICdUaGUgT2R5c3NleScsXG4gICAgICAnV2FyIGFuZCBQZWFjZScsXG4gICAgICAnTW9ieSBEaWNrJyxcbiAgICAgICdUaGUgRGl2aW5lIENvbWVkeScsXG4gICAgICAnSGFtbGV0JyxcbiAgICAgICdUaGUgR3JlYXQgR2F0c2J5JyxcbiAgICAgICdUaGUgSWxpYWQnXG4gICAgXVxuICAgIHZhciByYW5kVGl0bGUgPSB0aXRsZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGl0bGVzLmxlbmd0aCldXG4gICAgdGl0bGUudGV4dCA9IHJhbmRUaXRsZVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBQdWJsaWNhdGlvbi50aXRsZSA9IHJhbmRUaXRsZVxuICAgIGNyaXRpY1NheXMoJ0kgc3VnZ2VzdCBhIGNhdGNoaWVyIHRpdGxlJylcbiAgfSxcbiAgYmV0dGVyQXV0aG9yczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRoZV9hdXRob3JzID0gW1xuICAgICAgJ0xlbyBUb2xzdG95JyxcbiAgICAgICdGeW9kb3IgRG9zdG9ldnNreScsXG4gICAgICAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gICAgICAnQ2hhcmxlcyBEaWNrZW5zJyxcbiAgICAgICdIb21lcicsXG4gICAgICAnSi4gUi4gUi4gVG9sa2llbicsXG4gICAgICAnR2VvcmdlIE9yd2VsbCcsXG4gICAgICAnRWRnYXIgQWxsYW4gUG9lJyxcbiAgICAgICdNYXJrIFR3YWluJyxcbiAgICAgICdWaWN0b3IgSHVnbydcbiAgICBdXG4gICAgdmFyIHJhbmRBdXRob3IgPSB0aGVfYXV0aG9yc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGVfYXV0aG9ycy5sZW5ndGgpXVxuICAgIGF1dGhvcnMudGV4dCA9IHJhbmRBdXRob3JcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgUHVibGljYXRpb24uYXV0aG9ycyA9IHJhbmRBdXRob3JcbiAgICBjcml0aWNTYXlzKCdXZSBuZWVkIGEgd2VsbC1rbm93biB0ZXN0aW1vbmlhbC4nKVxuICB9LFxuICBkcmF3aW5nTW9kZTogZnVuY3Rpb24oKSB7XG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uaXNEcmF3aW5nTW9kZSA9IHRydWVcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uYmFja2dyb3VuZENvbG9yID0gJyNmZmZmYWEnXG4gICAgICBjYW52YXNlc1tjYW52YXNdLnJlbmRlckFsbCgpXG4gICAgfVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgICBjYW52YXNlc1tjYW52YXNdLmlzRHJhd2luZ01vZGUgPSBmYWxzZVxuICAgICAgICBjYW52YXNlc1tjYW52YXNdLmJhY2tncm91bmRDb2xvciA9ICcjZmZmZmZmJ1xuICAgICAgICBjYW52YXNlc1tjYW52YXNdLnJlbmRlckFsbCgpXG4gICAgICB9XG4gICAgfSwgZHJhd2luZ01vZGVUaW1lKVxuICAgIGNyaXRpY1NheXMoJ0RvIHlvdSBsaWtlIHRvIGRyYXc/JylcbiAgfSxcbiAgYmxhY2tib2FyZE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgICBjYW52YXNlc1tjYW52YXNdLmJhY2tncm91bmRDb2xvciA9ICcjMDAwMDAwJ1xuICAgICAgY2FudmFzZXNbY2FudmFzXS5yZW5kZXJBbGwoKVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbEVsZW1lbnRzKCd0ZXh0JykubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFsbEVsZW1lbnRzKCd0ZXh0JylbaV0uc2V0KHtmaWxsOiAnI2ZmZid9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gd2hpdGVUZXh0KGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7ZmlsbDogJyNmZmYnfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHdoaXRlVGV4dChhbGxFbGVtZW50cygndGV4dGJveCcpKVxuICAgIHdoaXRlVGV4dChbdGl0bGUsYXV0aG9ycyxwdWJEYXRlXSlcbiAgICBmb250Q29sb3IgPSAnI2ZmZidcbiAgICB2YXIgbGluZUxlbmdodCA9IDI1MFxuICAgIGNvdmVyTGluZSA9IG5ldyBmYWJyaWMuTGluZShbMCwgMCwgbGluZUxlbmdodCwgMF0sIHtcbiAgICAgIGxlZnQ6ICggY2FudmFzZXNbJ3AxJ10ud2lkdGggLSBsaW5lTGVuZ2h0KSAvIDIsXG4gICAgICB0b3A6IDE2MCxcbiAgICAgIHN0cm9rZTogJyNmZmYnLFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXG4gICAgICBvcmlnaW5YOiAnbGVmdCcsXG4gICAgICBvcmlnaW5ZOiAndG9wJ1xuICAgIH0pXG4gICAgY2FudmFzZXNbJ3AxJ10uYWRkKGNvdmVyTGluZSkgLy8gbm90IHN1cmUgd2h5IEkgY2FuJ3Qgc2ltcGx5IGNoYW5nZSB0aGUgc3Ryb2tlXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ1RoaW5rIG9mIHRoZSBwYWdlIGFzIGEgYmxhY2tib2FyZCcpXG4gIH0sXG4gIGNsYXNzaWZpZWRNb2RlOiBmdW5jdGlvbigpIHtcbiAgICBmYWJyaWMuSW1hZ2UuZnJvbVVSTChjbGFzc2lmaWVkQmFzZTY0LCBmdW5jdGlvbihpbWcpe1xuICAgICAgaW1nLmhhc0JvcmRlcnMgPSBmYWxzZTtcbiAgICAgIGltZy5oYXNDb250cm9scyA9IGZhbHNlO1xuICAgICAgaW1nLnNlbGVjdGFibGUgPSBmYWxzZTtcbiAgICAgIGltZy5zY2FsZSgwLjgpO1xuICAgICAgaW1nLmxlZnQgPSBjYW52YXNlc1sncDEnXS53aWR0aCAvIDI7XG4gICAgICBpbWcudG9wID0gMzAwO1xuICAgICAgaW1nLmxvY2tNb3ZlbWVudFggPSB0cnVlO1xuICAgICAgaW1nLmxvY2tNb3ZlbWVudFkgPSB0cnVlO1xuICAgICAgaW1nLmxvY2tSb3RhdGlvbiA9IHRydWU7XG4gICAgICBpbWcuc2V0Q29udHJvbHNWaXNpYmlsaXR5ID0gZmFsc2U7XG4gICAgICBpbWcuaWQgPSAnbG9jayc7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNhbnZhc2VzKVxuICAgICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cbiAgICAgIHJhbmRDYW52YXMuYWRkKGltZylcbiAgICB9KVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdUaGUgcHVibGljIG11c3Qgbm90IGtub3cuJylcbiAgfVxufVxuIl0sImZpbGUiOiJtYWluLmpzIn0=
