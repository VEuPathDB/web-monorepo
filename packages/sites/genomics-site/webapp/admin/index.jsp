<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>
<api:checkWSKey keyFile="/usr/local/tomcat_instances/shared/.apidb_siteinfo_key" />

<jsp:useBean id="pageMap" class="java.util.HashMap" type="java.util.Map"/> 

<c:set var="page" scope="page" value="${param.p}"/>

<c:set target="${pageMap}" property="Databases" value="databaseInfo.jsp"/>
<c:set target="${pageMap}" property="WDK"       value="wdkInfo.jsp"/>
<c:set target="${pageMap}" property="Build"     value="buildInfo.jsp"/>
<c:set target="${pageMap}" property="Tomcat"     value="tomcatInfo.jsp"/>

<c:choose> 
<%-- this choose block is a crude effort to prevent data display
     when apache is not restricting with authentication --%>
<c:when test="${IS_ALLOWED_SITEINFO != 1}">
Content Not Displayed.<p>
This page must be proxied through Apache with proper configuration,
including authentication.
</c:when>
<c:otherwise>

  <c:catch var="e">
      <c:choose>
      <c:when test="${pageMap[page] != null}">
          <jsp:include page="${pageMap[page]}" />
      </c:when>
      <c:otherwise>
           Error. No valid pageMap key specified.
      </c:otherwise>
      </c:choose>
  </c:catch>
  <c:if test="${e != null}">
      Error. <p>
      <font size='-1'>${e}</font>
  </c:if>

</c:otherwise></c:choose>
