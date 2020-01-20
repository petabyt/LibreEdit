var imported = {

};

var timeline = [
	
]

var player = {
	playing: false,
	currentClip: 0,
	clipTime: 0, // Time into current clip
	time: 0, // Time overall (for everything)
	loop: 0, // Setinterval loop for playing video
	currentMediaElement: 0, // Current video element to grab from
	mouseOver: false,
	imageTime: .005 // "Frame rate" of images
}

var timelineUI = {
	zoom: .1 // Number to divide duration by
}

// Initial background loop
window.onload = function() {
	setInterval(function() {
		ui.updateTimeline();
	}, 1);
}

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

			ui.addMediaImported(name);

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

				ui.addMediaImported(name);
			});
		} else {
			alert("Media type not supported");
		}
	}
}

// These functions interact with the UI, and update it
var ui = {
	addMediaImported: function(name) {
		var imported = document.getElementById("imported");

		// Put file into imported
		// This will appear in the imported DIV
		var mediaElement = document.createElement("DIV");
		mediaElement.className = "importedVideo";
		mediaElement.innerHTML = name;
		mediaElement.draggable = "true";

		// Send name when dragging
		mediaElement.ondragstart = function(event) {
			event.dataTransfer.setData("Text", name);
		}

		mediaElement.onclick = function() {
			addMedia(name);
		}

		imported.appendChild(mediaElement);
	},
	updateTimeline: function(name) {
		var video = document.getElementById("video");

		// Go through entire timeline
		for (var i = 0; i < timeline.length; i++) {
			var name = timeline[i].name;

			// Check if media is in timeline
			// if not, then create it
			// THIS DOESN'T WORK WITH MULTIPLE OF ONE MEDIA
			// anternative: go through all elements and check if there
			if (video.querySelectorAll("[name='" + name + "']").length == 0) {

				var mediaElement = document.createElement("DIV");
				mediaElement.className = "media";
				mediaElement.setAttribute("name", name);
				mediaElement.innerHTML = name;
				mediaElement.style.width = imported[name].duration / timelineUI.zoom + "px";
				video.appendChild(mediaElement);
			} else {
				
			}
		}

		var currentTime = player.currentMediaElement.currentTime; // why is this here?
	}
}

// This function handles imported media to timeline dragging
function timelineDrag(event, action) {
	if (action == "ondragover") {
		event.preventDefault(); // Allow drag
	} else if (action == "ondrop") {
		var name = event.dataTransfer.getData("Text"); // Recieve name of media
		addMedia(name);
	}
}

// Handles context menu
function contextMenu(event) {

	var target = event.target; // right clicked on this element

	if (target.id !== "inspectElement") {
		event.preventDefault();

		var menu = document.getElementById("contextMenu");
		menu.style.display = "block";
		menu.style.left = event.clientX + "px";
		menu.style.top = event.clientY + "px";

		var mediaEffectsButton = document.getElementById("mediaEffectsButton").style;
		mediaEffectsButton.display = "none";

		if (target.tagName == "BODY") {
			// Regular body stuff
		} else if (target.className == "media") {
			// right click on timeline media
			mediaEffectsButton.display = "block";
		}
	}
}

function bodyClick() {
	var menu = document.getElementById("contextMenu");
	menu.style.display = "none";
}

function addMedia(name) {
	var media = imported[name];

	timeline.push({
		name: name,
		duration: media.duration,
		type: media.type,
		overlay: {
			text: [
				{
					text: "Hello, World!",
					x: 50,
					y: 50,
					font: "30px Arial",
					color: "white"
				}
			]
		}
	});

	// Start render
	renderPlayer();
}

function togglePlayer(elem) {
	if (player.playing) {
		player.playing = false;
		elem.src = "assets/play.svg"
	} else {
		player.playing = true;
		elem.src = "assets/pause.svg"
	}
}

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
				var text = currentClip.overlay.text;
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