var engine = {
	id: 0, // Increasing number for duplicate media, effects
	effects: {
		text: {
			name: "Text",
			desc: "Custom text overlay",
			inputs: [
				{
					type: "text",
					changes: "text"
				}
			]
		}
	}
}

// Render player (soon to be in other places)
function renderPlayer() {
	var currentClip = timeline[player.currentClip];
	var mediaElements = document.getElementById("mediaElements");
	var media = mediaElements.querySelectorAll("[filename='" + currentClip.name + "']")[0];

	var canvas = document.getElementById("player");
	canvas.width = "640";
	canvas.height = "360";
	var c = canvas.getContext("2d");

	// Draw preview image
	c.drawImage(media, 0, 0, canvas.width, canvas.height);

	player.currentMediaElement = media;

	// Set player loop if empty
	if (player.loop == 0) {
		player.loop = setInterval(function() {
			if (player.playing) {
				// Increase player time
				if (currentClip.type == "video") {
					player.currentMediaElement.play(); // Make sure it's playing
					player.clipTime = player.currentMediaElement.currentTime; // Update time
				} else if (currentClip.type == "image") {
					player.clipTime += player.imageTime;
				}

				c.drawImage(player.currentMediaElement, 0, 0, canvas.width, canvas.height);

				// Render text
				var text = currentClip.effects.text;
				if (text.length !== 0) {
					for (var i = 0; i < text.length; i++) {
						var current = text[i];

						c.font = current.font;
						c.fillStyle = current.color;
						c.fillText(current.text, current.x, current.y);
					}
				}
			} else {
				if (currentClip.type == "video") {
					player.currentMediaElement.pause();
				}
			}

			// Temporary Code to move time thing (only good for 1 clip)
			var time = document.getElementById("time");
			time.style.left = (player.clipTime / timelineUI.zoom) + "px";

			updateCurrentClip();
		}, 1);
	}
}

// Tell the player with the current played clip is
function updateCurrentClip() {
	var currentMedia = timeline[player.currentClip];
	var time = currentMedia.duration;

	// Current time is larger than current clip duration, switch to next clip
	if (player.clipTime > time) {
		player.currentClip++
		player.clipTime = 0;

		renderPlayer(); // Updates canvas dimensions, current media element...
	}
}

// Add media to timeline
function addMedia(name) {
	var media = imported[name];

	timeline.push({
		name: name,
		id: engine.id,
		duration: media.duration,
		type: media.type,
		effects: {
			text: [
				{
					text: "0",
					x: 50,
					y: 50,
					font: "30px Arial",
					color: "white"
				},
				{
					text: "1",
					x: 90,
					y: 90,
					font: "30px Arial",
					color: "white"
				}
			]
		}
	});

	engine.id++

	// Start render (like a thumbnail)
	renderPlayer();
}

// Open file and do thingies with it
function openFile() {
	var input = document.createElement("INPUT");
	input.type = "file";
	input.click();

	input.onchange = function() {
		var content = URL.createObjectURL(input.files[0]);

		// Remove C:/fakepath/ from filename
		var filePath = input.value.split("\\");
		var name = filePath[filePath.length - 1];

		// Get filename from file
		var typeSplit = name.split(".");
		var type = typeSplit[typeSplit.length - 1];

		var acceptedVideo = ["mp4"];
		var acceptedImages = ["png", "jpg"];

		// Detect if media is image or video
		if (acceptedImages.includes(type)) {
			var image = document.createElement("IMG");
			image.setAttribute("filename", name);
			image.src = content;
			
			document.getElementById("mediaElements").appendChild(image);

			imported[name] = {
				type: "image",
				duration: 10
			}

			addMediaImported(name);

		} else if (acceptedVideo.includes(type)) {
			var video = document.createElement("VIDEO");
			video.setAttribute("filename", name);
			video.src = content;
			video.style.visibility = "hidden";
			document.getElementById("mediaElements").appendChild(video);

			// Add video to imported videos once loaded
			video.addEventListener("loadeddata", function() {
				var duration = video.duration;

				imported[name] = {
					type: "video",
					duration: duration
				}

				addMediaImported(name);
			});
		} else {
			alert("Media type not supported");
		}
	}
}