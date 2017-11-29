// --- global variables

var pages = $('.page');
var criticPopup = $('#critic');

// --- M-V-C

var model = {
	// all our states
	timeLeft: 5000,
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
  
	if (input && input.includes("data:image") && model.expired == false) {
		
		// update the model
		model.images.push(input);
		// drop file
		dropFile(page, input);
		// add bonus time
		addtime(10000);
		// critic speak
		critic();

	} else if (input && !input.includes("data:image")) {
		
		notAnImage();
	
	} else if (input && model.expired == true) {
		
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
    controller(model, pageId, event.target.result);
  };
  console.log(file);
  reader.readAsDataURL(file);

	return false;
});

// remove picture
// add del option
$(document).on('click', '.close', function () {
	var pageId = $(this).closest('.page').attr('id');
	console.log(pageId);
	controller(model, pageId, event.target.result);
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
	alert('The file you dropped is not an image!');
}

function dropFile(pageId, src) {
	var pageElement = $("<div>", {"class": "page-element draggable"});
	var pageElementContent = $("<img>", {"src": src});
	var pageElementClose = $("<span>", {"class": "close"}).text('x');
	pageElement.append(pageElementContent, pageElementClose);
	$('#' + pageId).append(pageElement);
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

