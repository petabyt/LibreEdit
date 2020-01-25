function exportVideo() {
	var playerElem = document.getElementById("player");
	player.currentClip = 0;
	player.clipTime = 0;
	player.playing = true;

	var vid = new Whammy.Video(15);

	// Add frames to video
	var exporting = setInterval(function() {
		vid.add(playerElem);
	}, 1);

	// Stop adding frames once finished
	setTimeout(function() {
		clearInterval(exporting);
		vid.compile(false, function(webm) {
			var link = document.createElement("A");
			link.href = window.URL.createObjectURL(webm);
			link.download = "myvideo.webm";
			
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		});

	}, timeline[player.currentClip].duration * 1000 - 100)
}