import { DavSettings } from './DavSettings.js'

const webDavSettings = new DavSettings()
let storedWebDavSettings = await chrome.storage.sync.get()
Object.assign(webDavSettings, storedWebDavSettings)
console.log('loaded', webDavSettings)

// update webDavSettings when it was changed on remote
chrome.storage.onChanged.addListener((changes, area) => {
  if (changes.knownDavs) {
    webDavSettings.knownDavs = changes.knownDavs.newValue
    console.log('webDavSettings.knownDavs', webDavSettings.knownDavs)
  }
})

browser.action.onClicked.addListener(actionToggleClick)

async function actionToggleClick (e) {
  let tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true
  })
  if (tabs.length !== 1) {
    return
  }
  let activeTab = tabs[0]
  let currentUrl = activeTab.url
  let known = webDavSettings.toggleKnownDavUrl(currentUrl)
  saveNewWebDavSettings(webDavSettings)
  if (known) {
    insertWebdavJs(activeTab.id)
  } else {
    setTimeout(() => chrome.tabs.reload(activeTab.id), 500)
  }
}

function saveNewWebDavSettings (newWebDavSettings) {
  console.log('newWebDavSettings ', newWebDavSettings)
  chrome.storage.sync.set(newWebDavSettings)
}

function urlHasDav (url) {
  return url.includes('//dav.') || // dav subdomain
    url.includes('//webdav.') ||
    url.includes('/dav/') ||  // dav folder in url
    url.includes('/webdav/') ||
    url.includes('//svn.')
}

function suggester (status) {
  if (!(status.type === 'main_frame' && status.method === 'GET' && status.url.endsWith('/'))) {
    return
  }
  // index.html or dir listing with status 200
  let htmlReturned = status.statusCode === 200
  // if no index.html or dir listing then will be 403 or in case of Golang 405
  let noHtmlReturned = status.statusCode === 403 || status.statusCode === 405
  if (htmlReturned || noHtmlReturned) {
    console.log('DAV?')
    if (isDav(status)) {
      insertWebdavJs(status.tabId)
      return
    }
  }
  if (noHtmlReturned || urlHasDav(status.url)) {
    console.log('High chance of DAV')
    insertWebdavJs(status.tabId)
  }
}

function isDav (status) {
  // If it has a DAV header specifically set then yes
  if (status.responseHeaders['DAV']) {
    console.log('Has DAV header')
    return true
  }
  return webDavSettings.isKnownDavUrl(status.url)
}

chrome.webRequest.onCompleted.addListener(
  suggester,
  { urls: ['<all_urls>'] },
  ['responseHeaders']
)

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
