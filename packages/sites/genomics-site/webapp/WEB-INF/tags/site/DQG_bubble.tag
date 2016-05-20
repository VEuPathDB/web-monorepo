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

<c:set var="baseUrl" value="${pageContext.request.contextPath}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}" />
<c:set var="rootCats" value="${wdkModel.websiteRootCategories}" />

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="leftBubbleCategory" value="TranscriptRecordClasses.TranscriptRecordClass"/>

<c:choose>
  <c:when test="${wdkUser.stepCount == null}">
    <c:set var="count" value="0"/>
  </c:when>
  <c:otherwise>
    <c:set var="count" value="${wdkUser.strategyCount}"/>
  </c:otherwise>
</c:choose>

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
      <c:set var="recordClassesCSV"/>
      <c:forEach items="${rootCats}" var="rootCatEntry">
        <c:if test="${rootCatEntry.key != leftBubbleCategory}">
          <c:choose>
            <c:when test="${not empty recordClassesCSV}">
              <c:set var="recordClassesCSV" value='${recordClassesCSV},"${rootCatEntry.key}"'/>
            </c:when>
            <c:otherwise>
              <c:set var="recordClassesCSV" value='"${rootCatEntry.key}"'/>
            </c:otherwise>
          </c:choose>
        </c:if>
      </c:forEach>

      <div class="heading">Search for Other Data Types</div>
      <div class="info" data-controller="apidb.bubble.initialize" data-record-classes='[${recordClassesCSV}]'><jsp:text/></div>
    </c:when>

    <%---------------------------------   GENES  -------------------------%>
    <c:otherwise>
      <div class="heading">Search for Genes</div>
      <div class="info" data-controller="apidb.bubble.initialize" data-record-classes='["${leftBubbleCategory}"]'><jsp:text/></div>
    </c:otherwise>
  </c:choose> 
</div>
