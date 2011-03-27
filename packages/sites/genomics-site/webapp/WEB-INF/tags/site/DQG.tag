<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="project" value="${applicationScope.wdkModel.name}" />

<div id="contentwrapper">
<div id="contentcolumn">
<div class="innertube">

<c:choose>
<c:when test="${project == 'EuPathDB'}">

	<p><b>EuPathDB <a href="http://www.pathogenportal.org/">Bioinformatics Resource Center</a> for Biodefense and Emerging/Re-emerging Infectious Diseases is a portal for accessing genomic-scale datasets associated with the eukaryotic pathogens</b> (<i>Cryptosporidium</i>,  <i>Encephalitozoon</i>, <i>Entamoeba</i>, <i>Enterocytozoon</i>, <i>Giardia</i>, <i>Leishmania</i>, <i>Neospora</i>, <i>Plasmodium</i>, <i>Toxoplasma</i>, <i>Trichomonas</i> and <i>Trypanosoma</i>).
	<br>

	<table class="center" style="padding:2px;" width="95%"><tr>
<%--	<td align="center" width="12.5%"><a href="http://newsitedb.org"><img border=0 src="/assets/images/newSite.png" width="55" alt="NewSiteDB logo"></a></td> --%>

<c:set var="mywidth" value="11.11%" />

	<td align="center" width="${mywidth}"><a href="http://amoebadb.org"><img border=0 src="/assets/images/AmoebaDB/amoebadb_w50.png" alt="AmoebaDB logo"></a></td>
	<td align="center" width="${mywidth}"><a href="http://cryptodb.org"><img border=0 src="/assets/images/CryptoDB/cryptodb_w50.png" alt="CryptoDB logo"></a></td>
        <td align="center" width="${mywidth}"><a href="http://giardiadb.org"><img border=0 src="/assets/images/GiardiaDB/giardiadb_w50.png" alt="GiardiaDB logo"></a></td>
        <td align="center" width="${mywidth}"><a href="http://microsporidiadb.org"><img border=0 src="/assets/images/MicrosporidiaDB/microdb_w50.png" alt="MicrosporidiaDB logo"></a></td>
	<td align="center" width="${mywidth}"><a href="http://piroplasmadb.org"><img border=0 src="/assets/images/newSite.png" width="55" alt="PiroplasmaDB logo"></a></td>
        <td align="center" width="${mywidth}"><a href="http://plasmodb.org"><img border=0 src="/assets/images/PlasmoDB/plasmodb_w50.png" alt="PlasmoDB logo"></a></td>
        <td align="center" width="${mywidth}"><a href="http://toxodb.org"><img border=0 src="/assets/images/ToxoDB/toxodb_w50.png" alt="ToxoDB logo"></a></td>
        <td align="center" width="${mywidth}"><a href="http://trichdb.org"><img border=0 src="/assets/images/TrichDB/trichdb_w65.png" alt="TrichDB logo"></a></td>
        <td align="center" width="${mywidth}" ><a href="http://tritrypdb.org"><img border=0 src="/assets/images/TriTrypDB/tritrypdb_w40.png" alt="TriTrypDB logo"></a></td>
	</tr>

	<tr>
	<td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#67a790">AmoebaDB</td>
	<td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#a03f43">CryptoDB</td>
	<td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#67678d">GiardiaDB</td>
	<td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#013c63">MicrosporidiaDB</td>
	<td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:black">PiroplasmaDB</td>
	<td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#ad448e">PlasmoDB</td>
	<td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#af5672">ToxoDB</td>
	<td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#8d7658">TrichDB</td>
	<td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#4f9cce">TriTrypDB</td>
	</tr>
	</table>

	<br>
	</p>
</c:when>
<c:otherwise>
	<p>&nbsp;</p>
</c:otherwise>
</c:choose>

<table width="100%" border="0" class="threecolumn">
<tr>
    <td width="33%" align="center">
	   <c:set var="qSetName" value="GeneQuestions" />
       <site:DQG_bubble 
				banner="bubble_id_genes_by2.png" 
				alt_banner="Identify Genes By:" 
				recordClasses="genes"
	   />
    </td>
    <td width="34%"  align="center">
       <site:DQG_bubble 
				banner="bubble_id_other_data2.png" 
				alt_banner="Identify Other Data Types:" 
				recordClasses="others"
		/>
    </td>
    <td width="33%"  align="center">
       <site:DQG_bubble 
				banner="bubble_id_third_option2.png" 
				alt_banner="Tools:"
       />
	</td>
</tr>
</table>

</div>
</div>
</div>
