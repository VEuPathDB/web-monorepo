<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%@ attribute name="refer" 
 			  type="java.lang.String"
			  required="false" 
			  description="Page calling this tag"
%>

<c:set var="project" value="${applicationScope.wdkModel.name}" />
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<!-- for genes that have user comments -->
<c:set var="qSetMap" value="${wdkModel.questionSetsMap}"/>
<c:set var="gqSet" value="${qSetMap['GeneQuestions']}"/>
<c:set var="gqMap" value="${gqSet.questionsMap}"/>
<c:set var="geneByTextQuestion" value="${gqMap['GenesByTextSearch']}"/>
<c:set var="gkwqpMap" value="${geneByTextQuestion.paramsMap}"/>
<c:set var="textParam" value="${gkwqpMap['text_expression']}"/>
<c:set var="orgParam" value="${gkwqpMap['text_search_organism']}"/>
<c:set var="timestampParam" value="${gkwqpMap['timestamp']}"/>


<!--  SETTING ORGANISMS for the genes in user comments 
      (share with quick search!! some session variable or application scope -->

<c:set var="AmoebaDBOrgs" value="Entamoeba dispar,Entamoeba histolytica,Entamoeba invadens" />
<c:set var="CryptoDBOrgs" value="Cryptosporidium hominis,Cryptosporidium parvum,Cryptosporidium muris" />				
<c:set var="GiardiaDBOrgs" value="Giardia Assemblage A isolate WB, Giardia Assemblage B isolate GS,Giardia Assemblage E isolate P15" />
<c:set var="MicrosporidiaDBOrgs" value="Encephalitozoon cuniculi,Encephalitozoon intestinalis,Enterocytozoon bieneusi" />
<c:set var="PlasmoDBOrgs" value="Plasmodium berghei,Plasmodium chabaudi,Plasmodium falciparum,Plasmodium knowlesi,Plasmodium vivax,Plasmodium yoelii" />
<c:set var="ToxoDBOrgs" value="Toxoplasma gondii,Neospora caninum" />
<c:set var="TrichDBOrgs" value="Trichomonas vaginalis"/>
<c:set var="TriTrypDBOrgs" value="Leishmania braziliensis,Leishmania infantum,Leishmania major,Leishmania mexicana,Trypanosoma brucei,Trypanosoma cruzi,Trypanosoma congolense,Trypanosoma vivax"/>
<c:set var="EuPathDBOrgs" value="${AmoebaDBOrgs},${CryptoDBOrgs},${GiardiaDBOrgs},${MicrosporidiaDBOrgs},${PlasmoDBOrgs},${ToxoDBOrgs},${TrichDBOrgs},${TriTrypDBOrgs},"/>

<c:choose>
	<c:when test="${fn:containsIgnoreCase(modelName, 'EuPathDB')}">
		<c:set var="listOrganisms" value="${EuPathDBOrgs}" />
	</c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'AmoebaDB')}">
		<c:set var="listOrganisms" value="${AmoebaDBOrgs}" />
	</c:when>
        <c:when test="${fn:containsIgnoreCase(modelName, 'CryptoDB')}">
		<c:set var="listOrganisms" value="${CryptoDBOrgs}" />
	</c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'GiardiaDB')}">
                <c:set var="listOrganisms" value="${GiardiaDBOrgs}" />
        </c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'MicrosporidiaDB')}">
                <c:set var="listOrganisms" value="${MicrosporidiaDBOrgs}" />
        </c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'PlasmoDB')}">
                <c:set var="listOrganisms" value="${PlasmoDBOrgs}" />
        </c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'ToxoDB')}">
                <c:set var="listOrganisms" value="${ToxoDBOrgs}" />
        </c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'TrichDB')}">
                <c:set var="listOrganisms" value="${TrichDBOrgs}" />
        </c:when>
	<c:when test="${fn:containsIgnoreCase(modelName, 'TriTrypDB')}">
                <c:set var="listOrganisms" value="${TriTrypDBOrgs}" />
        </c:when>
</c:choose> 

<!-- for external links -->
<c:set var="xqSetMap" value="${wdkModel.xmlQuestionSetsMap}"/>
<c:set var="xqSet" value="${xqSetMap['XmlQuestions']}"/>
<c:set var="xqMap" value="${xqSet.questionsMap}"/>
<c:set var="extlQuestion" value="${xqMap['ExternalLinks']}"/>
<c:catch var="extlAnswer_exception">
    <c:set var="extlAnswer" value="${extlQuestion.fullAnswer}"/>
</c:catch>

<c:choose>
<c:when test="${wdkUser.stepCount == null}">
<c:set var="count" value="0"/>
</c:when>
<c:otherwise>
<c:set var="count" value="${wdkUser.strategyCount}"/>
</c:otherwise>
</c:choose>
<c:set var="basketCount" value="${wdkUser.basketCount}"/>
<div id="menubar">

<div id="menu">

<!-- default style for this ul establishes 9em -->
<ul style="width:7em;"><li><a href="<c:url value="/"/>">Home</a></li></ul>
<%-- was needed when New Search was first choice 
<ul style="width:0.5em;border:0"><li></li></ul>
--%>

<ul>
    <li><a href="<c:url value="/queries_tools.jsp"/>" title="START a NEW search strategy, or CLICK to access the page with all available searches (last option in the dropdown menu)." >New Search</a>
  	<site:drop_down_QG2 />
    </li>
</ul>

<%-- some javascript fills the count in the span --%>
<ul>
    <li><a id="mysearch" onclick="setCurrentTabCookie('application','strategy_results');" href="<c:url value="/showApplication.do"/>" title="Access your Search Strategies Workspace">
	My Strategies <%--<span title="You have ${count} strategies" class="subscriptCount">
		(${count})</span>--%>
        </a>
    </li>
</ul>

<ul style="width:10em;white-space:nowrap">	
<c:choose>
  <c:when test="${wdkUser == null || wdkUser.guest}">
    <wdk:requestURL path="/showApplication.do" />
    <li><a id="mybasket" onclick="setCurrentTabCookie('application', 'basket');popLogin('${originRequestUrl}');" href="javascript:void(0)"  title="Group IDs together to work with them. You can add IDs from a result, or from a details page.">My Basket <span class="subscriptCount" style="vertical-align:top">(0)</span></a></li>
  </c:when>
  <c:otherwise>
    <c:choose>
      <c:when test="${refer == 'customSummary'}">
    	<li><a id="mybasket" onclick="showPanel('basket');" href="javascript:void(0)" title="Group IDs together to later make a step in a strategy.">My Basket <span class="subscriptCount" style="vertical-align:top">(${basketCount})</span></a></li>
      </c:when>
      <c:otherwise>
    	<li><a id="mybasket" onclick="setCurrentTabCookie('application', 'basket');" href="<c:url value="/showApplication.do"/>" title="Group IDs together to later make a step in a strategy.">My Basket <span class="subscriptCount" style="vertical-align:top">(${basketCount})</span></a></li>
      </c:otherwise>
    </c:choose>
  </c:otherwise>
</c:choose>
</ul>

<ul style="width:7em;">
    <li><a href="#">Tools</a>
	<ul>
	    <li><a href="<c:url value="/showQuestion.do?questionFullName=UniversalQuestions.UnifiedBlast"/>"> BLAST</a></li>
  	    <li><a href="<c:url value="/srt.jsp"/>"> Sequence Retrieval</a></li>
            <li><a href="/common/PubCrawler/"> PubMed and Entrez</a></li>
 	    <c:if test="${project != 'EuPathDB'}" >
            	<li><a href="/cgi-bin/gbrowse/${fn:toLowerCase(project)}/">Genome Browser </a></li>
 	    </c:if>
	    <c:if test="${project == 'PlasmoDB'}" >
		<li><a href="http://v4-4.plasmodb.org/restricted/PlasmoAPcgi.shtml">PlasmoAP</a>
		</li>
		<li><a href="http://gecco.org.chemie.uni-frankfurt.de/pats/pats-index.php">PATS</a>
		</li>
		<li><a href="http://gecco.org.chemie.uni-frankfurt.de/plasmit">PlasMit</a>
		</li>
	    </c:if>
            <c:if test="${project == 'CryptoDB'}" >
            	<li><a href="http://apicyc.apidb.org/CPARVUM/server.html">CryptoCyc</a></li>
            </c:if>
 	    <c:if test="${project == 'PlasmoDB'}" >
            	<li><a href="http://apicyc.apidb.org/PLASMO/server.html">PlasmoCyc</a></li>
            </c:if>
 	    <c:if test="${project == 'ToxoDB'}" >
		<li><a href="http://ancillary.toxodb.org">Ancillary Genome Browser</a></li>
            	<li><a href="http://apicyc.apidb.org/TOXO/server.html">ToxoCyc</a></li>
            </c:if>
	    <li><a href="<c:url value="/serviceList.jsp"/>"> Searches via Web Services</a></li>

    	</ul>

    </li>
</ul>

<ul>
	<li><a href="#">Data Summary</a>
  	<ul>

<c:if test="${project == 'EuPathDB'}">
	    <li><a href="<c:url value='/showXmlDataContent.do?name=XmlQuestions.About#protocols_methods'/>">Data Sources and Methods</a></li>	
</c:if>
<c:if test="${project != 'EuPathDB'}">
   	    <li><a href="<c:url value='/showXmlDataContent.do?name=XmlQuestions.DataSources'/>">Data Sources</a></li>
 	    <li><a href="<c:url value='/showXmlDataContent.do?name=XmlQuestions.Methods'/>">Analysis Methods</a></li>
</c:if>
<c:if test="${project == 'CryptoDB'}">
	 <li id='h-'><a href="http://cryptodb.org/static/SOP/">SOPs for <i>C.parvum</i> Annotation</a></li>
</c:if>
    	<li><a title="Table summarizing all the genomes and their different data types available in EuPathDB" href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GenomeDataType"/>">EuPathDB Genomes and Data Types</a></li>
	<li><a title="Table summarizing gene counts for all the available genomes, and evidence supporting them" href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GeneMetrics"/>">EuPathDB Gene Metrics</a></li>

	</ul>
	</li>
</ul>

<ul>
    <li><a href="#">Downloads</a>
 	<ul>
    	    <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#downloads"/>">Understanding Downloads</a></li>
    	    <li><a href="/common/downloads">Data Files</a></li>

    	  <%--  <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#protocols_methods"/>">Protocols and Methods</a></li> --%>

 <c:if test="${project != 'EuPathDB'}" >
    	    <li><a href="<c:url value="/communityUpload.jsp"/>">Upload Community Files</a></li>
    	    <li><a href="<c:url value="/showSummary.do?questionFullName=UserFileQuestions.UserFileUploads"/>">Download Community Files</a></li>
</c:if>
    	    <li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs"/>">EuPathDB Publications</a></li> 
  	</ul>
    </li>
</ul>
    
<ul>
    <li><a href="#">Community</a>
	<ul>
 	    <c:if test="${project != 'EuPathDB'}" >    
		<li><a title="Add your comments to your gene of interest: start at the gene page" onclick="setCurrentTabCookie('application','strategy_results');" href="<c:url value="/showSummary.do?questionFullName=GeneQuestions.GenesByTextSearch&myMultiProp(text_search_organism)=${listOrganisms}&myMultiProp(text_fields)=User comments&myMultiProp(whole_words)=no&myProp(max_pvalue)=-30&myProp(text_expression)=*&myProp(timestamp)=${timestampParam.default}"/>"/>Find Genes with Comments from the ${project} Community</a></li>

	    <li><a href="<c:url value="/communityUpload.jsp"/>">Upload Community Files</a></li>

    	    <li><a onclick="setCurrentTabCookie('application','strategy_results');" href="<c:url value="/showSummary.do?questionFullName=UserFileQuestions.UserFileUploads"/>">Download Community Files</a></li>
	    </c:if>

    	    <li><a href="https://community.eupathdb.org">Discussion Forums</a></li>
	    <li><a href="<c:url value="/communityEvents.jsp"/>">Upcoming Events</a></li>

  	    <c:choose>
    	    <c:when test="${extlAnswer_exception != null}">
	    	<li><a href="#"><font color="#CC0033"><i>Error. related sites temporarily unavailable</i></font></a></li>
    	    </c:when>
    	    <c:otherwise>
    		<li><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.ExternalLinks"/>">Related Sites</a></li>
    	    </c:otherwise>
    	    </c:choose>
  	</ul>
    </li>
</ul>


 <c:if test="${project != 'EuPathDB'}" >

<ul style="padding-top:3px;width:11em;border-width:0;float:right">
<c:choose>
<c:when test="${wdkUser == null || wdkUser.guest}">
	<wdk:requestURL path="/showFavorite.do" />
	<li><a id="mybasket" onclick="popLogin('${originRequestUrl}');" href="javascript:void(0)">
		<img style="vertical-align:middle" height="20" title="Store IDs for easy access to their details page. You can add IDs *only* from the details page, one at a time." src="<c:url value="/wdk/images/favorite_color.gif"/>"/>&nbsp;
		<span style="vertical-align:middle" title="Store IDs for easy access to their details page. You can add IDs *only* from the details page, one at a time.">My Favorites</span>
       	    </a>
    	</li></ul>
</c:when>
<c:otherwise>
    	<li><a href="<c:url value="/showFavorite.do"/>">
		<img style="vertical-align:middle" height="20" title="Store IDs for easy access to their details page. You can add IDs *only* from the details page, one at a time." src="<c:url value="/wdk/images/favorite_color.gif"/>"/>&nbsp;
		<span style="vertical-align:middle" title="Store IDs for easy access to their details page. You can add IDs *only* from the details page, one at a time.">My Favorites</span>
	    </a>
	</li></ul>	
</c:otherwise>
</c:choose>

</c:if>

</div>

</div>
<a name="skip" id="skip"></a>
