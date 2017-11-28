// --- TIMER
var expired = false;

function timer() {
  var period = 10000;
  var x = setInterval(function() {
    seconds = period/1000;
    document.getElementById("counter").innerHTML = seconds.toFixed(2) + " seconds left!";

    // expiration    
    if (period < 0) {
      clearInterval(x);
      document.getElementById("counter").innerHTML = "EXPIRED";
      expired = true;

      // call to all views
      drag();
    }
    period = period - 10;
  }, 10);
}
timer();


// --- FILE DROP

var holder = document.getElementById('page')

if (typeof window.FileReader === 'undefined') {
  console.log('fail');
} else {
  console.log('success');
}
 
holder.ondragover = function () { this.className = 'hover'; return false; };
holder.ondragend = function () { this.className = ''; return false; };
holder.ondrop = function (e) {
  this.className = '';
  e.preventDefault();

  if (expired == false) {
    var file = e.dataTransfer.files[0], 
        reader = new FileReader();
    reader.onload = function (event) {
      console.log(event.target);
      var img = document.createElement("img"); 
      img.className += " draggable"; 
      img.src = event.target.result;
      holder.appendChild(img);
    };
    console.log(file);
    reader.readAsDataURL(file);
  }

  return false;
};

// --- DRAG 
interact('.draggable')
  .draggable({
    onmove: window.dragMoveListener,
    restrict: {
      restriction: 'parent',
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
  })
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    // keep the edges inside the parent
    restrictEdges: {
      outer: 'parent',
      endOnly: true,
    },

    inertia: true,
  })
  .on('resizemove', function (event) {
    var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

    // update the element's style
    target.style.width  = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';

    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
  });

  function dragMoveListener (event) {
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
  }

  // this is used later in the resizing and gesture demos
  window.dragMoveListener = dragMoveListener;

// target elements with the "draggable" class
function drag() {
  if (expired == true) {
    var elems = document.querySelectorAll(".draggable");
    [].forEach.call(elems, function(el) {
      el.classList.remove("draggable");
    });
  }
}
drag();