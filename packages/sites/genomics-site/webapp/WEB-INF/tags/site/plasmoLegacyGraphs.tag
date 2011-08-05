<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>

<%@ attribute name="organism"
              description="Which graphs to show."
%>


<%@ attribute name="id"
              description="Which gene page are we on"
%>


<c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>
<c:set var="projectId" value="PlasmoDB"/>

<c:if test="${organism eq 'Plasmodium vivax SaI-1'}">
  <site:pageDivider name="Expression"/>

  <c:set var="secName" value="ZBPvivaxTS::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table border=0>
      <tr>
        <td class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
        <td class="centered">
          <div class="small">
           Transcriptional profile throughout the 48-h intraerythrocytic cycle of three distinct P. vivax clinical isolates.
           Samples were collected on the Northewestern border of Thailand and taken before treatment.
	  <br><br>
            <font color="#990099"><b>Patient 1</b></font>
            : color representing patient 1
            <br><font color="#009999"><b>Patient 2</b></font>
            : color representing patient 2
            <br><font color="#999900"><b>Patient 3</b></font>
            : color representing patient 3
            	  <br><br>

            <b>x-axis (all graphs)</b><br>
            Using the best fit Pearson correlations, correlated gene expression data in TP1-9 
            in <i>P. vivax</i> to the expression data in TP 9, 13, 17, 20, 23, 29, 35, 40, and 43
            in the <i>P. falciparum</i> transcriptome
            <br><br>
            <b>y-axis (graph #1)</b><br>
            Log (base 2) ratio of expression value
            (normalized by experiment) to average value for all time points
            for a gene
            <br><br>
            <b>y-axis (graph #2)</b><br>
            Ranking (percentile) of each gene's intensity relative to all other genes
            for a given experiment
          </div>
          <br><br>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_zb_pvivax'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Intraerythrocytic Time Series"
               attribution="Pvivax_ZB_Time_Series_ExpressionData"/>


  <c:set var="secName" value="WestenbergerVivax::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table border=0>
      <tr>
        <td class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>x-axis (all graphs)</b><br>
             Asexual parasites were extracted from patients who presented to local health clinics in the Peruvian Amazon region of Iquitos with typical signs and symptoms of malaria.  These were evaluated by light microscopy examination of Giemsa-stained blood smears to have P. vivax parasitemia.  P. vivax sporozoites were obtained from Sanaria, Inc. from mosquitoes fed on P. vivax infected chimpanzees infected with India VII strain P. vivax. 
            <br><br>
            <b>y-axis (graph #1)</b><br>
             RMAExpress Expression value (log2 scale).
            <br><br>
            <b>y-axis (graph #2)</b><br>
            Percentiles are calculated for each sample within array.
          </div>
          <br><br>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_westenberger'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>


  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Asexual parasites from patient blood samples"
               attribution="Westenberger_vivax_ExpressionData"/>


</c:if>

<c:if test="${organism eq 'Plasmodium falciparum 3D7'}">

  <c:set var="secName" value="DeRisiWinzeler::Ver1"/>
  <c:if test="${attrs['graph_derisi_winzeler'].value == 0 && attrs['graph_3d7'].value == 1 && attrs['graph_hb3'].value == 1 && attrs['graph_dd2'].value == 1}">
    <c:set var="secName" value="DeRisiOverlay::Ver1"/>
  </c:if>


  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="true"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td  class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="155" width="1"></td>
        <td  class="centered">
          <div class="small">
             Studies by the <a href="http://derisilab.ucsf.edu/">Derisi
             Lab</a> of <i>P. falciparum</i> strains 
             <font color='blue'>HB3</font>, <font color='red'>3D7</font>, and
             <font color='orange'>Dd2</font> used glass slide arrays.<br>
          </div>
        </td>
      </tr>

      <c:if test="${attrs['graph_derisi_winzeler'].value == 1}">

      <tr>
        <td  class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="155" width="1"></td>
        <td  class="centered">
          <div class="small">
             Studies by the <a href="http://www.scripps.edu/cb/winzeler/">Winzeler
             Lab</a> of
             <font color=#009999>Sorbitol</font>-
             and <font color=#990099>Temperature</font>-synchronized 3D7 strain             parasites used Affymetrix
             oligonucleotide arrays.<br>
          </div>
        </td>
      </tr>

      </c:if>

      <tr>
        <td  class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="170" width="1"></td>
        <td  class="centered">
          <div class="small">
             <a href="<c:url value="/correlatedGeneExpression.jsp"/>">More
             on mapping time points between time courses</a>
          </div>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_derisi_winzeler'].value == 0 && (attrs['graph_3d7'].value == 0 || attrs['graph_hb3'].value == 0 || attrs['graph_dd2'].value == 0)}">
    <c:set var="noData" value="true"/>
  </c:if>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Overlay of Intraerythrocytic Expression Profiles"
               attribution="winzeler_cell_cycle,derisi_Dd2_time_series,derisi_HB3_time_series,derisi_3D7_time_series,DeRisi_oligos"/>

  <c:set var="secName" value="Winzeler::Cc"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>x-axis (all graphs)</b><br>
            Plasmodium developmental stages* synchronized by
            <font COLOR='#009999'><b>sorbitol</b></font> and
            <font COLOR='#990099'><b>temperature</b></font>.
            Data for Gametocyte sample corresponds to synchronization only by sorbitol,
            and for Sporozoite sample represents average of two replicates.
            <br><br>
            <b>y-axis (graph #1)</b><br>
            Log (base 2) ratio of Affymetrix RMAExpress expression value
            (normalized by experiment) to average RMAExpress value for all time points
            for a gene
          </div>
        </td>
      </tr>
      <tr valign="middle">
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>y-axis (graph #2)</b><br>
            Ranking (percentile) of each gene's intensity relative to all other genes
            for a given experiment
          </div>
        </td>
      </tr>
      <tr valign="middle">
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="130" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>y-axis (graph #3)</b><br>
            Affymetrix RMAExpress expression value normalized by experiment
          </div>
        </td>
      
      </tr>
      <tr>
        <td colspan="3" class="centered">
          <div class="small">
            <font color="#009999"><b>sorbitol</b></font>
            : color representing stage synchronized by sorbitol
            <br><font color="#990099"><b>temperature</b></font>
            : color representing stage synchronized by temperature
            <br><font color="#999999"><b>below confidence threshold</b></font>
            : the expression level is less than 10 (too close to background),
            or the logP is greater than -0.5 (too few probes per gene)

            <br><br>
            <b>*Stages:</b> ER&nbsp;=&nbsp;Early&nbsp;Rings | LR&nbsp;=&nbsp;Late&nbsp;Rings |
            ET&nbsp;=&nbsp;Early&nbsp;Trophs | LT&nbsp;=&nbsp;Late&nbsp;Trophs |
            ES&nbsp;=&nbsp;Early&nbsp;Schizonts | LS&nbsp;=&nbsp;Late&nbsp;Schizonts |
            M&nbsp;=&nbsp;Merozoites | S&nbsp;=&nbsp;Sporozoites |
            G&nbsp;=&nbsp;Gametocytes

            <br><br>
            <b>Reference for this dataset:</b>
            <a href="http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Retrieve&db=PubMed&list_uids=12893887&dopt=Abstract">Le
            Roch et al. PubMed abstract</a><br>
            <b>To download a free electronic reprint</b>: go to
            <a href="https://www.scripps.edu/cb/winzeler/publications">Winzeler
            lab publications</a><br>
            <b>See also:</b>
            <a href="http://carrier.gnf.org/publications/CellCycle/">Supplemental
            material on Winzeler lab web site</a><br>
            <b>See also:</b>
            <a href="http://www.cbil.upenn.edu/RAD/php/displayStudy.php?study_id=429">Study
            annotations in RAD</a>
          </div>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_winzeler'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Intraerythrocytic 3D7 (photolithographic oligo array)"
               attribution="winzeler_cell_cycle"/>

  <c:set var="secName" value="WbcGametocytes::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="2" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>x-axis (both graphs)</b><br>
            Day of gametocytogenesis
            <br><br>
            <b>y-axis (graph #1)</b><br>
            Ranking (percentile) of ${id}'s intensity, relative to all other genes
          </div>
        </td>
      </tr>
      <tr valign="middle">
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>y-axis (graph #2)</b><br>
            Affymetrix RMAExpress expression value for ${id}, normalized by
            experiment
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="3" class="centered">
          <div class="small">
                <font face="helvetica,sans-serif" color="#ff0000" size="-1"><b>red</b></font>
                <font size="-1">: P. falciparum 3D7</font><br>
                <font face="helvetica,sans-serif" color="#ffc0cb" size="-1"><b>pink</b></font>
                <font size="-1">: MACS-purified P. falciparum 3D7</font><br>
                <font face="helvetica,sans-serif" color="#a020f0" size="-1"><b>purple</b></font>
                <font size="-1">: P. falciparum isolate NF54<br><br></font>

                <b>Reference:</b>
                <a href="http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Retrieve&db=pubmed&dopt=Abstract&list_uids=16005087&query_hl=1">Young
                et al. PubMed abstract</a>
          </div>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_gametocyte'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Gametocyte 3D7/NF54 (photolithographic oligo array)"
               attribution="winzeler_gametocyte_expression"/>

  <c:set var="secName" value="DeRisi::3D7"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
      <td class="centered">
        <div class="small">
          <a href="showQuestion.do?questionFullName=GeneQuestions.GenesByProfileSimilarity&ProfileTimeShift=not+allow&ProfileScaleData=not+scale&ProfileMinShift=0+hour&ProfileMaxShift=0+hour&ProfileDistanceMethod=Euclidean+Distance&ProfileGeneId=${id}&ProfileSearchGoal=most+similar&ProfileNumToReturn=50&ProfileProfileSet=3D7&questionSubmit=Get+Answer&goto_summary=0">Find genes with a similar profile</a><p>
          <b>x-axis (all graphs)</b><br>
          Time in hours after adding synchronized culture of <B>3D7</B> parasites
          to fresh blood

          <br><br>
          <b>graph #1</b><br>
          <font color="#4343ff"><b>blue plot:</b></font><br>
          averaged smoothed normalized log (base 2) of cy5/cy3 for ${id}<br>
          <font color="#bbbbbb"><b>gray plot:</b></font><br>
          averaged normalized log (base 2) of cy5/cy3 for ${id}
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
      <td class="centered">
        <div class="small">
          <b>y-axis (graph #2)</b><br>
          Expression intensity percentile<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="130" width="1"></td>
      <td class="centered">
        <div class="small">
          <b>y-axis (graph #3)</b><br>
          Lifecycle stage<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_3d7'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Developmental series 3D7 (glass slide oligo array)"
               attribution="derisi_3D7_time_series,DeRisi_oligos"/>

  <c:set var="secName" value="DeRisi::Dd2"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
      <td class="centered">
        <div class="small">
          <a href="showQuestion.do?questionFullName=GeneQuestions.GenesByProfileSimilarity&ProfileTimeShift=not+allow&ProfileScaleData=not+scale&ProfileMinShift=0+hour&ProfileMaxShift=0+hour&ProfileDistanceMethod=Euclidean+Distance&ProfileGeneId=${id}&ProfileSearchGoal=most+similar&ProfileNumToReturn=50&ProfileProfileSet=Dd2&questionSubmit=Get+Answer&goto_summary=0">Find genes with a similar profile</a><p>
          <b>x-axis (all graphs)</b><br>
          Time in hours after adding synchronized culture of
          <b>DD2</b> parasites
          to fresh blood

          <br><br>
          <b>graph #1</b><br>
          <font color="#4343ff"><b>blue plot:</b></font><br>
          averaged smoothed normalized log (base 2) of cy5/cy3 for ${id}<br>
          <font color="#bbbbbb"><b>gray plot:</b></font><br>
          averaged normalized log (base 2) of cy5/cy3 for ${id}
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
      <td class="centered">
        <div class="small">
          <b>y-axis (graph #2)</b><br>
          Expression intensity percentile<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="130" width="1"></td>
      <td class="centered">
        <div class="small">
          <b>y-axis (graph #3)</b><br>
          Lifecycle stage<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_dd2'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Developmental series Dd2 (glass slide oligo array)"
               attribution="derisi_Dd2_time_series,DeRisi_oligos"/>

  <c:set var="secName" value="DeRisi::HB3"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
      <td class="centered">
        <div class="small">
          <a href="showQuestion.do?questionFullName=GeneQuestions.GenesByProfileSimilarity&ProfileTimeShift=not+allow&ProfileScaleData=not+scale&ProfileMinShift=0+hour&ProfileMaxShift=0+hour&ProfileDistanceMethod=Euclidean+Distance&ProfileGeneId=${id}&ProfileSearchGoal=most+similar&ProfileNumToReturn=50&ProfileProfileSet=HB3&questionSubmit=Get+Answer&goto_summary=0">Find genes with a similar profile</a><p>
          <b>x-axis (all graphs)</b><br>
          Time in hours after adding synchronized culture of
          <b>HB3</b> parasites
          to fresh blood

          <br><br>
          <b>graph #1</b><br>
          <font color="#4343ff"><b>blue plot:</b></font><br>
          averaged smoothed normalized log (base 2) of cy5/cy3 for ${id}<br>
          <font color="#bbbbbb"><b>gray plot:</b></font><br>
          averaged normalized log (base 2) of cy5/cy3 for ${id}
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
      <td class="centered">
        <div class="small">
          <b>y-axis (graph #2)</b><br>
          Expression intensity percentile<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="130" width="1"></td>
      <td class="centered">
        <div class="small">
          <b>y-axis (graph #3)</b><br>
          Lifecycle stage<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_hb3'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Developmental series HB3 (glass slide oligo array)"
               attribution="derisi_HB3_time_series,DeRisi_oligos"/>

  <c:set var="secName" value="MEXP128::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table width="90%" cellpadding=3>
      <tr>
        <td rowspan="2" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        <td class="centered">
         <div class="small">            
Comparison of expression profile of two 3D7 isogenic clones : 3D7S8.4 vs. 3D7AH1S2 (M=log2(3D7S8.4/3D7AH1S2) at three different stages of intraerythrocytic cycle: ring,
trophozite and schizont stage.
         </div>
        </td>
      </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_mexp128'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Intraerythrocytic comparison of antigenic and adherent variant clones of <i>P. falciparum 3D7</i>"
               attribution="E-MEXP-128_arrayData"/> 

  <c:set var="secName" value="Cowman::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table cellspacing=3>
 
      <tr>
        <td rowspan="2" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      </tr>

      <tr>
        <td class="centered"><image width="95%" src="<c:url value="/images/spacer.gif"/>" height="150" width="1"></td>
        <td class="centered">
        </td>
      </tr>

   <tr>
            <td class="centered"><image  src="<c:url value="/images/cowman_percentile.PNG"/>" ></td>
            <td  class="centered"><div class"small">The percentile graph represents all expression values across the dymanic range of intensities for each study.</div></td>
   </tr>


    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_cowman'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Sir2 and invasion pathway studies (WT vs. KO)"
               attribution="scrMalaria_PlasmoSubset,CowmanStubbs_arrayData,CowmanDuraisingh_arrayData,CowmanBaum_arrayData,Cowman_radAnalysisscrMalaria_PlasmoSubset"/>


  <c:set var="secName" value="Daily::SortedRmaAndPercentiles"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="typeArg" value="patient-number"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}&typeArg=${typeArg}"/>

  <c:set var="isOpen" value="false"/>

<c:set var="preImgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}&typeArg="/>

  <c:set var="expressionContent">

    <table width="95%">
<FORM NAME="DailySort">
      <tr>
        <td rowspan=2 class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
         <td  class="centered"  nowrap><b>Sort By:</b>
<SELECT NAME="DailyList"
OnChange="javascript:updateImage('${imgId}', DailySort.DailyList.options[selectedIndex].value)">
<OPTION SELECTED="SELECTED" VALUE="${preImgSrc}patient-number">patient-number</OPTION>
<OPTION VALUE="${preImgSrc}age">age</OPTION>
<OPTION VALUE="${preImgSrc}temperature">temperature</OPTION>
<OPTION VALUE="${preImgSrc}weight">weight</OPTION>
<OPTION VALUE="${preImgSrc}days-ill">days-ill</OPTION>
<OPTION VALUE="${preImgSrc}parasitemia">parasitemia</OPTION>
<OPTION VALUE="${preImgSrc}hct">hct</OPTION>
<OPTION VALUE="${preImgSrc}TNFa">TNFa</OPTION>
<OPTION VALUE="${preImgSrc}TGFa">TGFa</OPTION>
<OPTION VALUE="${preImgSrc}Lymphotactin">Lymphotactin</OPTION>
<OPTION VALUE="${preImgSrc}Tissue-Factor">Tissue-Factor</OPTION>
<OPTION VALUE="${preImgSrc}P-selectin">P-selectin</OPTION>
<OPTION VALUE="${preImgSrc}VCAM1">VCAM1</OPTION>
<OPTION VALUE="${preImgSrc}IL6">IL6</OPTION>
<OPTION VALUE="${preImgSrc}IL10">IL10</OPTION>
<OPTION VALUE="${preImgSrc}IL12p70">IL12p70</OPTION>
<OPTION VALUE="${preImgSrc}IL15">IL15</OPTION>
</select>
    </td></tr>

    <tr>
      <td  class="centered"><div class="small">Correlations between the expressoin level and various measured factors are shown.  The patient samples (x axis) can be ordered based on any factor using the drop down list.  The patient number is always displayed with the factor value. Colors indicate clusters based on Daily et. al. publication (see data source). Blue= cluster1 (starvation response), purple=cluster2 (early ring stage), peach= cluster3 (env. stress). 
      </div>   
   </td>
    </tr>
</FORM>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_daily'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Distinct physiological states of <i>Plasmodium falciparum</i> in malaria infected patients"
               attribution="daily_expressionProfiles"/>

  <!-- start Newbold microarry study --> 
  <c:set var="secName" value="Newbold::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table cellspacing=3>
 
      <tr>
        <td rowspan="2" class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      </tr>

      <tr>
        <td class="centered"><image width="95%" src="<c:url value="/images/spacer.gif"/>" height="150" width="1"></td>
        <td class="centered">
          <div class="small">
            <b>x-axis (all graphs)</b><br>
             Patients with diverse sympotoms of malaria. <i>Plasmodium falciparum</i> directly from the blood of infected individuals was cultured to examine patterns of mature-stage gene expression in patient isolates. 
            <br><br>
            <b>y-axis (graph #1)</b><br>
            log2 of the RMA normalized values
            <br><br>
            <b>y-axis (graph #2)</b><br>
            Percentiles are calculated for each sample within array.
            <br/><br/>
            <b>mild/severe disease (all graphs)</b><br>
            <font color='red'>red color</font> represents patients with severe disease <br/>
            <font color='lightskyblue'>blue color</font> represents patients with mild disease <br/>
          </div>
          <br><br> 
        </td>
      </tr>

    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_cowman'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Ex vivo intraerythrocitic expression assays of <i>Plasmodium falciparum</i> in malaria infected patients"
               attribution="Pfalciparum_newbold_Gene_Expression"/>

  <!-- end Newbold microarry study -->


</c:if>


<c:if test="${organism eq 'Plasmodium yoelii yoelii str. 17XNL'}">

  <c:set var="secName" value="Kappe::ReplicatesAveraged"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>

  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table width="90%" cellpadding=4>
      <tr>
        <td  class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
        </tr>
        <tr>
        <td  class="centered"><div class="small">
<b>ooSpz</b>: Sporozoites from infected A. stephensi mosquitoes midguts (harvested 10 days after mosquito feeding)<br/>
<b>sgSpz</b>: Sporozoites from infected A. stephensi mosquitoes salivary glands (harvested 15 days after mosquito feeding)<br/>
<b>LS24</b>: Isolated liver stage infected hepatocytes 24 hrs after in vivo infection<br/>
<b>LS40</b>: Isolated liver stage infected hepatocytes 40 hrs after in vivo infection<br/>
<b>LS50</b>: Isolated liver stage infected hepatocytes 50 hrs after in vivo infection<br/>
<b>Schz</b>: Purified erythrocytic schizonts<br/>
<b>BS</b>: mixed erythrocytic stages when parasitemia was at 5-10%<br/><br/>
M values (Blue bars in the upper graph) represent the relative expression level between pairs of conditions expressed as base-2 logarithms (note that M is in units of 2-fold change so in a comparison M = 0 denotes equal expression, M = +/-1 denotes a 2-fold difference in expression between the compared samples, etc.) - each is the average of all arrays representing the indicated comparison.  <br/>The lower graph gives the expression percentile of the two conditions for each of the comparisons - each is the average percentile over all arrays representing that comparision.
</div>
</td>
</tr>

</table>
</c:set>

<c:set var="noData" value="false"/>
<c:if test="${attrs['graph_kappe'].value == 0}">
<c:set var="noData" value="true"/>
</c:if>

<wdk:toggle name="${secName}" isOpen="${isOpen}"
       content="${expressionContent}" noData="${noData}"
       imageId="${imgId}" imageSource="${imgSrc}"
       displayName="Relative expression profiles between liver, mosquito, and red cell stage parasites"
       attribution="Kappe_expressionProfiles"/>


<c:set var="secName" value="Kappe::AveragedPercentiles"/>
<c:set var="imgId" value="img${secName}"/>
<c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>

<c:set var="isOpen" value="false"/>

<c:set var="expressionContent">
<table>
<tr>
<td rowspan="2" class="centered">
  <c:choose>
  <c:when test="${!async}">
      <img src="${imgSrc}">
  </c:when>
  <c:otherwise>
      <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
  </c:otherwise>
  </c:choose>
</td>
<td  class="centered"><div class="small">
The overall expression percentile of each condition is the average percentile over all arrays representing that condition regardless of channel.
 </div>
</td>
</tr>
</table>
</c:set>

<c:set var="noData" value="false"/>
<c:if test="${attrs['graph_kappe'].value == 0}">
<c:set var="noData" value="true"/>
</c:if>

<wdk:toggle name="${secName}" isOpen="${isOpen}"
       content="${expressionContent}" noData="${noData}"
       imageId="${imgId}" imageSource="${imgSrc}"
       displayName="Expression profile of liver, mosquito, and red cell stage parasites"
       attribution="Kappe_expressionProfiles"/>



  <c:set var="secName" value="WinzelerYoelii::Ver1"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>

  <c:set var="isOpen" value="false"/>

<c:set var="expressionContent">
<table>
<tr>
<td rowspan="2" class="centered">
  <c:choose>
  <c:when test="${!async}">
      <img src="${imgSrc}">
  </c:when>
  <c:otherwise>
      <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
  </c:otherwise>
  </c:choose>
</td>
<td  class="centered">
<div class="small">

<table cellpadding=0 cellspacing=0>
<tr><td colspan=2><b>X-Axis(Graph #1 and #2)</b></td></tr>
<tr><td>G(1) </td><td>	Gametocyte 1</td></tr>
<tr><td>G(2)</td><td>	Gametocyte 2</td></tr>
<tr><td>GM(1)</td><td>	Gametocyte 1 Mature</td></tr>
<tr><td>GI(2)</td><td>	Gametocyte 2 Immature</td></tr>
<tr><td>S</td><td>	Schizont</td></tr>
<tr><td>MB</td><td>	Mixed blood</td></tr>
<tr><td>MB</td><td>	Mixed blood</td></tr>
<tr><td>SS(1) 14 dpi</td><td>	Salivary sporozoite 1 (14 days post infection)</td></tr>
<tr><td>SS(2) 14 dpi</td><td>	Salivary sporozoite 2 (14 days post infection)</td></tr>
<tr><td>SS(3) 14 dpi</td><td>	Salivary sporozoite 3 (14 days post infection)</td></tr>
<tr><td>MS(1) 9 dpi</td><td>	Midgut sporozoite 1 (9 days post infection)</td></tr>
<tr><td>MS(2) 9 dpi</td><td>	Midgut sporozoite 2 (9 days post infection)</td></tr>
<tr><td>LS(1) 36 hpi</td><td>	Liver subtraction 1 (36 hours post infection)</td></tr>
<tr><td>LS(2) 40 hpi</td><td>	Liver subtraction 2 (40 hours post infection)</td></tr>
</table>
 </div>
</td>
</tr>
</table>
</c:set>

<c:set var="noData" value="false"/>
<c:if test="${attrs['graph_winzeler_py_mixed'].value == 0}">
<c:set var="noData" value="true"/>
</c:if>

<wdk:toggle name="${secName}" isOpen="${isOpen}"
       content="${expressionContent}" noData="${noData}"
       imageId="${imgId}" imageSource="${imgSrc}"
       displayName="Expression profile of blood stage, live stage, gametocyte, and sporozoite samples"
       attribution="winzeler_yoelii_falciparum_comparison_expression"/>

</c:if>

<c:if test="${binomial eq 'Plasmodium berghei str. ANKA'}">

  <c:set var="secName" value="Waters::Dozi"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&id=${id}&model=plasmo&fmt=png"/>
  <c:set var="isOpen" value="true"/>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_waters_dozi'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
        </td>

        <td><image src="<c:url value="/images/spacer.gif"/>" height="155" width="5"></td>        

	<td class="top">  
          <wdk:wdkTable tblName="TwoChannelDiffExpr" isOpen="true"/>

        </td>

        <td><image src="<c:url value="/images/spacer.gif"/>" height="155" width="5"></td>        
        <td class="centered">
          <div class="small">
             	<!-- DESCRIPTION GOES HERE -->
          </div>
        </td>
      </tr>
    </table>
  </c:set>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="P.Berghei Differential Expression - DOZI KO vs. WT"
               attribution="DOZI_page"/>


<%-- berghei expression --%>
<c:set var="secName" value="Waters::Ver1"/>
<c:set var="imgId" value="img${secName}"/>
<c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
<c:set var="isOpen" value="false"/>

<c:set var="expressionContent">
<table>
<tr>
<td rowspan="2"  class="centered">
  <c:choose>
  <c:when test="${!async}">
      <img src="${imgSrc}">
  </c:when>
  <c:otherwise>
      <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
  </c:otherwise>
  </c:choose>
</td>
<td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="250" width="1"></td>
        <td class="centered">
          <div class="small">
             Induction/Repression
          </div>
        </td>
      </tr>

      <tr>
        <td class="centered"><image src="<c:url value="/images/spacer.gif"/>" height="150" width="1"></td>
        <td class="centered">
          <div class="small">
             Expression levels
          </div>
        </td>
      </tr>

    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_waters'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="P. berghei expression"
               attribution="berghei_gss_oligos,berghei_oligo_gene_mapping,berghei_gss_time_series,P.berghei_wholeGenomeShotgunSequence,P.berghei_Annotation"/>


</c:if>


