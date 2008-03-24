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

<%@ attribute name="colors"
              type="java.lang.String"
              required="true"
              description="colors"%>

<%@ attribute name="selectElement"
              type="java.lang.String"
              required="true"
              description="id of the select element to load the values into"%>

<%@ attribute name="queryName"
              type="java.lang.String"
              required="true"
              description="name of teh query to get the parameter values"%>

<c:set var="qName" value="${queryName}"/>
<c:set var="portalsProp" value="${portals}"/>

<c:set var="selectId" value="${selectElement}"/>
<c:set var="colorsStr" value="${colors}"/>
<c:set var="qP" value="${qp}"/>
<c:set var="pNam" value="${qP.name}"/>
<c:set var="opt" value="0"/>
<c:set var="displayType" value="${qP.displayType}"/>
<c:set var="vocabArray" value=""/>

<c:set var="used_sites" value="${applicationScope.wdkModel.properties['SITES']}"/>
<c:set var="us" value="${fn:replace(used_sites,'\"','')}" />
<c:set var="siteColl" value="${fn:split(us,',')}"/>




<%--<c:choose>
   <c:when test="${qp.class.name eq 'org.gusdb.wdk.model.jspwrap.EnumParamBean'}">
      <c:set var="vocabArray" valuse="qP."/>
   </c:when>
--%>
<%--CODE TO SET UP THE SITE VARIABLES --%>
	<c:set var="portalsArr" value="${fn:split(portalsProp,';')}" />
	<c:set var="colorArr" value="${fn:split(colorsStr, ',')}" />

<script language="JavaScript" type="text/javascript">

var sites = new Array(${used_sites});
var query = "${qName}";

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
		navigation_toggle_Color('${tLevel}','${pNam}','${selectId}');
	}
</script>
 <script src="js/Colors.js" type="text/javascript"></script>
 <script src="js/ApiDB_Ajax_Utils.js" type="text/javascript"></script>
<table width="300"><tr><td valign="top">
<div id="navigation">

	<ul id="nav_list">
	<c:set var="v" value="0"/>
	<c:forEach items="${portalsArr}" var="portal">
		<c:set var="portalArr" value="${fn:split(portal,',')}" />
		<c:set var="site" value="${fn:replace(portalArr[0],'\"','')}"/>
		<li><c:if test="${!(v eq 0)}">&nbsp;&nbsp;&nbsp;&nbsp; </c:if>
                    <a id="${site}" onclick="navigation_toggle_Color('${site}','${pNam}','${selectId}')" href="javascript:var noop = 0">
			${site}
		    </a>
	</c:forEach>
	</ul>

	<c:set var="v" value="0"/>
	<c:forEach items="${portalsArr}" var="portal"><%-- Loop Through the different Sites (1)--%> 
		<c:set var="portalArr" value="${fn:split(portal,',')}" />
		<c:set var="top" value="${fn:replace(portalArr[0],'\"','')}"/>
		<div id="${top}_area" style="display:none">
			<ul>
                        	<li><i class="all_none" onclick="selectAll_None('${top}',true)">All</i>&nbsp;&nbsp;<i class="all_none" onclick="selectAll_None('${top}',false)">None</i></li>
			<c:set var="z" value="0"/>
			<c:forEach items="${portal}" var="site"><%-- Loop Through the organisms in each site (2)--%>
			<c:set var="site" value="${fn:replace(site,'\"','')}" />
			<c:choose>
				<c:when test="${v eq 0}"><%-- Looking at the Portal...List all available organisms --%>
					<c:set var="siteCount" value="0"/>
					<c:forEach items="${siteColl}" var="siteNam"><%-- Loop through all available organisms (3)--%>
					    <c:set var="i" value="0"/>
					    <c:forEach items="${qP.vocab}" var="flatVoc"> <%-- Loop through all organisms for this query (4)--%>
						<c:if test="${fn:containsIgnoreCase(flatVoc,siteNam)}">
							<li>		
								<input name="myMultiProp(${pNam})" value="${flatVoc}" id="${siteCount}" type="checkbox" onclick="copySelectionColor(this,'${selectId}')">
									<i>${flatVoc}</i>
						    		</input>
						    		<c:set var="myBox" value="${siteNam}.jpg"/>
						    		&nbsp;&nbsp;<img src='<c:url value="/images/${myBox}"/>' width="10" height="10"/><br>
							</li>
						</c:if>
						<c:set var="i" value="${i+1}"/>
					    </c:forEach><%-- End of Loop (4) --%>
					    <c:set var="siteCount" value="${siteCount+1}"/>
					</c:forEach><%-- End of Loop (3) --%>
				</c:when>
				<c:otherwise>
					<c:set var="i" value="0"/>
					<c:forEach items="${qP.vocab}" var="flatVoc"><%-- Loop Through all organisms for this query (5)--%>
					  <c:if test="${fn:containsIgnoreCase(flatVoc,site)}">
						<c:set var="siteNumber" value="none"/>
						<c:set var="siteCount" value="0"/>
						<c:forEach items="${siteColl}" var="siteNam"><%-- Loop Through all organisms (6)--%>
							<c:if test="${fn:contains(site,siteNam)}"><c:set var="siteNumber" value="${siteCount}"/></c:if>
							<c:set var="siteCount" value="${siteCount + 1}"/>
						</c:forEach><%-- End of Loop (6) --%>
						<li><input name="myMultiProp(${pNam})" value="${flatVoc}" id="${siteNumber}" type="checkbox" onclick="copySelectionColor(this,'${selectId}')" >
							<i>${flatVoc}</i>
							<c:set var="myBox" value="${site}.jpg"/>
						    	&nbsp;&nbsp;<img src='<c:url value="/images/${myBox}"/>' width="10" height="10"/><br>
						</input></li>
					  </c:if>
					  <c:set var="i" value="${i+1}"/>
					</c:forEach><%-- End of Loop (5)--%>
				</c:otherwise>
			</c:choose>
			<c:set var="z" value="${z+1}"/>
		</c:forEach><%-- End of Loop (2) --%>
			</ul></div>
	<c:set var="v" value="${v+1}"/>
	</c:forEach><%-- End of Loop (1) --%>
</div>
</td></tr></table>
