<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%-- get wdkXmlAnswer saved in request scope --%>
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set value="${wdkModel.displayName}" var="project"/>






<imp:header  title="${project} :: Gene Metrics"
                 banner="${project} Gene Metrics"
                 parentDivision="${project}"
                 parentUrl="/home.jsp"
                 divisionName="allSites"
                 division="geneMetrics"/>


<script type="text/javascript"> 
$(document).ready( function() {
        var oTable = $('#gene-metrics').dataTable(
                {
		"bSort": false,
       		"sScrollX": "100%",
        	"bScrollCollapse": true,
                "bPaginate": false,
                "oLanguage": {
                        "sZeroRecords": "There are no organisms that include your keyword in this table.",
                        "sSearch": "Enter keyword to filter rows:</>",
                        },
                }  
        );
        new FixedColumns( oTable , {
		"iLeftWidth": 150
	} );
} );
</script>


<c:set var="orgWidth" value=""/>  <%-- 4% --%>
<c:set var="ncbiTaxPage" value="http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=237895&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock"/>


<c:choose>
<c:when test="${project eq 'FungiDB'}" >
	<c:set var="siteTitle" value="FungiDB"/>
</c:when>
<c:otherwise>
	<c:set var="siteTitle" value="EuPathDB"/>
</c:otherwise>
</c:choose>


<table width="100%">
<tr><td><h2>${siteTitle} Gene Metrics</h2></td>
    <td align="right"><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GenomeDataType"/>">${siteTitle} Genomes and Data Types >>></a></td>
</tr>

<c:choose>
<c:when test="${project eq 'FungiDB'}" >

<tr><td colspan="2">
FungiDB is an integrated genomic and functional genomic database for the kingdom Fungi. In its first iteration (released in early 2011), FungiDB contains the genomes of <b>18 Fungi covering 17 species</b> (see below). FungiDB integrates whole genome sequence and annotation and will expand to include experimental data and environmental isolate sequences provided by the community of researchers. The database includes comparative genomics, analysis of gene expression, and supplemental bioinformatics analyses and a web interface for data-mining.
<br><br>
<i style="color:#b45f04">(Please mouse over gene metrics for a definition; mouse over acronyms for the organism full name.)</i><br>
</td></tr>

</c:when>
<c:otherwise>

<tr><td colspan="2">The EuPathDB <a href="http://pathogenportal.org"><b>Bioinformatics Resource Center (BRC)</b></a> designs, develops and maintains the <a href="http://eupathdb.org">EuPathDB</a>,  <a href="http://amoebadb.org">AmoebaDB</a>, <a href="http://cryptodb.org">CryptoDB</a>, <a href="http://giardiadb.org">GiardiaDB</a>,  <a href="http://microsporidiadb.org">MicrosporidiaDB</a>, <a href="http://piroplasmadb.org">PiroplasmaDB</a>, <a href="http://plasmodb.org">PlasmoDB</a>, <a href="http://toxodb.org">ToxoDB</a>, <a href="http://trichdb.org">TrichDB</a> and <a href="http://tritrypdb.org">TriTrypDB</a> websites. <br><br>
The Gene Metrics table summarizes the number of genes for the organisms currently available in EuPathDB, including their available evidence. 
 <br><br>
<i style="color:#b45f04">(Please mouse over gene metrics for a definition; mouse over acronyms for the organism full name.)</i><br>
</td></tr>

</c:otherwise>
</c:choose>

</table>


<!-- <div style="overflow-x:auto">  -->
<table  id="gene-metrics" class="mytableStyle" width="100%">
<thead>

<c:choose>
  <c:when test='${xmlAnswer.resultSize == 0}'>
    <tr><td>Not available.</td></tr></table>
  </c:when>
  <c:otherwise>

<%-- Organisms/species grouped by websites, alphabetically in each group --%>
<c:set var="bgcolor" value="#efefef"/> 

<c:choose>
<c:when test="${project eq 'FungiDB'}" >

<tr class="mythStyle">
    <td style="background-color:white;border-right:3px solid grey;border-top:0px none;border-left:0 none;"></td>
    <td style="border-right:3px solid grey" colspan="8" class="mythStyle">Eurotiomycetes; Ascomycota</td>
    <td style="border-right:3px solid grey" colspan="5" class="mythStyle">Sordariomycetes; Ascomycota</td>
    <td style="border-right:3px solid grey" colspan="2" class="mythStyle">Saccharomycotina; Ascomycota</td>
    <td style="border-right:3px solid grey" colspan="2" class="mythStyle">Basidiomycota</td>
    <td class="mythStyle">Mucormycotina; Zygomycota</td>
</tr>
<tr class="mythStyle" style="cursor:pointer">
    <td  style="border-right:3px solid grey" class="mythStyle" title="">Gene Metric</td>
    <td class="mythStyle" title="Aspergillus clavatus NRRL 1"><i>Ac</i></td>
    <td class="mythStyle" title="Aspergillus flavus NRRL 3357"><i>Afl</i></td>
    <td class="mythStyle" title="Aspergillus fumigatus Af293"><i>Afu</i></td>
    <td class="mythStyle" title="Aspergillus nidulans FGSC A4"><i>Anid</i></td>
    <td class="mythStyle" title="Aspergillus niger ATCC 1015"><i>Anig</i></td>
    <td class="mythStyle" title="Aspergillus terreus NIH 2624"><i>At</i></td>
    <td class="mythStyle" title="Coccidioides immitis H538.4"><i>CiH</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Coccidioides immitis RS"><i>CiRS</i></td>
    <td class="mythStyle" title="Fusarium graminearum PH-1 (NRRL 31084)"><i>Fg</i></td>
    <td class="mythStyle" title="Fusarium oxysporum f.sp.lycopersici  4287"><i>Fo</i></td>
    <td class="mythStyle" title="Gibberella moniliformis "><i>Gm</i></td>
    <td class="mythStyle" title="Magnaporthe oryzae 70-15"><i>Mo</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Neurospora crassa OR74A"><i>Nc</i></td>
    <td class="mythStyle" title="Candida albicans SC5314"><i>Ca</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Saccharomyces cerevisiae S288c"><i>Sc</i></td>
    <td class="mythStyle" title="Cryptococcus neoformans var.grubii H99"><i>Cn</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Puccinia graminis f.sp.tritici CRL 75"><i>Pg</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Rhizopus oryzae RA 99-880"><i>Ro</i></td>
</tr>


 <c:forEach items="${xmlAnswer.recordInstances}" var="record">

	 <c:set var="Metric_Type" value="${record.attributesMap['Metric_Type']}"/>
	 <c:set var="Ac" value="${record.attributesMap['Aspergillus_clavatus']}"/>
	 <c:set var="Afl" value="${record.attributesMap['Aspergillus_flavus']}"/>
	 <c:set var="Afu" value="${record.attributesMap['Aspergillus_fumigatus']}"/>
	 <c:set var="Anid" value="${record.attributesMap['Aspergillus_nidulans']}"/>
 	 <c:set var="Anig" value="${record.attributesMap['Aspergillus_niger']}"/>
	 <c:set var="At" value="${record.attributesMap['Aspergillus_terreus']}"/>
	 <c:set var="CiH" value="${record.attributesMap['Coccidioides_immitis_H538_4']}"/>
	 <c:set var="CiRS" value="${record.attributesMap['Coccidioides_immitis_RS']}"/>
	 <c:set var="Fg" value="${record.attributesMap['Fusarium_graminearum']}"/>
	 <c:set var="Fo" value="${record.attributesMap['Fusarium_oxysporum']}"/>
         <c:set var="Gm" value="${record.attributesMap['Gibberella_moniliformis']}"/>
         <c:set var="Mo" value="${record.attributesMap['Magnaporthe_oryzae']}"/>
         <c:set var="Nc" value="${record.attributesMap['Neurospora_crassa']}"/>
         <c:set var="Ca" value="${record.attributesMap['Candida_albicans']}"/>
	 <c:set var="Sc" value="${record.attributesMap['Saccharomyces_cerevisiae']}"/>
	 <c:set var="Cn" value="${record.attributesMap['Cryptococcus_neoformans']}"/>
	 <c:set var="Pg" value="${record.attributesMap['Puccinia_graminis']}"/>
	 <c:set var="Ro" value="${record.attributesMap['Rhizopus_oryzae']}"/>



<tr class="mytdStyle">
    <td style="border-right:3px solid grey;cursor:pointer" class="mytdStyle" align="left" title="${record.attributesMap['Description']}">${Metric_Type}</td>
    <td class="mytdStyle" align="right">${Ac}</td>
    <td class="mytdStyle" align="right">${Afl}</td>
    <td class="mytdStyle" align="right">${Afu}</td>
    <td class="mytdStyle" align="right">${Anid}</td>
    <td class="mytdStyle" align="right">${Anig}</td>
    <td class="mytdStyle" align="right">${At}</td>
    <td class="mytdStyle" align="right">${CiH}</td>
    <td style="border-right:3px solid grey"  class="mytdStyle" align="right">${CiRS}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Fg}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Fo}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Gm}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Mo}</td>
    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Nc}</td>
    <td class="mytdStyle" align="right">${Ca}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Sc}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Cn}</td>
    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Pg}</td>
    <td class="mytdStyle" align="right">${Ro}</td>
</tr>

  </c:forEach>

</c:when>
<c:otherwise>    <!------------- ALL PROJECTS BUT FUNGI -------------------->

<tr class="mythStyle">
    <th style="background-color:white;border-right:3px solid grey;border-top:0px none;border-left:0 none;"></th>
    <th style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://amoebadb.org">AmoebaDB</a></th>
    <th style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://cryptodb.org">CryptoDB</a></th>
    <th style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://giardiadb.org">GiardiaDB</a></th>
    <th style="border-right:3px solid grey" colspan="12" class="mythStyle"><a href="http://microsporidiadb.org">MicrosporidiaDB</a></th>
    <th style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://piroplasmadb.org">PiroplasmaDB</a></th>
    <th style="border-right:3px solid grey" colspan="7" class="mythStyle"><a href="http://plasmodb.org">PlasmoDB</a></th>
    <th style="border-right:3px solid grey" colspan="6" class="mythStyle"><a href="http://toxodb.org">ToxoDB</a></th>
    <th style="border-right:3px solid grey" colspan="1" class="mythStyle"><a href="http://trichdb.org">TrichDB</a></th>
    <th colspan="13" class="mythStyle"><a href="http://tritrypdb.org">TriTrypDB</a></th>
</tr>

<tr class="mythStyle">
    <th  style="border-right:3px solid grey" class="mythStyle" title="">Gene Metric</th>
    <th class="mythStyle" title="Entamoeba dispar SAW760, AmoebaDB"><i>Edi</i></th>
    <th class="mythStyle" title="Entamoeba histolytica HM-1:IMSS, AmoebaDB"><i>Ehi</i></th>
    <th  style="border-right:3px solid grey"class="mythStyle" title="Entamoeba invadens IP1, AmoebaDB"><i>EinI</i></th>

    <th class="mythStyle" title="Cryptosporidium hominis TU502, CryptoDB"><i>Cho</i></th>
    <th class="mythStyle" title="Cryptosporidium muris RN66, CryptoDB"  ><i>Cmu</i></th>
    <th  style="border-right:3px solid grey" class="mythStyle" title="Cryptosporidium parvum Iowa II, CryptoDB" ><i>Cpa</i></th>

    <th class="mythStyle" title="Giardia Assemblage A isolate WB, GiardiaDB" ><i>GA*</i></th>
    <th class="mythStyle" title="Giardia Assemblage B isolate GS, GiardiaDB" ><i>GB</i></th>
    <th  style="border-right:3px solid grey" class="mythStyle" title="Giardia_Assemblage_E_isolate_P15, GiardiaDB" ><i>GC</i></th>

    <th class="mythStyle" title="Enterocytozoon bieneusi H348, MicrosporidiaDB"><i>Ebi</i></th>

    <th class="mythStyle" title="Encephalitozoon cuniculi EC1, MicrosporidiaDB"><i>Ecu1</i></th>
    <th class="mythStyle" title="Encephalitozoon cuniculi EC2, MicrosporidiaDB"><i>Ecu2</i></th>
    <th class="mythStyle" title="Encephalitozoon cuniculi EC3, MicrosporidiaDB"><i>Ecu3</i></th>
    <th class="mythStyle" title="Encephalitozoon cuniculi GB-M1, MicrosporidiaDB"><i>EcuG</i></th>

    <th class="mythStyle" title="Encephalitozoon hellem ATCC 50504, MicrosporidiaDB"><i>EheA</i></th>
    <th class="mythStyle" title="Encephalitozoon hellem Swiss, MicrosporidiaDB"><i>EheS</i></th>

    <th class="mythStyle" title="Encephalitozoon intestinalis ATCC 50506, MicrosporidiaDB"><i>EinA</i></th>
  
    <th class="mythStyle" title="Nematocida parisii ERTm1, MicrosporidiaDB"><i>Npa1</i></th>
    <th class="mythStyle" title="Nematocida parisii ERTm3, MicrosporidiaDB"><i>Npa3</i></th>
    <th class="mythStyle" title="Nematocida sp. 1 ERTm2, MicrosporidiaDB"><i>Nsp2</i></th>

    <th  style="border-right:3px solid grey"  class="mythStyle" title="Nosema cerenae BRL01, MicrosporidiaDB"><i>Nce</i></th>

    <th class="mythStyle" title="Babesia bovis T2Bo, PiroplasmaDB"><i>Bbo</i></th>
    <th class="mythStyle" title="Theileria annulata, PiroplasmaDB"><i>Tan</i></th>
    <th style="border-right:3px solid grey" class="mythStyle" title="Theileria parva, PiroplasmaDB"><i>Tpa</i></th>

    <th class="mythStyle" title="Plasmodium berghei, PlasmoDB"><i>Pbe</i></th>
    <th class="mythStyle" title="Plasmodium chabaudi, PlasmoDB"><i>Pch</i></th>
    <th class="mythStyle" title="Plasmodium falciparum 3D7, PlasmoDB"><i>Pfa3</i></th>
    <th class="mythStyle" title="Plasmodium falciparum IT, PlasmoDB"><i>PfaI</i></th>
    <th class="mythStyle" title="Plasmodium knowlesi, PlasmoDB"><i>Pko</i></th>
    <th class="mythStyle" title="Plasmodium vivax, PlasmoDB"><i>Pvi</i></th>
    <th  style="border-right:3px solid grey" class="mythStyle" title="Plasmodium yoelii, PlasmoDB"><i>Pyo</i></th>


    <th class="mythStyle" title="Eimeria tenella str. Houghton, ToxoDB"><i>Ete</i></th>
    <th class="mythStyle" title="Neospora caninum, ToxoDB"><i>Nca</i></th>
    <th class="mythStyle" title="Toxoplasma gondii GT1, ToxoDB"><i>TgoG</i></th>
    <th class="mythStyle" title="Toxoplasma gondii ME49, ToxoDB"><i>TgoM</i></th>
    <th class="mythStyle" title="Toxoplasma gondii VEG, ToxoDB"><i>TgoV</i></th>
    <th  style="border-right:3px solid grey" class="mythStyle" title="Toxoplasma gondii RH"><i>TgoR</i></th>

    <th  style="border-right:3px solid grey" class="mythStyle" title="Trichomonas vaginalis,TrichDB"><i>Tva</i></th>

    <th class="mythStyle" title="Leishmania braziliensis, TriTrypDB"><i>Lbr</i></th>
    <th class="mythStyle" title="Leishmania infantum, TriTrypDB"><i>Lin</i></th>
    <th class="mythStyle" title="Leishmania major strain Friedlin, TriTrypDB"><i>Lma</i></th>
    <th class="mythStyle" title="Leishmania mexicana, TriTrypDB"><i>Lme</i></th>
    <th class="mythStyle" title="Leishmania tarentolae Parrot-TarII, TriTrypDB"><i>Lta</i></th>
    <th class="mythStyle" title="Trypanosoma brucei 927, TriTrypDB"><i>Tbr9</i></th>
    <th class="mythStyle" title="Trypanosoma brucei 427, TriTrypDB"><i>Tbr4</i></th>
    <th class="mythStyle" title="Trypanosoma brucei gambiense, TriTrypDB"><i>Tbrg</i></th>
    <th class="mythStyle" title="Trypanosoma congolense, TriTrypDB"><i>Tco</i></th>

    <th class="mythStyle" title="Trypanosoma cruzi CL Brener Esmeraldo-like, TriTrypDB"><i>TcrE</i></th>
    <th class="mythStyle" title="Trypanosoma cruzi CL Brener Non-Esmeraldo-like, TriTrypDB"><i>TcrN</i></th>
    <th class="mythStyle" title="Trypanosoma cruzi strain CL Brener, TriTrypDB"><i>TcrB</i></th>
   <th class="mythStyle" title="Trypanosoma vivax, TriTrypDB"><i>Tvi</i></th>
</tr>
</thead>

<tbody>
  <c:forEach items="${xmlAnswer.recordInstances}" var="record">

	 <c:set var="Metric_Type" value="${record.attributesMap['Metric_Type']}"/>
          <c:set var="Bbo" value="${record.attributesMap['Babesia bovis T2Bo']}"/>

          <c:set var="Cho" value="${record.attributesMap['Cryptosporidium hominis TU502']}"/>
          <c:set var="Cmu" value="${record.attributesMap['Cryptosporidium muris RN66']}"/>
          <c:set var="Cpa" value="${record.attributesMap['Cryptosporidium parvum Iowa II']}"/>

          <c:set var="Ete" value="${record.attributesMap['Eimeria tenella str. Houghton']}"/>

          <c:set var="Ebi" value="${record.attributesMap['Enterocytozoon bieneusi H348']}"/>

          <c:set var="Ecu1" value="${record.attributesMap['Encephalitozoon cuniculi EC1']}"/>
          <c:set var="Ecu2" value="${record.attributesMap['Encephalitozoon cuniculi EC2']}"/>
          <c:set var="Ecu3" value="${record.attributesMap['Encephalitozoon cuniculi EC3']}"/>
          <c:set var="EcuG" value="${record.attributesMap['Encephalitozoon cuniculi GB-M1']}"/>

          <c:set var="EheA" value="${record.attributesMap['Encephalitozoon hellem ATCC 50504']}"/>
          <c:set var="EheS" value="${record.attributesMap['Encephalitozoon hellem Swiss']}"/>

          <c:set var="EinA" value="${record.attributesMap['Encephalitozoon intestinalis ATCC 50506']}"/>

          <c:set var="Edi" value="${record.attributesMap['Entamoeba dispar SAW760']}"/>
          <c:set var="Ehi" value="${record.attributesMap['Entamoeba histolytica HM-1:IMSS']}"/>
          <c:set var="EinI" value="${record.attributesMap['Entamoeba invadens IP1']}"/>

          <c:set var="GA" value="${record.attributesMap['Giardia Assemblage A isolate WB']}"/>
          <c:set var="GB" value="${record.attributesMap['Giardia Assemblage B isolate GS']}"/>
          <c:set var="GE" value="${record.attributesMap['Giardia Assemblage E isolate P15']}"/>

          <c:set var="Lbr" value="${record.attributesMap['Leishmania braziliensis']}"/>
          <c:set var="Lin" value="${record.attributesMap['Leishmania infantum']}"/>
          <c:set var="Lma" value="${record.attributesMap['Leishmania major strain Friedlin']}"/>
          <c:set var="Lme" value="${record.attributesMap['Leishmania mexicana']}"/>
          <c:set var="Lta" value="${record.attributesMap['Leishmania tarentolae Parrot-TarII']}"/>

          <c:set var="Npa1" value="${record.attributesMap['Nematocida parisii ERTm1']}"/>
          <c:set var="Npa3" value="${record.attributesMap['Nematocida parisii ERTm3']}"/>
          <c:set var="Nsp2" value="${record.attributesMap['Nematocida sp. 1 ERTm2']}"/>

          <c:set var="Nca" value="${record.attributesMap['Neospora caninum']}"/>

          <c:set var="Nce" value="${record.attributesMap['Nosema ceranae BRL01']}"/>

          <c:set var="Pbe" value="${record.attributesMap['Plasmodium berghei ANKA']}"/>
          <c:set var="Pch" value="${record.attributesMap['Plasmodium chabaudi chabaudi']}"/>
          <c:set var="Pfa3" value="${record.attributesMap['Plasmodium falciparum 3D7']}"/>
          <c:set var="PfaI" value="${record.attributesMap['Plasmodium falciparum IT']}"/>
          <c:set var="Pko" value="${record.attributesMap['Plasmodium knowlesi strain H']}"/>
          <c:set var="Pvi" value="${record.attributesMap['Plasmodium vivax SaI-1']}"/>
          <c:set var="Pyo" value="${record.attributesMap['Plasmodium yoelii yoelii 17XNL']}"/>

          <c:set var="Tan" value="${record.attributesMap['Theileria annulata strain Ankara']}"/>
          <c:set var="Tpa" value="${record.attributesMap['Theileria parva strain Muguga']}"/>

          <c:set var="TgoG" value="${record.attributesMap['Toxoplasma gondii GT1']}"/>
          <c:set var="TgoM" value="${record.attributesMap['Toxoplasma gondii ME49']}"/>
          <c:set var="TgoR" value="${record.attributesMap['Toxoplasma gondii RH']}"/>
          <c:set var="TgoV" value="${record.attributesMap['Toxoplasma gondii VEG']}"/>

          <c:set var="Tva" value="${record.attributesMap['Trichomonas vaginalis G3']}"/>

          <c:set var="Tbr4" value="${record.attributesMap['Trypanosoma brucei Lister strain 427']}"/>
          <c:set var="Tbr9" value="${record.attributesMap['Trypanosoma brucei TREU927']}"/>
          <c:set var="Tbrg" value="${record.attributesMap['Trypanosoma brucei gambiense']}"/>
          <c:set var="Tco" value="${record.attributesMap['Trypanosoma congolense']}"/>
          <c:set var="TcrE" value="${record.attributesMap['Trypanosoma cruzi CL Brener Esmeraldo-like']}"/>
          <c:set var="TcrN" value="${record.attributesMap['Trypanosoma cruzi CL Brener Non-Esmeraldo-like']}"/>
          <c:set var="TcrB" value="${record.attributesMap['Trypanosoma cruzi strain CL Brener']}"/>
          <c:set var="Tvi" value="${record.attributesMap['Trypanosoma vivax']}"/>



<tr class="mytdStyle">
    <td style="border-right:3px solid grey" class="mytdStyle" align="left" title="${record.attributesMap['Description']}">${Metric_Type}</td>
    <td class="mytdStyle" align="right">${Edi}</td>
    <td class="mytdStyle" align="right">${Ehi}</td>
    <td style="border-right:3px solid grey"  class="mytdStyle" align="right">${EinI}</td>

    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Cho}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Cmu}</td>
    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Cpa}</td>

    <td class="mytdStyle" align="right">${GA}</td>
    <td class="mytdStyle" align="right">${GB}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${GE}</td>

    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ebi}</td>

    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ecu1}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ecu2}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ecu3}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${EcuG}</td>

    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${EheA}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${EheS}</td>

    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${EinA}</td>

    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Npa1}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Npa3}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Nsp2}</td>

    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Nce}</td>

    <td class="mytdStyle" align="right">${Bbo}</td>
    <td class="mytdStyle" align="right">${Tan}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Tpa}</td>

    <td class="mytdStyle" align="right">${Pbe}</td>
    <td class="mytdStyle" align="right">${Pch}</td>
    <td class="mytdStyle" align="right">${Pfa3}</td>
    <td class="mytdStyle" align="right">${PfaI}</td>
    <td class="mytdStyle" align="right">${Pko}</td>    
    <td class="mytdStyle" align="right">${Pvi}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Pyo}</td>


    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ete}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Nca}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${TgoG}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${TgoM}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${TgoV}</td>
    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${TgoR}</td>

    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Tva}</td>

    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Lbr}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Lin}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Lma}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Lme}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Lta}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tbr9}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tbr4}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tbrg}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tco}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${TcrE}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${TcrN}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${TcrB}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tvi}</td>
</tr>
 
  </c:forEach>

</c:otherwise>
</c:choose>

  </tbody>
  </table>
<!-- </div> -->


<c:if test="${project ne 'FungiDB'}" >
<table width="100%">
<tr><td>
<font size="-1"><b>Babesia</b>: Bb, <i>B. bovis</i>; <b>Cryptosporidium</b>: Ch, <i>C. hominis</i>; Cm, <i>C. muris</i>; Cp, <i>C. parvum</i>;  <b>Eimeria</b>: Et, <i>E. tenella</i>; <b>Encephalitozoon</b>: Ec, <i>E. cuniculi</i>; Eint, <i>E. intestinalis</i>; Ehel, <i>E. hellem</i>; <b>Entamoeba</b>: Ed, <i>E. dispar</i>; Eh, <i>E. histolytica</i>; Einv, <i>E. invadens</i>; <b>Enterocytozoon</b>: Eb, <i>E. bieneusi</i>; <b>Giardia</b> GA, <i>G.Assemblage_A_isolate_WB</i>; GB, <i>G.Assemblage_B_isolate_GS</i>; GE, <i>G.Assemblage_E_isolate_P15</i>; <b>Leishmania</b>: Lb, <i>L. braziliensis</i>; Li, <i>L. infantum</i>; Lma, <i>L. major</i>; Lme, <i>L. mexicana</i>; <b>Neospora</b>: Nc, <i>N. caninum</i>; <b>Nosema</b>: Ncer, <i>N. cerenae</i>; <b>Plasmodium</b>: Pb, <i>P. berghei</i>; Pc, <i>P. chabaudi</i>; Pf, <i>P. falciparum</i>; Pk, <i>P. knowlesi</i>; Pv, <i>P. vivax</i>; Py, <i>P. yoelii</i>; <b>Theileria</b>: Ta, <i>T. annulata</i>; Tp, <i>T. parva</i>; <b>Toxoplasma</b>: Tg, <i>T. gondii</i>; <b>Trichomonas</b>: Tva, <i>T. vaginalis</i>; <b>Trypanosoma</b>: Tb, <i>T. brucei</i>; Tco, <i>T. congolense</i>; Tcr, <i>T. cruzi</i>; Tvi, <i>T. vivax</i>.</font><br>
</td></tr>
<br>
<tr><td colspan="10"><font size="-2"><hr>* In addition, <i>Giardia Assemblage A isolate WB</i> has 3766 deprecated genes that are not included in the official gene count.</font></td></tr>
</table>
</c:if>

  </c:otherwise>
</c:choose>

<imp:footer/>
