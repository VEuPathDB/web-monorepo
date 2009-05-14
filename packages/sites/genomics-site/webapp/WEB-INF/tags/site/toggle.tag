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

<%@ attribute name="anchorName"
              required="false"
              description="An anchor for the toggle to land on after toggling. Without this we will lose page scrolling in Firefox/Netscape browsers"
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

<%@ attribute name="postLoadJS"
              required="false"
              description="comma separated list of javascript to load, in the order listed, after imageMapSource loads"
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

<c:set var="userAgent" value="${header['User-Agent']}"/>

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

<table width="100%" class="paneltoggle"
       cellpadding="3"        
       bgcolor="#DDDDDD"
       
       >
  <tr>
    <c:choose>
      <c:when test="${noData}">

        <td><font size="-1" face="Arial,Helvetica"><b>${displayName}</b></font>  <i>none</i></td>
      </c:when>
      <c:otherwise>
        <td>
        <c:set var="showOnClick" value=""/>
        <c:if test="${imageId != null}">
            <c:set var="showOnClick" value="updateImage('${imageId}', '${imageSource}')"/>
        </c:if>
        <c:if test="${imageMapDivId != null}">
            <c:set var="showOnClick" value="updateImageMapDiv('${imageMapDivId}', '${imageMapSource}', '${postLoadJS}')"/>
        </c:if>
        <c:if test="${showOnClick != ''}">
            <c:set var="showOnClick" value="${showOnClick}&amp;&amp;"/>
        </c:if>

        <c:if test="${ anchorName == null}">
            <c:set var="anchorName" value="${name}ShowHide"/>
            <a name="${anchorName}"></a>   
        </c:if>

        <%--  Safari/IE cannot handle this way of doing it  --%>
        <c:choose>
        <c:when test="${fn:contains(userAgent, 'Firefox') || fn:contains(userAgent, 'Red Hat') }">
           <div id="toggle${name}" class="toggle-handle" name="${name}" align="left">
             <b><font size="-1" face="Arial,Helvetica">${displayName}</font></b>
             <a href="javascript:${showOnClick}toggleLayer('${name}', 'toggle${name}')" title="Show ${displayName}" onmouseover="status='Show ${displayName}';return true" onmouseout="status='';return true">Show</a>
           </div>
        </c:when>

        <%--  Netscape/Firefox cannot handle this way of doing it  --%>
        <c:otherwise>

           <div id="showToggle${name}" class="toggle" name="${name}" align="left"><b><font size="-1" face="Arial,Helvetica">${displayName}</font></b>
             <a href="javascript:${showOnClick}showLayer('${name}')&amp;&amp;showLayer('hideToggle${name}')&amp;&amp;hideLayer('showToggle${name}')&amp;&amp;storeIntelligentCookie('show${name}',1)" title="Show ${displayName}" onmouseover="status='Show ${displayName}';return true" onmouseout="status='';return true">Show</a>
           </div>

           <div id="hideToggle${name}" class="toggle" name="${name}" align="left"><b><font size="-1" face="Arial,Helvetica">${displayName}</font></b>
              <a href="javascript:hideLayer('${name}')&amp;&amp;showLayer('showToggle${name}')&amp;&amp;hideLayer('hideToggle${name}')&amp;&amp;storeIntelligentCookie('show${name}',0);" title="Hide ${displayName}" onmouseover="status='Hide ${displayName}';return true" onmouseout="status='';return true">Hide</a>
            </div>
        </c:otherwise>
        </c:choose>

      </c:otherwise>
    </c:choose>
    </td>
    <c:if test='${attribution != null && attribution != ""}'>
      <td align="right">
         <font size="-1" face="Arial,Helvetica">
         [<a href="showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=${attribution}&title=${displayNameParam}">Data Sources</a>]
         </font>
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

     
     <%--  IE/Safari can't handle this way of doing it  --%>
     <c:choose>
      <c:when test="${fn:contains(userAgent, 'Firefox') || fn:contains(userAgent, 'Red Hat') }">
        <c:if test="${isOpen}"> 
           <script tupe="text/javascript">
              toggleLayer('${name}', 'toggle${name}');
            </script>
        </c:if>
     </c:when> 

     <%--  Netscape/Firefox can't handle this way of doing it  --%>
     <c:otherwise>
        <c:choose>
          <c:when test="${isOpen}">
          <script type="text/javascript">
          <!-- //
            showLayer("${name}");
            showLayer("hideToggle${name}");
            hideLayer("showToggle${name}");
          // -->
          </script>
         </c:when>
         <c:otherwise>
          <script type="text/javascript">
          <!-- //
            hideLayer("${name}");
            hideLayer("hideToggle${name}");
            showLayer("showToggle${name}");
          // -->
          </script>
         </c:otherwise>
        </c:choose>
     </c:otherwise>
     </c:choose>

        <c:if test="${imageId != null && isOpen}">
          <script type="text/javascript">
            <!-- //
              updateImage('${imageId}', '${imageSource}')
            // -->
          </script>
        </c:if>

        <c:if test="${imageMapDivId != null && isOpen}">
          <script type="text/javascript">
            <!-- //
              updateImageMapDiv('${imageMapDivId}', '${imageMapSource}', '${postLoadJS}')
            // -->
          </script>
        </c:if>
</c:if>
