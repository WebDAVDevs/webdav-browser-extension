class DavSettings {
  /**
   * @param {string[]} knownDavs
   */
  constructor (knownDavs) {
    this.knownDavs = knownDavs
  }
}

/**
 * @param {string} currentUrl
 * @param {string[]} knownDavs
 * @returns {int}
 */
function isKnown (currentUrl, knownDavs) {
  let knownIdx = knownDavs.findIndex((val) => currentUrl.startsWith(val))
  console.log('search for ', currentUrl, ' in list of knownDavs ', knownDavs, ' knownIdx: ', knownIdx)
  return knownIdx
}

chrome.tabs.query({
  currentWindow: true,
  active: true
}, (tabs) => {
  if (tabs.length !== 1) {
    return
  }
  let activeTab = tabs[0]
  let currentUrl = activeTab.url
  getDavSettings((davSettings) => checkDavRender(davSettings, currentUrl, activeTab.id))
})

/**
 * @param {DavSettings} webDavSettings
 * @param {string} currentUrl
 * @param {int} tabId
 */
function checkDavRender (webDavSettings, currentUrl, tabId) {
  let knownIdx = isKnown(currentUrl, webDavSettings.knownDavs)
  if (knownIdx < 0) {
    console.log('store currentUrl as known ', currentUrl)
    webDavSettings.knownDavs.push(currentUrl)
    saveNewWebDavSettings(webDavSettings)
    insertWebdavJs(tabId)
  } else {
    console.log('currentUrl already known, disabling ', currentUrl, knownIdx)
    webDavSettings.knownDavs = removeFromArray(webDavSettings.knownDavs, knownIdx)
    saveNewWebDavSettings(webDavSettings)
    setTimeout(() => chrome.tabs.reload(tabId), 500)
  }
}

function saveNewWebDavSettings (newWebDavSettings) {
  console.log('newWebDavSettings ', newWebDavSettings)
  chrome.storage.local.set(newWebDavSettings)
}

function removeFromArray (arr, rmIdx) {
  let newArr = []
  for (let i = 0; i < arr.length; i++) {
    if (i !== rmIdx) {
      newArr.push(arr[i])
    }
  }
  return newArr
}

/**
 * @param {Function} callback
 */
function getDavSettings (callback) {
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

function insertWebdavJs (tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['webdav-min.js']
  })
  chrome.scripting.insertCSS({
    target: { tabId: tabId },
    files: ['style-min.css'],
  })
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['loadWebdavJs.js']
  })
}
