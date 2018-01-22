

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
