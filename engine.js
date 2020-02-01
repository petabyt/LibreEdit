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
				},
				{
					type: "color",
					changes: "color"
				}
			]
		}
	}
}

var player = {
	playing: false,
	currentClip: 0,
	currentDimensions: {
		mediaX: 0,
		mediaY: 0,
		mediaWidth: 0,
		mediaHeight: 0
	},
	clipTime: 0, // Time into current clip
	time: 0, // Time overall (for everything)
	allTime: 0, // Calculated duration of everything in timeline
	loop: 0, // Setinterval loop for playing video
	currentMediaElement: 0, // Current video element to grab from
	mouseOver: false,
	imageTime: .005, // "Frame rate" of images
	displayEffects: true,
}

// Render player (soon to be in other places)
function renderPlayer() {
	
	updateMediaElement();

	var canvas = document.getElementById("player");
	var c = canvas.getContext("2d");
	canvas.width = "640";
	canvas.height = "360";

	// Set player loop if empty
	if (player.loop == 0) {
		player.loop = setInterval(function() {

			// This is done while playing, the one before isn't constant
			var media = updateMediaElement();

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

			// Set player dimensions (for other functions mainly)
			player.currentDimensions.mediaX = mediaX;
			player.currentDimensions.mediaY = mediaY;
			player.currentDimensions.mediaWidth = mediaWidth;
			player.currentDimensions.mediaHeight = mediaHeight;

			var currentClip = timeline[player.currentClip];
			if (player.playing) {

				// Increase player time
				if (currentClip.type == "video") {
					player.currentMediaElement.play(); // Make sure it's playing
					player.clipTime = player.currentMediaElement.currentTime; // Update time
				} else if (currentClip.type == "image") {
					player.clipTime += player.imageTime;
				}

				playerFrame(c);

				if (player.displayEffects) {
					drawEffects(currentClip.effects, c);
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

// Draw effects from obj onto a canvas elem
// This DOESNT accept a raw canvas element, only the 2d context
function drawEffects(effects, c) {
	// Render text
	var text = effects.text;
	if (text.length !== 0) {
		for (var i = 0; i < text.length; i++) {
			var current = text[i];

			c.font = current.font;
			c.fillStyle = current.color;
			c.fillText(current.text, current.x, current.y);
		}
	}
}

// Tell the player with the current playing clip is (based off of time into current clip)
function updateCurrentClip() {
	var currentMedia = timeline[player.currentClip];
	var time = currentMedia.duration;
	player.allTime = timelineLength();

	// Current clip time is larger than current clip duration, switch to next clip
	// The video element and clipTime aren't perfectly synced, so .01 wiggle room is needed
	if (player.clipTime > time - .01) {

		player.clipTime = 0;

		// Detect if this is the last media, and switch to next or first
		if (player.currentClip + 1 == timeline.length || timeline.length == 1) {
			player.currentClip = 0;
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
					text: "Woah, a video editor in Javascript?",
					x: 50,
					y: 50,
					font: "30px Arial",
					color: "#ffffff"
				},
				{
					text: "That's too cool!",
					x: 90,
					y: 90,
					font: "30px Arial",
					color: "#ff0000"
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

		var acceptedVideo = ["mp4", "mov", "mkv"];
		var acceptedImages = ["png", "jpg", "jpeg"];

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

// This either draws the current frame onto the player, or grabs an unedited frame
function playerFrame(c) {
	// If not set, create new CANVAS element
	var canvas, set;
	set = c; // For later use
	if (!c) {
		canvas = document.createElement("CANVAS");
		canvas.width = "640";
		canvas.height = "360";
		c = canvas.getContext("2d");
		document.body.appendChild(canvas);
	}

	c.drawImage(
		player.currentMediaElement,
		player.currentDimensions.mediaX,
		player.currentDimensions.mediaY,
		player.currentDimensions.mediaWidth,
		player.currentDimensions.mediaHeight
	);

	// If not set again, convert and return
	if (!set) {
		document.body.removeChild(canvas);

		return canvas
	}
}

// Find the video/image element to render player to
// Update it, and return it
function updateMediaElement() {
	var currentClip = timeline[player.currentClip];
	var mediaElements = document.getElementById("mediaElements");

	var mediaElement = mediaElements.querySelectorAll("[filename='" + currentClip.name + "']")[0];
	player.currentMediaElement = mediaElement;
	return mediaElement
}