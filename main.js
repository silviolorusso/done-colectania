// --- global variables

var holder = document.getElementById('page');
var criticPopup = document.getElementById('critic');

// --- M-V-C

var model = {
	// all our states
	time: new Date().getTime(),
	timeLeft: 10000,
	expired: false,
	images: []
};

function controller(model, input) {

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
		dropFile(input);
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

function timer() {
	var x = setInterval(function() {
		model.timeLeft = model.timeLeft - 10;
		controller(model);
	}, 10);
}
timer();

function addtime(bonusTime) {
	model.timeLeft = model.timeLeft + bonusTime;
}

// dropFile
holder.ondragover = function() {
	this.className = 'hover';
	return false;
};
holder.ondragend = function() {
	this.className = '';
	return false;
};
holder.ondrop = function (e) {
  this.className = '';
  e.preventDefault();
  var file = e.dataTransfer.files[0], 
      reader = new FileReader();
  reader.onload = function (event) {
    console.log(event.target);
    controller(model, event.target.result);
  };
  console.log(file);
  reader.readAsDataURL(file);

	return false;
};


// --- VIEW

function showTime(model) {
	seconds = model.timeLeft / 1000;
	document.getElementById("counter").innerHTML = seconds.toFixed(2) + " seconds left!";
}

function showExpired() {
	document.getElementById("counter").innerHTML = "expired!";
}

function notAnImage() {
	alert('The file you dropped is not an image!');
}

function dropFile(src) {
	var img = document.createElement("img");
	img.className += " draggable";
	img.src = src;
	holder.appendChild(img);
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
		target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
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

