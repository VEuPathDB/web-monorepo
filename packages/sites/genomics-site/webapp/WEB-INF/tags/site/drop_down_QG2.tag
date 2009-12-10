<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="from"
              description="page using this tag"
%>

<c:set var="wdkModel" value="${applicationScope.wdkModel}" />
<c:set var="rootCatMap" value="${wdkModel.rootCategoryMap}" />

<!- used by webservices, below -->
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
				recType == 'SageTagRecordClasses.SageTagRecordClass' }">
		<c:choose>
		<c:when test="${recType=='GeneRecordClasses.GeneRecordClass'}">
			<li>
<c:choose>
<c:when test="${from == 'webservices'}">
	<a href="<c:url value='/webservices/GeneQuestions.wadl'/>"><h3 style="font-size:150%;margin-bottom:10px;margin-left:10px;">Search for Genes</h2></a>
</c:when>
<c:otherwise>
	<a href="#">Search for Genes</a>
</c:otherwise>
</c:choose>

				<ul>
				<c:forEach items="${rootCat.children}" var="catEntry">
					<c:set var="cat" value="${catEntry.value}" />
					<c:if test="${fn:length(cat.questions) > 0}">
						<li>
<c:choose>
<c:when test="${from == 'webservices'}">
	&nbsp;&nbsp;${cat.displayName}
</c:when>
<c:otherwise>
	<a href="javascript:void(0)">${cat.displayName}</a>
</c:otherwise>
</c:choose>

							<ul>
							<c:forEach items="${cat.questions}" var="q">
								<li>
<c:choose>
<c:when test="${from == 'webservices'}">
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="<c:url value="/webservices/GeneQuestions/${q.name}.wadl"/>">${q.displayName}</a>
</c:when>
<c:otherwise>
	<a href="<c:url value="/showQuestion.do?questionFullName=${q.fullName}&target=GENE"/>">${q.displayName}</a>
</c:otherwise>
</c:choose>

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

			<c:forEach items="${rootCat.children}" var="catEntry">
			    	<c:set var="cat" value="${catEntry.value}" />
                            	<c:if test="${fn:length(cat.questions) > 0}">

<c:choose>
<c:when test="${from == 'webservices'}">

	<ul>
	<c:forEach items="${questionSets}" var="qSet">
  		<c:if test="${qSet.internal == false}">

  			<c:if test="${qSet.displayName == cat.displayName}">
			<br><br>
			<li><a href="<c:url value='/webservices/${qSet.name}.wadl'/>"><h3 style="font-size:150%;margin-bottom:10px;margin-left:10px;">${qSet.displayName}</h2></a>
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
						<a href="#">${cat.displayName}</a> 
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
						<c:set var="target" value=""/>
					</c:otherwise>
					</c:choose>
						<ul>
						<c:forEach items="${cat.questions}" var="q">
				    			<li>
								<a href="<c:url value="/showQuestion.do?questionFullName=${q.fullName}&target=${target}"/>">${q.displayName}</a>
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
