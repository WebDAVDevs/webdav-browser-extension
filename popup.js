class DavSettings {
    /**
     * @param {string[]} knownDavs
     */
    constructor(knownDavs) {
        this.knownDavs = knownDavs
    }
}

chrome.tabs.query({
    currentWindow: true,
    active: true
}, (tabs) => {
    if (tabs.length !== 1) {
        return
    }
    let activeTab = tabs[0]
    let davUrl = activeTab.url
    getDavSettings((davSettings) => checkDavRender(davSettings, davUrl, activeTab.id))
})

/**
 *
 * @param {DavSettings} davSettings
 * @param {string} davUrl
 * @param {int} tabId
 */
function checkDavRender(davSettings, davUrl, tabId) {
    let knownIdx = davSettings.knownDavs.indexOf(davUrl);
    if (knownIdx < 0) {
        console.log('store davUrl as known ', davUrl)
        davSettings.knownDavs.push(davUrl)
        saveNewWebDavSettings(davSettings)
        insertWebdavJs(tabId)
    } else {
        console.log('davUrl already known, disabling ', davUrl, knownIdx)
        davSettings.knownDavs = removeFromArray(davSettings.knownDavs, knownIdx)
        console.log('davUrl already known, knownDavs ', davSettings.knownDavs)
        saveNewWebDavSettings(davSettings)
        setTimeout(() => chrome.tabs.reload(tabId), 500)
        return
    }
}

function saveNewWebDavSettings(newWebDavSettings) {
    console.log('newWebDavSettings ', newWebDavSettings)
    chrome.storage.local.set(newWebDavSettings)
}

function removeFromArray(arr, rmIdx) {
    let newArr = []
    for (let i = 0; i < arr.length; i++) {
        if (i != rmIdx) {
            newArr.push(arr[i])
        }
    }
    return newArr;
}

/**
 * @param {Function} callback
 */
function getDavSettings(callback) {
    chrome.storage.local.get(function (storedWebDavSettings) {
        console.log('storedWebDavSettings ', storedWebDavSettings)
        let newWebDavSettings = new DavSettings([])
        if (storedWebDavSettings) {
            newWebDavSettings = storedWebDavSettings
            if (!newWebDavSettings.knownDavs) {
                newWebDavSettings.knownDavs = []
            }
        }
        callback(newWebDavSettings)
    })
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