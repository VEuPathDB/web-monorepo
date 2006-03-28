<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="name"
              required="true"
              description="Internal, URL-safe name of toggle block"
%>

<%@ attribute name="displayName"
              required="true"
              description="Value to appear at top of page"
%>

<%@ attribute name="content"
              required="true"
              description="text appearing inside toggle block in 'show' mode"
%>

<%@ attribute name="imageId"
              required="false"
              description="the id of a image in the content"
%>

<%@ attribute name="imageSource"
              required="false"
              description="the src of a image in the content"
%>

<%@ attribute name="imageMapDivId"
              required="false"
              description="the id of a image-map-enclosing div in the content"
%>

<%@ attribute name="imageMapSource"
              required="false"
              description="the src of a image map in the content"
%>

<%@ attribute name="isOpen"
              required="false"
              description="Whether toggle block should initially be open"
%>

<%@ attribute name="noData"
              required="false"
              description="Is there nothing to display?"
%>

<%@ attribute name="attribution"
              required="false"
              description="Dataset ID (from Data Sources) for attribution"
%>

<!-- allow user's previous settings to override defaults -->
<c:set var="cookieKey" value="show${name}"/>
<c:set var="userPref" value="${cookie[cookieKey].value}"/>
<c:if test="${userPref == '1'}"><c:set var="isOpen" value="true"/></c:if>
<c:if test="${userPref == '0'}"><c:set var="isOpen" value="false"/></c:if>

<%-- <a name="${name}"> --%>

<%-- <c:set var="displayNameParam" value="This%20Data%20Set"/> --%>
<c:set var="displayNameParam">
<c:url value="${displayName}"/>
</c:set>

<table width="100%" cellpadding="3" >
  <tr>
    <c:choose>
      <c:when test="${noData}">
        <td><b>${displayName}</b> <i>none</i></td>
      </c:when>
      <c:otherwise>
        <td><!-- /td -->
        <!-- td -->
        <c:set var="showOnFocus" value=""/>
        <c:if test="${imageId != null}">
            <c:set var="showOnFocus" value="updateImage('${imageId}', '${imageSource}');"/>
        </c:if>
        <c:if test="${imageMapDivId != null}">
            <c:set var="showOnFocus" value="${showOnFocus}updateImageMapDiv('${imageMapDivId}', '${imageMapSource}');"/>
        </c:if>
        <c:if test="${showOnFocus != ''}">
            <c:set var="showOnFocus" value="onFocus=\"${showOnFocus}\""/>
        </c:if>
        <div id="showToggle${name}" class="toggle" align="left"><b><font size="+0">${displayName}</font></b>
          <a href="javascript:showLayer('${name}')&&showLayer('hideToggle${name}')&&hideLayer('showToggle${name}')&&storeIntelligentCookie('show${name}',1);" title="Show ${displayName}" onMouseOver="status='Show ${displayName}';return true" onMouseOut="status='';return true" ${showOnFocus}>Show</a>
        </div><!-- /td -->

        <!-- td -->
        <div id="hideToggle${name}" class="toggle" align="left"><b><font size="+0">${displayName}</font></b>
          <a href="javascript:hideLayer('${name}')&&showLayer('showToggle${name}')&&hideLayer('hideToggle${name}')&&storeIntelligentCookie('show${name}',0);" title="Hide ${displayName}" onMouseOver="status='Hide ${displayName}';return true" onMouseOut="status='';return true">Hide</a>
        </div></td>
      </c:otherwise>
    </c:choose>

    <c:if test='${attribution != null && attribution != ""}'>
      <td align="right">
         [<a href="showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=${attribution}&title=${displayNameParam}">Data Sources</a>]
      </td>
    </c:if>
  </tr>
</table>

<c:if test="${!noData}">

  <div id="${name}" class="boggle">
    <table width="100%" cellpadding="3">
      <tr><td>${content}</td></tr>
    </table>
  </div>

        <c:choose>
          <c:when test="${isOpen}">
          <SCRIPT TYPE="text/javascript" LANG="JavaScript">
          <!-- //
            showLayer("${name}");
            showLayer("hideToggle${name}");
            hideLayer("showToggle${name}");
          // -->
          </SCRIPT>
         </c:when>
         <c:otherwise>
          <SCRIPT TYPE="text/javascript" LANG="JavaScript">
          <!-- //
            hideLayer("${name}");
            hideLayer("hideToggle${name}");
            showLayer("showToggle${name}");
          // -->
          </SCRIPT>
         </c:otherwise>
        </c:choose>

        <c:if test="${imageId != null && isOpen}">
          <SCRIPT TYPE="text/javascript" LANG="JavaScript">
            <!-- //
              updateImage('${imageId}', '${imageSource}')
            // -->
          </SCRIPT>
        </c:if>

        <c:if test="${imageMapDivId != null && isOpen}">
          <SCRIPT TYPE="text/javascript" LANG="JavaScript">
            <!-- //
              updateImageMapDiv('${imageMapDivId}', '${imageMapSource}')
            // -->
          </SCRIPT>
        </c:if>
</c:if>
