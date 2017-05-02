<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="project" value="${applicationScope.wdkModel.name}" />

<!--  SETTING GENERA       (share with quick search and menubar!  
  -->
<c:set var="AmoebaDBOrgs" value="Acanthamoeba, Entamoeba, Naegleria" />
<c:set var="CryptoDBOrgs" value="Chromera, Cryptosporidium, Gregarina, Vitrella" /> 
<c:set var="FungiDBOrgs" value="Agaricomycetes, Blastocladiomycetes, Chytridiomycetes, Eurotiomycetes, Leotiomycetes, Oomycetes, Pneumocystidomycetes, Pucciniomycetes, Saccharomycetes, Schizosaccharomycetes, Sordariomycetes, Tremellomycetes, Ustilaginomycetes, Zygomycetes"/>     
<c:set var="GiardiaDBOrgs" value="Giardia, Spironucleus" />
<c:set var="MicrosporidiaDBOrgs" value="Annacaliia, Edhazardia, Encephalitozoon, Enterocytozoon, Hamiltosporidium, Nematocida, Nosema, Spraguea, Trachipleistophora, Vavraia, Vittaforma" />
<c:set var="PiroplasmaDBOrgs" value="Babesia, Theileria" />
<c:set var="PlasmoDBOrgs" value="Plasmodium" />
<c:set var="ToxoDBOrgs" value="Eimeria, Hammondia, Neospora, Sarcocystis, Toxoplasma" />
<c:set var="TrichDBOrgs" value="Trichomonas"/>
<c:set var="TriTrypDBOrgs" value="Crithidia, Endotrypanum, Leishmania, Trypanosoma"/>


<c:if test="${project == 'EuPathDB'}">
  <p style="margin-left:2em;margin-right:2em;font-size:120%"><b>The EuPathDB <a href="https://www.niaid.nih.gov/labsandresources/resources/dmid/brc/pages/default.aspx">Bioinformatics Resource Center</a> provides a portal for accessing genomic-scale datasets associated with the diverse eukaryotic microbes </b> <i style="font-size:90%>">(mouse-over the following logos for information on component websites):</i>
  </p>

  <table class="center" style="padding:2px;" width="95%">
    <tr>
    <%--  <td align="center" width="12.5%"><a href="http://newsitedb.org"><imp:image border=0 src="images/newSite.png" width="55" alt="NewSiteDB logo" /></a></td> --%>
    <c:set var="mywidth" value="9%" />
    <td title="${AmoebaDBOrgs}" align="center" width="${mywidth}"><a href="http://amoebadb.org"><imp:image  border="0" src="images/AmoebaDB/amoebadb_w50.png" alt="AmoebaDB logo"/></a></td>
    <td title="${CryptoDBOrgs}" align="center" width="${mywidth}"><a href="http://cryptodb.org"><imp:image border="0" src="images/CryptoDB/cryptodb_w50.png" alt="CryptoDB logo"/></a></td>
    <td title="${FungiDBOrgs}" align="center" width="${mywidth}"><a href="http://fungidb.org"><imp:image border="0" src="images/FungiDB/fungidb_w50.png" alt="FungiDB logo"/></a></td>
    <td title="${GiardiaDBOrgs}" align="center" width="${mywidth}"><a href="http://giardiadb.org"><imp:image border="0" src="images/GiardiaDB/giardiadb_w50.png" alt="GiardiaDB logo"/></a></td>
    <td title="${MicrosporidiaDBOrgs}" align="center" width="${mywidth}"><a href="http://microsporidiadb.org"><imp:image border="0" src="images/MicrosporidiaDB/microdb_w50.png" alt="MicrosporidiaDB logo"/></a></td>
    <td title="${PiroplasmaDBOrgs}" align="center" width="${mywidth}"><a href="http://piroplasmadb.org"><imp:image border="0" src="images/PiroplasmaDB/piroLogo-50.png" alt="PiroplasmaDB logo"/></a></td>
    <td title="${PlasmoDBOrgs}" align="center" width="${mywidth}"><a href="http://plasmodb.org"><imp:image border="0" src="images/PlasmoDB/plasmodb_w50.png" alt="PlasmoDB logo"/></a></td>
    <td title="${ToxoDBOrgs}" align="center" width="${mywidth}"><a href="http://toxodb.org"><imp:image border="0" src="images/ToxoDB/toxodb_w50.png" alt="ToxoDB logo"/></a></td>
    <td title="${TrichDBOrgs}" align="center" width="${mywidth}"><a href="http://trichdb.org"><imp:image border="0" src="images/TrichDB/trichdb_w65.png" alt="TrichDB logo"/></a></td>
    <td title="${TriTrypDBOrgs}" align="center" width="${mywidth}" ><a href="http://tritrypdb.org"><imp:image border="0" src="images/TriTrypDB/tritrypdb_w40.png" alt="TriTrypDB logo"/></a></td>
    <td  align="center" width="${mywidth}" ><a href="http://orthomcl.org"><imp:image border="0" src="images/OrthoMCL/Ortho-3D-lighter-50.png" width="55" alt="OrthoMCL logo"/></a></td>
    </tr>

    <tr>
          <td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#67a790">AmoebaDB</td>
          <td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#a03f43">CryptoDB</td>
          <td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#672a87">FungiDB</td>
          <td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#67678d">GiardiaDB</td>
          <td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#320B7A">MicrosporidiaDB</td>
          <td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#3b8ca0">PiroplasmaDB</td>
          <td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#8f0165">PlasmoDB</td>
          <td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#a50837">ToxoDB</td>
          <td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#8d7658">TrichDB</td>
          <td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#4f9cce">TriTrypDB</td>
          <td align="center" width="${mywidth}" style="font-weight:bold;font-style: italic;color:#7a3838">OrthoMCL</td>
    </tr>
  </table>

  <br> 
</c:if>


<%--
   <div style="padding:3px 10px;">
     <imp:searchLookup />
   </div>
--%>

<div id="bubbles" width="100%" border="0" class="threecolumn">
  <c:set var="qSetName" value="GeneQuestions" />
  <imp:DQG_bubble 
     banner="bubble_id_genes_by2.png" 
     alt_banner="Search for Genes"
     recordClasses="genes"
     />
  <imp:DQG_bubble 
     banner="bubble_id_other_data2.png"
     alt_banner="Search for Other Data Types"
     recordClasses="others"
     />
  <imp:DQG_bubble
     banner="bubble_id_third_option2.png"
     alt_banner="Tools"
     />
</div>
