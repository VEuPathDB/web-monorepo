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


<h1>Combine Steps using relative locations in the genome</h1>
 <hr class=brown>
    <center><a style="font-size:14px" href="javascript:window.close()">Close this window.</a></center>  
 <hr class=brown>


<p>In this help page we refer to your previous results as Step A and to your most recent search as Step B.</p>
<br>
<p>The result returned will be a filtered set of records from either Step A or Step B.  For example, if Step A is a set of Genes and Step B is a set of ORFs, when you <i>Select...</i> what to return you will be choosing either Step A Genes or Step B ORFs.  The result will be drawn from that set.</p>
<br>
<p>The rest of the decisions on the page let you find pairs of IDs that are of interest, where each pair contains one ID from Step A and one from Step B.  Your final result will be one member from each of those pairs.  The member chosen will be either from Step A or from Step B,  depending on what you chose for <i>Select...</i> what to return.</p>
<br>
<ul>To specify pairs of IDs you must specify four things:
<li> 1) for each ID in Step A, what is the region of interest relative to that ID's span on the genome.
<li> 2) for each ID in Step B, what is the region of interest relative to that ID's span on the genome.
<li> 3) for each region of interest in Step A, how to find regions of interest in Step B that it can pair with (eg, "Step A and Step B regions must overlap")
<li> 4) how to filter pairs based on strand, i.e., whether to keep pairs only if the elements are on the same strand, on different strands, or to not care about strand.
</ul>
<br>
<ul>To select regions of interest for records in Step A:
<li> - First, determine which large gray area, either the one on the left or the one on the right, is showing Step A.  Step A will be on the left if you have chosen to return IDs from Step A. Otherwise it will be in the gray box on the right.
<li>- In the appropriate gray box, decide if your region of interest is the exact region of each ID in Step A on the genome, or if it is a region upstream or downstream of the ID's span. If upstream or downstream, indicate the length of the region.   If you want a more complex region of interest, for example a region of 100bp surrounding the start of the span, use the Custom area below.
</ul>
<br>
<p>Note: for Genes, the start of the gene will include UTRs if the sequencing/annotation center provided UTRs in the gene models.</p>
<br>
<p>To select regions of interest for Step B, follow the same procedure in Step B's gray box.</p>
<br>
<p>Note that using the default values (you will have to select what to return though), assuming ID's exact regions do not overlap (e.g., two genes cannot share genomic sequence), you are basically effecting an intersection, that is, you are obtaining the IDs that exist in both steps A and B.
</p>


 

