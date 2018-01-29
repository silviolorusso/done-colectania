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
    setTimeout(function() {
       modElementPosition(pageElement, element.pos)
    }, 700)
  } else { // dropping new file
    return getElementPosition(pageElement)
  }
}

function createElementCanvas(element) {

  var canvas = document.createElement('canvas');

  canvas.style.marginLeft = element.pos[0] + 'px'
  canvas.style.marginTop = element.pos[1] + 'px'
  canvas.style.width = element.pos[2] + 'px'
  canvas.style.height = element.pos[3] + 'px'
  canvas.style.zIndex = element.pos[4]

  var ctx = canvas.getContext("2d");
  $('#' + element.page).append(canvas);

  var image = new Image();
  image.onload = function() {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  };
  image.src = element.data;
}

function getElementPosition(element) {
  return elementPos = [
    parseFloat( element.css("marginLeft") ),
    parseFloat( element.css("marginTop") ),
    element.width(),
    element.height(),
    parseInt( element.css("z-index") ) // TODO rotation maybe
  ];
}

function modElementPosition(pageElement, newPos) {
  pageElement.css({'margin-left':newPos[0] + 'px'});
  pageElement.css({'margin-top':newPos[1] + 'px'});
  pageElement.width(newPos[2])
  pageElement.height(newPos[3]) 
  pageElement.css({'z-index':newPos[4]});
}

// --- M-V-C

var Publication = {
  // all our states
  id: makeId(),
  title: 'TEST PUB',
  timeLeft: 9000000,
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
      case  input.data &&
            input.data.includes("data:image") && 
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
      case  input.data &&  
            input.data.includes("data:text/plain") && 
            input.visible == true : // new text
        // update the Publication
        Publication.elements.push(input);
        // drop file
        dropElement(input.page, input.data, input.id);
        break;
      case  input.data &&
            !input.data.includes("data:image") &&
            !input.data.includes("data:text/plain") : // neither an image nor text
        notAnImage();
        break;
      case  input.move == true : // moving or scaling an image
        var movingElement
        for (var i = 0 ; i < Publication.elements.length; i += 1) { // find element by id
          if (Publication.elements[i].id == input.id) {
            movingElement = Publication.elements[i];  // read pos and add it to Publication
          }
        }
        movingElement.pos = input.pos
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
      // id, data, [pos x, pos y, width, height, z-index, (rotation?)], visible, page
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
  var elementPos = createElement(element)
  setTimeout(function() { // timeout to get the actual height :(
    elementPos[3] = $('#' + id).height()
    for (var i = 0 ; i < Publication.elements.length; i += 1) { // find element by id
      if (Publication.elements[i].id == id) {
        Publication.elements[i].pos = elementPos;  // read pos and add it to Publication
      }
    }
    Sound.ding();
  }, 1)
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

    target.style.marginLeft = x + 'px'
    target.style.marginTop = y + 'px'

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);

    var pageElementPos = getElementPosition( $('#' + target.id) )
    controller(Publication, {id: target.id, pos: pageElementPos, move: true} ) // sending element id and position
  });

function dragMoveListener(event) {
  var target = event.target,
    // keep the dragged position in the data-x/data-y attributes
    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // translate the element
  target.style.marginLeft = x + 'px'
  target.style.marginTop = y + 'px'

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

  var pageElementPos = getElementPosition( $('#' + target.id) )
  controller(Publication, {id: target.id, pos: pageElementPos, move: true} ) // sending element id and position
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvdW50ZG93bi5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBsb2FkU291bmQgKCkge1xuICBjb25zb2xlLmxvZygnbG9hZCBzb3VuZCEnKTtcbiAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcImFzc2V0cy9hdWRpby9iZWVwLm1wM1wiLCAnYmVlcCcpO1xuICBjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFwiYXNzZXRzL2F1ZGlvL2JlZXAtMi5tcDNcIiwgJ2JlZXAtMicpO1xuICBjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFwiYXNzZXRzL2F1ZGlvL2RpbmcubXAzXCIsICdkaW5nJyk7XG59XG5cbmxvYWRTb3VuZCgpO1xuXG5mdW5jdGlvbiBwbGF5RGluZyAoKSB7XG4gIGNvbnNvbGUubG9nKCdiZWVwIScpO1xuICBjcmVhdGVqcy5Tb3VuZC5wbGF5KCdiZWVwJyk7XG59XG5cblxuLy8gY291bnRkb3duIHRpbWVyXG5mdW5jdGlvbiBjb3VudGRvd24oc3RhcnRUaW1lKSB7XG4gICQoJyNjb3VudGRvd24nKS5zaG93KCk7XG4gIGlmIChzdGFydFRpbWUgPj0gMSkge1xuICAgIGNyZWF0ZWpzLlNvdW5kLnBsYXkoJ2JlZXAtMicpO1xuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7XG4gICAgICBzdGFydFRpbWUgPSBzdGFydFRpbWUgLSAxO1xuICAgICAgJCgnI2NvdW50ZG93bicpLmh0bWwoc3RhcnRUaW1lKTsgLy8gc2V0IGN1cnJlbnQgdGltZSBpbiAjY291bnRkb3duXG4gICAgICBjb3VudGRvd24oc3RhcnRUaW1lKTsgLy8gcmVwZWF0IGZ1bmN0aW9uXG4gICAgfSwgMTAwMCk7XG4gIH0gZWxzZSB7XG4gICAgJCgnI2NvdW50ZG93bicpLmh0bWwoJ3N0YXJ0IGdhbWUhJyk7IC8vIHNldCB0byBzdGFydCBnYW1lIG1lc3NhZ2VcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgLy8gd2FpdCBhIGJpdFxuICAgICAgJCgnI2NvdW50ZG93bicpLmZhZGVPdXQoMTAwMCkgLy8gZmFkZSBvdXQgdGhlICNjb3VudGRvd25cbiAgICAgIC8vIFRPRE86IHN0YXJ0IHRpbWUhXG4gICAgfSwgMjAwKTtcbiAgICBjcmVhdGVqcy5Tb3VuZC5wbGF5KCdkaW5nJyk7XG4gIH1cbn1cblxuXG4iLCIvLyAtLS0gR0xPQkFMXG5cbnZhciBwYWdlcyA9ICQoJy5wYWdlJyk7XG52YXIgY3JpdGljUG9wdXAgPSAkKCcjY3JpdGljJyk7XG52YXIgZHJvcERlbGF5ID0gMTAwO1xudmFyIHBkZlJlYWR5ID0gZmFsc2VcblxuXG5cblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcbiAgdmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcbiAgdmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG4gIHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudChlbGVtZW50KSB7XG4gIGlmIChlbGVtZW50LmRhdGEuaW5jbHVkZXMoXCJkYXRhOmltYWdlXCIpKSB7XG4gICAgdmFyIHBhZ2VFbGVtZW50Q29udGVudCA9ICQoXCI8aW1nPlwiLCB7XCJzcmNcIjogZWxlbWVudC5kYXRhfSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGRlQmFzZWRUZXh0ID0gYXRvYiggZWxlbWVudC5kYXRhLnN1YnN0cmluZygyMykgKTtcbiAgICB2YXIgaHRtbEJyVGV4dCA9IGRlQmFzZWRUZXh0LnJlcGxhY2UoL1xcbi9nLCBcIjxici8+XCIpOyBcbiAgICBjb25zb2xlLmxvZyhodG1sQnJUZXh0KTtcbiAgICB2YXIgcGFnZUVsZW1lbnRDb250ZW50ID0gJChcIjxwPlwiKS5hcHBlbmQoaHRtbEJyVGV4dCk7IC8vIHJlbW92ZSBcImRhdGE6dGV4dC9wbGFpbjtiYXNlNjRcIlxuICB9XG4gIHZhciBwYWdlRWxlbWVudCA9ICQoXCI8ZGl2PlwiLCB7XCJjbGFzc1wiOiBcInBhZ2UtZWxlbWVudCBkcmFnZ2FibGVcIn0pO1xuICB2YXIgcGFnZUVsZW1lbnRDbG9zZSA9ICQoXCI8c3Bhbj5cIiwge1wiY2xhc3NcIjogXCJjbG9zZVwifSkudGV4dCgneCcpO1xuICBwYWdlRWxlbWVudC5hcHBlbmQocGFnZUVsZW1lbnRDb250ZW50LCBwYWdlRWxlbWVudENsb3NlKTtcbiAgcGFnZUVsZW1lbnQuYXR0cignaWQnLCBlbGVtZW50LmlkKTtcbiAgJCgnIycgKyBlbGVtZW50LnBhZ2UpLmFwcGVuZChwYWdlRWxlbWVudCk7XG5cbiAgaWYgKGVsZW1lbnQucG9zKSB7ICAgLy8gcmVjb25zdHJ1Y3Rpbmcgc2F2ZWQgZWxlbWVudFxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgbW9kRWxlbWVudFBvc2l0aW9uKHBhZ2VFbGVtZW50LCBlbGVtZW50LnBvcylcbiAgICB9LCA3MDApXG4gIH0gZWxzZSB7IC8vIGRyb3BwaW5nIG5ldyBmaWxlXG4gICAgcmV0dXJuIGdldEVsZW1lbnRQb3NpdGlvbihwYWdlRWxlbWVudClcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50Q2FudmFzKGVsZW1lbnQpIHtcblxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cbiAgY2FudmFzLnN0eWxlLm1hcmdpbkxlZnQgPSBlbGVtZW50LnBvc1swXSArICdweCdcbiAgY2FudmFzLnN0eWxlLm1hcmdpblRvcCA9IGVsZW1lbnQucG9zWzFdICsgJ3B4J1xuICBjYW52YXMuc3R5bGUud2lkdGggPSBlbGVtZW50LnBvc1syXSArICdweCdcbiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGVsZW1lbnQucG9zWzNdICsgJ3B4J1xuICBjYW52YXMuc3R5bGUuekluZGV4ID0gZWxlbWVudC5wb3NbNF1cblxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgJCgnIycgKyBlbGVtZW50LnBhZ2UpLmFwcGVuZChjYW52YXMpO1xuXG4gIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICB9O1xuICBpbWFnZS5zcmMgPSBlbGVtZW50LmRhdGE7XG59XG5cbmZ1bmN0aW9uIGdldEVsZW1lbnRQb3NpdGlvbihlbGVtZW50KSB7XG4gIHJldHVybiBlbGVtZW50UG9zID0gW1xuICAgIHBhcnNlRmxvYXQoIGVsZW1lbnQuY3NzKFwibWFyZ2luTGVmdFwiKSApLFxuICAgIHBhcnNlRmxvYXQoIGVsZW1lbnQuY3NzKFwibWFyZ2luVG9wXCIpICksXG4gICAgZWxlbWVudC53aWR0aCgpLFxuICAgIGVsZW1lbnQuaGVpZ2h0KCksXG4gICAgcGFyc2VJbnQoIGVsZW1lbnQuY3NzKFwiei1pbmRleFwiKSApIC8vIFRPRE8gcm90YXRpb24gbWF5YmVcbiAgXTtcbn1cblxuZnVuY3Rpb24gbW9kRWxlbWVudFBvc2l0aW9uKHBhZ2VFbGVtZW50LCBuZXdQb3MpIHtcbiAgcGFnZUVsZW1lbnQuY3NzKHsnbWFyZ2luLWxlZnQnOm5ld1Bvc1swXSArICdweCd9KTtcbiAgcGFnZUVsZW1lbnQuY3NzKHsnbWFyZ2luLXRvcCc6bmV3UG9zWzFdICsgJ3B4J30pO1xuICBwYWdlRWxlbWVudC53aWR0aChuZXdQb3NbMl0pXG4gIHBhZ2VFbGVtZW50LmhlaWdodChuZXdQb3NbM10pIFxuICBwYWdlRWxlbWVudC5jc3Moeyd6LWluZGV4JzpuZXdQb3NbNF19KTtcbn1cblxuLy8gLS0tIE0tVi1DXG5cbnZhciBQdWJsaWNhdGlvbiA9IHtcbiAgLy8gYWxsIG91ciBzdGF0ZXNcbiAgaWQ6IG1ha2VJZCgpLFxuICB0aXRsZTogJ1RFU1QgUFVCJyxcbiAgdGltZUxlZnQ6IDkwMDAwMDAsXG4gIGV4cGlyZWQ6IGZhbHNlLFxuICBlbGVtZW50czogW10sXG4gIGF1dGhvcnM6IFtdXG59O1xuXG5mdW5jdGlvbiBjb250cm9sbGVyKFB1YmxpY2F0aW9uLCBpbnB1dCkge1xuXG4gIC8vIGV4cGlyZWQ/XG4gIGlmIChQdWJsaWNhdGlvbi50aW1lTGVmdCA+IDApIHsgLy8gZXhwaXJlZFxuICAgIHNob3dUaW1lKFB1YmxpY2F0aW9uKVxuICB9XG4gIGVsc2UgeyAvLyBub3QgZXhwaXJlZFxuICAgIFB1YmxpY2F0aW9uLmV4cGlyZWQgPSB0cnVlXG4gICAgc2hvd0V4cGlyZWQoUHVibGljYXRpb24pXG4gICAgbm9EcmFnKClcbiAgICBzaG93U2F2ZU1vZGFsKClcblxuICB9XG4gIFxuICBpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSBmYWxzZSkge1xuICAgIGNvbnNvbGUubG9nKGlucHV0KTtcbiAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgIGNhc2UgIGlucHV0LnZpc2libGUgPT0gZmFsc2UgOiAvLyBkZWxldGluZyBhbiBlbGVtZW50XG4gICAgICAgIHJlbW92ZUVsZW1lbnQoaW5wdXQuaWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgIGlucHV0LmRhdGEgJiZcbiAgICAgICAgICAgIGlucHV0LmRhdGEuaW5jbHVkZXMoXCJkYXRhOmltYWdlXCIpICYmIFxuICAgICAgICAgICAgaW5wdXQudmlzaWJsZSA9PSB0cnVlIDogLy8gbmV3IGltYWdlXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgUHVibGljYXRpb25cbiAgICAgICAgUHVibGljYXRpb24uZWxlbWVudHMucHVzaChpbnB1dCk7XG4gICAgICAgIC8vIGRyb3AgZmlsZVxuICAgICAgICBkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBpbnB1dC5pZCk7XG4gICAgICAgIC8vIGFkZCBib251cyB0aW1lXG4gICAgICAgIGFkZHRpbWUoMTAwMCk7XG4gICAgICAgIC8vIGNyaXRpYyBzcGVha1xuICAgICAgICAvLyBjcml0aWMoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICBpbnB1dC5kYXRhICYmICBcbiAgICAgICAgICAgIGlucHV0LmRhdGEuaW5jbHVkZXMoXCJkYXRhOnRleHQvcGxhaW5cIikgJiYgXG4gICAgICAgICAgICBpbnB1dC52aXNpYmxlID09IHRydWUgOiAvLyBuZXcgdGV4dFxuICAgICAgICAvLyB1cGRhdGUgdGhlIFB1YmxpY2F0aW9uXG4gICAgICAgIFB1YmxpY2F0aW9uLmVsZW1lbnRzLnB1c2goaW5wdXQpO1xuICAgICAgICAvLyBkcm9wIGZpbGVcbiAgICAgICAgZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQuaWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgIGlucHV0LmRhdGEgJiZcbiAgICAgICAgICAgICFpbnB1dC5kYXRhLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSAmJlxuICAgICAgICAgICAgIWlucHV0LmRhdGEuaW5jbHVkZXMoXCJkYXRhOnRleHQvcGxhaW5cIikgOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG4gICAgICAgIG5vdEFuSW1hZ2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICBpbnB1dC5tb3ZlID09IHRydWUgOiAvLyBtb3Zpbmcgb3Igc2NhbGluZyBhbiBpbWFnZVxuICAgICAgICB2YXIgbW92aW5nRWxlbWVudFxuICAgICAgICBmb3IgKHZhciBpID0gMCA7IGkgPCBQdWJsaWNhdGlvbi5lbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkgeyAvLyBmaW5kIGVsZW1lbnQgYnkgaWRcbiAgICAgICAgICBpZiAoUHVibGljYXRpb24uZWxlbWVudHNbaV0uaWQgPT0gaW5wdXQuaWQpIHtcbiAgICAgICAgICAgIG1vdmluZ0VsZW1lbnQgPSBQdWJsaWNhdGlvbi5lbGVtZW50c1tpXTsgIC8vIHJlYWQgcG9zIGFuZCBhZGQgaXQgdG8gUHVibGljYXRpb25cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbW92aW5nRWxlbWVudC5wb3MgPSBpbnB1dC5wb3NcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkgeyAvLyB0b28gbGF0ZVxuICAgIExhdGVEcm9wRmlsZSgpO1xuICB9XG59XG5cblxuXG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxudmFyIHhcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKFwic2F2ZWRcIikgPCAwKSB7IC8vIGlmIG5vdCBhIHNhdmVkIHB1YmxpY2F0aW9uXG4gICAgeCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAtIDEwO1xuICAgICAgY29udHJvbGxlcihQdWJsaWNhdGlvbilcbiAgICB9LCAxMCk7XG5cbiAgICBtb3VzZUNvdW50ZXIoKVxuXG4gICAgLy8gY291bnRkb3duXG4gICAgdmFyIHN0YXJ0VGltZSA9IDQ7XG4gICAgY291bnRkb3duKHN0YXJ0VGltZSk7XG4gICAgJCgnI2NvdW50ZG93bicpLmh0bWwoc3RhcnRUaW1lKTtcbiAgfSBlbHNlIHtcbiAgICByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbilcbiAgICBub0RyYWcoKVxuICAgIHBkZkRvd25sb2FkKClcbiAgfVxufSk7XG5cblxuZnVuY3Rpb24gYWRkdGltZShib251c1RpbWUpIHtcbiAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCArIGJvbnVzVGltZTtcbn1cblxuLy8gZHJvcEZpbGVcblxucGFnZXMub24oXCJkcmFnb3ZlclwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJCh0aGlzKS5hZGRDbGFzcygnZHJhZ292ZXInKTtcbn0pO1xucGFnZXMub24oXCJkcmFnbGVhdmVcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICQodGhpcykucmVtb3ZlQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKFwiZHJvcFwiLCBmdW5jdGlvbihlKSB7XG4gICQodGhpcykucmVtb3ZlQ2xhc3MoJ2RyYWdvdmVyJyk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgY29uc29sZS5sb2coZSk7XG4gIHZhciBmaWxlcyA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXNcbiAgdmFyIHkgPSAwO1xuICBmb3IgKHZhciBpID0gZmlsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIHZhciBwYWdlSWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XG4gICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgY29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcbiAgICAgIC8vIGlkLCBkYXRhLCBbcG9zIHgsIHBvcyB5LCB3aWR0aCwgaGVpZ2h0LCB6LWluZGV4LCAocm90YXRpb24/KV0sIHZpc2libGUsIHBhZ2VcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgY29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyBpZDogbWFrZUlkKCksIGRhdGE6IGV2ZW50LnRhcmdldC5yZXN1bHQsIHBvczogWzAsMCwwLDAsMF0sIHZpc2libGU6IHRydWUsIHBhZ2U6IHBhZ2VJZCB9ICk7XG4gICAgICB9LCB5ICogZHJvcERlbGF5KTtcbiAgICAgIHkgKz0gMTtcbiAgICB9O1xuICAgIGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKFwiZHJvcFwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgU291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudFxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jbG9zZScsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHBhZ2VJZCA9ICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5hdHRyKCdpZCcpO1xuICB2YXIgZWxlbWVudElkID0gJCh0aGlzKS5wYXJlbnQoKS5hdHRyKCdpZCcpO1xuICB2YXIgZWxlbWVudERhdGEgPSAkKHRoaXMpLnNpYmxpbmdzKCkuYXR0cignc3JjJyk7XG4gIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgaWQ6IGVsZW1lbnRJZCwgZGF0YTogZWxlbWVudERhdGEsIHBvczogWzAsMCwwLDAsMF0sIHZpc2libGU6IGZhbHNlLCBwYWdlOiBwYWdlSWR9KTtcbn0pO1xuXG5cblxuXG5cblxuLy8gLS0tIFZJRVdcblxudmFyIFNvdW5kID0ge1xuICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vaW5jb3JyZWN0Lm1wMycpO1xuICAgIGF1ZGlvLnBsYXkoKTtcbiAgfSxcbiAgZGluZzogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vZGluZy5tcDMnKTtcbiAgICBhdWRpby5wbGF5KCk7XG4gIH1cbn07XG5cbi8vIG1lcmdlIHRoZXNlIHR3b1xuZnVuY3Rpb24gc2hvd1RpbWUoUHVibGljYXRpb24pIHtcbiAgc2Vjb25kcyA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMTAwMDtcbiAgJCgnI2NvdW50ZXInKS5zaG93KCk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY291bnRlclwiKS5pbm5lckhUTUwgPSBzZWNvbmRzLnRvRml4ZWQoMikgKyBcIiBzZWNvbmRzIGxlZnQhXCI7XG59XG5mdW5jdGlvbiBtb3VzZUNvdW50ZXIoKSB7XG4gICQoZG9jdW1lbnQpLmJpbmQoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpe1xuICAgIGlmIChlLnBhZ2VYID49ICgkKGRvY3VtZW50KS53aWR0aCgpLzIpKSB7XG4gICAgICAvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIHBhZ2VcbiAgICAgICQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG4gICAgICAkKCcjY291bnRlcicpLmNzcyh7XG4gICAgICAgIGxlZnQ6ICBlLnBhZ2VYIC0gMjAgLSAkKCcjY291bnRlcicpLndpZHRoKCksXG4gICAgICAgIHRvcDogICBlLnBhZ2VZICsgNTBcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgcGFnZVxuICAgICAgJCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcbiAgICAgICQoJyNjb3VudGVyJykuY3NzKHtcbiAgICAgICAgbGVmdDogIGUucGFnZVggKyAyMCxcbiAgICAgICAgdG9wOiAgIGUucGFnZVkgKyA1MFxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY291bnRlclwiKS5pbm5lckhUTUwgPSBcImV4cGlyZWQhXCI7XG4gICQoJ2JvZHknKS5hZGRDbGFzcygnZXhwaXJlZCcpO1xuICAvL3NldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgLy8gIHdpbmRvdy5wcmludCgpO1xuICAvL30sIDEwMDApO1xuICBjbGVhckludGVydmFsKHgpO1xufVxuXG5mdW5jdGlvbiBub3RBbkltYWdlKCkge1xuICBTb3VuZC5lcnJvcigpO1xuICBhbGVydCgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgbm90IGFuIGltYWdlIScpO1xufVxuXG5mdW5jdGlvbiBkcm9wRWxlbWVudChwYWdlSWQsIGRhdGEsIGlkKSB7XG4gIHZhciBlbGVtZW50ID0ge2lkOiBpZCwgZGF0YTogZGF0YSwgcGFnZTogcGFnZUlkfVxuICB2YXIgZWxlbWVudFBvcyA9IGNyZWF0ZUVsZW1lbnQoZWxlbWVudClcbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgLy8gdGltZW91dCB0byBnZXQgdGhlIGFjdHVhbCBoZWlnaHQgOihcbiAgICBlbGVtZW50UG9zWzNdID0gJCgnIycgKyBpZCkuaGVpZ2h0KClcbiAgICBmb3IgKHZhciBpID0gMCA7IGkgPCBQdWJsaWNhdGlvbi5lbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkgeyAvLyBmaW5kIGVsZW1lbnQgYnkgaWRcbiAgICAgIGlmIChQdWJsaWNhdGlvbi5lbGVtZW50c1tpXS5pZCA9PSBpZCkge1xuICAgICAgICBQdWJsaWNhdGlvbi5lbGVtZW50c1tpXS5wb3MgPSBlbGVtZW50UG9zOyAgLy8gcmVhZCBwb3MgYW5kIGFkZCBpdCB0byBQdWJsaWNhdGlvblxuICAgICAgfVxuICAgIH1cbiAgICBTb3VuZC5kaW5nKCk7XG4gIH0sIDEpXG59XG5cbmZ1bmN0aW9uIExhdGVEcm9wRmlsZShzcmMpIHtcbiAgYWxlcnQoJ3RvbyBsYXRlIGJybycpO1xufVxuXG5mdW5jdGlvbiBub0RyYWcoKSB7XG4gIHZhciBlbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJhZ2dhYmxlXCIpO1xuICAgIFtdLmZvckVhY2guY2FsbChlbGVtcywgZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnZ2FibGVcIik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcml0aWMoKSB7XG4gIGNyaXRpY1BvcHVwLmlubmVySFRNTCA9ICdNYWtlIHRoaXMgaW1hZ2UgYmlnZ2VyIHBscyEnO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50KGlkKSB7XG4gICQoJyMnICsgaWQpLmhpZGUoKTtcbiAgY29uc29sZS5sb2coaWQpO1xufVxuXG5pbnRlcmFjdCgnLmRyYWdnYWJsZScpXG4gIC5kcmFnZ2FibGUoe1xuICAgIG9ubW92ZTogd2luZG93LmRyYWdNb3ZlTGlzdGVuZXIsXG4gICAgcmVzdHJpY3Q6IHtcbiAgICAgIHJlc3RyaWN0aW9uOiAncGFyZW50JyxcbiAgICAgIGVsZW1lbnRSZWN0OiB7XG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgYm90dG9tOiAxLFxuICAgICAgICByaWdodDogMVxuICAgICAgfVxuICAgIH0sXG4gIH0pXG4gIC5yZXNpemFibGUoe1xuICAgIC8vIHJlc2l6ZSBmcm9tIGFsbCBlZGdlcyBhbmQgY29ybmVyc1xuICAgIGVkZ2VzOiB7XG4gICAgICBsZWZ0OiB0cnVlLFxuICAgICAgcmlnaHQ6IHRydWUsXG4gICAgICBib3R0b206IHRydWUsXG4gICAgICB0b3A6IHRydWVcbiAgICB9LFxuXG4gICAgLy8ga2VlcCB0aGUgZWRnZXMgaW5zaWRlIHRoZSBwYXJlbnRcbiAgICByZXN0cmljdEVkZ2VzOiB7XG4gICAgICBvdXRlcjogJ3BhcmVudCcsXG4gICAgICBlbmRPbmx5OiB0cnVlLFxuICAgIH0sXG5cbiAgICBpbmVydGlhOiB0cnVlLFxuICB9KVxuICAub24oJ3Jlc2l6ZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQsXG4gICAgICB4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDApLFxuICAgICAgeSA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwKTtcblxuICAgIC8vIHVwZGF0ZSB0aGUgZWxlbWVudCdzIHN0eWxlXG4gICAgdGFyZ2V0LnN0eWxlLndpZHRoID0gZXZlbnQucmVjdC53aWR0aCArICdweCc7XG4gICAgdGFyZ2V0LnN0eWxlLmhlaWdodCA9IGV2ZW50LnJlY3QuaGVpZ2h0ICsgJ3B4JztcblxuICAgIC8vIHRyYW5zbGF0ZSB3aGVuIHJlc2l6aW5nIGZyb20gdG9wIG9yIGxlZnQgZWRnZXNcbiAgICB4ICs9IGV2ZW50LmRlbHRhUmVjdC5sZWZ0O1xuICAgIHkgKz0gZXZlbnQuZGVsdGFSZWN0LnRvcDtcblxuICAgIHRhcmdldC5zdHlsZS5tYXJnaW5MZWZ0ID0geCArICdweCdcbiAgICB0YXJnZXQuc3R5bGUubWFyZ2luVG9wID0geSArICdweCdcblxuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgpO1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteScsIHkpO1xuXG4gICAgdmFyIHBhZ2VFbGVtZW50UG9zID0gZ2V0RWxlbWVudFBvc2l0aW9uKCAkKCcjJyArIHRhcmdldC5pZCkgKVxuICAgIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHtpZDogdGFyZ2V0LmlkLCBwb3M6IHBhZ2VFbGVtZW50UG9zLCBtb3ZlOiB0cnVlfSApIC8vIHNlbmRpbmcgZWxlbWVudCBpZCBhbmQgcG9zaXRpb25cbiAgfSk7XG5cbmZ1bmN0aW9uIGRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpIHtcbiAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcbiAgICAvLyBrZWVwIHRoZSBkcmFnZ2VkIHBvc2l0aW9uIGluIHRoZSBkYXRhLXgvZGF0YS15IGF0dHJpYnV0ZXNcbiAgICB4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDApICsgZXZlbnQuZHgsXG4gICAgeSA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwKSArIGV2ZW50LmR5O1xuXG4gIC8vIHRyYW5zbGF0ZSB0aGUgZWxlbWVudFxuICB0YXJnZXQuc3R5bGUubWFyZ2luTGVmdCA9IHggKyAncHgnXG4gIHRhcmdldC5zdHlsZS5tYXJnaW5Ub3AgPSB5ICsgJ3B4J1xuXG4gIC8vIHVwZGF0ZSB0aGUgcG9zaWlvbiBhdHRyaWJ1dGVzXG4gIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgpO1xuICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KTtcblxuICAvLyB1cGRhdGUgei1pbmRleFxuICB2YXIgbWF4ekluZGV4ID0gMCxcbiAgICBpID0gMDtcbiAgcGFnZUVsZW1lbnRzID0gJCgnIycgKyB0YXJnZXQuaWQpLnBhcmVudCgpLmNoaWxkcmVuKCk7XG4gIHBhZ2VFbGVtZW50cy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICBpICs9IDE7XG4gICAgaWYgKCAkKHRoaXMpLmNzcyhcInotaW5kZXhcIikgPj0gbWF4ekluZGV4ICkge1xuICAgICAgbWF4ekluZGV4ID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoXCJ6LWluZGV4XCIpKTtcbiAgICB9XG4gICAgaWYoaSA9PSBwYWdlRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICBpZiAodGFyZ2V0LnN0eWxlLnpJbmRleCAhPSBtYXh6SW5kZXggfCB0YXJnZXQuc3R5bGUuekluZGV4ID09IDApIHtcbiAgICAgICAgdGFyZ2V0LnN0eWxlLnpJbmRleCA9IG1heHpJbmRleCArIDE7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgLy8gdGFyZ2V0LnN0eWxlLnpJbmRleCA9IG1heHpJbmRleCArIDE7XG5cbiAgdmFyIHBhZ2VFbGVtZW50UG9zID0gZ2V0RWxlbWVudFBvc2l0aW9uKCAkKCcjJyArIHRhcmdldC5pZCkgKVxuICBjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7aWQ6IHRhcmdldC5pZCwgcG9zOiBwYWdlRWxlbWVudFBvcywgbW92ZTogdHJ1ZX0gKSAvLyBzZW5kaW5nIGVsZW1lbnQgaWQgYW5kIHBvc2l0aW9uXG59XG5cbi8vIHRoaXMgaXMgdXNlZCBsYXRlciBpbiB0aGUgcmVzaXppbmcgYW5kIGdlc3R1cmUgZGVtb3NcbndpbmRvdy5kcmFnTW92ZUxpc3RlbmVyID0gZHJhZ01vdmVMaXN0ZW5lcjtcblxuXG4vLyBzaG93IHNhdmUgbW9kYWxcblxuZnVuY3Rpb24gc2hvd1NhdmVNb2RhbCgpIHtcbiAgJCgnI3NhdmUtbW9kYWwnKS5zaG93KClcbiAgJCgnI3NhdmUnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBzYXZldG9EYihQdWJsaWNhdGlvbilcbiAgICBtYWtlUGRmKFB1YmxpY2F0aW9uLmlkKVxuICAgIGdlblBkZihQdWJsaWNhdGlvbi5pZClcbiAgICBjaGVja1BkZihQdWJsaWNhdGlvbi5pZClcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdlblBkZihpZCkge1xuICAkKCcjc2F2ZS1tb2RhbCcpLnNob3coKVxuICAkKCcjc2F2ZS1tb2RhbCcpLmh0bWwoJycpXG4gIHZhciB5ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICBpZiAocGRmUmVhZHkgPT0gdHJ1ZSkge1xuICAgICAgJCgnI3NhdmUtbW9kYWwnKS5odG1sKCdEb3dubG9hZCB5b3VyIHBkZiA8YSBocmVmPVwiYXNzZXRzL3BkZi8nICsgaWQgKyAnLycgKyBpZCArICcucGRmXCI+aGVyZTwvYT4nIClcbiAgICAgIGNsZWFySW50ZXJ2YWwoeSlcbiAgICB9IGVsc2Uge1xuICAgICAgJCgnI3NhdmUtbW9kYWwnKS50ZXh0KCdZb3VyIFBERiBpcyBiZWluZyBnZW5lcmF0ZWQnKVxuICAgIH1cbiAgfSwgMTAwKSBcbn0gXG5cblxuXG4vLyAtLS0gU0FWRURcblxuZnVuY3Rpb24gcmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pIHtcbiAgdmFyIGk7XG4gIGZvciAoaSA9IDA7IGkgPCBQdWJsaWNhdGlvbi5lbGVtZW50cy5sZW5ndGg7ICsraSkge1xuICAgIGlmICggd2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZihcInByaW50PXRydWVcIikgPiAwICkge1xuICAgICAgY3JlYXRlRWxlbWVudENhbnZhcyhQdWJsaWNhdGlvbi5lbGVtZW50c1tpXSlcbiAgICAgIGNvbnNvbGUubG9nKCdwcmludCBwdWInKVxuICAgIH0gZWxzZSB7XG4gICAgICBjcmVhdGVFbGVtZW50KFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldKVxuICAgICAgY29uc29sZS5sb2coJ3NhdmVkIHB1YicpICAgICAgXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBkZkRvd25sb2FkKCkge1xuICAkKCcjcGRmLWRvd25sb2FkJykuc2hvdygpXG4gICQoJyNwZGYtZG93bmxvYWQnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBtYWtlUGRmKFB1YmxpY2F0aW9uLmlkKVxuICAgIGdlblBkZihQdWJsaWNhdGlvbi5pZClcbiAgICBjaGVja1BkZihQdWJsaWNhdGlvbi5pZClcbiAgfSk7XG59XG5cblxuXG5cbi8vIC0tLSBCQUNLRU5EXG5cbi8vIHNlbmQgY2FsbCB0byBzZXJ2ZXIgdG8gbWFrZSBwZGZcbmZ1bmN0aW9uIG1ha2VQZGYoaWQpIHtcbiAgJC5nZXQoICcvcGRmP2lkPScgKyBpZCwgZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgY29uc29sZS5sb2coICdTZW50IGNhbGwgdG8gbWFrZSBQREYuJyApO1xuICB9KTtcbn1cblxuLy8gY2hlY2sgaWYgcGRmIGV4aXN0cyBhbmQgcmVkaXJlY3QgdG8gZmlsZVxuZnVuY3Rpb24gY2hlY2tQZGYoaWQpIHtcbiAgdmFyIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiAnSEVBRCcsXG4gICAgICB1cmw6ICdhc3NldHMvcGRmLycgKyBpZCArICcvJyArIGlkICsgJy5wZGYnLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24obXNnKXtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh5KTtcbiAgICAgICAgcGRmUmVhZHkgPSB0cnVlO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbihqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3Ipe1xuICAgICAgICBjb25zb2xlLmxvZyhqcVhIUik7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgIH1cbiAgICB9KVxuICB9LCAxMDApO1xufVxuXG5mdW5jdGlvbiBzYXZldG9EYihwdWJsaWNhdGlvbikge1xuICAkLmFqYXgoeyAgICAgICAgICAgICAgICAgICAgXG4gICAgdXJsOiAnL2RiJywgICAgIFxuICAgIHR5cGU6ICdwb3N0JywgLy8gcGVyZm9ybWluZyBhIFBPU1QgcmVxdWVzdFxuICAgIGRhdGEgOiBwdWJsaWNhdGlvbixcbiAgICBkYXRhVHlwZTogJ2pzb24nLCAgICAgICAgICAgICAgICAgICBcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihwdWJsaWNhdGlvbikgICAgICAgICBcbiAgICB7XG4gICAgICBjb25zb2xlLmxvZygncHVibGljYXRpb24gc2VudCB0byBkYXRhYmFzZS4nKVxuICAgIH0gXG4gIH0pO1xufVxuXG5cbi8vIC8vIG1ha2UgcGRmXG4vLyB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwMScpO1xuLy8gJCgnI3AxJykuY2xpY2soZnVuY3Rpb24oKXtcbi8vICBodG1sMnBkZihlbGVtZW50LCB7XG4vLyAgICBtYXJnaW46ICAgICAgIDEsXG4vLyAgICBmaWxlbmFtZTogICAgICdteWZpbGUucGRmJyxcbi8vICAgIGltYWdlOiAgICAgICAgeyB0eXBlOiAnanBlZycsIHF1YWxpdHk6IDAuOTggfSxcbi8vICAgIGh0bWwyY2FudmFzOiAgeyBkcGk6IDcyLCBsZXR0ZXJSZW5kZXJpbmc6IHRydWUsIGhlaWdodDogMjk3MCwgd2lkdGg6IDUxMDAgfSxcbi8vICAgIGpzUERGOiAgICAgICAgeyB1bml0OiAnbW0nLCBmb3JtYXQ6ICdBNCcsIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnIH1cbi8vICB9KTtcbi8vIH0pO1xuXG5cbi8vIC0tLSBBUkNISVZFXG5cbi8vICQuYWpheCh7XG4vLyAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MjgwMTcvdGVzdFwiLFxuLy8gIHR5cGU6ICdnZXQnLFxuLy8gIGRhdGFUeXBlOiAnanNvbnAnLFxuLy8gIGpzb25wOiAnanNvbnAnLCAvLyBtb25nb2RiIGlzIGV4cGVjdGluZyB0aGF0XG4vLyAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbi8vICAgICBjb25zb2xlLmxvZygnc3VjY2VzcycsIGRhdGEpO1xuLy8gICB9LFxuLy8gICBlcnJvcjogZnVuY3Rpb24gKFhNTEh0dHBSZXF1ZXN0LCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuLy8gICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yVGhyb3duKTtcbi8vICAgfVxuLy8gfSk7XG4iXX0=
