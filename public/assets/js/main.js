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
	timeLeft: 30000,
	expired: false,
	elements: []
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBnbG9iYWwgdmFyaWFibGVzXG5cbnZhciBwYWdlcyA9ICQoJy5wYWdlJyk7XG52YXIgY3JpdGljUG9wdXAgPSAkKCcjY3JpdGljJyk7XG52YXIgZHJvcERlbGF5ID0gMTAwO1xuXG4vLyAtLS0gR0VORVJBTCBGVU5DVElPTlNcblxuZnVuY3Rpb24gbWFrZUlkKCkge1xuXHR2YXIgcmFuZExldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNikpO1xuXHR2YXIgaWQgPSByYW5kTGV0dGVyICsgRGF0ZS5ub3coKTtcblx0cmV0dXJuIGlkOyBcbn1cblxudmFyIFNvdW5kID0ge1xuXHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vaW5jb3JyZWN0Lm1wMycpO1xuXHRcdGF1ZGlvLnBsYXkoKTtcblx0fSxcblx0ZGluZzogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vZGluZy5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH1cbn07XG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgTW9kZWwgPSB7XG5cdC8vIGFsbCBvdXIgc3RhdGVzXG5cdHRpbWVMZWZ0OiAzMDAwMCxcblx0ZXhwaXJlZDogZmFsc2UsXG5cdGVsZW1lbnRzOiBbXVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihNb2RlbCwgcGFnZSwgaW5wdXQpIHtcblxuXHQvLyBleHBpcmVkP1xuXHRpZiAoTW9kZWwudGltZUxlZnQgPiAwKSB7XG5cdFx0c2hvd1RpbWUoTW9kZWwpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdE1vZGVsLmV4cGlyZWQgPSB0cnVlO1xuXHRcdHNob3dFeHBpcmVkKE1vZGVsKTtcblx0XHRub0RyYWcoKTtcblx0fVxuICBcbiAgaWYgKGlucHV0ICYmIE1vZGVsLmV4cGlyZWQgPT0gZmFsc2UpIHtcblx0XHRzd2l0Y2ggKHRydWUpIHtcblx0XHRcdGNhc2VcdGlucHV0WzNdID09IGZhbHNlIDogLy8gZGVsZXRpbmcgYW4gZWxlbWVudFxuXHRcdFx0XHRyZW1vdmVFbGVtZW50KGlucHV0WzBdKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFx0aW5wdXRbMV0uaW5jbHVkZXMoXCJkYXRhOmltYWdlXCIpICYmIFxuXHRcdFx0XHRcdFx0aW5wdXRbM10gPT0gdHJ1ZSA6IC8vIG5ldyBpbWFnZVxuXHRcdFx0XHQvLyB1cGRhdGUgdGhlIE1vZGVsXG5cdFx0XHRcdE1vZGVsLmVsZW1lbnRzLnB1c2goaW5wdXQpO1xuXHRcdFx0XHQvLyBkcm9wIGZpbGVcblx0XHRcdFx0ZHJvcEZpbGUocGFnZSwgaW5wdXRbMV0sIGlucHV0WzBdKTtcblx0XHRcdFx0Ly8gYWRkIGJvbnVzIHRpbWVcblx0XHRcdFx0YWRkdGltZSgxMDAwKTtcblx0XHRcdFx0Ly8gY3JpdGljIHNwZWFrXG5cdFx0XHRcdGNyaXRpYygpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXHRpbnB1dFsxXS5pbmNsdWRlcyhcImRhdGE6dGV4dC9wbGFpblwiKSAmJiBcblx0XHRcdFx0XHRcdGlucHV0WzNdID09IHRydWUgOiAvLyBuZXcgdGV4dFxuXHRcdFx0XHQvLyB1cGRhdGUgdGhlIE1vZGVsXG5cdFx0XHRcdE1vZGVsLmVsZW1lbnRzLnB1c2goaW5wdXQpO1xuXHRcdFx0XHQvLyBkcm9wIGZpbGVcblx0XHRcdFx0ZHJvcEZpbGUocGFnZSwgaW5wdXRbMV0sIGlucHV0WzBdKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFx0IWlucHV0WzFdLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSAmJlxuXHRcdFx0XHRcdFx0IWlucHV0WzFdLmluY2x1ZGVzKFwiZGF0YTp0ZXh0L3BsYWluXCIpIDogLy8gbmVpdGhlciBhbiBpbWFnZSBub3IgdGV4dFxuXHRcdFx0XHRub3RBbkltYWdlKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fSBlbHNlIGlmIChpbnB1dCAmJiBNb2RlbC5leHBpcmVkID09IHRydWUpIHsgLy8gdG9vIGxhdGVcblx0XHRMYXRlRHJvcEZpbGUoKTtcblx0fVxufVxuXG5cbi8vIC0tLSBDT05UUk9MTEVSXG5cbnZhciB4ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdE1vZGVsLnRpbWVMZWZ0ID0gTW9kZWwudGltZUxlZnQgLSAxMDtcblx0Y29udHJvbGxlcihNb2RlbCk7XG59LCAxMCk7XG5cbmZ1bmN0aW9uIGFkZHRpbWUoYm9udXNUaW1lKSB7XG5cdE1vZGVsLnRpbWVMZWZ0ID0gTW9kZWwudGltZUxlZnQgKyBib251c1RpbWU7XG59XG5cbi8vIGRyb3BGaWxlXG5cbnBhZ2VzLm9uKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG4gICQodGhpcykuYWRkQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKFwiZHJhZ2xlYXZlXCIsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xufSk7XG5wYWdlcy5vbihcImRyb3BcIiwgZnVuY3Rpb24oZSkge1xuICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnNvbGUubG9nKGUpO1xuICB2YXIgZmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzXG4gIHZhciB5ID0gMDtcbiAgZm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdCAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0ICB2YXIgcGFnZUlkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuXHQgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblx0ICAgIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG5cdCAgICAvLyBpZCwgdXJsLCBzaXplLCBwb3MsIHJvdGF0aW9uPywgdmlzaWJsZVxuXHQgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXHQgICAgXHRjb250cm9sbGVyKE1vZGVsLCBwYWdlSWQsIFttYWtlSWQoKSwgZXZlbnQudGFyZ2V0LnJlc3VsdCwgWzAsMCwwLDAsMF0sIHRydWVdICk7XG5cdCAgXHR9LCB5ICogZHJvcERlbGF5KTtcblx0ICBcdHkgKz0gMTtcblx0ICB9O1xuXHQgIGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcblx0ICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG4gIH1cblx0cmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKFwiZHJvcFwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgU291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudFxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jbG9zZScsIGZ1bmN0aW9uICgpIHtcblx0dmFyIHBhZ2VJZCA9ICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5hdHRyKCdpZCcpO1xuXHR2YXIgZWxlbWVudElkID0gJCh0aGlzKS5wYXJlbnQoKS5hdHRyKCdpZCcpO1xuXHR2YXIgZWxlbWVudFNyYyA9ICQodGhpcykuc2libGluZ3MoKS5hdHRyKCdzcmMnKTtcblx0Y29udHJvbGxlcihNb2RlbCwgcGFnZUlkLCBbZWxlbWVudElkLCBlbGVtZW50U3JjLCBbMCwwLDAsMCwwXSwgZmFsc2VdKTtcbn0pO1xuXG4vLyAtLS0gVklFV1xuXG5mdW5jdGlvbiBzaG93VGltZShNb2RlbCkge1xuXHRzZWNvbmRzID0gTW9kZWwudGltZUxlZnQgLyAxMDAwO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdW50ZXJcIikuaW5uZXJIVE1MID0gc2Vjb25kcy50b0ZpeGVkKDIpICsgXCIgc2Vjb25kcyBsZWZ0IVwiO1xufVxuXG5mdW5jdGlvbiBzaG93RXhwaXJlZCgpIHtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3VudGVyXCIpLmlubmVySFRNTCA9IFwiZXhwaXJlZCFcIjtcblx0JCgnYm9keScpLmFkZENsYXNzKCdleHBpcmVkJyk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgXG5cdFx0d2luZG93LnByaW50KCk7IFxuXHR9LCAxMDAwKTtcblx0Y2xlYXJJbnRlcnZhbCh4KTtcbn1cblxuZnVuY3Rpb24gbm90QW5JbWFnZSgpIHtcblx0U291bmQuZXJyb3IoKTtcblx0YWxlcnQoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIG5vdCBhbiBpbWFnZSEnKTtcbn1cblxuZnVuY3Rpb24gZHJvcEZpbGUocGFnZUlkLCBzcmMsIGlkKSB7XG5cdGlmIChzcmMuaW5jbHVkZXMoXCJkYXRhOmltYWdlXCIpKSB7XG5cdFx0dmFyIHBhZ2VFbGVtZW50Q29udGVudCA9ICQoXCI8aW1nPlwiLCB7XCJzcmNcIjogc3JjfSk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGRlQmFzZWRUZXh0ID0gYXRvYiggc3JjLnN1YnN0cmluZygyMykgKTtcblx0XHR2YXIgaHRtbEJyVGV4dCA9IGRlQmFzZWRUZXh0LnJlcGxhY2UoL1xcbi9nLCBcIjxici8+XCIpOyBcblx0XHRjb25zb2xlLmxvZyhodG1sQnJUZXh0KTtcblx0XHR2YXIgcGFnZUVsZW1lbnRDb250ZW50ID0gJChcIjxwPlwiKS5hcHBlbmQoaHRtbEJyVGV4dCk7IC8vIHJlbW92ZSBcImRhdGE6dGV4dC9wbGFpbjtiYXNlNjRcIlxuXHR9XG5cdHZhciBwYWdlRWxlbWVudCA9ICQoXCI8ZGl2PlwiLCB7XCJjbGFzc1wiOiBcInBhZ2UtZWxlbWVudCBkcmFnZ2FibGVcIn0pO1xuXHR2YXIgcGFnZUVsZW1lbnRDbG9zZSA9ICQoXCI8c3Bhbj5cIiwge1wiY2xhc3NcIjogXCJjbG9zZVwifSkudGV4dCgneCcpO1xuXHRwYWdlRWxlbWVudC5hcHBlbmQocGFnZUVsZW1lbnRDb250ZW50LCBwYWdlRWxlbWVudENsb3NlKTtcblx0cGFnZUVsZW1lbnQuYXR0cignaWQnLCBpZCk7XG5cdCQoJyMnICsgcGFnZUlkKS5hcHBlbmQocGFnZUVsZW1lbnQpO1xuXHQvLyByZWFkIHNpemUsIHBvcywgcm90IGFuZCBhZGQgdGhlbSB0byBNb2RlbFxuXHRlbGVtZW50UG9zID0gW1xuXHRcdHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkubGVmdCxcblx0XHRwYWdlRWxlbWVudC5wb3NpdGlvbigpLnRvcCxcblx0XHRwYWdlRWxlbWVudC53aWR0aCgpLFxuXHRcdHBhZ2VFbGVtZW50LmhlaWdodCgpLFxuXHRcdDAgLy8gcm90YXRpb24gKFRPRE8pXG5cdF07XG5cdGZvcih2YXIgaSA9IDAgOyBpIDwgTW9kZWwuZWxlbWVudHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRpZiAoTW9kZWwuZWxlbWVudHNbaV1bMF0gPT0gaWQpIHtcblx0XHRcdE1vZGVsLmVsZW1lbnRzW2ldWzJdID0gZWxlbWVudFBvcztcblx0XHR9XG5cdH1cblx0U291bmQuZGluZygpO1xufVxuXG5mdW5jdGlvbiBMYXRlRHJvcEZpbGUoc3JjKSB7XG5cdGFsZXJ0KCd0b28gbGF0ZSBicm8nKTtcbn1cblxuZnVuY3Rpb24gbm9EcmFnKCkge1xuXHR2YXIgZWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyYWdnYWJsZVwiKTtcbiAgXHRbXS5mb3JFYWNoLmNhbGwoZWxlbXMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgXHRlbC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJhZ2dhYmxlXCIpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JpdGljKCkge1xuXHRjcml0aWNQb3B1cC5pbm5lckhUTUwgPSAnTWFrZSB0aGlzIGltYWdlIGJpZ2dlciBwbHMhJztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRWxlbWVudChpZCkge1xuXHQkKCcjJyArIGlkKS5oaWRlKCk7XG5cdGNvbnNvbGUubG9nKGlkKTtcbn1cblxuaW50ZXJhY3QoJy5kcmFnZ2FibGUnKVxuXHQuZHJhZ2dhYmxlKHtcblx0XHRvbm1vdmU6IHdpbmRvdy5kcmFnTW92ZUxpc3RlbmVyLFxuXHRcdHJlc3RyaWN0OiB7XG5cdFx0XHRyZXN0cmljdGlvbjogJ3BhcmVudCcsXG5cdFx0XHRlbGVtZW50UmVjdDoge1xuXHRcdFx0XHR0b3A6IDAsXG5cdFx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRcdGJvdHRvbTogMSxcblx0XHRcdFx0cmlnaHQ6IDFcblx0XHRcdH1cblx0XHR9LFxuXHR9KVxuXHQucmVzaXphYmxlKHtcblx0XHQvLyByZXNpemUgZnJvbSBhbGwgZWRnZXMgYW5kIGNvcm5lcnNcblx0XHRlZGdlczoge1xuXHRcdFx0bGVmdDogdHJ1ZSxcblx0XHRcdHJpZ2h0OiB0cnVlLFxuXHRcdFx0Ym90dG9tOiB0cnVlLFxuXHRcdFx0dG9wOiB0cnVlXG5cdFx0fSxcblxuXHRcdC8vIGtlZXAgdGhlIGVkZ2VzIGluc2lkZSB0aGUgcGFyZW50XG5cdFx0cmVzdHJpY3RFZGdlczoge1xuXHRcdFx0b3V0ZXI6ICdwYXJlbnQnLFxuXHRcdFx0ZW5kT25seTogdHJ1ZSxcblx0XHR9LFxuXG5cdFx0aW5lcnRpYTogdHJ1ZSxcblx0fSlcblx0Lm9uKCdyZXNpemVtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdFx0eCA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteCcpKSB8fCAwKSxcblx0XHRcdHkgPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXknKSkgfHwgMCk7XG5cblx0XHQvLyB1cGRhdGUgdGhlIGVsZW1lbnQncyBzdHlsZVxuXHRcdHRhcmdldC5zdHlsZS53aWR0aCA9IGV2ZW50LnJlY3Qud2lkdGggKyAncHgnO1xuXHRcdHRhcmdldC5zdHlsZS5oZWlnaHQgPSBldmVudC5yZWN0LmhlaWdodCArICdweCc7XG5cblx0XHQvLyB0cmFuc2xhdGUgd2hlbiByZXNpemluZyBmcm9tIHRvcCBvciBsZWZ0IGVkZ2VzXG5cdFx0eCArPSBldmVudC5kZWx0YVJlY3QubGVmdDtcblx0XHR5ICs9IGV2ZW50LmRlbHRhUmVjdC50b3A7XG5cblx0XHR0YXJnZXQuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gdGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9XG5cdFx0XHQndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCcgKyB5ICsgJ3B4KSc7XG5cblx0XHR0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KTtcblx0XHR0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KTtcblx0fSk7XG5cbmZ1bmN0aW9uIGRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpIHtcblx0dmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcblx0XHQvLyBrZWVwIHRoZSBkcmFnZ2VkIHBvc2l0aW9uIGluIHRoZSBkYXRhLXgvZGF0YS15IGF0dHJpYnV0ZXNcblx0XHR4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDApICsgZXZlbnQuZHgsXG5cdFx0eSA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwKSArIGV2ZW50LmR5O1xuXG5cdC8vIHRyYW5zbGF0ZSB0aGUgZWxlbWVudFxuXHR0YXJnZXQuc3R5bGUud2Via2l0VHJhbnNmb3JtID1cblx0XHR0YXJnZXQuc3R5bGUudHJhbnNmb3JtID1cblx0XHQndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCAnICsgeSArICdweCknO1xuXG5cdC8vIHVwZGF0ZSB0aGUgcG9zaWlvbiBhdHRyaWJ1dGVzXG5cdHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgpO1xuXHR0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KTtcblxuXHQvLyB1cGRhdGUgei1pbmRleFxuXHR2YXIgbWF4ekluZGV4ID0gMCxcblx0XHRpID0gMDtcblx0cGFnZUVsZW1lbnRzID0gJCgnIycgKyB0YXJnZXQuaWQpLnBhcmVudCgpLmNoaWxkcmVuKCk7XG5cdHBhZ2VFbGVtZW50cy5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRpICs9IDE7XG5cdFx0aWYgKCAkKHRoaXMpLmNzcyhcInotaW5kZXhcIikgPj0gbWF4ekluZGV4ICkge1xuXHRcdFx0bWF4ekluZGV4ID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoXCJ6LWluZGV4XCIpKTtcblx0XHR9XG5cdFx0aWYoaSA9PSBwYWdlRWxlbWVudHMubGVuZ3RoKSB7XG5cdFx0XHRpZiAodGFyZ2V0LnN0eWxlLnpJbmRleCAhPSBtYXh6SW5kZXggfCB0YXJnZXQuc3R5bGUuekluZGV4ID09IDApIHtcbiAgICBcdFx0dGFyZ2V0LnN0eWxlLnpJbmRleCA9IG1heHpJbmRleCArIDE7XG4gICAgXHR9XG4gIFx0fVxuXHR9KTtcblx0Ly8gdGFyZ2V0LnN0eWxlLnpJbmRleCA9IG1heHpJbmRleCArIDE7XG59XG5cbi8vIHRoaXMgaXMgdXNlZCBsYXRlciBpbiB0aGUgcmVzaXppbmcgYW5kIGdlc3R1cmUgZGVtb3NcbndpbmRvdy5kcmFnTW92ZUxpc3RlbmVyID0gZHJhZ01vdmVMaXN0ZW5lcjtcblxuXG4vLyAvLyBtYWtlIHBkZlxuLy8gdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncDEnKTtcbi8vICQoJyNwMScpLmNsaWNrKGZ1bmN0aW9uKCl7XG4vLyBcdGh0bWwycGRmKGVsZW1lbnQsIHtcbi8vIFx0ICBtYXJnaW46ICAgICAgIDEsXG4vLyBcdCAgZmlsZW5hbWU6ICAgICAnbXlmaWxlLnBkZicsXG4vLyBcdCAgaW1hZ2U6ICAgICAgICB7IHR5cGU6ICdqcGVnJywgcXVhbGl0eTogMC45OCB9LFxuLy8gXHQgIGh0bWwyY2FudmFzOiAgeyBkcGk6IDcyLCBsZXR0ZXJSZW5kZXJpbmc6IHRydWUsIGhlaWdodDogMjk3MCwgd2lkdGg6IDUxMDAgfSxcbi8vIFx0ICBqc1BERjogICAgICAgIHsgdW5pdDogJ21tJywgZm9ybWF0OiAnQTQnLCBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyB9XG4vLyBcdH0pO1xuLy8gfSk7XG4iXX0=
