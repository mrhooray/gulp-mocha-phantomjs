'use strict';
/**
 * CLI reference
 * http://phantomjs.org/api/command-line.html
 */
var JSON_TO_CLI = {
  // --cookies-file=/path/to/cookies.txt & specifies the file name to store the persistent Cookies.
  'cookiesFile'                  : '--cookies-file',
  // --disk-cache=[true|false] enables disk cache (at desktop services cache storage location, default is false). Also accepted: [yes|no].
  'diskCacheEnabled'             : '--disk-cache',
  // --ignore-ssl-errors=[true|false] ignores SSL errors, such as expired or self-signed certificate errors (default is false). Also accepted: [yes|no].
  'ignoreSslErrors'              : '--ignore-ssl-errors',
  // --load-images=[true|false] load all inlined images (default is true). Also accepted: [yes|no].
  'autoLoadImages'               : '--load-images',
  // --local-storage-path=/some/path path to save LocalStorage content and WebSQL content.
  'offlineStoragePath'           : '--local-storage-path',
  // --local-storage-quota=number maximum size to allow for data.
  'offlineStorageDefaultQuota'   : '--local-storage-quota',
    // --local-to-remote-url-access=[true|false] allows local content to access remote URL (default is false). Also accepted: [yes|no].
  'localToRemoteUrlAccessEnabled': '--local-to-remote-url-access',
  // --max-disk-cache-size=size limits the size of disk cache (in KB).
  'maxDiskCacheSize'             : '--max-disk-cache-size',
  // --output-encoding=encoding sets the encoding used for terminal output (default is utf8).
  'outputEncoding'               : '--output-encoding',
  // --remote-debugger-port starts the script in a debug harness and listens on the specified port
  'remoteDebuggerPort'           : '--remote-debugger-port',
  // --remote-debugger-autorun runs the script in the debugger immediately: 'yes' or 'no' (default)
  'remoteDebuggerAutorun'        : '--remote-debugger-autorun',
  // --proxy=address:port specifies the proxy server to use (e.g. --proxy=192.168.1.42:8080).
  'proxy'                        : '--proxy',
  // --proxy-type=[http|socks5|none] specifies the type of the proxy server (default is http).
  'proxyType'                    : '--proxy-type',
  // --proxy-auth specifies the authentication information for the proxy, e.g. --proxy-auth=username:password).
  'proxyAuth'                    : '--proxy-auth',
  // --script-encoding=encoding sets the encoding used for the starting script (default is utf8).
  'scriptEncoding'               : '--script-encoding',
  // --ssl-protocol=[sslv3|sslv2|tlsv1|any'] sets the SSL protocol for secure connections (default is SSLv3).
  'sslProtocol'                  : '--ssl-protocol',
  // --ssl-certificates-path=<val> Sets the location for custom CA certificates (if none set, uses system default).
  'sslCertificatesPath'        : '--ssl-certificates-path',
  // --web-security=[true|false] enables web security and forbids cross-domain XHR (default is true). Also accepted: [yes|no].
  'webSecurityEnabled'           : '--web-security',
 // --webdriver starts in 'Remote WebDriver mode' (embedded GhostDriver): '[[:]]' (default '127.0.0.1:8910')
  'webdriver'                    : '--webdriver',
  // --webdriver-selenium-grid-hub URL to the Selenium Grid HUB: 'URLTOHUB' (default 'none') (NOTE: works only together with '--webdriver')
  'webdriverSeleniumGridHub'     : '--webdriver-selenium-grid-hub'
};

function createPhantomCliParams(phantomjs) {
  phantomjs = phantomjs || {};
  return Object
           .keys(phantomjs)
           .filter(function(setting) {
             return JSON_TO_CLI[setting] !== undefined;
           })
           .map(function(setting) {
             return JSON_TO_CLI[setting] + '=' + phantomjs[setting];
           });
}

function removeCliParams(phantomjs) {
  phantomjs = phantomjs || {};
  return Object
      .keys(phantomjs)
      .filter(function(setting) {
          return JSON_TO_CLI[setting] === undefined;
      })
      .reduce(function(newOptionsObject, setting) {
          newOptionsObject[setting] = phantomjs[setting];
          return newOptionsObject;
      }, {});
}

module.exports = {
  createPhantomCliParams: createPhantomCliParams,
  removeCliParams: removeCliParams
};
