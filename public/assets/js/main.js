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
  $('#countdown').show();
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



// --- GLOBAL

var pages = $('.page');
var criticPopup = $('#critic');
var dropDelay = 100;
var pdfReady = false




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

function createElementCanvas(element) {

  var canvas = document.createElement('canvas');

  canvas.width = element.pos[2]
  canvas.height = 300 // should be element.pos[3]
  canvas.style.marginLeft = element.pos[0] + 'px';
  canvas.style.marginTop = element.pos[1] + 'px';
  var ctx = canvas.getContext("2d");
  $('#' + element.page).append(canvas);

  var image = new Image();
  image.onload = function() {
    ctx.drawImage(image, 0, 0, element.pos[2], 300);
  };
  image.src = element.data;
}



// --- M-V-C

var Publication = {
  // all our states
  id: makeId(),
  title: 'TEST PUB',
  timeLeft: 15000,
  expired: false,
  elements: [],
  authors: []
};

function controller(Publication, input) {

  // expired?
  if (Publication.timeLeft > 0) { // expired
    showTime(Publication)
  }
  else { // not expired
    Publication.expired = true
    showExpired(Publication)
    noDrag()
    savetoDb(Publication)
    makePdf(Publication.id)
    showPdf(Publication.id)
    checkPdf(Publication.id)
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

var x
$( document ).ready(function() {
  if (window.location.href.indexOf("saved") < 0) { // if not a saved publication
    x = setInterval(function() {
      Publication.timeLeft = Publication.timeLeft - 10;
      controller(Publication)
    }, 10);

    mouseCounter()

    // countdown
    var startTime = 4;
    countdown(startTime);
    $('#countdown').html(startTime);
  } else {
    renderPublication(Publication)
    noDrag()
    pdfDownload()
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

// merge these two
function showTime(Publication) {
  seconds = Publication.timeLeft / 1000;
  $('#counter').show();
  document.getElementById("counter").innerHTML = seconds.toFixed(2) + " seconds left!";
}
function mouseCounter() {
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


// show pdf box

function showPdf(id) {
  $('#pdfbox').show()
  var y = setInterval(function(){
    if (pdfReady == true) {
      $('#pdfbox').html('Download your pdf <a href="assets/pdf/' + id + '/' + id + '.pdf">here</a>' )
      clearInterval(y)
    } else {
      $('#pdfbox').text('Your PDF is being generated')
    }
  }, 100) 
} 



// --- SAVED

function renderPublication(Publication) {
  var i;
  for (i = 0; i < Publication.elements.length; ++i) {
    if ( window.location.href.indexOf("print=true") > 0 ) {
      createElementCanvas(Publication.elements[i])
      console.log('print pub')
    } else {
      createElement(Publication.elements[i])
      console.log('saved pub')      
    }
  }
}

function pdfDownload() {
  $('#pdf-download').show()
  $('#pdf-download').click(function() {
    makePdf(Publication.id)
    showPdf(Publication.id)
    checkPdf(Publication.id)
  });
}




// --- BACKEND

// send call to server to make pdf
function makePdf(id) {
  $.get( '/pdf?id=' + id, function( data ) {
    console.log( 'Sent call to make PDF.' );
  });
}

// check if pdf exists and redirect to file
function checkPdf(id) {
  var y = setInterval(function(){
    $.ajax({
      type: 'HEAD',
      url: 'assets/pdf/' + id + '/' + id + '.pdf',
      success: function(msg){
        clearInterval(y);
        pdfReady = true;
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log(jqXHR);
        console.log(errorThrown);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvdW50ZG93bi5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gbG9hZFNvdW5kICgpIHtcbiAgY29uc29sZS5sb2coJ2xvYWQgc291bmQhJyk7XG4gIGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXCJhc3NldHMvYXVkaW8vYmVlcC5tcDNcIiwgJ2JlZXAnKTtcbiAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcImFzc2V0cy9hdWRpby9iZWVwLTIubXAzXCIsICdiZWVwLTInKTtcbiAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcImFzc2V0cy9hdWRpby9kaW5nLm1wM1wiLCAnZGluZycpO1xufVxuXG5sb2FkU291bmQoKTtcblxuZnVuY3Rpb24gcGxheURpbmcgKCkge1xuICBjb25zb2xlLmxvZygnYmVlcCEnKTtcbiAgY3JlYXRlanMuU291bmQucGxheSgnYmVlcCcpO1xufVxuXG5cbi8vIGNvdW50ZG93biB0aW1lclxuZnVuY3Rpb24gY291bnRkb3duKHN0YXJ0VGltZSkge1xuICAkKCcjY291bnRkb3duJykuc2hvdygpO1xuICBpZiAoc3RhcnRUaW1lID49IDEpIHtcbiAgICBjcmVhdGVqcy5Tb3VuZC5wbGF5KCdiZWVwLTInKTtcbiAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpe1xuICAgICAgc3RhcnRUaW1lID0gc3RhcnRUaW1lIC0gMTtcbiAgICAgICQoJyNjb3VudGRvd24nKS5odG1sKHN0YXJ0VGltZSk7IC8vIHNldCBjdXJyZW50IHRpbWUgaW4gI2NvdW50ZG93blxuICAgICAgY291bnRkb3duKHN0YXJ0VGltZSk7IC8vIHJlcGVhdCBmdW5jdGlvblxuICAgIH0sIDEwMDApO1xuICB9IGVsc2Uge1xuICAgICQoJyNjb3VudGRvd24nKS5odG1sKCdzdGFydCBnYW1lIScpOyAvLyBzZXQgdG8gc3RhcnQgZ2FtZSBtZXNzYWdlXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IC8vIHdhaXQgYSBiaXRcbiAgICAgICQoJyNjb3VudGRvd24nKS5mYWRlT3V0KDEwMDApIC8vIGZhZGUgb3V0IHRoZSAjY291bnRkb3duXG4gICAgICAvLyBUT0RPOiBzdGFydCB0aW1lIVxuICAgIH0sIDIwMCk7XG4gICAgY3JlYXRlanMuU291bmQucGxheSgnZGluZycpO1xuICB9XG59XG5cblxuIiwiLy8gLS0tIEdMT0JBTFxuXG52YXIgcGFnZXMgPSAkKCcucGFnZScpO1xudmFyIGNyaXRpY1BvcHVwID0gJCgnI2NyaXRpYycpO1xudmFyIGRyb3BEZWxheSA9IDEwMDtcbnZhciBwZGZSZWFkeSA9IGZhbHNlXG5cblxuXG5cbi8vIC0tLSBHRU5FUkFMIEZVTkNUSU9OU1xuXG5mdW5jdGlvbiBtYWtlSWQoKSB7XG4gIHZhciByYW5kTGV0dGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI2KSk7XG4gIHZhciBpZCA9IHJhbmRMZXR0ZXIgKyBEYXRlLm5vdygpO1xuICByZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCkge1xuICBpZiAoZWxlbWVudC5kYXRhLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSkge1xuICAgIHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKFwiPGltZz5cIiwge1wic3JjXCI6IGVsZW1lbnQuZGF0YX0pO1xuICB9IGVsc2Uge1xuICAgIHZhciBkZUJhc2VkVGV4dCA9IGF0b2IoIGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpICk7XG4gICAgdmFyIGh0bWxCclRleHQgPSBkZUJhc2VkVGV4dC5yZXBsYWNlKC9cXG4vZywgXCI8YnIvPlwiKTsgXG4gICAgY29uc29sZS5sb2coaHRtbEJyVGV4dCk7XG4gICAgdmFyIHBhZ2VFbGVtZW50Q29udGVudCA9ICQoXCI8cD5cIikuYXBwZW5kKGh0bWxCclRleHQpOyAvLyByZW1vdmUgXCJkYXRhOnRleHQvcGxhaW47YmFzZTY0XCJcbiAgfVxuICB2YXIgcGFnZUVsZW1lbnQgPSAkKFwiPGRpdj5cIiwge1wiY2xhc3NcIjogXCJwYWdlLWVsZW1lbnQgZHJhZ2dhYmxlXCJ9KTtcbiAgdmFyIHBhZ2VFbGVtZW50Q2xvc2UgPSAkKFwiPHNwYW4+XCIsIHtcImNsYXNzXCI6IFwiY2xvc2VcIn0pLnRleHQoJ3gnKTtcbiAgcGFnZUVsZW1lbnQuYXBwZW5kKHBhZ2VFbGVtZW50Q29udGVudCwgcGFnZUVsZW1lbnRDbG9zZSk7XG4gIHBhZ2VFbGVtZW50LmF0dHIoJ2lkJywgZWxlbWVudC5pZCk7XG4gICQoJyMnICsgZWxlbWVudC5wYWdlKS5hcHBlbmQocGFnZUVsZW1lbnQpO1xuICBpZiAoZWxlbWVudC5wb3MpIHsgICAvLyByZWNvbnN0cnVjdGluZyBzYXZlZCBlbGVtZW50XG4gICAgcGFnZUVsZW1lbnQucG9zaXRpb24oKS5sZWZ0ID0gZWxlbWVudC5wb3NbMF1cbiAgICBwYWdlRWxlbWVudC5wb3NpdGlvbigpLnRvcCA9IGVsZW1lbnQucG9zWzFdXG4gICAgLy8gcGFnZUVsZW1lbnQud2lkdGgoZWxlbWVudC5wb3NbMl0pIC8vIHByb2JsZW1zIHdpdGggdGhlc2UgdHdvXG4gICAgLy8gcGFnZUVsZW1lbnQuaGVpZ2h0KGVsZW1lbnQucG9zWzNdKSBcbiAgfSBlbHNlIHsgLy8gZHJvcHBpbmcgbmV3IGZpbGVcbiAgICByZXR1cm4gZWxlbWVudFBvcyA9IFtcbiAgICAgIHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkubGVmdCxcbiAgICAgIHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkudG9wLFxuICAgICAgcGFnZUVsZW1lbnQud2lkdGgoKSxcbiAgICAgIHBhZ2VFbGVtZW50LmhlaWdodCgpLFxuICAgICAgMCAvLyByb3RhdGlvbiAoVE9ETylcbiAgICBdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRDYW52YXMoZWxlbWVudCkge1xuXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblxuICBjYW52YXMud2lkdGggPSBlbGVtZW50LnBvc1syXVxuICBjYW52YXMuaGVpZ2h0ID0gMzAwIC8vIHNob3VsZCBiZSBlbGVtZW50LnBvc1szXVxuICBjYW52YXMuc3R5bGUubWFyZ2luTGVmdCA9IGVsZW1lbnQucG9zWzBdICsgJ3B4JztcbiAgY2FudmFzLnN0eWxlLm1hcmdpblRvcCA9IGVsZW1lbnQucG9zWzFdICsgJ3B4JztcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICQoJyMnICsgZWxlbWVudC5wYWdlKS5hcHBlbmQoY2FudmFzKTtcblxuICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCwgZWxlbWVudC5wb3NbMl0sIDMwMCk7XG4gIH07XG4gIGltYWdlLnNyYyA9IGVsZW1lbnQuZGF0YTtcbn1cblxuXG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG4gIC8vIGFsbCBvdXIgc3RhdGVzXG4gIGlkOiBtYWtlSWQoKSxcbiAgdGl0bGU6ICdURVNUIFBVQicsXG4gIHRpbWVMZWZ0OiAxNTAwMCxcbiAgZXhwaXJlZDogZmFsc2UsXG4gIGVsZW1lbnRzOiBbXSxcbiAgYXV0aG9yczogW11cbn07XG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIGlucHV0KSB7XG5cbiAgLy8gZXhwaXJlZD9cbiAgaWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkgeyAvLyBleHBpcmVkXG4gICAgc2hvd1RpbWUoUHVibGljYXRpb24pXG4gIH1cbiAgZWxzZSB7IC8vIG5vdCBleHBpcmVkXG4gICAgUHVibGljYXRpb24uZXhwaXJlZCA9IHRydWVcbiAgICBzaG93RXhwaXJlZChQdWJsaWNhdGlvbilcbiAgICBub0RyYWcoKVxuICAgIHNhdmV0b0RiKFB1YmxpY2F0aW9uKVxuICAgIG1ha2VQZGYoUHVibGljYXRpb24uaWQpXG4gICAgc2hvd1BkZihQdWJsaWNhdGlvbi5pZClcbiAgICBjaGVja1BkZihQdWJsaWNhdGlvbi5pZClcbiAgfVxuICBcbiAgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLmxvZyhpbnB1dCk7XG4gICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICBjYXNlICBpbnB1dC52aXNpYmxlID09IGZhbHNlIDogLy8gZGVsZXRpbmcgYW4gZWxlbWVudFxuICAgICAgICByZW1vdmVFbGVtZW50KGlucHV0LmlkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICBpbnB1dC5kYXRhLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSAmJiBcbiAgICAgICAgICAgIGlucHV0LnZpc2libGUgPT0gdHJ1ZSA6IC8vIG5ldyBpbWFnZVxuICAgICAgICAvLyB1cGRhdGUgdGhlIFB1YmxpY2F0aW9uXG4gICAgICAgIFB1YmxpY2F0aW9uLmVsZW1lbnRzLnB1c2goaW5wdXQpO1xuICAgICAgICAvLyBkcm9wIGZpbGVcbiAgICAgICAgZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQuaWQpO1xuICAgICAgICAvLyBhZGQgYm9udXMgdGltZVxuICAgICAgICBhZGR0aW1lKDEwMDApO1xuICAgICAgICAvLyBjcml0aWMgc3BlYWtcbiAgICAgICAgLy8gY3JpdGljKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAgaW5wdXQuZGF0YS5pbmNsdWRlcyhcImRhdGE6dGV4dC9wbGFpblwiKSAmJiBcbiAgICAgICAgICAgIGlucHV0LnZpc2libGUgPT0gdHJ1ZSA6IC8vIG5ldyB0ZXh0XG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgUHVibGljYXRpb25cbiAgICAgICAgUHVibGljYXRpb24uZWxlbWVudHMucHVzaChpbnB1dCk7XG4gICAgICAgIC8vIGRyb3AgZmlsZVxuICAgICAgICBkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBpbnB1dC5pZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAgIWlucHV0LmRhdGEuaW5jbHVkZXMoXCJkYXRhOmltYWdlXCIpICYmXG4gICAgICAgICAgICAhaW5wdXQuZGF0YS5pbmNsdWRlcyhcImRhdGE6dGV4dC9wbGFpblwiKSA6IC8vIG5laXRoZXIgYW4gaW1hZ2Ugbm9yIHRleHRcbiAgICAgICAgbm90QW5JbWFnZSgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0gZWxzZSBpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSB0cnVlKSB7IC8vIHRvbyBsYXRlXG4gICAgTGF0ZURyb3BGaWxlKCk7XG4gIH1cbn1cblxuXG5cblxuXG4vLyAtLS0gQ09OVFJPTExFUlxuXG52YXIgeFxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoXCJzYXZlZFwiKSA8IDApIHsgLy8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cbiAgICB4ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC0gMTA7XG4gICAgICBjb250cm9sbGVyKFB1YmxpY2F0aW9uKVxuICAgIH0sIDEwKTtcblxuICAgIG1vdXNlQ291bnRlcigpXG5cbiAgICAvLyBjb3VudGRvd25cbiAgICB2YXIgc3RhcnRUaW1lID0gNDtcbiAgICBjb3VudGRvd24oc3RhcnRUaW1lKTtcbiAgICAkKCcjY291bnRkb3duJykuaHRtbChzdGFydFRpbWUpO1xuICB9IGVsc2Uge1xuICAgIHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKVxuICAgIG5vRHJhZygpXG4gICAgcGRmRG93bmxvYWQoKVxuICB9XG59KTtcblxuXG5mdW5jdGlvbiBhZGR0aW1lKGJvbnVzVGltZSkge1xuICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICsgYm9udXNUaW1lO1xufVxuXG4vLyBkcm9wRmlsZVxuXG5wYWdlcy5vbihcImRyYWdvdmVyXCIsIGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKHRoaXMpLmFkZENsYXNzKCdkcmFnb3ZlcicpO1xufSk7XG5wYWdlcy5vbihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJCh0aGlzKS5yZW1vdmVDbGFzcygnZHJhZ292ZXInKTtcbn0pO1xucGFnZXMub24oXCJkcm9wXCIsIGZ1bmN0aW9uKGUpIHtcbiAgJCh0aGlzKS5yZW1vdmVDbGFzcygnZHJhZ292ZXInKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zb2xlLmxvZyhlKTtcbiAgdmFyIGZpbGVzID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5maWxlc1xuICB2YXIgeSA9IDA7XG4gIGZvciAodmFyIGkgPSBmaWxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgdmFyIHBhZ2VJZCA9ICQodGhpcykuYXR0cignaWQnKTtcbiAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xuICAgICAgLy8gaWQsIGRhdGEsIHNpemUsIHBvcywgcm90YXRpb24/LCB2aXNpYmxlXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgaWQ6IG1ha2VJZCgpLCBkYXRhOiBldmVudC50YXJnZXQucmVzdWx0LCBwb3M6IFswLDAsMCwwLDBdLCB2aXNpYmxlOiB0cnVlLCBwYWdlOiBwYWdlSWQgfSApO1xuICAgICAgfSwgeSAqIGRyb3BEZWxheSk7XG4gICAgICB5ICs9IDE7XG4gICAgfTtcbiAgICBjb25zb2xlLmxvZyhmaWxlc1tpXSk7XG4gICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZXNbaV0pO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn0pO1xuLy8gcHJldmVudCBkcm9wIG9uIGJvZHlcbiQoJ2JvZHknKS5vbihcImRyYWdvdmVyXCIsIGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oXCJkcmFnbGVhdmVcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbihcImRyb3BcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIFNvdW5kLmVycm9yKCk7XG59KTtcblxuLy8gcmVtb3ZlIGVsZW1lbnRcbiQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuY2xvc2UnLCBmdW5jdGlvbiAoKSB7XG4gIHZhciBwYWdlSWQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykuYXR0cignaWQnKTtcbiAgdmFyIGVsZW1lbnRJZCA9ICQodGhpcykucGFyZW50KCkuYXR0cignaWQnKTtcbiAgdmFyIGVsZW1lbnREYXRhID0gJCh0aGlzKS5zaWJsaW5ncygpLmF0dHIoJ3NyYycpO1xuICBjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IGlkOiBlbGVtZW50SWQsIGRhdGE6IGVsZW1lbnREYXRhLCBwb3M6IFswLDAsMCwwLDBdLCB2aXNpYmxlOiBmYWxzZSwgcGFnZTogcGFnZUlkfSk7XG59KTtcblxuXG5cblxuXG5cbi8vIC0tLSBWSUVXXG5cbnZhciBTb3VuZCA9IHtcbiAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2luY29ycmVjdC5tcDMnKTtcbiAgICBhdWRpby5wbGF5KCk7XG4gIH0sXG4gIGRpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJyk7XG4gICAgYXVkaW8ucGxheSgpO1xuICB9XG59O1xuXG4vLyBtZXJnZSB0aGVzZSB0d29cbmZ1bmN0aW9uIHNob3dUaW1lKFB1YmxpY2F0aW9uKSB7XG4gIHNlY29uZHMgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDEwMDA7XG4gICQoJyNjb3VudGVyJykuc2hvdygpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdW50ZXJcIikuaW5uZXJIVE1MID0gc2Vjb25kcy50b0ZpeGVkKDIpICsgXCIgc2Vjb25kcyBsZWZ0IVwiO1xufVxuZnVuY3Rpb24gbW91c2VDb3VudGVyKCkge1xuICAkKGRvY3VtZW50KS5iaW5kKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKXtcbiAgICBpZiAoZS5wYWdlWCA+PSAoJChkb2N1bWVudCkud2lkdGgoKS8yKSkge1xuICAgICAgLy8gaWYgbW91c2Ugb2YgcmlnaHQgc2lkZSBvZiBwYWdlXG4gICAgICAkKCcjY291bnRlcicpLmFkZENsYXNzKCdtb3VzZV9yaWdodCcpO1xuICAgICAgJCgnI2NvdW50ZXInKS5jc3Moe1xuICAgICAgICBsZWZ0OiAgZS5wYWdlWCAtIDIwIC0gJCgnI2NvdW50ZXInKS53aWR0aCgpLFxuICAgICAgICB0b3A6ICAgZS5wYWdlWSArIDUwXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaWYgbW91c2Ugb2YgbGVmdCBzaWRlIG9mIHBhZ2VcbiAgICAgICQoJyNjb3VudGVyJykucmVtb3ZlQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG4gICAgICAkKCcjY291bnRlcicpLmNzcyh7XG4gICAgICAgIGxlZnQ6ICBlLnBhZ2VYICsgMjAsXG4gICAgICAgIHRvcDogICBlLnBhZ2VZICsgNTBcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNob3dFeHBpcmVkKCkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdW50ZXJcIikuaW5uZXJIVE1MID0gXCJleHBpcmVkIVwiO1xuICAkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKTtcbiAgLy9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gIC8vICB3aW5kb3cucHJpbnQoKTtcbiAgLy99LCAxMDAwKTtcbiAgY2xlYXJJbnRlcnZhbCh4KTtcbn1cblxuZnVuY3Rpb24gbm90QW5JbWFnZSgpIHtcbiAgU291bmQuZXJyb3IoKTtcbiAgYWxlcnQoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIG5vdCBhbiBpbWFnZSEnKTtcbn1cblxuZnVuY3Rpb24gZHJvcEVsZW1lbnQocGFnZUlkLCBkYXRhLCBpZCkge1xuICB2YXIgZWxlbWVudCA9IHtpZDogaWQsIGRhdGE6IGRhdGEsIHBhZ2U6IHBhZ2VJZH1cbiAgLy8gcmVhZCBzaXplLCBwb3MsIHJvdCBhbmQgYWRkIHRoZW0gdG8gUHVibGljYXRpb25cbiAgdmFyIGVsZW1lbnRQb3MgPSBjcmVhdGVFbGVtZW50KGVsZW1lbnQpXG4gIGZvcih2YXIgaSA9IDAgOyBpIDwgUHVibGljYXRpb24uZWxlbWVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAoUHVibGljYXRpb24uZWxlbWVudHNbaV0uaWQgPT0gaWQpIHtcbiAgICAgIFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldLnBvcyA9IGVsZW1lbnRQb3M7XG4gICAgfVxuICB9XG4gIFNvdW5kLmRpbmcoKTtcbn1cblxuZnVuY3Rpb24gTGF0ZURyb3BGaWxlKHNyYykge1xuICBhbGVydCgndG9vIGxhdGUgYnJvJyk7XG59XG5cbmZ1bmN0aW9uIG5vRHJhZygpIHtcbiAgdmFyIGVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5kcmFnZ2FibGVcIik7XG4gICAgW10uZm9yRWFjaC5jYWxsKGVsZW1zLCBmdW5jdGlvbihlbCkge1xuICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcImRyYWdnYWJsZVwiKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyaXRpYygpIHtcbiAgY3JpdGljUG9wdXAuaW5uZXJIVE1MID0gJ01ha2UgdGhpcyBpbWFnZSBiaWdnZXIgcGxzISc7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUVsZW1lbnQoaWQpIHtcbiAgJCgnIycgKyBpZCkuaGlkZSgpO1xuICBjb25zb2xlLmxvZyhpZCk7XG59XG5cbmludGVyYWN0KCcuZHJhZ2dhYmxlJylcbiAgLmRyYWdnYWJsZSh7XG4gICAgb25tb3ZlOiB3aW5kb3cuZHJhZ01vdmVMaXN0ZW5lcixcbiAgICByZXN0cmljdDoge1xuICAgICAgcmVzdHJpY3Rpb246ICdwYXJlbnQnLFxuICAgICAgZWxlbWVudFJlY3Q6IHtcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICBib3R0b206IDEsXG4gICAgICAgIHJpZ2h0OiAxXG4gICAgICB9XG4gICAgfSxcbiAgfSlcbiAgLnJlc2l6YWJsZSh7XG4gICAgLy8gcmVzaXplIGZyb20gYWxsIGVkZ2VzIGFuZCBjb3JuZXJzXG4gICAgZWRnZXM6IHtcbiAgICAgIGxlZnQ6IHRydWUsXG4gICAgICByaWdodDogdHJ1ZSxcbiAgICAgIGJvdHRvbTogdHJ1ZSxcbiAgICAgIHRvcDogdHJ1ZVxuICAgIH0sXG5cbiAgICAvLyBrZWVwIHRoZSBlZGdlcyBpbnNpZGUgdGhlIHBhcmVudFxuICAgIHJlc3RyaWN0RWRnZXM6IHtcbiAgICAgIG91dGVyOiAncGFyZW50JyxcbiAgICAgIGVuZE9ubHk6IHRydWUsXG4gICAgfSxcblxuICAgIGluZXJ0aWE6IHRydWUsXG4gIH0pXG4gIC5vbigncmVzaXplbW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcbiAgICAgIHggPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCksXG4gICAgICB5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDApO1xuXG4gICAgLy8gdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVcbiAgICB0YXJnZXQuc3R5bGUud2lkdGggPSBldmVudC5yZWN0LndpZHRoICsgJ3B4JztcbiAgICB0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gZXZlbnQucmVjdC5oZWlnaHQgKyAncHgnO1xuXG4gICAgLy8gdHJhbnNsYXRlIHdoZW4gcmVzaXppbmcgZnJvbSB0b3Agb3IgbGVmdCBlZGdlc1xuICAgIHggKz0gZXZlbnQuZGVsdGFSZWN0LmxlZnQ7XG4gICAgeSArPSBldmVudC5kZWx0YVJlY3QudG9wO1xuXG4gICAgdGFyZ2V0LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPVxuICAgICAgJ3RyYW5zbGF0ZSgnICsgeCArICdweCwnICsgeSArICdweCknO1xuXG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG4gICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG4gIH0pO1xuXG5mdW5jdGlvbiBkcmFnTW92ZUxpc3RlbmVyKGV2ZW50KSB7XG4gIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQsXG4gICAgLy8ga2VlcCB0aGUgZHJhZ2dlZCBwb3NpdGlvbiBpbiB0aGUgZGF0YS14L2RhdGEteSBhdHRyaWJ1dGVzXG4gICAgeCA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteCcpKSB8fCAwKSArIGV2ZW50LmR4LFxuICAgIHkgPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXknKSkgfHwgMCkgKyBldmVudC5keTtcblxuICAvLyB0cmFuc2xhdGUgdGhlIGVsZW1lbnRcbiAgdGFyZ2V0LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9XG4gICAgdGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9XG4gICAgJ3RyYW5zbGF0ZSgnICsgeCArICdweCwgJyArIHkgKyAncHgpJztcblxuICAvLyB1cGRhdGUgdGhlIHBvc2lpb24gYXR0cmlidXRlc1xuICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KTtcbiAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG5cbiAgLy8gdXBkYXRlIHotaW5kZXhcbiAgdmFyIG1heHpJbmRleCA9IDAsXG4gICAgaSA9IDA7XG4gIHBhZ2VFbGVtZW50cyA9ICQoJyMnICsgdGFyZ2V0LmlkKS5wYXJlbnQoKS5jaGlsZHJlbigpO1xuICBwYWdlRWxlbWVudHMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgaSArPSAxO1xuICAgIGlmICggJCh0aGlzKS5jc3MoXCJ6LWluZGV4XCIpID49IG1heHpJbmRleCApIHtcbiAgICAgIG1heHpJbmRleCA9IHBhcnNlSW50KCQodGhpcykuY3NzKFwiei1pbmRleFwiKSk7XG4gICAgfVxuICAgIGlmKGkgPT0gcGFnZUVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgaWYgKHRhcmdldC5zdHlsZS56SW5kZXggIT0gbWF4ekluZGV4IHwgdGFyZ2V0LnN0eWxlLnpJbmRleCA9PSAwKSB7XG4gICAgICAgIHRhcmdldC5zdHlsZS56SW5kZXggPSBtYXh6SW5kZXggKyAxO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIC8vIHRhcmdldC5zdHlsZS56SW5kZXggPSBtYXh6SW5kZXggKyAxO1xufVxuXG4vLyB0aGlzIGlzIHVzZWQgbGF0ZXIgaW4gdGhlIHJlc2l6aW5nIGFuZCBnZXN0dXJlIGRlbW9zXG53aW5kb3cuZHJhZ01vdmVMaXN0ZW5lciA9IGRyYWdNb3ZlTGlzdGVuZXI7XG5cblxuLy8gc2hvdyBwZGYgYm94XG5cbmZ1bmN0aW9uIHNob3dQZGYoaWQpIHtcbiAgJCgnI3BkZmJveCcpLnNob3coKVxuICB2YXIgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgaWYgKHBkZlJlYWR5ID09IHRydWUpIHtcbiAgICAgICQoJyNwZGZib3gnKS5odG1sKCdEb3dubG9hZCB5b3VyIHBkZiA8YSBocmVmPVwiYXNzZXRzL3BkZi8nICsgaWQgKyAnLycgKyBpZCArICcucGRmXCI+aGVyZTwvYT4nIClcbiAgICAgIGNsZWFySW50ZXJ2YWwoeSlcbiAgICB9IGVsc2Uge1xuICAgICAgJCgnI3BkZmJveCcpLnRleHQoJ1lvdXIgUERGIGlzIGJlaW5nIGdlbmVyYXRlZCcpXG4gICAgfVxuICB9LCAxMDApIFxufSBcblxuXG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbikge1xuICB2YXIgaTtcbiAgZm9yIChpID0gMDsgaSA8IFB1YmxpY2F0aW9uLmVsZW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCB3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKFwicHJpbnQ9dHJ1ZVwiKSA+IDAgKSB7XG4gICAgICBjcmVhdGVFbGVtZW50Q2FudmFzKFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldKVxuICAgICAgY29uc29sZS5sb2coJ3ByaW50IHB1YicpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNyZWF0ZUVsZW1lbnQoUHVibGljYXRpb24uZWxlbWVudHNbaV0pXG4gICAgICBjb25zb2xlLmxvZygnc2F2ZWQgcHViJykgICAgICBcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGRmRG93bmxvYWQoKSB7XG4gICQoJyNwZGYtZG93bmxvYWQnKS5zaG93KClcbiAgJCgnI3BkZi1kb3dubG9hZCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIG1ha2VQZGYoUHVibGljYXRpb24uaWQpXG4gICAgc2hvd1BkZihQdWJsaWNhdGlvbi5pZClcbiAgICBjaGVja1BkZihQdWJsaWNhdGlvbi5pZClcbiAgfSk7XG59XG5cblxuXG5cbi8vIC0tLSBCQUNLRU5EXG5cbi8vIHNlbmQgY2FsbCB0byBzZXJ2ZXIgdG8gbWFrZSBwZGZcbmZ1bmN0aW9uIG1ha2VQZGYoaWQpIHtcbiAgJC5nZXQoICcvcGRmP2lkPScgKyBpZCwgZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgY29uc29sZS5sb2coICdTZW50IGNhbGwgdG8gbWFrZSBQREYuJyApO1xuICB9KTtcbn1cblxuLy8gY2hlY2sgaWYgcGRmIGV4aXN0cyBhbmQgcmVkaXJlY3QgdG8gZmlsZVxuZnVuY3Rpb24gY2hlY2tQZGYoaWQpIHtcbiAgdmFyIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiAnSEVBRCcsXG4gICAgICB1cmw6ICdhc3NldHMvcGRmLycgKyBpZCArICcvJyArIGlkICsgJy5wZGYnLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24obXNnKXtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh5KTtcbiAgICAgICAgcGRmUmVhZHkgPSB0cnVlO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbihqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pe1xuICAgICAgICBjb25zb2xlLmxvZyhqcVhIUik7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yVGhyb3duKTtcbiAgICAgIH1cbiAgICB9KVxuICB9LCAxMDApO1xufVxuXG5mdW5jdGlvbiBzYXZldG9EYihwdWJsaWNhdGlvbikge1xuICAkLmFqYXgoeyAgICAgICAgICAgICAgICAgICAgXG4gICAgdXJsOiAnL2RiJywgICAgIFxuICAgIHR5cGU6ICdwb3N0JywgLy8gcGVyZm9ybWluZyBhIFBPU1QgcmVxdWVzdFxuICAgIGRhdGEgOiBwdWJsaWNhdGlvbixcbiAgICBkYXRhVHlwZTogJ2pzb24nLCAgICAgICAgICAgICAgICAgICBcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihwdWJsaWNhdGlvbikgICAgICAgICBcbiAgICB7XG4gICAgICBjb25zb2xlLmxvZygncHVibGljYXRpb24gc2VudCB0byBkYXRhYmFzZS4nKVxuICAgIH0gXG4gIH0pO1xufVxuXG5cbi8vIC8vIG1ha2UgcGRmXG4vLyB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwMScpO1xuLy8gJCgnI3AxJykuY2xpY2soZnVuY3Rpb24oKXtcbi8vICBodG1sMnBkZihlbGVtZW50LCB7XG4vLyAgICBtYXJnaW46ICAgICAgIDEsXG4vLyAgICBmaWxlbmFtZTogICAgICdteWZpbGUucGRmJyxcbi8vICAgIGltYWdlOiAgICAgICAgeyB0eXBlOiAnanBlZycsIHF1YWxpdHk6IDAuOTggfSxcbi8vICAgIGh0bWwyY2FudmFzOiAgeyBkcGk6IDcyLCBsZXR0ZXJSZW5kZXJpbmc6IHRydWUsIGhlaWdodDogMjk3MCwgd2lkdGg6IDUxMDAgfSxcbi8vICAgIGpzUERGOiAgICAgICAgeyB1bml0OiAnbW0nLCBmb3JtYXQ6ICdBNCcsIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnIH1cbi8vICB9KTtcbi8vIH0pO1xuXG5cbi8vIC0tLSBBUkNISVZFXG5cbi8vICQuYWpheCh7XG4vLyAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MjgwMTcvdGVzdFwiLFxuLy8gIHR5cGU6ICdnZXQnLFxuLy8gIGRhdGFUeXBlOiAnanNvbnAnLFxuLy8gIGpzb25wOiAnanNvbnAnLCAvLyBtb25nb2RiIGlzIGV4cGVjdGluZyB0aGF0XG4vLyAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbi8vICAgICBjb25zb2xlLmxvZygnc3VjY2VzcycsIGRhdGEpO1xuLy8gICB9LFxuLy8gICBlcnJvcjogZnVuY3Rpb24gKFhNTEh0dHBSZXF1ZXN0LCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuLy8gICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yVGhyb3duKTtcbi8vICAgfVxuLy8gfSk7XG4iXX0=
