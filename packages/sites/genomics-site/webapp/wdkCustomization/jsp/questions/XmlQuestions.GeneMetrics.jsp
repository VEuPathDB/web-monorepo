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


<table width="100%">
<tr><td><h2>EuPathDB Gene Metrics</h2></td>
    <td align="right"><a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.GenomeDataType"/>">EuPathDB Genomes and Data Types >>></a></td>
</tr>

<tr><td colspan="2">The EuPathDB <a href="http://pathogenportal.org"><b>Bioinformatics Resource Center (BRC)</b></a> designs, develops and maintains the <a href="http://eupathdb.org">EuPathDB</a>,  <a href="http://amoebadb.org">AmoebaDB</a>, <a href="http://cryptodb.org">CryptoDB</a>, <a href="http://giardiadb.org">GiardiaDB</a>,  <a href="http://microsporidiadb.org">MicrosporidiaDB</a>, <a href="http://plasmodb.org">PlasmoDB</a>, <a href="http://toxodb.org">ToxoDB</a>, <a href="http://trichdb.org">TrichDB</a> and <a href="http://tritrypdb.org">TriTrypDB</a> websites. <br><br>
The Gene Metrics table summarizes the number of genes for the organisms currently available in EuPathDB, including their available evidence. High gene numbers (such as for rodent malaria parasites Pb, Pc & Py) reflect incomplete sequence assembly and redundant gene models. <br><br>
<i>(Please mouse over gene metrics for a definition; mouse over acronyms for the organism full name.)</i><br>
</td></tr>
</table>

<table  class="mytableStyle" width="100%">
<c:choose>
  <c:when test='${xmlAnswer.resultSize == 0}'>
    <tr><td>Not available.</td></tr></table>
  </c:when>
  <c:otherwise>

<%-- Organisms/species grouped by websites, alphabetically in each group --%>
<c:set var="bgcolor" value="#efefef"/> 
<tr class="mythStyle">
    <td style="background-color:white;border-right:3px solid grey;border-top:0px none;border-left:0 none;"></td>
    <td style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://amoebadb.org">AmoebaDB</a></td>
    <td style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://cryptodb.org">CryptoDB</a></td>
    <td style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://giardiadb.org">GiardiaDB</a></td>
    <td style="border-right:3px solid grey" colspan="3" class="mythStyle"><a href="http://microsporidiadb.org">&mu;-sporidiaDB</a></td>
    <td style="border-right:3px solid grey" colspan="6" class="mythStyle"><a href="http://plasmodb.org">PlasmoDB</a></td>
    <td style="border-right:3px solid grey" colspan="2" class="mythStyle"><a href="http://toxodb.org">ToxoDB</a></td>
    <td style="border-right:3px solid grey" colspan="1" class="mythStyle"><a href="http://trichdb.org">TrichDB</a></td>
    <td colspan="8" class="mythStyle"><a href="http://tritrypdb.org">TriTrypDB</a></td>
</tr>
<tr class="mythStyle">
    <td  style="border-right:3px solid grey" class="mythStyle" title="">Gene Metric</td>
    <td class="mythStyle" title="Entamoeba dispar, AmoebaDB"><i>Ed</i></td>
    <td class="mythStyle" title="Entamoeba histolytica, AmoebaDB"><i>Eh</i></td>
    <td  style="border-right:3px solid grey"class="mythStyle" title="Entamoeba invadens, AmoebaDB"><i>Einv</i></td>
    <td class="mythStyle" title="Cryptosporidium hominis, CryptoDB"><i>Ch</i></td>
    <td class="mythStyle" title="Cryptosporidium muris, CryptoDB"  ><i>Cm</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Cryptosporidium parvum, CryptoDB" ><i>Cp</i></td>
    <td class="mythStyle" title="Giardia_Assemblage_A_isolate_WB, GiardiaDB" ><i>GA*</i></td>
    <td class="mythStyle" title="Giardia_Assemblage_B_isolate_GS, GiardiaDB" ><i>GB</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Giardia_Assemblage_E_isolate_P15, GiardiaDB" ><i>GE</i></td>
    <td class="mythStyle" title="Encephalitozoon cuniculi, MicrosporidiaDB"><i>Ec</i></td>
    <td class="mythStyle" title="Encephalitozoon intestinalis, MicrosporidiaDB"><i>Eint</i></td>
    <td  style="border-right:3px solid grey"  class="mythStyle" title="Enterocytozoon bieneusi, MicrosporidiaDB"><i>Eb</i></td>
    <td class="mythStyle" title="Plasmodium berghei, PlasmoDB"><i>Pb</i></td>
    <td class="mythStyle" title="Plasmodium chabaudi, PlasmoDB"><i>Pc</i></td>
    <td class="mythStyle" title="Plasmodium falciparum, PlasmoDB"><i>Pf</i></td>
    <td class="mythStyle" title="Plasmodium knowlesi, PlasmoDB"><i>Pk</i></td>
    <td class="mythStyle" title="Plasmodium vivax, PlasmoDB"><i>Pv</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Plasmodium yoelii, PlasmoDB"><i>Py</i></td>
    <td class="mythStyle" title="Neospora caninum, ToxoDB"><i>Nc</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Toxoplasma gondii"><i>Tg**</i></td>
    <td  style="border-right:3px solid grey" class="mythStyle" title="Trichomonas vaginalis,TrichDB"><i>Tva</i></td>
    <td class="mythStyle" title="Leishmania braziliensis, TriTrypDB"><i>Lb</i></td>
    <td class="mythStyle" title="Leishmania infantum, TriTrypDB"><i>Li</i></td>
    <td class="mythStyle" title="Leishmania major, TriTrypDB"><i>Lma</i></td>
    <td class="mythStyle" title="Leishmania mexicana, TriTrypDB"><i>Lme</i></td>
    <td class="mythStyle" title="Trypanosoma brucei, TriTrypDB"><i>Tb+</i></td>
    <td class="mythStyle" title="Trypanosoma congolense, TriTrypDB"><i>Tco</i></td>
    <td class="mythStyle" title="Trypanosoma cruzi, TriTrypDB"><i>Tcr++</i></td>
   <td class="mythStyle" title="Trypanosoma vivax, TriTrypDB"><i>Tvi</i></td>
</tr>

  <c:forEach items="${xmlAnswer.recordInstances}" var="record">

	 <c:set var="Metric_Type" value="${record.attributesMap['Metric_Type']}"/>
	 <c:set var="Ed" value="${record.attributesMap['Entamoeba_dispar']}"/>
	 <c:set var="Eh" value="${record.attributesMap['Entamoeba_histolytica']}"/>
	 <c:set var="Einv" value="${record.attributesMap['Entamoeba_invadens']}"/>
	 <c:set var="Ch" value="${record.attributesMap['Cryptosporidium_hominis']}"/>
 	 <c:set var="Cm" value="${record.attributesMap['Cryptosporidium_muris']}"/>
	 <c:set var="Cp" value="${record.attributesMap['Cryptosporidium_parvum']}"/>
	 <c:set var="GA" value="${record.attributesMap['Giardia_Assemblage_A_isolate_WB']}"/>
	 <c:set var="GB" value="${record.attributesMap['Giardia_Assemblage_B_isolate_GS']}"/>
	 <c:set var="GE" value="${record.attributesMap['Giardia_Assemblage_E_isolate_P15']}"/>
         <c:set var="Ec" value="${record.attributesMap['Encephalitozoon_cuniculi']}"/>
         <c:set var="Eint" value="${record.attributesMap['Encephalitozoon_intestinalis']}"/>
         <c:set var="Eb" value="${record.attributesMap['Enterocytozoon_bieneusi']}"/>
         <c:set var="Nc" value="${record.attributesMap['Neospora_caninum']}"/>
	 <c:set var="Pb" value="${record.attributesMap['Plasmodium_berghei']}"/>
	 <c:set var="Pc" value="${record.attributesMap['Plasmodium_chabaudi']}"/>
	 <c:set var="Pf" value="${record.attributesMap['Plasmodium_falciparum']}"/>
	 <c:set var="Pk" value="${record.attributesMap['Plasmodium_knowlesi']}"/>
	 <c:set var="Pv" value="${record.attributesMap['Plasmodium_vivax']}"/>
	 <c:set var="Py" value="${record.attributesMap['Plasmodium_yoelii']}"/>
	 <c:set var="Tg" value="${record.attributesMap['Toxoplasma_gondii']}"/>
	 <c:set var="Tva" value="${record.attributesMap['Trichomonas_vaginalis']}"/>
         <c:set var="Lb" value="${record.attributesMap['Leishmania_braziliensis']}"/>
	 <c:set var="Li" value="${record.attributesMap['Leishmania_infantum']}"/>
	 <c:set var="Lma" value="${record.attributesMap['Leishmania_major']}"/>
	 <c:set var="Lme" value="${record.attributesMap['Leishmania_mexicana']}"/>
         <c:set var="Tb" value="${record.attributesMap['Trypanosoma_brucei']}"/> 
         <c:set var="Tco" value="${record.attributesMap['Trypanosoma_congolense']}"/> 
         <c:set var="Tcr" value="${record.attributesMap['Trypanosoma_cruzi']}"/> 
         <c:set var="Tvi" value="${record.attributesMap['Trypanosoma_vivax']}"/> 



<tr class="mytdStyle">
    <td style="border-right:3px solid grey" class="mytdStyle" align="left" title="${record.attributesMap['Description']}">${Metric_Type}</td>
    <td class="mytdStyle" align="right">${Ed}</td>
    <td class="mytdStyle" align="right">${Eh}</td>
    <td style="border-right:3px solid grey"  class="mytdStyle" align="right">${Einv}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ch}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Cm}</td>
    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Cp}</td>
    <td class="mytdStyle" align="right">${GA}</td>
    <td class="mytdStyle" align="right">${GB}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${GE}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Ec}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Eint}</td>
    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Eb}</td>
    <td class="mytdStyle" align="right">${Pb}</td>
    <td class="mytdStyle" align="right">${Pc}</td>
    <td class="mytdStyle" align="right">${Pf}</td>
    <td class="mytdStyle" align="right">${Pk}</td>    
    <td class="mytdStyle" align="right">${Pv}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Py}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Nc}</td>
    <td style="background-color:${bgcolor};border-right:3px solid grey" class="mytdStyle" align="right">${Tg}</td>
    <td style="border-right:3px solid grey" class="mytdStyle" align="right">${Tva}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Lb}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Li}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Lma}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Lme}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tb}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tco}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tcr}</td>
    <td style="background-color:${bgcolor}" class="mytdStyle" align="right">${Tvi}</td>
</tr>
 
  </c:forEach>



  </table>


<table width="100%">
<tr><td>
<font size="-1"><b>Cryptosporidium</b>: Ch, <i>C. hominis</i>; Cm, <i>C. muris</i>; Cp, <i>C. parvum</i>; <b>Encephalitozoon</b>: Ec, <i>E. cuniculi</i>; Eint, <i>E. intestinalis</i>;  <b>Entamoeba</b>: Ed, <i>E. dispar</i>; Eh, <i>E. histolytica</i>; Einv, <i>E. invadens</i>; <b>Enterocytozoon</b>: Eb, <i>E. bieneusi</i>; <b>Giardia</b> GA, <i>G.Assemblage_A_isolate_WB</i>; GB, <i>G.Assemblage_B_isolate_GS</i>; GE, <i>G.Assemblage_E_isolate_P15</i>; <b>Leishmania</b>: Lb, <i>L. braziliensis</i>; Li, <i>L. infantum</i>; Lma, <i>L. major</i>; Lme, <i>L. mexicana</i>; <b>Neospora</b>: Nc, <i>N. caninum</i>; <b>Plasmodium</b>: Pb, <i>P. berghei</i>; Pc, <i>P. chabaudi</i>; Pf, <i>P. falciparum</i>; Pk, <i>P. knowlesi</i>; Pv, <i>P. vivax</i>; Py, <i>P. yoelii</i>; <b>Toxoplasma</b>: Tg, <i>T. gondii</i>; <b>Trichomonas</b>: Tva, <i>T. vaginalis</i>; <b>Trypanosoma</b>: Tb, <i>T. brucei</i>; Tco, <i>T. congolense</i>; Tcr, <i>T. cruzi</i>; Tvi, <i>T. vivax</i>.</font><br>
</td></tr>
<br>
<tr><td colspan="10"><font size="-2"><hr>* In addition, <i>G. lamblia</i> has 3766 deprecated genes that are not included in the official gene count.</font></td></tr>
<tr><td colspan="10"><font size="-2">** <i>T.gondii</i> gene groups identified in ToxoDB across the three strains (ME49, GT1, VEG) and the A
picoplast.</font></td></tr>
<tr><td colspan="10"><font size="-2">+ <i>T.brucei</i> shows the number of distinct genes among theTREU927, gambiense and 427 strains.</font></td></tr>
<tr><td colspan="10"><font size="-2">++ <i>T.cruzi</i> shows the number of distinct genes among the Esmeraldo like and Non-Esmeraldo like genes, plus the unassigned.</font></td></tr>
</table>

  </c:otherwise>
</c:choose>





<site:footer/>
