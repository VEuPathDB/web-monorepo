<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkXmlAnswer saved in request scope -->
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName} : Tutorials"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Tutorials"
                 division="tutorials"
                 headElement="${headElement}" />

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

  <%-- handle empty result set situation --%>
  <c:choose>
    <c:when test='${xmlAnswer.resultSize == 0}'>
      Not available.
    </c:when>
  <c:otherwise>

    <!-- main body start -->

    <c:set var="i" value="1"/>
    <c:forEach items="${xmlAnswer.recordInstances}" var="record">
      <c:set var="title" value="${record.attributesMap['title']}"/>
      <c:set var="description" value="${record.attributesMap['description']}"/>
      <c:set var="fileName" value="${record.attributesMap['fileName']}"/>
      <c:set var="projects" value="${record.attributesMap['projects']}"/>
      <c:set var="duration" value="${record.attributesMap['duration']}"/>
      <c:set var="fileSize" value="${record.attributesMap['fileSize']}"/>


      <a name="${fileName}"/>
      <table border="0" cellpadding="2" cellspacing="0" width="100%">
  
        <c:if test="${i > 1}">
          <tr><td colspan="2"><hr></td></tr>
        </c:if>
        <tr class="rowLight"><td>
        <b>${title}</b><br> 
        <br>${item}</td></tr>
      </table>
      <c:set var="i" value="${i+1}"/>
    </c:forEach>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
