// eh
function makePopup(obj) {
	var popup = document.createElement("DIV");
	popup.className = "popup";
	popup.style.width = obj.width + "px";
	popup.style.height = obj.height + "px";
	popup.style.left = (window.innerWidth - obj.width) / 2 + "px";
	popup.style.top = (window.innerHeight - obj.height) / 2 + "px";


	var top = document.createElement("DIV");
	top.className = "top";
	top.innerHTML = "<span class='mediaEffectsTitle'>" + obj.title + "</span>";
	top.innerHTML += "<img src='assets/x.svg' width='30' onclick='this.parentElement.parentElement.outerHTML = \"\"'>";

	var content = document.createElement("DIV");
	content.className = "content";
	content.innerHTML = obj.content;

	popup.appendChild(top);
	popup.appendChild(content);

	document.body.appendChild(popup);
	obj.onopen(popup);
}