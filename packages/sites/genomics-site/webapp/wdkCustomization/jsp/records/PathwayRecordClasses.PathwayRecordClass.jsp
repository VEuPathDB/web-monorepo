<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>

<%/* get wdkRecord from proper scope */%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="recordName" value="${wdkRecord.recordClass.displayName}" />
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />
<c:set var="projectIdLowerCase" value="${fn:toLowerCase(projectId)}"/>
<c:set var="pathwayName" value="${attrs['description'].value}" />
<c:set var="pathwaySource" value="${attrs['pathway_source'].value}" />

<imp:pageFrame title="${wdkModel.displayName} : Met Pathway ${id}"
             refer="recordPage"
             banner="Met Pathway ${id}"
             divisionName="${recordName} Record"
             division="queries_tools">

<c:choose>
  <c:when test="${!wdkRecord.validRecord}">
    <h2 style="text-align:center;color:#CC0000;">The ${recordName} '${id}' was not found.</h2>
  </c:when>
<c:otherwise>

<%-- quick tool-box for the record --%>
<imp:recordToolbox />


<div class="h2center" style="font-size:160%">
 	Metabolic Pathway
</div>

<div class="h3center" style="font-size:130%">
	${id} -  ${pathwayName}<br>
	<imp:recordPageBasketIcon />
</div>


<%--#############################################################--%>

<c:set var="append" value="" />

<c:set var="attr" value="${attrs['overview']}" />
<imp:panel 
    displayName="${attr.displayName}"
    content="${attr.value}" 
    attribute="${attr.name}"/>

<br>
<%--
<br>
<div align="center">
<img align="middle" src="/cgi-bin/colorKEGGmap.pl?model=${projectId}&pathway=${id}" usemap="#pathwayMap"/>
<imp:pathwayMap projectId="${projectId}" pathway="${id}" />
</div>
<br>

<iframe  src="<c:url value='/pathway-dynamic-view.jsp?model=${projectId}&pathway=${id}' />"  width=100% height=800 align=middle>
</iframe> 
--%>


<!-- CYTOSCAPE start-->
<!-- Flash embedding utility (needed to embed Cytoscape Web) -->
<imp:script type="text/javascript" src="js/AC_OETags.min.js"/>
        
<!-- Cytoscape Web JS API (needed to reference org.cytoscapeweb.Visualization) -->
<imp:script type="text/javascript" src="js/cytoscapeweb.min.js"/>

<imp:script src="wdkCustomization/js/records/PathwayRecordClasses.PathwayRecordClass.js"/>

<script type="text/javascript">
  // get xgmml and draw the visualization
  $(function() {
    drawVisualization("${id}", "${pathwaySource}");
  });
</script>        

    <style>
            /* The Cytoscape Web container must have its dimensions set. */
            html, body { height: 100%; width: 100%; padding: 0; margin: 0; }
            #cytoscapeweb { width: 100%; height: 100%; padding-bottom: 26px; }
            .link { text-decoration: underline; color: #0b94b1; cursor: pointer; }
        </style>

 <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
 <style>
  #draggable {z-index:10000;margin-left:18px;position:absolute;margin-top: 400px; background-color:white;border:1px solid black; border-radius:5px; width: 350px; padding: 0.5em; }
  #cytoscapeweb { border:1px solid black; border-radius:5px;  }
  #vis-menu {
    background: -webkit-linear-gradient(rgb(191,191,191), rgb(121,121,121));
    background: -o-linear-gradient(rgb(191,191,191), rgb(121,121,121));
    background: -moz-linear-gradient(rgb(191,191,191), rgb(121,121,121));
    background: linear-gradient(rgb(191,191,191), rgb(121,121,121));
    background-color: rgb(171,171,171);
    margin-bottom: inherit;
    width: auto;
  }
  #vis-menu li {
    z-index: 96;
  }
</style>

<script>
$(function() {
$( "#draggable" ).draggable({ iframeFix: '#cytoscapeweb embed' });
});
</script>


<div id="draggable" style="">
  <p>Click on nodes for more info.  
<BR>Nodes highlighted in <font color="red">red</font> are EC numbers that we have mapped to at least one gene.
<BR>The nodes, as well as this info box, can be repositioned by dragging.
<br />
</div>

<ul id="vis-menu" class="sf-menu">
    <li><a href="#">File
    <!--imp:image title="NOTE: Saving of some XGMML or image files is not working at present. We apologize, and will try to fix this issue soon."  src="wdk/images/question.png" /-->
    </a>
        <ul>
          <!-- li> <a href="javascript:exportVisualization('xgmml', '${id}')">Save XGMML (XML)</a></li -->
          <!-- li> <a href="javascript:exportVisualization('png', '${id}')">Save image (PNG)</a></li -->
          <li> <a href="/common/downloads/Current_Release/pathwayFiles/${id}.xgmml">Get Download XGMML (XML) file</a></li>
        </ul>
    </li>
    <li><a href="javascript:void(0)">Layout
    <imp:image title="Choose a Layout for the Pathway Map"  src="wdk/images/question.png" /></a>
        <ul>
  <c:if test="${pathwaySource eq 'KEGG'}"> 
            <li><a  href="javascript:void(0)" onclick="changeLayout('Preset')">Kegg</a></li>  
</c:if>
            <li><a  href="javascript:void(0)" onclick="changeLayout('ForceDirected')">ForceDirected</a></li>
            <li><a href="javascript:void(0)" onclick="changeLayout('Tree')">Tree</a></li>
            <li><a href="javascript:void(0)" onclick="changeLayout('Circle')">Circle</a></li>
            <li><a href="javascript:void(0)" onclick="changeLayout('Radial')">Radial</a></li>
        </ul>
    </li>

    <li><a href="#">Paint Experiment
    <imp:image title="Choose an Experiment, to display its (average) expression profile on enzymes in the Map"  src="wdk/images/question.png" /></a>
        <ul>
            <li><a href="javascript:void(0)" onclick="changeExperiment('')">None</a></li>
<c:set value="${wdkRecord.tables['PathwayGraphs']}" var="pathwayGraphs"/>
<c:forEach var="row" items="${pathwayGraphs}">
            <li><a href="javascript:void(0)" onclick="changeExperiment('${row['internal'].value}','${row['xaxis_description'].value}')">${row['display_name'].value}</a></li>
</c:forEach>
        </ul>
    </li>

    <li><a href="#">Paint Genera
    <imp:image title="Choose a Genera set, to display the presence or absence of these for all enzymes in the Map "  src="wdk/images/question.png" /></a>
        <ul>
          <li><a href="javascript:void(0)" onclick="changeExperiment('')">None</a></li>


	  <c:if test="${projectId eq 'AmoebaDB'}"> 
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Acanthamoeba,Entamoeba,Naegleria,Vitrella,Chromera,Homo,Mus', 'genus', '1')">Acanthamoeba,Entamoeba,Human,Mouse</a></li>
	  </c:if>

	  <%-- Apicomplexa ---%>
	  <c:if test="${projectId eq 'CryptoDB' || projectId eq 'PiroplasmaDB' || projectId eq 'PlasmoDB' || projectId eq 'ToxoDB'}"> 
	    <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Babesia,Cryptosporidium,Eimeria,Gregarina,Neospora,Plasmodium,Theileria,Toxoplasma', 'genus', '1')">Apicomplexa</a></li>
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Cryptosporidium,Plasmodium,Toxoplasma,Homo,Mus', 'genus','1')">Cryp,Toxo,Plas,Human,Mouse</a></li>
	  </c:if>


	  <c:if test="${projectId eq 'GiardiaDB'}"> 
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Giardia,Spironucleus,Homo,Mus', 'genus', '1')">Giardia,Spironucleus,Human,Mouse</a></li>
	  </c:if>

	  <c:if test="${projectId eq 'FungiDB'}"> 
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Albugo,Aphanomyces,Aspergillus,Coccidioides,Fusarium,Neurospora,Phytophthora,Pythium,Saprolegnia,Talaromyces,Homo,Mus', 'genus', '1')">Albugo,Aphanomyces,Aspergillus,Coccidioides,Fusarium,Neurospora,Phytophthora,Pythium,Saprolegnia,Talaromyces,Human,Mouse</a></li>
	  </c:if>

	  <c:if test="${projectId eq 'MicrosporidiaDB'}"> 
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Anncaliia,Edhazardia,Encephalitozoon,Enterocytozoon,Nematocida,Nosema,Spraguea,Trachipleistophora,Vavraia,Vittaforma,Homo,Mus', 'genus', '1')">Microsporidia,Human,Mouse</a></li>
	  </c:if>

	  <c:if test="${projectId eq 'SchistoDB'}"> 
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Schistosoma,Homo,Mus', 'genus', '1')">Schistosoma,Human,Mouse</a></li>
	  </c:if>

	  <c:if test="${projectId eq 'TrichDB'}"> 
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Trichomonas,Homo,Mus', 'genus', '1')">Trichomonas,Human,Mouse</a></li>
	  </c:if>

	  <c:if test="${projectId eq 'TriTrypDB'}"> 
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Crithidia,Leishmania,Trypanosoma,Homo,Mus', 'genus', '1')">Crithidia,Leishmania,Trypanosoma,Human,Mouse</a></li>
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Cryptosporidium,Plasmodium,Toxoplasma,Trypanosoma,Homo,Mus', 'genus','1')">Cryp,Toxo,Plas,Tryp,Human,Mouse</a></li>
	  </c:if>

	  <c:if test="${projectId eq 'HostDB'}"> 
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Acanthamoeba,Entamoeba,Naegleria,Vitrella,Chromera,Homo,Mus', 'genus', '1')">Acanthamoeba,Entamoeba,Human,Mouse</a></li>
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Giardia,Spironucleus,Homo,Mus', 'genus', '1')">Giardia,Spironucleus,Human,Mouse</a></li>
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Cryptosporidium,Plasmodium,Toxoplasma,Homo,Mus', 'genus','1')">Cryp,Toxo,Plas,Human,Mouse</a></li>
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Albugo,Aphanomyces,Aspergillus,Coccidioides,Fusarium,Neurospora,Phytophthora,Pythium,Saprolegnia,Talaromyces,Homo,Mus', 'genus', '1')">Albugo,Aphanomyces,Aspergillus,Coccidioides,Fusarium,Neurospora,Phytophthora,Pythium,Saprolegnia,Talaromyces,Human,Mouse</a></li>
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Anncaliia,Edhazardia,Encephalitozoon,Enterocytozoon,Nematocida,Nosema,Spraguea,Trachipleistophora,Vavraia,Vittaforma,Homo,Mus', 'genus', '1')">Microsporidia,Human,Mouse</a></li>
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Schistosoma,Homo,Mus', 'genus', '1')">Schistosoma,Human,Mouse</a></li>
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Trichomonas,Homo,Mus', 'genus', '1')">Trichomonas,Human,Mouse</a></li>
            <li><a href="javascript:void(0)" onclick="changeExperiment('type=PathwayGenera&project_id=${projectId}&sid=Crithidia,Leishmania,Trypanosoma,Homo,Mus', 'genus', '1')">Crithidia,Leishmania,Trypanosoma,Human,Mouse</a></li>    </li>
	  </c:if>
        </ul>
    </li>
</ul>

 <div align="right">
<a href="http://cytoscapeweb.cytoscape.org/">
    <img src="http://cytoscapeweb.cytoscape.org/img/logos/cw_s.png" alt="Cytosca
pe Web"/></a>
</div>

<div>
  <p><B>NOTE</B> Click on nodes for more info.  Nodes highlighted in <font color="red">red</font> are EC numbers that we have mapped to at least one gene. The nodes, as well as the info box, can be repositioned by dragging.
<br />
</div>


 <div id="cytoscapeweb">
  Cytoscape Web will replace the contents of this div with your graph.
 </div>

<br />
<!-- CYTOSCAPE end-->



<%-- Reaction Table ------------------------------------------------%>
  <imp:wdkTable tblName="CompoundsMetabolicPathways" isOpen="true"/>

</c:otherwise>
</c:choose>


  <c:set var="reference">
  <c:if test="${pathwaySource eq 'KEGG'}"> 
<br>Data for KEGG Metabolic Pathways were procured from the <a href="http://www.kegg.jp/">Kyoto Encyclopedia of Genes and Genomes (KEGG)</a>.
 </c:if>
  <c:if test="${pathwaySource eq 'TrypanoCyc'}"> 
<br>Data for TrypanoCyc Metabolic Pathways were procured from the <a href="http://vm-trypanocyc.toulouse.inra.fr/">TrypanoCyc</a>, a community annotated Pathway/Genome Database of </i>Trypanosoma brucei</i>.
 </c:if>
<br> This data was mapped to EC Numbers obtained from the official genome annotations of organisms, and to Compounds from the NCBI repository.<br>
<!-- The images and maps for KEGG pathways are copyright of <a href="http://www.kanehisa.jp/">Kanehisa Laboratories</a> (<a href="http://www.kegg.jp/kegg/legal.html">Copyright 1995-2012</a>).-->
Coloring of the pathway maps was performed in house with custom scripts and annotation information.<br>

  </c:set>
<br>
<br>

<imp:panel 
    displayName="Data Source"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>

<hr>


</imp:pageFrame>

