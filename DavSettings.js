export class DavSettings {
  /** @type string[] */
  knownDavs= []

  /**
   * @param {string} currentUrl
   */
  isKnown (currentUrl) {
    let knownIdx = this.knownDavs.findIndex((val) => currentUrl.startsWith(val))
    console.log('search for ', currentUrl, ' in list of knownDavs ', this.knownDavs, ' knownIdx: ', knownIdx)
    return knownIdx
  }

  /**
   * @param {string} currentUrl
   */
  isKnownDavUrl (currentUrl) {
    let knownIdx = this.isKnown(currentUrl)
    return knownIdx >= 0
  }

  /**
   * @param {string} currentUrl
   */
  toggleKnownDavUrl (currentUrl) {
    let knownIdx = this.isKnown(currentUrl)
    if (knownIdx >= 0) {
      this.knownDavs.splice(knownIdx, 1)
      return false
    } else {
      this.knownDavs.push(currentUrl)
      return true
    }
  }
}
