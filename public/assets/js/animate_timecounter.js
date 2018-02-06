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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmltYXRlX3RpbWVjb3VudGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIGFuaW1hdGV0aW1lY291bnRlcihib251c1RpbWUpIHtcblx0Y29uc29sZS5sb2coYm9udXNUaW1lKTtcblx0JCgnI2FuaW1hdGV0aW1lY291bnRlcicpLnByZXBlbmQoXG5cdFx0XCI8c3BhbiBpZD0nYm9udXNUaW1lJz5cIiArIGJvbnVzVGltZSArICc8L3NwYW4+J1xuXHQpO1xuXHQvLyAkKCcjYW5pbWF0ZXRpbWVjb3VudGVyJykuc2hvdygpLmZhZGVPdXQoMTAwMCk7XG5cblx0Ly8gYWRkXG5cdCQoJyNhbmltYXRldGltZWNvdW50ZXInKS5hZGRDbGFzcygnZmFkZWlub3V0Jyk7XG5cdCQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ3dpZ2dsZScpO1xuXHRjb25zb2xlLmxvZygnYWRkJyk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0Ly8gcmVtb3ZlXG5cdFx0Y29uc29sZS5sb2coJ3JlbW92ZScpO1xuXHRcdCQoJyNhbmltYXRldGltZWNvdW50ZXInKS5yZW1vdmVDbGFzcygnZmFkZWlub3V0Jyk7XG5cdFx0JCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnd2lnZ2xlJyk7XG5cdH0sIDEwMDApO1xufVxuIl0sImZpbGUiOiJhbmltYXRlX3RpbWVjb3VudGVyLmpzIn0=
