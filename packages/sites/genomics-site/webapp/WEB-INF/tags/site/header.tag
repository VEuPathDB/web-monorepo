<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:common="urn:jsptagdir:/WEB-INF/tags/site-common"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="refer" required="false" 
    description="Page calling this tag"/>

  <jsp:directive.attribute name="title" required="false" 
    description="brings information about the recordclass"/>

  <c:set var="props" value="${applicationScope.wdkModel.properties}"/>
  <c:set var="project" value="${props['PROJECT_ID']}"/>

  <!-- not using FreeFind
  <c:if test="${refer ne 'home'}">
    <![CDATA[ (removed html comments) FreeFind Begin No Index  ]]>
  </c:if>
  -->
  <!-- site search: freefind engine instructs to position this right after body tag -->
  <!-- not in use <imp:freefind_header/> -->

  <div id="toplink">
    <c:if test="${project eq 'TriTrypDB'}">
      <map name="partof">
        <area shape="rect" coords="0,0 172,22" href="http://eupathdb.org" alt="EuPathDB home page"/>
        <area shape="rect" coords="310,0 380,22" href="http://www.genedb.org" alt="GeneDB home page"/>
      </map>
    </c:if>
    <c:choose>
      <c:when test="${project eq 'TriTrypDB'}">
        <imp:image usemap="#partof" src="images/${project}/partofeupath.png" alt="Link to EuPathDB homepage"/>
      </c:when>
      <c:otherwise>
        <a href="http://eupathdb.org"><imp:image src="images/${project}/partofeupath.png" alt="Link to EuPathDB homepage"/></a>
      </c:otherwise>
    </c:choose>
  </div>   <!-- id="toplink" -->
  <common:header refer="${refer}" title="${title}"/>

  <c:if test="${refer != 'home'}">
    <![CDATA[ <!-- FreeFind End No Index --> ]]>
  </c:if>

</jsp:root>
