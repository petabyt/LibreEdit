var imported = {

};

// This should match what is on the UI timeline
var timeline = [

]

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

		// Check if media is in timeline. if not, create it
		var nameExists = video.querySelectorAll("[name='" + name + "']");
		var idExists = video.querySelectorAll("[id='" + id + "']");

		// If doesn't already exist
		if (nameExists.length == 0 || idExists.length == 0) {
			var mediaElement = document.createElement("DIV");

			mediaElement.className = "media";
			mediaElement.style.width = imported[name].duration / timelineUI.zoom + "px";
			mediaElement.innerHTML += "<span>" + name + "</span>";

			mediaElement.setAttribute("name", name);
			mediaElement.setAttribute("id", id);
			mediaElement.setAttribute("duration", imported[name].duration);

			var effectButton = document.createElement("IMG");
			effectButton.src = "assets/settings.svg";
			effectButton.onclick = function() {
				mediaEffects(this.parentElement.getAttribute("name"), this.parentElement.getAttribute("id"));
			}

			mediaElement.appendChild(effectButton);

			video.appendChild(mediaElement);
		} else {
			var divActual = timeline[getFromTimeline(name, id)]; // The OBJ for the timeline div
			var divWidth = nameExists[0].style.width;
			divWidth = divWidth.substring(0, divWidth.length - 2);

			// Provide live updates for timeline elements, like duration, width..
			// Make sure timeline length is same as the timeline json
			// With .toFixed(4), that fixes 5.4300000001
			var sameLength = divActual.duration !== Number(nameExists[0].getAttribute("duration"));
			var sameWidth = (divWidth * timelineUI.zoom).toFixed(4) * 10 * timelineUI.zoom !== divActual.duration;
			
			if (sameWidth || sameLength) {
				nameExists[0].style.width = divActual.duration / timelineUI.zoom + "px";
			}
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
