<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<!-- serviceList.jsp -->

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="wdkModelDispName"/>
<site:header banner="${wdkModelDispName}" />

<c:set var="margin" value="15px"/>

<c:if test="${wdkModelDispName eq 'CryptoDB'}">
    	<c:set var="organism" value="Cryptosporidium parvum,Cryptosporidium hominis"/>
</c:if>

<c:if test="${wdkModelDispName eq 'PlasmoDB'}">
        <c:set var="organism" value="Plasmodium falciparum,Plasmodium knowlesi"/>
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
${wdkModelDispName} provides programmatic access to <a href="<c:url value="/queries_tools.jsp"/>">its searches</a>, via <a href="http://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm"><b>REST</b></a> Web Services. 
The result of a web service request is a list of records (genes, ESTs, etc) in either 
<a href="http://www.w3.org/XML/">XML</a> or <a href="http://json.org/">JSON</a> format. 
REST services can be executed in a browser by typing a specific URL. 

<br><br>For example, this URL: 
<br><span style="position:relative;left:${margin};"><a href="<c:url value="/webservices/GeneQuestions/GenesByMolecularWeight.xml?min_molecular_weight=10000&max_molecular_weight=50000&organism=${organism}&o-fields=gene_type,organism"/>">http://${wdkModelDispName}.org/webservices/GeneQuestions/GenesByMolecularWeight.xml?min_molecular_weight=10000&max_molecular_weight=50000&organism=${organism}&o-fields=gene_type,organism</a></span>

<br><br>Corresponds to this request: 
<br><span style="font-style:italic;font-weight:bold;position:relative;left:${margin};">
Find all (${organism}) genes that have molecular weight between 10,000 and 50,000. 
<br>For each gene ID in the result, return its organism, gene type and <a href="http://www.chem.qmul.ac.uk/iubmb/enzyme/">EC (Enzyme Commission)</a> numbers.
<br>Provide the result in an XML document.
</span>

<br><br><br>

<hr>

<h2>WADLs: how to generate web service URLs</h2>
Click on a search below to access its <a href="http://www.w3.org/Submission/wadl/">WADL</a> (Web Application Description Language). 
<br>

<span style="position:relative;left:${margin};">
<ul class="cirbulletlist">
<li>A WADL is an XML document that describes in detail how to form a URL to call the search as a web service request. For more details go to <a href="#moreWADL">How to read a WADL</a> at the botom of this page.</li>
<li>Note: some browsers (e.g.: Safari) do not know how to render an XML file properly (you will see a page full of terms with no structure).</li>
<li>To construct the URL in the example above, you would check the <a href="/webservices/GeneQuestions/GenesByMolecularWeight.wadl">Molecular Weight</a> WADL located below under <b>Protein Attributes</b></li>
</ul>
</span>

<br><br>

<!-- show all questionSets in model, driven by categories as in menubar -->
<site:drop_down_QG2 from="webservices" />

<br><hr><br>

<a name="moreWADL"></a>
<h2>How to read a WADL</h2>

<ul>

<li>(1) What is the name and purpose of the search.
<span style="position:relative;left:${margin};">
	<br>Under <span style="font-style:italic;font-weight:bold">&lt;method name=....&gt;</span>
	<br>In our example: <span style="font-style:italic;font-weight:bold">&lt;doc title="description"&gt;Find genes whose ..... Molecular weights are ......&lt;/doc&gt;</span>
</span>
</li>
<br>
<li>(2) What is the service URL. 
<span style="position:relative;left:${margin};">
	<br>Under <span style="font-style:italic;font-weight:bold">&lt;resource path=....&gt;</span>. 
	<br>It includes an extension that indicates the format requested for the result (XML or JSON).
	<br>In our example: <span style="font-style:italic;color: blue">http://${wdkModelDispName}.org/webservices/GeneQuestions/GenesByMolecularWeight.xml</span>
</span>
</li>
<br>
<li>(3) How to constrain your search.
<span style="position:relative;left:${margin};">
	<br>Under <span style="font-style:italic;font-weight:bold"> &lt;param name=.....&gt;</span>. 
	<br>If a default value is provided under &lt;doc title="default"&gt;.....&lt;/doc&gt;, then providing the parameter is optional.
	<br>In our example: <span style="font-style:italic;color: blue">min_molecular_weight=10000, max_molecular_weight=50000</span>.
</span>
</li>
<br>
<li>(4) What to return for each ID in the result.
<span style="position:relative;left:${margin};">
	<br>Under <span style="font-style:italic;font-weight:bold"> &lt;param name=.....&gt;</span> too.
	<br>These are the same for all searches of a given record type (e.g., for all gene searches). Output-fields are single-valued attributes while output-tables are multi-valued (array).
	<br>In our example: <span style="font-style:italic;color: blue">o-fields=gene_type,organism_full&o-tables=EcNumber</span>
</span>
</li>
</ul>


<site:footer/>
