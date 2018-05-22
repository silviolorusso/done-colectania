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
var canvasZoom = 1000
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


// --- PRECONTROLLER

function countdownWrapper() {
  $(document).ready(function() {
    animateUp($('#counter'));


    function countdown(startTime) {
      animateUpOut($('#countdownWrapper'), 1000)

      switch (startTime) {
        case 3:
          $('#countdown').html('<span>Prepare your <span class="perish">Assets!</span></span>');
          sfx.countdown()
          break;
        case 2:
          $('#countdown').html('<span>Create your <span class="perish">Layout!</span></span>');
          sfx.countdown()
          break;
        case 1:
          $('#countdown').html('<span>Publish or <span class="perish">Perish!</span></span>');
          sfx.countdown()
          break;
        default:
      }

      startTime = startTime - 1;
      if (startTime >= 0) {
        setTimeout(function () {
          countdown(startTime);
        }, 1300);
      } else {
        sfx.countdownReady()
        soundtrack.play()
        initGame()
        $('#countdownWrapper').remove();
        $('.counter').fadeIn(300);
        if ( getUrlParameter('time') ) { // difficulty
          Publication.timeLeft = getUrlParameter('time')
        }
        return
      }
    }

    var startTime = 3;
    setTimeout(function () {
      countdown(startTime)
    }, 200)
  });
}

if (!getUrlParameter('demo') && window.location.href.indexOf('/saved') <= -1) { // if not demo and not /saved
  $('.counter').hide();
  if (localStorage.getItem("noWizard") != "true") {
    instructionMessage(0);  // show wizard
  } else if (!getUrlParameter('demo')) {
    countdownWrapper()
  }
} else if (getUrlParameter('demo')) { // if demo
  if (localStorage.getItem("noWizard") != "true") {
    instructionMessage(0);
  } else {
    initGame()
    soundtrack.play()
  }
}



function instructionMessage(num) {
  var wizardTime = ( getUrlParameter('demo') ) ? '∞' : Publication.timeLeft

  var messageArray = [
    '<div class="left"><img class="left" src="assets/img/achievement.png" /></div><div class="right"><h2>Welcome to Publish or Perish! Instructions Wizard</h2> <p>This wizard will guide you through the workflow of <em>Publish or Perish!</em>. It is recommended to <strong>prepare a directory of files</strong> for your publication in advance.</p><p>Click Next to Continue</p></div><div class="buttons"><div class="button nextWizard">Next ></div><div class="button closeWizard">Cancel</div></div></div>',

    '<div class="left"><img class="left" src="assets/img/jpg.svg" /></div><div class="right"><h2>Images</h2> <p><p>You can drag and drop images (<strong>.jpg, .png </strong>) from your computer onto the page. These images can be <strong>moved</strong>, <strong>scaled</strong> and <strong>rotated</strong>.</p><p>The file-size limit is <strong>1mb</strong>.</p><p>Click Next to Continue</p></div><div class="buttons"><div class="button nextWizard">Next ></div><div class="button closeWizard">Cancel</div></div></div>',

    '<div class="left"><img class="left" src="assets/img/txt.svg" /></div><div class="right"><h2>Text</h2> <p><p>You can drag and drop text (<strong>.txt</strong>) from your computer onto the page or you can <strong>double click</strong> to create a new textbox.</p><p>Click Next to continue</p></div><div class="buttons"><div class="button nextWizard">Next ></div><div class="button closeWizard">Cancel</div></div></div>',

    '<div class="left"><img class="left" src="assets/img/time.svg" /></div><div class="right"><h2>Time & Disruptions</h2> <p><p>You will have <strong>' + wizardTime + ' seconds</strong> to complete your publication. During this time, if you\'re not in Demo mode, <strong>unexpected things will happen</strong>. Be ready!</p><p>The file-size limit for the whole publication is <strong>10mb</strong>.</p><p>Click Finish to start the game</p></div><div class="buttons"><label class="wizardneveragain"><input type="checkbox"><span class="checkmark"></span>Don\'t show this wizard again</label><div class="button nextWizard">Finish</div><div class="button closeWizard">Cancel</div></div></div>',
  ]

  var messageHTML = $('<div class="alert wizard"><div class="topbar"></div><img class="close closeAlert" src="/assets/img/x.png" /><div class="alertMessage">' + messageArray[num] + '</div>');
  $('body').append(messageHTML)
  messageHTML.show();
  messageHTML.css('left', ((window.innerWidth/2) - (600/2)) +'px');
  messageHTML.css('top', ((window.innerHeight/2)- (400/2)) +'px');

}

var noWizard = false
$(document).on('click', '.wizardneveragain input', function() {
  if ($(this).attr('checked')) {
    $(this).attr('checked', false)
    noWizard = false
  } else {
    $(this).attr('checked', true)
    noWizard = true
  }
});

var number = 0;
$(document).on('click', ".closeWizard, .wizard .closeAlert", function() {
  if ( noWizard == true ) { // if checkbox is checked
    localStorage.setItem("noWizard", "true")
  }
  $(this).closest('.alert').remove();
  if (!getUrlParameter('demo')) { // if not demo
    countdownWrapper();
  } else {
    initGame()
    soundtrack.play()
  }
});

$(document).on('click', ".nextWizard", function() {
  if ( getUrlParameter('time') ) { // difficulty
    Publication.timeLeft = timeSet = getUrlParameter('time')
  }
  number = number + 1;
  if ( noWizard == true ) { // if checkbox is checked
    localStorage.setItem("noWizard", "true")
  }
  $('.alert').remove();
  if (number <= 3) {
    instructionMessage(number);
  } else {
    if (!getUrlParameter('demo')) { // if not demo
      countdownWrapper();
    } else {
      soundtrack.play()
    }
    number = 0;

  }
});


// --- CONTROLLER

var x;

initCanvases()
function initGame() {
	onModElement()
	if ( getUrlParameter('time') ) { // difficulty
		Publication.timeLeft = timeSet = getUrlParameter('time')
	} else {
    infiniteTime = true
  }
	x = setInterval(function() {
		Publication.timeLeft = Publication.timeLeft - 10;
    if (infiniteTime == false) {
      Publication.timeElapsed = Publication.timeElapsed + 10 / 1000
    } else {
      Publication.timeElapsed = 0
    }
		controller(Publication);
	}, 10)
	mouseCounter()
}
$(document).ready(function() {
  if (window.location.href.indexOf('saved') > 0) { // if it's /saved
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
    Publication.timeElapsed = parseInt(Publication.timeElapsed)

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBERUZBVUxUU1xuXG52YXIgdGltZUxlZnQgPSA5OTk5OTk5OTk5OTk5OVxudmFyIGRpc3J1cHRpb25zT24gPSB0cnVlXG52YXIgZHJvcERlbGF5ID0gMTAwXG52YXIgZGlzcnVwdGlvbkludGVydmFsID0gMTAwMDBcbnZhciBib251c1RpbWUgPSA1MDAwXG52YXIgdGV4dENodW5rc0xlbmd0aCA9IDE1MDBcbnZhciBmb250U2l6ZSA9IDEzXG52YXIgZm9udENvbG9yID0gJyMwMDAnXG52YXIgc2NhbGVGb250ID0gMS41XG52YXIgc2NhbGVVcEltZ3MgPSAwLjdcbnZhciBzY2FsZURvd25JbWdzID0gMC43XG52YXIgYWNoaWV2ZW1lbnRTcGFuID0gM1xudmFyIGRyYXdpbmdNb2RlVGltZSA9IDEwMDAwXG52YXIgaW5maW5pdGVUaW1lID0gZmFsc2VcbnZhciBkZWZhdWx0VGl0bGUgPSAnVW50aXRsZWQnXG52YXIgZGVmYXVsdEF1dGhvcnMgPSAnQW5vbnltb3VzJ1xudmFyIGNhbnZhc1pvb20gPSAxMDAwXG52YXIgbWF4RmlsZVNpemUgPSAxMDQ4NTc2ICsgNDAwMDAwIC8vIDFtYiArIHNvbWUgbWFyZ2luXG52YXIgbWF4UHVibGljYXRpb25TaXplID0gMTA0ODU3NjAgLy8gMTBtYlxuXG5cbmxvcmVtSXBzdW0gPSAnUHJvY2VkdXJhbGl6ZSBwdXQgeW91ciBmZWVsZXJzIG91dCBsZWFuIGludG8gdGhhdCBwcm9ibGVtIG9yIGNyb3NzLXBvbGxpbmF0aW9uLCBvciBwcmV0aGluaywgb3Igd2hlZWxob3VzZS4gVmVydGljYWwgaW50ZWdyYXRpb24gaGlnaGxpZ2h0cyAuIERlc2lnbiB0aGlua2luZyBzYWNyZWQgY293LCB5ZXQgcmFjZSB3aXRob3V0IGEgZmluaXNoIGxpbmUgZ29hbHBvc3RzLidcblxuXG4vLyAtLS0gR0VORVJBTCBGVU5DVElPTlNcblxuZnVuY3Rpb24gbWFrZUlkKCkge1xuXHR2YXIgcmFuZExldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNikpO1xuXHR2YXIgaWQgPSByYW5kTGV0dGVyICsgRGF0ZS5ub3coKTtcblx0cmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBieXRlQ291bnQocykge1xuICAgIHJldHVybiBlbmNvZGVVUkkocykuc3BsaXQoLyUuLnwuLykubGVuZ3RoIC0gMTtcbn1cblxudmFyIGdldFVybFBhcmFtZXRlciA9IGZ1bmN0aW9uIGdldFVybFBhcmFtZXRlcihzUGFyYW0pIHtcbiAgdmFyIHNQYWdlVVJMID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKSxcbiAgICBzVVJMVmFyaWFibGVzID0gc1BhZ2VVUkwuc3BsaXQoJyYnKSxcbiAgICBzUGFyYW1ldGVyTmFtZSxcbiAgICBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBzVVJMVmFyaWFibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgc1BhcmFtZXRlck5hbWUgPSBzVVJMVmFyaWFibGVzW2ldLnNwbGl0KCc9Jyk7XG5cbiAgICBpZiAoc1BhcmFtZXRlck5hbWVbMF0gPT09IHNQYXJhbSkge1xuICAgICAgICByZXR1cm4gc1BhcmFtZXRlck5hbWVbMV0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBzUGFyYW1ldGVyTmFtZVsxXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycmF5KSB7XG4gIGZvciAodmFyIGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgdmFyIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcbiAgICB2YXIgdGVtcCA9IGFycmF5W2ldO1xuICAgIGFycmF5W2ldID0gYXJyYXlbal07XG4gICAgYXJyYXlbal0gPSB0ZW1wO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRpbWVDb252ZXJ0ZXIoVU5JWF90aW1lc3RhbXApe1xuICB2YXIgYSA9IG5ldyBEYXRlKFVOSVhfdGltZXN0YW1wKTtcbiAgdmFyIG1vbnRocyA9IFsnSmFuJywnRmViJywnTWFyJywnQXByJywnTWF5JywnSnVuJywnSnVsJywnQXVnJywnU2VwJywnT2N0JywnTm92JywnRGVjJ107XG4gIHZhciB5ZWFyID0gYS5nZXRGdWxsWWVhcigpO1xuICB2YXIgbW9udGggPSBtb250aHNbYS5nZXRNb250aCgpXTtcbiAgdmFyIGRhdGUgPSBhLmdldERhdGUoKTtcbiAgdmFyIHRpbWUgPSBkYXRlICsgJyAnICsgbW9udGggKyAnICcgKyB5ZWFyO1xuICByZXR1cm4gdGltZTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0Qnl0ZXMoYSxiKXtpZigwPT1hKXJldHVyblwiMCBieXRlc1wiO3ZhciBjPTEwMjQsZD1ifHwyLGU9W1wiYnl0ZXNcIixcImtiXCIsXCJtYlwiLFwiZ2JcIixcInRiXCIsXCJwYlwiLFwiZWJcIixcInpiXCIsXCJ5YlwiXSxmPU1hdGguZmxvb3IoTWF0aC5sb2coYSkvTWF0aC5sb2coYykpO3JldHVybiBwYXJzZUZsb2F0KChhL01hdGgucG93KGMsZikpLnRvRml4ZWQoZCkpK2VbZl19XG5cbmZ1bmN0aW9uIHVwZGF0ZUZpbGVzaXplUHViTGVmdChkYXRhKSB7XG4gIGZpbGVzaXplUHViTGVmdCA9IGZpbGVzaXplUHViTGVmdCAtIGRhdGEubGVuZ3RoXG4gIGlmIChmaWxlc2l6ZVB1YkxlZnQgPiAwKSB7XG4gICAgJCgnLmZpbGVzaXplUHViTGVmdCcpLnRleHQoIGZvcm1hdEJ5dGVzKGZpbGVzaXplUHViTGVmdCkgKyAnICcgKVxuICB9IGVsc2Uge1xuICAgICQoJy5maWxlc2l6ZVB1YkxlZnQnKS50ZXh0KCAnMG1iICcgKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MpIHtcbiAgZnVuY3Rpb24gY2h1bmtTdHJpbmcoc3RyLCBsZW5ndGgpIHtcbiAgICByZXR1cm4gc3RyLm1hdGNoKG5ldyBSZWdFeHAoJ3suMSwnICsgbGVuZ3RoICsgJ30nLCAnZycpKTtcbiAgfVxuXHR2YXIgdGhlTW91c2VQb3MgPSBtb3VzZVBvc1xuXHRpZiAoZWxlbWVudC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykpIHtcblx0XHRmYWJyaWMuSW1hZ2UuZnJvbVVSTChlbGVtZW50LmRhdGEsIGZ1bmN0aW9uKG15SW1nLCBjYWxsYmFjaykge1xuIFx0XHRcdHZhciBpbWcgPSBteUltZy5zZXQoeyBsZWZ0OiAwLCB0b3A6IDAsIHdpZHRoOiBteUltZy53aWR0aCwgaGVpZ2h0OiBteUltZy5oZWlnaHR9KTtcbiBcdFx0XHRpZiAoIGltZy53aWR0aCA+IGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggKSB7XG4gXHRcdFx0XHRpbWcuc2NhbGVUb1dpZHRoKGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggLyAxMDAgKiA1MCApOyAvLyA1MCUgb2YgdGhlIGNhbnZhc1xuIFx0XHRcdH1cbiBcdFx0XHRpbWcubGVmdCA9IHRoZU1vdXNlUG9zLnhcbiBcdFx0XHRpbWcudG9wID0gdGhlTW91c2VQb3MueVxuIFx0XHRcdGltZy5vbignYWRkZWQnLCBmdW5jdGlvbigpIHtcbiBcdFx0XHRcdGNhbGxiYWNrXG4gXHRcdFx0fSlcbiBcdFx0XHRjYW52YXNlc1tlbGVtZW50LnBhZ2VdLmFkZChpbWcpXG5cdFx0fSlcblx0fSBlbHNlIHtcblx0XHR2YXIgZGVCYXNlZFRleHQgPSBhdG9iKGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpKTtcbiAgICBjaHVua3MgPSBkZUJhc2VkVGV4dC5tYXRjaChuZXcgUmVnRXhwKCcoLnxbXFxyXFxuXSl7MSwnICsgdGV4dENodW5rc0xlbmd0aCArICd9JywgJ2cnKSlcbiAgICB2YXIgY3VyclBhZ2UgPSBwYXJzZUludCggZWxlbWVudC5wYWdlLnN1YnN0cihlbGVtZW50LnBhZ2UubGVuZ3RoIC0gMSkgKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY2FudmFzZXNbJ3AnICsgKGN1cnJQYWdlICsgaSldKSB7XG4gICAgICAgIGNhbnZhc2VzWydwJyArIChjdXJyUGFnZSArIGkpXS5hZGQobmV3IGZhYnJpYy5UZXh0Ym94KGNodW5rc1tpXSwge1xuICAgICAgICAgIGZvbnRGYW1pbHk6ICdIZWx2ZXRpY2EnLFxuICAgICAgICAgIGxlZnQ6IDIwLFxuICAgICAgICAgIHRvcDogMjAsXG4gICAgICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgICAgIGZpbGw6IGZvbnRDb2xvcixcbiAgICAgICAgICB3aWR0aDogNDEwLFxuICAgICAgICAgIGJyZWFrV29yZHM6IHRydWUsXG4gICAgICAgICAgb3JpZ2luWDogJ2xlZnQnLFxuICAgICAgICAgIG9yaWdpblk6ICd0b3AnXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH1cblx0fVxufVxuXG5cbi8vIC0tLSBpbml0aWFsaXplIGNhbnZhc2VzXG52YXIgY2FudmFzZXMgPSB7fVxudmFyIGZpbGVzaXplUHViTGVmdCA9IG1heFB1YmxpY2F0aW9uU2l6ZVxubGV0IHRpdGxlXG5sZXQgYXV0aG9yc1xubGV0IHB1YkRhdGVcbmxldCBjb3ZlckxpbmVcbmxldCBpc0xvY2tlZEVkaXRpbmcgPSBmYWxzZVxuZnVuY3Rpb24gaW5pdENhbnZhc2VzKCkge1xuICBmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5vcmlnaW5YID0gZmFicmljLk9iamVjdC5wcm90b3R5cGUub3JpZ2luWSA9ICdjZW50ZXInIC8vIG9yaWdpbiBhdCB0aGUgY2VudGVyXG4gIC8vIGN1dG9taXplZCBjb250cm9sc1xuICBmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5ib3JkZXJDb2xvciA9IGZhYnJpYy5PYmplY3QucHJvdG90eXBlLmNvcm5lckNvbG9yID0gJyNjY2MnXG4gIGZhYnJpYy5PYmplY3QucHJvdG90eXBlLmNvcm5lclNpemUgPSA4XG5cblx0JCgnY2FudmFzJykuZWFjaChmdW5jdGlvbihpKSB7XG5cdFx0Y2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXModGhpcyk7XG5cdCAgY2FudmFzLnNldFdpZHRoKCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykud2lkdGgoKSApO1xuXHRcdGNhbnZhcy5zZXRIZWlnaHQoICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5oZWlnaHQoKSApO1xuICAgIGNhbnZhcy5iYWNrZ3JvdW5kQ29sb3IgPSAnd2hpdGUnO1xuICAgIGNhbnZhcy5pZCA9ICdwJyArIChpKzEpO1xuXG5cdFx0Y2FudmFzZXNbJ3AnICsgKGkgKyAxKV0gPSBjYW52YXM7XG5cbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA+PSAwKSB7IC8vIGlmICBzYXZlZFxuICAgICAgY2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlXG4gICAgfVxuXG5cdH0pO1xuICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA8IDApIHsgLy8gaWYgbm90IHNhdmVkXG5cbiAgICAvLyB0aXRsZVxuICBcdHRpdGxlID0gbmV3IGZhYnJpYy5UZXh0Ym94KCdJbnNlcnQgVGl0bGUnLCB7XG4gIFx0ICB0b3A6IDEyMCxcbiAgXHQgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8nLFxuICBcdCAgZmlsbDogJyM3NzcnLFxuICBcdCAgbGluZUhlaWdodDogMS4xLFxuICBcdCAgZm9udFNpemU6IDMwLFxuICBcdCAgZm9udFdlaWdodDogJ2JvbGQnLFxuICBcdCAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgXHQgIHdpZHRoOiBjYW52YXNlc1sncDEnXS53aWR0aCxcbiAgXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxuICBcdCAgaG92ZXJDdXJzb3I6ICdkZWZhdWx0JyxcbiAgXHQgIG9yaWdpblg6ICdsZWZ0JyxcbiAgXHQgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJyxcbiAgICAgIGNhY2hlOiBmYWxzZVxuICBcdH0pLm9uKCdlZGl0aW5nOmVudGVyZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGhpcy50ZXh0ID09ICdJbnNlcnQgVGl0bGUnKSB7XG4gICAgICAgIHRoaXMudGV4dCA9ICcnXG4gICAgICAgIHRoaXMuaGlkZGVuVGV4dGFyZWEudmFsdWUgPSAnJ1xuICAgICAgfVxuICAgICAgaXNMb2NrZWRFZGl0aW5nID0gdHJ1ZVxuICAgIH0pLm9uKCdjaGFuZ2VkJywgZnVuY3Rpb24oZSkge1xuICAgICAgUHVibGljYXRpb24udGl0bGUgPSB0aGlzLnRleHQucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIikgLy8gcHJldmVudCBjb2RlIGluamVjdGlvblxuICAgICAgdGhpcy50ZXh0ID0gdGhpcy50ZXh0LnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpXG4gICAgfSkub24oJ2VkaXRpbmc6ZXhpdGVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgdGhpcy5zZWxlY3RhYmxlID0gZmFsc2VcbiAgICAgIGlzTG9ja2VkRWRpdGluZyA9IGZhbHNlXG4gICAgICBpZiAodGhpcy50ZXh0ID09ICcnKSB7XG4gICAgICAgIHRoaXMudGV4dCA9ICdJbnNlcnQgVGl0bGUnXG4gICAgICB9XG4gICAgfSlcbiAgXHRjYW52YXNlc1sncDEnXS5hZGQodGl0bGUpXG5cbiAgICAvLyBsaW5lXG4gIFx0dmFyIGxpbmVMZW5naHQgPSAyNTBcbiAgXHRjb3ZlckxpbmUgPSBuZXcgZmFicmljLkxpbmUoWzAsIDAsIGxpbmVMZW5naHQsIDBdLCB7XG4gIFx0XHRsZWZ0OiAoIGNhbnZhc2VzWydwMSddLndpZHRoIC0gbGluZUxlbmdodCkgLyAyLFxuICBcdCAgdG9wOiAxNjAsXG4gIFx0ICBzdHJva2U6ICcjMjIyJyxcbiAgXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxuICBcdCBcdG9yaWdpblg6ICdsZWZ0JyxcbiAgXHQgIG9yaWdpblk6ICd0b3AnXG4gIFx0fSlcbiAgICBjYW52YXNlc1sncDEnXS5hZGQoY292ZXJMaW5lKVxuXG4gICAgLy8gYXV0aG9yc1xuICBcdGF1dGhvcnMgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBBdXRob3JzJywge1xuICBcdCAgdG9wOiAxODAsXG4gIFx0ICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvJyxcbiAgXHQgIGZpbGw6ICcjNzc3JyxcbiAgXHQgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgXHQgIGZvbnRTaXplOiAyMCxcbiAgXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gIFx0ICB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG4gIFx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gIFx0ICBvcmlnaW5YOiAnbGVmdCcsXG4gIFx0ICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgIGlkOiAnbG9jaycsXG4gICAgICBjYWNoZTogZmFsc2VcbiAgXHR9KS5vbignZWRpdGluZzplbnRlcmVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRoaXMudGV4dCA9PSAnSW5zZXJ0IEF1dGhvcnMnKSB7XG4gICAgICAgIHRoaXMudGV4dCA9ICcnXG4gICAgICAgIHRoaXMuaGlkZGVuVGV4dGFyZWEudmFsdWUgPSAnJ1xuICAgICAgfVxuICAgICAgaXNMb2NrZWRFZGl0aW5nID0gdHJ1ZVxuICAgIH0pLm9uKCdjaGFuZ2VkJywgZnVuY3Rpb24oZSkge1xuICAgICAgUHVibGljYXRpb24uYXV0aG9ycyA9IHRoaXMudGV4dC5yZXBsYWNlKC88L2csIFwiJmx0O1wiKS5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKSAvLyBwcmV2ZW50IGNvZGUgaW5qZWN0aW9uXG4gICAgICB0aGlzLnRleHQgPSB0aGlzLnRleHQucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIilcbiAgICB9KS5vbignZWRpdGluZzpleGl0ZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnNlbGVjdGFibGUgPSBmYWxzZVxuICAgICAgaXNMb2NrZWRFZGl0aW5nID0gZmFsc2VcbiAgICAgIGlmICh0aGlzLnRleHQgPT0gJycpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJ0luc2VydCBBdXRob3JzJ1xuICAgICAgfVxuICAgIH0pXG4gICAgY2FudmFzZXNbJ3AxJ10uYWRkKGF1dGhvcnMpXG5cbiAgICAvLyBkYXRlXG4gICAgcHViRGF0ZSA9IG5ldyBmYWJyaWMuVGV4dCggdGltZUNvbnZlcnRlcihQdWJsaWNhdGlvbi5kYXRlKSwge1xuICAgICAgdG9wOiA2MDAsXG4gICAgICBsZWZ0OiBjYW52YXNlc1sncDgnXS53aWR0aC8yLFxuICAgICAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybycsXG4gICAgICBmaWxsOiAnIzc3NycsXG4gICAgICBsaW5lSGVpZ2h0OiAxLjEsXG4gICAgICBmb250U2l6ZTogMTQsXG4gICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXG4gICAgICBob3ZlckN1cnNvcjogJ2RlZmF1bHQnLFxuICAgICAgb3JpZ2luWDogJ2NlbnRlcicsXG4gICAgICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgIGlkOiAnbG9jaydcbiAgICB9KVxuICAgIGNhbnZhc2VzWydwOCddLmFkZChwdWJEYXRlKTtcbiAgICAvLyBmYWJyaWMuSW1hZ2UuZnJvbVVSTChsb2dvRm90b2NvbGVjdGFuaWFCYXNlNjQsIGZ1bmN0aW9uKGltZyl7XG4gICAgLy8gICBpbWcuaGFzQm9yZGVycyA9IGZhbHNlO1xuICAgIC8vICAgaW1nLmhhc0NvbnRyb2xzID0gZmFsc2U7XG4gICAgLy8gICBpbWcuc2VsZWN0YWJsZSA9IGZhbHNlO1xuICAgIC8vICAgaW1nLnNjYWxlKDAuMTIpO1xuICAgIC8vICAgaW1nLmxlZnQgPSBjYW52YXNlc1sncDgnXS53aWR0aC8yO1xuICAgIC8vICAgaW1nLnRvcCA9IDUzMDtcbiAgICAvLyAgIGltZy5sb2NrTW92ZW1lbnRYID0gdHJ1ZTtcbiAgICAvLyAgIGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcbiAgICAvLyAgIGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuICAgIC8vICAgaW1nLnNldENvbnRyb2xzVmlzaWJpbGl0eSA9IGZhbHNlO1xuICAgIC8vICAgaW1nLmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIC8vICAgaW1nLmlkID0gJ2xvY2snO1xuICAgIC8vICAgY2FudmFzZXNbJ3A4J10uYWRkKGltZyk7XG4gICAgLy8gfSlcbiAgfVxuXG4gIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG5cbiAgICBjYW52YXNlc1tjYW52YXNdLm9uKCdtb3VzZTpkYmxjbGljaycsIGZ1bmN0aW9uKGUpIHsgLy8gb24gZG91YmxlIGNsaWNrIGNyZWF0ZSB0ZXh0Ym94XG5cbiAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpIDwgMCkgeyAvLyBpZiBpdCdzIG5vdCBzYXZlZFxuXG4gICAgICAgIG9iaiA9IHRoaXMuZ2V0QWN0aXZlT2JqZWN0KClcbiAgICAgICAgaWYgKG9iaikge1xuICAgICAgICAgIHZhciBpc0VkaXRpbmcgPSBvYmouaXNFZGl0aW5nXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzTG9ja2VkRWRpdGluZyAhPSB0cnVlICYmICFvYmogJiYgdHlwZW9mIGlzRWRpdGluZyA9PSAndW5kZWZpbmVkJykgeyAvLyBpZiBub3QgZWRpdGluZyB0aXRsZSBhbmQgYXV0aG9ycyBhbmQgdGhlcmUgaXMgbm8gc2VsZWN0ZWQgb2JqZWN0IGFuZCBub3QgZWR0aW5nIGFueXRoaW5nIGVsc2VcbiAgICAgICAgICB0ZXh0V2lkdGggPSAyNTBcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbW91c2VQb3MgPSBnZXRNb3VzZVBvcyh0aGlzKVxuICAgICAgICAgIH0gY2F0Y2goZXJyKSB7IC8vIGZpcmVmb3ggTmFOIGJ1Z1xuICAgICAgICAgICAgdmFyIG1vdXNlUG9zID0ge1xuICAgICAgICAgICAgICB4OiB0aGlzLndpZHRoIC8gMiAtIHRleHRXaWR0aC8yLFxuICAgICAgICAgICAgICB5OiB0aGlzLmhlaWdodCAvIDIuNVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxvcmVtVGV4dGJveCA9IG5ldyBmYWJyaWMuVGV4dGJveChsb3JlbUlwc3VtLCB7XG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6ICdIZWx2ZXRpY2EnLFxuICAgICAgICAgICAgICBsZWZ0OiBwYXJzZUludChtb3VzZVBvcy54KSwgLy8gdG8gYXZvaWQgYmx1clxuICAgICAgICAgICAgICB0b3A6IHBhcnNlSW50KG1vdXNlUG9zLnkpLFxuICAgICAgICAgICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICAgICAgICAgIGZpbGw6IGZvbnRDb2xvcixcbiAgICAgICAgICAgICAgd2lkdGg6IDI1MCxcbiAgICAgICAgICAgICAgYnJlYWtXb3JkczogdHJ1ZSxcbiAgICAgICAgICAgICAgb3JpZ2luWDogJ2xlZnQnLFxuICAgICAgICAgICAgICBvcmlnaW5ZOiAndG9wJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICB0aGlzLmFkZChsb3JlbVRleHRib3gpXG4gICAgICAgICAgc2Z4LmJ1dHRvbigpXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgfSlcblxuICB9XG5cbiAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHsgLy8gd2hlbiBzZWxlY3RpbmcgYW4gb2JqZWN0LCBkZXNlbGVjdCBhbGwgdGhlIG9iamVjdHMgb24gb3RoZXIgY2FudmFzZXNcbiAgICBjYW52YXNlc1tjYW52YXNdLm9uKCdvYmplY3Q6c2VsZWN0ZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzQ2FudmFzID0gZS50YXJnZXQuY2FudmFzLmlkXG4gICAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgICBpZiAoY2FudmFzICE9PSBlLnRhcmdldC5jYW52YXMuaWQpIHtcbiAgICAgICAgICBjYW52YXNlc1tjYW52YXNdLmRpc2NhcmRBY3RpdmVPYmplY3QoKS5yZW5kZXJBbGwoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gICQoZG9jdW1lbnQpLmtleWRvd24oZnVuY3Rpb24oZSkgeyAvLyBkZWwgb3IgYmFja3NwYWNlIHRvIGRlbGV0ZVxuICAgIGlmKCBlLndoaWNoID09IDggfHwgZS53aGljaCA9PSA0Nikge1xuICAgICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgICAgb2JqID0gY2FudmFzZXNbY2FudmFzXS5nZXRBY3RpdmVPYmplY3QoKVxuICAgICAgICBpZiAob2JqKSB7XG4gICAgICAgICAgdmFyIGlzRWRpdGluZyA9IG9iai5pc0VkaXRpbmdcbiAgICAgICAgfVxuICAgICAgICBpZiAoIG9iaiAmJiBpc0VkaXRpbmcgIT0gdHJ1ZSApIHsgIC8vIHJlbW92aW5nIG9iamVjdFxuXG4gICAgICAgICAgY2FudmFzZXNbY2FudmFzXS5yZW1vdmUoY2FudmFzZXNbY2FudmFzXS5nZXRBY3RpdmVPYmplY3QoKSk7XG4gICAgICAgICAgY29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyByZW1vdmU6IHRydWUgfSlcblxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KVxuXG59XG5cblxuLy8gLS0tIE0tVi1DXG5cbnZhciBQdWJsaWNhdGlvbiA9IHtcblx0Ly8gYWxsIG91ciBzdGF0ZXNcblx0aWQ6IG1ha2VJZCgpLFxuXHR0aXRsZTogZGVmYXVsdFRpdGxlLFxuXHR0aW1lTGVmdDogdGltZUxlZnQsXG5cdGV4cGlyZWQ6IGZhbHNlLFxuXHRhdXRob3JzOiBkZWZhdWx0QXV0aG9ycyxcbiAgZGF0ZTogRGF0ZS5ub3coKSxcbiAgaW1hZ2VzQW1vdW50OiAwLFxuICB0ZXh0QW1vdW50OiAwLFxuICB0aW1lRWxhcHNlZDogMCxcbiAgYWNoaWV2ZW1lbnRzQW1vdW50OiAwLFxuXHRwYWdlczoge1xuXHRcdHAxOiB7fSxcblx0XHRwMjoge30sXG5cdFx0cDM6IHt9LFxuXHRcdHA0OiB7fSxcblx0XHRwNToge30sXG5cdFx0cDY6IHt9LFxuXHRcdHA3OiB7fSxcblx0XHRwODoge31cblx0fVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihQdWJsaWNhdGlvbiwgaW5wdXQpIHtcblx0aWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkgeyAvLyBub3QgZXhwaXJlZFxuXHRcdHNob3dUaW1lKFB1YmxpY2F0aW9uKVxuXHR9IGVsc2UgeyAgLy8gZXhwaXJlZFxuXHRcdHNob3dFeHBpcmVkKClcblx0fVxuXG5cdGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG5cdFx0c3dpdGNoICh0cnVlKSB7XG5cdFx0XHRjYXNlIGlucHV0LnJlbW92ZSA9PSB0cnVlOiAvLyBkZWxldGluZyBhbiBlbGVtZW50XG4gICAgICAgICAgYWRkVGltZSgtYm9udXNUaW1lKVxuICAgICAgICAgIGNyaXRpY1NheXMoJ1RoaW5rIHR3aWNlIG5leHQgdGltZS4uLicpXG5cdFx0XHRcdFx0YnJlYWtcbiAgICAgIGNhc2UgaW5wdXQuZGF0YSAmJlxuICAgICAgICBmaWxlc2l6ZVB1YkxlZnQgPD0gMDogLy8gcHVibGljYXRpb24gaXMgMTBtYlxuICAgICAgICAgIEVycm9yLnB1YlRvb0JpZygpXG4gICAgICAgICAgYWRkVGltZSgtYm9udXNUaW1lKVxuICAgICAgICAgIGNyaXRpY1NheXMoJ0Vub3VnaCEnKVxuICAgICAgICAgIGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0Ynl0ZUNvdW50KGlucHV0LmRhdGEpID4gbWF4RmlsZVNpemUgOiAvLyBmaWxlIHRvbyBiaWcgKDFtYilcblx0XHRcdFx0IFx0RXJyb3IudG9vQmlnKClcbiAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG4gICAgICAgICAgY3JpdGljU2F5cygnVGhpcyBpcyBub3QgYSBzZXJ2ZXIgZmFybS4nKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IGltYWdlXG5cbiAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UvZ2lmJykpIHsgLy8gbm90IGEgZ2lmXG5cbiAgXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zKTsgLy8gZHJvcCBlbGVtZW50XG5cbiAgICAgICAgICAgIHVwZGF0ZUZpbGVzaXplUHViTGVmdChpbnB1dC5kYXRhKVxuXG4gICAgICAgICAgICBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKz0gMSAvLyBhY2hpZXZlbWVudCBldmVyeSB4IGltZ3NcbiAgICAgICAgICAgIGlmIChQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQlYWNoaWV2ZW1lbnRTcGFuID09IDApIHtcbiAgICAgICAgICAgICAgYWNoaWV2ZW1lbnQoMTAwICogUHVibGljYXRpb24uaW1hZ2VzQW1vdW50LCBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKyAnIGltYWdlcyBhZGRlZCEnKVxuICAgICAgICAgICAgICBQdWJsaWNhdGlvbi5hY2hpZXZlbWVudHNBbW91bnQgKz0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCA9PSAzKSB7IC8vIHNhdmUgcHViIGFmdGVyIGxvYWRpbmcgMyBpbWFnZXNcbiAgICAgICAgICAgICAgJCgnI2RvbmUnKS5jc3MoJ2Rpc3BsYXknLCdpbmxpbmUtYmxvY2snKVxuICAgICAgICAgICAgICBjcml0aWNTYXlzKCdZb3UgY2FuIG5vdyBzYXZlIHlvdXIgcHVibGljYXRpb24hJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHN0YXJ0IGRpc3J1cHRpb25zIGFmdGVyIGZpcnN0IGltYWdlXG4gICAgICAgICAgICBpZiAoICBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgPT0gMSAmJlxuICAgICAgICAgICAgICAgICAgZ2V0VXJsUGFyYW1ldGVyKCdkaXNydXB0aW9ucycpICE9ICdmYWxzZScgJiZcbiAgICAgICAgICAgICAgICAgIGRpc3J1cHRpb25zT24gPT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgICAgdHlwZW9mIHkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHsgLy8gbGF1bmNoIGEgcmFuZG9tIGRpc3J1cHRpb25cbiAgICAgICAgICAgICAgICBkaXNydXB0aW9ucyA9IE9iamVjdC5rZXlzKERpc3J1cHRpb24pXG4gICAgICAgICAgICAgICAgRGlzcnVwdGlvbltkaXNydXB0aW9uc1sgZGlzcnVwdGlvbnMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV0oKVxuICAgICAgICAgICAgICAgIHNoYWtlKHBhZ2VzKVxuICAgICAgICAgICAgICAgIHNmeC5kaXNydXB0aW9uKClcbiAgICAgICAgICAgICAgfSwgZGlzcnVwdGlvbkludGVydmFsKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhZGRUaW1lKGJvbnVzVGltZSlcbiAgXHRcdFx0XHRcdGNyaXRpY1NheXMoKVxuXG4gICAgICAgICAgfSBlbHNlIHsgLy8gYSBnaWZcbiAgICAgICAgICAgIEVycm9yLm5vR2lmcygpXG4gICAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG4gICAgICAgICAgfVxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyB0ZXh0XG5cbiAgICAgICAgICB2YXIgZGVCYXNlZElucHV0ID0gYXRvYihpbnB1dC5kYXRhLnN1YnN0cmluZygyMykpO1xuICAgICAgICAgIGlmIChkZUJhc2VkSW5wdXQuaW5jbHVkZXMoJzxzY3JpcHQ+JykpIHsgLy8gY29kZSBpbmplY3Rpb25cblxuICAgICAgICAgICAgRXJyb3IuY29kZUluamVjdGlvbigpXG4gICAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG4gICAgICAgICAgICBjcml0aWNTYXlzKCdZb3UgZGVzZXJ2ZSB0byBiZSBwdW5pc2hlZC4nKVxuXG4gICAgICAgICAgfSBlbHNlIHtcblxuICBcdFx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQubW91c2VQb3MpIC8vIGRyb3AgZWxlbWVudFxuXG4gICAgICAgICAgICB1cGRhdGVGaWxlc2l6ZVB1YkxlZnQoaW5wdXQuZGF0YSlcblxuICAgICAgICAgICAgUHVibGljYXRpb24udGV4dEFtb3VudCArPSBpbnB1dC5kYXRhLmxlbmd0aFxuICAgICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLnRleHRBbW91bnQgPj0gNTAwKSB7XG4gICAgICAgICAgICAgIGFjaGlldmVtZW50KDUwMCwgJ01vcmUgdGhhbiA1MDAgY2hhcmFjdGVycyBhZGRlZCcpXG4gICAgICAgICAgICAgIFB1YmxpY2F0aW9uLmFjaGlldmVtZW50c0Ftb3VudCArPSAxXG4gICAgICAgICAgICB9XG5cbiAgXHRcdFx0XHRcdGFkZFRpbWUoYm9udXNUaW1lICogMilcbiAgICAgICAgICAgIGNyaXRpY1NheXMoJ1RoaXMgaXMgZ29ubmEgYmUgYSBnb29vb29vZCByZWFkJylcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJyk6IC8vIG5laXRoZXIgYW4gaW1hZ2Ugbm9yIHRleHRcblx0XHRcdFx0XHRFcnJvci5ub3RBbGxvd2VkKClcbiAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQubW92ZSA9PSB0cnVlIDogLy8gbW92aW5nIG9yIHNjYWxpbmcgYW4gaW1hZ2Vcblx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dC5wYWdlXSA9IGNhbnZhc2VzW2lucHV0LnBhZ2VdLnRvSlNPTigpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH0gZWxzZSBpZiAoaW5wdXQgJiYgaW5wdXQubW92ZSAhPT0gdHJ1ZSAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IHRydWUpIHtcblx0XHQvLyB0b28gbGF0ZVxuXHRcdEVycm9yLnRvb0xhdGUoKTtcblx0fVxufVxuXG5cbi8vIC0tLSBQUkVDT05UUk9MTEVSXG5cbmZ1bmN0aW9uIGNvdW50ZG93bldyYXBwZXIoKSB7XG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGFuaW1hdGVVcCgkKCcjY291bnRlcicpKTtcblxuXG4gICAgZnVuY3Rpb24gY291bnRkb3duKHN0YXJ0VGltZSkge1xuICAgICAgYW5pbWF0ZVVwT3V0KCQoJyNjb3VudGRvd25XcmFwcGVyJyksIDEwMDApXG5cbiAgICAgIHN3aXRjaCAoc3RhcnRUaW1lKSB7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAkKCcjY291bnRkb3duJykuaHRtbCgnPHNwYW4+UHJlcGFyZSB5b3VyIDxzcGFuIGNsYXNzPVwicGVyaXNoXCI+QXNzZXRzITwvc3Bhbj48L3NwYW4+Jyk7XG4gICAgICAgICAgc2Z4LmNvdW50ZG93bigpXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAkKCcjY291bnRkb3duJykuaHRtbCgnPHNwYW4+Q3JlYXRlIHlvdXIgPHNwYW4gY2xhc3M9XCJwZXJpc2hcIj5MYXlvdXQhPC9zcGFuPjwvc3Bhbj4nKTtcbiAgICAgICAgICBzZnguY291bnRkb3duKClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICQoJyNjb3VudGRvd24nKS5odG1sKCc8c3Bhbj5QdWJsaXNoIG9yIDxzcGFuIGNsYXNzPVwicGVyaXNoXCI+UGVyaXNoITwvc3Bhbj48L3NwYW4+Jyk7XG4gICAgICAgICAgc2Z4LmNvdW50ZG93bigpXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICB9XG5cbiAgICAgIHN0YXJ0VGltZSA9IHN0YXJ0VGltZSAtIDE7XG4gICAgICBpZiAoc3RhcnRUaW1lID49IDApIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY291bnRkb3duKHN0YXJ0VGltZSk7XG4gICAgICAgIH0sIDEzMDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2Z4LmNvdW50ZG93blJlYWR5KClcbiAgICAgICAgc291bmR0cmFjay5wbGF5KClcbiAgICAgICAgaW5pdEdhbWUoKVxuICAgICAgICAkKCcjY291bnRkb3duV3JhcHBlcicpLnJlbW92ZSgpO1xuICAgICAgICAkKCcuY291bnRlcicpLmZhZGVJbigzMDApO1xuICAgICAgICBpZiAoIGdldFVybFBhcmFtZXRlcigndGltZScpICkgeyAvLyBkaWZmaWN1bHR5XG4gICAgICAgICAgUHVibGljYXRpb24udGltZUxlZnQgPSBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzdGFydFRpbWUgPSAzO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgY291bnRkb3duKHN0YXJ0VGltZSlcbiAgICB9LCAyMDApXG4gIH0pO1xufVxuXG5pZiAoIWdldFVybFBhcmFtZXRlcignZGVtbycpICYmIHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJy9zYXZlZCcpIDw9IC0xKSB7IC8vIGlmIG5vdCBkZW1vIGFuZCBub3QgL3NhdmVkXG4gICQoJy5jb3VudGVyJykuaGlkZSgpO1xuICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJub1dpemFyZFwiKSAhPSBcInRydWVcIikge1xuICAgIGluc3RydWN0aW9uTWVzc2FnZSgwKTsgIC8vIHNob3cgd2l6YXJkXG4gIH0gZWxzZSBpZiAoIWdldFVybFBhcmFtZXRlcignZGVtbycpKSB7XG4gICAgY291bnRkb3duV3JhcHBlcigpXG4gIH1cbn0gZWxzZSBpZiAoZ2V0VXJsUGFyYW1ldGVyKCdkZW1vJykpIHsgLy8gaWYgZGVtb1xuICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJub1dpemFyZFwiKSAhPSBcInRydWVcIikge1xuICAgIGluc3RydWN0aW9uTWVzc2FnZSgwKTtcbiAgfSBlbHNlIHtcbiAgICBpbml0R2FtZSgpXG4gICAgc291bmR0cmFjay5wbGF5KClcbiAgfVxufVxuXG5cblxuZnVuY3Rpb24gaW5zdHJ1Y3Rpb25NZXNzYWdlKG51bSkge1xuICB2YXIgd2l6YXJkVGltZSA9ICggZ2V0VXJsUGFyYW1ldGVyKCdkZW1vJykgKSA/ICfiiJ4nIDogUHVibGljYXRpb24udGltZUxlZnRcblxuICB2YXIgbWVzc2FnZUFycmF5ID0gW1xuICAgICc8ZGl2IGNsYXNzPVwibGVmdFwiPjxpbWcgY2xhc3M9XCJsZWZ0XCIgc3JjPVwiYXNzZXRzL2ltZy9hY2hpZXZlbWVudC5wbmdcIiAvPjwvZGl2PjxkaXYgY2xhc3M9XCJyaWdodFwiPjxoMj5XZWxjb21lIHRvIFB1Ymxpc2ggb3IgUGVyaXNoISBJbnN0cnVjdGlvbnMgV2l6YXJkPC9oMj4gPHA+VGhpcyB3aXphcmQgd2lsbCBndWlkZSB5b3UgdGhyb3VnaCB0aGUgd29ya2Zsb3cgb2YgPGVtPlB1Ymxpc2ggb3IgUGVyaXNoITwvZW0+LiBJdCBpcyByZWNvbW1lbmRlZCB0byA8c3Ryb25nPnByZXBhcmUgYSBkaXJlY3Rvcnkgb2YgZmlsZXM8L3N0cm9uZz4gZm9yIHlvdXIgcHVibGljYXRpb24gaW4gYWR2YW5jZS48L3A+PHA+Q2xpY2sgTmV4dCB0byBDb250aW51ZTwvcD48L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uc1wiPjxkaXYgY2xhc3M9XCJidXR0b24gbmV4dFdpemFyZFwiPk5leHQgPjwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b24gY2xvc2VXaXphcmRcIj5DYW5jZWw8L2Rpdj48L2Rpdj48L2Rpdj4nLFxuXG4gICAgJzxkaXYgY2xhc3M9XCJsZWZ0XCI+PGltZyBjbGFzcz1cImxlZnRcIiBzcmM9XCJhc3NldHMvaW1nL2pwZy5zdmdcIiAvPjwvZGl2PjxkaXYgY2xhc3M9XCJyaWdodFwiPjxoMj5JbWFnZXM8L2gyPiA8cD48cD5Zb3UgY2FuIGRyYWcgYW5kIGRyb3AgaW1hZ2VzICg8c3Ryb25nPi5qcGcsIC5wbmcgPC9zdHJvbmc+KSBmcm9tIHlvdXIgY29tcHV0ZXIgb250byB0aGUgcGFnZS4gVGhlc2UgaW1hZ2VzIGNhbiBiZSA8c3Ryb25nPm1vdmVkPC9zdHJvbmc+LCA8c3Ryb25nPnNjYWxlZDwvc3Ryb25nPiBhbmQgPHN0cm9uZz5yb3RhdGVkPC9zdHJvbmc+LjwvcD48cD5UaGUgZmlsZS1zaXplIGxpbWl0IGlzIDxzdHJvbmc+MW1iPC9zdHJvbmc+LjwvcD48cD5DbGljayBOZXh0IHRvIENvbnRpbnVlPC9wPjwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b25zXCI+PGRpdiBjbGFzcz1cImJ1dHRvbiBuZXh0V2l6YXJkXCI+TmV4dCA+PC9kaXY+PGRpdiBjbGFzcz1cImJ1dHRvbiBjbG9zZVdpemFyZFwiPkNhbmNlbDwvZGl2PjwvZGl2PjwvZGl2PicsXG5cbiAgICAnPGRpdiBjbGFzcz1cImxlZnRcIj48aW1nIGNsYXNzPVwibGVmdFwiIHNyYz1cImFzc2V0cy9pbWcvdHh0LnN2Z1wiIC8+PC9kaXY+PGRpdiBjbGFzcz1cInJpZ2h0XCI+PGgyPlRleHQ8L2gyPiA8cD48cD5Zb3UgY2FuIGRyYWcgYW5kIGRyb3AgdGV4dCAoPHN0cm9uZz4udHh0PC9zdHJvbmc+KSBmcm9tIHlvdXIgY29tcHV0ZXIgb250byB0aGUgcGFnZSBvciB5b3UgY2FuIDxzdHJvbmc+ZG91YmxlIGNsaWNrPC9zdHJvbmc+IHRvIGNyZWF0ZSBhIG5ldyB0ZXh0Ym94LjwvcD48cD5DbGljayBOZXh0IHRvIGNvbnRpbnVlPC9wPjwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b25zXCI+PGRpdiBjbGFzcz1cImJ1dHRvbiBuZXh0V2l6YXJkXCI+TmV4dCA+PC9kaXY+PGRpdiBjbGFzcz1cImJ1dHRvbiBjbG9zZVdpemFyZFwiPkNhbmNlbDwvZGl2PjwvZGl2PjwvZGl2PicsXG5cbiAgICAnPGRpdiBjbGFzcz1cImxlZnRcIj48aW1nIGNsYXNzPVwibGVmdFwiIHNyYz1cImFzc2V0cy9pbWcvdGltZS5zdmdcIiAvPjwvZGl2PjxkaXYgY2xhc3M9XCJyaWdodFwiPjxoMj5UaW1lICYgRGlzcnVwdGlvbnM8L2gyPiA8cD48cD5Zb3Ugd2lsbCBoYXZlIDxzdHJvbmc+JyArIHdpemFyZFRpbWUgKyAnIHNlY29uZHM8L3N0cm9uZz4gdG8gY29tcGxldGUgeW91ciBwdWJsaWNhdGlvbi4gRHVyaW5nIHRoaXMgdGltZSwgaWYgeW91XFwncmUgbm90IGluIERlbW8gbW9kZSwgPHN0cm9uZz51bmV4cGVjdGVkIHRoaW5ncyB3aWxsIGhhcHBlbjwvc3Ryb25nPi4gQmUgcmVhZHkhPC9wPjxwPlRoZSBmaWxlLXNpemUgbGltaXQgZm9yIHRoZSB3aG9sZSBwdWJsaWNhdGlvbiBpcyA8c3Ryb25nPjEwbWI8L3N0cm9uZz4uPC9wPjxwPkNsaWNrIEZpbmlzaCB0byBzdGFydCB0aGUgZ2FtZTwvcD48L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uc1wiPjxsYWJlbCBjbGFzcz1cIndpemFyZG5ldmVyYWdhaW5cIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCI+PHNwYW4gY2xhc3M9XCJjaGVja21hcmtcIj48L3NwYW4+RG9uXFwndCBzaG93IHRoaXMgd2l6YXJkIGFnYWluPC9sYWJlbD48ZGl2IGNsYXNzPVwiYnV0dG9uIG5leHRXaXphcmRcIj5GaW5pc2g8L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uIGNsb3NlV2l6YXJkXCI+Q2FuY2VsPC9kaXY+PC9kaXY+PC9kaXY+JyxcbiAgXVxuXG4gIHZhciBtZXNzYWdlSFRNTCA9ICQoJzxkaXYgY2xhc3M9XCJhbGVydCB3aXphcmRcIj48ZGl2IGNsYXNzPVwidG9wYmFyXCI+PC9kaXY+PGltZyBjbGFzcz1cImNsb3NlIGNsb3NlQWxlcnRcIiBzcmM9XCIvYXNzZXRzL2ltZy94LnBuZ1wiIC8+PGRpdiBjbGFzcz1cImFsZXJ0TWVzc2FnZVwiPicgKyBtZXNzYWdlQXJyYXlbbnVtXSArICc8L2Rpdj4nKTtcbiAgJCgnYm9keScpLmFwcGVuZChtZXNzYWdlSFRNTClcbiAgbWVzc2FnZUhUTUwuc2hvdygpO1xuICBtZXNzYWdlSFRNTC5jc3MoJ2xlZnQnLCAoKHdpbmRvdy5pbm5lcldpZHRoLzIpIC0gKDYwMC8yKSkgKydweCcpO1xuICBtZXNzYWdlSFRNTC5jc3MoJ3RvcCcsICgod2luZG93LmlubmVySGVpZ2h0LzIpLSAoNDAwLzIpKSArJ3B4Jyk7XG5cbn1cblxudmFyIG5vV2l6YXJkID0gZmFsc2VcbiQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcud2l6YXJkbmV2ZXJhZ2FpbiBpbnB1dCcsIGZ1bmN0aW9uKCkge1xuICBpZiAoJCh0aGlzKS5hdHRyKCdjaGVja2VkJykpIHtcbiAgICAkKHRoaXMpLmF0dHIoJ2NoZWNrZWQnLCBmYWxzZSlcbiAgICBub1dpemFyZCA9IGZhbHNlXG4gIH0gZWxzZSB7XG4gICAgJCh0aGlzKS5hdHRyKCdjaGVja2VkJywgdHJ1ZSlcbiAgICBub1dpemFyZCA9IHRydWVcbiAgfVxufSk7XG5cbnZhciBudW1iZXIgPSAwO1xuJChkb2N1bWVudCkub24oJ2NsaWNrJywgXCIuY2xvc2VXaXphcmQsIC53aXphcmQgLmNsb3NlQWxlcnRcIiwgZnVuY3Rpb24oKSB7XG4gIGlmICggbm9XaXphcmQgPT0gdHJ1ZSApIHsgLy8gaWYgY2hlY2tib3ggaXMgY2hlY2tlZFxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibm9XaXphcmRcIiwgXCJ0cnVlXCIpXG4gIH1cbiAgJCh0aGlzKS5jbG9zZXN0KCcuYWxlcnQnKS5yZW1vdmUoKTtcbiAgaWYgKCFnZXRVcmxQYXJhbWV0ZXIoJ2RlbW8nKSkgeyAvLyBpZiBub3QgZGVtb1xuICAgIGNvdW50ZG93bldyYXBwZXIoKTtcbiAgfSBlbHNlIHtcbiAgICBpbml0R2FtZSgpXG4gICAgc291bmR0cmFjay5wbGF5KClcbiAgfVxufSk7XG5cbiQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiLm5leHRXaXphcmRcIiwgZnVuY3Rpb24oKSB7XG4gIGlmICggZ2V0VXJsUGFyYW1ldGVyKCd0aW1lJykgKSB7IC8vIGRpZmZpY3VsdHlcbiAgICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IHRpbWVTZXQgPSBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKVxuICB9XG4gIG51bWJlciA9IG51bWJlciArIDE7XG4gIGlmICggbm9XaXphcmQgPT0gdHJ1ZSApIHsgLy8gaWYgY2hlY2tib3ggaXMgY2hlY2tlZFxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibm9XaXphcmRcIiwgXCJ0cnVlXCIpXG4gIH1cbiAgJCgnLmFsZXJ0JykucmVtb3ZlKCk7XG4gIGlmIChudW1iZXIgPD0gMykge1xuICAgIGluc3RydWN0aW9uTWVzc2FnZShudW1iZXIpO1xuICB9IGVsc2Uge1xuICAgIGlmICghZ2V0VXJsUGFyYW1ldGVyKCdkZW1vJykpIHsgLy8gaWYgbm90IGRlbW9cbiAgICAgIGNvdW50ZG93bldyYXBwZXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc291bmR0cmFjay5wbGF5KClcbiAgICB9XG4gICAgbnVtYmVyID0gMDtcblxuICB9XG59KTtcblxuXG4vLyAtLS0gQ09OVFJPTExFUlxuXG52YXIgeDtcblxuaW5pdENhbnZhc2VzKClcbmZ1bmN0aW9uIGluaXRHYW1lKCkge1xuXHRvbk1vZEVsZW1lbnQoKVxuXHRpZiAoIGdldFVybFBhcmFtZXRlcigndGltZScpICkgeyAvLyBkaWZmaWN1bHR5XG5cdFx0UHVibGljYXRpb24udGltZUxlZnQgPSB0aW1lU2V0ID0gZ2V0VXJsUGFyYW1ldGVyKCd0aW1lJylcblx0fSBlbHNlIHtcbiAgICBpbmZpbml0ZVRpbWUgPSB0cnVlXG4gIH1cblx0eCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgLSAxMDtcbiAgICBpZiAoaW5maW5pdGVUaW1lID09IGZhbHNlKSB7XG4gICAgICBQdWJsaWNhdGlvbi50aW1lRWxhcHNlZCA9IFB1YmxpY2F0aW9uLnRpbWVFbGFwc2VkICsgMTAgLyAxMDAwXG4gICAgfSBlbHNlIHtcbiAgICAgIFB1YmxpY2F0aW9uLnRpbWVFbGFwc2VkID0gMFxuICAgIH1cblx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uKTtcblx0fSwgMTApXG5cdG1vdXNlQ291bnRlcigpXG59XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPiAwKSB7IC8vIGlmIGl0J3MgL3NhdmVkXG4gICAgcmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pXG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBhZGRUaW1lKGJvbnVzVGltZSkge1xuXHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICsgYm9udXNUaW1lO1xuXHRhbmltYXRldGltZWNvdW50ZXIoYm9udXNUaW1lLzEwMDApO1xuICBpZiAoYm9udXNUaW1lID49IDApIHtcbiAgICBzZnguYWRkVGltZVBsdXMoKVxuICB9IGVsc2Uge1xuICAgIHNmeC5hZGRUaW1lTWludXMoKVxuICB9XG59XG5cbi8vIG1vZGlmeSBlbGVtZW50IGxpc3RlbmVyXG5mdW5jdGlvbiBvbk1vZEVsZW1lbnQoKSB7XG5cdGZvciAodmFyIHBhZ2VJZCBpbiBjYW52YXNlcykge1xuXHRcdGNhbnZhc2VzWyBwYWdlSWQgXS5vbignb2JqZWN0Om1vZGlmaWVkJywgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgcGFyZW50Q2FudmFzSWQgPSBldnQudGFyZ2V0LmNhbnZhcy5sb3dlckNhbnZhc0VsLmlkXG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IG1vdmU6IHRydWUsIHBhZ2U6IHBhcmVudENhbnZhc0lkfSlcblx0XHR9KVxuXHR9XG59XG5cbi8vIGdldCBtb3VzZSBwb3NpdGlvbiBvbiBjYW52YXNcbmZ1bmN0aW9uIGdldE1vdXNlUG9zKGNhbnZhcywgZSkge1xuICB2YXIgcG9pbnRlciA9IGNhbnZhcy5nZXRQb2ludGVyKGUpXG4gIHZhciBwb3NYID0gcG9pbnRlci54XG4gIHZhciBwb3NZID0gcG9pbnRlci55XG4gIHJldHVybiB7XG4gICAgeDogcG9zWCxcbiAgICB5OiBwb3NZXG4gIH1cbn1cblxuY29uc3QgcGFnZXMgPSAkKCcucGFnZScpXG4vLyBkcm9wIGVsZW1lbnRcbnBhZ2VzLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKHRoaXMpLmFkZENsYXNzKCdkcm9wcGFibGUnKTtcbn0pO1xucGFnZXMub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKCcuZHJvcHBhYmxlJykucmVtb3ZlQ2xhc3MoJ2Ryb3BwYWJsZScpO1xufSk7XG5wYWdlcy5vbignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKCcuZHJvcHBhYmxlJykucmVtb3ZlQ2xhc3MoJ2Ryb3BwYWJsZScpO1xuXHR2YXIgZmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzO1xuXHR2YXIgeSA9IDA7XG5cdGZvciAodmFyIGkgPSBmaWxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0dmFyIHBhZ2VJZCA9ICQodGhpcykuZmluZCgnY2FudmFzJykuYXR0cignaWQnKTtcblx0XHRtb3VzZVBvcyA9IGdldE1vdXNlUG9zKGNhbnZhc2VzW3BhZ2VJZF0sIGUpXG5cdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdFx0XHRcdGRhdGE6IGV2ZW50LnRhcmdldC5yZXN1bHQsXG5cdFx0XHRcdFx0dmlzaWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRwYWdlOiBwYWdlSWQsXG5cdFx0XHRcdFx0bW91c2VQb3M6IG1vdXNlUG9zXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgeSAqIGRyb3BEZWxheSk7XG5cdFx0XHR5ICs9IDE7XG5cdFx0fVxuXHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGVzW2ldKVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn0pO1xuLy8gcHJldmVudCBkcm9wIG9uIGJvZHlcbiQoJ2JvZHknKS5vbignZHJhZ292ZXInLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKVxufSlcbiQoJ2JvZHknKS5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KClcbn0pXG4kKCdib2R5Jykub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKVxuICBzZnguZXJyb3IoKVxufSlcblxuXG5cblxuXG5cblxuLy8gLS0tIFZJRVdcblxuXG4vLyBUT0RPOiBtZXJnZSB0aGVzZSB0d29cbmZ1bmN0aW9uIHBhZChuLCBsZW4pIHtcbiAgcmV0dXJuIChuZXcgQXJyYXkobGVuICsgMSkuam9pbignMCcpICsgbikuc2xpY2UoLWxlbik7XG59XG5cblxuZnVuY3Rpb24gc2hvd1RpbWUoUHVibGljYXRpb24pIHtcblx0c2Vjb25kcyA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMTAwMDtcblx0JCgnI2NvdW50ZXInKS5zaG93KCk7XG5cdHZhciBtaW51dGVzID0gTWF0aC5mbG9vcihzZWNvbmRzIC8gNjApO1xuXHR2YXIgc2Vjb25kcyA9IHNlY29uZHMgJSA2MDtcblx0dmFyIG1zO1xuXHRpZiAoISFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpKSB7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgZCA9IG5ldyBEYXRlKCk7XG5cdFx0XHRtcyA9IGQuZ2V0TWlsbGlzZWNvbmRzKCk7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLmlubmVySFRNTCA9IHBhZChtaW51dGVzLCAyKSArICc6JyArIHBhZChzZWNvbmRzLnRvRml4ZWQoMCksIDIpICsgJzonICsgcGFkKG1zLnRvU3RyaW5nKCkuc3Vic3RyKDAsMiksIDIpICsgJyBsZWZ0ISc7XG5cdFx0XHRpZiAobWludXRlcyA8PSAwICYmIHNlY29uZHMgPD0gMjApIHtcblxuXHRcdFx0XHR2YXIgc2l6ZSA9ICgxLjM0NDQ0NDQ0IC0gKHNlY29uZHMgLyA2MCkpO1xuXHRcdFx0XHQkKCcuY291bnRlcicpLmNzcygndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyBzaXplICsgJyknKTtcblxuXHRcdFx0XHRzd2l0Y2ggKHNlY29uZHMpIHtcblx0XHRcdFx0XHRjYXNlIDU6XG5cdFx0XHRcdFx0XHRzZnguZXJyb3IoKVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRcdFx0c2Z4LmVycm9yKClcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRcdHNmeC5lcnJvcigpXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdFx0XHRzZnguZXJyb3IoKVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRcdFx0c2Z4LmVycm9yKClcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sIDEpXG5cdH0gZWxzZSB7XG5cdFx0Ly8gY29uc29sZS5sb2coJ2Vycm9yJyk7XG5cdH1cbn1cbmZ1bmN0aW9uIG1vdXNlQ291bnRlcigpIHtcblx0JChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXHRcdGlmIChlLnBhZ2VYID49ICQoZG9jdW1lbnQpLndpZHRoKCkgLyAyKSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCArIDIwLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG4gIGlmIChQdWJsaWNhdGlvbi5leHBpcmVkICE9IHRydWUpIHtcbiAgICBzb3VuZHRyYWNrLnN0b3AoKVxuICAgIFB1YmxpY2F0aW9uLmV4cGlyZWQgPSB0cnVlXG4gICAgUHVibGljYXRpb24udGltZUVsYXBzZWQgPSBwYXJzZUludChQdWJsaWNhdGlvbi50aW1lRWxhcHNlZClcblxuICAgIC8vIGxvY2tpbmcgZWxlbWVudHNcbiAgICBsb2NrRWxlbWVudHMoYWxsRWxlbWVudHMoKSlcbiAgICBpZiAodGl0bGUudGV4dCA9PSAnSW5zZXJ0IFRpdGxlJykge1xuICAgICAgdGl0bGUudGV4dCA9IGRlZmF1bHRUaXRsZVxuICAgIH1cbiAgICBpZiAoYXV0aG9ycy50ZXh0ID09ICdJbnNlcnQgQXV0aG9ycycpIHtcbiAgICAgIGF1dGhvcnMudGV4dCA9IGRlZmF1bHRBdXRob3JzXG4gICAgfVxuICAgIHRpdGxlLmV4aXRFZGl0aW5nKClcbiAgICBhdXRob3JzLmV4aXRFZGl0aW5nKClcbiAgICB0aXRsZS5zZWxlY3RhYmxlID0gdGl0bGUuYXV0aG9ycyA9IGZhbHNlXG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uc2VsZWN0YWJsZSA9IGZhbHNlXG4gICAgICBjYW52YXNlc1tjYW52YXNdLmRpc2NhcmRBY3RpdmVPYmplY3QoKS5yZW5kZXJBbGwoKVxuICAgIH1cblxuICAgIGVsZW1lbnRzQW1vdW50ID0gMFxuICAgIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgICBlbGVtZW50c0Ftb3VudCA9IGVsZW1lbnRzQW1vdW50ICsgY2FudmFzZXNbY2FudmFzXS5nZXRPYmplY3RzKCkubGVuZ3RoXG4gICAgfVxuICAgIGlmIChlbGVtZW50c0Ftb3VudCA8PSA1KSB7XG4gICAgICAkKCcudHJ5YWdhaW4nKS5jc3MoJ2Rpc3BsYXknLCdpbmxpbmUtYmxvY2snKVxuICAgICAgJCgnLnNhdmUnKS5oaWRlKClcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgRXJyb3Iubm9Db250ZW50KClcbiAgICAgIH0sIDIwMDApXG4gICAgfSBlbHNlIHtcblxuICAgIH1cblxuICAgIHNob3dQdWJsaWNhdGlvbkRhdGEoUHVibGljYXRpb24pXG5cbiAgICBpZiAoIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykgKSB7XG4gIFx0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIH1cbiAgXHQkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKVxuICBcdGV4cGlyZWRUaW1lKClcbiAgICBzZngucGVyaXNoZWQoKVxuICBcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICBcdFx0JCgnLndyYXBwZXInKS5hZGRDbGFzcygnc2F2ZWRfdmlldycpO1xuICBcdFx0c2F2ZWRTdGF0ZSgpXG4gIFx0fSwgNTAwKVxuICBcdGNsZWFySW50ZXJ2YWwoeCkgLy8gY2xlYXIgY29udHJvbGxlclxuICAgIGlmICh0eXBlb2YgeSAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gaWYgZGlzcnVwdGlvbnNcbiAgICAgIGNsZWFySW50ZXJ2YWwoeSkgLy8gY2xlYXIgZGlzcnVwdGlvbnNcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJvcEVsZW1lbnQocGFnZUlkLCBkYXRhLCBtb3VzZVBvcykge1xuXHR2YXIgZWxlbWVudCA9IHsgZGF0YTogZGF0YSwgcGFnZTogcGFnZUlkIH1cblx0dmFyIGVsZW1lbnRQb3MgPSBjcmVhdGVFbGVtZW50KGVsZW1lbnQsIG1vdXNlUG9zKVxufVxuXG5cblxuXG5cblxuXG5cbi8vIGVycm9yc1xuXG52YXIgRXJyb3IgPSB7XG5cdG5vdEFsbG93ZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdGFsZXJ0TWVzc2FnZSgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgbm90IGFsbG93ZWQhJylcblx0fSxcblx0dG9vQmlnOiBmdW5jdGlvbigpIHtcblx0XHRhbGVydE1lc3NhZ2UoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIHRvbyBiaWchJylcblx0fSxcbiAgcHViVG9vQmlnOiBmdW5jdGlvbigpIHtcbiAgICBhbGVydE1lc3NhZ2UoJ1lvdSByZWFjaGVkIHRoZSBsaW1pdCBvZiAxMG1iIGZvciB0aGlzIHB1YmxpY2F0aW9uLiBZb3UgY2FuIHN0aWxsIHdvcmsgb24gdGhlIGxheW91dCBhbmQgc2F2ZSB0aGUgcHVibGljYXRpb24uJylcbiAgfSxcbiAgbm9HaWZzOiBmdW5jdGlvbigpIHtcbiAgICBhbGVydE1lc3NhZ2UoJ0dpZnMgYXJlIG5vdCBhbGxvd2VkLiAoVGhpcyBzdWNrcywgSSBrbm93Li4uKScpXG4gIH0sXG5cdHRvb0xhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdGFsZXJ0TWVzc2FnZSgnVG9vIGxhdGUgYW1pZ28nKVxuICAgIHNmeC5lcnJvcigpXG5cdH0sXG4gIGNvZGVJbmplY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIGFsZXJ0TWVzc2FnZSgnSGV5IGhhY2tlciwgeW91XFwncmUgdHJ5aW5nIHRvIGluamVjdCBjb2RlLiBQbGVhc2UgZG9uXFwndC4nKVxuICB9LFxuICBub0NvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuICAgIGFsZXJ0TWVzc2FnZSgnWW91IGRpZG5cXCd0IHVwbG9hZCBhbnkgaW1hZ2Ugb3IgdGV4dCA6KCcpXG4gICAgc2Z4LmVycm9yKClcbiAgfVxufVxuXG5cblxuXG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiBzaG93UHVibGljYXRpb25EYXRhKFB1YmxpY2F0aW9uKSB7XG4gICQoJy50aXRsZScpLnRleHQoIFB1YmxpY2F0aW9uLnRpdGxlIClcbiAgJCgnLmF1dGhvcnMgc3BhbjpsYXN0LWNoaWxkJykudGV4dCggUHVibGljYXRpb24uYXV0aG9ycyApXG4gICQoJy5kYXRlIHNwYW46bGFzdC1jaGlsZCcpLnRleHQoIHRpbWVDb252ZXJ0ZXIoIE51bWJlcihQdWJsaWNhdGlvbi5kYXRlKSkgKVxuICAkKCcuaW1hZ2VzYW1vdW50IHNwYW46bGFzdC1jaGlsZCcpLnRleHQoIFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCApXG4gICQoJy50ZXh0YW1vdW50IHNwYW46bGFzdC1jaGlsZCcpLnRleHQoIFB1YmxpY2F0aW9uLnRleHRBbW91bnQgKyAnIGNoYXJzJyApXG4gICQoJy5lbGFwc2VkdGltZSBzcGFuOmxhc3QtY2hpbGQnKS50ZXh0KCBQdWJsaWNhdGlvbi50aW1lRWxhcHNlZCArICcgcycgKVxuICAkKCcuYWNoaWV2ZW1lbnRzYW1vdW50IHNwYW46bGFzdC1jaGlsZCcpLnRleHQoIFB1YmxpY2F0aW9uLmFjaGlldmVtZW50c0Ftb3VudCApXG59XG5cbmZ1bmN0aW9uIHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKSB7XG4gIGZ1bmN0aW9uIHJlbmRlclBhZ2UoaW1nLCBjYW52YXNJZCkge1xuICAgIGZhYnJpYy5JbWFnZS5mcm9tVVJMKGltZywgZnVuY3Rpb24oaW1nKXtcbiAgICAgICAgaW1nLmhhc0JvcmRlcnMgPSBmYWxzZTtcbiAgICAgICAgaW1nLmhhc0NvbnRyb2xzID0gZmFsc2U7XG4gICAgICAgIGltZy5zZWxlY3RhYmxlID0gZmFsc2U7XG4gICAgICAgIGltZy5sZWZ0ID0gY2FudmFzZXNbY2FudmFzSWRdLndpZHRoIC8gMjtcbiAgICAgICAgaW1nLnRvcCA9IGNhbnZhc2VzW2NhbnZhc0lkXS5oZWlnaHQgLyAyO1xuICAgICAgICBpbWcuc2NhbGVYID0gY2FudmFzZXNbY2FudmFzSWRdLndpZHRoIC8gaW1nLndpZHRoO1xuICAgICAgICBpbWcuc2NhbGVZID0gY2FudmFzZXNbY2FudmFzSWRdLmhlaWdodCAvIGltZy5oZWlnaHQ7XG4gICAgICAgIGltZy5sb2NrTW92ZW1lbnRYID0gdHJ1ZTtcbiAgICAgICAgaW1nLmxvY2tNb3ZlbWVudFkgPSB0cnVlO1xuICAgICAgICBpbWcubG9ja1JvdGF0aW9uID0gdHJ1ZTtcbiAgICAgICAgaW1nLnNldENvbnRyb2xzVmlzaWJpbGl0eSA9IGZhbHNlO1xuICAgICAgICBpbWcuaWQgPSAnbG9jaydcbiAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLmFkZChpbWcpO1xuICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsLmJpbmQoY2FudmFzZXNbY2FudmFzSWRdKVxuICAgIH0pXG4gIH1cbiAgZm9yICh2YXIgY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICByZW5kZXJQYWdlKFB1YmxpY2F0aW9uLnBhZ2VzW2NhbnZhc0lkXSwgY2FudmFzSWQpXG4gIH1cbiAgc2hvd1B1YmxpY2F0aW9uRGF0YShQdWJsaWNhdGlvbilcbn1cblxuXG5cblxuXG4vLyAtLS0gQkFDS0VORFxuXG4vLyBzYXZlIHRvIGRiXG52YXIgc2F2aW5nID0gZmFsc2VcbmZ1bmN0aW9uIHNhdmV0b0RiKHB1YmxpY2F0aW9uKSB7XG4gIGlmIChzYXZpbmcgPT0gZmFsc2UpIHtcbiAgXHRmb3IgKHZhciBwYWdlIGluIFB1YmxpY2F0aW9uLnBhZ2VzKSB7XG4gICAgICB2YXIgb3JpZ2luV2lkdGggPSBjYW52YXNlc1twYWdlXS5nZXRXaWR0aCgpO1xuXG4gICAgICBmdW5jdGlvbiB6b29tICh3aWR0aCkge1xuICAgICAgICB2YXIgc2NhbGUgPSB3aWR0aCAvIGNhbnZhc2VzW3BhZ2VdLmdldFdpZHRoKCk7XG4gICAgICAgIGhlaWdodCA9IHNjYWxlICogY2FudmFzZXNbcGFnZV0uZ2V0SGVpZ2h0KCk7XG5cbiAgICAgICAgY2FudmFzZXNbcGFnZV0uc2V0RGltZW5zaW9ucyh7XG4gICAgICAgICAgICBcIndpZHRoXCI6IHdpZHRoLFxuICAgICAgICAgICAgXCJoZWlnaHRcIjogaGVpZ2h0XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNhbnZhc2VzW3BhZ2VdLmNhbGNPZmZzZXQoKTtcbiAgICAgICAgdmFyIG9iamVjdHMgPSBjYW52YXNlc1twYWdlXS5nZXRPYmplY3RzKCk7XG4gICAgICAgIGZvciAodmFyIGkgaW4gb2JqZWN0cykge1xuICAgICAgICAgICAgdmFyIHNjYWxlWCA9IG9iamVjdHNbaV0uc2NhbGVYO1xuICAgICAgICAgICAgdmFyIHNjYWxlWSA9IG9iamVjdHNbaV0uc2NhbGVZO1xuICAgICAgICAgICAgdmFyIGxlZnQgPSBvYmplY3RzW2ldLmxlZnQ7XG4gICAgICAgICAgICB2YXIgdG9wID0gb2JqZWN0c1tpXS50b3A7XG5cbiAgICAgICAgICAgIG9iamVjdHNbaV0uc2NhbGVYID0gc2NhbGVYICogc2NhbGU7XG4gICAgICAgICAgICBvYmplY3RzW2ldLnNjYWxlWSA9IHNjYWxlWSAqIHNjYWxlO1xuICAgICAgICAgICAgb2JqZWN0c1tpXS5sZWZ0ID0gbGVmdCAqIHNjYWxlO1xuICAgICAgICAgICAgb2JqZWN0c1tpXS50b3AgPSB0b3AgKiBzY2FsZTtcblxuICAgICAgICAgICAgb2JqZWN0c1tpXS5zZXRDb29yZHMoKTtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXNlc1twYWdlXS5yZW5kZXJBbGwoKTtcbiAgICAgIH1cbiAgICAgIHpvb20oY2FudmFzWm9vbSlcblxuICAgICAgUHVibGljYXRpb24ucGFnZXNbcGFnZV0gPSBjYW52YXNlc1twYWdlXS50b0RhdGFVUkwoJ2ltYWdlL2pwZWcnLCAxKSAvLyB1cGRhdGUgYWxsIHBhZ2VzXG5cbiAgICAgIHpvb20gKG9yaWdpbldpZHRoKTtcbiAgXHR9XG4gICAgJCgnLmJ1dHRvbi5zYXZlIC5zdHlsaXplZCcpLmh0bWwoJ1NhdmluZyA8c3Bhbj4uPC9zcGFuPjxzcGFuPi48L3NwYW4+PHNwYW4+Ljwvc3Bhbj4nKS5hZGRDbGFzcygnc2F2aW5nJykucmVtb3ZlQ2xhc3MoJ3N0eWxpemVkJylcbiAgICAkKCcuYnV0dG9uLnNhdmUnKS5jc3MoJ2JhY2tncm91bmRDb2xvcicsICcjZWVlJylcbiAgXHQkLmFqYXgoe1xuICBcdFx0dXJsOiAnL2RiJyxcbiAgXHRcdHR5cGU6ICdwb3N0JywgLy8gcGVyZm9ybWluZyBhIFBPU1QgcmVxdWVzdFxuICBcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24pLFxuICBcdFx0Y29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgXHRcdGRhdGFUeXBlOiAnanNvbicsXG4gIFx0XHRzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2Z4LnJlYWR5KClcbiAgICAgICAgJCgnLmJ1dHRvbi5zYXZlJykuaGlkZSgpXG4gICAgICAgICQoJy5idXR0b24ucGRmLCAuYnV0dG9uLmJvb2tsZXQnKS5jc3MoJ2Rpc3BsYXknLCdpbmxpbmUtYmxvY2snKVxuXG4gICAgICAgICQoJy50aXRsZScpLmVtcHR5KClcbiAgICAgICAgJCgnLmFjaGlldmVtZW50cyBoMycpLmFkZENsYXNzKCdhcnJvd2VkJylcbiAgICAgICAgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICAgICAgICAkKGEpLnRleHQoUHVibGljYXRpb24udGl0bGUpLmF0dHIoXCJocmVmXCIsICcvc2F2ZWQ/aWQ9JyArIFB1YmxpY2F0aW9uLmlkKVxuICAgICAgICAkKGEpLmFwcGVuZFRvKCQoJy50aXRsZScpKVxuXG4gIFx0XHRcdGNvbnNvbGUubG9nKCdwdWJsaWNhdGlvbiBzZW50IHRvIGRhdGFiYXNlLicpO1xuICBcdFx0fVxuICBcdH0pO1xuICBcdGNvbnNvbGUubG9nKCdzYXZlZD9pZD0nICsgUHVibGljYXRpb24uaWQpXG4gICAgc2F2aW5nID0gdHJ1ZVxuICB9XG59XG5cblxuXG5cbi8vIC0tLSBESVNSVVBUSU9OU1xuXG5cbmZ1bmN0aW9uIGFsbEVsZW1lbnRzKHR5cGUpIHtcbiAgdmFyIG9ianMgPSBbXVxuICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgIGlmICh0eXBlKSB7XG4gICAgICBjYW52YXNPYmpzID0gY2FudmFzZXNbY2FudmFzXS5nZXRPYmplY3RzKHR5cGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbnZhc09ianMgPSBjYW52YXNlc1tjYW52YXNdLmdldE9iamVjdHMoKVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gY2FudmFzT2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKGNhbnZhc09ianNbaV0uaWQgIT0gJ2xvY2snKSB7IC8vIHVzZSB0aGlzIHRvIGxvY2tcbiAgICAgICAgb2Jqcy5wdXNoKCBjYW52YXNPYmpzW2ldIClcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9ianNcbn1cblxuZnVuY3Rpb24gbG9ja0VsZW1lbnRzKG9ianMpIHtcbiAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBvYmpzW2ldLnNlbGVjdGFibGUgPSBmYWxzZVxuICAgIG9ianNbaV0uaGFzQ29udHJvbHMgPSBmYWxzZVxuICAgIG9ianNbaV0uaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCdcbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJBbGxDYW52YXNlcygpIHtcbiAgZm9yIChjYW52YXNJZCBpbiBjYW52YXNlcykge1xuICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwoKVxuICB9XG59XG5cbmZ1bmN0aW9uIGZpbHRlckltZ3Mob2JqcywgZmlsdGVyKSB7XG4gIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgb2Jqc1tpXS5maWx0ZXJzLnB1c2goZmlsdGVyKVxuICAgIG9ianNbaV0uYXBwbHlGaWx0ZXJzKClcbiAgfVxuICByZW5kZXJBbGxDYW52YXNlcygpXG59XG5cbnZhciBEaXNydXB0aW9uID0ge1xuXHRjb21pYzogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2NvbWljKG9ianMpIHtcbiAgICAgIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIG9ianNbaV0uZm9udEZhbWlseSA9ICdcIkNvbWljIFNhbnMgTVNcIidcbiAgICAgIH1cbiAgICB9XG4gICAgX2NvbWljKCBhbGxFbGVtZW50cygndGV4dCcpIClcbiAgICBfY29taWMoIGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykgKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdDYW5cXCd0IHlvdSBzcGljZSB0aGUgdHlwb2dyYXBoeSBhIGJpdD8nKVxuXHR9LFxuXHRyb3RhdGVJbWdzUmFuZDogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX3JvdGF0ZUltZ3NSYW5kKG9ianMpIHtcbiAgICAgIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIG9ianNbaV0ub3JpZ2luWCA9ICdjZW50ZXInXG4gICAgICAgIG9ianNbaV0ub3JpZ2luWSA9ICdjZW50ZXInXG4gICAgICAgIG9ianNbaV0uYW5pbWF0ZSh7IGFuZ2xlOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApIH0sIHtcbiAgICAgICAgICBkdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICBvbkNoYW5nZTogb2Jqc1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQob2Jqc1tpXS5jYW52YXMpLFxuICAgICAgICAgIGVhc2luZzogZnVuY3Rpb24odCwgYiwgYywgZCkgeyByZXR1cm4gYyp0L2QgKyBiIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgX3JvdGF0ZUltZ3NSYW5kKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIGNyaXRpY1NheXMoJ0kgZmluZCB0aGlzIGxheW91dCBhIGJpdCBzdGF0aWMuLi4nKVxuXHR9LFxuXHRsb2NrUmFuZFBhZ2U6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FudmFzZXMpXG4gICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cblx0XHRyYW5kQ2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlO1xuXHRcdGZvciAob2JqZWN0SWQgaW4gcmFuZENhbnZhcy5nZXRPYmplY3RzKCkgKSB7XG5cdFx0XHR2YXIgb2JqZWN0ID0gcmFuZENhbnZhcy5pdGVtKG9iamVjdElkKVxuXHRcdFx0b2JqZWN0LnNlbGVjdGFibGUgPSBmYWxzZVxuXHRcdFx0b2JqZWN0LmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnXG5cdFx0fVxuXHRcdHJhbmRDYW52YXMuYWRkKG5ldyBmYWJyaWMuTGluZShbMCwgMCwgcmFuZENhbnZhcy53aWR0aCwgcmFuZENhbnZhcy5oZWlnaHRdLCB7XG5cdCAgXHRzdHJva2U6ICdyZWQnLFxuXHQgIFx0c2VsZWN0YWJsZTogZmFsc2UsXG5cdCAgXHRzdHJva2VXaWR0aDogMixcbiAgICAgIGhvdmVyQ3Vyc29yOidkZWZhdWx0JyxcbiAgICAgIGlkOiAnbG9jaydcblx0XHR9KSlcblx0XHRyYW5kQ2FudmFzLnJlbmRlckFsbCgpO1xuICAgIGNyaXRpY1NheXMoJ1BhZ2UgJyArIHJhbmRDYW52YXMuaWRbMV0gKyAnIGlzIG5vdyBsb2NrZWQuLi4nKVxuXHR9LFxuICBzaHVmZmxlUGFnZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0b1NodWZmbGUgPSBbXVxuICAgIHZhciBpID0gMFxuICAgIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmIChpID4gMCAmJiBpIDw9IDYpIHsgLy8gcHJldmVudCBzaHVmZmxpbmcgZmlyc3QgcGFnZVxuICAgICAgICB0b1NodWZmbGUucHVzaCggY2FudmFzZXNbY2FudmFzSWRdLnRvSlNPTigpIClcbiAgICAgIH1cbiAgICAgIGkgKz0gMVxuICAgIH1cbiAgICBzaHVmZmxlQXJyYXkodG9TaHVmZmxlKVxuICAgIHZhciB5ID0gMFxuICAgIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmICh5ID4gMCAmJiB5IDw9IDYpIHtcbiAgICAgICAgY2FudmFzZXNbY2FudmFzSWRdLmxvYWRGcm9tSlNPTih0b1NodWZmbGVbeSAtIDFdLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsLmJpbmQoY2FudmFzZXNbY2FudmFzSWRdKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgeSArPSAxXG4gICAgfVxuICAgIGNyaXRpY1NheXMoJ1RoZSByeXRobSBvZiB0aGlzIHB1YmxpY2F0aW9uIGlzIGEgYml0IHdlYWsuIERvblxcJ3QgeW91IHRoaW5rPycpXG4gIH0sXG5cdGFkczogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FudmFzZXMpXG4gICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cblx0XHRyYW5kQ2FudmFzLmFkZChuZXcgZmFicmljLlJlY3Qoe1xuXHRcdFx0d2lkdGg6IHJhbmRDYW52YXMud2lkdGgsXG5cdFx0XHRoZWlnaHQ6IDMwLFxuXHRcdFx0ZmlsbDogJyMwRDIxM0UnLFxuXHRcdFx0bG9ja01vdmVtZW50WDogdHJ1ZSxcblx0XHRcdGxvY2tNb3ZlbWVudFk6IHRydWUsXG5cdFx0XHRsb2NrUm90YXRpb246IHRydWUsXG5cdFx0XHRoYXNDb250cm9sczogZmFsc2UsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcblx0XHRcdGxlZnQ6IHJhbmRDYW52YXMud2lkdGgvMixcblx0XHRcdHRvcDogMTUsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGlkOiAnbG9jaydcblx0XHR9KSk7XG5cdFx0ZmFicmljLkltYWdlLmZyb21VUkwoa2lua29CYXNlNjQsIGZ1bmN0aW9uKGltZyl7XG5cdFx0XHRcdGltZy5oYXNCb3JkZXJzID0gZmFsc2U7XG5cdFx0XHRcdGltZy5oYXNDb250cm9scyA9IGZhbHNlO1xuICAgICAgICBpbWcuc2VsZWN0YWJsZSA9IGZhbHNlO1xuXHRcdFx0XHRpbWcuc2NhbGUoMC4yKTtcblx0XHRcdFx0aW1nLmxlZnQgPSByYW5kQ2FudmFzLndpZHRoLTEwMDtcblx0XHRcdFx0aW1nLnRvcCA9IDUwO1xuXHRcdFx0XHRpbWcubG9ja01vdmVtZW50WCA9IHRydWU7XG5cdFx0XHRcdGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcblx0XHRcdFx0aW1nLmxvY2tSb3RhdGlvbiA9IHRydWU7XG5cdFx0XHRcdGltZy5zZXRDb250cm9sc1Zpc2liaWxpdHkgPSBmYWxzZTtcbiAgICAgICAgaW1nLmlkID0gJ2xvY2snXG5cdFx0XHRcdHJhbmRDYW52YXMuYWRkKGltZyk7XG5cdFx0fSlcbiAgICBjcml0aWNTYXlzKCdJIGZvdW5kIGEgc3BvbnNvciEnKVxuXHR9LFxuICBoYWxmVGltZTogZnVuY3Rpb24gKCkge1xuICAgIFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgLyAyXG4gICAgY3JpdGljU2F5cygnVGhpcyBpcyB0YWtpbmcgdG9vIGxvbmcuLi4nKVxuICB9LFxuICBkb3VibGVUaW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAqIDJcbiAgICBjcml0aWNTYXlzKCdUYWtlIHlvdXIgdGltZS4uLicpXG4gIH0sXG4gIGdyZXlzY2FsZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5HcmF5c2NhbGUoKSApXG4gICAgY3JpdGljU2F5cygnU2hhbGwgd2UgbWFrZSBpdCBsb29rIGNsYXNzaWM/JylcbiAgfSxcbiAgaW52ZXJ0SW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLkludmVydCgpIClcbiAgICBjcml0aWNTYXlzKCdUaGUgdmlzdWFscyBuZWVkIHNvbWUgZWRneSBjb2xvcnMnKVxuICB9LFxuICBzZXBpYUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5TZXBpYSgpIClcbiAgICBjcml0aWNTYXlzKCdFdmVyIGhlYXJkIG9mIEluc3RhZ3JhbT8nKVxuICB9LFxuICBibGFja3doaXRlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLkJsYWNrV2hpdGUoKSApXG4gICAgY3JpdGljU2F5cygnVGhpcyBzaG91bGQgbG9vayBsaWtlIGEgemluZSEnKVxuICB9LFxuICBwaXhlbGF0ZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5QaXhlbGF0ZSh7YmxvY2tzaXplOiAyMH0pIClcbiAgICBjcml0aWNTYXlzKCdJc25cXCd0IHRoaXMgYSB2aWRlb2dhbWUgYWZ0ZXIgYWxsPycpXG4gIH0sXG4gIG5vaXNlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLk5vaXNlKHtub2lzZTogMjAwfSkgKVxuICAgIGNyaXRpY1NheXMoJ01BS0UgU09NRSBOT09JU0UhIScpXG4gIH0sXG4gIGZvbnRTaXplQmlnZ2VyOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfZm9udFNpemVCaWdnZXIoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KCdmb250U2l6ZScsIGVsZW1lbnRzW2ldLmZvbnRTaXplICogc2NhbGVGb250KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2ZvbnRTaXplQmlnZ2VyKGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0NhblxcJ3QgcmVhZCBhbnl0aGluZyA6KCcpXG4gIH0sXG4gIGZvbnRTaXplU21hbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2ZvbnRTaXplU21hbGxlcihlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoJ2ZvbnRTaXplJywgZWxlbWVudHNbaV0uZm9udFNpemUgLyBzY2FsZUZvbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBfZm9udFNpemVTbWFsbGVyKGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0lcXCdtIG5vdCBibGluZCEnKVxuICB9LFxuICBiaWdnZXJJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfYmlnZ2VySW1ncyhlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIHNjYWxlWTogc2NhbGVVcEltZ3MsXG4gICAgICAgICAgc2NhbGVYOiBzY2FsZVVwSW1nc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2JpZ2dlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0JMT1cgVVAhJylcbiAgfSxcbiAgc21hbGxlckltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9zbWFsbGVySW1ncyhlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIHNjYWxlWTogc2NhbGVEb3duSW1ncyxcbiAgICAgICAgICBzY2FsZVg6IHNjYWxlRG93bkltZ3NcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIF9zbWFsbGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnQkxPVyBVUCEnKVxuICB9LFxuICBsb2NrQWxsRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgIGxvY2tFbGVtZW50cyhhbGxFbGVtZW50cygpKVxuICAgIGNyaXRpY1NheXMoJ1RoaW5ncyBhcmUgcGVyZmVjdCBhcyB0aGV5IGFyZS4nKVxuICB9LFxuICBza2V3QWxsRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9za2V3QWxsRWxlbWVudHMoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBzY2FsZVk6IHNjYWxlVXBJbWdzLFxuICAgICAgICAgIHNjYWxlWDogc2NhbGVVcEltZ3MsXG4gICAgICAgICAgdHJhbnNmb3JtTWF0cml4OiBbMSwgLjUwLCAwLCAxLCAwLCAwXVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfc2tld0FsbEVsZW1lbnRzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdTdHJldGNoIHRob3NlIGltYWdlcywgY29tZSBvbiEnKVxuICB9LFxuICBmbGlwQWxsSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2ZsaXBBbGxJbWdzKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7XG4gICAgICAgICAgYW5nbGU6ICctMTgwJyxcbiAgICAgICAgICBmbGlwWTogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfZmxpcEFsbEltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0ZsaXAgdGhvc2UgaW1hZ2VzLCBjb21lIG9uIScpXG4gIH0sXG4gIGJpdExlZnRiaXRSaWdodEFsbEltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9iaXRMZWZ0Yml0UmlnaHRBbGxJbWdzKGVsZW1lbnRzLCBkaXN0YW5jZSkge1xuICAgICAgdmFyIGR1cmF0aW9uID0gMjAwXG4gICAgICB2YXIgcGF1c2UgPSAxMDBcblxuICAgICAgZnVuY3Rpb24gbGVmdDEoaSwgZWxlbWVudHMpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmFuaW1hdGUoJ2xlZnQnLCBlbGVtZW50c1tpXS5sZWZ0ICsgZGlzdGFuY2UgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCksIHsgLy8gYSBiaXQgb2YgcmFuZG9tbmVzcyB0byBtYWtlIGl0IG1vcmUgaHVtYW5cbiAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCksXG4gICAgICAgICAgICBvbkNoYW5nZTogZWxlbWVudHNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKGVsZW1lbnRzW2ldLmNhbnZhcyksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgMClcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGxlZnQyKGksIGVsZW1lbnRzKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBlbGVtZW50c1tpXS5hbmltYXRlKCdsZWZ0JywgZWxlbWVudHNbaV0ubGVmdCArIGRpc3RhbmNlICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApLCB7XG4gICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApLFxuICAgICAgICAgICAgb25DaGFuZ2U6IGVsZW1lbnRzW2ldLmNhbnZhcy5yZW5kZXJBbGwuYmluZChlbGVtZW50c1tpXS5jYW52YXMpLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sIGR1cmF0aW9uICsgcGF1c2UpXG4gICAgICB9XG4gICAgICBmdW5jdGlvbiByaWdodDEoaSwgZWxlbWVudHMpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmFuaW1hdGUoJ2xlZnQnLCBlbGVtZW50c1tpXS5sZWZ0IC0gZGlzdGFuY2UgLSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCksIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCksXG4gICAgICAgICAgICBvbkNoYW5nZTogZWxlbWVudHNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKGVsZW1lbnRzW2ldLmNhbnZhcyksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgKGR1cmF0aW9uICsgcGF1c2UpICogMiApXG4gICAgICB9XG4gICAgICBmdW5jdGlvbiByaWdodDIoaSwgZWxlbWVudHMpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmFuaW1hdGUoJ2xlZnQnLCBlbGVtZW50c1tpXS5sZWZ0IC0gZGlzdGFuY2UgLSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCksIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCksXG4gICAgICAgICAgICBvbkNoYW5nZTogZWxlbWVudHNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKGVsZW1lbnRzW2ldLmNhbnZhcyksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgKGR1cmF0aW9uICsgcGF1c2UpICogMyApXG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxlZnQxKGksIGVsZW1lbnRzKVxuICAgICAgICBsZWZ0MihpLCBlbGVtZW50cylcbiAgICAgICAgcmlnaHQxKGksIGVsZW1lbnRzKVxuICAgICAgICByaWdodDIoaSwgZWxlbWVudHMpXG4gICAgICB9XG4gICAgfVxuICAgIF9iaXRMZWZ0Yml0UmlnaHRBbGxJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCA3MClcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnQSBiaXQgdG8gdGhlIHJpZ2h0Li4uIE5vIG5vLCBhIGJpdCB0byB0aGUgbGVmdC4uLicpXG4gIH0sXG4gIHJpZ2lkTW9kZTogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX3JpZ2lkTW9kZShlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIGxvY2tNb3ZlbWVudFk6IHRydWUsXG4gICAgICAgICAgbG9ja1JvdGF0aW9uOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIF9yaWdpZE1vZGUoYWxsRWxlbWVudHMoJ2ltYWdlJyksIDcwKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdSZXNwZWN0IHRoZSBncmlkIScpXG4gIH0sXG4gIGJldHRlclRpdGxlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGl0bGVzID0gW1xuICAgICAgJ0RvbiBRdWl4b3RlJyxcbiAgICAgICdJbiBTZWFyY2ggb2YgTG9zdCBUaW1lJyxcbiAgICAgICdVbHlzc2VzJyxcbiAgICAgICdUaGUgT2R5c3NleScsXG4gICAgICAnV2FyIGFuZCBQZWFjZScsXG4gICAgICAnTW9ieSBEaWNrJyxcbiAgICAgICdUaGUgRGl2aW5lIENvbWVkeScsXG4gICAgICAnSGFtbGV0JyxcbiAgICAgICdUaGUgR3JlYXQgR2F0c2J5JyxcbiAgICAgICdUaGUgSWxpYWQnXG4gICAgXVxuICAgIHZhciByYW5kVGl0bGUgPSB0aXRsZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGl0bGVzLmxlbmd0aCldXG4gICAgdGl0bGUudGV4dCA9IHJhbmRUaXRsZVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBQdWJsaWNhdGlvbi50aXRsZSA9IHJhbmRUaXRsZVxuICAgIGNyaXRpY1NheXMoJ0kgc3VnZ2VzdCBhIGNhdGNoaWVyIHRpdGxlJylcbiAgfSxcbiAgYmV0dGVyQXV0aG9yczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRoZV9hdXRob3JzID0gW1xuICAgICAgJ0xlbyBUb2xzdG95JyxcbiAgICAgICdGeW9kb3IgRG9zdG9ldnNreScsXG4gICAgICAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gICAgICAnQ2hhcmxlcyBEaWNrZW5zJyxcbiAgICAgICdIb21lcicsXG4gICAgICAnSi4gUi4gUi4gVG9sa2llbicsXG4gICAgICAnR2VvcmdlIE9yd2VsbCcsXG4gICAgICAnRWRnYXIgQWxsYW4gUG9lJyxcbiAgICAgICdNYXJrIFR3YWluJyxcbiAgICAgICdWaWN0b3IgSHVnbydcbiAgICBdXG4gICAgdmFyIHJhbmRBdXRob3IgPSB0aGVfYXV0aG9yc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGVfYXV0aG9ycy5sZW5ndGgpXVxuICAgIGF1dGhvcnMudGV4dCA9IHJhbmRBdXRob3JcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgUHVibGljYXRpb24uYXV0aG9ycyA9IHJhbmRBdXRob3JcbiAgICBjcml0aWNTYXlzKCdXZSBuZWVkIGEgd2VsbC1rbm93biB0ZXN0aW1vbmlhbC4nKVxuICB9LFxuICBkcmF3aW5nTW9kZTogZnVuY3Rpb24oKSB7XG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uaXNEcmF3aW5nTW9kZSA9IHRydWVcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uYmFja2dyb3VuZENvbG9yID0gJyNmZmZmYWEnXG4gICAgICBjYW52YXNlc1tjYW52YXNdLnJlbmRlckFsbCgpXG4gICAgfVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgICBjYW52YXNlc1tjYW52YXNdLmlzRHJhd2luZ01vZGUgPSBmYWxzZVxuICAgICAgICBjYW52YXNlc1tjYW52YXNdLmJhY2tncm91bmRDb2xvciA9ICcjZmZmZmZmJ1xuICAgICAgICBjYW52YXNlc1tjYW52YXNdLnJlbmRlckFsbCgpXG4gICAgICB9XG4gICAgfSwgZHJhd2luZ01vZGVUaW1lKVxuICAgIGNyaXRpY1NheXMoJ0RvIHlvdSBsaWtlIHRvIGRyYXc/JylcbiAgfSxcbiAgYmxhY2tib2FyZE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgICBjYW52YXNlc1tjYW52YXNdLmJhY2tncm91bmRDb2xvciA9ICcjMDAwMDAwJ1xuICAgICAgY2FudmFzZXNbY2FudmFzXS5yZW5kZXJBbGwoKVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbEVsZW1lbnRzKCd0ZXh0JykubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFsbEVsZW1lbnRzKCd0ZXh0JylbaV0uc2V0KHtmaWxsOiAnI2ZmZid9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gd2hpdGVUZXh0KGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7ZmlsbDogJyNmZmYnfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHdoaXRlVGV4dChhbGxFbGVtZW50cygndGV4dGJveCcpKVxuICAgIHdoaXRlVGV4dChbdGl0bGUsYXV0aG9ycyxwdWJEYXRlXSlcbiAgICBmb250Q29sb3IgPSAnI2ZmZidcbiAgICB2YXIgbGluZUxlbmdodCA9IDI1MFxuICAgIGNvdmVyTGluZSA9IG5ldyBmYWJyaWMuTGluZShbMCwgMCwgbGluZUxlbmdodCwgMF0sIHtcbiAgICAgIGxlZnQ6ICggY2FudmFzZXNbJ3AxJ10ud2lkdGggLSBsaW5lTGVuZ2h0KSAvIDIsXG4gICAgICB0b3A6IDE2MCxcbiAgICAgIHN0cm9rZTogJyNmZmYnLFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXG4gICAgICBvcmlnaW5YOiAnbGVmdCcsXG4gICAgICBvcmlnaW5ZOiAndG9wJ1xuICAgIH0pXG4gICAgY2FudmFzZXNbJ3AxJ10uYWRkKGNvdmVyTGluZSkgLy8gbm90IHN1cmUgd2h5IEkgY2FuJ3Qgc2ltcGx5IGNoYW5nZSB0aGUgc3Ryb2tlXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ1RoaW5rIG9mIHRoZSBwYWdlIGFzIGEgYmxhY2tib2FyZCcpXG4gIH0sXG4gIGNsYXNzaWZpZWRNb2RlOiBmdW5jdGlvbigpIHtcbiAgICBmYWJyaWMuSW1hZ2UuZnJvbVVSTChjbGFzc2lmaWVkQmFzZTY0LCBmdW5jdGlvbihpbWcpe1xuICAgICAgaW1nLmhhc0JvcmRlcnMgPSBmYWxzZTtcbiAgICAgIGltZy5oYXNDb250cm9scyA9IGZhbHNlO1xuICAgICAgaW1nLnNlbGVjdGFibGUgPSBmYWxzZTtcbiAgICAgIGltZy5zY2FsZSgwLjgpO1xuICAgICAgaW1nLmxlZnQgPSBjYW52YXNlc1sncDEnXS53aWR0aCAvIDI7XG4gICAgICBpbWcudG9wID0gMzAwO1xuICAgICAgaW1nLmxvY2tNb3ZlbWVudFggPSB0cnVlO1xuICAgICAgaW1nLmxvY2tNb3ZlbWVudFkgPSB0cnVlO1xuICAgICAgaW1nLmxvY2tSb3RhdGlvbiA9IHRydWU7XG4gICAgICBpbWcuc2V0Q29udHJvbHNWaXNpYmlsaXR5ID0gZmFsc2U7XG4gICAgICBpbWcuaWQgPSAnbG9jayc7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNhbnZhc2VzKVxuICAgICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cbiAgICAgIHJhbmRDYW52YXMuYWRkKGltZylcbiAgICB9KVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdUaGUgcHVibGljIG11c3Qgbm90IGtub3cuJylcbiAgfVxufVxuIl0sImZpbGUiOiJtYWluLmpzIn0=
