<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="version" value="${wdkModel.version}"/>
<c:set var="site" value="${wdkModel.displayName}"/>
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>


<%-- we need the header only for the css and js --%>
<site:header title="${site}.org :: Support"
                 banner="Support"
                 parentDivision="${site}"
                 parentUrl="/home.jsp"
                 divisionName="Generic"
                 division="help"/>


<h1>This tool was created to allow users to combine results based upon their relative locations in the genome</h1>
 <hr class=brown>
    <center><a style="font-size:14px" href="javascript:window.close()">Close this window.</a></center>  
 <hr class=brown>


<p>For example, you might want to evaluate SNPs relative to a particular set of genes, or transcripts that are anti-sense relative to annotated genes.  Since you have successfully arrived at this page, you have conducted two searches that you would like to combine. We refer to the results of your penultimate search in this strategy as Step A and to your most recent search as Step B.

</p>

<br>

<p>The number of results from each step (A and B) are indicated in the sentence below the title. To complete this relative location operation you must specify each of the following pieces of information.

</p>

<br>

<ol style="list-style:decimal inside none">
<li>Select which Step you want your results to be taken from. Steps A and B can be different types of features. For example, if Step A is a set of Genes and Step B is a set of SNPs, when you <b><i>Select...</i></b> what to return you will be choosing either Step A Genes that meet your criteria relative to Step B or Step B SNPs relative to the genes in Step A.   This would allow you to return all the genes in Step A that contain SNPs from Step B within 1000 bp of their start or alternatively, all the SNPs from Step B that are located within 1000 bp of the start of the genes in Step A.
</li>
<br>
<li>For each ID in Step A, specify your region of interest relative to the location of that feature on the genome.  
	<ul  style="list-style:circle inside none">
	<li style="margin-left:20px;margin-bottom:10px">First, determine which large gray area, either the one on the left or the one on the right, is showing Step A. Step A will be on the left if you have chosen to return IDs from Step A. Otherwise it will be in the gray box on the right.</li>
	<li  style="margin-left:20px;margin-bottom:10px">In the appropriate gray box, decide if your region of interest is the exact location of each ID in Step A on the genome, or if it is a region upstream or downstream of the ID's location. If upstream or downstream, indicate the length of the region upstream or downstream of your feature location that you would like to look. Note that when you check these options, the custom region values change to reflect your choices.  If you want a more complex region of interest, for example a region of 100 bp surrounding the start of the feature location, use the Custom area below.</li>
	</ul>
</li>
<br>
<li>For each ID in Step B, what is your region of interest relative to the location of that feature on the genome.
	<ul style="list-style:circle inside none">
	<li  style="margin-left:20px;margin-bottom:10px">See defining your region for Step A above.
	</ul>
</li>
<br>
<li>Choose how the region in the left gray area for the results that you are returning relates on the genome to the region in the right gray area.
	<ul style="list-style:circle inside none">
	<li  style="margin-left:20px;margin-bottom:10px">Use the drop down in the middle of the window to choose whether the regions should <b><i>overlap</i></b> or more precisely whether the region from the left gray area must be  <b><i>(is) contained in</i></b> or <b><i>contains</i></b> the region from the right gray area.  Note that <b><i>is contained in</i></b> and <b><i>contains</i></b> are subsets of <b><i>overlap</i></b>.
	<li  style="margin-left:20px;margin-bottom:10px">Use the drop down menu at the right to choose whether the features that you have identified in your two Steps can be on <b><i>either strand</i></b> relative to each other or whether they must be on the <b><i>same strand</i></b> (same direction on the genomic sequence) or must be on <b><i>opposite strands</i></b>.
	</ul>
</li>
<br>
<li>Click <b><i>Submit</i></b> to return the features you have selected in the left gray area relative to the features in the right gray area as you have specified above.
</li>
</ol>




 

