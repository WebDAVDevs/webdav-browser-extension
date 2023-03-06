# webdav-browser-extension
Chrome extension to browse a URL as a WebDAV share.

![screenshot](screenshot.png)

Open WebDAV folder in a browser and you'll have ether 403 error or just a plain directory listing.
Then click on the addon button and it will make a file manager from the folder where you can watch, upload, delete files and direcotries.

See [usage video](usage.gif) 

It just uses the https://github.com/dom111/webdav-js
But instead of a bookmarklet you can use it as an extension.

## TODO and known problems
* You need a dir listing enabled otherwise it will fail due to a bug https://github.com/dom111/webdav-js/issues/123
* Remember folders that should be viewed as dav
* Use a state as for Dark Reader or tutorial.focus-mode. The current popup solution is lame.
* Autodetect a webdav share:
  * On 403 error we can try a PROPFIND or OPTIONS. If it was successful then load the UI.
  * `DAV: 1,2,3` header is already in use but returned only on OPTIONS. Maybe add it on `GET /` 403 error?
  * `Alt-Svc: dav` header https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Alt-Svc But nobody will set the header
  * If the directory has a listing with a `<title>Index of ...</title>` then it may have a dav version too but unlikely.
* Option to load the webdav-js directly from CDN with a latest version
* Open any WebDAV server e.g. just as an app. See also https://github.com/dom111/webdav-js/issues/120

## Install
* Firefox https://addons.mozilla.org/en-US/firefox/addon/webdav-browser/
* Chrome: TBD (I don't have a dev account)

## See also
* [Awesome WebDAV](https://github.com/stokito/awesome-webdav) list of useful software and services for WebDAV
