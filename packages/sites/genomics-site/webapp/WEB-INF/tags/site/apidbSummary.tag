<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkAnswer from requestScope -->
<c:set value="${requestScope.wdkHistory}" var="history"/>
<c:set var="historyId" value="${history.historyId}"/>
<c:set value="${requestScope.wdkAnswer}" var="wdkAnswer"/>
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />
<%--
<c:set value="${param['wdk_history_id']}" var="historyId"/>
--%>
<c:set value="${requestScope.wdk_history_id}" var="altHistoryId"/>

<c:set value="Error" var="QUERY_ERROR"/>
<c:set value="NA" var="NA"/>

<%--
<c:set value="${wdk_paging_end - wdk_paging_start + 1}" var="numResultsPage"/>
--%>
<c:set value="${wdk_paging_pageSize}" var="pageSize"/>

<c:choose>
                   <c:when test="${historyId == null}">
                      <c:set value="${altHistoryId}" var="histID"/>
                   </c:when>
                   <c:otherwise>
                       <c:set value="${historyId}" var="histID"/>
                   </c:otherwise>
</c:choose>
<%-- in genes by location ,when choosing mal4, crypto is not in rSBP, while toxo does return 0....
this is an attempt to show 0 when that happens.... (when is that? why is that?)

<c:set value="NOTFOUND" var="CRYPTO_FOUND"/>
<c:set value="NOTFOUND" var="PlASMO_FOUND"/>
<c:set value="NOTFOUND" var="TOXO_FOUND"/>
--%>

             <c:forEach items="${wdkAnswer.resultSizesByProject}" var="rSBP">
                <c:choose>

                  <c:when test="${rSBP.key == 'cryptodb'}">


		      <c:set value="FOUND" var="CRYPTO_FOUND"/>

                      <c:set value="${rSBP.value}" var="CR"/>
		      <c:if test="${CR == -1}">
			  <c:set value="0" var="CR"/>
                          <c:set value="Error" var="CERROR"/>
		      </c:if>
		      <c:if test="${CR == -2}">
			  <c:set value="0" var="CR"/>
                          <c:set value="NA" var="CERROR"/>
		      </c:if>
                  </c:when>
                  <c:when test="${rSBP.key == 'plasmodb'}">

		      <c:set value="FOUND" var="PLASMO_FOUND"/>

                      <c:set value="${rSBP.value}" var="PR"/>
		      <c:if test="${PR == -1}">
			  <c:set value="0" var="PR"/>
                          <c:set value="Error" var="PERROR"/>
		      </c:if>
		      <c:if test="${PR == -2}">
			  <c:set value="0" var="PR"/>
                          <c:set value="NA" var="PERROR"/>
		      </c:if>
                  </c:when>
                  <c:when test="${rSBP.key == 'toxodb'}">

		      <c:set value="FOUND" var="TOXO_FOUND"/>

                      <c:set value="${rSBP.value}" var="TR"/>
		      <c:if test="${TR == -1}">
			  <c:set value="0" var="TR"/>
                          <c:set value="Error" var="TERROR"/>
		      </c:if>
		      <c:if test="${TR == -2}">
			  <c:set value="0" var="TR"/>
                          <c:set value="NA" var="TERROR"/>
		      </c:if>
                  </c:when>
                </c:choose>
             </c:forEach>

             <c:forEach items="${wdkAnswer.resultSizesByProject}" var="rSBP">
                <c:choose>




                  <c:when test="${rSBP.key == 'cryptodb'}">
	<c:if test="${rSBP.value>0}">
&nbsp;&nbsp;<a href="showSummary.do?wdk_history_id=${histID}&pager.offset=0">
CryptoDB: ${rSBP.value}</a>
	</c:if>
	<c:if test="${rSBP.value==0}">
		&nbsp;&nbsp;CryptoDB: 0	
        </c:if>
	<c:if test="${rSBP.value < 0}">
		&nbsp;&nbsp;CryptoDB: ${CERROR}
	</c:if>
                  </c:when>

<%--
length (used below) > 2 is not going to happen while pagesize is 20, but just in case
--%>


                  <c:when test="${rSBP.key == 'plasmodb'}">
	<c:if test="${rSBP.value>0}">
&nbsp;&nbsp; 
<c:set value="${CR / pageSize}" var="Poffset"/>
<c:set value='${fn:substringAfter(Poffset, ".")}' var="dec"/>
<c:set value="${fn:length(dec)}" var="length"/>
<c:if test="${length > 2}">
    <c:set value='${fn:substring(dec,0,2)}' var="dec"/></c:if>
<c:if test="${length == 1}">
    <c:set value="${pageSize * dec / 10}" var="extraC"/></c:if>
<c:if test="${length == 2}">
    <c:set value="${pageSize * dec / 100}" var="extraC"/></c:if>
<c:set value='${fn:substringBefore(extraC, ".")}' var="extraC"/>
<c:set value="${CR - extraC}" var="Poffset"/>

<a href="showSummary.do?wdk_history_id=${histID}&pager.offset=${Poffset}">
PlasmoDB: ${rSBP.value}</a>
        </c:if>
	<c:if test="${rSBP.value==0}">
		&nbsp;&nbsp;PlasmoDB: 0	
        </c:if>
	<c:if test="${rSBP.value < 0}">
		&nbsp;&nbsp;PlasmoDB: ${PERROR}
	</c:if>
                 </c:when>

                  <c:when test="${rSBP.key == 'toxodb'}">
	<c:if test="${rSBP.value>0}">

&nbsp;&nbsp; 
<c:set value="${(CR + PR) / pageSize}" var="Toffset"/>
<c:set value='${fn:substringAfter(Toffset, ".")}' var="dec"/>
<c:set value="${fn:length(dec)}" var="length"/>
<c:if test="${length > 2}">
    <c:set value='${fn:substring(dec,0,2)}' var="dec"/></c:if>
<c:if test="${length == 1}">
    <c:set value="${pageSize * dec / 10}" var="extraP"/></c:if>
<c:if test="${length == 2}">
    <c:set value="${pageSize * dec / 100}" var="extraP"/></c:if>
<c:set value='${fn:substringBefore(extraP, ".")}' var="extraP"/>
<c:set value="${CR + PR - extraP}" var="Toffset"/>
                    
<a href="showSummary.do?wdk_history_id=${histID}&pager.offset=${Toffset}">
ToxoDB: ${rSBP.value}</a>
        </c:if>

	<c:if test="${rSBP.value==0}">
		&nbsp;&nbsp;ToxoDB: 0	
        </c:if>

	<c:if test="${rSBP.value < 0}">
		&nbsp;&nbsp;ToxoDB: ${TERROR}
	</c:if>
                 </c:when>

                </c:choose>
             </c:forEach>

<%--

<c:if test="${CRYPTO_FOUND == 'NOTFOUND'}">
	&nbsp;&nbsp;CryptoDB: 0	
</c:if>
<c:if test="${PLASMO_FOUND == 'NOTFOUND'}">
	&nbsp;&nbsp;PlasmoDB: 0	
</c:if>
<c:if test="${TOXO_FOUND == 'NOTFOUND'}">
	&nbsp;&nbsp;ToxoDB: 0	
</c:if>
--%>

<c:if test="${wdkAnswer.resultSize > 0}">



<font size="-2"><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Note: Links to pages only apply when results are sorted by ascendent organism.</font><br>

   </c:if>


