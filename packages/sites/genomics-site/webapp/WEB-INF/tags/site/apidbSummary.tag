<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkAnswer from requestScope -->
<c:set value="${requestScope.wdkHistory}" var="history"/>
<c:set value="${requestScope.wdkAnswer}" var="wdkAnswer"/>
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />
<c:set value="${param['wdk_history_id']}" var="historyId"/>
<c:set value="${requestScope.wdk_history_id}" var="altHistoryId"/>


<c:set value="${wdk_paging_end - wdk_paging_start + 1}" var="pageSize"/>

<c:choose>
                   <c:when test="${historyId == null}">
                      <c:set value="${altHistoryId}" var="histID"/>
                   </c:when>
                   <c:otherwise>
                       <c:set value="${historyId}" var="histID"/>
                   </c:otherwise>
</c:choose>


             <c:forEach items="${wdkAnswer.resultSizesByProject}" var="rSBP">
                <c:choose>
                  <c:when test="${rSBP.key == 'cryptodb'}">
                      <c:set value="${rSBP.value}" var="CR"/>
                  </c:when>
                  <c:when test="${rSBP.key == 'plasmodb'}">
                      <c:set value="${CR+rSBP.value}" var="CRplusPR"/>
                  </c:when>
                </c:choose>
             </c:forEach>

             <c:forEach items="${wdkAnswer.resultSizesByProject}" var="rSBP">
                <c:choose>
                  <c:when test="${rSBP.key == 'cryptodb'}">&nbsp;&nbsp; 
<a href="showSummary.do?wdk_history_id=${histID}&pager.offset=0">
CryptoDB: ${rSBP.value}</a>
                  </c:when>


                  <c:when test="${rSBP.key == 'plasmodb'}">&nbsp;&nbsp; 
<c:set value="${CR / pageSize}" var="Poffset"/>
<c:set value='${fn:substringAfter(Poffset, ".")}' var="dec"/>
<c:set value="${fn:length(dec)}" var="length"/>
<c:if test="${length == 1}">
    <c:set value="${pageSize * dec / 10}" var="extraC"/></c:if>
<c:if test="${length == 2}">
    <c:set value="${pageSize * dec / 100}" var="extraC"/></c:if>
<c:set value='${fn:substringBefore(extraC, ".")}' var="extraC"/>
<c:set value="${CR - extraC}" var="Poffset"/>

<a href="showSummary.do?wdk_history_id=${histID}&pager.offset=${Poffset}">
PlasmoDB: ${rSBP.value}</a>
                  </c:when>

                  <c:when test="${rSBP.key == 'toxodb'}">&nbsp;&nbsp; 
<c:set value="${CRplusPR / pageSize}" var="Toffset"/>
<c:set value='${fn:substringAfter(Toffset, ".")}' var="dec"/>
<c:set value="${fn:length(dec)}" var="length"/>
<c:if test="${length == 1}">
    <c:set value="${pageSize * dec / 10}" var="extraP"/></c:if>
<c:if test="${length == 2}">
    <c:set value="${pageSize * dec / 100}" var="extraP"/></c:if>
<c:set value='${fn:substringBefore(extraP, ".")}' var="extraP"/>
<c:set value="${CRplusPR - extraP}" var="Toffset"/>
                    
<a href="showSummary.do?wdk_history_id=${histID}&pager.offset=${Toffset}">
ToxoDB: ${rSBP.value}</a>
                  </c:when>
                </c:choose>
             </c:forEach>

<br>(results are sorted by organism).<br>


