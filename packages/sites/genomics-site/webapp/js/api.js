function toggleLayer(whichLayer) {
    //alert("toggleLayer: " + whichLayer);
    if (document.getElementById) {
        // this is the way the standards work
        var style2 = document.getElementById(whichLayer).style;
        style2.display = style2.display? "":"block";
    }
    else if (document.all) {
        // this is the way old msie versions work
        var style2 = document.all[whichLayer].style;
        style2.display = style2.display? "":"block";
    } else if (document.layers) {
        // this is the way nn4 works
        var style2 = document.layers[whichLayer].style;
        style2.display = style2.display? "":"block";
    }
    return true;
}

function showLayer(whichLayer) {
    //alert("showLayer: " + whichLayer);
    if (document.getElementById) {
        // this is the way the standards work
        var style2 = document.getElementById(whichLayer).style;
        style2.display = "block";
    }
    else if (document.all) {
        // this is the way old msie versions work
        var style2 = document.all[whichLayer].style;
        style2.display = "block";
    } else if (document.layers) {
        // this is the way nn4 works
        var style2 = document.layers[whichLayer].style;
        style2.display = "block";
    }
    return true;
}

function hideLayer(whichLayer) {
    //alert("hideLayer: " + whichLayer);
    if (document.getElementById) {
        // this is the way the standards work
        var style2 = document.getElementById(whichLayer).style;
        style2.display = "";
    }
    else if (document.all) {
        // this is the way old msie versions work
        var style2 = document.all[whichLayer].style;
        style2.display = "";
    } else if (document.layers) {
        // this is the way nn4 works
        var style2 = document.layers[whichLayer].style;
        style2.display = "";
    }
    return true;
}

function getCookie(name) {

    var start = document.cookie.indexOf(name + "=");

    if ( (!start) && name != document.cookie.substring(0,name.length) ) {
	return null;
    }

    if (start == -1) {
	return null;
    }

    var len = start + name.length + 1;
    var end = document.cookie.indexOf(";",len);
    if (end == -1) {
	end = document.cookie.length;
    }
	
    return unescape(document.cookie.substring(len,end));
}

function setCookie(name, value, expires, path, domain, secure) {
    // alert(name + "=" + escape(value) +
    //       ( (expires) ? ";expires=" + expires.toGMTString() : "") +
    //       ( (path) ? ";path=" + path : "") + 
    //       ( (domain) ? ";domain=" + domain : "") +
    //       ( (secure) ? ";secure" : ""));

    document.cookie = name + "=" + escape(value) +
        ( (expires) ? ";expires=" + expires.toGMTString() : "") +
        ( (path) ? ";path=" + path : "") + 
        ( (domain) ? ";domain=" + domain : "") +
        ( (secure) ? ";secure" : "");
}

function deleteCookie(name, path, domain) {
    if (getCookie(name)) {
	document.cookie = name + "=" +
	    ( (path) ? ";path=" + path : "") +
	    ( (domain) ? ";domain=" + domain : "") +
	    ";expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
}

var today = new Date();
var zeroDate = new Date(0,0,0);
today.setTime(today.getTime() - zeroDate.getTime());

var todaysDate = new Date(today.getYear(),
			   today.getMonth(),
			   today.getDate(),
			   0, 0, 0);
var expiresDate = new Date(todaysDate.getTime() + (8 * 7 * 86400000));

function storeMasterCookie() {
    if (!getCookie('MasterCookie')) {
        setCookie('MasterCookie','MasterCookie');
    }
}

function storeIntelligentCookie(name, value) {
    if (!getCookie('MasterCookie')) {
        storeMasterCookie();
    }
    var IntelligentCookie = getCookie(name);
    if ((!IntelligentCookie) || (IntelligentCookie != value)) {
        setCookie(name, value);
        var IntelligentCookie = getCookie(name);
        if ((!IntelligentCookie) || (IntelligentCookie != value)) {
            deleteCookie('MasterCookie');
	}
    }
}

function uncheck(notFirst) {
    var form = document.downloadConfigForm;
    var cb = form.selectedFields;
    if (notFirst) {
        for (var i=1; i<cb.length; i++) {
            cb[i].checked = null;
        }
    } else {
        cb[0].checked = null;
    }
}

function check(all) {
    var form = document.downloadConfigForm;
    var cb = form.selectedFields;
    cb[0].checked = (all > 0 ? null : 'checked');
    for (var i=1; i<cb.length; i++) {
        cb[i].checked = (all > 0 ? 'checked' : null);
    }
}

function handleHttpResponseImage(imgId, imgSrc) {
    var http = httpObjects[imgId];
    var msg = "in handleHttpResponseImage\n"
            + "http = " + http + "\n"
            + "state = " + http.readyState + "\n"
            + "imgId = " + imgId + "\n"
            + "imgSrc = " + imgSrc;

    // no need to wait till readyState == 4 'cuz we do not need responseText
    if (http.readyState == 1 || http.readyState == 0) {
        var img = document.getElementById(imgId);
        msg += "\nimg before='" + img + "'\n";
        if(img.src != null && img.src != imgSrc) {
            img.src = imgSrc;
        }
        msg += "\nsrc after='" + img.src + "'\n";
        workStates[imgId] = false;
    }
    //alert(msg);
}

function updateImage(imgId, imgSrc) {
    var http = getHTTPObject();
    httpObjects[imgId] = http;
    var isWorking = false;
    workStates[imgId] = isWorking;

    if (!isWorking && http) {
        //if imgSrc is on a different domain, we need to sign the scripts and ask for expanded privilege
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
        } catch (e) {
            //alert("cat not enable UniversalBrowserRead: " + e.message);
        }
        try {
            http.open("GET", imgSrc, true);
            http.onreadystatechange = handleHttpResponseImage(imgId, imgSrc);
            workStates[imgId] = true;
            http.send(null);
        } catch (e) {
            var img = document.getElementById(imgId);
            if(img.src != null && img.src != imgSrc) {
                img.src = imgSrc;
            }
        }
    }
    workStates[imgId] = false;
}

function handle_dnaContextDiv() {
    handleHttpResponseImageMapDiv('dnaContextDiv');
}

function handle_proteinFeaturesDiv() { 
    handleHttpResponseImageMapDiv('proteinFeaturesDiv');
}

function handleHttpResponseImageMapDiv(imgMapDivId) {
    var http = httpObjects[imgMapDivId];
    if (http.readyState == 4) {
        var div = document.getElementById(imgMapDivId);
        if (document.getElementById(imgMapDivId).lastChild == null) {
            //document.getElementById(imgMapDivId).innerHTML = http.responseText;
            //TRICKY: this only works on Firefox/Netscape
            dynamiccontent(imgMapDivId, http.responseText);
        }
        workStates[imgMapDivId] = false;
    }
    //alert(imgMapDivId + ": state=" + http.readyState);
}

function dynamiccontent(elementid,content){
    if (document.getElementById && !document.all){
        rng = document.createRange();
        el = document.getElementById(elementid);
        rng.setStartBefore(el);
        htmlFrag = rng.createContextualFragment(content);
        while (el.hasChildNodes())
            el.removeChild(el.lastChild);
        el.appendChild(htmlFrag);
    }
}

function updateImageMapDiv(imgMapDivId, imgMapSrc) {
    var http = getHTTPObject();
    httpObjects[imgMapDivId] = http;

    var isWorking = false;
    workStates[imgMapDivId] = isWorking;

    if (!isWorking && http) {
        //if imgMapSrc is on a different domain, we need to sign the scripts and ask for expanded privilege
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
        } catch (e) {
            //alert("cat not enable UniversalBrowserRead: " + e.message);
        }
        try {
            http.open("GET", imgMapSrc, true);
            if (imgMapDivId == 'dnaContextDiv') {
                http.onreadystatechange = handle_dnaContextDiv; 
            } else if (imgMapDivId == 'proteinFeaturesDiv') {
                http.onreadystatechange = handle_proteinFeaturesDiv;
            } else {
                //alert("unexpected image map div ID" + imgMapDivId);
            }
            workStates[imgMapDivId] = true;
            http.send(null);
        } catch (e) {
            document.getElementById(imgMapDivId).innerHTML
                = '<font color="red">Could not request the following url because it is on a different domain:<br>'
                + imgMapSrc + '<br>Error: ' + e +'</font>';
        }
    }
    workStates[imgMapDivId] = false;
}

function getHTTPObject() {
    var xmlhttp;
    /*@cc_on
    @if (@_jscript_version >= 5)
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                xmlhttp = false;
            }
        }
    @else
        xmlhttp = false;
    @end @*/

    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        try {
            xmlhttp = new XMLHttpRequest();
        } catch (e) {
            xmlhttp = false;
        }
    }
    return xmlhttp;
}

var httpObjects = new Object(); // a hash of XMLHttpObjects
var workStates = new Object();  // a hash of XMLHttpObjects working status
