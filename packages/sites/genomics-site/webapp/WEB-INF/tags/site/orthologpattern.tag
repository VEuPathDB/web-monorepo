<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<link rel="stylesheet" href="<c:url value='/misc/Top_menu.css' />" type="text/css">


<%-- get wdkQuestion; setup requestScope HashMap to collect help info for footer --%>
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<jsp:useBean scope="request" id="helps" class="java.util.LinkedHashMap"/>
<c:set var="qForm" value="${requestScope.questionForm}"/>
<%-- display page header with wdkQuestion displayName as banner --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />
<c:set var="wdkQuestion" value="${requestScope.wdkQuestion}"/>
<c:set var="recordType" value="${wdkQuestion.recordClass.type}"/>
<c:set var="showParams" value="${requestScope.showParams}"/>

<%--CODE TO SET UP THE SITE VARIABLES --%>
<c:if test="${wdkModel.displayName eq 'EuPathDB'}">
    <c:set var="portalsProp" value="${props['PORTALS']}" />
</c:if>
<c:if test="${wdkModel.displayName eq 'EuPathDB'}">
     <div id="question_Form">
</c:if>


<c:set var="qParams" value="${wdkQuestion.paramsMap}"/>

<c:set var="profilePattern" value="${qParams['profile_pattern']}"/>
<c:set var="profilePatternName" value="${profilePattern.name}"/>

<c:set var="includedSpecies" value="${qParams['included_species']}"/>
<c:set var="includedSpeciesName" value="${includedSpecies.name}"/>

<c:set var="excludedSpecies" value="${qParams['excluded_species']}"/>
<c:set var="excludedSpeciesName" value="${excludedSpecies.name}"/>

<c:set var="resultSpecies" value="${qParams['organism']}"/>
<c:set var="resultSpeciesName" value="${resultSpecies.name}"/>
<c:set var="ind" value="${qParams['phyletic_indent_map']}"/>
<c:set var="trm" value="${qParams['phyletic_term_map']}"/>

<%--<c:if test="${fn:containsIgnoreCase(wdkModel.displayName,'EuPathDB')}">
	<c:set var="ind" value="${qParams['internal_phyletic_indent_map']}"/>
	<c:set var="trm" value="${qParams['internal_phyletic_term_map']}"/>
</c:if>--%>

<c:set var="indentMap" value="${ind.vocabMap}"/>
<c:set var="termMap" value="${trm.vocabMap}"/>


<c:choose>
    <c:when test="${showParams == true}">
<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">
<script type="text/javascript" lang="JavaScript 1.2">
<!-- //
includedSpeciesName = '${includedSpeciesName}';
excludedSpeciesName = '${excludedSpeciesName}';
profilePatternName = '${profilePatternName}';

<c:set var="taxaCount" value="${fn:length(ind.vocab)+1}"/>
state = new Array(${taxaCount});
urls = new Array("dc.gif", "yes.gif", "no.gif", "yes.gif", "unk.gif");
children = new Array(${taxaCount});
parent = new Array(${taxaCount});

for (var i = 0 ; i < ${taxaCount} ; i++) {
    state[i] = 0;
    children[i] = new Array();
    parent[i] = null;
}

abbrev =
  new Array("All Organisms"
            <c:forEach var="sp" items="${ind.vocab}">, "${sp}"</c:forEach>
   );




parents = new Array();
parents.push(0);
<c:set var="idx" value="1" />
<c:set var="lastindent" value="0" />
<c:forEach var="sp" items="${ind.vocab}">
  <c:set var="indent" value="${indentMap[sp]}" />
  <c:choose>
   <c:when test="${indent > lastindent}">
parents.push(${idx-1});
    </c:when>
    <c:when test="${indent < lastindent}">
      <c:forEach var="i" begin="${indent}" end="${lastindent-1}" step="1">
parents.pop();
      </c:forEach>
    </c:when>
    <c:otherwise>
    </c:otherwise>
  </c:choose>  
parent[${idx}] = parents[parents.length-1];

<c:set var="idx" value="${idx+1}" />
  <c:set var="lastindent" value="${indent}" />
</c:forEach>

// fill the children array
  for (var i = 0 ; i < parent.length ; i++) {
      if (parent[i] != null) {
	  var parentidx = parent[i];
	  children[parentidx][children[parentidx].length] = i;
      } 
}
// -->
</script>
<noscript>
Ack, this form won't work at all without JavaScript support!
</noscript>

<div class="params">
<input name="questionFullName" value="GeneQuestions.GenesByOrthologPattern" type="hidden"/>    

	<input name="myMultiProp(phyletic_term_map)" value="rnor" type="hidden"/>
	<input name="myMultiProp(phyletic_indent_map)" value="Archaea" type="hidden"/>

<table>
  <tr>
    <td><b>Show results from species:</b></td>
    <td><wdk:enumParamInput qp="${resultSpecies}" /></td>
  </tr>
</table>
<br />

<table border="0" cellpadding="2">

    <c:set var="idx" value="1"/>
    <tr>
      <td>
        <a href="javascript:void(0)" onclick="toggle(0)"><img border=0 id="img0" src="<c:url value="/images/dc.gif"/>"></a>&nbsp;<b>All Organisms</b>
      </td>
    </tr>
    <c:forEach var="sp" items="${ind.vocab}">
        <c:set var="spDisp" value="${termMap[sp]}"/>
        <c:set var="category" value="0"/>
        <c:if test="${spDisp == null}">
            <c:set var="spDisp" value="${sp}"/> 
            <c:set var="category" value="1"/>
        </c:if>
        <c:set var="indent" value="${indentMap[sp]}"/>

	<!-- ${sp} -->
        <tr>
	<td><c:forEach var="i" begin="0" end="${indent}" step="1">
                    &nbsp;&nbsp;&nbsp;&nbsp;
            </c:forEach>
            <a href="javascript:void(0)" onclick="toggle(${idx})"><img border=0 id="img${idx}" src="<c:url value="/images/dc.gif"/>"></a>&nbsp;<c:choose><c:when test="${category == 1}"><b><i>${spDisp}</i></b></c:when><c:otherwise><i>${spDisp}</i></c:otherwise></c:choose><c:if test="${sp != spDisp}">&nbsp;(<code>${sp}</code>)</c:if>
        </td>
        </tr>

      <c:set var="idx" value="${idx+1}"/>	
    </c:forEach>
</table>

  <html:hidden property="myProp(${includedSpeciesName})" value="n/a" />
  <html:hidden property="myProp(${excludedSpeciesName})" value="n/a" />
  <html:hidden property="myProp(${profilePatternName})" value="%"/>
</div><%-- END OF PARAMS DIV --%>
</html:form>
    </c:when>
    <c:otherwise>

<h1>Identify ${recordType}s based on ${wdkQuestion.displayName}</h1>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBorders> 

 <tr>
  <td bgcolor=white valign=top>
<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>

<%-- put an anchor here for linking back from help sections --%>
<A name="${fromAnchorQ}"></A>
<!--html:form method="get" action="/processQuestion.do" -->
<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">
<c:if test="${showParams == null}">
<script type="text/javascript" lang="JavaScript 1.2">
includedSpeciesName = '${includedSpeciesName}';
excludedSpeciesName = '${excludedSpeciesName}';
profilePatternName = '${profilePatternName}';

<!-- //

<c:set var="taxaCount" value="${fn:length(ind.vocab)+1}"/>
state = new Array(${taxaCount});
urls = new Array("dc.gif", "yes.gif", "no.gif", "yes.gif", "unk.gif");
children = new Array(${taxaCount});
parent = new Array(${taxaCount});

for (var i = 0 ; i < ${taxaCount} ; i++) {
    state[i] = 0;
    children[i] = new Array();
    parent[i] = null;
}

abbrev =
  new Array("All Organisms"
            <c:forEach var="sp" items="${ind.vocab}">, "${sp}"</c:forEach>
   );




parents = new Array();
parents.push(0);
<c:set var="idx" value="1" />
<c:set var="lastindent" value="0" />
<c:forEach var="sp" items="${ind.vocab}">
  <c:set var="indent" value="${indentMap[sp]}" />
  <c:choose>
   <c:when test="${indent > lastindent}">
parents.push(${idx-1});
    </c:when>
    <c:when test="${indent < lastindent}">
      <c:forEach var="i" begin="${indent}" end="${lastindent-1}" step="1">
parents.pop();
      </c:forEach>
    </c:when>
    <c:otherwise>
    </c:otherwise>
  </c:choose>  
parent[${idx}] = parents[parents.length-1];

<c:set var="idx" value="${idx+1}" />
  <c:set var="lastindent" value="${indent}" />
</c:forEach>

// fill the children array
  for (var i = 0 ; i < parent.length ; i++) {
      if (parent[i] != null) {
	  var parentidx = parent[i];
	  children[parentidx][children[parentidx].length] = i;
      } 
}

// -->
</script>
<noscript>
Ack, this form won't work at all without JavaScript support!
</noscript>
</c:if>

<div class="params">
<c:if test="${showParams == null}">
<input name="questionFullName" value="GeneQuestions.GenesByOrthologPattern" type="hidden"/>    

	<input name="myMultiProp(phyletic_term_map)" value="rnor" type="hidden"/>
	<input name="myMultiProp(phyletic_indent_map)" value="Archaea" type="hidden"/>
<table>
  <tr>
    <td><b>Show results from species:</b></td>
    <td><wdk:enumParamInput qp="${resultSpecies}" /></td>
  </tr>
</table>
<br />

<table border="0" cellpadding="2">

    <c:set var="idx" value="1"/>
    <tr>
      <td>
        <a href="javascript:void(0)" onclick="toggle(0)"><img border=0 id="img0" src="<c:url value="/images/dc.gif"/>"></a>&nbsp;<b>All Organisms</b>
      </td>
    </tr>
    <c:forEach var="sp" items="${ind.vocab}">
        <c:set var="spDisp" value="${termMap[sp]}"/>
        <c:set var="category" value="0"/>
        <c:if test="${spDisp == null}">
            <c:set var="spDisp" value="${sp}"/> 
            <c:set var="category" value="1"/>
        </c:if>
        <c:set var="indent" value="${indentMap[sp]}"/>

	<!-- ${sp} -->
        <tr>
	<td><c:forEach var="i" begin="0" end="${indent}" step="1">
                    &nbsp;&nbsp;&nbsp;&nbsp;
            </c:forEach>
            <a href="javascript:void(0)" onclick="toggle(${idx})"><img border=0 id="img${idx}" src="<c:url value="/images/dc.gif"/>"></a>&nbsp;<c:choose><c:when test="${category == 1}"><b><i>${spDisp}</i></b></c:when><c:otherwise><i>${spDisp}</i></c:otherwise></c:choose><c:if test="${sp != spDisp}">&nbsp;(<code>${sp}</code>)</c:if>
        </td>
        </tr>

      <c:set var="idx" value="${idx+1}"/>	
    </c:forEach>
</table>

  <html:hidden property="myProp(${includedSpeciesName})" value="n/a" />
  <html:hidden property="myProp(${excludedSpeciesName})" value="n/a" />
  <html:hidden property="myProp(${profilePatternName})" value="%"/>
</c:if>
</div><%-- END OF PARAMS DIV --%>

<div class="filter-button">
  <html:submit property="questionSubmit" value="Get Answer"/>
</div>

</html:form>

<c:if test="${showParams == null}">
<script type="text/javascript" lang="JavaScript 1.2">
<!-- //
toggle(7);
toggle(7);
toggle(7);
// -->
</script>
</c:if>

<%-- get the attributions of the question --%>
<hr>
<%-- get the property list map of the question --%>
<c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>

<%-- display the question specific attribution list --%>
<site:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" />

<c:if test="${wdkModel.displayName eq 'EuPathDB'}">
    </div><!--End Question Form Div-->
</c:if>

<hr>
<%-- display description for wdkQuestion --%>
<div id="query-description-section"><p><b>Query description: </b><jsp:getProperty name="wdkQuestion" property="description"/></p></div>

<%-- get the attributions of the question if not EuPathDB --%>
<c:if test = "${project != 'EuPathDB'}">
<hr>
<%-- get the property list map of the question --%>
<c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>

<%-- display the question specific attribution list --%>
<%-- site:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" /--%>

</c:if>

  <td valign=top class=dottedLeftBorder></td> 

</tr>
</table> 

  </c:otherwise> <%-- otherwise of showParams == true --%>
</c:choose>
