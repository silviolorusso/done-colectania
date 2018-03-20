function savedState() {
  var s = document.getElementsByClassName('spread');
  $('.spread').hide();
  $('.spread').first().show()

  var count = 0;
  $('.spread').click(function () {
  });

  $('.page').click(function (e) {
    var num = $('.page').index(this);
    if (num%2 === 0) {
      s[count].style.display = 'none';
      count++;
      s[count].style.display = 'block';
    } else {
      s[count].style.display = 'none';
      count--;
      s[count].style.display = 'block';
    }
    sfx.browse()
  });
}

// load only when div has saved_view class
if ($('div').hasClass('saved_view')) {
  savedState()
}

function expiredTime() {
  $('body').append('<div id="overlay_flash"><h1>You Perished</h1></div>');
  $('#overlay_flash').height($(window).height());
  setTimeout(function () {
    $('#overlay_flash').css('top','unset');
    $('#overlay_flash').css('bottom','0');
    $('#overlay_flash').height(0);
  }, 1000);
}

function updateMouseCounter(e) {
  if (getUrlParameter('demo')) {
    // don't show conter
    $('.counter').hide();
  } else {
    $('.counter').css('opacity', '1');
    if (e.clientX >= 200) { // ($(document).width()/2)
      // if mouse of right side of client
      $('.counter').addClass('mouse_right');
      $('.counter').css({
        left:  e.clientX - 20 - $('.counter').width(),
        top:   e.clientY - 50
      });
    } else {
      // if mouse of left side of client
      $('.counter').removeClass('mouse_right');
      $('.counter').css({
        left:  e.clientX + 20,
        top:   e.clientY - 50
      });
    }
  }
}

$(document).bind('mousemove', function(e){
  updateMouseCounter(e);
});

$(document).bind("dragover", function(e){
  updateMouseCounter(e);
});


function criticSays(message, actor) {
	var messageArray = [
    "DOPE!",
    "Wow... that looks like contemporary art",
    "👌  Great job",
    "It took you a while...",
    "Come on!",
    "This is what I call 'performative'!",
    "Xerox it!",
    "Publish Publish Publish",
    "Shake that layout"
  ]
	if (message === undefined) {
		// choose a random default one
		var message = messageArray[randomNum(messageArray.length)]
	}

	var actorArray = [
    "Clippy",
    "Gutenberg",
    "McLuhan",
    "Manutius",
    "Mergenthaler",
    "Morris",
    'Eisenstein',
    'Ong',
    'Drucker',
    'Hayles'
  ]
	if (actor === undefined) {
		// choose a random default one
		var actor = actorArray[randomNum(actorArray.length)]
	}


	var messageHTML = $('<div class="comment"><div class="message">' + actor + ': ' + message + '</div><div class="image"><img src="assets/img/critic/' + actor + '.jpg"></div></div>');
	messageHTML.css('opacity', '0');
	messageHTML.hide();
	$('.suggestions').append(messageHTML)
	messageHTML.show();
	messageHTML.css('left', '-100px');
	messageHTML.animate({
		opacity: 1,
		left: "0px",
	}, 500, function() {
		// Animation complete.
		setTimeout(function() {
			messageHTML.animate({
				opacity: 0,
				left: "-100px",
			}, 500, function() {
				// Animation complete.
				messageHTML.remove()
			});
		}, 6000);
	});
}

function randomNum(max) {
	max = max - 1;
	var num = Math.round(Math.random() * (max - 0) + 0);
	return num
	// TODO: Not allowing duplicate messages
}


function alertMessage(message) {
  var messageArray = [
    "default alert message",
  ]
  if (message === undefined) {
    // if no message choose a random default one
    var message = messageArray[randomNum(messageArray.length)]
  }

  var messageHTML = $('<div class="alert draggable"><div class="topbar draggable-handler"><span class="title">Error</span></div><img class="close closeAlert" src="/assets/img/x.png" /><h2 class="alertTitle">Alert</h2><div class="alertMessage">' + message + '</div><div class="buttons"><div class="button closeAlert">Continue</div></div></div>');
  $('body').append(messageHTML)
  messageHTML.show();
  // createjs.Sound.play("beep")
	messageHTML.css('left', ((window.innerWidth/2) - (350/2)) +'px');
  messageHTML.css('top', (window.innerHeight/2-150) +'px');
}

var zindex = 100;
$(document).on('mousedown', ".draggable-handler", function(e) {
  drag = $(this).closest('.draggable')
  drag.addClass('dragging')
  drag.css('z-index', zindex)
  zindex++
  drag.css('left', e.clientX-$(this).width()/2)
  drag.css('top', e.clientY-$(this).height()/2 - 10)
  $(this).on('mousemove', function(e){
    drag.css('left', e.clientX-$(this).width()/2)
    drag.css('top', e.clientY-$(this).height()/2 - 10)
    window.getSelection().removeAllRanges()
  })
});

$(document).on('mouseleave', ".draggable-handler", function(e) {
  stopDragging();
});

$(document).on('mouseup', ".draggable-handler", function(e) {
  stopDragging();
});

function stopDragging(){
  drag = $(this).closest('.draggable')
  drag.removeClass('dragging')
  $(this).off('mousemove')
}

$(document).on('click', ".closeAlert", function() {
    $(this).closest('.alert').remove();
});

function achievement(time_added, txt) {

  // TODO: add actual time to counter

	var coin = '<div id="tridiv"> <div class="scene" > <div class="shape cylinder-1 cyl-1"> <div class="face bm"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.145);"></div> </div> <div class="face tp"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.145);"></div> </div> <div class="face side s0"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.145);"></div> </div> <div class="face side s1"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.145);"></div> </div> <div class="face side s2"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.14);"></div> </div> <div class="face side s3"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.14);"></div> </div> <div class="face side s4"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.137);"></div> </div> <div class="face side s5"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.137);"></div> </div> <div class="face side s6"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.137);"></div> </div> <div class="face side s7"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.137);"></div> </div> <div class="face side s8"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.137);"></div> </div> <div class="face side s9"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.133);"></div> </div> <div class="face side s10"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.133);"></div> </div> <div class="face side s11"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.133);"></div> </div> <div class="face side s12"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.133);"></div> </div> <div class="face side s13"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.137);"></div> </div> <div class="face side s14"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.137);"></div> </div> <div class="face side s15"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.137);"></div> </div> <div class="face side s16"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.137);"></div> </div> <div class="face side s17"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.137);"></div> </div> <div class="face side s18"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.14);"></div> </div> <div class="face side s19"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.14);"></div> </div> <div class="face side s20"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.14);"></div> </div> <div class="face side s21"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.145);"></div> </div> <div class="face side s22"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.145);"></div> </div> <div class="face side s23"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.15);"></div> </div> <div class="face side s24"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.15);"></div> </div> <div class="face side s25"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.153);"></div> </div> <div class="face side s26"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.157);"></div> </div> <div class="face side s27"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.157);"></div> </div> <div class="face side s28"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.16);"></div> </div> <div class="face side s29"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.165);"></div> </div> <div class="face side s30"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.17);"></div> </div> <div class="face side s31"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.17);"></div> </div> <div class="face side s32"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.173);"></div> </div> <div class="face side s33"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.176);"></div> </div> <div class="face side s34"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.18);"></div> </div> <div class="face side s35"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.184);"></div> </div> <div class="face side s36"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.19);"></div> </div> <div class="face side s37"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.192);"></div> </div> <div class="face side s38"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.196);"></div> </div> <div class="face side s39"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.2);"></div> </div> <div class="face side s40"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.204);"></div> </div> <div class="face side s41"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.208);"></div> </div> <div class="face side s42"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.21);"></div> </div> <div class="face side s43"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.216);"></div> </div> <div class="face side s44"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.22);"></div> </div> <div class="face side s45"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.227);"></div> </div> <div class="face side s46"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.23);"></div> </div> <div class="face side s47"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.235);"></div> </div> <div class="face side s48"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.24);"></div> </div> <div class="face side s49"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.243);"></div> </div> <div class="face side s50"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.247);"></div> </div> <div class="face side s51"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.255);"></div> </div> <div class="face side s52"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.26);"></div> </div> <div class="face side s53"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.263);"></div> </div> <div class="face side s54"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.267);"></div> </div> <div class="face side s55"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.275);"></div> </div> <div class="face side s56"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.28);"></div> </div> <div class="face side s57"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.282);"></div> </div> <div class="face side s58"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.286);"></div> </div> <div class="face side s59"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.29);"></div> </div> <div class="face side s60"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.298);"></div> </div> <div class="face side s61"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.3);"></div> </div> <div class="face side s62"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.306);"></div> </div> <div class="face side s63"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.31);"></div> </div> <div class="face side s64"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.318);"></div> </div> <div class="face side s65"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.32);"></div> </div> <div class="face side s66"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.325);"></div> </div> <div class="face side s67"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.33);"></div> </div> <div class="face side s68"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.337);"></div> </div> <div class="face side s69"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.34);"></div> </div> <div class="face side s70"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.345);"></div> </div> <div class="face side s71"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.35);"></div> </div> <div class="face side s72"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.357);"></div> </div> <div class="face side s73"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.36);"></div> </div> <div class="face side s74"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.365);"></div> </div> <div class="face side s75"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.37);"></div> </div> <div class="face side s76"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.373);"></div> </div> <div class="face side s77"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.376);"></div> </div> <div class="face side s78"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.38);"></div> </div> <div class="face side s79"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.39);"></div> </div> <div class="face side s80"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.392);"></div> </div> <div class="face side s81"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.396);"></div> </div> <div class="face side s82"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.4);"></div> </div> <div class="face side s83"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.404);"></div> </div> <div class="face side s84"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.408);"></div> </div> <div class="face side s85"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.41);"></div> </div> <div class="face side s86"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.416);"></div> </div> <div class="face side s87"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.42);"></div> </div> <div class="face side s88"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.424);"></div> </div> <div class="face side s89"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.424);"></div> </div> <div class="face side s90"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.427);"></div> </div> <div class="face side s91"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.43);"></div> </div> <div class="face side s92"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.435);"></div> </div> <div class="face side s93"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.44);"></div> </div> <div class="face side s94"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.44);"></div> </div> <div class="face side s95"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.443);"></div> </div> <div class="face side s96"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.447);"></div> </div> <div class="face side s97"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.447);"></div> </div> <div class="face side s98"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.45);"></div> </div> <div class="face side s99"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.45);"></div> </div> <div class="face side s100"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.455);"></div> </div> <div class="face side s101"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.455);"></div> </div> <div class="face side s102"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.46);"></div> </div> <div class="face side s103"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.46);"></div> </div> <div class="face side s104"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.463);"></div> </div> <div class="face side s105"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.463);"></div> </div> <div class="face side s106"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.463);"></div> </div> <div class="face side s107"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.463);"></div> </div> <div class="face side s108"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.463);"></div> </div> <div class="face side s109"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.467);"></div> </div> <div class="face side s110"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.467);"></div> </div> <div class="face side s111"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.467);"></div> </div> <div class="face side s112"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.467);"></div> </div> <div class="face side s113"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.463);"></div> </div> <div class="face side s114"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.463);"></div> </div> <div class="face side s115"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.463);"></div> </div> <div class="face side s116"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.463);"></div> </div> <div class="face side s117"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.463);"></div> </div> <div class="face side s118"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.46);"></div> </div> <div class="face side s119"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.46);"></div> </div> <div class="face side s120"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.46);"></div> </div> <div class="face side s121"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.455);"></div> </div> <div class="face side s122"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.455);"></div> </div> <div class="face side s123"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.45);"></div> </div> <div class="face side s124"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.45);"></div> </div> <div class="face side s125"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.447);"></div> </div> <div class="face side s126"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.443);"></div> </div> <div class="face side s127"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.443);"></div> </div> <div class="face side s128"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.44);"></div> </div> <div class="face side s129"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.435);"></div> </div> <div class="face side s130"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.43);"></div> </div> <div class="face side s131"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.43);"></div> </div> <div class="face side s132"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.427);"></div> </div> <div class="face side s133"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.424);"></div> </div> <div class="face side s134"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.42);"></div> </div> <div class="face side s135"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.416);"></div> </div> <div class="face side s136"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.41);"></div> </div> <div class="face side s137"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.408);"></div> </div> <div class="face side s138"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.404);"></div> </div> <div class="face side s139"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.4);"></div> </div> <div class="face side s140"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.396);"></div> </div> <div class="face side s141"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.392);"></div> </div> <div class="face side s142"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.39);"></div> </div> <div class="face side s143"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.384);"></div> </div> <div class="face side s144"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.38);"></div> </div> <div class="face side s145"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.373);"></div> </div> <div class="face side s146"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.37);"></div> </div> <div class="face side s147"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.365);"></div> </div> <div class="face side s148"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.36);"></div> </div> <div class="face side s149"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.357);"></div> </div> <div class="face side s150"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.353);"></div> </div> <div class="face side s151"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.345);"></div> </div> <div class="face side s152"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.34);"></div> </div> <div class="face side s153"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.337);"></div> </div> <div class="face side s154"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.333);"></div> </div> <div class="face side s155"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.325);"></div> </div> <div class="face side s156"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.32);"></div> </div> <div class="face side s157"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.318);"></div> </div> <div class="face side s158"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.314);"></div> </div> <div class="face side s159"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.31);"></div> </div> <div class="face side s160"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.3);"></div> </div> <div class="face side s161"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.298);"></div> </div> <div class="face side s162"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.294);"></div> </div> <div class="face side s163"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.29);"></div> </div> <div class="face side s164"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.282);"></div> </div> <div class="face side s165"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.28);"></div> </div> <div class="face side s166"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.275);"></div> </div> <div class="face side s167"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.27);"></div> </div> <div class="face side s168"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.263);"></div> </div> <div class="face side s169"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.26);"></div> </div> <div class="face side s170"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.255);"></div> </div> <div class="face side s171"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.25);"></div> </div> <div class="face side s172"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.243);"></div> </div> <div class="face side s173"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.24);"></div> </div> <div class="face side s174"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.235);"></div> </div> <div class="face side s175"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.23);"></div> </div> <div class="face side s176"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.227);"></div> </div> <div class="face side s177"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.224);"></div> </div> <div class="face side s178"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.22);"></div> </div> <div class="face side s179"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.21);"></div> </div> <div class="face side s180"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.208);"></div> </div> <div class="face side s181"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.204);"></div> </div> <div class="face side s182"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.2);"></div> </div> <div class="face side s183"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.196);"></div> </div> <div class="face side s184"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.192);"></div> </div> <div class="face side s185"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.19);"></div> </div> <div class="face side s186"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.184);"></div> </div> <div class="face side s187"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.18);"></div> </div> <div class="face side s188"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.176);"></div> </div> <div class="face side s189"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.176);"></div> </div> <div class="face side s190"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.173);"></div> </div> <div class="face side s191"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.17);"></div> </div> <div class="face side s192"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.165);"></div> </div> <div class="face side s193"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.16);"></div> </div> <div class="face side s194"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.16);"></div> </div> <div class="face side s195"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.157);"></div> </div> <div class="face side s196"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.153);"></div> </div> <div class="face side s197"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.153);"></div> </div> <div class="face side s198"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.15);"></div> </div> <div class="face side s199"> <div class="photon-shader" style="background-color: rgba(0, 0, 0, 0.15);"></div> </div> </div><h1>Achievement unlocked: <span class="perish">' + txt + '<h1 class="time">' + time_added + '</h1> </span> </div>';

	var badge = '<div class="badge"><img src="assets/img/achievement.png"><span class="time perish">' + time_added + '</span><span class="name">' + txt + '</span></div>'

	$('.coin').fadeIn(300).html(coin).delay(3000).fadeOut(300);
	$('.badges').append(badge);
  sfx.achievement()
}

function animatetimecounter(bonusTime) {
  if (bonusTime > 0) {
    var prepend = '+'
  } else {
    var prepend = ''
  }
  $('#bonusTime').remove()
	$('#animatetimecounter').prepend(
		"<span id='bonusTime'>" + prepend + bonusTime + '</span>'
	);
	// $('#animatetimecounter').show().fadeOut(1000);

	// add
	$('#animatetimecounter').addClass('fadeinout');
	$('#counter').addClass('wiggle');
	setTimeout(function() {
		$('#animatetimecounter').removeClass('fadeinout');
		$('#counter').removeClass('wiggle');
	}, 1000);
}

function animateUp(obj) {
  obj.show();
  obj.css('margin-top', '20px');
  obj.animate({
      opacity: 1,
      marginTop: "0px",
    }, 3000, function() {
      // Animation complete.
  });
};

function animateUpOut(obj, time) {
  obj.show();
  obj.css('margin-top', '20px');
  obj.animate({
      opacity: 1,
      marginTop: "0px",
    }, time/2, function() {
      // Animation complete.
  });
  obj.animate({
      opacity: 0,
      marginTop: "20px",
    }, time/2, function() {
      // Animation complete.
  });
};

function shake(obj, time) {
  if (!time) (
    time = 500
  )
  obj.addClass( 'shake shake-constant' )
  setTimeout(function(){
    obj.removeClass( 'shake shake-constant' )
  }, time);
}

function countdownWrapper() {

	// when page is ready do this
	$(document).ready(function() {
    $('.counter').hide();
		animateUp($('#counter'));


		function countdown(startTime) {
			animateUpOut($('#countdownWrapper'), 1000)
      sfx.countdown()

			switch (startTime) {
				case 3:
					$('#countdown').html('<span>Prepare your <span class="perish">Assets!</span></span>');
					break;
				case 2:
					$('#countdown').html('<span>Create your <span class="perish">Layout!</span></span>');
					break;
				case 1:
					$('#countdown').html('<span>Publish or <span class="perish">Perish!</span></span>');
					break;
				default:
			}

			startTime = startTime - 1;
			if (startTime >= 0) {
				setTimeout(function () {
					countdown(startTime);
				}, 1300);
			} else {
				$('#countdownWrapper').remove();
        $('.counter').fadeIn(300);
        if ( getUrlParameter('time') ) { // difficulty
    			Publication.timeLeft = timeSet = getUrlParameter('time')
    		}
				return
			}
		}

		var startTime = 3;
    setTimeout(function () {
		  countdown(startTime)
    }, 200)
	});
}

if (!getUrlParameter('demo') && window.location.href.indexOf('saved') == -1) {
  countdownWrapper();
}
