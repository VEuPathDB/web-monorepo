<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkXmlAnswer saved in request scope -->
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${wdkModel.displayName} ${xmlAnswer.question.displayName}"/>

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

    <c:set var="tutorialNumber" value="1"/>

<c:forEach items="${xmlAnswer.recordInstances}" var="record">
  <%-- loop through tutorials --%>

  <c:set var="title" value="${record.attributesMap['title']}"/>
  <c:set var="description" value="${record.attributesMap['description']}"/>
  <c:forEach items="${record.tables}" var="tblEntry">
    <%-- loop through tables of record --%>

    <c:set var="rows" value="${tblEntry.rows}"/>
      <c:set var="fileNumber" value="0"/>

      <c:forEach items="${rows}" var="row"> <%-- loop through files --%>
        <c:set var="projects" value="${row[0].value}"/>
        <c:if test="${fn:containsIgnoreCase(projects, wdkModel.displayName)}">
          <c:set var="fileName" value="${row[1].value}"/>
          <c:set var="duration" value="${row[2].value}"/>
          <c:set var="size" value="${row[3].value}"/>

          <c:if test="${fileNumber == 0}">
            <c:if test="${tutorialNumber > 1}">
              <hr>
            </c:if>
 
            <a name="${fileName}"/>
                  <b>${title}</b>
                  <br>${description}<br>
          </c:if>

          <c:if test="${fileNumber > 0}">
            <br>
          </c:if>

          <a href="<c:url value="/tutorials/${fileName}"/>" target="tutorial">${fileName}</a>
          <font size="-1">Duration: ${duration}&nbsp;&nbsp;&nbsp;Size: ${size}</font>

          <c:set var="fileNumber" value="${fileNumber+1}"/>
        </c:if>
      </c:forEach> <%-- files --%>
  </c:forEach> <%-- tables of XML record --%>
  <c:set var="tutorialNumber" value="${tutorialNumber+1}"/>
</c:forEach> <%-- tutorials --%>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
  </tr>
</table> 

<site:footer/>
