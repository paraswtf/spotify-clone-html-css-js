// Keys
const clientId = "c6f9e1f89bf44ab0888ced219203d6bd";
const redirectUri = "https://paraswtf-spotify-clone.vercel.app/callback.html";
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

function getMainWindow() {
	var cur = window;
	while (cur.parent != cur) {
		cur = cur.parent;
	}
	return cur;
}

// Methods

async function makeAuthorizedRequest(url, options, force) {
	await updateRefreshTokenIfExpired();

	//Check cached data
	const cache = await window.caches.open("spotify-web-api-cache");
	if (!force) {
		const cachedResponse = await cache?.match(url, options);
		if (cachedResponse) return cachedResponse;
	}

	let accessToken = localStorage.getItem("access_token");

	if (!options) {
		options = {};
	}

	if (!options.headers) {
		options.headers = {};
	}

	options.headers.Authorization = "Bearer " + accessToken;
	options.headers["Content-Type"] = "application/json";

	return fetch(url, options).then(async (res) => {
		if (res.status == 401) {
			await requestAuth();
		} else {
			cache.put(url, res.clone());
			return res;
		}
	});
}

//Handles refreshing token
async function updateRefreshTokenIfExpired() {
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

	return await fetch("https://accounts.spotify.com/api/token", {
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
			localStorage.setItem("expires", Date.now() + data.expires_in * 1000);
		})
		.catch((error) => {
			console.error("Error:", error);
		});
}

async function requestAuth() {
	console.log("Requesting auth");
	//Store the redirect URI in local storage
	//So that user can be redirected back to the same page
	localStorage.setItem("redirect", getMainWindow().location.href);

	function generateRandomString(length) {
		let text = "";
		let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (let i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}

	async function generateCodeChallenge(codeVerifier) {
		function base64encode(string) {
			return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
				.replace(/\+/g, "-")
				.replace(/\//g, "_")
				.replace(/=+$/, "");
		}

		const encoder = new TextEncoder();
		const data = encoder.encode(codeVerifier);
		const digest = await window.crypto.subtle.digest("SHA-256", data);

		return base64encode(digest);
	}

	//Request authentication
	let codeVerifier = generateRandomString(128);

	await generateCodeChallenge(codeVerifier).then((codeChallenge) => {
		let state = generateRandomString(16);

		localStorage.setItem("code_verifier", codeVerifier);

		let args = new URLSearchParams({
			response_type: "code",
			client_id: clientId,
			scope: scopes.join(" "),
			redirect_uri: redirectUri,
			state: state,
			code_challenge_method: "S256",
			code_challenge: codeChallenge
		});

		getMainWindow().location = "https://accounts.spotify.com/authorize?" + args;
	});
}

async function handleCallback() {
	let urlParams = new URLSearchParams(window.location.search);
	let code = urlParams.get("code");
	let error = urlParams.get("error");

	if (error) {
		document.write("Error: " + error);
	} else if (!code) {
		document.write("No code provided");
	} else {
		document.write("Redirecting you back...");

		let codeVerifier = localStorage.getItem("code_verifier");

		let body = new URLSearchParams({
			grant_type: "authorization_code",
			code: code,
			redirect_uri: redirectUri,
			client_id: clientId,
			code_verifier: codeVerifier
		});

		//Get auth token
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
				response.json().then((data) => {
					localStorage.removeItem("code_verifier");
					localStorage.setItem("refresh_token", data.refresh_token);
					localStorage.setItem("access_token", data.access_token);
					localStorage.setItem("expires", Date.now() + data.expires_in * 1000);
					//Redirect to page after login
					let redirect = localStorage.getItem("redirect");
					localStorage.removeItem("redirect");
					window.location = redirect || "/";
				});
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	}
}

async function getProfile() {
	return await makeAuthorizedRequest("https://api.spotify.com/v1/me/", undefined, true)
		.then(async (response) => {
			if (response.status == 401) {
				await requestAuth();
			}
			return await response.json().then((data) => {
				localStorage.setItem("display_name", data.display_name);
				return data;
			});
		})
		.catch((error) => {
			console.log("Error:", error);
		});
}
