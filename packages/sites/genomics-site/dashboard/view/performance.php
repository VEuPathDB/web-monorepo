<style>
  td { text-align: right; }
</style>

<h2>Client-side Performance Diagnostics</h2>

<div ng-cloak ng-app="performance" ng-controller="PerformanceCtrl">
  <div>
    <button ng-click="runDiagnostics()">Run diagnostics</button>
    <span ng-hide="!canSend">
      <button ng-click="sendReport()" ng-disabled="!canSend">Send report</button>
      (ApiDB Google Apps Authentication required for sending)
    </span>
  </div>
  <br>
  <table>
    <thead>
      <tr>
        <th>Page</th>
        <th ng-repeat="event in reporter.eventNames">{{event}}</th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="timing in reporter.timings">
        <td><a href="{{URLS[timing.page]}}">{{timing.page}}</a></td>
        <td ng-repeat="event in reporter.eventNames">
          {{timing[reporter.events[event].end] - timing[reporter.events[event].start]}} ms
        </td>
      </tr>
    </tbody>
  </table>
</div>

<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.8/angular.min.js"></script>
<script>
  angular.module("performance", []).
    filter('average', function() {
      return function(array) {
        if (!array) return 0;
        return (array.reduce(function(pv, cv, idx, arr) {
          return pv + cv;
        }) / array.length);
      }
    });

  function PerformanceCtrl($scope) {
    const MAX_LOADING = 6,
          RUNS = 20,
          URLS = {
            "Apache": "//" + location.hostname + "/assets/images/PlasmoDB/plasmodb.jpg",
            "Tomcat" : "//" + location.hostname + "/toxo/images/CellCycle.jpg",
          };

    var loading = 0;

    var CLIENT_ID = "678887398381-sq1qbuka0s8h24r763mis51psf78psd5.apps.googleusercontent.com",
        SCOPES= "https://www.googleapis.com/auth/drive";

    $scope.URLS = URLS;

    /**
     * Check if the current user has authorized the application.
     */
    function checkAuth() {
      gapi.auth.authorize(
          {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true},
          handleAuthResult);
    }

    /**
     * Called when authorization server replies.
     *
     * @param {Object} authResult Authorization result.
     */
    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        // send file
        gapi.client.load('drive', 'v2', function() {
          insertFile($scope.reporter.csv);
        });
      } else {
        // No access token could be retrieved, show the button to start the authorization flow.
        var doAuth = window.confirm("You need to connect your ApiDB Google Apps account. Would you like to do that now?");
        if (doAuth) {
          gapi.auth.authorize(
              {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
              handleAuthResult);
        }
      }
    }

    /**
     * Insert new file.
     *
     * @param {String} content String to use as CSV file
     * @param {Function} callback Function to call when the request is complete.
     */
    function insertFile(content, callback) {
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      var contentType = 'text/csv';
      var metadata = {
        'title': 'perf_data-' + Date.now() + '.csv',
        'mimeType': contentType
      };

      var base64Data = btoa(content);
      var multipartRequestBody =
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: ' + contentType + '\r\n' +
          'Content-Transfer-Encoding: base64\r\n' +
          '\r\n' +
          base64Data +
          close_delim;

      var request = gapi.client.request({
          'path': '/upload/drive/v2/files',
          'method': 'POST',
          'params': {
            'uploadType': 'multipart',
            'convert': true
          },
          'headers': {
            'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
          },
          'body': multipartRequestBody});
      if (!callback) {
        callback = function(file) {
          console.log(file)
        };
      }
      request.execute(callback);
    }


    $scope.pages = Object.keys(URLS);

    $scope.canSend = false;

    $scope.reporter = {
      // valid event reporting names
      events: {
        // this is skewed by iframes blocking eachother
        // "Network latency": {
        //   start: "fetchStart",
        //   end: "responseEnd"
        // },
        "DNS lookup": {
          start: "domainLookupStart",
          end: "domainLookupEnd"
        },
        "Connecting": {
          start: "connectStart",
          end: "connectEnd"
        },
        "Waiting": {
          start: "requestStart",
          end: "responseStart"
        },
        "Receiving": {
          start: "responseStart",
          end: "responseEnd"
        }
      },

      // array of timing objects
      timings: [],

      // append timing object to timings k-v store
      append: function(page, timing) {
        this.timings.push($.extend({}, {page: page}, timing));
      },

      get eventNames() {
        return Object.keys(this.events);
      },

      // generate CSV with header
      get csv() {
        var self = this;
        var header = ["page"].concat(this.eventNames);
        var body = header.map(function(e) { return '"' + e.replace(/"/, '\\"') + '"'; }).join(",");

        this.timings.forEach(function(timing) {
          var line = [timing.page];
          sellf.eventNames.forEach(function(eventName) {
            line.push(timing[self.events[eventName].end] - timing[self.events[eventName].start]);
          });
          body += "\r\n" + line.map(function(e) { return '"' + e + '"';}).join(",");
        });

        return body;
      }
    };

    // create iframes for each url
    $scope.runDiagnostics = function() {
      $("body").loading("show");
      for (var page in URLS) {
        for (var i = 1; i <= RUNS; i++) (function(i, page) {
          var iframe = document.createElement("iframe");
          iframe.src = URLS[page] + "?__nocache=" + (Date.now() * Math.random());
          iframe.style.display = "none";
          iframe.onload = function() {
            $scope.$apply(function() {
              $scope.reporter.append(page, iframe.contentWindow.performance.timing);
            });
            if (i == RUNS) {
              $("body").loading("hide");
              $scope.canSend = true;
            }
          };
          document.body.appendChild(iframe);
        })(i, page);
      }
    };

    $scope.sendReport = function() {
      checkAuth();
    };
  }
</script>
<script src="//apis.google.com/js/client.js"></script>
