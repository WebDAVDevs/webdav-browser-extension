import { DavSettings } from './DavSettings.js'

async function actionClick (e) {
  let tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true
  })
  if (tabs.length !== 1) {
    return
  }
  let activeTab = tabs[0]
  let currentUrl = activeTab.url
  let davSettings = await getDavSettings()
  checkDavRender(davSettings, currentUrl, activeTab.id)
}

/**
 * @param {DavSettings} webDavSettings
 * @param {string} currentUrl
 * @param {int} tabId
 */
function checkDavRender (webDavSettings, currentUrl, tabId) {
  let known = webDavSettings.toggleKnownDavUrl(currentUrl)
  saveNewWebDavSettings(webDavSettings)
  if (known) {
    insertWebdavJs(tabId)
  } else {
    setTimeout(() => chrome.tabs.reload(tabId), 500)
  }
}

function saveNewWebDavSettings (newWebDavSettings) {
  console.log('newWebDavSettings ', newWebDavSettings)
  chrome.storage.local.set(newWebDavSettings)
}

async function getDavSettings () {
  let storedWebDavSettings = await chrome.storage.local.get()
  console.log('storedWebDavSettings ', storedWebDavSettings)
  let newWebDavSettings = new DavSettings()
  if (storedWebDavSettings) {
    Object.assign(newWebDavSettings, storedWebDavSettings)
  }
  return newWebDavSettings
}

await actionClick()