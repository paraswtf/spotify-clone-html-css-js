xSVG = `<svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" data-encore-id="icon" class="Svg-sc-ytk21e-0 haNxPq" fill="var(--text-subdued)"><path d="M1.47 1.47a.75.75 0 0 1 1.06 0L8 6.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L9.06 8l5.47 5.47a.75.75 0 1 1-1.06 1.06L8 9.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L6.94 8 1.47 2.53a.75.75 0 0 1 0-1.06z"></path></svg>`;
const defaultFilter = {
	name: "None",
	id: "none"
};

const filterValues = [
	{
		name: "Playlists",
		id: "playlists"
	},
	{
		name: "Podcasts & Shows",
		id: "podcasts"
	},
	{
		name: "Albums",
		id: "albums"
	},
	{
		name: "Artists",
		id: "artists"
	}
];

const playlistFilterValues = [
	{
		name: "By You",
		id: "playlists:you"
	},
	{
		name: "By Spotify",
		id: "playlists:spotify"
	}
];

var filter = defaultFilter;

function createFilterButton(filterobj, isReset = false, disableActiveEffect = false) {
	var button = document.createElement("p");
	button.classList.add("filter-button");
	if (!disableActiveEffect && isReset) button.classList.add("active");
	button.id = filterobj.id;
	button.innerText = filterobj.name;
	button.style.marginBlock = 0;
	button.onclick = () => {
		if (typeof isReset === "string") filter = filterValues.find((filterValue) => filterValue.id == isReset);
		else filter = isReset ? defaultFilter : filterobj;
		renderFilterButtons();
		renderContent();
	};
	return button;
}

function renderFilterButtons() {
	var filterButtons = document.querySelector(".filter-buttons");
	filterButtons.innerHTML = "";

	if (filter.id != "none") {
		const btn = createFilterButton(
			{
				name: "x",
				id: "none"
			},
			true,
			true
		);
		btn.innerHTML = xSVG;
		btn.style.padding = "6px";
		filterButtons.appendChild(btn);
	}

	switch (filter.id) {
		case "none":
			for (let filterValue of filterValues) {
				filterButtons.appendChild(createFilterButton(filterValue));
			}
			break;
		case "playlists:you":
			var button = createFilterButton(
				playlistFilterValues.find((filterValue) => filterValue.id == "playlists:you"),
				"playlists"
			);
			button.classList.add("overridden-button");
			filterButtons.appendChild(
				createFilterButton(
					filterValues.find((filterValue) => filterValue.id == "playlists"),
					true
				)
			);
			filterButtons.appendChild(button);
			break;
		case "playlists:spotify":
			var button = createFilterButton(
				playlistFilterValues.find((filterValue) => filterValue.id == "playlists:spotify"),
				"playlists"
			);
			button.classList.add("overridden-button");
			filterButtons.appendChild(
				createFilterButton(
					filterValues.find((filterValue) => filterValue.id == "playlists"),
					true
				)
			);
			filterButtons.appendChild(button);
			break;
		case "playlists":
			filterButtons.appendChild(
				createFilterButton(
					filterValues.find((filterValue) => filterValue.id == "playlists"),
					true
				)
			);
			for (let filterValue of playlistFilterValues) {
				filterButtons.appendChild(createFilterButton(filterValue));
			}
			break;
		default:
			filterButtons.appendChild(createFilterButton(filter, true));
			break;
	}
}

function renderContent() {
	var content = document.querySelector(".loaded-content");
	content.innerHTML = "";

	fetchData().then((d) => {
		switch (filter.id) {
			case "playlists":
				d.playlists.map((pl) => generateStyledItem(pl.images[0].url, pl.name, "Playlist", pl.owner.display_name, `/${pl.type}/${pl.id}`)).forEach((e) => content.appendChild(e));
				break;
			case "playlists:you":
				d.playlists
					.filter((pl) => pl.owner.display_name === localStorage.getItem("display_name"))
					.map((pl) => generateStyledItem(pl.images[0].url, pl.name, "Playlist", pl.owner.display_name, `/${pl.type}/${pl.id}`))
					.forEach((e) => content.appendChild(e));
				break;
			case "playlists:spotify":
				d.playlists
					.filter((pl) => pl.owner.display_name === "Spotify")
					.map((pl) => generateStyledItem(pl.images[0].url, pl.name, "Playlist", pl.owner.display_name, `/${pl.type}/${pl.id}`))
					.forEach((e) => content.appendChild(e));
				break;
			case "artists":
				d.artists.map((ar) => generateStyledItem(ar.images[0].url, ar.name, "Artist", undefined, `/${ar.type}/${ar.id}`)).forEach((e) => content.appendChild(e));
				break;
			case "podcasts":
				d.podcasts.map((pd) => generateStyledItem(pd.show.images[0].url, pd.show.name, "Podcast", pd.show.publisher, `/${pd.show.type}/${pd.show.id}`)).forEach((e) => content.appendChild(e));
				break;
			case "albums":
				d.albums.map((a) => generateStyledItem(a.album.images[0].url, a.album.name, "Album", a.album.label, `/${a.album.type}/${a.album.id}`)).forEach((e) => content.appendChild(e));
				break;
			case "none":
			default:
				d.playlists.map((pl) => generateStyledItem(pl.images[0].url, pl.name, "Playlist", pl.owner.display_name, `/${pl.type}/${pl.id}`)).forEach((e) => content.appendChild(e));
				d.artists.map((ar) => generateStyledItem(ar.images[0].url, ar.name, "Artist", undefined, `/${ar.type}/${ar.id}`)).forEach((e) => content.appendChild(e));
				d.podcasts.map((pd) => generateStyledItem(pd.show.images[0].url, pd.show.name, "Podcast", pd.show.publisher, `/${pd.show.type}/${pd.show.id}`)).forEach((e) => content.appendChild(e));
				d.albums.map((a) => generateStyledItem(a.album.images[0].url, a.album.name, "Album", a.album.label, `/${a.album.type}/${a.album.id}`)).forEach((e) => content.appendChild(e));
				break;
		}
	});
}

function generateStyledItem(imageUrl, title, type, by, url) {
	const containerStyle = parseInlineStyles(`
        display: flex;
        flex-direction: row;
        width: 80%;
    `);
	const textContainerStyle = parseInlineStyles(`
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: 10px;
		width: 100%;
    `);
	const titleStyle = parseInlineStyles(`
        font-size: 16px;
        font-weight: 500;
        margin: 0;
        font-family: 'Circular Sp Ara Light Web';
        color: var(--text);
    `);
	const itemTextStyle = parseInlineStyles(`
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
        font-size: 14px;
        font-weight: 400;
        margin: 0;
        font-family: 'Circular Sp Ara Light Web';
        color: var(--text-subdued);
    `);
	const imageStyle = parseInlineStyles(`
        border-radius: ${by ? "4px" : "25px"};
    `);
	var item = document.createElement("div");
	item.style = containerStyle;
	item.classList.add("item");
	item.innerHTML = `
		<a href="${url || "/home.html"}" style="text-decoration: none; color: inherit; display: flex; width: 100%" target="right">
			<img src="${imageUrl}" alt="${title}" height="50px" width="50px" style="${imageStyle}" loading="lazy"/>
			<div style="${textContainerStyle}">
				<p class="item-title" style="${titleStyle}">${title}</p>
				<div class="item-text" style="${itemTextStyle}">
					<p class="item-type" style="margin:0px;">${type}</p>
					${
						by
							? `
							<div style="display: block; height: 4px; min-width: 4px; width: 4px; background-color:var(--essential-subdued); border-radius:2px;"></div>
								<p class="item-by" style="margin:0px; width:100%; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${by}</p>
							`
							: ""
					}
				</div>
			</div>
		</a>
    `;
	return item;
}

function parseInlineStyles(style) {
	return style.replace(/\:\s/g, ":").replace(/\n/g, "");
}

window.addEventListener("load", () => {
	renderFilterButtons();
	renderContent();
});
