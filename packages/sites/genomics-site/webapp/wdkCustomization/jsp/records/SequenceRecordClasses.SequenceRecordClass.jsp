<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%-- get wdkRecord from proper scope --%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set var="projectIdLowerCase" value="${fn:toLowerCase(projectId)}"/>

<c:set var="SRT_CONTIG_URL" value="/cgi-bin/contigSrt"/>

<c:set var="recordType" value="${wdkRecord.recordClass.type}" />

<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['organism']}"/>
</c:catch>

<imp:pageFrame title="${id}"
             divisionName="Genomic Sequence Record"
             refer="recordPage"
             division="queries_tools">

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The ${fn:toLowerCase(recordType)} '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<c:set var="externalDbName" value="${attrs['externalDbName'].value}" />
<c:set var="organism" value="${wdkRecord.attributes['organism'].value}" />
<c:set var="is_top_level" value="${wdkRecord.attributes['is_top_level'].value}" />

<br/>

<%-- quick tool-box for the record --%>
<imp:recordToolbox />

<div class="h2center" style="font-size:160%">
 	Genomic Sequence
</div>

<div class="h3center" style="font-size:130%">
	${primaryKey}<br>
	<imp:recordPageBasketIcon />
</div>

<%--#############################################################--%>




<c:set var="append" value="" />

<c:set var="attr" value="${attrs['overview']}"/>
<imp:panel 
    displayName="${attr.displayName}"
    content="${attr.value}"
    attribute="${attr.name}" />
<br>


<%------------------------------------------------------------------%>
<c:url var="commentsUrl" value="addComment.do">
  <c:param name="stableId" value="${id}"/>
  <c:param name="commentTargetId" value="genome"/>
  <c:param name="externalDbName" value="${attrs['externalDbName'].value}" />
  <c:param name="externalDbVersion" value="${attrs['externalDbVersion'].value}" />
  <c:param name="flag" value="0" /> 
</c:url>
<c:catch var="e">
      <imp:wdkTable tblName="SequenceComments" isOpen="true"/>
      <a href="${commentsUrl}"><font size='-2'>Add a comment on ${id}</font></a>
</c:catch>
<c:if test="${e != null}">
     <imp:embeddedError 
         msg="<font size='-1'><b>User Comments</b> is temporarily unavailable.</font>"
         e="${e}" 
     />
</c:if>
    
<br>


<%-- DNA CONTEXT ---------------------------------------------------%>
<%------------------------------------------------------------------%>
<%-- Gbrowse tracks defaults  --------------------------------------%>
<%------------------------------------------------------------------%>
<c:set var="gtracks" value="${attrs['gbrowseTracks'].value}" />
<%------------------------------------------------------------------%>
<%-- Gbrowse tracks defaults For Unannotated genomes  --------------%>
<%------------------------------------------------------------------%>
<c:if test="${attrs['gene_count'].value == 0}">

  <%------------------------------------------------------------------%>
  <c:choose>
    <c:when test="${projectId eq 'TriTrypDB' && attrs['length'].value >= 300000}">
      <c:set var="gtracks" value="BLASTX+ORF600+TandemRepeat+LowComplexity" />
    </c:when>
    <c:when test="${projectId eq 'TriTrypDB' && attrs['length'].value < 300000}">
      <c:set var="gtracks" value="BLASTX+ORF+TandemRepeat+LowComplexity" />
    </c:when>
    <c:when test="${(projectId eq 'PlasmoDB' || projectId eq 'FungiDB') && attrs['length'].value >= 100000}">
      <c:set var="gtracks" value="ProtAlign+ORF600+TandemRepeat+LowComplexity" />
    </c:when>
    <c:when test="${(projectId eq 'PlasmoDB' || projectId eq 'FungiDB') && attrs['length'].value < 100000}">
      <c:set var="gtracks" value="ProtAlign+ORF300+TandemRepeat+LowComplexity" />
    </c:when>
    <c:otherwise>

       <c:choose>
         <c:when test="${attrs['length'].value >= 100000}">
           <c:set var="gtracks" value="BLASTX+ORF600+TandemRepeat+LowComplexity" />
         </c:when>
         <c:otherwise>
           <c:set var="gtracks" value="BLASTX+ORF300+TandemRepeat+LowComplexity" />
         </c:otherwise>
       </c:choose>
    </c:otherwise>
  </c:choose>
  <%------------------------------------------------------------------%>
  <%-- Gbrowse tracks defaults For Specific Genomes   ----------------%>
  <%------------------------------------------------------------------%>
  <c:if test="${ (fn:contains(organism,'Anncaliia') || fn:contains(organism,'Edhazardia') || fn:contains(organism,'Nosema') || fn:contains(organism,'Vittaforma')) && projectId eq 'MicrosporidiaDB'}">
    <c:set var="gtracks" value="" />
  </c:if>
</c:if>
<%------------------------------------------------------------------%>





<c:set var="attribution">
</c:set>

<c:if test="${gtracks ne ''}">
    <c:set var="genomeContextUrl">
    http://${pageContext.request.serverName}/cgi-bin/gbrowse_img/${projectIdLowerCase}/?name=${id}:1..${attrs['length'].value};hmap=gbrowse;type=${gtracks};width=640;embed=1;h_feat=${feature_source_id}@yellow
    </c:set>
    <c:set var="genomeContextImg">
        <noindex follow><center>
        <c:catch var="e">
           <c:import url="${genomeContextUrl}"/>
        </c:catch>
        <c:if test="${e!=null}"> 
            <imp:embeddedError 
                msg="<font size='-2'>temporarily unavailable</font>" 
                e="${e}" 
            />
        </c:if>
        </center>
        </noindex>

        <c:set var="labels" value="${fn:replace(gtracks, '+', ';label=')}" />
        <c:set var="gbrowseUrl">
            /cgi-bin/gbrowse/${projectIdLowerCase}/?name=${id}:1..${attrs['length'].value};label=${labels};h_feat=${id}@yellow
        </c:set>
        <a href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>

    </c:set>

    <imp:toggle 
        isOpen="true"
        name="genomicContext"
        displayName="Genomic Context"
        content="${genomeContextImg}"
        attribution="${attribution}"/>
    <br>
</c:if>


<br>


<imp:wdkTable tblName="Aliases" isOpen="true"/>

<imp:wdkTable tblName="Centromere" isOpen="true"/>

<imp:wdkTable tblName="SequencePieces" isOpen="true"/>

<%------------------------------------------------------------------%>

<c:set var="content">
${externalLinks}
<form action="${SRT_CONTIG_URL}" method="GET">
 <table border="0" cellpadding="0" cellspacing="1">
  <tr class="secondary3"><td>
  <table border="0" cellpadding="0">
    <tr><td colspan="2"><h3>Retrieve this Contig with the Sequence Retrieval Tool</h3>
      <input type='hidden' name='ids' size='20' value="${id}" />
      <input type='hidden' name='project_id' size='20' value="${projectId}" />
    </td></tr>
    <tr><td colspan="2"><b>Nucleotide positions:</b> &nbsp;&nbsp;
        <input type="text" name="start" value="1" maxlength="10" size="10" />
     to <input type="text" name="end"   value="${attrs['length'].value}" maxlength="10" size="10" />
     &nbsp;&nbsp;&nbsp;&nbsp;
         <input type="checkbox" name="revComp" ${initialCheckBox}>Reverse & Complement
    </td></td>
    <tr><td><input type="submit" name='go' value='Get Sequence' /></td></tr>
  </table>
  </td></tr>
 </table>
</form>

<c:if test="${is_top_level eq '1' && ((projectId eq 'PlasmoDB' && fn:containsIgnoreCase(organism, 'falciparum')) || (projectId eq 'TriTrypDB' && !fn:contains(organism,'Crithidia') && !fn:contains(organism,'tarentolae')) || projectId eq 'CryptoDB' || projectId eq 'ToxoDB' || projectId eq 'AmoebaDB' || projectId eq 'MicrosporidiaDB')}">

  <c:if test="${attrs['has_msa'].value == 1}">

  <br />
<h3>Retrieve Multiple Sequence Alignments by Contig / Genomic Sequence IDs</h3>
   <imp:mercatorMAVID cgiUrl="/cgi-bin" projectId="${projectId}" contigId="${id}"
      start="1" end="${attrs['length'].value}" bkgClass="secondary3" cellPadding="0"/>
  </c:if>
</c:if>
</c:set>

<imp:toggle
    isOpen="true"
    name="Sequences"
    attribution=""
    displayName="Sequences"
    content="${content}" />

<%------------------------------------------------------------------%>
<%------------------------------------------------------------------%>


<%------- The Attribution Section is Organism Specific -------------%>

<%------------------------------------------------------------------%>
<%------------------------------------------------------------------%>


 <c:choose>
 <c:when test="${projectId eq 'PiroplasmaDB' || projectId eq 'FungiDB' || projectId eq 'PlasmoDB' || projectId eq 'CryptoDB' || projectId eq 'MicrosporidiaDB' || projectId eq 'ToxoDB' || projectId eq 'AmoebaDB' || projectId eq 'GiardiaDB'}">

    <c:set value="${wdkRecord.tables['GenomeSequencingAndAnnotationAttribution']}" var="referenceTable"/>

    <c:set value="Error:  No Attribution Available for This Genome!!" var="reference"/>

     <c:forEach var="row" items="${referenceTable}">
      <c:if test="${externalDbName eq row['name'].value}">
         <c:set var="reference" value="${row['description'].value}"/>
      </c:if>
     </c:forEach>

 </c:when>



    <c:when test="${projectId eq 'TrichDB'}">
    <c:set var="reference">
     T. vaginalis sequence from Jane Carlton (NYU,TIGR). PMID: 17218520
    </c:set>
    </c:when>


<c:when test="${fn:contains(organism,'brucei gambiense') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
  Chromosome sequences and annotations for <i>Trypanosoma brucei gambiense</i> obtained from the Pathogen Sequencing Unit at the Wellcome Trust Sanger Institute
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'brucei TREU927') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
   Sequence data for <i>Trypanosome brucei</i> strain TREU (Trypanosomiasis Research Edinburgh University) 927/4 were downloaded from <a href="http://www.genedb.org/genedb/tryp/">GeneDB</a> (sequence and annotated features).<br>
Sequencing of <i>T. brucei</i> was conducted by <a href="http://www.sanger.ac.uk/Projects/T_brucei/">The Sanger Institute pathogen sequencing unit</a> and <a href="http://www.tigr.org/tdb/e2k1/tba1/">TIGR</a>.
     </c:set>
  </c:when>
<c:when test="${fn:contains(organism,'brucei strain 427') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
  <i>Trypanosoma brucei</i> strain Lister 427 genome sequence and assembly was provided prepublication by Dr. George Cross. For additional information please see information in the <a href="getDataset.do?display=detail&datasets=Tbrucei427_chromosomes_RSRC&title=Query#Tbrucei427_chromosomes_RSRC">data sources</a> page.
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'congolense') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
Chromosome and unassigned contig sequences and annotations for <i>Trypanosoma congolense</i> obtained from the Pathogen Sequencing Unit at the Wellcome Trust Sanger Institute
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'CL Brener') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
      Sequence data for <i>Trypanosoma cruzi</i> strain CL Brener contigs were downloaded from Genbank (sequence and annotated features).<br>  Sequencing of <i>T. cruzi</i> was conducted by the <i>Trypanosoma cruzi</i> sequencing consortium (<a href="http://www.tigr.org/tdb/e2k1/tca1/">TIGR</a>, <a href="http://www.sbri.org/">Seattle Biomedical Research Institute</a> and <a href="http://ki.se/ki/jsp/polopoly.jsp?d=130&l=en">Karolinska Institute</a>.
<br/>Mapping of gene coordinates from contigs to chromosomes for T. cruzi strain CL Brener chromosomes, generated by Rick Tarleton lab (UGA).
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'strain esmeraldo') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
Sequence from <i>Trypanosoma cruzi</i> Esmeraldo strain cl3 was obtained from Dr. Gregory Buck, Center for the Study of Biological Complexity, Microbiology and Immunology, Virginia Commonwealth University. <br><br>It is requested that users of this <i>Trypanosoma cruzii</i> Esmeraldo cl3 strain sequence assembly acknowledge Gregory A. Buck, Virginia Commonwealth University, and The Genome Center, Washington University School of Medicine in any publications that result from use of this sequence assembly.<br><br>Any publications that propose to use whole genome or chromosome data should contact The Genome Center at Washington University (gweinsto@wustl.edu or wwarren@wustl.edu) for the use of pre-publication data.  Please refer to the <a href="http://genome.wustl.edu/data/data_use_policy">Genome Center Data Use Policy</a> for further information regarding proper use of data and proper citation.<br><br> For additional information on this <i>Trypanosoma cruzi</i> assembly, please visit the <a href="getDataset.do?display=detail&datasets=TcruziEsmeraldo_scaffold_RSRC&title=Query#TcruziEsmeraldo_scaffold_RSRC">data source</a>. 
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'Endotrypanum monterogeii strain LV88') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
The <i>Endotrypanum monterogeii</i> LV88 strain was provided by Dr. Michael Chance, Liverpool, as described (A. H. Lopes, D.M. Iovannisci, M. Petrillo-Peixoto, D. McMahon-Pratt, & S.M. Beverley (1990), Molec. Biochem. Parasitol.  40: 151-162).  It was isolated from a <i>Choloepus hoffmani</i> sloth in Costa Rica.    
Genomic DNA was prepared by CsCl/Ethidium bromide density gradient centrifugation to rminimize the amount of kinetoplast (mitochondrial) DNA, and was provided by Drs. Natalia Akopyants and Stephen Beverley, Washington University School of Medicine.    
Total sequence coverage of 454 instrument reads was 50X (Fragments 20X, 3Kb PE 24X, 8Kb PE 6X) using a genome size estimate of 35Mb. The combined sequence reads were assembled using the Newbler software (Roche). This first draft assembly was referred to as <i>Endotrypanum monterogeii</i> 1.0. This version has been cleaned of contaminants and had some remaining vector trimmed from contigs. The assembly is made up of a total of 3593 scaffolds with an N50 scaffold length of over 693kb (N50 contig length was 21.7kb). The assembly spans 32.4Mb.
<br/><br/>
This work was supported by NIH grant AI29646 to SMB and by NIH-NHGRI grant 5U54HG00307907 to RKW, Director of The Genome Institute at Washington University.
<br/><br/>
For questions regarding this <i>Endotrypanum monterogeii</i> LV88 1.0 assembly please contact Dr. Wes Warren, Washington University School of Medicine (wwarren@genome.wustl.edu). Downloads of the sequence data are available via the TriTrypDB genome browser server. Funding for the sequence characterization of the <i>Endotrypanum monterogeii</i> LV88 genome was provided by the National Human Genome Research Institute (NHGRI), National Institutes of Health (NIH).
  </c:set>
</c:when>

<c:when test="${fn:contains(organism,'Leishmania major strain LV39c5') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
<i>Leishmania major</i> LV39 clone 5 (LV39cl5) was provided by Dr. Richard Titus.   This is a clonal derivative of the L. major strain with the WHO designation Rho/SU/59/P, as described (Marchand, M., Daoud, S., Titus, R. G., Louis, J. & Boon, T., (1987) Parasite Immunol. 9, 81-92).     Investigators should be aware of our understanding that other lines arising from this WHO strain have received many different shorthand names around the world.  However limited testing suggest some may differ significantly from one another, for reasons unknown. 
Genomic DNA was prepared by CsCl/Ethidium bromide density gradient centrifugation to rminimize the amount of kinetoplast (mitochondrial) DNA, and was provided by Drs. Natalia Akopyants and Stephen Beverley, Washington University School of Medicine.    
Total sequence coverage of 454 instrument reads was 54X (Fragments 25X, 3Kb PE 24X, 8Kb PE 6X) using a genome size estimate of 35Mb. The combined sequence reads were assembled using the Newbler software (Roche). This first draft assembly was referred to as <i>Leishmania major</i> LV39cl5 1.0. This version has been cleaned of contaminants and had some remaining vector trimmed from contigs. The assembly is made up of a total of 1754 scaffolds with an N50 scaffold length of over 962kb (N50 contig length was 40.4kb). The assembly spans 32.2Mb.
<br/><br/>
This work was supported by NIH grant AI29646 to SMB and by NIH-NHGRI grant 5U54HG00307907 to RKW, Director of The Genome Institute at Washington University.
<br/><br/>
For questions regarding this <i>Leishmania major</i> LV39cl5 1.0 assembly please contact Dr. Wes Warren, Washington University School of Medicine (wwarren@genome.wustl.edu). Downloads of the sequence data are available via the TriTrypDB genome browser server. Funding for the sequence characterization of the <i>Leishmania major</i> LV39cl5 genome was provided by the National Human Genome Research Institute (NHGRI), National Institutes of Health (NIH).

  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'Leishmania panamensis strain L13') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
The <i>Leishmania panamensis</i> strain L13 (WHO strain identifier MHOM/COL/81/L13) was obtained from Dr. Nancy Saravia, CIDEIM, Cali, Colombia.   This isolate was obtained from a human mucosal lesion from Colombia (Choco, Tadó).  
Genomic DNA was prepared by CsCl/Ethidium bromide density gradient centrifugation to minimize the amount of kinetoplast (mitochondrial) DNA, and was provided by Drs. Natalia Akopyants and Stephen Beverley, Washington University School of Medicine.  
Total sequence coverage of Illumina instrument reads was 165X (300-500bp inserts 65X, 3Kb PE 99X) using a genome size estimate of 35Mb. The combined sequence reads were assembled using the SOAPdenovo software (BGI). This first draft assembly was referred to as <i>Leishmania panamensis</i> L13 1.0. This version has not been cleaned of contaminating contigs. The assembly is made up of a total of 2825 scaffolds with an N50 scaffold length of over 124kb (N50 contig length was 4838bp). The assembly spans 29.2Mb.
<br/><br/>
This work was supported by NIH grant AI29646 to SMB and by NIH-NHGRI grant 5U54HG00307907 to RKW, Director of The Genome Institute at Washington University.
<br/><br/>
For questions regarding this <i>Leishmania panamensis</i> L13 1.1 assembly please contact Dr. Wesley Warren, Washington University School of Medicine (wwarren@genome.wustl.edu). Downloads of the sequence data are available via the TriTrypDB genome browser server. Funding for the sequence characterization of the <i>Leishmania panamensis</i> L13 genome was provided by the National Human Genome Research Institute (NHGRI), National Institutes of Health (NIH).
  </c:set>
</c:when>

<c:when test="${fn:contains(organism,'M2903') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
Sequence from <i>Leishmania braziliensis M2903</i> was generated by the Washington University Genome Center and has been provided <a href="http://genome.wustl.edu/data/data_use_policy">prepublication</a>. Permission should be obtained from Steve Beverley (beverley@borcim.wustl.edu) before publishing analyses of the sequence/open reading frames/genes on a genome scale. <br><br>Please read <a href="http://www.ncbi.nlm.nih.gov/pubmed/19741685">this paper for policies on pre-publication data sharing</a>. <br><br>For additional information on the <i>Leishmania braziliensis M2903</i> assembly, please visit the <a href="getDataset.do?display=detail&datasets=LbraziliensisM2903_contigs_RSRC&title=Query#LbraziliensisM2903_contigs_RSRC">data source</a>.
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'braziliensis') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
   Sequence data for <i>Leishmania braziliensis</i> clone M2904 (MHOM/BR/75M2904) were downloaded from <a href="http://www.genedb.org/genedb/lbraziliensis/">GeneDB</a> (sequence and annotated features).<br>
Sequencing of <i>L. braziliensis</i> was conducted by <a href="http://www.sanger.ac.uk/Projects/L_braziliensis/">The Sanger Institute pathogen sequencing unit</a>.
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'infantum') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
   Sequence data for <i>Leishmania infantum</i> clone JPCM5 (MCAN/ES/98/LLM-877) were downloaded from <a href="http://www.genedb.org/genedb/linfantum/">GeneDB</a> (sequence and annotated features).<br> 
Sequencing of <i>L. infantum</i> was conducted by <a href="http://www.sanger.ac.uk/Projects/L_infantum/">The Sanger Institute pathogen sequencing unit</a>. 
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'SD 75.1') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">   
Sequence from <i>Leishmania major strain SD 75.1</i> was generated by the Washington University Genome Center and has been provided <a href="http://genome.wustl.edu/data/data_use_policy">prepublication</a>. Permission should be obtained from Steve Beverley (beverley@borcim.wustl.edu) before publishing analyses of the sequence/open reading frames/genes on a genome scale. <br><br>Please read <a href="http://www.ncbi.nlm.nih.gov/pubmed/19741685">this paper for policies on pre-publication data sharing</a>. <br><br>For additional information on the <i>SD 75.1</i> assembly, please visit the <a href="getDataset.do?display=detail&datasets=Lmajor_SD_75.1"&title=Query#Lmajor_SD_75.1">data source</a>.
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'major strain Friedlin') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
   Sequence data for <i>Leishmania major</i> Friedlin (reference strain - MHOM/IL/80/Friedlin, zymodeme MON-103) were downloaded from <a href="http://www.genedb.org/genedb/leish/">GeneDB</a> (sequence and annotated features).<br>
Sequencing of <i>L. major</i> was conducted by <a href="http://www.sanger.ac.uk/Projects/L_major/">The Sanger Institute pathogen sequencing unit</a>, <a href="http://www.sbri.org/">Seattle Biomedical Research Institute</a> and <a href="http://www.sanger.ac.uk/Projects/L_major/EUseqlabs.shtml">The European Leishmania major Friedlin Genome Sequencing Consortium</a>.
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'mexicana') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
   Chromosome and unassigned contig sequences for <i>L.mexicana</i> were obtained from the Pathogen Sequencing Unit at the Wellcome Trust Sanger Institute.
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'tarentolae') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
Chromosome sequence for <i>Leishmania tarentolae</i> are provided by  the CIHR Group on host pathogen interactions (Marc Ouellette, Jacques Corbeil, Barbara Papadopoulou, Michel J. Tremblay, Fr&#233;d&#233;ric Raymond, S&#233;bastien Boisvert from Universit&#233; Laval, and Martin Olivier from McGill University). <br><br><b>Genome sequencing of the lizard parasite <i>Leishmania tarentolae</i> reveals loss of genes associated to the intracellular stage of human pathogenic species</b> <a href="http://www.ncbi.nlm.nih.gov/pubmed/21998295">Raymond et. al</a>.
  </c:set>
</c:when>

<c:when test="${fn:contains(organism,'Crithidia') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
Sequence from <i>Crithidia fasciculata</i> was generated by the Washington University Genome Center and has been provided <a href="http://genome.wustl.edu/data/data_use_policy">prepublication</a>. Permission should be obtained from Steve Beverley (beverley@borcim.wustl.edu) before publishing analyses of the sequence/open reading frames/genes on a genome scale. <br><br>Please read <a href="http://www.ncbi.nlm.nih.gov/pubmed/19741685">this paper for policies on pre-publication data sharing</a>. <br><br>For additional information on the <i>Crithidia</i> assembly, please visit the <a href="getDataset.do?display=detail&datasets=Crithidia_fasciculata_9.1&title=Query#Crithidia_fasciculata_9.1">data source</a>.
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'Sylvio X10') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
<i>Trypanosoma cruzi TcI strain Sylvio X10/1</i> shotgun sequence and assembly. <a href="http://www.ncbi.nlm.nih.gov/pubmed/21408126">Franzen et. al</a>.
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'JR cl. 4') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
Sequence from <i>Trypanosoma cruzi JR cl. 4</i> was generated by the Washington University Genome Center and has been provided <a href="http://genome.wustl.edu/data/data_use_policy">prepublication</a>. Permission should be obtained from Gregory Buck before publishing analyses of the sequence/open reading frames/genes on a genome scale. <br><br>Please read <a href="http://www.ncbi.nlm.nih.gov/pubmed/19741685">this paper for policies on pre-publication data sharing</a>. <br><br>For additional information on the <i>Trypanosoma cruzi JR cl. 4</i> assembly, please visit the <a href="getDataset.do?display=detail&datasets=TcruziJRcl4_contigs_RSRC&title=Query#TcruziJRcl4_contigs_RSRC">data source</a>.
  </c:set>
</c:when>
<c:when test="${!fn:contains(organism,'cruzi') && !fn:contains(organism,'tarentolae') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
Sequence data from GeneDB for <i>${organism}</i> chromosomes in EMBL format were generated at the Wellcome Trust Sanger Institute, TIGR/NRMC, and Stanford University. 
  </c:set>
</c:when>
<c:when test="${fn:contains(organism,'vivax') && projectId eq 'TriTrypDB'}">
  <c:set var="reference">
   Chromosome sequences for <i>T.vivax</i> obtained from the Pathogen Sequencing Unit at the Wellcome Trust Sanger Institute.
  </c:set>
</c:when>
<c:when test='${organism eq "Entamoeba histolytica HM-1:IMSS"}'>
  <c:set var="reference">
 Whole genome shotgun sequence and annotations for <i>E. histolytica</i> obtained from Lis Caler at the J. Craig Venter Institute (<a href="http://pathema.jcvi.org/cgi-bin/Entamoeba/PathemaHomePage.cgi"Target="_blank">JCVI</a>).
  </c:set>
</c:when>
<c:when test='${organism eq "Entamoeba histolytica DS4"}'>
  <c:set var="reference">
 Whole genome shotgun sequence and annotations for <i>Entamoeba histolytica DS4</i> obtained from Lis Caler at the J. Craig Venter Institute (<a href="http://pathema.jcvi.org/cgi-bin/Entamoeba/PathemaHomePage.cgi"Target="_blank">JCVI</a>).
<br>Users should acknowledge the J. Craig Venter Institute and the National Institute of Allergy and Infectious Diseases, National Institutes of Health, Department of Health and Human Services in any publications that result from use of this draft sequence assembly. Any investigaors who propose to publish analyses of the sequence/open reading frames/genes on a genome scale should contact the J. Craig Venter Institute for the use of pre-publication data. 
  </c:set>
</c:when>
<c:when test='${organism eq "Entamoeba histolytica MS96"}'>
  <c:set var="reference">
 Whole genome shotgun sequence and annotations for <i>Entamoeba histolytica MS96</i> obtained from Lis Caler at the J. Craig Venter Institute (<a href="http://pathema.jcvi.org/cgi-bin/Entamoeba/PathemaHomePage.cgi"Target="_blank">JCVI</a>).
<br>Users should acknowledge the J. Craig Venter Institute and the National Institute of Allergy and Infectious Diseases, National Institutes of Health, Department of Health and Human Services in any publications that result from use of this draft sequence assembly. Any investigaors who propose to publish analyses of the sequence/open reading frames/genes on a genome scale should contact the J. Craig Venter Institute for the use of pre-publication data. 
  </c:set>
</c:when>
<c:when test='${organism eq "Entamoeba histolytica KU48"}'>
  <c:set var="reference">
 Whole genome shotgun sequence and annotations for <i>Entamoeba histolytica KU48</i> obtained from Lis Caler at the J. Craig Venter Institute (<a href="http://pathema.jcvi.org/cgi-bin/Entamoeba/PathemaHomePage.cgi"Target="_blank">JCVI</a>).
<br>Users should acknowledge the J. Craig Venter Institute and the National Institute of Allergy and Infectious Diseases, National Institutes of Health, Department of Health and Human Services in any publications that result from use of this draft sequence assembly. Any investigaors who propose to publish analyses of the sequence/open reading frames/genes on a genome scale should contact the J. Craig Venter Institute for the use of pre-publication data. 
  </c:set>
</c:when>
<c:when test='${organism eq "Entamoeba histolytica KU50"}'>
  <c:set var="reference">
 Whole genome shotgun sequence and annotations for <i>Entamoeba histolytica KU50</i> obtained from Lis Caler at the J. Craig Venter Institute (<a href="http://pathema.jcvi.org/cgi-bin/Entamoeba/PathemaHomePage.cgi"Target="_blank">JCVI</a>).
<br>Users should acknowledge the J. Craig Venter Institute and the National Institute of Allergy and Infectious Diseases, National Institutes of Health, Department of Health and Human Services in any publications that result from use of this draft sequence assembly. Any investigaors who propose to publish analyses of the sequence/open reading frames/genes on a genome scale should contact the J. Craig Venter Institute for the use of pre-publication data. 
  </c:set>
</c:when>
<c:when test='${organism eq "Entamoeba histolytica KU27"}'>
  <c:set var="reference">
 Whole genome shotgun sequence and annotations for <i>Entamoeba histolytica</i> KU27 obtained from Lis Caler at the J. Craig Venter Institute (<a href="http://pathema.jcvi.org/cgi-bin/Entamoeba/PathemaHomePage.cgi"Target="_blank">JCVI</a>).
<br>Users should acknowledge the J. Craig Venter Institute and the National Institute of Allergy and Infectious Diseases, National Institutes of Health, Department of Health and Human Services in any publications that result from use of this draft sequence assembly. Any investigaors who propose to publish analyses of the sequence/open reading frames/genes on a genome scale should contact the J. Craig Venter Institute for the use of pre-publication data. 
  </c:set>
</c:when>
<c:when test='${organism eq "Entamoeba histolytica HM-1:CA"}'>
  <c:set var="reference">
 Whole genome shotgun sequence and annotations for <i>Entamoeba histolytica HM-1:CA</i> obtained from Lis Caler at the J. Craig Venter Institute (<a href="http://pathema.jcvi.org/cgi-bin/Entamoeba/PathemaHomePage.cgi"Target="_blank">JCVI</a>).
<br>Users should acknowledge the J. Craig Venter Institute and the National Institute of Allergy and Infectious Diseases, National Institutes of Health, Department of Health and Human Services in any publications that result from use of this draft sequence assembly. Any investigaors who propose to publish analyses of the sequence/open reading frames/genes on a genome scale should contact the J. Craig Venter Institute for the use of pre-publication data. 
  </c:set>
</c:when>

<c:otherwise>
    <c:set var="reference">
  <b>ERROR: can't find attribution information for organism "${organism}",
     sequence "${id}"</b>
    </c:set>
</c:otherwise>

</c:choose>



<imp:panel 
    displayName="Genome Sequencing and Annotation by:"
    content="${reference}" />
<br>

<%------------------------------------------------------------------%>
</c:otherwise>
</c:choose> <%-- if wdkRecord.attributes['organism'].value --%>

<script type='text/javascript' src='/gbrowse/apiGBrowsePopups.js'></script>
<script type='text/javascript' src='/gbrowse/wz_tooltip.js'></script>

</imp:pageFrame>
