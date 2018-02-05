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
		if (window.location.href.indexOf('print=true') > 0) {
			createElementCanvas(Publication.elements[i]);
			console.log('print pub');
		} else {
			createElement(Publication.elements[i]);
			console.log('saved pub');
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuaW1hdGVfdGltZWNvdW50ZXIuanMiLCJjb3VudGRvd24uanMiLCJtYWluLmpzIiwidGltZV9mb2xsb3dfbW91c2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaGpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIGFuaW1hdGV0aW1lY291bnRlcihib251c1RpbWUpIHtcblx0Y29uc29sZS5sb2coYm9udXNUaW1lKTtcblx0JCgnI2FuaW1hdGV0aW1lY291bnRlcicpLnByZXBlbmQoXG5cdFx0XCI8c3BhbiBpZD0nYm9udXNUaW1lJz5cIiArIGJvbnVzVGltZSArICc8L3NwYW4+J1xuXHQpO1xuXHQvLyAkKCcjYW5pbWF0ZXRpbWVjb3VudGVyJykuc2hvdygpLmZhZGVPdXQoMTAwMCk7XG5cblx0Ly8gYWRkXG5cdCQoJyNhbmltYXRldGltZWNvdW50ZXInKS5hZGRDbGFzcygnZmFkZWlub3V0Jyk7XG5cdCQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ3dpZ2dsZScpO1xuXHRjb25zb2xlLmxvZygnYWRkJyk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0Ly8gcmVtb3ZlXG5cdFx0Y29uc29sZS5sb2coJ3JlbW92ZScpO1xuXHRcdCQoJyNhbmltYXRldGltZWNvdW50ZXInKS5yZW1vdmVDbGFzcygnZmFkZWlub3V0Jyk7XG5cdFx0JCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnd2lnZ2xlJyk7XG5cdH0sIDEwMDApO1xufVxuIiwiZnVuY3Rpb24gY291bnRkb3duV3JhcHBlcigpIHtcblx0ZnVuY3Rpb24gbG9hZFNvdW5kKCkge1xuXHRcdGNvbnNvbGUubG9nKCdsb2FkIHNvdW5kIScpO1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoJ2Fzc2V0cy9hdWRpby9iZWVwLm1wMycsICdiZWVwJyk7XG5cdFx0Y3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZCgnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJywgJ2RpbmcnKTtcblxuXHRcdC8vIHByaW50ZXIgc291bmRqc1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXG5cdFx0XHQnYXNzZXRzL2F1ZGlvL3ByaW50ZXIvbWF0cml4LXNob3J0LndhdicsXG5cdFx0XHQncHJpbnRlci1zaG9ydCdcblx0XHQpO1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXG5cdFx0XHQnYXNzZXRzL2F1ZGlvL3ByaW50ZXIvbWF0cml4LWxvbmcud2F2Jyxcblx0XHRcdCdwcmludGVyLWxvbmcnXG5cdFx0KTtcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFxuXHRcdFx0J2Fzc2V0cy9hdWRpby9wcmludGVyL2xvYWRfcGFwZXIud2F2Jyxcblx0XHRcdCdsb2FkX3BhcGVyJ1xuXHRcdCk7XG5cdH1cblxuXHRsb2FkU291bmQoKTtcblxuXHQvLyB3aGVuIHBhZ2UgaXMgcmVhZHkgZG8gdGhpc1xuXHQkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0XHQkKCcjY291bnRkb3duJykuaHRtbCgnR2V0IHJlYWR5IScpO1xuXHRcdC8vIGNvdW50ZG93biB0aW1lclxuXHRcdGZ1bmN0aW9uIGNvdW50ZG93bihzdGFydFRpbWUpIHtcblx0XHRcdGlmIChzdGFydFRpbWUgPj0gMSkge1xuXHRcdFx0XHRjcmVhdGVqcy5Tb3VuZC5wbGF5KCdwcmludGVyLXNob3J0Jyk7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c3RhcnRUaW1lID0gc3RhcnRUaW1lIC0gMTtcblx0XHRcdFx0XHQkKCcjY291bnRkb3duJykuaHRtbChzdGFydFRpbWUpOyAvLyBzZXQgY3VycmVudCB0aW1lIGluICNjb3VudGRvd25cblx0XHRcdFx0XHRjb3VudGRvd24oc3RhcnRUaW1lKTsgLy8gcmVwZWF0IGZ1bmN0aW9uXG5cdFx0XHRcdH0sIDEwMDApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCgnI2NvdW50ZG93bicpLmh0bWwoJ3N0YXJ0IGdhbWUhJyk7IC8vIHNldCB0byBzdGFydCBnYW1lIG1lc3NhZ2Vcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQvLyB3YWl0IGEgYml0XG5cdFx0XHRcdFx0JCgnI2NvdW50ZG93bicpLmZhZGVPdXQoMTAwMCk7IC8vIGZhZGUgb3V0IHRoZSAjY291bnRkb3duXG5cdFx0XHRcdFx0Ly8gVE9ETzogc3RhcnQgdGltZSFcblx0XHRcdFx0fSwgMjAwKTtcblx0XHRcdFx0Y3JlYXRlanMuU291bmQucGxheSgnZGluZycpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBzdGFydFRpbWUgPSA0O1xuXHRcdGNvdW50ZG93bihzdGFydFRpbWUpO1xuXHRcdCQoJyNjb3VudGRvd24nKS5odG1sKHN0YXJ0VGltZSk7XG5cdH0pO1xufVxuIiwiLy8gLS0tIEdMT0JBTFxuXG52YXIgcGFnZXMgPSAkKCcucGFnZScpO1xudmFyIGNyaXRpY1BvcHVwID0gJCgnI2NyaXRpYycpO1xudmFyIGRyb3BEZWxheSA9IDEwMDtcbnZhciBwZGZSZWFkeSA9IGZhbHNlO1xuXG4vLyAtLS0gR0VORVJBTCBGVU5DVElPTlNcblxuZnVuY3Rpb24gbWFrZUlkKCkge1xuXHR2YXIgcmFuZExldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNikpO1xuXHR2YXIgaWQgPSByYW5kTGV0dGVyICsgRGF0ZS5ub3coKTtcblx0cmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBieXRlQ291bnQocykge1xuICAgIHJldHVybiBlbmNvZGVVUkkocykuc3BsaXQoLyUuLnwuLykubGVuZ3RoIC0gMTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudChlbGVtZW50KSB7XG5cdGlmIChlbGVtZW50LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSkge1xuXHRcdHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKCc8aW1nPicsIHsgc3JjOiBlbGVtZW50LmRhdGEgfSk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGRlQmFzZWRUZXh0ID0gYXRvYihlbGVtZW50LmRhdGEuc3Vic3RyaW5nKDIzKSk7XG5cdFx0dmFyIGh0bWxCclRleHQgPSBkZUJhc2VkVGV4dC5yZXBsYWNlKC9cXG4vZywgJzxici8+Jyk7XG5cdFx0Y29uc29sZS5sb2coaHRtbEJyVGV4dCk7XG5cdFx0dmFyIHBhZ2VFbGVtZW50Q29udGVudCA9ICQoJzxwPicpLmFwcGVuZChodG1sQnJUZXh0KTsgLy8gcmVtb3ZlIFwiZGF0YTp0ZXh0L3BsYWluO2Jhc2U2NFwiXG5cdH1cblx0dmFyIHBhZ2VFbGVtZW50ID0gJCgnPGRpdj4nLCB7IGNsYXNzOiAncGFnZS1lbGVtZW50IGRyYWdnYWJsZScgfSk7XG5cdHZhciBwYWdlRWxlbWVudENsb3NlID0gJCgnPHNwYW4+JywgeyBjbGFzczogJ2Nsb3NlJyB9KS50ZXh0KCd4Jyk7XG5cdHBhZ2VFbGVtZW50LmFwcGVuZChwYWdlRWxlbWVudENvbnRlbnQsIHBhZ2VFbGVtZW50Q2xvc2UpO1xuXHRwYWdlRWxlbWVudC5hdHRyKCdpZCcsIGVsZW1lbnQuaWQpO1xuXHQkKCcjJyArIGVsZW1lbnQucGFnZSkuYXBwZW5kKHBhZ2VFbGVtZW50KTtcblxuXHRpZiAoZWxlbWVudC5wb3MpIHtcblx0XHQvLyByZWNvbnN0cnVjdGluZyBzYXZlZCBlbGVtZW50XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdG1vZEVsZW1lbnRQb3NpdGlvbihwYWdlRWxlbWVudCwgZWxlbWVudC5wb3MpO1xuXHRcdH0sIDcwMCk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gZHJvcHBpbmcgbmV3IGZpbGVcblx0XHRyZXR1cm4gZ2V0RWxlbWVudFBvc2l0aW9uKHBhZ2VFbGVtZW50KTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50Q2FudmFzKGVsZW1lbnQpIHtcblx0aWYgKGVsZW1lbnQuZGF0YS5pbmRleE9mKCdkYXRhOmltYWdlJykgPj0gMCkge1xuXG5cdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHRcdGNhbnZhcy5zdHlsZS5tYXJnaW5MZWZ0ID0gZWxlbWVudC5wb3NbMF0gKyAncHgnO1xuXHRcdGNhbnZhcy5zdHlsZS5tYXJnaW5Ub3AgPSBlbGVtZW50LnBvc1sxXSArICdweCc7XG5cdFx0Y2FudmFzLndpZHRoID0gZWxlbWVudC5wb3NbMl0gKiAzOyAvLyB0byBoYXZlIGNyaXNwIGltYWdlc1xuXHRcdGNhbnZhcy5oZWlnaHQgPSBlbGVtZW50LnBvc1szXSAqIDM7IC8vIHRvIGhhdmUgY3Jpc3AgaW1hZ2VzXG5cdFx0Y2FudmFzLnN0eWxlLndpZHRoID0gZWxlbWVudC5wb3NbMl0gKyAncHgnO1xuXHRcdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBlbGVtZW50LnBvc1szXSArICdweCc7XG5cdFx0Y2FudmFzLnN0eWxlLnpJbmRleCA9IGVsZW1lbnQucG9zWzRdO1xuXG5cdFx0dmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdCQoJyMnICsgZWxlbWVudC5wYWdlKS5hcHBlbmQoY2FudmFzKTtcblxuXHRcdHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuXHRcdGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0Y3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHR9O1xuXHRcdGltYWdlLnNyYyA9IGVsZW1lbnQuZGF0YTtcblxuXHR9IGVsc2Uge1xuXG5cdFx0dmFyIGRlQmFzZWRUZXh0ID0gYXRvYihlbGVtZW50LmRhdGEuc3Vic3RyaW5nKDIzKSk7XG5cdFx0dmFyIGh0bWxCclRleHQgPSBkZUJhc2VkVGV4dC5yZXBsYWNlKC9cXG4vZywgJzxici8+Jyk7XG5cdFx0Y29uc29sZS5sb2coaHRtbEJyVGV4dCk7XG5cdFx0dmFyIHBhZ2VFbGVtZW50Q29udGVudCA9ICQoJzxwPicpLmFwcGVuZChodG1sQnJUZXh0KTsgLy8gcmVtb3ZlIFwiZGF0YTp0ZXh0L3BsYWluO2Jhc2U2NFwiXG5cblx0XHR2YXIgcGFnZUVsZW1lbnQgPSAkKCc8ZGl2PicsIHsgY2xhc3M6ICdwYWdlLWVsZW1lbnQgZHJhZ2dhYmxlJyB9KTtcblx0XHR2YXIgcGFnZUVsZW1lbnRDbG9zZSA9ICQoJzxzcGFuPicsIHsgY2xhc3M6ICdjbG9zZScgfSkudGV4dCgneCcpO1xuXHRcdHBhZ2VFbGVtZW50LmFwcGVuZChwYWdlRWxlbWVudENvbnRlbnQsIHBhZ2VFbGVtZW50Q2xvc2UpO1xuXHRcdHBhZ2VFbGVtZW50LmF0dHIoJ2lkJywgZWxlbWVudC5pZCk7XG5cdFx0JCgnIycgKyBlbGVtZW50LnBhZ2UpLmFwcGVuZChwYWdlRWxlbWVudCk7XG5cblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0bW9kRWxlbWVudFBvc2l0aW9uKHBhZ2VFbGVtZW50LCBlbGVtZW50LnBvcyk7XG5cdFx0fSwgNzAwKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRFbGVtZW50UG9zaXRpb24oZWxlbWVudCkge1xuXHRyZXR1cm4gKGVsZW1lbnRQb3MgPSBbXG5cdFx0cGFyc2VGbG9hdChlbGVtZW50LmNzcygnbWFyZ2luTGVmdCcpKSxcblx0XHRwYXJzZUZsb2F0KGVsZW1lbnQuY3NzKCdtYXJnaW5Ub3AnKSksXG5cdFx0ZWxlbWVudC53aWR0aCgpLFxuXHRcdGVsZW1lbnQuaGVpZ2h0KCksXG5cdFx0cGFyc2VJbnQoZWxlbWVudC5jc3MoJ3otaW5kZXgnKSkgLy8gVE9ETyByb3RhdGlvbiBtYXliZVxuXHRdKTtcbn1cblxuZnVuY3Rpb24gbW9kRWxlbWVudFBvc2l0aW9uKHBhZ2VFbGVtZW50LCBuZXdQb3MpIHtcblx0cGFnZUVsZW1lbnQuY3NzKHsgJ21hcmdpbi1sZWZ0JzogbmV3UG9zWzBdICsgJ3B4JyB9KTtcblx0cGFnZUVsZW1lbnQuY3NzKHsgJ21hcmdpbi10b3AnOiBuZXdQb3NbMV0gKyAncHgnIH0pO1xuXHRwYWdlRWxlbWVudC53aWR0aChuZXdQb3NbMl0pO1xuXHRwYWdlRWxlbWVudC5oZWlnaHQobmV3UG9zWzNdKTtcblx0cGFnZUVsZW1lbnQuY3NzKHsgJ3otaW5kZXgnOiBuZXdQb3NbNF0gfSk7XG59XG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG5cdC8vIGFsbCBvdXIgc3RhdGVzXG5cdGlkOiBtYWtlSWQoKSxcblx0dGl0bGU6ICdURVNUIFBVQicsXG5cdHRpbWVMZWZ0OiA5MDAwMDAwLFxuXHRleHBpcmVkOiBmYWxzZSxcblx0ZWxlbWVudHM6IFtdLFxuXHRhdXRob3JzOiBbXVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihQdWJsaWNhdGlvbiwgaW5wdXQpIHtcblx0Ly8gZXhwaXJlZD9cblx0aWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkge1xuXHRcdC8vIGV4cGlyZWRcblx0XHRzaG93VGltZShQdWJsaWNhdGlvbik7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gbm90IGV4cGlyZWRcblx0XHRQdWJsaWNhdGlvbi5leHBpcmVkID0gdHJ1ZTtcblx0XHRzaG93RXhwaXJlZChQdWJsaWNhdGlvbik7XG5cdFx0bm9EcmFnKCk7XG5cdFx0c2hvd1NhdmVNb2RhbCgpO1xuXHR9XG5cblx0aWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gZmFsc2UpIHtcblx0XHRjb25zb2xlLmxvZyhpbnB1dClcblx0XHRzd2l0Y2ggKHRydWUpIHtcblx0XHRcdGNhc2UgaW5wdXQudmlzaWJsZSA9PSBmYWxzZTogLy8gZGVsZXRpbmcgYW4gZWxlbWVudFxuXHRcdFx0XHRcdHJlbW92ZUVsZW1lbnQoaW5wdXQuaWQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRieXRlQ291bnQoaW5wdXQuZGF0YSkgPiAxMzk4MTE3IDogLy8gZmlsZSB0b28gYmlnICgxbWIpXG5cdFx0XHRcdCBcdEVycm9yLnRvb0JpZygpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0aW5wdXQudmlzaWJsZSA9PSB0cnVlOiAvLyBuZXcgaW1hZ2Vcblx0XHRcdFx0XHQvLyB1cGRhdGUgdGhlIFB1YmxpY2F0aW9uXG5cdFx0XHRcdFx0UHVibGljYXRpb24uZWxlbWVudHMucHVzaChpbnB1dCk7XG5cdFx0XHRcdFx0Ly8gZHJvcCBmaWxlXG5cdFx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQuaWQpO1xuXHRcdFx0XHRcdC8vIGFkZCBib251cyB0aW1lXG5cdFx0XHRcdFx0YWRkdGltZSgxMDAwKVxuXHRcdFx0XHRcdC8vIGNyaXRpYyBzcGVha1xuXHRcdFx0XHRcdC8vIGNyaXRpYygpO1xuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJykgJiZcblx0XHRcdFx0aW5wdXQudmlzaWJsZSA9PSB0cnVlOiAvLyBuZXcgdGV4dFxuXHRcdFx0XHRcdC8vIHVwZGF0ZSB0aGUgUHVibGljYXRpb25cblx0XHRcdFx0XHRQdWJsaWNhdGlvbi5lbGVtZW50cy5wdXNoKGlucHV0KTtcblx0XHRcdFx0XHQvLyBkcm9wIGZpbGVcblx0XHRcdFx0XHRkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBpbnB1dC5pZClcblx0XHRcdFx0XHRhZGR0aW1lKDEwMDApXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKTogLy8gbmVpdGhlciBhbiBpbWFnZSBub3IgdGV4dFxuXHRcdFx0XHRcdEVycm9yLm5vdEFsbG93ZWQoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0Lm1vdmUgPT0gdHJ1ZSA6IC8vIG1vdmluZyBvciBzY2FsaW5nIGFuIGltYWdlXG5cdFx0XHRcdFx0dmFyIG1vdmluZ0VsZW1lbnQ7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBQdWJsaWNhdGlvbi5lbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdFx0Ly8gZmluZCBlbGVtZW50IGJ5IGlkXG5cdFx0XHRcdFx0XHRpZiAoUHVibGljYXRpb24uZWxlbWVudHNbaV0uaWQgPT0gaW5wdXQuaWQpIHtcblx0XHRcdFx0XHRcdFx0bW92aW5nRWxlbWVudCA9IFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldOyAvLyByZWFkIHBvcyBhbmQgYWRkIGl0IHRvIFB1YmxpY2F0aW9uXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG1vdmluZ0VsZW1lbnQucG9zID0gaW5wdXQucG9zO1xuXHRcdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkge1xuXHRcdC8vIHRvbyBsYXRlXG5cdFx0RXJyb3IudG9vTGF0ZSgpO1xuXHR9XG59XG5cbi8vIC0tLSBDT05UUk9MTEVSXG5cbnZhciB4O1xuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cdGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpIDwgMCkge1xuXHRcdC8vIGlmIG5vdCBhIHNhdmVkIHB1YmxpY2F0aW9uXG5cdFx0eCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0UHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAtIDEwO1xuXHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbik7XG5cdFx0fSwgMTApO1xuXG5cdFx0bW91c2VDb3VudGVyKCk7XG5cdH0gZWxzZSB7XG5cdFx0cmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pO1xuXHRcdG5vRHJhZygpO1xuXHRcdHBkZkRvd25sb2FkKCk7XG5cdH1cbn0pO1xuXG5mdW5jdGlvbiBhZGR0aW1lKGJvbnVzVGltZSkge1xuXHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICsgYm9udXNUaW1lO1xuXHRhbmltYXRldGltZWNvdW50ZXIoYm9udXNUaW1lKTtcbn1cblxuLy8gZHJvcEZpbGVcblxucGFnZXMub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdCQodGhpcykuYWRkQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0JCh0aGlzKS5yZW1vdmVDbGFzcygnZHJhZ292ZXInKTtcbn0pO1xucGFnZXMub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2RyYWdvdmVyJyk7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0Y29uc29sZS5sb2coZSk7XG5cdHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdHZhciB5ID0gMDtcblx0Zm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0cmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHR2YXIgcGFnZUlkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuXHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0Y29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcblx0XHRcdC8vIGlkLCBkYXRhLCBbcG9zIHgsIHBvcyB5LCB3aWR0aCwgaGVpZ2h0LCB6LWluZGV4LCAocm90YXRpb24/KV0sIHZpc2libGUsIHBhZ2Vcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHtcblx0XHRcdFx0XHRpZDogbWFrZUlkKCksXG5cdFx0XHRcdFx0ZGF0YTogZXZlbnQudGFyZ2V0LnJlc3VsdCxcblx0XHRcdFx0XHRwb3M6IFswLCAwLCAwLCAwLCAwXSxcblx0XHRcdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHBhZ2U6IHBhZ2VJZFxuXHRcdFx0XHR9KTtcblx0XHRcdH0sIHkgKiBkcm9wRGVsYXkpO1xuXHRcdFx0eSArPSAxO1xuXHRcdH07XG5cdFx0Y29uc29sZS5sb2coZmlsZXNbaV0pO1xuXHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGVzW2ldKTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59KTtcbi8vIHByZXZlbnQgZHJvcCBvbiBib2R5XG4kKCdib2R5Jykub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRTb3VuZC5lcnJvcigpO1xufSk7XG5cbi8vIHJlbW92ZSBlbGVtZW50XG4kKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNsb3NlJywgZnVuY3Rpb24oKSB7XG5cdHZhciBwYWdlSWQgPSAkKHRoaXMpXG5cdFx0LmNsb3Nlc3QoJy5wYWdlJylcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnRJZCA9ICQodGhpcylcblx0XHQucGFyZW50KClcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnREYXRhID0gJCh0aGlzKVxuXHRcdC5zaWJsaW5ncygpXG5cdFx0LmF0dHIoJ3NyYycpO1xuXHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0aWQ6IGVsZW1lbnRJZCxcblx0XHRkYXRhOiBlbGVtZW50RGF0YSxcblx0XHRwb3M6IFswLCAwLCAwLCAwLCAwXSxcblx0XHR2aXNpYmxlOiBmYWxzZSxcblx0XHRwYWdlOiBwYWdlSWRcblx0fSk7XG59KTtcblxuLy8gLS0tIFZJRVdcblxudmFyIFNvdW5kID0ge1xuXHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vaW5jb3JyZWN0Lm1wMycpO1xuXHRcdGF1ZGlvLnBsYXkoKTtcblx0fSxcblx0ZGluZzogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vZGluZy5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH1cbn07XG5cbi8vIG1lcmdlIHRoZXNlIHR3b1xuZnVuY3Rpb24gc2hvd1RpbWUoUHVibGljYXRpb24pIHtcblx0c2Vjb25kcyA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMTAwMDtcblx0JCgnI2NvdW50ZXInKS5zaG93KCk7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID1cblx0XHRzZWNvbmRzLnRvRml4ZWQoMikgKyAnIHNlY29uZHMgbGVmdCEnO1xufVxuZnVuY3Rpb24gbW91c2VDb3VudGVyKCkge1xuXHQkKGRvY3VtZW50KS5iaW5kKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUucGFnZVggPj0gJChkb2N1bWVudCkud2lkdGgoKSAvIDIpIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIHJpZ2h0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5hZGRDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCAtIDIwIC0gJCgnI2NvdW50ZXInKS53aWR0aCgpLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIGxlZnQgc2lkZSBvZiBwYWdlXG5cdFx0XHQkKCcjY291bnRlcicpLnJlbW92ZUNsYXNzKCdtb3VzZV9yaWdodCcpO1xuXHRcdFx0JCgnI2NvdW50ZXInKS5jc3Moe1xuXHRcdFx0XHRsZWZ0OiBlLnBhZ2VYICsgMjAsXG5cdFx0XHRcdHRvcDogZS5wYWdlWSArIDUwXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzaG93RXhwaXJlZCgpIHtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKS5pbm5lckhUTUwgPSAnZXhwaXJlZCEnO1xuXHQkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKTtcblx0Ly9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdC8vICB3aW5kb3cucHJpbnQoKTtcblx0Ly99LCAxMDAwKTtcblx0Y2xlYXJJbnRlcnZhbCh4KTtcbn1cblxuXG5mdW5jdGlvbiBkcm9wRWxlbWVudChwYWdlSWQsIGRhdGEsIGlkKSB7XG5cdHZhciBlbGVtZW50ID0geyBpZDogaWQsIGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZCB9O1xuXHR2YXIgZWxlbWVudFBvcyA9IGNyZWF0ZUVsZW1lbnQoZWxlbWVudCk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0Ly8gdGltZW91dCB0byBnZXQgdGhlIGFjdHVhbCBoZWlnaHQgOihcblx0XHRlbGVtZW50UG9zWzNdID0gJCgnIycgKyBpZCkuaGVpZ2h0KCk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBQdWJsaWNhdGlvbi5lbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0Ly8gZmluZCBlbGVtZW50IGJ5IGlkXG5cdFx0XHRpZiAoUHVibGljYXRpb24uZWxlbWVudHNbaV0uaWQgPT0gaWQpIHtcblx0XHRcdFx0UHVibGljYXRpb24uZWxlbWVudHNbaV0ucG9zID0gZWxlbWVudFBvczsgLy8gcmVhZCBwb3MgYW5kIGFkZCBpdCB0byBQdWJsaWNhdGlvblxuXHRcdFx0fVxuXHRcdH1cblx0XHRTb3VuZC5kaW5nKCk7XG5cdH0sIDEpO1xufVxuXG4vLyBlcnJvcnNcblxudmFyIEVycm9yID0ge1xuXHRub3RBbGxvd2VkOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpXG5cdFx0YWxlcnQoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIG5vdCBhbGxvd2VkIScpXG5cdH0sXG5cdHRvb0JpZzogZnVuY3Rpb24oKSB7XG5cdFx0U291bmQuZXJyb3IoKTtcblx0XHRhbGVydCgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgdG9vIGJpZyEnKTsgXG5cdH0sXG5cdHRvb0xhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKCk7XG5cdFx0XHRhbGVydCgndG9vIGxhdGUgYnJvJyk7IFxuXHR9XG59O1xuXG5cbmZ1bmN0aW9uIG5vRHJhZygpIHtcblx0dmFyIGVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRyYWdnYWJsZScpO1xuXHRbXS5mb3JFYWNoLmNhbGwoZWxlbXMsIGZ1bmN0aW9uKGVsKSB7XG5cdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZ2dhYmxlJyk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBjcml0aWMoKSB7XG5cdGNyaXRpY1BvcHVwLmlubmVySFRNTCA9ICdNYWtlIHRoaXMgaW1hZ2UgYmlnZ2VyIHBscyEnO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50KGlkKSB7XG5cdCQoJyMnICsgaWQpLmhpZGUoKTtcblx0Y29uc29sZS5sb2coaWQpO1xufVxuXG5pbnRlcmFjdCgnLmRyYWdnYWJsZScpXG5cdC5kcmFnZ2FibGUoe1xuXHRcdG9ubW92ZTogd2luZG93LmRyYWdNb3ZlTGlzdGVuZXIsXG5cdFx0cmVzdHJpY3Q6IHtcblx0XHRcdHJlc3RyaWN0aW9uOiAncGFyZW50Jyxcblx0XHRcdGVsZW1lbnRSZWN0OiB7XG5cdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0bGVmdDogMCxcblx0XHRcdFx0Ym90dG9tOiAxLFxuXHRcdFx0XHRyaWdodDogMVxuXHRcdFx0fVxuXHRcdH1cblx0fSlcblx0LnJlc2l6YWJsZSh7XG5cdFx0Ly8gcmVzaXplIGZyb20gYWxsIGVkZ2VzIGFuZCBjb3JuZXJzXG5cdFx0ZWRnZXM6IHtcblx0XHRcdGxlZnQ6IHRydWUsXG5cdFx0XHRyaWdodDogdHJ1ZSxcblx0XHRcdGJvdHRvbTogdHJ1ZSxcblx0XHRcdHRvcDogdHJ1ZVxuXHRcdH0sXG5cblx0XHQvLyBrZWVwIHRoZSBlZGdlcyBpbnNpZGUgdGhlIHBhcmVudFxuXHRcdHJlc3RyaWN0RWRnZXM6IHtcblx0XHRcdG91dGVyOiAncGFyZW50Jyxcblx0XHRcdGVuZE9ubHk6IHRydWVcblx0XHR9LFxuXG5cdFx0aW5lcnRpYTogdHJ1ZVxuXHR9KVxuXHQub24oJ3Jlc2l6ZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0XHR4ID0gcGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCxcblx0XHRcdHkgPSBwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwO1xuXG5cdFx0Ly8gdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVcblx0XHR0YXJnZXQuc3R5bGUud2lkdGggPSBldmVudC5yZWN0LndpZHRoICsgJ3B4Jztcblx0XHR0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gZXZlbnQucmVjdC5oZWlnaHQgKyAncHgnO1xuXG5cdFx0Ly8gdHJhbnNsYXRlIHdoZW4gcmVzaXppbmcgZnJvbSB0b3Agb3IgbGVmdCBlZGdlc1xuXHRcdHggKz0gZXZlbnQuZGVsdGFSZWN0LmxlZnQ7XG5cdFx0eSArPSBldmVudC5kZWx0YVJlY3QudG9wO1xuXG5cdFx0dGFyZ2V0LnN0eWxlLm1hcmdpbkxlZnQgPSB4ICsgJ3B4Jztcblx0XHR0YXJnZXQuc3R5bGUubWFyZ2luVG9wID0geSArICdweCc7XG5cblx0XHR0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KTtcblx0XHR0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KTtcblxuXHRcdHZhciBwYWdlRWxlbWVudFBvcyA9IGdldEVsZW1lbnRQb3NpdGlvbigkKCcjJyArIHRhcmdldC5pZCkpO1xuXHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgaWQ6IHRhcmdldC5pZCwgcG9zOiBwYWdlRWxlbWVudFBvcywgbW92ZTogdHJ1ZSB9KTsgLy8gc2VuZGluZyBlbGVtZW50IGlkIGFuZCBwb3NpdGlvblxuXHR9KTtcblxuZnVuY3Rpb24gZHJhZ01vdmVMaXN0ZW5lcihldmVudCkge1xuXHR2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdC8vIGtlZXAgdGhlIGRyYWdnZWQgcG9zaXRpb24gaW4gdGhlIGRhdGEteC9kYXRhLXkgYXR0cmlidXRlc1xuXHRcdHggPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCkgKyBldmVudC5keCxcblx0XHR5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDApICsgZXZlbnQuZHk7XG5cblx0Ly8gdHJhbnNsYXRlIHRoZSBlbGVtZW50XG5cdHRhcmdldC5zdHlsZS5tYXJnaW5MZWZ0ID0geCArICdweCc7XG5cdHRhcmdldC5zdHlsZS5tYXJnaW5Ub3AgPSB5ICsgJ3B4JztcblxuXHQvLyB1cGRhdGUgdGhlIHBvc2lpb24gYXR0cmlidXRlc1xuXHR0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KTtcblx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG5cblx0Ly8gdXBkYXRlIHotaW5kZXhcblx0dmFyIG1heHpJbmRleCA9IDAsXG5cdFx0aSA9IDA7XG5cdHBhZ2VFbGVtZW50cyA9ICQoJyMnICsgdGFyZ2V0LmlkKVxuXHRcdC5wYXJlbnQoKVxuXHRcdC5jaGlsZHJlbigpO1xuXHRwYWdlRWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRpICs9IDE7XG5cdFx0aWYgKCQodGhpcykuY3NzKCd6LWluZGV4JykgPj0gbWF4ekluZGV4KSB7XG5cdFx0XHRtYXh6SW5kZXggPSBwYXJzZUludCgkKHRoaXMpLmNzcygnei1pbmRleCcpKTtcblx0XHR9XG5cdFx0aWYgKGkgPT0gcGFnZUVsZW1lbnRzLmxlbmd0aCkge1xuXHRcdFx0aWYgKCh0YXJnZXQuc3R5bGUuekluZGV4ICE9IG1heHpJbmRleCkgfCAodGFyZ2V0LnN0eWxlLnpJbmRleCA9PSAwKSkge1xuXHRcdFx0XHR0YXJnZXQuc3R5bGUuekluZGV4ID0gbWF4ekluZGV4ICsgMTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXHQvLyB0YXJnZXQuc3R5bGUuekluZGV4ID0gbWF4ekluZGV4ICsgMTtcblxuXHR2YXIgcGFnZUVsZW1lbnRQb3MgPSBnZXRFbGVtZW50UG9zaXRpb24oJCgnIycgKyB0YXJnZXQuaWQpKTtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyBpZDogdGFyZ2V0LmlkLCBwb3M6IHBhZ2VFbGVtZW50UG9zLCBtb3ZlOiB0cnVlIH0pOyAvLyBzZW5kaW5nIGVsZW1lbnQgaWQgYW5kIHBvc2l0aW9uXG59XG5cbi8vIHRoaXMgaXMgdXNlZCBsYXRlciBpbiB0aGUgcmVzaXppbmcgYW5kIGdlc3R1cmUgZGVtb3NcbndpbmRvdy5kcmFnTW92ZUxpc3RlbmVyID0gZHJhZ01vdmVMaXN0ZW5lcjtcblxuLy8gc2hvdyBzYXZlIG1vZGFsXG5cbmZ1bmN0aW9uIHNob3dTYXZlTW9kYWwoKSB7XG5cdCQoJyNzYXZlLW1vZGFsJykuc2hvdygpO1xuXHQkKCcjc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdHNhdmV0b0RiKFB1YmxpY2F0aW9uKTtcblx0XHRtYWtlUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRnZW5QZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdGNoZWNrUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdlblBkZihpZCkge1xuXHQkKCcjc2F2ZS1tb2RhbCcpLnNob3coKTtcblx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKCcnKTtcblx0dmFyIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRpZiAocGRmUmVhZHkgPT0gdHJ1ZSkge1xuXHRcdFx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKFxuXHRcdFx0XHQnRG93bmxvYWQgeW91ciBwZGYgPGEgaHJlZj1cImFzc2V0cy9wZGYvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcucGRmP2Rvd25sb2FkPXRydWVcIj5oZXJlPC9hPidcblx0XHRcdCk7XG5cdFx0XHRjbGVhckludGVydmFsKHkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCcjc2F2ZS1tb2RhbCcpLnRleHQoJ1lvdXIgUERGIGlzIGJlaW5nIGdlbmVyYXRlZCcpO1xuXHRcdH1cblx0fSwgMTAwKTtcbn1cblxuLy8gLS0tIFNBVkVEXG5cbmZ1bmN0aW9uIHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKSB7XG5cdHZhciBpO1xuXHRmb3IgKGkgPSAwOyBpIDwgUHVibGljYXRpb24uZWxlbWVudHMubGVuZ3RoOyArK2kpIHtcblx0XHRpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZigncHJpbnQ9dHJ1ZScpID4gMCkge1xuXHRcdFx0Y3JlYXRlRWxlbWVudENhbnZhcyhQdWJsaWNhdGlvbi5lbGVtZW50c1tpXSk7XG5cdFx0XHRjb25zb2xlLmxvZygncHJpbnQgcHViJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNyZWF0ZUVsZW1lbnQoUHVibGljYXRpb24uZWxlbWVudHNbaV0pO1xuXHRcdFx0Y29uc29sZS5sb2coJ3NhdmVkIHB1YicpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBwZGZEb3dubG9hZCgpIHtcblx0JCgnI3BkZi1kb3dubG9hZCcpLnNob3coKTtcblx0JCgnI3BkZi1kb3dubG9hZCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdG1ha2VQZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdGdlblBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Y2hlY2tQZGYoUHVibGljYXRpb24uaWQpO1xuXHR9KTtcbn1cblxuLy8gLS0tIEJBQ0tFTkRcblxuLy8gc2VuZCBjYWxsIHRvIHNlcnZlciB0byBtYWtlIHBkZlxuZnVuY3Rpb24gbWFrZVBkZihpZCkge1xuXHQkLmdldCgnL3BkZj9pZD0nICsgaWQsIGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRjb25zb2xlLmxvZygnU2VudCBjYWxsIHRvIG1ha2UgUERGLicpO1xuXHR9KTtcbn1cblxuLy8gY2hlY2sgaWYgcGRmIGV4aXN0cyBhbmQgcmVkaXJlY3QgdG8gZmlsZVxuZnVuY3Rpb24gY2hlY2tQZGYoaWQpIHtcblx0dmFyIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHQkLmFqYXgoe1xuXHRcdFx0dHlwZTogJ0hFQUQnLFxuXHRcdFx0dXJsOiAnYXNzZXRzL3BkZi8nICsgaWQgKyAnLycgKyBpZCArICcucGRmJyxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKG1zZykge1xuXHRcdFx0XHRjbGVhckludGVydmFsKHkpO1xuXHRcdFx0XHRwZGZSZWFkeSA9IHRydWU7XG5cdFx0XHR9LFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhqcVhIUik7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSwgMTAwKTtcbn1cblxuZnVuY3Rpb24gc2F2ZXRvRGIocHVibGljYXRpb24pIHtcblx0JC5hamF4KHtcblx0XHR1cmw6ICcvZGInLFxuXHRcdHR5cGU6ICdwb3N0JywgLy8gcGVyZm9ybWluZyBhIFBPU1QgcmVxdWVzdFxuXHRcdGRhdGE6IHB1YmxpY2F0aW9uLFxuXHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0c3VjY2VzczogZnVuY3Rpb24ocHVibGljYXRpb24pIHtcblx0XHRcdGNvbnNvbGUubG9nKCdwdWJsaWNhdGlvbiBzZW50IHRvIGRhdGFiYXNlLicpO1xuXHRcdH1cblx0fSk7XG59IiwiLy8gI2NvdW50ZXIgZm9sbG93cyB0aGUgbW91c2VcbmZ1bmN0aW9uIHVwZGF0ZU1vdXNlQ291bnRlcihlKSB7XG4gIGlmIChlLmNsaWVudFggPj0gMjAwKSB7IC8vICgkKGRvY3VtZW50KS53aWR0aCgpLzIpXG4gICAgLy8gaWYgbW91c2Ugb2YgcmlnaHQgc2lkZSBvZiBjbGllbnRcbiAgICAkKCcuY291bnRlcicpLmFkZENsYXNzKCdtb3VzZV9yaWdodCcpO1xuICAgICQoJy5jb3VudGVyJykuY3NzKHtcbiAgICAgIGxlZnQ6ICBlLmNsaWVudFggLSAyMCAtICQoJy5jb3VudGVyJykud2lkdGgoKSxcbiAgICAgIHRvcDogICBlLmNsaWVudFkgLSA1MFxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIC8vIGlmIG1vdXNlIG9mIGxlZnQgc2lkZSBvZiBjbGllbnRcbiAgICAkKCcuY291bnRlcicpLnJlbW92ZUNsYXNzKCdtb3VzZV9yaWdodCcpO1xuICAgICQoJy5jb3VudGVyJykuY3NzKHtcbiAgICAgIGxlZnQ6ICBlLmNsaWVudFggKyAyMCxcbiAgICAgIHRvcDogICBlLmNsaWVudFkgLSA1MFxuICAgIH0pO1xuICB9XG59XG5cbiQoZG9jdW1lbnQpLmJpbmQoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpe1xuICB1cGRhdGVNb3VzZUNvdW50ZXIoZSk7XG59KTtcblxuJChkb2N1bWVudCkuYmluZChcImRyYWdvdmVyXCIsIGZ1bmN0aW9uKGUpe1xuICAgIHVwZGF0ZU1vdXNlQ291bnRlcihlKTtcbn0pO1xuIl19
