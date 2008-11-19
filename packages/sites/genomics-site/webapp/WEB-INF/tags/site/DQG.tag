<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>



<div id="contentwrapper">

  <div id="contentcolumn">
	<div class="innertube">
<!--	  <h1>Using ${applicationScope.wdkModel.name}</h1>-->

<!--	<p align="center"><a href="<c:url value="/showQuestion.do?questionFullName=UniversalQuestions.UnifiedBlast"/>"><strong>BLAST</strong></a> &nbsp;|&nbsp;<a href="<c:url value="/srt.jsp"/>"><strong>Sequence Retrieval</strong></a> &nbsp;|&nbsp; <a href="#"><strong>PubMed and Entrez</strong></a> &nbsp;|&nbsp; <a href="#"><strong>GBrowse</strong></a> &nbsp;|&nbsp; <a href="#"><strong>CryptoCyc</strong></a></p> <br>
-->
<!--	<site:quickSearch />-->
		
	  
<!--      
      <p>&nbsp;</p><p>&nbsp;</p>
      
      <p>&nbsp;</p>
      <p>&nbsp;</p>-->
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
