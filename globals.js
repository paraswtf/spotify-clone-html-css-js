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
