<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fmt="http://java.sun.com/jsp/jstl/fmt"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">
  
  <jsp:directive.attribute name="refer" required="false" 
              description="Page calling this tag"/>
  
  <c:set var="siteName" value="${applicationScope.wdkModel.name}" />
  <c:set var="version" value="${applicationScope.wdkModel.version}" />
  <fmt:setLocale value="en-US"/> <!-- req. for date parsing when client browser (e.g. curl) does not send locale -->
  <fmt:parseDate  var="releaseDate" value="${applicationScope.wdkModel.releaseDate}" pattern="dd MMMM yyyy HH:mm"/> 
  <fmt:formatDate var="releaseDate_formatted" value="${releaseDate}" pattern="d MMM yy"/>
  <fmt:formatDate var="copyrightYear" value="${releaseDate}" pattern="yyyy"/>
  
  <c:set var="footerClass" value="${refer eq 'home' or refer eq 'home2' ? 'skinny-footer' : 'wide-footer' }"/>
  
  <div id="footer" class="${footerClass}">
    <div style="float:left;padding-left:9px;padding-top:9px;">
      <a href="http://${fn:toLowerCase(siteName)}.org">${siteName}</a>
      ${version}<span style="margin-left: 20px">${releaseDate_formatted}</span><br/>
      <span style="margin-left:4px;">&amp;copy;${copyrightYear} The EuPathDB Project Team</span>
    </div>

    <div style="float:right;padding-right:9px;font-size:1.4em;line-height:2;">
      Please <a href="${pageContext.request.contextPath}/help.jsp" target="_blank" onclick="poptastic(this.href); return false;">Contact Us</a> with any questions or comments<br/>
      <a href="http://code.google.com/p/strategies-wdk/">
        <img border="0" style="position:relative;top:-9px;left:103px" src="${pageContext.request.contextPath}/wdk/images/stratWDKlogo.png" width="120"/>
      </a>
    </div>

    <div style="position:relative; top:-9px; right:7px;">
      <a href="http://www.eupathdb.org"><br/><img src="/assets/images/eupathdblink.png" alt="Link to EuPathDB homepage"/></a><br/>
    </div>

    <div style="padding-left: 160px;">
      <ul class="site-icons" style="position:relative; top:-8px;">
        <li><a href="http://amoebadb.org"><img border="0" src="/assets/images/AmoebaDB/amoebadb_w30.png" width="25"/></a></li>
        <li class="short-space"><a href="http://cryptodb.org"><img border="0" src="/assets/images/CryptoDB/cryptodb_w50.png" width="25"/></a></li>
        <li class="short-space"><a href="http://giardiadb.org"><img border="0" src="/assets/images/GiardiaDB/giardiadb_w50.png" width="25"/></a></li>
        <li class="long-space"><a href="http://microsporidiadb.org"><img border="0" src="/assets/images/MicrosporidiaDB/microdb_w30.png" width="25"/></a></li>
        <li class="short-space"><a href="http://piroplasmadb.org"><img border="0" src="/assets/images/newSite.png" width="30"/></a></li>
        <li class="long-space"><a href="http://plasmodb.org"><img border="0" src="/assets/images/PlasmoDB/plasmodb_w50.png" width="25"/></a></li>
        <li class="long-space"><a href="http://toxodb.org"><img border="0" src="/assets/images/ToxoDB/toxodb_w50.png" width="25"/></a></li>
        <li class="short-space"><a href="http://trichdb.org"><img border="0" src="/assets/images/TrichDB/trichdb_w65.png" height="25"/></a></li>
        <li class="short-space"><a href="http://tritrypdb.org"><img border="0" src="/assets/images/TriTrypDB/tritrypdb_w40.png" width="20"/></a></li>
      </ul>
    </div>
  </div>
  
</jsp:root>
