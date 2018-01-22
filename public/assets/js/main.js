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
      controller(Publication)
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
    createElement(element)
    console.log('saved pub')
    $(".page").css("background-color", "yellow");
    $("body").css("background-color", "yellow");
  }
}
$('.page').click(function(){ //test
  renderPublication(Publication)
})



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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvdW50ZG93bi5qcyIsIm1haW4uanMiLCJ0aW1lX2ZvbGxvd19tb3VzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBsb2FkU291bmQgKCkge1xuICBjb25zb2xlLmxvZygnbG9hZCBzb3VuZCEnKTtcbiAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcImFzc2V0cy9hdWRpby9iZWVwLm1wM1wiLCAnYmVlcCcpO1xuICBjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFwiYXNzZXRzL2F1ZGlvL2JlZXAtMi5tcDNcIiwgJ2JlZXAtMicpO1xuICBjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFwiYXNzZXRzL2F1ZGlvL2RpbmcubXAzXCIsICdkaW5nJyk7XG59XG5cbmxvYWRTb3VuZCgpO1xuXG5mdW5jdGlvbiBwbGF5RGluZyAoKSB7XG4gIGNvbnNvbGUubG9nKCdiZWVwIScpO1xuICBjcmVhdGVqcy5Tb3VuZC5wbGF5KCdiZWVwJyk7XG59XG5cblxuLy8gY291bnRkb3duIHRpbWVyXG5mdW5jdGlvbiBjb3VudGRvd24oc3RhcnRUaW1lKSB7XG4gIGlmIChzdGFydFRpbWUgPj0gMSkge1xuICAgIGNyZWF0ZWpzLlNvdW5kLnBsYXkoJ2JlZXAtMicpO1xuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7XG4gICAgICBzdGFydFRpbWUgPSBzdGFydFRpbWUgLSAxO1xuICAgICAgJCgnI2NvdW50ZG93bicpLmh0bWwoc3RhcnRUaW1lKTsgLy8gc2V0IGN1cnJlbnQgdGltZSBpbiAjY291bnRkb3duXG4gICAgICBjb3VudGRvd24oc3RhcnRUaW1lKTsgLy8gcmVwZWF0IGZ1bmN0aW9uXG4gICAgfSwgMTAwMCk7XG4gIH0gZWxzZSB7XG4gICAgJCgnI2NvdW50ZG93bicpLmh0bWwoJ3N0YXJ0IGdhbWUhJyk7IC8vIHNldCB0byBzdGFydCBnYW1lIG1lc3NhZ2VcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgLy8gd2FpdCBhIGJpdFxuICAgICAgJCgnI2NvdW50ZG93bicpLmZhZGVPdXQoMTAwMCkgLy8gZmFkZSBvdXQgdGhlICNjb3VudGRvd25cbiAgICAgIC8vIFRPRE86IHN0YXJ0IHRpbWUhXG4gICAgfSwgMjAwKTtcbiAgICBjcmVhdGVqcy5Tb3VuZC5wbGF5KCdkaW5nJyk7XG4gIH1cbn1cblxudmFyIHN0YXJ0VGltZSA9IDQ7XG5jb3VudGRvd24oc3RhcnRUaW1lKTtcbiQoJyNjb3VudGRvd24nKS5odG1sKHN0YXJ0VGltZSk7XG4iLCIvLyAtLS0gR0xPQkFMXG5cbnZhciBwYWdlcyA9ICQoJy5wYWdlJyk7XG52YXIgY3JpdGljUG9wdXAgPSAkKCcjY3JpdGljJyk7XG52YXIgZHJvcERlbGF5ID0gMTAwO1xuXG5cblxuXG4vLyAtLS0gR0VORVJBTCBGVU5DVElPTlNcblxuZnVuY3Rpb24gbWFrZUlkKCkge1xuICB2YXIgcmFuZExldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNikpO1xuICB2YXIgaWQgPSByYW5kTGV0dGVyICsgRGF0ZS5ub3coKTtcbiAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQuZGF0YS5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikpIHtcbiAgICB2YXIgcGFnZUVsZW1lbnRDb250ZW50ID0gJChcIjxpbWc+XCIsIHtcInNyY1wiOiBlbGVtZW50LmRhdGF9KTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZGVCYXNlZFRleHQgPSBhdG9iKCBlbGVtZW50LmRhdGEuc3Vic3RyaW5nKDIzKSApO1xuICAgIHZhciBodG1sQnJUZXh0ID0gZGVCYXNlZFRleHQucmVwbGFjZSgvXFxuL2csIFwiPGJyLz5cIik7IFxuICAgIGNvbnNvbGUubG9nKGh0bWxCclRleHQpO1xuICAgIHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKFwiPHA+XCIpLmFwcGVuZChodG1sQnJUZXh0KTsgLy8gcmVtb3ZlIFwiZGF0YTp0ZXh0L3BsYWluO2Jhc2U2NFwiXG4gIH1cbiAgdmFyIHBhZ2VFbGVtZW50ID0gJChcIjxkaXY+XCIsIHtcImNsYXNzXCI6IFwicGFnZS1lbGVtZW50IGRyYWdnYWJsZVwifSk7XG4gIHZhciBwYWdlRWxlbWVudENsb3NlID0gJChcIjxzcGFuPlwiLCB7XCJjbGFzc1wiOiBcImNsb3NlXCJ9KS50ZXh0KCd4Jyk7XG4gIHBhZ2VFbGVtZW50LmFwcGVuZChwYWdlRWxlbWVudENvbnRlbnQsIHBhZ2VFbGVtZW50Q2xvc2UpO1xuICBwYWdlRWxlbWVudC5hdHRyKCdpZCcsIGVsZW1lbnQuaWQpO1xuICAkKCcjJyArIGVsZW1lbnQucGFnZSkuYXBwZW5kKHBhZ2VFbGVtZW50KTtcbiAgaWYgKGVsZW1lbnQucG9zKSB7ICAgLy8gcmVjb25zdHJ1Y3Rpbmcgc2F2ZWQgZWxlbWVudFxuICAgIHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkubGVmdCA9IGVsZW1lbnQucG9zWzBdXG4gICAgcGFnZUVsZW1lbnQucG9zaXRpb24oKS50b3AgPSBlbGVtZW50LnBvc1sxXVxuICAgIC8vIHBhZ2VFbGVtZW50LndpZHRoKGVsZW1lbnQucG9zWzJdKSAvLyBwcm9ibGVtcyB3aXRoIHRoZXNlIHR3b1xuICAgIC8vIHBhZ2VFbGVtZW50LmhlaWdodChlbGVtZW50LnBvc1szXSkgXG4gIH0gZWxzZSB7IC8vIGRyb3BwaW5nIG5ldyBmaWxlXG4gICAgcmV0dXJuIGVsZW1lbnRQb3MgPSBbXG4gICAgICBwYWdlRWxlbWVudC5wb3NpdGlvbigpLmxlZnQsXG4gICAgICBwYWdlRWxlbWVudC5wb3NpdGlvbigpLnRvcCxcbiAgICAgIHBhZ2VFbGVtZW50LndpZHRoKCksXG4gICAgICBwYWdlRWxlbWVudC5oZWlnaHQoKSxcbiAgICAgIDAgLy8gcm90YXRpb24gKFRPRE8pXG4gICAgXTtcbiAgfVxufVxuXG5cblxuXG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG4gIC8vIGFsbCBvdXIgc3RhdGVzXG4gIGlkOiBtYWtlSWQoKSxcbiAgdGl0bGU6ICdURVNUIFBVQicsXG4gIHRpbWVMZWZ0OiA1MDAwMDAwMCxcbiAgZXhwaXJlZDogZmFsc2UsXG4gIGVsZW1lbnRzOiBbXSxcbiAgYXV0aG9yczogW11cbn07XG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIGlucHV0KSB7XG5cbiAgLy8gZXhwaXJlZD9cbiAgaWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkge1xuICAgIHNob3dUaW1lKFB1YmxpY2F0aW9uKTtcbiAgfVxuICBlbHNlIHtcbiAgICBQdWJsaWNhdGlvbi5leHBpcmVkID0gdHJ1ZVxuICAgIHNob3dFeHBpcmVkKFB1YmxpY2F0aW9uKVxuICAgIG5vRHJhZygpXG4gICAgc2F2ZXRvRGIoUHVibGljYXRpb24pXG4gICAgLy8gbWFrZVBkZigpXG4gICAgLy8gY2hlY2tQZGYoKVxuICB9XG4gIFxuICBpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSBmYWxzZSkge1xuICAgIGNvbnNvbGUubG9nKGlucHV0KTtcbiAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgIGNhc2UgIGlucHV0LnZpc2libGUgPT0gZmFsc2UgOiAvLyBkZWxldGluZyBhbiBlbGVtZW50XG4gICAgICAgIHJlbW92ZUVsZW1lbnQoaW5wdXQuaWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgIGlucHV0LmRhdGEuaW5jbHVkZXMoXCJkYXRhOmltYWdlXCIpICYmIFxuICAgICAgICAgICAgaW5wdXQudmlzaWJsZSA9PSB0cnVlIDogLy8gbmV3IGltYWdlXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgUHVibGljYXRpb25cbiAgICAgICAgUHVibGljYXRpb24uZWxlbWVudHMucHVzaChpbnB1dCk7XG4gICAgICAgIC8vIGRyb3AgZmlsZVxuICAgICAgICBkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBpbnB1dC5pZCk7XG4gICAgICAgIC8vIGFkZCBib251cyB0aW1lXG4gICAgICAgIGFkZHRpbWUoMTAwMCk7XG4gICAgICAgIC8vIGNyaXRpYyBzcGVha1xuICAgICAgICAvLyBjcml0aWMoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICBpbnB1dC5kYXRhLmluY2x1ZGVzKFwiZGF0YTp0ZXh0L3BsYWluXCIpICYmIFxuICAgICAgICAgICAgaW5wdXQudmlzaWJsZSA9PSB0cnVlIDogLy8gbmV3IHRleHRcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBQdWJsaWNhdGlvblxuICAgICAgICBQdWJsaWNhdGlvbi5lbGVtZW50cy5wdXNoKGlucHV0KTtcbiAgICAgICAgLy8gZHJvcCBmaWxlXG4gICAgICAgIGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0LmlkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICAhaW5wdXQuZGF0YS5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikgJiZcbiAgICAgICAgICAgICFpbnB1dC5kYXRhLmluY2x1ZGVzKFwiZGF0YTp0ZXh0L3BsYWluXCIpIDogLy8gbmVpdGhlciBhbiBpbWFnZSBub3IgdGV4dFxuICAgICAgICBub3RBbkltYWdlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IHRydWUpIHsgLy8gdG9vIGxhdGVcbiAgICBMYXRlRHJvcEZpbGUoKTtcbiAgfVxufVxuXG5cblxuXG5cbi8vIC0tLSBDT05UUk9MTEVSXG5cbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKFwic2F2ZWRcIikgPCAwKSB7IC8vIGlmIG5vdCBhIHNhdmVkIHB1YmxpY2F0aW9uXG4gICAgdmFyIHggPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgIFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgLSAxMDtcbiAgICAgIGNvbnRyb2xsZXIoUHVibGljYXRpb24pXG4gICAgfSwgMTApO1xuICB9IGVsc2Uge1xuICAgIHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKVxuICAgIG5vRHJhZygpXG4gIH1cbn0pO1xuXG5cbmZ1bmN0aW9uIGFkZHRpbWUoYm9udXNUaW1lKSB7XG4gIFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgKyBib251c1RpbWU7XG59XG5cbi8vIGRyb3BGaWxlXG5cbnBhZ2VzLm9uKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICQodGhpcykuYWRkQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKFwiZHJhZ2xlYXZlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xufSk7XG5wYWdlcy5vbihcImRyb3BcIiwgZnVuY3Rpb24oZSkge1xuICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnNvbGUubG9nKGUpO1xuICB2YXIgZmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzXG4gIHZhciB5ID0gMDtcbiAgZm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICB2YXIgcGFnZUlkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG4gICAgICAvLyBpZCwgZGF0YSwgc2l6ZSwgcG9zLCByb3RhdGlvbj8sIHZpc2libGVcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgY29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyBpZDogbWFrZUlkKCksIGRhdGE6IGV2ZW50LnRhcmdldC5yZXN1bHQsIHBvczogWzAsMCwwLDAsMF0sIHZpc2libGU6IHRydWUsIHBhZ2U6IHBhZ2VJZCB9ICk7XG4gICAgICB9LCB5ICogZHJvcERlbGF5KTtcbiAgICAgIHkgKz0gMTtcbiAgICB9O1xuICAgIGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKFwiZHJvcFwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgU291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudFxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jbG9zZScsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHBhZ2VJZCA9ICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5hdHRyKCdpZCcpO1xuICB2YXIgZWxlbWVudElkID0gJCh0aGlzKS5wYXJlbnQoKS5hdHRyKCdpZCcpO1xuICB2YXIgZWxlbWVudERhdGEgPSAkKHRoaXMpLnNpYmxpbmdzKCkuYXR0cignc3JjJyk7XG4gIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgaWQ6IGVsZW1lbnRJZCwgZGF0YTogZWxlbWVudERhdGEsIHBvczogWzAsMCwwLDAsMF0sIHZpc2libGU6IGZhbHNlLCBwYWdlOiBwYWdlSWR9KTtcbn0pO1xuXG5cblxuXG5cblxuLy8gLS0tIFZJRVdcblxudmFyIFNvdW5kID0ge1xuICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vaW5jb3JyZWN0Lm1wMycpO1xuICAgIGF1ZGlvLnBsYXkoKTtcbiAgfSxcbiAgZGluZzogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vZGluZy5tcDMnKTtcbiAgICBhdWRpby5wbGF5KCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHNob3dUaW1lKFB1YmxpY2F0aW9uKSB7XG4gIHNlY29uZHMgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDEwMDA7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY291bnRlclwiKS5pbm5lckhUTUwgPSBzZWNvbmRzLnRvRml4ZWQoMikgKyBcIiBzZWNvbmRzIGxlZnQhXCI7XG59XG5cbmZ1bmN0aW9uIHNob3dFeHBpcmVkKCkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdW50ZXJcIikuaW5uZXJIVE1MID0gXCJleHBpcmVkIVwiO1xuICAkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKTtcbiAgLy9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gIC8vICB3aW5kb3cucHJpbnQoKTtcbiAgLy99LCAxMDAwKTtcbiAgY2xlYXJJbnRlcnZhbCh4KTtcbn1cblxuZnVuY3Rpb24gbm90QW5JbWFnZSgpIHtcbiAgU291bmQuZXJyb3IoKTtcbiAgYWxlcnQoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIG5vdCBhbiBpbWFnZSEnKTtcbn1cblxuZnVuY3Rpb24gZHJvcEVsZW1lbnQocGFnZUlkLCBkYXRhLCBpZCkge1xuICB2YXIgZWxlbWVudCA9IHtpZDogaWQsIGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZH1cbiAgLy8gcmVhZCBzaXplLCBwb3MsIHJvdCBhbmQgYWRkIHRoZW0gdG8gUHVibGljYXRpb25cbiAgdmFyIGVsZW1lbnRQb3MgPSBjcmVhdGVFbGVtZW50KGVsZW1lbnQpXG4gIGZvcih2YXIgaSA9IDAgOyBpIDwgUHVibGljYXRpb24uZWxlbWVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAoUHVibGljYXRpb24uZWxlbWVudHNbaV0uaWQgPT0gaWQpIHtcbiAgICAgIFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldLnBvcyA9IGVsZW1lbnRQb3M7XG4gICAgfVxuICB9XG4gIFNvdW5kLmRpbmcoKTtcbn1cblxuZnVuY3Rpb24gTGF0ZURyb3BGaWxlKHNyYykge1xuICBhbGVydCgndG9vIGxhdGUgYnJvJyk7XG59XG5cbmZ1bmN0aW9uIG5vRHJhZygpIHtcbiAgdmFyIGVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5kcmFnZ2FibGVcIik7XG4gICAgW10uZm9yRWFjaC5jYWxsKGVsZW1zLCBmdW5jdGlvbihlbCkge1xuICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImRyYWdnYWJsZVwiKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyaXRpYygpIHtcbiAgY3JpdGljUG9wdXAuaW5uZXJIVE1MID0gJ01ha2UgdGhpcyBpbWFnZSBiaWdnZXIgcGxzISc7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUVsZW1lbnQoaWQpIHtcbiAgJCgnIycgKyBpZCkuaGlkZSgpO1xuICBjb25zb2xlLmxvZyhpZCk7XG59XG5cbmludGVyYWN0KCcuZHJhZ2dhYmxlJylcbiAgLmRyYWdnYWJsZSh7XG4gICAgb25tb3ZlOiB3aW5kb3cuZHJhZ01vdmVMaXN0ZW5lcixcbiAgICByZXN0cmljdDoge1xuICAgICAgcmVzdHJpY3Rpb246ICdwYXJlbnQnLFxuICAgICAgZWxlbWVudFJlY3Q6IHtcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICBib3R0b206IDEsXG4gICAgICAgIHJpZ2h0OiAxXG4gICAgICB9XG4gICAgfSxcbiAgfSlcbiAgLnJlc2l6YWJsZSh7XG4gICAgLy8gcmVzaXplIGZyb20gYWxsIGVkZ2VzIGFuZCBjb3JuZXJzXG4gICAgZWRnZXM6IHtcbiAgICAgIGxlZnQ6IHRydWUsXG4gICAgICByaWdodDogdHJ1ZSxcbiAgICAgIGJvdHRvbTogdHJ1ZSxcbiAgICAgIHRvcDogdHJ1ZVxuICAgIH0sXG5cbiAgICAvLyBrZWVwIHRoZSBlZGdlcyBpbnNpZGUgdGhlIHBhcmVudFxuICAgIHJlc3RyaWN0RWRnZXM6IHtcbiAgICAgIG91dGVyOiAncGFyZW50JyxcbiAgICAgIGVuZE9ubHk6IHRydWUsXG4gICAgfSxcblxuICAgIGluZXJ0aWE6IHRydWUsXG4gIH0pXG4gIC5vbigncmVzaXplbW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcbiAgICAgIHggPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCksXG4gICAgICB5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDApO1xuXG4gICAgLy8gdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVcbiAgICB0YXJnZXQuc3R5bGUud2lkdGggPSBldmVudC5yZWN0LndpZHRoICsgJ3B4JztcbiAgICB0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gZXZlbnQucmVjdC5oZWlnaHQgKyAncHgnO1xuXG4gICAgLy8gdHJhbnNsYXRlIHdoZW4gcmVzaXppbmcgZnJvbSB0b3Agb3IgbGVmdCBlZGdlc1xuICAgIHggKz0gZXZlbnQuZGVsdGFSZWN0LmxlZnQ7XG4gICAgeSArPSBldmVudC5kZWx0YVJlY3QudG9wO1xuXG4gICAgdGFyZ2V0LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPVxuICAgICAgJ3RyYW5zbGF0ZSgnICsgeCArICdweCwnICsgeSArICdweCknO1xuXG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG4gIH0pO1xuXG5mdW5jdGlvbiBkcmFnTW92ZUxpc3RlbmVyKGV2ZW50KSB7XG4gIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQsXG4gICAgLy8ga2VlcCB0aGUgZHJhZ2dlZCBwb3NpdGlvbiBpbiB0aGUgZGF0YS14L2RhdGEteSBhdHRyaWJ1dGVzXG4gICAgeCA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteCcpKSB8fCAwKSArIGV2ZW50LmR4LFxuICAgIHkgPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXknKSkgfHwgMCkgKyBldmVudC5keTtcblxuICAvLyB0cmFuc2xhdGUgdGhlIGVsZW1lbnRcbiAgdGFyZ2V0LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9XG4gICAgdGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9XG4gICAgJ3RyYW5zbGF0ZSgnICsgeCArICdweCwgJyArIHkgKyAncHgpJztcblxuICAvLyB1cGRhdGUgdGhlIHBvc2lpb24gYXR0cmlidXRlc1xuICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KTtcbiAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG5cbiAgLy8gdXBkYXRlIHotaW5kZXhcbiAgdmFyIG1heHpJbmRleCA9IDAsXG4gICAgaSA9IDA7XG4gIHBhZ2VFbGVtZW50cyA9ICQoJyMnICsgdGFyZ2V0LmlkKS5wYXJlbnQoKS5jaGlsZHJlbigpO1xuICBwYWdlRWxlbWVudHMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgaSArPSAxO1xuICAgIGlmICggJCh0aGlzKS5jc3MoXCJ6LWluZGV4XCIpID49IG1heHpJbmRleCApIHtcbiAgICAgIG1heHpJbmRleCA9IHBhcnNlSW50KCQodGhpcykuY3NzKFwiei1pbmRleFwiKSk7XG4gICAgfVxuICAgIGlmKGkgPT0gcGFnZUVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgaWYgKHRhcmdldC5zdHlsZS56SW5kZXggIT0gbWF4ekluZGV4IHwgdGFyZ2V0LnN0eWxlLnpJbmRleCA9PSAwKSB7XG4gICAgICAgIHRhcmdldC5zdHlsZS56SW5kZXggPSBtYXh6SW5kZXggKyAxO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIC8vIHRhcmdldC5zdHlsZS56SW5kZXggPSBtYXh6SW5kZXggKyAxO1xufVxuXG4vLyB0aGlzIGlzIHVzZWQgbGF0ZXIgaW4gdGhlIHJlc2l6aW5nIGFuZCBnZXN0dXJlIGRlbW9zXG53aW5kb3cuZHJhZ01vdmVMaXN0ZW5lciA9IGRyYWdNb3ZlTGlzdGVuZXI7XG5cblxuXG5cblxuXG4vLyAtLS0gU0FWRURcblxuZnVuY3Rpb24gcmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pIHtcbiAgZm9yIChsZXQgZWxlbWVudCBvZiBQdWJsaWNhdGlvbi5lbGVtZW50cykge1xuICAgIGNyZWF0ZUVsZW1lbnQoZWxlbWVudClcbiAgICBjb25zb2xlLmxvZygnc2F2ZWQgcHViJylcbiAgICAkKFwiLnBhZ2VcIikuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBcInllbGxvd1wiKTtcbiAgICAkKFwiYm9keVwiKS5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIFwieWVsbG93XCIpO1xuICB9XG59XG4kKCcucGFnZScpLmNsaWNrKGZ1bmN0aW9uKCl7IC8vdGVzdFxuICByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbilcbn0pXG5cblxuXG4vLyAtLS0gQkFDS0VORFxuXG4vLyBzZW5kIGNhbGwgdG8gc2VydmVyIHRvIG1ha2UgcGRmXG5mdW5jdGlvbiBtYWtlUGRmKCkge1xuICAkLmdldCggJy9wZGYnLCBmdW5jdGlvbiggZGF0YSApIHtcbiAgICBjb25zb2xlLmxvZyggJ1NlbnQgY2FsbCB0byBtYWtlIFBERi4nICk7XG4gIH0pO1xufVxuXG4vLyBjaGVjayBpZiBwZGYgZXhpc3RzIGFuZCByZWRpcmVjdCB0byBmaWxlXG5mdW5jdGlvbiBjaGVja1BkZigpIHtcbiAgdmFyIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiAnSEVBRCcsXG4gICAgICB1cmw6ICdhc3NldHMvcGRmL3ByaW50LXRlc3QucGRmJyxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKG1zZyl7XG4gICAgICAgIGFsZXJ0KCdHbyB0byBQREYhJyk7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoeSk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJ2Fzc2V0cy9wZGYvcHJpbnQtdGVzdC5wZGYnO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbihqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pe1xuICAgICAgICBsb2coanFYSFIpO1xuICAgICAgICBsb2coZXJyb3JUaHJvd24pO1xuICAgICAgfVxuICAgIH0pXG4gIH0sIDEwMCk7XG59XG5cbmZ1bmN0aW9uIHNhdmV0b0RiKHB1YmxpY2F0aW9uKSB7XG4gICQuYWpheCh7ICAgICAgICAgICAgICAgICAgICBcbiAgICB1cmw6ICcvZGInLCAgICAgXG4gICAgdHlwZTogJ3Bvc3QnLCAvLyBwZXJmb3JtaW5nIGEgUE9TVCByZXF1ZXN0XG4gICAgZGF0YSA6IHB1YmxpY2F0aW9uLFxuICAgIGRhdGFUeXBlOiAnanNvbicsICAgICAgICAgICAgICAgICAgIFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHB1YmxpY2F0aW9uKSAgICAgICAgIFxuICAgIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwdWJsaWNhdGlvbiBzZW50IHRvIGRhdGFiYXNlLicpXG4gICAgfSBcbiAgfSk7XG59XG5cblxuLy8gLy8gbWFrZSBwZGZcbi8vIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3AxJyk7XG4vLyAkKCcjcDEnKS5jbGljayhmdW5jdGlvbigpe1xuLy8gIGh0bWwycGRmKGVsZW1lbnQsIHtcbi8vICAgIG1hcmdpbjogICAgICAgMSxcbi8vICAgIGZpbGVuYW1lOiAgICAgJ215ZmlsZS5wZGYnLFxuLy8gICAgaW1hZ2U6ICAgICAgICB7IHR5cGU6ICdqcGVnJywgcXVhbGl0eTogMC45OCB9LFxuLy8gICAgaHRtbDJjYW52YXM6ICB7IGRwaTogNzIsIGxldHRlclJlbmRlcmluZzogdHJ1ZSwgaGVpZ2h0OiAyOTcwLCB3aWR0aDogNTEwMCB9LFxuLy8gICAganNQREY6ICAgICAgICB7IHVuaXQ6ICdtbScsIGZvcm1hdDogJ0E0Jywgb3JpZW50YXRpb246ICdwb3J0cmFpdCcgfVxuLy8gIH0pO1xuLy8gfSk7XG5cblxuLy8gLS0tIEFSQ0hJVkVcblxuLy8gJC5hamF4KHtcbi8vICB1cmw6IFwiaHR0cDovL2xvY2FsaG9zdDoyODAxNy90ZXN0XCIsXG4vLyAgdHlwZTogJ2dldCcsXG4vLyAgZGF0YVR5cGU6ICdqc29ucCcsXG4vLyAganNvbnA6ICdqc29ucCcsIC8vIG1vbmdvZGIgaXMgZXhwZWN0aW5nIHRoYXRcbi8vICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xuLy8gICAgIGNvbnNvbGUubG9nKCdzdWNjZXNzJywgZGF0YSk7XG4vLyAgIH0sXG4vLyAgIGVycm9yOiBmdW5jdGlvbiAoWE1MSHR0cFJlcXVlc3QsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4vLyAgICAgY29uc29sZS5sb2coJ2Vycm9yJywgZXJyb3JUaHJvd24pO1xuLy8gICB9XG4vLyB9KTtcbiIsIi8vICNjb3VudGVyIGZvbGxvd3MgdGhlIG1vdXNlXG4kKGRvY3VtZW50KS5iaW5kKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKXtcbiAgaWYgKGUucGFnZVggPj0gKCQoZG9jdW1lbnQpLndpZHRoKCkvMikpIHtcbiAgICAvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIHBhZ2VcbiAgICAkKCcjY291bnRlcicpLmFkZENsYXNzKCdtb3VzZV9yaWdodCcpO1xuICAgICQoJyNjb3VudGVyJykuY3NzKHtcbiAgICAgIGxlZnQ6ICBlLnBhZ2VYIC0gMjAgLSAkKCcjY291bnRlcicpLndpZHRoKCksXG4gICAgICB0b3A6ICAgZS5wYWdlWSArIDUwXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gaWYgbW91c2Ugb2YgbGVmdCBzaWRlIG9mIHBhZ2VcbiAgICAkKCcjY291bnRlcicpLnJlbW92ZUNsYXNzKCdtb3VzZV9yaWdodCcpO1xuICAgICQoJyNjb3VudGVyJykuY3NzKHtcbiAgICAgIGxlZnQ6ICBlLnBhZ2VYICsgMjAsXG4gICAgICB0b3A6ICAgZS5wYWdlWSArIDUwXG4gICAgfSk7XG4gIH1cbn0pO1xuIl19
