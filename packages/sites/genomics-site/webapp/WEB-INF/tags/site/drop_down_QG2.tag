<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="from"
              description="page using this tag"
%>

<c:set var="wdkModel" value="${applicationScope.wdkModel}" />
<c:set var="rootCatMap" value="${wdkModel.websiteRootCategories}" />

<!- model questions used by webservices, for recordClass other than gene. Two reasons why the model was used -instead of the categories.xml:
    - to avoid fake questions; 
      now with teh new flag "usedBy" we could read from categories.xml, using "usedBy='website'" on fake questions.
    - categories.xml does not provide the questionSet name (e.g. EstQuestions) that is needed to form the WS URL.
      one could obtain the questionSet name either by 
          - hardcoding it below (there is already an if that could be used)
          - reading from the question object (question.questionSetName) ?
 -->
<c:set value="${wdkModel.questionSets}" var="questionSets"/>

<ul>
	<c:forEach items="${rootCatMap}" var="rootCatEntry">
		<c:set var="recType" value="${rootCatEntry.key}" />
		<c:set var="rootCat" value="${rootCatEntry.value}" />

		<c:if test="${recType == 'GeneRecordClasses.GeneRecordClass' || 
				recType == 'SequenceRecordClasses.SequenceRecordClass'  || 
				recType == 'OrfRecordClasses.OrfRecordClass' || 
				recType == 'EstRecordClasses.EstRecordClass' || 
				recType == 'IsolateRecordClasses.IsolateRecordClass' || 
				recType == 'SnpRecordClasses.SnpRecordClass' || 
				recType == 'AssemblyRecordClasses.AssemblyRecordClass' || 
				recType == 'DynSpanRecordClasses.DynSpanRecordClass' || 
				recType == 'SageTagRecordClasses.SageTagRecordClass' }">
		<c:choose>
		<c:when test="${recType=='GeneRecordClasses.GeneRecordClass'}">
			<li>
<c:choose>
<c:when test="${from == 'webservices'}">
    <a title="This one WADL contains documentation for all gene web service searches"  href="<c:url value='/webservices/GeneQuestions.wadl'/>"><h3 style="font-size:150%;margin-bottom:10px;margin-left:10px;">Search for Genes</h3></a>
    <c:set var="children" value="${rootCat.webserviceChildren}" />
</c:when>
<c:otherwise>
    <a href="#" class="dropdown">Search for Genes</a>
    <c:set var="children" value="${rootCat.websiteChildren}" />
</c:otherwise>
</c:choose>

				<ul>
				<c:forEach items="${children}" var="catEntry">
					<c:set var="cat" value="${catEntry.value}" />
					<c:if test="${fn:length(cat.websiteQuestions) > 0}">

						<li>
<c:choose>
<c:when test="${from == 'webservices'}">
    &nbsp;&nbsp;<b>${cat.displayName}</b>
    <c:set var="questions" value="${cat.webserviceQuestions}" />
   <c:set var="categories" value="${cat.webserviceChildren}" /> 
</c:when>
<c:otherwise>
    <a href="javascript:void(0)" class="dropdown">${cat.displayName}</a>
    <c:set var="questions" value="${cat.websiteQuestions}" />
    <c:set var="categories" value="${cat.websiteChildren}" /> 

</c:otherwise>
</c:choose>

							<ul>
							<c:forEach items="${questions}" var="q">
								<li>
<c:choose>
<c:when test="${from == 'webservices'}">
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="<c:url value="/webservices/GeneQuestions/${q.name}.wadl"/>">${q.displayName}</a>
</c:when>
<c:otherwise>
	<a href="<c:url value="/showQuestion.do?questionFullName=${q.fullName}"/>">${q.displayName}</a>
</c:otherwise>
</c:choose>

								</li>
							</c:forEach>

							<c:forEach items="${categories}" var="cEntry">
								<c:set var="cat" value="${cEntry.value}" />
								<li>
<c:choose>
<c:when test="${from == 'webservices'}">
 	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${cat.displayName} 
	 <c:set var="questions" value="${cat.webserviceQuestions}" />
</c:when>
<c:otherwise>
	<a href="javascript:void(0)" class="dropdown">${cat.displayName}</a>
</c:otherwise>
</c:choose>

								<ul>
								<c:forEach items="${questions}" var="q">
									<li>
<c:choose>
<c:when test="${from == 'webservices'}">
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="<c:url value="/webservices/GeneQuestions/${q.name}.wadl"/>">${q.displayName}</a>
</c:when>
<c:otherwise>
	<a href="<c:url value="/showQuestion.do?questionFullName=${q.fullName}"/>">${q.displayName}</a>
</c:otherwise>
</c:choose>

									</li>
								</c:forEach>
								</ul>


								</li>
							</c:forEach>   

							</ul>
						</li>
					</c:if>
				</c:forEach>
				</ul>
			</li>
		</c:when>
		<c:otherwise>
			<c:set var="qByCat" value="${catByRec.value}" />
<c:choose>
    <c:when test="${from == 'webservices'}">
        <c:set var="children" value="${rootCat.webserviceChildren}" />
    </c:when>
    <c:otherwise>
        <c:set var="children" value="${rootCat.websiteChildren}" />
    </c:otherwise>
</c:choose>
			<c:forEach items="${children}" var="catEntry">
			    	<c:set var="cat" value="${catEntry.value}" />
                            	<c:if test="${fn:length(cat.websiteQuestions) > 0}">

<c:choose>
    <c:when test="${from == 'webservices'}">

	<ul>
	<c:forEach items="${questionSets}" var="qSet">
  		<c:if test="${qSet.internal == false}">

  			<c:if test="${qSet.displayName == cat.displayName}">
			<br><br>
			<li><a href="<c:url value='/webservices/${qSet.name}.wadl'/>"><h3 style="font-size:150%;margin-bottom:10px;margin-left:10px;">${qSet.displayName}</h3></a>
				<ul>
           			<c:forEach items="${qSet.questions}" var="q">
             				<li>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="<c:url value='/webservices/${qSet.name}/${q.name}.wadl'/>">${q.displayName}</a></li>
           			</c:forEach>
				</ul>
			</li>
  			</c:if>
		</c:if>
	</c:forEach>
	</ul>

    </c:when>
    <c:otherwise>

					<li>
						<a href="#" class="dropdown">${cat.displayName}</a> 
						<ul>
						<c:forEach items="${cat.websiteQuestions}" var="q">
				    			<li>
								<a href="<c:url value="/showQuestion.do?questionFullName=${q.fullName}"/>">${q.displayName}</a>
							</li>
						</c:forEach>
						</ul>
					</li>

    </c:otherwise>
</c:choose>

                            	</c:if>
			</c:forEach>




		</c:otherwise>
		</c:choose>
		</c:if>
	</c:forEach>



<c:if test="${from ne 'webservices'}">
	<li><a href="<c:url value="/queries_tools.jsp"/>">View all available searches</a></li>
</c:if>



</ul>


<%-- TEST, you can remove this line any time --%>
