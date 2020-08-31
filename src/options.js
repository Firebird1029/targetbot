// Saves options to chrome.storage
function saveOptions() {
	var wantedVariations = document.getElementById("varInput").value;
	var finishedEndpoint = document.getElementById("notifInput").value;
	chrome.storage.local.set(
		{
			wantedVariations: wantedVariations.split(",").map((text) => text.trim()),
			finishedEndpoint: finishedEndpoint
		},
		function () {
			// Update status to let user know options were saved.
			var status = document.getElementById("status");
			status.textContent = "Options saved.";
			setTimeout(function () {
				status.textContent = "";
			}, 750);
		}
	);
}

// Restores state using the preferences stored in chrome.storage.
function restoreOptions() {
	chrome.storage.local.get(
		{
			// Default options
			wantedVariations: [],
			finishedEndpoint: ""
		},
		function (restoredOptions) {
			document.getElementById("varInput").value = restoredOptions.wantedVariations.join(", ");
			document.getElementById("notifInput").value = restoredOptions.finishedEndpoint;
		}
	);
}
document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
