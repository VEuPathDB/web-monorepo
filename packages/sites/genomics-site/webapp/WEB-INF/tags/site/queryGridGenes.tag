<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="modelName" value="${wdkModel.displayName}"/>

<%-- qname is question name
     linktext should be read from the model (e.g., question displayName)
     this probably should be a loop reading from the model all questions under a specific category
--%>

<table width="100%" border="0" cellspacing="2" cellpadding="2">

    <tr>
        <td width="33%" valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="queryGridTitle"><td colspan="3">Genomic Position</td>
                
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByLocation" linktext="Chromosomal Location" existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByCentromereProximity" linktext="Proximity to Centromeres" existsOn="A E E P E E"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByTelomereProximity" linktext="Proximity to Telomeres" existsOn="A E E P E E"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByNonnuclearLocation" linktext="Non-nuclear Genomes" existsOn="A E E P T E"/>
                </tr>
            </table>
        </td>

        <td width="34%" valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="queryGridTitle"><td colspan="3">Gene Attributes</td>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByGeneType" linktext="Type (e.g. rRNA, tRNA)"  existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByExonCount" linktext="Exon/Intron Structure" existsOn="A C G P T Tr"/>
                </tr>
            </table>
        </td>

       <td  width="33%" valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="queryGridTitle"><td colspan="3">Other Attributes
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByTextSearch" linktext="Keyword"  existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GeneByLocusTag" linktext="List of IDs"  existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByTaxon" linktext="Species" existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByMr4Reagents" linktext="Available Reagents" existsOn="A P"/>
                </tr>

              
            </table>
        </td>

    </tr>

    <tr>
        <td valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="queryGridTitle"><td colspan="3">Transcript Expression
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesByESTOverlap" linktext="EST Evidence" existsOn="A C G P T Tr"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesBySageTag" linktext="SAGE Tag Evidence" existsOn="G P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="InternalQuestions" qname="GenesByMicroarrayEvidence" linktext="Microarray Evidence" existsOn="A P T"/>
                </tr>
            </table>
        </td>

        

        <td valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="queryGridTitle"><td colspan="3">Protein Expression

                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="InternalQuestions" qname="GenesByMassSpecEvidence" linktext="Mass Spec. Evidence" existsOn="A C P T G"/>
                </tr>
            </table>
        </td>

<td valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="queryGridTitle"><td colspan="3">Similarity/Pattern

                </tr>
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
        </td>
    </tr>


    <tr>
        <td valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="queryGridTitle"><td colspan="3">Predicted Proteins

                </tr>
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
                <tr>
            </table>
        </td>

        <td valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="queryGridTitle"><td colspan="3">Putative Function
                </tr>
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
            </table>
        </td>

        <td valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="queryGridTitle"><td colspan="3">Cellular Location
                </tr>
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
            </table>
        </td>
    </tr>


    <tr>
        <td valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="queryGridTitle"><td colspan="3">Evolution
                </tr>
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
        </td>

 <td width="33%"  valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr class="queryGridTitle"><td colspan="3">Population Biology
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="GenesBySnps" linktext="SNPs" existsOn="A C P T"/>
                </tr>
                <tr>
                    <site:queryGridMakeUrl qset="GeneQuestions" qname="NA" linktext="Microsatellites" existsOn=""/>
                </tr>
            </table>
        </td>

 
    </tr>

</table>
