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
}
