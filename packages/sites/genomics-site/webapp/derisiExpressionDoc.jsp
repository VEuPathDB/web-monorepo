<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<imp:header title="PlasmoDB : gene expression profile"
                 banner="Gene Expression Profile"
                 parentDivision="PlasmoDB"
                 parentUrl="/home.jsp"
                 divisionName="Queries & Tools"
                 division="queries"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

  <tr>
    <td>
      <div class="small">
        <!-- content-->

        <br><br>
        <b><i>P. falciparum</i> stage graph</b>
      </div>
    </td>
  </tr>

  <tr align="center">
    <td>
      <img src="images/expStages.png" border=1>
    </td>
  </tr>

  <tr>
    <td>
      <div class="small">
        This is a graph of "time" (horizontal axis; 0-53 hours) against "the
        percentage of the total number of P. falciparum parasites that were
        observed (by counting) to be in the ring, trophozoite, or schizont
        stages, respectively" (vertical axis). Since this is a synchronized
        culture of parasites, the transitions between the different stages are
        quite sharp. That is, the cultured sample quickly transitions from being
        predominantly composed of ring-stage parasites to being predominantly
        composed of trophozoite-stage parasites and from trophozoites to
        schizonts (and finally back to rings, as the cycle of red blood cell
        invasion repeats).

        <br><br>
        <hr class="brown">
 
        <br><br>
        <b>Expression intensity percentile graph</b>
      </div>
    </td>
  </tr>

  <tr align="center">
    <td>
      <img src="images/expressionIntensityPercentile.png" border=1>
    </td>
  </tr>

  <tr>
    <td>
      <div class="small">
        This is a graph of "time" (horizontal axis; 0-53 hours) against
        "expression intensity percentile" (vertical axis). Specifically the
        vertical axis gives the percentile of this gene's expression intensity
        in the spectrum of all expression intensities for that time point (e.g.
        the gene with the highest expression intensity value at time t has graph
        passing through (t,100), the the gene with lowest intensity at time t
        passes through (t,0)). The expression intensity is given by the (GenePix)
        foreground median minus the background mean of the experimental channel.
        The graph shows the progression of these percentiles over the 53 hour
        time course. If there is more than one array for a particular time
        point, or more than one oligo mapping to the gene, then the percents are
        averaged. The numerical values can be obtained from the "View/download
        raw data" link that accompanies the graph.
      </div>
    </td>
  </tr>

</table>

<imp:footer/>
