chrome.tabs.query({
    currentWindow: true,
    active: true
}, (tabs) => {
    if (tabs.length !== 1) {
        return
    }
    let activeTab = tabs[0];
    insertWebdavJs(activeTab)
    let davUrl = activeTab.url

    chrome.storage.local.get(function (storedWebDavSettings) {
        console.log('storedWebDavSettings ', storedWebDavSettings)
        let newWebDavSettings = {knownDavs: []}
        if (storedWebDavSettings) {
            newWebDavSettings = storedWebDavSettings
            if (!newWebDavSettings.knownDavs) {
                newWebDavSettings.knownDavs = []
            }
        }
        newWebDavSettings.knownDavs.push(davUrl)
        console.log('newWebDavSettings ', newWebDavSettings)
        chrome.storage.local.set(newWebDavSettings)
    })
})

function insertWebdavJs(tab) {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: clearBody,
    })
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['webdav-min.js']
    })
    chrome.scripting.insertCSS({
        target: {tabId: tab.id},
        files: ['style-min.css'],
    })
}

function clearBody() {
    console.log("Clear existing body if any")
    document.body.innerHTML = ""
}