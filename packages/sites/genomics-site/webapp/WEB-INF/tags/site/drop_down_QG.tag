<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}" />
<c:set var="catMap" value="${wdkModel.questionsByCategory}" />

	<ul>
		<c:forEach items="${catMap}" var="catByRec">
		  <c:if test="${catByRec.key == 'GeneRecordClasses.GeneRecordClass' || catByRec.key == 'SequenceRecordClasses.SequenceRecordClass'  || catByRec.key == 'OrfRecordClasses.OrfRecordClass' || catByRec.key == 'EstRecordClasses.EstRecordClass' || catByRec.key == 'isolateRecordClasses.IsolateRecordClass' || catByRec.key == 'SnpRecordClasses.SnpRecordClass' }">
		 <c:choose>
		  <c:when test="${catByRec.key=='GeneRecordClasses.GeneRecordClass'}">
			<li><a href="#">Search for Genes</a>
				<ul>
					<c:set var="qByCat" value="${catByRec.value}" />
					<c:forEach items="${qByCat}" var="cat">
						<li>
							<a href="javascript:void(0)">${cat.key}</a>
							<ul>
								<c:forEach items="${cat.value}" var="q">
									<li><a href="showQuestion.do?questionFullName=${q.fullName}">${q.displayName}</a></li>
								</c:forEach>
							</ul>
						</li>
					</c:forEach>
				</ul>
			</li>
		  </c:when>
		  <c:otherwise>
			<c:set var="qByCat" value="${catByRec.value}" />
			<c:forEach items="${qByCat}" var="cat">
			<li><a href="#">Search for &nbsp; ${cat.key}</a>
				<ul>
					<c:forEach items="${cat.value}" var="q">
						<li><a href="showQuestion.do?questionFullName=${q.fullName}">${q.displayName}</a></li>
					</c:forEach>
				</ul>
			</li>
			</c:forEach>
		  </c:otherwise>
		 </c:choose>
		 </c:if>
		</c:forEach>

<li><a href="<c:url value="/queries_tools.jsp"/>">View all available searches</a></li>
		<%--<li><a href="#">Tools</a>
      		<ul>
	<li><a href="<c:url value="/showQuestion.do?questionFullName=UniversalQuestions.UnifiedBlast"/>"> BLAST</a></li>
  			<li><a href="<c:url value="/srt.jsp"/>"> Sequence Retrieval</a></li>
        		<li><a href="#"> PubMed and Entrez</a></li>
        		<li><a href="${CGI_URL}/gbrowse/cryptodb"> GBrowse</a></li>
        		<li><a href="#"> CryptoCyc</a></li>
      		</ul>
		</li>--%>
	</ul>
