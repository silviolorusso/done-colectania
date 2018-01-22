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
  timeLeft: 5000,
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0gR0xPQkFMXG5cbnZhciBwYWdlcyA9ICQoJy5wYWdlJyk7XG52YXIgY3JpdGljUG9wdXAgPSAkKCcjY3JpdGljJyk7XG52YXIgZHJvcERlbGF5ID0gMTAwO1xuXG5cblxuXG5cbi8vIC0tLSBHRU5FUkFMIEZVTkNUSU9OU1xuXG5mdW5jdGlvbiBtYWtlSWQoKSB7XG4gIHZhciByYW5kTGV0dGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI2KSk7XG4gIHZhciBpZCA9IHJhbmRMZXR0ZXIgKyBEYXRlLm5vdygpO1xuICByZXR1cm4gaWQ7IFxufVxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQuZGF0YS5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikpIHtcbiAgICB2YXIgcGFnZUVsZW1lbnRDb250ZW50ID0gJChcIjxpbWc+XCIsIHtcInNyY1wiOiBlbGVtZW50LmRhdGF9KTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZGVCYXNlZFRleHQgPSBhdG9iKCBlbGVtZW50LmRhdGEuc3Vic3RyaW5nKDIzKSApO1xuICAgIHZhciBodG1sQnJUZXh0ID0gZGVCYXNlZFRleHQucmVwbGFjZSgvXFxuL2csIFwiPGJyLz5cIik7IFxuICAgIGNvbnNvbGUubG9nKGh0bWxCclRleHQpO1xuICAgIHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKFwiPHA+XCIpLmFwcGVuZChodG1sQnJUZXh0KTsgLy8gcmVtb3ZlIFwiZGF0YTp0ZXh0L3BsYWluO2Jhc2U2NFwiXG4gIH1cbiAgdmFyIHBhZ2VFbGVtZW50ID0gJChcIjxkaXY+XCIsIHtcImNsYXNzXCI6IFwicGFnZS1lbGVtZW50IGRyYWdnYWJsZVwifSk7XG4gIHZhciBwYWdlRWxlbWVudENsb3NlID0gJChcIjxzcGFuPlwiLCB7XCJjbGFzc1wiOiBcImNsb3NlXCJ9KS50ZXh0KCd4Jyk7XG4gIHBhZ2VFbGVtZW50LmFwcGVuZChwYWdlRWxlbWVudENvbnRlbnQsIHBhZ2VFbGVtZW50Q2xvc2UpO1xuICBwYWdlRWxlbWVudC5hdHRyKCdpZCcsIGVsZW1lbnQuaWQpO1xuICAkKCcjJyArIGVsZW1lbnQucGFnZSkuYXBwZW5kKHBhZ2VFbGVtZW50KTtcbiAgaWYgKGVsZW1lbnQucG9zKSB7ICAgLy8gcmVjb25zdHJ1Y3Rpbmcgc2F2ZWQgZWxlbWVudFxuICAgIHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkubGVmdCA9IGVsZW1lbnQucG9zWzBdXG4gICAgcGFnZUVsZW1lbnQucG9zaXRpb24oKS50b3AgPSBlbGVtZW50LnBvc1sxXVxuICAgIC8vIHBhZ2VFbGVtZW50LndpZHRoKGVsZW1lbnQucG9zWzJdKSAvLyBwcm9ibGVtcyB3aXRoIHRoZXNlIHR3b1xuICAgIC8vIHBhZ2VFbGVtZW50LmhlaWdodChlbGVtZW50LnBvc1szXSkgXG4gIH0gZWxzZSB7IC8vIGRyb3BwaW5nIG5ldyBmaWxlXG4gICAgcmV0dXJuIGVsZW1lbnRQb3MgPSBbXG4gICAgICBwYWdlRWxlbWVudC5wb3NpdGlvbigpLmxlZnQsXG4gICAgICBwYWdlRWxlbWVudC5wb3NpdGlvbigpLnRvcCxcbiAgICAgIHBhZ2VFbGVtZW50LndpZHRoKCksXG4gICAgICBwYWdlRWxlbWVudC5oZWlnaHQoKSxcbiAgICAgIDAgLy8gcm90YXRpb24gKFRPRE8pXG4gICAgXTtcbiAgfVxufVxuXG5cblxuXG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG4gIC8vIGFsbCBvdXIgc3RhdGVzXG4gIGlkOiBtYWtlSWQoKSxcbiAgdGl0bGU6ICdURVNUIFBVQicsXG4gIHRpbWVMZWZ0OiA1MDAwLFxuICBleHBpcmVkOiBmYWxzZSxcbiAgZWxlbWVudHM6IFtdLFxuICBhdXRob3JzOiBbXVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihQdWJsaWNhdGlvbiwgaW5wdXQpIHtcblxuICAvLyBleHBpcmVkP1xuICBpZiAoUHVibGljYXRpb24udGltZUxlZnQgPiAwKSB7XG4gICAgc2hvd1RpbWUoUHVibGljYXRpb24pO1xuICB9XG4gIGVsc2Uge1xuICAgIFB1YmxpY2F0aW9uLmV4cGlyZWQgPSB0cnVlXG4gICAgc2hvd0V4cGlyZWQoUHVibGljYXRpb24pXG4gICAgbm9EcmFnKClcbiAgICBzYXZldG9EYihQdWJsaWNhdGlvbilcbiAgICAvLyBtYWtlUGRmKClcbiAgICAvLyBjaGVja1BkZigpXG4gIH1cbiAgXG4gIGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG4gICAgY29uc29sZS5sb2coaW5wdXQpO1xuICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgY2FzZSAgaW5wdXQudmlzaWJsZSA9PSBmYWxzZSA6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcbiAgICAgICAgcmVtb3ZlRWxlbWVudChpbnB1dC5pZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAgaW5wdXQuZGF0YS5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikgJiYgXG4gICAgICAgICAgICBpbnB1dC52aXNpYmxlID09IHRydWUgOiAvLyBuZXcgaW1hZ2VcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBQdWJsaWNhdGlvblxuICAgICAgICBQdWJsaWNhdGlvbi5lbGVtZW50cy5wdXNoKGlucHV0KTtcbiAgICAgICAgLy8gZHJvcCBmaWxlXG4gICAgICAgIGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0LmlkKTtcbiAgICAgICAgLy8gYWRkIGJvbnVzIHRpbWVcbiAgICAgICAgYWRkdGltZSgxMDAwKTtcbiAgICAgICAgLy8gY3JpdGljIHNwZWFrXG4gICAgICAgIC8vIGNyaXRpYygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgIGlucHV0LmRhdGEuaW5jbHVkZXMoXCJkYXRhOnRleHQvcGxhaW5cIikgJiYgXG4gICAgICAgICAgICBpbnB1dC52aXNpYmxlID09IHRydWUgOiAvLyBuZXcgdGV4dFxuICAgICAgICAvLyB1cGRhdGUgdGhlIFB1YmxpY2F0aW9uXG4gICAgICAgIFB1YmxpY2F0aW9uLmVsZW1lbnRzLnB1c2goaW5wdXQpO1xuICAgICAgICAvLyBkcm9wIGZpbGVcbiAgICAgICAgZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQuaWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgICFpbnB1dC5kYXRhLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSAmJlxuICAgICAgICAgICAgIWlucHV0LmRhdGEuaW5jbHVkZXMoXCJkYXRhOnRleHQvcGxhaW5cIikgOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG4gICAgICAgIG5vdEFuSW1hZ2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkgeyAvLyB0b28gbGF0ZVxuICAgIExhdGVEcm9wRmlsZSgpO1xuICB9XG59XG5cblxuXG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoXCJzYXZlZFwiKSA8IDApIHsgLy8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cbiAgICB2YXIgeCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgUHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAtIDEwO1xuICAgICAgY29udHJvbGxlcihQdWJsaWNhdGlvbik7XG4gICAgfSwgMTApO1xuICB9IGVsc2Uge1xuICAgIHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKVxuICAgIG5vRHJhZygpXG4gIH1cbn0pO1xuXG5cbmZ1bmN0aW9uIGFkZHRpbWUoYm9udXNUaW1lKSB7XG4gIFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID0gUHVibGljYXRpb24udGltZUxlZnQgKyBib251c1RpbWU7XG59XG5cbi8vIGRyb3BGaWxlXG5cbnBhZ2VzLm9uKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICQodGhpcykuYWRkQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKFwiZHJhZ2xlYXZlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xufSk7XG5wYWdlcy5vbihcImRyb3BcIiwgZnVuY3Rpb24oZSkge1xuICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnNvbGUubG9nKGUpO1xuICB2YXIgZmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzXG4gIHZhciB5ID0gMDtcbiAgZm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICB2YXIgcGFnZUlkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG4gICAgICAvLyBpZCwgZGF0YSwgc2l6ZSwgcG9zLCByb3RhdGlvbj8sIHZpc2libGVcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgY29udHJvbGxlcihQdWJsaWNhdGlvbiwgeyBpZDogbWFrZUlkKCksIGRhdGE6IGV2ZW50LnRhcmdldC5yZXN1bHQsIHBvczogWzAsMCwwLDAsMF0sIHZpc2libGU6IHRydWUsIHBhZ2U6IHBhZ2VJZCB9ICk7XG4gICAgICB9LCB5ICogZHJvcERlbGF5KTtcbiAgICAgIHkgKz0gMTtcbiAgICB9O1xuICAgIGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKFwiZHJvcFwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgU291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudFxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jbG9zZScsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHBhZ2VJZCA9ICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5hdHRyKCdpZCcpO1xuICB2YXIgZWxlbWVudElkID0gJCh0aGlzKS5wYXJlbnQoKS5hdHRyKCdpZCcpO1xuICB2YXIgZWxlbWVudERhdGEgPSAkKHRoaXMpLnNpYmxpbmdzKCkuYXR0cignc3JjJyk7XG4gIGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgaWQ6IGVsZW1lbnRJZCwgZGF0YTogZWxlbWVudERhdGEsIHBvczogWzAsMCwwLDAsMF0sIHZpc2libGU6IGZhbHNlLCBwYWdlOiBwYWdlSWR9KTtcbn0pO1xuXG5cblxuXG5cblxuLy8gLS0tIFZJRVdcblxudmFyIFNvdW5kID0ge1xuICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vaW5jb3JyZWN0Lm1wMycpO1xuICAgIGF1ZGlvLnBsYXkoKTtcbiAgfSxcbiAgZGluZzogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vZGluZy5tcDMnKTtcbiAgICBhdWRpby5wbGF5KCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHNob3dUaW1lKFB1YmxpY2F0aW9uKSB7XG4gIHNlY29uZHMgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDEwMDA7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY291bnRlclwiKS5pbm5lckhUTUwgPSBzZWNvbmRzLnRvRml4ZWQoMikgKyBcIiBzZWNvbmRzIGxlZnQhXCI7XG59XG5cbmZ1bmN0aW9uIHNob3dFeHBpcmVkKCkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdW50ZXJcIikuaW5uZXJIVE1MID0gXCJleHBpcmVkIVwiO1xuICAkKCdib2R5JykuYWRkQ2xhc3MoJ2V4cGlyZWQnKTtcbiAgLy9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IFxuICAvLyAgd2luZG93LnByaW50KCk7IFxuICAvL30sIDEwMDApO1xuICBjbGVhckludGVydmFsKHgpO1xufVxuXG5mdW5jdGlvbiBub3RBbkltYWdlKCkge1xuICBTb3VuZC5lcnJvcigpO1xuICBhbGVydCgnVGhlIGZpbGUgeW91IGRyb3BwZWQgaXMgbm90IGFuIGltYWdlIScpO1xufVxuXG5mdW5jdGlvbiBkcm9wRWxlbWVudChwYWdlSWQsIGRhdGEsIGlkKSB7XG4gIHZhciBlbGVtZW50ID0ge2lkOiBpZCwgZGF0YTogZGF0YSwgcGFnZTogcGFnZUlkfVxuICAvLyByZWFkIHNpemUsIHBvcywgcm90IGFuZCBhZGQgdGhlbSB0byBQdWJsaWNhdGlvblxuICB2YXIgZWxlbWVudFBvcyA9IGNyZWF0ZUVsZW1lbnQoZWxlbWVudClcbiAgZm9yKHZhciBpID0gMCA7IGkgPCBQdWJsaWNhdGlvbi5lbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmIChQdWJsaWNhdGlvbi5lbGVtZW50c1tpXS5pZCA9PSBpZCkge1xuICAgICAgUHVibGljYXRpb24uZWxlbWVudHNbaV0ucG9zID0gZWxlbWVudFBvcztcbiAgICB9XG4gIH1cbiAgU291bmQuZGluZygpO1xufVxuXG5mdW5jdGlvbiBMYXRlRHJvcEZpbGUoc3JjKSB7XG4gIGFsZXJ0KCd0b28gbGF0ZSBicm8nKTtcbn1cblxuZnVuY3Rpb24gbm9EcmFnKCkge1xuICB2YXIgZWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyYWdnYWJsZVwiKTtcbiAgICBbXS5mb3JFYWNoLmNhbGwoZWxlbXMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJhZ2dhYmxlXCIpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JpdGljKCkge1xuICBjcml0aWNQb3B1cC5pbm5lckhUTUwgPSAnTWFrZSB0aGlzIGltYWdlIGJpZ2dlciBwbHMhJztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRWxlbWVudChpZCkge1xuICAkKCcjJyArIGlkKS5oaWRlKCk7XG4gIGNvbnNvbGUubG9nKGlkKTtcbn1cblxuaW50ZXJhY3QoJy5kcmFnZ2FibGUnKVxuICAuZHJhZ2dhYmxlKHtcbiAgICBvbm1vdmU6IHdpbmRvdy5kcmFnTW92ZUxpc3RlbmVyLFxuICAgIHJlc3RyaWN0OiB7XG4gICAgICByZXN0cmljdGlvbjogJ3BhcmVudCcsXG4gICAgICBlbGVtZW50UmVjdDoge1xuICAgICAgICB0b3A6IDAsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIGJvdHRvbTogMSxcbiAgICAgICAgcmlnaHQ6IDFcbiAgICAgIH1cbiAgICB9LFxuICB9KVxuICAucmVzaXphYmxlKHtcbiAgICAvLyByZXNpemUgZnJvbSBhbGwgZWRnZXMgYW5kIGNvcm5lcnNcbiAgICBlZGdlczoge1xuICAgICAgbGVmdDogdHJ1ZSxcbiAgICAgIHJpZ2h0OiB0cnVlLFxuICAgICAgYm90dG9tOiB0cnVlLFxuICAgICAgdG9wOiB0cnVlXG4gICAgfSxcblxuICAgIC8vIGtlZXAgdGhlIGVkZ2VzIGluc2lkZSB0aGUgcGFyZW50XG4gICAgcmVzdHJpY3RFZGdlczoge1xuICAgICAgb3V0ZXI6ICdwYXJlbnQnLFxuICAgICAgZW5kT25seTogdHJ1ZSxcbiAgICB9LFxuXG4gICAgaW5lcnRpYTogdHJ1ZSxcbiAgfSlcbiAgLm9uKCdyZXNpemVtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuICAgICAgeCA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteCcpKSB8fCAwKSxcbiAgICAgIHkgPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXknKSkgfHwgMCk7XG5cbiAgICAvLyB1cGRhdGUgdGhlIGVsZW1lbnQncyBzdHlsZVxuICAgIHRhcmdldC5zdHlsZS53aWR0aCA9IGV2ZW50LnJlY3Qud2lkdGggKyAncHgnO1xuICAgIHRhcmdldC5zdHlsZS5oZWlnaHQgPSBldmVudC5yZWN0LmhlaWdodCArICdweCc7XG5cbiAgICAvLyB0cmFuc2xhdGUgd2hlbiByZXNpemluZyBmcm9tIHRvcCBvciBsZWZ0IGVkZ2VzXG4gICAgeCArPSBldmVudC5kZWx0YVJlY3QubGVmdDtcbiAgICB5ICs9IGV2ZW50LmRlbHRhUmVjdC50b3A7XG5cbiAgICB0YXJnZXQuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gdGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9XG4gICAgICAndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCcgKyB5ICsgJ3B4KSc7XG5cbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KTtcbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KTtcbiAgfSk7XG5cbmZ1bmN0aW9uIGRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpIHtcbiAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcbiAgICAvLyBrZWVwIHRoZSBkcmFnZ2VkIHBvc2l0aW9uIGluIHRoZSBkYXRhLXgvZGF0YS15IGF0dHJpYnV0ZXNcbiAgICB4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDApICsgZXZlbnQuZHgsXG4gICAgeSA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwKSArIGV2ZW50LmR5O1xuXG4gIC8vIHRyYW5zbGF0ZSB0aGUgZWxlbWVudFxuICB0YXJnZXQuc3R5bGUud2Via2l0VHJhbnNmb3JtID1cbiAgICB0YXJnZXQuc3R5bGUudHJhbnNmb3JtID1cbiAgICAndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCAnICsgeSArICdweCknO1xuXG4gIC8vIHVwZGF0ZSB0aGUgcG9zaWlvbiBhdHRyaWJ1dGVzXG4gIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgpO1xuICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KTtcblxuICAvLyB1cGRhdGUgei1pbmRleFxuICB2YXIgbWF4ekluZGV4ID0gMCxcbiAgICBpID0gMDtcbiAgcGFnZUVsZW1lbnRzID0gJCgnIycgKyB0YXJnZXQuaWQpLnBhcmVudCgpLmNoaWxkcmVuKCk7XG4gIHBhZ2VFbGVtZW50cy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICBpICs9IDE7XG4gICAgaWYgKCAkKHRoaXMpLmNzcyhcInotaW5kZXhcIikgPj0gbWF4ekluZGV4ICkge1xuICAgICAgbWF4ekluZGV4ID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoXCJ6LWluZGV4XCIpKTtcbiAgICB9XG4gICAgaWYoaSA9PSBwYWdlRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICBpZiAodGFyZ2V0LnN0eWxlLnpJbmRleCAhPSBtYXh6SW5kZXggfCB0YXJnZXQuc3R5bGUuekluZGV4ID09IDApIHtcbiAgICAgICAgdGFyZ2V0LnN0eWxlLnpJbmRleCA9IG1heHpJbmRleCArIDE7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgLy8gdGFyZ2V0LnN0eWxlLnpJbmRleCA9IG1heHpJbmRleCArIDE7XG59XG5cbi8vIHRoaXMgaXMgdXNlZCBsYXRlciBpbiB0aGUgcmVzaXppbmcgYW5kIGdlc3R1cmUgZGVtb3NcbndpbmRvdy5kcmFnTW92ZUxpc3RlbmVyID0gZHJhZ01vdmVMaXN0ZW5lcjtcblxuXG5cblxuXG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbikge1xuICBmb3IgKGxldCBlbGVtZW50IG9mIFB1YmxpY2F0aW9uLmVsZW1lbnRzKSB7XG4gICAgY29uc29sZS5sb2coZWxlbWVudC5kYXRhKVxuICAgIGNyZWF0ZUVsZW1lbnQoZWxlbWVudClcbiAgICBjb25zb2xlLmxvZygnc2F2ZWQgcHViJylcbiAgfVxufVxuXG5cblxuXG5cblxuLy8gLS0tIEJBQ0tFTkRcblxuLy8gc2VuZCBjYWxsIHRvIHNlcnZlciB0byBtYWtlIHBkZlxuZnVuY3Rpb24gbWFrZVBkZigpIHtcbiAgJC5nZXQoICcvcGRmJywgZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgY29uc29sZS5sb2coICdTZW50IGNhbGwgdG8gbWFrZSBQREYuJyApO1xuICB9KTtcbn1cblxuLy8gY2hlY2sgaWYgcGRmIGV4aXN0cyBhbmQgcmVkaXJlY3QgdG8gZmlsZVxuZnVuY3Rpb24gY2hlY2tQZGYoKSB7XG4gIHZhciB5ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAkLmFqYXgoe1xuICAgICAgdHlwZTogJ0hFQUQnLFxuICAgICAgdXJsOiAnYXNzZXRzL3BkZi9wcmludC10ZXN0LnBkZicsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihtc2cpe1xuICAgICAgICBhbGVydCgnR28gdG8gUERGIScpO1xuICAgICAgICBjbGVhckludGVydmFsKHkpO1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICdhc3NldHMvcGRmL3ByaW50LXRlc3QucGRmJztcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24oanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKXtcbiAgICAgICAgbG9nKGpxWEhSKTtcbiAgICAgICAgbG9nKGVycm9yVGhyb3duKTtcbiAgICAgIH1cbiAgICB9KVxuICB9LCAxMDApO1xufVxuXG5mdW5jdGlvbiBzYXZldG9EYihwdWJsaWNhdGlvbikge1xuICAkLmFqYXgoeyAgICAgICAgICAgICAgICAgICAgXG4gICAgdXJsOiAnL2RiJywgICAgIFxuICAgIHR5cGU6ICdwb3N0JywgLy8gcGVyZm9ybWluZyBhIFBPU1QgcmVxdWVzdFxuICAgIGRhdGEgOiBwdWJsaWNhdGlvbixcbiAgICBkYXRhVHlwZTogJ2pzb24nLCAgICAgICAgICAgICAgICAgICBcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihwdWJsaWNhdGlvbikgICAgICAgICBcbiAgICB7XG4gICAgICBjb25zb2xlLmxvZygncHVibGljYXRpb24gc2VudCB0byBkYXRhYmFzZS4nKVxuICAgIH0gXG4gIH0pO1xufVxuXG5cbi8vIC8vIG1ha2UgcGRmXG4vLyB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwMScpO1xuLy8gJCgnI3AxJykuY2xpY2soZnVuY3Rpb24oKXtcbi8vICBodG1sMnBkZihlbGVtZW50LCB7XG4vLyAgICBtYXJnaW46ICAgICAgIDEsXG4vLyAgICBmaWxlbmFtZTogICAgICdteWZpbGUucGRmJyxcbi8vICAgIGltYWdlOiAgICAgICAgeyB0eXBlOiAnanBlZycsIHF1YWxpdHk6IDAuOTggfSxcbi8vICAgIGh0bWwyY2FudmFzOiAgeyBkcGk6IDcyLCBsZXR0ZXJSZW5kZXJpbmc6IHRydWUsIGhlaWdodDogMjk3MCwgd2lkdGg6IDUxMDAgfSxcbi8vICAgIGpzUERGOiAgICAgICAgeyB1bml0OiAnbW0nLCBmb3JtYXQ6ICdBNCcsIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnIH1cbi8vICB9KTtcbi8vIH0pO1xuXG5cbi8vIC0tLSBBUkNISVZFXG5cbi8vICQuYWpheCh7XG4vLyAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MjgwMTcvdGVzdFwiLFxuLy8gIHR5cGU6ICdnZXQnLFxuLy8gIGRhdGFUeXBlOiAnanNvbnAnLFxuLy8gIGpzb25wOiAnanNvbnAnLCAvLyBtb25nb2RiIGlzIGV4cGVjdGluZyB0aGF0XG4vLyAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbi8vICAgICBjb25zb2xlLmxvZygnc3VjY2VzcycsIGRhdGEpO1xuLy8gICB9LFxuLy8gICBlcnJvcjogZnVuY3Rpb24gKFhNTEh0dHBSZXF1ZXN0LCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuLy8gICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yVGhyb3duKTtcbi8vICAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbi8vIH0pOyJdfQ==
