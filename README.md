# webdav-browser-extension
Chrome extension to browse a URL as a WebDAV share.

It just uses the https://github.com/dom111/webdav-js
But instead of a bookmarklet you can use it as an extension.

## TODO and known problems
* You need a dir listing enabled otherwise it will fail due to a bug https://github.com/dom111/webdav-js/issues/123
* Remember folders that should be viewed as dav
* Use a state as for Dark Reader or tutorial.focus-mode. The current popup solution is lame.
* Autodetect a webdav share:
  * On 403 error we can try a PROPFIND
  * `Alt-Svc: dav` header https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Alt-Svc
* Option to load the webdav-js directly from CDN with a latest version
* Open any WebDAV server e.g. just as an app. See also https://github.com/dom111/webdav-js/issues/120

