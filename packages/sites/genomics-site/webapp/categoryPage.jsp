<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="record" value="${param.record}" />
<c:set var="category" value="${param.category}" />
<c:set var="model" value="${applicationScope.wdkModel}" />
<c:set var="rootCatMap" value="${model.websiteRootCategories}" />

<c:set var="cat" value="${rootCatMap[record].websiteChildren[category]}" />

<site:header refer="category"/>

<style>

div.question {
	margin: 0px 100px 10px 70px;
}

div.question h2 {
	margin-bottom: 0px;
}

div.question div {
	margin: 0px 10px 11px 12px;
}

div.question h3 {
	margin-bottom: -10px;
}

div.question table {
	margin: 1px 2px 3px 4px;
	border: 1px solid #000;
	background-color: #FFF;
}

div.question td {
	padding: 4px;
}

div.question .right {
	text-align: right;
}

div.question .left {
	text-align: left;
}
</style>

<c:set var="type" value="Gene Questions: ${category}" />
<c:if test="${record != 'GeneRecordClasses.GeneRecordClass'}">
	<c:set var="type" value="${category} Questions" />
</c:if>

<h1>${cat.displayName}</h1>
<c:forEach items="${cat.websiteQuestions}" var="q">
	<div class="question">
		<a href="showQuestion.do?questionFullName=${q.fullName}"><h2>${q.displayName}</h2></a><br>
		<div class="summary"><h3>Summary</h3><br>${q.summary}</div>
		<div class="description"><h3>Description</h3><br>${q.description}</div>
		<div class="params"><h3>Parameters</h3><br>
			<table cellspacing="5px">
			    <c:forEach items="${q.params}" var="p">
				<tr><td class="right" nowrap>${p.prompt}:</td><td class="left">${p.help} </td></tr>
			    </c:forEach>
			</table>
		</div>
	</div>
</c:forEach>


<site:footer />

