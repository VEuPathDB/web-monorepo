<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>



<div id="contentwrapper">
<div id="contentcolumn">
<div class="innertube">

<p>&nbsp;</p>
<table width="100%" border="0" class="3column">
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
