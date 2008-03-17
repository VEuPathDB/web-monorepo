<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

    <%--          type="org.gusdb.wdk.model.jspwrap.ParamBean"    --%>
<%@ attribute name="qp"
	      type="org.gusdb.wdk.model.jspwrap.ParamBean"
              required="true"
              description="parameter name"
%>
<%@ attribute name="portals"
              type="java.lang.String"
              required="true"
              description="parameter name"%>

<c:set var="portalsProp" value="${portals}"/>
<c:set var="qP" value="${qp}"/>
<c:set var="pNam" value="${qP.name}"/>
<c:set var="opt" value="0"/>
<c:set var="displayType" value="${qP.displayType}"/>
<c:set var="vocabArray" value=""/>
<%--<c:choose>
   <c:when test="${qp.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
      <c:set var="vocabArray" valuse="qP."/>
   </c:when>
--%>
<%--CODE TO SET UP THE SITE VARIABLES --%>
	<c:set var="portalsArr" value="${fn:split(portalsProp,';')}" />
	<c:forEach items="${portalsArr}" var="portal">
		<c:set var="portalArr" value="${fn:split(portal,',')}" />
	</c:forEach>

<script language="JavaScript" type="text/javascript">
	window.onload = function(){
<c:set var="v" value="0"/>
<c:set var="tLevel" value=""/>
<c:forEach items="${portalsArr}" var="portal">
	<c:set var="portalArr" value="${fn:split(portal,',')}" />
	<c:set var="site" value="${fn:replace(portalArr[0],'\"','')}"/>
	<c:if test="${v eq 0}"><c:set var="tLevel" value="${site}"/></c:if>
	     	renameInputs('${site}_area','none');
	<c:set var="v" value="${v+1}"/> 
</c:forEach>
		navigation_toggle('${tLevel}','${pNam}');
	}
</script>

<table width="300"><tr><td valign="top">
<div id="navigation">

	<ul id="nav_list">
	<c:set var="v" value="0"/>
	<c:forEach items="${portalsArr}" var="portal">
		<c:set var="portalArr" value="${fn:split(portal,',')}" />
		<c:set var="site" value="${fn:replace(portalArr[0],'\"','')}"/>
		<li><c:if test="${!(v eq 0)}">&nbsp;&nbsp;&nbsp;&nbsp; </c:if><a id="${site}" onclick="navigation_toggle('${site}','${pNam}')" href="javascript:noop()">${site}</a>
	</c:forEach>
	</ul>

	<c:set var="v" value="0"/>
	<c:forEach items="${portalsArr}" var="portal">
		<c:set var="portalArr" value="${fn:split(portal,',')}" />
		<c:set var="top" value="${fn:replace(portalArr[0],'\"','')}"/>
		<div id="${top}_area" style="display:none">
			<ul>
                        	<li><i onclick="selectAll_None('${top}',true)">All</i>&nbsp;&nbsp;<i onclick="selectAll_None('${top}',false)">None</i></li>
			<c:set var="z" value="0"/>
			<c:forEach items="${portal}" var="site">
			<c:set var="site" value="${fn:replace(site,'\"','')}" />
			<c:choose>
				<c:when test="${v eq 0}">
					    <c:set var="i" value="0"/>
					    <c:forEach items="${qP.vocab}" var="flatVoc">
						<li><input name="myMultiProp(${pNam})" value="${flatVoc}" id="${v}_${i}" type="checkbox" onclick="copySelection(this)">${flatVoc}</input></li>
						<c:set var="i" value="${i+1}"/>
					    </c:forEach>
				</c:when>
				<c:otherwise>
					<c:set var="i" value="0"/>
					<c:forEach items="${qP.vocab}" var="flatVoc">
					  <c:if test="${fn:containsIgnoreCase(flatVoc,site)}">
						<li><input name="myMultiProp(${pNam})" value="${flatVoc}" type="checkbox" onclick="copySelection(this)">${flatVoc}</input></li>
					  </c:if>
					  <c:set var="i" value="${i+1}"/>
					</c:forEach>
				</c:otherwise>
			</c:choose>
			<c:set var="z" value="${z+1}"/>
		</c:forEach>
			</ul></div>
	<c:set var="v" value="${v+1}"/>
	</c:forEach>
</div>
</td></tr></table>
