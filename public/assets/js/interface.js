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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJpbnRlcmZhY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gYmFzaWMgZmFkZUluIC8gcGFnZSBhbmltYXRpb25cbiQoJ2JvZHknKS5mYWRlSW4oNjAwKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICQoJ2EnKS5jbGljayggZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCBcImJvZHlcIiApLmFuaW1hdGUoe1xuICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgfSwgMzAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICAgICAgICBjb25zb2xlLmxvZyhlLmN1cnJlbnRUYXJnZXQuaHJlZik7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCBlLmN1cnJlbnRUYXJnZXQuaHJlZik7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXSwiZmlsZSI6ImludGVyZmFjZS5qcyJ9
