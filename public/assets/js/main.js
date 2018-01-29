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
    showSaveModal()

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


// show save modal

function showSaveModal() {
  $('#save-modal').show()
  $('#save').click(function() {
    savetoDb(Publication)
    makePdf(Publication.id)
    genPdf(Publication.id)
    checkPdf(Publication.id)
  });
}

function genPdf(id) {
  $('#save-modal').show()
  $('#save-modal').html('')
  var y = setInterval(function(){
    if (pdfReady == true) {
      $('#save-modal').html('Download your pdf <a href="assets/pdf/' + id + '/' + id + '.pdf">here</a>' )
      clearInterval(y)
    } else {
      $('#save-modal').text('Your PDF is being generated')
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
    genPdf(Publication.id)
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
      error: function(jqXHR, textStatus, error){
        console.log(jqXHR);
        console.log(error);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvdW50ZG93bi5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gbG9hZFNvdW5kICgpIHtcbiAgY29uc29sZS5sb2coJ2xvYWQgc291bmQhJyk7XG4gIGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXCJhc3NldHMvYXVkaW8vYmVlcC5tcDNcIiwgJ2JlZXAnKTtcbiAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcImFzc2V0cy9hdWRpby9iZWVwLTIubXAzXCIsICdiZWVwLTInKTtcbiAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcImFzc2V0cy9hdWRpby9kaW5nLm1wM1wiLCAnZGluZycpO1xufVxuXG5sb2FkU291bmQoKTtcblxuZnVuY3Rpb24gcGxheURpbmcgKCkge1xuICBjb25zb2xlLmxvZygnYmVlcCEnKTtcbiAgY3JlYXRlanMuU291bmQucGxheSgnYmVlcCcpO1xufVxuXG5cbi8vIGNvdW50ZG93biB0aW1lclxuZnVuY3Rpb24gY291bnRkb3duKHN0YXJ0VGltZSkge1xuICAkKCcjY291bnRkb3duJykuc2hvdygpO1xuICBpZiAoc3RhcnRUaW1lID49IDEpIHtcbiAgICBjcmVhdGVqcy5Tb3VuZC5wbGF5KCdiZWVwLTInKTtcbiAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpe1xuICAgICAgc3RhcnRUaW1lID0gc3RhcnRUaW1lIC0gMTtcbiAgICAgICQoJyNjb3VudGRvd24nKS5odG1sKHN0YXJ0VGltZSk7IC8vIHNldCBjdXJyZW50IHRpbWUgaW4gI2NvdW50ZG93blxuICAgICAgY291bnRkb3duKHN0YXJ0VGltZSk7IC8vIHJlcGVhdCBmdW5jdGlvblxuICAgIH0sIDEwMDApO1xuICB9IGVsc2Uge1xuICAgICQoJyNjb3VudGRvd24nKS5odG1sKCdzdGFydCBnYW1lIScpOyAvLyBzZXQgdG8gc3RhcnQgZ2FtZSBtZXNzYWdlXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IC8vIHdhaXQgYSBiaXRcbiAgICAgICQoJyNjb3VudGRvd24nKS5mYWRlT3V0KDEwMDApIC8vIGZhZGUgb3V0IHRoZSAjY291bnRkb3duXG4gICAgICAvLyBUT0RPOiBzdGFydCB0aW1lIVxuICAgIH0sIDIwMCk7XG4gICAgY3JlYXRlanMuU291bmQucGxheSgnZGluZycpO1xuICB9XG59XG5cblxuIiwiLy8gLS0tIEdMT0JBTFxuXG52YXIgcGFnZXMgPSAkKCcucGFnZScpO1xudmFyIGNyaXRpY1BvcHVwID0gJCgnI2NyaXRpYycpO1xudmFyIGRyb3BEZWxheSA9IDEwMDtcbnZhciBwZGZSZWFkeSA9IGZhbHNlXG5cblxuXG5cbi8vIC0tLSBHRU5FUkFMIEZVTkNUSU9OU1xuXG5mdW5jdGlvbiBtYWtlSWQoKSB7XG4gIHZhciByYW5kTGV0dGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI2KSk7XG4gIHZhciBpZCA9IHJhbmRMZXR0ZXIgKyBEYXRlLm5vdygpO1xuICByZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCkge1xuICBpZiAoZWxlbWVudC5kYXRhLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSkge1xuICAgIHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKFwiPGltZz5cIiwge1wic3JjXCI6IGVsZW1lbnQuZGF0YX0pO1xuICB9IGVsc2Uge1xuICAgIHZhciBkZUJhc2VkVGV4dCA9IGF0b2IoIGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpICk7XG4gICAgdmFyIGh0bWxCclRleHQgPSBkZUJhc2VkVGV4dC5yZXBsYWNlKC9cXG4vZywgXCI8YnIvPlwiKTsgXG4gICAgY29uc29sZS5sb2coaHRtbEJyVGV4dCk7XG4gICAgdmFyIHBhZ2VFbGVtZW50Q29udGVudCA9ICQoXCI8cD5cIikuYXBwZW5kKGh0bWxCclRleHQpOyAvLyByZW1vdmUgXCJkYXRhOnRleHQvcGxhaW47YmFzZTY0XCJcbiAgfVxuICB2YXIgcGFnZUVsZW1lbnQgPSAkKFwiPGRpdj5cIiwge1wiY2xhc3NcIjogXCJwYWdlLWVsZW1lbnQgZHJhZ2dhYmxlXCJ9KTtcbiAgdmFyIHBhZ2VFbGVtZW50Q2xvc2UgPSAkKFwiPHNwYW4+XCIsIHtcImNsYXNzXCI6IFwiY2xvc2VcIn0pLnRleHQoJ3gnKTtcbiAgcGFnZUVsZW1lbnQuYXBwZW5kKHBhZ2VFbGVtZW50Q29udGVudCwgcGFnZUVsZW1lbnRDbG9zZSk7XG4gIHBhZ2VFbGVtZW50LmF0dHIoJ2lkJywgZWxlbWVudC5pZCk7XG4gICQoJyMnICsgZWxlbWVudC5wYWdlKS5hcHBlbmQocGFnZUVsZW1lbnQpO1xuICBpZiAoZWxlbWVudC5wb3MpIHsgICAvLyByZWNvbnN0cnVjdGluZyBzYXZlZCBlbGVtZW50XG4gICAgcGFnZUVsZW1lbnQucG9zaXRpb24oKS5sZWZ0ID0gZWxlbWVudC5wb3NbMF1cbiAgICBwYWdlRWxlbWVudC5wb3NpdGlvbigpLnRvcCA9IGVsZW1lbnQucG9zWzFdXG4gICAgLy8gcGFnZUVsZW1lbnQud2lkdGgoZWxlbWVudC5wb3NbMl0pIC8vIHByb2JsZW1zIHdpdGggdGhlc2UgdHdvXG4gICAgLy8gcGFnZUVsZW1lbnQuaGVpZ2h0KGVsZW1lbnQucG9zWzNdKSBcbiAgfSBlbHNlIHsgLy8gZHJvcHBpbmcgbmV3IGZpbGVcbiAgICByZXR1cm4gZWxlbWVudFBvcyA9IFtcbiAgICAgIHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkubGVmdCxcbiAgICAgIHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkudG9wLFxuICAgICAgcGFnZUVsZW1lbnQud2lkdGgoKSxcbiAgICAgIHBhZ2VFbGVtZW50LmhlaWdodCgpLFxuICAgICAgMCAvLyByb3RhdGlvbiAoVE9ETylcbiAgICBdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRDYW52YXMoZWxlbWVudCkge1xuXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblxuICBjYW52YXMud2lkdGggPSBlbGVtZW50LnBvc1syXVxuICBjYW52YXMuaGVpZ2h0ID0gMzAwIC8vIHNob3VsZCBiZSBlbGVtZW50LnBvc1szXVxuICBjYW52YXMuc3R5bGUubWFyZ2luTGVmdCA9IGVsZW1lbnQucG9zWzBdICsgJ3B4JztcbiAgY2FudmFzLnN0eWxlLm1hcmdpblRvcCA9IGVsZW1lbnQucG9zWzFdICsgJ3B4JztcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICQoJyMnICsgZWxlbWVudC5wYWdlKS5hcHBlbmQoY2FudmFzKTtcblxuICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCwgZWxlbWVudC5wb3NbMl0sIDMwMCk7XG4gIH07XG4gIGltYWdlLnNyYyA9IGVsZW1lbnQuZGF0YTtcbn1cblxuXG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG4gIC8vIGFsbCBvdXIgc3RhdGVzXG4gIGlkOiBtYWtlSWQoKSxcbiAgdGl0bGU6ICdURVNUIFBVQicsXG4gIHRpbWVMZWZ0OiAxNTAwMCxcbiAgZXhwaXJlZDogZmFsc2UsXG4gIGVsZW1lbnRzOiBbXSxcbiAgYXV0aG9yczogW11cbn07XG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIGlucHV0KSB7XG5cbiAgLy8gZXhwaXJlZD9cbiAgaWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkgeyAvLyBleHBpcmVkXG4gICAgc2hvd1RpbWUoUHVibGljYXRpb24pXG4gIH1cbiAgZWxzZSB7IC8vIG5vdCBleHBpcmVkXG4gICAgUHVibGljYXRpb24uZXhwaXJlZCA9IHRydWVcbiAgICBzaG93RXhwaXJlZChQdWJsaWNhdGlvbilcbiAgICBub0RyYWcoKVxuICAgIHNob3dTYXZlTW9kYWwoKVxuXG4gIH1cbiAgXG4gIGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG4gICAgY29uc29sZS5sb2coaW5wdXQpO1xuICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgY2FzZSAgaW5wdXQudmlzaWJsZSA9PSBmYWxzZSA6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcbiAgICAgICAgcmVtb3ZlRWxlbWVudChpbnB1dC5pZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAgaW5wdXQuZGF0YS5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikgJiYgXG4gICAgICAgICAgICBpbnB1dC52aXNpYmxlID09IHRydWUgOiAvLyBuZXcgaW1hZ2VcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBQdWJsaWNhdGlvblxuICAgICAgICBQdWJsaWNhdGlvbi5lbGVtZW50cy5wdXNoKGlucHV0KTtcbiAgICAgICAgLy8gZHJvcCBmaWxlXG4gICAgICAgIGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0LmlkKTtcbiAgICAgICAgLy8gYWRkIGJvbnVzIHRpbWVcbiAgICAgICAgYWRkdGltZSgxMDAwKTtcbiAgICAgICAgLy8gY3JpdGljIHNwZWFrXG4gICAgICAgIC8vIGNyaXRpYygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgIGlucHV0LmRhdGEuaW5jbHVkZXMoXCJkYXRhOnRleHQvcGxhaW5cIikgJiYgXG4gICAgICAgICAgICBpbnB1dC52aXNpYmxlID09IHRydWUgOiAvLyBuZXcgdGV4dFxuICAgICAgICAvLyB1cGRhdGUgdGhlIFB1YmxpY2F0aW9uXG4gICAgICAgIFB1YmxpY2F0aW9uLmVsZW1lbnRzLnB1c2goaW5wdXQpO1xuICAgICAgICAvLyBkcm9wIGZpbGVcbiAgICAgICAgZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQuaWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgICFpbnB1dC5kYXRhLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSAmJlxuICAgICAgICAgICAgIWlucHV0LmRhdGEuaW5jbHVkZXMoXCJkYXRhOnRleHQvcGxhaW5cIikgOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG4gICAgICAgIG5vdEFuSW1hZ2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkgeyAvLyB0b28gbGF0ZVxuICAgIExhdGVEcm9wRmlsZSgpO1xuICB9XG59XG5cblxuXG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxudmFyIHhcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKFwic2F2ZWRcIikgPCAwKSB7IC8vIGlmIG5vdCBhIHNhdmVkIHB1YmxpY2F0aW9uXG4gICAgeCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAtIDEwO1xuICAgICAgY29udHJvbGxlcihQdWJsaWNhdGlvbilcbiAgICB9LCAxMCk7XG5cbiAgICBtb3VzZUNvdW50ZXIoKVxuXG4gICAgLy8gY291bnRkb3duXG4gICAgdmFyIHN0YXJ0VGltZSA9IDQ7XG4gICAgY291bnRkb3duKHN0YXJ0VGltZSk7XG4gICAgJCgnI2NvdW50ZG93bicpLmh0bWwoc3RhcnRUaW1lKTtcbiAgfSBlbHNlIHtcbiAgICByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbilcbiAgICBub0RyYWcoKVxuICAgIHBkZkRvd25sb2FkKClcbiAgfVxufSk7XG5cblxuZnVuY3Rpb24gYWRkdGltZShib251c1RpbWUpIHtcbiAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCArIGJvbnVzVGltZTtcbn1cblxuLy8gZHJvcEZpbGVcblxucGFnZXMub24oXCJkcmFnb3ZlclwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJCh0aGlzKS5hZGRDbGFzcygnZHJhZ292ZXInKTtcbn0pO1xucGFnZXMub24oXCJkcmFnbGVhdmVcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICQodGhpcykucmVtb3ZlQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKFwiZHJvcFwiLCBmdW5jdGlvbihlKSB7XG4gICQodGhpcykucmVtb3ZlQ2xhc3MoJ2RyYWdvdmVyJyk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgY29uc29sZS5sb2coZSk7XG4gIHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXNcbiAgdmFyIHkgPSAwO1xuICBmb3IgKHZhciBpID0gZmlsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIHZhciBwYWdlSWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XG4gICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgY29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcbiAgICAgIC8vIGlkLCBkYXRhLCBzaXplLCBwb3MsIHJvdGF0aW9uPywgdmlzaWJsZVxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICBjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IGlkOiBtYWtlSWQoKSwgZGF0YTogZXZlbnQudGFyZ2V0LnJlc3VsdCwgcG9zOiBbMCwwLDAsMCwwXSwgdmlzaWJsZTogdHJ1ZSwgcGFnZTogcGFnZUlkIH0gKTtcbiAgICAgIH0sIHkgKiBkcm9wRGVsYXkpO1xuICAgICAgeSArPSAxO1xuICAgIH07XG4gICAgY29uc29sZS5sb2coZmlsZXNbaV0pO1xuICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGVzW2ldKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59KTtcbi8vIHByZXZlbnQgZHJvcCBvbiBib2R5XG4kKCdib2R5Jykub24oXCJkcmFnb3ZlclwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKFwiZHJhZ2xlYXZlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oXCJkcm9wXCIsIGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBTb3VuZC5lcnJvcigpO1xufSk7XG5cbi8vIHJlbW92ZSBlbGVtZW50XG4kKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNsb3NlJywgZnVuY3Rpb24gKCkge1xuICB2YXIgcGFnZUlkID0gJCh0aGlzKS5jbG9zZXN0KCcucGFnZScpLmF0dHIoJ2lkJyk7XG4gIHZhciBlbGVtZW50SWQgPSAkKHRoaXMpLnBhcmVudCgpLmF0dHIoJ2lkJyk7XG4gIHZhciBlbGVtZW50RGF0YSA9ICQodGhpcykuc2libGluZ3MoKS5hdHRyKCdzcmMnKTtcbiAgY29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyBpZDogZWxlbWVudElkLCBkYXRhOiBlbGVtZW50RGF0YSwgcG9zOiBbMCwwLDAsMCwwXSwgdmlzaWJsZTogZmFsc2UsIHBhZ2U6IHBhZ2VJZH0pO1xufSk7XG5cblxuXG5cblxuXG4vLyAtLS0gVklFV1xuXG52YXIgU291bmQgPSB7XG4gIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXVkaW8gPSBuZXcgQXVkaW8oJ2Fzc2V0cy9hdWRpby9pbmNvcnJlY3QubXAzJyk7XG4gICAgYXVkaW8ucGxheSgpO1xuICB9LFxuICBkaW5nOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXVkaW8gPSBuZXcgQXVkaW8oJ2Fzc2V0cy9hdWRpby9kaW5nLm1wMycpO1xuICAgIGF1ZGlvLnBsYXkoKTtcbiAgfVxufTtcblxuLy8gbWVyZ2UgdGhlc2UgdHdvXG5mdW5jdGlvbiBzaG93VGltZShQdWJsaWNhdGlvbikge1xuICBzZWNvbmRzID0gUHVibGljYXRpb24udGltZUxlZnQgLyAxMDAwO1xuICAkKCcjY291bnRlcicpLnNob3coKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3VudGVyXCIpLmlubmVySFRNTCA9IHNlY29uZHMudG9GaXhlZCgyKSArIFwiIHNlY29uZHMgbGVmdCFcIjtcbn1cbmZ1bmN0aW9uIG1vdXNlQ291bnRlcigpIHtcbiAgJChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSl7XG4gICAgaWYgKGUucGFnZVggPj0gKCQoZG9jdW1lbnQpLndpZHRoKCkvMikpIHtcbiAgICAgIC8vIGlmIG1vdXNlIG9mIHJpZ2h0IHNpZGUgb2YgcGFnZVxuICAgICAgJCgnI2NvdW50ZXInKS5hZGRDbGFzcygnbW91c2VfcmlnaHQnKTtcbiAgICAgICQoJyNjb3VudGVyJykuY3NzKHtcbiAgICAgICAgbGVmdDogIGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcbiAgICAgICAgdG9wOiAgIGUucGFnZVkgKyA1MFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGlmIG1vdXNlIG9mIGxlZnQgc2lkZSBvZiBwYWdlXG4gICAgICAkKCcjY291bnRlcicpLnJlbW92ZUNsYXNzKCdtb3VzZV9yaWdodCcpO1xuICAgICAgJCgnI2NvdW50ZXInKS5jc3Moe1xuICAgICAgICBsZWZ0OiAgZS5wYWdlWCArIDIwLFxuICAgICAgICB0b3A6ICAgZS5wYWdlWSArIDUwXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzaG93RXhwaXJlZCgpIHtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3VudGVyXCIpLmlubmVySFRNTCA9IFwiZXhwaXJlZCFcIjtcbiAgJCgnYm9keScpLmFkZENsYXNzKCdleHBpcmVkJyk7XG4gIC8vc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAvLyAgd2luZG93LnByaW50KCk7XG4gIC8vfSwgMTAwMCk7XG4gIGNsZWFySW50ZXJ2YWwoeCk7XG59XG5cbmZ1bmN0aW9uIG5vdEFuSW1hZ2UoKSB7XG4gIFNvdW5kLmVycm9yKCk7XG4gIGFsZXJ0KCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyBub3QgYW4gaW1hZ2UhJyk7XG59XG5cbmZ1bmN0aW9uIGRyb3BFbGVtZW50KHBhZ2VJZCwgZGF0YSwgaWQpIHtcbiAgdmFyIGVsZW1lbnQgPSB7aWQ6IGlkLCBkYXRhOiBkYXRhLCBwYWdlOiBwYWdlSWR9XG4gIC8vIHJlYWQgc2l6ZSwgcG9zLCByb3QgYW5kIGFkZCB0aGVtIHRvIFB1YmxpY2F0aW9uXG4gIHZhciBlbGVtZW50UG9zID0gY3JlYXRlRWxlbWVudChlbGVtZW50KVxuICBmb3IodmFyIGkgPSAwIDsgaSA8IFB1YmxpY2F0aW9uLmVsZW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldLmlkID09IGlkKSB7XG4gICAgICBQdWJsaWNhdGlvbi5lbGVtZW50c1tpXS5wb3MgPSBlbGVtZW50UG9zO1xuICAgIH1cbiAgfVxuICBTb3VuZC5kaW5nKCk7XG59XG5cbmZ1bmN0aW9uIExhdGVEcm9wRmlsZShzcmMpIHtcbiAgYWxlcnQoJ3RvbyBsYXRlIGJybycpO1xufVxuXG5mdW5jdGlvbiBub0RyYWcoKSB7XG4gIHZhciBlbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJhZ2dhYmxlXCIpO1xuICAgIFtdLmZvckVhY2guY2FsbChlbGVtcywgZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnZ2FibGVcIik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcml0aWMoKSB7XG4gIGNyaXRpY1BvcHVwLmlubmVySFRNTCA9ICdNYWtlIHRoaXMgaW1hZ2UgYmlnZ2VyIHBscyEnO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50KGlkKSB7XG4gICQoJyMnICsgaWQpLmhpZGUoKTtcbiAgY29uc29sZS5sb2coaWQpO1xufVxuXG5pbnRlcmFjdCgnLmRyYWdnYWJsZScpXG4gIC5kcmFnZ2FibGUoe1xuICAgIG9ubW92ZTogd2luZG93LmRyYWdNb3ZlTGlzdGVuZXIsXG4gICAgcmVzdHJpY3Q6IHtcbiAgICAgIHJlc3RyaWN0aW9uOiAncGFyZW50JyxcbiAgICAgIGVsZW1lbnRSZWN0OiB7XG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgYm90dG9tOiAxLFxuICAgICAgICByaWdodDogMVxuICAgICAgfVxuICAgIH0sXG4gIH0pXG4gIC5yZXNpemFibGUoe1xuICAgIC8vIHJlc2l6ZSBmcm9tIGFsbCBlZGdlcyBhbmQgY29ybmVyc1xuICAgIGVkZ2VzOiB7XG4gICAgICBsZWZ0OiB0cnVlLFxuICAgICAgcmlnaHQ6IHRydWUsXG4gICAgICBib3R0b206IHRydWUsXG4gICAgICB0b3A6IHRydWVcbiAgICB9LFxuXG4gICAgLy8ga2VlcCB0aGUgZWRnZXMgaW5zaWRlIHRoZSBwYXJlbnRcbiAgICByZXN0cmljdEVkZ2VzOiB7XG4gICAgICBvdXRlcjogJ3BhcmVudCcsXG4gICAgICBlbmRPbmx5OiB0cnVlLFxuICAgIH0sXG5cbiAgICBpbmVydGlhOiB0cnVlLFxuICB9KVxuICAub24oJ3Jlc2l6ZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQsXG4gICAgICB4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDApLFxuICAgICAgeSA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwKTtcblxuICAgIC8vIHVwZGF0ZSB0aGUgZWxlbWVudCdzIHN0eWxlXG4gICAgdGFyZ2V0LnN0eWxlLndpZHRoID0gZXZlbnQucmVjdC53aWR0aCArICdweCc7XG4gICAgdGFyZ2V0LnN0eWxlLmhlaWdodCA9IGV2ZW50LnJlY3QuaGVpZ2h0ICsgJ3B4JztcblxuICAgIC8vIHRyYW5zbGF0ZSB3aGVuIHJlc2l6aW5nIGZyb20gdG9wIG9yIGxlZnQgZWRnZXNcbiAgICB4ICs9IGV2ZW50LmRlbHRhUmVjdC5sZWZ0O1xuICAgIHkgKz0gZXZlbnQuZGVsdGFSZWN0LnRvcDtcblxuICAgIHRhcmdldC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSB0YXJnZXQuc3R5bGUudHJhbnNmb3JtID1cbiAgICAgICd0cmFuc2xhdGUoJyArIHggKyAncHgsJyArIHkgKyAncHgpJztcblxuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgpO1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteScsIHkpO1xuICB9KTtcblxuZnVuY3Rpb24gZHJhZ01vdmVMaXN0ZW5lcihldmVudCkge1xuICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuICAgIC8vIGtlZXAgdGhlIGRyYWdnZWQgcG9zaXRpb24gaW4gdGhlIGRhdGEteC9kYXRhLXkgYXR0cmlidXRlc1xuICAgIHggPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCkgKyBldmVudC5keCxcbiAgICB5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDApICsgZXZlbnQuZHk7XG5cbiAgLy8gdHJhbnNsYXRlIHRoZSBlbGVtZW50XG4gIHRhcmdldC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPVxuICAgIHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPVxuICAgICd0cmFuc2xhdGUoJyArIHggKyAncHgsICcgKyB5ICsgJ3B4KSc7XG5cbiAgLy8gdXBkYXRlIHRoZSBwb3NpaW9uIGF0dHJpYnV0ZXNcbiAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG4gIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteScsIHkpO1xuXG4gIC8vIHVwZGF0ZSB6LWluZGV4XG4gIHZhciBtYXh6SW5kZXggPSAwLFxuICAgIGkgPSAwO1xuICBwYWdlRWxlbWVudHMgPSAkKCcjJyArIHRhcmdldC5pZCkucGFyZW50KCkuY2hpbGRyZW4oKTtcbiAgcGFnZUVsZW1lbnRzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgIGkgKz0gMTtcbiAgICBpZiAoICQodGhpcykuY3NzKFwiei1pbmRleFwiKSA+PSBtYXh6SW5kZXggKSB7XG4gICAgICBtYXh6SW5kZXggPSBwYXJzZUludCgkKHRoaXMpLmNzcyhcInotaW5kZXhcIikpO1xuICAgIH1cbiAgICBpZihpID09IHBhZ2VFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgIGlmICh0YXJnZXQuc3R5bGUuekluZGV4ICE9IG1heHpJbmRleCB8IHRhcmdldC5zdHlsZS56SW5kZXggPT0gMCkge1xuICAgICAgICB0YXJnZXQuc3R5bGUuekluZGV4ID0gbWF4ekluZGV4ICsgMTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICAvLyB0YXJnZXQuc3R5bGUuekluZGV4ID0gbWF4ekluZGV4ICsgMTtcbn1cblxuLy8gdGhpcyBpcyB1c2VkIGxhdGVyIGluIHRoZSByZXNpemluZyBhbmQgZ2VzdHVyZSBkZW1vc1xud2luZG93LmRyYWdNb3ZlTGlzdGVuZXIgPSBkcmFnTW92ZUxpc3RlbmVyO1xuXG5cbi8vIHNob3cgc2F2ZSBtb2RhbFxuXG5mdW5jdGlvbiBzaG93U2F2ZU1vZGFsKCkge1xuICAkKCcjc2F2ZS1tb2RhbCcpLnNob3coKVxuICAkKCcjc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIHNhdmV0b0RiKFB1YmxpY2F0aW9uKVxuICAgIG1ha2VQZGYoUHVibGljYXRpb24uaWQpXG4gICAgZ2VuUGRmKFB1YmxpY2F0aW9uLmlkKVxuICAgIGNoZWNrUGRmKFB1YmxpY2F0aW9uLmlkKVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2VuUGRmKGlkKSB7XG4gICQoJyNzYXZlLW1vZGFsJykuc2hvdygpXG4gICQoJyNzYXZlLW1vZGFsJykuaHRtbCgnJylcbiAgdmFyIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgIGlmIChwZGZSZWFkeSA9PSB0cnVlKSB7XG4gICAgICAkKCcjc2F2ZS1tb2RhbCcpLmh0bWwoJ0Rvd25sb2FkIHlvdXIgcGRmIDxhIGhyZWY9XCJhc3NldHMvcGRmLycgKyBpZCArICcvJyArIGlkICsgJy5wZGZcIj5oZXJlPC9hPicgKVxuICAgICAgY2xlYXJJbnRlcnZhbCh5KVxuICAgIH0gZWxzZSB7XG4gICAgICAkKCcjc2F2ZS1tb2RhbCcpLnRleHQoJ1lvdXIgUERGIGlzIGJlaW5nIGdlbmVyYXRlZCcpXG4gICAgfVxuICB9LCAxMDApIFxufSBcblxuXG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbikge1xuICB2YXIgaTtcbiAgZm9yIChpID0gMDsgaSA8IFB1YmxpY2F0aW9uLmVsZW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCB3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKFwicHJpbnQ9dHJ1ZVwiKSA+IDAgKSB7XG4gICAgICBjcmVhdGVFbGVtZW50Q2FudmFzKFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldKVxuICAgICAgY29uc29sZS5sb2coJ3ByaW50IHB1YicpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNyZWF0ZUVsZW1lbnQoUHVibGljYXRpb24uZWxlbWVudHNbaV0pXG4gICAgICBjb25zb2xlLmxvZygnc2F2ZWQgcHViJykgICAgICBcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGRmRG93bmxvYWQoKSB7XG4gICQoJyNwZGYtZG93bmxvYWQnKS5zaG93KClcbiAgJCgnI3BkZi1kb3dubG9hZCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIG1ha2VQZGYoUHVibGljYXRpb24uaWQpXG4gICAgZ2VuUGRmKFB1YmxpY2F0aW9uLmlkKVxuICAgIGNoZWNrUGRmKFB1YmxpY2F0aW9uLmlkKVxuICB9KTtcbn1cblxuXG5cblxuLy8gLS0tIEJBQ0tFTkRcblxuLy8gc2VuZCBjYWxsIHRvIHNlcnZlciB0byBtYWtlIHBkZlxuZnVuY3Rpb24gbWFrZVBkZihpZCkge1xuICAkLmdldCggJy9wZGY/aWQ9JyArIGlkLCBmdW5jdGlvbiggZGF0YSApIHtcbiAgICBjb25zb2xlLmxvZyggJ1NlbnQgY2FsbCB0byBtYWtlIFBERi4nICk7XG4gIH0pO1xufVxuXG4vLyBjaGVjayBpZiBwZGYgZXhpc3RzIGFuZCByZWRpcmVjdCB0byBmaWxlXG5mdW5jdGlvbiBjaGVja1BkZihpZCkge1xuICB2YXIgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgJC5hamF4KHtcbiAgICAgIHR5cGU6ICdIRUFEJyxcbiAgICAgIHVybDogJ2Fzc2V0cy9wZGYvJyArIGlkICsgJy8nICsgaWQgKyAnLnBkZicsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihtc2cpe1xuICAgICAgICBjbGVhckludGVydmFsKHkpO1xuICAgICAgICBwZGZSZWFkeSA9IHRydWU7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvcil7XG4gICAgICAgIGNvbnNvbGUubG9nKGpxWEhSKTtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgfVxuICAgIH0pXG4gIH0sIDEwMCk7XG59XG5cbmZ1bmN0aW9uIHNhdmV0b0RiKHB1YmxpY2F0aW9uKSB7XG4gICQuYWpheCh7ICAgICAgICAgICAgICAgICAgICBcbiAgICB1cmw6ICcvZGInLCAgICAgXG4gICAgdHlwZTogJ3Bvc3QnLCAvLyBwZXJmb3JtaW5nIGEgUE9TVCByZXF1ZXN0XG4gICAgZGF0YSA6IHB1YmxpY2F0aW9uLFxuICAgIGRhdGFUeXBlOiAnanNvbicsICAgICAgICAgICAgICAgICAgIFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHB1YmxpY2F0aW9uKSAgICAgICAgIFxuICAgIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwdWJsaWNhdGlvbiBzZW50IHRvIGRhdGFiYXNlLicpXG4gICAgfSBcbiAgfSk7XG59XG5cblxuLy8gLy8gbWFrZSBwZGZcbi8vIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3AxJyk7XG4vLyAkKCcjcDEnKS5jbGljayhmdW5jdGlvbigpe1xuLy8gIGh0bWwycGRmKGVsZW1lbnQsIHtcbi8vICAgIG1hcmdpbjogICAgICAgMSxcbi8vICAgIGZpbGVuYW1lOiAgICAgJ215ZmlsZS5wZGYnLFxuLy8gICAgaW1hZ2U6ICAgICAgICB7IHR5cGU6ICdqcGVnJywgcXVhbGl0eTogMC45OCB9LFxuLy8gICAgaHRtbDJjYW52YXM6ICB7IGRwaTogNzIsIGxldHRlclJlbmRlcmluZzogdHJ1ZSwgaGVpZ2h0OiAyOTcwLCB3aWR0aDogNTEwMCB9LFxuLy8gICAganNQREY6ICAgICAgICB7IHVuaXQ6ICdtbScsIGZvcm1hdDogJ0E0Jywgb3JpZW50YXRpb246ICdwb3J0cmFpdCcgfVxuLy8gIH0pO1xuLy8gfSk7XG5cblxuLy8gLS0tIEFSQ0hJVkVcblxuLy8gJC5hamF4KHtcbi8vICB1cmw6IFwiaHR0cDovL2xvY2FsaG9zdDoyODAxNy90ZXN0XCIsXG4vLyAgdHlwZTogJ2dldCcsXG4vLyAgZGF0YVR5cGU6ICdqc29ucCcsXG4vLyAganNvbnA6ICdqc29ucCcsIC8vIG1vbmdvZGIgaXMgZXhwZWN0aW5nIHRoYXRcbi8vICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xuLy8gICAgIGNvbnNvbGUubG9nKCdzdWNjZXNzJywgZGF0YSk7XG4vLyAgIH0sXG4vLyAgIGVycm9yOiBmdW5jdGlvbiAoWE1MSHR0cFJlcXVlc3QsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4vLyAgICAgY29uc29sZS5sb2coJ2Vycm9yJywgZXJyb3JUaHJvd24pO1xuLy8gICB9XG4vLyB9KTtcbiJdfQ==
