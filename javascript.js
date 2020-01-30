var imported = {

};

// This should match what is on the UI timeline
var timeline = [
	
]

var player = {
	playing: false,
	currentClip: 0,
	currentClipId: 0, // unused
	clipTime: 0, // Time into current clip
	time: 0, // Time overall (for everything)
	allTime: 0, // Calculated length of everything
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
		updateTimeline();
	}, 1);
}

// Add an imported video into the imported DIV
function addMediaImported(name) {
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
}

// Go through the timeline array, and make sure everything
// is up to date in the DIV
function updateTimeline(name) {
	var video = document.getElementById("video");

	// Go through entire timeline
	for (var i = 0; i < timeline.length; i++) {
		var name = timeline[i].name;
		var id = timeline[i].id;

		// Check if media is in timeline
		// if not, then create it
		var nameExists = video.querySelectorAll("[name='" + name + "']");
		var idExists = video.querySelectorAll("[mediaid='" + id + "']");

		// If doesn't already exist
		if (nameExists.length == 0 || idExists.length == 0) {

			var mediaElement = document.createElement("DIV");
			mediaElement.className = "media";
			mediaElement.setAttribute("name", name);
			mediaElement.setAttribute("mediaID", id);
			mediaElement.innerHTML = name;
			mediaElement.style.width = imported[name].duration / timelineUI.zoom + "px";
			video.appendChild(mediaElement);
		} else {
			
		}
	}

	var currentTime = player.currentMediaElement.currentTime; // why is this here?
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

			// Pass name of media (gets to effects window)
			menu.setAttribute("name", target.getAttribute("name"));
			menu.setAttribute("mediaID", target.getAttribute("mediaID"));
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

// Function to get the media order from the timeline (with id)
function getFromTimeline(name, id) {
	for (var i = 0; i < timeline.length; i++) {
		if (timeline[i].name == name && timeline[i].id == id) {
			return i
		}

		return "Not found"
	}
}

// Return length of timeline, in miliseconds
function timelineLength() {
	var duration = 0;
	for (var i = 0; i < timeline.length; i++) {
		duration += timeline[i].duration;
	}

	return duration;
}

// Return how long the player is into the video, out of timelineLength()
function timeIntoTimeline() {
	var time = player.clipTime;
	
	if (player.currentClip == 0) {
		return time
	} else {
		for (var i = 0; i < timeline.length - player.currentClip; i++) {
			time += timeline[i].duration;
		}

		return time
	}
}