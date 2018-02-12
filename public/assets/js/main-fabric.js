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
		var htmlBrText = deBasedText.replace(/\n/g, '<br/>');
		canvases[element.page].add(new fabric.Text(htmlBrText, { 
  		fontFamily: 'Arial', 
  		left: 0, 
  		top: 0 
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

					var publicationUpdate = function(inputPage) { // update canvas
						setTimeout(function() {
							Publication.pages[inputPage] = canvases[inputPage].toJSON() // settimeout otherwise it doesn't get the element
						}, 1)
					}
					dropElement(input.page, input.data, publicationUpdate(input.page)); // drop element
					addtime(1000) // add bonus time

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
					'.pdf?download=true" target="_blank">here</a> and printable pdf booklet <a href="assets/pdf/' +
					id +
					'/' +
					id +
					'-booklet.pdf?download=true" target="_blank">here</a>.' // add "on click close save modal"
			);
			clearInterval(y);
		} else {
			$('#save-modal').text('Your PDF is being generated');
		}
	}, 100);
}

// --- SAVED

function renderPublication(Publication) {
	$('#title').val(Publication.title).attr("disabled","disabled");

	for (var pageId in canvases) {
		var json = JSON.stringify(Publication.pages[pageId]);
		canvas.loadFromJSON( json, function() {
			canvas.renderAll.bind(canvas) 
			lockElements()
		})
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
			url: 'assets/pdf/' + id + '/' + id + '-booklet.pdf', // check the booklet
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

// save to db
function savetoDb(publication) {
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
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLWZhYnJpYy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0gR0xPQkFMXG5cbnZhciBwYWdlcyA9ICQoJy5wYWdlJyk7XG52YXIgY3JpdGljUG9wdXAgPSAkKCcjY3JpdGljJyk7XG52YXIgZHJvcERlbGF5ID0gMTAwO1xudmFyIHBkZlJlYWR5ID0gZmFsc2U7XG5cblxuXG5cblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcblx0dmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcblx0dmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG5cdHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gYnl0ZUNvdW50KHMpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJKHMpLnNwbGl0KC8lLi58Li8pLmxlbmd0aCAtIDE7XG59XG5cbnZhciBnZXRVcmxQYXJhbWV0ZXIgPSBmdW5jdGlvbiBnZXRVcmxQYXJhbWV0ZXIoc1BhcmFtKSB7XG4gIHZhciBzUGFnZVVSTCA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSksXG4gICAgc1VSTFZhcmlhYmxlcyA9IHNQYWdlVVJMLnNwbGl0KCcmJyksXG4gICAgc1BhcmFtZXRlck5hbWUsXG4gICAgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgc1VSTFZhcmlhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgIHNQYXJhbWV0ZXJOYW1lID0gc1VSTFZhcmlhYmxlc1tpXS5zcGxpdCgnPScpO1xuXG4gICAgaWYgKHNQYXJhbWV0ZXJOYW1lWzBdID09PSBzUGFyYW0pIHtcbiAgICAgICAgcmV0dXJuIHNQYXJhbWV0ZXJOYW1lWzFdID09PSB1bmRlZmluZWQgPyB0cnVlIDogc1BhcmFtZXRlck5hbWVbMV07XG4gICAgfVxuICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KGVsZW1lbnQsIGNhbGxiYWNrKSB7XG5cdGlmIChlbGVtZW50LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSkge1xuXHRcdGZhYnJpYy5JbWFnZS5mcm9tVVJMKGVsZW1lbnQuZGF0YSwgZnVuY3Rpb24obXlJbWcsIGNhbGxiYWNrKSB7XG4gXHRcdFx0dmFyIGltZyA9IG15SW1nLnNldCh7IGxlZnQ6IDAsIHRvcDogMCwgd2lkdGg6IG15SW1nLndpZHRoLCBoZWlnaHQ6IG15SW1nLmhlaWdodH0pO1xuIFx0XHRcdGlmICggaW1nLndpZHRoID4gY2FudmFzZXNbZWxlbWVudC5wYWdlXS53aWR0aCApIHtcbiBcdFx0XHRcdGltZy5zY2FsZVRvV2lkdGgoY2FudmFzZXNbZWxlbWVudC5wYWdlXS53aWR0aCAvIDEwMCAqIDcwICk7IC8vIDcwJSBvZiB0aGUgY2FudmFzXG4gXHRcdFx0fVxuIFx0XHRcdGltZy5vbignYWRkZWQnLCBmdW5jdGlvbigpIHtcbiBcdFx0XHRcdGNhbGxiYWNrO1xuIFx0XHRcdH0pO1xuIFx0XHRcdGNhbnZhc2VzW2VsZW1lbnQucGFnZV0uYWRkKGltZylcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR2YXIgZGVCYXNlZFRleHQgPSBhdG9iKGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpKTtcblx0XHR2YXIgaHRtbEJyVGV4dCA9IGRlQmFzZWRUZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKTtcblx0XHRjYW52YXNlc1tlbGVtZW50LnBhZ2VdLmFkZChuZXcgZmFicmljLlRleHQoaHRtbEJyVGV4dCwgeyBcbiAgXHRcdGZvbnRGYW1pbHk6ICdBcmlhbCcsIFxuICBcdFx0bGVmdDogMCwgXG4gIFx0XHR0b3A6IDAgXG5cdFx0fSkpO1xuXHRcdGNhbGxiYWNrO1xuXHR9XG59XG5cblxuLy8gLS0tIGluaXRpYWxpemUgY2FudmFzZXNcbnZhciBjYW52YXNlcyA9IHt9XG5mdW5jdGlvbiBpbml0Q2FudmFzZXMoKSB7XG5cdCQoJ2NhbnZhcycpLmVhY2goZnVuY3Rpb24oaSkge1xuXHRcdGNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKHRoaXMpO1xuXHQgIGNhbnZhcy5zZXRXaWR0aCggJCh0aGlzKS5jbG9zZXN0KCcucGFnZScpLndpZHRoKCkgKTtcblx0XHRjYW52YXMuc2V0SGVpZ2h0KCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykuaGVpZ2h0KCkgKTtcblx0XHRjYW52YXNlc1sncCcgKyAoaSArIDEpXSA9IGNhbnZhcztcblx0fSk7XG59XG5cblxuXG5cblxuLy8gLS0tIE0tVi1DXG5cbnZhciBQdWJsaWNhdGlvbiA9IHtcblx0Ly8gYWxsIG91ciBzdGF0ZXNcblx0aWQ6IG1ha2VJZCgpLFxuXHR0aXRsZTogJ1RFU1QgUFVCJyxcblx0dGltZUxlZnQ6IDkwMDAwMDAsXG5cdGV4cGlyZWQ6IGZhbHNlLFxuXHRhdXRob3JzOiBbXSxcblx0cGFnZXM6IHtcblx0XHRwMToge30sXG5cdFx0cDI6IHt9LFxuXHRcdHAzOiB7fSxcblx0XHRwNDoge30sXG5cdFx0cDU6IHt9LFxuXHRcdHA2OiB7fSxcblx0XHRwNzoge30sXG5cdFx0cDg6IHt9XG5cdH1cbn07XG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIGlucHV0KSB7XG5cdGlmIChQdWJsaWNhdGlvbi50aW1lTGVmdCA+IDApIHsgLy8gbm90IGV4cGlyZWRcblx0XHRzaG93VGltZShQdWJsaWNhdGlvbik7IC8vIGV4cGlyZWRcblx0fSBlbHNlIHtcblx0XHRQdWJsaWNhdGlvbi5leHBpcmVkID0gdHJ1ZTtcblx0XHRzaG93RXhwaXJlZChQdWJsaWNhdGlvbik7XG5cdFx0bG9ja0VsZW1lbnRzKClcblx0XHRzaG93U2F2ZU1vZGFsKCk7XG5cdH1cblxuXHRpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSBmYWxzZSkge1xuXHRcdGNvbnNvbGUubG9nKGlucHV0KVxuXHRcdHN3aXRjaCAodHJ1ZSkge1xuXHRcdFx0Y2FzZSBpbnB1dC52aXNpYmxlID09IGZhbHNlOiAvLyBkZWxldGluZyBhbiBlbGVtZW50XG5cdFx0XHRcdFx0cmVtb3ZlRWxlbWVudChpbnB1dC5pZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGJ5dGVDb3VudChpbnB1dC5kYXRhKSA+IDEzOTgxMTcgOiAvLyBmaWxlIHRvbyBiaWcgKDFtYilcblx0XHRcdFx0IFx0RXJyb3IudG9vQmlnKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyBpbWFnZVxuXG5cdFx0XHRcdFx0dmFyIHB1YmxpY2F0aW9uVXBkYXRlID0gZnVuY3Rpb24oaW5wdXRQYWdlKSB7IC8vIHVwZGF0ZSBjYW52YXNcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFB1YmxpY2F0aW9uLnBhZ2VzW2lucHV0UGFnZV0gPSBjYW52YXNlc1tpbnB1dFBhZ2VdLnRvSlNPTigpIC8vIHNldHRpbWVvdXQgb3RoZXJ3aXNlIGl0IGRvZXNuJ3QgZ2V0IHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0XHR9LCAxKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBwdWJsaWNhdGlvblVwZGF0ZShpbnB1dC5wYWdlKSk7IC8vIGRyb3AgZWxlbWVudFxuXHRcdFx0XHRcdGFkZHRpbWUoMTAwMCkgLy8gYWRkIGJvbnVzIHRpbWVcblxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJykgJiZcblx0XHRcdFx0aW5wdXQudmlzaWJsZSA9PSB0cnVlOiAvLyBuZXcgdGV4dFxuXG5cdFx0XHRcdFx0dmFyIHB1YmxpY2F0aW9uVXBkYXRlID0gZnVuY3Rpb24oaW5wdXRQYWdlKSB7IC8vIHVwZGF0ZSBjYW52YXNcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFB1YmxpY2F0aW9uLnBhZ2VzW2lucHV0UGFnZV0gPSBjYW52YXNlc1tpbnB1dFBhZ2VdLnRvSlNPTigpIC8vIHNldHRpbWVvdXQgb3RoZXJ3aXNlIGl0IGRvZXNuJ3QgZ2V0IHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0XHR9LCAxKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBwdWJsaWNhdGlvblVwZGF0ZShpbnB1dC5wYWdlKSk7IC8vIGRyb3AgZWxlbWVudFxuXHRcdFx0XHRcdGFkZHRpbWUoMTAwMCkgLy8gYWRkIGJvbnVzIHRpbWVcblxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHQhaW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTp0ZXh0L3BsYWluJyk6IC8vIG5laXRoZXIgYW4gaW1hZ2Ugbm9yIHRleHRcblx0XHRcdFx0XHRFcnJvci5ub3RBbGxvd2VkKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5tb3ZlID09IHRydWUgOiAvLyBtb3Zpbmcgb3Igc2NhbGluZyBhbiBpbWFnZVxuXHRcdFx0XHRcdFB1YmxpY2F0aW9uLnBhZ2VzW2lucHV0LnBhZ2VdID0gY2FudmFzZXNbaW5wdXQucGFnZV0udG9KU09OKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5oYXNPd25Qcm9wZXJ0eSgndGl0bGUnKSA6IC8vIGNoYW5naW5nIHRpdGxlXG5cdFx0XHRcdFx0UHVibGljYXRpb24udGl0bGUgPSBpbnB1dC50aXRsZTtcblx0XHR9XG5cdH0gZWxzZSBpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSB0cnVlKSB7XG5cdFx0Ly8gdG9vIGxhdGVcblx0XHRFcnJvci50b29MYXRlKCk7XG5cdH1cbn1cblxuXG5cblxuXG4vLyAtLS0gQ09OVFJPTExFUlxuXG52YXIgeDtcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHRpbml0Q2FudmFzZXMoKVxuXHRvbk1vZEVsZW1lbnQoKVxuXHRpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA8IDApIHtcblx0XHQvLyBpZiBub3QgYSBzYXZlZCBwdWJsaWNhdGlvblxuXHRcdGlmICggZ2V0VXJsUGFyYW1ldGVyKCd0aW1lJykgKSB7IC8vIGRpZmZpY3VsdHlcblx0XHRcdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gZ2V0VXJsUGFyYW1ldGVyKCd0aW1lJyk7XG5cdFx0fVxuXHRcdHggPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgLSAxMDtcblx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24pO1xuXHRcdH0sIDEwKTtcblxuXHRcdG1vdXNlQ291bnRlcigpXG5cdH0gZWxzZSB7IC8vIHNhdmVkIHB1YmxpY2F0aW9uXG5cdFx0cmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pXG5cdFx0cGRmRG93bmxvYWQoKVxuXHRcdCQoJ2JvZHknKS5hZGRDbGFzcygnc2F2ZWQnKVxuXHR9XG59KTtcblxuZnVuY3Rpb24gYWRkdGltZShib251c1RpbWUpIHtcblx0UHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCArIGJvbnVzVGltZTtcblx0YW5pbWF0ZXRpbWVjb3VudGVyKGJvbnVzVGltZSk7XG59XG5cbi8vIG1vZGlmeSBlbGVtZW50XG5mdW5jdGlvbiBvbk1vZEVsZW1lbnQoKSB7XG5cdGZvciAodmFyIHBhZ2VJZCBpbiBjYW52YXNlcykge1xuXHRcdGNhbnZhc2VzWyBwYWdlSWQgXS5vbignb2JqZWN0Om1vZGlmaWVkJywgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgcGFyZW50Q2FudmFzSWQgPSBldnQudGFyZ2V0LmNhbnZhcy5sb3dlckNhbnZhc0VsLmlkXG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IG1vdmU6IHRydWUsIHBhZ2U6IHBhcmVudENhbnZhc0lkfSlcblx0XHR9KVxuXHR9XG59XG5cbi8vIGRyb3AgZWxlbWVudFxucGFnZXMub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdCQodGhpcykuYWRkQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0JCh0aGlzKS5yZW1vdmVDbGFzcygnZHJhZ292ZXInKTtcbn0pO1xucGFnZXMub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2RyYWdvdmVyJyk7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0Y29uc29sZS5sb2coZSk7XG5cdHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdHZhciB5ID0gMDtcblx0Zm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0cmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHR2YXIgcGFnZUlkID0gJCh0aGlzKS5maW5kKCdjYW52YXMnKS5hdHRyKCdpZCcpO1xuXHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0Y29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHtcblx0XHRcdFx0XHRkYXRhOiBldmVudC50YXJnZXQucmVzdWx0LFxuXHRcdFx0XHRcdHZpc2libGU6IHRydWUsXG5cdFx0XHRcdFx0cGFnZTogcGFnZUlkXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgeSAqIGRyb3BEZWxheSk7XG5cdFx0XHR5ICs9IDE7XG5cdFx0fTtcblx0XHRjb25zb2xlLmxvZyhmaWxlc1tpXSk7XG5cdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZXNbaV0pO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn0pO1xuLy8gcHJldmVudCBkcm9wIG9uIGJvZHlcbiQoJ2JvZHknKS5vbignZHJhZ292ZXInLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFNvdW5kLmVycm9yKCk7XG59KTtcblxuLy8gcmVtb3ZlIGVsZW1lbnRcbiQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuY2xvc2UnLCBmdW5jdGlvbigpIHtcblx0dmFyIHBhZ2VJZCA9ICQodGhpcylcblx0XHQuY2xvc2VzdCgnLnBhZ2UnKVxuXHRcdC5hdHRyKCdpZCcpO1xuXHR2YXIgZWxlbWVudElkID0gJCh0aGlzKVxuXHRcdC5wYXJlbnQoKVxuXHRcdC5hdHRyKCdpZCcpO1xuXHR2YXIgZWxlbWVudERhdGEgPSAkKHRoaXMpXG5cdFx0LnNpYmxpbmdzKClcblx0XHQuYXR0cignc3JjJyk7XG5cdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHtcblx0XHRpZDogZWxlbWVudElkLFxuXHRcdGRhdGE6IGVsZW1lbnREYXRhLFxuXHRcdHBvczogWzAsIDAsIDAsIDAsIDBdLFxuXHRcdHZpc2libGU6IGZhbHNlLFxuXHRcdHBhZ2U6IHBhZ2VJZFxuXHR9KTtcbn0pO1xuXG4vLyBjaGFuZ2luZyB0aXRsZVxuJCgnI3RpdGxlJykuY2hhbmdlKGZ1bmN0aW9uKCkge1xuXHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0dGl0bGU6ICQodGhpcykudmFsKClcblx0fSk7XG59KVxuXG5cblxuXG5cblxuLy8gLS0tIFZJRVdcblxudmFyIFNvdW5kID0ge1xuXHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vaW5jb3JyZWN0Lm1wMycpO1xuXHRcdGF1ZGlvLnBsYXkoKTtcblx0fSxcblx0ZGluZzogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vZGluZy5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH1cbn07XG5cbi8vIG1lcmdlIHRoZXNlIHR3b1xuZnVuY3Rpb24gc2hvd1RpbWUoUHVibGljYXRpb24pIHtcblx0c2Vjb25kcyA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMTAwMDtcblx0JCgnI2NvdW50ZXInKS5zaG93KCk7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID1cblx0XHRzZWNvbmRzLnRvRml4ZWQoMikgKyAnIHNlY29uZHMgbGVmdCEnO1xufVxuZnVuY3Rpb24gbW91c2VDb3VudGVyKCkge1xuXHQkKGRvY3VtZW50KS5iaW5kKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUucGFnZVggPj0gJChkb2N1bWVudCkud2lkdGgoKSAvIDIpIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIHJpZ2h0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5hZGRDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCAtIDIwIC0gJCgnI2NvdW50ZXInKS53aWR0aCgpLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIGxlZnQgc2lkZSBvZiBwYWdlXG5cdFx0XHQkKCcjY291bnRlcicpLnJlbW92ZUNsYXNzKCdtb3VzZV9yaWdodCcpO1xuXHRcdFx0JCgnI2NvdW50ZXInKS5jc3Moe1xuXHRcdFx0XHRsZWZ0OiBlLnBhZ2VYICsgMjAsXG5cdFx0XHRcdHRvcDogZS5wYWdlWSArIDUwXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzaG93RXhwaXJlZCgpIHtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKS5pbm5lckhUTUwgPSAnZXhwaXJlZCEnO1xuXHQkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKTtcblx0Ly9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdC8vICB3aW5kb3cucHJpbnQoKTtcblx0Ly99LCAxMDAwKTtcblx0Y2xlYXJJbnRlcnZhbCh4KTtcbn1cblxuZnVuY3Rpb24gZHJvcEVsZW1lbnQocGFnZUlkLCBkYXRhLCBpZCwgY2FsbGJhY2spIHtcblx0dmFyIGVsZW1lbnQgPSB7IGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZCB9O1xuXHR2YXIgZWxlbWVudFBvcyA9IGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgY2FsbGJhY2spO1xuXHRTb3VuZC5kaW5nKCk7XG59XG5cblxuXG5cblxuXG5cbi8vIGVycm9yc1xuXG52YXIgRXJyb3IgPSB7XG5cdG5vdEFsbG93ZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKClcblx0XHRhbGVydCgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgbm90IGFsbG93ZWQhJylcblx0fSxcblx0dG9vQmlnOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpO1xuXHRcdGFsZXJ0KCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyB0b28gYmlnIScpOyBcblx0fSxcblx0dG9vTGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0U291bmQuZXJyb3IoKTtcblx0XHRcdGFsZXJ0KCd0b28gbGF0ZSBicm8nKTsgXG5cdH1cbn07XG5cbi8vIGxvY2sgZWxlbWVudHNcbmZ1bmN0aW9uIGxvY2tFbGVtZW50cygpIHtcblx0Zm9yICh2YXIgcGFnZUlkIGluIGNhbnZhc2VzKSB7XG5cdFx0Y2FudmFzZXNbcGFnZUlkXS5zZWxlY3Rpb24gPSBmYWxzZTtcblx0XHRmb3IgKG9iamVjdElkIGluIGNhbnZhc2VzW3BhZ2VJZF0uZ2V0T2JqZWN0cygpICkge1xuXHRcdFx0dmFyIG9iamVjdCA9IGNhbnZhc2VzW3BhZ2VJZF0uaXRlbShvYmplY3RJZClcblx0XHRcdG9iamVjdC5zZWxlY3RhYmxlID0gZmFsc2Vcblx0XHRcdG9iamVjdC5ob3ZlckN1cnNvciA9ICdkZWZhdWx0J1xuXHRcdH1cblx0fVxufVxuXG4vLyBUT0RPOiBDT05WRVJUIFRPIEZBQlJJQ1xuZnVuY3Rpb24gcmVtb3ZlRWxlbWVudChpZCkge1xuXHQkKCcjJyArIGlkKS5oaWRlKCk7XG5cdGNvbnNvbGUubG9nKGlkKTtcbn1cblxuLy8gc2hvdyBzYXZlIG1vZGFsXG5cbmZ1bmN0aW9uIHNob3dTYXZlTW9kYWwoKSB7XG5cdCQoJyNzYXZlLW1vZGFsJykuc2hvdygpO1xuXHQkKCcjc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdHNhdmV0b0RiKFB1YmxpY2F0aW9uKTtcblx0XHRtYWtlUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRnZW5QZGYoUHVibGljYXRpb24uaWQpO1xuXHRcdGNoZWNrUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdlblBkZihpZCkge1xuXHQkKCcjc2F2ZS1tb2RhbCcpLnNob3coKTtcblx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKCcnKTtcblx0dmFyIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRpZiAocGRmUmVhZHkgPT0gdHJ1ZSkge1xuXHRcdFx0JCgnI3NhdmUtbW9kYWwnKS5odG1sKFxuXHRcdFx0XHQnRG93bmxvYWQgeW91ciBwZGYgPGEgaHJlZj1cImFzc2V0cy9wZGYvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcvJyArXG5cdFx0XHRcdFx0aWQgK1xuXHRcdFx0XHRcdCcucGRmP2Rvd25sb2FkPXRydWVcIiB0YXJnZXQ9XCJfYmxhbmtcIj5oZXJlPC9hPiBhbmQgcHJpbnRhYmxlIHBkZiBib29rbGV0IDxhIGhyZWY9XCJhc3NldHMvcGRmLycgK1xuXHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHQnLycgK1xuXHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHQnLWJvb2tsZXQucGRmP2Rvd25sb2FkPXRydWVcIiB0YXJnZXQ9XCJfYmxhbmtcIj5oZXJlPC9hPi4nIC8vIGFkZCBcIm9uIGNsaWNrIGNsb3NlIHNhdmUgbW9kYWxcIlxuXHRcdFx0KTtcblx0XHRcdGNsZWFySW50ZXJ2YWwoeSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJyNzYXZlLW1vZGFsJykudGV4dCgnWW91ciBQREYgaXMgYmVpbmcgZ2VuZXJhdGVkJyk7XG5cdFx0fVxuXHR9LCAxMDApO1xufVxuXG4vLyAtLS0gU0FWRURcblxuZnVuY3Rpb24gcmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pIHtcblx0JCgnI3RpdGxlJykudmFsKFB1YmxpY2F0aW9uLnRpdGxlKS5hdHRyKFwiZGlzYWJsZWRcIixcImRpc2FibGVkXCIpO1xuXG5cdGZvciAodmFyIHBhZ2VJZCBpbiBjYW52YXNlcykge1xuXHRcdHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24ucGFnZXNbcGFnZUlkXSk7XG5cdFx0Y2FudmFzLmxvYWRGcm9tSlNPTigganNvbiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRjYW52YXMucmVuZGVyQWxsLmJpbmQoY2FudmFzKSBcblx0XHRcdGxvY2tFbGVtZW50cygpXG5cdFx0fSlcblx0fVxuXG59XG5cbmZ1bmN0aW9uIHBkZkRvd25sb2FkKCkge1xuXHQkKCcjcGRmLWRvd25sb2FkJykuc2hvdygpO1xuXHQkKCcjcGRmLWRvd25sb2FkJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0bWFrZVBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Z2VuUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRjaGVja1BkZihQdWJsaWNhdGlvbi5pZCk7XG5cdH0pO1xufVxuXG5cblxuXG5cblxuLy8gLS0tIEJBQ0tFTkRcblxuLy8gc2VuZCBjYWxsIHRvIHNlcnZlciB0byBtYWtlIHBkZlxuZnVuY3Rpb24gbWFrZVBkZihpZCkge1xuXHQkLmdldCgnL3BkZj9pZD0nICsgaWQsIGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRjb25zb2xlLmxvZygnU2VudCBjYWxsIHRvIG1ha2UgUERGLicpO1xuXHR9KTtcbn1cblxuLy8gY2hlY2sgaWYgcGRmIGV4aXN0cyBhbmQgcmVkaXJlY3QgdG8gZmlsZVxuZnVuY3Rpb24gY2hlY2tQZGYoaWQpIHtcblx0dmFyIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHQkLmFqYXgoe1xuXHRcdFx0dHlwZTogJ0hFQUQnLFxuXHRcdFx0dXJsOiAnYXNzZXRzL3BkZi8nICsgaWQgKyAnLycgKyBpZCArICctYm9va2xldC5wZGYnLCAvLyBjaGVjayB0aGUgYm9va2xldFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24obXNnKSB7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoeSk7XG5cdFx0XHRcdHBkZlJlYWR5ID0gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oanFYSFIsIHRleHRTdGF0dXMsIGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGpxWEhSKTtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LCAxMDApO1xufVxuXG4vLyBzYXZlIHRvIGRiXG5mdW5jdGlvbiBzYXZldG9EYihwdWJsaWNhdGlvbikge1xuXHQkLmFqYXgoe1xuXHRcdHVybDogJy9kYicsXG5cdFx0dHlwZTogJ3Bvc3QnLCAvLyBwZXJmb3JtaW5nIGEgUE9TVCByZXF1ZXN0XG5cdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoUHVibGljYXRpb24pLFxuXHRcdGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG5cdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRzdWNjZXNzOiBmdW5jdGlvbihwdWJsaWNhdGlvbikge1xuXHRcdFx0Y29uc29sZS5sb2coJ3B1YmxpY2F0aW9uIHNlbnQgdG8gZGF0YWJhc2UuJyk7XG5cdFx0fVxuXHR9KTtcbn0iXSwiZmlsZSI6Im1haW4tZmFicmljLmpzIn0=
