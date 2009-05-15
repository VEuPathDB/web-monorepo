<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- get wdkXmlAnswer saved in request scope --%>
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${wdkModel.displayName} ${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />



<site:header title="${wdkModel.displayName} : Tutorials"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="Tutorials"
                 division="tutorials"
                 headElement="${headElement}" />

<c:if test = "${project == 'GiardiaDB'}">
The ${project} tutorials will be here soon. In the meantime we provide you with access to PlasmoDB.org and CryptoDB.org tutorials, websites that offer the same navigation and querying capabilities as in ${project}.org.
<br>
</c:if>

<c:if test = "${project == 'TrichDB'}">
We just updated the ${project} tutorials for Home Page and Queries and Tools!&nbsp;&nbsp;&nbsp; For the rest we still provide you with access to PlasmoDB.org and CryptoDB.org tutorials, websites that offer the same navigation and querying capabilities as in ${project}.org.
<br><br>
</c:if>

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

          <c:set var="urlMov" value="${row[1].value}"/>
          <c:if test="${urlMov != 'unavailable' && ! fn:startsWith(urlMov, 'http://')}">
            <c:set var="urlMov">http://apidb.org/tutorials/${urlMov}</c:set>
          </c:if>

          <c:set var="urlAvi" value="${row[2].value}"/>
          <c:if test="${urlAvi != 'unavailable' &&  ! fn:startsWith(urlAvi, 'http://')}">
            <c:set var="urlAvi">http://apidb.org/tutorials/${urlAvi}</c:set>
          </c:if>

          <c:set var="urlFlv" value="${row[3].value}"/>
          <c:if test="${urlFlv != 'unavailable' &&  ! fn:startsWith(urlFlv, 'http://')}">
            <c:set var="urlFlv">http://apidb.org/flv_player/flvplayer.swf?file=/tutorials/${urlFlv}&autostart=true</c:set>
          </c:if>

          <c:set var="duration" value="${row[4].value}"/>
          <c:set var="size" value="${row[5].value}"/>

          <c:if test="${fileNumber == 0}">
            <c:if test="${tutorialNumber > 1}">
              <hr>
            </c:if>
 
                  <b>${title}</b>
                  <br>${description}<br>
          </c:if>

          <c:if test="${fileNumber > 0}">
            <br>
          </c:if>

 <font size="-1">View in
      <c:if test="${fileNameMov != 'unavailable'}">
          <a href="${urlMov}" target="tutorial"> QuickTime format (.mov)</a> 
      </c:if>
      <c:if test="${urlAvi != 'unavailable'}">
          ---&nbsp;<a href="${urlAvi}" target="tutorial"> Ms Windows format (.wmv)</a> 
      </c:if>
      <c:if test="${urlFlv != 'unavailable'}">
          ---&nbsp;<a href="${urlFlv}"  
			target="tutorial"> Flash Video format (.flv)</a>
      </c:if>
      <c:if test="${duration != 'unavailable' && size != 'unavailable'}">
           ---&nbsp;Duration: ${duration}&nbsp;&nbsp;&nbsp;Size: ${size}
      </c:if>
 </font>

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
