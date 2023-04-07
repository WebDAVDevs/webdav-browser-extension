chrome.tabs.query({
    currentWindow: true,
    active: true
}, (tabs) => {
    if (tabs.length !== 1) {
        return
    }
    let activeTab = tabs[0]
    let davUrl = activeTab.url
    // insertWebdavJs(activeTab.id)
    storeTheUrlAsKnown(davUrl)
})

function saveNewWebDavSettings(newWebDavSettings, davUrl) {
    if (newWebDavSettings.knownDavs.includes(davUrl)) {
        console.log('davUrl already known ', davUrl)
        return
    }
    newWebDavSettings.knownDavs.push(davUrl)
    console.log('newWebDavSettings ', newWebDavSettings)
    chrome.storage.local.set(newWebDavSettings)
}

/**
 * @param {Function} callback
 */
function getDavSettings(callback) {
    chrome.storage.local.get(function (storedWebDavSettings) {
        console.log('storedWebDavSettings ', storedWebDavSettings)
        let newWebDavSettings = {knownDavs: []}
        if (storedWebDavSettings) {
            newWebDavSettings = storedWebDavSettings
            if (!newWebDavSettings.knownDavs) {
                newWebDavSettings.knownDavs = []
            }
        }
        callback(newWebDavSettings)
    })
}

function storeTheUrlAsKnown(davUrl) {
    getDavSettings((davSettings) => saveNewWebDavSettings(davSettings, davUrl))
}

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