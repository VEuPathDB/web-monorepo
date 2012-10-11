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
  <!--
  <c:set var="extraFooterClass" value="${refer eq 'home' or refer eq 'home2' ? 'skinny-footer' : '' }"/>
  -->
  <div id="footer">
    <div style="float:left;padding-left:9px;padding-top:9px;">
      <a href="http://${fn:toLowerCase(siteName)}.org">${siteName}</a>
      ${version}&#160;&#160;&#160;&#160;${releaseDate_formatted}<br/>
      &#169;${copyrightYear} The EuPathDB Project Team
    </div>

    <div style="float:right;padding-right:9px;font-size:1.4em;line-height:2;">
      <c:url var="helpUrl" value="/help.jsp"/>
      Please <a href="helpUrl" target="_blank" onClick="poptastic(this.href); return false;">Contact Us</a> with any questions or comments<br/>
      <a href="http://code.google.com/p/strategies-wdk/">
        <img border="0" style="position:relative;top:-9px;left:103px" src="${pageContext.request.contextPath}/wdk/images/stratWDKlogo.png" width="120"/>
      </a>
    </div>

    <span style="position:relative; top:-9px;">
      <a href="http://www.eupathdb.org"><br/><img src="/assets/images/eupathdblink.png" alt="Link to EuPathDB homepage"/></a>&#160;&#160;<br/>
    </span>

    <span style="position:relative; top:-13px; left:80px">
      <a href="http://amoebadb.org"><img border="0" src="/assets/images/AmoebaDB/amoebadb_w30.png" width="25"/></a>&#160;
      <a href="http://cryptodb.org"><img border="0" src="/assets/images/CryptoDB/cryptodb_w50.png" width="25"/></a>&#160;
      <a href="http://giardiadb.org"><img border="0" src="/assets/images/GiardiaDB/giardiadb_w50.png" width="25"/></a>&#160;&#160;
      <a href="http://microsporidiadb.org"><img border="0" src="/assets/images/MicrosporidiaDB/microdb_w30.png" width="25"/></a>&#160;&#160;
      <a href="http://piroplasmadb.org"><img border="0" src="/assets/images/newSite.png" width="30"/></a>&#160;&#160;
      <a href="http://plasmodb.org"><img border="0" src="/assets/images/PlasmoDB/plasmodb_w50.png" width="25"/></a>&#160;&#160;
      <a href="http://toxodb.org"><img border="0" src="/assets/images/ToxoDB/toxodb_w50.png" width="25"/></a>&#160;&#160;
      <a href="http://trichdb.org"><img border="0" src="/assets/images/TrichDB/trichdb_w65.png" height="25"/></a>&#160;&#160;
      <a href="http://tritrypdb.org"><img border="0" src="/assets/images/TriTrypDB/tritrypdb_w40.png" width="20"/></a>
    </span>
  </div>
  
</jsp:root>