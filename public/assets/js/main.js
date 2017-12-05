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
	timeLeft: 100000,
	expired: false,
	images: []
};

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
  
	if ( input && input[1].includes("data:image") && input[3] == true && Model.expired == false) { // new element
		// update the Model
		Model.images.push(input);
		// drop file
		dropFile(page, input[1], input[0]);
		// add bonus time
		addtime(10000);
		// critic speak
		critic();
	} else if ( input && !input[1].includes("data:image") && Model.expired == false) { // not an image
		notAnImage();
	} else if (input && input[3] == false && Model.expired == false) { // deleting an element
		removeElement(input[0]);
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
	var pageElement = $("<div>", {"class": "page-element draggable"});
	var pageElementContent = $("<img>", {"src": src});
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
	for(var i = 0 ; i < Model.images.length; i += 1) {
		if (Model.images[i][0] == id) {
			Model.images[i][2] = elementPos;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0gZ2xvYmFsIHZhcmlhYmxlc1xuXG52YXIgcGFnZXMgPSAkKCcucGFnZScpO1xudmFyIGNyaXRpY1BvcHVwID0gJCgnI2NyaXRpYycpO1xudmFyIGRyb3BEZWxheSA9IDEwMDtcblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcblx0dmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcblx0dmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG5cdHJldHVybiBpZDsgXG59XG5cbnZhciBTb3VuZCA9IHtcblx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2luY29ycmVjdC5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH0sXG5cdGRpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9XG59O1xuXG4vLyAtLS0gTS1WLUNcblxudmFyIE1vZGVsID0ge1xuXHQvLyBhbGwgb3VyIHN0YXRlc1xuXHR0aW1lTGVmdDogMTAwMDAwLFxuXHRleHBpcmVkOiBmYWxzZSxcblx0aW1hZ2VzOiBbXVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihNb2RlbCwgcGFnZSwgaW5wdXQpIHtcblxuXHQvLyBleHBpcmVkP1xuXHRpZiAoTW9kZWwudGltZUxlZnQgPiAwKSB7XG5cdFx0c2hvd1RpbWUoTW9kZWwpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdE1vZGVsLmV4cGlyZWQgPSB0cnVlO1xuXHRcdHNob3dFeHBpcmVkKE1vZGVsKTtcblx0XHRub0RyYWcoKTtcblx0fVxuICBcblx0aWYgKCBpbnB1dCAmJiBpbnB1dFsxXS5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikgJiYgaW5wdXRbM10gPT0gdHJ1ZSAmJiBNb2RlbC5leHBpcmVkID09IGZhbHNlKSB7IC8vIG5ldyBlbGVtZW50XG5cdFx0Ly8gdXBkYXRlIHRoZSBNb2RlbFxuXHRcdE1vZGVsLmltYWdlcy5wdXNoKGlucHV0KTtcblx0XHQvLyBkcm9wIGZpbGVcblx0XHRkcm9wRmlsZShwYWdlLCBpbnB1dFsxXSwgaW5wdXRbMF0pO1xuXHRcdC8vIGFkZCBib251cyB0aW1lXG5cdFx0YWRkdGltZSgxMDAwMCk7XG5cdFx0Ly8gY3JpdGljIHNwZWFrXG5cdFx0Y3JpdGljKCk7XG5cdH0gZWxzZSBpZiAoIGlucHV0ICYmICFpbnB1dFsxXS5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikgJiYgTW9kZWwuZXhwaXJlZCA9PSBmYWxzZSkgeyAvLyBub3QgYW4gaW1hZ2Vcblx0XHRub3RBbkltYWdlKCk7XG5cdH0gZWxzZSBpZiAoaW5wdXQgJiYgaW5wdXRbM10gPT0gZmFsc2UgJiYgTW9kZWwuZXhwaXJlZCA9PSBmYWxzZSkgeyAvLyBkZWxldGluZyBhbiBlbGVtZW50XG5cdFx0cmVtb3ZlRWxlbWVudChpbnB1dFswXSk7XG5cdH0gZWxzZSBpZiAoaW5wdXQgJiYgTW9kZWwuZXhwaXJlZCA9PSB0cnVlKSB7IC8vIHRvbyBsYXRlXG5cdFx0TGF0ZURyb3BGaWxlKCk7XG5cdH1cbn1cblxuXG4vLyAtLS0gQ09OVFJPTExFUlxuXG52YXIgeCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRNb2RlbC50aW1lTGVmdCA9IE1vZGVsLnRpbWVMZWZ0IC0gMTA7XG5cdGNvbnRyb2xsZXIoTW9kZWwpO1xufSwgMTApO1xuXG5mdW5jdGlvbiBhZGR0aW1lKGJvbnVzVGltZSkge1xuXHRNb2RlbC50aW1lTGVmdCA9IE1vZGVsLnRpbWVMZWZ0ICsgYm9udXNUaW1lO1xufVxuXG4vLyBkcm9wRmlsZVxuXG5wYWdlcy5vbihcImRyYWdvdmVyXCIsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKHRoaXMpLmFkZENsYXNzKCdkcmFnb3ZlcicpO1xufSk7XG5wYWdlcy5vbihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbiAgJCh0aGlzKS5yZW1vdmVDbGFzcygnZHJhZ292ZXInKTtcbn0pO1xucGFnZXMub24oXCJkcm9wXCIsIGZ1bmN0aW9uKGUpIHtcbiAgJCh0aGlzKS5yZW1vdmVDbGFzcygnZHJhZ292ZXInKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zb2xlLmxvZyhlKTtcbiAgdmFyIGZpbGVzID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5maWxlc1xuICB2YXIgeSA9IDA7XG4gIGZvciAodmFyIGkgPSBmaWxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHQgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdCAgdmFyIHBhZ2VJZCA9ICQodGhpcykuYXR0cignaWQnKTtcblx0ICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdCAgICBjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xuXHQgICAgLy8gaWQsIHVybCwgc2l6ZSwgcG9zLCByb3RhdGlvbj8sIHZpc2libGVcblx0ICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0ICAgIFx0Y29udHJvbGxlcihNb2RlbCwgcGFnZUlkLCBbbWFrZUlkKCksIGV2ZW50LnRhcmdldC5yZXN1bHQsIFswLDAsMCwwLDBdLCB0cnVlXSApO1xuXHQgIFx0fSwgeSAqIGRyb3BEZWxheSk7XG5cdCAgXHR5ICs9IDE7XG5cdCAgfTtcblx0ICBjb25zb2xlLmxvZyhmaWxlc1tpXSk7XG5cdCAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZXNbaV0pO1xuICB9XG5cdHJldHVybiBmYWxzZTtcbn0pO1xuLy8gcHJldmVudCBkcm9wIG9uIGJvZHlcbiQoJ2JvZHknKS5vbihcImRyYWdvdmVyXCIsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oXCJkcmFnbGVhdmVcIiwgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbihcImRyb3BcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIFNvdW5kLmVycm9yKCk7XG59KTtcblxuLy8gcmVtb3ZlIGVsZW1lbnRcbiQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuY2xvc2UnLCBmdW5jdGlvbiAoKSB7XG5cdHZhciBwYWdlSWQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnRJZCA9ICQodGhpcykucGFyZW50KCkuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnRTcmMgPSAkKHRoaXMpLnNpYmxpbmdzKCkuYXR0cignc3JjJyk7XG5cdGNvbnRyb2xsZXIoTW9kZWwsIHBhZ2VJZCwgW2VsZW1lbnRJZCwgZWxlbWVudFNyYywgWzAsMCwwLDAsMF0sIGZhbHNlXSk7XG59KTtcblxuLy8gLS0tIFZJRVdcblxuZnVuY3Rpb24gc2hvd1RpbWUoTW9kZWwpIHtcblx0c2Vjb25kcyA9IE1vZGVsLnRpbWVMZWZ0IC8gMTAwMDtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3VudGVyXCIpLmlubmVySFRNTCA9IHNlY29uZHMudG9GaXhlZCgyKSArIFwiIHNlY29uZHMgbGVmdCFcIjtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY291bnRlclwiKS5pbm5lckhUTUwgPSBcImV4cGlyZWQhXCI7XG5cdCQoJ2JvZHknKS5hZGRDbGFzcygnZXhwaXJlZCcpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IFxuXHRcdHdpbmRvdy5wcmludCgpOyBcblx0fSwgMTAwMCk7XG5cdGNsZWFySW50ZXJ2YWwoeCk7XG59XG5cbmZ1bmN0aW9uIG5vdEFuSW1hZ2UoKSB7XG5cdFNvdW5kLmVycm9yKCk7XG5cdGFsZXJ0KCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyBub3QgYW4gaW1hZ2UhJyk7XG59XG5cbmZ1bmN0aW9uIGRyb3BGaWxlKHBhZ2VJZCwgc3JjLCBpZCkge1xuXHR2YXIgcGFnZUVsZW1lbnQgPSAkKFwiPGRpdj5cIiwge1wiY2xhc3NcIjogXCJwYWdlLWVsZW1lbnQgZHJhZ2dhYmxlXCJ9KTtcblx0dmFyIHBhZ2VFbGVtZW50Q29udGVudCA9ICQoXCI8aW1nPlwiLCB7XCJzcmNcIjogc3JjfSk7XG5cdHZhciBwYWdlRWxlbWVudENsb3NlID0gJChcIjxzcGFuPlwiLCB7XCJjbGFzc1wiOiBcImNsb3NlXCJ9KS50ZXh0KCd4Jyk7XG5cdHBhZ2VFbGVtZW50LmFwcGVuZChwYWdlRWxlbWVudENvbnRlbnQsIHBhZ2VFbGVtZW50Q2xvc2UpO1xuXHRwYWdlRWxlbWVudC5hdHRyKCdpZCcsIGlkKTtcblx0JCgnIycgKyBwYWdlSWQpLmFwcGVuZChwYWdlRWxlbWVudCk7XG5cdC8vIHJlYWQgc2l6ZSwgcG9zLCByb3QgYW5kIGFkZCB0aGVtIHRvIE1vZGVsXG5cdGVsZW1lbnRQb3MgPSBbXG5cdFx0cGFnZUVsZW1lbnQucG9zaXRpb24oKS5sZWZ0LFxuXHRcdHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkudG9wLFxuXHRcdHBhZ2VFbGVtZW50LndpZHRoKCksXG5cdFx0cGFnZUVsZW1lbnQuaGVpZ2h0KCksXG5cdFx0MCAvLyByb3RhdGlvbiAoVE9ETylcblx0XTtcblx0Zm9yKHZhciBpID0gMCA7IGkgPCBNb2RlbC5pbWFnZXMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRpZiAoTW9kZWwuaW1hZ2VzW2ldWzBdID09IGlkKSB7XG5cdFx0XHRNb2RlbC5pbWFnZXNbaV1bMl0gPSBlbGVtZW50UG9zO1xuXHRcdH1cblx0fVxuXHRTb3VuZC5kaW5nKCk7XG59XG5cbmZ1bmN0aW9uIExhdGVEcm9wRmlsZShzcmMpIHtcblx0YWxlcnQoJ3RvbyBsYXRlIGJybycpO1xufVxuXG5mdW5jdGlvbiBub0RyYWcoKSB7XG5cdHZhciBlbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJhZ2dhYmxlXCIpO1xuICBcdFtdLmZvckVhY2guY2FsbChlbGVtcywgZnVuY3Rpb24oZWwpIHtcbiAgICBcdGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnZ2FibGVcIik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcml0aWMoKSB7XG5cdGNyaXRpY1BvcHVwLmlubmVySFRNTCA9ICdNYWtlIHRoaXMgaW1hZ2UgYmlnZ2VyIHBscyEnO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50KGlkKSB7XG5cdCQoJyMnICsgaWQpLmhpZGUoKTtcblx0Y29uc29sZS5sb2coaWQpO1xufVxuXG5pbnRlcmFjdCgnLmRyYWdnYWJsZScpXG5cdC5kcmFnZ2FibGUoe1xuXHRcdG9ubW92ZTogd2luZG93LmRyYWdNb3ZlTGlzdGVuZXIsXG5cdFx0cmVzdHJpY3Q6IHtcblx0XHRcdHJlc3RyaWN0aW9uOiAncGFyZW50Jyxcblx0XHRcdGVsZW1lbnRSZWN0OiB7XG5cdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0bGVmdDogMCxcblx0XHRcdFx0Ym90dG9tOiAxLFxuXHRcdFx0XHRyaWdodDogMVxuXHRcdFx0fVxuXHRcdH0sXG5cdH0pXG5cdC5yZXNpemFibGUoe1xuXHRcdC8vIHJlc2l6ZSBmcm9tIGFsbCBlZGdlcyBhbmQgY29ybmVyc1xuXHRcdGVkZ2VzOiB7XG5cdFx0XHRsZWZ0OiB0cnVlLFxuXHRcdFx0cmlnaHQ6IHRydWUsXG5cdFx0XHRib3R0b206IHRydWUsXG5cdFx0XHR0b3A6IHRydWVcblx0XHR9LFxuXG5cdFx0Ly8ga2VlcCB0aGUgZWRnZXMgaW5zaWRlIHRoZSBwYXJlbnRcblx0XHRyZXN0cmljdEVkZ2VzOiB7XG5cdFx0XHRvdXRlcjogJ3BhcmVudCcsXG5cdFx0XHRlbmRPbmx5OiB0cnVlLFxuXHRcdH0sXG5cblx0XHRpbmVydGlhOiB0cnVlLFxuXHR9KVxuXHQub24oJ3Jlc2l6ZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0XHR4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDApLFxuXHRcdFx0eSA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwKTtcblxuXHRcdC8vIHVwZGF0ZSB0aGUgZWxlbWVudCdzIHN0eWxlXG5cdFx0dGFyZ2V0LnN0eWxlLndpZHRoID0gZXZlbnQucmVjdC53aWR0aCArICdweCc7XG5cdFx0dGFyZ2V0LnN0eWxlLmhlaWdodCA9IGV2ZW50LnJlY3QuaGVpZ2h0ICsgJ3B4JztcblxuXHRcdC8vIHRyYW5zbGF0ZSB3aGVuIHJlc2l6aW5nIGZyb20gdG9wIG9yIGxlZnQgZWRnZXNcblx0XHR4ICs9IGV2ZW50LmRlbHRhUmVjdC5sZWZ0O1xuXHRcdHkgKz0gZXZlbnQuZGVsdGFSZWN0LnRvcDtcblxuXHRcdHRhcmdldC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSB0YXJnZXQuc3R5bGUudHJhbnNmb3JtID1cblx0XHRcdCd0cmFuc2xhdGUoJyArIHggKyAncHgsJyArIHkgKyAncHgpJztcblxuXHRcdHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgpO1xuXHRcdHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteScsIHkpO1xuXHR9KTtcblxuZnVuY3Rpb24gZHJhZ01vdmVMaXN0ZW5lcihldmVudCkge1xuXHR2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdC8vIGtlZXAgdGhlIGRyYWdnZWQgcG9zaXRpb24gaW4gdGhlIGRhdGEteC9kYXRhLXkgYXR0cmlidXRlc1xuXHRcdHggPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCkgKyBldmVudC5keCxcblx0XHR5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDApICsgZXZlbnQuZHk7XG5cblx0Ly8gdHJhbnNsYXRlIHRoZSBlbGVtZW50XG5cdHRhcmdldC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPVxuXHRcdHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPVxuXHRcdCd0cmFuc2xhdGUoJyArIHggKyAncHgsICcgKyB5ICsgJ3B4KSc7XG5cblx0Ly8gdXBkYXRlIHRoZSBwb3NpaW9uIGF0dHJpYnV0ZXNcblx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG5cdHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteScsIHkpO1xuXG5cdC8vIHVwZGF0ZSB6LWluZGV4XG5cdHZhciBtYXh6SW5kZXggPSAwLFxuXHRcdGkgPSAwO1xuXHRwYWdlRWxlbWVudHMgPSAkKCcjJyArIHRhcmdldC5pZCkucGFyZW50KCkuY2hpbGRyZW4oKTtcblx0cGFnZUVsZW1lbnRzLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdGkgKz0gMTtcblx0XHRpZiAoICQodGhpcykuY3NzKFwiei1pbmRleFwiKSA+PSBtYXh6SW5kZXggKSB7XG5cdFx0XHRtYXh6SW5kZXggPSBwYXJzZUludCgkKHRoaXMpLmNzcyhcInotaW5kZXhcIikpO1xuXHRcdH1cblx0XHRpZihpID09IHBhZ2VFbGVtZW50cy5sZW5ndGgpIHtcblx0XHRcdGlmICh0YXJnZXQuc3R5bGUuekluZGV4ICE9IG1heHpJbmRleCB8IHRhcmdldC5zdHlsZS56SW5kZXggPT0gMCkge1xuICAgIFx0XHR0YXJnZXQuc3R5bGUuekluZGV4ID0gbWF4ekluZGV4ICsgMTtcbiAgICBcdH1cbiAgXHR9XG5cdH0pO1xuXHQvLyB0YXJnZXQuc3R5bGUuekluZGV4ID0gbWF4ekluZGV4ICsgMTtcbn1cblxuLy8gdGhpcyBpcyB1c2VkIGxhdGVyIGluIHRoZSByZXNpemluZyBhbmQgZ2VzdHVyZSBkZW1vc1xud2luZG93LmRyYWdNb3ZlTGlzdGVuZXIgPSBkcmFnTW92ZUxpc3RlbmVyO1xuXG5cbi8vIC8vIG1ha2UgcGRmXG4vLyB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwMScpO1xuLy8gJCgnI3AxJykuY2xpY2soZnVuY3Rpb24oKXtcbi8vIFx0aHRtbDJwZGYoZWxlbWVudCwge1xuLy8gXHQgIG1hcmdpbjogICAgICAgMSxcbi8vIFx0ICBmaWxlbmFtZTogICAgICdteWZpbGUucGRmJyxcbi8vIFx0ICBpbWFnZTogICAgICAgIHsgdHlwZTogJ2pwZWcnLCBxdWFsaXR5OiAwLjk4IH0sXG4vLyBcdCAgaHRtbDJjYW52YXM6ICB7IGRwaTogNzIsIGxldHRlclJlbmRlcmluZzogdHJ1ZSwgaGVpZ2h0OiAyOTcwLCB3aWR0aDogNTEwMCB9LFxuLy8gXHQgIGpzUERGOiAgICAgICAgeyB1bml0OiAnbW0nLCBmb3JtYXQ6ICdBNCcsIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnIH1cbi8vIFx0fSk7XG4vLyB9KTtcbiJdfQ==
