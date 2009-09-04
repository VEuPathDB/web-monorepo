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

	<p>EuPathDB <a href="http://www.pathogenportal.org/">Bioinformatics Resource Center</a> for Biodefense and Emerging/Re-emerging Infectious Diseases is a portal for accessing genomic-scale datasets associated with the eukaryotic pathogens (<i>Cryptosporidium</i>, <i>Giardia</i>, <i>Leishmania</i>, <i>Neospora</i>, <i>Plasmodium</i>, <i>Toxoplasma</i>, <i>Trichomonas</i> and <i>Trypanosoma</i>). 
	<br>

	<table class="center" style="padding:2px;" width="95%"><tr>
	<td align="center" width="17%"><a href="http://cryptodb.org"><img border=0 src="/assets/images/CryptoDB/cryptodb.jpg"     height=50 width=50></a></td>
        <td align="center" width="17%"><a href="http://giardiadb.org"><img border=0 src="/assets/images/GiardiaDB/giardiadb.jpg"  height=50 width=50></a></td>
        <td align="center" width="17%"><a href="http://plasmodb.org"><img border=0 src="/assets/images/PlasmoDB/plasmodb.jpg"     height=50 width=50></a></td>
        <td align="center" width="17%"><a href="http://toxodb.org"><img border=0 src="/assets/images/ToxoDB/toxodb.jpg"           height=50 width=50></a></td>
        <td align="center" width="17%"><a href="http://trichdb.org"><img border=0 src="/assets/images/TrichDB/trichdb.jpg"        height=50 width=65></a></td>
        <td align="center" width="17%" ><a href="http://tritrypdb.org"><img border=0 src="/assets/images/TriTrypDB/tritrypdb.jpg" height=60 width=40></a></td>
	</tr></table>

	<br><br>
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
