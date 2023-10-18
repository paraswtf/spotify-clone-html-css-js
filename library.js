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
	button.onclick = () => {
		if (typeof isReset === "string") filter = filterValues.find((filterValue) => filterValue.id == isReset);
		else filter = isReset ? defaultFilter : filterobj;
		renderFilterButtons();
		renderContent();
		console.log(filter);
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

var consolidatedData = undefined;

async function fetchData() {
	if (consolidatedData) return consolidatedData;

	consolidatedData = {
		playlists: [],
		podcasts: [],
		shows: [],
		albums: [],
		artists: []
	};

	await makeAuthorizedRequest("https://api.spotify.com/v1/me/playlists")
		.then((response) => response.json())
		.then(async (data) => {
			consolidatedData.playlists = data.items || [];
			while (data.next) {
				data = await makeAuthorizedRequest(data.next).then((d) => d.json());
				consolidatedData.playlists.push(...data.items.filter((i) => !!i));
			}
		});

	consolidatedData.podcasts = await makeAuthorizedRequest("https://api.spotify.com/v1/me/shows")
		.then((response) => response.json())
		.then((data) => data.items);

	consolidatedData.shows = await makeAuthorizedRequest("https://api.spotify.com/v1/me/shows")
		.then((response) => response.json())
		.then((data) => data.items);

	consolidatedData.albums = await makeAuthorizedRequest("https://api.spotify.com/v1/me/albums")
		.then((response) => response.json())
		.then((data) => data.items);

	consolidatedData.artists = await makeAuthorizedRequest("https://api.spotify.com/v1/me/following?type=artist")
		.then((response) => response.json())
		.then((data) => data.artists.items);

	return consolidatedData;
}

function renderContent() {
	var content = document.querySelector(".loaded-content");
	content.innerHTML = "";

	fetchData().then((d) => {
		switch (filter.id) {
			case "playlists":
				console.log(d.playlists);
				d.playlists.map((pl) => generateStyledItem(pl.images[0].url, pl.name, "Playlist", pl.owner.display_name)).forEach((e) => content.appendChild(e));
				break;
			case "playlists:you":
				d.playlists
					.filter((pl) => pl.owner.display_name === "paraswtf")
					.map((pl) => generateStyledItem(pl.images[0].url, pl.name, "Playlist", pl.owner.display_name))
					.forEach((e) => content.appendChild(e));
				break;
			case "playlists:spotify":
				d.playlists
					.filter((pl) => pl.owner.display_name === "Spotify")
					.map((pl) => generateStyledItem(pl.images[0].url, pl.name, "Playlist", pl.owner.display_name))
					.forEach((e) => content.appendChild(e));
				break;
			case "artists":
				d.artists.map((ar) => generateStyledItem(ar.images[0].url, ar.name, "Artist")).forEach((e) => content.appendChild(e));
				break;
			case "podcasts":
				d.podcasts.map((pd) => generateStyledItem(pd.show.images[0].url, pd.show.name, "Podcast", pd.show.publisher)).forEach((e) => content.appendChild(e));
				break;
			case "albums":
				d.albums.map((a) => generateStyledItem(a.album.images[0].url, a.album.name, "Album", a.album.label)).forEach((e) => content.appendChild(e));
				break;
			case "none":
			default:
				d.playlists.map((pl) => generateStyledItem(pl.images[0].url, pl.name, "Playlist", pl.owner.display_name)).forEach((e) => content.appendChild(e));
				d.artists.map((ar) => generateStyledItem(ar.images[0].url, ar.name, "Artist")).forEach((e) => content.appendChild(e));
				d.podcasts.map((pd) => generateStyledItem(pd.show.images[0].url, pd.show.name, "Podcast", pd.show.publisher)).forEach((e) => content.appendChild(e));
				d.albums.map((a) => generateStyledItem(a.album.images[0].url, a.album.name, "Album", a.album.label)).forEach((e) => content.appendChild(e));
				break;
		}
	});
}

function generateStyledItem(imageUrl, title, type, by) {
	const containerStyle = parseInlineStyles(`
        display: flex;
        flex-direction: row;
    `);
	const textContainerStyle = parseInlineStyles(`
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: 10px;
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `);
	const imageStyle = parseInlineStyles(`
        border-radius: ${by ? "4px" : "25px"};
    `);
	var item = document.createElement("div");
	item.style = containerStyle;
	item.classList.add("item");
	item.innerHTML = `
        <img src="${imageUrl}" alt="${title}" height="50px" width="50px" style="${imageStyle}"/>
        <div style="${textContainerStyle}">
            <p class="item-title" style="${titleStyle}">${title}</p>
            <div class="item-text" style="${itemTextStyle}">
                <p class="item-type" style="margin:0px">${type}</p>
                ${
					by
						? `
                        <div style="height: 4px; width: 4px; background-color:var(--essential-subdued); border-radius:2px;"></div>
                            <p class="item-by" style="margin:0px">${by}</p>
                        `
						: ""
				}
            </div>
        </div>
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
