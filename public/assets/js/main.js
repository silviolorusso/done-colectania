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
      top:   e.pageY
    });
  } else {
    // if mouse of left side of page
    $('#counter').removeClass('mouse_right');
    $('#counter').css({
      left:  e.pageX + 20,
      top:   e.pageY
    });
  }

});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCJ0aW1lX2ZvbGxvd19tb3VzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gLS0tIGdsb2JhbCB2YXJpYWJsZXNcblxudmFyIHBhZ2VzID0gJCgnLnBhZ2UnKTtcbnZhciBjcml0aWNQb3B1cCA9ICQoJyNjcml0aWMnKTtcbnZhciBkcm9wRGVsYXkgPSAxMDA7XG5cbi8vIC0tLSBHRU5FUkFMIEZVTkNUSU9OU1xuXG5mdW5jdGlvbiBtYWtlSWQoKSB7XG4gIHZhciByYW5kTGV0dGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI2KSk7XG4gIHZhciBpZCA9IHJhbmRMZXR0ZXIgKyBEYXRlLm5vdygpO1xuICByZXR1cm4gaWQ7XG59XG5cbnZhciBTb3VuZCA9IHtcbiAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2luY29ycmVjdC5tcDMnKTtcbiAgICBhdWRpby5wbGF5KCk7XG4gIH0sXG4gIGRpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJyk7XG4gICAgYXVkaW8ucGxheSgpO1xuICB9XG59O1xuXG4vLyAtLS0gTS1WLUNcblxudmFyIE1vZGVsID0ge1xuICAvLyBhbGwgb3VyIHN0YXRlc1xuICB0aW1lTGVmdDogMTAwMDAwMDAwMDAwMDAwMDAwLFxuICBleHBpcmVkOiBmYWxzZSxcbiAgZWxlbWVudHM6IFtdXG59OyAvLyBhZGQgdGl0bGUsIGRhdGUgYW5kIGlkXG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXIoTW9kZWwsIHBhZ2UsIGlucHV0KSB7XG5cbiAgLy8gZXhwaXJlZD9cbiAgaWYgKE1vZGVsLnRpbWVMZWZ0ID4gMCkge1xuICAgIHNob3dUaW1lKE1vZGVsKTtcbiAgfVxuICBlbHNlIHtcbiAgICBNb2RlbC5leHBpcmVkID0gdHJ1ZVxuICAgIHNob3dFeHBpcmVkKE1vZGVsKVxuICAgIG5vRHJhZygpXG4gICAgbWFrZVBkZigpXG4gICAgY2hlY2tQZGYoKVxuICB9XG5cbiAgaWYgKGlucHV0ICYmIE1vZGVsLmV4cGlyZWQgPT0gZmFsc2UpIHtcbiAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgIGNhc2UgIGlucHV0WzNdID09IGZhbHNlIDogLy8gZGVsZXRpbmcgYW4gZWxlbWVudFxuICAgICAgICByZW1vdmVFbGVtZW50KGlucHV0WzBdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICBpbnB1dFsxXS5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikgJiZcbiAgICAgICAgICAgIGlucHV0WzNdID09IHRydWUgOiAvLyBuZXcgaW1hZ2VcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBNb2RlbFxuICAgICAgICBNb2RlbC5lbGVtZW50cy5wdXNoKGlucHV0KTtcbiAgICAgICAgLy8gZHJvcCBmaWxlXG4gICAgICAgIGRyb3BGaWxlKHBhZ2UsIGlucHV0WzFdLCBpbnB1dFswXSk7XG4gICAgICAgIC8vIGFkZCBib251cyB0aW1lXG4gICAgICAgIGFkZHRpbWUoMTAwMCk7XG4gICAgICAgIC8vIGNyaXRpYyBzcGVha1xuICAgICAgICBjcml0aWMoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICBpbnB1dFsxXS5pbmNsdWRlcyhcImRhdGE6dGV4dC9wbGFpblwiKSAmJlxuICAgICAgICAgICAgaW5wdXRbM10gPT0gdHJ1ZSA6IC8vIG5ldyB0ZXh0XG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgTW9kZWxcbiAgICAgICAgTW9kZWwuZWxlbWVudHMucHVzaChpbnB1dCk7XG4gICAgICAgIC8vIGRyb3AgZmlsZVxuICAgICAgICBkcm9wRmlsZShwYWdlLCBpbnB1dFsxXSwgaW5wdXRbMF0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgICFpbnB1dFsxXS5pbmNsdWRlcyhcImRhdGE6aW1hZ2VcIikgJiZcbiAgICAgICAgICAgICFpbnB1dFsxXS5pbmNsdWRlcyhcImRhdGE6dGV4dC9wbGFpblwiKSA6IC8vIG5laXRoZXIgYW4gaW1hZ2Ugbm9yIHRleHRcbiAgICAgICAgbm90QW5JbWFnZSgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0gZWxzZSBpZiAoaW5wdXQgJiYgTW9kZWwuZXhwaXJlZCA9PSB0cnVlKSB7IC8vIHRvbyBsYXRlXG4gICAgTGF0ZURyb3BGaWxlKCk7XG4gIH1cbn1cblxuXG4vLyAtLS0gQ09OVFJPTExFUlxuXG52YXIgeCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICBNb2RlbC50aW1lTGVmdCA9IE1vZGVsLnRpbWVMZWZ0IC0gMTA7XG4gIGNvbnRyb2xsZXIoTW9kZWwpO1xufSwgMTApO1xuXG5mdW5jdGlvbiBhZGR0aW1lKGJvbnVzVGltZSkge1xuICBNb2RlbC50aW1lTGVmdCA9IE1vZGVsLnRpbWVMZWZ0ICsgYm9udXNUaW1lO1xufVxuXG4vLyBkcm9wRmlsZVxuXG5wYWdlcy5vbihcImRyYWdvdmVyXCIsIGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkKHRoaXMpLmFkZENsYXNzKCdkcmFnb3ZlcicpO1xufSk7XG5wYWdlcy5vbihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJCh0aGlzKS5yZW1vdmVDbGFzcygnZHJhZ292ZXInKTtcbn0pO1xucGFnZXMub24oXCJkcm9wXCIsIGZ1bmN0aW9uKGUpIHtcbiAgJCh0aGlzKS5yZW1vdmVDbGFzcygnZHJhZ292ZXInKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zb2xlLmxvZyhlKTtcbiAgdmFyIGZpbGVzID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5maWxlc1xuICB2YXIgeSA9IDA7XG4gIGZvciAodmFyIGkgPSBmaWxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgdmFyIHBhZ2VJZCA9ICQodGhpcykuYXR0cignaWQnKTtcbiAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xuICAgICAgLy8gaWQsIHVybCwgc2l6ZSwgcG9zLCByb3RhdGlvbj8sIHZpc2libGVcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgY29udHJvbGxlcihNb2RlbCwgcGFnZUlkLCBbbWFrZUlkKCksIGV2ZW50LnRhcmdldC5yZXN1bHQsIFswLDAsMCwwLDBdLCB0cnVlXSApO1xuICAgICAgfSwgeSAqIGRyb3BEZWxheSk7XG4gICAgICB5ICs9IDE7XG4gICAgfTtcbiAgICBjb25zb2xlLmxvZyhmaWxlc1tpXSk7XG4gICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZXNbaV0pO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn0pO1xuLy8gcHJldmVudCBkcm9wIG9uIGJvZHlcbiQoJ2JvZHknKS5vbihcImRyYWdvdmVyXCIsIGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oXCJkcmFnbGVhdmVcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbihcImRyb3BcIiwgZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIFNvdW5kLmVycm9yKCk7XG59KTtcblxuLy8gcmVtb3ZlIGVsZW1lbnRcbiQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuY2xvc2UnLCBmdW5jdGlvbiAoKSB7XG4gIHZhciBwYWdlSWQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykuYXR0cignaWQnKTtcbiAgdmFyIGVsZW1lbnRJZCA9ICQodGhpcykucGFyZW50KCkuYXR0cignaWQnKTtcbiAgdmFyIGVsZW1lbnRTcmMgPSAkKHRoaXMpLnNpYmxpbmdzKCkuYXR0cignc3JjJyk7XG4gIGNvbnRyb2xsZXIoTW9kZWwsIHBhZ2VJZCwgW2VsZW1lbnRJZCwgZWxlbWVudFNyYywgWzAsMCwwLDAsMF0sIGZhbHNlXSk7XG59KTtcblxuLy8gLS0tIFZJRVdcblxuZnVuY3Rpb24gc2hvd1RpbWUoTW9kZWwpIHtcbiAgc2Vjb25kcyA9IE1vZGVsLnRpbWVMZWZ0IC8gMTAwMDtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3VudGVyXCIpLmlubmVySFRNTCA9IHNlY29uZHMudG9GaXhlZCgyKSArIFwiIHNlY29uZHMgbGVmdCFcIjtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY291bnRlclwiKS5pbm5lckhUTUwgPSBcImV4cGlyZWQhXCI7XG4gICQoJ2JvZHknKS5hZGRDbGFzcygnZXhwaXJlZCcpO1xuICAvL3NldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgLy8gIHdpbmRvdy5wcmludCgpO1xuICAvL30sIDEwMDApO1xuICBjbGVhckludGVydmFsKHgpO1xufVxuXG4vLyBzZW5kIGNhbGwgdG8gc2VydmVyIHRvIG1ha2UgcGRmXG5mdW5jdGlvbiBtYWtlUGRmKCkge1xuICAkLmdldCggJy9wZGYnLCBmdW5jdGlvbiggZGF0YSApIHtcbiAgICBjb25zb2xlLmxvZyggJ1NlbnQgY2FsbCB0byBtYWtlIFBERi4nICk7XG4gIH0pO1xufVxuXG4vLyBjaGVjayBpZiBwZGYgZXhpc3RzIGFuZCByZWRpcmVjdCB0byBmaWxlXG5mdW5jdGlvbiBjaGVja1BkZigpIHtcbiAgdmFyIHkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiAnSEVBRCcsXG4gICAgICB1cmw6ICdhc3NldHMvcGRmL3ByaW50LXRlc3QucGRmJyxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKG1zZyl7XG4gICAgICAgIGFsZXJ0KCdHbyB0byBQREYhJyk7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoeSk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJ2Fzc2V0cy9wZGYvcHJpbnQtdGVzdC5wZGYnO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbihqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pe1xuICAgICAgICBsb2coanFYSFIpO1xuICAgICAgICBsb2coZXJyb3JUaHJvd24pO1xuICAgICAgfVxuICAgIH0pXG4gIH0sIDEwMCk7XG59XG5cbmZ1bmN0aW9uIG5vdEFuSW1hZ2UoKSB7XG4gIFNvdW5kLmVycm9yKCk7XG4gIGFsZXJ0KCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyBub3QgYW4gaW1hZ2UhJyk7XG59XG5cbmZ1bmN0aW9uIGRyb3BGaWxlKHBhZ2VJZCwgc3JjLCBpZCkge1xuICBpZiAoc3JjLmluY2x1ZGVzKFwiZGF0YTppbWFnZVwiKSkge1xuICAgIHZhciBwYWdlRWxlbWVudENvbnRlbnQgPSAkKFwiPGltZz5cIiwge1wic3JjXCI6IHNyY30pO1xuICB9IGVsc2Uge1xuICAgIHZhciBkZUJhc2VkVGV4dCA9IGF0b2IoIHNyYy5zdWJzdHJpbmcoMjMpICk7XG4gICAgdmFyIGh0bWxCclRleHQgPSBkZUJhc2VkVGV4dC5yZXBsYWNlKC9cXG4vZywgXCI8YnIvPlwiKTtcbiAgICBjb25zb2xlLmxvZyhodG1sQnJUZXh0KTtcbiAgICB2YXIgcGFnZUVsZW1lbnRDb250ZW50ID0gJChcIjxwPlwiKS5hcHBlbmQoaHRtbEJyVGV4dCk7IC8vIHJlbW92ZSBcImRhdGE6dGV4dC9wbGFpbjtiYXNlNjRcIlxuICB9XG4gIHZhciBwYWdlRWxlbWVudCA9ICQoXCI8ZGl2PlwiLCB7XCJjbGFzc1wiOiBcInBhZ2UtZWxlbWVudCBkcmFnZ2FibGVcIn0pO1xuICB2YXIgcGFnZUVsZW1lbnRDbG9zZSA9ICQoXCI8c3Bhbj5cIiwge1wiY2xhc3NcIjogXCJjbG9zZVwifSkudGV4dCgneCcpO1xuICBwYWdlRWxlbWVudC5hcHBlbmQocGFnZUVsZW1lbnRDb250ZW50LCBwYWdlRWxlbWVudENsb3NlKTtcbiAgcGFnZUVsZW1lbnQuYXR0cignaWQnLCBpZCk7XG4gICQoJyMnICsgcGFnZUlkKS5hcHBlbmQocGFnZUVsZW1lbnQpO1xuICAvLyByZWFkIHNpemUsIHBvcywgcm90IGFuZCBhZGQgdGhlbSB0byBNb2RlbFxuICBlbGVtZW50UG9zID0gW1xuICAgIHBhZ2VFbGVtZW50LnBvc2l0aW9uKCkubGVmdCxcbiAgICBwYWdlRWxlbWVudC5wb3NpdGlvbigpLnRvcCxcbiAgICBwYWdlRWxlbWVudC53aWR0aCgpLFxuICAgIHBhZ2VFbGVtZW50LmhlaWdodCgpLFxuICAgIDAgLy8gcm90YXRpb24gKFRPRE8pXG4gIF07XG4gIGZvcih2YXIgaSA9IDAgOyBpIDwgTW9kZWwuZWxlbWVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAoTW9kZWwuZWxlbWVudHNbaV1bMF0gPT0gaWQpIHtcbiAgICAgIE1vZGVsLmVsZW1lbnRzW2ldWzJdID0gZWxlbWVudFBvcztcbiAgICB9XG4gIH1cbiAgU291bmQuZGluZygpO1xufVxuXG5mdW5jdGlvbiBMYXRlRHJvcEZpbGUoc3JjKSB7XG4gIGFsZXJ0KCd0b28gbGF0ZSBicm8nKTtcbn1cblxuZnVuY3Rpb24gbm9EcmFnKCkge1xuICB2YXIgZWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyYWdnYWJsZVwiKTtcbiAgICBbXS5mb3JFYWNoLmNhbGwoZWxlbXMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJhZ2dhYmxlXCIpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JpdGljKCkge1xuICBjcml0aWNQb3B1cC5pbm5lckhUTUwgPSAnTWFrZSB0aGlzIGltYWdlIGJpZ2dlciBwbHMhJztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRWxlbWVudChpZCkge1xuICAkKCcjJyArIGlkKS5oaWRlKCk7XG4gIGNvbnNvbGUubG9nKGlkKTtcbn1cblxuaW50ZXJhY3QoJy5kcmFnZ2FibGUnKVxuICAuZHJhZ2dhYmxlKHtcbiAgICBvbm1vdmU6IHdpbmRvdy5kcmFnTW92ZUxpc3RlbmVyLFxuICAgIHJlc3RyaWN0OiB7XG4gICAgICByZXN0cmljdGlvbjogJ3BhcmVudCcsXG4gICAgICBlbGVtZW50UmVjdDoge1xuICAgICAgICB0b3A6IDAsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIGJvdHRvbTogMSxcbiAgICAgICAgcmlnaHQ6IDFcbiAgICAgIH1cbiAgICB9LFxuICB9KVxuICAucmVzaXphYmxlKHtcbiAgICAvLyByZXNpemUgZnJvbSBhbGwgZWRnZXMgYW5kIGNvcm5lcnNcbiAgICBlZGdlczoge1xuICAgICAgbGVmdDogdHJ1ZSxcbiAgICAgIHJpZ2h0OiB0cnVlLFxuICAgICAgYm90dG9tOiB0cnVlLFxuICAgICAgdG9wOiB0cnVlXG4gICAgfSxcblxuICAgIC8vIGtlZXAgdGhlIGVkZ2VzIGluc2lkZSB0aGUgcGFyZW50XG4gICAgcmVzdHJpY3RFZGdlczoge1xuICAgICAgb3V0ZXI6ICdwYXJlbnQnLFxuICAgICAgZW5kT25seTogdHJ1ZSxcbiAgICB9LFxuXG4gICAgaW5lcnRpYTogdHJ1ZSxcbiAgfSlcbiAgLm9uKCdyZXNpemVtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuICAgICAgeCA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteCcpKSB8fCAwKSxcbiAgICAgIHkgPSAocGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXknKSkgfHwgMCk7XG5cbiAgICAvLyB1cGRhdGUgdGhlIGVsZW1lbnQncyBzdHlsZVxuICAgIHRhcmdldC5zdHlsZS53aWR0aCA9IGV2ZW50LnJlY3Qud2lkdGggKyAncHgnO1xuICAgIHRhcmdldC5zdHlsZS5oZWlnaHQgPSBldmVudC5yZWN0LmhlaWdodCArICdweCc7XG5cbiAgICAvLyB0cmFuc2xhdGUgd2hlbiByZXNpemluZyBmcm9tIHRvcCBvciBsZWZ0IGVkZ2VzXG4gICAgeCArPSBldmVudC5kZWx0YVJlY3QubGVmdDtcbiAgICB5ICs9IGV2ZW50LmRlbHRhUmVjdC50b3A7XG5cbiAgICB0YXJnZXQuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gdGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9XG4gICAgICAndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCcgKyB5ICsgJ3B4KSc7XG5cbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KTtcbiAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KTtcbiAgfSk7XG5cbmZ1bmN0aW9uIGRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpIHtcbiAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcbiAgICAvLyBrZWVwIHRoZSBkcmFnZ2VkIHBvc2l0aW9uIGluIHRoZSBkYXRhLXgvZGF0YS15IGF0dHJpYnV0ZXNcbiAgICB4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDApICsgZXZlbnQuZHgsXG4gICAgeSA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwKSArIGV2ZW50LmR5O1xuXG4gIC8vIHRyYW5zbGF0ZSB0aGUgZWxlbWVudFxuICB0YXJnZXQuc3R5bGUud2Via2l0VHJhbnNmb3JtID1cbiAgICB0YXJnZXQuc3R5bGUudHJhbnNmb3JtID1cbiAgICAndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCAnICsgeSArICdweCknO1xuXG4gIC8vIHVwZGF0ZSB0aGUgcG9zaWlvbiBhdHRyaWJ1dGVzXG4gIHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteCcsIHgpO1xuICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXknLCB5KTtcblxuICAvLyB1cGRhdGUgei1pbmRleFxuICB2YXIgbWF4ekluZGV4ID0gMCxcbiAgICBpID0gMDtcbiAgcGFnZUVsZW1lbnRzID0gJCgnIycgKyB0YXJnZXQuaWQpLnBhcmVudCgpLmNoaWxkcmVuKCk7XG4gIHBhZ2VFbGVtZW50cy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICBpICs9IDE7XG4gICAgaWYgKCAkKHRoaXMpLmNzcyhcInotaW5kZXhcIikgPj0gbWF4ekluZGV4ICkge1xuICAgICAgbWF4ekluZGV4ID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoXCJ6LWluZGV4XCIpKTtcbiAgICB9XG4gICAgaWYoaSA9PSBwYWdlRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICBpZiAodGFyZ2V0LnN0eWxlLnpJbmRleCAhPSBtYXh6SW5kZXggfCB0YXJnZXQuc3R5bGUuekluZGV4ID09IDApIHtcbiAgICAgICAgdGFyZ2V0LnN0eWxlLnpJbmRleCA9IG1heHpJbmRleCArIDE7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgLy8gdGFyZ2V0LnN0eWxlLnpJbmRleCA9IG1heHpJbmRleCArIDE7XG59XG5cbi8vIHRoaXMgaXMgdXNlZCBsYXRlciBpbiB0aGUgcmVzaXppbmcgYW5kIGdlc3R1cmUgZGVtb3NcbndpbmRvdy5kcmFnTW92ZUxpc3RlbmVyID0gZHJhZ01vdmVMaXN0ZW5lcjtcblxuXG4vLyAvLyBtYWtlIHBkZlxuLy8gdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncDEnKTtcbi8vICQoJyNwMScpLmNsaWNrKGZ1bmN0aW9uKCl7XG4vLyAgaHRtbDJwZGYoZWxlbWVudCwge1xuLy8gICAgbWFyZ2luOiAgICAgICAxLFxuLy8gICAgZmlsZW5hbWU6ICAgICAnbXlmaWxlLnBkZicsXG4vLyAgICBpbWFnZTogICAgICAgIHsgdHlwZTogJ2pwZWcnLCBxdWFsaXR5OiAwLjk4IH0sXG4vLyAgICBodG1sMmNhbnZhczogIHsgZHBpOiA3MiwgbGV0dGVyUmVuZGVyaW5nOiB0cnVlLCBoZWlnaHQ6IDI5NzAsIHdpZHRoOiA1MTAwIH0sXG4vLyAgICBqc1BERjogICAgICAgIHsgdW5pdDogJ21tJywgZm9ybWF0OiAnQTQnLCBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyB9XG4vLyAgfSk7XG4vLyB9KTtcblxuXG4vLyAtLS0gQVJDSElWRVxuXG4vLyAkLmFqYXgoe1xuLy8gIHVybDogXCJodHRwOi8vbG9jYWxob3N0OjI4MDE3L3Rlc3RcIixcbi8vICB0eXBlOiAnZ2V0Jyxcbi8vICBkYXRhVHlwZTogJ2pzb25wJyxcbi8vICBqc29ucDogJ2pzb25wJywgLy8gbW9uZ29kYiBpcyBleHBlY3RpbmcgdGhhdFxuLy8gIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XG4vLyAgICAgY29uc29sZS5sb2coJ3N1Y2Nlc3MnLCBkYXRhKTtcbi8vICAgfSxcbi8vICAgZXJyb3I6IGZ1bmN0aW9uIChYTUxIdHRwUmVxdWVzdCwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcbi8vICAgICBjb25zb2xlLmxvZygnZXJyb3InLCBlcnJvclRocm93bik7XG4vLyAgIH1cbi8vIH0pO1xuIiwiLy8gI2NvdW50ZXIgZm9sbG93cyB0aGUgbW91c2VcbiQoZG9jdW1lbnQpLmJpbmQoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpe1xuICBpZiAoZS5wYWdlWCA+PSAoJChkb2N1bWVudCkud2lkdGgoKS8yKSkge1xuICAgIC8vIGlmIG1vdXNlIG9mIHJpZ2h0IHNpZGUgb2YgcGFnZVxuICAgICQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG4gICAgJCgnI2NvdW50ZXInKS5jc3Moe1xuICAgICAgbGVmdDogIGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcbiAgICAgIHRvcDogICBlLnBhZ2VZXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gaWYgbW91c2Ugb2YgbGVmdCBzaWRlIG9mIHBhZ2VcbiAgICAkKCcjY291bnRlcicpLnJlbW92ZUNsYXNzKCdtb3VzZV9yaWdodCcpO1xuICAgICQoJyNjb3VudGVyJykuY3NzKHtcbiAgICAgIGxlZnQ6ICBlLnBhZ2VYICsgMjAsXG4gICAgICB0b3A6ICAgZS5wYWdlWVxuICAgIH0pO1xuICB9XG5cbn0pO1xuIl19
