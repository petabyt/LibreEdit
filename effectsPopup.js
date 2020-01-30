// Open and change media effects popup
function mediaEffects(event) {
	var mediaEffects = document.getElementById("mediaEffects");
	var name = event.target.parentElement.getAttribute("name");
	var id = event.target.parentElement.getAttribute("mediaID");

	// Initial popup info
	mediaEffects.style.display = "block";
	mediaEffects.querySelectorAll(".content").innerHTML = id;
	mediaEffects.querySelectorAll(".mediaEffectsTitle")[0].innerHTML = "Effects for " + name;
	
	var addedEffects = mediaEffects.querySelectorAll(".addedEffects")[0];
	addedEffects.innerHTML = ""; // Clear before editing
	
	// Prepare to append effects data to addedeffects
	var mediaNum = getFromTimeline(name, id);
	var effects = timeline[mediaNum].effects;
	var effectList = Object.keys(effects);

	// For each effect added, make a config div
	for (var i = 0; i < effectList.length; i++) {
		var effectDuplicates = effects[effectList[i]];

		// Loop through effect duplicates (more of 1 effect)
		for (var e = 0; e < effectDuplicates.length; e++) {
			var addedEffect = document.createElement("DIV");
			addedEffect.className = "addedEffect";
			addedEffect.innerHTML += effectList[i] + "<br>";

			var effectInputs = engine.effects[effectList[i]].inputs; // Generate list of current effect inputs

			// Add INPUT for each input type
			for (var n = 0; n < effectInputs.length; n++) {
				var input = document.createElement("INPUT");
				input.type = effectInputs[n].type;
				input.placeholder = "Input " + input.type;
				input.value = effectDuplicates[e].text; // Temporary
				input.setAttribute("effectNum", e); // Add effect ID to avoid exact duplicates

				// Code Executed when key pressed
				input.onkeydown = function(event) {
					// Get what element the user is typing on
					var thisElem = event.target;
					var id = thisElem.getAttribute("effectNum");

					timeline[mediaNum].effects[input.type][id].text = thisElem.value;
				}

				addedEffect.appendChild(input);
			}

			addedEffects.appendChild(addedEffect);
		}
	}

	var availableEffects = mediaEffects.querySelectorAll(".availableEffects")[0];
	availableEffects.innerHTML = ""; // Clear before editing

	var availableEffectList = Object.keys(engine.effects); // generate list of all effects

	// Make a list of available effects to add
	for (var i = 0; i < availableEffectList.length; i++) {
		var effect = engine.effects[availableEffectList];

		var effectDiv = document.createElement("DIV");
		effectDiv.className = "availableEffect";
		effectDiv.innerHTML = effect.name + "<br>" + effect.desc;

		availableEffects.appendChild(effectDiv);
	}
}