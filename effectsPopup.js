// This opens and updates the media effects popup

function mediaEffects(event) {
	var mediaEffects = document.getElementById("mediaEffects");
	var name = event.target.parentElement.getAttribute("name");
	var id = event.target.parentElement.getAttribute("mediaID");
	var content = mediaEffects.children[1]; // .content is second element in div

	// Initial popup info
	mediaEffects.style.display = "block";
	mediaEffects.querySelectorAll(".content").innerHTML = id;
	mediaEffects.querySelectorAll(".mediaEffectsTitle")[0].innerHTML = "Effects for " + name;
	
	// Generate preview image (edits will be overlayed onto it)
	var effectsPreview = playerFrame();
	effectsPreview.className = "effectsPreview";
	content.appendChild(effectsPreview);
	var effectsPreviewC = effectsPreview.getContext("2d");
	var beforeEdit = effectsPreview.toDataURL();


	// TODO: media preview
	// disable edits, grab preview image, then drawEffects() on that







	var addedEffects = mediaEffects.querySelectorAll(".addedEffects")[0];
	addedEffects.innerHTML = ""; // Clear before editing
	
	// Prepare to append effects data to addedeffects
	var mediaNum = getFromTimeline(name, id);
	var effects = timeline[mediaNum].effects;
	var effectList = Object.keys(effects);

	// For each effect added, make a config div
	for (var i = 0; i < effectList.length; i++) {
		var effectDuplicates = effects[effectList[i]];
		var effectName = effectList[i];

		// Loop through effect duplicates (more of 1 effect)
		for (var e = 0; e < effectDuplicates.length; e++) {
			var addedEffect = document.createElement("DIV");
			addedEffect.className = "addedEffect";
			addedEffect.innerHTML += "<b>" + effectList[i] + "</b><br>";

			var effectInputs = engine.effects[effectList[i]].inputs; // Generate list of current effect inputs

			// Add INPUT for each input type
			for (var n = 0; n < effectInputs.length; n++) {
				var input = document.createElement("INPUT");
				input.type = effectInputs[n].type;
				input.placeholder = "Input " + input.type;
				input.value = effectDuplicates[e].text; // Temporary
				input.setAttribute("effectNum", e); // Add effect ID to avoid exact duplicates
				input.setAttribute("effectChanges", effectInputs[n].changes); // Give to input func what input to change

				// Code Executed when key pressed
				input.oninput = function(event) {
					// Get what element the user is typing on
					// Could be replaced with THIS?
					var thisElem = event.target;
					var effectChanges = thisElem.getAttribute("effectChanges");
					var id = eval(thisElem.getAttribute("effectNum"));

					// Update straight to video on timeline with handy variables
					timeline[mediaNum].effects[effectName][id][effectChanges] = thisElem.value;

					// Update effects preview
					var image = document.createElement("IMG");
					image.src = beforeEdit;

					image.onload = function() {
						effectsPreviewC.drawImage(image, 0, 0, effectsPreview.width, effectsPreview.height);

						drawEffects(timeline[mediaNum].effects, effectsPreviewC);
					}

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
		effectDiv.innerHTML = "<b>" + effect.name + "</b><br>" + effect.desc;

		availableEffects.appendChild(effectDiv);
	}
}