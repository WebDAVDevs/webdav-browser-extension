function checkWebdavEnabled() {
	console.log("Check for WebDAV: Try  PROPFIND")
	let currentUrl = document.location.href
	fetch(currentUrl, {method: 'PROPFIND', headers: {Depth: 0}, credentials: "include"})
		.then(response => response.text())
		.then(propfindXml => checkPropfindResp(propfindXml))
		.catch(error => console.log('Error:', error))
}

function checkPropfindResp(propfindXml, tabId, davUrl) {
	// Does it have <D:multistatus>?
	if (propfindXml.includes('multistatus')) {
		console.log('yep, this is dav')
		clearBody()
		initializeDavUi()
	}
}

function clearBody() {
	console.log("Clear existing body if any")
	document.body.innerHTML = ""
}

checkWebdavEnabled()
