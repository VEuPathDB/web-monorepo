
jQuery(function(){
    GB.performLogin();
});

var GB = {

    WDK_COOKIE_NAME : "wdk_check_auth",

    performLogin : function() {

        // shrink and center progress bar if page is in the full window
        if (window === window.top) {
            jQuery('#progressbar').parent().attr('style','width:45%; text-align:left; margin:180px auto');
        }

        // render the progress bar
        GB.updateProgress(0, 0);

        // retrieve project name (where gbrowse resides), and redirect url from this page's URL
        var project = GB.getParameterByName('project');
        var redirectUrl = GB.getParameterByName('redirectUrl');
        var cookieMaxAge = GB.getParameterByName('cookieMaxAge');
        var userDisplayName = GB.getParameterByName('userDisplayName');

        // try to split cookie into email and checksum
        var creds = GB.splitAuthCookie(jQuery.cookies.get(GB.WDK_COOKIE_NAME));

        if (creds == undefined) {
            // user's login credentials must have been invalid; simply redirect to page
            //alert("System error: the WDK login cookie cannot be found; unable to complete GBrowse login.");
            window.top.location.href = redirectUrl;
        }
        else {
            // add user's display name to progress bar
            if (userDisplayName != '') {
                jQuery('#personalize-name').text(" as " + userDisplayName);
            }

            // make main div visible
            jQuery('#progressbar').show();

            // update progress bar and add some more in a bit (while ajaxing)
            GB.updateProgress(30, 0);
            GB.updateProgress(45, 450);

            // append login form to the bottom of the page (is display:none)
            var html = GB.getLoginFormHtml(project, creds);
            jQuery('body').append(html);

            // run authentication
            Controller.plugin_authenticate($('plugin_configure_form'),
                $('login_message'),'/cgi-bin/gbrowse/'+project,redirectUrl,cookieMaxAge);
        }
    },

    updateProgress : function(amountPct, delayMs) {
        if (delayMs == 0) {
            jQuery('#progressbar').progressbar({ value: amountPct });
        } else {
            setTimeout(function() { GB.updateProgress(amountPct, 0); }, delayMs);
        }
    },

    getLoginFormHtml : function(project, creds) {
        return '' +
            '<div style="display:none">' +
            '  <div id="login_message"></div>' +
            '  <form method="post" action="/cgi-bin/gbrowse/'+project+'/?action=plugin_login"' +
            '        name="configure_plugin" id="plugin_configure_form">' +
            '    <input type="hidden" name="plugin" value="Authorizer Template"/>' +
            '    <input type="text" name="WdkSessionAuthenticator.name" value="' + creds.email + '"/>' +
            '    <input type="text" name="WdkSessionAuthenticator.password" value="' + creds.checksum + '"/>' +
            '    <input type="text" id="authenticate_remember_me" value=""/>' +
            '  </form>' +
            '</div>';
    },

    getParameterByName : function(name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    },

    splitAuthCookie : function(cookieVal) {
        if (cookieVal == null) {
            return undefined;
        }
        // find index of last '-'
        var lastIndex = -1, index = cookieVal.indexOf("-");
        while (index > -1) {
            lastIndex = index;
            index = cookieVal.indexOf("-", index + 1);
        }
        if (lastIndex == -1) {
            return undefined;
        }
        return {
            "email" : cookieVal.substring(0, lastIndex),
            "checksum" : cookieVal.substring(lastIndex + 1)
        };
    },

    handleLoginError : function(errorCode, redirectUrl) {
        alert("Error (" + errorCode + "): Unable to complete login process.\n" +
              "You will be logged in to the main site, but not GBrowse.\n" +
              "Please let us know if this problem persists.");
        window.top.location.href = redirectUrl;
    }
};
