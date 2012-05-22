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
<c:set var="i" value="0"/>

<c:forEach var="row" items="${tbl}">
  <c:if test="${organism eq row['organism'].value}">

    <c:set var="name" 		value="${fn:replace(row['module'].value, '::', '')}"/>
    <c:set var="secName" 	value="${row['module'].value}"/>
          <c:if test="${fn:contains(vp, 'rma')}">
            <c:set var="hasRma" value="true"/>
          </c:if>
          <c:if test="${fn:contains(vp, 'coverage')}">
            <c:set var="hasCoverage" value="true"/>
          </c:if>

          <c:set var="baseUrlWithArgs" value="${plotBaseUrl}?type=${secName}&project_id=${row['project_id'].value}"/>


    
    <c:set var="imgId" value="img${secName}_${i}"/>    
    <c:set var="preImgSrc" value="${baseUrlWithArgs}&fmt=png"/>
    
    <c:set var="tableId" value="${secName}Data_${i}"/>
    <c:set var="textId" value="${secName}Text_${i}"/>
    <%-- Since secName can have invalid html ID characters, must clean them up before using --%>
    <c:set var="tableId" value="${fn:replace(tableId, '.', '')}"/>
    <c:set var="tableId" value="${fn:replace(tableId, ':', '')}"/>
    <c:set var="preTableSrc" value="${baseUrlWithArgs}&fmt=table"/>
    
    <c:set var="imgSrc" value="${preImgSrc}"/>
    <c:set var="tableSrc" value="${preTableSrc}"/>

    <c:set var="noData" value="false"/>
    <c:set var="tblErrMsg" value="Unable to load data table with newly selected columns."/>

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
              ${vp} <input type="checkbox" onclick="updateImage('${imgId}', formatResourceUrl('${preImgSrc}', this.form)); updateDiv('${tableId}', formatResourceUrl('${preTableSrc}', this.form), '${tblErrMsg}');" value="${vp}" name="${vp}" checked /> &nbsp;

              <c:set var="imgSrc" 		value="${imgSrc}&vp=_LEGEND,${vp}"/>
              <c:set var="tableSrc" 		value="${tableSrc}&vp=${vp}"/>
              <c:set var="defaultVp" 		value="${vp}"/>
            </c:when>
            <c:otherwise>
              ${vp} <input type="checkbox" onclick="updateImage('${imgId}', formatResourceUrl('${preImgSrc}', this.form)); updateDiv('${tableId}', formatResourceUrl('${preTableSrc}', this.form), '${tblErrMsg}');" value="${vp}"name="${vp}" /> &nbsp;
            </c:otherwise>
          </c:choose>
          <c:set var="vp_i" value="${vp_i +  1}"/>

          <c:if test="${vp_i % 3 == 0}">
            <br />
          </c:if>
          
        </c:forEach>
       
       <br /> <br />
       <b>Choose Gene to Display Graphs for</b>
       <br />
       <c:set var="current_graph_id"            value="${row['default_graph_id'].value}"/>
       <c:forEach var="graph_id" items="${fn:split(row['graph_ids'].value, ',')}">

          <c:set var="gi_i" 			value="0"/> 
           
          <c:choose>
            <c:when test="${graph_id eq row['default_graph_id'].value}">
            <a href="/gene/${graph_id}#Expression">${graph_id}</a> <input type="radio" onclick="updateText('${textId}','${graph_id}',this.form);updateImage('${imgId}', formatResourceUrl('${preImgSrc}', this.form)); updateDiv('${tableId}', formatResourceUrl('${preTableSrc}', this.form), '${tblErrMsg}');" value="${graph_id}" name="geneOptions" checked /> &nbsp;
                        
                         <c:set var="imgSrc" 		value="${imgSrc}&id=${graph_id}"/>
                         
            </c:when>
            <c:otherwise>
            <a href="/gene/${graph_id}#Expression">${graph_id}</a> <input type="radio" onclick="updateText('${textId}','${graph_id}',this.form);updateImage('${imgId}', formatResourceUrl('${preImgSrc}', this.form)); updateDiv('${tableId}', formatResourceUrl('${preTableSrc}', this.form), '${tblErrMsg}');" value="${graph_id}"name="geneOptions" /> &nbsp;
            </c:otherwise>
          </c:choose>
          <c:set var="gi_i" value="${gi_i +  1}"/>

          <c:if test="${gi_i % 3 == 0}">
            <br /><br />
          </c:if>
          
        </c:forEach>
        <br/ >

        <c:choose>
           <c:when test="${row['source_id'].value eq row['default_graph_id'].value}">
             <div id="${textId}"  class="coloredtext">The Data and Graphs you are viewing are for syntentic gene : ${current_graph_id}</div>
           </c:when>
           <c:otherwise>
             <div id="NoDataText" class="coloredtext">Warning: ${row['source_id']} does not have data for this experiment.</div><div id="${textId}"  class="coloredtext">The Data and Graphs you are viewing are for syntentic gene : ${current_graph_id}</div>
           </c:otherwise>
        </c:choose>
              
        <c:if test="${row['project_id'].value eq 'PlasmoDB' || row['project_id'].value eq 'FungiDB'}">
          <c:if test="${hasRma eq 'true'}">
            <br /><br /><b>Show log Scale (not applicable for log(ratio) OR percentile graphs)</b><br />
            <input type="checkbox" onclick="updateImage('${imgId}', formatResourceUrl('${preImgSrc}', this.form)); updateDiv('${tableId}', formatResourceUrl('${preTableSrc}', this.form), '${tblErrMsg}');" value="internal_want_logged" name="want_logged" checked />
          </c:if>

          <c:if test="${hasCoverage eq 'true'}">
            <br /><br /><b>Show log Scale (not applicable for log(ratio) OR percentile graphs)</b><br />
            <input type="checkbox" onclick="updateImage('${imgId}', formatResourceUrl('${preImgSrc}', this.form)); updateDiv('${tableId}', formatResourceUrl('${preTableSrc}', this.form), '${tblErrMsg}');" value="internal_want_logged" name="want_logged" />
          </c:if>
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

        	<c:choose>
         	<c:when test="${not empty row['dataTable'].value}">
            		<imp:wdkTable tblName="${row['dataTable'].value}" isOpen="false"/>
         	</c:when>
         	<c:otherwise>
         		<c:set var="profileDataTable">
           			<c:set var="prefix" 		value="<%= request.getRequestURL() %>" />

           			<c:import url="${prefix}/../../../../../${tableSrc}"  />  
         		</c:set>

<%--   Data table by some graphs --%>
<imp:toggle
    name="${tableId}"     
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
    <c:if test="${row['project_id'].value eq 'PlasmoDB' || row['project_id'].value eq 'FungiDB'}">
       <c:set var="dataAttribution"  value=""/>
     </c:if>

<imp:toggle
    name="${secName}_${i}"
    isOpen="${row['mainOpen'].value}"
    noData="${noData}"
    displayName="${row['display_name'].value}"
    content="${profileContent}"
    attribution="${dataAttribution}"
    imageId="${imgId}"
    imageSource="${imgSrc}" />				

  </c:if>  	<%-- test="${organism eq row['organism'].value}" --%>
  <c:set var="i" value="${i +  1}"/>      
</c:forEach>  	<%-- var="row" items="${tbl}" --%>


<script type="text/javascript">
function formatResourceUrl(url, myForm) {
  var wl = 0;
  var vp = '&vp=_LEGEND';
  var id = '&id=';

  for (var i=0; i < myForm.length; i++){
    var e = myForm.elements[i];


    if (e.type == 'checkbox' && e.name == 'want_logged' && e.checked) {
      wl = 1;
    }
    if (e.type == 'checkbox' && e.name !='want_logged' && e.checked) {
      vp = vp + ',' + e.value;
      
    }
    if (e.type == 'radio' && e.checked) {
      id = id + e.value;
    }
  }
  url = url + id + vp + '&wl=' + wl;
  return url;
}

function updateText(id,geneId,myForm) {
   var myText = 'The Data and Graphs you are viewing are for syntentic gene : ';
   myText = myText + geneId;
   document.getElementById(id).innerHTML = myText;
}

</script>
