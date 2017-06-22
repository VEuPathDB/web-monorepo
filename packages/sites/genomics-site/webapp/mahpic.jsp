<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="project" value="${applicationScope.wdkModel.name}" />
<c:set var="baseUrl" value="${pageContext.request.contextPath}"/>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<imp:pageFrame title="${wdkModel.displayName} :: MaHPIC">

  <%--
  The following style and script tags are used for the "Read More" functionality.
  The expected structure is:

    .item
      .read_more
      .more_text

  --%>

  <style>
    .item .more_text {
      display: none;
    }
    .wdk-toggle-name {
       padding: 4px;
       margin: 0; 
     }
     h3 {
       padding: 4px;
     }
  </style>

  <script>
    jQuery(function($) {
      $('.item').on('click', '.read_more', function(event) {
        event.preventDefault();
        $(event.delegateTarget).find('.more_text').toggle(0, function() {
          $(event.target).text($(this).is(':visible') ? 'Read Less...' : 'Read More...');
        });
      });
    });
  </script>
  
<div style="margin-left: 3em;">
<div style="right-left: 3em;">

  <center> <img align="middle" src="images/MaHPIC_TopCenter_5.png" height="120px" width="550px"></center>
  <h1>Access Data from MaHPIC -<br>The Malaria Host-Pathogen Interaction Center</h1> 
  


<div class="item">

  <h3>An Introduction to MaHPIC</h3>

  <div style="margin-left: 1em;">
    <a href="http://www.systemsbiology.emory.edu/index.html" target="_blank">MaHPIC</a> is funded by the 
    <a href="https://www.niaid.nih.gov/research/malaria-host-pathogen-interaction-center-mahpic" target="_blank">NIAID</a>
     (# HHSN272201200031C, September 2012 to September 2017) to characterize host-pathogen interactions during malaria infections of non-human primates (NHP)
    and clinical studies via collaborations with investigators in malaria endemic countries. 
    <a href="http://www.systemsbiology.emory.edu/research/cores/index.html" target="_blank">MaHPIC's 8 teams</a> of 
    <a href="http://www.systemsbiology.emory.edu/people/investigators/index.html" target="_blank">transdisciplinary scientists</a> 
    use a "systems biology" approach to study the molecular details of how malaria parasites 
	interact with their human and NHP hosts to cause disease. <br>
	<a href="#" class="read_more">Read More...</a><br><br>

      <span class="more_text">
      MaHPIC data and metadata from NHP experiments and clinical collaborations involving human subjects from malaria 
      endemic countries include a wide range of data types and are carefully validated before release to the public. 
      In total, MaHPIC results data sets will be 
      composed of thousands of files and several data types. Results datasets will offer unprecedented 
      detail on disease progression, recrudescence, relapse, and host susceptibility and will be instrumental in 
      the development of new diagnostics, drugs, and vaccines to reduce the global suffering caused by this disease.<br><br>
      
      The MaHPIC team uses a "systems biology" strategy to study how malaria parasites 
	  interact with their human and NHP hosts to cause disease in molecular detail. The central hypothesis is that 
	  "Non-Human Primate host interactions with <i>Plasmodium</i> pathogens as model systems will provide insights into mechanisms, 
	  as well as indicators for, human malarial disease conditions".
	  <p>
	  The MaHPIC effort includes many teams working together to produce and analyze data and metadata.  These teams are briefly described below 
	  but more detailed information can be found at 
	  <a href="http://www.systemsbiology.emory.edu/research/cores/index.html" target="_blank"> Emory's MaHPIC site</a>. <br><br>
      


     <div style="margin-left: 2.5em;">
	   <style>
           #MahpicSideBy table, #MahpicSideBy td, #MahpicSideBy th, #MahpicSideBy tr {
           
           padding-left: 10px;
           padding-right: 10px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #MahpicSideBy {
           margin-left : 5 em;
           }
           
           #MahpicSideBy td {vertical-align: middle;}
           #MahpicSideBy td:first-child { text-align: center;}
         </style> 
         <table id="MahpicSideBy"> 	
	      <tr> 
	       <td><img align="middle" src="images/MaHPICtoPlasmo_Interface_2.png" height="260px" width="520px"></td>
	       <td><style>
           #MahpicGroups table, #MahpicGroups td, #MahpicGroups th, #MahpicGroups tr {
           
           padding-left: 10px;
           padding-right: 10px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #MahpicGroups {
           margin-left : 5 em;
           }
           
           #MahpicGroups td:first-child { text-align: center;}
         </style> 
         <table id="MahpicGroups"> 
           <tr>
             <th>MaHPIC Team</th>
             <th>Description</th>
           </tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"></td>
             <td> Clinical Malaria - designs and implements experimental plans involving infection of non-human primates</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"></td>
             <td>Functional Genomics - develops gene expression profiles from blood and bone marrow</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"></td>
             <td>Proteomics - develops detailed proteomics profiles from blood and bone marrow</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"></td>
             <td>Lipidomics - investigates lipids and biochemical responses associated with lipids from blood and bone marrow</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"></td>
             <td>Immune Profiling - profiles white blood cells in the peripheral blood and progenitors in the bone marrow</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"></td>
             <td>Metabolomics - provides detailed metabolomics data for plasma and associated cellular fractions</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Informatics_Core.jpg" height="13px" width="13px"></td>
             <td>Bioinformatics - standardizes, warehouses, maps and integrates the data generated by the experimental cores</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"></td>
             <td>Computational Modeling - integrates the data sets generated by the experimental cores into static and dynamic models</td>
           </tr>
           </table>
	           </td>
	          </tr>
	          </table>
	

     </span>
   </div>
</div>
</div>


   
<div class="item">  
   <h3>MaHPIC Experimental Design</h3>
   
   <div style="margin-left: 1em;">
     For the study of malaria in the context of the MaHPIC project, "systems biology" means collecting and analyzing comprehensive data on 
     how a <i>Plasmodium</i> parasite infection produces changes in host and parasite gene expression, proteins, lipids, metabolism and the host immune response.
     MaHPIC experiments include longitudinal studies of <i>Plasmodium</i> infections (or uninfected controls) in non-human primates, and clinical and metabolomics studies of human samples. <br>
     <a href="#" class="read_more">Read More...</a><p>
   
     <span class="more_text">
       <img align="middle" src="images/MaHPIC_Generic_Timeline_7NOV2016.png" height="260px" width="520px"><br>
       <a href="images/MaHPIC_Generic_Timeline_7NOV2016.png" target="_blank">View Larger Image</a><br><br>
       
       The MaHPIC strategy is to collect physical specimens from non-human primates (NHPs) over the course of an experiment.  The clinical parameters 
       of infected animals and uninfected controls are monitored daily for about 100 days. During the experiment, NHPs receive antimalarial treatments 
       to mimic relapse or recrudescence depending on the infecting species.  Animals receive a curative treatment 
       at the end of the experiment. At specific milestones during disease progression, blood and bone marrow samples are collected and 
       analyzed by the MaHPIC teams and a diverse set of data and metadata are produced.<br><br>

 
	 </span>
   </div>	
</div>


  <h3 id="DataLinks">Access MaHPIC Data Here</h3>
   <div style="margin-left: 1em;">
   All results are a product of the MaHPIC.  For more information on the MaHPIC, please visit <a href="http://www.systemsbiology.emory.edu/" target="_blank">http://www.systemsbiology.emory.edu/</a>. <br>
 	
  
  
<div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">MaHPIC Genomes</a></h3> 
   <div class="wdk-toggle-content">

	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinks table, #DataLinks td, #DataLinks th, #DataLinks tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinks {
           margin-left : 5 em;
           }
           
           #DataLinks td {vertical-align: middle;}
         </style> 
         <table id="DataLinks"> 
           <tr>
             <th>Organism</th>
             <th>Repository</th>
             <th>Integrated into PlasmoDB</th>
             <th>Publication</th>
           </tr>
           <tr>
             <td><b><i>Plasmodium coatneyi</i> strain Hackeri</b></td>
             <td><b><a href="https://www.ncbi.nlm.nih.gov/bioproject/315987"><b>GenBank</b></a></td>  
             <td><b><a href="http://plasmodb.org/plasmo/app/record/dataset/DS_597478d531">2 Feb 2017</b></a></td>
             <td><b><a href="https://www.ncbi.nlm.nih.gov/pubmed/27587810">PMID:27587810</a></b></td>
           </tr>
           <tr>
             <td><b><i>Plasmodium knowlesi</i> strain PK1(A+)</b></td>
             <td><b><a href="https://www.ncbi.nlm.nih.gov/bioproject/PRJNA377737">GenBank</b></a></td> 
             <td>Coming Soon</td>
             <td>Coming Soon</td>
           </tr>

           </table>
           </div>       
  </div>	
  </div>
 
 
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment HuA: Metabolomics of plasma samples from humans infected with <i>Plasmodium vivax</i> </a> </h3> 
   <div class="wdk-toggle-content">

	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksHuA table, #DataLinksHuA td, #DataLinksHuA th, #DataLinksHuA tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksHuA {
           margin-left : 5 em;
           }
           
           #DataLinksHuA td {vertical-align: middle;}
         </style> 
         <table id="DataLinksHuA"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><b>Coming Soon</b><!--<a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_03/">HuA Clinical Data in PlasmoDB Downloads</a>--></td>  
             <td>N/A</td>
           </tr>
          <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="http://www.metabolomicsworkbench.org//data/DRCCMetadata.php?Mode=Study&StudyID=ST000578&StudyType=MS&ResultType=5" target="_blank">HuA Metabolomics Results at Metabolomics Workbench</a></b></td>    
             <td>N/A</td>
           </tr>
           </tr>
           </table>
           </div>
<br><br>
	 <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoHuA table, #ExpInfoHuA td, #ExpInfoHuA th, #ExpInfoHuA tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoHuA {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoHuA"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Metabolomics of plasma samples from humans infected with <i>Plasmodium vivax</i></td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Patients with vivax malaria were enrolled in this study from June 2011 to December 2012 at the Fundacao de Medicina Tropical Doutor Heitor Vieira Dourado (FMT-HVD), an infectious disease referral center located in Manaus, Western Brazilian Amazon. This study, which required a 42-day follow-up period, was approved by the FMT-HVD Institutional Review Board and the Brazilian National Ethics Committee (CONEP) (IRB approval #: CAAE: 12516713.8.0000.0005). All protocols and documentation were reviewed and sample shipments approved by the Emory IRB. Male and female patients were eligible for inclusion if aged 6 months to 60 years, bodyweight &ge;5 kg, presenting a blood parasite density from 250 to 100,000 parasites/microliter and axillary temperature &ge;37.5 C or history of fever in the last 48 hours. Exclusion criteria were: use of antimalarials in the previous 30 days, refusal to be followed up for 42 days and any clinical complication. Patients received supervised treatment with 25 mg/kg of chloroquine (CQ) phosphate over a 3-day period (10 mg/kg on day 0 and 7.5 mg/kg on days 1 and 2). Primaquine (0.5 mg/kg per day for 7 days) was prescribed at the end of the 42-day follow-up period. Patients who vomited the first dose within 30 minutes after drug ingestion were re-treated with the same dose. Patients were evaluated on days 0, 1, 2, 3, 7, 14, 28 and 42 and, if they felt ill, at any time during the study period. Blood smear readings, complete blood counts, and diagnostic polymerase chain reaction (PCR) amplifications were performed at all time points. Three aliquots of 100 &mu;L of whole blood from the day of a recurrence were spotted onto filter paper for later analysis by high performance liquid chromatography (HPLC) to estimate the levels of CQ and desethylchloroquine (DCQ) as previously described. In this study, CQ-resistance with parasitological failure was defined as parasite recurrence in the presence of plasma concentrations of CQ and DSQ higher than 100 ng/mL and microsatellite analysis revealing the presence of the same clonal nature at diagnosis and recurrence. The CQ-sensitive control group consisted of patients with no parasitemia recurring during follow-up period. A group of 20 healthy individuals from Brazil was used as non-malarial control group. Samples were obtained in collaboration with Wuelton M. Monteiro (Universidade do Estado do Amazonas, Manaus, Amazonas, Brazil and Fundacao de Medicina Tropical Dr. Heitor Vieira Dourado, Manaus, Amazonas, Brazil) and Marcus V.G. Lacerda (Fundacao de Medicina Tropical Dr. Heitor Vieira Dourado, Manaus, Amazonas, Brazil and Instituto Leonidas & Maria Deane (FIOCRUZ), Manaus, Amazonas, Brazil).  Metabolomics results were produced by Dean Jones at Emory University.</td>
           </tr>
         </table>
      </div>   
	 
<!--	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>

     <br><br> 
     <img align="middle" src="images/MaHPIC_E03_Timeline.png" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E03_Timeline.png" target="_blank">View Larger Image</a><br>
  -->    
        
  </div>	
  </div>  

 
 
 
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 03: Measures of infection and recrudescence in <i>M. mulatta</i> infected with <i>P. coatneyi</i> Hackeri strain </a> </h3> 
   <div class="wdk-toggle-content">

	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE03 table, #DataLinksE03 td, #DataLinksE03 th, #DataLinksE03 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE03 {
           margin-left : 5 em;
           }
           
           #DataLinksE03 td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE03"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><b><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_03/">E03 Clinical Data in PlasmoDB Downloads</b></a></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b>Coming Soon</b></td>  
                    <!--<br> <a href="https://www.ncbi.nlm.nih.gov/sra" target="_blank">E03 Sequence data at NCBI's SRA</a><br><a href="https://www.ncbi.nlm.nih.gov/geo/" target="_blank">E03 Expression Results on NCBI's GEO</a><br><a href="https://www.ncbi.nlm.nih.gov/bioproject/XXX" target="_blank">E03 BioProject record at NCBI</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Proteomics</b></td>
             <td><b>Coming Soon</b></td> <!--<br><a href="https://www.ebi.ac.uk/pride/archive/" target="_blank">E03 Proteomics at EBI's PRIDE</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"> <b>Lipidomics</b></td>
             <td><b><a href="http://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=07e7da87660b4418aa48e26fce5c7a75" target="_blank">E03 Lipidomics Results at MassIVE</a></b></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"> <b>Immune Profiling</b></td>
             <td><b>Coming Soon</b></td> <!--<a href="XXXXXXX" target="_blank">E03 Immune Profiles at NIAID's ImmPort</b></a></td>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="http://www.metabolomicsworkbench.org/data/DRCCMetadata.php?Mode=Study&StudyID=ST000599" target="_blank">E03 Metabolomics Results at Metabolomics Workbench </a></b></td>    
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"> <b>Computational Modeling</b></td>
             <td><b>Coming soon</b></td>
             <td>N/A</td>
           </tr>
           </table>
           </div>
<br><br>
	 <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE03 table, #ExpInfoE03 td, #ExpInfoE03 th, #ExpInfoE03 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE03 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE03"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 03: <i>Macaca mulatta</i> infected with <i>Plasmodium coatneyi</i> Hackeri strain to produce and integrate clinical, hematological, parasitological, and omics measures of acute, recrudescent, and chronic infections.</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Malaria-naive male rhesus macaques (<i>Macaca mulatta</i>), approximately four years of age, were inoculated intravenously with salivary gland sporozoites produced and isolated at the Centers for Disease Control and Prevention from multiple <i>Anopheles</i> species (<i>An. dirus</i>, <i>An. gambiae</i>, and <i>An. stephensi</i>) and then profiled for clinical, hematological, parasitological, immunological, functional genomic, lipidomic, proteomic, and metabolomic measurements. The experiment was designed for 100 days, and pre- and post-100 day periods to prepare subjects and administer curative treatments respectively. The anti-malarial drug artemether was subcuratively administered to all subjects at the initial peak of infection, one out of the five macaques received four additional subcurative treatments for subsequent recrudescence peaks.  The experimental infection in one subject was ineffective but the macaque was followed-up for the same period of 100 days. The different clinical phases of the infection were clinically determined for each subject.  Blood-stage curative doses of artemether were administered to all subjects at the end of the study.  Capillary blood samples were collected daily for the measurement of CBCs, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis. Venous blood and bone marrow samples were collected at seven time points for functional genomic, proteomic, lipidomic, and immunological analyses. Within the MaHPIC, this project is known as 'Experiment 03'. This dataset was produced by Alberto Moreno at Emory University. The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC).</td>
           </tr>
         </table>
      </div>   
	 
<!--	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
  -->
     <br><br> 
     <img align="middle" src="images/MaHPIC_E03_Timeline.png" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E03_Timeline.png" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>  


   
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 04: Measures of infection and relapse in <i>M. mulatta</i> infected with <i>P. cynomolgi</i> B strain</a></h3> 
   <div class="wdk-toggle-content">

	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinks table, #DataLinks td, #DataLinks th, #DataLinks tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinks {
           margin-left : 5 em;
           }
           
           #DataLinks td {vertical-align: middle;}
         </style> 
         <table id="DataLinks"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><b><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_04/">E04 Clinical Data in PlasmoDB Downloads</b></a></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b><a href="https://www.ncbi.nlm.nih.gov/bioproject/?term=PRJNA368917" target="_blank">MaHPIC Umbrella BioProject</a><br>
                    <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE94273" target="_blank">E04 Bone Marrow Expression Results at NCBI's GEO</a></b>
                    <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE99486" target="_blank">E04 Whole Blood Expression Results at NCBI's GEO </a></b></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Proteomics</b></td>
             <td><b>Coming Soon</b></td> <!--<br><a href="https://www.ebi.ac.uk/pride/archive/" target="_blank">E04 Proteomics at EBI's PRIDE</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"> <b>Lipidomics</b></td>
             <td><b><a href="http://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=68c2e59511d04428bfecf9ce231c7ad0" target="_blank">E04 Lipidomics Results at MassIVE</a></b></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"> <b>Immune Profiling</b></td>
             <td><b><a href=" http://www.immport.org/immport-open/public/study/study/displayStudyDetail/SDY1015" target="_blank">E04 Immunology (Adaptive, Innate, Cytokine) Results at ImmPort </a></b></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="http://www.metabolomicsworkbench.org/data/DRCCMetadata.php?Mode=Study&StudyID=ST000515" target="_blank">E04 Metabolomics Results at Metabolomics Workbench</a></b></td>    
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"> <b>Computational Modeling</b></td>
             <td><b>Coming soon</b></td>
             <td>N/A</td>
           </tr>
           </table>
           </div>
<br><br>
	 <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfo table, #ExpInfo td, #ExpInfo th, #ExpInfo tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfo {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfo"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 04: <i>Macaca mulatta</i> infected with <i>Plasmodium cynomolgi</i> B strain to produce clinical and omics measures of infection and relapse.</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Malaria-naive male rhesus macaques (<i>Macaca mulatta</i>), approximately three years of age, were inoculated intravenously with salivary gland sporozoites isolated at the Centers for Disease Control and Prevention from multiple Anopheles species (<i>An. dirus</i>, <i>An. gambiae</i>, and <i>An. stephensi</i>) and then profiled for clinical, parasitological, immunological, functional genomic, lipidomic, proteomic, and metabolomic measurements. The experiment was designed for 100 days, and pre- and post-100 day periods to prepare subjects and administer curative treatments respectively. The anti-malarial drug Artemether was subcuratively administered selectively to several subjects during the primary parasitemia to suppress clinical complications and to all animals for curative treatment of blood-stage infections to allow detection of relapses. One subject was euthanized during the 100-day experimental period due to clinical complications. The anti-malarial drugs Primaquine and Chloroquine were administered to all remaining subjects at the end of the study for curative treatment of the liver and blood-stage infections, respectively. Capillary blood samples were collected daily for the measurement of CBCs, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis.  Venous blood and bone marrow samples were collected at seven time points for functional genomic, proteomic, lipidomic, and immunological analyses.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC).</td>
           </tr>
         </table>
      </div>   
	 
	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
     <img align="middle" src="images/MaHPIC_Ex04_Timeline_1.png" height="300px" width="500px"><br>
     <a href="images/MaHPIC_Ex04_Timeline_1.png" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>

  
  
     <div class="wdk-toggle" data-show="false">
     <h3 class="wdk-toggle-name"> <a href="#">Experiment 13: Control measures from uninfected <i>Macaca mulatta</i> exposed to pyrimethamine</a></h3>
     <div class="wdk-toggle-content">

       <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE13 table, #DataLinksE13 td, #DataLinksE13 th, #DataLinksE13 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE13 {
           margin-left : 5 em;
           }
           
           #DataLinksE13 td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE13"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><b>Coming Soon</b></td>  <!--<br><a href="http://plasmodb.org/common/downloads/">PlasmoDB Downloads</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b><a href="https://www.ncbi.nlm.nih.gov/bioproject/?term=PRJNA368917" target="_blank">MaHPIC Umbrella BioProject</a><br>
                    <a href="https://trace.ncbi.nlm.nih.gov/Traces/sra/?study=SRP043059" target="_blank">E13 Sequence data at NCBI's SRA</a><br>
                    <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE58340" target="_blank">E13 Expression Results at NCBI's GEO</a></b></td>   
             <td>N/A</td>
           </tr>
      <!-- Susanne removed Proteomics on purpose.  This experiment will not have immunomics data-->
           <tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"> <b>Lipidomics</b></td>
             <td><b><a href="http://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=c7e41c86aa6e4b15bc89b27a72fc9158" target="_blank">E13 Lipidomics Results at MassIVE </a></b></td>
             <td>N/A</td>
           </tr>
      <!-- Susanne removed Immunomics on purpose.  This experiment will not have immunomics data-->
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="http://www.metabolomicsworkbench.org/data/DRCCMetadata.php?Mode=Study&StudyID=ST000592" target="_blank">E13 Metabolomics Results at Metabolomics Workbench </a></b></td> 
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"> <b>Computational Modeling</b></td>
             <td><b>Coming soon</b></td>
             <td>N/A</td>
           </tr>
           </table>
           </div>
<br><br>
	 <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE13 table, #ExpInfoE13 td, #ExpInfoE13 th, #ExpInfoE13 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE13 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE13"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 13: Uninfected <i>Macaca mulatta</i> exposed to pyrimethamine to produce clinical, hematological, and omics control measures.</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Uninfected, malaria-naive, male rhesus macaques (<i>Macaca mulatta</i>), approximately two years of age, were inoculated intravenously with a preparation of salivary gland material derived from non-infected <i>Anopheles dirus</i> and profiled for clinical, hematological, functional genomic, lipidomic, proteomic, and metabolomic measurements.  Samples were generated and analyzed to investigate the effects of the pharmacological intervention with the anti-malarial drug pyrimethamine on normal individuals.  The experiment was designed for 100 days plus a follow-up period, with pyrimethamine administered at three different time points to coincide with the predicted treatment days of experimentally infected rhesus macaques. Capillary blood samples were collected daily for the measurement of CBCs and reticulocytes.  Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis.  Venous blood samples and bone marrow aspirates were collected at seven time points before and after three rounds of drug administration for functional genomic, proteomic, and lipidomic analyses.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC).</td>
           </tr>
         </table>
      </div>   
	 
	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px">  <img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px">
	     Comparative transcriptomics and metabolomics in a rhesus macaque drug administration study. <a href="https://www.ncbi.nlm.nih.gov/pubmed/25453034" target="_blank">Lee et al. Front Cell Dev Biol. 2014 Oct 8;2:54</a>
        </div>
        <br><br>
     <img align="middle" src="images/MaHPIC_E13_Timeline.png" height="270px" width="550px"><br>
     <a href="images/MaHPIC_E13_Timeline.png" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>
  
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 23: Iterative measures of infection and relapse in <i>M. mulatta</i> infected with <i>P. cynomolgi</i> B strain</a> </h3> 
   <div class="wdk-toggle-content">

	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE23 table, #DataLinksE23 td, #DataLinksE23 th, #DataLinksE23 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE23 {
           margin-left : 5 em;
           }
           
           #DataLinksE23 td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE23"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><b><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_23/">E23 Clinical Data in PlasmoDB Downloads</b></a></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b>Coming Soon</b></td>  <!--<br> <a href="https://www.ncbi.nlm.nih.gov/sra" target="_blank">E23 Sequence data at NCBI's SRA</a><br><a href="https://www.ncbi.nlm.nih.gov/geo/" target="_blank">E03 Expression Results on NCBI's GEO</a><br><a href="https://www.ncbi.nlm.nih.gov/bioproject/XXX" target="_blank">E23 BioProject record at NCBI</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Proteomics</b></td>
             <td><b>Coming Soon</b></td> <!--<br><a href="https://www.ebi.ac.uk/pride/archive/" target="_blank">E23 Proteomics at EBI's PRIDE</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"> <b>Lipidomics</b></td>
             <td><b><a href="http://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=9dce6369a6c14b23b77b55825e5dd61d" target="_blank">E23 Lipidomics Results at MassIVE</a></b></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"> <b>Immune Profiling</b></td>
             <td><b>Coming Soon</b></td>  <!--<br><a href="https://immport.niaid.nih.gov/immportWeb/home/home.do?loginType=full" target="_blank">E23 Immune Profiles at NIAID's ImmPort</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b>Coming Soon</b></td> <!--<br><a href="https://massive.ucsd.edu/ProteoSAFe/static/massive.jsp" target="_blank">E23 Metabolomics at UCSD's MassIVE</a><br><a href="http://www.metabolomicsworkbench.org/" target="_blank">E03 Metabolomics at UCSD's Metabolomics Workbench</a> -->    
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"> <b>Computational Modeling</b></td>
             <td><b>Coming soon</b></td>
             <td>N/A</td>
           </tr>    
           </table>
           </div>
<br><br>
	 <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE23 table, #ExpInfoE23 td, #ExpInfoE23 th, #ExpInfoE23 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE23 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE23"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 23: <i>M. mulatta</i> infected with <i>P. cynomolgi</i> B strain to produce and integrate clinical, hematological, parasitological, and omics measures of acute primary infection and relapses.</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Malaria-naive male rhesus macaques (<i>Macaca mulatta</i>), approximately four years of age, were inoculated intravenously with salivary gland sporozoites produced and isolated at the Centers for Disease Control and Prevention from multiple <i>Anopheles</i> species (<i>An. dirus</i>, <i>An. gambiae</i>, and <i>An. stephensi</i>) and then profiled for clinical, hematological, parasitological, immunological, functional genomic, lipidomic, proteomic, and metabolomic measurements. The experiment was designed for about 100 days, with pre- and post-100 day periods to prepare subjects and administer curative treatments respectively. During the 100-day period subjects experienced periods of patent and sub-patent infection. The anti-malarial drug artemether was subcuratively administered to subjects after the initial peak of infection, if subjects were not able to self-resolve.  Blood-stage curative artemether was administered to all subjects following peak infection, and following a period of relapse infection.  All peaks were clinically determined for each subject.  The anti-malarial drugs primaquine and chloroquine were administered to all subjects at the end of the study for curative treatment of the liver and blood-stage infections, respectively.  Capillary blood samples were collected daily for the measurement of CBCs, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis. Venous blood and bone marrow samples were collected at seven time points for functional genomic, proteomic, lipidomic, and immunological analyses. Within the MaHPIC, this project is known as 'Experiment 23'.  This is an iteration of Experiment 04 with the same parasite-host combination and sampling and treatment adjustments made, and this is the first in a series of experiments that includes subsequent homologous (Experiment 24, <i>P. cynomolgi</i> B strain) and heterologous (Experiment 25, <i>P. cynomolgi</i> strain ceylonensis) challenges of individuals from the Experiment 23 cohort.  One subject was not included in subsequent experiments due to persistent behavioral issues that prevented sample collection.  This dataset was produced by Alberto Moreno at Emory University.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC).</td>
           </tr>
         </table>
      </div>   
	 
<!--	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
  -->
     <br><br> 
     <img align="middle" src="images/MaHPIC_E23_Timeline.png" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E23_Timeline.png" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>  

 
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 24: Iterative measures of infection and relapse in <i>M. mulatta</i> infected with <i>P. cynomolgi</i> B strain, in a homologous challenge</a> </h3> 
   <div class="wdk-toggle-content">

	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE24 table, #DataLinksE24 td, #DataLinksE24 th, #DataLinksE24 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE24 {
           margin-left : 5 em;
           }
           
           #DataLinksE24 td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE24"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><b><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_24/">E24 Clinical Data in PlasmoDB Downloads</b></a></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b>Coming Soon</b></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"> <b>Immune Profiling</b></td>
             <td><b>Coming Soon</b></td>  <!--<br><a href="https://immport.niaid.nih.gov/immportWeb/home/home.do?loginType=full" target="_blank">E24 Immune Profiles at NIAID's ImmPort</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b>Coming Soon</b></td> <!--<br><a href="https://massive.ucsd.edu/ProteoSAFe/static/massive.jsp" target="_blank">E24 Metabolomics at UCSD's MassIVE</a><br><a href="http://www.metabolomicsworkbench.org/" target="_blank">E24 Metabolomics at UCSD's Metabolomics Workbench</a> -->    
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"> <b>Computational Modeling</b></td>
             <td><b>Coming soon</b></td>
             <td>N/A</td>
           </tr>
           </table>
           </div>
<br><br>
	 <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE24 table, #ExpInfoE24 td, #ExpInfoE24 th, #ExpInfoE24 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE24 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE24"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 24: <i>Macaca mulatta</i> infected with <i>Plasmodium cynomolgi</i> B strain, in a homologous challenge, to produce and integrate clinical, hematological, parasitological, and omics measures of acute primary infection and relapses</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Male rhesus macaques (<i>Macaca mulatta</i>), cleared of previous infection with <i>P. cynomolgi</i> B strain via treatment with the anti-malarial drugs artemether, chloroquine, and primaquine,  approximately five years of age, were inoculated intravenously with salivary gland sporozoites produced and isolated at the Centers for Disease Control and Prevention from multiple <i>Anopheles</i> species (<i>An. dirus</i>, <i>An. gambiae</i>, and <i>An. stephensi</i>) and then profiled for clinical, hematological, parasitological, immunological, functional genomic, lipidomic, and metabolomic measurements. The experiment was conducted for 34 days, and pre- and post-34 day periods to prepare subjects and administer post-experiment curative treatments respectively.  The anti-malarial drugs primaquine and chloroquine were administered to all subjects at the end of the study for curative treatment of the liver and blood-stage infections, respectively.  Capillary blood samples were collected daily for the measurement of CBCs, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis. Venous blood samples were collected at three time points for functional genomic, lipidomic, and immunological analyses. Within the MaHPIC, this project is known as 'Experiment 24'.  This is the second in a series of experiments that includes infection of malaria-naive subjects (Experiment 23, <i>P. cynomolgi</i> B strain) and heterologous challenge (Experiment 25, <i>P. cynomolgi</i> strain ceylonensis) for the individuals from the same cohort.  This dataset was produced by Alberto Moreno at Emory University.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC). </td>
           </tr>
         </table>
      </div>   
	 
<!--	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
  -->
     <br><br> 
     <img align="middle" src="images/MaHPIC_E24_Timeline.png" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E24_Timeline.png" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>  

   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 25: Iterative measures of infection and relapse in <i>M. mulatta</i> infected with <i>P. cynomolgi</i> strain ceylonensis, in a heterologous challenge </a> </h3> 
   <div class="wdk-toggle-content">

	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE25 table, #DataLinksE25 td, #DataLinksE25 th, #DataLinksE25 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE25 {
           margin-left : 5 em;
           }
           
           #DataLinksE03 td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE25"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><b><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_25/">E25 Clinical Data in PlasmoDB Downloads</b></a></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b>Coming Soon</b></td>  <!--<br> <a href="https://www.ncbi.nlm.nih.gov/sra" target="_blank">E25 Sequence data at NCBI's SRA</a><br><a href="https://www.ncbi.nlm.nih.gov/geo/" target="_blank">E25 Expression Results on NCBI's GEO</a><br><a href="https://www.ncbi.nlm.nih.gov/bioproject/XXX" target="_blank">E25 BioProject record at NCBI</a>-->
             <td>N/A</td>
           </tr>
           <!-- Susanne removed proteomics on purpose.  Expt 25 will not have proteomics data -->
           <tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"> <b>Lipidomics</b></td>
             <td><b><a href="https://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=dfe580b171df4a3c810c2b58304a408f" target="_blank">E25 Lipidomics Results at MassIVE </a><b>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"> <b>Immune Profiling</b></td>
             <td><b>Coming Soon</b></td>  <!--<br><a href="https://immport.niaid.nih.gov/immportWeb/home/home.do?loginType=full" target="_blank">E25 Immune Profiles at NIAID's ImmPort</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b>Coming Soon</b></td> <!--<br><a href="https://massive.ucsd.edu/ProteoSAFe/static/massive.jsp" target="_blank">E25 Metabolomics at UCSD's MassIVE</a><br><a href="http://www.metabolomicsworkbench.org/" target="_blank">E03 Metabolomics at UCSD's Metabolomics Workbench</a> -->    
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"> <b>Computational Modeling</b></td>
             <td><b>Coming soon</b></td>
             <td>N/A</td>
           </tr>
           </table>
           </div>
<br><br>
	 <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE25 table, #ExpInfoE25 td, #ExpInfoE25 th, #ExpInfoE25 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE25 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE25"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 25: <i>Macaca mulatta</i> infected with <i>Plasmodium cynomolgi</i> strain ceylonensis, in a heterologous challenge, to produce and integrate clinical, hematological, parasitological, and omics measures of acute primary infection and relapses  </td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Male rhesus macaques (<i>Macaca mulatta</i>), cleared of previous infection with  <i>P. cynomolgi</i> B strain via treatment with the anti-malarial drugs artemether, chloroquine, and primaquine,  approximately five years of age, were inoculated intravenously with salivary gland sporozoites produced and isolated at the Centers for Disease Control and Prevention from multiple <i>Anopheles</i> species (<i>An. dirus</i>, <i>An. gambiae</i>, and <i>An. stephensi</i>) and then profiled for clinical, hematological, parasitological, immunological, functional genomic, lipidomic, proteomic, and metabolomic measurements. The experiment was conducted for 51 days, and pre- and post-51 day periods to prepare subjects and administer post-experiment curative treatments respectively.  The anti-malarial drug artemether was subcuratively administered to subjects at the initial peak of infection, if subjects were not able to self-resolve their parasitemias.  Peak infection was determined clinically for each subject.  The anti-malarial drugs primaquine and chloroquine were administered to all subjects at the end of the study for curative treatment of the liver and blood-stage infections, respectively.  Capillary blood samples were collected daily for the measurement of CBCs, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis. Venous blood samples were collected at five time points for functional genomic, lipidomic, proteomic, and immunological analyses. Within the MaHPIC, this project is known as 'Experiment 25'.  This is the third and final of a series of experiments that includes infection of malaria-naive subjects (Experiment 23, <i>P. cynomolgi</i> B strain) and homologous challenge (Experiment 24, <i>P. cynomolgi</i> B strain) of individuals from the same cohort.  This dataset was produced by Alberto Moreno at Emory University.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC). </td>
           </tr>
         </table>
      </div>   
	 
<!--	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
  -->
     <br><br> 
     <img align="middle" src="images/MaHPIC_E25_Timeline.png" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E25_Timeline.png" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>  

   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 30: Measures of acute infection of Macaca mulatta infected with Plasmodium knowlesi, pilot collection of telemetry data </a> </h3> 
   <div class="wdk-toggle-content">

	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE30 table, #DataLinksE30 td, #DataLinksE30 th, #DataLinksE30 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE30 {
           margin-left : 5 em;
           }
           
           #DataLinksE30 td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE30"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><b><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_25/">E25 Clinical Data in PlasmoDB Downloads</b></a></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b>Coming Soon</b></td>  <!--<br> <a href="https://www.ncbi.nlm.nih.gov/sra" target="_blank">E25 Sequence data at NCBI's SRA</a><br><a href="https://www.ncbi.nlm.nih.gov/geo/" target="_blank">E25 Expression Results on NCBI's GEO</a><br><a href="https://www.ncbi.nlm.nih.gov/bioproject/XXX" target="_blank">E25 BioProject record at NCBI</a>-->
             <td>N/A</td>
           </tr>
           <!-- Susanne removed proteomics on purpose.  Expt 25 will not have proteomics data -->
           <tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"> <b>Lipidomics</b></td>
             <td><b><a href="https://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=dfe580b171df4a3c810c2b58304a408f" target="_blank">E25 Lipidomics Results at MassIVE </a><b>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"> <b>Immune Profiling</b></td>
             <td><b>Coming Soon</b></td>  <!--<br><a href="https://immport.niaid.nih.gov/immportWeb/home/home.do?loginType=full" target="_blank">E25 Immune Profiles at NIAID's ImmPort</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b>Coming Soon</b></td> <!--<br><a href="https://massive.ucsd.edu/ProteoSAFe/static/massive.jsp" target="_blank">E25 Metabolomics at UCSD's MassIVE</a><br><a href="http://www.metabolomicsworkbench.org/" target="_blank">E03 Metabolomics at UCSD's Metabolomics Workbench</a> -->    
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"> <b>Computational Modeling</b></td>
             <td><b>Coming soon</b></td>
             <td>N/A</td>
           </tr>
           </table>
           </div>
<br><br>
	 <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE30 table, #ExpInfoE30 td, #ExpInfoE30 th, #ExpInfoE30 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE30 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE30"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 30: Pilot experiment for <i>Macaca mulatta</i> infected with <i>Plasmodium knowlesi</i> strain PK1 (A+) to produce and integrate clinical, hematological, parasitological, omics, telemetric and histopathological measures of acute primary infection.</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Telemetry devices (DSI, model L21) with blood pressure sensors and ECG leads were surgically implanted in two malaria-naive male rhesus macaques (<i>Macaca mulatta</i>), approximately three years of age.  After a resting period of two weeks, physiological data that include activity, temperature, ECG, and blood pressure were continuously collected.  Two weeks after activation of the telemetry implant, the macaques were inoculated intravenously with cryopreserved salivary gland sporozoites. The cryopreserved batch of <i>P. knowlesi</i> sporozoites were produced, isolated and cryopreserved at the Centers for Disease Control and Prevention from multiple <i>Anopheles</i> species (<i>An. dirus</i>, <i>An. gambiae</i>, and <i>An. stephensi</i>) and their infectivity previously validated in rhesus.  After experimental infection, the macaques were profiled for clinical, hematological, parasitological, immunological, functional genomic, lipidomic, proteomic, metabolomic, telemetric and histopathological measurements. The experiment was designed for terminal necropsies on days 11 (RKy15) or 19 (Red16).  The anti-malarial drug artemether was subcuratively administered selectively to one subject (REd16) during the primary parasitemia to suppress clinical complications. Capillary blood samples were collected daily for the measurement of CBCs, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis. Venous blood and bone marrow samples were collected at five timepoints for functional genomic, proteomic, lipidomic, and immunological analyses. Physiological data were continuously captured via telemetry.  Within the MaHPIC, this project is known as "Experiment 30".  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC) and the MRMC Office of Research Protection Animal Care and Use Review Office (ACURO). </td>
           </tr>
         </table>
      </div>   
	 
<!--	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
  -->
<!--  
     <br><br> 
     <img align="middle" src="images/MaHPIC_E25_Timeline.png" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E25_Timeline.png" target="_blank">View Larger Image</a><br>
  -->  
        
  </div>	
  </div>  




  </div>
  </div>
  </div>
  


<!--
<div class="item">

   <h3>What data is available?</h3>
   
   <div style="margin-left: 1em;">
     PlasmoDB serves as a gateway for the scientific community to access MaHPIC data. The <a href="#access">Download MaHPIC Data</a> 
     section of this page provides information about and links to all available MaHPIC data.<br>
     <a href="#" class="read_more">Read More...</a><br><br>
   
      <span class="more_text">
      <img align="middle" src="images/MaHPICtoPlasmo_Interface.png" height="260px" width="520px"><br>
      
      <a href="images/MaHPICtoPlasmo_Interface.png" target="_blank">View Larger Image</a><br><br>
        The MaHPIC project produces large amounts 
       of data, both clinical and omics, that is stored in public repositories whenever possible. When an appropriate public 
       repository does not exist (e.g. clinical data and metadata), PlasmoDB stores the data in our Downloads Section. Results 
       include a rich collection of data and metadata collected over the course of 
       individual MaHPIC experiments. Each Clinical Malaria data set consists of a set of files, including a descriptive README, that contain clinical, 
       veterinary, and animal husbandry results from a MaHPIC Experiment.  The results produced by the MaHPIC Clinical Malaria Team are the 
       backbone of MaHPIC experiments.<br><br>
     </span>
  </div>
</div>
-->

  
  </div>
</div>
</div>
</imp:pageFrame>
