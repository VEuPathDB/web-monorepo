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

<imp:pageFrame  title="${project} :: Gene Metrics"
                 banner="${project} Gene Metrics"
                 parentDivision="${project}"
                 parentUrl="/home.jsp"
                 divisionName="allSites"
                 division="geneMetrics">


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
FungiDB is an integrated genomic and functional genomic database for the kingdom Fungi. This release of FungiDB (2.3) contains the genomes of <b>52 strains covering 48 species</b> (see below). FungiDB integrates whole genome sequence and annotation and will expand to include experimental data and environmental isolate sequences provided by the community of researchers. The database includes comparative genomics, analysis of gene expression, supplemental bioinformatics analyses, and a web interface for data-mining.
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
    <th style="background-color:white;border-right:3px solid grey;border-top:0px none;border-left:0 none;"></th>
    <th style="border-right:3px solid grey" colspan="15" class="mythStyle">Ascomycota; Eurotiomycetes</th>
    <th style="border-right:3px solid grey" colspan="2" class="mythStyle">Ascomycota; Leotiomycetes</th>
    <th style="border-right:3px solid grey" colspan="2" class="mythStyle">Ascomycota; Saccharomycetes</th>
    <th style="border-right:3px solid grey" colspan="3" class="mythStyle">Ascomycota; Schizosaccharomycetes</th>
    <th style="border-right:3px solid grey" colspan="9" class="mythStyle">Ascomycota; Sordariomycetes</th>
    <th style="border-right:3px solid grey" colspan="2" class="mythStyle">Basidiomycota; Agaricomycetes</th>
    <th style="border-right:3px solid grey" colspan="1" class="mythStyle">Basidiomycota; Pucciniomycetes</th>
    <th style="border-right:3px solid grey" colspan="6" class="mythStyle">Basidiomycota; Tremellomycetes</th>
    <th style="border-right:3px solid grey" colspan="3" class="mythStyle">Basidiomycota; Ustilaginomycetes</th>
    <th style="border-right:3px solid grey" colspan="1" class="mythStyle">Chytridiomycota; Chytridiomycetes</th>
    <th style="border-right:3px solid grey" colspan="2" class="mythStyle">Mucoromycotina; Mucorales</th>
    <th style="border-right:3px solid grey" colspan="5" class="mythStyle">Oomycetes; Peronosporales</th>
    <th colspan="1" class="mythStyle">Oomycetes; Pythiales</th>
  </tr>
  <tr class="mythStyle" style="cursor:pointer">
    <th style="border-right:3px solid grey" class="mythStyle" title="">Gene Metric</th>

    <th class="mythStyle" title="Ajellomyces capsulatus G186AR"><i>Acap</i></th>
    <th class="mythStyle" title="Ajellomyces capsulatus NAm1"><i>AcapN</i></th>
    <th class="mythStyle" title="Aspergillus carbonarius ITEM 5010"><i>Acar</i></th>
    <th class="mythStyle" title="Aspergillus clavatus NRRL 1"><i>Acla</i></th>
    <th class="mythStyle" title="Aspergillus flavus NRRL3357"><i>Afla</i></th>
    <th class="mythStyle" title="Aspergillus fumigatus Af293"><i>Afum</i></th>
    <th class="mythStyle" title="Aspergillus nidulans FGSC A4"><i>Anid</i></th>
    <th class="mythStyle" title="Aspergillus niger ATCC 1015"><i>Anig</i></th>
    <th class="mythStyle" title="Aspergillus terreus NIH2624"><i>Ater</i></th>
    <th class="mythStyle" title="Coccidioides immitis H538.4"><i>Cimm</i></th>
    <th class="mythStyle" title="Coccidioides immitis RS"><i>CimmR</i></th>
    <th class="mythStyle" title="Coccidioides posadasii C735 delta SOWgp"><i>Cpos</i></th>
    <th class="mythStyle" title="Neosartorya fischeri NRRL 181"><i>Nfis</i></th>
    <th class="mythStyle" title="Penicillium marneffei ATCC 18224"><i>Pmar</i></th>
    <th style="border-right:3px solid grey" class="mythStyle" title="Talaromyces stipitatus ATCC 10500"><i>Tsti</i></th>

    <th class="mythStyle" title="Botryotinia fuckeliana B05.10"><i>Bfuc</i></th>
    <th style="border-right:3px solid grey" class="mythStyle" title="Sclerotinia sclerotiorum 1980 UF-70"><i>Sscl</i></th>

    <th class="mythStyle" title="Candida albicans SC5314"><i>Calb</i></th>
    <th style="border-right:3px solid grey" class="mythStyle" title="Saccharomyces cerevisiae S288c"><i>Scer</i></th>

    <th class="mythStyle" title="Schizosaccharomyces japonicus yFS275"><i>Sjap</i></th>
    <th class="mythStyle" title="Schizosaccharomyces octosporus yFS286"><i>Soct</i></th>
    <th style="border-right:3px solid grey" class="mythStyle" title="Schizosaccharomyces pombe 972h-"><i>Spom</i></th>

    <th class="mythStyle" title="Fusarium oxysporum f. sp. lycopersici 4287"><i>Foxy</i></th>
    <th class="mythStyle" title="Gibberella moniliformis 7600"><i>Gmon</i></th>
    <th class="mythStyle" title="Gibberella zeae PH-1"><i>Gzea</i></th>
    <th class="mythStyle" title="Magnaporthe oryzae 70-15"><i>Mory</i></th>
    <th class="mythStyle" title="Neurospora crassa OR74A"><i>Ncra</i></th>
    <th class="mythStyle" title="Neurospora discreta FGSC 8579"><i>Ndis</i></th>
    <th class="mythStyle" title="Neurospora tetrasperma FGSC 2508"><i>Ntet</i></th>
    <th class="mythStyle" title="Sordaria macrospora k-hell"><i>Smac</i></th>
    <th style="border-right:3px solid grey" class="mythStyle" title="Trichoderma reesei QM6a"><i>Tree</i></th>

    <th class="mythStyle" title="Coprinopsis cinerea okayama7#130"><i>Ccin</i></th>
    <th style="border-right:3px solid grey" class="mythStyle" title="Phanerochaete chrysosporium RP-78"><i>Pchr</i></th>

    <th style="border-right:3px solid grey" class="mythStyle" title="Puccinia graminis f. sp. tritici CRL 75-36-700-3"><i>Pgra</i></th>

    <th class="mythStyle" title="Cryptococcus gattii R265"><i>Cgat</i></th>
    <th class="mythStyle" title="Cryptococcus gattii WM276"><i>CgatW</i></th>
    <th class="mythStyle" title="Cryptococcus neoformans var. grubii H99"><i>Cneo</i></th>
    <th class="mythStyle" title="Cryptococcus neoformans var. neoformans B-3501A"><i>CneoB</i></th>
    <th class="mythStyle" title="Cryptococcus neoformans var. neoformans JEC21"><i>CneoJ</i></th>
    <th style="border-right:3px solid grey" class="mythStyle" title="Tremella mesenterica DSM 1558"><i>Tmes</i></th>

    <th class="mythStyle" title="Malassezia globosa CBS 7966"><i>Mglo</i></th>
    <th class="mythStyle" title="Sporisorium reilianum SRZ2"><i>Srei</i></th>
    <th style="border-right:3px solid grey" class="mythStyle" title="Ustilago maydis 521"><i>Umay</i></th>

    <th style="border-right:3px solid grey" class="mythStyle" title="Batrachochytrium dendrobatidis JEL423"><i>Bden</i></th>

    <th class="mythStyle" title="Mucor circinelloides f. lusitanicus CBS 277.49"><i>Mcir</i></th>
    <th style="border-right:3px solid grey" class="mythStyle" title="Rhizopus oryzae RA 99-880"><i>Rory</i></th>

    <th class="mythStyle" title="Hyaloperonospora arabidopsidis Emoy2"><i>Hara</i></th>
    <th class="mythStyle" title="Phytophthora capsici LT1534"><i>Pcap</i></th>
    <th class="mythStyle" title="Phytophthora infestans T30-4"><i>Pinf</i></th>
    <th class="mythStyle" title="Phytophthora ramorum"><i>Pram</i></th>
    <th style="border-right:3px solid grey" class="mythStyle" title="Phytophthora sojae"><i>Psoj</i></th>

    <th class="mythStyle" title="Pythium ultimum DAOM BR144"><i>Pult</i></th>
  </tr>


  <c:forEach items="${xmlAnswer.recordInstances}" var="record">

    <c:set var="Metric_Type" value="${record.attributesMap['Metric_Type']}"/>
    <c:set var="Acap" value="${record.attributesMap['Ajellomyces capsulatus G186AR']}"/>
    <c:set var="AcapN" value="${record.attributesMap['Ajellomyces capsulatus NAm1']}"/>
    <c:set var="Acar" value="${record.attributesMap['Aspergillus carbonarius ITEM 5010']}"/>
    <c:set var="Acla" value="${record.attributesMap['Aspergillus clavatus NRRL 1']}"/>
    <c:set var="Afla" value="${record.attributesMap['Aspergillus flavus NRRL3357']}"/>
    <c:set var="Afum" value="${record.attributesMap['Aspergillus fumigatus Af293']}"/>
    <c:set var="Anid" value="${record.attributesMap['Aspergillus nidulans FGSC A4']}"/>
    <c:set var="Anig" value="${record.attributesMap['Aspergillus niger ATCC 1015']}"/>
    <c:set var="Ater" value="${record.attributesMap['Aspergillus terreus NIH2624']}"/>
    <c:set var="Cimm" value="${record.attributesMap['Coccidioides immitis H538.4']}"/>
    <c:set var="CimmR" value="${record.attributesMap['Coccidioides immitis RS']}"/>
    <c:set var="Cpos" value="${record.attributesMap['Coccidioides posadasii C735 delta SOWgp']}"/>
    <c:set var="Nfis" value="${record.attributesMap['Neosartorya fischeri NRRL 181']}"/>
    <c:set var="Pmar" value="${record.attributesMap['Penicillium marneffei ATCC 18224']}"/>
    <c:set var="Tsti" value="${record.attributesMap['Talaromyces stipitatus ATCC 10500']}"/>
    <c:set var="Bfuc" value="${record.attributesMap['Botryotinia fuckeliana B05.10']}"/>
    <c:set var="Sscl" value="${record.attributesMap['Sclerotinia sclerotiorum 1980 UF-70']}"/>
    <c:set var="Calb" value="${record.attributesMap['Candida albicans SC5314']}"/>
    <c:set var="Scer" value="${record.attributesMap['Saccharomyces cerevisiae S288c']}"/>
    <c:set var="Sjap" value="${record.attributesMap['Schizosaccharomyces japonicus yFS275']}"/>
    <c:set var="Soct" value="${record.attributesMap['Schizosaccharomyces octosporus yFS286']}"/>
    <c:set var="Spom" value="${record.attributesMap['Schizosaccharomyces pombe 972h-']}"/>
    <c:set var="Foxy" value="${record.attributesMap['Fusarium oxysporum f. sp. lycopersici 4287']}"/>
    <c:set var="Gmon" value="${record.attributesMap['Gibberella moniliformis 7600']}"/>
    <c:set var="Gzea" value="${record.attributesMap['Gibberella zeae PH-1']}"/>
    <c:set var="Mory" value="${record.attributesMap['Magnaporthe oryzae 70-15']}"/>
    <c:set var="Ncra" value="${record.attributesMap['Neurospora crassa OR74A']}"/>
    <c:set var="Ndis" value="${record.attributesMap['Neurospora discreta FGSC 8579']}"/>
    <c:set var="Ntet" value="${record.attributesMap['Neurospora tetrasperma FGSC 2508']}"/>
    <c:set var="Smac" value="${record.attributesMap['Sordaria macrospora k-hell']}"/>
    <c:set var="Tree" value="${record.attributesMap['Trichoderma reesei QM6a']}"/>
    <c:set var="Ccin" value="${record.attributesMap['Coprinopsis cinerea okayama7#130']}"/>
    <c:set var="Pchr" value="${record.attributesMap['Phanerochaete chrysosporium RP-78']}"/>
    <c:set var="Pgra" value="${record.attributesMap['Puccinia graminis f. sp. tritici CRL 75-36-700-3']}"/>
    <c:set var="Cgat" value="${record.attributesMap['Cryptococcus gattii R265']}"/>
    <c:set var="CgatW" value="${record.attributesMap['Cryptococcus gattii WM276']}"/>
    <c:set var="Cneo" value="${record.attributesMap['Cryptococcus neoformans var. grubii H99']}"/>
    <c:set var="CneoB" value="${record.attributesMap['Cryptococcus neoformans var. neoformans B-3501A']}"/>
    <c:set var="CneoJ" value="${record.attributesMap['Cryptococcus neoformans var. neoformans JEC21']}"/>
    <c:set var="Tmes" value="${record.attributesMap['Tremella mesenterica DSM 1558']}"/>
    <c:set var="Mglo" value="${record.attributesMap['Malassezia globosa CBS 7966']}"/>
    <c:set var="Srei" value="${record.attributesMap['Sporisorium reilianum SRZ2']}"/>
    <c:set var="Umay" value="${record.attributesMap['Ustilago maydis 521']}"/>
    <c:set var="Bden" value="${record.attributesMap['Batrachochytrium dendrobatidis JEL423']}"/>
    <c:set var="Mcir" value="${record.attributesMap['Mucor circinelloides f. lusitanicus CBS 277.49']}"/>
    <c:set var="Rory" value="${record.attributesMap['Rhizopus oryzae RA 99-880']}"/>
    <c:set var="Hara" value="${record.attributesMap['Hyaloperonospora arabidopsidis Emoy2']}"/>
    <c:set var="Pcap" value="${record.attributesMap['Phytophthora capsici LT1534']}"/>
    <c:set var="Pinf" value="${record.attributesMap['Phytophthora infestans T30-4']}"/>
    <c:set var="Pram" value="${record.attributesMap['Phytophthora ramorum']}"/>
    <c:set var="Psoj" value="${record.attributesMap['Phytophthora sojae']}"/>
    <c:set var="Pult" value="${record.attributesMap['Pythium ultimum DAOM BR144']}"/>

    <tr class="mytdStyle">
      <td style="border-right:3px solid grey;cursor:pointer" class="mytdStyle" align="left" title="${record.attributesMap['Description']}">${Metric_Type}</td>

      <td class="mytdStyle" align="right">${Acap}</td>
      <td class="mytdStyle" align="right">${AcapN}</td>
      <td class="mytdStyle" align="right">${Acar}</td>
      <td class="mytdStyle" align="right">${Acla}</td>
      <td class="mytdStyle" align="right">${Afla}</td>
      <td class="mytdStyle" align="right">${Afum}</td>
      <td class="mytdStyle" align="right">${Anid}</td>
      <td class="mytdStyle" align="right">${Anig}</td>
      <td class="mytdStyle" align="right">${Ater}</td>
      <td class="mytdStyle" align="right">${Cimm}</td>
      <td class="mytdStyle" align="right">${CimmR}</td>
      <td class="mytdStyle" align="right">${Cpos}</td>
      <td class="mytdStyle" align="right">${Nfis}</td>
      <td class="mytdStyle" align="right">${Pmar}</td>
      <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Tsti}</td>

      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Bfuc}</td>
      <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Sscl}</td>

      <td class="mytdStyle" align="right">${Calb}</td>
      <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Scer}</td>

      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Sjap}</td>
      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Soct}</td>
      <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Spom}</td>

      <td class="mytdStyle" align="right">${Foxy}</td>
      <td class="mytdStyle" align="right">${Gmon}</td>
      <td class="mytdStyle" align="right">${Gzea}</td>
      <td class="mytdStyle" align="right">${Mory}</td>
      <td class="mytdStyle" align="right">${Ncra}</td>
      <td class="mytdStyle" align="right">${Ndis}</td>
      <td class="mytdStyle" align="right">${Ntet}</td>
      <td class="mytdStyle" align="right">${Smac}</td>
      <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Tree}</td>

      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ccin}</td>
      <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Pchr}</td>

      <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Pgra}</td>

      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Cgat}</td>
      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${CgatW}</td>
      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Cneo}</td>
      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${CneoB}</td>
      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${CneoJ}</td>
      <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Tmes}</td>

      <td class="mytdStyle" align="right">${Mglo}</td>
      <td class="mytdStyle" align="right">${Srei}</td>
      <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Umay}</td>

      <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Bden}</td>

      <td class="mytdStyle" align="right">${Mcir}</td>
      <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Rory}</td>

      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Hara}</td>
      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Pcap}</td>
      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Pinf}</td>
      <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Pram}</td>
      <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Psoj}</td>

      <td class="mytdStyle" align="right">${Pult}</td>
    </tr>

  </c:forEach>

</c:when>
<c:otherwise>    <!------------- ALL PROJECTS BUT FUNGI -------------------->

<tr class="mythStyle">
    <th style="background-color:white;border-right:3px solid grey;border-top:0px none;border-left:0 none;"></th>
    <th style="border-right:3px solid grey" colspan="6" class="mythStyle"><a href="http://amoebadb.org">AmoebaDB</a></th>
    <th style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://cryptodb.org">CryptoDB</a></th>
    <th style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://giardiadb.org">GiardiaDB</a></th>
    <th style="border-right:3px solid grey" colspan="15" class="mythStyle"><a href="http://microsporidiadb.org">MicrosporidiaDB</a></th>
    <th style="border-right:3px solid grey" colspan="4" class="mythStyle"><a href="http://piroplasmadb.org">PiroplasmaDB</a></th>
    <th style="border-right:3px solid grey" colspan="9" class="mythStyle"><a href="http://plasmodb.org">PlasmoDB</a></th>
    <th style="border-right:3px solid grey" colspan="6" class="mythStyle"><a href="http://toxodb.org">ToxoDB</a></th>
    <th style="border-right:3px solid grey" colspan="1" class="mythStyle"><a href="http://trichdb.org">TrichDB</a></th>
    <th colspan="16" class="mythStyle"><a href="http://tritrypdb.org">TriTrypDB</a></th>
</tr>

<tr class="mythStyle">
    <th  style="border-right:3px solid grey" class="mythStyle" title="">Gene Metric</th>

    <th class="mythStyle" title="Acanthamoeba castellanii str. Neff, AmoebaDB"><i>Aca</i></th>
    <th class="mythStyle" title="Entamoeba dispar SAW760, AmoebaDB"><i>Edi</i></th>
    <th class="mythStyle" title="Entamoeba histolytica HM-1:IMSS, AmoebaDB"><i>Ehi</i></th>
    <th class="mythStyle" title="Entamoeba invadens IP1, AmoebaDB"><i>EinI</i></th>
    <th class="mythStyle" title="Entamoeba moshkovskii Laredo, AmoebaDB"><i>Emo</i></th>
    <th  style="border-right:3px solid grey"class="mythStyle" title="Entamoeba nuttalli P19, AmoebaDB"><i>Enu</i></th>

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
    <th class="mythStyle" title="Encephalitozoon romaleae SJ-2008, MicrosporidiaDB"><i>Ero</i></th>
  
    <th class="mythStyle" title="Nematocida parisii ERTm1, MicrosporidiaDB"><i>Npa1</i></th>
    <th class="mythStyle" title="Nematocida parisii ERTm3, MicrosporidiaDB"><i>Npa3</i></th>
    <th class="mythStyle" title="Nematocida sp. 1 ERTm2, MicrosporidiaDB"><i>Nsp2</i></th>

    <th class="mythStyle" title="Nosema cerenae BRL01, MicrosporidiaDB"><i>Nce</i></th>

    <th class="mythStyle" title="Vavraia culicis floridensis, MicrosporidiaDB"><i>Vcu</i></th>

    <th  style="border-right:3px solid grey"  class="mythStyle" title="Vittaforma corneae ATCC 50505, MicrosporidiaDB"><i>Vco</i></th>

    <th class="mythStyle" title="Babesia bovis T2Bo, PiroplasmaDB"><i>Bbo</i></th>
    <th class="mythStyle" title="Babesia microti strain RI, PiroplasmaDB"><i>Bmi</i></th>
    <th class="mythStyle" title="Theileria annulata, PiroplasmaDB"><i>Tan</i></th>
    <th style="border-right:3px solid grey" class="mythStyle" title="Theileria parva, PiroplasmaDB"><i>Tpa</i></th>

    <th class="mythStyle" title="Plasmodium berghei ANKA, PlasmoDB"><i>Pbe</i></th>
    <th class="mythStyle" title="Plasmodium chabaudi chabaudi, PlasmoDB"><i>Pch</i></th>
    <th class="mythStyle" title="Plasmodium cynomolgi strain B, PlasmoDB"><i>Pcy</i></th>
    <th class="mythStyle" title="Plasmodium falciparum 3D7, PlasmoDB"><i>Pfa3D7</i></th>
    <th class="mythStyle" title="Plasmodium falciparum IT, PlasmoDB"><i>PfaIT</i></th>
    <th class="mythStyle" title="Plasmodium knowlesi strain H, PlasmoDB"><i>Pko</i></th>
    <th class="mythStyle" title="Plasmodium vivax Sal-1, PlasmoDB"><i>Pvi</i></th>
    <th class="mythStyle" title="Plasmodium yoelii yoelii 17XNL, PlasmoDB"><i>Pyo1</i></th>
    <th  style="border-right:3px solid grey" class="mythStyle" title="Plasmodium yoelii yoelii YM, PlasmoDB"><i>PyoY</i></th>


    <th class="mythStyle" title="Eimeria tenella strain Houghton, ToxoDB"><i>Ete</i></th>
    <th class="mythStyle" title="Neospora caninum Liverpool, ToxoDB"><i>Nca</i></th>
    <th class="mythStyle" title="Toxoplasma gondii GT1, ToxoDB"><i>TgoG</i></th>
    <th class="mythStyle" title="Toxoplasma gondii ME49, ToxoDB"><i>TgoM</i></th>
    <th class="mythStyle" title="Toxoplasma gondii VEG, ToxoDB"><i>TgoV</i></th>
    <th  style="border-right:3px solid grey" class="mythStyle" title="Toxoplasma gondii RH"><i>TgoR</i></th>

    <th  style="border-right:3px solid grey" class="mythStyle" title="Trichomonas vaginalis,TrichDB"><i>Tva</i></th>

    <th class="mythStyle" title="Leishmania braziliensis, TriTrypDB"><i>Lbr</i></th>
    <th class="mythStyle" title="Leishmania donovani, TriTrypDB"><i>Ldo</i></th>
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
    <th class="mythStyle" title="Trypanosoma cruzi marinkellei, TriTrypDB"><i>Tcrm</i></th>
    <th class="mythStyle" title="Trypanosoma cruzi Sylvio, TriTrypDB"><i>TcrS</i></th>
   <th class="mythStyle" title="Trypanosoma vivax, TriTrypDB"><i>Tvi</i></th>
</tr>
</thead>

<tbody>
  <c:forEach items="${xmlAnswer.recordInstances}" var="record">

	 <c:set var="Metric_Type" value="${record.attributesMap['Metric_Type']}"/>
          <c:set var="Aca" value="${record.attributesMap['Acanthamoeba castellanii str. Neff']}"/>

          <c:set var="Bbo" value="${record.attributesMap['Babesia bovis T2Bo']}"/>
          <c:set var="Bmi" value="${record.attributesMap['Babesia microti strain RI']}"/>

          <c:set var="Cho" value="${record.attributesMap['Cryptosporidium hominis TU502']}"/>
          <c:set var="Cmu" value="${record.attributesMap['Cryptosporidium muris RN66']}"/>
          <c:set var="Cpa" value="${record.attributesMap['Cryptosporidium parvum Iowa II']}"/>

          <c:set var="Ete" value="${record.attributesMap['Eimeria tenella strain Houghton']}"/>

          <c:set var="Ebi" value="${record.attributesMap['Enterocytozoon bieneusi H348']}"/>

          <c:set var="Ecu1" value="${record.attributesMap['Encephalitozoon cuniculi EC1']}"/>
          <c:set var="Ecu2" value="${record.attributesMap['Encephalitozoon cuniculi EC2']}"/>
          <c:set var="Ecu3" value="${record.attributesMap['Encephalitozoon cuniculi EC3']}"/>
          <c:set var="EcuG" value="${record.attributesMap['Encephalitozoon cuniculi GB-M1']}"/>

          <c:set var="EheA" value="${record.attributesMap['Encephalitozoon hellem ATCC 50504']}"/>
          <c:set var="EheS" value="${record.attributesMap['Encephalitozoon hellem Swiss']}"/>

          <c:set var="EinA" value="${record.attributesMap['Encephalitozoon intestinalis ATCC 50506']}"/>
          <c:set var="Ero" value="${record.attributesMap['Encephalitozoon romaleae SJ-2008']}"/>

          <c:set var="Edi" value="${record.attributesMap['Entamoeba dispar SAW760']}"/>
          <c:set var="Ehi" value="${record.attributesMap['Entamoeba histolytica HM-1:IMSS']}"/>
          <c:set var="EinI" value="${record.attributesMap['Entamoeba invadens IP1']}"/>
          <c:set var="Emo" value="${record.attributesMap['Entamoeba moshkovskii Laredo']}"/>
          <c:set var="Enu" value="${record.attributesMap['Entamoeba nuttalli P19']}"/>

          <c:set var="GA" value="${record.attributesMap['Giardia Assemblage A isolate WB']}"/>
          <c:set var="GB" value="${record.attributesMap['Giardia Assemblage B isolate GS']}"/>
          <c:set var="GE" value="${record.attributesMap['Giardia Assemblage E isolate P15']}"/>

          <c:set var="Lbr" value="${record.attributesMap['Leishmania braziliensis MHOM/BR/75/M2904']}"/>
          <c:set var="Ldo" value="${record.attributesMap['Leishmania donovani BPK282A1']}"/>
          <c:set var="Lin" value="${record.attributesMap['Leishmania infantum JPCM5']}"/>
          <c:set var="Lma" value="${record.attributesMap['Leishmania major strain Friedlin']}"/>
          <c:set var="Lme" value="${record.attributesMap['Leishmania mexicana MHOM/GT/2001/U1103']}"/>
          <c:set var="Lta" value="${record.attributesMap['Leishmania tarentolae Parrot-TarII']}"/>

          <c:set var="Npa1" value="${record.attributesMap['Nematocida parisii ERTm1']}"/>
          <c:set var="Npa3" value="${record.attributesMap['Nematocida parisii ERTm3']}"/>
          <c:set var="Nsp2" value="${record.attributesMap['Nematocida sp. 1 ERTm2']}"/>

          <c:set var="Nca" value="${record.attributesMap['Neospora caninum Liverpool']}"/>

          <c:set var="Nce" value="${record.attributesMap['Nosema ceranae BRL01']}"/>

          <c:set var="Pbe" value="${record.attributesMap['Plasmodium berghei ANKA']}"/>
          <c:set var="Pch" value="${record.attributesMap['Plasmodium chabaudi chabaudi']}"/>
          <c:set var="Pcy" value="${record.attributesMap['Plasmodium cynomolgi strain B']}"/>
          <c:set var="Pfa3" value="${record.attributesMap['Plasmodium falciparum 3D7']}"/>
          <c:set var="PfaI" value="${record.attributesMap['Plasmodium falciparum IT']}"/>
          <c:set var="Pko" value="${record.attributesMap['Plasmodium knowlesi strain H']}"/>
          <c:set var="Pvi" value="${record.attributesMap['Plasmodium vivax SaI-1']}"/>
          <c:set var="Pyo1" value="${record.attributesMap['Plasmodium yoelii yoelii 17XNL']}"/>
          <c:set var="PyoY" value="${record.attributesMap['Plasmodium yoelii yoelii YM']}"/>

          <c:set var="Tan" value="${record.attributesMap['Theileria annulata strain Ankara']}"/>
          <c:set var="Tpa" value="${record.attributesMap['Theileria parva strain Muguga']}"/>

          <c:set var="TgoG" value="${record.attributesMap['Toxoplasma gondii GT1']}"/>
          <c:set var="TgoM" value="${record.attributesMap['Toxoplasma gondii ME49']}"/>
          <c:set var="TgoR" value="${record.attributesMap['Toxoplasma gondii RH']}"/>
          <c:set var="TgoV" value="${record.attributesMap['Toxoplasma gondii VEG']}"/>

          <c:set var="Tva" value="${record.attributesMap['Trichomonas vaginalis G3']}"/>

          <c:set var="Tbr4" value="${record.attributesMap['Trypanosoma brucei Lister strain 427']}"/>
          <c:set var="Tbr9" value="${record.attributesMap['Trypanosoma brucei TREU927']}"/>
          <c:set var="Tbrg" value="${record.attributesMap['Trypanosoma brucei gambiense DAL972']}"/>
          <c:set var="Tco" value="${record.attributesMap['Trypanosoma congolense IL3000']}"/>
          <c:set var="TcrE" value="${record.attributesMap['Trypanosoma cruzi CL Brener Esmeraldo-like']}"/>
          <c:set var="TcrN" value="${record.attributesMap['Trypanosoma cruzi CL Brener Non-Esmeraldo-like']}"/>
          <c:set var="TcrB" value="${record.attributesMap['Trypanosoma cruzi strain CL Brener']}"/>
          <c:set var="Tcrm" value="${record.attributesMap['Trypanosoma cruzi marinkellei strain B7']}"/>
          <c:set var="TcrS" value="${record.attributesMap['Trypanosoma cruzi Sylvio X10/1']}"/>
          <c:set var="Tvi" value="${record.attributesMap['Trypanosoma vivax Y486']}"/>

          <c:set var="Vcu" value="${record.attributesMap['Vavraia culicis floridensis']}"/>
          <c:set var="Vco" value="${record.attributesMap['Vittaforma corneae ATCC 50505']}"/>


<tr class="mytdStyle">
    <td style="border-right:3px solid grey" class="mytdStyle" align="left" title="${record.attributesMap['Description']}">${Metric_Type}</td>
   
    <td class="mytdStyle" align="right">${Aca}</td>
    <td class="mytdStyle" align="right">${Edi}</td>
    <td class="mytdStyle" align="right">${Ehi}</td>
    <td class="mytdStyle" align="right">${EinI}</td>
    <td class="mytdStyle" align="right">${Emo}</td>
    <td style="border-right:3px solid grey"  class="mytdStyle" align="right">${Enu}</td>

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
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ero}</td>

    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Npa1}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Npa3}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Nsp2}</td>

    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Nce}</td>

    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Vcu}</td>

    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Vco}</td>

    <td class="mytdStyle" align="right">${Bbo}</td>
    <td class="mytdStyle" align="right">${Bmi}</td>
    <td class="mytdStyle" align="right">${Tan}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Tpa}</td>

    <td class="mytdStyle" align="right">${Pbe}</td>
    <td class="mytdStyle" align="right">${Pch}</td>
    <td class="mytdStyle" align="right">${Pcy}</td>
    <td class="mytdStyle" align="right">${Pfa3}</td>
    <td class="mytdStyle" align="right">${PfaI}</td>
    <td class="mytdStyle" align="right">${Pko}</td>    
    <td class="mytdStyle" align="right">${Pvi}</td>
    <td class="mytdStyle" align="right">${Pyo1}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${PyoY}</td>


    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ete}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Nca}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${TgoG}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${TgoM}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${TgoV}</td>
    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${TgoR}</td>

    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Tva}</td>

    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Lbr}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ldo}</td>
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
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tcrm}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${TcrS}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tvi}</td>
</tr>
 
  </c:forEach>

</c:otherwise>
</c:choose>

  </tbody>
  </table>
<!-- </div> -->
<br><br>

<c:if test="${project ne 'FungiDB'}" >
<table width="100%">

<tr><td colspan="10"><font size="-2">
	* In addition, <i>Giardia Assemblage A isolate WB</i> has 3766 deprecated genes that are not included in the official gene count.</font></td></tr>
<tr><td colspan="10"><font size="-2">
	** Community entries:  These are counts <b>at release time</b>; there might be more now.</font></td></tr>

<tr><td><hr></td></tr>

<tr><td><font size="-1">
<b>Acanthamoeba</b>: Aca, <i>A. castellanii</i>;
<b>Annacaliia</b>: Aal, <i>A. algerae</i>;
<b>Babesia</b>: Bbo, <i>B. bovis</i>; Bmi, <i>B. microti</i>;
<b>Cryptosporidium</b>: Cho, <i>C. hominis</i>; Cmu, <i>C. muris</i>; Cpa, <i>C. parvum</i>;  
<b>Eimeria</b>: Ete, <i>E. tenella</i>; 
<b>Encephalitozoon</b>: Ecu, <i>E. cuniculi</i>; Ehe, <i>E. hellem</i>; Ein, <i>E. intestinalis</i>; Ero, <i>E. romaleae</i>; 
<b>Entamoeba</b>: Edi, <i>E. dispar</i>; Ehi, <i>E. histolytica</i>; Ein, <i>E. invadens</i>; Emo, <i>E. moshkovskii</i>; Enu, <i>E. nuttalli</i>;  
<b>Enterocytozoon</b>: Eb, <i>E. bieneusi</i>; 
<b>Giardia</b>: GA, <i>G.Assemblage_A_isolate_WB</i>; GB, <i>G.Assemblage_B_isolate_GS</i>; GE, <i>G.Assemblage_E_isolate_P15</i>; 
<b>Leishmania</b>: Lb, <i>L. braziliensis</i>; Ld, <i>L. donovani</i>; Li, <i>L. infantum</i>; Lma, <i>L. major</i>; Lme, <i>L. mexicana</i>; 
<b>Nematocida</b>: Npa, <i>N. parisii</i>; Nsp, <i>N. sp. 1</i>        
<b>Neospora</b>: Nca, <i>N. caninum</i>; 
<b>Nosema</b>: Nce, <i>N. cerenae</i>; 
<b>Plasmodium</b>: Pbe, <i>P. berghei</i>; Pch, <i>P. chabaudi</i>; Pcy, <i>P. cynomolgi</i>; Pfa, <i>P. falciparum</i>; Pko, <i>P. knowlesi</i>; Pvi, <i>P. vivax</i>; Pyo, <i>P. yoelii</i>; 
<b>Theileria</b>: Tan, <i>T. annulata</i>; Tpa, <i>T. parva</i>; 
<b>Toxoplasma</b>: Tgo, <i>T. gondii</i>; 
<b>Trichomonas</b>: Tva, <i>T. vaginalis</i>; 
<b>Trypanosoma</b>: Tbr, <i>T. brucei</i>; Tco, <i>T. congolense</i>; Tcr, <i>T. cruzi</i>; Tvi, <i>T. vivax</i>;
<b>Vavraia</b>: Vcu, <i>V. culicis</i>;
<b>Vittaforma</b>: Vco, <i>V. corneae</i>. 

</font></td></tr>

</table>
</c:if>

  </c:otherwise>
</c:choose>

</imp:pageFrame>
