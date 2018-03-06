$('.wrapper').css('opacity', '0');
$('.loadingbar').css('opacity', '0');
$('#message').addClass('blink');

var allowed = true;
$( ".wrapper" ).delay(3000).animate({
    opacity: 1,
    paddingTop: "80px",
  }, 3000, function() {
    // Animation complete.
    $('#message').html('press ENTER to start');
    document.onkeydown = checkKey;
    $(document).click(function () {
      checkKey();
    })


    function checkKey() {
      if (allowed) {
        loadgame()
        allowed = false;
      }
    }
});


function loadgame() {
  $('body').css('cursor', 'wait');
  $('#message').removeClass('blink');
  $('.loadingbar').css('opacity', '1');

  setTimeout(function () {
    $('#loader').css('width', '10'+ '%');
    $('#percentage').html('10% ');
    $('#message').html('loading assets');
  }, 100);
  setTimeout(function () {
    $('#loader').css('width', '25'+ '%');
    $('#percentage').html('25% ');
    $('#message').html('creating spreads');
  }, 600);
  setTimeout(function () {
    $('#loader').css('width', '35'+ '%');
    $('#percentage').html('35% ');
    $('#message').html('waiting for content');
  }, 1200);
  setTimeout(function () {
    $('#loader').css('width', '42'+ '%');
    $('#percentage').html('42% ');
    $('#message').html('cracking Photoshop');
  }, 2200);
  setTimeout(function () {
    $('#loader').css('width', '43'+ '%');
    $('#percentage').html('43% ');
    $('#message').html('installing printer drivers');
  }, 2300);
  setTimeout(function () {
    $('#loader').css('width', '55'+ '%');
    $('#percentage').html('55% ');
    $('#message').html('buying toner');
  }, 3000);
  setTimeout(function () {
    $('#loader').css('width', '62'+ '%');
    $('#percentage').html('62% ');
    $('#message').html('folding corners');
  }, 3600);
  setTimeout(function () {
    $('#loader').css('width', '66'+ '%');
    $('#percentage').html('66% ');
    $('#message').html('clipping masks');
  }, 4300);
  setTimeout(function () {
    $('#loader').css('width', '71'+ '%');
    $('#percentage').html('71% ');
    $('#message').html('filling fills');
  }, 5000);
  setTimeout(function () {
    $('#loader').css('width', '77'+ '%');
    $('#percentage').html('77% ');
    $('#message').html('squaring borders');
  }, 5300);
  setTimeout(function () {
    $('#loader').css('width', '82'+ '%');
    $('#percentage').html('82% ');
    $('#message').html('padding pages');
  }, 6300);
  setTimeout(function () {
    $('#loader').css('width', '84'+ '%');
    $('#percentage').html('84% ');
    $('#message').html('marginalizing images');
  }, 6600);
  setTimeout(function () {
    $('#loader').css('width', '88'+ '%');
    $('#percentage').html('88% ');
    $('#message').html('submitting for review');
  }, 7000);
  setTimeout(function () {
    $('#loader').css('width', '90'+ '%');
    $('#percentage').html('90% ');
    $('#message').html('grammar checking');
  }, 7600);
  setTimeout(function () {
    $('#loader').css('width', '94'+ '%');
    $('#percentage').html('94% ');
    $('#message').html('sending out for proofing');
  }, 8000);
  setTimeout(function () {
    $('#loader').css('width', '98'+ '%');
    $('#percentage').html('98% ');
    $('#message').html('applying for funding');
  }, 9200);
  setTimeout(function () {
    $('#loader').css('width', '100'+ '%');
    $('#percentage').html('100% ');
    $('#message').html('actually writing');
  }, 10000);
  setTimeout(function () {
    $('body').css('cursor', 'auto');
    $( ".wrapper" ).animate({
        opacity: 0,
        paddingTop: "100px",
      }, 1000, function() {
        // send page to game
        $(location).attr('href', '/difficulty');
    });

  }, 12000);

  $('#loader').on('change', function () {
    console.log('change');
  })
}
