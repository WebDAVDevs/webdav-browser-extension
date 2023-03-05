chrome.tabs.query({
    currentWindow: true,
    active: true
}, (tabs) => {
    if (tabs.length !== 1) {
        return
    }
    insertWebdavJs(tabs[0])
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

function clearBody(){
    console.log("Clear existing body if any")
    document.body.innerHTML = ""
}