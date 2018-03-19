// generate here http://loov.io/jsfx
var library = {
  "button": {"Volume":{"Sustain":0.1,"Decay":0.15,"Punch":0.55}},
  "addTimePlus":{"Frequency":{"Start":1445.5731550885357,"ChangeSpeed":0.10671372590863402,"ChangeAmount":8.82267391663804},"Volume":{"Sustain":0.058308031348346084,"Decay":0.23632114637712365,"Punch":0.30405599284659085}},
  "addTimeMinus":{"Frequency":{"Start":1445.5731550885357,"ChangeSpeed":0.10671372590863402,"ChangeAmount":8.82267391663804,"Max":1800,"Min":30,"Slide":0,"DeltaSlide":-0.59},"Volume":{"Sustain":0.058308031348346084,"Decay":0.23632114637712365,"Punch":0.30405599284659085}},
  "disruption":{"Frequency":{"Start":162.32804000949452,"Slide":0.2662490841076073},"Generator":{"Func":"noise"},"Volume":{"Sustain":0.12425529500283546,"Decay":0.38692896027682633,"Punch":0.5059466141615192}},
  "achievement":{"Frequency":{"Start":842.5958130577067,"Min":1254.4672936539775,"Max":1492.1850807277026,"Slide":-0.7923732459076169,"DeltaSlide":-0.3114371038726942,"RepeatSpeed":0.9031520171983805,"ChangeAmount":1.5603147610638413,"ChangeSpeed":0.43999003760879174},"Vibrato":{"Depth":0.34238237568337326,"DepthSlide":0.07185199690646416,"Frequency":42.45575290295484,"FrequencySlide":0.7305424734985859},"Generator":{"Func":"synth","A":0.22587623033468107,"B":0.7839455993836291,"ASlide":0.8125246106203887,"BSlide":-0.9617489870146128},"Guitar":{"A":0.7124220585056285,"B":0.8550322541824009,"C":0.4633791369804199},"Phaser":{"Offset":-0.550191588721344,"Sweep":0.3689292617772941},"Volume":{"Master":0.4,"Attack":0.3917672387237836,"Sustain":0.15350705151125243,"Punch":0.23329555882789088,"Decay":1.861}}
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

