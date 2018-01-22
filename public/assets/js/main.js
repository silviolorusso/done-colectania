function loadSound () {
  console.log('load sound!');
  createjs.Sound.registerSound("assets/audio/beep.mp3", 'beep');
  createjs.Sound.registerSound("assets/audio/beep-2.mp3", 'beep-2');
  createjs.Sound.registerSound("assets/audio/ding.mp3", 'ding');
}

loadSound();

function playDing () {
  console.log('beep!');
  createjs.Sound.play('beep');
}


// countdown timer
function countdown(startTime) {
  if (startTime >= 1) {
    createjs.Sound.play('beep-2');
    setTimeout( function(){
      startTime = startTime - 1;
      $('#countdown').html(startTime); // set current time in #countdown
      countdown(startTime); // repeat function
    }, 1000);
  } else {
    $('#countdown').html('start game!'); // set to start game message
    setTimeout(function () { // wait a bit
      $('#countdown').fadeOut(1000) // fade out the #countdown
      // TODO: start time!
    }, 200);
    createjs.Sound.play('ding');
  }
}

var startTime = 4;
countdown(startTime);
$('#countdown').html(startTime);

// --- GLOBAL

var pages = $('.page');
var criticPopup = $('#critic');
var dropDelay = 100;





// --- GENERAL FUNCTIONS

function makeId() {
  var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  var id = randLetter + Date.now();
  return id;
}

function createElement(element) {
  if (element.data.includes("data:image")) {
    var pageElementContent = $("<img>", {"src": element.data});
  } else {
    var deBasedText = atob( element.data.substring(23) );
    var htmlBrText = deBasedText.replace(/\n/g, "<br/>"); 
    console.log(htmlBrText);
    var pageElementContent = $("<p>").append(htmlBrText); // remove "data:text/plain;base64"
  }
  var pageElement = $("<div>", {"class": "page-element draggable"});
  var pageElementClose = $("<span>", {"class": "close"}).text('x');
  pageElement.append(pageElementContent, pageElementClose);
  pageElement.attr('id', element.id);
  $('#' + element.page).append(pageElement);
  if (element.pos) {   // reconstructing saved element
    pageElement.position().left = element.pos[0]
    pageElement.position().top = element.pos[1]
    // pageElement.width(element.pos[2]) // problems with these two
    // pageElement.height(element.pos[3]) 
  } else { // dropping new file
    return elementPos = [
      pageElement.position().left,
      pageElement.position().top,
      pageElement.width(),
      pageElement.height(),
      0 // rotation (TODO)
    ];
  }
}





// --- M-V-C

var Publication = {
  // all our states
  id: makeId(),
  title: 'TEST PUB',
  timeLeft: 50000000,
  expired: false,
  elements: [],
  authors: []
};

function controller(Publication, input) {

  // expired?
  if (Publication.timeLeft > 0) {
    showTime(Publication);
  }
  else {
    Publication.expired = true
    showExpired(Publication)
    noDrag()
    savetoDb(Publication)
    // makePdf()
    // checkPdf()
  }
  
  if (input && Publication.expired == false) {
    console.log(input);
    switch (true) {
      case  input.visible == false : // deleting an element
        removeElement(input.id);
        break;
      case  input.data.includes("data:image") && 
            input.visible == true : // new image
        // update the Publication
        Publication.elements.push(input);
        // drop file
        dropElement(input.page, input.data, input.id);
        // add bonus time
        addtime(1000);
        // critic speak
        // critic();
        break;
      case  input.data.includes("data:text/plain") && 
            input.visible == true : // new text
        // update the Publication
        Publication.elements.push(input);
        // drop file
        dropElement(input.page, input.data, input.id);
        break;
      case  !input.data.includes("data:image") &&
            !input.data.includes("data:text/plain") : // neither an image nor text
        notAnImage();
        break;
    }
  } else if (input && Publication.expired == true) { // too late
    LateDropFile();
  }
}





// --- CONTROLLER

$( document ).ready(function() {
  if (window.location.href.indexOf("saved") < 0) { // if not a saved publication
    var x = setInterval(function() {
      Publication.timeLeft = Publication.timeLeft - 10;
      controller(Publication);
    }, 10);
  } else {
    renderPublication(Publication)
    noDrag()
  }
});


function addtime(bonusTime) {
  Publication.timeLeft = Publication.timeLeft + bonusTime;
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
      // id, data, size, pos, rotation?, visible
      setTimeout(function(){
        controller(Publication, { id: makeId(), data: event.target.result, pos: [0,0,0,0,0], visible: true, page: pageId } );
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
  var elementData = $(this).siblings().attr('src');
  controller(Publication, { id: elementId, data: elementData, pos: [0,0,0,0,0], visible: false, page: pageId});
});






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

function showTime(Publication) {
  seconds = Publication.timeLeft / 1000;
  document.getElementById("counter").innerHTML = seconds.toFixed(2) + " seconds left!";
}

function showExpired() {
  document.getElementById("counter").innerHTML = "expired!";
  $('body').addClass('expired');
  //setTimeout(function(){
  //  window.print();
  //}, 1000);
  clearInterval(x);
}

function notAnImage() {
  Sound.error();
  alert('The file you dropped is not an image!');
}

function dropElement(pageId, data, id) {
  var element = {id: id, data: data, page: pageId}
  // read size, pos, rot and add them to Publication
  var elementPos = createElement(element)
  for(var i = 0 ; i < Publication.elements.length; i += 1) {
    if (Publication.elements[i].id == id) {
      Publication.elements[i].pos = elementPos;
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






// --- SAVED

function renderPublication(Publication) {
  for (let element of Publication.elements) {
    console.log(element.data)
    createElement(element)
    console.log('saved pub')
  }
}






// --- BACKEND

// send call to server to make pdf
function makePdf() {
  $.get( '/pdf', function( data ) {
    console.log( 'Sent call to make PDF.' );
  });
}

// check if pdf exists and redirect to file
function checkPdf() {
  var y = setInterval(function(){
    $.ajax({
      type: 'HEAD',
      url: 'assets/pdf/print-test.pdf',
      success: function(msg){
        alert('Go to PDF!');
        clearInterval(y);
        window.location.href = 'assets/pdf/print-test.pdf';
      },
      error: function(jqXHR, textStatus, errorThrown){
        log(jqXHR);
        log(errorThrown);
      }
    })
  }, 100);
}

function savetoDb(publication) {
  $.ajax({                    
    url: '/db',     
    type: 'post', // performing a POST request
    data : publication,
    dataType: 'json',                   
    success: function(publication)         
    {
      console.log('publication sent to database.')
    } 
  });
}


// // make pdf
// var element = document.getElementById('p1');
// $('#p1').click(function(){
//  html2pdf(element, {
//    margin:       1,
//    filename:     'myfile.pdf',
//    image:        { type: 'jpeg', quality: 0.98 },
//    html2canvas:  { dpi: 72, letterRendering: true, height: 2970, width: 5100 },
//    jsPDF:        { unit: 'mm', format: 'A4', orientation: 'portrait' }
//  });
// });


// --- ARCHIVE

// $.ajax({
//  url: "http://localhost:28017/test",
//  type: 'get',
//  dataType: 'jsonp',
//  jsonp: 'jsonp', // mongodb is expecting that
//  success: function (data) {
//     console.log('success', data);
//   },
//   error: function (XMLHttpRequest, textStatus, errorThrown) {
//     console.log('error', errorThrown);
//   }
// });

// #counter follows the mouse
$(document).bind('mousemove', function(e){
  if (e.pageX >= ($(document).width()/2)) {
    // if mouse of right side of page
    $('#counter').addClass('mouse_right');
    $('#counter').css({
      left:  e.pageX - 20 - $('#counter').width(),
      top:   e.pageY + 50
    });
  } else {
    // if mouse of left side of page
    $('#counter').removeClass('mouse_right');
    $('#counter').css({
      left:  e.pageX + 20,
      top:   e.pageY + 50
    });
  }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvdW50ZG93bi5qcyIsIm1haW4uanMiLCJ0aW1lX2ZvbGxvd19tb3VzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBsb2FkU291bmQgKCkge1xuICBjb25zb2xlLmxvZygnbG9hZCBzb3VuZCEnKTtcbiAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcImFzc2V0cy9hdWRpby9iZWVwLm1wM1wiLCAnYmVlcCcpO1xuICBjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFwiYXNzZXRzL2F1ZGlvL2JlZXAtMi5tcDNcIiwgJ2JlZXAtMicpO1xuICBjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFwiYXNzZXRzL2F1ZGlvL2RpbmcubXAzXCIsICdkaW5nJyk7XG59XG5cbmxvYWRTb3VuZCgpO1xuXG5mdW5jdGlvbiBwbGF5RGluZyAoKSB7XG4gIGNvbnNvbGUubG9nKCdiZWVwIScpO1xuICBjcmVhdGVqcy5Tb3VuZC5wbGF5KCdiZWVwJyk7XG59XG5cblxuLy8gY291bnRkb3duIHRpbWVyXG5mdW5jdGlvbiBjb3VudGRvd24oc3RhcnRUaW1lKSB7XG4gIGlmIChzdGFydFRpbWUgPj0gMSkge1xuICAgIGNyZWF0ZWpzLlNvdW5kLnBsYXkoJ2JlZXAtMicpO1xuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7XG4gICAgICBzdGFydFRpbWUgPSBzdGFydFRpbWUgLSAxO1xuICAgICAgJCgnI2NvdW50ZG93bicpLmh0bWwoc3RhcnRUaW1lKTsgLy8gc2V0IGN1cnJlbnQgdGltZSBpbiAjY291bnRkb3duXG4gICAgICBjb3VudGRvd24oc3RhcnRUaW1lKTsgLy8gcmVwZWF0IGZ1bmN0aW9uXG4gICAgfSwgMTAwMCk7XG4gIH0gZWxzZSB7XG4gICAgJCgnI2NvdW50ZG93bicpLmh0bWwoJ3N0YXJ0IGdhbWUhJyk7IC8vIHNldCB0byBzdGFydCBnYW1lIG1lc3NhZ2VcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgLy8gd2FpdCBhIGJpdFxuICAgICAgJCgnI2NvdW50ZG93bicpLmZhZGVPdXQoMTAwMCkgLy8gZmFkZSBvdXQgdGhlICNjb3VudGRvd25cbiAgICAgIC8vIFRPRE86IHN0YXJ0IHRpbWUhXG4gICAgfSwgMjAwKTtcbiAgICBjcmVhdGVqcy5Tb3VuZC5wbGF5KCdkaW5nJyk7XG4gIH1cbn1cblxudmFyIHN0YXJ0VGltZSA9IDQ7XG5jb3VudGRvd24oc3RhcnRUaW1lKTtcbiQoJyNjb3VudGRvd24nKS5odG1sKHN0YXJ0VGltZSk7XG4iLCIvLyAtLS0gR0xPQkFMXG5cbnZhciBwYWdlcyA9ICQoJy5wYWdlJyk7XG52YXIgY3JpdGljUG9wdXAgPSAkKCcjY3JpdGljJyk7XG52YXIgZHJvcERlbGF5ID0gMTAwO1xuXG5cblxuXG5cbi8vIC0tLSBHRU5FUkFMIEZVTkNUSU9OU1xuXG5mdW5jdGlvbiBtYWtlSWQoKSB7XG4gIHZhciByYW5kTGV0dGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI2KSk7XG4gIHZhciBpZCA9IHJhbmRMZXR0ZXIgKyBEYXRlLm5vdygpO1xuICByZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCkge1xuICBpZiAoZWxlbWVudC5kYXRhLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSkge1xuICAgIHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKFwiPGltZz5cIiwge1wic3JjXCI6IGVsZW1lbnQuZGF0YX0pO1xuICB9IGVsc2Uge1xuICAgIHZhciBkZUJhc2VkVGV4dCA9IGF0b2IoIGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpICk7XG4gICAgdmFyIGh0bWxCclRleHQgPSBkZUJhc2VkVGV4dC5yZXBsYWNlKC9cXG4vZywgXCI8YnIvPlwiKTsgXG4gICAgY29uc29sZS5sb2coaHRtbEJyVGV4dCk7XG4gICAgdmFyIHBhZ2VFbGVtZW50Q29udGVudCA9ICQoXCI8cD5cIikuYXBwZW5kKGh0bWxCclRleHQpOyAvLyByZW1vdmUgXCJkYXRhOnRleHQvcGxhaW47YmFzZTY0XCJcbiAgfVxuICB2YXIgcGFnZUVsZW1lbnQgPSAkKFwiPGRpdj5cIiwge1wiY2xhc3NcIjogXCJwYWdlLWVsZW1lbnQgZHJhZ2dhYmxlXCJ9KTtcbiAgdmFyIHBhZ2VFbGVtZW50Q2xvc2UgPSAkKFwiPHNwYW4+XCIsIHtcImNsYXNzXCI6IFwiY2xvc2VcIn0pLnRleHQoJ3gnKTtcbiAgcGFnZUVsZW1lbnQuYXBwZW5kKHBhZ2VFbGVtZW50Q29udGVudCwgcGFnZUVsZW1lbnRDbG9zZSk7XG4gIHBhZ2VFbGVtZW50LmF0dHIoJ2lkJywgZWxlbWVudC5pZCk7XG4gICQoJyMnICsgZWxlbWVudC5wYWdlKS5hcHBlbmQocGFnZUVsZW1lbnQpO1xuICBpZiAoZWxlbWVudC5wb3MpIHsgICAvLyByZWNvbnN0cnVjdGluZyBzYXZlZCBlbGVtZW50XG4gICAgcGFnZUVsZW1lbnQucG9zaXRpb24oKS5sZWZ0ID0gZWxlbWVudC5wb3NbMF1cbiAgICBwYWdlRWxlbWVudC5wb3NpdGlvbigpLnRvcCA9IGVsZW1lbnQucG9zWzFdXG4gICAgLy8gcGFnZUVsZW1lbnQud2lkdGgoZWxlbWVudC5wb3NbMl0pIC8vIHByb2JsZW1zIHdpdGggdGhlc2UgdHdvXG4gICAgLy8gcGFnZUVsZW1lbnQuaGVpZ2h0KGVsZW1lbnQucG9zWzNdKSBcbiAgfSBlbHNlIHsgLy8gZHJvcHBpbmcgbmV3IGZpbGVcbiAgICByZXR1cm4gZWxlbWVudFBvcyA9IFtcbiAgICAgIHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkubGVmdCxcbiAgICAgIHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkudG9wLFxuICAgICAgcGFnZUVsZW1lbnQud2lkdGgoKSxcbiAgICAgIHBhZ2VFbGVtZW50LmhlaWdodCgpLFxuICAgICAgMCAvLyByb3RhdGlvbiAoVE9ETylcbiAgICBdO1xuICB9XG59XG5cblxuXG5cblxuLy8gLS0tIE0tVi1DXG5cbnZhciBQdWJsaWNhdGlvbiA9IHtcbiAgLy8gYWxsIG91ciBzdGF0ZXNcbiAgaWQ6IG1ha2VJZCgpLFxuICB0aXRsZTogJ1RFU1QgUFVCJyxcbiAgdGltZUxlZnQ6IDUwMDAwMDAwLFxuICBleHBpcmVkOiBmYWxzZSxcbiAgZWxlbWVudHM6IFtdLFxuICBhdXRob3JzOiBbXVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihQdWJsaWNhdGlvbiwgaW5wdXQpIHtcblxuICAvLyBleHBpcmVkP1xuICBpZiAoUHVibGljYXRpb24udGltZUxlZnQgPiAwKSB7XG4gICAgc2hvd1RpbWUoUHVibGljYXRpb24pO1xuICB9XG4gIGVsc2Uge1xuICAgIFB1YmxpY2F0aW9uLmV4cGlyZWQgPSB0cnVlXG4gICAgc2hvd0V4cGlyZWQoUHVibGljYXRpb24pXG4gICAgbm9EcmFnKClcbiAgICBzYXZldG9EYihQdWJsaWNhdGlvbilcbiAgICAvLyBtYWtlUGRmKClcbiAgICAvLyBjaGVja1BkZigpXG4gIH1cbiAgXG4gIGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG4gICAgY29uc29sZS5sb2coaW5wdXQpO1xuICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgY2FzZSAgaW5wdXQudmlzaWJsZSA9PSBmYWxzZSA6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcbiAgICAgICAgcmVtb3ZlRWxlbWVudChpbnB1dC5pZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAgaW5wdXQuZGF0YS5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikgJiYgXG4gICAgICAgICAgICBpbnB1dC52aXNpYmxlID09IHRydWUgOiAvLyBuZXcgaW1hZ2VcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBQdWJsaWNhdGlvblxuICAgICAgICBQdWJsaWNhdGlvbi5lbGVtZW50cy5wdXNoKGlucHV0KTtcbiAgICAgICAgLy8gZHJvcCBmaWxlXG4gICAgICAgIGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0LmlkKTtcbiAgICAgICAgLy8gYWRkIGJvbnVzIHRpbWVcbiAgICAgICAgYWRkdGltZSgxMDAwKTtcbiAgICAgICAgLy8gY3JpdGljIHNwZWFrXG4gICAgICAgIC8vIGNyaXRpYygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgIGlucHV0LmRhdGEuaW5jbHVkZXMoXCJkYXRhOnRleHQvcGxhaW5cIikgJiYgXG4gICAgICAgICAgICBpbnB1dC52aXNpYmxlID09IHRydWUgOiAvLyBuZXcgdGV4dFxuICAgICAgICAvLyB1cGRhdGUgdGhlIFB1YmxpY2F0aW9uXG4gICAgICAgIFB1YmxpY2F0aW9uLmVsZW1lbnRzLnB1c2goaW5wdXQpO1xuICAgICAgICAvLyBkcm9wIGZpbGVcbiAgICAgICAgZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQuaWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgICFpbnB1dC5kYXRhLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSAmJlxuICAgICAgICAgICAgIWlucHV0LmRhdGEuaW5jbHVkZXMoXCJkYXRhOnRleHQvcGxhaW5cIikgOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG4gICAgICAgIG5vdEFuSW1hZ2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkgeyAvLyB0b28gbGF0ZVxuICAgIExhdGVEcm9wRmlsZSgpO1xuICB9XG59XG5cblxuXG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoXCJzYXZlZFwiKSA8IDApIHsgLy8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cbiAgICB2YXIgeCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAtIDEwO1xuICAgICAgY29udHJvbGxlcihQdWJsaWNhdGlvbik7XG4gICAgfSwgMTApO1xuICB9IGVsc2Uge1xuICAgIHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKVxuICAgIG5vRHJhZygpXG4gIH1cbn0pO1xuXG5cbmZ1bmN0aW9uIGFkZHRpbWUoYm9udXNUaW1lKSB7XG4gIFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgKyBib251c1RpbWU7XG59XG5cbi8vIGRyb3BGaWxlXG5cbnBhZ2VzLm9uKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICQodGhpcykuYWRkQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKFwiZHJhZ2xlYXZlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xufSk7XG5wYWdlcy5vbihcImRyb3BcIiwgZnVuY3Rpb24oZSkge1xuICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnNvbGUubG9nKGUpO1xuICB2YXIgZmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzXG4gIHZhciB5ID0gMDtcbiAgZm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICB2YXIgcGFnZUlkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG4gICAgICAvLyBpZCwgZGF0YSwgc2l6ZSwgcG9zLCByb3RhdGlvbj8sIHZpc2libGVcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgY29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyBpZDogbWFrZUlkKCksIGRhdGE6IGV2ZW50LnRhcmdldC5yZXN1bHQsIHBvczogWzAsMCwwLDAsMF0sIHZpc2libGU6IHRydWUsIHBhZ2U6IHBhZ2VJZCB9ICk7XG4gICAgICB9LCB5ICogZHJvcERlbGF5KTtcbiAgICAgIHkgKz0gMTtcbiAgICB9O1xuICAgIGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKFwiZHJvcFwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgU291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudFxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jbG9zZScsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHBhZ2VJZCA9ICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5hdHRyKCdpZCcpO1xuICB2YXIgZWxlbWVudElkID0gJCh0aGlzKS5wYXJlbnQoKS5hdHRyKCdpZCcpO1xuICB2YXIgZWxlbWVudERhdGEgPSAkKHRoaXMpLnNpYmxpbmdzKCkuYXR0cignc3JjJyk7XG4gIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgaWQ6IGVsZW1lbnRJZCwgZGF0YTogZWxlbWVudERhdGEsIHBvczogWzAsMCwwLDAsMF0sIHZpc2libGU6IGZhbHNlLCBwYWdlOiBwYWdlSWR9KTtcbn0pO1xuXG5cblxuXG5cblxuLy8gLS0tIFZJRVdcblxudmFyIFNvdW5kID0ge1xuICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vaW5jb3JyZWN0Lm1wMycpO1xuICAgIGF1ZGlvLnBsYXkoKTtcbiAgfSxcbiAgZGluZzogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vZGluZy5tcDMnKTtcbiAgICBhdWRpby5wbGF5KCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHNob3dUaW1lKFB1YmxpY2F0aW9uKSB7XG4gIHNlY29uZHMgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDEwMDA7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY291bnRlclwiKS5pbm5lckhUTUwgPSBzZWNvbmRzLnRvRml4ZWQoMikgKyBcIiBzZWNvbmRzIGxlZnQhXCI7XG59XG5cbmZ1bmN0aW9uIHNob3dFeHBpcmVkKCkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdW50ZXJcIikuaW5uZXJIVE1MID0gXCJleHBpcmVkIVwiO1xuICAkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKTtcbiAgLy9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gIC8vICB3aW5kb3cucHJpbnQoKTtcbiAgLy99LCAxMDAwKTtcbiAgY2xlYXJJbnRlcnZhbCh4KTtcbn1cblxuZnVuY3Rpb24gbm90QW5JbWFnZSgpIHtcbiAgU291bmQuZXJyb3IoKTtcbiAgYWxlcnQoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIG5vdCBhbiBpbWFnZSEnKTtcbn1cblxuZnVuY3Rpb24gZHJvcEVsZW1lbnQocGFnZUlkLCBkYXRhLCBpZCkge1xuICB2YXIgZWxlbWVudCA9IHtpZDogaWQsIGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZH1cbiAgLy8gcmVhZCBzaXplLCBwb3MsIHJvdCBhbmQgYWRkIHRoZW0gdG8gUHVibGljYXRpb25cbiAgdmFyIGVsZW1lbnRQb3MgPSBjcmVhdGVFbGVtZW50KGVsZW1lbnQpXG4gIGZvcih2YXIgaSA9IDAgOyBpIDwgUHVibGljYXRpb24uZWxlbWVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAoUHVibGljYXRpb24uZWxlbWVudHNbaV0uaWQgPT0gaWQpIHtcbiAgICAgIFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldLnBvcyA9IGVsZW1lbnRQb3M7XG4gICAgfVxuICB9XG4gIFNvdW5kLmRpbmcoKTtcbn1cblxuZnVuY3Rpb24gTGF0ZURyb3BGaWxlKHNyYykge1xuICBhbGVydCgndG9vIGxhdGUgYnJvJyk7XG59XG5cbmZ1bmN0aW9uIG5vRHJhZygpIHtcbiAgdmFyIGVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5kcmFnZ2FibGVcIik7XG4gICAgW10uZm9yRWFjaC5jYWxsKGVsZW1zLCBmdW5jdGlvbihlbCkge1xuICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImRyYWdnYWJsZVwiKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyaXRpYygpIHtcbiAgY3JpdGljUG9wdXAuaW5uZXJIVE1MID0gJ01ha2UgdGhpcyBpbWFnZSBiaWdnZXIgcGxzISc7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUVsZW1lbnQoaWQpIHtcbiAgJCgnIycgKyBpZCkuaGlkZSgpO1xuICBjb25zb2xlLmxvZyhpZCk7XG59XG5cbmludGVyYWN0KCcuZHJhZ2dhYmxlJylcbiAgLmRyYWdnYWJsZSh7XG4gICAgb25tb3ZlOiB3aW5kb3cuZHJhZ01vdmVMaXN0ZW5lcixcbiAgICByZXN0cmljdDoge1xuICAgICAgcmVzdHJpY3Rpb246ICdwYXJlbnQnLFxuICAgICAgZWxlbWVudFJlY3Q6IHtcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICBib3R0b206IDEsXG4gICAgICAgIHJpZ2h0OiAxXG4gICAgICB9XG4gICAgfSxcbiAgfSlcbiAgLnJlc2l6YWJsZSh7XG4gICAgLy8gcmVzaXplIGZyb20gYWxsIGVkZ2VzIGFuZCBjb3JuZXJzXG4gICAgZWRnZXM6IHtcbiAgICAgIGxlZnQ6IHRydWUsXG4gICAgICByaWdodDogdHJ1ZSxcbiAgICAgIGJvdHRvbTogdHJ1ZSxcbiAgICAgIHRvcDogdHJ1ZVxuICAgIH0sXG5cbiAgICAvLyBrZWVwIHRoZSBlZGdlcyBpbnNpZGUgdGhlIHBhcmVudFxuICAgIHJlc3RyaWN0RWRnZXM6IHtcbiAgICAgIG91dGVyOiAncGFyZW50JyxcbiAgICAgIGVuZE9ubHk6IHRydWUsXG4gICAgfSxcblxuICAgIGluZXJ0aWE6IHRydWUsXG4gIH0pXG4gIC5vbigncmVzaXplbW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcbiAgICAgIHggPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCksXG4gICAgICB5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDApO1xuXG4gICAgLy8gdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVcbiAgICB0YXJnZXQuc3R5bGUud2lkdGggPSBldmVudC5yZWN0LndpZHRoICsgJ3B4JztcbiAgICB0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gZXZlbnQucmVjdC5oZWlnaHQgKyAncHgnO1xuXG4gICAgLy8gdHJhbnNsYXRlIHdoZW4gcmVzaXppbmcgZnJvbSB0b3Agb3IgbGVmdCBlZGdlc1xuICAgIHggKz0gZXZlbnQuZGVsdGFSZWN0LmxlZnQ7XG4gICAgeSArPSBldmVudC5kZWx0YVJlY3QudG9wO1xuXG4gICAgdGFyZ2V0LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPVxuICAgICAgJ3RyYW5zbGF0ZSgnICsgeCArICdweCwnICsgeSArICdweCknO1xuXG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG4gIH0pO1xuXG5mdW5jdGlvbiBkcmFnTW92ZUxpc3RlbmVyKGV2ZW50KSB7XG4gIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQsXG4gICAgLy8ga2VlcCB0aGUgZHJhZ2dlZCBwb3NpdGlvbiBpbiB0aGUgZGF0YS14L2RhdGEteSBhdHRyaWJ1dGVzXG4gICAgeCA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteCcpKSB8fCAwKSArIGV2ZW50LmR4LFxuICAgIHkgPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXknKSkgfHwgMCkgKyBldmVudC5keTtcblxuICAvLyB0cmFuc2xhdGUgdGhlIGVsZW1lbnRcbiAgdGFyZ2V0LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9XG4gICAgdGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9XG4gICAgJ3RyYW5zbGF0ZSgnICsgeCArICdweCwgJyArIHkgKyAncHgpJztcblxuICAvLyB1cGRhdGUgdGhlIHBvc2lpb24gYXR0cmlidXRlc1xuICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KTtcbiAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG5cbiAgLy8gdXBkYXRlIHotaW5kZXhcbiAgdmFyIG1heHpJbmRleCA9IDAsXG4gICAgaSA9IDA7XG4gIHBhZ2VFbGVtZW50cyA9ICQoJyMnICsgdGFyZ2V0LmlkKS5wYXJlbnQoKS5jaGlsZHJlbigpO1xuICBwYWdlRWxlbWVudHMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgaSArPSAxO1xuICAgIGlmICggJCh0aGlzKS5jc3MoXCJ6LWluZGV4XCIpID49IG1heHpJbmRleCApIHtcbiAgICAgIG1heHpJbmRleCA9IHBhcnNlSW50KCQodGhpcykuY3NzKFwiei1pbmRleFwiKSk7XG4gICAgfVxuICAgIGlmKGkgPT0gcGFnZUVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgaWYgKHRhcmdldC5zdHlsZS56SW5kZXggIT0gbWF4ekluZGV4IHwgdGFyZ2V0LnN0eWxlLnpJbmRleCA9PSAwKSB7XG4gICAgICAgIHRhcmdldC5zdHlsZS56SW5kZXggPSBtYXh6SW5kZXggKyAxO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIC8vIHRhcmdldC5zdHlsZS56SW5kZXggPSBtYXh6SW5kZXggKyAxO1xufVxuXG4vLyB0aGlzIGlzIHVzZWQgbGF0ZXIgaW4gdGhlIHJlc2l6aW5nIGFuZCBnZXN0dXJlIGRlbW9zXG53aW5kb3cuZHJhZ01vdmVMaXN0ZW5lciA9IGRyYWdNb3ZlTGlzdGVuZXI7XG5cblxuXG5cblxuXG4vLyAtLS0gU0FWRURcblxuZnVuY3Rpb24gcmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pIHtcbiAgZm9yIChsZXQgZWxlbWVudCBvZiBQdWJsaWNhdGlvbi5lbGVtZW50cykge1xuICAgIGNvbnNvbGUubG9nKGVsZW1lbnQuZGF0YSlcbiAgICBjcmVhdGVFbGVtZW50KGVsZW1lbnQpXG4gICAgY29uc29sZS5sb2coJ3NhdmVkIHB1YicpXG4gIH1cbn1cblxuXG5cblxuXG5cbi8vIC0tLSBCQUNLRU5EXG5cbi8vIHNlbmQgY2FsbCB0byBzZXJ2ZXIgdG8gbWFrZSBwZGZcbmZ1bmN0aW9uIG1ha2VQZGYoKSB7XG4gICQuZ2V0KCAnL3BkZicsIGZ1bmN0aW9uKCBkYXRhICkge1xuICAgIGNvbnNvbGUubG9nKCAnU2VudCBjYWxsIHRvIG1ha2UgUERGLicgKTtcbiAgfSk7XG59XG5cbi8vIGNoZWNrIGlmIHBkZiBleGlzdHMgYW5kIHJlZGlyZWN0IHRvIGZpbGVcbmZ1bmN0aW9uIGNoZWNrUGRmKCkge1xuICB2YXIgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgJC5hamF4KHtcbiAgICAgIHR5cGU6ICdIRUFEJyxcbiAgICAgIHVybDogJ2Fzc2V0cy9wZGYvcHJpbnQtdGVzdC5wZGYnLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24obXNnKXtcbiAgICAgICAgYWxlcnQoJ0dvIHRvIFBERiEnKTtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh5KTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnYXNzZXRzL3BkZi9wcmludC10ZXN0LnBkZic7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bil7XG4gICAgICAgIGxvZyhqcVhIUik7XG4gICAgICAgIGxvZyhlcnJvclRocm93bik7XG4gICAgICB9XG4gICAgfSlcbiAgfSwgMTAwKTtcbn1cblxuZnVuY3Rpb24gc2F2ZXRvRGIocHVibGljYXRpb24pIHtcbiAgJC5hamF4KHsgICAgICAgICAgICAgICAgICAgIFxuICAgIHVybDogJy9kYicsICAgICBcbiAgICB0eXBlOiAncG9zdCcsIC8vIHBlcmZvcm1pbmcgYSBQT1NUIHJlcXVlc3RcbiAgICBkYXRhIDogcHVibGljYXRpb24sXG4gICAgZGF0YVR5cGU6ICdqc29uJywgICAgICAgICAgICAgICAgICAgXG4gICAgc3VjY2VzczogZnVuY3Rpb24ocHVibGljYXRpb24pICAgICAgICAgXG4gICAge1xuICAgICAgY29uc29sZS5sb2coJ3B1YmxpY2F0aW9uIHNlbnQgdG8gZGF0YWJhc2UuJylcbiAgICB9IFxuICB9KTtcbn1cblxuXG4vLyAvLyBtYWtlIHBkZlxuLy8gdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncDEnKTtcbi8vICQoJyNwMScpLmNsaWNrKGZ1bmN0aW9uKCl7XG4vLyAgaHRtbDJwZGYoZWxlbWVudCwge1xuLy8gICAgbWFyZ2luOiAgICAgICAxLFxuLy8gICAgZmlsZW5hbWU6ICAgICAnbXlmaWxlLnBkZicsXG4vLyAgICBpbWFnZTogICAgICAgIHsgdHlwZTogJ2pwZWcnLCBxdWFsaXR5OiAwLjk4IH0sXG4vLyAgICBodG1sMmNhbnZhczogIHsgZHBpOiA3MiwgbGV0dGVyUmVuZGVyaW5nOiB0cnVlLCBoZWlnaHQ6IDI5NzAsIHdpZHRoOiA1MTAwIH0sXG4vLyAgICBqc1BERjogICAgICAgIHsgdW5pdDogJ21tJywgZm9ybWF0OiAnQTQnLCBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyB9XG4vLyAgfSk7XG4vLyB9KTtcblxuXG4vLyAtLS0gQVJDSElWRVxuXG4vLyAkLmFqYXgoe1xuLy8gIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjI4MDE3L3Rlc3RcIixcbi8vICB0eXBlOiAnZ2V0Jyxcbi8vICBkYXRhVHlwZTogJ2pzb25wJyxcbi8vICBqc29ucDogJ2pzb25wJywgLy8gbW9uZ29kYiBpcyBleHBlY3RpbmcgdGhhdFxuLy8gIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XG4vLyAgICAgY29uc29sZS5sb2coJ3N1Y2Nlc3MnLCBkYXRhKTtcbi8vICAgfSxcbi8vICAgZXJyb3I6IGZ1bmN0aW9uIChYTUxIdHRwUmVxdWVzdCwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcbi8vICAgICBjb25zb2xlLmxvZygnZXJyb3InLCBlcnJvclRocm93bik7XG4vLyAgIH1cbi8vIH0pO1xuIiwiLy8gI2NvdW50ZXIgZm9sbG93cyB0aGUgbW91c2VcbiQoZG9jdW1lbnQpLmJpbmQoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpe1xuICBpZiAoZS5wYWdlWCA+PSAoJChkb2N1bWVudCkud2lkdGgoKS8yKSkge1xuICAgIC8vIGlmIG1vdXNlIG9mIHJpZ2h0IHNpZGUgb2YgcGFnZVxuICAgICQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG4gICAgJCgnI2NvdW50ZXInKS5jc3Moe1xuICAgICAgbGVmdDogIGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcbiAgICAgIHRvcDogICBlLnBhZ2VZICsgNTBcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgcGFnZVxuICAgICQoJyNjb3VudGVyJykucmVtb3ZlQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG4gICAgJCgnI2NvdW50ZXInKS5jc3Moe1xuICAgICAgbGVmdDogIGUucGFnZVggKyAyMCxcbiAgICAgIHRvcDogICBlLnBhZ2VZICsgNTBcbiAgICB9KTtcbiAgfVxufSk7XG4iXX0=
