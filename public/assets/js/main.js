

// countdown timer
function countdown(startTime) {
  if (startTime >= 1) {
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
  }
}

var startTime = 3;
countdown(startTime);
$('#countdown').html(startTime);

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
  timeLeft: 100000000000000000,
  expired: false,
  elements: []
}; // add title, date and id

function controller(Model, page, input) {

  // expired?
  if (Model.timeLeft > 0) {
    showTime(Model);
  }
  else {
    Model.expired = true
    showExpired(Model)
    noDrag()
    makePdf()
    checkPdf()
  }

  if (input && Model.expired == false) {
    switch (true) {
      case  input[3] == false : // deleting an element
        removeElement(input[0]);
        break;
      case  input[1].includes("data:image") &&
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
      case  input[1].includes("data:text/plain") &&
            input[3] == true : // new text
        // update the Model
        Model.elements.push(input);
        // drop file
        dropFile(page, input[1], input[0]);
        break;
      case  !input[1].includes("data:image") &&
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
  //setTimeout(function(){
  //  window.print();
  //}, 1000);
  clearInterval(x);
}

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvdW50ZG93bi5qcyIsIm1haW4uanMiLCJ0aW1lX2ZvbGxvd19tb3VzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbi8vIGNvdW50ZG93biB0aW1lclxuZnVuY3Rpb24gY291bnRkb3duKHN0YXJ0VGltZSkge1xuICBpZiAoc3RhcnRUaW1lID49IDEpIHtcbiAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpe1xuICAgICAgc3RhcnRUaW1lID0gc3RhcnRUaW1lIC0gMTtcbiAgICAgICQoJyNjb3VudGRvd24nKS5odG1sKHN0YXJ0VGltZSk7IC8vIHNldCBjdXJyZW50IHRpbWUgaW4gI2NvdW50ZG93blxuICAgICAgY291bnRkb3duKHN0YXJ0VGltZSk7IC8vIHJlcGVhdCBmdW5jdGlvblxuICAgIH0sIDEwMDApO1xuICB9IGVsc2Uge1xuICAgICQoJyNjb3VudGRvd24nKS5odG1sKCdzdGFydCBnYW1lIScpOyAvLyBzZXQgdG8gc3RhcnQgZ2FtZSBtZXNzYWdlXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IC8vIHdhaXQgYSBiaXRcbiAgICAgICQoJyNjb3VudGRvd24nKS5mYWRlT3V0KDEwMDApIC8vIGZhZGUgb3V0IHRoZSAjY291bnRkb3duXG4gICAgICAvLyBUT0RPOiBzdGFydCB0aW1lIVxuICAgIH0sIDIwMCk7XG4gIH1cbn1cblxudmFyIHN0YXJ0VGltZSA9IDM7XG5jb3VudGRvd24oc3RhcnRUaW1lKTtcbiQoJyNjb3VudGRvd24nKS5odG1sKHN0YXJ0VGltZSk7XG4iLCIvLyAtLS0gZ2xvYmFsIHZhcmlhYmxlc1xuXG52YXIgcGFnZXMgPSAkKCcucGFnZScpO1xudmFyIGNyaXRpY1BvcHVwID0gJCgnI2NyaXRpYycpO1xudmFyIGRyb3BEZWxheSA9IDEwMDtcblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcbiAgdmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcbiAgdmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG4gIHJldHVybiBpZDtcbn1cblxudmFyIFNvdW5kID0ge1xuICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vaW5jb3JyZWN0Lm1wMycpO1xuICAgIGF1ZGlvLnBsYXkoKTtcbiAgfSxcbiAgZGluZzogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vZGluZy5tcDMnKTtcbiAgICBhdWRpby5wbGF5KCk7XG4gIH1cbn07XG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgTW9kZWwgPSB7XG4gIC8vIGFsbCBvdXIgc3RhdGVzXG4gIHRpbWVMZWZ0OiAxMDAwMDAwMDAwMDAwMDAwMDAsXG4gIGV4cGlyZWQ6IGZhbHNlLFxuICBlbGVtZW50czogW11cbn07IC8vIGFkZCB0aXRsZSwgZGF0ZSBhbmQgaWRcblxuZnVuY3Rpb24gY29udHJvbGxlcihNb2RlbCwgcGFnZSwgaW5wdXQpIHtcblxuICAvLyBleHBpcmVkP1xuICBpZiAoTW9kZWwudGltZUxlZnQgPiAwKSB7XG4gICAgc2hvd1RpbWUoTW9kZWwpO1xuICB9XG4gIGVsc2Uge1xuICAgIE1vZGVsLmV4cGlyZWQgPSB0cnVlXG4gICAgc2hvd0V4cGlyZWQoTW9kZWwpXG4gICAgbm9EcmFnKClcbiAgICBtYWtlUGRmKClcbiAgICBjaGVja1BkZigpXG4gIH1cblxuICBpZiAoaW5wdXQgJiYgTW9kZWwuZXhwaXJlZCA9PSBmYWxzZSkge1xuICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgY2FzZSAgaW5wdXRbM10gPT0gZmFsc2UgOiAvLyBkZWxldGluZyBhbiBlbGVtZW50XG4gICAgICAgIHJlbW92ZUVsZW1lbnQoaW5wdXRbMF0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgIGlucHV0WzFdLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSAmJlxuICAgICAgICAgICAgaW5wdXRbM10gPT0gdHJ1ZSA6IC8vIG5ldyBpbWFnZVxuICAgICAgICAvLyB1cGRhdGUgdGhlIE1vZGVsXG4gICAgICAgIE1vZGVsLmVsZW1lbnRzLnB1c2goaW5wdXQpO1xuICAgICAgICAvLyBkcm9wIGZpbGVcbiAgICAgICAgZHJvcEZpbGUocGFnZSwgaW5wdXRbMV0sIGlucHV0WzBdKTtcbiAgICAgICAgLy8gYWRkIGJvbnVzIHRpbWVcbiAgICAgICAgYWRkdGltZSgxMDAwKTtcbiAgICAgICAgLy8gY3JpdGljIHNwZWFrXG4gICAgICAgIGNyaXRpYygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgIGlucHV0WzFdLmluY2x1ZGVzKFwiZGF0YTp0ZXh0L3BsYWluXCIpICYmXG4gICAgICAgICAgICBpbnB1dFszXSA9PSB0cnVlIDogLy8gbmV3IHRleHRcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBNb2RlbFxuICAgICAgICBNb2RlbC5lbGVtZW50cy5wdXNoKGlucHV0KTtcbiAgICAgICAgLy8gZHJvcCBmaWxlXG4gICAgICAgIGRyb3BGaWxlKHBhZ2UsIGlucHV0WzFdLCBpbnB1dFswXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAgIWlucHV0WzFdLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSAmJlxuICAgICAgICAgICAgIWlucHV0WzFdLmluY2x1ZGVzKFwiZGF0YTp0ZXh0L3BsYWluXCIpIDogLy8gbmVpdGhlciBhbiBpbWFnZSBub3IgdGV4dFxuICAgICAgICBub3RBbkltYWdlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpbnB1dCAmJiBNb2RlbC5leHBpcmVkID09IHRydWUpIHsgLy8gdG9vIGxhdGVcbiAgICBMYXRlRHJvcEZpbGUoKTtcbiAgfVxufVxuXG5cbi8vIC0tLSBDT05UUk9MTEVSXG5cbnZhciB4ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gIE1vZGVsLnRpbWVMZWZ0ID0gTW9kZWwudGltZUxlZnQgLSAxMDtcbiAgY29udHJvbGxlcihNb2RlbCk7XG59LCAxMCk7XG5cbmZ1bmN0aW9uIGFkZHRpbWUoYm9udXNUaW1lKSB7XG4gIE1vZGVsLnRpbWVMZWZ0ID0gTW9kZWwudGltZUxlZnQgKyBib251c1RpbWU7XG59XG5cbi8vIGRyb3BGaWxlXG5cbnBhZ2VzLm9uKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICQodGhpcykuYWRkQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKFwiZHJhZ2xlYXZlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xufSk7XG5wYWdlcy5vbihcImRyb3BcIiwgZnVuY3Rpb24oZSkge1xuICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnNvbGUubG9nKGUpO1xuICB2YXIgZmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzXG4gIHZhciB5ID0gMDtcbiAgZm9yICh2YXIgaSA9IGZpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICB2YXIgcGFnZUlkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG4gICAgICAvLyBpZCwgdXJsLCBzaXplLCBwb3MsIHJvdGF0aW9uPywgdmlzaWJsZVxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICBjb250cm9sbGVyKE1vZGVsLCBwYWdlSWQsIFttYWtlSWQoKSwgZXZlbnQudGFyZ2V0LnJlc3VsdCwgWzAsMCwwLDAsMF0sIHRydWVdICk7XG4gICAgICB9LCB5ICogZHJvcERlbGF5KTtcbiAgICAgIHkgKz0gMTtcbiAgICB9O1xuICAgIGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnYm9keScpLm9uKFwiZHJvcFwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgU291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudFxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jbG9zZScsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHBhZ2VJZCA9ICQodGhpcykuY2xvc2VzdCgnLnBhZ2UnKS5hdHRyKCdpZCcpO1xuICB2YXIgZWxlbWVudElkID0gJCh0aGlzKS5wYXJlbnQoKS5hdHRyKCdpZCcpO1xuICB2YXIgZWxlbWVudFNyYyA9ICQodGhpcykuc2libGluZ3MoKS5hdHRyKCdzcmMnKTtcbiAgY29udHJvbGxlcihNb2RlbCwgcGFnZUlkLCBbZWxlbWVudElkLCBlbGVtZW50U3JjLCBbMCwwLDAsMCwwXSwgZmFsc2VdKTtcbn0pO1xuXG4vLyAtLS0gVklFV1xuXG5mdW5jdGlvbiBzaG93VGltZShNb2RlbCkge1xuICBzZWNvbmRzID0gTW9kZWwudGltZUxlZnQgLyAxMDAwO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdW50ZXJcIikuaW5uZXJIVE1MID0gc2Vjb25kcy50b0ZpeGVkKDIpICsgXCIgc2Vjb25kcyBsZWZ0IVwiO1xufVxuXG5mdW5jdGlvbiBzaG93RXhwaXJlZCgpIHtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3VudGVyXCIpLmlubmVySFRNTCA9IFwiZXhwaXJlZCFcIjtcbiAgJCgnYm9keScpLmFkZENsYXNzKCdleHBpcmVkJyk7XG4gIC8vc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAvLyAgd2luZG93LnByaW50KCk7XG4gIC8vfSwgMTAwMCk7XG4gIGNsZWFySW50ZXJ2YWwoeCk7XG59XG5cbi8vIHNlbmQgY2FsbCB0byBzZXJ2ZXIgdG8gbWFrZSBwZGZcbmZ1bmN0aW9uIG1ha2VQZGYoKSB7XG4gICQuZ2V0KCAnL3BkZicsIGZ1bmN0aW9uKCBkYXRhICkge1xuICAgIGNvbnNvbGUubG9nKCAnU2VudCBjYWxsIHRvIG1ha2UgUERGLicgKTtcbiAgfSk7XG59XG5cbi8vIGNoZWNrIGlmIHBkZiBleGlzdHMgYW5kIHJlZGlyZWN0IHRvIGZpbGVcbmZ1bmN0aW9uIGNoZWNrUGRmKCkge1xuICB2YXIgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgJC5hamF4KHtcbiAgICAgIHR5cGU6ICdIRUFEJyxcbiAgICAgIHVybDogJ2Fzc2V0cy9wZGYvcHJpbnQtdGVzdC5wZGYnLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24obXNnKXtcbiAgICAgICAgYWxlcnQoJ0dvIHRvIFBERiEnKTtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh5KTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnYXNzZXRzL3BkZi9wcmludC10ZXN0LnBkZic7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bil7XG4gICAgICAgIGxvZyhqcVhIUik7XG4gICAgICAgIGxvZyhlcnJvclRocm93bik7XG4gICAgICB9XG4gICAgfSlcbiAgfSwgMTAwKTtcbn1cblxuZnVuY3Rpb24gbm90QW5JbWFnZSgpIHtcbiAgU291bmQuZXJyb3IoKTtcbiAgYWxlcnQoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIG5vdCBhbiBpbWFnZSEnKTtcbn1cblxuZnVuY3Rpb24gZHJvcEZpbGUocGFnZUlkLCBzcmMsIGlkKSB7XG4gIGlmIChzcmMuaW5jbHVkZXMoXCJkYXRhOmltYWdlXCIpKSB7XG4gICAgdmFyIHBhZ2VFbGVtZW50Q29udGVudCA9ICQoXCI8aW1nPlwiLCB7XCJzcmNcIjogc3JjfSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGRlQmFzZWRUZXh0ID0gYXRvYiggc3JjLnN1YnN0cmluZygyMykgKTtcbiAgICB2YXIgaHRtbEJyVGV4dCA9IGRlQmFzZWRUZXh0LnJlcGxhY2UoL1xcbi9nLCBcIjxici8+XCIpO1xuICAgIGNvbnNvbGUubG9nKGh0bWxCclRleHQpO1xuICAgIHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKFwiPHA+XCIpLmFwcGVuZChodG1sQnJUZXh0KTsgLy8gcmVtb3ZlIFwiZGF0YTp0ZXh0L3BsYWluO2Jhc2U2NFwiXG4gIH1cbiAgdmFyIHBhZ2VFbGVtZW50ID0gJChcIjxkaXY+XCIsIHtcImNsYXNzXCI6IFwicGFnZS1lbGVtZW50IGRyYWdnYWJsZVwifSk7XG4gIHZhciBwYWdlRWxlbWVudENsb3NlID0gJChcIjxzcGFuPlwiLCB7XCJjbGFzc1wiOiBcImNsb3NlXCJ9KS50ZXh0KCd4Jyk7XG4gIHBhZ2VFbGVtZW50LmFwcGVuZChwYWdlRWxlbWVudENvbnRlbnQsIHBhZ2VFbGVtZW50Q2xvc2UpO1xuICBwYWdlRWxlbWVudC5hdHRyKCdpZCcsIGlkKTtcbiAgJCgnIycgKyBwYWdlSWQpLmFwcGVuZChwYWdlRWxlbWVudCk7XG4gIC8vIHJlYWQgc2l6ZSwgcG9zLCByb3QgYW5kIGFkZCB0aGVtIHRvIE1vZGVsXG4gIGVsZW1lbnRQb3MgPSBbXG4gICAgcGFnZUVsZW1lbnQucG9zaXRpb24oKS5sZWZ0LFxuICAgIHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkudG9wLFxuICAgIHBhZ2VFbGVtZW50LndpZHRoKCksXG4gICAgcGFnZUVsZW1lbnQuaGVpZ2h0KCksXG4gICAgMCAvLyByb3RhdGlvbiAoVE9ETylcbiAgXTtcbiAgZm9yKHZhciBpID0gMCA7IGkgPCBNb2RlbC5lbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmIChNb2RlbC5lbGVtZW50c1tpXVswXSA9PSBpZCkge1xuICAgICAgTW9kZWwuZWxlbWVudHNbaV1bMl0gPSBlbGVtZW50UG9zO1xuICAgIH1cbiAgfVxuICBTb3VuZC5kaW5nKCk7XG59XG5cbmZ1bmN0aW9uIExhdGVEcm9wRmlsZShzcmMpIHtcbiAgYWxlcnQoJ3RvbyBsYXRlIGJybycpO1xufVxuXG5mdW5jdGlvbiBub0RyYWcoKSB7XG4gIHZhciBlbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJhZ2dhYmxlXCIpO1xuICAgIFtdLmZvckVhY2guY2FsbChlbGVtcywgZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnZ2FibGVcIik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcml0aWMoKSB7XG4gIGNyaXRpY1BvcHVwLmlubmVySFRNTCA9ICdNYWtlIHRoaXMgaW1hZ2UgYmlnZ2VyIHBscyEnO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFbGVtZW50KGlkKSB7XG4gICQoJyMnICsgaWQpLmhpZGUoKTtcbiAgY29uc29sZS5sb2coaWQpO1xufVxuXG5pbnRlcmFjdCgnLmRyYWdnYWJsZScpXG4gIC5kcmFnZ2FibGUoe1xuICAgIG9ubW92ZTogd2luZG93LmRyYWdNb3ZlTGlzdGVuZXIsXG4gICAgcmVzdHJpY3Q6IHtcbiAgICAgIHJlc3RyaWN0aW9uOiAncGFyZW50JyxcbiAgICAgIGVsZW1lbnRSZWN0OiB7XG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgYm90dG9tOiAxLFxuICAgICAgICByaWdodDogMVxuICAgICAgfVxuICAgIH0sXG4gIH0pXG4gIC5yZXNpemFibGUoe1xuICAgIC8vIHJlc2l6ZSBmcm9tIGFsbCBlZGdlcyBhbmQgY29ybmVyc1xuICAgIGVkZ2VzOiB7XG4gICAgICBsZWZ0OiB0cnVlLFxuICAgICAgcmlnaHQ6IHRydWUsXG4gICAgICBib3R0b206IHRydWUsXG4gICAgICB0b3A6IHRydWVcbiAgICB9LFxuXG4gICAgLy8ga2VlcCB0aGUgZWRnZXMgaW5zaWRlIHRoZSBwYXJlbnRcbiAgICByZXN0cmljdEVkZ2VzOiB7XG4gICAgICBvdXRlcjogJ3BhcmVudCcsXG4gICAgICBlbmRPbmx5OiB0cnVlLFxuICAgIH0sXG5cbiAgICBpbmVydGlhOiB0cnVlLFxuICB9KVxuICAub24oJ3Jlc2l6ZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQsXG4gICAgICB4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDApLFxuICAgICAgeSA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwKTtcblxuICAgIC8vIHVwZGF0ZSB0aGUgZWxlbWVudCdzIHN0eWxlXG4gICAgdGFyZ2V0LnN0eWxlLndpZHRoID0gZXZlbnQucmVjdC53aWR0aCArICdweCc7XG4gICAgdGFyZ2V0LnN0eWxlLmhlaWdodCA9IGV2ZW50LnJlY3QuaGVpZ2h0ICsgJ3B4JztcblxuICAgIC8vIHRyYW5zbGF0ZSB3aGVuIHJlc2l6aW5nIGZyb20gdG9wIG9yIGxlZnQgZWRnZXNcbiAgICB4ICs9IGV2ZW50LmRlbHRhUmVjdC5sZWZ0O1xuICAgIHkgKz0gZXZlbnQuZGVsdGFSZWN0LnRvcDtcblxuICAgIHRhcmdldC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSB0YXJnZXQuc3R5bGUudHJhbnNmb3JtID1cbiAgICAgICd0cmFuc2xhdGUoJyArIHggKyAncHgsJyArIHkgKyAncHgpJztcblxuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgpO1xuICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteScsIHkpO1xuICB9KTtcblxuZnVuY3Rpb24gZHJhZ01vdmVMaXN0ZW5lcihldmVudCkge1xuICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuICAgIC8vIGtlZXAgdGhlIGRyYWdnZWQgcG9zaXRpb24gaW4gdGhlIGRhdGEteC9kYXRhLXkgYXR0cmlidXRlc1xuICAgIHggPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMCkgKyBldmVudC5keCxcbiAgICB5ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS15JykpIHx8IDApICsgZXZlbnQuZHk7XG5cbiAgLy8gdHJhbnNsYXRlIHRoZSBlbGVtZW50XG4gIHRhcmdldC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPVxuICAgIHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPVxuICAgICd0cmFuc2xhdGUoJyArIHggKyAncHgsICcgKyB5ICsgJ3B4KSc7XG5cbiAgLy8gdXBkYXRlIHRoZSBwb3NpaW9uIGF0dHJpYnV0ZXNcbiAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG4gIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteScsIHkpO1xuXG4gIC8vIHVwZGF0ZSB6LWluZGV4XG4gIHZhciBtYXh6SW5kZXggPSAwLFxuICAgIGkgPSAwO1xuICBwYWdlRWxlbWVudHMgPSAkKCcjJyArIHRhcmdldC5pZCkucGFyZW50KCkuY2hpbGRyZW4oKTtcbiAgcGFnZUVsZW1lbnRzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgIGkgKz0gMTtcbiAgICBpZiAoICQodGhpcykuY3NzKFwiei1pbmRleFwiKSA+PSBtYXh6SW5kZXggKSB7XG4gICAgICBtYXh6SW5kZXggPSBwYXJzZUludCgkKHRoaXMpLmNzcyhcInotaW5kZXhcIikpO1xuICAgIH1cbiAgICBpZihpID09IHBhZ2VFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgIGlmICh0YXJnZXQuc3R5bGUuekluZGV4ICE9IG1heHpJbmRleCB8IHRhcmdldC5zdHlsZS56SW5kZXggPT0gMCkge1xuICAgICAgICB0YXJnZXQuc3R5bGUuekluZGV4ID0gbWF4ekluZGV4ICsgMTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICAvLyB0YXJnZXQuc3R5bGUuekluZGV4ID0gbWF4ekluZGV4ICsgMTtcbn1cblxuLy8gdGhpcyBpcyB1c2VkIGxhdGVyIGluIHRoZSByZXNpemluZyBhbmQgZ2VzdHVyZSBkZW1vc1xud2luZG93LmRyYWdNb3ZlTGlzdGVuZXIgPSBkcmFnTW92ZUxpc3RlbmVyO1xuXG5cbi8vIC8vIG1ha2UgcGRmXG4vLyB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwMScpO1xuLy8gJCgnI3AxJykuY2xpY2soZnVuY3Rpb24oKXtcbi8vICBodG1sMnBkZihlbGVtZW50LCB7XG4vLyAgICBtYXJnaW46ICAgICAgIDEsXG4vLyAgICBmaWxlbmFtZTogICAgICdteWZpbGUucGRmJyxcbi8vICAgIGltYWdlOiAgICAgICAgeyB0eXBlOiAnanBlZycsIHF1YWxpdHk6IDAuOTggfSxcbi8vICAgIGh0bWwyY2FudmFzOiAgeyBkcGk6IDcyLCBsZXR0ZXJSZW5kZXJpbmc6IHRydWUsIGhlaWdodDogMjk3MCwgd2lkdGg6IDUxMDAgfSxcbi8vICAgIGpzUERGOiAgICAgICAgeyB1bml0OiAnbW0nLCBmb3JtYXQ6ICdBNCcsIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnIH1cbi8vICB9KTtcbi8vIH0pO1xuXG5cbi8vIC0tLSBBUkNISVZFXG5cbi8vICQuYWpheCh7XG4vLyAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MjgwMTcvdGVzdFwiLFxuLy8gIHR5cGU6ICdnZXQnLFxuLy8gIGRhdGFUeXBlOiAnanNvbnAnLFxuLy8gIGpzb25wOiAnanNvbnAnLCAvLyBtb25nb2RiIGlzIGV4cGVjdGluZyB0aGF0XG4vLyAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbi8vICAgICBjb25zb2xlLmxvZygnc3VjY2VzcycsIGRhdGEpO1xuLy8gICB9LFxuLy8gICBlcnJvcjogZnVuY3Rpb24gKFhNTEh0dHBSZXF1ZXN0LCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuLy8gICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yVGhyb3duKTtcbi8vICAgfVxuLy8gfSk7XG4iLCIvLyAjY291bnRlciBmb2xsb3dzIHRoZSBtb3VzZVxuJChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSl7XG4gIGlmIChlLnBhZ2VYID49ICgkKGRvY3VtZW50KS53aWR0aCgpLzIpKSB7XG4gICAgLy8gaWYgbW91c2Ugb2YgcmlnaHQgc2lkZSBvZiBwYWdlXG4gICAgJCgnI2NvdW50ZXInKS5hZGRDbGFzcygnbW91c2VfcmlnaHQnKTtcbiAgICAkKCcjY291bnRlcicpLmNzcyh7XG4gICAgICBsZWZ0OiAgZS5wYWdlWCAtIDIwIC0gJCgnI2NvdW50ZXInKS53aWR0aCgpLFxuICAgICAgdG9wOiAgIGUucGFnZVkgKyA1MFxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIC8vIGlmIG1vdXNlIG9mIGxlZnQgc2lkZSBvZiBwYWdlXG4gICAgJCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcbiAgICAkKCcjY291bnRlcicpLmNzcyh7XG4gICAgICBsZWZ0OiAgZS5wYWdlWCArIDIwLFxuICAgICAgdG9wOiAgIGUucGFnZVkgKyA1MFxuICAgIH0pO1xuICB9XG59KTtcbiJdfQ==
