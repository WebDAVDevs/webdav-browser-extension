import * as settings from './DavSettings'

// Where we will expose all the data we retrieve from storage.local.
const webDavSettings = new settings.DavSettings()

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
  let knownIdx = webDavSettings.isKnown(status.url)
  return knownIdx >= 0
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
