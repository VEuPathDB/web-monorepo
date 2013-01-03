<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="pathway"
              description="Restricts output to only this pathway"
%>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set value="${wdkRecord.tables['ECNumberOrganismMap']}" var="tblEC"/>
<c:set value="${wdkRecord.tables['CompoundLabel']}" var="tblCmp"/>


<map name=pathwayMap>



<c:forEach var="row" items="${tblEC}">
    <c:if test="${pathway eq row['source_id'].value}">

      <c:set var="node_value"      value="${row['display_label'].value}"/>
      <c:set var="organisms"       value="${row['organisms'].value}"/>
      <c:set var="genes"           value="${row['genes'].value}"/>
      <c:set var="x1"              value="${row['x1'].value}"/>
      <c:set var="y1"              value="${row['y1'].value}"/>
      <c:set var="x2"              value="${row['x2'].value}"/>
      <c:set var="y2"              value="${row['y2'].value}"/>

      <c:set var="popup" value="<table><tr><td>EC No:</td><td><a href='processQuestion.do?questionFullName=GeneQuestions.InternalGenesByEcNumber&array%28organism%29=all&array%28ec_number_pattern%29=${node_value}&questionSubmit=Get+Answer'>${node_value}</a></td></tr><tr><td>Organisms:</td><td>${organisms}</td></tr><tr><td>Genes:</td><td>${genes}</td></tr></table>"/>

    <area shape="rect"  coords="${x1},${y1},${x2},${y2}" alt="${popup}">
    </c:if>
</c:forEach>



<c:forEach var="row" items="${tblCmp}"> 
    <c:if test="${pathway eq row['source_id'].value}"> 
      <c:set var="project_id"      value="${row['project_id'].value}"/>
      <c:set var="node_value"      value="${row['display_label'].value}"/>
      <c:set var="compound"        value="${row['compound_source_id'].value}"/> 
      <c:set var="x"               value="${row['x'].value}"/> 
      <c:set var="y"               value="${row['y'].value}"/> 
      <c:set var="radius"          value="${row['radius'].value}"/> 

      <c:set var="popup" value="<table border='1' cellpadding='10'><tr><td>Compound:  </td><td><a href='showRecord.do?name=CompoundRecordClasses.CompoundRecordClass&source_id=${compound}&project_id=${project_id}'>${node_value}</a></td></tr></table>"/>
    <area shape="circle"  coords="${x},${y},${radius}" alt="${popup}"> 
    </c:if> 
</c:forEach> 

</map>


<script type="text/javascript">
// Create the tooltips only when document ready
$(document).ready(function(){
   // Use the each() method to gain access to each elements attributes
   $('area').each(function()
   {
      $(this).qtip(
      {
         content: $(this).attr('alt'), // Use the ALT attribute of the area map
         position: {		
                my: 'top left',  // Position my top left...
		at: 'center', // at the bottom right of...
         },
         hide:  {
            fixed: true // Make it fixed so it can be hovered over
         },
	 style: {
		classes: 'ui-tooltip-green ui-tooltip-rounded'
	 }
      });
   });
});
</script>

