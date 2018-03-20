// generate here http://loov.io/jsfx
var library = {
  "button": {"Frequency":{"Start":937.6817626618293,"Min":0.04070252646427441,"Slide":-0.7533066229853571},"Generator":{"Func":"sine","A":0.7491017849463704,"ASlide":0.25086403724560674},"Filter":{"HP":0.25887415803303276},"Volume":{"Sustain":0.1542735964448125,"Decay":0.3303739982373566,"Punch":0.193554323015371}},
  "addTimePlus":{"Frequency":{"Start":1445.5731550885357,"ChangeSpeed":0.10671372590863402,"ChangeAmount":8.82267391663804},"Volume":{"Sustain":0.058308031348346084,"Decay":0.23632114637712365,"Punch":0.30405599284659085}},
  "addTimeMinus":{"Frequency":{"Start":1445.5731550885357,"ChangeSpeed":0.10671372590863402,"ChangeAmount":8.82267391663804,"Max":1800,"Min":30,"Slide":0,"DeltaSlide":-0.59},"Volume":{"Sustain":0.058308031348346084,"Decay":0.23632114637712365,"Punch":0.30405599284659085}},
  "disruption":{"Frequency":{"Start":162.32804000949452,"Slide":0.2662490841076073},"Generator":{"Func":"noise"},"Volume":{"Sustain":0.12425529500283546,"Decay":0.38692896027682633,"Punch":0.5059466141615192}},
  "achievement":{"Frequency":{"Start":842.5958130577067,"Min":1254.4672936539775,"Max":1492.1850807277026,"Slide":-0.7923732459076169,"DeltaSlide":-0.3114371038726942,"RepeatSpeed":0.9031520171983805,"ChangeAmount":1.5603147610638413,"ChangeSpeed":0.43999003760879174},"Vibrato":{"Depth":0.34238237568337326,"DepthSlide":0.07185199690646416,"Frequency":42.45575290295484,"FrequencySlide":0.7305424734985859},"Generator":{"Func":"synth","A":0.22587623033468107,"B":0.7839455993836291,"ASlide":0.8125246106203887,"BSlide":-0.9617489870146128},"Guitar":{"A":0.7124220585056285,"B":0.8550322541824009,"C":0.4633791369804199},"Phaser":{"Offset":-0.550191588721344,"Sweep":0.3689292617772941},"Volume":{"Master":0.4,"Attack":0.3917672387237836,"Sustain":0.15350705151125243,"Punch":0.23329555882789088,"Decay":1.861}},
  "perished":{"Frequency":{"Start":1719.1373444197059,"Min":34.3096058145236,"Max":371.1260731966681,"Slide":-0.9141135458989011,"DeltaSlide":-0.6368413365780388,"RepeatSpeed":2.1390636706577615,"ChangeAmount":2.533261443394826,"ChangeSpeed":0.011465056082448077},"Vibrato":{"Depth":0.4511698427440496,"DepthSlide":-0.5662438355042121,"Frequency":0.06795360678768886,"FrequencySlide":-0.0312585146249309},"Generator":{"Func":"square","A":0.7167721003303449,"B":0.6090055178023417,"ASlide":-0.07096345125458026,"BSlide":-0.8965392249192914},"Guitar":{"A":0.9047302863207296,"B":0.0260209056687406,"C":0.9308188323811635},"Phaser":{"Offset":0.8643683296445648,"Sweep":-0.7217943762593859},"Volume":{"Master":0.21,"Attack":0.131,"Sustain":0.20435391719590923,"Punch":0,"Decay":1.561}}
}
var libraryMuted = {}
for (var sound in library) {
  libraryMuted[sound] = {"Volume":{"Master":0}}
}

sfx = jsfx.Sounds(library)

$(document).ready(function() {
  if (localStorage.getItem("soundOn") == "false"){ 
    $('.sound').addClass('mute')
    localStorage.setItem("soundOn", "false")
    sfx = jsfx.Sounds(libraryMuted)
  }
  $('.sound').click(function() {
    if ($('.sound').hasClass('mute')) { // true: audio is muted
      $('.sound').removeClass('mute')
      localStorage.setItem('soundOn', "true")
      sfx = jsfx.Sounds(library)
    } else {  // false: audio is not muted
      $('.sound').addClass('mute')
      localStorage.setItem('soundOn', "false")
      sfx = jsfx.Sounds(libraryMuted) 
    }
  })
})

