<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="species"
              description="Restricts output to only this species"
%>

<%@ attribute name="type"  description="Type"  %>

<%@ attribute name="tableName"
              description="PhenotypeGraphs or ExpressionGraphs or PutativeFunctionGraphs"
%>


<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set value="${wdkRecord.tables[tableName]}" var="tbl"/>
<c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>
<c:set var="i" value="0"/>

<c:forEach var="row" items="${tbl}">

  <c:if test="${(species eq row['species'].value) || (type eq 'compound') || (type eq 'dataset')}">

    <c:set var="secName" 	value="${row['module'].value}"/>

    <c:set var="baseUrlWithArgs" value="${plotBaseUrl}?type=${secName}&project_id=${row['project_id'].value}&dataset=${row['dataset_name']}"/>

    <c:if test="${row['is_graph_custom'].value eq 'false'}">
       <c:set var="baseUrlWithArgs" value="${baseUrlWithArgs}&template=1"/>

    <c:set var="secName"  value="${secName}${row['dataset_name']}"/>
    </c:if>
    
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

  <c:if test="${type ne 'compound'}">      </c:if>
    <c:set var="selectList">
      <form name=${name}List>
        <c:set var="vp_i" 			value="0"/>
        <c:set var="defaultVp" 			value=""/>

	
	<c:choose>
	  <c:when test="${type ne 'compound'}">
	  <b>Choose Gene to Display Graphs for</b>
	  </c:when>
	  <c:when test="${type eq 'compound'}">
	    <b>Choose Compound to Display Graphs for</b>
	  </c:when>
	</c:choose>
       <br />

       <c:set var="selected_graph_id" value="TEMP"/>
       <c:set var="gi_i" value="0"/>

       <c:forEach var="graph_id" items="${fn:split(row['graph_ids'].value, ',')}">
            <c:if test="${gi_i == 0}">
               <c:set var="selected_graph_id" value="${graph_id}"/>
            </c:if>
           <c:if test="${graph_id eq row['source_id']}">
               <c:set var="selected_graph_id" value="${graph_id}"/>
           </c:if>
           <c:set var="gi_i" value="${gi_i + 1}"/>
       </c:forEach>

       <c:forEach var="graph_id" items="${fn:split(row['graph_ids'].value, ',')}">

          <c:choose>
            <c:when test="${graph_id eq selected_graph_id}">
            <a href="/gene/${graph_id}#Expression">${graph_id}</a> <input type="radio" onclick="updateText('${textId}','${row['source_id']}','${graph_id}',this.form);wdk.api.updateImage('${imgId}', formatResourceUrl('${preImgSrc}', this.form)); wdk.api.updateDiv('${tableId}', formatResourceUrl('${preTableSrc}', this.form), '${tblErrMsg}');" value="${graph_id}" name="geneOptions" checked /> &nbsp;
                        
                         <c:set var="imgSrc" 		value="${imgSrc}&id=${graph_id}"/>
                         <c:set var="tableSrc" 		value="${tableSrc}&id=${graph_id}"/>
                         
            </c:when>
            <c:otherwise>
            <a href="/gene/${graph_id}#Expression">${graph_id}</a> <input type="radio" onclick="updateText('${textId}','${row['source_id']}','${graph_id}',this.form);wdk.api.updateImage('${imgId}', formatResourceUrl('${preImgSrc}', this.form)); wdk.api.updateDiv('${tableId}', formatResourceUrl('${preTableSrc}', this.form), '${tblErrMsg}');" value="${graph_id}" name="geneOptions" /> &nbsp;
            </c:otherwise>
          </c:choose>

        </c:forEach>

        <br/ >
	  <c:if test="${type ne 'compound'}">
            <c:choose>
              <c:when test="${row['source_id'].value eq selected_graph_id}">
                <div id="${textId}"  class="coloredtext"></div>
              </c:when>
              <c:otherwise>
                <div id="${textId}"  class="coloredtext">WARNING:  This Gene (${row['source_id'].value}) does not have data for this experiment.  Instead, we are showing data for the selected Gene (${selected_graph_id}) which was discovered to be in the same gene group.  This may or may NOT accurately represent the gene you are interested in.</div>
              </c:otherwise>
            </c:choose>
	    </c:if>
<br /><br />





        		<b>Choose Graph(s) to Display</b><br />
        <c:set var="VisibleParts" value="${fn:split(row['visible_parts'].value,',')}"/>
        <c:set var="numVisibleParts" value="0"/>    
        <c:forEach var="visiblePart" items="${VisibleParts}">
            <c:set var="numVisibleParts" value="${numVisibleParts +  1}"/>
        </c:forEach>
        <c:forEach var="vp" items="${fn:split(row['visible_parts'].value, ',')}">

          <c:if test="${fn:contains(vp, 'rma')}">
            <c:set var="hasRma" value="true"/>
          </c:if>
          <c:if test="${fn:contains(vp, 'coverage')}">
            <c:set var="hasCoverage" value="true"/>
          </c:if>
          
          <c:choose>
            <c:when test="${vp_i == 0}">
              ${vp} <input type="checkbox" onclick="wdk.api.updateImage('${imgId}', formatResourceUrl('${preImgSrc}', this.form)); wdk.api.updateDiv('${tableId}', formatResourceUrl('${preTableSrc}', this.form), '${tblErrMsg}');" value="${vp}" name="${vp}" checked /> &nbsp;

              <c:set var="imgSrc" 		value="${imgSrc}&vp=_LEGEND,${vp}"/>
              <c:set var="tableSrc" 		value="${tableSrc}&vp=${vp}"/>
              <c:set var="defaultVp" 		value="${vp}"/>
            </c:when>
            <c:otherwise>
              ${vp} <input type="checkbox" onclick="wdk.api.updateImage('${imgId}', formatResourceUrl('${preImgSrc}', this.form)); wdk.api.updateDiv('${tableId}', formatResourceUrl('${preTableSrc}', this.form), '${tblErrMsg}');" value="${vp}"name="${vp}" /> &nbsp;
            </c:otherwise>
          </c:choose>
          <c:set var="vp_i" value="${vp_i +  1}"/>
 

         <c:choose>
            <c:when test="${numVisibleParts % 3 == 0 && numVisibleParts % 2 != 0}">
               <c:if test="${vp_i % 3 == 0}">
                 <br />
               </c:if>
            </c:when>
            <c:otherwise>
               <c:if test="${vp_i % 2 == 0}">
                 <br />
               </c:if>
            </c:otherwise>
          </c:choose>

        </c:forEach>
                 <br /> <br />  

<c:if test="${fn:toLowerCase(row['has_meta_data'].value) eq 'true'}">
<b>Color Samples by: </b><br /> 
              <c:set var="isFirstItem" value="1"/>
              <c:set var="categories" value="${fn:split(row['meta_data_categories'].value,',')}"/>
              <c:set var="defaultCategory" value="${categories[0]}"/>
              <select name="meta_data_categories" onchange="wdk.api.updateImage('${imgId}', formatResourceUrl('${preImgSrc}', this.form)); wdk.api.updateDiv('${tableId}', formatResourceUrl('${preTableSrc}', this.form), '${tblErrMsg}');" />
                  <c:set var="isFirstItem" value="1"/>
                  <c:forEach var="category" items="${categories}">
                             <option value="${category}">${category}</option>
                  </c:forEach>
                  <c:set var="imgSrc" 		value="${imgSrc}&typeArg=${defaultCategory}"/>
        </c:if> 
<br /> <br />


              
        <c:if test="${row['project_id'].value eq 'PlasmoDB' || row['project_id'].value eq 'FungiDB' || row['project_id'].value eq 'MicrosporidiaDB' || row['project_id'].value eq 'PiroplasmaDB' || row['project_id'].value eq 'CryptoDB' || row['project_id'].value eq 'ToxoDB'}">

          <c:if test="${hasRma eq 'true'}">
            <b>Show log Scale (not applicable for log(ratio) graphs, percentile graphs or data tables)</b>
            <input type="checkbox" onclick="wdk.api.updateImage('${imgId}', formatResourceUrl('${preImgSrc}', this.form)); wdk.api.updateDiv('${tableId}', formatResourceUrl('${preTableSrc}', this.form), '${tblErrMsg}');" value="internal_want_logged" name="want_logged" checked />
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


       		<br /><br />
       		<div class="small">
        		<b>Description</b><br />
        		${row['description'].value}<br /><br /><br /> 
        		<b>x-axis</b><br />
        		${row['x_axis'].value}<br /><br /><br /> 
        		<b>y-axis</b><br />
        		${row['y_axis'].value} 

       			<br /><br />
        		${selectList}
       		</div>
      </td>
      </tr>
      </table>
  <%--     </FORM>  --%>
    </c:set>       <%-- var="profileContent" --%>

<%-- END OF SETTING VARIABLES ---%>

    <c:if test="${row['has_graph_data'].value eq '0'}">
    	<c:set var="profileContent" 	value="none"/>
    	<c:set var="noData" 		value="true"/>

    	<c:if test="${row['profile_name'] eq 'Expression profiling of Tbrucei five life cycle stages'}">
        	<c:set var="profileContent" value="<i>None</i>  NOTE: For this experiment, in the cases where the probe set mapped to near-identical genes, data was assigned to a single representative gene."/>
        	<c:set var="noData" value="false"/>
    	</c:if>
    </c:if>



<c:set var="graphToggle">

<imp:toggle
    name="${secName}${i}"
    isOpen="${row['mainOpen'].value}"
    noData="${noData}"
    displayName="${row['display_name'].value}"
    content="${profileContent}"
    attribution=""
    imageId="${imgId}"
    imageSource="${imgSrc}" />


</c:set>

<c:choose>
  <c:when test="${type eq 'dataset'}">
    <imp:simpleToggle
       name="Example Graph(s) (All applicable record pages will contain this graphical representation for this dataset)"
       content="${graphToggle}"
       show="false"/>
  </c:when>
  <c:otherwise>
    ${graphToggle}
  </c:otherwise>
</c:choose>


  </c:if>

  <c:set var="i" value="${i +  1}"/>      
</c:forEach>  	<%-- var="row" items="${tbl}" --%>


<script type="text/javascript">
function formatResourceUrl(url, myForm) {
  var wl = 0;
  var vp = '&vp=_LEGEND';
  var id = '&id=';
  var typeArg = "";

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
    if (e.selectedIndex > -1) {
        typeArg = '&typeArg=' + e.options[e.selectedIndex].text;
    }
  }    
  url = url + id + vp + '&wl=' + wl + typeArg;
  return url;
}
function updateText(id,sourceId,geneId,myForm) {
   var myText = 'The Data and Graphs you are viewing are for an alternative gene in the gene group.   This may or may NOT accurately represent the gene you are interested in.';
   document.getElementById(id).innerHTML = myText;
   if (sourceId == geneId) {
       document.getElementById(id).style.display="none";
   }
   else {
      document.getElementById(id).style.display="inline"; 
   }   
}

</script>
