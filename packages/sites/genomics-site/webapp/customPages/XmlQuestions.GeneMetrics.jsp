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

<site:header  title="EuPathDB :: Gene Metrics"
                 banner="EuPathDB Gene Metrics"
                 parentDivision="EuPathDB"
                 parentUrl="/home.jsp"
                 divisionName="allSites"
                 division="geneMetrics"/>


<c:set var="cryptoColorHeader" value="#507494"/>
<c:set var="plasmoColorHeader" value="#507494"/>
<c:set var="toxoColorHeader" value="#507494"/>
<c:set var="giardiaColorHeader" value="#507494"/>
<c:set var="trichColorHeader" value="#507494"/>
<c:set var="tritrypColorHeader" value="#507494"/>


<c:set var="cryptoColor" value="#E0E0EF"/>
<c:set var="plasmoColor" value="#ddccdd"/> 
<c:set var="toxoColor" value="#eff6ff"/> 
<c:set var="giardiaColor" value="#ffeff0"/> 
<c:set var="trichColor" value="#f6e9e4"/> 
<c:set var="tritrypColor" value="#FFC4BF"/> 

<c:set var="orgWidth" value="4%"/>

<c:set var="ncbiTaxPage" value="http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=237895&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock"/>


<table align="center" width="100%" border="0" cellpadding="2" cellspacing="2">
<tr><td><h2>EuPathDB Gene Metrics</h2></td></tr>

<tr><td><font face="Arial,Helvetica">The EuPathDB <a href="http://pathogenportal.org"><b>Bioinformatics Resource Center (BRC)</b></a> designs, develops and maintains the <a href="http://eupathdb.org">EuPathDB</a>, <a href="http://cryptodb.org">CryptoDB</a>, <a href="http://giardiadb.org">GiardiaDB</a>, <a href="http://plasmodb.org">PlasmoDB</a>, <a href="http://toxodb.org">ToxoDB</a>, <a href="http://trichdb.org">TrichDB</a> and <a href="http://tritrypdb.org">TriTrypDB</a> websites. <br><br>
The Gene Metrics table summarizes the number of genes for the organisms currently available in EuPathDB, by various datatypes. High gene numbers for rodent malaria parasites Pb, Pc & Py reflect incomplete sequence assembly and redundant gene models. <br></font>
</td></tr>
</table>


<c:choose>
  <c:when test='${xmlAnswer.resultSize == 0}'>
    Not available.
  </c:when>
  <c:otherwise>


<c:set var="myStyle" value="border-width:0.5px;padding:3px;border-style:inset;border-color:gray;-moz-border-radius:0px;"/>

<table align="center" width="100%" style="border-width:1px;border-spacing:2px;border-style:outset;border-color:gray;border-collapse:separate;background-color:white">
<tr valign="top" align="center" style="${myStyle}">
    <td valign="middle" style="background-color:#507494;color:white;${myStyle}">Genes</td>
    <td valign="middle" width=${orgWidth} style="background-color:${cryptoColorHeader};color:white;${myStyle}" <i>Ch</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${cryptoColorHeader};color:white;${myStyle}"><i>Cm</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${cryptoColorHeader};color:white;${myStyle}"><i>Cp</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${giardiaColorHeader};color:white;${myStyle}"><i>Gl</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${tritrypColorHeader};color:white;${myStyle}"><i>Lb</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${tritrypColorHeader};color:white;${myStyle}"><i>Li</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${tritrypColorHeader};color:white;${myStyle}"><i>Lm</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${toxoColorHeader};color:white;${myStyle}"><i>Nc</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${plasmoColorHeader};color:white;${myStyle}"><i>Pb</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${plasmoColorHeader};color:white;${myStyle}"><i>Pc</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${plasmoColorHeader};color:white;${myStyle}"><i>Pf</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${plasmoColorHeader};color:white;${myStyle}"><i>Pk</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${plasmoColorHeader};color:white;${myStyle}"><i>Pv</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${plasmoColorHeader};color:white;${myStyle}"><i>Py</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${toxoColorHeader};color:white;${myStyle}"><i>Tg</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${trichColorHeader};color:white;${myStyle}"><i>Tv</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${tritrypColorHeader};color:white;${myStyle}"><i>Tb</i></td>
    <td valign="middle" width=${orgWidth} style="background-color:${tritrypColorHeader};color:white;${myStyle}"><i>Tc</i></td>
</tr>

  <c:forEach items="${xmlAnswer.recordInstances}" var="record">

	 <c:set var="Metric_Type" value="${record.attributesMap['Metric_Type']}"/>
	 <c:set var="Ch" value="${record.attributesMap['Cryptosporidium_hominis']}"/>
 	 <c:set var="Cm" value="${record.attributesMap['Cryptosporidium_muris']}"/>
	 <c:set var="Cp" value="${record.attributesMap['Cryptosporidium_parvum']}"/>
	 <c:set var="Gl" value="${record.attributesMap['Giardia_lamblia']}"/>
	 <c:set var="Lb" value="${record.attributesMap['Leishmania_braziliensis']}"/>
	 <c:set var="Li" value="${record.attributesMap['Leishmania_infantum']}"/>
	 <c:set var="Lm" value="${record.attributesMap['Leishmania_major']}"/>
         <c:set var="Nc" value="${record.attributesMap['Neospora_caninum']}"/>
	 <c:set var="Pb" value="${record.attributesMap['Plasmodium_berghei']}"/>
	 <c:set var="Pc" value="${record.attributesMap['Plasmodium_chabaudi']}"/>
	 <c:set var="Pf" value="${record.attributesMap['Plasmodium_falciparum']}"/>
	 <c:set var="Pk" value="${record.attributesMap['Plasmodium_knowlesi']}"/>
	 <c:set var="Pv" value="${record.attributesMap['Plasmodium_vivax']}"/>
	 <c:set var="Py" value="${record.attributesMap['Plasmodium_yoelii']}"/>
	 <c:set var="Tg" value="${record.attributesMap['Toxoplasma_gondii']}"/>
	 <c:set var="Tv" value="${record.attributesMap['Trichomonas_vaginalis']}"/>
         <c:set var="Tb" value="${record.attributesMap['Trypanosoma_brucei']}"/> 
         <c:set var="Tc" value="${record.attributesMap['Trypanosoma_cruzi']}"/> 



<tr valign="top" align="right" style="${myStyle}">
    <td valign="top" align="left" style="${myStyle}">${Metric_Type}</td>
    <td valign="top" style="background-color:${cryptoColor};${myStyle}">${Ch}</td>
    <td valign="top" style="background-color:${cryptoColor};${myStyle}">${Cm}</td>
    <td valign="top" style="background-color:${cryptoColor};${myStyle}">${Cp}</td>
    <td valign="top" style="background-color:${giardiaColor};${myStyle}">${Gl}</td>
    <td valign="top" style="background-color:${tritrypColor};${myStyle}">${Lb}</td>
    <td valign="top" style="background-color:${tritrypColor};${myStyle}">${Li}</td>
    <td valign="top" style="background-color:${tritrypColor};${myStyle}">${Lm}</td>
    <td valign="top" style="background-color:${toxoColor};${myStyle}">${Nc}</td>
    <td valign="top" style="background-color:${plasmoColor};${myStyle}">${Pb}</td>
    <td valign="top" style="background-color:${plasmoColor};${myStyle}">${Pc}</td>
    <td valign="top" style="background-color:${plasmoColor};${myStyle}">${Pf}</td>
    <td valign="top" style="background-color:${plasmoColor};${myStyle}">${Pk}</td>    
    <td valign="top" style="background-color:${plasmoColor};${myStyle}">${Pv}</td>
    <td valign="top" style="background-color:${plasmoColor};${myStyle}">${Py}</td>
    <td valign="top" style="background-color:${toxoColor};${myStyle}">${Tg}</td>
    <td valign="top" style="background-color:${trichColor};${myStyle}">${Tv}</td>
    <td valign="top" style="background-color:${tritrypColor};${myStyle}">${Tb}</td>
    <td valign="top" style="background-color:${tritrypColor};${myStyle}">${Tc}</td>
</tr>
 
  </c:forEach>



  </table>


<table align="center" width="100%" border="0" cellpadding="2" cellspacing="2">
<tr><td>
<font size="-1"><i><b>Cryptosporidium</b>: Cp, C. parvum; Ch, C. hominis; <b>Giardia</b> Gl, G. lamblia; <b>Neospora</b>: Nc, N. caninum; <b>Leishmania</b>: Lb, L. braziliensis; Li, L. infantum; Lm, L. major;  <b>Plasmodium</b>: Pb, P. berghei; Pc, P. chabaudi; Pf, P. falciparum; Pk, P. knowlesi; Pv, P. vivax; Py, P. yoelii; <b>Toxoplasma</b>: Tg, T. gondii; <b>Trichomonas</b>: Tv, T. vaginalis; <b>Trypanosoma</b>: Tb, T. brucei; Tc, T. cruzi.)</i></font><br>
</td></tr>
</table>

  </c:otherwise>
</c:choose>





<site:footer/>
