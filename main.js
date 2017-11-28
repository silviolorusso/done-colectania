// --- M-V-C
var model = {
	// all our states
	time: new Date().getTime(),
	timeLeft: 10000,
	expired: false,
	images: []
};

timer();


function controller(model, input) {

	if (model.timeLeft > 0) {
		showTime(model)
	}
	else {
		model.expired == true;
		showExpired();
	}

	if (input && input.includes("data:image")) {
		console.log('works');
		model.images.push(event.target.result);
	}

}




// --- CONTROLLER

function timer() {
	var x = setInterval(function() {
		model.timeLeft = model.timeLeft - 10;
		controller(model);
	}, 10);
}

function addtime(bonusTime) {
	model.timeLeft = model.timeLeft + bonusTime;
	console.log('added');
}





// --- VIEW

function showTime(model) {
	seconds = model.timeLeft / 1000;
	document.getElementById("counter").innerHTML = seconds.toFixed(2) + " seconds left!";
}

function showExpired() {
	document.getElementById("counter").innerHTML = "expired!";
}

// -------------------------------------

// --- CRITIC

function critic() {
	alert('Make this image bigger pls!');
}

// --- FILE DROP

var holder = document.getElementById('page')

if (typeof window.FileReader === 'undefined') {
	console.log('fail');
}
else {
	console.log('success');
}

holder.ondragover = function() {
	this.className = 'hover';
	return false;
};
holder.ondragend = function() {
	this.className = '';
	return false;
};
holder.ondrop = function(e) {
	this.className = '';
	e.preventDefault();

	if (model.expired == false) {
		// TODO: put the drop in VIEW
		var file = e.dataTransfer.files[0],
			reader = new FileReader();
		reader.onload = function(event) {
			console.log(event.target);
			var img = document.createElement("img");
			img.className += " draggable";
			img.src = event.target.result;
			holder.appendChild(img);


			// model.images.push(event.target.result);
			controller(model, event.target.result);

		};
		console.log(file);
		reader.readAsDataURL(file);
	}

	return false;
};

// --- DRAG
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