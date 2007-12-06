<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<c:set var="xqSetMap" value="${wdkModel.xmlQuestionSetsMap}"/>

<c:set var="xqSet" value="${xqSetMap['XmlQuestions']}"/>
<c:set var="xqMap" value="${xqSet.questionsMap}"/>

<c:set var="newsQuestion" value="${xqMap['News']}"/>
<c:set var="newsAnswer" value="${newsQuestion.fullAnswer}"/>

<c:set var="externalLinksQuestion" value="${xqMap['ExternalLinks']}"/>
<c:set var="externalLinksAnswer" value="${externalLinksQuestion.fullAnswer}"/>

<c:set var="CGI_URL" value="${wdkModel.properties['CGI_URL']}"/>
<c:set var="version" value="${wdkModel.version}"/>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

  <c:choose>
      <c:when test = "${project == 'ToxoDB'}">
             <c:set var="title" value="ToxoDB: The Toxoplasma gondii genome resource"/>
             <c:set var="banner" value="<font size=\"+6\" face='Trebuchet MS,Arial,GillSans Ultra Bold,Trebuchet MS,Arial,Verdana,Sans-serif'>ToxoDB</font>"/>
             <c:set var="isbannerimage" value="false"/>
             <c:set var="gbrowsepath" value="/gbrowse/toxodb"/>
             <c:set var="cycname" value="ToxoCyc"/>
             <c:set var="cycpath" value="TOXO"/>
             <c:set var="organismlist" value="Toxoplasma gondii"/>

      </c:when>
      <c:when test = "${project == 'PlasmoDB'}">
             <c:set var="title" value="PlasmoDB : The Plasmodium genome resource"/>
             <c:set var="banner" value="/images/plasmodbBanner.jpg"/>
             <c:set var="isbannerimage" value="true"/>
             <c:set var="gbrowsepath" value="/gbrowse/plasmodb"/>
             <c:set var="cycname" value="PlasmoCyc"/>
             <c:set var="cycpath" value="PLASMO"/>
             <c:set var="organismlist" value="Plasmodium falciparum,Plasmodium vivax,Plasmodium yoelii,Plasmodium berghei,Plasmodium chabaudi,Plasmodium knowlesi"/>

      </c:when>
  </c:choose>


<site:header title="${title}"
                 banner="${banner}"
                 isBannerImage="${isbannerimage}"
                 bannerSuperScript="<br><b><font size=\"+1\">Release ${version}</font></b>"
                division="home"/>


<%-- TABLE wrapping two tables separated by HR; it adds a line on top, and closes in this file  --%>

<table border="0" width="100%" cellpadding="1" cellspacing="0" bgcolor="white" class="thinTopBorders"> 
<tr><td bgcolor="white" valign="top">


<%-- TABLE RELATED sites and NEWS section, only one row  --%>
<table border="0" cellspacing="0" cellpadding="4">
<tr valign="top">

  <td class="borderRight">   <%-- related sites section --%>
 
         <div class="small">
<b>Related Sites:</b><br>
<c:choose>
  <c:when test="${externalLinksAnswer.resultSize < 1}">
    <i>No related sites have been specified, sorry!</i>
  </c:when>
  <c:otherwise>

  <c:set var="lnkTbls" value="${externalLinksAnswer.recordInstances[0].tables}"/>
  <c:forEach items="${lnkTbls}" var="tbl">
    <c:set var="tblNam" value="${tbl.name}"/>
    <c:if test="${tblNam eq 'relatedLinks'}">
      <ul>
      <c:set var="rows" value="${tbl.rows}"/>
      <c:forEach items="${rows}" var="row">
        <c:set var="title" value="${row[0].value}"/>
        <c:set var="url" value="${row[1].value}"/>
        <li><a href="${url}">${title}</a></li>
      </c:forEach>
      </ul>
    </c:if>
  </c:forEach>

  </c:otherwise>
</c:choose>
          </div>
  </td>

  <td>  <%-- news section --%>

        <div class="small"><b>News</b><br>


<c:choose>
  <c:when test="${newsAnswer.resultSize < 1}">
    No news now, please check back later<br>
  </c:when>
  <c:otherwise>
    <c:set var="i" value="1"/>
    <ul>
    <c:forEach items="${newsAnswer.recordInstances}" var="record">
    <c:if test="${i <= 4}">
      <c:set var="attrs" value="${record.attributesMap}"/>
      <li><b>${attrs['date']}</b>
             <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News#newsItem${i}"/>">
               ${attrs['headline']}
             </a></li>
    </c:if>
    <c:set var="i" value="${i+1}"/>
    </c:forEach>
    <li>
      <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News"/>"
         class="blue">All ${project} News</a>
    </li>
    </ul>
  </c:otherwise>
</c:choose>


<a href="http://apidb.org/static/events.shtml"
   class="blue">${project} Events</a> | 
<a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.News#currentRelease"/>" class="blue">Release Notes</a>

        </div>

  </td>

</tr>
</table>

<hr class="brown">

<%-- TABLE   TOOLS and QUERIES --%>
<table border="0" cellpadding="2" cellspacing="1" width="100%">

<%-- Quick Tools --%>
<tr>
  <td colspan="4" align="center">
        <b><font color="darkred">Quick Tools</font></b>
        [ 
        <a href="${CGI_URL}${gbrowsepath}" class="blue">Genome browser</a> |
        <a href="showQuestion.do?questionFullName=UniversalQuestions.UnifiedBlast" class="blue">BLAST</a> |
        <a href="<c:url value="/srt.jsp"/>" class="blue">Sequence Retrieval</a> | 
        <a href="http://apicyc.apidb.org/${cycpath}/server.html" class="blue">${cycname}</a> ]

 <hr class="brown"> 

  </td>
</tr>

<%-- choose queryGrid (with tr/td) or questionList --%>
<%-- if queryGrid, add <hr class="brown" above, to separate the quick tools from the query grid --%>
<%-- if queryGrid, add old queries for plasmo and toxo after the query grid  --%>

<tr><td colspan="4">
<site:questionList/>

</td></tr>

<%--
<c:if test = "${project == 'PlasmoDB'}">
<tr><td align="left" colspan="3"><b>PlasmoDB 4.4 queries/tools not yet in 5.4 >>
    <td align="right"><a href="http://v4-4.plasmodb.org/restricted/Queries.shtml">
                      <img src="<c:url value="/images/go.gif"/>" alt="PlasmoDB 4.4" border="0"></a>
    </td>
</tr>
</c:if>
<c:if test = "${project == 'ToxoDB'}">
<tr><td align="left" colspan="3"><b>ToxoDB 3.3 queries/tools not yet in 4.0
    <td align="right"><a href="http://v3-0.toxodb.org/restricted/Queries.shtml">
                      <img src="<c:url value="/images/go.gif"/>" alt="ToxoDB 3.3" border="0"></a>&nbsp;</td></tr>
</c:if>
--%>


</table>


<%-- CLOSE TABLE that sets the (red in plasmo) line on top --%>
</td></tr></table>
 
<site:footer/>
