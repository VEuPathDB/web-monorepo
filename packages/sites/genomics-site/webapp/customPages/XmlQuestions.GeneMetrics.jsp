<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkXmlAnswer saved in request scope -->
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName} : Gene Metrics"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="GeneMetrics"
                 division="genemetrics"
                 headElement="${headElement}" />

<c:set var="cryptoColorHeader" value="#507494"/>
<c:set var="plasmoColorHeader" value="#507494"/>
<c:set var="toxoColorHeader" value="#507494"/>
<c:set var="giardiaColorHeader" value="#507494"/>
<c:set var="trichColorHeader" value="#507494"/>


<c:set var="cryptoColor" value="#E0E0EF"/>
<c:set var="plasmoColor" value="#ddccdd"/> 
<c:set var="toxoColor" value="#eff6ff"/> 
<c:set var="giardiaColor" value="#ffeff0"/> 
<c:set var="trichColor" value="#f6e9e4"/> 

<c:set var="orgWidth" value="7%"/>



<table align="center" width="100%" border="0" cellpadding="2" cellspacing="2">
<tr><td><font face="Arial,Helvetica">The <a href="http://eupathdb.org">ApiDB/EuPathDB Bioinformatics Resource Center (BRC)</a> designs, develops and maintains the EuPathDB, CryptoDB, GiardiaDB, PlasmoDB, ToxoDB and TrichDB websites. <br><br>
The table below summarizes the number of genes for the organisms currently available in ApiDB, by various datatypes. High gene numbers for rodent malaria parasites Pb, Pc & Py reflect incomplete sequence assembly and redundant gene models. <br></font>

<font size="-1"><i>(Cp, C. parvum; Ch, C. hominis; Gl, G. lamblia; Nc, N. caninum; Pb, P. berghei; Pc, P. chabaudi; Pf, P. falciparum; Pk, P. knowlesi; Pv, P. vivax; Py, P. yoelii; Tg, T. gondii; Tv, T. vaginalis.)</i></font><br>
</td></tr>
</table>


<c:choose>
  <c:when test='${xmlAnswer.resultSize == 0}'>
    Not available.
  </c:when>
  <c:otherwise>

<table align="center" width="100%" border="1" cellpadding="2" cellspacing="2">
<tr valign="top" align="center">
    <td valign="middle" width="35%"  bgcolor="#507494"><font color="white" face="Arial,Helvetica" size="+1">Genes</font></td>
    <td valign="middle" width=${orgWidth} bgcolor=${cryptoColorHeader}><font color="white" face="Arial,Helvetica" size="+1"><i>Ch</i></font></td>
    <td valign="middle" width=${orgWidth} bgcolor=${cryptoColorHeader}><font color="white"  face="Arial,Helvetica" size="+1"><i>Cp</i></font></td>
    <td valign="middle" width=${orgWidth} bgcolor=${giardiaColorHeader}><font color="white"  face="Arial,Helvetica" size="+1"><i>Gl</i></font></td>
    <td valign="middle" width=${orgWidth} bgcolor=${toxoColorHeader}><font color="white"  face="Arial,Helvetica" size="+1"><i>Nc</i></font></td>
    <td valign="middle" width=${orgWidth} bgcolor=${plasmoColorHeader}><font color="white" face="Arial,Helvetica" size="+1"><i>Pb</i></font></td>
    <td valign="middle" width=${orgWidth} bgcolor=${plasmoColorHeader}><font color="white" face="Arial,Helvetica" size="+1"><i>Pc</i></font></td>
    <td valign="middle" width=${orgWidth} bgcolor=${plasmoColorHeader}><font color="white" face="Arial,Helvetica" size="+1"><i>Pf</i></font></td>
    <td valign="middle" width=${orgWidth} bgcolor=${plasmoColorHeader}><font color="white" face="Arial,Helvetica" size="+1"><i>Pk</i></font></td>
    <td valign="middle" width=${orgWidth} bgcolor=${plasmoColorHeader}><font color="white" face="Arial,Helvetica" size="+1"><i>Pv</i></font></td>
    <td valign="middle" width=${orgWidth} bgcolor=${plasmoColorHeader}><font color="white" face="Arial,Helvetica" size="+1"><i>Py</i></font></td>
    <td valign="middle" width=${orgWidth} bgcolor=${toxoColorHeader}><font color="white" face="Arial,Helvetica" size="+1"><i>Tg</i></font></td>
<td valign="middle" width=${orgWidth} bgcolor=${trichColorHeader}><font color="white" face="Arial,Helvetica" size="+1"><i>Tv</i></font></td>
</tr>




  <c:forEach items="${xmlAnswer.recordInstances}" var="record">

	 <c:set var="Metric_Type" value="${record.attributesMap['Metric_Type']}"/>
	 <c:set var="Ch" value="${record.attributesMap['Cryptosporidium_hominis']}"/>
	 <c:set var="Cp" value="${record.attributesMap['Cryptosporidium_parvum']}"/>
	 <c:set var="Gl" value="${record.attributesMap['Giardia_lamblia']}"/>
	 <c:set var="Nc" value="${record.attributesMap['Neospora_caninum']}"/>
	 <c:set var="Pb" value="${record.attributesMap['Plasmodium_berghei']}"/>
	 <c:set var="Pc" value="${record.attributesMap['Plasmodium_chabaudi']}"/>
	 <c:set var="Pf" value="${record.attributesMap['Plasmodium_falciparum']}"/>
	 <c:set var="Pk" value="${record.attributesMap['Plasmodium_knowlesi']}"/>
	 <c:set var="Pv" value="${record.attributesMap['Plasmodium_vivax']}"/>
	 <c:set var="Py" value="${record.attributesMap['Plasmodium_yoelii']}"/>
	 <c:set var="Tg" value="${record.attributesMap['Toxoplasma_gondii']}"/>
	 <c:set var="Tv" value="${record.attributesMap['Trichomonas_vaginalis']}"/> 



    <tr valign="top" align="left">
    <td valign="top"><font face="Arial,Helvetica">${Metric_Type}</a></font></td>
    <td valign="top" align="right" bgcolor=${cryptoColor}><font face="Arial,Helvetica">${Ch}</font></td>
    <td valign="top" align="right" bgcolor=${cryptoColor}><font face="Arial,Helvetica">${Cp}</font></td>
    <td valign="top" align="right" bgcolor=${giardiaColor}><font face="Arial,Helvetica">${Gl}</font></td>
    <td valign="top" align="right" bgcolor=${toxoColor}><font face="Arial,Helvetica">${Nc}</font></td>
    <td valign="top" align="right" bgcolor=${plasmoColor}><font face="Arial,Helvetica">${Pb}</font></td>
    <td valign="top" align="right" bgcolor=${plasmoColor}><font face="Arial,Helvetica">${Pc}</font></td>
    <td valign="top" align="right" bgcolor=${plasmoColor}><font face="Arial,Helvetica">${Pf}</font></td>
    <td valign="top" align="right" bgcolor=${plasmoColor}><font face="Arial,Helvetica">${Pk}</font></td>    
    <td valign="top" align="right" bgcolor=${plasmoColor}><font face="Arial,Helvetica">${Pv}</font></td>
    <td valign="top" align="right" bgcolor=${plasmoColor}><font face="Arial,Helvetica">${Py}</font></td>
    <td valign="top" align="right" bgcolor=${toxoColor}><font face="Arial,Helvetica">${Tg}</font></td>
    <td valign="top" align="right" bgcolor=${trichColor}><font face="Arial,Helvetica">${Tv}</font></td>
    </tr>

 
  </c:forEach>



  </table>

  </c:otherwise>
</c:choose>





<site:footer/>
