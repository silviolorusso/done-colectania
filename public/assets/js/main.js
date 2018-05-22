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
        Publication.timeElapsed = Publication.timeElapsed + 10 / 1000
      } else {
        Publication.timeElapsed = 0
      }
			controller(Publication);
		}, 10)
		mouseCounter()
	} else { // saved publication
		renderPublication(Publication)
	}
}

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBERUZBVUxUU1xuXG52YXIgdGltZUxlZnQgPSA5OTk5OTk5OTk5OTk5OVxudmFyIGRpc3J1cHRpb25zT24gPSB0cnVlXG52YXIgZHJvcERlbGF5ID0gMTAwXG52YXIgZGlzcnVwdGlvbkludGVydmFsID0gMTAwMDBcbnZhciBib251c1RpbWUgPSA1MDAwXG52YXIgdGV4dENodW5rc0xlbmd0aCA9IDE1MDBcbnZhciBmb250U2l6ZSA9IDEzXG52YXIgZm9udENvbG9yID0gJyMwMDAnXG52YXIgc2NhbGVGb250ID0gMS41XG52YXIgc2NhbGVVcEltZ3MgPSAwLjdcbnZhciBzY2FsZURvd25JbWdzID0gMC43XG52YXIgYWNoaWV2ZW1lbnRTcGFuID0gM1xudmFyIGRyYXdpbmdNb2RlVGltZSA9IDEwMDAwXG52YXIgaW5maW5pdGVUaW1lID0gZmFsc2VcbnZhciBkZWZhdWx0VGl0bGUgPSAnVW50aXRsZWQnXG52YXIgZGVmYXVsdEF1dGhvcnMgPSAnQW5vbnltb3VzJ1xudmFyIGNhbnZhc1pvb20gPSAxMDAwXG52YXIgbWF4RmlsZVNpemUgPSAxMDQ4NTc2ICsgNDAwMDAwIC8vIDFtYiArIHNvbWUgbWFyZ2luXG52YXIgbWF4UHVibGljYXRpb25TaXplID0gMTA0ODU3NjAgLy8gMTBtYlxuXG5cbmxvcmVtSXBzdW0gPSAnUHJvY2VkdXJhbGl6ZSBwdXQgeW91ciBmZWVsZXJzIG91dCBsZWFuIGludG8gdGhhdCBwcm9ibGVtIG9yIGNyb3NzLXBvbGxpbmF0aW9uLCBvciBwcmV0aGluaywgb3Igd2hlZWxob3VzZS4gVmVydGljYWwgaW50ZWdyYXRpb24gaGlnaGxpZ2h0cyAuIERlc2lnbiB0aGlua2luZyBzYWNyZWQgY293LCB5ZXQgcmFjZSB3aXRob3V0IGEgZmluaXNoIGxpbmUgZ29hbHBvc3RzLidcblxuXG4vLyAtLS0gR0VORVJBTCBGVU5DVElPTlNcblxuZnVuY3Rpb24gbWFrZUlkKCkge1xuXHR2YXIgcmFuZExldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNikpO1xuXHR2YXIgaWQgPSByYW5kTGV0dGVyICsgRGF0ZS5ub3coKTtcblx0cmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBieXRlQ291bnQocykge1xuICAgIHJldHVybiBlbmNvZGVVUkkocykuc3BsaXQoLyUuLnwuLykubGVuZ3RoIC0gMTtcbn1cblxudmFyIGdldFVybFBhcmFtZXRlciA9IGZ1bmN0aW9uIGdldFVybFBhcmFtZXRlcihzUGFyYW0pIHtcbiAgdmFyIHNQYWdlVVJMID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKSxcbiAgICBzVVJMVmFyaWFibGVzID0gc1BhZ2VVUkwuc3BsaXQoJyYnKSxcbiAgICBzUGFyYW1ldGVyTmFtZSxcbiAgICBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBzVVJMVmFyaWFibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgc1BhcmFtZXRlck5hbWUgPSBzVVJMVmFyaWFibGVzW2ldLnNwbGl0KCc9Jyk7XG5cbiAgICBpZiAoc1BhcmFtZXRlck5hbWVbMF0gPT09IHNQYXJhbSkge1xuICAgICAgICByZXR1cm4gc1BhcmFtZXRlck5hbWVbMV0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBzUGFyYW1ldGVyTmFtZVsxXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycmF5KSB7XG4gIGZvciAodmFyIGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgdmFyIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcbiAgICB2YXIgdGVtcCA9IGFycmF5W2ldO1xuICAgIGFycmF5W2ldID0gYXJyYXlbal07XG4gICAgYXJyYXlbal0gPSB0ZW1wO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRpbWVDb252ZXJ0ZXIoVU5JWF90aW1lc3RhbXApe1xuICB2YXIgYSA9IG5ldyBEYXRlKFVOSVhfdGltZXN0YW1wKTtcbiAgdmFyIG1vbnRocyA9IFsnSmFuJywnRmViJywnTWFyJywnQXByJywnTWF5JywnSnVuJywnSnVsJywnQXVnJywnU2VwJywnT2N0JywnTm92JywnRGVjJ107XG4gIHZhciB5ZWFyID0gYS5nZXRGdWxsWWVhcigpO1xuICB2YXIgbW9udGggPSBtb250aHNbYS5nZXRNb250aCgpXTtcbiAgdmFyIGRhdGUgPSBhLmdldERhdGUoKTtcbiAgdmFyIHRpbWUgPSBkYXRlICsgJyAnICsgbW9udGggKyAnICcgKyB5ZWFyO1xuICByZXR1cm4gdGltZTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0Qnl0ZXMoYSxiKXtpZigwPT1hKXJldHVyblwiMCBieXRlc1wiO3ZhciBjPTEwMjQsZD1ifHwyLGU9W1wiYnl0ZXNcIixcImtiXCIsXCJtYlwiLFwiZ2JcIixcInRiXCIsXCJwYlwiLFwiZWJcIixcInpiXCIsXCJ5YlwiXSxmPU1hdGguZmxvb3IoTWF0aC5sb2coYSkvTWF0aC5sb2coYykpO3JldHVybiBwYXJzZUZsb2F0KChhL01hdGgucG93KGMsZikpLnRvRml4ZWQoZCkpK2VbZl19XG5cbmZ1bmN0aW9uIHVwZGF0ZUZpbGVzaXplUHViTGVmdChkYXRhKSB7XG4gIGZpbGVzaXplUHViTGVmdCA9IGZpbGVzaXplUHViTGVmdCAtIGRhdGEubGVuZ3RoXG4gIGlmIChmaWxlc2l6ZVB1YkxlZnQgPiAwKSB7XG4gICAgJCgnLmZpbGVzaXplUHViTGVmdCcpLnRleHQoIGZvcm1hdEJ5dGVzKGZpbGVzaXplUHViTGVmdCkgKyAnICcgKVxuICB9IGVsc2Uge1xuICAgICQoJy5maWxlc2l6ZVB1YkxlZnQnKS50ZXh0KCAnMG1iICcgKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MpIHtcbiAgZnVuY3Rpb24gY2h1bmtTdHJpbmcoc3RyLCBsZW5ndGgpIHtcbiAgICByZXR1cm4gc3RyLm1hdGNoKG5ldyBSZWdFeHAoJ3suMSwnICsgbGVuZ3RoICsgJ30nLCAnZycpKTtcbiAgfVxuXHR2YXIgdGhlTW91c2VQb3MgPSBtb3VzZVBvc1xuXHRpZiAoZWxlbWVudC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykpIHtcblx0XHRmYWJyaWMuSW1hZ2UuZnJvbVVSTChlbGVtZW50LmRhdGEsIGZ1bmN0aW9uKG15SW1nLCBjYWxsYmFjaykge1xuIFx0XHRcdHZhciBpbWcgPSBteUltZy5zZXQoeyBsZWZ0OiAwLCB0b3A6IDAsIHdpZHRoOiBteUltZy53aWR0aCwgaGVpZ2h0OiBteUltZy5oZWlnaHR9KTtcbiBcdFx0XHRpZiAoIGltZy53aWR0aCA+IGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggKSB7XG4gXHRcdFx0XHRpbWcuc2NhbGVUb1dpZHRoKGNhbnZhc2VzW2VsZW1lbnQucGFnZV0ud2lkdGggLyAxMDAgKiA1MCApOyAvLyA1MCUgb2YgdGhlIGNhbnZhc1xuIFx0XHRcdH1cbiBcdFx0XHRpbWcubGVmdCA9IHRoZU1vdXNlUG9zLnhcbiBcdFx0XHRpbWcudG9wID0gdGhlTW91c2VQb3MueVxuIFx0XHRcdGltZy5vbignYWRkZWQnLCBmdW5jdGlvbigpIHtcbiBcdFx0XHRcdGNhbGxiYWNrXG4gXHRcdFx0fSlcbiBcdFx0XHRjYW52YXNlc1tlbGVtZW50LnBhZ2VdLmFkZChpbWcpXG5cdFx0fSlcblx0fSBlbHNlIHtcblx0XHR2YXIgZGVCYXNlZFRleHQgPSBhdG9iKGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpKTtcbiAgICBjaHVua3MgPSBkZUJhc2VkVGV4dC5tYXRjaChuZXcgUmVnRXhwKCcoLnxbXFxyXFxuXSl7MSwnICsgdGV4dENodW5rc0xlbmd0aCArICd9JywgJ2cnKSlcbiAgICB2YXIgY3VyclBhZ2UgPSBwYXJzZUludCggZWxlbWVudC5wYWdlLnN1YnN0cihlbGVtZW50LnBhZ2UubGVuZ3RoIC0gMSkgKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY2FudmFzZXNbJ3AnICsgKGN1cnJQYWdlICsgaSldKSB7XG4gICAgICAgIGNhbnZhc2VzWydwJyArIChjdXJyUGFnZSArIGkpXS5hZGQobmV3IGZhYnJpYy5UZXh0Ym94KGNodW5rc1tpXSwge1xuICAgICAgICAgIGZvbnRGYW1pbHk6ICdIZWx2ZXRpY2EnLFxuICAgICAgICAgIGxlZnQ6IDIwLFxuICAgICAgICAgIHRvcDogMjAsXG4gICAgICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgICAgIGZpbGw6IGZvbnRDb2xvcixcbiAgICAgICAgICB3aWR0aDogNDEwLFxuICAgICAgICAgIGJyZWFrV29yZHM6IHRydWUsXG4gICAgICAgICAgb3JpZ2luWDogJ2xlZnQnLFxuICAgICAgICAgIG9yaWdpblk6ICd0b3AnXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH1cblx0fVxufVxuXG5cbi8vIC0tLSBpbml0aWFsaXplIGNhbnZhc2VzXG52YXIgY2FudmFzZXMgPSB7fVxudmFyIGZpbGVzaXplUHViTGVmdCA9IG1heFB1YmxpY2F0aW9uU2l6ZVxubGV0IHRpdGxlXG5sZXQgYXV0aG9yc1xubGV0IHB1YkRhdGVcbmxldCBjb3ZlckxpbmVcbmxldCBpc0xvY2tlZEVkaXRpbmcgPSBmYWxzZVxuZnVuY3Rpb24gaW5pdENhbnZhc2VzKCkge1xuICBmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5vcmlnaW5YID0gZmFicmljLk9iamVjdC5wcm90b3R5cGUub3JpZ2luWSA9ICdjZW50ZXInIC8vIG9yaWdpbiBhdCB0aGUgY2VudGVyXG4gIC8vIGN1dG9taXplZCBjb250cm9sc1xuICBmYWJyaWMuT2JqZWN0LnByb3RvdHlwZS5ib3JkZXJDb2xvciA9IGZhYnJpYy5PYmplY3QucHJvdG90eXBlLmNvcm5lckNvbG9yID0gJyNjY2MnXG4gIGZhYnJpYy5PYmplY3QucHJvdG90eXBlLmNvcm5lclNpemUgPSA4XG5cblx0JCgnY2FudmFzJykuZWFjaChmdW5jdGlvbihpKSB7XG5cdFx0Y2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXModGhpcyk7XG5cdCAgY2FudmFzLnNldFdpZHRoKCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykud2lkdGgoKSApO1xuXHRcdGNhbnZhcy5zZXRIZWlnaHQoICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5oZWlnaHQoKSApO1xuICAgIGNhbnZhcy5iYWNrZ3JvdW5kQ29sb3IgPSAnd2hpdGUnO1xuICAgIGNhbnZhcy5pZCA9ICdwJyArIChpKzEpO1xuXG5cdFx0Y2FudmFzZXNbJ3AnICsgKGkgKyAxKV0gPSBjYW52YXM7XG5cbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA+PSAwKSB7IC8vIGlmICBzYXZlZFxuICAgICAgY2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlXG4gICAgfVxuXG5cdH0pO1xuICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA8IDApIHsgLy8gaWYgbm90IHNhdmVkXG5cbiAgICAvLyB0aXRsZVxuICBcdHRpdGxlID0gbmV3IGZhYnJpYy5UZXh0Ym94KCdJbnNlcnQgVGl0bGUnLCB7XG4gIFx0ICB0b3A6IDEyMCxcbiAgXHQgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8nLFxuICBcdCAgZmlsbDogJyM3NzcnLFxuICBcdCAgbGluZUhlaWdodDogMS4xLFxuICBcdCAgZm9udFNpemU6IDMwLFxuICBcdCAgZm9udFdlaWdodDogJ2JvbGQnLFxuICBcdCAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgXHQgIHdpZHRoOiBjYW52YXNlc1sncDEnXS53aWR0aCxcbiAgXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxuICBcdCAgaG92ZXJDdXJzb3I6ICdkZWZhdWx0JyxcbiAgXHQgIG9yaWdpblg6ICdsZWZ0JyxcbiAgXHQgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJyxcbiAgICAgIGNhY2hlOiBmYWxzZVxuICBcdH0pLm9uKCdlZGl0aW5nOmVudGVyZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGhpcy50ZXh0ID09ICdJbnNlcnQgVGl0bGUnKSB7XG4gICAgICAgIHRoaXMudGV4dCA9ICcnXG4gICAgICAgIHRoaXMuaGlkZGVuVGV4dGFyZWEudmFsdWUgPSAnJ1xuICAgICAgfVxuICAgICAgaXNMb2NrZWRFZGl0aW5nID0gdHJ1ZVxuICAgIH0pLm9uKCdjaGFuZ2VkJywgZnVuY3Rpb24oZSkge1xuICAgICAgUHVibGljYXRpb24udGl0bGUgPSB0aGlzLnRleHQucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIikgLy8gcHJldmVudCBjb2RlIGluamVjdGlvblxuICAgICAgdGhpcy50ZXh0ID0gdGhpcy50ZXh0LnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpXG4gICAgfSkub24oJ2VkaXRpbmc6ZXhpdGVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgdGhpcy5zZWxlY3RhYmxlID0gZmFsc2VcbiAgICAgIGlzTG9ja2VkRWRpdGluZyA9IGZhbHNlXG4gICAgICBpZiAodGhpcy50ZXh0ID09ICcnKSB7XG4gICAgICAgIHRoaXMudGV4dCA9ICdJbnNlcnQgVGl0bGUnXG4gICAgICB9XG4gICAgfSlcbiAgXHRjYW52YXNlc1sncDEnXS5hZGQodGl0bGUpXG5cbiAgICAvLyBsaW5lXG4gIFx0dmFyIGxpbmVMZW5naHQgPSAyNTBcbiAgXHRjb3ZlckxpbmUgPSBuZXcgZmFicmljLkxpbmUoWzAsIDAsIGxpbmVMZW5naHQsIDBdLCB7XG4gIFx0XHRsZWZ0OiAoIGNhbnZhc2VzWydwMSddLndpZHRoIC0gbGluZUxlbmdodCkgLyAyLFxuICBcdCAgdG9wOiAxNjAsXG4gIFx0ICBzdHJva2U6ICcjMjIyJyxcbiAgXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxuICBcdCBcdG9yaWdpblg6ICdsZWZ0JyxcbiAgXHQgIG9yaWdpblk6ICd0b3AnXG4gIFx0fSlcbiAgICBjYW52YXNlc1sncDEnXS5hZGQoY292ZXJMaW5lKVxuXG4gICAgLy8gYXV0aG9yc1xuICBcdGF1dGhvcnMgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBBdXRob3JzJywge1xuICBcdCAgdG9wOiAxODAsXG4gIFx0ICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvJyxcbiAgXHQgIGZpbGw6ICcjNzc3JyxcbiAgXHQgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgXHQgIGZvbnRTaXplOiAyMCxcbiAgXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gIFx0ICB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG4gIFx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gIFx0ICBvcmlnaW5YOiAnbGVmdCcsXG4gIFx0ICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgIGlkOiAnbG9jaycsXG4gICAgICBjYWNoZTogZmFsc2VcbiAgXHR9KS5vbignZWRpdGluZzplbnRlcmVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRoaXMudGV4dCA9PSAnSW5zZXJ0IEF1dGhvcnMnKSB7XG4gICAgICAgIHRoaXMudGV4dCA9ICcnXG4gICAgICAgIHRoaXMuaGlkZGVuVGV4dGFyZWEudmFsdWUgPSAnJ1xuICAgICAgfVxuICAgICAgaXNMb2NrZWRFZGl0aW5nID0gdHJ1ZVxuICAgIH0pLm9uKCdjaGFuZ2VkJywgZnVuY3Rpb24oZSkge1xuICAgICAgUHVibGljYXRpb24uYXV0aG9ycyA9IHRoaXMudGV4dC5yZXBsYWNlKC88L2csIFwiJmx0O1wiKS5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKSAvLyBwcmV2ZW50IGNvZGUgaW5qZWN0aW9uXG4gICAgICB0aGlzLnRleHQgPSB0aGlzLnRleHQucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIilcbiAgICB9KS5vbignZWRpdGluZzpleGl0ZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnNlbGVjdGFibGUgPSBmYWxzZVxuICAgICAgaXNMb2NrZWRFZGl0aW5nID0gZmFsc2VcbiAgICAgIGlmICh0aGlzLnRleHQgPT0gJycpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJ0luc2VydCBBdXRob3JzJ1xuICAgICAgfVxuICAgIH0pXG4gICAgY2FudmFzZXNbJ3AxJ10uYWRkKGF1dGhvcnMpXG5cbiAgICAvLyBkYXRlXG4gICAgcHViRGF0ZSA9IG5ldyBmYWJyaWMuVGV4dCggdGltZUNvbnZlcnRlcihQdWJsaWNhdGlvbi5kYXRlKSwge1xuICAgICAgdG9wOiA2MDAsXG4gICAgICBsZWZ0OiBjYW52YXNlc1sncDgnXS53aWR0aC8yLFxuICAgICAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybycsXG4gICAgICBmaWxsOiAnIzc3NycsXG4gICAgICBsaW5lSGVpZ2h0OiAxLjEsXG4gICAgICBmb250U2l6ZTogMTQsXG4gICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXG4gICAgICBob3ZlckN1cnNvcjogJ2RlZmF1bHQnLFxuICAgICAgb3JpZ2luWDogJ2NlbnRlcicsXG4gICAgICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgIGlkOiAnbG9jaydcbiAgICB9KVxuICAgIGNhbnZhc2VzWydwOCddLmFkZChwdWJEYXRlKTtcbiAgICAvLyBmYWJyaWMuSW1hZ2UuZnJvbVVSTChsb2dvRm90b2NvbGVjdGFuaWFCYXNlNjQsIGZ1bmN0aW9uKGltZyl7XG4gICAgLy8gICBpbWcuaGFzQm9yZGVycyA9IGZhbHNlO1xuICAgIC8vICAgaW1nLmhhc0NvbnRyb2xzID0gZmFsc2U7XG4gICAgLy8gICBpbWcuc2VsZWN0YWJsZSA9IGZhbHNlO1xuICAgIC8vICAgaW1nLnNjYWxlKDAuMTIpO1xuICAgIC8vICAgaW1nLmxlZnQgPSBjYW52YXNlc1sncDgnXS53aWR0aC8yO1xuICAgIC8vICAgaW1nLnRvcCA9IDUzMDtcbiAgICAvLyAgIGltZy5sb2NrTW92ZW1lbnRYID0gdHJ1ZTtcbiAgICAvLyAgIGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcbiAgICAvLyAgIGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuICAgIC8vICAgaW1nLnNldENvbnRyb2xzVmlzaWJpbGl0eSA9IGZhbHNlO1xuICAgIC8vICAgaW1nLmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIC8vICAgaW1nLmlkID0gJ2xvY2snO1xuICAgIC8vICAgY2FudmFzZXNbJ3A4J10uYWRkKGltZyk7XG4gICAgLy8gfSlcbiAgfVxuXG4gIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG5cbiAgICBjYW52YXNlc1tjYW52YXNdLm9uKCdtb3VzZTpkYmxjbGljaycsIGZ1bmN0aW9uKGUpIHsgLy8gb24gZG91YmxlIGNsaWNrIGNyZWF0ZSB0ZXh0Ym94XG5cbiAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpIDwgMCkgeyAvLyBpZiBpdCdzIG5vdCBzYXZlZFxuXG4gICAgICAgIG9iaiA9IHRoaXMuZ2V0QWN0aXZlT2JqZWN0KClcbiAgICAgICAgaWYgKG9iaikge1xuICAgICAgICAgIHZhciBpc0VkaXRpbmcgPSBvYmouaXNFZGl0aW5nXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzTG9ja2VkRWRpdGluZyAhPSB0cnVlICYmICFvYmogJiYgdHlwZW9mIGlzRWRpdGluZyA9PSAndW5kZWZpbmVkJykgeyAvLyBpZiBub3QgZWRpdGluZyB0aXRsZSBhbmQgYXV0aG9ycyBhbmQgdGhlcmUgaXMgbm8gc2VsZWN0ZWQgb2JqZWN0IGFuZCBub3QgZWR0aW5nIGFueXRoaW5nIGVsc2VcbiAgICAgICAgICB0ZXh0V2lkdGggPSAyNTBcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbW91c2VQb3MgPSBnZXRNb3VzZVBvcyh0aGlzKVxuICAgICAgICAgIH0gY2F0Y2goZXJyKSB7IC8vIGZpcmVmb3ggTmFOIGJ1Z1xuICAgICAgICAgICAgdmFyIG1vdXNlUG9zID0ge1xuICAgICAgICAgICAgICB4OiB0aGlzLndpZHRoIC8gMiAtIHRleHRXaWR0aC8yLFxuICAgICAgICAgICAgICB5OiB0aGlzLmhlaWdodCAvIDIuNVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxvcmVtVGV4dGJveCA9IG5ldyBmYWJyaWMuVGV4dGJveChsb3JlbUlwc3VtLCB7XG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6ICdIZWx2ZXRpY2EnLFxuICAgICAgICAgICAgICBsZWZ0OiBwYXJzZUludChtb3VzZVBvcy54KSwgLy8gdG8gYXZvaWQgYmx1clxuICAgICAgICAgICAgICB0b3A6IHBhcnNlSW50KG1vdXNlUG9zLnkpLFxuICAgICAgICAgICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICAgICAgICAgIGZpbGw6IGZvbnRDb2xvcixcbiAgICAgICAgICAgICAgd2lkdGg6IDI1MCxcbiAgICAgICAgICAgICAgYnJlYWtXb3JkczogdHJ1ZSxcbiAgICAgICAgICAgICAgb3JpZ2luWDogJ2xlZnQnLFxuICAgICAgICAgICAgICBvcmlnaW5ZOiAndG9wJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICB0aGlzLmFkZChsb3JlbVRleHRib3gpXG4gICAgICAgICAgc2Z4LmJ1dHRvbigpXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgfSlcblxuICB9XG5cbiAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHsgLy8gd2hlbiBzZWxlY3RpbmcgYW4gb2JqZWN0LCBkZXNlbGVjdCBhbGwgdGhlIG9iamVjdHMgb24gb3RoZXIgY2FudmFzZXNcbiAgICBjYW52YXNlc1tjYW52YXNdLm9uKCdvYmplY3Q6c2VsZWN0ZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzQ2FudmFzID0gZS50YXJnZXQuY2FudmFzLmlkXG4gICAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgICBpZiAoY2FudmFzICE9PSBlLnRhcmdldC5jYW52YXMuaWQpIHtcbiAgICAgICAgICBjYW52YXNlc1tjYW52YXNdLmRpc2NhcmRBY3RpdmVPYmplY3QoKS5yZW5kZXJBbGwoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gICQoZG9jdW1lbnQpLmtleWRvd24oZnVuY3Rpb24oZSkgeyAvLyBkZWwgb3IgYmFja3NwYWNlIHRvIGRlbGV0ZVxuICAgIGlmKCBlLndoaWNoID09IDggfHwgZS53aGljaCA9PSA0Nikge1xuICAgICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgICAgb2JqID0gY2FudmFzZXNbY2FudmFzXS5nZXRBY3RpdmVPYmplY3QoKVxuICAgICAgICBpZiAob2JqKSB7XG4gICAgICAgICAgdmFyIGlzRWRpdGluZyA9IG9iai5pc0VkaXRpbmdcbiAgICAgICAgfVxuICAgICAgICBpZiAoIG9iaiAmJiBpc0VkaXRpbmcgIT0gdHJ1ZSApIHsgIC8vIHJlbW92aW5nIG9iamVjdFxuXG4gICAgICAgICAgY2FudmFzZXNbY2FudmFzXS5yZW1vdmUoY2FudmFzZXNbY2FudmFzXS5nZXRBY3RpdmVPYmplY3QoKSk7XG4gICAgICAgICAgY29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyByZW1vdmU6IHRydWUgfSlcblxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KVxuXG59XG5cblxuLy8gLS0tIE0tVi1DXG5cbnZhciBQdWJsaWNhdGlvbiA9IHtcblx0Ly8gYWxsIG91ciBzdGF0ZXNcblx0aWQ6IG1ha2VJZCgpLFxuXHR0aXRsZTogZGVmYXVsdFRpdGxlLFxuXHR0aW1lTGVmdDogdGltZUxlZnQsXG5cdGV4cGlyZWQ6IGZhbHNlLFxuXHRhdXRob3JzOiBkZWZhdWx0QXV0aG9ycyxcbiAgZGF0ZTogRGF0ZS5ub3coKSxcbiAgaW1hZ2VzQW1vdW50OiAwLFxuICB0ZXh0QW1vdW50OiAwLFxuICB0aW1lRWxhcHNlZDogMCxcbiAgYWNoaWV2ZW1lbnRzQW1vdW50OiAwLFxuXHRwYWdlczoge1xuXHRcdHAxOiB7fSxcblx0XHRwMjoge30sXG5cdFx0cDM6IHt9LFxuXHRcdHA0OiB7fSxcblx0XHRwNToge30sXG5cdFx0cDY6IHt9LFxuXHRcdHA3OiB7fSxcblx0XHRwODoge31cblx0fVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihQdWJsaWNhdGlvbiwgaW5wdXQpIHtcblx0aWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkgeyAvLyBub3QgZXhwaXJlZFxuXHRcdHNob3dUaW1lKFB1YmxpY2F0aW9uKVxuXHR9IGVsc2UgeyAgLy8gZXhwaXJlZFxuXHRcdHNob3dFeHBpcmVkKClcblx0fVxuXG5cdGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG5cdFx0c3dpdGNoICh0cnVlKSB7XG5cdFx0XHRjYXNlIGlucHV0LnJlbW92ZSA9PSB0cnVlOiAvLyBkZWxldGluZyBhbiBlbGVtZW50XG4gICAgICAgICAgYWRkVGltZSgtYm9udXNUaW1lKVxuICAgICAgICAgIGNyaXRpY1NheXMoJ1RoaW5rIHR3aWNlIG5leHQgdGltZS4uLicpXG5cdFx0XHRcdFx0YnJlYWtcbiAgICAgIGNhc2UgaW5wdXQuZGF0YSAmJlxuICAgICAgICBmaWxlc2l6ZVB1YkxlZnQgPD0gMDogLy8gcHVibGljYXRpb24gaXMgMTBtYlxuICAgICAgICAgIEVycm9yLnB1YlRvb0JpZygpXG4gICAgICAgICAgYWRkVGltZSgtYm9udXNUaW1lKVxuICAgICAgICAgIGNyaXRpY1NheXMoJ0Vub3VnaCEnKVxuICAgICAgICAgIGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0Ynl0ZUNvdW50KGlucHV0LmRhdGEpID4gbWF4RmlsZVNpemUgOiAvLyBmaWxlIHRvbyBiaWcgKDFtYilcblx0XHRcdFx0IFx0RXJyb3IudG9vQmlnKClcbiAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG4gICAgICAgICAgY3JpdGljU2F5cygnVGhpcyBpcyBub3QgYSBzZXJ2ZXIgZmFybS4nKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IGltYWdlXG5cbiAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UvZ2lmJykpIHsgLy8gbm90IGEgZ2lmXG5cbiAgXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zKTsgLy8gZHJvcCBlbGVtZW50XG5cbiAgICAgICAgICAgIHVwZGF0ZUZpbGVzaXplUHViTGVmdChpbnB1dC5kYXRhKVxuXG4gICAgICAgICAgICBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKz0gMSAvLyBhY2hpZXZlbWVudCBldmVyeSB4IGltZ3NcbiAgICAgICAgICAgIGlmIChQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQlYWNoaWV2ZW1lbnRTcGFuID09IDApIHtcbiAgICAgICAgICAgICAgYWNoaWV2ZW1lbnQoMTAwICogUHVibGljYXRpb24uaW1hZ2VzQW1vdW50LCBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKyAnIGltYWdlcyBhZGRlZCEnKVxuICAgICAgICAgICAgICBQdWJsaWNhdGlvbi5hY2hpZXZlbWVudHNBbW91bnQgKz0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCA9PSAzKSB7IC8vIHNhdmUgcHViIGFmdGVyIGxvYWRpbmcgMyBpbWFnZXNcbiAgICAgICAgICAgICAgJCgnI2RvbmUnKS5jc3MoJ2Rpc3BsYXknLCdpbmxpbmUtYmxvY2snKVxuICAgICAgICAgICAgICBjcml0aWNTYXlzKCdZb3UgY2FuIG5vdyBzYXZlIHlvdXIgcHVibGljYXRpb24hJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHN0YXJ0IGRpc3J1cHRpb25zIGFmdGVyIGZpcnN0IGltYWdlXG4gICAgICAgICAgICBpZiAoICBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgPT0gMSAmJlxuICAgICAgICAgICAgICAgICAgZ2V0VXJsUGFyYW1ldGVyKCdkaXNydXB0aW9ucycpICE9ICdmYWxzZScgJiZcbiAgICAgICAgICAgICAgICAgIGRpc3J1cHRpb25zT24gPT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgICAgdHlwZW9mIHkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHsgLy8gbGF1bmNoIGEgcmFuZG9tIGRpc3J1cHRpb25cbiAgICAgICAgICAgICAgICBkaXNydXB0aW9ucyA9IE9iamVjdC5rZXlzKERpc3J1cHRpb24pXG4gICAgICAgICAgICAgICAgRGlzcnVwdGlvbltkaXNydXB0aW9uc1sgZGlzcnVwdGlvbnMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV0oKVxuICAgICAgICAgICAgICAgIHNoYWtlKHBhZ2VzKVxuICAgICAgICAgICAgICAgIHNmeC5kaXNydXB0aW9uKClcbiAgICAgICAgICAgICAgfSwgZGlzcnVwdGlvbkludGVydmFsKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhZGRUaW1lKGJvbnVzVGltZSlcbiAgXHRcdFx0XHRcdGNyaXRpY1NheXMoKVxuXG4gICAgICAgICAgfSBlbHNlIHsgLy8gYSBnaWZcbiAgICAgICAgICAgIEVycm9yLm5vR2lmcygpXG4gICAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG4gICAgICAgICAgfVxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyB0ZXh0XG5cbiAgICAgICAgICB2YXIgZGVCYXNlZElucHV0ID0gYXRvYihpbnB1dC5kYXRhLnN1YnN0cmluZygyMykpO1xuICAgICAgICAgIGlmIChkZUJhc2VkSW5wdXQuaW5jbHVkZXMoJzxzY3JpcHQ+JykpIHsgLy8gY29kZSBpbmplY3Rpb25cblxuICAgICAgICAgICAgRXJyb3IuY29kZUluamVjdGlvbigpXG4gICAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG4gICAgICAgICAgICBjcml0aWNTYXlzKCdZb3UgZGVzZXJ2ZSB0byBiZSBwdW5pc2hlZC4nKVxuXG4gICAgICAgICAgfSBlbHNlIHtcblxuICBcdFx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQubW91c2VQb3MpIC8vIGRyb3AgZWxlbWVudFxuXG4gICAgICAgICAgICB1cGRhdGVGaWxlc2l6ZVB1YkxlZnQoaW5wdXQuZGF0YSlcblxuICAgICAgICAgICAgUHVibGljYXRpb24udGV4dEFtb3VudCArPSBpbnB1dC5kYXRhLmxlbmd0aFxuICAgICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLnRleHRBbW91bnQgPj0gNTAwKSB7XG4gICAgICAgICAgICAgIGFjaGlldmVtZW50KDUwMCwgJ01vcmUgdGhhbiA1MDAgY2hhcmFjdGVycyBhZGRlZCcpXG4gICAgICAgICAgICAgIFB1YmxpY2F0aW9uLmFjaGlldmVtZW50c0Ftb3VudCArPSAxXG4gICAgICAgICAgICB9XG5cbiAgXHRcdFx0XHRcdGFkZFRpbWUoYm9udXNUaW1lICogMilcbiAgICAgICAgICAgIGNyaXRpY1NheXMoJ1RoaXMgaXMgZ29ubmEgYmUgYSBnb29vb29vZCByZWFkJylcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJyk6IC8vIG5laXRoZXIgYW4gaW1hZ2Ugbm9yIHRleHRcblx0XHRcdFx0XHRFcnJvci5ub3RBbGxvd2VkKClcbiAgICAgICAgICBhZGRUaW1lKC1ib251c1RpbWUpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQubW92ZSA9PSB0cnVlIDogLy8gbW92aW5nIG9yIHNjYWxpbmcgYW4gaW1hZ2Vcblx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dC5wYWdlXSA9IGNhbnZhc2VzW2lucHV0LnBhZ2VdLnRvSlNPTigpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH0gZWxzZSBpZiAoaW5wdXQgJiYgaW5wdXQubW92ZSAhPT0gdHJ1ZSAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IHRydWUpIHtcblx0XHQvLyB0b28gbGF0ZVxuXHRcdEVycm9yLnRvb0xhdGUoKTtcblx0fVxufVxuXG5cbi8vIC0tLSBQUkVDT05UUk9MTEVSXG5cbmZ1bmN0aW9uIGNvdW50ZG93bldyYXBwZXIoKSB7XG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGFuaW1hdGVVcCgkKCcjY291bnRlcicpKTtcblxuXG4gICAgZnVuY3Rpb24gY291bnRkb3duKHN0YXJ0VGltZSkge1xuICAgICAgYW5pbWF0ZVVwT3V0KCQoJyNjb3VudGRvd25XcmFwcGVyJyksIDEwMDApXG5cbiAgICAgIHN3aXRjaCAoc3RhcnRUaW1lKSB7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAkKCcjY291bnRkb3duJykuaHRtbCgnPHNwYW4+UHJlcGFyZSB5b3VyIDxzcGFuIGNsYXNzPVwicGVyaXNoXCI+QXNzZXRzITwvc3Bhbj48L3NwYW4+Jyk7XG4gICAgICAgICAgc2Z4LmNvdW50ZG93bigpXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAkKCcjY291bnRkb3duJykuaHRtbCgnPHNwYW4+Q3JlYXRlIHlvdXIgPHNwYW4gY2xhc3M9XCJwZXJpc2hcIj5MYXlvdXQhPC9zcGFuPjwvc3Bhbj4nKTtcbiAgICAgICAgICBzZnguY291bnRkb3duKClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICQoJyNjb3VudGRvd24nKS5odG1sKCc8c3Bhbj5QdWJsaXNoIG9yIDxzcGFuIGNsYXNzPVwicGVyaXNoXCI+UGVyaXNoITwvc3Bhbj48L3NwYW4+Jyk7XG4gICAgICAgICAgc2Z4LmNvdW50ZG93bigpXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICB9XG5cbiAgICAgIHN0YXJ0VGltZSA9IHN0YXJ0VGltZSAtIDE7XG4gICAgICBpZiAoc3RhcnRUaW1lID49IDApIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY291bnRkb3duKHN0YXJ0VGltZSk7XG4gICAgICAgIH0sIDEzMDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2Z4LmNvdW50ZG93blJlYWR5KClcbiAgICAgICAgc291bmR0cmFjay5wbGF5KClcbiAgICAgICAgaW5pdEdhbWUoKVxuICAgICAgICAkKCcjY291bnRkb3duV3JhcHBlcicpLnJlbW92ZSgpO1xuICAgICAgICAkKCcuY291bnRlcicpLmZhZGVJbigzMDApO1xuICAgICAgICBpZiAoIGdldFVybFBhcmFtZXRlcigndGltZScpICkgeyAvLyBkaWZmaWN1bHR5XG4gICAgICAgICAgUHVibGljYXRpb24udGltZUxlZnQgPSBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzdGFydFRpbWUgPSAzO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgY291bnRkb3duKHN0YXJ0VGltZSlcbiAgICB9LCAyMDApXG4gIH0pO1xufVxuXG5pZiAoIWdldFVybFBhcmFtZXRlcignZGVtbycpICYmIHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJy9zYXZlZCcpIDw9IC0xKSB7IC8vIGlmIG5vdCBkZW1vIGFuZCBub3QgL3NhdmVkXG4gICQoJy5jb3VudGVyJykuaGlkZSgpO1xuICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJub1dpemFyZFwiKSAhPSBcInRydWVcIikge1xuICAgIGluc3RydWN0aW9uTWVzc2FnZSgwKTsgIC8vIHNob3cgd2l6YXJkXG4gIH0gZWxzZSBpZiAoIWdldFVybFBhcmFtZXRlcignZGVtbycpKSB7XG4gICAgY291bnRkb3duV3JhcHBlcigpXG4gIH1cbn0gZWxzZSBpZiAoZ2V0VXJsUGFyYW1ldGVyKCdkZW1vJykpIHsgLy8gaWYgZGVtb1xuICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJub1dpemFyZFwiKSAhPSBcInRydWVcIikge1xuICAgIGluc3RydWN0aW9uTWVzc2FnZSgwKTtcbiAgfSBlbHNlIHtcbiAgICBpbml0R2FtZSgpXG4gICAgc291bmR0cmFjay5wbGF5KClcbiAgfVxufVxuXG5cblxuZnVuY3Rpb24gaW5zdHJ1Y3Rpb25NZXNzYWdlKG51bSkge1xuICB2YXIgd2l6YXJkVGltZSA9ICggZ2V0VXJsUGFyYW1ldGVyKCdkZW1vJykgKSA/ICfiiJ4nIDogUHVibGljYXRpb24udGltZUxlZnRcblxuICB2YXIgbWVzc2FnZUFycmF5ID0gW1xuICAgICc8ZGl2IGNsYXNzPVwibGVmdFwiPjxpbWcgY2xhc3M9XCJsZWZ0XCIgc3JjPVwiYXNzZXRzL2ltZy9hY2hpZXZlbWVudC5wbmdcIiAvPjwvZGl2PjxkaXYgY2xhc3M9XCJyaWdodFwiPjxoMj5XZWxjb21lIHRvIFB1Ymxpc2ggb3IgUGVyaXNoISBJbnN0cnVjdGlvbnMgV2l6YXJkPC9oMj4gPHA+VGhpcyB3aXphcmQgd2lsbCBndWlkZSB5b3UgdGhyb3VnaCB0aGUgd29ya2Zsb3cgb2YgPGVtPlB1Ymxpc2ggb3IgUGVyaXNoITwvZW0+LiBJdCBpcyByZWNvbW1lbmRlZCB0byA8c3Ryb25nPnByZXBhcmUgYSBkaXJlY3Rvcnkgb2YgZmlsZXM8L3N0cm9uZz4gZm9yIHlvdXIgcHVibGljYXRpb24gaW4gYWR2YW5jZS48L3A+PHA+Q2xpY2sgTmV4dCB0byBDb250aW51ZTwvcD48L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uc1wiPjxkaXYgY2xhc3M9XCJidXR0b24gbmV4dFdpemFyZFwiPk5leHQgPjwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b24gY2xvc2VXaXphcmRcIj5DYW5jZWw8L2Rpdj48L2Rpdj48L2Rpdj4nLFxuXG4gICAgJzxkaXYgY2xhc3M9XCJsZWZ0XCI+PGltZyBjbGFzcz1cImxlZnRcIiBzcmM9XCJhc3NldHMvaW1nL2pwZy5zdmdcIiAvPjwvZGl2PjxkaXYgY2xhc3M9XCJyaWdodFwiPjxoMj5JbWFnZXM8L2gyPiA8cD48cD5Zb3UgY2FuIGRyYWcgYW5kIGRyb3AgaW1hZ2VzICg8c3Ryb25nPi5qcGcsIC5wbmcgPC9zdHJvbmc+KSBmcm9tIHlvdXIgY29tcHV0ZXIgb250byB0aGUgcGFnZS4gVGhlc2UgaW1hZ2VzIGNhbiBiZSA8c3Ryb25nPm1vdmVkPC9zdHJvbmc+LCA8c3Ryb25nPnNjYWxlZDwvc3Ryb25nPiBhbmQgPHN0cm9uZz5yb3RhdGVkPC9zdHJvbmc+LjwvcD48cD5UaGUgZmlsZS1zaXplIGxpbWl0IGlzIDxzdHJvbmc+MW1iPC9zdHJvbmc+LjwvcD48cD5DbGljayBOZXh0IHRvIENvbnRpbnVlPC9wPjwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b25zXCI+PGRpdiBjbGFzcz1cImJ1dHRvbiBuZXh0V2l6YXJkXCI+TmV4dCA+PC9kaXY+PGRpdiBjbGFzcz1cImJ1dHRvbiBjbG9zZVdpemFyZFwiPkNhbmNlbDwvZGl2PjwvZGl2PjwvZGl2PicsXG5cbiAgICAnPGRpdiBjbGFzcz1cImxlZnRcIj48aW1nIGNsYXNzPVwibGVmdFwiIHNyYz1cImFzc2V0cy9pbWcvdHh0LnN2Z1wiIC8+PC9kaXY+PGRpdiBjbGFzcz1cInJpZ2h0XCI+PGgyPlRleHQ8L2gyPiA8cD48cD5Zb3UgY2FuIGRyYWcgYW5kIGRyb3AgdGV4dCAoPHN0cm9uZz4udHh0PC9zdHJvbmc+KSBmcm9tIHlvdXIgY29tcHV0ZXIgb250byB0aGUgcGFnZSBvciB5b3UgY2FuIDxzdHJvbmc+ZG91YmxlIGNsaWNrPC9zdHJvbmc+IHRvIGNyZWF0ZSBhIG5ldyB0ZXh0Ym94LjwvcD48cD5DbGljayBOZXh0IHRvIGNvbnRpbnVlPC9wPjwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b25zXCI+PGRpdiBjbGFzcz1cImJ1dHRvbiBuZXh0V2l6YXJkXCI+TmV4dCA+PC9kaXY+PGRpdiBjbGFzcz1cImJ1dHRvbiBjbG9zZVdpemFyZFwiPkNhbmNlbDwvZGl2PjwvZGl2PjwvZGl2PicsXG5cbiAgICAnPGRpdiBjbGFzcz1cImxlZnRcIj48aW1nIGNsYXNzPVwibGVmdFwiIHNyYz1cImFzc2V0cy9pbWcvdGltZS5zdmdcIiAvPjwvZGl2PjxkaXYgY2xhc3M9XCJyaWdodFwiPjxoMj5UaW1lICYgRGlzcnVwdGlvbnM8L2gyPiA8cD48cD5Zb3Ugd2lsbCBoYXZlIDxzdHJvbmc+JyArIHdpemFyZFRpbWUgKyAnIHNlY29uZHM8L3N0cm9uZz4gdG8gY29tcGxldGUgeW91ciBwdWJsaWNhdGlvbi4gRHVyaW5nIHRoaXMgdGltZSwgaWYgeW91XFwncmUgbm90IGluIERlbW8gbW9kZSwgPHN0cm9uZz51bmV4cGVjdGVkIHRoaW5ncyB3aWxsIGhhcHBlbjwvc3Ryb25nPi4gQmUgcmVhZHkhPC9wPjxwPlRoZSBmaWxlLXNpemUgbGltaXQgZm9yIHRoZSB3aG9sZSBwdWJsaWNhdGlvbiBpcyA8c3Ryb25nPjEwbWI8L3N0cm9uZz4uPC9wPjxwPkNsaWNrIEZpbmlzaCB0byBzdGFydCB0aGUgZ2FtZTwvcD48L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uc1wiPjxsYWJlbCBjbGFzcz1cIndpemFyZG5ldmVyYWdhaW5cIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCI+PHNwYW4gY2xhc3M9XCJjaGVja21hcmtcIj48L3NwYW4+RG9uXFwndCBzaG93IHRoaXMgd2l6YXJkIGFnYWluPC9sYWJlbD48ZGl2IGNsYXNzPVwiYnV0dG9uIG5leHRXaXphcmRcIj5GaW5pc2g8L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uIGNsb3NlV2l6YXJkXCI+Q2FuY2VsPC9kaXY+PC9kaXY+PC9kaXY+JyxcbiAgXVxuXG4gIHZhciBtZXNzYWdlSFRNTCA9ICQoJzxkaXYgY2xhc3M9XCJhbGVydCB3aXphcmRcIj48ZGl2IGNsYXNzPVwidG9wYmFyXCI+PC9kaXY+PGltZyBjbGFzcz1cImNsb3NlIGNsb3NlQWxlcnRcIiBzcmM9XCIvYXNzZXRzL2ltZy94LnBuZ1wiIC8+PGRpdiBjbGFzcz1cImFsZXJ0TWVzc2FnZVwiPicgKyBtZXNzYWdlQXJyYXlbbnVtXSArICc8L2Rpdj4nKTtcbiAgJCgnYm9keScpLmFwcGVuZChtZXNzYWdlSFRNTClcbiAgbWVzc2FnZUhUTUwuc2hvdygpO1xuICBtZXNzYWdlSFRNTC5jc3MoJ2xlZnQnLCAoKHdpbmRvdy5pbm5lcldpZHRoLzIpIC0gKDYwMC8yKSkgKydweCcpO1xuICBtZXNzYWdlSFRNTC5jc3MoJ3RvcCcsICgod2luZG93LmlubmVySGVpZ2h0LzIpLSAoNDAwLzIpKSArJ3B4Jyk7XG5cbn1cblxudmFyIG5vV2l6YXJkID0gZmFsc2VcbiQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcud2l6YXJkbmV2ZXJhZ2FpbiBpbnB1dCcsIGZ1bmN0aW9uKCkge1xuICBpZiAoJCh0aGlzKS5hdHRyKCdjaGVja2VkJykpIHtcbiAgICAkKHRoaXMpLmF0dHIoJ2NoZWNrZWQnLCBmYWxzZSlcbiAgICBub1dpemFyZCA9IGZhbHNlXG4gIH0gZWxzZSB7XG4gICAgJCh0aGlzKS5hdHRyKCdjaGVja2VkJywgdHJ1ZSlcbiAgICBub1dpemFyZCA9IHRydWVcbiAgfVxufSk7XG5cbnZhciBudW1iZXIgPSAwO1xuJChkb2N1bWVudCkub24oJ2NsaWNrJywgXCIuY2xvc2VXaXphcmQsIC53aXphcmQgLmNsb3NlQWxlcnRcIiwgZnVuY3Rpb24oKSB7XG4gIGlmICggbm9XaXphcmQgPT0gdHJ1ZSApIHsgLy8gaWYgY2hlY2tib3ggaXMgY2hlY2tlZFxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibm9XaXphcmRcIiwgXCJ0cnVlXCIpXG4gIH1cbiAgJCh0aGlzKS5jbG9zZXN0KCcuYWxlcnQnKS5yZW1vdmUoKTtcbiAgaWYgKCFnZXRVcmxQYXJhbWV0ZXIoJ2RlbW8nKSkgeyAvLyBpZiBub3QgZGVtb1xuICAgIGNvdW50ZG93bldyYXBwZXIoKTtcbiAgfSBlbHNlIHtcbiAgICBpbml0R2FtZSgpXG4gICAgc291bmR0cmFjay5wbGF5KClcbiAgfVxufSk7XG5cbiQoZG9jdW1lbnQpLm9uKCdjbGljaycsIFwiLm5leHRXaXphcmRcIiwgZnVuY3Rpb24oKSB7XG4gIGlmICggZ2V0VXJsUGFyYW1ldGVyKCd0aW1lJykgKSB7IC8vIGRpZmZpY3VsdHlcbiAgICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IHRpbWVTZXQgPSBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKVxuICB9XG4gIG51bWJlciA9IG51bWJlciArIDE7XG4gIGlmICggbm9XaXphcmQgPT0gdHJ1ZSApIHsgLy8gaWYgY2hlY2tib3ggaXMgY2hlY2tlZFxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibm9XaXphcmRcIiwgXCJ0cnVlXCIpXG4gIH1cbiAgJCgnLmFsZXJ0JykucmVtb3ZlKCk7XG4gIGlmIChudW1iZXIgPD0gMykge1xuICAgIGluc3RydWN0aW9uTWVzc2FnZShudW1iZXIpO1xuICB9IGVsc2Uge1xuICAgIGlmICghZ2V0VXJsUGFyYW1ldGVyKCdkZW1vJykpIHsgLy8gaWYgbm90IGRlbW9cbiAgICAgIGNvdW50ZG93bldyYXBwZXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc291bmR0cmFjay5wbGF5KClcbiAgICB9XG4gICAgbnVtYmVyID0gMDtcblxuICB9XG59KTtcblxuXG4vLyAtLS0gQ09OVFJPTExFUlxuXG52YXIgeDtcbmluaXRDYW52YXNlcygpXG5mdW5jdGlvbiBpbml0R2FtZSgpIHtcblx0b25Nb2RFbGVtZW50KClcblx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPCAwKSB7XG5cdFx0Ly8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cblx0XHRpZiAoIGdldFVybFBhcmFtZXRlcigndGltZScpICkgeyAvLyBkaWZmaWN1bHR5XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IHRpbWVTZXQgPSBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKVxuXHRcdH0gZWxzZSB7XG4gICAgICBpbmZpbml0ZVRpbWUgPSB0cnVlXG4gICAgfVxuXHRcdHggPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgLSAxMDtcbiAgICAgIGlmIChpbmZpbml0ZVRpbWUgPT0gZmFsc2UpIHtcbiAgICAgICAgUHVibGljYXRpb24udGltZUVsYXBzZWQgPSBQdWJsaWNhdGlvbi50aW1lRWxhcHNlZCArIDEwIC8gMTAwMFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgUHVibGljYXRpb24udGltZUVsYXBzZWQgPSAwXG4gICAgICB9XG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uKTtcblx0XHR9LCAxMClcblx0XHRtb3VzZUNvdW50ZXIoKVxuXHR9IGVsc2UgeyAvLyBzYXZlZCBwdWJsaWNhdGlvblxuXHRcdHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFkZFRpbWUoYm9udXNUaW1lKSB7XG5cdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgKyBib251c1RpbWU7XG5cdGFuaW1hdGV0aW1lY291bnRlcihib251c1RpbWUvMTAwMCk7XG4gIGlmIChib251c1RpbWUgPj0gMCkge1xuICAgIHNmeC5hZGRUaW1lUGx1cygpXG4gIH0gZWxzZSB7XG4gICAgc2Z4LmFkZFRpbWVNaW51cygpXG4gIH1cbn1cblxuLy8gbW9kaWZ5IGVsZW1lbnQgbGlzdGVuZXJcbmZ1bmN0aW9uIG9uTW9kRWxlbWVudCgpIHtcblx0Zm9yICh2YXIgcGFnZUlkIGluIGNhbnZhc2VzKSB7XG5cdFx0Y2FudmFzZXNbIHBhZ2VJZCBdLm9uKCdvYmplY3Q6bW9kaWZpZWQnLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBwYXJlbnRDYW52YXNJZCA9IGV2dC50YXJnZXQuY2FudmFzLmxvd2VyQ2FudmFzRWwuaWRcblx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgbW92ZTogdHJ1ZSwgcGFnZTogcGFyZW50Q2FudmFzSWR9KVxuXHRcdH0pXG5cdH1cbn1cblxuLy8gZ2V0IG1vdXNlIHBvc2l0aW9uIG9uIGNhbnZhc1xuZnVuY3Rpb24gZ2V0TW91c2VQb3MoY2FudmFzLCBlKSB7XG4gIHZhciBwb2ludGVyID0gY2FudmFzLmdldFBvaW50ZXIoZSlcbiAgdmFyIHBvc1ggPSBwb2ludGVyLnhcbiAgdmFyIHBvc1kgPSBwb2ludGVyLnlcbiAgcmV0dXJuIHtcbiAgICB4OiBwb3NYLFxuICAgIHk6IHBvc1lcbiAgfVxufVxuXG5jb25zdCBwYWdlcyA9ICQoJy5wYWdlJylcbi8vIGRyb3AgZWxlbWVudFxucGFnZXMub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG4gICQodGhpcykuYWRkQ2xhc3MoJ2Ryb3BwYWJsZScpO1xufSk7XG5wYWdlcy5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG4gICQoJy5kcm9wcGFibGUnKS5yZW1vdmVDbGFzcygnZHJvcHBhYmxlJyk7XG59KTtcbnBhZ2VzLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG4gICQoJy5kcm9wcGFibGUnKS5yZW1vdmVDbGFzcygnZHJvcHBhYmxlJyk7XG5cdHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdHZhciB5ID0gMDtcblx0Zm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0cmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHR2YXIgcGFnZUlkID0gJCh0aGlzKS5maW5kKCdjYW52YXMnKS5hdHRyKCdpZCcpO1xuXHRcdG1vdXNlUG9zID0gZ2V0TW91c2VQb3MoY2FudmFzZXNbcGFnZUlkXSwgZSlcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0XHRcdFx0ZGF0YTogZXZlbnQudGFyZ2V0LnJlc3VsdCxcblx0XHRcdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHBhZ2U6IHBhZ2VJZCxcblx0XHRcdFx0XHRtb3VzZVBvczogbW91c2VQb3Ncblx0XHRcdFx0fSk7XG5cdFx0XHR9LCB5ICogZHJvcERlbGF5KTtcblx0XHRcdHkgKz0gMTtcblx0XHR9XG5cdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZXNbaV0pXG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpXG59KVxuJCgnYm9keScpLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKVxufSlcbiQoJ2JvZHknKS5vbignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpXG4gIHNmeC5lcnJvcigpXG59KVxuXG5cblxuXG5cblxuXG4vLyAtLS0gVklFV1xuXG5cbi8vIFRPRE86IG1lcmdlIHRoZXNlIHR3b1xuZnVuY3Rpb24gcGFkKG4sIGxlbikge1xuICByZXR1cm4gKG5ldyBBcnJheShsZW4gKyAxKS5qb2luKCcwJykgKyBuKS5zbGljZSgtbGVuKTtcbn1cblxuXG5mdW5jdGlvbiBzaG93VGltZShQdWJsaWNhdGlvbikge1xuXHRzZWNvbmRzID0gUHVibGljYXRpb24udGltZUxlZnQgLyAxMDAwO1xuXHQkKCcjY291bnRlcicpLnNob3coKTtcblx0dmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKHNlY29uZHMgLyA2MCk7XG5cdHZhciBzZWNvbmRzID0gc2Vjb25kcyAlIDYwO1xuXHR2YXIgbXM7XG5cdGlmICghIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykpIHtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBkID0gbmV3IERhdGUoKTtcblx0XHRcdG1zID0gZC5nZXRNaWxsaXNlY29uZHMoKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID0gcGFkKG1pbnV0ZXMsIDIpICsgJzonICsgcGFkKHNlY29uZHMudG9GaXhlZCgwKSwgMikgKyAnOicgKyBwYWQobXMudG9TdHJpbmcoKS5zdWJzdHIoMCwyKSwgMikgKyAnIGxlZnQhJztcblx0XHRcdGlmIChtaW51dGVzIDw9IDAgJiYgc2Vjb25kcyA8PSAyMCkge1xuXG5cdFx0XHRcdHZhciBzaXplID0gKDEuMzQ0NDQ0NDQgLSAoc2Vjb25kcyAvIDYwKSk7XG5cdFx0XHRcdCQoJy5jb3VudGVyJykuY3NzKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIHNpemUgKyAnKScpO1xuXG5cdFx0XHRcdHN3aXRjaCAoc2Vjb25kcykge1xuXHRcdFx0XHRcdGNhc2UgNTpcblx0XHRcdFx0XHRcdHNmeC5lcnJvcigpXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0XHRzZnguZXJyb3IoKVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdFx0c2Z4LmVycm9yKClcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0XHRcdHNmeC5lcnJvcigpXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdFx0XHRzZnguZXJyb3IoKVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSwgMSlcblx0fSBlbHNlIHtcblx0XHQvLyBjb25zb2xlLmxvZygnZXJyb3InKTtcblx0fVxufVxuZnVuY3Rpb24gbW91c2VDb3VudGVyKCkge1xuXHQkKGRvY3VtZW50KS5iaW5kKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUucGFnZVggPj0gJChkb2N1bWVudCkud2lkdGgoKSAvIDIpIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIHJpZ2h0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5hZGRDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCAtIDIwIC0gJCgnI2NvdW50ZXInKS53aWR0aCgpLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIGxlZnQgc2lkZSBvZiBwYWdlXG5cdFx0XHQkKCcjY291bnRlcicpLnJlbW92ZUNsYXNzKCdtb3VzZV9yaWdodCcpO1xuXHRcdFx0JCgnI2NvdW50ZXInKS5jc3Moe1xuXHRcdFx0XHRsZWZ0OiBlLnBhZ2VYICsgMjAsXG5cdFx0XHRcdHRvcDogZS5wYWdlWSArIDUwXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzaG93RXhwaXJlZCgpIHtcbiAgaWYgKFB1YmxpY2F0aW9uLmV4cGlyZWQgIT0gdHJ1ZSkge1xuICAgIHNvdW5kdHJhY2suc3RvcCgpXG4gICAgUHVibGljYXRpb24uZXhwaXJlZCA9IHRydWVcbiAgICBQdWJsaWNhdGlvbi50aW1lRWxhcHNlZCA9IHBhcnNlSW50KFB1YmxpY2F0aW9uLnRpbWVFbGFwc2VkKVxuXG4gICAgLy8gbG9ja2luZyBlbGVtZW50c1xuICAgIGxvY2tFbGVtZW50cyhhbGxFbGVtZW50cygpKVxuICAgIGlmICh0aXRsZS50ZXh0ID09ICdJbnNlcnQgVGl0bGUnKSB7XG4gICAgICB0aXRsZS50ZXh0ID0gZGVmYXVsdFRpdGxlXG4gICAgfVxuICAgIGlmIChhdXRob3JzLnRleHQgPT0gJ0luc2VydCBBdXRob3JzJykge1xuICAgICAgYXV0aG9ycy50ZXh0ID0gZGVmYXVsdEF1dGhvcnNcbiAgICB9XG4gICAgdGl0bGUuZXhpdEVkaXRpbmcoKVxuICAgIGF1dGhvcnMuZXhpdEVkaXRpbmcoKVxuICAgIHRpdGxlLnNlbGVjdGFibGUgPSB0aXRsZS5hdXRob3JzID0gZmFsc2VcbiAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgY2FudmFzZXNbY2FudmFzXS5zZWxlY3RhYmxlID0gZmFsc2VcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uZGlzY2FyZEFjdGl2ZU9iamVjdCgpLnJlbmRlckFsbCgpXG4gICAgfVxuXG4gICAgZWxlbWVudHNBbW91bnQgPSAwXG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGVsZW1lbnRzQW1vdW50ID0gZWxlbWVudHNBbW91bnQgKyBjYW52YXNlc1tjYW52YXNdLmdldE9iamVjdHMoKS5sZW5ndGhcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzQW1vdW50IDw9IDUpIHtcbiAgICAgICQoJy50cnlhZ2FpbicpLmNzcygnZGlzcGxheScsJ2lubGluZS1ibG9jaycpXG4gICAgICAkKCcuc2F2ZScpLmhpZGUoKVxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICBFcnJvci5ub0NvbnRlbnQoKVxuICAgICAgfSwgMjAwMClcbiAgICB9IGVsc2Uge1xuXG4gICAgfVxuXG4gICAgc2hvd1B1YmxpY2F0aW9uRGF0YShQdWJsaWNhdGlvbilcblxuICAgIGlmICggZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKSApIHtcbiAgXHQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgfVxuICBcdCQoJ2JvZHknKS5hZGRDbGFzcygnZXhwaXJlZCcpXG4gIFx0ZXhwaXJlZFRpbWUoKVxuICAgIHNmeC5wZXJpc2hlZCgpXG4gIFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gIFx0XHQkKCcud3JhcHBlcicpLmFkZENsYXNzKCdzYXZlZF92aWV3Jyk7XG4gIFx0XHRzYXZlZFN0YXRlKClcbiAgXHR9LCA1MDApXG4gIFx0Y2xlYXJJbnRlcnZhbCh4KSAvLyBjbGVhciBjb250cm9sbGVyXG4gICAgaWYgKHR5cGVvZiB5ICE9PSAndW5kZWZpbmVkJykgeyAvLyBpZiBkaXNydXB0aW9uc1xuICAgICAgY2xlYXJJbnRlcnZhbCh5KSAvLyBjbGVhciBkaXNydXB0aW9uc1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkcm9wRWxlbWVudChwYWdlSWQsIGRhdGEsIG1vdXNlUG9zKSB7XG5cdHZhciBlbGVtZW50ID0geyBkYXRhOiBkYXRhLCBwYWdlOiBwYWdlSWQgfVxuXHR2YXIgZWxlbWVudFBvcyA9IGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MpXG59XG5cblxuXG5cblxuXG5cblxuLy8gZXJyb3JzXG5cbnZhciBFcnJvciA9IHtcblx0bm90QWxsb3dlZDogZnVuY3Rpb24oKSB7XG5cdFx0YWxlcnRNZXNzYWdlKCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyBub3QgYWxsb3dlZCEnKVxuXHR9LFxuXHR0b29CaWc6IGZ1bmN0aW9uKCkge1xuXHRcdGFsZXJ0TWVzc2FnZSgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgdG9vIGJpZyEnKVxuXHR9LFxuICBwdWJUb29CaWc6IGZ1bmN0aW9uKCkge1xuICAgIGFsZXJ0TWVzc2FnZSgnWW91IHJlYWNoZWQgdGhlIGxpbWl0IG9mIDEwbWIgZm9yIHRoaXMgcHVibGljYXRpb24uIFlvdSBjYW4gc3RpbGwgd29yayBvbiB0aGUgbGF5b3V0IGFuZCBzYXZlIHRoZSBwdWJsaWNhdGlvbi4nKVxuICB9LFxuICBub0dpZnM6IGZ1bmN0aW9uKCkge1xuICAgIGFsZXJ0TWVzc2FnZSgnR2lmcyBhcmUgbm90IGFsbG93ZWQuIChUaGlzIHN1Y2tzLCBJIGtub3cuLi4pJylcbiAgfSxcblx0dG9vTGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0YWxlcnRNZXNzYWdlKCdUb28gbGF0ZSBhbWlnbycpXG4gICAgc2Z4LmVycm9yKClcblx0fSxcbiAgY29kZUluamVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgYWxlcnRNZXNzYWdlKCdIZXkgaGFja2VyLCB5b3VcXCdyZSB0cnlpbmcgdG8gaW5qZWN0IGNvZGUuIFBsZWFzZSBkb25cXCd0LicpXG4gIH0sXG4gIG5vQ29udGVudDogZnVuY3Rpb24oKSB7XG4gICAgYWxlcnRNZXNzYWdlKCdZb3UgZGlkblxcJ3QgdXBsb2FkIGFueSBpbWFnZSBvciB0ZXh0IDooJylcbiAgICBzZnguZXJyb3IoKVxuICB9XG59XG5cblxuXG5cblxuLy8gLS0tIFNBVkVEXG5cbmZ1bmN0aW9uIHNob3dQdWJsaWNhdGlvbkRhdGEoUHVibGljYXRpb24pIHtcbiAgJCgnLnRpdGxlJykudGV4dCggUHVibGljYXRpb24udGl0bGUgKVxuICAkKCcuYXV0aG9ycyBzcGFuOmxhc3QtY2hpbGQnKS50ZXh0KCBQdWJsaWNhdGlvbi5hdXRob3JzIClcbiAgJCgnLmRhdGUgc3BhbjpsYXN0LWNoaWxkJykudGV4dCggdGltZUNvbnZlcnRlciggTnVtYmVyKFB1YmxpY2F0aW9uLmRhdGUpKSApXG4gICQoJy5pbWFnZXNhbW91bnQgc3BhbjpsYXN0LWNoaWxkJykudGV4dCggUHVibGljYXRpb24uaW1hZ2VzQW1vdW50IClcbiAgJCgnLnRleHRhbW91bnQgc3BhbjpsYXN0LWNoaWxkJykudGV4dCggUHVibGljYXRpb24udGV4dEFtb3VudCArICcgY2hhcnMnIClcbiAgJCgnLmVsYXBzZWR0aW1lIHNwYW46bGFzdC1jaGlsZCcpLnRleHQoIFB1YmxpY2F0aW9uLnRpbWVFbGFwc2VkICsgJyBzJyApXG4gICQoJy5hY2hpZXZlbWVudHNhbW91bnQgc3BhbjpsYXN0LWNoaWxkJykudGV4dCggUHVibGljYXRpb24uYWNoaWV2ZW1lbnRzQW1vdW50IClcbn1cblxuZnVuY3Rpb24gcmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pIHtcbiAgZnVuY3Rpb24gcmVuZGVyUGFnZShpbWcsIGNhbnZhc0lkKSB7XG4gICAgZmFicmljLkltYWdlLmZyb21VUkwoaW1nLCBmdW5jdGlvbihpbWcpe1xuICAgICAgICBpbWcuaGFzQm9yZGVycyA9IGZhbHNlO1xuICAgICAgICBpbWcuaGFzQ29udHJvbHMgPSBmYWxzZTtcbiAgICAgICAgaW1nLnNlbGVjdGFibGUgPSBmYWxzZTtcbiAgICAgICAgaW1nLmxlZnQgPSBjYW52YXNlc1tjYW52YXNJZF0ud2lkdGggLyAyO1xuICAgICAgICBpbWcudG9wID0gY2FudmFzZXNbY2FudmFzSWRdLmhlaWdodCAvIDI7XG4gICAgICAgIGltZy5zY2FsZVggPSBjYW52YXNlc1tjYW52YXNJZF0ud2lkdGggLyBpbWcud2lkdGg7XG4gICAgICAgIGltZy5zY2FsZVkgPSBjYW52YXNlc1tjYW52YXNJZF0uaGVpZ2h0IC8gaW1nLmhlaWdodDtcbiAgICAgICAgaW1nLmxvY2tNb3ZlbWVudFggPSB0cnVlO1xuICAgICAgICBpbWcubG9ja01vdmVtZW50WSA9IHRydWU7XG4gICAgICAgIGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuICAgICAgICBpbWcuc2V0Q29udHJvbHNWaXNpYmlsaXR5ID0gZmFsc2U7XG4gICAgICAgIGltZy5pZCA9ICdsb2NrJ1xuICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0uYWRkKGltZyk7XG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwuYmluZChjYW52YXNlc1tjYW52YXNJZF0pXG4gICAgfSlcbiAgfVxuICBmb3IgKHZhciBjYW52YXNJZCBpbiBjYW52YXNlcykge1xuICAgIHJlbmRlclBhZ2UoUHVibGljYXRpb24ucGFnZXNbY2FudmFzSWRdLCBjYW52YXNJZClcbiAgfVxuICBzaG93UHVibGljYXRpb25EYXRhKFB1YmxpY2F0aW9uKVxufVxuXG5cblxuXG5cbi8vIC0tLSBCQUNLRU5EXG5cbi8vIHNhdmUgdG8gZGJcbnZhciBzYXZpbmcgPSBmYWxzZVxuZnVuY3Rpb24gc2F2ZXRvRGIocHVibGljYXRpb24pIHtcbiAgaWYgKHNhdmluZyA9PSBmYWxzZSkge1xuICBcdGZvciAodmFyIHBhZ2UgaW4gUHVibGljYXRpb24ucGFnZXMpIHtcbiAgICAgIHZhciBvcmlnaW5XaWR0aCA9IGNhbnZhc2VzW3BhZ2VdLmdldFdpZHRoKCk7XG5cbiAgICAgIGZ1bmN0aW9uIHpvb20gKHdpZHRoKSB7XG4gICAgICAgIHZhciBzY2FsZSA9IHdpZHRoIC8gY2FudmFzZXNbcGFnZV0uZ2V0V2lkdGgoKTtcbiAgICAgICAgaGVpZ2h0ID0gc2NhbGUgKiBjYW52YXNlc1twYWdlXS5nZXRIZWlnaHQoKTtcblxuICAgICAgICBjYW52YXNlc1twYWdlXS5zZXREaW1lbnNpb25zKHtcbiAgICAgICAgICAgIFwid2lkdGhcIjogd2lkdGgsXG4gICAgICAgICAgICBcImhlaWdodFwiOiBoZWlnaHRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2FudmFzZXNbcGFnZV0uY2FsY09mZnNldCgpO1xuICAgICAgICB2YXIgb2JqZWN0cyA9IGNhbnZhc2VzW3BhZ2VdLmdldE9iamVjdHMoKTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBvYmplY3RzKSB7XG4gICAgICAgICAgICB2YXIgc2NhbGVYID0gb2JqZWN0c1tpXS5zY2FsZVg7XG4gICAgICAgICAgICB2YXIgc2NhbGVZID0gb2JqZWN0c1tpXS5zY2FsZVk7XG4gICAgICAgICAgICB2YXIgbGVmdCA9IG9iamVjdHNbaV0ubGVmdDtcbiAgICAgICAgICAgIHZhciB0b3AgPSBvYmplY3RzW2ldLnRvcDtcblxuICAgICAgICAgICAgb2JqZWN0c1tpXS5zY2FsZVggPSBzY2FsZVggKiBzY2FsZTtcbiAgICAgICAgICAgIG9iamVjdHNbaV0uc2NhbGVZID0gc2NhbGVZICogc2NhbGU7XG4gICAgICAgICAgICBvYmplY3RzW2ldLmxlZnQgPSBsZWZ0ICogc2NhbGU7XG4gICAgICAgICAgICBvYmplY3RzW2ldLnRvcCA9IHRvcCAqIHNjYWxlO1xuXG4gICAgICAgICAgICBvYmplY3RzW2ldLnNldENvb3JkcygpO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhc2VzW3BhZ2VdLnJlbmRlckFsbCgpO1xuICAgICAgfVxuICAgICAgem9vbShjYW52YXNab29tKVxuXG4gICAgICBQdWJsaWNhdGlvbi5wYWdlc1twYWdlXSA9IGNhbnZhc2VzW3BhZ2VdLnRvRGF0YVVSTCgnaW1hZ2UvanBlZycsIDEpIC8vIHVwZGF0ZSBhbGwgcGFnZXNcblxuICAgICAgem9vbSAob3JpZ2luV2lkdGgpO1xuICBcdH1cbiAgICAkKCcuYnV0dG9uLnNhdmUgLnN0eWxpemVkJykuaHRtbCgnU2F2aW5nIDxzcGFuPi48L3NwYW4+PHNwYW4+Ljwvc3Bhbj48c3Bhbj4uPC9zcGFuPicpLmFkZENsYXNzKCdzYXZpbmcnKS5yZW1vdmVDbGFzcygnc3R5bGl6ZWQnKVxuICAgICQoJy5idXR0b24uc2F2ZScpLmNzcygnYmFja2dyb3VuZENvbG9yJywgJyNlZWUnKVxuICBcdCQuYWpheCh7XG4gIFx0XHR1cmw6ICcvZGInLFxuICBcdFx0dHlwZTogJ3Bvc3QnLCAvLyBwZXJmb3JtaW5nIGEgUE9TVCByZXF1ZXN0XG4gIFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeShQdWJsaWNhdGlvbiksXG4gIFx0XHRjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICBcdFx0ZGF0YVR5cGU6ICdqc29uJyxcbiAgXHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzZngucmVhZHkoKVxuICAgICAgICAkKCcuYnV0dG9uLnNhdmUnKS5oaWRlKClcbiAgICAgICAgJCgnLmJ1dHRvbi5wZGYsIC5idXR0b24uYm9va2xldCcpLmNzcygnZGlzcGxheScsJ2lubGluZS1ibG9jaycpXG5cbiAgICAgICAgJCgnLnRpdGxlJykuZW1wdHkoKVxuICAgICAgICAkKCcuYWNoaWV2ZW1lbnRzIGgzJykuYWRkQ2xhc3MoJ2Fycm93ZWQnKVxuICAgICAgICBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgICAgICQoYSkudGV4dChQdWJsaWNhdGlvbi50aXRsZSkuYXR0cihcImhyZWZcIiwgJy9zYXZlZD9pZD0nICsgUHVibGljYXRpb24uaWQpXG4gICAgICAgICQoYSkuYXBwZW5kVG8oJCgnLnRpdGxlJykpXG5cbiAgXHRcdFx0Y29uc29sZS5sb2coJ3B1YmxpY2F0aW9uIHNlbnQgdG8gZGF0YWJhc2UuJyk7XG4gIFx0XHR9XG4gIFx0fSk7XG4gIFx0Y29uc29sZS5sb2coJ3NhdmVkP2lkPScgKyBQdWJsaWNhdGlvbi5pZClcbiAgICBzYXZpbmcgPSB0cnVlXG4gIH1cbn1cblxuXG5cblxuLy8gLS0tIERJU1JVUFRJT05TXG5cblxuZnVuY3Rpb24gYWxsRWxlbWVudHModHlwZSkge1xuICB2YXIgb2JqcyA9IFtdXG4gIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIGNhbnZhc09ianMgPSBjYW52YXNlc1tjYW52YXNdLmdldE9iamVjdHModHlwZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY2FudmFzT2JqcyA9IGNhbnZhc2VzW2NhbnZhc10uZ2V0T2JqZWN0cygpXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSBjYW52YXNPYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAoY2FudmFzT2Jqc1tpXS5pZCAhPSAnbG9jaycpIHsgLy8gdXNlIHRoaXMgdG8gbG9ja1xuICAgICAgICBvYmpzLnB1c2goIGNhbnZhc09ianNbaV0gKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gb2Jqc1xufVxuXG5mdW5jdGlvbiBsb2NrRWxlbWVudHMob2Jqcykge1xuICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIG9ianNbaV0uc2VsZWN0YWJsZSA9IGZhbHNlXG4gICAgb2Jqc1tpXS5oYXNDb250cm9scyA9IGZhbHNlXG4gICAgb2Jqc1tpXS5ob3ZlckN1cnNvciA9ICdkZWZhdWx0J1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFsbENhbnZhc2VzKCkge1xuICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgY2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbCgpXG4gIH1cbn1cblxuZnVuY3Rpb24gZmlsdGVySW1ncyhvYmpzLCBmaWx0ZXIpIHtcbiAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBvYmpzW2ldLmZpbHRlcnMucHVzaChmaWx0ZXIpXG4gICAgb2Jqc1tpXS5hcHBseUZpbHRlcnMoKVxuICB9XG4gIHJlbmRlckFsbENhbnZhc2VzKClcbn1cblxudmFyIERpc3J1cHRpb24gPSB7XG5cdGNvbWljOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfY29taWMob2Jqcykge1xuICAgICAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgb2Jqc1tpXS5mb250RmFtaWx5ID0gJ1wiQ29taWMgU2FucyBNU1wiJ1xuICAgICAgfVxuICAgIH1cbiAgICBfY29taWMoIGFsbEVsZW1lbnRzKCd0ZXh0JykgKVxuICAgIF9jb21pYyggYWxsRWxlbWVudHMoJ3RleHRib3gnKSApXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0NhblxcJ3QgeW91IHNwaWNlIHRoZSB0eXBvZ3JhcGh5IGEgYml0PycpXG5cdH0sXG5cdHJvdGF0ZUltZ3NSYW5kOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfcm90YXRlSW1nc1JhbmQob2Jqcykge1xuICAgICAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgb2Jqc1tpXS5vcmlnaW5YID0gJ2NlbnRlcidcbiAgICAgICAgb2Jqc1tpXS5vcmlnaW5ZID0gJ2NlbnRlcidcbiAgICAgICAgb2Jqc1tpXS5hbmltYXRlKHsgYW5nbGU6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgfSwge1xuICAgICAgICAgIGR1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgIG9uQ2hhbmdlOiBvYmpzW2ldLmNhbnZhcy5yZW5kZXJBbGwuYmluZChvYmpzW2ldLmNhbnZhcyksXG4gICAgICAgICAgZWFzaW5nOiBmdW5jdGlvbih0LCBiLCBjLCBkKSB7IHJldHVybiBjKnQvZCArIGIgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBfcm90YXRlSW1nc1JhbmQoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgY3JpdGljU2F5cygnSSBmaW5kIHRoaXMgbGF5b3V0IGEgYml0IHN0YXRpYy4uLicpXG5cdH0sXG5cdGxvY2tSYW5kUGFnZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhjYW52YXNlcylcbiAgICByYW5kQ2FudmFzID0gY2FudmFzZXNba2V5c1sga2V5cy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXVxuXHRcdHJhbmRDYW52YXMuc2VsZWN0aW9uID0gZmFsc2U7XG5cdFx0Zm9yIChvYmplY3RJZCBpbiByYW5kQ2FudmFzLmdldE9iamVjdHMoKSApIHtcblx0XHRcdHZhciBvYmplY3QgPSByYW5kQ2FudmFzLml0ZW0ob2JqZWN0SWQpXG5cdFx0XHRvYmplY3Quc2VsZWN0YWJsZSA9IGZhbHNlXG5cdFx0XHRvYmplY3QuaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCdcblx0XHR9XG5cdFx0cmFuZENhbnZhcy5hZGQobmV3IGZhYnJpYy5MaW5lKFswLCAwLCByYW5kQ2FudmFzLndpZHRoLCByYW5kQ2FudmFzLmhlaWdodF0sIHtcblx0ICBcdHN0cm9rZTogJ3JlZCcsXG5cdCAgXHRzZWxlY3RhYmxlOiBmYWxzZSxcblx0ICBcdHN0cm9rZVdpZHRoOiAyLFxuICAgICAgaG92ZXJDdXJzb3I6J2RlZmF1bHQnLFxuICAgICAgaWQ6ICdsb2NrJ1xuXHRcdH0pKVxuXHRcdHJhbmRDYW52YXMucmVuZGVyQWxsKCk7XG4gICAgY3JpdGljU2F5cygnUGFnZSAnICsgcmFuZENhbnZhcy5pZFsxXSArICcgaXMgbm93IGxvY2tlZC4uLicpXG5cdH0sXG4gIHNodWZmbGVQYWdlczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRvU2h1ZmZsZSA9IFtdXG4gICAgdmFyIGkgPSAwXG4gICAgZm9yIChjYW52YXNJZCBpbiBjYW52YXNlcykge1xuICAgICAgaWYgKGkgPiAwICYmIGkgPD0gNikgeyAvLyBwcmV2ZW50IHNodWZmbGluZyBmaXJzdCBwYWdlXG4gICAgICAgIHRvU2h1ZmZsZS5wdXNoKCBjYW52YXNlc1tjYW52YXNJZF0udG9KU09OKCkgKVxuICAgICAgfVxuICAgICAgaSArPSAxXG4gICAgfVxuICAgIHNodWZmbGVBcnJheSh0b1NodWZmbGUpXG4gICAgdmFyIHkgPSAwXG4gICAgZm9yIChjYW52YXNJZCBpbiBjYW52YXNlcykge1xuICAgICAgaWYgKHkgPiAwICYmIHkgPD0gNikge1xuICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ubG9hZEZyb21KU09OKHRvU2h1ZmZsZVt5IC0gMV0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwuYmluZChjYW52YXNlc1tjYW52YXNJZF0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB5ICs9IDFcbiAgICB9XG4gICAgY3JpdGljU2F5cygnVGhlIHJ5dGhtIG9mIHRoaXMgcHVibGljYXRpb24gaXMgYSBiaXQgd2Vhay4gRG9uXFwndCB5b3UgdGhpbms/JylcbiAgfSxcblx0YWRzOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhjYW52YXNlcylcbiAgICByYW5kQ2FudmFzID0gY2FudmFzZXNba2V5c1sga2V5cy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXVxuXHRcdHJhbmRDYW52YXMuYWRkKG5ldyBmYWJyaWMuUmVjdCh7XG5cdFx0XHR3aWR0aDogcmFuZENhbnZhcy53aWR0aCxcblx0XHRcdGhlaWdodDogMzAsXG5cdFx0XHRmaWxsOiAnIzBEMjEzRScsXG5cdFx0XHRsb2NrTW92ZW1lbnRYOiB0cnVlLFxuXHRcdFx0bG9ja01vdmVtZW50WTogdHJ1ZSxcblx0XHRcdGxvY2tSb3RhdGlvbjogdHJ1ZSxcblx0XHRcdGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHRcdFx0bGVmdDogcmFuZENhbnZhcy53aWR0aC8yLFxuXHRcdFx0dG9wOiAxNSxcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgaWQ6ICdsb2NrJ1xuXHRcdH0pKTtcblx0XHRmYWJyaWMuSW1hZ2UuZnJvbVVSTChraW5rb0Jhc2U2NCwgZnVuY3Rpb24oaW1nKXtcblx0XHRcdFx0aW1nLmhhc0JvcmRlcnMgPSBmYWxzZTtcblx0XHRcdFx0aW1nLmhhc0NvbnRyb2xzID0gZmFsc2U7XG4gICAgICAgIGltZy5zZWxlY3RhYmxlID0gZmFsc2U7XG5cdFx0XHRcdGltZy5zY2FsZSgwLjIpO1xuXHRcdFx0XHRpbWcubGVmdCA9IHJhbmRDYW52YXMud2lkdGgtMTAwO1xuXHRcdFx0XHRpbWcudG9wID0gNTA7XG5cdFx0XHRcdGltZy5sb2NrTW92ZW1lbnRYID0gdHJ1ZTtcblx0XHRcdFx0aW1nLmxvY2tNb3ZlbWVudFkgPSB0cnVlO1xuXHRcdFx0XHRpbWcubG9ja1JvdGF0aW9uID0gdHJ1ZTtcblx0XHRcdFx0aW1nLnNldENvbnRyb2xzVmlzaWJpbGl0eSA9IGZhbHNlO1xuICAgICAgICBpbWcuaWQgPSAnbG9jaydcblx0XHRcdFx0cmFuZENhbnZhcy5hZGQoaW1nKTtcblx0XHR9KVxuICAgIGNyaXRpY1NheXMoJ0kgZm91bmQgYSBzcG9uc29yIScpXG5cdH0sXG4gIGhhbGZUaW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDJcbiAgICBjcml0aWNTYXlzKCdUaGlzIGlzIHRha2luZyB0b28gbG9uZy4uLicpXG4gIH0sXG4gIGRvdWJsZVRpbWU6IGZ1bmN0aW9uICgpIHtcbiAgICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICogMlxuICAgIGNyaXRpY1NheXMoJ1Rha2UgeW91ciB0aW1lLi4uJylcbiAgfSxcbiAgZ3JleXNjYWxlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLkdyYXlzY2FsZSgpIClcbiAgICBjcml0aWNTYXlzKCdTaGFsbCB3ZSBtYWtlIGl0IGxvb2sgY2xhc3NpYz8nKVxuICB9LFxuICBpbnZlcnRJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuSW52ZXJ0KCkgKVxuICAgIGNyaXRpY1NheXMoJ1RoZSB2aXN1YWxzIG5lZWQgc29tZSBlZGd5IGNvbG9ycycpXG4gIH0sXG4gIHNlcGlhSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLlNlcGlhKCkgKVxuICAgIGNyaXRpY1NheXMoJ0V2ZXIgaGVhcmQgb2YgSW5zdGFncmFtPycpXG4gIH0sXG4gIGJsYWNrd2hpdGVJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuQmxhY2tXaGl0ZSgpIClcbiAgICBjcml0aWNTYXlzKCdUaGlzIHNob3VsZCBsb29rIGxpa2UgYSB6aW5lIScpXG4gIH0sXG4gIHBpeGVsYXRlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLlBpeGVsYXRlKHtibG9ja3NpemU6IDIwfSkgKVxuICAgIGNyaXRpY1NheXMoJ0lzblxcJ3QgdGhpcyBhIHZpZGVvZ2FtZSBhZnRlciBhbGw/JylcbiAgfSxcbiAgbm9pc2VJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuTm9pc2Uoe25vaXNlOiAyMDB9KSApXG4gICAgY3JpdGljU2F5cygnTUFLRSBTT01FIE5PT0lTRSEhJylcbiAgfSxcbiAgZm9udFNpemVCaWdnZXI6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9mb250U2l6ZUJpZ2dlcihlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoJ2ZvbnRTaXplJywgZWxlbWVudHNbaV0uZm9udFNpemUgKiBzY2FsZUZvbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBfZm9udFNpemVCaWdnZXIoYWxsRWxlbWVudHMoJ3RleHRib3gnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnQ2FuXFwndCByZWFkIGFueXRoaW5nIDooJylcbiAgfSxcbiAgZm9udFNpemVTbWFsbGVyOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfZm9udFNpemVTbWFsbGVyKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCgnZm9udFNpemUnLCBlbGVtZW50c1tpXS5mb250U2l6ZSAvIHNjYWxlRm9udCk7XG4gICAgICB9XG4gICAgfVxuICAgIF9mb250U2l6ZVNtYWxsZXIoYWxsRWxlbWVudHMoJ3RleHRib3gnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnSVxcJ20gbm90IGJsaW5kIScpXG4gIH0sXG4gIGJpZ2dlckltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9iaWdnZXJJbWdzKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7XG4gICAgICAgICAgc2NhbGVZOiBzY2FsZVVwSW1ncyxcbiAgICAgICAgICBzY2FsZVg6IHNjYWxlVXBJbWdzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBfYmlnZ2VySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnQkxPVyBVUCEnKVxuICB9LFxuICBzbWFsbGVySW1nczogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX3NtYWxsZXJJbWdzKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7XG4gICAgICAgICAgc2NhbGVZOiBzY2FsZURvd25JbWdzLFxuICAgICAgICAgIHNjYWxlWDogc2NhbGVEb3duSW1nc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX3NtYWxsZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdCTE9XIFVQIScpXG4gIH0sXG4gIGxvY2tBbGxFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgbG9ja0VsZW1lbnRzKGFsbEVsZW1lbnRzKCkpXG4gICAgY3JpdGljU2F5cygnVGhpbmdzIGFyZSBwZXJmZWN0IGFzIHRoZXkgYXJlLicpXG4gIH0sXG4gIHNrZXdBbGxFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX3NrZXdBbGxFbGVtZW50cyhlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoe1xuICAgICAgICAgIHNjYWxlWTogc2NhbGVVcEltZ3MsXG4gICAgICAgICAgc2NhbGVYOiBzY2FsZVVwSW1ncyxcbiAgICAgICAgICB0cmFuc2Zvcm1NYXRyaXg6IFsxLCAuNTAsIDAsIDEsIDAsIDBdXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIF9za2V3QWxsRWxlbWVudHMoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ1N0cmV0Y2ggdGhvc2UgaW1hZ2VzLCBjb21lIG9uIScpXG4gIH0sXG4gIGZsaXBBbGxJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfZmxpcEFsbEltZ3MoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBhbmdsZTogJy0xODAnLFxuICAgICAgICAgIGZsaXBZOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIF9mbGlwQWxsSW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSlcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnRmxpcCB0aG9zZSBpbWFnZXMsIGNvbWUgb24hJylcbiAgfSxcbiAgYml0TGVmdGJpdFJpZ2h0QWxsSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2JpdExlZnRiaXRSaWdodEFsbEltZ3MoZWxlbWVudHMsIGRpc3RhbmNlKSB7XG4gICAgICB2YXIgZHVyYXRpb24gPSAyMDBcbiAgICAgIHZhciBwYXVzZSA9IDEwMFxuXG4gICAgICBmdW5jdGlvbiBsZWZ0MShpLCBlbGVtZW50cykge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgZWxlbWVudHNbaV0uYW5pbWF0ZSgnbGVmdCcsIGVsZW1lbnRzW2ldLmxlZnQgKyBkaXN0YW5jZSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKSwgeyAvLyBhIGJpdCBvZiByYW5kb21uZXNzIHRvIG1ha2UgaXQgbW9yZSBodW1hblxuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBlbGVtZW50c1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQoZWxlbWVudHNbaV0uY2FudmFzKSxcbiAgICAgICAgICB9KVxuICAgICAgICB9LCAwKVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gbGVmdDIoaSwgZWxlbWVudHMpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmFuaW1hdGUoJ2xlZnQnLCBlbGVtZW50c1tpXS5sZWZ0ICsgZGlzdGFuY2UgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCksIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCksXG4gICAgICAgICAgICBvbkNoYW5nZTogZWxlbWVudHNbaV0uY2FudmFzLnJlbmRlckFsbC5iaW5kKGVsZW1lbnRzW2ldLmNhbnZhcyksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgZHVyYXRpb24gKyBwYXVzZSlcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHJpZ2h0MShpLCBlbGVtZW50cykge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgZWxlbWVudHNbaV0uYW5pbWF0ZSgnbGVmdCcsIGVsZW1lbnRzW2ldLmxlZnQgLSBkaXN0YW5jZSAtIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKSwge1xuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBlbGVtZW50c1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQoZWxlbWVudHNbaV0uY2FudmFzKSxcbiAgICAgICAgICB9KVxuICAgICAgICB9LCAoZHVyYXRpb24gKyBwYXVzZSkgKiAyIClcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHJpZ2h0MihpLCBlbGVtZW50cykge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgZWxlbWVudHNbaV0uYW5pbWF0ZSgnbGVmdCcsIGVsZW1lbnRzW2ldLmxlZnQgLSBkaXN0YW5jZSAtIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKSwge1xuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBlbGVtZW50c1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQoZWxlbWVudHNbaV0uY2FudmFzKSxcbiAgICAgICAgICB9KVxuICAgICAgICB9LCAoZHVyYXRpb24gKyBwYXVzZSkgKiAzIClcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGVmdDEoaSwgZWxlbWVudHMpXG4gICAgICAgIGxlZnQyKGksIGVsZW1lbnRzKVxuICAgICAgICByaWdodDEoaSwgZWxlbWVudHMpXG4gICAgICAgIHJpZ2h0MihpLCBlbGVtZW50cylcbiAgICAgIH1cbiAgICB9XG4gICAgX2JpdExlZnRiaXRSaWdodEFsbEltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIDcwKVxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBjcml0aWNTYXlzKCdBIGJpdCB0byB0aGUgcmlnaHQuLi4gTm8gbm8sIGEgYml0IHRvIHRoZSBsZWZ0Li4uJylcbiAgfSxcbiAgcmlnaWRNb2RlOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfcmlnaWRNb2RlKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRzW2ldLnNldCh7XG4gICAgICAgICAgbG9ja01vdmVtZW50WTogdHJ1ZSxcbiAgICAgICAgICBsb2NrUm90YXRpb246IHRydWVcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgX3JpZ2lkTW9kZShhbGxFbGVtZW50cygnaW1hZ2UnKSwgNzApXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ1Jlc3BlY3QgdGhlIGdyaWQhJylcbiAgfSxcbiAgYmV0dGVyVGl0bGU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aXRsZXMgPSBbXG4gICAgICAnRG9uIFF1aXhvdGUnLFxuICAgICAgJ0luIFNlYXJjaCBvZiBMb3N0IFRpbWUnLFxuICAgICAgJ1VseXNzZXMnLFxuICAgICAgJ1RoZSBPZHlzc2V5JyxcbiAgICAgICdXYXIgYW5kIFBlYWNlJyxcbiAgICAgICdNb2J5IERpY2snLFxuICAgICAgJ1RoZSBEaXZpbmUgQ29tZWR5JyxcbiAgICAgICdIYW1sZXQnLFxuICAgICAgJ1RoZSBHcmVhdCBHYXRzYnknLFxuICAgICAgJ1RoZSBJbGlhZCdcbiAgICBdXG4gICAgdmFyIHJhbmRUaXRsZSA9IHRpdGxlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aXRsZXMubGVuZ3RoKV1cbiAgICB0aXRsZS50ZXh0ID0gcmFuZFRpdGxlXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIFB1YmxpY2F0aW9uLnRpdGxlID0gcmFuZFRpdGxlXG4gICAgY3JpdGljU2F5cygnSSBzdWdnZXN0IGEgY2F0Y2hpZXIgdGl0bGUnKVxuICB9LFxuICBiZXR0ZXJBdXRob3JzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhlX2F1dGhvcnMgPSBbXG4gICAgICAnTGVvIFRvbHN0b3knLFxuICAgICAgJ0Z5b2RvciBEb3N0b2V2c2t5JyxcbiAgICAgICdXaWxsaWFtIFNoYWtlc3BlYXJlJyxcbiAgICAgICdDaGFybGVzIERpY2tlbnMnLFxuICAgICAgJ0hvbWVyJyxcbiAgICAgICdKLiBSLiBSLiBUb2xraWVuJyxcbiAgICAgICdHZW9yZ2UgT3J3ZWxsJyxcbiAgICAgICdFZGdhciBBbGxhbiBQb2UnLFxuICAgICAgJ01hcmsgVHdhaW4nLFxuICAgICAgJ1ZpY3RvciBIdWdvJ1xuICAgIF1cbiAgICB2YXIgcmFuZEF1dGhvciA9IHRoZV9hdXRob3JzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoZV9hdXRob3JzLmxlbmd0aCldXG4gICAgYXV0aG9ycy50ZXh0ID0gcmFuZEF1dGhvclxuICAgIHJlbmRlckFsbENhbnZhc2VzKClcbiAgICBQdWJsaWNhdGlvbi5hdXRob3JzID0gcmFuZEF1dGhvclxuICAgIGNyaXRpY1NheXMoJ1dlIG5lZWQgYSB3ZWxsLWtub3duIHRlc3RpbW9uaWFsLicpXG4gIH0sXG4gIGRyYXdpbmdNb2RlOiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKGNhbnZhcyBpbiBjYW52YXNlcykge1xuICAgICAgY2FudmFzZXNbY2FudmFzXS5pc0RyYXdpbmdNb2RlID0gdHJ1ZVxuICAgICAgY2FudmFzZXNbY2FudmFzXS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2ZmZmZhYSdcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10ucmVuZGVyQWxsKClcbiAgICB9XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc10uaXNEcmF3aW5nTW9kZSA9IGZhbHNlXG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc10uYmFja2dyb3VuZENvbG9yID0gJyNmZmZmZmYnXG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc10ucmVuZGVyQWxsKClcbiAgICAgIH1cbiAgICB9LCBkcmF3aW5nTW9kZVRpbWUpXG4gICAgY3JpdGljU2F5cygnRG8geW91IGxpa2UgdG8gZHJhdz8nKVxuICB9LFxuICBibGFja2JvYXJkTW9kZTogZnVuY3Rpb24oKSB7XG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGNhbnZhc2VzW2NhbnZhc10uYmFja2dyb3VuZENvbG9yID0gJyMwMDAwMDAnXG4gICAgICBjYW52YXNlc1tjYW52YXNdLnJlbmRlckFsbCgpXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsRWxlbWVudHMoJ3RleHQnKS5sZW5ndGg7IGkrKykge1xuICAgICAgYWxsRWxlbWVudHMoJ3RleHQnKVtpXS5zZXQoe2ZpbGw6ICcjZmZmJ30pO1xuICAgIH1cbiAgICBmdW5jdGlvbiB3aGl0ZVRleHQoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtmaWxsOiAnI2ZmZid9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgd2hpdGVUZXh0KGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykpXG4gICAgd2hpdGVUZXh0KFt0aXRsZSxhdXRob3JzLHB1YkRhdGVdKVxuICAgIGZvbnRDb2xvciA9ICcjZmZmJ1xuICAgIHZhciBsaW5lTGVuZ2h0ID0gMjUwXG4gICAgY292ZXJMaW5lID0gbmV3IGZhYnJpYy5MaW5lKFswLCAwLCBsaW5lTGVuZ2h0LCAwXSwge1xuICAgICAgbGVmdDogKCBjYW52YXNlc1sncDEnXS53aWR0aCAtIGxpbmVMZW5naHQpIC8gMixcbiAgICAgIHRvcDogMTYwLFxuICAgICAgc3Ryb2tlOiAnI2ZmZicsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgICAgIG9yaWdpblg6ICdsZWZ0JyxcbiAgICAgIG9yaWdpblk6ICd0b3AnXG4gICAgfSlcbiAgICBjYW52YXNlc1sncDEnXS5hZGQoY292ZXJMaW5lKSAvLyBub3Qgc3VyZSB3aHkgSSBjYW4ndCBzaW1wbHkgY2hhbmdlIHRoZSBzdHJva2VcbiAgICByZW5kZXJBbGxDYW52YXNlcygpXG4gICAgY3JpdGljU2F5cygnVGhpbmsgb2YgdGhlIHBhZ2UgYXMgYSBibGFja2JvYXJkJylcbiAgfSxcbiAgY2xhc3NpZmllZE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgIGZhYnJpYy5JbWFnZS5mcm9tVVJMKGNsYXNzaWZpZWRCYXNlNjQsIGZ1bmN0aW9uKGltZyl7XG4gICAgICBpbWcuaGFzQm9yZGVycyA9IGZhbHNlO1xuICAgICAgaW1nLmhhc0NvbnRyb2xzID0gZmFsc2U7XG4gICAgICBpbWcuc2VsZWN0YWJsZSA9IGZhbHNlO1xuICAgICAgaW1nLnNjYWxlKDAuOCk7XG4gICAgICBpbWcubGVmdCA9IGNhbnZhc2VzWydwMSddLndpZHRoIC8gMjtcbiAgICAgIGltZy50b3AgPSAzMDA7XG4gICAgICBpbWcubG9ja01vdmVtZW50WCA9IHRydWU7XG4gICAgICBpbWcubG9ja01vdmVtZW50WSA9IHRydWU7XG4gICAgICBpbWcubG9ja1JvdGF0aW9uID0gdHJ1ZTtcbiAgICAgIGltZy5zZXRDb250cm9sc1Zpc2liaWxpdHkgPSBmYWxzZTtcbiAgICAgIGltZy5pZCA9ICdsb2NrJztcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FudmFzZXMpXG4gICAgICByYW5kQ2FudmFzID0gY2FudmFzZXNba2V5c1sga2V5cy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpIDw8IDBdXVxuICAgICAgcmFuZENhbnZhcy5hZGQoaW1nKVxuICAgIH0pXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ1RoZSBwdWJsaWMgbXVzdCBub3Qga25vdy4nKVxuICB9XG59XG4iXSwiZmlsZSI6Im1haW4uanMifQ==
