const clientId = "bb8fbe5239ca418b9a76d835883b5c69";
const redirectUri = "http://localhost:81/callback.html";
const scopes = [
	"user-read-playback-state",
	"user-modify-playback-state",
	"user-read-currently-playing",
	"app-remote-control",
	"playlist-read-private",
	"streaming",
	"playlist-read-collaborative",
	"playlist-modify-public",
	"playlist-modify-private",
	"user-follow-modify",
	"user-follow-read",
	"user-read-playback-position",
	"user-top-read",
	"user-read-recently-played",
	"user-library-modify",
	"user-library-read",
	"user-read-email",
	"user-read-private"
];
const scope = scopes.join(" ");

function makeAuthorizedRequest(url, options) {
	let accessToken = localStorage.getItem("access_token");

	if (!options) {
		options = {};
	}

	if (!options.headers) {
		options.headers = {};
	}

	options.headers.Authorization = "Bearer " + accessToken;
	options.headers["Content-Type"] = "application/json";

	return fetch(url, options);
}

function refreshToken() {
	if (!localStorage.getItem("refresh_token")) {
		return;
	}
	if (!localStorage.getItem("expires") || parseInt(localStorage.getItem("expires")) > Date.now()) {
		return;
	}

	let body = new URLSearchParams({
		grant_type: "refresh_token",
		refresh_token: localStorage.getItem("refresh_token"),
		client_id: clientId
	});

	fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: body
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP status " + response.status);
			}
			return response.json();
		})
		.then((data) => {
			console.log("Token refreshed");
			localStorage.setItem("refresh_token", data.refresh_token);
			localStorage.setItem("access_token", data.access_token);
		})
		.catch((error) => {
			console.error("Error:", error);
		});
}
