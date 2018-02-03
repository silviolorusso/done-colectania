function animatetimecounter(bonusTime) {
	console.log(bonusTime);
	$('#animatetimecounter').prepend(
		"<span id='bonusTime'>" + bonusTime + '</span>'
	);
	// $('#animatetimecounter').show().fadeOut(1000);

	// add
	$('#animatetimecounter').addClass('fadeinout');
	$('#counter').addClass('wiggle');
	console.log('add');
	setTimeout(function() {
		// remove
		console.log('remove');
		$('#animatetimecounter').removeClass('fadeinout');
		$('#counter').removeClass('wiggle');
	}, 1000);
}
