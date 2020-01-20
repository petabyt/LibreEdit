var imported = {

};

// This should match what is on the UI timeline
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

function togglePlayer(elem) {
	if (player.playing) {
		player.playing = false;
		elem.src = "assets/play.svg"
	} else {
		player.playing = true;
		elem.src = "assets/pause.svg"
	}
}