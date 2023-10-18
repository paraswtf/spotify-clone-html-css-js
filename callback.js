const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get("code");

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
		return response.json();
	})
	.then((data) => {
		localStorage.removeItem("code_verifier");
		localStorage.setItem("refresh_token", data.refresh_token);
		localStorage.setItem("access_token", data.access_token);
		localStorage.setItem("expires", Date.now() + data.expires * 1000);
	})
	.catch((error) => {
		console.error("Error:", error);
	});

//window.location = "/";

async function getProfile() {
	let accessToken = localStorage.getItem("access_token");

	const response = await fetch("https://api.spotify.com/v1/me", {
		headers: {
			Authorization: "Bearer " + accessToken
		}
	});

	const data = await response.json();
}
getProfile();
