<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%-- get wdkXmlAnswer saved in request scope --%>
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set value="${wdkModel.displayName}" var="project"/>

<site:header  title="${project} :: Gene Metrics"
                 banner="${project} Gene Metrics"
                 parentDivision="${project}"
                 parentUrl="/home.jsp"
                 divisionName="allSites"
                 division="geneMetrics"/>

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


<div style="overflow-x:auto">
<table  class="mytableStyle" width="100%">
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
    <td style="background-color:white;border-right:3px solid grey;border-top:0px none;border-left:0 none;"></td>
    <td style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://amoebadb.org">AmoebaDB</a></td>
    <td style="border-right:3px solid grey" colspan="4" class="mythStyle"><a href="http://cryptodb.org">CryptoDB</a></td>
    <td style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://giardiadb.org">GiardiaDB</a></td>
    <td style="border-right:3px solid grey" colspan="5" class="mythStyle"><a href="http://microsporidiadb.org">&mu;-sporidiaDB</a></td>
    <td style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://piroplasmadb.org">PiroplasmaDB</a></td>
    <td style="border-right:3px solid grey" colspan="7" class="mythStyle"><a href="http://plasmodb.org">PlasmoDB</a></td>
    <td style="border-right:3px solid grey" colspan="6" class="mythStyle"><a href="http://toxodb.org">ToxoDB</a></td>
    <td style="border-right:3px solid grey" colspan="1" class="mythStyle"><a href="http://trichdb.org">TrichDB</a></td>
    <td colspan="13" class="mythStyle"><a href="http://tritrypdb.org">TriTrypDB</a></td>
</tr>
<tr class="mythStyle">
    <td  style="border-right:3px solid grey" class="mythStyle" title="">Gene Metric</td>
    <td class="mythStyle" title="Entamoeba dispar, AmoebaDB"><i>Ed</i></td>
    <td class="mythStyle" title="Entamoeba histolytica, AmoebaDB"><i>Eh</i></td>
    <td  style="border-right:3px solid grey"class="mythStyle" title="Entamoeba invadens, AmoebaDB"><i>Einv</i></td>
    <td class="mythStyle" title="Cryptosporidium hominis, CryptoDB"><i>Ch</i></td>
    <td class="mythStyle" title="Cryptosporidium muris, CryptoDB"  ><i>Cm</i></td>
    <td class="mythStyle" title="Cryptosporidium parvum Chr 6, CryptoDB"  ><i>Cp6</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Cryptosporidium parvum, CryptoDB" ><i>Cp</i></td>
    <td class="mythStyle" title="Giardia Assemblage A isolate WB, GiardiaDB" ><i>Ga*</i></td>
    <td class="mythStyle" title="Giardia Assemblage B isolate GS, GiardiaDB" ><i>Gb</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Giardia_Assemblage_E_isolate_P15, GiardiaDB" ><i>Ge</i></td>
    <td class="mythStyle" title="Encephalitozoon cuniculi, MicrosporidiaDB"><i>Ec</i></td>
    <td class="mythStyle" title="Encephalitozoon intestinalis, MicrosporidiaDB"><i>Eint</i></td>
    <td class="mythStyle" title="Encephalitozoon hellem, MicrosporidiaDB"><i>Ehel</i></td>
    <td class="mythStyle" title="Enterocytozoon bieneusi, MicrosporidiaDB"><i>Eb</i></td>
    <td  style="border-right:3px solid grey"  class="mythStyle" title="Nosema cerenae, MicrosporidiaDB"><i>Ncer</i></td>
    <td class="mythStyle" title="Babesia bovis, PiroplasmaDB"><i>Bb</i></td>
    <td class="mythStyle" title="Theileria annulata, PiroplasmaDB"><i>Ta</i></td>
    <td style="border-right:3px solid grey" class="mythStyle" title="Theileria parva, PiroplasmaDB"><i>Tp</i></td>
    <td class="mythStyle" title="Plasmodium berghei, PlasmoDB"><i>Pb</i></td>
    <td class="mythStyle" title="Plasmodium chabaudi, PlasmoDB"><i>Pc</i></td>
    <td class="mythStyle" title="Plasmodium falciparum 3D7, PlasmoDB"><i>Pf3d7</i></td>
    <td class="mythStyle" title="Plasmodium falciparum IT, PlasmoDB"><i>PfIT</i></td>
    <td class="mythStyle" title="Plasmodium knowlesi, PlasmoDB"><i>Pk</i></td>
    <td class="mythStyle" title="Plasmodium vivax, PlasmoDB"><i>Pv</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Plasmodium yoelii, PlasmoDB"><i>Py</i></td>
    <td class="mythStyle" title="Neospora caninum, ToxoDB"><i>Nc</i></td>
    <td class="mythStyle" title="Eimeria tenella, ToxoDB"><i>Et</i></td>
    <td class="mythStyle" title="Toxoplasma gondii GT1, ToxoDB"><i>TgGT1</i></td>
    <td class="mythStyle" title="Toxoplasma gondii ME49, ToxoDB"><i>TgME49</i></td>
    <td class="mythStyle" title="Toxoplasma gondii RH, ToxoDB"><i>TgRH</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Toxoplasma gondii VEG"><i>TgVeg</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Trichomonas vaginalis,TrichDB"><i>Tva</i></td>
    <td class="mythStyle" title="Leishmania braziliensis, TriTrypDB"><i>Lb</i></td>
    <td class="mythStyle" title="Leishmania infantum, TriTrypDB"><i>Li</i></td>
    <td class="mythStyle" title="Leishmania major, TriTrypDB"><i>Lma</i></td>
    <td class="mythStyle" title="Leishmania mexicana, TriTrypDB"><i>Lme</i></td>
    <td class="mythStyle" title="Leishmania tarentolae, TriTrypDB"><i>Lt</i></td>
    <td class="mythStyle" title="Trypanosoma brucei 927, TriTrypDB"><i>Tb927</i></td>
    <td class="mythStyle" title="Trypanosoma brucei 427, TriTrypDB"><i>Tb427</i></td>
    <td class="mythStyle" title="Trypanosoma brucei gambiense, TriTrypDB"><i>Tbg</i></td>
    <td class="mythStyle" title="Trypanosoma congolense, TriTrypDB"><i>Tco</i></td>
    <td class="mythStyle" title="Trypanosoma cruzi CL Brenner Unassigned, TriTrypDB"><i>TcrCLU</i></td>
    <td class="mythStyle" title="Trypanosoma cruzi CL Brenner Esmeraldo, TriTrypDB"><i>TcrCLE</i></td>
    <td class="mythStyle" title="Trypanosoma cruzi CL Brenner NonEsmeraldo, TriTrypDB"><i>TcrCLNE</i></td>
   <td class="mythStyle" title="Trypanosoma vivax, TriTrypDB"><i>Tvi</i></td>
</tr>

  <c:forEach items="${xmlAnswer.recordInstances}" var="record">

	 <c:set var="Metric_Type" value="${record.attributesMap['Metric_Type']}"/>
          <c:set var="Bb" value="${record.attributesMap['Babesia bovis T2Bo']}"/>
          <c:set var="Ch" value="${record.attributesMap['Cryptosporidium hominis']}"/>
          <c:set var="Cm" value="${record.attributesMap['Cryptosporidium muris']}"/>
          <c:set var="Cp6" value="${record.attributesMap['Cryptosporidium parvum']}"/>
          <c:set var="Cp" value="${record.attributesMap['Cryptosporidium parvum Iowa II']}"/>
          <c:set var="Eth" value="${record.attributesMap['Eimeria tenella str. Houghton']}"/>
          <c:set var="Ecg" value="${record.attributesMap['Encephalitozoon cuniculi GB-M1']}"/>
          <c:set var="Eha" value="${record.attributesMap['Encephalitozoon hellem ATCC 50504']}"/>
          <c:set var="Ei" value="${record.attributesMap['Encephalitozoon intestinalis']}"/>
          <c:set var="Eds" value="${record.attributesMap['Entamoeba dispar SAW760']}"/>
          <c:set var="Ehh" value="${record.attributesMap['Entamoeba histolytica HM-1:IMSS']}"/>
          <c:set var="Eii" value="${record.attributesMap['Entamoeba invadens IP1']}"/>
          <c:set var="Ebh" value="${record.attributesMap['Enterocytozoon bieneusi H348']}"/>
          <c:set var="Gaa" value="${record.attributesMap['Giardia Assemblage A isolate WB']}"/>
          <c:set var="Gab" value="${record.attributesMap['Giardia Assemblage B isolate GS']}"/>
          <c:set var="Gae" value="${record.attributesMap['Giardia Assemblage E isolate P15']}"/>
          <c:set var="Lb" value="${record.attributesMap['Leishmania braziliensis']}"/>
          <c:set var="Li" value="${record.attributesMap['Leishmania infantum']}"/>
          <c:set var="Lmf" value="${record.attributesMap['Leishmania major strain Friedlin']}"/>
          <c:set var="Lm" value="${record.attributesMap['Leishmania mexicana']}"/>
          <c:set var="Ltp" value="${record.attributesMap['Leishmania tarentolae Parrot-TarII']}"/>
          <c:set var="Nc" value="${record.attributesMap['Neospora caninum']}"/>
          <c:set var="Ncb" value="${record.attributesMap['Nosema ceranae BRL01']}"/>
          <c:set var="Pba" value="${record.attributesMap['Plasmodium berghei str. ANKA']}"/>
          <c:set var="Pcc" value="${record.attributesMap['Plasmodium chabaudi chabaudi']}"/>
          <c:set var="Pf3d7" value="${record.attributesMap['Plasmodium falciparum 3D7']}"/>
          <c:set var="Pfi" value="${record.attributesMap['Plasmodium falciparum IT']}"/>
          <c:set var="Pkh" value="${record.attributesMap['Plasmodium knowlesi strain H']}"/>
          <c:set var="Pvs" value="${record.attributesMap['Plasmodium vivax SaI-1']}"/>
          <c:set var="Pyy" value="${record.attributesMap['Plasmodium yoelii yoelii str. 17XNL']}"/>
          <c:set var="Taa" value="${record.attributesMap['Theileria annulata strain Ankara']}"/>
          <c:set var="Tpm" value="${record.attributesMap['Theileria parva strain Muguga']}"/>
          <c:set var="Tgg" value="${record.attributesMap['Toxoplasma gondii GT1']}"/>
          <c:set var="Tgm" value="${record.attributesMap['Toxoplasma gondii ME49']}"/>
          <c:set var="Tgr" value="${record.attributesMap['Toxoplasma gondii RH']}"/>
          <c:set var="Tgv" value="${record.attributesMap['Toxoplasma gondii VEG']}"/>
          <c:set var="Tvg" value="${record.attributesMap['Trichomonas vaginalis G3']}"/>
          <c:set var="Tbl" value="${record.attributesMap['Trypanosoma brucei Lister strain 427']}"/>
          <c:set var="Tbt" value="${record.attributesMap['Trypanosoma brucei TREU927']}"/>
          <c:set var="Tbg" value="${record.attributesMap['Trypanosoma brucei gambiense']}"/>
          <c:set var="Tcon" value="${record.attributesMap['Trypanosoma congolense']}"/>
          <c:set var="Tcbe" value="${record.attributesMap['Trypanosoma cruzi CL Brener Esmeraldo-like']}"/>
          <c:set var="Tcbn" value="${record.attributesMap['Trypanosoma cruzi CL Brener Non-Esmeraldo-like']}"/>
          <c:set var="Tcbu" value="${record.attributesMap['Trypanosoma cruzi strain CL Brener']}"/>
          <c:set var="Tv" value="${record.attributesMap['Trypanosoma vivax']}"/>



<tr class="mytdStyle">
    <td style="border-right:3px solid grey" class="mytdStyle" align="left" title="${record.attributesMap['Description']}">${Metric_Type}</td>
    <td class="mytdStyle" align="right">${Eds}</td>
    <td class="mytdStyle" align="right">${Ehh}</td>
    <td style="border-right:3px solid grey"  class="mytdStyle" align="right">${Eii}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ch}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Cm}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Cp6}</td>
    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Cp}</td>
    <td class="mytdStyle" align="right">${Gaa}</td>
    <td class="mytdStyle" align="right">${Gab}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Gae}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ecg}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ei}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Eha}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ebh}</td>
    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Ncb}</td>
    <td class="mytdStyle" align="right">${Bb}</td>
    <td class="mytdStyle" align="right">${Taa}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Tpm}</td>
    <td class="mytdStyle" align="right">${Pba}</td>
    <td class="mytdStyle" align="right">${Pcc}</td>
    <td class="mytdStyle" align="right">${Pf3d7}</td>
    <td class="mytdStyle" align="right">${Pfi}</td>
    <td class="mytdStyle" align="right">${Pkh}</td>    
    <td class="mytdStyle" align="right">${Pvs}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Pyy}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Nc}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Eth}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tgg}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tgm}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tgr}</td>
    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Tgv}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Tvg}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Lb}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Li}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Lmf}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Lm}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ltp}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tbt}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tbl}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tbg}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tcon}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tcbu}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tcbe}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tcbn}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tv}</td>
</tr>
 
  </c:forEach>

</c:otherwise>
</c:choose>


  </table>
</div>


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

<site:footer/>
