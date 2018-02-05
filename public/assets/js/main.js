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
		$('#countdown').html('Get ready!').show();
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

countdownWrapper();

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
	var canvas = document.createElement('canvas');

	canvas.style.marginLeft = element.pos[0] + 'px';
	canvas.style.marginTop = element.pos[1] + 'px';
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
		console.log(input);
		switch (true) {
			case input.visible == false: // deleting an element
				removeElement(input.id);
				break;
			case input.data &&
				input.data.includes('data:image') &&
				input.visible == true: // new image
				// update the Publication
				Publication.elements.push(input);
				// drop file
				dropElement(input.page, input.data, input.id);
				// add bonus time
				addtime(1000);
				// critic speak
				// critic();
				break;
			case input.data &&
				input.data.includes('data:text/plain') &&
				input.visible == true: // new text
				// update the Publication
				Publication.elements.push(input);
				// drop file
				dropElement(input.page, input.data, input.id);
				break;
			case input.data &&
				!input.data.includes('data:image') &&
				!input.data.includes('data:text/plain'): // neither an image nor text
				notAnImage();
				break;
			case input.move == true: // moving or scaling an image
				var movingElement;
				for (var i = 0; i < Publication.elements.length; i += 1) {
					// find element by id
					if (Publication.elements[i].id == input.id) {
						movingElement = Publication.elements[i]; // read pos and add it to Publication
					}
				}
				movingElement.pos = input.pos;
				break;
		}
	} else if (input && Publication.expired == true) {
		// too late
		LateDropFile();
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

function notAnImage() {
	Sound.error();
	alert('The file you dropped is not an image!');
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

function LateDropFile(src) {
	alert('too late bro');
}

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

// // make pdf
// var element = document.getElementById('p1');
// $('#p1').click(function(){
//  html2pdf(element, {
//    margin:       1,
//    filename:     'myfile.pdf',
//    image:        { type: 'jpeg', quality: 0.98 },
//    html2canvas:  { dpi: 72, letterRendering: true, height: 2970, width: 5100 },
//    jsPDF:        { unit: 'mm', format: 'A4', orientation: 'portrait' }
//  });
// });

// --- ARCHIVE

// $.ajax({
//  url: "http://localhost:28017/test",
//  type: 'get',
//  dataType: 'jsonp',
//  jsonp: 'jsonp', // mongodb is expecting that
//  success: function (data) {
//     console.log('success', data);
//   },
//   error: function (XMLHttpRequest, textStatus, errorThrown) {
//     console.log('error', errorThrown);
//   }
// });

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuaW1hdGVfdGltZWNvdW50ZXIuanMiLCJjb3VudGRvd24uanMiLCJtYWluLmpzIiwidGltZV9mb2xsb3dfbW91c2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBhbmltYXRldGltZWNvdW50ZXIoYm9udXNUaW1lKSB7XG5cdGNvbnNvbGUubG9nKGJvbnVzVGltZSk7XG5cdCQoJyNhbmltYXRldGltZWNvdW50ZXInKS5wcmVwZW5kKFxuXHRcdFwiPHNwYW4gaWQ9J2JvbnVzVGltZSc+XCIgKyBib251c1RpbWUgKyAnPC9zcGFuPidcblx0KTtcblx0Ly8gJCgnI2FuaW1hdGV0aW1lY291bnRlcicpLnNob3coKS5mYWRlT3V0KDEwMDApO1xuXG5cdC8vIGFkZFxuXHQkKCcjYW5pbWF0ZXRpbWVjb3VudGVyJykuYWRkQ2xhc3MoJ2ZhZGVpbm91dCcpO1xuXHQkKCcjY291bnRlcicpLmFkZENsYXNzKCd3aWdnbGUnKTtcblx0Y29uc29sZS5sb2coJ2FkZCcpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdC8vIHJlbW92ZVxuXHRcdGNvbnNvbGUubG9nKCdyZW1vdmUnKTtcblx0XHQkKCcjYW5pbWF0ZXRpbWVjb3VudGVyJykucmVtb3ZlQ2xhc3MoJ2ZhZGVpbm91dCcpO1xuXHRcdCQoJyNjb3VudGVyJykucmVtb3ZlQ2xhc3MoJ3dpZ2dsZScpO1xuXHR9LCAxMDAwKTtcbn1cbiIsImZ1bmN0aW9uIGNvdW50ZG93bldyYXBwZXIoKSB7XG5cdGZ1bmN0aW9uIGxvYWRTb3VuZCgpIHtcblx0XHRjb25zb2xlLmxvZygnbG9hZCBzb3VuZCEnKTtcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKCdhc3NldHMvYXVkaW8vYmVlcC5tcDMnLCAnYmVlcCcpO1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoJ2Fzc2V0cy9hdWRpby9kaW5nLm1wMycsICdkaW5nJyk7XG5cblx0XHQvLyBwcmludGVyIHNvdW5kanNcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFxuXHRcdFx0J2Fzc2V0cy9hdWRpby9wcmludGVyL21hdHJpeC1zaG9ydC53YXYnLFxuXHRcdFx0J3ByaW50ZXItc2hvcnQnXG5cdFx0KTtcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFxuXHRcdFx0J2Fzc2V0cy9hdWRpby9wcmludGVyL21hdHJpeC1sb25nLndhdicsXG5cdFx0XHQncHJpbnRlci1sb25nJ1xuXHRcdCk7XG5cdFx0Y3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcblx0XHRcdCdhc3NldHMvYXVkaW8vcHJpbnRlci9sb2FkX3BhcGVyLndhdicsXG5cdFx0XHQnbG9hZF9wYXBlcidcblx0XHQpO1xuXHR9XG5cblx0bG9hZFNvdW5kKCk7XG5cblx0Ly8gd2hlbiBwYWdlIGlzIHJlYWR5IGRvIHRoaXNcblx0JChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cdFx0JCgnI2NvdW50ZG93bicpLmh0bWwoJ0dldCByZWFkeSEnKS5zaG93KCk7XG5cdFx0Ly8gY291bnRkb3duIHRpbWVyXG5cdFx0ZnVuY3Rpb24gY291bnRkb3duKHN0YXJ0VGltZSkge1xuXHRcdFx0aWYgKHN0YXJ0VGltZSA+PSAxKSB7XG5cdFx0XHRcdGNyZWF0ZWpzLlNvdW5kLnBsYXkoJ3ByaW50ZXItc2hvcnQnKTtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzdGFydFRpbWUgPSBzdGFydFRpbWUgLSAxO1xuXHRcdFx0XHRcdCQoJyNjb3VudGRvd24nKS5odG1sKHN0YXJ0VGltZSk7IC8vIHNldCBjdXJyZW50IHRpbWUgaW4gI2NvdW50ZG93blxuXHRcdFx0XHRcdGNvdW50ZG93bihzdGFydFRpbWUpOyAvLyByZXBlYXQgZnVuY3Rpb25cblx0XHRcdFx0fSwgMTAwMCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKCcjY291bnRkb3duJykuaHRtbCgnc3RhcnQgZ2FtZSEnKTsgLy8gc2V0IHRvIHN0YXJ0IGdhbWUgbWVzc2FnZVxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdC8vIHdhaXQgYSBiaXRcblx0XHRcdFx0XHQkKCcjY291bnRkb3duJykuZmFkZU91dCgxMDAwKTsgLy8gZmFkZSBvdXQgdGhlICNjb3VudGRvd25cblx0XHRcdFx0XHQvLyBUT0RPOiBzdGFydCB0aW1lIVxuXHRcdFx0XHR9LCAyMDApO1xuXHRcdFx0XHRjcmVhdGVqcy5Tb3VuZC5wbGF5KCdkaW5nJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIHN0YXJ0VGltZSA9IDQ7XG5cdFx0Y291bnRkb3duKHN0YXJ0VGltZSk7XG5cdFx0JCgnI2NvdW50ZG93bicpLmh0bWwoc3RhcnRUaW1lKTtcblx0fSk7XG59XG5cbmNvdW50ZG93bldyYXBwZXIoKTtcbiIsIi8vIC0tLSBHTE9CQUxcblxudmFyIHBhZ2VzID0gJCgnLnBhZ2UnKTtcbnZhciBjcml0aWNQb3B1cCA9ICQoJyNjcml0aWMnKTtcbnZhciBkcm9wRGVsYXkgPSAxMDA7XG52YXIgcGRmUmVhZHkgPSBmYWxzZTtcblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcblx0dmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcblx0dmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG5cdHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudChlbGVtZW50KSB7XG5cdGlmIChlbGVtZW50LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSkge1xuXHRcdHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKCc8aW1nPicsIHsgc3JjOiBlbGVtZW50LmRhdGEgfSk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGRlQmFzZWRUZXh0ID0gYXRvYihlbGVtZW50LmRhdGEuc3Vic3RyaW5nKDIzKSk7XG5cdFx0dmFyIGh0bWxCclRleHQgPSBkZUJhc2VkVGV4dC5yZXBsYWNlKC9cXG4vZywgJzxici8+Jyk7XG5cdFx0Y29uc29sZS5sb2coaHRtbEJyVGV4dCk7XG5cdFx0dmFyIHBhZ2VFbGVtZW50Q29udGVudCA9ICQoJzxwPicpLmFwcGVuZChodG1sQnJUZXh0KTsgLy8gcmVtb3ZlIFwiZGF0YTp0ZXh0L3BsYWluO2Jhc2U2NFwiXG5cdH1cblx0dmFyIHBhZ2VFbGVtZW50ID0gJCgnPGRpdj4nLCB7IGNsYXNzOiAncGFnZS1lbGVtZW50IGRyYWdnYWJsZScgfSk7XG5cdHZhciBwYWdlRWxlbWVudENsb3NlID0gJCgnPHNwYW4+JywgeyBjbGFzczogJ2Nsb3NlJyB9KS50ZXh0KCd4Jyk7XG5cdHBhZ2VFbGVtZW50LmFwcGVuZChwYWdlRWxlbWVudENvbnRlbnQsIHBhZ2VFbGVtZW50Q2xvc2UpO1xuXHRwYWdlRWxlbWVudC5hdHRyKCdpZCcsIGVsZW1lbnQuaWQpO1xuXHQkKCcjJyArIGVsZW1lbnQucGFnZSkuYXBwZW5kKHBhZ2VFbGVtZW50KTtcblxuXHRpZiAoZWxlbWVudC5wb3MpIHtcblx0XHQvLyByZWNvbnN0cnVjdGluZyBzYXZlZCBlbGVtZW50XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdG1vZEVsZW1lbnRQb3NpdGlvbihwYWdlRWxlbWVudCwgZWxlbWVudC5wb3MpO1xuXHRcdH0sIDcwMCk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gZHJvcHBpbmcgbmV3IGZpbGVcblx0XHRyZXR1cm4gZ2V0RWxlbWVudFBvc2l0aW9uKHBhZ2VFbGVtZW50KTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50Q2FudmFzKGVsZW1lbnQpIHtcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXG5cdGNhbnZhcy5zdHlsZS5tYXJnaW5MZWZ0ID0gZWxlbWVudC5wb3NbMF0gKyAncHgnO1xuXHRjYW52YXMuc3R5bGUubWFyZ2luVG9wID0gZWxlbWVudC5wb3NbMV0gKyAncHgnO1xuXHRjYW52YXMuc3R5bGUud2lkdGggPSBlbGVtZW50LnBvc1syXSArICdweCc7XG5cdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBlbGVtZW50LnBvc1szXSArICdweCc7XG5cdGNhbnZhcy5zdHlsZS56SW5kZXggPSBlbGVtZW50LnBvc1s0XTtcblxuXHR2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdCQoJyMnICsgZWxlbWVudC5wYWdlKS5hcHBlbmQoY2FudmFzKTtcblxuXHR2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblx0aW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdFx0Y3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0fTtcblx0aW1hZ2Uuc3JjID0gZWxlbWVudC5kYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRFbGVtZW50UG9zaXRpb24oZWxlbWVudCkge1xuXHRyZXR1cm4gKGVsZW1lbnRQb3MgPSBbXG5cdFx0cGFyc2VGbG9hdChlbGVtZW50LmNzcygnbWFyZ2luTGVmdCcpKSxcblx0XHRwYXJzZUZsb2F0KGVsZW1lbnQuY3NzKCdtYXJnaW5Ub3AnKSksXG5cdFx0ZWxlbWVudC53aWR0aCgpLFxuXHRcdGVsZW1lbnQuaGVpZ2h0KCksXG5cdFx0cGFyc2VJbnQoZWxlbWVudC5jc3MoJ3otaW5kZXgnKSkgLy8gVE9ETyByb3RhdGlvbiBtYXliZVxuXHRdKTtcbn1cblxuZnVuY3Rpb24gbW9kRWxlbWVudFBvc2l0aW9uKHBhZ2VFbGVtZW50LCBuZXdQb3MpIHtcblx0cGFnZUVsZW1lbnQuY3NzKHsgJ21hcmdpbi1sZWZ0JzogbmV3UG9zWzBdICsgJ3B4JyB9KTtcblx0cGFnZUVsZW1lbnQuY3NzKHsgJ21hcmdpbi10b3AnOiBuZXdQb3NbMV0gKyAncHgnIH0pO1xuXHRwYWdlRWxlbWVudC53aWR0aChuZXdQb3NbMl0pO1xuXHRwYWdlRWxlbWVudC5oZWlnaHQobmV3UG9zWzNdKTtcblx0cGFnZUVsZW1lbnQuY3NzKHsgJ3otaW5kZXgnOiBuZXdQb3NbNF0gfSk7XG59XG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG5cdC8vIGFsbCBvdXIgc3RhdGVzXG5cdGlkOiBtYWtlSWQoKSxcblx0dGl0bGU6ICdURVNUIFBVQicsXG5cdHRpbWVMZWZ0OiA5MDAwMDAwLFxuXHRleHBpcmVkOiBmYWxzZSxcblx0ZWxlbWVudHM6IFtdLFxuXHRhdXRob3JzOiBbXVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihQdWJsaWNhdGlvbiwgaW5wdXQpIHtcblx0Ly8gZXhwaXJlZD9cblx0aWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkge1xuXHRcdC8vIGV4cGlyZWRcblx0XHRzaG93VGltZShQdWJsaWNhdGlvbik7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gbm90IGV4cGlyZWRcblx0XHRQdWJsaWNhdGlvbi5leHBpcmVkID0gdHJ1ZTtcblx0XHRzaG93RXhwaXJlZChQdWJsaWNhdGlvbik7XG5cdFx0bm9EcmFnKCk7XG5cdFx0c2hvd1NhdmVNb2RhbCgpO1xuXHR9XG5cblx0aWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gZmFsc2UpIHtcblx0XHRjb25zb2xlLmxvZyhpbnB1dCk7XG5cdFx0c3dpdGNoICh0cnVlKSB7XG5cdFx0XHRjYXNlIGlucHV0LnZpc2libGUgPT0gZmFsc2U6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcblx0XHRcdFx0cmVtb3ZlRWxlbWVudChpbnB1dC5pZCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyBpbWFnZVxuXHRcdFx0XHQvLyB1cGRhdGUgdGhlIFB1YmxpY2F0aW9uXG5cdFx0XHRcdFB1YmxpY2F0aW9uLmVsZW1lbnRzLnB1c2goaW5wdXQpO1xuXHRcdFx0XHQvLyBkcm9wIGZpbGVcblx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQuaWQpO1xuXHRcdFx0XHQvLyBhZGQgYm9udXMgdGltZVxuXHRcdFx0XHRhZGR0aW1lKDEwMDApO1xuXHRcdFx0XHQvLyBjcml0aWMgc3BlYWtcblx0XHRcdFx0Ly8gY3JpdGljKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IHRleHRcblx0XHRcdFx0Ly8gdXBkYXRlIHRoZSBQdWJsaWNhdGlvblxuXHRcdFx0XHRQdWJsaWNhdGlvbi5lbGVtZW50cy5wdXNoKGlucHV0KTtcblx0XHRcdFx0Ly8gZHJvcCBmaWxlXG5cdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0LmlkKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJyk6IC8vIG5laXRoZXIgYW4gaW1hZ2Ugbm9yIHRleHRcblx0XHRcdFx0bm90QW5JbWFnZSgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgaW5wdXQubW92ZSA9PSB0cnVlOiAvLyBtb3Zpbmcgb3Igc2NhbGluZyBhbiBpbWFnZVxuXHRcdFx0XHR2YXIgbW92aW5nRWxlbWVudDtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBQdWJsaWNhdGlvbi5lbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdC8vIGZpbmQgZWxlbWVudCBieSBpZFxuXHRcdFx0XHRcdGlmIChQdWJsaWNhdGlvbi5lbGVtZW50c1tpXS5pZCA9PSBpbnB1dC5pZCkge1xuXHRcdFx0XHRcdFx0bW92aW5nRWxlbWVudCA9IFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldOyAvLyByZWFkIHBvcyBhbmQgYWRkIGl0IHRvIFB1YmxpY2F0aW9uXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdG1vdmluZ0VsZW1lbnQucG9zID0gaW5wdXQucG9zO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH0gZWxzZSBpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSB0cnVlKSB7XG5cdFx0Ly8gdG9vIGxhdGVcblx0XHRMYXRlRHJvcEZpbGUoKTtcblx0fVxufVxuXG4vLyAtLS0gQ09OVFJPTExFUlxuXG52YXIgeDtcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHRpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA8IDApIHtcblx0XHQvLyBpZiBub3QgYSBzYXZlZCBwdWJsaWNhdGlvblxuXHRcdHggPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgLSAxMDtcblx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24pO1xuXHRcdH0sIDEwKTtcblxuXHRcdG1vdXNlQ291bnRlcigpO1xuXHR9IGVsc2Uge1xuXHRcdHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKTtcblx0XHRub0RyYWcoKTtcblx0XHRwZGZEb3dubG9hZCgpO1xuXHR9XG59KTtcblxuZnVuY3Rpb24gYWRkdGltZShib251c1RpbWUpIHtcblx0UHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCArIGJvbnVzVGltZTtcblx0YW5pbWF0ZXRpbWVjb3VudGVyKGJvbnVzVGltZSk7XG59XG5cbi8vIGRyb3BGaWxlXG5cbnBhZ2VzLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHQkKHRoaXMpLmFkZENsYXNzKCdkcmFnb3ZlcicpO1xufSk7XG5wYWdlcy5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xuXHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdGNvbnNvbGUubG9nKGUpO1xuXHR2YXIgZmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzO1xuXHR2YXIgeSA9IDA7XG5cdGZvciAodmFyIGkgPSBmaWxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0dmFyIHBhZ2VJZCA9ICQodGhpcykuYXR0cignaWQnKTtcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG5cdFx0XHQvLyBpZCwgZGF0YSwgW3BvcyB4LCBwb3MgeSwgd2lkdGgsIGhlaWdodCwgei1pbmRleCwgKHJvdGF0aW9uPyldLCB2aXNpYmxlLCBwYWdlXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0XHRcdFx0aWQ6IG1ha2VJZCgpLFxuXHRcdFx0XHRcdGRhdGE6IGV2ZW50LnRhcmdldC5yZXN1bHQsXG5cdFx0XHRcdFx0cG9zOiBbMCwgMCwgMCwgMCwgMF0sXG5cdFx0XHRcdFx0dmlzaWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRwYWdlOiBwYWdlSWRcblx0XHRcdFx0fSk7XG5cdFx0XHR9LCB5ICogZHJvcERlbGF5KTtcblx0XHRcdHkgKz0gMTtcblx0XHR9O1xuXHRcdGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcblx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0U291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudFxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jbG9zZScsIGZ1bmN0aW9uKCkge1xuXHR2YXIgcGFnZUlkID0gJCh0aGlzKVxuXHRcdC5jbG9zZXN0KCcucGFnZScpXG5cdFx0LmF0dHIoJ2lkJyk7XG5cdHZhciBlbGVtZW50SWQgPSAkKHRoaXMpXG5cdFx0LnBhcmVudCgpXG5cdFx0LmF0dHIoJ2lkJyk7XG5cdHZhciBlbGVtZW50RGF0YSA9ICQodGhpcylcblx0XHQuc2libGluZ3MoKVxuXHRcdC5hdHRyKCdzcmMnKTtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdGlkOiBlbGVtZW50SWQsXG5cdFx0ZGF0YTogZWxlbWVudERhdGEsXG5cdFx0cG9zOiBbMCwgMCwgMCwgMCwgMF0sXG5cdFx0dmlzaWJsZTogZmFsc2UsXG5cdFx0cGFnZTogcGFnZUlkXG5cdH0pO1xufSk7XG5cbi8vIC0tLSBWSUVXXG5cbnZhciBTb3VuZCA9IHtcblx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2luY29ycmVjdC5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH0sXG5cdGRpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9XG59O1xuXG4vLyBtZXJnZSB0aGVzZSB0d29cbmZ1bmN0aW9uIHNob3dUaW1lKFB1YmxpY2F0aW9uKSB7XG5cdHNlY29uZHMgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDEwMDA7XG5cdCQoJyNjb3VudGVyJykuc2hvdygpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLmlubmVySFRNTCA9XG5cdFx0c2Vjb25kcy50b0ZpeGVkKDIpICsgJyBzZWNvbmRzIGxlZnQhJztcbn1cbmZ1bmN0aW9uIG1vdXNlQ291bnRlcigpIHtcblx0JChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXHRcdGlmIChlLnBhZ2VYID49ICQoZG9jdW1lbnQpLndpZHRoKCkgLyAyKSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCArIDIwLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID0gJ2V4cGlyZWQhJztcblx0JCgnYm9keScpLmFkZENsYXNzKCdleHBpcmVkJyk7XG5cdC8vc2V0VGltZW91dChmdW5jdGlvbigpe1xuXHQvLyAgd2luZG93LnByaW50KCk7XG5cdC8vfSwgMTAwMCk7XG5cdGNsZWFySW50ZXJ2YWwoeCk7XG59XG5cbmZ1bmN0aW9uIG5vdEFuSW1hZ2UoKSB7XG5cdFNvdW5kLmVycm9yKCk7XG5cdGFsZXJ0KCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyBub3QgYW4gaW1hZ2UhJyk7XG59XG5cbmZ1bmN0aW9uIGRyb3BFbGVtZW50KHBhZ2VJZCwgZGF0YSwgaWQpIHtcblx0dmFyIGVsZW1lbnQgPSB7IGlkOiBpZCwgZGF0YTogZGF0YSwgcGFnZTogcGFnZUlkIH07XG5cdHZhciBlbGVtZW50UG9zID0gY3JlYXRlRWxlbWVudChlbGVtZW50KTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHQvLyB0aW1lb3V0IHRvIGdldCB0aGUgYWN0dWFsIGhlaWdodCA6KFxuXHRcdGVsZW1lbnRQb3NbM10gPSAkKCcjJyArIGlkKS5oZWlnaHQoKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IFB1YmxpY2F0aW9uLmVsZW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHQvLyBmaW5kIGVsZW1lbnQgYnkgaWRcblx0XHRcdGlmIChQdWJsaWNhdGlvbi5lbGVtZW50c1tpXS5pZCA9PSBpZCkge1xuXHRcdFx0XHRQdWJsaWNhdGlvbi5lbGVtZW50c1tpXS5wb3MgPSBlbGVtZW50UG9zOyAvLyByZWFkIHBvcyBhbmQgYWRkIGl0IHRvIFB1YmxpY2F0aW9uXG5cdFx0XHR9XG5cdFx0fVxuXHRcdFNvdW5kLmRpbmcoKTtcblx0fSwgMSk7XG59XG5cbmZ1bmN0aW9uIExhdGVEcm9wRmlsZShzcmMpIHtcblx0YWxlcnQoJ3RvbyBsYXRlIGJybycpO1xufVxuXG5mdW5jdGlvbiBub0RyYWcoKSB7XG5cdHZhciBlbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kcmFnZ2FibGUnKTtcblx0W10uZm9yRWFjaC5jYWxsKGVsZW1zLCBmdW5jdGlvbihlbCkge1xuXHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdnYWJsZScpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gY3JpdGljKCkge1xuXHRjcml0aWNQb3B1cC5pbm5lckhUTUwgPSAnTWFrZSB0aGlzIGltYWdlIGJpZ2dlciBwbHMhJztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRWxlbWVudChpZCkge1xuXHQkKCcjJyArIGlkKS5oaWRlKCk7XG5cdGNvbnNvbGUubG9nKGlkKTtcbn1cblxuaW50ZXJhY3QoJy5kcmFnZ2FibGUnKVxuXHQuZHJhZ2dhYmxlKHtcblx0XHRvbm1vdmU6IHdpbmRvdy5kcmFnTW92ZUxpc3RlbmVyLFxuXHRcdHJlc3RyaWN0OiB7XG5cdFx0XHRyZXN0cmljdGlvbjogJ3BhcmVudCcsXG5cdFx0XHRlbGVtZW50UmVjdDoge1xuXHRcdFx0XHR0b3A6IDAsXG5cdFx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRcdGJvdHRvbTogMSxcblx0XHRcdFx0cmlnaHQ6IDFcblx0XHRcdH1cblx0XHR9XG5cdH0pXG5cdC5yZXNpemFibGUoe1xuXHRcdC8vIHJlc2l6ZSBmcm9tIGFsbCBlZGdlcyBhbmQgY29ybmVyc1xuXHRcdGVkZ2VzOiB7XG5cdFx0XHRsZWZ0OiB0cnVlLFxuXHRcdFx0cmlnaHQ6IHRydWUsXG5cdFx0XHRib3R0b206IHRydWUsXG5cdFx0XHR0b3A6IHRydWVcblx0XHR9LFxuXG5cdFx0Ly8ga2VlcCB0aGUgZWRnZXMgaW5zaWRlIHRoZSBwYXJlbnRcblx0XHRyZXN0cmljdEVkZ2VzOiB7XG5cdFx0XHRvdXRlcjogJ3BhcmVudCcsXG5cdFx0XHRlbmRPbmx5OiB0cnVlXG5cdFx0fSxcblxuXHRcdGluZXJ0aWE6IHRydWVcblx0fSlcblx0Lm9uKCdyZXNpemVtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdFx0eCA9IHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDAsXG5cdFx0XHR5ID0gcGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXknKSkgfHwgMDtcblxuXHRcdC8vIHVwZGF0ZSB0aGUgZWxlbWVudCdzIHN0eWxlXG5cdFx0dGFyZ2V0LnN0eWxlLndpZHRoID0gZXZlbnQucmVjdC53aWR0aCArICdweCc7XG5cdFx0dGFyZ2V0LnN0eWxlLmhlaWdodCA9IGV2ZW50LnJlY3QuaGVpZ2h0ICsgJ3B4JztcblxuXHRcdC8vIHRyYW5zbGF0ZSB3aGVuIHJlc2l6aW5nIGZyb20gdG9wIG9yIGxlZnQgZWRnZXNcblx0XHR4ICs9IGV2ZW50LmRlbHRhUmVjdC5sZWZ0O1xuXHRcdHkgKz0gZXZlbnQuZGVsdGFSZWN0LnRvcDtcblxuXHRcdHRhcmdldC5zdHlsZS5tYXJnaW5MZWZ0ID0geCArICdweCc7XG5cdFx0dGFyZ2V0LnN0eWxlLm1hcmdpblRvcCA9IHkgKyAncHgnO1xuXG5cdFx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG5cdFx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG5cblx0XHR2YXIgcGFnZUVsZW1lbnRQb3MgPSBnZXRFbGVtZW50UG9zaXRpb24oJCgnIycgKyB0YXJnZXQuaWQpKTtcblx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IGlkOiB0YXJnZXQuaWQsIHBvczogcGFnZUVsZW1lbnRQb3MsIG1vdmU6IHRydWUgfSk7IC8vIHNlbmRpbmcgZWxlbWVudCBpZCBhbmQgcG9zaXRpb25cblx0fSk7XG5cbmZ1bmN0aW9uIGRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpIHtcblx0dmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcblx0XHQvLyBrZWVwIHRoZSBkcmFnZ2VkIHBvc2l0aW9uIGluIHRoZSBkYXRhLXgvZGF0YS15IGF0dHJpYnV0ZXNcblx0XHR4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDApICsgZXZlbnQuZHgsXG5cdFx0eSA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwKSArIGV2ZW50LmR5O1xuXG5cdC8vIHRyYW5zbGF0ZSB0aGUgZWxlbWVudFxuXHR0YXJnZXQuc3R5bGUubWFyZ2luTGVmdCA9IHggKyAncHgnO1xuXHR0YXJnZXQuc3R5bGUubWFyZ2luVG9wID0geSArICdweCc7XG5cblx0Ly8gdXBkYXRlIHRoZSBwb3NpaW9uIGF0dHJpYnV0ZXNcblx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG5cdHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteScsIHkpO1xuXG5cdC8vIHVwZGF0ZSB6LWluZGV4XG5cdHZhciBtYXh6SW5kZXggPSAwLFxuXHRcdGkgPSAwO1xuXHRwYWdlRWxlbWVudHMgPSAkKCcjJyArIHRhcmdldC5pZClcblx0XHQucGFyZW50KClcblx0XHQuY2hpbGRyZW4oKTtcblx0cGFnZUVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0aSArPSAxO1xuXHRcdGlmICgkKHRoaXMpLmNzcygnei1pbmRleCcpID49IG1heHpJbmRleCkge1xuXHRcdFx0bWF4ekluZGV4ID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ3otaW5kZXgnKSk7XG5cdFx0fVxuXHRcdGlmIChpID09IHBhZ2VFbGVtZW50cy5sZW5ndGgpIHtcblx0XHRcdGlmICgodGFyZ2V0LnN0eWxlLnpJbmRleCAhPSBtYXh6SW5kZXgpIHwgKHRhcmdldC5zdHlsZS56SW5kZXggPT0gMCkpIHtcblx0XHRcdFx0dGFyZ2V0LnN0eWxlLnpJbmRleCA9IG1heHpJbmRleCArIDE7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblx0Ly8gdGFyZ2V0LnN0eWxlLnpJbmRleCA9IG1heHpJbmRleCArIDE7XG5cblx0dmFyIHBhZ2VFbGVtZW50UG9zID0gZ2V0RWxlbWVudFBvc2l0aW9uKCQoJyMnICsgdGFyZ2V0LmlkKSk7XG5cdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgaWQ6IHRhcmdldC5pZCwgcG9zOiBwYWdlRWxlbWVudFBvcywgbW92ZTogdHJ1ZSB9KTsgLy8gc2VuZGluZyBlbGVtZW50IGlkIGFuZCBwb3NpdGlvblxufVxuXG4vLyB0aGlzIGlzIHVzZWQgbGF0ZXIgaW4gdGhlIHJlc2l6aW5nIGFuZCBnZXN0dXJlIGRlbW9zXG53aW5kb3cuZHJhZ01vdmVMaXN0ZW5lciA9IGRyYWdNb3ZlTGlzdGVuZXI7XG5cbi8vIHNob3cgc2F2ZSBtb2RhbFxuXG5mdW5jdGlvbiBzaG93U2F2ZU1vZGFsKCkge1xuXHQkKCcjc2F2ZS1tb2RhbCcpLnNob3coKTtcblx0JCgnI3NhdmUnKS5jbGljayhmdW5jdGlvbigpIHtcblx0XHRzYXZldG9EYihQdWJsaWNhdGlvbik7XG5cdFx0bWFrZVBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Z2VuUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRjaGVja1BkZihQdWJsaWNhdGlvbi5pZCk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBnZW5QZGYoaWQpIHtcblx0JCgnI3NhdmUtbW9kYWwnKS5zaG93KCk7XG5cdCQoJyNzYXZlLW1vZGFsJykuaHRtbCgnJyk7XG5cdHZhciB5ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHBkZlJlYWR5ID09IHRydWUpIHtcblx0XHRcdCQoJyNzYXZlLW1vZGFsJykuaHRtbChcblx0XHRcdFx0J0Rvd25sb2FkIHlvdXIgcGRmIDxhIGhyZWY9XCJhc3NldHMvcGRmLycgK1xuXHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHQnLycgK1xuXHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHQnLnBkZj9kb3dubG9hZD10cnVlXCI+aGVyZTwvYT4nXG5cdFx0XHQpO1xuXHRcdFx0Y2xlYXJJbnRlcnZhbCh5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnI3NhdmUtbW9kYWwnKS50ZXh0KCdZb3VyIFBERiBpcyBiZWluZyBnZW5lcmF0ZWQnKTtcblx0XHR9XG5cdH0sIDEwMCk7XG59XG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbikge1xuXHR2YXIgaTtcblx0Zm9yIChpID0gMDsgaSA8IFB1YmxpY2F0aW9uLmVsZW1lbnRzLmxlbmd0aDsgKytpKSB7XG5cdFx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3ByaW50PXRydWUnKSA+IDApIHtcblx0XHRcdGNyZWF0ZUVsZW1lbnRDYW52YXMoUHVibGljYXRpb24uZWxlbWVudHNbaV0pO1xuXHRcdFx0Y29uc29sZS5sb2coJ3ByaW50IHB1YicpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjcmVhdGVFbGVtZW50KFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldKTtcblx0XHRcdGNvbnNvbGUubG9nKCdzYXZlZCBwdWInKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcGRmRG93bmxvYWQoKSB7XG5cdCQoJyNwZGYtZG93bmxvYWQnKS5zaG93KCk7XG5cdCQoJyNwZGYtZG93bmxvYWQnKS5jbGljayhmdW5jdGlvbigpIHtcblx0XHRtYWtlUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRnZW5QZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdGNoZWNrUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0fSk7XG59XG5cbi8vIC0tLSBCQUNLRU5EXG5cbi8vIHNlbmQgY2FsbCB0byBzZXJ2ZXIgdG8gbWFrZSBwZGZcbmZ1bmN0aW9uIG1ha2VQZGYoaWQpIHtcblx0JC5nZXQoJy9wZGY/aWQ9JyArIGlkLCBmdW5jdGlvbihkYXRhKSB7XG5cdFx0Y29uc29sZS5sb2coJ1NlbnQgY2FsbCB0byBtYWtlIFBERi4nKTtcblx0fSk7XG59XG5cbi8vIGNoZWNrIGlmIHBkZiBleGlzdHMgYW5kIHJlZGlyZWN0IHRvIGZpbGVcbmZ1bmN0aW9uIGNoZWNrUGRmKGlkKSB7XG5cdHZhciB5ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0JC5hamF4KHtcblx0XHRcdHR5cGU6ICdIRUFEJyxcblx0XHRcdHVybDogJ2Fzc2V0cy9wZGYvJyArIGlkICsgJy8nICsgaWQgKyAnLnBkZicsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihtc2cpIHtcblx0XHRcdFx0Y2xlYXJJbnRlcnZhbCh5KTtcblx0XHRcdFx0cGRmUmVhZHkgPSB0cnVlO1xuXHRcdFx0fSxcblx0XHRcdGVycm9yOiBmdW5jdGlvbihqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coanFYSFIpO1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sIDEwMCk7XG59XG5cbmZ1bmN0aW9uIHNhdmV0b0RiKHB1YmxpY2F0aW9uKSB7XG5cdCQuYWpheCh7XG5cdFx0dXJsOiAnL2RiJyxcblx0XHR0eXBlOiAncG9zdCcsIC8vIHBlcmZvcm1pbmcgYSBQT1NUIHJlcXVlc3Rcblx0XHRkYXRhOiBwdWJsaWNhdGlvbixcblx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHB1YmxpY2F0aW9uKSB7XG5cdFx0XHRjb25zb2xlLmxvZygncHVibGljYXRpb24gc2VudCB0byBkYXRhYmFzZS4nKTtcblx0XHR9XG5cdH0pO1xufVxuXG4vLyAvLyBtYWtlIHBkZlxuLy8gdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncDEnKTtcbi8vICQoJyNwMScpLmNsaWNrKGZ1bmN0aW9uKCl7XG4vLyAgaHRtbDJwZGYoZWxlbWVudCwge1xuLy8gICAgbWFyZ2luOiAgICAgICAxLFxuLy8gICAgZmlsZW5hbWU6ICAgICAnbXlmaWxlLnBkZicsXG4vLyAgICBpbWFnZTogICAgICAgIHsgdHlwZTogJ2pwZWcnLCBxdWFsaXR5OiAwLjk4IH0sXG4vLyAgICBodG1sMmNhbnZhczogIHsgZHBpOiA3MiwgbGV0dGVyUmVuZGVyaW5nOiB0cnVlLCBoZWlnaHQ6IDI5NzAsIHdpZHRoOiA1MTAwIH0sXG4vLyAgICBqc1BERjogICAgICAgIHsgdW5pdDogJ21tJywgZm9ybWF0OiAnQTQnLCBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyB9XG4vLyAgfSk7XG4vLyB9KTtcblxuLy8gLS0tIEFSQ0hJVkVcblxuLy8gJC5hamF4KHtcbi8vICB1cmw6IFwiaHR0cDovL2xvY2FsaG9zdDoyODAxNy90ZXN0XCIsXG4vLyAgdHlwZTogJ2dldCcsXG4vLyAgZGF0YVR5cGU6ICdqc29ucCcsXG4vLyAganNvbnA6ICdqc29ucCcsIC8vIG1vbmdvZGIgaXMgZXhwZWN0aW5nIHRoYXRcbi8vICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xuLy8gICAgIGNvbnNvbGUubG9nKCdzdWNjZXNzJywgZGF0YSk7XG4vLyAgIH0sXG4vLyAgIGVycm9yOiBmdW5jdGlvbiAoWE1MSHR0cFJlcXVlc3QsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4vLyAgICAgY29uc29sZS5sb2coJ2Vycm9yJywgZXJyb3JUaHJvd24pO1xuLy8gICB9XG4vLyB9KTtcbiIsIi8vICNjb3VudGVyIGZvbGxvd3MgdGhlIG1vdXNlXG5mdW5jdGlvbiB1cGRhdGVNb3VzZUNvdW50ZXIoZSkge1xuICBpZiAoZS5jbGllbnRYID49IDIwMCkgeyAvLyAoJChkb2N1bWVudCkud2lkdGgoKS8yKVxuICAgIC8vIGlmIG1vdXNlIG9mIHJpZ2h0IHNpZGUgb2YgY2xpZW50XG4gICAgJCgnLmNvdW50ZXInKS5hZGRDbGFzcygnbW91c2VfcmlnaHQnKTtcbiAgICAkKCcuY291bnRlcicpLmNzcyh7XG4gICAgICBsZWZ0OiAgZS5jbGllbnRYIC0gMjAgLSAkKCcuY291bnRlcicpLndpZHRoKCksXG4gICAgICB0b3A6ICAgZS5jbGllbnRZIC0gNTBcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgY2xpZW50XG4gICAgJCgnLmNvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcbiAgICAkKCcuY291bnRlcicpLmNzcyh7XG4gICAgICBsZWZ0OiAgZS5jbGllbnRYICsgMjAsXG4gICAgICB0b3A6ICAgZS5jbGllbnRZIC0gNTBcbiAgICB9KTtcbiAgfVxufVxuXG4kKGRvY3VtZW50KS5iaW5kKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKXtcbiAgdXBkYXRlTW91c2VDb3VudGVyKGUpO1xufSk7XG5cbiQoZG9jdW1lbnQpLmJpbmQoXCJkcmFnb3ZlclwiLCBmdW5jdGlvbihlKXtcbiAgICB1cGRhdGVNb3VzZUNvdW50ZXIoZSk7XG59KTtcbiJdfQ==
