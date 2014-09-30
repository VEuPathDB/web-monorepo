<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="id"
              description="id value of the record (tutorial) we want to link"
              required="true"
%>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="qSetMap" value="${wdkModel.xmlQuestionSetsMap}"/>
<c:set var="xmlqSet" value="${qSetMap['XmlQuestions']}"/>
<c:set var="xmlqMap" value="${xmlqSet.questionsMap}"/>
<c:set var="tutQuestion" value="${xmlqMap['Tutorials']}"/>
<c:set var="tutAnswer" value="${tutQuestion.fullAnswer}"/>

<%--
<c:forEach items="${tutAnswer.recordInstances}" var="record">
<c:set var="attrs" value="${record.attributesMap}"/>
<c:if test="${attrs['uid'] eq tutuid}">
${record.id}
--%>

<%-- to avoid looping above we can access a record by its id, which we could assign a value to, in the xml --%>
<%-- if we do not assign, wdk provide a value to it --%>
<%-- (it seems impossible to access a record by the value of an attribute, without looping) --%>
<c:set var="record" value="${tutAnswer.recordInstanceMap[id]}"/>

<c:forEach items="${record.tables}" var="table">   
  <c:forEach items="${table.rows}" var="row">
    <c:set var="projects" value="${row[0].value}"/>
    <c:if test="${fn:containsIgnoreCase(projects, project)}"> 
      <center style="font-weight:bold;font-size:90%">Watch this tutorial!
        <c:set var="urlMov" value="${row[1].value}"/>
        <c:if test="${urlMov != 'unavailable' && ! fn:startsWith(urlMov, 'http://')}">
          <c:set var="urlMov">http://www.youtube.com/${urlMov}</c:set>
        </c:if>
        <span style="font-size:120%;font-weight:bold">
          <c:if test="${urlMov != 'unavailable'}">
            <a target="_blank" onClick="poptastic(this.href); return false;" href="${urlMov}">
              <imp:image title="YouTube tutorial" style="vertical-align:middle" alt="YouTube icon"
                src="images/smallYoutube-icon.png" border='0'/>
            </a>
          </c:if>
        </span>
      </center>
    </c:if>  <%-- if project --%>
  </c:forEach> 
</c:forEach>  

<%--
</c:if>     
</c:forEach>  
--%>









