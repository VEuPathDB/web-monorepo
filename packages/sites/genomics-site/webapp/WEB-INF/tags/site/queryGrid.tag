<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<table width="426" border="0" cellspacing="2" cellpadding="2" style="border-style:outset; border-color:black;border-width:1px;">
    <tr>
        <td colspan="2"><h7><i>Identify Genes Based On:</i></h7></td>
        <td></td>
    </tr>
    <tr>
        <td valign="top">
            <table width="170" border="0" cellspacing="2" cellpadding="0">
                <tr class="rowDarkBold">
                    <site:makeTitle qcat="Genomic Position" qtype="Gene"/>  
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByLocation" linktext="chromosomal location" />
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByCentromereProximity" linktext="proximity to centromeres" />
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="NA" linktext="proximity to telomeres" />
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="NA" linktext="non-nuclear genomes" />
                </tr>
            </table>
        </td>
        <td valign="top">
            <table width="170" border="0" cellspacing="2" cellpadding="0">
                <tr class="rowDarkBold">
                    <site:makeTitle qcat="Gene Attributes" qtype="Gene"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByGeneType" linktext="type (e.g. rRNA, tRNA)" />
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByExonCount" linktext="exon/intron stucture" />
                </tr>
            </table>
        </td>
        <td valign="top">
            <table width="170" border="0" cellspacing="2" cellpadding="0">
                <tr class="rowDarkBold">
                    <site:makeTitle qcat="Predicted Proteins" qtype="Gene"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByMolecularWeight" linktext="molecular weight" />
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByIsoelectricPoint" linktext="isoelectric point" />
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesBySecondaryStructure" linktext="secondary structure" />
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByPdbSimilarity" linktext="crystal structure"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesWithStructurePrediction" linktext="predicted 3D structure"/>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td valign="top">
            <table width="170" border="0" cellspacing="2" cellpadding="0">
                <tr class="rowDarkBold">
                    <site:makeTitle qcat="Putative Function" qtype="Gene"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByGoTerm" linktext="GO term"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByEcNumber" linktext="EC number" />
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByMetabolicPathway" linktext="metabolic pathway" />
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByProteinProteinInteraction" linktext="Y2H interaction"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByFunctionalInteraction" linktext="predicted interaction"/>
                </tr>
            </table>
        </td>
        <td valign="top">
            <table width="170" border="0" cellspacing="2" cellpadding="0">
                <tr class="rowDarkBold">
                    <site:makeTitle qcat="Similarity/Pattern" qtype="Gene"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByMotifSearch" linktext="protein motif"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByPfamDomain" linktext="Pfam domain" />
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesBySimilarity" linktext="BLAST against genes" />
                </tr>
            </table>
        </td>
        <td valign="top">
            <table width="170" border="0" cellspacing="2" cellpadding="0">
                <tr class="rowDarkBold">
                    <site:makeTitle qcat="Transcript Expression" qtype="Gene"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByESTClusterOverlap" linktext="EST evidence"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="NA" linktext="SAGE tag evidence"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="NA" linktext="microarray evidence"/>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td valign="top">
            <table width="170" border="0" cellspacing="2" cellpadding="0">
                <tr class="rowDarkBold">
                    <site:makeTitle qcat="Protein Expression" qtype="Gene"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByMassSpec" linktext="mass spec. expression"/>
                </tr>
            </table>
        </td>
        <td valign="top">
            <table width="170" border="0" cellspacing="2" cellpadding="0">
                <tr class="rowDarkBold">
                    <site:makeTitle qcat="Cellular Location" qtype="Gene"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesWithSignalPeptide" linktext="signal peptide"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByTransmembraneDomains" linktext="transmembrane domain"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesBySubcellularLocalization" linktext="organellar compartment"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByExportPrediction" linktext="exported to host"/>
                </tr>
            </table>
        </td>
        <td valign="top">
            <table width="170" border="0" cellspacing="2" cellpadding="0">
                <tr class="rowDarkBold">
                    <site:makeTitle qcat="Evolution" qtype="Gene"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesOrthologousToAGivenGene" linktext="find orthologs/paralogs"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByOrthologPattern" linktext="orthology profile"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByPhyleticProfile" linktext="homology profile"/>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td valign="top">
            <table width="170" border="0" cellspacing="2" cellpadding="0">
                <tr class="rowDarkBold">
                    <site:makeTitle qcat="Population Biology" qtype="Gene"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="NA" linktext="SNPs"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="NA" linktext="microsatellites"/>
                </tr>
            </table>
        </td>
        <td colspan="2">
            <table width="350" border="0" cellspacing="2" cellpadding="0">
                <tr class="rowDarkBold">
                    <site:makeTitle qcat="Other Attributes" qtype="Gene"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByAnnotatedKeyword" linktext="text term"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="NA" linktext="text in product descriptions, notes..."/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GeneByLocusTag" linktext="identifier (e.g. ApiDB ID, GenBank ID, SwissProt ID, etc.)"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByTaxon" linktext="species"/>
                </tr>
                <tr>
                    <site:makeURL qset="GeneQuestions" qname="GenesByMr4Reagents" linktext="reagents available (e.g. antibodies from MR4)"/>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td colspan="2">
            <table width="360" border="0" cellspacing="2" cellpadding="0">
                <tr>
                    <td colspan="4"><h7><i>Identify Genomic Sequences Based On:</i></h7></td>
                </tr>
                <tr class="rowDarkBold">
                        <td  colspan="2" width="100%">Other Attributes</td>
                </tr>
                <tr>
                    <site:makeURL qset="SequenceQuestions" qname="SequenceBySourceId" linktext="identifier (e.g. ApiDB ID, GenBank ID, etc)"/>
                </tr>
                <tr>
                    <site:makeURL qset="SequenceQuestions" qname="SequencesByTaxon" linktext="species"/>
                </tr>
                <tr>
                    <site:makeURL qset="SequenceQuestions" qname="SequencesBySimilarity" linktext="BLAST against contigs"/>
                </tr>
                <tr>
                    <site:makeURL qset="SequenceQuestions" qname="NA" linktext="DNA sequence motif"/>
                </tr>
            </table>
        </td>
    </tr>
 <tr>
        <td colspan="2">
            <table width="360" border="0" cellspacing="2" cellpadding="0">
                <tr>
                    <td colspan="4"><h7><i>Identify EST Sequences Based On:</i></h7></td>
                </tr>
                <tr class="rowDarkBold">
                        <td  colspan="2" width="100%">Other Attributes</td>
                </tr>
                <tr>
                    <site:makeURL qset="ESTQuestions" qname="SequenceBySourceId" linktext="identifier (e.g. ApiDB ID, GenBank ID, etc)"/>
                </tr>
                <tr>
                    <site:makeURL qset="ESTQuestions" qname="SequencesByTaxon" linktext="species"/>
                </tr>
                <tr>
                    <site:makeURL qset="ESTQuestions" qname="SequencesBySimilarity" linktext="BLAST against contigs"/>
                </tr>
                <tr>
                    <site:makeURL qset="ESTQuestions" qname="NA" linktext="DNA sequence motif"/>
                </tr>
            </table>
        </td>
    </tr>
 <tr>
        <td colspan="2">
            <table width="360" border="0" cellspacing="2" cellpadding="0">
                <tr>
                    <td colspan="4"><h7><i>Identify ORF Sequences Based On:</i></h7></td>
                </tr>
                <tr class="rowDarkBold">
                        <td  colspan="2" width="100%">Other Attributes</td>
                </tr>
                <tr>
                    <site:makeURL qset="ORFQuestions" qname="SequenceBySourceId" linktext="identifier (e.g. ApiDB ID, GenBank ID, etc)"/>
                </tr>
                <tr>
                    <site:makeURL qset="ORFQuestions" qname="SequencesByTaxon" linktext="species"/>
                </tr>
                <tr>
                    <site:makeURL qset="ORFQuestions" qname="SequencesBySimilarity" linktext="BLAST against contigs"/>
                </tr>
                <tr>
                    <site:makeURL qset="ORFQuestions" qname="NA" linktext="DNA sequence motif"/>
                </tr>
            </table>
        </td>
    </tr>
</table>
