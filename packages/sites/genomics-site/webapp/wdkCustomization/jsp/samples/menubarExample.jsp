<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <jsp:text>&lt;!doctype html&gt;</jsp:text>
  <html>
    <head>
      <title>Menubar Example Page (using Superfish)</title>
      <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/wdkCustomization/css/superfish/css/superfish.css"/>
      <script type="text/javascript" src="${pageContext.request.contextPath}/assets/wdk/lib/jquery.js"><jsp:text/></script>
      <script type="text/javascript" src="${pageContext.request.contextPath}/wdkCustomization/js/lib/superfish.js"><jsp:text/></script>
      <script type="text/javascript">
        jQuery(function(){
        	jQuery('#menudiv .sf-menu').superfish();
        	jQuery('#menudiv .sf-menu a').attr('href','javascript:void(0)');
        });
      </script>
    </head>
    <body>
      <div id="menudiv">
        <ul class="sf-menu">
          <li><a>Item 1</a></li>
          <li><a>Item 2</a></li>
          <li><a>Item 3</a>
            <ul>
              <li><a>Subitem 1</a></li>
              <li><a>Subitem 2</a>
                <ul>
                  <li><a>SubSubitem 1</a></li>
                  <li><a>SubSubitem 2</a></li>
                </ul>
              </li>
            </ul>
          </li>
          <li><a>Item 4</a></li>
        </ul>
      </div>
    </body>
  </html>
</jsp:root>
