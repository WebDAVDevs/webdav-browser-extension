class DavSettings {
    /**
     * @param {string[]} knownDavs
     */
    constructor(knownDavs) {
        this.knownDavs = knownDavs
    }
}

// Where we will expose all the data we retrieve from storage.local.
const webDavSettings = new DavSettings([])

// Asynchronously retrieve data from storage.sync, then cache it.
chrome.storage.local.get().then((storedWebDavSettings) => {
    // Copy the data retrieved from storage into webDavSettings.
    Object.assign(webDavSettings, storedWebDavSettings)
})

chrome.storage.onChanged.addListener((changes, area) => {
    console.log('storage changed ', area, changes)
    if (area === 'local' && changes.knownDavs) {
        webDavSettings.knownDavs = changes.knownDavs.newValue
        console.log('webDavSettings.knownDavs', webDavSettings.knownDavs)
    }
})

function urlHasDav(url) {
    return url.includes("//dav.") || // dav subdomain
        url.includes("//webdav.") ||
        url.includes("/dav/") ||  // dav folder in url
        url.includes("/webdav/")
}

function suggester(status) {
    if (!(status.type == 'main_frame' && status.method === 'GET' && status.url.endsWith("/"))) {
        return
    }
    console.log('onCompleted')
    console.log(status)
    // index.html or dir listing with status 200
    let htmlReturned = status.statusCode === 200
    // if no index.html or dir listing then will be 403 or in case of Golang 405
    let noHtmlReturned = status.statusCode === 403 || status.statusCode === 405;
    if (htmlReturned || noHtmlReturned) {
        console.log('DAV?')
        if (isDav(status)) {
            insertWebdavJs(status.tabId)
            return
        }
    }
    if (noHtmlReturned || urlHasDav(status.url)) {
        console.log('High chance of DAV')
        // Try PROPFIND
        fetch(status.url, {method: 'PROPFIND', headers: {Depth: 0}, credentials: "include"})
            .then(response => response.text())
            .then(propfindXml => checkPropfindResp(propfindXml, status.tabId))
            .catch(error => console.log('Error:', error))
    }
}

function checkPropfindResp(propfindXml, tabId) {
    // Does it have <D:multistatus>?
    if (propfindXml.includes('multistatus')) {
        console.log('yep, this is dav')
        insertWebdavJs(tabId)
    }
}

function isDav(status) {
    // If it has a DAV header specifically set then yes
    if (status.responseHeaders['DAV']) {
        console.log('Has DAV header')
        return true
    }
    let url = status.url
    console.log('search for ', url, ' in list of knownDavs ', webDavSettings.knownDavs)
    let knownIdx = webDavSettings.knownDavs.findIndex((val) => val.startsWith(url))
    console.log('found idx ', knownIdx)
    return knownIdx != -1
}

chrome.webRequest.onCompleted.addListener(
    suggester,
    {urls: ['<all_urls>']},
    ["responseHeaders"]
)

function insertWebdavJs(tabId) {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        func: clearBody,
    })
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        files: ['webdav-min.js']
    })
    chrome.scripting.insertCSS({
        target: {tabId: tabId},
        files: ['style-min.css'],
    })
}

function clearBody() {
    console.log("Clear existing body if any")
    document.body.innerHTML = ""
}