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
    if (area === 'local' && changes.knownDavs?.newValue) {
        webDavSettings.knownDavs = changes.knownDavs?.newValue
        console.log('webDavSettings.knownDavs', webDavSettings.knownDavs)
    }
})

function suggester(status) {
    if (status.type !== 'main_frame') {
        return
    }
    console.log('onCompleted')
    console.log(status)
    if (status.type === 'main_frame' && status.method === 'GET') {
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
        if (noHtmlReturned) {
            //TODO Check OPTIONS or even PROPFIND directly
        }
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