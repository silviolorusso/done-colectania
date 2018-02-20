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
};

function createElement(element, callback) {
	if (element.data.includes('data:image')) {
		fabric.Image.fromURL(element.data, function(myImg, callback) {
 			var img = myImg.set({ left: 0, top: 0, width: myImg.width, height: myImg.height});
 			if ( img.width > canvases[element.page].width ) {
 				img.scaleToWidth(canvases[element.page].width / 100 * 70 ); // 70% of the canvas
 			}
 			img.on('added', function() {
 				callback;
 			});
 			canvases[element.page].add(img)
		});
	} else {
		var deBasedText = atob(element.data.substring(23));
		canvases[element.page].add(new fabric.Text(deBasedText, {
  		fontFamily: 'Arial',
  		left: 0,
  		top: 0,
  		fontSize: 15
		}));
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
		canvases['p' + (i + 1)] = canvas;
	});
	var insertTitle = new fabric.Textbox('Insert Title Here', {
	  top: 120,
	  fontFamily: 'AGaramondPro, serif',
	  fill: '#777',
	  lineHeight: 1.1,
	  fontSize: 30,
	  fontWeight: 'bold',
	  textAlign: 'center',
	  width: canvases['p1'].width,
	  selectable: false,
	  hoverCursor: 'default'
	});
	canvases['p1'].add(insertTitle)
	var lineLenght = 250
	canvases['p1'].add(new fabric.Line([0, 0, lineLenght, 0], {
		left: ( canvases['p1'].width - lineLenght) / 2,
	  top: 160,
	  stroke: '#222',
	  selectable: false
	}));
	var insertAuthors = new fabric.Textbox('Insert Authors Here', {
	  top: 180,
	  fontFamily: 'AGaramondPro, serif',
	  fill: '#777',
	  lineHeight: 1.1,
	  fontSize: 20,
	  textAlign: 'center',
	  width: canvases['p1'].width,
	  selectable: false,
	  hoverCursor: 'default'
	});
	canvases['p1'].add(insertAuthors)
	// TODO: on click, text is deleted
}





// --- M-V-C

var Publication = {
	// all our states
	id: makeId(),
	title: 'TEST PUB',
	timeLeft: 9000000,
	expired: false,
	authors: [],
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
		showTime(Publication); // expired
	} else {
		Publication.expired = true;
		showExpired(Publication);
		lockElements()
		// showSaveModal();
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
					dropElement(input.page, input.data, publicationUpdate(input.page)); // drop element
					addtime(1000) // add bonus time
					criticSays();


					// criticSays('dance dance', 'cat');
					// or
					// criticSays('dance dance');
					// or
					// criticSays();


					break
			case input.data &&
				input.data.includes('data:text/plain') &&
				input.visible == true: // new text

					var publicationUpdate = function(inputPage) { // update canvas
						setTimeout(function() {
							Publication.pages[inputPage] = canvases[inputPage].toJSON() // settimeout otherwise it doesn't get the element
						}, 1)
					}
					dropElement(input.page, input.data, publicationUpdate(input.page)); // drop element
					addtime(1000) // add bonus time

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
			Publication.timeLeft = getUrlParameter('time');
		}
		x = setInterval(function() {
			Publication.timeLeft = Publication.timeLeft - 10;
			controller(Publication);
		}, 10);

		mouseCounter()
	} else { // saved publication
		renderPublication(Publication)
		pdfDownload()
		$('body').addClass('saved')
	}
});

function addtime(bonusTime) {
	Publication.timeLeft = Publication.timeLeft + bonusTime;
	animatetimecounter(bonusTime);
}

// modify element
function onModElement() {
	for (var pageId in canvases) {
		canvases[ pageId ].on('object:modified', function(evt) {
			var parentCanvasId = evt.target.canvas.lowerCanvasEl.id
			controller(Publication, { move: true, page: parentCanvasId})
		})
	}
}

// drop element
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
		var pageId = $(this).find('canvas').attr('id');
		reader.onload = function(event) {
			console.log(event.target);
			setTimeout(function() {
				controller(Publication, {
					data: event.target.result,
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

	expiredTime();
	setTimeout(function () {
		$('.wrapper').addClass('saved_view');
		savedState();
	}, 500);
	// anchorkey
	//setTimeout(function(){
	//  window.print();
	//}, 1000);
	// animateUp($('#save-modal'));
	clearInterval(x);
}

function dropElement(pageId, data, id, callback) {
	var element = { data: data, page: pageId };
	var elementPos = createElement(element, callback);
	Sound.ding();
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

// lock elements
function lockElements() {
	for (var pageId in canvases) {
		canvases[pageId].selection = false;
		for (objectId in canvases[pageId].getObjects() ) {
			var object = canvases[pageId].item(objectId)
			object.selectable = false
			object.hoverCursor = 'default'
		}
	}
}

// TODO: CONVERT TO FABRIC
function removeElement(id) {
	$('#' + id).hide();
	console.log(id);
}

// show save modal

function showSaveModal() {
	$('#save-modal').show();
	$('#save').click(function() {
		savetoDb(Publication);
		// makePdf(Publication.id);
		genPdf(Publication.id);
		// checkPdf(Publication.id);
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
					'.pdf?download=true" target="_blank">here</a> and printable pdf booklet <a href="assets/pdf/' +
					id +
					'/' +
					id +
					'-booklet.pdf?download=true" target="_blank">here</a>.' // add "on click close save modal"
			);
			clearInterval(y);
		} else {
			// $('#save-modal').html('Your Publication is being generated<span id="loading_dots">...</span><div id="loader"><div id="loadingbar"></div></div>');
			$('#save-modal').html('Your Publication (<a href="http://localhost:3000/pdf?id=' + Publication.id + '" target="_blank">download</a>) is being generated<span id="loading_dots">...</span><div id="spinner"><div id="animation"></div><img src="assets/img/printer.png"></div>');
		}
	}, 100);
}

// --- SAVED

function renderPublication(Publication) {
	canvases['p1'].clear(); // clear title

	for (var canvasId in canvases) {
		var json = JSON.stringify(Publication.pages[canvasId]);
		canvases[canvasId].loadFromJSON( json, function() {
			canvases[canvasId].renderAll.bind(canvases[canvasId])
			lockElements()
		})
	}

}

function pdfDownload() {
	$('#pdf-download').show();
	$('#pdf-download').click(function() {
		// makePdf(Publication.id);
		genPdf(Publication.id);
		// checkPdf(Publication.id);
	});
}






// --- BACKEND

// // send call to server to make pdf
// function makePdf(id) {
// 	$.get('/pdf?id=' + id, function(data) {
// 		console.log('Sent call to make PDF.');
// 	});
// }

// // check if pdf exists and redirect to file
// function checkPdf(id) {
// 	var y = setInterval(function() {
// 		$.ajax({
// 			type: 'HEAD',
// 			url: 'assets/pdf/' + id + '/' + id + '-booklet.pdf', // check the booklet
// 			success: function(msg) {
// 				clearInterval(y);
// 				pdfReady = true;
// 			},
// 			error: function(jqXHR, textStatus, error) {
// 				console.log(jqXHR);
// 				console.log(error);
// 			}
// 		});
// 	}, 100);
// }

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBHTE9CQUxcblxudmFyIHBhZ2VzID0gJCgnLnBhZ2UnKTtcbnZhciBjcml0aWNQb3B1cCA9ICQoJyNjcml0aWMnKTtcbnZhciBkcm9wRGVsYXkgPSAxMDA7XG52YXIgcGRmUmVhZHkgPSBmYWxzZTtcblxuXG5cblxuXG4vLyAtLS0gR0VORVJBTCBGVU5DVElPTlNcblxuZnVuY3Rpb24gbWFrZUlkKCkge1xuXHR2YXIgcmFuZExldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNikpO1xuXHR2YXIgaWQgPSByYW5kTGV0dGVyICsgRGF0ZS5ub3coKTtcblx0cmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBieXRlQ291bnQocykge1xuICAgIHJldHVybiBlbmNvZGVVUkkocykuc3BsaXQoLyUuLnwuLykubGVuZ3RoIC0gMTtcbn1cblxudmFyIGdldFVybFBhcmFtZXRlciA9IGZ1bmN0aW9uIGdldFVybFBhcmFtZXRlcihzUGFyYW0pIHtcbiAgdmFyIHNQYWdlVVJMID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKSxcbiAgICBzVVJMVmFyaWFibGVzID0gc1BhZ2VVUkwuc3BsaXQoJyYnKSxcbiAgICBzUGFyYW1ldGVyTmFtZSxcbiAgICBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBzVVJMVmFyaWFibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgc1BhcmFtZXRlck5hbWUgPSBzVVJMVmFyaWFibGVzW2ldLnNwbGl0KCc9Jyk7XG5cbiAgICBpZiAoc1BhcmFtZXRlck5hbWVbMF0gPT09IHNQYXJhbSkge1xuICAgICAgICByZXR1cm4gc1BhcmFtZXRlck5hbWVbMV0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBzUGFyYW1ldGVyTmFtZVsxXTtcbiAgICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgY2FsbGJhY2spIHtcblx0aWYgKGVsZW1lbnQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpKSB7XG5cdFx0ZmFicmljLkltYWdlLmZyb21VUkwoZWxlbWVudC5kYXRhLCBmdW5jdGlvbihteUltZywgY2FsbGJhY2spIHtcbiBcdFx0XHR2YXIgaW1nID0gbXlJbWcuc2V0KHsgbGVmdDogMCwgdG9wOiAwLCB3aWR0aDogbXlJbWcud2lkdGgsIGhlaWdodDogbXlJbWcuaGVpZ2h0fSk7XG4gXHRcdFx0aWYgKCBpbWcud2lkdGggPiBjYW52YXNlc1tlbGVtZW50LnBhZ2VdLndpZHRoICkge1xuIFx0XHRcdFx0aW1nLnNjYWxlVG9XaWR0aChjYW52YXNlc1tlbGVtZW50LnBhZ2VdLndpZHRoIC8gMTAwICogNzAgKTsgLy8gNzAlIG9mIHRoZSBjYW52YXNcbiBcdFx0XHR9XG4gXHRcdFx0aW1nLm9uKCdhZGRlZCcsIGZ1bmN0aW9uKCkge1xuIFx0XHRcdFx0Y2FsbGJhY2s7XG4gXHRcdFx0fSk7XG4gXHRcdFx0Y2FudmFzZXNbZWxlbWVudC5wYWdlXS5hZGQoaW1nKVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBkZUJhc2VkVGV4dCA9IGF0b2IoZWxlbWVudC5kYXRhLnN1YnN0cmluZygyMykpO1xuXHRcdGNhbnZhc2VzW2VsZW1lbnQucGFnZV0uYWRkKG5ldyBmYWJyaWMuVGV4dChkZUJhc2VkVGV4dCwge1xuICBcdFx0Zm9udEZhbWlseTogJ0FyaWFsJyxcbiAgXHRcdGxlZnQ6IDAsXG4gIFx0XHR0b3A6IDAsXG4gIFx0XHRmb250U2l6ZTogMTVcblx0XHR9KSk7XG5cdFx0Y2FsbGJhY2s7XG5cdH1cbn1cblxuXG4vLyAtLS0gaW5pdGlhbGl6ZSBjYW52YXNlc1xudmFyIGNhbnZhc2VzID0ge31cbmZ1bmN0aW9uIGluaXRDYW52YXNlcygpIHtcblx0JCgnY2FudmFzJykuZWFjaChmdW5jdGlvbihpKSB7XG5cdFx0Y2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXModGhpcyk7XG5cdCAgY2FudmFzLnNldFdpZHRoKCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykud2lkdGgoKSApO1xuXHRcdGNhbnZhcy5zZXRIZWlnaHQoICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5oZWlnaHQoKSApO1xuXHRcdGNhbnZhc2VzWydwJyArIChpICsgMSldID0gY2FudmFzO1xuXHR9KTtcblx0dmFyIGluc2VydFRpdGxlID0gbmV3IGZhYnJpYy5UZXh0Ym94KCdJbnNlcnQgVGl0bGUgSGVyZScsIHtcblx0ICB0b3A6IDEyMCxcblx0ICBmb250RmFtaWx5OiAnQUdhcmFtb25kUHJvLCBzZXJpZicsXG5cdCAgZmlsbDogJyM3NzcnLFxuXHQgIGxpbmVIZWlnaHQ6IDEuMSxcblx0ICBmb250U2l6ZTogMzAsXG5cdCAgZm9udFdlaWdodDogJ2JvbGQnLFxuXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG5cdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCdcblx0fSk7XG5cdGNhbnZhc2VzWydwMSddLmFkZChpbnNlcnRUaXRsZSlcblx0dmFyIGxpbmVMZW5naHQgPSAyNTBcblx0Y2FudmFzZXNbJ3AxJ10uYWRkKG5ldyBmYWJyaWMuTGluZShbMCwgMCwgbGluZUxlbmdodCwgMF0sIHtcblx0XHRsZWZ0OiAoIGNhbnZhc2VzWydwMSddLndpZHRoIC0gbGluZUxlbmdodCkgLyAyLFxuXHQgIHRvcDogMTYwLFxuXHQgIHN0cm9rZTogJyMyMjInLFxuXHQgIHNlbGVjdGFibGU6IGZhbHNlXG5cdH0pKTtcblx0dmFyIGluc2VydEF1dGhvcnMgPSBuZXcgZmFicmljLlRleHRib3goJ0luc2VydCBBdXRob3JzIEhlcmUnLCB7XG5cdCAgdG9wOiAxODAsXG5cdCAgZm9udEZhbWlseTogJ0FHYXJhbW9uZFBybywgc2VyaWYnLFxuXHQgIGZpbGw6ICcjNzc3Jyxcblx0ICBsaW5lSGVpZ2h0OiAxLjEsXG5cdCAgZm9udFNpemU6IDIwLFxuXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG5cdCAgd2lkdGg6IGNhbnZhc2VzWydwMSddLndpZHRoLFxuXHQgIHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCdcblx0fSk7XG5cdGNhbnZhc2VzWydwMSddLmFkZChpbnNlcnRBdXRob3JzKVxuXHQvLyBUT0RPOiBvbiBjbGljaywgdGV4dCBpcyBkZWxldGVkXG59XG5cblxuXG5cblxuLy8gLS0tIE0tVi1DXG5cbnZhciBQdWJsaWNhdGlvbiA9IHtcblx0Ly8gYWxsIG91ciBzdGF0ZXNcblx0aWQ6IG1ha2VJZCgpLFxuXHR0aXRsZTogJ1RFU1QgUFVCJyxcblx0dGltZUxlZnQ6IDkwMDAwMDAsXG5cdGV4cGlyZWQ6IGZhbHNlLFxuXHRhdXRob3JzOiBbXSxcblx0cGFnZXM6IHtcblx0XHRwMToge30sXG5cdFx0cDI6IHt9LFxuXHRcdHAzOiB7fSxcblx0XHRwNDoge30sXG5cdFx0cDU6IHt9LFxuXHRcdHA2OiB7fSxcblx0XHRwNzoge30sXG5cdFx0cDg6IHt9XG5cdH1cbn07XG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIGlucHV0KSB7XG5cdGlmIChQdWJsaWNhdGlvbi50aW1lTGVmdCA+IDApIHsgLy8gbm90IGV4cGlyZWRcblx0XHRzaG93VGltZShQdWJsaWNhdGlvbik7IC8vIGV4cGlyZWRcblx0fSBlbHNlIHtcblx0XHRQdWJsaWNhdGlvbi5leHBpcmVkID0gdHJ1ZTtcblx0XHRzaG93RXhwaXJlZChQdWJsaWNhdGlvbik7XG5cdFx0bG9ja0VsZW1lbnRzKClcblx0XHQvLyBzaG93U2F2ZU1vZGFsKCk7XG5cdH1cblxuXHRpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSBmYWxzZSkge1xuXHRcdGNvbnNvbGUubG9nKGlucHV0KVxuXHRcdHN3aXRjaCAodHJ1ZSkge1xuXHRcdFx0Y2FzZSBpbnB1dC52aXNpYmxlID09IGZhbHNlOiAvLyBkZWxldGluZyBhbiBlbGVtZW50XG5cdFx0XHRcdFx0cmVtb3ZlRWxlbWVudChpbnB1dC5pZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGJ5dGVDb3VudChpbnB1dC5kYXRhKSA+IDEzOTgxMTcgOiAvLyBmaWxlIHRvbyBiaWcgKDFtYilcblx0XHRcdFx0IFx0RXJyb3IudG9vQmlnKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyBpbWFnZVxuXG5cdFx0XHRcdFx0dmFyIHB1YmxpY2F0aW9uVXBkYXRlID0gZnVuY3Rpb24oaW5wdXRQYWdlKSB7IC8vIHVwZGF0ZSBjYW52YXNcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFB1YmxpY2F0aW9uLnBhZ2VzW2lucHV0UGFnZV0gPSBjYW52YXNlc1tpbnB1dFBhZ2VdLnRvSlNPTigpIC8vIHNldHRpbWVvdXQgb3RoZXJ3aXNlIGl0IGRvZXNuJ3QgZ2V0IHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0XHR9LCAxKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBwdWJsaWNhdGlvblVwZGF0ZShpbnB1dC5wYWdlKSk7IC8vIGRyb3AgZWxlbWVudFxuXHRcdFx0XHRcdGFkZHRpbWUoMTAwMCkgLy8gYWRkIGJvbnVzIHRpbWVcblx0XHRcdFx0XHRjcml0aWNTYXlzKCk7XG5cblxuXHRcdFx0XHRcdC8vIGNyaXRpY1NheXMoJ2RhbmNlIGRhbmNlJywgJ2NhdCcpO1xuXHRcdFx0XHRcdC8vIG9yXG5cdFx0XHRcdFx0Ly8gY3JpdGljU2F5cygnZGFuY2UgZGFuY2UnKTtcblx0XHRcdFx0XHQvLyBvclxuXHRcdFx0XHRcdC8vIGNyaXRpY1NheXMoKTtcblxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyB0ZXh0XG5cblx0XHRcdFx0XHR2YXIgcHVibGljYXRpb25VcGRhdGUgPSBmdW5jdGlvbihpbnB1dFBhZ2UpIHsgLy8gdXBkYXRlIGNhbnZhc1xuXHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXRQYWdlXSA9IGNhbnZhc2VzW2lucHV0UGFnZV0udG9KU09OKCkgLy8gc2V0dGltZW91dCBvdGhlcndpc2UgaXQgZG9lc24ndCBnZXQgdGhlIGVsZW1lbnRcblx0XHRcdFx0XHRcdH0sIDEpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIHB1YmxpY2F0aW9uVXBkYXRlKGlucHV0LnBhZ2UpKTsgLy8gZHJvcCBlbGVtZW50XG5cdFx0XHRcdFx0YWRkdGltZSgxMDAwKSAvLyBhZGQgYm9udXMgdGltZVxuXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKTogLy8gbmVpdGhlciBhbiBpbWFnZSBub3IgdGV4dFxuXHRcdFx0XHRcdEVycm9yLm5vdEFsbG93ZWQoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0Lm1vdmUgPT0gdHJ1ZSA6IC8vIG1vdmluZyBvciBzY2FsaW5nIGFuIGltYWdlXG5cdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXQucGFnZV0gPSBjYW52YXNlc1tpbnB1dC5wYWdlXS50b0pTT04oKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0Lmhhc093blByb3BlcnR5KCd0aXRsZScpIDogLy8gY2hhbmdpbmcgdGl0bGVcblx0XHRcdFx0XHRQdWJsaWNhdGlvbi50aXRsZSA9IGlucHV0LnRpdGxlO1xuXHRcdH1cblx0fSBlbHNlIGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IHRydWUpIHtcblx0XHQvLyB0b28gbGF0ZVxuXHRcdEVycm9yLnRvb0xhdGUoKTtcblx0fVxufVxuXG5cblxuXG5cbi8vIC0tLSBDT05UUk9MTEVSXG5cbnZhciB4O1xuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cdGluaXRDYW52YXNlcygpXG5cdG9uTW9kRWxlbWVudCgpXG5cdGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpIDwgMCkge1xuXHRcdC8vIGlmIG5vdCBhIHNhdmVkIHB1YmxpY2F0aW9uXG5cdFx0aWYgKCBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKSApIHsgLy8gZGlmZmljdWx0eVxuXHRcdFx0UHVibGljYXRpb24udGltZUxlZnQgPSBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKTtcblx0XHR9XG5cdFx0eCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0UHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAtIDEwO1xuXHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbik7XG5cdFx0fSwgMTApO1xuXG5cdFx0bW91c2VDb3VudGVyKClcblx0fSBlbHNlIHsgLy8gc2F2ZWQgcHVibGljYXRpb25cblx0XHRyZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbilcblx0XHRwZGZEb3dubG9hZCgpXG5cdFx0JCgnYm9keScpLmFkZENsYXNzKCdzYXZlZCcpXG5cdH1cbn0pO1xuXG5mdW5jdGlvbiBhZGR0aW1lKGJvbnVzVGltZSkge1xuXHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICsgYm9udXNUaW1lO1xuXHRhbmltYXRldGltZWNvdW50ZXIoYm9udXNUaW1lKTtcbn1cblxuLy8gbW9kaWZ5IGVsZW1lbnRcbmZ1bmN0aW9uIG9uTW9kRWxlbWVudCgpIHtcblx0Zm9yICh2YXIgcGFnZUlkIGluIGNhbnZhc2VzKSB7XG5cdFx0Y2FudmFzZXNbIHBhZ2VJZCBdLm9uKCdvYmplY3Q6bW9kaWZpZWQnLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBwYXJlbnRDYW52YXNJZCA9IGV2dC50YXJnZXQuY2FudmFzLmxvd2VyQ2FudmFzRWwuaWRcblx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgbW92ZTogdHJ1ZSwgcGFnZTogcGFyZW50Q2FudmFzSWR9KVxuXHRcdH0pXG5cdH1cbn1cblxuLy8gZHJvcCBlbGVtZW50XG5wYWdlcy5vbignZHJhZ292ZXInLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0JCh0aGlzKS5hZGRDbGFzcygnZHJhZ292ZXInKTtcbn0pO1xucGFnZXMub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xufSk7XG5wYWdlcy5vbignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcblx0JCh0aGlzKS5yZW1vdmVDbGFzcygnZHJhZ292ZXInKTtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRjb25zb2xlLmxvZyhlKTtcblx0dmFyIGZpbGVzID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5maWxlcztcblx0dmFyIHkgPSAwO1xuXHRmb3IgKHZhciBpID0gZmlsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRyZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdHZhciBwYWdlSWQgPSAkKHRoaXMpLmZpbmQoJ2NhbnZhcycpLmF0dHIoJ2lkJyk7XG5cdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdFx0XHRcdGRhdGE6IGV2ZW50LnRhcmdldC5yZXN1bHQsXG5cdFx0XHRcdFx0dmlzaWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRwYWdlOiBwYWdlSWRcblx0XHRcdFx0fSk7XG5cdFx0XHR9LCB5ICogZHJvcERlbGF5KTtcblx0XHRcdHkgKz0gMTtcblx0XHR9O1xuXHRcdGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcblx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0U291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudCAoVE9ETzogVVBEQVRFIEZPUiBGQUJSSUMpXG4kKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNsb3NlJywgZnVuY3Rpb24oKSB7XG5cdHZhciBwYWdlSWQgPSAkKHRoaXMpXG5cdFx0LmNsb3Nlc3QoJy5wYWdlJylcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnRJZCA9ICQodGhpcylcblx0XHQucGFyZW50KClcblx0XHQuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnREYXRhID0gJCh0aGlzKVxuXHRcdC5zaWJsaW5ncygpXG5cdFx0LmF0dHIoJ3NyYycpO1xuXHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0aWQ6IGVsZW1lbnRJZCxcblx0XHRkYXRhOiBlbGVtZW50RGF0YSxcblx0XHRwb3M6IFswLCAwLCAwLCAwLCAwXSxcblx0XHR2aXNpYmxlOiBmYWxzZSxcblx0XHRwYWdlOiBwYWdlSWRcblx0fSk7XG59KTtcblxuLy8gY2hhbmdpbmcgdGl0bGVcbiQoJyN0aXRsZScpLmNoYW5nZShmdW5jdGlvbigpIHtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdHRpdGxlOiAkKHRoaXMpLnZhbCgpXG5cdH0pO1xufSlcblxuXG5cblxuXG5cbi8vIC0tLSBWSUVXXG5cbnZhciBTb3VuZCA9IHtcblx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2luY29ycmVjdC5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH0sXG5cdGRpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9XG59O1xuXG4vLyBtZXJnZSB0aGVzZSB0d29cbmZ1bmN0aW9uIHNob3dUaW1lKFB1YmxpY2F0aW9uKSB7XG5cdHNlY29uZHMgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDEwMDA7XG5cdCQoJyNjb3VudGVyJykuc2hvdygpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLmlubmVySFRNTCA9XG5cdFx0c2Vjb25kcy50b0ZpeGVkKDIpICsgJyBzZWNvbmRzIGxlZnQhJztcbn1cbmZ1bmN0aW9uIG1vdXNlQ291bnRlcigpIHtcblx0JChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXHRcdGlmIChlLnBhZ2VYID49ICQoZG9jdW1lbnQpLndpZHRoKCkgLyAyKSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCArIDIwLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID0gJ2V4cGlyZWQhJztcblx0JCgnYm9keScpLmFkZENsYXNzKCdleHBpcmVkJyk7XG5cblx0ZXhwaXJlZFRpbWUoKTtcblx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0JCgnLndyYXBwZXInKS5hZGRDbGFzcygnc2F2ZWRfdmlldycpO1xuXHRcdHNhdmVkU3RhdGUoKTtcblx0fSwgNTAwKTtcblx0Ly8gYW5jaG9ya2V5XG5cdC8vc2V0VGltZW91dChmdW5jdGlvbigpe1xuXHQvLyAgd2luZG93LnByaW50KCk7XG5cdC8vfSwgMTAwMCk7XG5cdC8vIGFuaW1hdGVVcCgkKCcjc2F2ZS1tb2RhbCcpKTtcblx0Y2xlYXJJbnRlcnZhbCh4KTtcbn1cblxuZnVuY3Rpb24gZHJvcEVsZW1lbnQocGFnZUlkLCBkYXRhLCBpZCwgY2FsbGJhY2spIHtcblx0dmFyIGVsZW1lbnQgPSB7IGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZCB9O1xuXHR2YXIgZWxlbWVudFBvcyA9IGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgY2FsbGJhY2spO1xuXHRTb3VuZC5kaW5nKCk7XG59XG5cblxuXG5cblxuXG5cbi8vIGVycm9yc1xuXG52YXIgRXJyb3IgPSB7XG5cdG5vdEFsbG93ZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKClcblx0XHRhbGVydCgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgbm90IGFsbG93ZWQhJylcblx0fSxcblx0dG9vQmlnOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpO1xuXHRcdGFsZXJ0KCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyB0b28gYmlnIScpO1xuXHR9LFxuXHR0b29MYXRlOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpO1xuXHRcdGFsZXJ0KCd0b28gbGF0ZSBicm8nKTtcblx0fVxufTtcblxuLy8gbG9jayBlbGVtZW50c1xuZnVuY3Rpb24gbG9ja0VsZW1lbnRzKCkge1xuXHRmb3IgKHZhciBwYWdlSWQgaW4gY2FudmFzZXMpIHtcblx0XHRjYW52YXNlc1twYWdlSWRdLnNlbGVjdGlvbiA9IGZhbHNlO1xuXHRcdGZvciAob2JqZWN0SWQgaW4gY2FudmFzZXNbcGFnZUlkXS5nZXRPYmplY3RzKCkgKSB7XG5cdFx0XHR2YXIgb2JqZWN0ID0gY2FudmFzZXNbcGFnZUlkXS5pdGVtKG9iamVjdElkKVxuXHRcdFx0b2JqZWN0LnNlbGVjdGFibGUgPSBmYWxzZVxuXHRcdFx0b2JqZWN0LmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnXG5cdFx0fVxuXHR9XG59XG5cbi8vIFRPRE86IENPTlZFUlQgVE8gRkFCUklDXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50KGlkKSB7XG5cdCQoJyMnICsgaWQpLmhpZGUoKTtcblx0Y29uc29sZS5sb2coaWQpO1xufVxuXG4vLyBzaG93IHNhdmUgbW9kYWxcblxuZnVuY3Rpb24gc2hvd1NhdmVNb2RhbCgpIHtcblx0JCgnI3NhdmUtbW9kYWwnKS5zaG93KCk7XG5cdCQoJyNzYXZlJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0c2F2ZXRvRGIoUHVibGljYXRpb24pO1xuXHRcdC8vIG1ha2VQZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdGdlblBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Ly8gY2hlY2tQZGYoUHVibGljYXRpb24uaWQpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gZ2VuUGRmKGlkKSB7XG5cdCQoJyNzYXZlLW1vZGFsJykuc2hvdygpO1xuXHQkKCcjc2F2ZS1tb2RhbCcpLmh0bWwoJycpO1xuXHR2YXIgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdGlmIChwZGZSZWFkeSA9PSB0cnVlKSB7XG5cdFx0XHQkKCcjc2F2ZS1tb2RhbCcpLmh0bWwoXG5cdFx0XHRcdCdEb3dubG9hZCB5b3VyIHBkZiA8YSBocmVmPVwiYXNzZXRzL3BkZi8nICtcblx0XHRcdFx0XHRpZCArXG5cdFx0XHRcdFx0Jy8nICtcblx0XHRcdFx0XHRpZCArXG5cdFx0XHRcdFx0Jy5wZGY/ZG93bmxvYWQ9dHJ1ZVwiIHRhcmdldD1cIl9ibGFua1wiPmhlcmU8L2E+IGFuZCBwcmludGFibGUgcGRmIGJvb2tsZXQgPGEgaHJlZj1cImFzc2V0cy9wZGYvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCctYm9va2xldC5wZGY/ZG93bmxvYWQ9dHJ1ZVwiIHRhcmdldD1cIl9ibGFua1wiPmhlcmU8L2E+LicgLy8gYWRkIFwib24gY2xpY2sgY2xvc2Ugc2F2ZSBtb2RhbFwiXG5cdFx0XHQpO1xuXHRcdFx0Y2xlYXJJbnRlcnZhbCh5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gJCgnI3NhdmUtbW9kYWwnKS5odG1sKCdZb3VyIFB1YmxpY2F0aW9uIGlzIGJlaW5nIGdlbmVyYXRlZDxzcGFuIGlkPVwibG9hZGluZ19kb3RzXCI+Li4uPC9zcGFuPjxkaXYgaWQ9XCJsb2FkZXJcIj48ZGl2IGlkPVwibG9hZGluZ2JhclwiPjwvZGl2PjwvZGl2PicpO1xuXHRcdFx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKCdZb3VyIFB1YmxpY2F0aW9uICg8YSBocmVmPVwiaHR0cDovL2xvY2FsaG9zdDozMDAwL3BkZj9pZD0nICsgUHVibGljYXRpb24uaWQgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+ZG93bmxvYWQ8L2E+KSBpcyBiZWluZyBnZW5lcmF0ZWQ8c3BhbiBpZD1cImxvYWRpbmdfZG90c1wiPi4uLjwvc3Bhbj48ZGl2IGlkPVwic3Bpbm5lclwiPjxkaXYgaWQ9XCJhbmltYXRpb25cIj48L2Rpdj48aW1nIHNyYz1cImFzc2V0cy9pbWcvcHJpbnRlci5wbmdcIj48L2Rpdj4nKTtcblx0XHR9XG5cdH0sIDEwMCk7XG59XG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbikge1xuXHRjYW52YXNlc1sncDEnXS5jbGVhcigpOyAvLyBjbGVhciB0aXRsZVxuXG5cdGZvciAodmFyIGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG5cdFx0dmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeShQdWJsaWNhdGlvbi5wYWdlc1tjYW52YXNJZF0pO1xuXHRcdGNhbnZhc2VzW2NhbnZhc0lkXS5sb2FkRnJvbUpTT04oIGpzb24sIGZ1bmN0aW9uKCkge1xuXHRcdFx0Y2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbC5iaW5kKGNhbnZhc2VzW2NhbnZhc0lkXSlcblx0XHRcdGxvY2tFbGVtZW50cygpXG5cdFx0fSlcblx0fVxuXG59XG5cbmZ1bmN0aW9uIHBkZkRvd25sb2FkKCkge1xuXHQkKCcjcGRmLWRvd25sb2FkJykuc2hvdygpO1xuXHQkKCcjcGRmLWRvd25sb2FkJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0Ly8gbWFrZVBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Z2VuUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHQvLyBjaGVja1BkZihQdWJsaWNhdGlvbi5pZCk7XG5cdH0pO1xufVxuXG5cblxuXG5cblxuLy8gLS0tIEJBQ0tFTkRcblxuLy8gLy8gc2VuZCBjYWxsIHRvIHNlcnZlciB0byBtYWtlIHBkZlxuLy8gZnVuY3Rpb24gbWFrZVBkZihpZCkge1xuLy8gXHQkLmdldCgnL3BkZj9pZD0nICsgaWQsIGZ1bmN0aW9uKGRhdGEpIHtcbi8vIFx0XHRjb25zb2xlLmxvZygnU2VudCBjYWxsIHRvIG1ha2UgUERGLicpO1xuLy8gXHR9KTtcbi8vIH1cblxuLy8gLy8gY2hlY2sgaWYgcGRmIGV4aXN0cyBhbmQgcmVkaXJlY3QgdG8gZmlsZVxuLy8gZnVuY3Rpb24gY2hlY2tQZGYoaWQpIHtcbi8vIFx0dmFyIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbi8vIFx0XHQkLmFqYXgoe1xuLy8gXHRcdFx0dHlwZTogJ0hFQUQnLFxuLy8gXHRcdFx0dXJsOiAnYXNzZXRzL3BkZi8nICsgaWQgKyAnLycgKyBpZCArICctYm9va2xldC5wZGYnLCAvLyBjaGVjayB0aGUgYm9va2xldFxuLy8gXHRcdFx0c3VjY2VzczogZnVuY3Rpb24obXNnKSB7XG4vLyBcdFx0XHRcdGNsZWFySW50ZXJ2YWwoeSk7XG4vLyBcdFx0XHRcdHBkZlJlYWR5ID0gdHJ1ZTtcbi8vIFx0XHRcdH0sXG4vLyBcdFx0XHRlcnJvcjogZnVuY3Rpb24oanFYSFIsIHRleHRTdGF0dXMsIGVycm9yKSB7XG4vLyBcdFx0XHRcdGNvbnNvbGUubG9nKGpxWEhSKTtcbi8vIFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuLy8gXHRcdFx0fVxuLy8gXHRcdH0pO1xuLy8gXHR9LCAxMDApO1xuLy8gfVxuXG4vLyBzYXZlIHRvIGRiXG5mdW5jdGlvbiBzYXZldG9EYihwdWJsaWNhdGlvbikge1xuXHRmb3IgKHZhciBwYWdlIGluIFB1YmxpY2F0aW9uLnBhZ2VzKSB7XG5cdFx0UHVibGljYXRpb24ucGFnZXNbcGFnZV0gPSBjYW52YXNlc1twYWdlXS50b0pTT04oKSAvLyB1cGRhdGUgYWxsIHBhZ2VzXG5cdH1cblx0JC5hamF4KHtcblx0XHR1cmw6ICcvZGInLFxuXHRcdHR5cGU6ICdwb3N0JywgLy8gcGVyZm9ybWluZyBhIFBPU1QgcmVxdWVzdFxuXHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KFB1YmxpY2F0aW9uKSxcblx0XHRjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuXHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0c3VjY2VzczogZnVuY3Rpb24ocHVibGljYXRpb24pIHtcblx0XHRcdGNvbnNvbGUubG9nKCdwdWJsaWNhdGlvbiBzZW50IHRvIGRhdGFiYXNlLicpO1xuXHRcdH1cblx0fSk7XG5cdGNvbnNvbGUubG9nKCdzYXZlZD9pZD0nICsgUHVibGljYXRpb24uaWQpXG59XG5cbmZ1bmN0aW9uIGFuaW1hdGVVcChvYmopIHtcblx0b2JqLnNob3coKTtcblx0b2JqLmNzcygnbWFyZ2luLXRvcCcsICcyMHB4Jyk7XG5cdG9iai5hbmltYXRlKHtcblx0ICAgIG9wYWNpdHk6IDEsXG5cdCAgICBtYXJnaW5Ub3A6IFwiMHB4XCIsXG5cdCAgfSwgMzAwMCwgZnVuY3Rpb24oKSB7XG5cdCAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG5cdH0pO1xufTtcblxuZnVuY3Rpb24gYW5pbWF0ZVVwT3V0KG9iaiwgdGltZSkge1xuXHRvYmouc2hvdygpO1xuXHRvYmouY3NzKCdtYXJnaW4tdG9wJywgJzIwcHgnKTtcblx0b2JqLmFuaW1hdGUoe1xuXHQgICAgb3BhY2l0eTogMSxcblx0ICAgIG1hcmdpblRvcDogXCIwcHhcIixcblx0ICB9LCB0aW1lLzIsIGZ1bmN0aW9uKCkge1xuXHQgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuXHR9KTtcblx0b2JqLmFuaW1hdGUoe1xuXHQgICAgb3BhY2l0eTogMCxcblx0ICAgIG1hcmdpblRvcDogXCIyMHB4XCIsXG5cdCAgfSwgdGltZS8yLCBmdW5jdGlvbigpIHtcblx0ICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cblx0fSk7XG59O1xuIl0sImZpbGUiOiJtYWluLmpzIn0=
