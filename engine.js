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

	// This doesn't require ID, because 2 of the same video elements are the same
	var media = mediaElements.querySelectorAll("[filename='" + currentClip.name + "']")[0];

	var canvas = document.getElementById("player");
	var c = canvas.getContext("2d");
	canvas.width = "640";
	canvas.height = "360";

	// Set player loop if empty
	if (player.loop == 0) {
		player.loop = setInterval(function() {

			// Update media source (yes, the same code again)
			currentClip = timeline[player.currentClip];
			var media = mediaElements.querySelectorAll("[filename='" + currentClip.name + "']")[0];

			player.currentMediaElement = media;

			// First, we calculate the dimensions of the media
			// Video elements use .videoWidth, and images use .width
			var mediaWidth, mediaHeight;
			if (media.width == 0) {
				mediaWidth = media.videoWidth;
				mediaHeight = media.videoHeight;
			} else {
				mediaWidth = media.width;
				mediaHeight = media.height;
			}

			// Calculate what media width will be
			var relativeSizing = mediaHeight / canvas.height;
			mediaHeight = mediaHeight / relativeSizing;
			mediaWidth = mediaWidth / relativeSizing;

			// Calculate the center
			var mediaX = (640 - mediaWidth) / 2;
			var mediaY = (360 - mediaHeight) / 2;

			if (player.playing) {
				// Increase player time
				if (currentClip.type == "video") {
					player.currentMediaElement.play(); // Make sure it's playing
					player.clipTime = player.currentMediaElement.currentTime; // Update time
				} else if (currentClip.type == "image") {
					player.clipTime += player.imageTime;
				}

				c.drawImage(player.currentMediaElement, mediaX, mediaY, mediaWidth, mediaHeight);

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

			// Move time thing
			var time = document.getElementById("time");
			time.style.left = (timeIntoTimeline() / timelineUI.zoom) + "px";

			updateCurrentClip();
		}, 1);
	}
}

// Tell the player with the current played clip is
function updateCurrentClip() {
	var currentMedia = timeline[player.currentClip];
	var time = currentMedia.duration;
	player.allTime = timelineLength();

	// Current time is larger than current clip duration, switch to next clip
	// The video element and clipTime aren't perfectly synced, so .01 wiggle room is needed
	if (player.clipTime > time - .01) {

		player.clipTime = 0;

		console.log("0")
		// Detect if this is the last media, and switch to next or first
		if (player.currentClip + 1 == timeline.length || timeline.length == 1) {
			player.currentClip = 0;
			console.log("1");
		} else {
			player.currentClip++
		}

		player.loop = 0;
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

		var acceptedVideo = ["mp4", "mov"];
		var acceptedImages = ["png", "jpg"];

		// Detect if media is image or video
		if (acceptedImages.includes(type)) {
			var image = document.createElement("IMG");
			image.setAttribute("filename", name);
			image.src = content;
			
			document.getElementById("mediaElements").appendChild(image);

			// Add media to imported
			imported[name] = {
				type: "image",
				duration: 4
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