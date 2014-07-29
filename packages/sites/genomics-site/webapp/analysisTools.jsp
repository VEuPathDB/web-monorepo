<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="project" value="${applicationScope.wdkModel.name}" />

<imp:pageFrame title="${wdkModel.displayName} :: Analysis Tools"
               refer="faq"
               banner="Analyze Results"
               parentUrl="/home.jsp">

  <h1>Analyze Your Strategy Results</h1>

  <p>Our sites offer tools for analyzing the results of gene searches. 
  After running a search or strategy that returns genes, you can analyze the results to find 
  statistically enriched Gene Ontology annotations, Metabolic Pathway annotations or words 
  in the gene product descriptions. A term or word is considered enriched if it appears more 
  often in the gene result set than it does in the set of all genes for that organism.  </p>

  <div><img src="/assets/images/Overall.jpg" width="400px"/></div>
<br><br>

  <h3>4 Steps to Creating an Enrichment Analysis</h3>
  <div>
    <ol>
      <li>Start a new search, or open an existing strategy.</li>
      <li>When the strategy is loaded, 
      choose the result and organism that you wish to analyze. 
      <ol>
         <li>To choose the result that you wish to analyze, click the box in the strategy 
         panel that represents the result.
         
         <div><img src="/assets/images/choose_result.jpg" width="400px"/></div></li>
         
         <li>If your result contains genes from more than one organism, use the 
         filter table to limit the result to genes from a single organism.
         
         <div><img src="/assets/images/choose_organism.jpg" width="500px"/></div></li>
      </ol>
       </li>
      <li>Click on the blue "Analyze Results" button. The button appears next to the tabbed results pages.
      
      <div><img src="/assets/images/click_button.jpg" width="400px"/></div></li>
      
      <li>Select an analysis tool from the list of available tools.
      <div><img src="/assets/images/choose_analysis.jpg" width="400px"/></div></li>
      
    </ol>
    <em>Not all search results have analysis tools available.</em>
  </div>

  <h3>Video Tutorial</h3>
  <div>
    <em>Embedded YouTube video here</em>
  </div>
</imp:pageFrame>
