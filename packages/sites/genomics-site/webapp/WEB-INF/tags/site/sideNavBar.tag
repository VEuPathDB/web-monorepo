<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<c:set var="xqSetMap" value="${wdkModel.xmlQuestionSetsMap}"/>
<c:set var="xqSet" value="${xqSetMap['XmlQuestions']}"/>
<c:set var="xqMap" value="${xqSet.questionsMap}"/>
<c:set var="faqQuestion" value="${xqMap['FAQ']}"/>
<c:set var="faqAnswer" value="${faqQuestion.fullAnswer}"/>

<c:set var="dataSourcesQuestion" value="${xqMap['DataSources']}"/>
<c:set var="dsAnswer" value="${dataSourcesQuestion.fullAnswer}"/>

<random:number id="R" range="0-1000"/>
<c:set var="loginRN" value="${R.random}"/>

<c:set var="faqRN" value="0"/>
<c:if test="${faqAnswer.resultSize > 0}">
    <c:set var="faqRN" value="${R.random mod faqAnswer.resultSize}"/>
</c:if>

<c:set var="dsRN" value="0"/>
<c:if test="${dsAnswer.resultSize > 0}">
    <c:set var="dsRN" value="${R.random mod dsAnswer.resultSize}"/>
</c:if>

<c:set var="queryCount" value ="(no queries)"/>
<c:choose>
  <c:when test="${wdkUser.stepCount == 0} ">
     <c:set var="queryCount" value ="(no queries)"/>
  </c:when>
  <c:when test="${wdkUser.stepCount == 1}">
     <c:set var="queryCount" value ="(1 query)"/>
  </c:when>
  <c:when test="${wdkUser.stepCount > 1}">
     <c:set var="queryCount" value ="(${wdkUser.stepCount} queries)"/>
  </c:when>
</c:choose>



<%@ attribute name="division"
              required="false"
              description="context of page in the whole website"
%>

<table border="0" cellspacing="0" cellpadding="4" width="90%" align="center" class="withThinBrownBorder">
<tr><c:choose>
        <c:when test="${division == null || division == 'home'}">
            <td class="bordersSpecial" align="center">
                <a href="<c:url value="/home.jsp"/>"><div class="smallWhite">HOME</div></a>
            </td>
        </c:when>
        <c:otherwise>
            <td class="borders" align="center"><a href="<c:url value="/home.jsp"/>" class="headerLink">Home</a></td>
        </c:otherwise>
    </c:choose>

    <c:choose>
        <c:when test="${division == 'queries_tools'}">
            <td class="bordersSpecial" align="center">
                <a href="<c:url value="/queries_tools.jsp"/>"><div class="smallWhite">QUERIES & TOOLS</div></a>
            </td>
        </c:when>
        <c:otherwise>
            <td class="borders" align="center">
                <a href="<c:url value="/queries_tools.jsp"/>" class="headerLink">Queries & Tools</a></td>
        </c:otherwise>
    </c:choose>
</tr>

<tr bgcolor="#ddccdd"><c:choose>
        <c:when test="${division == 'query_history'}">
            <td colspan="2" class="bordersSpecial"  align="center">
               <a href="<c:url value="/showQueryHistory.do"/>"><div class=smallWhite>MY QUERY HISTORY</div></a>
               <b><span class='white'>${queryCount}</span>
            </td>
        </c:when>
        <c:otherwise>
            <td colspan="2" class="borders" align="center">
                <a href="<c:url value="/showQueryHistory.do"/>" class="headerLink"><b>My Query History</b><br>
                <b><span class='maroon'>${queryCount}</span></b></a>
            </td>
        </c:otherwise>
    </c:choose>
</tr>

<tr><c:choose>
        <c:when test="${division == 'data_sources'}">
            <td class="bordersSpecial"  align="center">
                <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.DataSources"/>">
                    <div class=smallWhite>DATA SOURCES</div></a>
            </td>
        </c:when>
        <c:otherwise>
            <td class="borders" align="center">
             <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.DataSources"/>"
                class=headerLink>Data Sources</a></td>
        </c:otherwise>
    </c:choose>

    <c:choose>
        <c:when test="${division == 'methods'}">
            <td class="bordersSpecial"  align="center">
                <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Methods"/>">
                    <div class=smallWhite>ANALYSIS METHODS</div></a>
            </td>
        </c:when>
        <c:otherwise>
            <td class="borders" align="center">
             <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Methods"/>"
                class=headerLink>Analysis Methods</a></td>
        </c:otherwise>
    </c:choose>
</tr>

<tr><c:choose>
        <c:when test="${division == 'metrics'}">
            <td class="bordersSpecial"  align="center">
                <a href="<c:url value="http://apidb.org/apidb/apidbGeneMetrics.jsp"/>"><div class="smallWhite"><b>GENE METRICS</b></div></a>
            </td>
        </c:when>
        <c:otherwise>
            <td class="borders" align="center">
                <a href="<c:url value="http://apidb.org/apidb/apidbGeneMetrics.jsp"/>" class="headerLink">Gene Metrics</a></td>
        </c:otherwise>
    </c:choose>

  <c:choose>
        <c:when test="${division == 'downloads'}">
            <td class="bordersSpecial" align="center">
                <a href="/common/downloads/"><div class=smallWhite>DOWNLOAD FILES</div></a>
            </td>
        </c:when>
        <c:otherwise>
            <td class="borders" align="center">
                <a href="/common/downloads/" class="headerLink">Download Files</a></td>
        </c:otherwise>
    </c:choose>

  
</tr>

<tr><c:choose>
        <c:when test="${division == 'glossary'}">
            <td ${colspan2} class="bordersSpecial" align="center">
               <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Glossary"/>" ><div class=smallWhite>GLOSSARY OF TERMS</div></a>
            </td>
        </c:when>
        <c:otherwise>
            <td ${colspan2} class="borders" align="center">
                <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Glossary"/>" class="headerLink">Glossary of Terms</a>
            </td>
        </c:otherwise>
    </c:choose>

  <c:choose>
        <c:when test="${division == 'tutorials'}">
            <td class="bordersSpecial" align="center">
               <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Tutorials"/>"><div class=smallWhite>WEBSITE TUTORIALS</div></a>
            </td>
        </c:when>
        <c:otherwise>
            <td class="borders" align="center">
                <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.Tutorials"/>" class="headerLink">Website Tutorials</a></td>
        </c:otherwise>
    </c:choose>
</tr>

<tr>
  <c:choose>
        <c:when test="${division == 'about'}">
            <td class="bordersSpecial"  align="center">
              <a href="<c:url value="/about.jsp"/>"><div class="smallWhite">ABOUT ${project}</div></a>
            </td>
        </c:when>
        <c:otherwise>
            <td class="borders" align="center">
             <a href="<c:url value="/about.jsp"/>" class="headerLink">About ${project}</a>
            </td>
        </c:otherwise>
    </c:choose>

  <c:choose>
        <c:when test="${division == 'webstats'}">
            <td class="bordersSpecial" align="center">
               <a href="/awstats/awstats.pl?config=${fn:toLowerCase(project)}.org"><div class="smallWhite">SITE STATISTICS</div></a>
            </td>
        </c:when>
        <c:otherwise>
            <td class="borders" align="center">
                <a href="/awstats/awstats.pl?config=${fn:toLowerCase(project)}.org" class="headerLink">Site Statistics</a></td>
        </c:otherwise>
    </c:choose>

</tr>

<tr bgcolor="#ddccdd"><c:choose>
        <c:when test="${division == 'help'}">
            <td colspan="2" class="bordersSpecial" align="center">
               <a href="<c:url value="/help.jsp"/>"  target="_blank" onClick="poptastic(this.href); return false;" class="headerLink"><font  class='maroon'><b>Ask us a Question!</b></font></a>
            </td>
        </c:when>
        <c:otherwise>
            <td colspan="2" class="borders" align="center">
                <a href="<c:url value="/help.jsp"/>"  target="_blank" onClick="poptastic(this.href); return false;" class="headerLink"><font  class='maroon'><b>Ask us a Question!</b></font></a>
            </td>
        </c:otherwise>
    </c:choose>
</tr>

<%--  NO SITE SEARCH
<tr>
     <td colspan="2" class="borders" align="center">
        <div class="small">Site Search: &nbsp;
        <input type="text" name="identifier" size="10" maxlength="15">&nbsp;
        <a href="<c:url value="/notAvailable.jsp?page=Site Search"/>" class="headerLink"><b>GO</b></a>
		</div>
     </td>
</tr>
--%>


</table>



  <hr class="brown">

  <table border="0" width="90%" cellpadding="5" align="center" class="withThinBrownBorder">
	  <tr>
	    <td>
		<site:login/>
	    </td>
	  </tr>
  </table>

  <hr class="brown">


  <table border="0" width="90%" cellpadding="5" align="center" class="withThinBrownBorder">
   <tr><td>
         <div class=small>

	 <center><b>Did you know?</b></center>

	 <hr class="brown">

         <c:set value="${faqAnswer.recordInstances[faqRN]}" var="record"/>
         <c:set var="attrs" value="${record.attributesMap}"/>
         Did you know <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.FAQ&idx=${faqRN}"/>">${attrs['didYouKnow']}?</a>
         <br><br>
         <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.FAQ"/>">
             Read all the 'FAQs'</a>

	 <hr class="brown">

	 <center><b>Featured data source</b></center>

	 <hr class="brown">

         <c:set value="${dsAnswer.recordInstances[dsRN]}" var="record"/>
         <c:set var="attrs" value="${record.attributesMap}"/>
         <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.DataSources&idx=${dsRN}"/>">
             <c:if test="${attrs['category'] != null}">${attrs['category']}: </c:if>${attrs['resource']}</a>
         <br><br>
         <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.DataSources"/>">
             <i>See all data sources</i></a>

	
<c:if test = "${project == 'PlasmoDB'}">
         <hr class="brown">
         <center>
         <a href="http://geneplot.plasmodb.org">
         <img src="images/PlasmoCD.jpg" alt="PlasmoDB gene plot" border="0">
         <br>
         <div class="small">Access the latest PlasmoCD</div>
         </a>
         </center>
 </c:if>

         </div>
   </td></tr></table>
