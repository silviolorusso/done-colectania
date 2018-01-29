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
