// --- global variables

var pages = $('.page');
var criticPopup = $('#critic');

// --- GENERAL FUNCTIONS

function makeId() {
	var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
	var id = randLetter + Date.now();
	return id; 
}

function errorSound() {
	var audio = new Audio('assets/audio/incorrect.swf.mp3');
	audio.play();
}

// --- M-V-C

var model = {
	// all our states
	timeLeft: 100000,
	expired: false,
	images: []
};

function controller(model, page, input) {

	// expired?
	if (model.timeLeft > 0) {
		showTime(model);
	}
	else {
		model.expired = true;
		showExpired(model);
		noDrag();
	}
  
	if ( input && input[1].includes("data:image") && input[3] == true && model.expired == false) { // new element
		// update the model
		model.images.push(input);
		// drop file
		dropFile(page, input[1], input[0]);
		// add bonus time
		addtime(10000);
		// critic speak
		critic();
	} else if ( input && !input[1].includes("data:image") && model.expired == false) { // not an image
		notAnImage();
	} else if (input && input[3] == false && model.expired == false) { // deleting an element
		removeElement(input[0]);
	} else if (input && model.expired == true) { // too late
		LateDropFile();
	}
}


// --- CONTROLLER

var x = setInterval(function() {
	model.timeLeft = model.timeLeft - 10;
	controller(model);
}, 10);

function addtime(bonusTime) {
	model.timeLeft = model.timeLeft + bonusTime;
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
  var file = e.originalEvent.dataTransfer.files[0], 
      reader = new FileReader();
   var pageId = $(this).attr('id');
  reader.onload = function (event) {
    console.log(event.target);
    // id, url, size, pos, rotation?, visible
    controller(model, pageId, [makeId(), event.target.result, [0,0,0,0,0], true] );
  };
  console.log(file);
  reader.readAsDataURL(file);

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
  errorSound();
});

// remove element
$(document).on('click', '.close', function () {
	var pageId = $(this).closest('.page').attr('id');
	var elementId = $(this).parent().attr('id');
	var elementSrc = $(this).siblings().attr('src');
	controller(model, pageId, [elementId, elementSrc, [0,0,0,0,0], false]);
});

// --- VIEW

function showTime(model) {
	seconds = model.timeLeft / 1000;
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
	errorSound();
	alert('The file you dropped is not an image!');
}

function dropFile(pageId, src, id) {
	var pageElement = $("<div>", {"class": "page-element draggable"});
	var pageElementContent = $("<img>", {"src": src});
	var pageElementClose = $("<span>", {"class": "close"}).text('x');
	pageElement.append(pageElementContent, pageElementClose);
	pageElement.attr('id', id);
	$('#' + pageId).append(pageElement);
	// read size, pos, rot and add them to model
	elementPos = [
		pageElement.position().left,
		pageElement.position().top,
		pageElement.width(),
		pageElement.height(),
		0 // rotation (TODO)
	];
	for(var i = 0 ; i < model.images.length; i += 1) {
		if (model.images[i][0] == id) {
			model.images[i][2] = elementPos;
		}
	} 
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
}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;

