<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="name"
              required="true"
              description="Internal, URL-safe name of toggle block"
%>

<%@ attribute name="displayName"
              required="true"
              description="Value to appear at top of page"
%>
<%@ attribute name="dsLink"
              required="false"
              description="data sources link for the genomic context, links to GBrowse file that includes help and track descriptions"
%>

<%@ attribute name="displayLink"
              required="false"
              description="Work around on toggle-handle for hyperlink"
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
              description="Dataset ID (from Data Sets) for attribution"
%>


<c:set var="userAgent" value="${header['User-Agent']}"/>

<%-- most CSS selector characters (., >, +, ~, #, :, etc) are not valid in id attributes or tag names --%>
<%-- but some of the names used in gene page contain . or : .......  remove or escape them \\ --%>
<c:set var="name" value="${fn:replace(name, '.', '')}"/>
<c:set var="name" value="${fn:replace(name, ':', '')}"/>

<!-- allow user's previous setting (in cookie: section open or closed) to override default in database -->
<c:set var="cookieKey" value="show${name}"/>
<c:set var="userPref" value="${cookie[cookieKey].value}"/>

<%-- 	- check cookie state
	- if cookie not found, check if isOpen was specified in table (passed to tag as an attribute)
	- otherwise isOpen will be set to false (closed section)
--%>
<c:choose>
<%-- found cookie --%>
<c:when test='${not empty userPref}'>
	<c:if test="${userPref == '1'}"><c:set var="isOpen" value="true"/></c:if>
	<c:if test="${userPref == '0'}"><c:set var="isOpen" value="false"/></c:if>
</c:when>
<%-- did not find cookie --%>
<c:otherwise>
	<c:if test='${empty isOpen}'>  
		<c:set var="isOpen" value="false"/>
	</c:if>
</c:otherwise>
</c:choose>

<c:set var="displayNameParam">
	<c:url value="${displayName}"/>
</c:set>

<c:set var="ds_ref_attribute" value="${requestScope.ds_ref_attributes[name]}" />
<c:set var="ds_ref_table" value="${requestScope.ds_ref_tables[name]}" />
<c:set var="ds_ref_profile_graph" value="${requestScope.ds_ref_profile_graphs[name]}" />
<c:set var="hasDBDataset" value="${(ds_ref_table != null && ds_ref_table != '') || (ds_ref_attribute != null && ds_ref_attribute != '') || (ds_ref_profile_graph != null && ds_ref_profile_graph != '')}" />

<table width="100%" class="paneltoggle"
       cellpadding="3"        
       bgcolor="#DDDDDD">
  <tr>
    <c:choose>
      <c:when test="${noData}">
        <td><font size="-1" face="Arial,Helvetica"><b>${displayName}</b></font>  <i>none</i></td>
      </c:when>
      <c:otherwise>
        <td>
        <c:set var="showOnClick" value=""/>
        <c:if test="${imageId != null}">
            <c:set var="showOnClick" value="wdk.api.updateImage('${imageId}', '${imageSource}')"/>
        </c:if>
        <c:if test="${imageMapDivId != null}">
            <c:set var="showOnClick" value="wdk.api.updateImageMapDiv('${imageMapDivId}', '${imageMapSource}', '${postLoadJS}')"/>
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
             <a href="javascript:${showOnClick}wdk.api.toggleLayer('${name}', 'toggle${name}')" title="Show ${displayName}" onmouseover="status='Show ${displayName}';return true" onmouseout="status='';return true">Show</a>
           </div>
        </c:when>

        <%--  Netscape/Firefox cannot handle this way of doing it  --%>
        <c:otherwise>
           <div id="showToggle${name}" class="toggle" name="${name}" align="left"><b><font size="-1" face="Arial,Helvetica">${displayName}</font></b>
             <a href="javascript:${showOnClick}wdk.api.showLayer('${name}')&amp;&amp;wdk.api.showLayer('hideToggle${name}')&amp;&amp;wdk.api.hideLayer('showToggle${name}')&amp;&amp;wdk.api.storeIntelligentCookie('show${name}',1,365)" title="Show ${displayName}" onmouseover="status='Show ${displayName}';return true" onmouseout="status='';return true">Show</a>
           </div>

           <div id="hideToggle${name}" class="toggle" name="${name}" align="left"><b><font size="-1" face="Arial,Helvetica">${displayName}</font></b>
              <a href="javascript:wdk.api.hideLayer('${name}')&amp;&amp;wdk.api.showLayer('showToggle${name}')&amp;&amp;wdk.api.hideLayer('hideToggle${name}')&amp;&amp;wdk.api.storeIntelligentCookie('show${name}',0,365);" title="Hide ${displayName}" onmouseover="status='Hide ${displayName}';return true" onmouseout="status='';return true">Hide</a>
            </div>
        </c:otherwise>
        </c:choose>

      </c:otherwise>
    </c:choose>
    </td>
    <c:if test='${displayLink != null && displayLink != ""}'>
      <td align="left">
         <font size="-1" face="Arial,Helvetica">
				 ${displayLink}
         </font>
      </td>
    </c:if>

    <c:choose>
	 <c:when  test='${dsLink != null && dsLink != ""}'>
	 <td align="right">
           <font size="-1" face="Arial,Helvetica">
           [<a href="${dsLink}">Data Sets</a>]
           </font>
        </td>	
	</c:when>
      <c:when test="${name != null && name !='' && hasDBDataset}">
        <td align="right">
          <c:set var="wdkRecord" value="${requestScope.wdkRecord}" />
          <c:set var="rcName" value="${wdkRecord.recordClass.fullName}" />
          <font size="-2" face="Arial,Helvetica">
          [<a href="<c:url value='/getDataset.do?reference=${name}&recordClass=${rcName}&display=detail' />">Data Sets</a>]
          </font>
        </td>
      </c:when>
      <c:when test='${attribution != null && attribution != ""}'>
        <td align="right">
           <font size="-1" face="Arial,Helvetica">
           [<a href="getDataset.do?display=detail&datasets=${attribution}&title=${displayNameParam}">Data Sets</a>]
           </font>
        </td>
      </c:when>
    </c:choose>

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
           <script type="text/javascript">
              wdk.api.toggleLayer('${name}', 'toggle${name}');
            </script>
        </c:if>
     </c:when> 

     <%--  Netscape/Firefox can't handle this way of doing it  --%>
     <c:otherwise>
        <c:choose>
          <c:when test="${isOpen}">
          <script type="text/javascript">
          <!-- //
            wdk.api.showLayer("${name}");
            wdk.api.showLayer("hideToggle${name}");
            wdk.api.hideLayer("showToggle${name}");
          // -->
          </script>
         </c:when>
         <c:otherwise>
          <script type="text/javascript">
          <!-- //
            wdk.api.hideLayer("${name}");
            wdk.api.hideLayer("hideToggle${name}");
            wdk.api.showLayer("showToggle${name}");
          // -->
          </script>
         </c:otherwise>
        </c:choose>
     </c:otherwise>
     </c:choose>

        <c:if test="${imageId != null && isOpen}">
          <script type="text/javascript">
            <!-- //
              wdk.api.updateImage('${imageId}', '${imageSource}')
            // -->
          </script>
        </c:if>

        <c:if test="${imageMapDivId != null && isOpen}">
          <script type="text/javascript">
            <!-- //
              wdk.api.updateImageMapDiv('${imageMapDivId}', '${imageMapSource}', '${postLoadJS}')
            // -->
          </script>
        </c:if>
</c:if>

