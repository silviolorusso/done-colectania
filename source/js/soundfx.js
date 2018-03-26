// generate here: http://loov.io/jsfx
var library = {
  "button": {"Frequency":{"Start":937.6817626618293,"Min":0.04070252646427441,"Slide":-0.7533066229853571},"Generator":{"Func":"sine","A":0.7491017849463704,"ASlide":0.25086403724560674},"Filter":{"HP":0.25887415803303276},"Volume":{"Sustain":0.1542735964448125,"Decay":0.3303739982373566,"Punch":0.193554323015371}},
  "addTimePlus":{"Frequency":{"Start":1445.5731550885357,"ChangeSpeed":0.10671372590863402,"ChangeAmount":8.82267391663804},"Volume":{"Sustain":0.058308031348346084,"Decay":0.23632114637712365,"Punch":0.30405599284659085}},
  "addTimeMinus":{"Frequency":{"Start":1445.5731550885357,"ChangeSpeed":0.10671372590863402,"ChangeAmount":8.82267391663804,"Max":1800,"Min":30,"Slide":0,"DeltaSlide":-0.59},"Volume":{"Sustain":0.058308031348346084,"Decay":0.23632114637712365,"Punch":0.30405599284659085}},
  "disruption":{"Frequency":{"Start":162.32804000949452,"Slide":0.2662490841076073},"Generator":{"Func":"noise"},"Volume":{"Sustain":0.12425529500283546,"Decay":0.38692896027682633,"Punch":0.5059466141615192}},
  "achievement":{"Frequency":{"Start":842.5958130577067,"Min":1254.4672936539775,"Max":1492.1850807277026,"Slide":-0.7923732459076169,"DeltaSlide":-0.3114371038726942,"RepeatSpeed":0.9031520171983805,"ChangeAmount":1.5603147610638413,"ChangeSpeed":0.43999003760879174},"Vibrato":{"Depth":0.34238237568337326,"DepthSlide":0.07185199690646416,"Frequency":42.45575290295484,"FrequencySlide":0.7305424734985859},"Generator":{"Func":"synth","A":0.22587623033468107,"B":0.7839455993836291,"ASlide":0.8125246106203887,"BSlide":-0.9617489870146128},"Guitar":{"A":0.7124220585056285,"B":0.8550322541824009,"C":0.4633791369804199},"Phaser":{"Offset":-0.550191588721344,"Sweep":0.3689292617772941},"Volume":{"Master":0.4,"Attack":0.3917672387237836,"Sustain":0.15350705151125243,"Punch":0.23329555882789088,"Decay":1.861}},
  "perished":{"Frequency":{"Start":1719.1373444197059,"Min":34.3096058145236,"Max":371.1260731966681,"Slide":-0.9141135458989011,"DeltaSlide":-0.6368413365780388,"RepeatSpeed":2.1390636706577615,"ChangeAmount":2.533261443394826,"ChangeSpeed":0.011465056082448077},"Vibrato":{"Depth":0.4511698427440496,"DepthSlide":-0.5662438355042121,"Frequency":0.06795360678768886,"FrequencySlide":-0.0312585146249309},"Generator":{"Func":"square","A":0.7167721003303449,"B":0.6090055178023417,"ASlide":-0.07096345125458026,"BSlide":-0.8965392249192914},"Guitar":{"A":0.9047302863207296,"B":0.0260209056687406,"C":0.9308188323811635},"Phaser":{"Offset":0.8643683296445648,"Sweep":-0.7217943762593859},"Volume":{"Master":0.21,"Attack":0.131,"Sustain":0.20435391719590923,"Punch":0,"Decay":1.561}},
  "browse":{"Frequency":{"Start":1538.8088628588107,"Min":722.3952481554733,"Slide":-0.9303894592335042},"Generator":{"Func":"string","A":0.0729686026759544,"ASlide":0.08362149850044026},"Filter":{"HP":0.24615431440611482},"Phaser":{"Offset":0.09142635169297866,"Sweep":0.013386655135103532},"Volume":{"Sustain":0.2544338345548348,"Decay":0.2913502391447095,"Punch":0.02343347167161953}},
  "splash":{"Frequency":{"Start":369.217062370442,"Min":975.7471065866098,"Max":1734.392074481906,"Slide":0.543197776528372,"DeltaSlide":0.5657570303192667,"RepeatSpeed":0.988138789091797,"ChangeAmount":1.7531779886645484,"ChangeSpeed":0.9166360470346799},"Vibrato":{"Depth":0.8687726881363269,"DepthSlide":-0.47319407606812414,"Frequency":15.087525028830107,"FrequencySlide":-0.3598706197031314},"Generator":{"Func":"square","A":0.3537049151418947,"B":0.5071507315952561,"ASlide":-0.8448800881955698,"BSlide":0.3738284639233145},"Guitar":{"A":0.6221299252406756,"B":0.19007047919947406,"C":0.5160051505580008},"Phaser":{"Offset":0.6874784682402013,"Sweep":-0.8490411985056183},"Volume":{"Master":0.4,"Attack":0.8492996686005103,"Sustain":0.7881625575519693,"Punch":2.472785607752356,"Decay":0.7880658569945307}},
  "countdown":{"Frequency":{"Start":1433.6305316706266},"Volume":{"Sustain":0.0347783240096079,"Decay":0.39222229683338117,"Punch":0.5511267709068541},"Generator":{"Func":"sine"}},
  "countdownReady":{"Frequency":{"Start":2000.6305316706266},"Volume":{"Sustain":0.0347783240096079,"Decay":0.39222229683338117,"Punch":0.5511267709068541},"Generator":{"Func":"sine"}},
  "loading":{"Frequency":{"Start":1800,"Min":1402,"Slide":-0.7127048155930049},"Generator":{"Func":"sine","A":0.30364788843107227,"ASlide":0.057573559806855634},"Filter":{"HP":0.19324063423690388},"Volume":{"Sustain":0.1964293192566542,"Decay":0.023271947952411855,"Punch":0.04603489865660102}},
  "loaded":{"Frequency":{"Start":599.4087759865977,"Slide":0.4423875329916726,"RepeatSpeed":0.7386864833329531},"Generator":{"A":0.44767248110493446},"Volume":{"Sustain":0.10494383413944118,"Decay":0.4929892029388092}},
  "error":{"Frequency":{"Start":451.522575399669,"Slide":-0.4866219113811203},"Generator":{"Func":"square","A":0.38842468202591096,"ASlide":-0.04223165548495689},"Volume":{"Sustain":0.04503758846105768,"Decay":0.10912816671117827}},
  "ready":{"Frequency":{"Start":600.5936281460497,"Slide":0.22289345063425814},"Vibrato":{"Depth":0.27802441337207046,"Frequency":35.90766409757357},"Generator":{"A":0.3354589217595621},"Volume":{"Sustain":0.3735321464174761,"Decay":0.26493156145629737}}
}
var libraryMuted = {}
for (var sound in library) {
  libraryMuted[sound] = {"Volume":{"Master":0}}
}

sfx = jsfx.Sounds(library)

const soundtrack = new Howl({
  src: ['assets/audio/lance-romance_small.mp3']
})
$(document).ready(function() {
  if (localStorage.getItem("soundOn") == "false"){ 
    $('.sound').addClass('mute')
    localStorage.setItem("soundOn", "false")
    sfx = jsfx.Sounds(libraryMuted)
    soundtrack.volume(0)
  }
  $('.sound').click(function() {
    if ($('.sound').hasClass('mute')) { // true: audio is muted
      $('.sound').removeClass('mute')
      localStorage.setItem('soundOn', "true")
      sfx = jsfx.Sounds(library)
      soundtrack.volume(1)
    } else {  // false: audio is not muted
      $('.sound').addClass('mute')
      localStorage.setItem('soundOn', "false")
      sfx = jsfx.Sounds(libraryMuted)
      soundtrack.volume(0)
    }
  })
})

