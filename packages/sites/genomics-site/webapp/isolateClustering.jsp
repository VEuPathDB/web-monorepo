<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="wdkModelDispName"/>
<site:header title="PlasmoDB : Isolate Clustering"
                 banner="${wdkModelDispName} Isolate Clustering"
                 parentDivision="PlasmoDB"
                 parentUrl="/home.jsp"
                 divisionName="Isolate Clustering"
                 division="queries_tools"/>


<table border=0 width=100% cellpadding="3" cellspacing="0" bgcolor="white"  class="thinTopBorders"> 
<tr><td bgcolor="white" valign="top" colspan="2">




<%-- show error messages, if any --%>
<wdk:errors/>

<table width="100%" cellpadding="4">

<tr class="rowLight">
  <td align="center">
       <applet archive="/TreeView.jar,/nanoxml-2.2.2.jar,/plugins/Dendrogram.jar" 
               CODE="edu.stanford.genetics.treeview.applet.ButtonApplet.class"
               width=120 height=30
              alt="Your browser understands the &lt;APPLET&gt; tag but isn't running the applet, for some reason."
              codebase="/"
        >
        Your browser is completely ignoring the &lt;APPLET&gt; tag!
        <param name="cdtFile" value="data/barcodeIsolates.cdt">
        <param name="cdtName" value="Barcode">
         <param name="plugins" value="edu.stanford.genetics.treeview.plugin.dendroview.DendrogramFactory,edu.stanford.genetics.treeview.plugin.dendroview.AlignmentFactory">
      </applet>
  </td>
  <td>The Genotyping Barcode is based on 24 different high frequency SNPs (minor allele frequency > 30%) in Plasmodium falciparum.  These were selected from whole genome sequencing and affymetrix genotyping of P. falciparum strains from around the globe. The method itself uses the TaqMan SNP genotyping assay.</td>
</tr>

<tr class="rowLight">
  <td align="center">
       <applet archive="/TreeView.jar,/nanoxml-2.2.2.jar,/plugins/Dendrogram.jar" 
               CODE="edu.stanford.genetics.treeview.applet.ButtonApplet.class"
               width=150 height=50
              alt="Your browser understands the &lt;APPLET&gt; tag but isn't running the applet, for some reason."
              codebase="/"
        >
        Your browser is completely ignoring the &lt;APPLET&gt; tag!
        <param name="cdtFile" value="/data/3KChipIsolates.cdt">
        <param name="cdtName" value="3K Snp Chip">
         <param name="plugins" value="edu.stanford.genetics.treeview.plugin.dendroview.DendrogramFactory,edu.stanford.genetics.treeview.plugin.dendroview.AlignmentFactory">
      </applet>

  </td>
  <td>The 3K genotyping chip is an affymetrix array containing about 3000 SNPs (about two thirds are from chromosome 7 and the rest are distributed throughout the genome).</td>
</tr>

<tr class="rowLight">
  <td align="center">
       <applet archive="/TreeView.jar,/nanoxml-2.2.2.jar,/plugins/Dendrogram.jar" 
               CODE="edu.stanford.genetics.treeview.applet.ButtonApplet.class"
               width=150 height=50
              alt="Your browser understands the &lt;APPLET&gt; tag but isn't running the applet, for some reason."
              codebase="/"
        >
        Your browser is completely ignoring the &lt;APPLET&gt; tag!
        <param name="cdtFile" value="/data/75KChipIsolates.cdt">
        <param name="cdtName" value="HD Array">
         <param name="plugins" value="edu.stanford.genetics.treeview.plugin.dendroview.DendrogramFactory,edu.stanford.genetics.treeview.plugin.dendroview.AlignmentFactory">
      </applet>

  </td>
  <td>The HD Array is an affymetrix array containing about 17500 informative SNPs.</td>
</tr>

</table>

<hr>
</td>
</tr>



<tr><td>
<b>Query Description:</b>Isolate Strains were clustered based on their snp sequences and are presented in the <a href="http://sourceforge.net/projects/jtreeview/">jtreeview</a> applet.  Displayed is a row for each snp and a column for each available isolate.  The Snps are ordered by Chromosome location while the isolates are ordered by the result of hierarchical clustering (Michiel de Hoon's implementation (<a href="http://bonsai.ims.u-tokyo.ac.jp/~mdehoon/software/cluster/">Cluster 3.0</a>) of Michael Eisen's <a href="http://rana.lbl.gov/EisenSoftware.htm">cluster</a> algorithms).
<br/><br/>
The Dendrogram view (default) shows light tan pixels for a Major allele, black pixels for a Minor allele, and grey pixels to indicate no available data.  (NOTE:  Major and Minor alleles are calculated within each experiment).  Click "Analysis > Alignment" from the menu bar to see the actual nucleotide sequences.
<br/><br/>
Highlighting areas of the dendrogram or clicking the above nodes will create a "Zoom In" view for closer examination.  The snps and the isolates are clickable from this view and will take you to their respective pages (Make sure to turn off any popup blockers).
<br/><br/>
<i>NOTE:  This clustering is provided as a visualization tool and is not intended to imply true phylogenetic relationships.</i>
  
</td></tr>


</table> 
<hr>
<site:footer/>
