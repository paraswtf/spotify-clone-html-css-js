function getGreeting() {
	const time = new Date().getHours();
	if (time < 12) {
		return "Good morning";
	} else if (time < 18) {
		return "Good afternoon";
	} else {
		return "Good evening";
	}
}

document.getElementById("greeting").innerHTML = getGreeting();

fetchData().then((d) => {
	var defaultColor;
	d.playlists
		.slice(0, 6)
		//Shuffle start
		// .map((value) => ({ value, sort: Math.random() }))
		// .sort((a, b) => a.sort - b.sort)
		// .map(({ value }) => value)
		//Shuffle end
		.forEach((pl, key) => {
			const playlistCard = document.createElement("div");
			playlistCard.classList.add("playlist-card");

			const image = new Image();
			image.src = pl.images[0].url;
			image.crossOrigin = "anonymous";
			image.height = "100%";
			image.style.display = "none";
			image.onload = () => {
				const avgClr = getAverageRGB(image);

				if (!key) {
					defaultColor = avgClr;
					document.body.style.setProperty("background-color", `rgb(${defaultColor.r}, ${defaultColor.g}, ${defaultColor.b})`);
				}

				playlistCard.onmouseenter = () => {
					//Set background to gradient
					document.body.style.setProperty("background-color", `rgb(${avgClr.r}, ${avgClr.g}, ${avgClr.b})`);
					//document.body.style.setProperty("background", `linear-gradient(rgb(${avgClr.r}, ${avgClr.g}, ${avgClr.b}) 0%, #191414 60%)`);
				};
				playlistCard.onmouseleave = () => {
					document.body.style.setProperty("background-color", `rgb(${defaultColor.r}, ${defaultColor.g}, ${defaultColor.b})`);
					//document.body.style.setProperty("background", "linear-gradient(rgb(60, 60, 60) 0%, rgb(0, 0, 0) 100%)");
				};
			};

			playlistCard.innerHTML = `
				<div class="playlist-details">
					<img class="playlist-image" src=${pl.images[0].url} height="100%" crossorigin="anonymous" />
					<p class="playlist-name" id="playlist-name" ${pl.name.split(/\s/).find((w) => w.length > 12) ? 'style="word-break: break-all;"' : ""}>${pl.name}</p>
				</div>
				<div class="play-button bright-accent">
					<svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 16 16" height="24px" width="24px">
						<path
							d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z">
						</path>
					</svg>
				</div>
			`;
			document.getElementById("playlists").appendChild(playlistCard);
		});
});
