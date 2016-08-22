<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="banner" 
    type="java.lang.String"
    required="true" 
    description="Image to be displayed as the title of the bubble"
    %>

<%@ attribute name="alt_banner" 
    type="java.lang.String"
    required="true" 
    description="String to be displayed as the title of the bubble"
    %>

<%@ attribute name="recordClasses" 
    type="java.lang.String"
    required="false" 
    description="Class of queries to be displayed in the bubble"
    %>

<c:set var="leftBubbleCategory" value="TranscriptRecordClasses.TranscriptRecordClass"/>

<div class="threecolumndiv">
  <c:choose>
    <%---------------------------------   TOOLS  -------------------------%>
    <c:when test="${recordClasses == null}">
      <div class="heading">Tools</div> 
      <imp:DQG_tools />
    </c:when>

    <%---------------------------------   RECORDCLASSSES OTHER THAN GENES  -------------------------%>
    <c:when test="${recordClasses == 'others'}">
      <%-- Generate an array of record class names to pass to javascript code --%>
      <div class="heading">Search for Other Data Types</div>
      <div class="info" data-controller="apidb.bubble.initialize" data-exclude='${leftBubbleCategory}'><jsp:text/></div>
    </c:when>

    <%---------------------------------   GENES  -------------------------%>
    <c:otherwise>
      <div class="heading">Search for Genes</div>
      <div class="info" data-controller="apidb.bubble.initialize" data-include='${leftBubbleCategory}'><jsp:text/></div>
    </c:otherwise>
  </c:choose> 
</div>
