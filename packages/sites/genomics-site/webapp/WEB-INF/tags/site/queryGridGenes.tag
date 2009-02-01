<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- title and linktext should be read from categories.xml (category, question displayName),
     which should indicate also the presence of the query in each project --%>

<table width="100%" border="0" cellspacing="20" cellpadding="20">

    <tr>
        <td width="33%" valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="subheaderrow2"><td colspan="4">Genomic Position</td>
                
                </td></tr>
                <tr><td>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByLocation" linktext="Chromosomal Location" existsOn="A C G P T Tr"/>
                </td></tr>
                <tr><td>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByCentromereProximity" linktext="Proximity to Centromeres" existsOn="A E E P E E"/>
                </td></tr>
                <tr><td>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByTelomereProximity" linktext="Proximity to Telomeres" existsOn="A E E P E E"/>
                </td></tr>
                <tr><td>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByNonnuclearLocation" linktext="Non-nuclear Genomes" existsOn="A E E P T E"/>
                </td></tr>
            </table>
</div>
        </td>




<span style="vertical-align: top">
        <td width="34%" valign="top">
<div class="innertube2">

            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="subheaderrow2"><td colspan="4">Gene Attributes</td>
                </td></tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByGeneType" linktext="Type (e.g. rRNA, tRNA)"  existsOn="A C G P T Tr"/>

                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByExonCount" linktext="Exon/Intron Structure" existsOn="A C G P T Tr"/>
                </tr>

                <tr><td class="lines2">&nbsp;</td></tr>
                <tr><td class="lines2">&nbsp;</td></tr>

            </table>

</div>
        </td>
</span>




       <td  width="33%" valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="subheaderrow2"><td colspan="4">Other Attributes
                </td></tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByTextSearch" linktext="Text"  existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GeneByLocusTag" linktext="Gene ID(s)"  existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByTaxon" linktext="Species" existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByMr4Reagents" linktext="Available Reagents" existsOn="A P"/>
                </tr>

              
            </table>
</div>
        </td>

    </tr>




    <tr>
        <td valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="subheaderrow2"><td colspan="4">Transcript Expression
                </td></tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByESTOverlap" linktext="EST Evidence" existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="InternalQuestions" qname="GenesBySageTagEvidence" linktext="SAGE Tag Evidence" existsOn="G P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="InternalQuestions" qname="GenesByMicroarrayEvidence" linktext="Microarray Evidence" existsOn="A P T"/>
                </tr>
            </table>
</div>
        </td>

        

        <td valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="subheaderrow2"><td colspan="4">Protein Expression

                </td></tr>
                <tr><td>
                    <site:queryGridMakeUrl qset="InternalQuestions" qname="GenesByMassSpecEvidence" linktext="Mass Spec. Evidence" existsOn="A C P T G"/>
                </td></tr>
 <tr><td class="lines2">&nbsp;</td></tr>
 <tr><td class="lines2">&nbsp;</td></tr>

            </table>
</div>
        </td>

<td valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="subheaderrow2"><td colspan="4">Similarity/Pattern

                </td></tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByMotifSearch" linktext="Protein Motif" existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByInterproDomain" linktext="Interpro/Pfam Domain" existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="UniversalQuestions" qname="UnifiedBlast" linktext="BLAST similarity" type="GENE" existsOn="A C G P T Tr"/>
                </tr>
            </table>
</div>
        </td>
    </tr>




    <tr>
        <td valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="subheaderrow2"><td colspan="4">Protein Features & Attributes

                </td></tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByMolecularWeight" linktext="Molecular Weight" existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByIsoelectricPoint" linktext="Isoelectric Point" existsOn="A G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="InternalQuestions" qname="GenesByProteinStructure" linktext="Protein Structure" existsOn="A G P Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesWithEpitopes" linktext="Epitopes" existsOn="A C G P T"/>
                </tr>

 <tr><td class="lines2">&nbsp;</td></tr>

            </table>
</div>
        </td>

        <td valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="subheaderrow2"><td colspan="4">Putative Function
                </td></tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByGoTerm" linktext="GO Term" existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByEcNumber" linktext="EC Number" existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByMetabolicPathway" linktext="Metabolic Pathway" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByProteinProteinInteraction" linktext="Y2H Interaction" existsOn="A P"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByFunctionalInteraction" linktext="Predicted Interaction" existsOn="A P"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByPhenotype" linktext="Phenotype" existsOn="A T"/>
                </tr>
            </table>
</div>
        </td>

        <td valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="subheaderrow2"><td colspan="4">Cellular Location
                </td></tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesWithSignalPeptide" linktext="Signal Peptide"  existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByTransmembraneDomains" linktext="Transmembrane Domain" existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesBySubcellularLocalization" linktext="Organellar Compartment" existsOn="A P"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByExportPrediction" linktext="Exported to Host" existsOn="A P"/>
                </tr>
 <tr><td class="lines2">&nbsp;</td></tr>

            </table>
</div>
        </td>
    </tr>




    <tr>
        <td valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="subheaderrow2"><td colspan="4">Evolution
                </td></tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesOrthologousToAGivenGene" linktext="Orthologs/Paralogs" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByOrthologPattern" linktext="Orthology Profile" existsOn="A C G P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByPhyleticProfile" linktext="Homology Profile" existsOn="A P"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByPhylogeneticTree" linktext="Phylogenetic Tree" existsOn="G"/>
                </tr>
            </table>
</div>
        </td>

 <td width="33%"  valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="subheaderrow2"><td colspan="4">Population Biology
                </td></tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesBySnps" linktext="SNPs" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="NA" linktext="Microsatellites" existsOn=""/>
                </tr>

 <tr><td class="lines2">&nbsp;</td></tr>
 <tr><td class="lines2">&nbsp;</td></tr>

            </table>
</div>
        </td>

 
    </tr>

</table>
