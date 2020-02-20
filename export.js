var whammy = {
	export: 0,
	fps: 0,
	toExport: 0,
	quality: 0
};

function exportVideo(fps, quality) {
	whammy.fps = fps;
	whammy.quality = quality;

	// Start from the beginning
	player.currentClip = 0;
	player.clipTime = 0;
	player.exporting = true;

	whammy.export = new Whammy.Video(fps, quality);

	// Add frames to video
	console.log("Started rendering");

	// Add frame 0, increase time, wait 10 miliseconds, and repeat
	var wait = setInterval(function() {
		if (timelineLength() - .1 < timeIntoTimeline() || !player.exporting) { // Need .1 second wiggle room, since intervals aren't perfectly synced
			clearInterval(wait);

			console.log("Done adding frames. Exporting " + whammy.toExport + " frames to WEBM...");

			player.playing = false;
			player.exporting = false;

			// Convert and compile into download link
			whammy.export.compile(false, function(webm) {
				var link = document.createElement("A");
				link.href = window.URL.createObjectURL(webm);
				link.download = "myvideo.webm";

				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			});
		}
	}, 1)
}

// This function is callled on all video elements, after timeupdate
function playerVideoUpdate() {
	if (player.exporting) {

		var playerElem = document.getElementById("player");

		whammy.toExport++;

		whammy.export.add(playerElem);
		player.clipTime += 1/whammy.fps;
	}
}

function renderPopup() {
	makePopup({
	    title: "Render Project",
	    content: "",
	    width: 400,
	    height: 400,
	    onopen: function(elem) {
	    	elem.children[1].innerHTML += `
	    		<button onclick='exportVideo(100, 480)'>Render default FPS, 480P</button>
	    	`;
	    }
	});
}