// Timeout Promise Helper Function
// https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout
function timeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Global TargetBot State
let targetBotActive = true;

chrome.extension.sendMessage({}, function (response) {
	chrome.storage.local.get(["wantedVariations", "finishedEndpoint"], function ({
		wantedVariations,
		finishedEndpoint
	}) {
		var readyStateCheckInterval = setInterval(function () {
			if (document.readyState === "complete") {
				clearInterval(readyStateCheckInterval);

				// ----------------------------------------------------------
				// This part of the script triggers when page is done loading

				// If not on a product page, disable bot
				if (window.location.href.substr(window.location.href.indexOf(".com") + 4, 3) !== "/p/") {
					targetBotActive = false;
					return;
				}
				console.log("Target Bot triggered");

				// Inject Stop Box DOM
				const $stopBox = $("<div><button>Stop Bot</button></div>");
				$stopBox
					.css("z-index", "9999999")
					.css("position", "fixed")
					.css("right", "0px")
					.css("width", "100px")
					.css("height", "50px")
					.css("backgroundColor", "white");
				$("body").prepend($stopBox);
				$stopBox.click(() => {
					alert("TargetBot stopped.");
					targetBotActive = false;
				});

				const keywords = [
					"in stock",
					"pick up",
					"pick up today",
					"pick up tomorrow",
					"deliver",
					"delivery",
					"same day delivery"
				];

				// Scrape & Parse Item Descriptions
				const totalVariations = $(`[data-test="variationButtonWrapper"]`).children().length;

				// If Found an Item In Stock
				function found() {
					console.log("In stock!");
					// alert("Found!");

					// Check if Pick up is an option
					if ($(`[data-test="orderPickupButton"]`).length) {
						// Add to cart
						$(`[data-test="orderPickupButton"]`).click();

						// Stop bot
						targetBotActive = false;

						// Trigger notification
						console.log("GET " + finishedEndpoint);
						const xmlHttp = new XMLHttpRequest();
						xmlHttp.open("GET", finishedEndpoint, true);
						xmlHttp.send();
					}
				}

				// Check Each Variation
				async function mainLoop() {
					await timeout(5000); // wait for page to load
					if (!targetBotActive) return;
					console.log("Starting scrape");
					for (let i = 1; i <= totalVariations; i++) {
						await new Promise((resolve) => {
							// console.log($(`[data-test="variationButtonWrapper"]`).find(`[data-test="node${i}"]`));

							// Switch to this variation
							const $variationNodeButton = $(`[data-test="variationButtonWrapper"]`)
								.find(`[data-test="node${i}"]`)
								.children("button");

							targetBotActive && $variationNodeButton.click();

							let detectedStatus = [];
							setTimeout(() => {
								// Check if we want this variation
								const variationName =
									$variationNodeButton[0].outerText || $variationNodeButton.children()[0].alt; // use alt if variation is a picture

								if (wantedVariations.indexOf(variationName) > -1) {
									console.log("Checking " + variationName);
									// Check if in stock
									let inStock = false;
									$(".h-text-greenDark, .h-text-orangeDark").each((i, el) => {
										const status = $(el).text().toLowerCase().trim();
										detectedStatus.push(status);
										if (keywords.indexOf(status) > -1) {
											inStock = true;
										}
									});
									if (inStock && targetBotActive) {
										found();
									}
									console.log(detectedStatus);
								}

								// After some time, proceed to next variation (confirm if TargetBot still active first)
								targetBotActive && resolve();
							}, 800);
						});
					}

					await timeout(500);

					// Refresh the Page
					targetBotActive && window.location.reload();
				}
				mainLoop();
			}
		}, 10);
	});
});

/*

const currentVariationNodeInt = +$(`[data-test="variationButtonWrapper"]`)
	.find(`[aria-label*="checked"]`) // find checked button
	.parent()
	.attr("data-test") // returns "node2"
	.substring(4); // returns "2", unary operator returns 2
const nextVariationNode = $(`[data-test="variationButtonWrapper"]`).find(
	`[data-test="node${currentVariationNodeInt + 1}"]`
);

 */
