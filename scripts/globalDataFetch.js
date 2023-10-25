//Make it so that the data fetching is done globally and doesn't need to be fetched again and again
// TODO - Use 'yield' to make it even faster

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
