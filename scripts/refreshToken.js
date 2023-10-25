// REQUIRES /scripts/apidata.js TO BE LOADED FIRST
//Check every 30s for refresh token
setInterval(() => {
	updateRefreshTokenIfExpired();
}, 30000);
