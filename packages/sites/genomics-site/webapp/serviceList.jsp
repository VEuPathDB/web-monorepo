<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<!-- serviceList.jsp -->

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>


<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="wdkModelDispName"/>
<imp:pageFrame banner="${wdkModelDispName}">

<c:set var="margin" value="15px"/>

<!-- this should be read from the model -->
<c:if test="${wdkModelDispName eq 'FungiDB'}">
    	<c:set var="organism" value="Aspergillus clavatus"/>
</c:if>
<c:if test="${wdkModelDispName eq 'AmoebaDB'}">
    	<c:set var="organism" value="Entamoeba dispar"/>
</c:if>
<c:if test="${wdkModelDispName eq 'CryptoDB'}">
    	<c:set var="organism" value="Cryptosporidium parvum,Cryptosporidium hominis"/>
</c:if>
<c:if test="${wdkModelDispName eq 'EuPathDB'}">
    	<c:set var="organism" value="Cryptosporidium parvum,Leishmania major,Toxoplasma gondii"/>
</c:if>
<c:if test="${wdkModelDispName eq 'MicrosporidiaDB'}">
        <c:set var="organism" value="Encephalitozoon cuniculi"/>
</c:if>
<c:if test="${wdkModelDispName eq 'PiroplasmaDB'}">
        <c:set var="organism" value="Babesia bovis,Theileria annulata,Theileria parva"/>
</c:if>
<c:if test="${wdkModelDispName eq 'PlasmoDB'}">
        <c:set var="organism" value="Plasmodium falciparum,Plasmodium knowlesi"/>
</c:if>
<c:if test="${wdkModelDispName eq 'ToxoDB'}">
        <c:set var="organism" value="Toxoplasma gondii,Neospora caninum"/>
</c:if>
<c:if test="${wdkModelDispName eq 'GiardiaDB'}">
        <c:set var="organism" value="Giardia Assemblage A,Giardia Assemblage B"/>
</c:if>
<c:if test="${wdkModelDispName eq 'TrichDB'}">
        <c:set var="organism" value="Trichomonas vaginalis"/>
</c:if>
<c:if test="${wdkModelDispName eq 'TriTrypDB'}">
        <c:set var="organism" value="Leishmania braziliensis,Trypanosoma brucei"/>
</c:if>
<c:if test="${wdkModelDispName eq 'HostDB'}">
        <c:set var="organism" value="Homo sapiens"/>
</c:if>

<!-- display wdkModel introduction text -->
<h1>Searches via Web Services</h1>

<c:if test="${wdkModelDispName eq 'EuPathDB'}">
  <%-- copied from siteAnnounce.tag --%>
  <div class="info announcebox" style="color:darkred;font-size:120%">
    <table><tr>
			<td><imp:image src="images/clearInfoIcon.png" alt="warningSign" /></td>
    	<td>
      	<span class="warningMessage" style="line-height: 16px">
          Currently, some searches (demarcated with a &dagger;) do not work properly
          from <a href="http://eupathdb.org">EuPathDB.org</a> via webservices.
          Please go to individual component sites (such as
          <a href="http://plasmodb.org">PlasmoDB.org</a>) for such searches.
          Additionally, the parameter  "o-tables" is not available from
          <a href="http://eupathdb.org">EuPathDB.org</a>.

          <%--
          Currently, the following parameters do not work with webservices from
          <a href="http://eupathdb.org">EuPathDB.org</a>.
          If you wish to conduct searches via webservices with these parameters
          (demarcated with a &dagger;),
          please go to individual component sites (such as <a href="http://www.plasmodb.org">PlasmoDB.org</a>).
          <br/><br/>
          <ul class="cirbulletlist">
            <li>Parameters whose name begins with "ds_"</li>
            <li>Parameters named "o-tables"</li>
          </ul>
          --%>
      	</span>
     	</td>
		</tr></table>
  </div>
</c:if>

<br>
${wdkModelDispName} provides programmatic access to <a href="<c:url value="/queries_tools.jsp"/>">its searches</a>, via <a href="http://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm"><b>REST</b></a> Web Services. 
The result of a web service request is a list of records (genes, ESTs, etc) in either 
<a href="http://www.w3.org/XML/">XML</a> or <a href="http://json.org/">JSON</a> format. 
REST services can be executed in a browser by typing a specific URL. 

<br><br>For example, this URL:
<br><span style="position:relative;left:${margin};font-size:110%"><a href="<c:url value="/webservices/GeneQuestions/GenesByMolecularWeight.xml?min_molecular_weight=10000&max_molecular_weight=50000&reference_strains_only=Yes&organism=${organism}&o-fields=gene_type,organism"/>">http://${wdkModelDispName}.org/webservices/GeneQuestions/GenesByMolecularWeight.xml?<br>min_molecular_weight=10000&<br>max_molecular_weight=50000&<br>reference_strains_only=Yes&<br>organism=${organism}&<br>o-fields=gene_type,organism</a></span>

<br><br>Corresponds to this request: 
<br><span style="font-style:italic;font-weight:bold;position:relative;left:${margin};">
Find all (${organism}) genes that have molecular weight between 10,000 and 50,000. 
<br>For each gene ID in the result, return its gene type and organism.
<br>Provide the result in an XML document.
</span>

<br><br><br>
<c:set var="qSetMap" value="${wdkModel.questionSetsMap}"/>

<c:set var="gqSet" value="${qSetMap['GenomicSequenceQuestions']}"/>
<c:set var="gqMap" value="${gqSet.questionsMap}"/>
<c:set var="seqByIdQuestion" value="${gqMap['SequenceBySourceId']}"/>
<c:set var="sidqpMap" value="${seqByIdQuestion.paramsMap}"/>
<c:set var="seqIdParam" value="${sidqpMap['sequenceId']}"/>

<c:set var="geneqSet" value="${qSetMap['GeneQuestions']}"/>
<c:set var="geneqMap" value="${geneqSet.questionsMap}"/>
<c:set var="geneByIdQuestion" value="${geneqMap['GeneByLocusTag']}"/>
<c:set var="gidqpMap" value="${geneByIdQuestion.paramsMap}"/>
<c:set var="geneIdParam" value="${gidqpMap['ds_gene_ids']}"/>

<b style="font-size:120%">Downloading DNA sequences in a text file in FASTA format:</b><br>
<br>For specific genomic segments:
<ul>
<li>To download one sequence, please use one of the following URL formats:
<br><a target="_blank" href="http://${wdkModelDispName}.org/cgi-bin/contigSrt?project_id=${wdkModelDispName}&ids=${seqIdParam.default}&start=14&end=700">
  http://${wdkModelDispName}.org/cgi-bin/contigSrt?project_id=${wdkModelDispName}&ids=${seqIdParam.default}&start=14&end=700</a>
<br><a target="_blank" href="http://${wdkModelDispName}.org/cgi-bin/contigSrt?project_id=${wdkModelDispName}&ids=${seqIdParam.default}%20(14..700)">
  http://${wdkModelDispName}.org/cgi-bin/contigSrt?project_id=${wdkModelDispName}&ids=${seqIdParam.default}%20(14..700)</a>
</li>
<li>For multiple sequences use the line feed character (%0A) as separator (comma or semicolon or carriage return do not work):
<br><a target="_blank" href="http://${wdkModelDispName}.org/cgi-bin/contigSrt?project_id=${wdkModelDispName}&ids=${seqIdParam.default}%20(14..700)%0A${seqIdParam.default}%20(800..900)">
http://${wdkModelDispName}.org/cgi-bin/contigSrt?project_id=${wdkModelDispName}&ids=${seqIdParam.default}%20(14..700)%0A${seqIdParam.default}%20(800..900)</a>
</li>
</ul>

For gene related regions:
<ul>
<li>To download one sequence, please use one of the following URL format:
<br><a target="_blank" href="http://${wdkModelDispName}.org/cgi-bin/geneSrt?project_id=${wdkModelDispName}&ids=${geneIdParam.default}&type=genomic&upstreamAnchor=Start&upstreamSign=minus&upstreamOffset=10&downstreamAnchor=End&downstreamSign=plus&downstreamOffset=2000">http://${wdkModelDispName}.org/cgi-bin/geneSrt?project_id=${wdkModelDispName}&ids=${geneIdParam.default}&type=genomic&upstreamAnchor=Start&upstreamSign=minus&upstreamOffset=10&downstreamAnchor=End&downstreamSign=plus&downstreamOffset=2000</a>
</li>
</ul>

<br><br>

<hr>

<h2>WADLs: how to generate web service URLs</h2>
Click on a search below to access its <a href="http://www.w3.org/Submission/wadl/">WADL</a> (Web Application Description Language). 
<br>

<span style="position:relative;left:${margin};">
<ul class="cirbulletlist">
<li>A WADL is an XML document that describes in detail how to form a URL to call the search as a web service request. For more details go to <a style="font-size:120%;font-weight:bold" href="#moreWADL">How to read a WADL</a> at the bottom of this page.</li>
<li>Note: some browsers (e.g.: Safari) do not know how to render an XML file properly (you will see a page full of terms with no structure).</li>
<li>To construct the URL in the example above, you would check the <a href="/webservices/GeneQuestions/GenesByMolecularWeight.wadl">Molecular Weight</a> WADL located below under <b>Protein Attributes</b></li>
</ul>
</span>


<!-- show all questionSets in model, driven by categories as in menubar -->
<imp:drop_down_QG2 from="webservices" />

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


</imp:pageFrame>
