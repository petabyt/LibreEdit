function exportVideo() {
	var playerElem = document.getElementById("player");
	player.currentClip = 0;
	player.clipTime = 0;

	var vid = new Whammy.Video(23);

	// Add frames to video
	console.log("Started rendering")
	player.playing = true;
	var exporting = setInterval(function() {
		vid.add(playerElem);
		console.log("Added Frame");
	}, 1);

	// Stop adding frames once finished
	setTimeout(function() {
		console.log("Done adding frames. Exporting to webm...");
		clearInterval(exporting);
		player.playing = false;

		// Convert and compile into download link
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