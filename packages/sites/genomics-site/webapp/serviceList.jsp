<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="wdkModelDispName"/>
<site:header banner="${wdkModelDispName}" />


<c:if test="${wdkModelDispName eq 'CryptoDB'}">
    	<c:set var="organism" value="Cryptosporidium parvum,Cryptosporidium hominis"/>
</c:if>

<c:if test="${wdkModelDispName eq 'PlasmoDB'}">
        <c:set var="organism" value="Plasmodium falciparumPlasmdium knowlesi"/>
</c:if>
<c:if test="${wdkModelDispName eq 'ToxoDB'}">
        <c:set var="organism" value="Toxoplasma gondii,Neospora caninum"/>
</c:if>
<c:if test="${wdkModelDispName eq 'GiardiaDB'}">
        <c:set var="organism" value="Giardia Assemblage A isolate WB,Giardia Assemblage B isolate GS"/>
</c:if>
<c:if test="${wdkModelDispName eq 'TrichDB'}">
        <c:set var="organism" value="Trichomonas vaginalis"/>
</c:if>
<c:if test="${wdkModelDispName eq 'TriTrypDB'}">
        <c:set var="organism" value="Leishmania braziliensis,Trypanosoma brucei"/>
</c:if>



<!-- display wdkModel introduction text -->
<h1>Searches via Web Services</h1>
<br>
Currently, ${wdkModelDispName} provides programmatic access to <a href="<c:url value="/queries_tools.jsp"/>">all the searches available in the website</a>, via <a href="http://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm"><b>REST</b></a> Web Services. REST services can be executed with a browser by typing a specific URL. This page provides <b>documentation</b> on how to <b>generate the URL</b> that is used to execute a service
<br><br>The result of a web service is  a list of IDs (genes, ESTs, etc). This is not different from what happens with searches in the website. The result of a web service can be obtained in two possible forms: an <a href="http://www.w3.org/XML/">XML</a> document or a <a href="http://json.org/">JSON</a> string.

<br><br>
This example of a URL: 
<br>&nbsp;&nbsp;&nbsp;&nbsp;<a href="<c:url value="/webservices/GeneQuestions/GenesByMolecularWeight.xml?min_molecular_weight=10000&max_molecular_weight=50000&organism=${organism}&o-fields=gene_type,organism_full"/>">http://${wdkModelDispName}.org/webservices/GeneQuestions/GenesByMolecularWeight.xml?min_molecular_weight=10000&max_molecular_weight=50000&organism=${organism}&o-fields=gene_type,organism_full&o-tables=EcNumber</a>

<br><br>corresponds to this request: 
<br><span style="font-style:italic;font-weight:bold">
&nbsp;&nbsp;&nbsp;&nbsp;Searching for Genes by Molecular Weight in ${wdkModelDispName}; provide the result in an XML document.
<br>&nbsp;&nbsp;&nbsp;&nbsp;Find all ${organism} genes that have molecular weight between 10,000 and 50,000. 
<br>&nbsp;&nbsp;&nbsp;&nbsp;For each gene ID in the result, please provide its organism full name, its gene type and its <a href="http://www.chem.qmul.ac.uk/iubmb/enzyme/">EC (Enzyme Commission)</a> numbers.</span>

<br><br>(Notice the syntax of the URL is the same as the one used by a browser to send data to a server, usually the content of an <a href="http://www.w3.org/TR/html401/interact/forms.html#h-17.13.3.1">html form</a>. 
In it, we have used a "<b>?</b>" to indicate the beginning of data, and a "<b>&</b>" to separate <i>name=value</i> pairs in the -imaginary form- data set.)
<br><br><br>


<h2>Access to the web service WADLs</h2>
<ul class="cirbulletlist">
 <li> Below is the list of <b>all available searches</b> in ${wdkModelDispName}, sorted by the <b>type of entity</b> they return (genes, genomic sequences, ESTs, etc) --in the same order used in the "New Search" menu.</li>
<li>By clicking on a search below, you access its <a href="http://www.w3.org/Submission/wadl/">WADL</a> (Web Application Description Language) document, an XML document.
<br>   ***The link to a search below provides <b>documentation</b>; it does <b>NOT</b> execute the service.***</li>
<li>For more details on how to read the WADL, and generate the URL, <a href="#moreWADL">see below</a>.</li>
</ul>

<br><br>


<!-- show all questionSets in model, driven by categories as in menubar -->
<site:drop_down_QG2 from="webservices" />


<br><br>
<a name="moreWADL"></a>
<h2>How to read a WADL</h2>
 In a WADL document you can find out the following:

<br><br>
<ul>
<li>(1) What is the service URL. It includes an extension that indicates if we want XML or JSON format for the result.
	<br>&nbsp;&nbsp;&nbsp;&nbsp;Under <span style="font-style:italic;font-weight:bold">&lt;resource path=....&gt;</span>. 
	<br>&nbsp;&nbsp;&nbsp;&nbsp;In the example above: <span style="font-style:italic;color: blue">http://${wdkModelDispName}.org/webservices/GeneQuestions/GenesByMolecularWeight.xml</span>
</li>
<br><li>(2) What is the name and purpose of the search.
	<br>&nbsp;&nbsp;&nbsp;&nbsp;Under <span style="font-style:italic;font-weight:bold">&lt;method name=....&gt;
<br>&nbsp;&nbsp;&nbsp;&nbsp;&lt;doc title="description"&gt;Find genes whose ..... Molecular weights are ......&lt;/doc&gt;</span>
</li>
<br><li>(3) How to constrain your search by providing a set of <i>name=value</i> pairs. 
	<br>&nbsp;&nbsp;&nbsp;&nbsp;These are detailed under <span style="font-style:italic;font-weight:bold"> &lt;param name=.....&gt;</span>. If a default value is provided under &lt;doc title="default"&gt;.....&lt;/doc&gt;, then providing the parameter name and value in the URL is optional.
	<br>&nbsp;&nbsp;&nbsp;&nbsp;In the example above we constrained the search: <span style="font-style:italic;color: blue">min_molecular_weight=10000, max_molecular_weight=50000</span>.
</li>
<br><li>(4) How to indicate what you want to know for each ID in the result.
	<br>&nbsp;&nbsp;&nbsp;&nbsp;These are detailed under <span style="font-style:italic;font-weight:bold"> &lt;param name=.....&gt;</span> too, and should be the same for all searches of a given type (e.g., Gene Searches). We call them "output fields and tables". Fields are single-valued while tables are multi-valued (array).
	<br>&nbsp;&nbsp;&nbsp;&nbsp;In the example above we chose: <span style="font-style:italic;color: blue">o-fields=gene_type,organism_full&o-tables=EcNumber</span>
</li>

</ul>
<br><br>



<site:footer/>
