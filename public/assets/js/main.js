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

var fs = require('fs');
var pdf = require('html-pdf');
var html = fs.readFileSync('public/pages-test-pdf.html', 'utf8');
var options = { format: 'A4' };
 
pdf.create(html, options).toFile('public/pdf-test/test_node.pdf', function(err, res) {
  if (err) return console.log(err);
  console.log(res); // { filename: '/app/businesscard.pdf' }
});
var system = require('system');
var args = system.args;

var myHeight = 1274;
var myWidth =  900;

var page = require('webpage').create();
page.viewportSize = { width: 900, height: 3000 }; // A4, 72 dpi in pixel
page.open(args[1], function() {
  for (var i = 0; i <= 7; i++) {
    page.clipRect = { top: myHeight * i, left: 0, width: myWidth, height: myHeight };
    page.render('public/pdf-test/test_pure-phantom-0' + i + '.png');
  }
  phantom.exit();
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCJwZGZfbm9kZS5qcyIsInBkZl9wdXJlLXBoYW50b20uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0gZ2xvYmFsIHZhcmlhYmxlc1xuXG52YXIgcGFnZXMgPSAkKCcucGFnZScpO1xudmFyIGNyaXRpY1BvcHVwID0gJCgnI2NyaXRpYycpO1xudmFyIGRyb3BEZWxheSA9IDEwMDtcblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcblx0dmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcblx0dmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG5cdHJldHVybiBpZDsgXG59XG5cbnZhciBTb3VuZCA9IHtcblx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2luY29ycmVjdC5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH0sXG5cdGRpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9XG59O1xuXG4vLyAtLS0gTS1WLUNcblxudmFyIE1vZGVsID0ge1xuXHQvLyBhbGwgb3VyIHN0YXRlc1xuXHR0aW1lTGVmdDogMTAwMDAwMDAsXG5cdGV4cGlyZWQ6IGZhbHNlLFxuXHRlbGVtZW50czogW11cbn07XG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXIoTW9kZWwsIHBhZ2UsIGlucHV0KSB7XG5cblx0Ly8gZXhwaXJlZD9cblx0aWYgKE1vZGVsLnRpbWVMZWZ0ID4gMCkge1xuXHRcdHNob3dUaW1lKE1vZGVsKTtcblx0fVxuXHRlbHNlIHtcblx0XHRNb2RlbC5leHBpcmVkID0gdHJ1ZTtcblx0XHRzaG93RXhwaXJlZChNb2RlbCk7XG5cdFx0bm9EcmFnKCk7XG5cdH1cbiAgXG4gIGlmIChpbnB1dCAmJiBNb2RlbC5leHBpcmVkID09IGZhbHNlKSB7XG5cdFx0c3dpdGNoICh0cnVlKSB7XG5cdFx0XHRjYXNlXHRpbnB1dFszXSA9PSBmYWxzZSA6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcblx0XHRcdFx0cmVtb3ZlRWxlbWVudChpbnB1dFswXSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcdGlucHV0WzFdLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSAmJiBcblx0XHRcdFx0XHRcdGlucHV0WzNdID09IHRydWUgOiAvLyBuZXcgaW1hZ2Vcblx0XHRcdFx0Ly8gdXBkYXRlIHRoZSBNb2RlbFxuXHRcdFx0XHRNb2RlbC5lbGVtZW50cy5wdXNoKGlucHV0KTtcblx0XHRcdFx0Ly8gZHJvcCBmaWxlXG5cdFx0XHRcdGRyb3BGaWxlKHBhZ2UsIGlucHV0WzFdLCBpbnB1dFswXSk7XG5cdFx0XHRcdC8vIGFkZCBib251cyB0aW1lXG5cdFx0XHRcdGFkZHRpbWUoMTAwMCk7XG5cdFx0XHRcdC8vIGNyaXRpYyBzcGVha1xuXHRcdFx0XHRjcml0aWMoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFx0aW5wdXRbMV0uaW5jbHVkZXMoXCJkYXRhOnRleHQvcGxhaW5cIikgJiYgXG5cdFx0XHRcdFx0XHRpbnB1dFszXSA9PSB0cnVlIDogLy8gbmV3IHRleHRcblx0XHRcdFx0Ly8gdXBkYXRlIHRoZSBNb2RlbFxuXHRcdFx0XHRNb2RlbC5lbGVtZW50cy5wdXNoKGlucHV0KTtcblx0XHRcdFx0Ly8gZHJvcCBmaWxlXG5cdFx0XHRcdGRyb3BGaWxlKHBhZ2UsIGlucHV0WzFdLCBpbnB1dFswXSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcdCFpbnB1dFsxXS5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikgJiZcblx0XHRcdFx0XHRcdCFpbnB1dFsxXS5pbmNsdWRlcyhcImRhdGE6dGV4dC9wbGFpblwiKSA6IC8vIG5laXRoZXIgYW4gaW1hZ2Ugbm9yIHRleHRcblx0XHRcdFx0bm90QW5JbWFnZSgpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH0gZWxzZSBpZiAoaW5wdXQgJiYgTW9kZWwuZXhwaXJlZCA9PSB0cnVlKSB7IC8vIHRvbyBsYXRlXG5cdFx0TGF0ZURyb3BGaWxlKCk7XG5cdH1cbn1cblxuXG4vLyAtLS0gQ09OVFJPTExFUlxuXG52YXIgeCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRNb2RlbC50aW1lTGVmdCA9IE1vZGVsLnRpbWVMZWZ0IC0gMTA7XG5cdGNvbnRyb2xsZXIoTW9kZWwpO1xufSwgMTApO1xuXG5mdW5jdGlvbiBhZGR0aW1lKGJvbnVzVGltZSkge1xuXHRNb2RlbC50aW1lTGVmdCA9IE1vZGVsLnRpbWVMZWZ0ICsgYm9udXNUaW1lO1xufVxuXG4vLyBkcm9wRmlsZVxuXG5wYWdlcy5vbihcImRyYWdvdmVyXCIsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKHRoaXMpLmFkZENsYXNzKCdkcmFnb3ZlcicpO1xufSk7XG5wYWdlcy5vbihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbiAgJCh0aGlzKS5yZW1vdmVDbGFzcygnZHJhZ292ZXInKTtcbn0pO1xucGFnZXMub24oXCJkcm9wXCIsIGZ1bmN0aW9uKGUpIHtcbiAgJCh0aGlzKS5yZW1vdmVDbGFzcygnZHJhZ292ZXInKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zb2xlLmxvZyhlKTtcbiAgdmFyIGZpbGVzID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5maWxlc1xuICB2YXIgeSA9IDA7XG4gIGZvciAodmFyIGkgPSBmaWxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHQgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdCAgdmFyIHBhZ2VJZCA9ICQodGhpcykuYXR0cignaWQnKTtcblx0ICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdCAgICBjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xuXHQgICAgLy8gaWQsIHVybCwgc2l6ZSwgcG9zLCByb3RhdGlvbj8sIHZpc2libGVcblx0ICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0ICAgIFx0Y29udHJvbGxlcihNb2RlbCwgcGFnZUlkLCBbbWFrZUlkKCksIGV2ZW50LnRhcmdldC5yZXN1bHQsIFswLDAsMCwwLDBdLCB0cnVlXSApO1xuXHQgIFx0fSwgeSAqIGRyb3BEZWxheSk7XG5cdCAgXHR5ICs9IDE7XG5cdCAgfTtcblx0ICBjb25zb2xlLmxvZyhmaWxlc1tpXSk7XG5cdCAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZXNbaV0pO1xuICB9XG5cdHJldHVybiBmYWxzZTtcbn0pO1xuLy8gcHJldmVudCBkcm9wIG9uIGJvZHlcbiQoJ2JvZHknKS5vbihcImRyYWdvdmVyXCIsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oXCJkcmFnbGVhdmVcIiwgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbihcImRyb3BcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIFNvdW5kLmVycm9yKCk7XG59KTtcblxuLy8gcmVtb3ZlIGVsZW1lbnRcbiQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuY2xvc2UnLCBmdW5jdGlvbiAoKSB7XG5cdHZhciBwYWdlSWQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnRJZCA9ICQodGhpcykucGFyZW50KCkuYXR0cignaWQnKTtcblx0dmFyIGVsZW1lbnRTcmMgPSAkKHRoaXMpLnNpYmxpbmdzKCkuYXR0cignc3JjJyk7XG5cdGNvbnRyb2xsZXIoTW9kZWwsIHBhZ2VJZCwgW2VsZW1lbnRJZCwgZWxlbWVudFNyYywgWzAsMCwwLDAsMF0sIGZhbHNlXSk7XG59KTtcblxuLy8gLS0tIFZJRVdcblxuZnVuY3Rpb24gc2hvd1RpbWUoTW9kZWwpIHtcblx0c2Vjb25kcyA9IE1vZGVsLnRpbWVMZWZ0IC8gMTAwMDtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3VudGVyXCIpLmlubmVySFRNTCA9IHNlY29uZHMudG9GaXhlZCgyKSArIFwiIHNlY29uZHMgbGVmdCFcIjtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY291bnRlclwiKS5pbm5lckhUTUwgPSBcImV4cGlyZWQhXCI7XG5cdCQoJ2JvZHknKS5hZGRDbGFzcygnZXhwaXJlZCcpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IFxuXHRcdHdpbmRvdy5wcmludCgpOyBcblx0fSwgMTAwMCk7XG5cdGNsZWFySW50ZXJ2YWwoeCk7XG59XG5cbmZ1bmN0aW9uIG5vdEFuSW1hZ2UoKSB7XG5cdFNvdW5kLmVycm9yKCk7XG5cdGFsZXJ0KCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyBub3QgYW4gaW1hZ2UhJyk7XG59XG5cbmZ1bmN0aW9uIGRyb3BGaWxlKHBhZ2VJZCwgc3JjLCBpZCkge1xuXHRpZiAoc3JjLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSkge1xuXHRcdHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKFwiPGltZz5cIiwge1wic3JjXCI6IHNyY30pO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBkZUJhc2VkVGV4dCA9IGF0b2IoIHNyYy5zdWJzdHJpbmcoMjMpICk7XG5cdFx0dmFyIGh0bWxCclRleHQgPSBkZUJhc2VkVGV4dC5yZXBsYWNlKC9cXG4vZywgXCI8YnIvPlwiKTsgXG5cdFx0Y29uc29sZS5sb2coaHRtbEJyVGV4dCk7XG5cdFx0dmFyIHBhZ2VFbGVtZW50Q29udGVudCA9ICQoXCI8cD5cIikuYXBwZW5kKGh0bWxCclRleHQpOyAvLyByZW1vdmUgXCJkYXRhOnRleHQvcGxhaW47YmFzZTY0XCJcblx0fVxuXHR2YXIgcGFnZUVsZW1lbnQgPSAkKFwiPGRpdj5cIiwge1wiY2xhc3NcIjogXCJwYWdlLWVsZW1lbnQgZHJhZ2dhYmxlXCJ9KTtcblx0dmFyIHBhZ2VFbGVtZW50Q2xvc2UgPSAkKFwiPHNwYW4+XCIsIHtcImNsYXNzXCI6IFwiY2xvc2VcIn0pLnRleHQoJ3gnKTtcblx0cGFnZUVsZW1lbnQuYXBwZW5kKHBhZ2VFbGVtZW50Q29udGVudCwgcGFnZUVsZW1lbnRDbG9zZSk7XG5cdHBhZ2VFbGVtZW50LmF0dHIoJ2lkJywgaWQpO1xuXHQkKCcjJyArIHBhZ2VJZCkuYXBwZW5kKHBhZ2VFbGVtZW50KTtcblx0Ly8gcmVhZCBzaXplLCBwb3MsIHJvdCBhbmQgYWRkIHRoZW0gdG8gTW9kZWxcblx0ZWxlbWVudFBvcyA9IFtcblx0XHRwYWdlRWxlbWVudC5wb3NpdGlvbigpLmxlZnQsXG5cdFx0cGFnZUVsZW1lbnQucG9zaXRpb24oKS50b3AsXG5cdFx0cGFnZUVsZW1lbnQud2lkdGgoKSxcblx0XHRwYWdlRWxlbWVudC5oZWlnaHQoKSxcblx0XHQwIC8vIHJvdGF0aW9uIChUT0RPKVxuXHRdO1xuXHRmb3IodmFyIGkgPSAwIDsgaSA8IE1vZGVsLmVsZW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0aWYgKE1vZGVsLmVsZW1lbnRzW2ldWzBdID09IGlkKSB7XG5cdFx0XHRNb2RlbC5lbGVtZW50c1tpXVsyXSA9IGVsZW1lbnRQb3M7XG5cdFx0fVxuXHR9XG5cdFNvdW5kLmRpbmcoKTtcbn1cblxuZnVuY3Rpb24gTGF0ZURyb3BGaWxlKHNyYykge1xuXHRhbGVydCgndG9vIGxhdGUgYnJvJyk7XG59XG5cbmZ1bmN0aW9uIG5vRHJhZygpIHtcblx0dmFyIGVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5kcmFnZ2FibGVcIik7XG4gIFx0W10uZm9yRWFjaC5jYWxsKGVsZW1zLCBmdW5jdGlvbihlbCkge1xuICAgIFx0ZWwuY2xhc3NMaXN0LnJlbW92ZShcImRyYWdnYWJsZVwiKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyaXRpYygpIHtcblx0Y3JpdGljUG9wdXAuaW5uZXJIVE1MID0gJ01ha2UgdGhpcyBpbWFnZSBiaWdnZXIgcGxzISc7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUVsZW1lbnQoaWQpIHtcblx0JCgnIycgKyBpZCkuaGlkZSgpO1xuXHRjb25zb2xlLmxvZyhpZCk7XG59XG5cbmludGVyYWN0KCcuZHJhZ2dhYmxlJylcblx0LmRyYWdnYWJsZSh7XG5cdFx0b25tb3ZlOiB3aW5kb3cuZHJhZ01vdmVMaXN0ZW5lcixcblx0XHRyZXN0cmljdDoge1xuXHRcdFx0cmVzdHJpY3Rpb246ICdwYXJlbnQnLFxuXHRcdFx0ZWxlbWVudFJlY3Q6IHtcblx0XHRcdFx0dG9wOiAwLFxuXHRcdFx0XHRsZWZ0OiAwLFxuXHRcdFx0XHRib3R0b206IDEsXG5cdFx0XHRcdHJpZ2h0OiAxXG5cdFx0XHR9XG5cdFx0fSxcblx0fSlcblx0LnJlc2l6YWJsZSh7XG5cdFx0Ly8gcmVzaXplIGZyb20gYWxsIGVkZ2VzIGFuZCBjb3JuZXJzXG5cdFx0ZWRnZXM6IHtcblx0XHRcdGxlZnQ6IHRydWUsXG5cdFx0XHRyaWdodDogdHJ1ZSxcblx0XHRcdGJvdHRvbTogdHJ1ZSxcblx0XHRcdHRvcDogdHJ1ZVxuXHRcdH0sXG5cblx0XHQvLyBrZWVwIHRoZSBlZGdlcyBpbnNpZGUgdGhlIHBhcmVudFxuXHRcdHJlc3RyaWN0RWRnZXM6IHtcblx0XHRcdG91dGVyOiAncGFyZW50Jyxcblx0XHRcdGVuZE9ubHk6IHRydWUsXG5cdFx0fSxcblxuXHRcdGluZXJ0aWE6IHRydWUsXG5cdH0pXG5cdC5vbigncmVzaXplbW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcblx0XHRcdHggPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCksXG5cdFx0XHR5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDApO1xuXG5cdFx0Ly8gdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVcblx0XHR0YXJnZXQuc3R5bGUud2lkdGggPSBldmVudC5yZWN0LndpZHRoICsgJ3B4Jztcblx0XHR0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gZXZlbnQucmVjdC5oZWlnaHQgKyAncHgnO1xuXG5cdFx0Ly8gdHJhbnNsYXRlIHdoZW4gcmVzaXppbmcgZnJvbSB0b3Agb3IgbGVmdCBlZGdlc1xuXHRcdHggKz0gZXZlbnQuZGVsdGFSZWN0LmxlZnQ7XG5cdFx0eSArPSBldmVudC5kZWx0YVJlY3QudG9wO1xuXG5cdFx0dGFyZ2V0LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPVxuXHRcdFx0J3RyYW5zbGF0ZSgnICsgeCArICdweCwnICsgeSArICdweCknO1xuXG5cdFx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG5cdFx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG5cdH0pO1xuXG5mdW5jdGlvbiBkcmFnTW92ZUxpc3RlbmVyKGV2ZW50KSB7XG5cdHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0Ly8ga2VlcCB0aGUgZHJhZ2dlZCBwb3NpdGlvbiBpbiB0aGUgZGF0YS14L2RhdGEteSBhdHRyaWJ1dGVzXG5cdFx0eCA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteCcpKSB8fCAwKSArIGV2ZW50LmR4LFxuXHRcdHkgPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXknKSkgfHwgMCkgKyBldmVudC5keTtcblxuXHQvLyB0cmFuc2xhdGUgdGhlIGVsZW1lbnRcblx0dGFyZ2V0LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9XG5cdFx0dGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9XG5cdFx0J3RyYW5zbGF0ZSgnICsgeCArICdweCwgJyArIHkgKyAncHgpJztcblxuXHQvLyB1cGRhdGUgdGhlIHBvc2lpb24gYXR0cmlidXRlc1xuXHR0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KTtcblx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG5cblx0Ly8gdXBkYXRlIHotaW5kZXhcblx0dmFyIG1heHpJbmRleCA9IDAsXG5cdFx0aSA9IDA7XG5cdHBhZ2VFbGVtZW50cyA9ICQoJyMnICsgdGFyZ2V0LmlkKS5wYXJlbnQoKS5jaGlsZHJlbigpO1xuXHRwYWdlRWxlbWVudHMuZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0aSArPSAxO1xuXHRcdGlmICggJCh0aGlzKS5jc3MoXCJ6LWluZGV4XCIpID49IG1heHpJbmRleCApIHtcblx0XHRcdG1heHpJbmRleCA9IHBhcnNlSW50KCQodGhpcykuY3NzKFwiei1pbmRleFwiKSk7XG5cdFx0fVxuXHRcdGlmKGkgPT0gcGFnZUVsZW1lbnRzLmxlbmd0aCkge1xuXHRcdFx0aWYgKHRhcmdldC5zdHlsZS56SW5kZXggIT0gbWF4ekluZGV4IHwgdGFyZ2V0LnN0eWxlLnpJbmRleCA9PSAwKSB7XG4gICAgXHRcdHRhcmdldC5zdHlsZS56SW5kZXggPSBtYXh6SW5kZXggKyAxO1xuICAgIFx0fVxuICBcdH1cblx0fSk7XG5cdC8vIHRhcmdldC5zdHlsZS56SW5kZXggPSBtYXh6SW5kZXggKyAxO1xufVxuXG4vLyB0aGlzIGlzIHVzZWQgbGF0ZXIgaW4gdGhlIHJlc2l6aW5nIGFuZCBnZXN0dXJlIGRlbW9zXG53aW5kb3cuZHJhZ01vdmVMaXN0ZW5lciA9IGRyYWdNb3ZlTGlzdGVuZXI7XG5cblxuLy8gLy8gbWFrZSBwZGZcbi8vIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3AxJyk7XG4vLyAkKCcjcDEnKS5jbGljayhmdW5jdGlvbigpe1xuLy8gXHRodG1sMnBkZihlbGVtZW50LCB7XG4vLyBcdCAgbWFyZ2luOiAgICAgICAxLFxuLy8gXHQgIGZpbGVuYW1lOiAgICAgJ215ZmlsZS5wZGYnLFxuLy8gXHQgIGltYWdlOiAgICAgICAgeyB0eXBlOiAnanBlZycsIHF1YWxpdHk6IDAuOTggfSxcbi8vIFx0ICBodG1sMmNhbnZhczogIHsgZHBpOiA3MiwgbGV0dGVyUmVuZGVyaW5nOiB0cnVlLCBoZWlnaHQ6IDI5NzAsIHdpZHRoOiA1MTAwIH0sXG4vLyBcdCAganNQREY6ICAgICAgICB7IHVuaXQ6ICdtbScsIGZvcm1hdDogJ0E0Jywgb3JpZW50YXRpb246ICdwb3J0cmFpdCcgfVxuLy8gXHR9KTtcbi8vIH0pO1xuIiwidmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcbnZhciBwZGYgPSByZXF1aXJlKCdodG1sLXBkZicpO1xudmFyIGh0bWwgPSBmcy5yZWFkRmlsZVN5bmMoJ3B1YmxpYy9wYWdlcy10ZXN0LXBkZi5odG1sJywgJ3V0ZjgnKTtcbnZhciBvcHRpb25zID0geyBmb3JtYXQ6ICdBNCcgfTtcbiBcbnBkZi5jcmVhdGUoaHRtbCwgb3B0aW9ucykudG9GaWxlKCdwdWJsaWMvcGRmLXRlc3QvdGVzdF9ub2RlLnBkZicsIGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gIGlmIChlcnIpIHJldHVybiBjb25zb2xlLmxvZyhlcnIpO1xuICBjb25zb2xlLmxvZyhyZXMpOyAvLyB7IGZpbGVuYW1lOiAnL2FwcC9idXNpbmVzc2NhcmQucGRmJyB9XG59KTsiLCJ2YXIgc3lzdGVtID0gcmVxdWlyZSgnc3lzdGVtJyk7XG52YXIgYXJncyA9IHN5c3RlbS5hcmdzO1xuXG52YXIgbXlIZWlnaHQgPSAxMjc0O1xudmFyIG15V2lkdGggPSAgOTAwO1xuXG52YXIgcGFnZSA9IHJlcXVpcmUoJ3dlYnBhZ2UnKS5jcmVhdGUoKTtcbnBhZ2Uudmlld3BvcnRTaXplID0geyB3aWR0aDogOTAwLCBoZWlnaHQ6IDMwMDAgfTsgLy8gQTQsIDcyIGRwaSBpbiBwaXhlbFxucGFnZS5vcGVuKGFyZ3NbMV0sIGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8PSA3OyBpKyspIHtcbiAgICBwYWdlLmNsaXBSZWN0ID0geyB0b3A6IG15SGVpZ2h0ICogaSwgbGVmdDogMCwgd2lkdGg6IG15V2lkdGgsIGhlaWdodDogbXlIZWlnaHQgfTtcbiAgICBwYWdlLnJlbmRlcigncHVibGljL3BkZi10ZXN0L3Rlc3RfcHVyZS1waGFudG9tLTAnICsgaSArICcucG5nJyk7XG4gIH1cbiAgcGhhbnRvbS5leGl0KCk7XG59KTsiXX0=
