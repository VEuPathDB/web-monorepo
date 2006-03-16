<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkQuestion; setup requestScope HashMap to collect help info for footer -->  
<c:set value="${sessionScope.wdkQuestion}" var="wdkQuestion"/>
<jsp:useBean scope="request" id="helps" class="java.util.HashMap"/>

<!-- display page header with wdkQuestion displayName as banner -->
<site:header title="Queries & Tools :: BLAST Question"
                 banner="${wdkQuestion.displayName}"
                 parentDivision="Queries & Tools"
                 parentUrl="/showQuestionSetsFlat.do"
                 divisionName="BLAST Question"
                 division="queries_tools"/>


<c:set var="qParams" value="${wdkQuestion.paramsMap}"/>

<c:set var="profilePattern" value="${qParams['profile_pattern']}"/>
<c:set var="profilePatternName" value="${profilePattern.name}"/>

<c:set var="includedSpecies" value="${qParams['included_species']}"/>
<c:set var="includedSpeciesName" value="${includedSpecies.name}"/>

<c:set var="excludedSpecies" value="${qParams['excluded_species']}"/>
<c:set var="excludedSpeciesName" value="${excludedSpecies.name}"/>

<c:set var="ind" value="${qParams['phyletic_indent_map']}"/>
<c:set var="trm" value="${qParams['phyletic_term_map']}"/>

<c:set var="indentMap" value="${ind.vocabMap}"/>
<c:set var="termMap" value="${trm.vocabMap}"/>


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
    document.forms[0]['myProp(${includedSpeciesName})'].value = includeClause.join(", ");
    document.forms[0]['myProp(${excludedSpeciesName})'].value = excludeClause.join(", ");

    var bothClauseSQL = includeClauseSQL.concat(excludeClauseSQL);
    document.forms[0]['myProp(${profilePatternName})'].value =
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

<h3>${wdkQuestion.displayName}</h3>

<p><b><jsp:getProperty name="wdkQuestion" property="description"/></b></p>

<hr>

<html:form method="post" action="/processQuestion.do">
<input type="hidden" name="myMultiProp(phyletic_indent_map)" value="Other">
<input type="hidden" name="myMultiProp(phyletic_term_map)" value="rno">

<table>
<tr><td colspan="2">

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

    </td></tr>
<tr>
<%--  <td align="right"><b><jsp:getProperty name="profilePattern" property="prompt"/></b>
 </td> --%>
  <td align="right">
    Include:
  </td>
  <td>
    <html:text property="myProp(${includedSpeciesName})" size="20"/>
  </td>
 </tr>
 <tr>
  <td align="right">
    Exclude:
  </td>
  <td>
    <html:text property="myProp(${excludedSpeciesName})" size="20"/>
  </td>
</tr>
<tr>
  <td align="right"><b>computable SQL strings:</b>
  </td>
  <td>
    SQL: <html:text property="myProp(${profilePatternName})" value="%" size="20"/>
  </td>
</tr>

<tr>
  <td>&nbsp;</td>
  <td>
    <html:submit property="questionSubmit" value="Get Answer"/>
  </td>
</tr>

</table>

</html:form>
<hr>
<site:footer/>
