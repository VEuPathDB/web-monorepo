<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="modelName" value="${wdkModel.displayName}"/>
<table><tr><td align="left">
This query grid summarizes all queries. The symbols <img src=/images/apidb_letter.jpg border=0 />, <img src=/images/cryptodb_letter.jpg border=0 />, <img src=/images/plasmodb_letter.jpg border=0 />, <img src=/images/toxodb_letter.jpg border=0 /> will take you to the query page in the corresponding website. Names greyed out are not currently available on this site.
</td></tr></table>

<table width="100%" border="0" cellspacing="2" cellpadding="2" style="border-style:outset; border-color:black;border-width:1px;">

<tr><td width="34%"></td><td width="33%"></td><td width="33%"></td></tr>

<tr><td colspan="3">  
   
<div class="smallBlack" align="right">
Availability: 
<img src=/images/apidb_letter.jpg border=0 />= ApiDB 
<img src=/images/cryptodb_letter.jpg border=0 />= CryptoDB 
<img src=/images/plasmodb_letter.jpg border=0 />= PlasmoDB 
<img src=/images/toxodb_letter.jpg border=0 />= ToxoDB 
</div>
</td>
</tr>
    <tr>
        <td colspan="2"><h7><b><i>Identify Genes Based On:</i></b></h7></td>
        <td></td>
    </tr>
    <tr>
        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr class="queryGridTitle">
                    <site:queryGridMakeTitle qcat="Genomic Position" qtype="Gene"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByLocation" linktext="Chromosomal Location" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByCentromereProximity" linktext="Proximity to Centromeres" existsOn="P"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByTelomereProximity" linktext="Proximity to Telomeres" existsOn="P"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="NA" linktext="Non-nuclear Genomes" existsOn=""/>
                </tr>
            </table>
        </td>

        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr class="queryGridTitle">
                    <site:queryGridMakeTitle qcat="Gene Attributes" qtype="Gene"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByGeneType" linktext="Type (e.g. rRNA, tRNA)"  existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByExonCount" linktext="Exon/Intron Structure" existsOn="A C P T"/>
                </tr>
            </table>
        </td>

        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr class="queryGridTitle">
                    <site:queryGridMakeTitle qcat="Population Biology" qtype="Gene"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesBySnps" linktext="SNPs" existsOn="P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="NA" linktext="Microsatellites" existsOn=""/>
                </tr>
            </table>
        </td>
    </tr>

    <tr>
        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr class="queryGridTitle">
                    <site:queryGridMakeTitle qcat="Transcript Expression" qtype="Gene"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByESTOverlap" linktext="EST Evidence" existsOn="C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="NA" linktext="SAGE Tag Evidence" existsOn=""/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="InternalQuestions" qname="GenesByMicroarrayEvidence" linktext="Microarray Evidence" existsOn="P"/>
                </tr>
            </table>
        </td>

        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr class="queryGridTitle">
                    <site:queryGridMakeTitle qcat="Similarity/Pattern" qtype="Gene"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByMotifSearch" linktext="Protein Motif" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByInterproDomain" linktext="Interpro/Pfam Domain" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesBySimilarity" linktext="BLAST similarity" existsOn="A C P T"/>
                </tr>
            </table>
        </td>

        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr class="queryGridTitle">
                    <site:queryGridMakeTitle qcat="Protein Expression" qtype="Gene"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="InternalQuestions" qname="GenesByMassSpecEvidence" linktext="Mass Spec. Evidence" existsOn="P"/>
                </tr>
            </table>
        </td>
    </tr>


    <tr>
        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr class="queryGridTitle">
                    <site:queryGridMakeTitle qcat="Predicted Proteins" qtype="Gene"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByMolecularWeight" linktext="Molecular Weight" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByIsoelectricPoint" linktext="Isoelectric Point" existsOn="P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesBySecondaryStructure" linktext="Secondary Structure" existsOn="P"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByPdbSimilarity" linktext="Crystal Structure" existsOn="P"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesWithStructurePrediction" linktext="Predicted 3D Structure" existsOn="P"/>
                </tr>
            </table>
        </td>

        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr class="queryGridTitle">
                    <site:queryGridMakeTitle qcat="Putative Function" qtype="Gene"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByGoTerm" linktext="GO Term" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByEcNumber" linktext="EC Number" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByMetabolicPathway" linktext="Metabolic Pathway" existsOn="P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByProteinProteinInteraction" linktext="Y2H Interaction" existsOn="P"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByFunctionalInteraction" linktext="Predicted Interaction" existsOn="P"/>
                </tr>
            </table>
        </td>

        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr class="queryGridTitle">
                    <site:queryGridMakeTitle qcat="Cellular Location" qtype="Gene"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesWithSignalPeptide" linktext="Signal Peptide"  existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByTransmembraneDomains" linktext="Transmembrane Domain" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesBySubcellularLocalization" linktext="Organellar Compartment" existsOn="P"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByExportPrediction" linktext="Exported to Host" existsOn="P"/>
                </tr>
            </table>
        </td>
    </tr>


    <tr>
        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr class="queryGridTitle">
                    <site:queryGridMakeTitle qcat="Evolution" qtype="Gene"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesOrthologousToAGivenGene" linktext="Orthologs/Paralogs" existsOn="A P"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByOrthologPattern" linktext="Orthology Profile" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByPhyleticProfile" linktext="Homology Profile" existsOn="P"/>
                </tr>
            </table>
        </td>

        <td colspan="2" valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr class="queryGridTitle">
                    <site:queryGridMakeTitle qcat="Other Attributes" qtype="Gene"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByTextSearch" linktext="Text (search product name, notes, etc.)"  existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GeneByLocusTag" linktext="ID (Gene ID, GenBank ID, SwissProt ID, etc.)"  existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByTaxon" linktext="Species" existsOn="A C P"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByMr4Reagents" linktext="Reagents Available (e.g. antibodies from MR4)" existsOn="P"/>
                </tr>

              
            </table>
        </td>
    </tr>

<tr><br></td></tr>

    <tr>
        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr>
                    <td colspan="4"><h7><i><b>Identify Genomic Seqs Based On:</b></i></h7></td>
                </tr>
                <tr class="queryGridTitle">
                        <site:queryGridMakeTitle qcat="Similarity/Pattern" qtype="Genomic"/>

                </tr>
               
                <tr>
                    <site:queryGridMakeUrl qset="GenomicSequenceQuestions" qname="SequencesBySimilarity" linktext="BLAST Similarity" existsOn="A C P T"  />
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GenomicSequenceQuestions" qname="NA" linktext="DNA Sequence Motif" existsOn=""/>
                </tr>
               <tr class="queryGridTitle">
                         <site:queryGridMakeTitle qcat="Other Attributes" qtype="Genomic"/>
                        
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GenomicSequenceQuestions" qname="SequenceBySourceId" linktext="ID (Seq ID, GenBank ID, etc)"  existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GenomicSequenceQuestions" qname="SequencesByTaxon" linktext="Species" existsOn="A P"/>
                </tr>
            </table>
        </td>

        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr>
                    <td colspan="4"><h7><b><i>Identify ESTs Based On:</i></b></h7></td>
                </tr>
                <tr class="queryGridTitle">
                     <site:queryGridMakeTitle qcat="Similarity/Pattern" qtype="EST" />
                </tr>
                
                <tr>
                    <site:queryGridMakeUrl qset="EstQuestions" qname="EstsBySimilarity" linktext="BLAST Similarity" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="EstQuestions" qname="NA" linktext="EST Sequence Motif" existsOn=""/>
                </tr>
                <tr class="queryGridTitle">
                       <site:queryGridMakeTitle qcat="Other Attributes" qtype="EST"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="EstQuestions" qname="EstsByTaxon" linktext="Species" existsOn=""/>
                </tr>
            </table>
        </td>
 
 
        <td valign="top">
            <table width="100%" border="0" cellspacing="2" cellpadding="0">
                <tr>
                    <td colspan="4"><h7><b><i>Identify ORFs Based On:</i></b></h7></td>
                </tr>
                <tr class="queryGridTitle">
                     <site:queryGridMakeTitle qcat="Similarity/Pattern" qtype="ORF"/>
                </tr>
                
                <tr>
                    <site:queryGridMakeUrl qset="OrfQuestions" qname="OrfsBySimilarity" linktext="BLAST Similarity" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="OrfQuestions" qname="OrfsByMotifSearch" linktext="ORF Sequence Motif" existsOn="A C"/>
                </tr>
                <tr class="queryGridTitle">
                         <site:queryGridMakeTitle qcat="Other Attributes" qtype="ORF"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="OrfQuestions" qname="OrfsByTaxon" linktext="Species" existsOn=""/>
                </tr>
            </table>
        </td>
    </tr>
<tr><td><br></td></tr>

</table>
