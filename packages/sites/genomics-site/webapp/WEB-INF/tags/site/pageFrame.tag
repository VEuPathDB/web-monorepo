<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:common="urn:jsptagdir:/WEB-INF/tags/site-common">

  <jsp:directive.attribute name="title" required="false"
    description="Value to appear in page's title"/>

  <jsp:directive.attribute name="refer" required="false" 
    description="Page calling this tag"/>

  <jsp:directive.attribute name="banner" required="false"
    description="Value to appear at top of page if there is no title provided"/>

  <!-- OLD set of attributes:
          header:  only "division" being used (for login and contact us)
          division and banner used in many pages,
          most in use still in many jsps, all XMLQuestion pages and custom gene record pages
          summary used ONLY in gene record pages        
          headElement used in XmlQuestions.News.jsp, Glossary and Tutorials -->

  <jsp:directive.attribute name="parentDivision" required="false"/>
  <jsp:directive.attribute name="parentUrl" required="false"/>
  <jsp:directive.attribute name="divisionName" required="false"/>
  <jsp:directive.attribute name="division" required="false"/>
  <jsp:directive.attribute name="summary" required="false"
    description="short text description of the page"/>
  <jsp:directive.attribute name="headElement" required="false"
    description="additional head elements"/>

  <c:set var="project" value="${applicationScope.wdkModel.properties['PROJECT_ID']}"/>
  <!-- flag incoming galaxy.psu.edu users -->
  <!--
  <c:choose>
    <c:when test="${not empty param.GALAXY_URL}">
      <c:set var="GALAXY_URL" value="${param.GALAXY_URL}" scope="session" />
    </c:when>
    <c:when test="${!empty sessionScope.GALAXY_URL}">
    </c:when>
    <c:otherwise>
      <c:set var="GALAXY_URL" value="http://main.g2.bx.psu.edu/tool_runner?tool_id=eupathdb" scope="session" />
    </c:otherwise>
  </c:choose>
  <c:set var="EUPATHDB_GALAXY_URL" value="http://galaxy.apidb.org/tool_runner?tool_id=eupathdb" scope="session" />
  -->

  <common:pageFrame title="${title}" refer="${refer}" banner="${banner}">
    <c:choose>
      <c:when test="${refer ne 'home2' and refer ne 'summary' and refer ne 'betaApp'}">
        <div id="contentwrapper">
          <div id="contentcolumn2">
            <div class="innertube">
              <jsp:doBody/>
            </div>
          </div>
        </div>
      </c:when>
      <c:otherwise>
        <jsp:doBody/>
      </c:otherwise>
    </c:choose>
  </common:pageFrame>

</jsp:root>
