// basic fadeIn / page animation
$('body').fadeIn(600);

$(document).ready(function() {
  $('a').click( function(e) {
    e.preventDefault();
    $( "body" ).animate({
        opacity: 0,
      }, 300, function() {
        // Animation complete.
        console.log(e.currentTarget.href);
        $(location).attr('href', e.currentTarget.href);
    });
  });
});

var isFirefox = typeof InstallTrigger !== 'undefined';
if (isFirefox) {
  $('.pageNumber').hide();
}
