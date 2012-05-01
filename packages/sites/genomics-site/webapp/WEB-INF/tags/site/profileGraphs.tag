<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="organism"
              description="Restricts output to only this organism"
%>

<%@ attribute name="tableName"
              description="PhenotypeGraphs or ExpressionGraphs"
%>


<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set value="${wdkRecord.tables[tableName]}" var="tbl"/>
<c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>


<c:forEach var="row" items="${tbl}">
  <c:if test="${organism eq row['organism'].value}">

    <c:set var="name" 		value="${fn:replace(row['module'].value, '::', '')}"/>
    <c:set var="secName" 	value="${row['module'].value}"/>
    <c:set var="imgId" 		value="img${secName}"/>
    <c:set var="preImgSrc" 	value="${plotBaseUrl}?type=${secName}&project_id=${row['project_id'].value}&fmt=png&id=${row['source_id'].value}"/>
    <c:set var="imgSrc" 	value="${preImgSrc}"/>
    <c:set var="noData" 	value="false"/>



   <c:set var="hasRma" value="false"/>
   <c:set var="hasCoverage" value="false"/>

    <c:set var="selectList">
      <form name=${name}List>
        <c:set var="vp_i" 			value="0"/>
        <c:set var="defaultVp" 			value=""/>
        <c:forEach var="vp" items="${fn:split(row['visible_parts'].value, ',')}">

          <c:if test="${fn:contains(vp, 'rma')}">
            <c:set var="hasRma" value="true"/>
          </c:if>
          <c:if test="${fn:contains(vp, 'coverage')}">
            <c:set var="hasCoverage" value="true"/>
          </c:if>

          <c:choose>
            <c:when test="${vp_i == 0}">
              ${vp} <input type="checkbox" onClick="javascript:updateImage('${imgId}', formatImgUrl('${preImgSrc}', this.form))" value="${vp}" name="${vp}" checked /> &nbsp;

              <c:set var="imgSrc" 		value="${imgSrc}&vp=_LEGEND,${vp}"/>
              <c:set var="defaultVp" 		value="${vp}"/>
            </c:when>
            <c:otherwise>
              ${vp} <input type="checkbox" onClick="javascript:updateImage('${imgId}', formatImgUrl('${preImgSrc}', this.form))" value="${vp}"name="${vp}" /> &nbsp;
            </c:otherwise>
          </c:choose>
          <c:set var="vp_i" value="${vp_i +  1}"/>

          <c:if test="${vp_i % 3 == 0}">
            <br />
          </c:if>
        </c:forEach>

        <c:if test="${(hasRma eq 'true' || hasCoverage eq 'true') && row['project_id'].value eq 'PlasmoDB'}">
          <br /><br /><b>Show log Scale (not applicable for log(ratio) OR percentile graphs)</b><br />
          <input type="checkbox" onClick="javascript:updateImage('${imgId}', formatImgUrl('${preImgSrc}', this.form))" value="internal_want_logged" name="want_logged" checked />
        </c:if>
      </form>

    </c:set>

    <c:set var="profileContent">
      <%--   <FORM NAME="${name}Pick">  --%>
        <table id="profileContent">
        <tr>
        <td>
          <img  id="${imgId}" src="<c:url value='/images/spacer.gif'/>">
        </td>

        <td class="centered">
        	<c:set var="noProfileDataTable">false</c:set>
        	<c:set var="toggleName" value="${row['module'].value}"/>

        	<c:choose>
         	<c:when test="${not empty row['dataTable'].value}">
            		<imp:wdkTable tblName="${row['dataTable'].value}" isOpen="false"/>
         	</c:when>
         	<c:otherwise>
         		<c:set var="profileDataTable">
           			<c:set var="prefix" 		value="<%= request.getRequestURL() %>" />
           			<c:set var="tableSrc" 		value="${plotBaseUrl}?type=${secName}&project_id=${row['project_id'].value}&fmt=table&id=${row['source_id'].value}"/>
           			<c:import url="${prefix}/../../../../../${tableSrc}"  />  
         		</c:set>

<%--   Data table by some graphs --%>
<imp:toggle
    name="${toggleName}Data"     
    displayName="Data Table"
    content="${profileDataTable}"
    isOpen="${row['dataOpen'].value}"
    noData="${noProfileDataTable}"
    attribution=""/>   

         	</c:otherwise>
         	</c:choose>

       		<br /><br />
       		<div class="small">
        		<b>Description</b><br />
        		${row['description'].value}<br /><br /><br /> 
        		<b>x-axis</b><br />
        		${row['x_axis'].value}<br /><br /><br /> 
        		<b>y-axis</b><br />
        		${row['y_axis'].value} 

       			<br /><br />
        		<b>Choose Graph(s) to Display</b><br />
        		${selectList}
       		</div>
      </td>
      </tr>
      </table>
  <%--     </FORM>  --%>
    </c:set>       <%-- var="profileContent" --%>

<%-- END OF SETTING VARIABLES ---%>

    <c:if test="${row['has_profile'].value eq '0'}">
    	<c:set var="profileContent" 	value="none"/>
    	<c:set var="noData" 		value="true"/>

    	<c:if test="${row['profile_name'] eq 'Expression profiling of Tbrucei five life cycle stages'}">
        	<c:set var="profileContent" value="<i>None</i>  NOTE: For this experiment, in the cases where the probe set mapped to near-identical genes, data was assigned to a single representative gene."/>
        	<c:set var="noData" value="false"/>
    	</c:if>
    </c:if>
 
    <c:set var="dataAttribution" value="${row['attribution'].value}"/>

<%-- This variable is for backward compatibility for attributions, and will become null as all components fal under workflow --%> 
    <c:if test="${row['project_id'].value eq 'PlasmoDB'}">
       <c:set var="dataAttribution"  value=""/>
     </c:if>

<imp:toggle
    name="${toggleName}"				
    isOpen="${row['mainOpen'].value}"			
    noData="${noData}"					
    displayName="${row['display_name'].value}"		
    content="${profileContent}"				
    attribution="${dataAttribution}"		
    imageId="${imgId}"					
    imageSource="${imgSrc}" />				

  </c:if>  	<%-- test="${organism eq row['organism'].value}" --%>
</c:forEach>  	<%-- var="row" items="${tbl}" --%>


<script type="text/javascript">
function formatImgUrl(url, myForm)
{
  var wl = 0;
  var vp = '&vp=_LEGEND';
  for (var i=0; i < myForm.length; i++){
    var e = myForm.elements[i];
    if(e.name == 'want_logged' && e.checked) {
      wl = 1;
    }
    if(e.checked) {
      vp = vp + ',' + e.value;
    }
  }
  url = url + vp + '&wl=' + wl;
  return(url);
}
</script>
