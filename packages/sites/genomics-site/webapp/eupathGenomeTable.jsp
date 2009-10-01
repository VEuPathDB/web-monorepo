<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<site:header refer="home"/>

<site:sidebar />

<div id="contentwrapper">
<div id="contentcolumn">
<div class="innertube">




<c:set var="cryptoDate" value="01/2009"/>
<c:set var="plasmoDate" value="09/2008"/>
<c:set var="toxoDate" value="11/2008"/>


<%-- GENOME TABLE  --%>

<%-- MOUSE OVERS using overLIB
http://www.bosrup.com/web/overlib/?Documentation
--%>

<%-- this makes loading the front page too slow, mostly when we use upenn databses....

<c:set var="PfresultSize">
   <c:import url="http://www.plasmodb.org/plasmo/showSummary.do?questionFullName=GeneQuestions.GenesByTaxon&myProp%28organism%29=Plasmodium+falciparum&resultSizeOnly" />
</c:set>
<c:set var="PvresultSize">
   <c:import url="http://www.plasmodb.org/plasmo/showSummary.do?questionFullName=GeneQuestions.GenesByTaxon&myProp%28organism%29=Plasmodium+vivax&resultSizeOnly" />
</c:set>
<c:set var="PyresultSize">
   <c:import url="http://www.plasmodb.org/plasmo/showSummary.do?questionFullName=GeneQuestions.GenesByTaxon&myProp%28organism%29=Plasmodium+yoelii&resultSizeOnly" />
</c:set>

 --%>

<h2>Genomes in EuPathDB</h2>

<table width="100%" border="0" cellspacing="0" cellpadding="0">

<tr valign="bottom">

	<td align="left" valign="top" colspan="3">
<%-- <font size = "-2">(Mouse over organism for more information)</font> --%>
 	</td>

	<td align="right" valign="top"  colspan="20" ><font size = "-2">(<b>M</b>=Microarray, <b>Pr</b>=Proteomics, <b>Pa</b>=Pathway)</td>

</tr>






<tr>
             <td width="30%" align="left"><font size = "-1"><b>Organism/Strain</b></font></td>
             <td align="center"><font size = "-2"><b>Last Updated</b></font></td>
             <td align="right"><font size = "-2"><b>Genomic<br>Sequence<br>Size (Mb)</b></font></td>
             <td align="right"><font size = "-2"><b>Gene<br>Count</b></font></td>
             <td align="center"><font size = "-2"><b>Multiple<br>Strains</b></font></td>
	     <td align="right"><font size = "-2"><b>SNPs</b></font></td>
             <td align="right"><font size = "-2"><b>ESTs</b></font></td>
             <td align="right"><font size = "-1"><b>M&nbsp;</b></font></td>
             <td align="center"><font size = "-1"><b>Pr</b></font></td>
             <td align="center"><font size = "-1"><b>Pa</b></font></td>
</tr>


											<%-- CRYPTOSPORIDIUM --%>
<tr>
             <td  align="left"><font size = "-2"><b><i>Cryptosporidium</i></b></td>
</tr>



<%-- CRYPTOSPORIDIUM HOMINIS --%>

<tr class="genomeTable3">
             <td  align="left"><a href="javascript:void(0);" class='no_underline' 
	       onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=237895&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>237895</a></TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>1 (10/2004)</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Genbank <a href=\'http://cryptodb.org/cryptodb/showXmlDataContent.do?name=XmlQuestions.DataSources\' style=\'color:#660000\'>(CryptoDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>TU502</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>N.A.</TD></TR></TABLE>',
		CAPTION, '<i>C. hominis</i> TU502',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>C. hominis</i> TU502</a></td>

             <td align="center"><font size = "-2">
		<a href="http://cryptodb.org/cryptodb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">01/2009</a></td>
             <td align="right"><font size = "-2">8.74</td>
             <td align="right"><font size = "-2">3956</td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://cryptodb.org/cryptodb/showXmlDataContent.do?name=XmlQuestions.DataSources#Proteome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"><a href="http://cryptocyc.cryptodb.org/"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>

</tr>

<%-- CRYPTOSPORIDIUM MURIS --%>

<tr>
             <td  align="left"><a href="javascript:void(0);" class='no_underline' 
	       onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5808&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5808</a></TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>1 (10/2004)</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Genbank <a href=\'http://cryptodb.org/cryptodb/showXmlDataContent.do?name=XmlQuestions.DataSources\' style=\'color:#660000\'>(CryptoDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>N.A.</TD></TR></TABLE>',
		CAPTION, '<i>C. muris</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>C. muris</i></a></td>

             <td align="center"><font size = "-2">
		<a href="http://cryptodb.org/cryptodb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">${cryptoDate}</a></td>
             <td align="right"><font size = "-2">8.48</td>
             <td align="right"><font size = "-2"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://qa.cryptodb.org/cryptodb3.7/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=CparvumESTs,WatanabeCpHNJ-1_EstLibrary,dbEST&title=Query#dbEST"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>

</tr>


<%-- CRYPTOSPORIDIUM PARVUM --%>
<tr class="genomeTable3">
             <td align="left"><a href="javascript:void(0);" class='no_underline' 
	       onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5807&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5807</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>1 (03/2004)</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Genbank <a href=\'http://cryptodb.org/cryptodb/showXmlDataContent.do?name=XmlQuestions.DataSources\' style=\'color:#660000\'>(CryptoDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>IOWA</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>N.A.</TD></TR></TABLE>',
	        CAPTION, '<i>C. parvum</i> IOWA',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>C. parvum</i> IOWA</a></td>

             <td align="center"><font size = "-2">
		<a href="http://cryptodb.org/cryptodb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">${cryptoDate}</a></td>
             <td align="right"><font size = "-2">9.09</td>
             <td align="right"><font size = "-2">3886</td>
            <td align="center"></td>
             <td align="center"><a href="http://cryptodb.org/cryptodb/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=Widmer_SNPs&title=Query#Widmer_SNPs"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"><a href="http://qa.cryptodb.org/cryptodb3.7/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=CparvumESTs,WatanabeCpHNJ-1_EstLibrary,dbEST&title=Query#dbEST"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"><a href="http://cryptodb.org/cryptodb/showXmlDataContent.do?name=XmlQuestions.DataSources#Proteome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"><a href="http://cryptocyc.cryptodb.org/"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
            
</tr>


<tr>
             <td  align="left"><font size = "-2"><b><i>Giardia</i></b></td>
</tr>



<%-- GIARDIA LAMBLIA --%>

<tr>
             <td  align="left"><a href="javascript:void(0);" class='no_underline' 
	       onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=184922&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>184922</a></TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>1 (07/2007)</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Genbank <a href=\'http://giardiadb.org/giardiadb/showXmlDataContent.do?name=XmlQuestions.DataSources\' style=\'color:#660000\'>(GiardiaDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>ATCC 50803</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>N.A.</TD></TR></TABLE>',
		CAPTION, '<i>G. lamblia ATCC 50803</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>G. lamblia ATCC 50803</i></a></td>

             <td align="center"><font size = "-2">
		<a href="http://giardiadb.org/giardiadb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">05/2008</a></td>
             <td align="right"><font size = "-2">11.19</td>
             <td align="right"><font size = "-2">4969*</td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://giardiadb.org/giardiadb/showXmlDataContent.do?name=XmlQuestions.DataSources#Transcriptome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>

</tr>




<tr>
             <td  align="left"><font size = "-2"><b><i>Kinetoplastid</i></b></td>
</tr>


<%-- KINETOPLASTIDS --%>

<tr>
             <td  align="left"><a href="javascript:void(0);" class='no_underline' 
	       onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5660&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5660</a></TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>11/2009</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Genbank <a href=\'http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources\' style=\'color:#660000\'>(TriTrypDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>N.A.</TD></TR></TABLE>',
		CAPTION, '<i>L. braziliensis</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>L. braziliensis</i></a></td>

             <td align="center"><font size = "-2">
		<a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">02/2009</a></td>
             <td align="right"><font size = "-2">31.4</td>
             <td align="right"><font size = "-2">8278</td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources#Transcriptome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"><a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources#Proteoome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>

</tr>

<tr>
             <td  align="left"><a href="javascript:void(0);" class='no_underline' 
	       onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5671&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5671</a></TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>11/2009</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Genbank <a href=\'http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources\' style=\'color:#660000\'>(TriTrypDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>N.A.</TD></TR></TABLE>',
		CAPTION, '<i>L. infantum</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>L. infantum</i></a></td>

             <td align="center"><font size = "-2">
		<a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">02/2009</a></td>
             <td align="right"><font size = "-2">32.1</td>
             <td align="right"><font size = "-2">8387</td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources#Transcriptome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"><a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources#Proteoome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>

</tr>

<tr>
             <td  align="left"><a href="javascript:void(0);" class='no_underline' 
	       onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5664&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5664</a></TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>11/2009</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Genbank <a href=\'http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources\' style=\'color:#660000\'>(TriTrypDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>N.A.</TD></TR></TABLE>',
		CAPTION, '<i>L. major</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>L. major</i></a></td>

             <td align="center"><font size = "-2">
		<a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">02/2009</a></td>
             <td align="right"><font size = "-2">32.9</td>
             <td align="right"><font size = "-2">9251</td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources#Transcriptome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"><a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources#Proteoome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>

</tr>

<tr>
             <td  align="left"><a href="javascript:void(0);" class='no_underline' 
	       onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5664&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5664</a></TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>11/2009</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Genbank <a href=\'http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources\' style=\'color:#660000\'>(TriTrypDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>N.A.</TD></TR></TABLE>',
		CAPTION, '<i>L. tarantolae</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>L. tarantolae</i></a></td>

             <td align="center"><font size = "-2">
		<a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">02/2009</a></td>
             <td align="right"><font size = "-2"></td>
             <td align="right"><font size = "-2"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>

</tr>

<tr>
             <td  align="left"><a href="javascript:void(0);" class='no_underline' 
	       onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5691&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5691</a></TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>11/2009</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Genbank <a href=\'http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources\' style=\'color:#660000\'>(TriTrypDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>N.A.</TD></TR></TABLE>',
		CAPTION, '<i>T. brucei</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>T. brucei</i></a></td>

             <td align="center"><font size = "-2">
		<a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">02/2009</a></td>
             <td align="right"><font size = "-2">27.7</td>
             <td align="right"><font size = "-2">10682</td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources#Transcriptome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"><a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources#Proteoome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>

</tr>

<tr>
             <td  align="left"><a href="javascript:void(0);" class='no_underline' 
	       onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5693&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5693</a></TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>11/2009</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Genbank <a href=\'http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources\' style=\'color:#660000\'>(TriTrypDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>N.A.</TD></TR></TABLE>',
		CAPTION, '<i>T. cruzi</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>T. cruzi</i></a></td>

             <td align="center"><font size = "-2">
		<a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">02/2009</a></td>
             <td align="right"><font size = "-2">101.7</td>
             <td align="right"><font size = "-2">23559</td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources#Transcriptome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"><a href="http://tritrypdb.org/tritrypdb/showXmlDataContent.do?name=XmlQuestions.DataSources#Proteoome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>

</tr>

											<%-- PLASMODIUM  --%>
<tr>
             <td  align="left"><font size = "-2"><b><i>Plasmodium</i></b></td>
          </tr>


<%-- PLASMODIUM BERGHEI --%>
          <tr class="genomeTable3">
	     <td align="left"><a href="javascript:void(0);" class='no_underline' 
		 onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5823&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5823</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>02/2005</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Sanger <a href=\'http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=P.berghei_chromosomes,P.berghei_wholeGenomeShotgunSequence,P.berghei_Annotation,P.berghei_firstAnnotationSalvador,berghei_falciparum_synteny,TIGRGeneIndices_Pberghei,Su_SNPs,Broad_SNPs,sangerItGhanaSnps,sangerReichenowiSnps,P.berghei_plastid&title=Genomic%20Context\' style=\'color:#660000\'>(PlasmoDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>ANKA</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'></TD></TR></TABLE>',
		CAPTION, '<i>P. berghei</i> ANKA',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2"><i>&nbsp;&nbsp;&nbsp;P. berghei</i> ANKA</td>

             <td align="center"><font size = "-2"><a href="http://plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">${plasmoDate}</a></td>
             <td align="right"><font size = "-2">18.00</td>
             <td align="right"><font size = "-2">12345</td>
	     <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=dbEST&title=EST%20Context"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=berghei_gss_time_series,berghei_gss_time_seriesHPE&title=P.%20berghei%20Expression"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=Pberghei_Protein_Expression&title=Protein%20Expression&title=Proteome%20Context"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=pathwayMappings_Hagai&title=Metabolic%20Pathway"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>

         </tr>

<%-- PLASMODIUM CHABAUDI --%>

         <tr>
	   <td align="left"><a href="javascript:void(0);" class='no_underline' 
	     onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=31271&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>31271</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>02/2005</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Sanger <a href=\'http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=P.chabaudi_chromosomes,P.chabaudi_wholeGenomeShotgunSequence,P.chabaudi_Annotation,P.chabaudi_firstAnnotationSalvador,chabaudi_falciparum_synteny,TIGRGeneIndices_Pchabaudi,Su_SNPs,Broad_SNPs,sangerItGhanaSnps,sangerReichenowiSnps,P.chabaudi_plastid&title=Genomic%20Context\' style=\'color:#660000\'>(PlasmoDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>AS</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'></TD></TR></TABLE>',
		CAPTION, '<i>P. chabaudi</i> AS',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2"><i>&nbsp;&nbsp;&nbsp;P. chabaudi</i> AS</td>

             <td align="center"><font size = "-2"><a href="http://plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">${plasmoDate}</a></td>
             <td align="right"><font size = "-2">16.89</td>
             <td align="right"><font size = "-2">15095</td>
	     <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=pathwayMappings_Hagai&title=Metabolic%20Pathway"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
         
          </tr>

<%-- PLASMODIUM FALCIPARUM --%>

          <tr class="genomeTable3">
		<td align="left"><a href="javascript:void(0);" class='no_underline' 
			 onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=36329&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>36329</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>2.1 (09/2005)</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Sanger <a href=\'http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=P.falciparum_chromosomes,P.falciparum_wholeGenomeShotgunSequence,P.falciparum_Annotation,P.falciparum_firstAnnotationSalvador,falciparum_falciparum_synteny,TIGRGeneIndices_Pfalciparum,Su_SNPs,Broad_SNPs,sangerItGhanaSnps,sangerReichenowiSnps,P.falciparum_plastid&title=Genomic%20Context\' style=\'color:#660000\'>(PlasmoDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>3D7</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'>Dd2, HB3</TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>C10 plastid,<br>NF54 mitochondrial</TD></TR></TABLE>',
		CAPTION, '<i>P. falciparum</i> 3D7',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2"><i>&nbsp;&nbsp;&nbsp;P. falciparum</i> 3D7</td>

             <td align="center"><font size = "-2"><a href="http://plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">09/2008</a></td>
             <td align="right"><font size = "-2">23.27</td>




             <td align="right"><font size = "-2">5595</td>
	     <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=P.falciparum_chromosomes,P.falciparum_wholeGenomeShotgunSequence,P.falciparum_Annotation,P.falciparum_firstAnnotationSalvador,falciparum_falciparum_synteny,TIGRGeneIndices_Pfalciparum,Su_SNPs,Broad_SNPs,sangerItGhanaSnps,sangerReichenowiSnps,P.falciparum_plastid&title=Genomic%20Context"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=Su_SNPs,Broad_SNPs,sangerItGhanaSnps,sangerReichenowiSnps&title=SNPs%20Summary"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=ESTAlignments_Pfalciparum,dbEST&title=EST%20Context"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
<%-- M --%>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=WinzelerGeneticVariationArray,DeRisi_oligos,winzeler_gametocyte_expression&title=Microarray%20Context"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
<%-- Pr --%>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=FlorensMassSpecData&title=Mass%20Spec.-based%20Expression%20Evidence&title=Proteome%20Context"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
<%-- Pa --%>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=pathwayMappings_Hagai&title=Metabolic%20Pathway"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>

         
          </tr>

<%-- PLASMODIUM GALLINACEUM --%>

          <tr>
		<td align="left"><a href="javascript:void(0);" class='no_underline' 
			 onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5849&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5849</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>08/2005</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Sanger <a href=\'http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=P.gallinaceum.contigs&title=Genomic%20Context\' style=\'color:#660000\'>(PlasmoDB)</TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'></TD></TR></TABLE>',
		CAPTION, '<i>P. gallinaceum</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2"><i>&nbsp;&nbsp;&nbsp;P. gallinaceum</i></td>

             <td align="center"><font size = "-2"><a href="http://plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">${plasmoDate}</a></td>
             <td align="right"><font size = "-2">16.91</td>
             <td align="right"></td>
	     <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>


          </tr>

<%-- PLASMODIUM KNOWLESI --%>

          <tr class="genomeTable3">
		<td align="left"><a href="javascript:void(0);" class='no_underline' 
			 onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5851&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5851</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>02/2006</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Sanger <a href=\'http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=P.knowlesi.contigs&title=Genomic%20Context\' style=\'color:#660000\'>(PlasmoDB)</TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>H</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'></TD></TR></TABLE>',
		CAPTION, '<i>P. knowlesi</i> H',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2"><i>&nbsp;&nbsp;&nbsp;P. knowlesi</i> H</td>

             <td align="center"><font size = "-2"><a href="http://plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">${plasmoDate}</a></td>
             <td align="right"><font size = "-2">25.44</td>
             <td align="right"><font size = "-2">5161</td>
	     <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>

          </tr>

<%-- PLASMODIUM REICHENOWI --%>

          <tr>
		<td align="left"><a href="javascript:void(0);" class='no_underline' 
			 onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5854&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5854</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>03/2004</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Sanger <a href=\'http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=P.reichenowi.contigs&title=Genomic%20Context\' style=\'color:#660000\'>(PlasmoDB)</TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'></TD></TR></TABLE>',
		CAPTION, '<i>P. reichenowi</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2"><i>&nbsp;&nbsp;&nbsp;P. reichenowi</i></td>

             <td align="center"><font size = "-2"><a href="http://plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">${plasmoDate}</a></td>
             <td align="right"><font size = "-2">7.38</td>
             <td align="right"></td>
	     <td align="center"></td>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=Su_SNPs,Broad_SNPs,sangerItGhanaSnps,sangerReichenowiSnps&title=SNPs%20Summary"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>

          </tr>


<%-- PLASMODIUM VIVAX --%>

          <tr class="genomeTable3">
		<td align="left"><a href="javascript:void(0);" class='no_underline' 
			 onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=126793&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>126793</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>09/2005</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>TIGR <a href=\'http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=P.vivax_chromosomes,P.vivax_wholeGenomeShotgunSequence,P.vivax_Annotation,P.vivax_firstAnnotationSalvador,vivax_falciparum_synteny,TIGRGeneIndices_Pvivax,Su_SNPs,Broad_SNPs,sangerItGhanaSnps,sangerReichenowiSnps,P.vivax_plastid&title=Genomic%20Context\' style=\'color:#660000\'>(PlasmoDB)</TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>Sal-1</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'></TD></TR></TABLE>',
		CAPTION, '<i>P. vivax</i> Salvador 1',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2"><i>&nbsp;&nbsp;&nbsp;P. vivax</i> Salvador 1</td>
             <td align="center"><font size = "-2"><a href="http://plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">${plasmoDate}</a></td>
             <td align="right"><font size = "-2">26.96</td>

             <td align="right"><font size = "-2">5507</td>
	     <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=ESTAlignments_Pvivax,dbEST&title=EST%20Context"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=pathwayMappings_Hagai&title=Metabolic%20Pathway"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>

          </tr>

<%-- PLASMODIUM YOELII --%>

          <tr>
		<td align="left"><a href="javascript:void(0);" class='no_underline' 
			 onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=352914&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>352914</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>10/2005</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>TIGR <a href=\'http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=P.yoelii_chromosomes,P.yoelii_wholeGenomeShotgunSequence,P.yoelii_Annotation,P.yoelii_firstAnnotationSalvador,yoelii_falciparum_synteny,TIGRGeneIndices_Pyoelii,Su_SNPs,Broad_SNPs,sangerItGhanaSnps,sangerReichenowiSnps,P.yoelii_plastid&title=Genomic%20Context\' style=\'color:#660000\'>(PlasmoDB)</TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>17XNL</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'></TD></TR></TABLE>',
		CAPTION, '<i>P. yoelii</i> 17XNL',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2"><i>&nbsp;&nbsp;&nbsp;P. yoelii</i> 17XNL</td>
             <td align="center"><font size = "-2"><a href="http://plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">${plasmoDate}</a></td>
             <td align="right"><font size = "-2">20.17</td>
             <td align="right"><font size = "-2">7971</td>
	     <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=ESTAlignments_Pyoelii,dbEST&title=EST%20Context"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://www.plasmodb.org/plasmo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=pathwayMappings_Hagai&title=Metabolic%20Pathway"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
          </tr>


											<%-- THEILERIA --%>
          <tr>
             <td  align="left"><font size = "-2"><b><i>Theileria</i></b></td>
          </tr>

<%-- THEILERIA ANNULATA --%>

 	<tr class="genomeTable3">
              <td align="left"><a href="javascript:void(0);" class='no_underline' 
			 onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=353154&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>353154</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>EMBL 03/2006<br>(obtained)</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Genbank <a href=\'http://apidb.org/static/sources.shtml\' style=\'color:#660000\'>(EuPathDB)</TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>Ankara</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'></TD></TR></TABLE>',
		CAPTION, '<i>T. annulata</i> Ankara',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>T. annulata</i> Ankara</a></td>

             <td align="center"><font size = "-2">
                <a href="http://apidb.org/apidb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">03/2006</a></td>
             <td align="right"><font size = "-2">8.35</td>
             <td align="right"></td>
            <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://apidb.org/static/sources.shtml"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>

          </tr>

<%-- THEILERIA PARVA --%>

 	<tr>
              <td align="left"><a href="javascript:void(0);" class='no_underline' 
		 onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=333668&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>333668</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>Genbank 03/2006<br>(obtained)</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>EMBL <a href=\'http://apidb.org/static/sources.shtml\' style=\'color:#660000\'>(EuPathDB)</TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>Muguga</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>apicoplast</TD></TR></TABLE>',
		CAPTION, '<i>T. parva</i> Muguga',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>T. parva</i> Muguga</a></td>
             <td align="center"><font size = "-2">
                <a href="http://apidb.org/apidb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">03/2006</a></td>
             <td align="right"><font size = "-2">8.35</td>
             <td align="right"></td>
            <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://apidb.org/static/sources.shtml"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"></td>

          </tr>


											<%-- TOXOPLASMA --%>
	  <tr>
             <td  align="left"><font size = "-2"><b><i>Toxoplasma/Neospora</i></b></td>
          </tr>

<%-- TOXOPLASMA GONDII --%>

       <tr class="genomeTable3">
              <td align="left"><a href="javascript:void(0);" class='no_underline' 
			 onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=5811&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>5811</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>Draft 3 (08/2003)</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Toxo Genome Consortium <a href=\'http://www.toxodb.org/toxo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=Scaffolds,ChromosomeMap,ME49_Annotation,TgondiiGT1Scaffolds,TgondiiVegScaffolds,TgondiiRHChromosome1,TgondiiApicoplast,GeneticMarkers_Sibley,ME49_SNPs,AmitAlignmentSnps,AmitNucmerHSPs,AffymetrixProbes,TIGRGeneIndices_Tgondii,dbEST,ESTAlignments_Tgondii,ME49_GLEAN,ME49_GlimmerHMM,ME49_TigrScan,ME49_TwinScan,ME49_TwinScanEt,tRNAPredictions,3primeToxoSageTags,5primeToxoSageTags&title=Genomic%20Context\' style=\'color:#660000\'>(ToxoDB)</TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>ME49</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'>VEG,GT1,CKUg2,RH</TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>apicoplast</TD></TR></TABLE>',
		CAPTION, '<i>T. gondii</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>T. gondii</i></a></td>

             <td align="center"><font size = "-2">
                <a href="http://toxodb.org/toxo/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">02/2009</a></td>
             <td align="right"><font size = "-2">63.00</td>
             <td align="right"><font size = "-2">9239**</td>
            <td align="center"><a href="http://www.toxodb.org/toxo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=Scaffolds,ChromosomeMap,ME49_Annotation,TgondiiGT1Scaffolds,TgondiiVegScaffolds,TgondiiRHChromosome1,TgondiiApicoplast,GeneticMarkers_Sibley,ME49_SNPs,AmitAlignmentSnps,AmitNucmerHSPs,AffymetrixProbes,TIGRGeneIndices_Tgondii,dbEST,ESTAlignments_Tgondii,ME49_GLEAN,ME49_GlimmerHMM,ME49_TigrScan,ME49_TwinScan,ME49_TwinScanEt,tRNAPredictions,3primeToxoSageTags,5primeToxoSageTags&title=Genomic%20Context"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"><a href="http://www.toxodb.org/toxo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=ME49_SNPs,AmitAlignmentSnps&title=SNPs%20Summary"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"><a href="http://www.toxodb.org/toxo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=ESTAlignments_Tgondii,dbEST&title=EST%20Context"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
<%-- M --%>
             <td align="center"><a href="http://toxodb.org/toxo/showXmlDataContent.do?name=XmlQuestions.DataSources#Transcriptome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
<%-- Pr --%>
             <td align="center"><a href="http://toxodb.org/toxo/showXmlDataContent.do?name=XmlQuestions.DataSources#Proteome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
<%-- Pa --%>
             <td align="center"><a href="http://toxodb.org/toxo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=MetabolicDbXRefs_Feng&title=Metabolic%20Pathway"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>

</tr>


<%-- NEOSPORA CANINUM --%>

       <tr>
              <td align="left"><a href="javascript:void(0);" class='no_underline' 
			 onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=29176&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>29176</TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>08/2008</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'><a href=\'http://www.toxodb.org/toxo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=Scaffolds,ChromosomeMap,dbEST&title=Genomic%20Context\' style=\'color:#660000\'>(ToxoDB)</TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'></TD></TR></TABLE>',
		CAPTION, '<i>N. caninum</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>N. caninum</i></a></td>

             <td align="center"><font size = "-2">
                <a href="http://toxodb.org/toxo/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">${toxoDate}</a></td>
             <td align="right"><font size = "-2">62.48</td>
             <td align="right"><font size = "-2">5761</td>
            <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://www.toxodb.org/toxo/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=ESTAlignments_Tgondii,dbEST&title=EST%20Context"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
<%-- M --%>
             <td align="center"></td>
<%-- Pr --%>
             <td align="center"></td>
<%-- Pa --%>
             <td align="center"></td>

</tr>



<tr>
             <td  align="left"><font size = "-2"><b><i>Trichomonas</i></b></td>
</tr>



<%-- TRICHOMONAS VAGINALIS --%>

<tr>
             <td  align="left"><a href="javascript:void(0);" class='no_underline' 
	       onmouseover = "return overlib('<TABLE><TR><TD valign=\'top\'>Taxon ID:</TD><TD valign=\'top\'><a href=\'http://130.14.29.110/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=412133&lvl=3&p=mapview&p=has_linkout&p=blast_url&p=genome_blast&lin=f&keep=1&srchmode=5&unlock\'  target=\'_blank\' style=\'color:#660000\'>412133</a></TD></TR><TR><TD valign=\'top\'>Genome Version:</TD><TD valign=\'top\'>1 (01/2007)</TD></TR><TR><TD valign=\'top\'>Data Source:</TD><TD valign=\'top\'>Genbank <a href=\'http://trichdb.org/trichdb/showXmlDataContent.do?name=XmlQuestions.DataSources\' style=\'color:#660000\'>(TrichDB)</a></TD></TR><TR><TD valign=\'top\'>Reference Strain:</TD><TD valign=\'top\'>G3</TD></TR><TR><TD valign=\'top\'>Additional Strains:</TD><TD valign=\'top\'></TD></TR><TR><TD valign=\'top\'>Organellar Genomes:</TD><TD valign=\'top\'>N.A.</TD></TR></TABLE>',
		CAPTION, '<i>T. vaginalis G3</i>',
		FGCOLOR, 'white',
		BGCOLOR, '#7F0707',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '9px',
		STICKY,MOUSEOFF,TIMEOUT,4000,
		ANCHOR, 'refmark', ANCHORX,-120 ,ANCHORY,-75 ,NOANCHORWARN)" 		
               onmouseout = "return nd();"><font size = "-2">&nbsp;&nbsp;&nbsp;<i>T. vaginalis G3</i></a></td>

             <td align="center"><font size = "-2">
		<a href="http://trichdb.org/trichdb/showXmlDataContent.do?name=XmlQuestions.News" style="color:#660000">09/2007</a></td>
             <td align="right"><font size = "-2">176.41</td>
             <td align="right"><font size = "-2">60808</td>
             <td align="center"></td>
             <td align="center"></td>
             <td align="center"><a href="http://trichdb.org/trichdb/showXmlDataContent.do?name=XmlQuestions.DataSources#Transcriptome"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>
             <td align="center"></td>
             <td align="center"></td>
 <td align="center"><a href="http://pathema.tigr.org:1555/"><img border=0 src="/assets/images/reddot.gif" width="8" alt="yes"></td>


</tr>

<tr><td colspan="10"><font size="-2"><hr>* In addition, <i>G. lamblia</i> has 4778 deprecated genes that are not included in the official gene count.</font></td></tr>
<tr><td colspan="10"><font size="-2">** <i>T. gondii</i> gene groups identified in ToxoDB across the three strains (ME49, GT1, VEG) and the Apicoplast.</font></td></tr>


      
</table>                                                          <%-- end of GENOME table --%>

</div>
</div>
</div>


<site:footer refer="home"/>

