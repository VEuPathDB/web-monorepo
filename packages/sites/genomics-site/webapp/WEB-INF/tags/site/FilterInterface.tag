
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

<c:set var="siteName" value="${applicationScope.wdkModel.name}" />
<c:set var="recClass" value="${recordClass}" />
<c:set var="qSetName" value="none" />
<c:set var="qSets" value="${model.questionSetsMap}" />
<c:set var="qSet" value="${qSets[qSetName]}" />
<c:set var="user" value="${sessionScope.wdkUser}"/>

<%--<jsp:useBean id="modelBean" scope="request" class="org.gus.wdk.model.jspwrap.WdkModelBean" >--%>
<jsp:setProperty name="model" property="inputType" value="${recClass}" />
<jsp:setProperty name="model" property="outputType" value="" />
<%--</jsp:useBean>--%>

<c:set var="transformQuestions" value="${model.transformQuestions}" />




<div id="query_form" class="jqDnR" style="min-height:140px;">
<span class="dragHandle"><div class="modal_name"><h1 id="query_form_title"></h1></div><a class='close_window' href='javascript:closeAll()'><img src='/assets/images/Close-X-box.png' alt='Close'/></a></span>
<!--<div id="filter_div">-->

<div id="query_selection">

	<table width="90%">
		<tr><th title="This search will be combined (AND,OR,NOT) with the previous step.">Select a Search</th>
                    <th>--or--</th>

<c:if test="${recClass == 'GeneRecordClasses.GeneRecordClass' && fn:length(transformQuestions) > 0}">
                    <th title="The transform converts the input set of IDs (from the previous step) into a new set of IDs">Select a Transform</th>
                    <th>--or--</th>
</c:if>


                    <th title="Adding a strategy as a step allows you to generate non-linear strategies (trees).">Select a Opened Strategy</th></tr>
		<tr>
				<td>
<ul class="top_nav">
<c:set var="rootCat" value="${model.rootCategoryMap[recordClass]}" />
<c:forEach items="${rootCat.children}" var="catEntry">
    <c:set var="cat" value="${catEntry.value}" />
	<c:choose>
		<c:when test="${cat.name == 'isolates'}">
			<c:set var="target" value="ISOLATE"/>
		</c:when>
		<c:when test="${cat.name == 'genomic'}">
			<c:set var="target" value="SEQ"/>
		</c:when>
		<c:when test="${cat.name == 'snp'}">
			<c:set var="target" value="SNP"/>
		</c:when>
		<c:when test="${cat.name == 'orf'}">
			<c:set var="target" value="ORF"/>
		</c:when>
		<c:when test="${cat.name == 'est'}">
			<c:set var="target" value="EST"/>
		</c:when>
		<c:when test="${cat.name == 'assembly'}">
			<c:set var="target" value="ASSEMBLIES"/>
		</c:when>
		<c:otherwise>
			<c:set var="target" value="GENE"/>
		</c:otherwise>
	</c:choose>
	<c:if test="${rootCat.multiCategory}">
    	<li><a class="category" href="javascript:void(0)">${cat.displayName}</a>
    	<ul>
	</c:if>
	<c:forEach items="${cat.questions}" var="q">
    	<c:if test="${ !fn:contains(recordClass, 'Isolate') || (!fn:contains(q.displayName, 'RFLP') && !fn:contains(q.displayName, 'Clustering') )}">
              <c:if test="${!( (siteName == 'PlasmoDB' || siteName == 'GiardiaDB' || siteName == 'ToxoDB') && fn:containsIgnoreCase(q.displayName, 'Microarray'))}">
    		<li><a href="javascript:getQueryForm('showQuestion.do?questionFullName=${q.fullName}&target=${target}&partial=true')">${q.displayName}</a></li>			
              </c:if>
    	</c:if>
	</c:forEach>
	<c:if test="${rootCat.multiCategory}">
    	</ul>
    	</li>
	</c:if>
</c:forEach>
</ul>

</td>
<td></td>

<c:if test="${recClass == 'GeneRecordClasses.GeneRecordClass' && fn:length(transformQuestions) > 0}">
<td>
  <ul class="top_nav">
    <c:forEach items="${transformQuestions}" var="t">
      <jsp:setProperty name="t" property="inputType" value="${recClass}" />
      <c:set var="tparams" value="" />
      <c:forEach items="${t.transformParams}" var="tp">
	<c:set var="tparams" value="${tparams}&${tp.name}=${prevStepNum}" />
      </c:forEach>
      <li style="width:auto;"><a href="javascript:getQueryForm('showQuestion.do?questionFullName=${t.fullName}${tparams}&partial=true', true)">${t.displayName}</a></li>
    </c:forEach>
  </ul>
</td>

<td></td>
</c:if>

<td>
	<select id="selected_strategy" type="multiple">
		<option value="--">--Choose a strategy to add--</option>
		<!-- Display the currently ACTIVE (OPENED) Strategies -->
		<option value="--">----Opened strategies----</option>
		<c:forEach items="${user.activeStrategies}" var="storedStrategy">
			<c:set var="l" value="${storedStrategy.length-1}"/>
		 	<c:if test="${storedStrategy.allSteps[l].dataType == recordClass}">
				<c:set var="displayName" value="${storedStrategy.name}" />
				<c:if test="${fn:length(displayName) > 30}">
                                    <c:set var="displayName" value="${fn:substring(displayName,0,27)}..." />
                                </c:if>
				<option value="${storedStrategy.strategyId}">&nbsp;&nbsp;${displayName}<c:if test="${!storedStrategy.isSaved}">*</c:if></option>
			</c:if>
		</c:forEach>
		<!-- Display the Saved Strategies -->
		<option value="--">----Saved strategies----</option>
		<c:forEach items="${user.savedStrategiesByCategory[recordClass]}" var="storedStrategy">
				<c:set var="displayName" value="${storedStrategy.name}" />
				<c:if test="${fn:length(displayName) > 30}">
                                    <c:set var="displayName" value="${fn:substring(displayName,0,27)}..." />
                                </c:if>
				<option value="${storedStrategy.strategyId}">&nbsp;&nbsp;${displayName}</option>
		</c:forEach>
		<!-- Display the recent Strategies (Opened  viewed in the last 24 hours) -->
		<option value="--">----Recent strategies----${currentTime}</option>
		<c:forEach items="${user.recentStrategiesByCategory[recordClass]}" var="storedStrategy">
				<c:set var="displayName" value="${storedStrategy.name}" />
				<c:if test="${fn:length(displayName) > 30}">
                                    <c:set var="displayName" value="${fn:substring(displayName,0,27)}..." />
                                </c:if>
				<option value="${storedStrategy.strategyId}">&nbsp;&nbsp;${displayName}<c:if test="${!storedStrategy.isSaved}">*</c:if></option>
		</c:forEach>
	</select>
	<br><br><input id="continue_button" type="button" value="Continue..."/>
</td>
</tr>
</table>

</div><!-- End of Query Selection Div -->
<!--</div> End of Filter div -->
<!--<div id="query_form" class="jqDnR">-->
	<div class="bottom-close"><a class='close_window' href='javascript:closeAll(false)'>Close</a>
</div><!-- End of Query Form Div -->

