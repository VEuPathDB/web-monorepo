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
  <c:set var="version" value="${applicationScope.wdkModel.build}" />
  <fmt:setLocale value="en-US"/> <!-- req. for date parsing when client browser (e.g. curl) does not send locale -->
  <fmt:parseDate  var="releaseDate" value="${applicationScope.wdkModel.releaseDate}" pattern="dd MMMM yyyy HH:mm"/> 
  <fmt:formatDate var="releaseDate_formatted" value="${releaseDate}" pattern="d MMM yy"/>
  <fmt:formatDate var="copyrightYear" value="${releaseDate}" pattern="yyyy"/>
  
  <c:set var="footerClass" value="${refer eq 'home' or refer eq 'home2' ? 'skinny-footer' : 'wide-footer' }"/>


  <div id="fixed-footer" class="${footerClass} ui-helper-clearfix">
    <div class="left">
      <div class="build-info">
        <a href="http://${fn:toLowerCase(siteName)}.org">${siteName}</a> ${version}
        <span class="release">${releaseDate_formatted}</span><br/>
      </div>
      <div class="copyright">&amp;copy;${copyrightYear}
        The ${siteName eq 'MicrobiomeDB' ? 'MicrobiomeDB' : 'EuPathDB'} Project Team
      </div>
      <div style="font-weight:bold">Follow us on 
        <a class="eupathdb-SocialMedia eupathdb-SocialMedia__twitter" href="https://twitter.com/MicrobiomeDB" target="_blank"></a>
      </div>
    </div>

    <div class="right">
      <ul class="attributions">
        <li>
          <a href="http://code.google.com/p/strategies-wdk/">
            <imp:image border="0" src="wdk/images/stratWDKlogo.png" width="120"/>
          </a>
        </li>
        <!-- <li>Test attribution</li> -->
      </ul>
      <div class="contact">
        Please <a href="${pageContext.request.contextPath}/contact.do"
            class="new-window" data-name="contact_us"><b>Contact Us</b></a> with any questions or comments
      </div>
    </div>

    <c:if test="${siteName ne 'MicrobiomeDB'}">
      <div class="bottom">
        <ul class="site-icons">
          <li title="EuPathDB.org">
            <a href="http://www.eupathdb.org">
              <imp:image src="images/eupathdblink.png" alt="Link to EuPathDB homepage"/>
            </a>
          </li>
          <li class="short-space" title="AmoebaDB.org">
            <a href="http://amoebadb.org">
              <imp:image src="images/AmoebaDB/footer-logo.png"/>
            </a>
          </li>
          <li class="short-space" title="CryptoDB.org">
            <a href="http://cryptodb.org">
              <imp:image src="images/CryptoDB/footer-logo.png"/>
            </a>
          </li>
          <li class="short-space" title="FungiDB.org">
            <a href="http://fungidb.org">
              <imp:image src="images/FungiDB/footer-logo.png"/>
            </a>
          </li>
          <li class="short-space" title="GiardiaDB.org">
            <a href="http://giardiadb.org">
              <imp:image src="images/GiardiaDB/footer-logo.png"/>
            </a>
          </li>
          <li class="long-space" title="MicrosporidiaDB.org">
            <a href="http://microsporidiadb.org">
              <imp:image src="images/MicrosporidiaDB/footer-logo.png"/>
            </a>
          </li>
          <li class="short-space" title="PiroplasmaDB.org">
            <a href="http://piroplasmadb.org">
              <imp:image src="images/PiroplasmaDB/footer-logo.png"/>
            </a>
          </li>
          <li class="long-space" title="PlasmoDB.org">
            <a href="http://plasmodb.org">
              <imp:image src="images/PlasmoDB/footer-logo.png"/>
            </a>
          </li>
          <li class="long-space" title="ToxoDB.org">
            <a href="http://toxodb.org">
              <imp:image src="images/ToxoDB/footer-logo.png"/>
            </a>
          </li>
          <li class="short-space" title="TrichDB.org">
            <a href="http://trichdb.org">
              <imp:image src="images/TrichDB/footer-logo.png"/>
            </a>
          </li>
          <li class="short-space" title="TriTrypDB.org">
            <a href="http://tritrypdb.org">
              <imp:image src="images/TriTrypDB/footer-logo.png"/>
            </a>
          </li>
          <li class="short-space" title="OrthoMCL.org">
            <a href="http://orthomcl.org">
              <imp:image src="images/OrthoMCL/footer-logo.png"/>
            </a>
          </li>
        </ul>
      </div>
    </c:if>

  </div>

  <c:set var="gaId" value="${applicationScope.wdkModel.properties['GOOGLE_ANALYTICS_ID']}"/>
  <c:if test="${gaId ne 'none'}">
    <imp:googleAnalytics gaId="${gaId}"/>
  </c:if>
  
</jsp:root>
