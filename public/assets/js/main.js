// --- global variables

var pages = $('.page');
var criticPopup = $('#critic');
var dropDelay = 100;

// --- GENERAL FUNCTIONS

function makeId() {
	var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
	var id = randLetter + Date.now();
	return id; 
}

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

// --- M-V-C

var Model = {
	// all our states
	timeLeft: 10000000,
	expired: false,
	elements: []
}; // add title, date and id

function controller(Model, page, input) {

	// expired?
	if (Model.timeLeft > 0) {
		showTime(Model);
	}
	else {
		Model.expired = true;
		showExpired(Model);
		noDrag();
	}
  
  if (input && Model.expired == false) {
		switch (true) {
			case	input[3] == false : // deleting an element
				removeElement(input[0]);
				break;
			case 	input[1].includes("data:image") && 
						input[3] == true : // new image
				// update the Model
				Model.elements.push(input);
				// drop file
				dropFile(page, input[1], input[0]);
				// add bonus time
				addtime(1000);
				// critic speak
				critic();
				break;
			case 	input[1].includes("data:text/plain") && 
						input[3] == true : // new text
				// update the Model
				Model.elements.push(input);
				// drop file
				dropFile(page, input[1], input[0]);
				break;
			case 	!input[1].includes("data:image") &&
						!input[1].includes("data:text/plain") : // neither an image nor text
				notAnImage();
				break;
		}
	} else if (input && Model.expired == true) { // too late
		LateDropFile();
	}
}


// --- CONTROLLER

var x = setInterval(function() {
	Model.timeLeft = Model.timeLeft - 10;
	controller(Model);
}, 10);

function addtime(bonusTime) {
	Model.timeLeft = Model.timeLeft + bonusTime;
}

// dropFile

pages.on("dragover", function(e) {
	e.preventDefault();
  $(this).addClass('dragover');
});
pages.on("dragleave", function(e) {
	e.preventDefault();
  $(this).removeClass('dragover');
});
pages.on("drop", function(e) {
  $(this).removeClass('dragover');
  e.preventDefault();
  console.log(e);
  var files = e.originalEvent.dataTransfer.files
  var y = 0;
  for (var i = files.length - 1; i >= 0; i--) {
	  reader = new FileReader();
	  var pageId = $(this).attr('id');
	  reader.onload = function (event) {
	    console.log(event.target);
	    // id, url, size, pos, rotation?, visible
	    setTimeout(function(){
	    	controller(Model, pageId, [makeId(), event.target.result, [0,0,0,0,0], true] );
	  	}, y * dropDelay);
	  	y += 1;
	  };
	  console.log(files[i]);
	  reader.readAsDataURL(files[i]);
  }
	return false;
});
// prevent drop on body
$('body').on("dragover", function(e) {
	e.preventDefault();
});
$('body').on("dragleave", function(e) {
	e.preventDefault();
});
$('body').on("drop", function(e) {
  e.preventDefault();
  Sound.error();
});

// remove element
$(document).on('click', '.close', function () {
	var pageId = $(this).closest('.page').attr('id');
	var elementId = $(this).parent().attr('id');
	var elementSrc = $(this).siblings().attr('src');
	controller(Model, pageId, [elementId, elementSrc, [0,0,0,0,0], false]);
});

// --- VIEW

function showTime(Model) {
	seconds = Model.timeLeft / 1000;
	document.getElementById("counter").innerHTML = seconds.toFixed(2) + " seconds left!";
}

function showExpired() {
	document.getElementById("counter").innerHTML = "expired!";
	$('body').addClass('expired');
	setTimeout(function(){ 
		window.print(); 
	}, 1000);
	clearInterval(x);
}

function notAnImage() {
	Sound.error();
	alert('The file you dropped is not an image!');
}

function dropFile(pageId, src, id) {
	if (src.includes("data:image")) {
		var pageElementContent = $("<img>", {"src": src});
	} else {
		var deBasedText = atob( src.substring(23) );
		var htmlBrText = deBasedText.replace(/\n/g, "<br/>"); 
		console.log(htmlBrText);
		var pageElementContent = $("<p>").append(htmlBrText); // remove "data:text/plain;base64"
	}
	var pageElement = $("<div>", {"class": "page-element draggable"});
	var pageElementClose = $("<span>", {"class": "close"}).text('x');
	pageElement.append(pageElementContent, pageElementClose);
	pageElement.attr('id', id);
	$('#' + pageId).append(pageElement);
	// read size, pos, rot and add them to Model
	elementPos = [
		pageElement.position().left,
		pageElement.position().top,
		pageElement.width(),
		pageElement.height(),
		0 // rotation (TODO)
	];
	for(var i = 0 ; i < Model.elements.length; i += 1) {
		if (Model.elements[i][0] == id) {
			Model.elements[i][2] = elementPos;
		}
	}
	Sound.ding();
}

function LateDropFile(src) {
	alert('too late bro');
}

function noDrag() {
	var elems = document.querySelectorAll(".draggable");
  	[].forEach.call(elems, function(el) {
    	el.classList.remove("draggable");
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
		},
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
			endOnly: true,
		},

		inertia: true,
	})
	.on('resizemove', function(event) {
		var target = event.target,
			x = (parseFloat(target.getAttribute('data-x')) || 0),
			y = (parseFloat(target.getAttribute('data-y')) || 0);

		// update the element's style
		target.style.width = event.rect.width + 'px';
		target.style.height = event.rect.height + 'px';

		// translate when resizing from top or left edges
		x += event.deltaRect.left;
		y += event.deltaRect.top;

		target.style.webkitTransform = target.style.transform =
			'translate(' + x + 'px,' + y + 'px)';

		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	});

function dragMoveListener(event) {
	var target = event.target,
		// keep the dragged position in the data-x/data-y attributes
		x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
		y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

	// translate the element
	target.style.webkitTransform =
		target.style.transform =
		'translate(' + x + 'px, ' + y + 'px)';

	// update the posiion attributes
	target.setAttribute('data-x', x);
	target.setAttribute('data-y', y);

	// update z-index
	var maxzIndex = 0,
		i = 0;
	pageElements = $('#' + target.id).parent().children();
	pageElements.each(function () {
		i += 1;
		if ( $(this).css("z-index") >= maxzIndex ) {
			maxzIndex = parseInt($(this).css("z-index"));
		}
		if(i == pageElements.length) {
			if (target.style.zIndex != maxzIndex | target.style.zIndex == 0) {
    		target.style.zIndex = maxzIndex + 1;
    	}
  	}
	});
	// target.style.zIndex = maxzIndex + 1;
}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;


// // make pdf
// var element = document.getElementById('p1');
// $('#p1').click(function(){
// 	html2pdf(element, {
// 	  margin:       1,
// 	  filename:     'myfile.pdf',
// 	  image:        { type: 'jpeg', quality: 0.98 },
// 	  html2canvas:  { dpi: 72, letterRendering: true, height: 2970, width: 5100 },
// 	  jsPDF:        { unit: 'mm', format: 'A4', orientation: 'portrait' }
// 	});
// });


// --- ARCHIVE

$.ajax({
	url: "http://localhost:28017/test",
	type: 'get',
	dataType: 'jsonp',
	jsonp: 'jsonp', // mongodb is expecting that
	success: function (data) {
    console.log('success', data);
  },
  error: function (XMLHttpRequest, textStatus, errorThrown) {
    console.log('error', errorThrown);
  }                                                                            
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBnbG9iYWwgdmFyaWFibGVzXG5cbnZhciBwYWdlcyA9ICQoJy5wYWdlJyk7XG52YXIgY3JpdGljUG9wdXAgPSAkKCcjY3JpdGljJyk7XG52YXIgZHJvcERlbGF5ID0gMTAwO1xuXG4vLyAtLS0gR0VORVJBTCBGVU5DVElPTlNcblxuZnVuY3Rpb24gbWFrZUlkKCkge1xuXHR2YXIgcmFuZExldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNikpO1xuXHR2YXIgaWQgPSByYW5kTGV0dGVyICsgRGF0ZS5ub3coKTtcblx0cmV0dXJuIGlkOyBcbn1cblxudmFyIFNvdW5kID0ge1xuXHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vaW5jb3JyZWN0Lm1wMycpO1xuXHRcdGF1ZGlvLnBsYXkoKTtcblx0fSxcblx0ZGluZzogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vZGluZy5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH1cbn07XG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgTW9kZWwgPSB7XG5cdC8vIGFsbCBvdXIgc3RhdGVzXG5cdHRpbWVMZWZ0OiAxMDAwMDAwMCxcblx0ZXhwaXJlZDogZmFsc2UsXG5cdGVsZW1lbnRzOiBbXVxufTsgLy8gYWRkIHRpdGxlLCBkYXRlIGFuZCBpZFxuXG5mdW5jdGlvbiBjb250cm9sbGVyKE1vZGVsLCBwYWdlLCBpbnB1dCkge1xuXG5cdC8vIGV4cGlyZWQ/XG5cdGlmIChNb2RlbC50aW1lTGVmdCA+IDApIHtcblx0XHRzaG93VGltZShNb2RlbCk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0TW9kZWwuZXhwaXJlZCA9IHRydWU7XG5cdFx0c2hvd0V4cGlyZWQoTW9kZWwpO1xuXHRcdG5vRHJhZygpO1xuXHR9XG4gIFxuICBpZiAoaW5wdXQgJiYgTW9kZWwuZXhwaXJlZCA9PSBmYWxzZSkge1xuXHRcdHN3aXRjaCAodHJ1ZSkge1xuXHRcdFx0Y2FzZVx0aW5wdXRbM10gPT0gZmFsc2UgOiAvLyBkZWxldGluZyBhbiBlbGVtZW50XG5cdFx0XHRcdHJlbW92ZUVsZW1lbnQoaW5wdXRbMF0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXHRpbnB1dFsxXS5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikgJiYgXG5cdFx0XHRcdFx0XHRpbnB1dFszXSA9PSB0cnVlIDogLy8gbmV3IGltYWdlXG5cdFx0XHRcdC8vIHVwZGF0ZSB0aGUgTW9kZWxcblx0XHRcdFx0TW9kZWwuZWxlbWVudHMucHVzaChpbnB1dCk7XG5cdFx0XHRcdC8vIGRyb3AgZmlsZVxuXHRcdFx0XHRkcm9wRmlsZShwYWdlLCBpbnB1dFsxXSwgaW5wdXRbMF0pO1xuXHRcdFx0XHQvLyBhZGQgYm9udXMgdGltZVxuXHRcdFx0XHRhZGR0aW1lKDEwMDApO1xuXHRcdFx0XHQvLyBjcml0aWMgc3BlYWtcblx0XHRcdFx0Y3JpdGljKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcdGlucHV0WzFdLmluY2x1ZGVzKFwiZGF0YTp0ZXh0L3BsYWluXCIpICYmIFxuXHRcdFx0XHRcdFx0aW5wdXRbM10gPT0gdHJ1ZSA6IC8vIG5ldyB0ZXh0XG5cdFx0XHRcdC8vIHVwZGF0ZSB0aGUgTW9kZWxcblx0XHRcdFx0TW9kZWwuZWxlbWVudHMucHVzaChpbnB1dCk7XG5cdFx0XHRcdC8vIGRyb3AgZmlsZVxuXHRcdFx0XHRkcm9wRmlsZShwYWdlLCBpbnB1dFsxXSwgaW5wdXRbMF0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXHQhaW5wdXRbMV0uaW5jbHVkZXMoXCJkYXRhOmltYWdlXCIpICYmXG5cdFx0XHRcdFx0XHQhaW5wdXRbMV0uaW5jbHVkZXMoXCJkYXRhOnRleHQvcGxhaW5cIikgOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG5cdFx0XHRcdG5vdEFuSW1hZ2UoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGlucHV0ICYmIE1vZGVsLmV4cGlyZWQgPT0gdHJ1ZSkgeyAvLyB0b28gbGF0ZVxuXHRcdExhdGVEcm9wRmlsZSgpO1xuXHR9XG59XG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxudmFyIHggPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0TW9kZWwudGltZUxlZnQgPSBNb2RlbC50aW1lTGVmdCAtIDEwO1xuXHRjb250cm9sbGVyKE1vZGVsKTtcbn0sIDEwKTtcblxuZnVuY3Rpb24gYWRkdGltZShib251c1RpbWUpIHtcblx0TW9kZWwudGltZUxlZnQgPSBNb2RlbC50aW1lTGVmdCArIGJvbnVzVGltZTtcbn1cblxuLy8gZHJvcEZpbGVcblxucGFnZXMub24oXCJkcmFnb3ZlclwiLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbiAgJCh0aGlzKS5hZGRDbGFzcygnZHJhZ292ZXInKTtcbn0pO1xucGFnZXMub24oXCJkcmFnbGVhdmVcIiwgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG4gICQodGhpcykucmVtb3ZlQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKFwiZHJvcFwiLCBmdW5jdGlvbihlKSB7XG4gICQodGhpcykucmVtb3ZlQ2xhc3MoJ2RyYWdvdmVyJyk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgY29uc29sZS5sb2coZSk7XG4gIHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXNcbiAgdmFyIHkgPSAwO1xuICBmb3IgKHZhciBpID0gZmlsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0ICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHQgIHZhciBwYWdlSWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XG5cdCAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuXHQgICAgY29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcblx0ICAgIC8vIGlkLCB1cmwsIHNpemUsIHBvcywgcm90YXRpb24/LCB2aXNpYmxlXG5cdCAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdCAgICBcdGNvbnRyb2xsZXIoTW9kZWwsIHBhZ2VJZCwgW21ha2VJZCgpLCBldmVudC50YXJnZXQucmVzdWx0LCBbMCwwLDAsMCwwXSwgdHJ1ZV0gKTtcblx0ICBcdH0sIHkgKiBkcm9wRGVsYXkpO1xuXHQgIFx0eSArPSAxO1xuXHQgIH07XG5cdCAgY29uc29sZS5sb2coZmlsZXNbaV0pO1xuXHQgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGVzW2ldKTtcbiAgfVxuXHRyZXR1cm4gZmFsc2U7XG59KTtcbi8vIHByZXZlbnQgZHJvcCBvbiBib2R5XG4kKCdib2R5Jykub24oXCJkcmFnb3ZlclwiLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKFwiZHJhZ2xlYXZlXCIsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oXCJkcm9wXCIsIGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBTb3VuZC5lcnJvcigpO1xufSk7XG5cbi8vIHJlbW92ZSBlbGVtZW50XG4kKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNsb3NlJywgZnVuY3Rpb24gKCkge1xuXHR2YXIgcGFnZUlkID0gJCh0aGlzKS5jbG9zZXN0KCcucGFnZScpLmF0dHIoJ2lkJyk7XG5cdHZhciBlbGVtZW50SWQgPSAkKHRoaXMpLnBhcmVudCgpLmF0dHIoJ2lkJyk7XG5cdHZhciBlbGVtZW50U3JjID0gJCh0aGlzKS5zaWJsaW5ncygpLmF0dHIoJ3NyYycpO1xuXHRjb250cm9sbGVyKE1vZGVsLCBwYWdlSWQsIFtlbGVtZW50SWQsIGVsZW1lbnRTcmMsIFswLDAsMCwwLDBdLCBmYWxzZV0pO1xufSk7XG5cbi8vIC0tLSBWSUVXXG5cbmZ1bmN0aW9uIHNob3dUaW1lKE1vZGVsKSB7XG5cdHNlY29uZHMgPSBNb2RlbC50aW1lTGVmdCAvIDEwMDA7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY291bnRlclwiKS5pbm5lckhUTUwgPSBzZWNvbmRzLnRvRml4ZWQoMikgKyBcIiBzZWNvbmRzIGxlZnQhXCI7XG59XG5cbmZ1bmN0aW9uIHNob3dFeHBpcmVkKCkge1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdW50ZXJcIikuaW5uZXJIVE1MID0gXCJleHBpcmVkIVwiO1xuXHQkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpeyBcblx0XHR3aW5kb3cucHJpbnQoKTsgXG5cdH0sIDEwMDApO1xuXHRjbGVhckludGVydmFsKHgpO1xufVxuXG5mdW5jdGlvbiBub3RBbkltYWdlKCkge1xuXHRTb3VuZC5lcnJvcigpO1xuXHRhbGVydCgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgbm90IGFuIGltYWdlIScpO1xufVxuXG5mdW5jdGlvbiBkcm9wRmlsZShwYWdlSWQsIHNyYywgaWQpIHtcblx0aWYgKHNyYy5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikpIHtcblx0XHR2YXIgcGFnZUVsZW1lbnRDb250ZW50ID0gJChcIjxpbWc+XCIsIHtcInNyY1wiOiBzcmN9KTtcblx0fSBlbHNlIHtcblx0XHR2YXIgZGVCYXNlZFRleHQgPSBhdG9iKCBzcmMuc3Vic3RyaW5nKDIzKSApO1xuXHRcdHZhciBodG1sQnJUZXh0ID0gZGVCYXNlZFRleHQucmVwbGFjZSgvXFxuL2csIFwiPGJyLz5cIik7IFxuXHRcdGNvbnNvbGUubG9nKGh0bWxCclRleHQpO1xuXHRcdHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKFwiPHA+XCIpLmFwcGVuZChodG1sQnJUZXh0KTsgLy8gcmVtb3ZlIFwiZGF0YTp0ZXh0L3BsYWluO2Jhc2U2NFwiXG5cdH1cblx0dmFyIHBhZ2VFbGVtZW50ID0gJChcIjxkaXY+XCIsIHtcImNsYXNzXCI6IFwicGFnZS1lbGVtZW50IGRyYWdnYWJsZVwifSk7XG5cdHZhciBwYWdlRWxlbWVudENsb3NlID0gJChcIjxzcGFuPlwiLCB7XCJjbGFzc1wiOiBcImNsb3NlXCJ9KS50ZXh0KCd4Jyk7XG5cdHBhZ2VFbGVtZW50LmFwcGVuZChwYWdlRWxlbWVudENvbnRlbnQsIHBhZ2VFbGVtZW50Q2xvc2UpO1xuXHRwYWdlRWxlbWVudC5hdHRyKCdpZCcsIGlkKTtcblx0JCgnIycgKyBwYWdlSWQpLmFwcGVuZChwYWdlRWxlbWVudCk7XG5cdC8vIHJlYWQgc2l6ZSwgcG9zLCByb3QgYW5kIGFkZCB0aGVtIHRvIE1vZGVsXG5cdGVsZW1lbnRQb3MgPSBbXG5cdFx0cGFnZUVsZW1lbnQucG9zaXRpb24oKS5sZWZ0LFxuXHRcdHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkudG9wLFxuXHRcdHBhZ2VFbGVtZW50LndpZHRoKCksXG5cdFx0cGFnZUVsZW1lbnQuaGVpZ2h0KCksXG5cdFx0MCAvLyByb3RhdGlvbiAoVE9ETylcblx0XTtcblx0Zm9yKHZhciBpID0gMCA7IGkgPCBNb2RlbC5lbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdGlmIChNb2RlbC5lbGVtZW50c1tpXVswXSA9PSBpZCkge1xuXHRcdFx0TW9kZWwuZWxlbWVudHNbaV1bMl0gPSBlbGVtZW50UG9zO1xuXHRcdH1cblx0fVxuXHRTb3VuZC5kaW5nKCk7XG59XG5cbmZ1bmN0aW9uIExhdGVEcm9wRmlsZShzcmMpIHtcblx0YWxlcnQoJ3RvbyBsYXRlIGJybycpO1xufVxuXG5mdW5jdGlvbiBub0RyYWcoKSB7XG5cdHZhciBlbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJhZ2dhYmxlXCIpO1xuICBcdFtdLmZvckVhY2guY2FsbChlbGVtcywgZnVuY3Rpb24oZWwpIHtcbiAgICBcdGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnZ2FibGVcIik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcml0aWMoKSB7XG5cdGNyaXRpY1BvcHVwLmlubmVySFRNTCA9ICdNYWtlIHRoaXMgaW1hZ2UgYmlnZ2VyIHBscyEnO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50KGlkKSB7XG5cdCQoJyMnICsgaWQpLmhpZGUoKTtcblx0Y29uc29sZS5sb2coaWQpO1xufVxuXG5pbnRlcmFjdCgnLmRyYWdnYWJsZScpXG5cdC5kcmFnZ2FibGUoe1xuXHRcdG9ubW92ZTogd2luZG93LmRyYWdNb3ZlTGlzdGVuZXIsXG5cdFx0cmVzdHJpY3Q6IHtcblx0XHRcdHJlc3RyaWN0aW9uOiAncGFyZW50Jyxcblx0XHRcdGVsZW1lbnRSZWN0OiB7XG5cdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0bGVmdDogMCxcblx0XHRcdFx0Ym90dG9tOiAxLFxuXHRcdFx0XHRyaWdodDogMVxuXHRcdFx0fVxuXHRcdH0sXG5cdH0pXG5cdC5yZXNpemFibGUoe1xuXHRcdC8vIHJlc2l6ZSBmcm9tIGFsbCBlZGdlcyBhbmQgY29ybmVyc1xuXHRcdGVkZ2VzOiB7XG5cdFx0XHRsZWZ0OiB0cnVlLFxuXHRcdFx0cmlnaHQ6IHRydWUsXG5cdFx0XHRib3R0b206IHRydWUsXG5cdFx0XHR0b3A6IHRydWVcblx0XHR9LFxuXG5cdFx0Ly8ga2VlcCB0aGUgZWRnZXMgaW5zaWRlIHRoZSBwYXJlbnRcblx0XHRyZXN0cmljdEVkZ2VzOiB7XG5cdFx0XHRvdXRlcjogJ3BhcmVudCcsXG5cdFx0XHRlbmRPbmx5OiB0cnVlLFxuXHRcdH0sXG5cblx0XHRpbmVydGlhOiB0cnVlLFxuXHR9KVxuXHQub24oJ3Jlc2l6ZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0XHR4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDApLFxuXHRcdFx0eSA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwKTtcblxuXHRcdC8vIHVwZGF0ZSB0aGUgZWxlbWVudCdzIHN0eWxlXG5cdFx0dGFyZ2V0LnN0eWxlLndpZHRoID0gZXZlbnQucmVjdC53aWR0aCArICdweCc7XG5cdFx0dGFyZ2V0LnN0eWxlLmhlaWdodCA9IGV2ZW50LnJlY3QuaGVpZ2h0ICsgJ3B4JztcblxuXHRcdC8vIHRyYW5zbGF0ZSB3aGVuIHJlc2l6aW5nIGZyb20gdG9wIG9yIGxlZnQgZWRnZXNcblx0XHR4ICs9IGV2ZW50LmRlbHRhUmVjdC5sZWZ0O1xuXHRcdHkgKz0gZXZlbnQuZGVsdGFSZWN0LnRvcDtcblxuXHRcdHRhcmdldC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSB0YXJnZXQuc3R5bGUudHJhbnNmb3JtID1cblx0XHRcdCd0cmFuc2xhdGUoJyArIHggKyAncHgsJyArIHkgKyAncHgpJztcblxuXHRcdHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgpO1xuXHRcdHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteScsIHkpO1xuXHR9KTtcblxuZnVuY3Rpb24gZHJhZ01vdmVMaXN0ZW5lcihldmVudCkge1xuXHR2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdC8vIGtlZXAgdGhlIGRyYWdnZWQgcG9zaXRpb24gaW4gdGhlIGRhdGEteC9kYXRhLXkgYXR0cmlidXRlc1xuXHRcdHggPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCkgKyBldmVudC5keCxcblx0XHR5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDApICsgZXZlbnQuZHk7XG5cblx0Ly8gdHJhbnNsYXRlIHRoZSBlbGVtZW50XG5cdHRhcmdldC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPVxuXHRcdHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPVxuXHRcdCd0cmFuc2xhdGUoJyArIHggKyAncHgsICcgKyB5ICsgJ3B4KSc7XG5cblx0Ly8gdXBkYXRlIHRoZSBwb3NpaW9uIGF0dHJpYnV0ZXNcblx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG5cdHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteScsIHkpO1xuXG5cdC8vIHVwZGF0ZSB6LWluZGV4XG5cdHZhciBtYXh6SW5kZXggPSAwLFxuXHRcdGkgPSAwO1xuXHRwYWdlRWxlbWVudHMgPSAkKCcjJyArIHRhcmdldC5pZCkucGFyZW50KCkuY2hpbGRyZW4oKTtcblx0cGFnZUVsZW1lbnRzLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdGkgKz0gMTtcblx0XHRpZiAoICQodGhpcykuY3NzKFwiei1pbmRleFwiKSA+PSBtYXh6SW5kZXggKSB7XG5cdFx0XHRtYXh6SW5kZXggPSBwYXJzZUludCgkKHRoaXMpLmNzcyhcInotaW5kZXhcIikpO1xuXHRcdH1cblx0XHRpZihpID09IHBhZ2VFbGVtZW50cy5sZW5ndGgpIHtcblx0XHRcdGlmICh0YXJnZXQuc3R5bGUuekluZGV4ICE9IG1heHpJbmRleCB8IHRhcmdldC5zdHlsZS56SW5kZXggPT0gMCkge1xuICAgIFx0XHR0YXJnZXQuc3R5bGUuekluZGV4ID0gbWF4ekluZGV4ICsgMTtcbiAgICBcdH1cbiAgXHR9XG5cdH0pO1xuXHQvLyB0YXJnZXQuc3R5bGUuekluZGV4ID0gbWF4ekluZGV4ICsgMTtcbn1cblxuLy8gdGhpcyBpcyB1c2VkIGxhdGVyIGluIHRoZSByZXNpemluZyBhbmQgZ2VzdHVyZSBkZW1vc1xud2luZG93LmRyYWdNb3ZlTGlzdGVuZXIgPSBkcmFnTW92ZUxpc3RlbmVyO1xuXG5cbi8vIC8vIG1ha2UgcGRmXG4vLyB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwMScpO1xuLy8gJCgnI3AxJykuY2xpY2soZnVuY3Rpb24oKXtcbi8vIFx0aHRtbDJwZGYoZWxlbWVudCwge1xuLy8gXHQgIG1hcmdpbjogICAgICAgMSxcbi8vIFx0ICBmaWxlbmFtZTogICAgICdteWZpbGUucGRmJyxcbi8vIFx0ICBpbWFnZTogICAgICAgIHsgdHlwZTogJ2pwZWcnLCBxdWFsaXR5OiAwLjk4IH0sXG4vLyBcdCAgaHRtbDJjYW52YXM6ICB7IGRwaTogNzIsIGxldHRlclJlbmRlcmluZzogdHJ1ZSwgaGVpZ2h0OiAyOTcwLCB3aWR0aDogNTEwMCB9LFxuLy8gXHQgIGpzUERGOiAgICAgICAgeyB1bml0OiAnbW0nLCBmb3JtYXQ6ICdBNCcsIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnIH1cbi8vIFx0fSk7XG4vLyB9KTtcblxuXG4vLyAtLS0gQVJDSElWRVxuXG4kLmFqYXgoe1xuXHR1cmw6IFwiaHR0cDovL2xvY2FsaG9zdDoyODAxNy90ZXN0XCIsXG5cdHR5cGU6ICdnZXQnLFxuXHRkYXRhVHlwZTogJ2pzb25wJyxcblx0anNvbnA6ICdqc29ucCcsIC8vIG1vbmdvZGIgaXMgZXhwZWN0aW5nIHRoYXRcblx0c3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZygnc3VjY2VzcycsIGRhdGEpO1xuICB9LFxuICBlcnJvcjogZnVuY3Rpb24gKFhNTEh0dHBSZXF1ZXN0LCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yVGhyb3duKTtcbiAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbn0pOyJdfQ==
