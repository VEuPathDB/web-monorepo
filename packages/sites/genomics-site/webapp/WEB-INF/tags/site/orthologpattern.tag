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


<h1>Identify ${recordType}s based on ${wdkQuestion.displayName}</h1>

<%-- show all params of question, collect help info along the way --%>
<c:set value="Help for question: ${wdkQuestion.displayName}" var="fromAnchorQ"/>
<jsp:useBean id="helpQ" class="java.util.LinkedHashMap"/>

<%-- put an anchor here for linking back from help sections --%>
<A name="${fromAnchorQ}"></A>
<!--html:form method="get" action="/processQuestion.do" -->
<html:form styleId="form_question" method="post" enctype='multipart/form-data' action="/processQuestion.do">

<script type="text/javascript" lang="JavaScript 1.2">
<!-- //

<c:set var="taxaCount" value="${fn:length(ind.vocab)+1}"/>
var state = new Array(${taxaCount});
var urls = new Array("dc.gif", "yes.gif", "no.gif", "yes.gif", "unk.gif");
var children = new Array(${taxaCount});
var parent = new Array(${taxaCount});

for (var i = 0 ; i < ${taxaCount} ; i++) {
    state[i] = 0;
    children[i] = new Array();
    parent[i] = null;
}

var abbrev =
  new Array("All Organisms"
            <c:forEach var="sp" items="${ind.vocab}">, "${sp}"</c:forEach>
   );




var parents = new Array();
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

function setstate (imgidx, urlidx, dofixparent) {
    state[imgidx] = urlidx;
    document["images"]["img" + imgidx].src = "<c:url value="/images/"/>" + urls[urlidx];
    for (var i = 0 ; i < children[imgidx].length ; i++) {
	setstate(children[imgidx][i], urlidx == 3 ? 0 : urlidx, 0);
    }
    
    if (dofixparent) {
	fixparent(imgidx, urlidx);
    }
}

function fixparent (imgidx, urlidx) {

    var parentidx = parent[imgidx];
    if (parentidx != null) {
	var allmatch = 1;
	if (urlidx == null) {
	    allmatch = 0;
	} else {
	    for (var i = 0 ; i < children[parentidx].length ; i++) {
		if (state[children[parentidx][i]] != urlidx) {
		    allmatch = 0;
		    break;
		}
	    }    
	}
	if (allmatch) {
	    state[parentidx] = urlidx;
	    document["images"]["img" + parentidx].src = "<c:url value="/images/"/>" + urls[urlidx];
	    fixparent(parentidx, urlidx);
	} else {
	    state[parentidx] = null;
	    document["images"]["img" + parentidx].src = "<c:url value="/images/"/>" + urls[4];
	    fixparent(parentidx, null);
	}
    }
}

function toggle (imgidx) {
    var urlidx = 0;
    if (state[imgidx] != null) {
	urlidx = (state[imgidx] + 1) % 3;
    }
    setstate(imgidx, urlidx, 1);
    calctext();
}

function calctext () {
    var tree = new Array();

    var includeClause = new Array();
    var excludeClause = new Array();
    var includeClauseSQL = new Array();
    var excludeClauseSQL = new Array();

    tree[tree.length] = 0;
    while (tree.length) {
	var parent = tree.shift();
	var leafabbrev = abbrev[parent];
	var leaflist = new Array();
	if (state[parent] == null) {
	    // need to walk children
	    for (var j = 0 ; j < children[parent].length ; j++) {
		tree[tree.length] = children[parent][j];
	    }
	} else if (state[parent] == 1) {
	    includeClause.push(leafabbrev);
	    if(children[parent].length) {
		var childlist = listchildren(parent);
		for (var i = 0 ; i < childlist.length ; i++) {
		    includeClauseSQL.push(childlist[i] + ":Y");
		}
	    } else {
		includeClauseSQL.push(leafabbrev + ":Y");
	    }
	} else if (state[parent] == 2) {
	    excludeClause.push(leafabbrev);
	    if(children[parent].length) {
		var childlist = listchildren(parent);
		for (var i = 0 ; i < childlist.length ; i++) {
		    excludeClauseSQL.push(childlist[i] + ":N");
		}
	    } else {
		excludeClauseSQL.push(leafabbrev + ":N");
	    }
	}

     // this is a remnant of orthomcl-db behavior, allowing
     // parental "any" inclusion without specifying leaves:
     //
     // } else if (state[parent] == 3) { clause[clause.length] =
     //     leafabbrev + ">=1T";
     // }

    }
    var includedStr = 'n/a'; if (includeClause.length > 0) includedStr = includeClause.join(", ");
    document.forms['questionForm']['myProp(${includedSpeciesName})'].value = includedStr;
    var excludedStr = 'n/a'; if (excludeClause.length > 0) excludedStr = excludeClause.join(", ");
    document.forms['questionForm']['myProp(${excludedSpeciesName})'].value = excludedStr;

    var bothClauseSQL = includeClauseSQL.concat(excludeClauseSQL);
    document.forms['questionForm']['myProp(${profilePatternName})'].value =
	bothClauseSQL.length ? "%" + bothClauseSQL.sort().join("%") + "%" : "%";
}

function countchildren (parent) {
    var count = 0;
    for (var i = 0 ; i < children[parent].length ; i++) {
	if(children[children[parent][i]].length) {
	    count += countchildren(children[parent][i]);
	} else {
	    count += 1;
	}
    }
    return count;
}

function listchildren (parent) {
    var list = new Array();
    for (var i = 0 ; i < children[parent].length ; i++) {
	if(children[children[parent][i]].length) {
	    newlist = listchildren(children[parent][i]);
	    for (var j = 0 ; j < newlist.length ; j++) {
		list[list.length] = newlist[j];
	    }
	} else {
	    list[list.length] = abbrev[children[parent][i]];
	}
    }
    return list;
}


// -->
</script>
<noscript>
Ack, this form won't work at all without JavaScript support!
</noscript>

<div class="params">
<input name="questionFullName" value="GeneQuestions.GenesByOrthologPattern" type="hidden"/>    

<c:choose>
<c:when test="${fn:containsIgnoreCase(wdkModel.displayName,'EuPathDB')}">
	<input name="myMultiProp(internal_phyletic_indent_map)" value="Archaea" type="hidden"/>
	<input name="myMultiProp(internal_phyletic_term_map)" value="rno" type="hidden"/>
</c:when >
<c:when test="${fn:containsIgnoreCase(wdkModel.displayName,'PlasmoDB') || fn:containsIgnoreCase(wdkModel.displayName,'ToxoDB')}">
	<input name="myMultiProp(phyletic_term_map)" value="rnor" type="hidden"/>
	<input name="myMultiProp(phyletic_indent_map)" value="Archaea" type="hidden"/>
</c:when>
<c:otherwise>
	<input name="myMultiProp(phyletic_indent_map)" value="Archaea" type="hidden"/>
	<input name="myMultiProp(phyletic_term_map)" value="rno" type="hidden"/>
</c:otherwise>
</c:choose>

<table>
  <tr>
    <td><b>Show results from species:</b></td>
    <td><wdk:enumParamInput qp="${resultSpecies}" /></td>
  </tr>
</table>
<br />

<%--${wdkModel.displayName}
<c:choose>
<c:when test="${fn:containsIgnoreCase(wdkModel.displayName,'EuPathDB')}">
<site:apidbOrthologPattern/>
</c:when>
<c:otherwise>--%>

<table border="0" cellpadding="2">

    <c:set var="idx" value="1"/>
    <tr>
      <td>
        <a href="javascript:toggle(0)"><img border=0 id="img0" src="<c:url value="/images/dc.gif"/>"></a>&nbsp;<b>All Organisms</b>
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
            <a href="javascript:toggle(${idx})"><img border=0 id="img${idx}" src="<c:url value="/images/dc.gif"/>"></a>&nbsp;<c:choose><c:when test="${category == 1}"><b><i>${spDisp}</i></b></c:when><c:otherwise><i>${spDisp}</i></c:otherwise></c:choose><c:if test="${sp != spDisp}">&nbsp;(<code>${sp}</code>)</c:if>
        </td>
        </tr>

      <c:set var="idx" value="${idx+1}"/>	
    </c:forEach>
</table>

  <html:hidden property="myProp(${includedSpeciesName})" value="n/a" />
  <html:hidden property="myProp(${excludedSpeciesName})" value="n/a" />
  <html:hidden property="myProp(${profilePatternName})" value="%"/>

</div><%-- END OF PARAMS DIV --%>

<div class="filter-button">
  <html:submit property="questionSubmit" value="Get Answer"/>
</div>

</html:form>

<script type="text/javascript" lang="JavaScript 1.2">
<!-- //
toggle(7);
toggle(7);
toggle(7);
// -->
</script>


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
<p><b>Query description: </b><jsp:getProperty name="wdkQuestion" property="description"/></p>

<%-- get the attributions of the question if not EuPathDB --%>
<c:if test = "${project != 'EuPathDB'}">
<hr>
<%-- get the property list map of the question --%>
<c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>

<%-- display the question specific attribution list --%>
<%-- site:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" /--%>

</c:if>


