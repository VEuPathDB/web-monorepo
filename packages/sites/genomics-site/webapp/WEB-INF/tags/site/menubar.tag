<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
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
<c:set var="userPrefs" value="${wdkUser.user.projectPreferences}"/>
<c:set var="baseUrl" value="${pageContext.request.contextPath}"/>

<!-- for genes that have user comments -->
<!-- some might not be needed since now this is its own question, used to be based on text search -->
<c:set var="qSetMap" value="${wdkModel.questionSetsMap}"/>
<c:set var="gqSet" value="${qSetMap['GeneQuestions']}"/>
<c:set var="gqMap" value="${gqSet.questionsMap}"/>
<c:set var="geneByTextQuestion" value="${gqMap['GenesByTextSearch']}"/>
<c:set var="gkwqpMap" value="${geneByTextQuestion.paramsMap}"/>
<c:set var="textParam" value="${gkwqpMap['text_expression']}"/>
<c:set var="orgParam" value="${gkwqpMap['text_search_organism']}"/>
<c:set var="timestampParam" value="${gkwqpMap['timestamp']}"/>

<%-- JSP constants --%>
<jsp:useBean id="constants" class="org.eupathdb.common.model.JspConstants"/>

<!-- for external links -->
<c:set var="xqSetMap" value="${wdkModel.xmlQuestionSetsMap}"/>
<c:set var="xqSet" value="${xqSetMap['XmlQuestions']}"/>
<c:set var="xqMap" value="${xqSet.questionsMap}"/>
<c:set var="extlQuestion" value="${xqMap['ExternalLinks']}"/>
<c:catch var="extlAnswer_exception">
    <c:set var="extlAnswer" value="${extlQuestion.fullAnswer}"/>
</c:catch>

<c:set var="basketCount" value="${wdkUser.basketCount}"/>

<span class="onload-function" data-function="eupath.setup.configureMenuBar"><jsp:text/></span>
<div id="menu" class="ui-helper-clearfix">

  <ul class="sf-menu">
    <li><a href="${baseUrl}/">Home</a></li>

    <li><a title="START a NEW search strategy. Searches are organized by the genomic feature they return." >New Search</a>
      <imp:drop_down_QG2 /></li>

    <li><a id="mysearch" href="${baseUrl}/showApplication.do" title="Access your Search Strategies Workspace">
      My Strategies</a></li>

    <c:choose>
      <c:when test="${wdkUser == null || wdkUser.guest}">
        <li><a id="mybasket" onclick="wdk.stratTabCookie.setCurrentTabCookie('application', 'basket');wdk.user.login('use baskets', wdk.webappUrl('/showApplication.do'));" href="javascript:void(0)"  title="Group IDs together to work with them. You can add IDs from a result, or from a details page.">My Basket <span class="subscriptCount" style="vertical-align:top">(0)</span></a></li>
      </c:when>
      <c:otherwise>
        <c:choose>
          <c:when test="${refer == 'summary'}">
          <li><a id="mybasket" onclick="wdk.addStepPopup.showPanel('basket');" href="javascript:void(0)" title="Group IDs together to later make a step in a strategy.">My Basket <span class="subscriptCount" style="vertical-align:top">(${basketCount})</span></a></li>
          </c:when>
          <c:otherwise>
          <li><a id="mybasket" onclick="wdk.stratTabCookie.setCurrentTabCookie('application', 'basket');" href="${baseUrl}/showApplication.do" title="Group IDs together to later make a step in a strategy.">My Basket <span class="subscriptCount" style="vertical-align:top">(${basketCount})</span></a></li>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose>

    <li><a>Tools</a>
      <ul>
        <li><a href="${baseUrl}/showQuestion.do?questionFullName=UniversalQuestions.UnifiedBlast"> BLAST</a></li>
        <li><a style="padding-top:0"  href="${baseUrl}/analysisTools.jsp"> Results Analysis
              <imp:image alt="Beta feature icon" src="wdk/images/beta2-30.png" /></a></li>
        <li><a href="${baseUrl}/srt.jsp"> Sequence Retrieval</a></li>
        <li title="Annotate your sequence and determine orthology, phylogeny & synteny">
          <a href="https://companion.sanger.ac.uk"> Companion</a></li>
        <li title="Eukaryotic Pathogen CRISPR guide RNA/DNA Design Tool">
          <a href="http://grna.ctegd.uga.edu"> EuPaGDT</a></li>
        <li><a href="/pubcrawler/${project}"> PubMed and Entrez</a></li>
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
        <c:if test="${project == 'ToxoDB'}" >
          <li><a href="http://ancillary.toxodb.org">Ancillary Genome Browser</a></li>
        </c:if>
        <li><a href="${baseUrl}/serviceList.jsp"> Searches via Web Services</a></li>
      </ul>
    </li>

    <li><a>Data Summary</a>
      <ul>
        <li><a href="${baseUrl}/app/search/dataset/AllDatasets/result">Data Sets</a></li>
        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.Methods">Analysis Methods</a></li>
        <c:if test="${project == 'CryptoDB'}">
          <li id='h-'><a href="http://cryptodb.org/static/SOP/">SOPs for <i>C.parvum</i> Annotation</a></li>
        </c:if>
        <li><a title="Table summarizing all the genomes and their different data types available in ${project}" href="${baseUrl}/processQuestion.do?questionFullName=OrganismQuestions.GenomeDataTypes">Genomes and Data Types</a></li> 
        <li><a title="Table summarizing gene counts for all the available genomes, and evidence supporting them" href="${baseUrl}/processQuestion.do?questionFullName=OrganismQuestions.GeneMetrics">Gene Metrics</a></li>
      </ul>
    </li>

    <li><a>Downloads</a>
      <ul>
        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.AboutAll#downloads">Understanding Downloads</a></li>
        <c:choose>
          <c:when test="${project eq 'EuPathDB'}">
            <li><a name="data-files">Data Files</a>
              <ul>
                <li><a href="http://amoebadb.org/common/downloads">AmoebaDB</a></li>
                <li><a href="http://cryptodb.org/common/downloads">CryptoDB</a></li>
                <li><a href="http://fungidb.org/common/downloads">FungiDB</a></li>
                <li><a href="http://giardiadb.org/common/downloads">GiardiaDB</a></li>
                <li><a href="http://microsporidiadb.org/common/downloads">MicrosporidiaDB</a></li>
                <li><a href="http://orthomcl.org/common/downloads">OrthoMCL</a></li>
                <li><a href="http://piroplasmadb.org/common/downloads">PiroplasmaDB</a></li>
                <li><a href="http://plasmodb.org/common/downloads">PlasmoDB</a></li>
                <li><a href="http://toxodb.org/common/downloads">ToxoDB</a></li>
                <li><a href="http://trichdb.org/common/downloads">TrichDB</a></li>
                <li><a href="http://tritrypdb.org/common/downloads">TriTrypDB</a></li>
              </ul>
            </li>
          </c:when>

          <c:otherwise>
            <li><a href="/common/downloads">Data Files</a>
          </c:otherwise>
        </c:choose>

        <li><a href="${baseUrl}/srt.jsp">Sequence Retrieval</a>

        <c:if test="${project != 'EuPathDB'}" >
          <li><a href="${baseUrl}/communityUpload.jsp">Upload Community Files</a></li>
          <li><a onclick="wdk.stratTabCookie.setCurrentTabCookie('application','strategy_results');" href="${baseUrl}/processQuestion.do?questionFullName=UserFileQuestions.UserFileUploads">Download Community Files</a></li>
        </c:if>

        <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs">EuPathDB Publications</a></li> 
      </ul>
    </li>
    
    <li><a>Community</a>
      <ul>
        <imp:socialMedia small="true" label="true"/>

        <li><a href="/EuPathDB_datasubm_SOP.pdf">EuPathDB Data Submission & Release Policies</a></li>

        <c:if test="${project != 'EuPathDB'}" >    
          <li><a title="Add your comments to your gene of interest: start at the gene page" onclick="wdk.stratTabCookie.setCurrentTabCookie('application','strategy_results');" 
               href="${baseUrl}/showSummary.do?questionFullName=GeneQuestions.GenesWithUserComments&value(timestamp)=${timestampParam.default}"/>Find Genes with Comments from the ${project} Community</a></li>

          <li><a href="${baseUrl}/communityUpload.jsp">Upload Community Files</a></li>

          <li><a onclick="wdk.stratTabCookie.setCurrentTabCookie('application','strategy_results');" 
               href="${baseUrl}/processQuestion.do?questionFullName=UserFileQuestions.UserFileUploads">Download Community Files</a></li>
        </c:if>

        <li><a href="${baseUrl}/communityEvents.jsp">Upcoming Events</a></li>

        <c:choose>
          <c:when test="${extlAnswer_exception != null}">
            <li><a href="#"><font color="#CC0033"><i>Error. related sites temporarily unavailable</i></font></a></li>
          </c:when>
          <c:otherwise>
            <li><a href="${baseUrl}/showXmlDataContent.do?name=XmlQuestions.ExternalLinks">Related Sites</a></li>
          </c:otherwise>
        </c:choose>
        
        <li><a href="javascript:wdk.publicStrats.goToPublicStrats()">Public Strategies</a></li>
      </ul>
    </li>

    <li >
      <c:set var="galaxyRoute" value="${baseUrl}/app/galaxy-orientation"/>
      <a style="padding:5px 1em"
        href="${userPrefs['show-galaxy-orientation-page'] ne 'false' ? galaxyRoute : 'https://eupathdb.globusgenomics.org/'}"
        target="${userPrefs['show-galaxy-orientation-page'] ne 'false' ? '' : '_blank'}">
        <imp:image src="wdk/images/new-feature.png" height="14" />
        <span>Analyze My Experiment</span>
      </a>
    </li>

    <c:choose>
      <c:when test="${wdkUser == null || wdkUser.guest}">
        <li id="favorite-menu"><a id="mybasket" onclick="wdk.user.login('use favorites', wdk.webappUrl('/showFavorite.do'));" href="javascript:void(0)">
            <imp:image style="vertical-align:middle" height="20" title="Store IDs for easy access to their details page. You can add IDs *only* from the details page, one at a time." src="wdk/images/favorite_color.gif"/>&nbsp;
            <span style="vertical-align:middle" title="Store IDs for easy access to their details page. You can add IDs *only* from the details page, one at a time.">My Favorites</span></a></li>
      </c:when>
      <c:otherwise>
        <li id="favorite-menu"><a href="${baseUrl}/showFavorite.do">
          <imp:image style="vertical-align:middle" height="20" title="Store IDs for easy access to their details page. You can add IDs *only* from the details page, one at a time." src="wdk/images/favorite_color.gif"/>&nbsp;
          <span style="vertical-align:middle" title="Store IDs for easy access to their details page. You can add IDs *only* from the details page, one at a time.">My Favorites</span></a></li>
      </c:otherwise>
    </c:choose>
  </ul>

</div>

<a name="skip" id="skip"></a>
