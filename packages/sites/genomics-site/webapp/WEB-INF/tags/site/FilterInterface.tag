
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<%@ attribute name="model"
	      type="org.gusdb.wdk.model.jspwrap.WdkModelBean"
              required="false"
              description="Wdk Model Object for this site"
%>

<%@ attribute name="recordClass"
	          required="false"
              description="RecordClass Object for the Answer"
%>

<%@ attribute name="prevStepNum"
				required="false"
				description="Step number for transform param urls"
%>

<c:set var="catMap" value="${model.questionsByCategory}" />
<c:set var="recClass" value="${recordClass}" />
<c:set var="qSetName" value="none" />
<c:set var="qSets" value="${model.questionSetsMap}" />
<c:set var="qSet" value="${qSets[qSetName]}" />
<c:set var="qByCat" value="${qSet.questionsByCategory}" />
<c:set var="user" value="${sessionScope.wdkUser}"/>

<%--<jsp:useBean id="modelBean" scope="request" class="org.gus.wdk.model.jspwrap.WdkModelBean" >--%>
<jsp:setProperty name="model" property="inputType" value="${recClass}" />
<jsp:setProperty name="model" property="outputType" value="" />
<%--</jsp:useBean>--%>

<c:set var="transformQuestions" value="${model.transformQuestions}" />




<div id="query_form" class="jqDnR">
<span class="dragHandle"><div class="modal_name"><h1>Add&nbsp;Step</h1></div><a id='close_filter_query' href='javascript:closeAll()'><img src='/assets/images/Close-X-box.png' alt='Close'/></a></span>
<!--<div id="filter_div">-->

<div id="query_selection">

	<table align="left" width="70%">
		<tr><th title="This search will be combined (AND,OR,NOT) with the previous step.">Select a Search</th>
                    <th>--or--</th>

<c:if test="${recClass == 'GeneRecordClasses.GeneRecordClass'}">
                    <th title="The transform converts the input set of IDs (from the previous step) into a new set of IDs">Select a Transform</th>
                    <th>--or--</th>
</c:if>


                    <th title="Adding a strategy as a step allows you to generate non-linear strategies (trees).">Select a Strategy</th></tr>
		<tr>
				<td>
<ul class="top_nav">

<c:set var="qByCat" value="${catMap[recordClass]}" />
<c:forEach items="${qByCat}" var="cat">
	<li><a class="category" href="javascript:void(0)">${cat.key}</a>
	<ul>
	<c:forEach items="${cat.value}" var="q">
		<li><a href="javascript:getQueryForm('showQuestion.do?questionFullName=${q.fullName}')">${q.displayName}</a></li>
	</c:forEach>
	</ul>
</c:forEach>

</ul>

</td>
<td></td>

<c:if test="${recClass == 'GeneRecordClasses.GeneRecordClass'}">
<td>
	<select id="transforms">
		<%--	<option value="--">--Choose a Transform to apply--</option> --%>
		<c:forEach items="${transformQuestions}" var="t">
			<jsp:setProperty name="t" property="inputType" value="${recClass}" />
			<c:set var="tparams" value="" />
			<c:forEach items="${t.transformParams}" var="tp">
				<c:set var="tparams" value="${tparams}&${tp.name}=${prevStepNum}" />
			</c:forEach>
			<option value="showQuestion.do?questionFullName=${t.fullName}${tparams}">${t.displayName}</option>
		</c:forEach>
	</select>
	<br><br><input id="continue_button_transforms" type="button" value="Continue..."/>
</td>

<td></td>
</c:if>

<td>
	<select id="selected_strategy" type="multiple">
		<option value="--">--Choose a Strategy to add--</option>
		<c:forEach items="${user.strategiesByCategory[recordClass]}" var="storedStrategy">
			<option value="${storedStrategy.strategyId}">${storedStrategy.name}<c:if test="${!storedStrategy.isSaved}">*</c:if></option>
		</c:forEach>
	</select>
	<br><br><input id="continue_button" type="button" value="Continue..."/>
</td>
</tr>
</table>

</div><!-- End of Query Selection Div -->
<!--</div> End of Filter div -->
<!--<div id="query_form" class="jqDnR">-->
</div><!-- End of Query Form Div -->

