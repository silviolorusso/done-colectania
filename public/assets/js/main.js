function animatetimecounter(bonusTime) {
	console.log(bonusTime);
	$('#animatetimecounter').prepend(
		"<span id='bonusTime'>" + bonusTime + '</span>'
	);
	// $('#animatetimecounter').show().fadeOut(1000);

	// add
	$('#animatetimecounter').addClass('fadeinout');
	$('#counter').addClass('wiggle');
	console.log('add');
	setTimeout(function() {
		// remove
		console.log('remove');
		$('#animatetimecounter').removeClass('fadeinout');
		$('#counter').removeClass('wiggle');
	}, 1000);
}

function countdownWrapper() {
	function loadSound() {
		console.log('load sound!');
		createjs.Sound.registerSound('assets/audio/beep.mp3', 'beep');
		createjs.Sound.registerSound('assets/audio/ding.mp3', 'ding');

		// printer soundjs
		createjs.Sound.registerSound(
			'assets/audio/printer/matrix-short.wav',
			'printer-short'
		);
		createjs.Sound.registerSound(
			'assets/audio/printer/matrix-long.wav',
			'printer-long'
		);
		createjs.Sound.registerSound(
			'assets/audio/printer/load_paper.wav',
			'load_paper'
		);
	}

	loadSound();

	// when page is ready do this
	$(document).ready(function() {
		$('#countdown').html('Get ready!');
		// countdown timer
		function countdown(startTime) {
			if (startTime >= 1) {
				createjs.Sound.play('printer-short');
				setTimeout(function() {
					startTime = startTime - 1;
					$('#countdown').html(startTime); // set current time in #countdown
					countdown(startTime); // repeat function
				}, 1000);
			} else {
				$('#countdown').html('start game!'); // set to start game message
				setTimeout(function() {
					// wait a bit
					$('#countdown').fadeOut(1000); // fade out the #countdown
					// TODO: start time!
				}, 200);
				createjs.Sound.play('ding');
			}
		}

		var startTime = 4;
		countdown(startTime);
		$('#countdown').html(startTime);
	});
}

// --- GLOBAL

var pages = $('.page');
var criticPopup = $('#critic');
var dropDelay = 100;
var pdfReady = false;

// --- GENERAL FUNCTIONS

function makeId() {
	var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
	var id = randLetter + Date.now();
	return id;
}

function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

function createElement(element) {
	if (element.data.includes('data:image')) {
		var pageElementContent = $('<img>', { src: element.data });
	} else {
		var deBasedText = atob(element.data.substring(23));
		var htmlBrText = deBasedText.replace(/\n/g, '<br/>');
		console.log(htmlBrText);
		var pageElementContent = $('<p>').append(htmlBrText); // remove "data:text/plain;base64"
	}
	var pageElement = $('<div>', { class: 'page-element draggable' });
	var pageElementClose = $('<span>', { class: 'close' }).text('x');
	pageElement.append(pageElementContent, pageElementClose);
	pageElement.attr('id', element.id);
	$('#' + element.page).append(pageElement);

	if (element.pos) {
		// reconstructing saved element
		setTimeout(function() {
			modElementPosition(pageElement, element.pos);
		}, 700);
	} else {
		// dropping new file
		return getElementPosition(pageElement);
	}
}

function createElementCanvas(element) {
	if (element.data.indexOf('data:image') >= 0) {

		var canvas = document.createElement('canvas');
		canvas.style.marginLeft = element.pos[0] + 'px';
		canvas.style.marginTop = element.pos[1] + 'px';
		canvas.width = element.pos[2] * 3; // to have crisp images
		canvas.height = element.pos[3] * 3; // to have crisp images
		canvas.style.width = element.pos[2] + 'px';
		canvas.style.height = element.pos[3] + 'px';
		canvas.style.zIndex = element.pos[4];

		var ctx = canvas.getContext('2d');
		$('#' + element.page).append(canvas);

		var image = new Image();
		image.onload = function() {
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		};
		image.src = element.data;

	} else {

		var deBasedText = atob(element.data.substring(23));
		var htmlBrText = deBasedText.replace(/\n/g, '<br/>');
		console.log(htmlBrText);
		var pageElementContent = $('<p>').append(htmlBrText); // remove "data:text/plain;base64"

		var pageElement = $('<div>', { class: 'page-element draggable' });
		var pageElementClose = $('<span>', { class: 'close' }).text('x');
		pageElement.append(pageElementContent, pageElementClose);
		pageElement.attr('id', element.id);
		$('#' + element.page).append(pageElement);

		setTimeout(function() {
			modElementPosition(pageElement, element.pos);
		}, 700);
	}
}

function getElementPosition(element) {
	return (elementPos = [
		parseFloat(element.css('marginLeft')),
		parseFloat(element.css('marginTop')),
		element.width(),
		element.height(),
		parseInt(element.css('z-index')) // TODO rotation maybe
	]);
}

function modElementPosition(pageElement, newPos) {
	pageElement.css({ 'margin-left': newPos[0] + 'px' });
	pageElement.css({ 'margin-top': newPos[1] + 'px' });
	pageElement.width(newPos[2]);
	pageElement.height(newPos[3]);
	pageElement.css({ 'z-index': newPos[4] });
}

// --- M-V-C

var Publication = {
	// all our states
	id: makeId(),
	title: 'TEST PUB',
	timeLeft: 9000000,
	expired: false,
	elements: [],
	authors: []
};

function controller(Publication, input) {
	// expired?
	if (Publication.timeLeft > 0) {
		// expired
		showTime(Publication);
	} else {
		// not expired
		Publication.expired = true;
		showExpired(Publication);
		noDrag();
		showSaveModal();
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
					// update the Publication
					Publication.elements.push(input);
					// drop file
					dropElement(input.page, input.data, input.id);
					// add bonus time
					addtime(1000)
					// critic speak
					// critic();
					break
			case input.data &&
				input.data.includes('data:text/plain') &&
				input.visible == true: // new text
					// update the Publication
					Publication.elements.push(input);
					// drop file
					dropElement(input.page, input.data, input.id)
					addtime(1000)
					break
			case input.data &&
				!input.data.includes('data:image') &&
				!input.data.includes('data:text/plain'): // neither an image nor text
					Error.notAllowed()
					break
			case input.move == true : // moving or scaling an image
					var movingElement;
					for (var i = 0; i < Publication.elements.length; i += 1) {
						// find element by id
						if (Publication.elements[i].id == input.id) {
							movingElement = Publication.elements[i]; // read pos and add it to Publication
						}
					}
					movingElement.pos = input.pos;
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
	if (window.location.href.indexOf('saved') < 0) {
		// if not a saved publication
		x = setInterval(function() {
			Publication.timeLeft = Publication.timeLeft - 10;
			controller(Publication);
		}, 10);

		mouseCounter();
	} else {
		renderPublication(Publication);
		noDrag();
		pdfDownload();
		$('body').addClass('saved');
	}
});

function addtime(bonusTime) {
	Publication.timeLeft = Publication.timeLeft + bonusTime;
	animatetimecounter(bonusTime);
}

// dropFile

pages.on('dragover', function(e) {
	e.preventDefault();
	$(this).addClass('dragover');
});
pages.on('dragleave', function(e) {
	e.preventDefault();
	$(this).removeClass('dragover');
});
pages.on('drop', function(e) {
	$(this).removeClass('dragover');
	e.preventDefault();
	console.log(e);
	var files = e.originalEvent.dataTransfer.files;
	var y = 0;
	for (var i = files.length - 1; i >= 0; i--) {
		reader = new FileReader();
		var pageId = $(this).attr('id');
		reader.onload = function(event) {
			console.log(event.target);
			// id, data, [pos x, pos y, width, height, z-index, (rotation?)], visible, page
			setTimeout(function() {
				controller(Publication, {
					id: makeId(),
					data: event.target.result,
					pos: [0, 0, 0, 0, 0],
					visible: true,
					page: pageId
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

// remove element
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

// changing title
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

// merge these two
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
	//setTimeout(function(){
	//  window.print();
	//}, 1000);
	clearInterval(x);
}


function dropElement(pageId, data, id) {
	var element = { id: id, data: data, page: pageId };
	var elementPos = createElement(element);
	setTimeout(function() {
		// timeout to get the actual height :(
		elementPos[3] = $('#' + id).height();
		for (var i = 0; i < Publication.elements.length; i += 1) {
			// find element by id
			if (Publication.elements[i].id == id) {
				Publication.elements[i].pos = elementPos; // read pos and add it to Publication
			}
		}
		Sound.ding();
	}, 1);
}

// errors

var Error = {
	notAllowed: function() {
		Sound.error()
		alert('The file you dropped is not allowed!')
	},
	tooBig: function() {
		Sound.error();
		alert('The file you dropped is too big!'); 
	},
	tooLate: function() {
		Sound.error();
			alert('too late bro'); 
	}
};


function noDrag() {
	var elems = document.querySelectorAll('.draggable');
	[].forEach.call(elems, function(el) {
		el.classList.remove('draggable');
	});
}

function critic() {
	criticPopup.innerHTML = 'Make this image bigger pls!';
}

function removeElement(id) {
	$('#' + id).hide();
	console.log(id);
}

interact('.draggable')
	.draggable({
		onmove: window.dragMoveListener,
		restrict: {
			restriction: 'parent',
			elementRect: {
				top: 0,
				left: 0,
				bottom: 1,
				right: 1
			}
		}
	})
	.resizable({
		// resize from all edges and corners
		edges: {
			left: true,
			right: true,
			bottom: true,
			top: true
		},

		// keep the edges inside the parent
		restrictEdges: {
			outer: 'parent',
			endOnly: true
		},

		inertia: true
	})
	.on('resizemove', function(event) {
		var target = event.target,
			x = parseFloat(target.getAttribute('data-x')) || 0,
			y = parseFloat(target.getAttribute('data-y')) || 0;

		// update the element's style
		target.style.width = event.rect.width + 'px';
		target.style.height = event.rect.height + 'px';

		// translate when resizing from top or left edges
		x += event.deltaRect.left;
		y += event.deltaRect.top;

		target.style.marginLeft = x + 'px';
		target.style.marginTop = y + 'px';

		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);

		var pageElementPos = getElementPosition($('#' + target.id));
		controller(Publication, { id: target.id, pos: pageElementPos, move: true }); // sending element id and position
	});

function dragMoveListener(event) {
	var target = event.target,
		// keep the dragged position in the data-x/data-y attributes
		x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
		y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

	// translate the element
	target.style.marginLeft = x + 'px';
	target.style.marginTop = y + 'px';

	// update the posiion attributes
	target.setAttribute('data-x', x);
	target.setAttribute('data-y', y);

	// update z-index
	var maxzIndex = 0,
		i = 0;
	pageElements = $('#' + target.id)
		.parent()
		.children();
	pageElements.each(function() {
		i += 1;
		if ($(this).css('z-index') >= maxzIndex) {
			maxzIndex = parseInt($(this).css('z-index'));
		}
		if (i == pageElements.length) {
			if ((target.style.zIndex != maxzIndex) | (target.style.zIndex == 0)) {
				target.style.zIndex = maxzIndex + 1;
			}
		}
	});
	// target.style.zIndex = maxzIndex + 1;

	var pageElementPos = getElementPosition($('#' + target.id));
	controller(Publication, { id: target.id, pos: pageElementPos, move: true }); // sending element id and position
}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;

// show save modal

function showSaveModal() {
	$('#save-modal').show();
	$('#save').click(function() {
		savetoDb(Publication);
		makePdf(Publication.id);
		genPdf(Publication.id);
		checkPdf(Publication.id);
	});
}

function genPdf(id) {
	$('#save-modal').show();
	$('#save-modal').html('');
	var y = setInterval(function() {
		if (pdfReady == true) {
			$('#save-modal').html(
				'Download your pdf <a href="assets/pdf/' +
					id +
					'/' +
					id +
					'.pdf?download=true">here</a>'
			);
			clearInterval(y);
		} else {
			$('#save-modal').text('Your PDF is being generated');
		}
	}, 100);
}

// --- SAVED

function renderPublication(Publication) {
	var i;
	for (i = 0; i < Publication.elements.length; ++i) {
		if (window.location.href.indexOf('print=true') > 0) { // print pub
			createElementCanvas(Publication.elements[i]);
		} else {
			createElement(Publication.elements[i]); // saved pub
		}
	}
}

function pdfDownload() {
	$('#pdf-download').show();
	$('#pdf-download').click(function() {
		makePdf(Publication.id);
		genPdf(Publication.id);
		checkPdf(Publication.id);
	});
}

// --- BACKEND

// send call to server to make pdf
function makePdf(id) {
	$.get('/pdf?id=' + id, function(data) {
		console.log('Sent call to make PDF.');
	});
}

// check if pdf exists and redirect to file
function checkPdf(id) {
	var y = setInterval(function() {
		$.ajax({
			type: 'HEAD',
			url: 'assets/pdf/' + id + '/' + id + '.pdf',
			success: function(msg) {
				clearInterval(y);
				pdfReady = true;
			},
			error: function(jqXHR, textStatus, error) {
				console.log(jqXHR);
				console.log(error);
			}
		});
	}, 100);
}

function savetoDb(publication) {
	$.ajax({
		url: '/db',
		type: 'post', // performing a POST request
		data: publication,
		dataType: 'json',
		success: function(publication) {
			console.log('publication sent to database.');
		}
	});
}
// #counter follows the mouse
function updateMouseCounter(e) {
  if (e.clientX >= 200) { // ($(document).width()/2)
    // if mouse of right side of client
    $('.counter').addClass('mouse_right');
    $('.counter').css({
      left:  e.clientX - 20 - $('.counter').width(),
      top:   e.clientY - 50
    });
  } else {
    // if mouse of left side of client
    $('.counter').removeClass('mouse_right');
    $('.counter').css({
      left:  e.clientX + 20,
      top:   e.clientY - 50
    });
  }
}

$(document).bind('mousemove', function(e){
  updateMouseCounter(e);
});

$(document).bind("dragover", function(e){
    updateMouseCounter(e);
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuaW1hdGVfdGltZWNvdW50ZXIuanMiLCJjb3VudGRvd24uanMiLCJtYWluLmpzIiwidGltZV9mb2xsb3dfbW91c2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBhbmltYXRldGltZWNvdW50ZXIoYm9udXNUaW1lKSB7XG5cdGNvbnNvbGUubG9nKGJvbnVzVGltZSk7XG5cdCQoJyNhbmltYXRldGltZWNvdW50ZXInKS5wcmVwZW5kKFxuXHRcdFwiPHNwYW4gaWQ9J2JvbnVzVGltZSc+XCIgKyBib251c1RpbWUgKyAnPC9zcGFuPidcblx0KTtcblx0Ly8gJCgnI2FuaW1hdGV0aW1lY291bnRlcicpLnNob3coKS5mYWRlT3V0KDEwMDApO1xuXG5cdC8vIGFkZFxuXHQkKCcjYW5pbWF0ZXRpbWVjb3VudGVyJykuYWRkQ2xhc3MoJ2ZhZGVpbm91dCcpO1xuXHQkKCcjY291bnRlcicpLmFkZENsYXNzKCd3aWdnbGUnKTtcblx0Y29uc29sZS5sb2coJ2FkZCcpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdC8vIHJlbW92ZVxuXHRcdGNvbnNvbGUubG9nKCdyZW1vdmUnKTtcblx0XHQkKCcjYW5pbWF0ZXRpbWVjb3VudGVyJykucmVtb3ZlQ2xhc3MoJ2ZhZGVpbm91dCcpO1xuXHRcdCQoJyNjb3VudGVyJykucmVtb3ZlQ2xhc3MoJ3dpZ2dsZScpO1xuXHR9LCAxMDAwKTtcbn1cbiIsImZ1bmN0aW9uIGNvdW50ZG93bldyYXBwZXIoKSB7XG5cdGZ1bmN0aW9uIGxvYWRTb3VuZCgpIHtcblx0XHRjb25zb2xlLmxvZygnbG9hZCBzb3VuZCEnKTtcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKCdhc3NldHMvYXVkaW8vYmVlcC5tcDMnLCAnYmVlcCcpO1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoJ2Fzc2V0cy9hdWRpby9kaW5nLm1wMycsICdkaW5nJyk7XG5cblx0XHQvLyBwcmludGVyIHNvdW5kanNcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFxuXHRcdFx0J2Fzc2V0cy9hdWRpby9wcmludGVyL21hdHJpeC1zaG9ydC53YXYnLFxuXHRcdFx0J3ByaW50ZXItc2hvcnQnXG5cdFx0KTtcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFxuXHRcdFx0J2Fzc2V0cy9hdWRpby9wcmludGVyL21hdHJpeC1sb25nLndhdicsXG5cdFx0XHQncHJpbnRlci1sb25nJ1xuXHRcdCk7XG5cdFx0Y3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcblx0XHRcdCdhc3NldHMvYXVkaW8vcHJpbnRlci9sb2FkX3BhcGVyLndhdicsXG5cdFx0XHQnbG9hZF9wYXBlcidcblx0XHQpO1xuXHR9XG5cblx0bG9hZFNvdW5kKCk7XG5cblx0Ly8gd2hlbiBwYWdlIGlzIHJlYWR5IGRvIHRoaXNcblx0JChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cdFx0JCgnI2NvdW50ZG93bicpLmh0bWwoJ0dldCByZWFkeSEnKTtcblx0XHQvLyBjb3VudGRvd24gdGltZXJcblx0XHRmdW5jdGlvbiBjb3VudGRvd24oc3RhcnRUaW1lKSB7XG5cdFx0XHRpZiAoc3RhcnRUaW1lID49IDEpIHtcblx0XHRcdFx0Y3JlYXRlanMuU291bmQucGxheSgncHJpbnRlci1zaG9ydCcpO1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHN0YXJ0VGltZSA9IHN0YXJ0VGltZSAtIDE7XG5cdFx0XHRcdFx0JCgnI2NvdW50ZG93bicpLmh0bWwoc3RhcnRUaW1lKTsgLy8gc2V0IGN1cnJlbnQgdGltZSBpbiAjY291bnRkb3duXG5cdFx0XHRcdFx0Y291bnRkb3duKHN0YXJ0VGltZSk7IC8vIHJlcGVhdCBmdW5jdGlvblxuXHRcdFx0XHR9LCAxMDAwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoJyNjb3VudGRvd24nKS5odG1sKCdzdGFydCBnYW1lIScpOyAvLyBzZXQgdG8gc3RhcnQgZ2FtZSBtZXNzYWdlXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Ly8gd2FpdCBhIGJpdFxuXHRcdFx0XHRcdCQoJyNjb3VudGRvd24nKS5mYWRlT3V0KDEwMDApOyAvLyBmYWRlIG91dCB0aGUgI2NvdW50ZG93blxuXHRcdFx0XHRcdC8vIFRPRE86IHN0YXJ0IHRpbWUhXG5cdFx0XHRcdH0sIDIwMCk7XG5cdFx0XHRcdGNyZWF0ZWpzLlNvdW5kLnBsYXkoJ2RpbmcnKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgc3RhcnRUaW1lID0gNDtcblx0XHRjb3VudGRvd24oc3RhcnRUaW1lKTtcblx0XHQkKCcjY291bnRkb3duJykuaHRtbChzdGFydFRpbWUpO1xuXHR9KTtcbn1cbiIsIi8vIC0tLSBHTE9CQUxcblxudmFyIHBhZ2VzID0gJCgnLnBhZ2UnKTtcbnZhciBjcml0aWNQb3B1cCA9ICQoJyNjcml0aWMnKTtcbnZhciBkcm9wRGVsYXkgPSAxMDA7XG52YXIgcGRmUmVhZHkgPSBmYWxzZTtcblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcblx0dmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcblx0dmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG5cdHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gYnl0ZUNvdW50KHMpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJKHMpLnNwbGl0KC8lLi58Li8pLmxlbmd0aCAtIDE7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCkge1xuXHRpZiAoZWxlbWVudC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykpIHtcblx0XHR2YXIgcGFnZUVsZW1lbnRDb250ZW50ID0gJCgnPGltZz4nLCB7IHNyYzogZWxlbWVudC5kYXRhIH0pO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBkZUJhc2VkVGV4dCA9IGF0b2IoZWxlbWVudC5kYXRhLnN1YnN0cmluZygyMykpO1xuXHRcdHZhciBodG1sQnJUZXh0ID0gZGVCYXNlZFRleHQucmVwbGFjZSgvXFxuL2csICc8YnIvPicpO1xuXHRcdGNvbnNvbGUubG9nKGh0bWxCclRleHQpO1xuXHRcdHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKCc8cD4nKS5hcHBlbmQoaHRtbEJyVGV4dCk7IC8vIHJlbW92ZSBcImRhdGE6dGV4dC9wbGFpbjtiYXNlNjRcIlxuXHR9XG5cdHZhciBwYWdlRWxlbWVudCA9ICQoJzxkaXY+JywgeyBjbGFzczogJ3BhZ2UtZWxlbWVudCBkcmFnZ2FibGUnIH0pO1xuXHR2YXIgcGFnZUVsZW1lbnRDbG9zZSA9ICQoJzxzcGFuPicsIHsgY2xhc3M6ICdjbG9zZScgfSkudGV4dCgneCcpO1xuXHRwYWdlRWxlbWVudC5hcHBlbmQocGFnZUVsZW1lbnRDb250ZW50LCBwYWdlRWxlbWVudENsb3NlKTtcblx0cGFnZUVsZW1lbnQuYXR0cignaWQnLCBlbGVtZW50LmlkKTtcblx0JCgnIycgKyBlbGVtZW50LnBhZ2UpLmFwcGVuZChwYWdlRWxlbWVudCk7XG5cblx0aWYgKGVsZW1lbnQucG9zKSB7XG5cdFx0Ly8gcmVjb25zdHJ1Y3Rpbmcgc2F2ZWQgZWxlbWVudFxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRtb2RFbGVtZW50UG9zaXRpb24ocGFnZUVsZW1lbnQsIGVsZW1lbnQucG9zKTtcblx0XHR9LCA3MDApO1xuXHR9IGVsc2Uge1xuXHRcdC8vIGRyb3BwaW5nIG5ldyBmaWxlXG5cdFx0cmV0dXJuIGdldEVsZW1lbnRQb3NpdGlvbihwYWdlRWxlbWVudCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudENhbnZhcyhlbGVtZW50KSB7XG5cdGlmIChlbGVtZW50LmRhdGEuaW5kZXhPZignZGF0YTppbWFnZScpID49IDApIHtcblxuXHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0XHRjYW52YXMuc3R5bGUubWFyZ2luTGVmdCA9IGVsZW1lbnQucG9zWzBdICsgJ3B4Jztcblx0XHRjYW52YXMuc3R5bGUubWFyZ2luVG9wID0gZWxlbWVudC5wb3NbMV0gKyAncHgnO1xuXHRcdGNhbnZhcy53aWR0aCA9IGVsZW1lbnQucG9zWzJdICogMzsgLy8gdG8gaGF2ZSBjcmlzcCBpbWFnZXNcblx0XHRjYW52YXMuaGVpZ2h0ID0gZWxlbWVudC5wb3NbM10gKiAzOyAvLyB0byBoYXZlIGNyaXNwIGltYWdlc1xuXHRcdGNhbnZhcy5zdHlsZS53aWR0aCA9IGVsZW1lbnQucG9zWzJdICsgJ3B4Jztcblx0XHRjYW52YXMuc3R5bGUuaGVpZ2h0ID0gZWxlbWVudC5wb3NbM10gKyAncHgnO1xuXHRcdGNhbnZhcy5zdHlsZS56SW5kZXggPSBlbGVtZW50LnBvc1s0XTtcblxuXHRcdHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0XHQkKCcjJyArIGVsZW1lbnQucGFnZSkuYXBwZW5kKGNhbnZhcyk7XG5cblx0XHR2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblx0XHRpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0fTtcblx0XHRpbWFnZS5zcmMgPSBlbGVtZW50LmRhdGE7XG5cblx0fSBlbHNlIHtcblxuXHRcdHZhciBkZUJhc2VkVGV4dCA9IGF0b2IoZWxlbWVudC5kYXRhLnN1YnN0cmluZygyMykpO1xuXHRcdHZhciBodG1sQnJUZXh0ID0gZGVCYXNlZFRleHQucmVwbGFjZSgvXFxuL2csICc8YnIvPicpO1xuXHRcdGNvbnNvbGUubG9nKGh0bWxCclRleHQpO1xuXHRcdHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKCc8cD4nKS5hcHBlbmQoaHRtbEJyVGV4dCk7IC8vIHJlbW92ZSBcImRhdGE6dGV4dC9wbGFpbjtiYXNlNjRcIlxuXG5cdFx0dmFyIHBhZ2VFbGVtZW50ID0gJCgnPGRpdj4nLCB7IGNsYXNzOiAncGFnZS1lbGVtZW50IGRyYWdnYWJsZScgfSk7XG5cdFx0dmFyIHBhZ2VFbGVtZW50Q2xvc2UgPSAkKCc8c3Bhbj4nLCB7IGNsYXNzOiAnY2xvc2UnIH0pLnRleHQoJ3gnKTtcblx0XHRwYWdlRWxlbWVudC5hcHBlbmQocGFnZUVsZW1lbnRDb250ZW50LCBwYWdlRWxlbWVudENsb3NlKTtcblx0XHRwYWdlRWxlbWVudC5hdHRyKCdpZCcsIGVsZW1lbnQuaWQpO1xuXHRcdCQoJyMnICsgZWxlbWVudC5wYWdlKS5hcHBlbmQocGFnZUVsZW1lbnQpO1xuXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdG1vZEVsZW1lbnRQb3NpdGlvbihwYWdlRWxlbWVudCwgZWxlbWVudC5wb3MpO1xuXHRcdH0sIDcwMCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RWxlbWVudFBvc2l0aW9uKGVsZW1lbnQpIHtcblx0cmV0dXJuIChlbGVtZW50UG9zID0gW1xuXHRcdHBhcnNlRmxvYXQoZWxlbWVudC5jc3MoJ21hcmdpbkxlZnQnKSksXG5cdFx0cGFyc2VGbG9hdChlbGVtZW50LmNzcygnbWFyZ2luVG9wJykpLFxuXHRcdGVsZW1lbnQud2lkdGgoKSxcblx0XHRlbGVtZW50LmhlaWdodCgpLFxuXHRcdHBhcnNlSW50KGVsZW1lbnQuY3NzKCd6LWluZGV4JykpIC8vIFRPRE8gcm90YXRpb24gbWF5YmVcblx0XSk7XG59XG5cbmZ1bmN0aW9uIG1vZEVsZW1lbnRQb3NpdGlvbihwYWdlRWxlbWVudCwgbmV3UG9zKSB7XG5cdHBhZ2VFbGVtZW50LmNzcyh7ICdtYXJnaW4tbGVmdCc6IG5ld1Bvc1swXSArICdweCcgfSk7XG5cdHBhZ2VFbGVtZW50LmNzcyh7ICdtYXJnaW4tdG9wJzogbmV3UG9zWzFdICsgJ3B4JyB9KTtcblx0cGFnZUVsZW1lbnQud2lkdGgobmV3UG9zWzJdKTtcblx0cGFnZUVsZW1lbnQuaGVpZ2h0KG5ld1Bvc1szXSk7XG5cdHBhZ2VFbGVtZW50LmNzcyh7ICd6LWluZGV4JzogbmV3UG9zWzRdIH0pO1xufVxuXG4vLyAtLS0gTS1WLUNcblxudmFyIFB1YmxpY2F0aW9uID0ge1xuXHQvLyBhbGwgb3VyIHN0YXRlc1xuXHRpZDogbWFrZUlkKCksXG5cdHRpdGxlOiAnVEVTVCBQVUInLFxuXHR0aW1lTGVmdDogOTAwMDAwMCxcblx0ZXhwaXJlZDogZmFsc2UsXG5cdGVsZW1lbnRzOiBbXSxcblx0YXV0aG9yczogW11cbn07XG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIGlucHV0KSB7XG5cdC8vIGV4cGlyZWQ/XG5cdGlmIChQdWJsaWNhdGlvbi50aW1lTGVmdCA+IDApIHtcblx0XHQvLyBleHBpcmVkXG5cdFx0c2hvd1RpbWUoUHVibGljYXRpb24pO1xuXHR9IGVsc2Uge1xuXHRcdC8vIG5vdCBleHBpcmVkXG5cdFx0UHVibGljYXRpb24uZXhwaXJlZCA9IHRydWU7XG5cdFx0c2hvd0V4cGlyZWQoUHVibGljYXRpb24pO1xuXHRcdG5vRHJhZygpO1xuXHRcdHNob3dTYXZlTW9kYWwoKTtcblx0fVxuXG5cdGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG5cdFx0Y29uc29sZS5sb2coaW5wdXQpXG5cdFx0c3dpdGNoICh0cnVlKSB7XG5cdFx0XHRjYXNlIGlucHV0LnZpc2libGUgPT0gZmFsc2U6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcblx0XHRcdFx0XHRyZW1vdmVFbGVtZW50KGlucHV0LmlkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0Ynl0ZUNvdW50KGlucHV0LmRhdGEpID4gMTM5ODExNyA6IC8vIGZpbGUgdG9vIGJpZyAoMW1iKVxuXHRcdFx0XHQgXHRFcnJvci50b29CaWcoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IGltYWdlXG5cdFx0XHRcdFx0Ly8gdXBkYXRlIHRoZSBQdWJsaWNhdGlvblxuXHRcdFx0XHRcdFB1YmxpY2F0aW9uLmVsZW1lbnRzLnB1c2goaW5wdXQpO1xuXHRcdFx0XHRcdC8vIGRyb3AgZmlsZVxuXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0LmlkKTtcblx0XHRcdFx0XHQvLyBhZGQgYm9udXMgdGltZVxuXHRcdFx0XHRcdGFkZHRpbWUoMTAwMClcblx0XHRcdFx0XHQvLyBjcml0aWMgc3BlYWtcblx0XHRcdFx0XHQvLyBjcml0aWMoKTtcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IHRleHRcblx0XHRcdFx0XHQvLyB1cGRhdGUgdGhlIFB1YmxpY2F0aW9uXG5cdFx0XHRcdFx0UHVibGljYXRpb24uZWxlbWVudHMucHVzaChpbnB1dCk7XG5cdFx0XHRcdFx0Ly8gZHJvcCBmaWxlXG5cdFx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQuaWQpXG5cdFx0XHRcdFx0YWRkdGltZSgxMDAwKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJyk6IC8vIG5laXRoZXIgYW4gaW1hZ2Ugbm9yIHRleHRcblx0XHRcdFx0XHRFcnJvci5ub3RBbGxvd2VkKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5tb3ZlID09IHRydWUgOiAvLyBtb3Zpbmcgb3Igc2NhbGluZyBhbiBpbWFnZVxuXHRcdFx0XHRcdHZhciBtb3ZpbmdFbGVtZW50O1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgUHVibGljYXRpb24uZWxlbWVudHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0XHRcdC8vIGZpbmQgZWxlbWVudCBieSBpZFxuXHRcdFx0XHRcdFx0aWYgKFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldLmlkID09IGlucHV0LmlkKSB7XG5cdFx0XHRcdFx0XHRcdG1vdmluZ0VsZW1lbnQgPSBQdWJsaWNhdGlvbi5lbGVtZW50c1tpXTsgLy8gcmVhZCBwb3MgYW5kIGFkZCBpdCB0byBQdWJsaWNhdGlvblxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRtb3ZpbmdFbGVtZW50LnBvcyA9IGlucHV0LnBvcztcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5oYXNPd25Qcm9wZXJ0eSgndGl0bGUnKSA6IC8vIGNoYW5naW5nIHRpdGxlXG5cdFx0XHRcdFx0UHVibGljYXRpb24udGl0bGUgPSBpbnB1dC50aXRsZTtcblx0XHR9XG5cdH0gZWxzZSBpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSB0cnVlKSB7XG5cdFx0Ly8gdG9vIGxhdGVcblx0XHRFcnJvci50b29MYXRlKCk7XG5cdH1cbn1cblxuLy8gLS0tIENPTlRST0xMRVJcblxudmFyIHg7XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPCAwKSB7XG5cdFx0Ly8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cblx0XHR4ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC0gMTA7XG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uKTtcblx0XHR9LCAxMCk7XG5cblx0XHRtb3VzZUNvdW50ZXIoKTtcblx0fSBlbHNlIHtcblx0XHRyZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbik7XG5cdFx0bm9EcmFnKCk7XG5cdFx0cGRmRG93bmxvYWQoKTtcblx0XHQkKCdib2R5JykuYWRkQ2xhc3MoJ3NhdmVkJyk7XG5cdH1cbn0pO1xuXG5mdW5jdGlvbiBhZGR0aW1lKGJvbnVzVGltZSkge1xuXHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICsgYm9udXNUaW1lO1xuXHRhbmltYXRldGltZWNvdW50ZXIoYm9udXNUaW1lKTtcbn1cblxuLy8gZHJvcEZpbGVcblxucGFnZXMub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdCQodGhpcykuYWRkQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0JCh0aGlzKS5yZW1vdmVDbGFzcygnZHJhZ292ZXInKTtcbn0pO1xucGFnZXMub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2RyYWdvdmVyJyk7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0Y29uc29sZS5sb2coZSk7XG5cdHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdHZhciB5ID0gMDtcblx0Zm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0cmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHR2YXIgcGFnZUlkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuXHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0Y29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcblx0XHRcdC8vIGlkLCBkYXRhLCBbcG9zIHgsIHBvcyB5LCB3aWR0aCwgaGVpZ2h0LCB6LWluZGV4LCAocm90YXRpb24/KV0sIHZpc2libGUsIHBhZ2Vcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHtcblx0XHRcdFx0XHRpZDogbWFrZUlkKCksXG5cdFx0XHRcdFx0ZGF0YTogZXZlbnQudGFyZ2V0LnJlc3VsdCxcblx0XHRcdFx0XHRwb3M6IFswLCAwLCAwLCAwLCAwXSxcblx0XHRcdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHBhZ2U6IHBhZ2VJZFxuXHRcdFx0XHR9KTtcblx0XHRcdH0sIHkgKiBkcm9wRGVsYXkpO1xuXHRcdFx0eSArPSAxO1xuXHRcdH07XG5cdFx0Y29uc29sZS5sb2coZmlsZXNbaV0pO1xuXHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGVzW2ldKTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59KTtcbi8vIHByZXZlbnQgZHJvcCBvbiBib2R5XG4kKCdib2R5Jykub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRTb3VuZC5lcnJvcigpO1xufSk7XG5cbi8vIHJlbW92ZSBlbGVtZW50XG4kKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNsb3NlJywgZnVuY3Rpb24oKSB7XG5cdHZhciBwYWdlSWQgPSAkKHRoaXMpXG5cdFx0LmNsb3Nlc3QoJy5wYWdlJylcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnRJZCA9ICQodGhpcylcblx0XHQucGFyZW50KClcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnREYXRhID0gJCh0aGlzKVxuXHRcdC5zaWJsaW5ncygpXG5cdFx0LmF0dHIoJ3NyYycpO1xuXHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0aWQ6IGVsZW1lbnRJZCxcblx0XHRkYXRhOiBlbGVtZW50RGF0YSxcblx0XHRwb3M6IFswLCAwLCAwLCAwLCAwXSxcblx0XHR2aXNpYmxlOiBmYWxzZSxcblx0XHRwYWdlOiBwYWdlSWRcblx0fSk7XG59KTtcblxuLy8gY2hhbmdpbmcgdGl0bGVcbiQoJyN0aXRsZScpLmNoYW5nZShmdW5jdGlvbigpIHtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdHRpdGxlOiAkKHRoaXMpLnZhbCgpXG5cdH0pO1xufSlcblxuLy8gLS0tIFZJRVdcblxudmFyIFNvdW5kID0ge1xuXHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vaW5jb3JyZWN0Lm1wMycpO1xuXHRcdGF1ZGlvLnBsYXkoKTtcblx0fSxcblx0ZGluZzogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vZGluZy5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH1cbn07XG5cbi8vIG1lcmdlIHRoZXNlIHR3b1xuZnVuY3Rpb24gc2hvd1RpbWUoUHVibGljYXRpb24pIHtcblx0c2Vjb25kcyA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMTAwMDtcblx0JCgnI2NvdW50ZXInKS5zaG93KCk7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID1cblx0XHRzZWNvbmRzLnRvRml4ZWQoMikgKyAnIHNlY29uZHMgbGVmdCEnO1xufVxuZnVuY3Rpb24gbW91c2VDb3VudGVyKCkge1xuXHQkKGRvY3VtZW50KS5iaW5kKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUucGFnZVggPj0gJChkb2N1bWVudCkud2lkdGgoKSAvIDIpIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIHJpZ2h0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5hZGRDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCAtIDIwIC0gJCgnI2NvdW50ZXInKS53aWR0aCgpLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIGxlZnQgc2lkZSBvZiBwYWdlXG5cdFx0XHQkKCcjY291bnRlcicpLnJlbW92ZUNsYXNzKCdtb3VzZV9yaWdodCcpO1xuXHRcdFx0JCgnI2NvdW50ZXInKS5jc3Moe1xuXHRcdFx0XHRsZWZ0OiBlLnBhZ2VYICsgMjAsXG5cdFx0XHRcdHRvcDogZS5wYWdlWSArIDUwXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzaG93RXhwaXJlZCgpIHtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKS5pbm5lckhUTUwgPSAnZXhwaXJlZCEnO1xuXHQkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKTtcblx0Ly9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdC8vICB3aW5kb3cucHJpbnQoKTtcblx0Ly99LCAxMDAwKTtcblx0Y2xlYXJJbnRlcnZhbCh4KTtcbn1cblxuXG5mdW5jdGlvbiBkcm9wRWxlbWVudChwYWdlSWQsIGRhdGEsIGlkKSB7XG5cdHZhciBlbGVtZW50ID0geyBpZDogaWQsIGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZCB9O1xuXHR2YXIgZWxlbWVudFBvcyA9IGNyZWF0ZUVsZW1lbnQoZWxlbWVudCk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0Ly8gdGltZW91dCB0byBnZXQgdGhlIGFjdHVhbCBoZWlnaHQgOihcblx0XHRlbGVtZW50UG9zWzNdID0gJCgnIycgKyBpZCkuaGVpZ2h0KCk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBQdWJsaWNhdGlvbi5lbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0Ly8gZmluZCBlbGVtZW50IGJ5IGlkXG5cdFx0XHRpZiAoUHVibGljYXRpb24uZWxlbWVudHNbaV0uaWQgPT0gaWQpIHtcblx0XHRcdFx0UHVibGljYXRpb24uZWxlbWVudHNbaV0ucG9zID0gZWxlbWVudFBvczsgLy8gcmVhZCBwb3MgYW5kIGFkZCBpdCB0byBQdWJsaWNhdGlvblxuXHRcdFx0fVxuXHRcdH1cblx0XHRTb3VuZC5kaW5nKCk7XG5cdH0sIDEpO1xufVxuXG4vLyBlcnJvcnNcblxudmFyIEVycm9yID0ge1xuXHRub3RBbGxvd2VkOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpXG5cdFx0YWxlcnQoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIG5vdCBhbGxvd2VkIScpXG5cdH0sXG5cdHRvb0JpZzogZnVuY3Rpb24oKSB7XG5cdFx0U291bmQuZXJyb3IoKTtcblx0XHRhbGVydCgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgdG9vIGJpZyEnKTsgXG5cdH0sXG5cdHRvb0xhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKCk7XG5cdFx0XHRhbGVydCgndG9vIGxhdGUgYnJvJyk7IFxuXHR9XG59O1xuXG5cbmZ1bmN0aW9uIG5vRHJhZygpIHtcblx0dmFyIGVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRyYWdnYWJsZScpO1xuXHRbXS5mb3JFYWNoLmNhbGwoZWxlbXMsIGZ1bmN0aW9uKGVsKSB7XG5cdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZ2dhYmxlJyk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBjcml0aWMoKSB7XG5cdGNyaXRpY1BvcHVwLmlubmVySFRNTCA9ICdNYWtlIHRoaXMgaW1hZ2UgYmlnZ2VyIHBscyEnO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50KGlkKSB7XG5cdCQoJyMnICsgaWQpLmhpZGUoKTtcblx0Y29uc29sZS5sb2coaWQpO1xufVxuXG5pbnRlcmFjdCgnLmRyYWdnYWJsZScpXG5cdC5kcmFnZ2FibGUoe1xuXHRcdG9ubW92ZTogd2luZG93LmRyYWdNb3ZlTGlzdGVuZXIsXG5cdFx0cmVzdHJpY3Q6IHtcblx0XHRcdHJlc3RyaWN0aW9uOiAncGFyZW50Jyxcblx0XHRcdGVsZW1lbnRSZWN0OiB7XG5cdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0bGVmdDogMCxcblx0XHRcdFx0Ym90dG9tOiAxLFxuXHRcdFx0XHRyaWdodDogMVxuXHRcdFx0fVxuXHRcdH1cblx0fSlcblx0LnJlc2l6YWJsZSh7XG5cdFx0Ly8gcmVzaXplIGZyb20gYWxsIGVkZ2VzIGFuZCBjb3JuZXJzXG5cdFx0ZWRnZXM6IHtcblx0XHRcdGxlZnQ6IHRydWUsXG5cdFx0XHRyaWdodDogdHJ1ZSxcblx0XHRcdGJvdHRvbTogdHJ1ZSxcblx0XHRcdHRvcDogdHJ1ZVxuXHRcdH0sXG5cblx0XHQvLyBrZWVwIHRoZSBlZGdlcyBpbnNpZGUgdGhlIHBhcmVudFxuXHRcdHJlc3RyaWN0RWRnZXM6IHtcblx0XHRcdG91dGVyOiAncGFyZW50Jyxcblx0XHRcdGVuZE9ubHk6IHRydWVcblx0XHR9LFxuXG5cdFx0aW5lcnRpYTogdHJ1ZVxuXHR9KVxuXHQub24oJ3Jlc2l6ZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0XHR4ID0gcGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCxcblx0XHRcdHkgPSBwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwO1xuXG5cdFx0Ly8gdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVcblx0XHR0YXJnZXQuc3R5bGUud2lkdGggPSBldmVudC5yZWN0LndpZHRoICsgJ3B4Jztcblx0XHR0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gZXZlbnQucmVjdC5oZWlnaHQgKyAncHgnO1xuXG5cdFx0Ly8gdHJhbnNsYXRlIHdoZW4gcmVzaXppbmcgZnJvbSB0b3Agb3IgbGVmdCBlZGdlc1xuXHRcdHggKz0gZXZlbnQuZGVsdGFSZWN0LmxlZnQ7XG5cdFx0eSArPSBldmVudC5kZWx0YVJlY3QudG9wO1xuXG5cdFx0dGFyZ2V0LnN0eWxlLm1hcmdpbkxlZnQgPSB4ICsgJ3B4Jztcblx0XHR0YXJnZXQuc3R5bGUubWFyZ2luVG9wID0geSArICdweCc7XG5cblx0XHR0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KTtcblx0XHR0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KTtcblxuXHRcdHZhciBwYWdlRWxlbWVudFBvcyA9IGdldEVsZW1lbnRQb3NpdGlvbigkKCcjJyArIHRhcmdldC5pZCkpO1xuXHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgaWQ6IHRhcmdldC5pZCwgcG9zOiBwYWdlRWxlbWVudFBvcywgbW92ZTogdHJ1ZSB9KTsgLy8gc2VuZGluZyBlbGVtZW50IGlkIGFuZCBwb3NpdGlvblxuXHR9KTtcblxuZnVuY3Rpb24gZHJhZ01vdmVMaXN0ZW5lcihldmVudCkge1xuXHR2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdC8vIGtlZXAgdGhlIGRyYWdnZWQgcG9zaXRpb24gaW4gdGhlIGRhdGEteC9kYXRhLXkgYXR0cmlidXRlc1xuXHRcdHggPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCkgKyBldmVudC5keCxcblx0XHR5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDApICsgZXZlbnQuZHk7XG5cblx0Ly8gdHJhbnNsYXRlIHRoZSBlbGVtZW50XG5cdHRhcmdldC5zdHlsZS5tYXJnaW5MZWZ0ID0geCArICdweCc7XG5cdHRhcmdldC5zdHlsZS5tYXJnaW5Ub3AgPSB5ICsgJ3B4JztcblxuXHQvLyB1cGRhdGUgdGhlIHBvc2lpb24gYXR0cmlidXRlc1xuXHR0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KTtcblx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG5cblx0Ly8gdXBkYXRlIHotaW5kZXhcblx0dmFyIG1heHpJbmRleCA9IDAsXG5cdFx0aSA9IDA7XG5cdHBhZ2VFbGVtZW50cyA9ICQoJyMnICsgdGFyZ2V0LmlkKVxuXHRcdC5wYXJlbnQoKVxuXHRcdC5jaGlsZHJlbigpO1xuXHRwYWdlRWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRpICs9IDE7XG5cdFx0aWYgKCQodGhpcykuY3NzKCd6LWluZGV4JykgPj0gbWF4ekluZGV4KSB7XG5cdFx0XHRtYXh6SW5kZXggPSBwYXJzZUludCgkKHRoaXMpLmNzcygnei1pbmRleCcpKTtcblx0XHR9XG5cdFx0aWYgKGkgPT0gcGFnZUVsZW1lbnRzLmxlbmd0aCkge1xuXHRcdFx0aWYgKCh0YXJnZXQuc3R5bGUuekluZGV4ICE9IG1heHpJbmRleCkgfCAodGFyZ2V0LnN0eWxlLnpJbmRleCA9PSAwKSkge1xuXHRcdFx0XHR0YXJnZXQuc3R5bGUuekluZGV4ID0gbWF4ekluZGV4ICsgMTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXHQvLyB0YXJnZXQuc3R5bGUuekluZGV4ID0gbWF4ekluZGV4ICsgMTtcblxuXHR2YXIgcGFnZUVsZW1lbnRQb3MgPSBnZXRFbGVtZW50UG9zaXRpb24oJCgnIycgKyB0YXJnZXQuaWQpKTtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyBpZDogdGFyZ2V0LmlkLCBwb3M6IHBhZ2VFbGVtZW50UG9zLCBtb3ZlOiB0cnVlIH0pOyAvLyBzZW5kaW5nIGVsZW1lbnQgaWQgYW5kIHBvc2l0aW9uXG59XG5cbi8vIHRoaXMgaXMgdXNlZCBsYXRlciBpbiB0aGUgcmVzaXppbmcgYW5kIGdlc3R1cmUgZGVtb3NcbndpbmRvdy5kcmFnTW92ZUxpc3RlbmVyID0gZHJhZ01vdmVMaXN0ZW5lcjtcblxuLy8gc2hvdyBzYXZlIG1vZGFsXG5cbmZ1bmN0aW9uIHNob3dTYXZlTW9kYWwoKSB7XG5cdCQoJyNzYXZlLW1vZGFsJykuc2hvdygpO1xuXHQkKCcjc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdHNhdmV0b0RiKFB1YmxpY2F0aW9uKTtcblx0XHRtYWtlUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRnZW5QZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdGNoZWNrUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdlblBkZihpZCkge1xuXHQkKCcjc2F2ZS1tb2RhbCcpLnNob3coKTtcblx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKCcnKTtcblx0dmFyIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRpZiAocGRmUmVhZHkgPT0gdHJ1ZSkge1xuXHRcdFx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKFxuXHRcdFx0XHQnRG93bmxvYWQgeW91ciBwZGYgPGEgaHJlZj1cImFzc2V0cy9wZGYvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcucGRmP2Rvd25sb2FkPXRydWVcIj5oZXJlPC9hPidcblx0XHRcdCk7XG5cdFx0XHRjbGVhckludGVydmFsKHkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCcjc2F2ZS1tb2RhbCcpLnRleHQoJ1lvdXIgUERGIGlzIGJlaW5nIGdlbmVyYXRlZCcpO1xuXHRcdH1cblx0fSwgMTAwKTtcbn1cblxuLy8gLS0tIFNBVkVEXG5cbmZ1bmN0aW9uIHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKSB7XG5cdHZhciBpO1xuXHRmb3IgKGkgPSAwOyBpIDwgUHVibGljYXRpb24uZWxlbWVudHMubGVuZ3RoOyArK2kpIHtcblx0XHRpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZigncHJpbnQ9dHJ1ZScpID4gMCkgeyAvLyBwcmludCBwdWJcblx0XHRcdGNyZWF0ZUVsZW1lbnRDYW52YXMoUHVibGljYXRpb24uZWxlbWVudHNbaV0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjcmVhdGVFbGVtZW50KFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldKTsgLy8gc2F2ZWQgcHViXG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBkZkRvd25sb2FkKCkge1xuXHQkKCcjcGRmLWRvd25sb2FkJykuc2hvdygpO1xuXHQkKCcjcGRmLWRvd25sb2FkJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0bWFrZVBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Z2VuUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRjaGVja1BkZihQdWJsaWNhdGlvbi5pZCk7XG5cdH0pO1xufVxuXG4vLyAtLS0gQkFDS0VORFxuXG4vLyBzZW5kIGNhbGwgdG8gc2VydmVyIHRvIG1ha2UgcGRmXG5mdW5jdGlvbiBtYWtlUGRmKGlkKSB7XG5cdCQuZ2V0KCcvcGRmP2lkPScgKyBpZCwgZnVuY3Rpb24oZGF0YSkge1xuXHRcdGNvbnNvbGUubG9nKCdTZW50IGNhbGwgdG8gbWFrZSBQREYuJyk7XG5cdH0pO1xufVxuXG4vLyBjaGVjayBpZiBwZGYgZXhpc3RzIGFuZCByZWRpcmVjdCB0byBmaWxlXG5mdW5jdGlvbiBjaGVja1BkZihpZCkge1xuXHR2YXIgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdCQuYWpheCh7XG5cdFx0XHR0eXBlOiAnSEVBRCcsXG5cdFx0XHR1cmw6ICdhc3NldHMvcGRmLycgKyBpZCArICcvJyArIGlkICsgJy5wZGYnLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24obXNnKSB7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoeSk7XG5cdFx0XHRcdHBkZlJlYWR5ID0gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oanFYSFIsIHRleHRTdGF0dXMsIGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGpxWEhSKTtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LCAxMDApO1xufVxuXG5mdW5jdGlvbiBzYXZldG9EYihwdWJsaWNhdGlvbikge1xuXHQkLmFqYXgoe1xuXHRcdHVybDogJy9kYicsXG5cdFx0dHlwZTogJ3Bvc3QnLCAvLyBwZXJmb3JtaW5nIGEgUE9TVCByZXF1ZXN0XG5cdFx0ZGF0YTogcHVibGljYXRpb24sXG5cdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRzdWNjZXNzOiBmdW5jdGlvbihwdWJsaWNhdGlvbikge1xuXHRcdFx0Y29uc29sZS5sb2coJ3B1YmxpY2F0aW9uIHNlbnQgdG8gZGF0YWJhc2UuJyk7XG5cdFx0fVxuXHR9KTtcbn0iLCIvLyAjY291bnRlciBmb2xsb3dzIHRoZSBtb3VzZVxuZnVuY3Rpb24gdXBkYXRlTW91c2VDb3VudGVyKGUpIHtcbiAgaWYgKGUuY2xpZW50WCA+PSAyMDApIHsgLy8gKCQoZG9jdW1lbnQpLndpZHRoKCkvMilcbiAgICAvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIGNsaWVudFxuICAgICQoJy5jb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG4gICAgJCgnLmNvdW50ZXInKS5jc3Moe1xuICAgICAgbGVmdDogIGUuY2xpZW50WCAtIDIwIC0gJCgnLmNvdW50ZXInKS53aWR0aCgpLFxuICAgICAgdG9wOiAgIGUuY2xpZW50WSAtIDUwXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gaWYgbW91c2Ugb2YgbGVmdCBzaWRlIG9mIGNsaWVudFxuICAgICQoJy5jb3VudGVyJykucmVtb3ZlQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG4gICAgJCgnLmNvdW50ZXInKS5jc3Moe1xuICAgICAgbGVmdDogIGUuY2xpZW50WCArIDIwLFxuICAgICAgdG9wOiAgIGUuY2xpZW50WSAtIDUwXG4gICAgfSk7XG4gIH1cbn1cblxuJChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSl7XG4gIHVwZGF0ZU1vdXNlQ291bnRlcihlKTtcbn0pO1xuXG4kKGRvY3VtZW50KS5iaW5kKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSl7XG4gICAgdXBkYXRlTW91c2VDb3VudGVyKGUpO1xufSk7XG4iXX0=
