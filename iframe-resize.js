function iframeResize(frameid) {
	var iFrameID = document.getElementById(frameid);
	if (iFrameID) {
		// Setting the iframe height dynamically with its content height
		iFrameID.height = "";
		iFrameID.height = iFrameID.contentWindow.document.body.scrollHeight + 4 + "px";
	}
}
