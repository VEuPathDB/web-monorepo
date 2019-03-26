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
    <a href="http://www.systemsbiology.emory.edu/index.html" target="_blank">MaHPIC</a> was established with funding from the 
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
             <td><b><a href="https://www.ncbi.nlm.nih.gov/bioproject/315987" target="_blank"><b>GenBank</b></a></td>  
             <td><b><a href="http://plasmodb.org/plasmo/app/record/dataset/DS_597478d531">2 Feb 2017</b></a></td>
             <td><b><a href="https://www.ncbi.nlm.nih.gov/pubmed/27587810" target="_blank">PMID:27587810</a></b></td>
           </tr>
           <tr>
             <td><b><i>Plasmodium knowlesi</i> strain Malayan Strain Pk1 A</b></td>
             <td><b><a href="https://www.ncbi.nlm.nih.gov/bioproject/PRJNA377737" target="_blank">GenBank</b></a></td> 
             <td><b><a href="http://plasmodb.org/plasmo/app/record/dataset/DS_3f2eadf75b">1 Dec 2017</b></a></td>
             <td><b><a href="https://www.ncbi.nlm.nih.gov/pubmed/28720171" target="_blank">PMID:28720171</a></b></td>
           </tr>

           </table>
           </div>       
  </div>	
  </div>
 
 
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment HuA: Metabolomics of plasma samples from humans infected with <i>P. vivax</i> </a> </h3> 
   <div class="wdk-toggle-content">

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
     <br><br>
     
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
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="http://www.metabolomicsworkbench.org//data/DRCCMetadata.php?Mode=Study&StudyID=ST000578&StudyType=MS&ResultType=5" target="_blank">HuA Metabolomics Results at Metabolomics Workbench</a></b></td>    
             <td>N/A</td>
           </tr>
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
   <h3 class="wdk-toggle-name"> <a href="#">Experiment HuB: Metabolomics of plasma samples from humans infected with <i>P. falciparum</i> and <i>P. vivax</i> </a> </h3> 
   <div class="wdk-toggle-content">

     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoHuB table, #ExpInfoHuB td, #ExpInfoHuB th, #ExpInfoHuB tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoHuB {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoHuB"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Metabolomics of plasma samples from humans infected with <i>P. falciparum</i> and <i>P. vivax</i></td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>This study is based on archived plasma from samples collected between 2011 and 2014. Patients in Thailand who were infected with <i>P. falciparum</i> (30 subjects), <i>P. vivax</i> (30 subjects), co-infected with <i>P. falciparum</i> and <i>P. vivax</i> (22 subjects) were included, alongside two sets of non-malaria cases: non-malarial febrile illnesses (30 subjects) and healthy controls (30 subjects).  Malaria subjects were enrolled under ethics research protocol TMEC 11-033, and non-malaria cases were enrolled under TMEC 14-025, both approved by the Ethical Review Committee of the Faculty of Tropical Medicine, Mahidol University, Thailand.  All protocols and documentation were reviewed and sample shipments approved by the Emory IRB. Subjects were enrolled at the Ministry of Public Health (MOPH) Malaria Clinics in the Kanchanaburi and Tak provinces clinic between August 2011 and August 2014.  Patients were all adults, at least 18 years old, and not pregnant.  Individuals were not treated prior to sample collection.  Individuals with uncomplicated malaria cases were recruited for the study. Patients were parasitemic and symptomatic at admission, including some being febrile, but all lacked complications of severe malaria, according to WHO guidelines. Cases of non-malaria febrile illness (NMFI) were recruited as controls from the Fever Clinic of the Hospital for Tropical Diseases at Mahidol University.  These individuals were febrile and were malaria-negative by thick smear microscopy and PCR, and had no history of taking antimalarial or antibiotic medications during the two weeks prior to their hospital visit.  The NFMI cases were diagnosed as dengue, influenza, co-infection of the two pathogens, or unidentified febrile illness.  Healthy individuals were also recruited at the Hospital for Tropical Diseases as a control group.  They were afebrile, had no reported history of malaria infection or treatment, were malaria-negative as determined by thick smear and PCR, and were not on any medications. For healthy and NFMI samples, one mL of venous blood was collected in a heparin tube and plasma was aliquoted and frozen at -80C. For malaria patients, one mL of venous blood was collected in either a heparin or ACD tube, frozen, thawed for aliquoting, and refrozen again. A frozen aliquot was shipped on dry ice to Emory University for high-resolution mass spectrometry and metabolomics analyses. Within the MaHPIC, this project is known as 'Experiment HuB'.  Samples were obtained in collaborations  with Jetsumon Prachumsri, Rapathborn Patrapuvich, Viravarn Luvira, Siriwan Rungin, Teerawat Saeseu, and Nattawan Rachaphaew at the Mahidol Vivax Research Unit and the Hospital for Tropical Diseases at Mahidol University. </td>
           </tr>
         </table>
      </div>   
     <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksHuB table, #DataLinksHuB td, #DataLinksHuB th, #DataLinksHuB tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksHuB {
           margin-left : 5 em;
           }
           
           #DataLinksHuB td {vertical-align: middle;}
         </style> 
         <table id="DataLinksHuB"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
          <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="https://www.ebi.ac.uk/metabolights/MTBLS664" target="_blank">HuB Metabolomics Results at MetaboLights</a></b></td>    
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Quantitative Metabolomics</b></td>
             <td><b><a href="https://www.ebi.ac.uk/metabolights/MTBLS664" target="_blank">HuB Quantitative Metabolomics Results at MetaboLights</a></b></td>    
             <td>N/A</td>
           </tr>
           </table>
           </div>
<!--	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px">  <img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px">
	     Integrative metabolomics and transcriptomics signatures of clinical tolerance to <i>Plasmodium vivax</i> reveal activation of innate cell immunity and T cell signaling. <a href="https://www.ncbi.nlm.nih.gov/pubmed/29698924" target="_blank">Gardinassi et al. Redox Biol. 2018 Jul;17:158-170</a>
        </div>
        <br><br>

     <br><br> 
     <img align="middle" src="images/MaHPIC_E03_Timeline.png" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E03_Timeline.png" target="_blank">View Larger Image</a><br>
  -->    
        
  </div>	
  </div>   
 




   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment HuC: Metabolomics of plasma samples from human volunteers infected with <i>P. vivax</i> </a> </h3> 
   <div class="wdk-toggle-content">

     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoHuC table, #ExpInfoHuC td, #ExpInfoHuC th, #ExpInfoHuC tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoHuC {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoHuC"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Metabolomics of plasma samples from human volunteers infected with <i>P. vivax</i></td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Sixteen healthy volunteers, 7 malaria na&iuml;ve and 9 semi-immune, aged 18-45 years, were enrolled in this study during October 2012 to November 2013. Malaria-na&iuml;ve volunteers were recruited in Cali, Colombia, a non-endemic city; those with previous malaria experience were recruited in Buenaventura, a malaria-endemic area on the Colombian Pacific Coast. The study was approved by Institutional Review Boards (IRB) of the Malaria Vaccine and Drug Development Center-MVDC (CECIV, Cali) and Centro M&egrave;dico Imbanaco (Cali).  All protocols and documentation were reviewed and samples shipments approved by the Emory IRB.  Male and female patients were eligible for inclusion, which included two steps: 1) age between 15-60 years, hemoglobin levels > 9g/dL, presence of current <i>P. vivax</i> infection, absence of other <i>Plasmodium</i> species determined by thick blood smear and PCR, blood parasite count of 0.1&#37; or more, absence of other acute or chronic diseases, being able to sign an informed consent form; 2) healthy 18 to 45 years old man or non-pregnant women,  capacity to sign an informed consent in a free and voluntary way, acceptable understanding of the clinical trial through the approval of a questionnaire regarding the information given in the consent process, obligatory use of adequate contraceptive method from beginning of recruitment and screening time up to three months after last immunization, do not have chronic or acute diseases, accept not traveling to malaria endemic areas during the clinical trial, have telephone at home or mobile phone that permit permanent contact for follow up, being willing to participated during both steps of the clinical trial. Exclusion criteria included pregnancy, abnormal laboratory test values, hemoglobin pathology, glucose-6-phosphate dehydrogenase (G6PDH) deficiency, positive for blood bank infectious diseases (syphilis, HIV, Chagas disease, HTLV 1-2, and hepatitis B and hepatitis C), or have any condition that would increase the risk of an adverse outcome.  Volunteers were infected with <i>P. vivax</i> via sporozoite challenge by exposing volunteers to bites of 2-4 mosquitoes (<i>Anopheles albimanus</i>) of the same infected batch. Plasma samples were collected at 4 time points: Baseline, 1 month pre-inoculation; Diagnosis; 3 weeks post-treatment; 4 months post-treatment. As soon as parasites were detected by thick blood smears, participants were treated orally with curative doses of chloroquine (1500 mg chloroquine provided in three doses: 600 mg initially then 450 mg doses at 24 and 48 hours) and primaquine (30 mg dose given once per day for 14 days). Clinical trial registration: NCT01585077. Samples were analyzed with liquid chromatography coupled to high resolution mass spectrometry (LC-HRMS), evaluated in a time course and between na&iuml;ve and semi-immune volunteers.  Within the MaHPIC, this project is known as 'Experiment HuC'.  Samples were obtained in collaboration with Socrates Herrera from the Malaria Vaccine and Drug Development Center, Colombia.  Metabolomics results were produced by Dean Jones at Emory University.</td>
           </tr>
         </table>
      </div>   
     <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksHuC table, #DataLinksHuC td, #DataLinksHuC th, #DataLinksHuC tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksHuC {
           margin-left : 5 em;
           }
           
           #DataLinksHuC td {vertical-align: middle;}
         </style> 
         <table id="DataLinksHuC"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
          <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="https://www.ebi.ac.uk/metabolights/MTBLS665" target="_blank">HuC Metabolomics Results at MetaboLights</a></b></td>    
             <td>N/A</td>
           </tr>
           </tr>
           </table>
           </div>
	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px">  <img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px">
	     Integrative metabolomics and transcriptomics signatures of clinical tolerance to <i>Plasmodium vivax</i> reveal activation of innate cell immunity and T cell signaling. <a href="https://www.ncbi.nlm.nih.gov/pubmed/29698924" target="_blank">Gardinassi et al. Redox Biol. 2018 Jul;17:158-170</a>
        </div>
        <br><br>
<!--
     <br><br> 
     <img align="middle" src="images/MaHPIC_E03_Timeline.png" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E03_Timeline.png" target="_blank">View Larger Image</a><br>
  -->    
        
  </div>	
  </div>   
 
 
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 03: Measures of infection and recrudescence in <i>M. mulatta</i> infected with <i>P. coatneyi</i> Hackeri strain </a> </h3> 
   <div class="wdk-toggle-content">
     
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
	 
     <br><br>
     
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
             <td><b><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_03/">E03 Clinical Data in PlasmoDB Downloads</a><br>
                    <a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_03/">E03 Bone Marrow Cytology Data in PlasmoDB Downloads</b></a>
                    </td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b> <a href="https://www.ncbi.nlm.nih.gov/bioproject/?term=PRJNA368917" target="_blank">MaHPIC Umbrella BioProject</a>
                     <br><a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE103042" target="_blank">E03 Bone Marrow Expression Results at NCBI's GEO</a>
                     <br><a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE103259" target="_blank">E03 Whole Blood Expression Results at NCBI's GEO</a>
                     
                  </b></td> 
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Proteomics</b></td>
             <td><b><a href="https://www.ebi.ac.uk/pride/archive/projects/PXD007773" target="_blank">E03 + E18 Proteomics Results at PRIDE</a></b></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"> <b>Lipidomics</b></td>
             <td><b><a href="http://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=07e7da87660b4418aa48e26fce5c7a75" target="_blank">E03 Lipidomics Results at MassIVE</a></b></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"> <b>Immune Profiling</b></td>
             <td><b><a href="http://www.immport.org/immport-open/public/study/study/displayStudyDetail/SDY1411" target="_blank">E03 Immune Results at ImmPort</a></b></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="http://www.metabolomicsworkbench.org/data/DRCCMetadata.php?Mode=Study&StudyID=ST000599" target="_blank">E03 Metabolomics Results at Metabolomics Workbench </a><br>
                    <a href="https://www.ebi.ac.uk/metabolights/MTBLS518" target="_blank">E03 Metabolomics Results at MetaboLights</a><br>
                    <a href="https://www.ebi.ac.uk/metabolights/MTBLS691" target="_blank">E03 Quantitative Metabolomics Results at MetaboLights</a></b></td>    
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"> <b>Computational Modeling</b></td>
             <td><b>Coming soon</b></td>
             <td>N/A</td>
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
     <img align="middle" src="images/MaHPIC_E03_Timeline.jpg" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E03_Timeline.jpg" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>  


   
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 04: Measures of infection and relapse in <i>M. mulatta</i> infected with <i>P. cynomolgi</i> B strain</a></h3> 
   <div class="wdk-toggle-content">
     
     
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
             <td>Malaria-naive male rhesus macaques (<i>Macaca mulatta</i>), approximately three years of age, were inoculated intravenously with salivary gland sporozoites isolated at the Centers for Disease Control and Prevention from multiple Anopheles species (<i>An. dirus</i>, <i>An. gambiae</i>, and <i>An. stephensi</i>) and then profiled for clinical, parasitological, immunological, functional genomic, lipidomic, proteomic, and metabolomic measurements. The experiment was designed for 100 days, and pre- and post-100 day periods to prepare subjects and administer curative treatments respectively. The anti-malarial drug Artemether was subcuratively administered selectively to several subjects during the primary parasitemia to suppress clinical complications and to all animals for curative treatment of blood-stage infections to allow detection of relapses. One subject was euthanized during the 100-day experimental period due to clinical complications. The anti-malarial drugs Primaquine and Chloroquine were administered to all remaining subjects at the end of the study for curative treatment of the liver and blood-stage infections, respectively. Capillary blood samples were collected daily for the measurement of CBCs, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis.  Venous blood and bone marrow samples were collected at seven time points for functional genomic, proteomic, lipidomic, and immunological analyses.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC).</td>
           </tr>
         </table>
      </div>   
      
      <br><br>
     
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
             <th>Data Integrated into PlasmoDB and HostDB</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><b><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_04/">E04 Clinical Data in PlasmoDB Downloads</b></a></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b><a href="https://www.ncbi.nlm.nih.gov/bioproject/?term=PRJNA368917" target="_blank">MaHPIC Umbrella BioProject</a><br>
                    <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE94273" target="_blank">E04 Bone Marrow Expression Results at NCBI's GEO</a><br>
                    <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE99486" target="_blank">E04 Whole Blood Expression Results at NCBI's GEO </a></b></td>
             <td><b><a href="http://plasmodb.org/plasmo/app/record/gene/PCYB_103890#ExpressionGraphs">PlasmoDB example gene page</a><br>
                    <a href="http://plasmodb.org/plasmo/showQuestion.do?questionFullName=InternalGeneDatasetQuestions.GenesByRNASeqEvidence#GeneQuestions.GenesByRNASeqpcynB_Galinski_infected_Mmulatta_rnaSeq_RSRC">PlasmoDB Pcyn differential expression</a><br>
                    <a href="http://plasmodb.org/plasmo/showQuestion.do?questionFullName=InternalGeneDatasetQuestions.GenesByRNASeqEvidence#GeneQuestions.GenesByRNASeqpcynB_Galinski_infected_Mmulatta_rnaSeq_RSRCPercentile">PlasmoDB Pcyn relative expression (percentile)</a><br>
                    <a href="http://hostdb.org/hostdb/app/record/gene/MACM_249#ExpressionGraphs" target="_blank">HostDB example gene page</a><br>
                    <a href="http://hostdb.org/hostdb/showQuestion.do?questionFullName=InternalGeneDatasetQuestions.GenesByRNASeqEvidence#GeneQuestions.GenesByRNASeqmmul17573_Galinski_Mmulatta_Infected_with_Pcynomolgi_rnaSeq_RSRC">HostDB Mmul differential expression</a><br>
                    <a href="http://hostdb.org/hostdb/showQuestion.do?questionFullName=InternalGeneDatasetQuestions.GenesByRNASeqEvidence#GeneQuestions.GenesByRNASeqmmul17573_Galinski_Mmulatta_Infected_with_Pcynomolgi_rnaSeq_RSRCPercentile">HostDB Mmul relative expression (percentile)</a></b></td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Proteomics</b></td>
             <td><b><a href="http://www.ebi.ac.uk/pride/archive/projects/PXD007774" target="_blank">E04 + E18 Proteomics Results at PRIDE</a></b></td> 
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
             <td><b><a href="http://www.metabolomicsworkbench.org/data/DRCCMetadata.php?Mode=Study&StudyID=ST000515" target="_blank">E04 Metabolomics Results at Metabolomics Workbench</a><br>
                    <a href="https://www.ebi.ac.uk/metabolights/MTBLS517" target="_blank">E04 Metabolomics Results at Metabolights</a>
                    </b></td>    
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
	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="15px" width="15px">&nbsp; &nbsp; 
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
     <img align="middle" src="images/MaHPIC_E04_Timeline.jpg" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E04_Timeline.jpg" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>


   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 04R: Resequencing of Experiment 04 functional genomics</a></h3> 
   <div class="wdk-toggle-content">
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE04R table, #ExpInfoE04R td, #ExpInfoE04R th, #ExpInfoE04R tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE04R {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE04R"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 04R: Experiment 04 Functional Genomics Resequencing - <i>Macaca mulatta</i> infected with <i>Plasmodium cynomolgi</i> B strain to produce clinical and omics measures of infection and relapse</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Malaria-naive male rhesus macaques (<i>Macaca mulatta</i>), approximately three years of age, were inoculated intravenously with salivary gland sporozoites produced and isolated at the Centers for Disease Control and Prevention from multiple <i>Anopheles</i> species (<i>An. dirus</i>, <i>An. gambiae</i>, and <i>An. stephensi</i>) and then profiled for clinical, hematological, parasitological, immunological, functional genomic, lipidomic, proteomic, and metabolomic measurements. The experiment was designed for 100 days, and pre- and post-100 day periods to prepare subjects and administer curative treatments respectively. The anti-malarial drug artemether was subcuratively administered selectively to several subjects during the primary parasitemia to suppress clinical complications and to all animals for curative treatment of blood-stage infections to allow detection of relapses. One subject was euthanized during the 100-day experimental period due to clinical complications. The anti-malarial drugs primaquine and chloroquine were administered to all remaining subjects at the end of the study for curative treatment of the liver and blood-stage infections, respectively. Capillary blood samples were collected daily for the measurement of CBCs, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis. Venous blood and bone marrow samples were collected at seven time points for functional genomic, proteomic, lipidomic, and immunological analyses. Within the MaHPIC, this project is known as 'Experiment 04R'. This dataset was produced by Yerkes Genomics Core. E04R is a 'resequencing' of the same samples from E04.  Resequencing for E04R was processed with SOPs and technology consistent with that used for E23R, E24, and  E25 so that results from these experiments could be reliably compared.  E04R does not replace E04, these are distinct datasets. Relative to E04, E04R is only for MaHPIC Yerkes Sequencing and Functional Genomics results.  Only E04R is intended for comparison with E23R, E24, and E25.The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC).</td>
           </tr>
         </table>
      </div>   
	 <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE04R table, #DataLinksE04R td, #DataLinksE04R th, #DataLinksE04R tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE04R {
           margin-left : 5 em;
           }
           
           #DataLinksE04R td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE04R"> 
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
                    <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE103507" target="_blank">E04R Results at NCBI's GEO</a><br></td>
             <td>N/A</td>
           </tr>
           </table>
           </div>
           
                <img align="middle" src="images/MaHPIC_E04_Timeline.jpg" height="300px" width="500px"><br>
                <a href="images/MaHPIC_E04_Timeline.jpg" target="_blank">View Larger Image</a><br>
    
           
<br><br>
	 
     
  </div>	
  </div>


   
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 06: Measures of acute primary infection in <i>Macaca mulatta</i> infected with <i>Plasmodium knowlesi</i> </a></h3> 
   <div class="wdk-toggle-content">
     
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE06 table, #ExpInfoE06 td, #ExpInfoE06 th, #ExpInfoE06 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE06 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE06"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 06: <i>Macaca mulatta</i> infected with <i>Plasmodium knowlesi</i> sporozoites to produce and integrate clinical, hematological, parasitological, omics, telemetric, and histopathological measures of acute primary infection.</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Telemetry devices (DSI, model L11) with blood pressure sensors and electrocardiogram (ECG) leads were surgically implanted in four malaria-naive male rhesus macaques (<i>Macaca mulatta</i>), approximately five years of age.  After a resting period of two weeks, physiological data that include activity, temperature, ECG, and blood pressure were continuously collected. Two weeks after activation of the telemetry implant, the macaques were inoculated intravenously with cryopreserved <i>P. knowlesi</i> Malayan strain salivary gland sporozoites, obtained from <i>Anopheles dirus</i> infected with parasites from the Pk1A+ clone and previously tested in E30 for their infectivity of macaques. The sporozoite stocks used were produced, isolated and cryopreserved at the Centers for Disease Control and Prevention, and then stored at Yerkes. After inoculation, the macaques were profiled longitudinally for clinical, hematological, parasitological, immunological, functional genomic, proteomic, and metabolomic measurements. The experiment was designed with pathology studies and thus terminal necropsies, which were scheduled at the log phase of the infections or at the peak of parasitemias. Capillary blood samples were collected daily for the measurement of complete blood counts, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomics analyses. Venous blood and bone marrow samples were collected at five timepoints for functional genomic, targeted proteomic, targeted metabolomics, and immunological analyses. Physiological data noted above were continuously captured via the implanted telemetry devices.  Within the MaHPIC, this project is known as 'Experiment 06'.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC) and the MRMC Office of Research Protection Animal Care and Use Review Office (ACURO).</td>
           </tr>
         </table>
      </div>   
      
      <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE06 table, #DataLinksE06 td, #DataLinksE06 th, #DataLinksE06 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE06 {
           margin-left : 5 em;
           }
           
           #DataLinksE06 td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE06"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB and HostDB</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><b><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_06/">E06 Clinical Data in PlasmoDB Downloads</b></a></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="https://www.ebi.ac.uk/metabolights/MTBLS824" target="_blank">E06 Quantitative Metabolomics Results at Metabolights</a><br>
                    </b></td>    
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Targeted Proteomics</b></td>
             <td><b><a href="/common/downloads/MaHPIC/Experiment_06/E06TargetedProteomics-Feb2019/" target="_blank">E06 Targeted Proteomics (SOMAScan) Data in PlasmoDB Downloads </a></b></td> 
             <td>N/A</td>
           </tr>
           <tr>
             <td><b>Telemetry</b></td>
             <td><b><a href="/common/downloads/MaHPIC/Experiment_06/" target="_blank">E06 Telemetry Data in PlasmoDB Downloads </a></b></td> 
             <td>N/A</td>
           </tr>
           </table>
           </div>
           
     <br><br>
	<!--   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="15px" width="15px">&nbsp; &nbsp; 
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
      --> 
     <img align="middle" src="images/MaHPIC_E06_Timeline.jpg" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E06_Timeline.jpg" target="_blank">View Larger Image</a><br>
       
  </div>	
  </div>


   
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 07: Measures of acute primary infection in <i>Macaca fascicularis</i> infected with <i>Plasmodium knowlesi</i>  </a></h3> 
   <div class="wdk-toggle-content">
     
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE07 table, #ExpInfoE07 td, #ExpInfoE07 th, #ExpInfoE07 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE07 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE07"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 07A and 07B:  <i>Macaca fascicularis</i> infected with <i>Plasmodium knowlesi</i> sporozoites to produce and integrate clinical, hematological, parasitological, omics, telemetric and histopathological measures of acute primary infection.</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>The E07 cohort was inoculated with freshly dissected <i>P. knowlesi</i> sporozoites on 11/01/16. However, for unexplained reasons blood-stage parasitemias did not occur. Consequently, the E07 cohort was reinoculated with cryopreserved <i>P. knowlesi</i> sporozoites. This inoculation was performed on 1/20/17.  Hence 'E07A' refers to samples and results from the failed inoculation from 11/01/16 and 'E07B' refers to samples and results from the successful inoculation on 1/20/17).<br>
                 Telemetry devices (DSI, model L11) with blood pressure sensors and electrocardiogram (ECG) leads were surgically implanted in seven malaria-naive male long-tailed macaques (<i>Macaca fascicularis</i>), approximately five years of age.  After a resting period of three weeks, the telemetry implants were turned on and physiological data that include activity, temperature, ECG, and blood pressure were continuously collected.  After the E07A failed infection using a fresh preparation of salivary gland sporozoites, the implants were deactivated to preserve battery life. Between E07A and E07B, a single rhesus macaque (<i>M. mulatta</i>) was added to the cohort as an infection control with no telemetry implant.  At the start of E07B, telemetry implants were reactivated.  Ten days after reactivation all animals were inoculated intravenously with cryopreserved <i>P. knowlesi</i> Malayan strain salivary gland sporozoites, obtained from <i>Anopheles dirus</i> infected with parasites from the Pk1A+ clone and previously tested in E30 for their infectivity of macaques. The sporozoite stocks used were produced, isolated and cryopreserved at the Centers for Disease Control and Prevention, and then stored at Yerkes.  After inoculation, the macaques were profiled for clinical, hematological, parasitological, immunological, functional genomic, proteomic, and metabolomic measurements.  The experiment was designed with pathology studies and thus terminal necropsies, which were scheduled at the log phase of the infection, at the peak of parasitemias, at the middle of the chronic phase, or at the end of the follow-up period of 45 days after the inoculation of the sporozoites.  Capillary blood samples were collected daily for the measurement of complete blood counts (CBCs), reticulocytes, and parasitemias.  Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis.  Venous blood and bone marrow samples were collected at six time points for functional genomic, targeted proteomic, targeted metabolomics, and immunological analyses.  Physiological data noted above were continuously captured via telemetry. Within the MaHPIC, this project is known as 'Experiment 07 (E07A and 07B)'.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC) and the MRMC Office of Research Protection Animal Care and Use Review Office (ACURO).</td>
           </tr>
         </table>
      </div>   
      
      <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE07 table, #DataLinksE07 td, #DataLinksE07 th, #DataLinksE07 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE07 {
           margin-left : 5 em;
           }
           
           #DataLinks td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE07"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB and HostDB</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><b><a href="/common/downloads/MaHPIC/Experiment_07/E07AMalariaCore/">E07A Clinical Data in PlasmoDB Downloads</b></a></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><b><a href="/common/downloads/MaHPIC/Experiment_07/E07BMalariaCore/">E07B Clinical Data in PlasmoDB Downloads</b></a></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="https://www.ebi.ac.uk/metabolights/MTBLS822" target="_blank">E07 Quantitative Metabolomics Results at MetaboLights</a>
                    </b></td>    
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Targeted Proteomics</b></td>
             <td><b><a href="/common/downloads/MaHPIC/Experiment_07/E07TargetedProteomics-Feb2019/" target="_blank">E07 Targeted Proteomics (SOMAScan) Data in PlasmoDB Downloads </a></b></td> 
             <td>N/A</td>
           </tr>
           <tr>
             <td><b>Telemetry</b></td>
             <td><b><a href="/common/downloads/MaHPIC/Experiment_07/" target="_blank">E07 Telemetry Data in PlasmoDB Downloads </a></b></td> 
             <td>N/A</td>
           </tr>
          </table>
          </div>
          
     <br><br>
	<!--   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="15px" width="15px">&nbsp; &nbsp; 
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
      --> 
     <img align="middle" src="images/MaHPIC_E07_Timeline.jpg" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E07_Timeline.jpg" target="_blank">View Larger Image</a><br>
       
  </div>	
  </div>

  
  
     <div class="wdk-toggle" data-show="false">
     <h3 class="wdk-toggle-name"> <a href="#">Experiment 13: Control measures from uninfected <i>M. mulatta</i> exposed to pyrimethamine</a></h3>
     <div class="wdk-toggle-content">
     
     
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
      
      <br><br>
     
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
             <td><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_13/"><b>E13 Clinical Data in PlasmoDB Downloads</b></a></td>
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
	  
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px">  <img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px">
	     Comparative transcriptomics and metabolomics in a rhesus macaque drug administration study. <a href="https://www.ncbi.nlm.nih.gov/pubmed/25453034" target="_blank">Lee et al. Front Cell Dev Biol. 2014 Oct 8;2:54</a>
        </div>
        <br><br>
     <img align="middle" src="images/MaHPIC_E13_Timeline.jpg" height="270px" width="550px"><br>
     <a href="images/MaHPIC_E13_Timeline.jpg" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>

  
     <div class="wdk-toggle" data-show="false">
     <h3 class="wdk-toggle-name"> <a href="#">Experiment 15: Measures of primary infection and relapse in <i>Aotus nancymaae</i> infected with <i>Plasmodium vivax</i></a></h3>
     <div class="wdk-toggle-content">
     
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE15 table, #ExpInfoE15 td, #ExpInfoE15 th, #ExpInfoE15 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE15 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE15"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 15: <i>Aotus nancymaae</i> infected with <i>P. vivax</i> Brazil VII to produce clinical and omics measures of primary infections and relapses.</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Malaria-naive <i>Aotus nancymaae</i> were inoculated intravenously with salivary gland sporozoites produced and isolated at the Centers for Disease Control and Prevention from multiple <i>Anopheles</i> species (<i>An. gambiae</i>, <i>An. stephensi</i>, and <i>An. freeborni</i>) then profiled for clinical, hematological, parasitological, immunological, functional genomic, and metabolomic measurements. The experiment was performed for 121 days. The first inoculation attempt was virtually unsuccessful as only one of seven animals developed blood-stage infection. This animal was treated for the blood-stage infection.  All animals were re-challenged approximately one month later. Upon re-challenge all animals developed blood-stage infections with similar parasitological kinetics. After infections became chronic, the anti-malarial drug artemether was administered to curatively treat blood-stage infections. No sub-curative treatments were administered during this study because none of the animals developed severe disease. At the end of the study, the anti-malarial drugs primaquine and chloroquine were administered to all animals for curative treatment of the liver and blood-stage infections, respectively. Venous blood samples were collected only on clinically determined 'timepoint' days for the measurement of CBCs, reticulocytes, parasitemias, and downstream omics and immunological analyses. Small sample volumes were collected daily or every other day for the measurement of parasitemia. Within the MaHPIC, this project is known as 'Experiment 15'.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC).</td>
           </tr>
         </table>
      </div>  
      
      <br><br>
     
       <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE15 table, #DataLinksE15 td, #DataLinksE15 th, #DataLinksE15 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE15 {
           margin-left : 5 em;
           }
           
           #DataLinksE15 td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE15"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_15/"><b>E15 Clinical Data in PlasmoDB Downloads</b></a></td>
             <td>N/A</td>
           </tr>
         
     <!--  <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b><a href="https://www.ncbi.nlm.nih.gov/bioproject/?term=PRJNA368917" target="_blank">MaHPIC Umbrella BioProject</a><br>
                    <a href="https://trace.ncbi.nlm.nih.gov/Traces/sra/?study=SRP043059" target="_blank">E13 Sequence data at NCBI's SRA</a><br>
                    <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE58340" target="_blank">E13 Expression Results at NCBI's GEO</a></b></td>   
             <td>N/A</td>
           </tr>
       
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Proteomics</b></td>
             <td><b><a href="https://www.ebi.ac.uk/pride/archive/projects/PXD007773" target="_blank">XXXE</a><br>
                    <a href="http://www.ebi.ac.uk/pride/archive/projects/PXD007774" target="_blank">XXX</a>
                    </b></td> 
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"> <b>Lipidomics</b></td>
             <td><b><a href="http://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=c7e41c86aa6e4b15bc89b27a72fc9158" target="_blank">XXX</a></b></td>
             <td>N/A</td>
             </tr>
           -->
           <tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"> <b>Immune Profiling</b></td>
             <td><b><a href="http://www.immport.org/immport-open/public/study/study/displayStudyDetail/SDY1424" target="_blank">E15 Immune Results at ImmPort</a></b></td>
             <td>N/A</td>
           </tr>
      <!--     <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="http://www.metabolomicsworkbench.org/data/DRCCMetadata.php?Mode=Study&StudyID=ST000592" target="_blank">XXX</a></b></td> 
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"> <b>Computational Modeling</b></td>
             <td><b>Coming soon</b></td>
             <td>N/A</td>
           </tr>
         -->  
           </table>
           </div>
     <br><br>
	<!--  
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px">  <img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px">
	     Comparative transcriptomics and metabolomics in a rhesus macaque drug administration study. <a href="https://www.ncbi.nlm.nih.gov/pubmed/25453034" target="_blank">Lee et al. Front Cell Dev Biol. 2014 Oct 8;2:54</a>
        </div>
        <br><br>
    -->
     <img align="middle" src="images/MaHPIC_E15_Timeline.jpg" height="270px" width="550px"><br>
     <a href="images/MaHPIC_E15_Timeline.jpg" target="_blank">View Larger Image</a><br>

        
  </div>	
  </div> 
  
  
     <div class="wdk-toggle" data-show="false">
     <h3 class="wdk-toggle-name"> <a href="#">Experiment 18: Control measures from uninfected <i>M. mulatta</i> exposed to artemether</a></h3>
     <div class="wdk-toggle-content">
     
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE18 table, #ExpInfoE18 td, #ExpInfoE18 th, #ExpInfoE18 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE18 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE18"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 18: Uninfected <i>Macaca mulatta</i> exposed to artemether to produce and integrate clinical, hematological, and omics control measures.</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>An uninfected, malaria-naive, male rhesus macaque (<i>Macaca mulatta</i>), approximately two years of age, was inoculated intravenously with a preparation of salivary gland material derived from non-infected <i>Anopheles dirus</i> and profiled for clinical, hematological, functional genomic, and proteomic measurements. Samples were generated and analyzed to investigate the effects of the pharmacological intervention with the anti-malarial drug artemether on normal individuals. The experiment was designed for 100 days, with artemether administered at three different time points to coincide with the predicted subcurative or curative treatment days of experimentally infected rhesus macaques. Capillary blood samples were collected daily for the measurement of CBCs and reticulocytes. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis. Venous blood samples and bone marrow aspirates were collected at seven-time points before and after three rounds of drug administration for functional genomic and proteomic analyses.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC).</td>
           </tr>
         </table>
      </div>  
      
      <br><br>
     
       <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE18 table, #DataLinksE18 td, #DataLinksE18 th, #DataLinksE18 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE18 {
           margin-left : 5 em;
           }
           
           #DataLinksE18 td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE18"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
     <!--      <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_13/"><b>E13 Clinical Data in PlasmoDB Downloads</b></a></td>
             <td>N/A</td>
           </tr>
         -->
     <!--  <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b><a href="https://www.ncbi.nlm.nih.gov/bioproject/?term=PRJNA368917" target="_blank">MaHPIC Umbrella BioProject</a><br>
                    <a href="https://trace.ncbi.nlm.nih.gov/Traces/sra/?study=SRP043059" target="_blank">E13 Sequence data at NCBI's SRA</a><br>
                    <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE58340" target="_blank">E13 Expression Results at NCBI's GEO</a></b></td>   
             <td>N/A</td>
           </tr>
        -->
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Proteomics</b></td>
             <td><b><a href="https://www.ebi.ac.uk/pride/archive/projects/PXD007773" target="_blank">E18 + E03 Proteomics Results at PRIDE</a><br>
                    <a href="http://www.ebi.ac.uk/pride/archive/projects/PXD007774" target="_blank">E18 + E04 Proteomics Results at PRIDE</a>
                    </b></td> 
             <td>N/A</td>
           </tr>
      <!--   <tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"> <b>Lipidomics</b></td>
             <td><b><a href="http://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=c7e41c86aa6e4b15bc89b27a72fc9158" target="_blank">E13 Lipidomics Results at MassIVE </a></b></td>
             <td>N/A</td>
             </tr>
           -->
      <!-- Susanne removed Immunomics on purpose.  This experiment will not have immunomics data-->
      <!--     <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="http://www.metabolomicsworkbench.org/data/DRCCMetadata.php?Mode=Study&StudyID=ST000592" target="_blank">E13 Metabolomics Results at Metabolomics Workbench </a></b></td> 
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"> <b>Computational Modeling</b></td>
             <td><b>Coming soon</b></td>
             <td>N/A</td>
           </tr>
         -->  
           </table>
           </div>
     <br><br>
	<!--  
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px">  <img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px">
	     Comparative transcriptomics and metabolomics in a rhesus macaque drug administration study. <a href="https://www.ncbi.nlm.nih.gov/pubmed/25453034" target="_blank">Lee et al. Front Cell Dev Biol. 2014 Oct 8;2:54</a>
        </div>
        <br><br>
     <img align="middle" src="images/MaHPIC_E13_Timeline.png" height="270px" width="550px"><br>
     <a href="images/MaHPIC_E13_Timeline.png" target="_blank">View Larger Image</a><br>
    -->
        
  </div>	
  </div>  
  
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 23: Iterative measures of infection and relapse in <i>M. mulatta</i> infected with <i>P. cynomolgi</i> B strain</a> </h3> 
   <div class="wdk-toggle-content">
     
     
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
	 <br><br>
     
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
             <td><b><a href="/common/downloads/MaHPIC/Experiment_23/">E23 Clinical Data in PlasmoDB Downloads</b></a></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b>Coming Soon</b></td>  <!--<br> <a href="https://www.ncbi.nlm.nih.gov/sra" target="_blank">E23 Sequence data at NCBI's SRA</a><br><a href="https://www.ncbi.nlm.nih.gov/geo/" target="_blank">E03 Expression Results on NCBI's GEO</a><br><a href="https://www.ncbi.nlm.nih.gov/bioproject/XXX" target="_blank">E23 BioProject record at NCBI</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Proteomics</b></td>
             <td><b><a href="http://www.ebi.ac.uk/pride/archive/projects/PXD007775" target="_blank">E23 Proteomics Results at PRIDE</a></b></td> 
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Targeted Proteomics</b></td>
             <td><b><a href="/common/downloads/MaHPIC/Experiment_23/" target="_blank">E23 Targeted Proteomics (SOMAScan) Data in PlasmoDB Downloads </a></b></td> 
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"> <b>Lipidomics</b></td>
             <td><b><a href="http://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=9dce6369a6c14b23b77b55825e5dd61d" target="_blank">E23 Lipidomics Results at MassIVE</a></b></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"> <b>Immune Profiling</b></td>
             <td><b><a href="http://www.immport.org/immport-open/public/study/study/displayStudyDetail/SDY1409" target="_blank">E23 Immune Results at ImmPort</a></b></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="https://www.ebi.ac.uk/metabolights/MTBLS542" target="_blank">E23 Metabolomics Results at Metabolights</a>  </b></td>  
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
	 
<!--	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
  -->
     <br><br> 
     <img align="middle" src="images/MaHPIC_E23_Timeline.jpg" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E23_Timeline.jpg" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>  

 
    <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 23R: Resequencing of Experiment 23 Functional Genomics</a> </h3> 
   <div class="wdk-toggle-content">
     
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE23R table, #ExpInfoE23R td, #ExpInfoE23R th, #ExpInfoE23R tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE23R {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE23R"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 23R: Experiment 23 Functional Genomics Resequencing - <i>Macaca mulatta</i> infected with <i>Plasmodium cynomolgi</i> B strain to produce and integrate clinical, hematological, parasitological, and omics measures of acute primary infection and relapses.</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Malaria-naive male rhesus macaques (<i>Macaca mulatta</i>), approximately four years of age, were inoculated intravenously with salivary gland sporozoites produced and isolated at the Centers for Disease Control and Prevention from multiple Anopheles species (<i>An. dirus</i>, <i>An. gambiae</i>, and <i>An. stephensi</i>) and then profiled for clinical, hematological, parasitological, immunological, functional genomic, lipidomic, proteomic, and metabolomic measurements. The experiment was designed for about 100 days, with pre- and post-100 day periods to prepare subjects and administer curative treatments respectively. During the 100-day period subjects experienced periods of patent and sub-patent infection. The anti-malarial drug artemether was subcuratively administered to subjects after the initial peak of infection, if subjects were not able to self-resolve.  Blood-stage curative artemether was administered to all subjects following peak infection, and following a period of relapse infection.  All peaks were clinically determined for each subject.  The anti-malarial drugs primaquine and chloroquine were administered to all subjects at the end of the study for curative treatment of the liver and blood-stage infections, respectively.  Capillary blood samples were collected daily for the measurement of CBCs, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis. Venous blood and bone marrow samples were collected at seven time points for functional genomic, proteomic, lipidomic, and immunological analyses.  E23 is an iteration of Experiment 04 with the same parasite-host combination.  E23 is the first in a series of experiments that includes subsequent homologous (Experiment 24, <i>P. cynomolgi</i> B strain) and heterologous (Experiment 25, <i>P. cynomolgi</i> strain ceylonensis) challenges of individuals from the E23 cohort.  Note that one E23 subject was not included in subsequent experiments due to persistent behavioral issues that prevented sample collection.  Within the MaHPIC, this project is known as 'Experiment 23R'.  E23R is a 'resequencing' of all samples from E23, processed with SOPs and technology consistent with that used for E04R, E24, and E25 so that results from these experiments could be reliably compared.  Only E23R is intended for comparison with E04R, E24, and E25.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC).</td>
           </tr>
         </table>
      </div>   
	 <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE23R table, #DataLinksE23R td, #DataLinksE23R th, #DataLinksE23R tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE23R {
           margin-left : 5 em;
           }
           
           #DataLinksE23R td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE23R"> 
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
             <td><b><a href="https://www.ncbi.nlm.nih.gov/bioproject/?term=PRJNA368917" target="_blank">MaHPIC Umbrella BioProject</a><br>
                    <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE104223" target="_blank">E23R Expression Results at NCBI's GEO</a></b></td>
             <td>N/A</td>
           </tr>
           </table>
           </div>
     <br><br>
	 
<!--	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
  -->
     <br><br> 
     <img align="middle" src="images/MaHPIC_E23_Timeline.jpg" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E23_Timeline.jpg" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>  
 
 
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 24: Iterative measures of infection and relapse in <i>M. mulatta</i> infected with <i>P. cynomolgi</i> B strain, in a homologous challenge</a> </h3> 
   <div class="wdk-toggle-content">
     
     
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
             <td>Male rhesus macaques (<i>Macaca mulatta</i>), cleared of previous infection with <i>P. cynomolgi</i> B strain via treatment with 
                 the anti-malarial drugs artemether, chloroquine, and primaquine,  approximately five years of age, were inoculated intravenously 
                 with salivary gland sporozoites produced and isolated at the Centers for Disease Control and Prevention from multiple <i>Anopheles</i> 
                 species (<i>An. dirus</i>, <i>An. gambiae</i>, and <i>An. stephensi</i>) and then profiled for clinical, hematological, parasitological, 
                 immunological, functional genomic, lipidomic, and metabolomic measurements. 
                 The experiment included, 1 pre-inoculation day, 35 experiment days, and 10 post-experiment days. The anti-malarial drugs primaquine and 
                 chloroquine were administered to all subjects at the end of the study for curative treatment of the liver and blood-stage infections, respectively.  Capillary blood samples were collected daily for the measurement of CBCs, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis. Venous blood samples were collected at three time points for functional genomic, lipidomic, and immunological analyses. Within the MaHPIC, this project is known as 'Experiment 24'.  This is the second in a series of experiments that includes infection of malaria-naive subjects (Experiment 23, <i>P. cynomolgi</i> B strain) and heterologous challenge (Experiment 25, <i>P. cynomolgi</i> strain ceylonensis) for the individuals from the same cohort.  This dataset was produced by Alberto Moreno at Emory University.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC). </td>
           </tr>
         </table>
      </div>   
      <br><br>
     
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
             <td><b><a href="https://www.ncbi.nlm.nih.gov/bioproject/?term=PRJNA368917">MaHPIC Umbrella BioProject</b></a><br>
                 <b><a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE104101">E24 Expression Results at NCBI's GEO</a></b></td>  
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"> <b>Immune Profiling</b></td>
             <td><b><a href="http://www.immport.org/immport-open/public/study/study/displayStudyDetail/SDY1409" target="_blank">E24 Immune Results at ImmPort</a></b></td>
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
	 
	 
<!--	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
  -->
     <br><br> 
     <img align="middle" src="images/MaHPIC_E24_Timeline.jpg" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E24_Timeline.jpg" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>  

   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 25: Iterative measures of infection and relapse in <i>M. mulatta</i> infected with <i>P. cynomolgi</i> strain ceylonensis, in a heterologous challenge </a> </h3> 
   <div class="wdk-toggle-content">
     
     
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
             <td>Male rhesus macaques (<i>Macaca mulatta</i>), cleared of previous infection with  <i>P. cynomolgi</i> B strain via treatment with 
                 the anti-malarial drugs artemether, chloroquine, and primaquine,  approximately five years of age, were inoculated intravenously 
                 with salivary gland sporozoites produced and isolated at the Centers for Disease Control and Prevention from multiple <i>Anopheles</i> 
                 species (<i>An. dirus</i>, <i>An. gambiae</i>, and <i>An. stephensi</i>) and then profiled for clinical, hematological, parasitological, 
                 immunological, functional genomic, lipidomic, proteomic, and metabolomic measurements. 
                 The experiment included, 8 pre-inoculation days, 49 experiment days, and 4 post-experiment days. The anti-malarial drug artemether was subcuratively administered to subjects at the initial peak of infection, if subjects were not 
                 able to self-resolve their parasitemias.  Peak infection was determined clinically for each subject.  The anti-malarial drugs primaquine and chloroquine were administered to all subjects at the end of the study for curative treatment of the liver and blood-stage infections, respectively.  Capillary blood samples were collected daily for the measurement of CBCs, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis. Venous blood samples were collected at five time points for functional genomic, lipidomic, proteomic, and immunological analyses. Within the MaHPIC, this project is known as 'Experiment 25'.  This is the third and final of a series of experiments that includes infection of malaria-naive subjects (Experiment 23, <i>P. cynomolgi</i> B strain) and homologous challenge (Experiment 24, <i>P. cynomolgi</i> B strain) of individuals from the same cohort.  This dataset was produced by Alberto Moreno at Emory University.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC). </td>
           </tr>
         </table>
      </div>   
	 <br><br>
     
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
           
           #DataLinksE25 td {vertical-align: middle;}
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
             <td><b><a href="https://www.ncbi.nlm.nih.gov/bioproject/?term=PRJNA368917" target="_blank">MaHPIC Umbrella BioProject</a><br>
                 <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE104330" target="_blank">E25 Expression Results at NCBI's GEO</a></b>
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
             <td><b><a href="http://www.immport.org/immport-open/public/study/study/displayStudyDetail/SDY1409" target="_blank">E25 Immune Results at ImmPort</a></b></td> 
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
	 
<!--	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>
  -->
     <br><br> 
     <img align="middle" src="images/MaHPIC_E25_Timeline.jpg" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E25_Timeline.jpg" target="_blank">View Larger Image</a><br>
    
        
  </div>	
  </div>  

   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 30: Measures of acute infection of <i>M. mulatta</i> infected with <i>P. knowlesi</i>, pilot collection of telemetry data</a> </h3> 
   <div class="wdk-toggle-content">
     
     
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
             <td>Experiment 30: Pilot experiment for <i>Macaca mulatta</i> infected with <i>Plasmodium knowlesi</i> Malayan strain sporozoites to produce and integrate clinical, hematological, parasitological, omics, telemetric and histopathological measures of acute primary infection. </td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Telemetry devices (DSI, model L11) with blood pressure sensors and electrocardiogram (ECG) leads were surgically implanted in two malaria-naive male rhesus macaques (<i>Macaca mulatta</i>), approximately three years of age.  After a resting period of two weeks, physiological data that include activity, temperature, ECG, and blood pressure were continuously collected.  Two weeks after activation of the telemetry implant, the macaques were inoculated intravenously with cryopreserved <i>P. knowlesi</i> Malayan strain salivary gland sporozoites, obtained from <i>Anopheles dirus</i> infected with parasites from the Pk1A+ clone. The <i>P. knowlesi</i> sporozoites were produced, isolated and cryopreserved at the Centers for Disease Control and Prevention.  After inoculation, the macaques were profiled for clinical, hematological, parasitological, immunological, functional genomic, lipidomic, proteomic, metabolomic, telemetric and histopathological measurements. The experiment was designed for pathology studies, with terminal necropsies on days 11 (RKy15) or 19 (Red16).  The anti-malarial drug artemether was subcuratively administered selectively to one subject (REd16) during the primary parasitemia to suppress clinical complications. Capillary blood samples were collected daily for the measurement of complete blood counts, reticulocytes, and parasitemias. Capillary blood samples were collected every other day to obtain plasma for metabolomic analysis. Venous blood and bone marrow samples were collected at five timepoints for functional genomic, proteomic, lipidomic, and immunological analyses. Physiological data were continuously captured via telemetry.  Within the MaHPIC, this project is known as 'Experiment 30'.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC) and the MRMC Office of Research Protection Animal Care and Use Review Office (ACURO).
                  </td>
           </tr>
         </table>
      </div>   
	 <br><br>
     
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
             <td><a href="/common/downloads/MaHPIC/Experiment_30/"><b>E30 Clinical Data in PlasmoDB Downloads</b></a></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td><b>Coming Soon</b></td>  <!--<br> <a href="https://www.ncbi.nlm.nih.gov/sra" target="_blank">E30 Sequence data at NCBI's SRA</a><br><a href="https://www.ncbi.nlm.nih.gov/geo/" target="_blank">E25 Expression Results on NCBI's GEO</a><br><a href="https://www.ncbi.nlm.nih.gov/bioproject/XXX" target="_blank">E25 BioProject record at NCBI</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Targeted Proteomics</b></td>
             <td><b><a href="/common/downloads/MaHPIC/Experiment_30/" target="_blank">E30 Targeted Proteomics (SOMAScan) Data in PlasmoDB Downloads </a></b></td> 
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"> <b>Lipidomics</b></td>
             <td><b><a href="http://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=c009507d03e7401b8231912ada653b75" target="_blank">E30 Lipidomics Results at MassIVE </a><b>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"> <b>Immune Profiling</b></td>
             <td><b>Coming Soon</b></td>  <!--<br><a href="https://immport.niaid.nih.gov/immportWeb/home/home.do?loginType=full" target="_blank">E25 Immune Profiles at NIAID's ImmPort</a>-->
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><b><a href="https://www.ebi.ac.uk/metabolights/MTBLS536" target="_blank">E30 Metabolomics Results at MetaboLights</a><br>
                    <a href="https://www.ebi.ac.uk/metabolights/MTBLS821" target="_blank">E30 Quantitative Metabolomics Results at MetaboLights</a>  </b></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"> <b>Computational Modeling</b></td>
             <td><b>Coming soon</b></td>
             <td>N/A</td>
           </tr>
           <tr>
             <td> <b>Telemetry</b></td>
             <td><<b><a href="https://www.ebi.ac.uk/metabolights/MTBLS536" target="_blank">E30 Telemetry Data in PlasmoDB Downloads</a></td>
             <td>N/A</td>
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
     <img align="middle" src="images/MaHPIC_E30_Timeline.jpg" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E30_Timeline.jpg" target="_blank">View Larger Image</a><br>

        
  </div>	
  </div>  

<div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 33: Mixed cohort of <i>Macaca mulatta</i> and <i>Macaca fascicularis</i> infected with <i>Plasmodium knowlesi</i> Malayan strain to study actute infection.</a> </h3> 
   <div class="wdk-toggle-content">
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfo33 table, #ExpInfo33 td, #ExpInfo33 th, #ExpInfo33 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfo33 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfo33"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 33: Mixed cohort of <i>Macaca mulatta</i> and <i>Macaca fascicularis</i> infected with <i>Plasmodium knowlesi</i> Malayan strain sporozoites to produce and integrate clinical, hematological, parasitological, omics, and histopathological measures of acute primary infection.</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>A mixed cohort of six malaria-naive male <i>Macaca mulatta</i> (n=2) and <i>Macaca fascicularis</i> (n=4) were inoculated intravenously with <i>P. knowlesi</i> Malayan strain cryo-preserved salivary gland sporozoites, obtained from <i>Anopheles dirus</i> infected with parasites from the Pk1A+ clone and previously confirmed in E30, E06 and E07 for their infectivity of macaques. The <i>P. knowlesi</i> sporozoites stocks had been generated, isolated and cryopreserved at the Centers for Disease Control and Prevention, and then stored at Yerkes. The experiment was designed to contain one baseline time point seven days prior to sporozoite inoculation, six time points after inoculation and terminal necropsies (for pathology studies) scheduled after peaking parasitemias. Venous whole blood and bone marrow aspirate samples were collected at time points to profile for clinical, hematological, parasitological, immunological, functional genomics, proteomics, and metabolomics measurements. A single sub-curative dose of chloroquine was administered via I.M. to the M. mulatta animals at the rise of the infection to dampen the high predictably lethal parasitemias in this species. A subsequent time point was collected to examine the effect of chloroquine on host pathways and whether the <i>M. mulatta</i> host responses became similar to the naturally controlling <i>M. fascicularis</i> host responses. Daily collection of capillary samples was performed for the clinical measurement of complete blood counts, reticulocytes, parasitemias and for sample banking. Within the MaHPIC, this project is known as 'Experiment 33'. This dataset was produced by Monica Cabrera-Mora and Chester J Joyner at the Yerkes Primate Research Center at Emory University.  To access other publicly available results from 'E33' and other MaHPIC Experiments, including clinical results (specifics on drugs administered, diet, and veterinary interventions), and other omics, visit <a href="http://plasmodb.org/plasmo/mahpic.jsp">http://plasmodb.org/plasmo/mahpic.jsp</a>. This page will be updated as datasets are released to the public.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC) and the MRMC Office of Research Protection Animal Care and Use Review Office (ACURO).</td>
           </tr>
         </table>
      </div>   
      <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinks33 table, #DataLinks33 td, #DataLinks33 th, #DataLinks33 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinks33 {
           margin-left : 5 em;
           }
           
           #DataLinks33 td {vertical-align: middle;}
         </style> 
         <table id="DataLinks33"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_33/"><b>E33 Clinical Data in PlasmoDB Downloads</b></a></td>
             <td>N/A</td>
           </tr>
           
           </tr>
           </table>
           </div>
<br><br>
</div>
</div>

   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 34: Control necropsy of a mixed cohort of <i>Macaca mulatta</i> and <i>Macaca fascicularis</i></a> </h3> 
   <div class="wdk-toggle-content">
     
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoE34 table, #ExpInfoE34 td, #ExpInfoE34 th, #ExpInfoE34 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoE34 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoE34"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 34: Control necropsy of a mixed cohort of <i>Macaca mulatta</i> and <i>Macaca fascicularis</i> to produce a set of normal clinical, hematological, immunological and omics measures, and normal tissue samples for histological comparison</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>A mixed cohort of six malaria-naive male <i>Macaca mulatta</i> (n=3) and <i>Macaca fascicularis</i> (n=3) were necropsied to provide normal tissue samples as controls for the analysis of MaHPIC infection experiments involving these macaque species. Venous whole blood and bone marrow aspirate samples were collected at necropsy to profile clinical, hematological, immune response and functional genomics measurements. Plasma samples were also banked for proteomics and metabolomics measurements, rectal swabs for microbiome studies, and a panel of tissue samples for histological comparisons. Within the MaHPIC, this project is known as 'Experiment 34'. This dataset was produced by Monica Cabrera-Mora at Emory University. To access other publicly available results from E34 and other MaHPIC experiments, including clinical results (specifics on drugs administered, diet, and veterinary interventions), and other omics, visit <a href="http://plasmodb.org/plasmo/mahpic.jsp" target="_blank">http://plasmodb.org/plasmo/mahpic.jsp</a>.  This page will be updated as datasets are released to the public.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC) and the MRMC Office of Research Protection Animal Care and Use Review Office (ACURO).</td>
           </tr>
         </table>
      </div>   
	 <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksE34 table, #DataLinksE34 td, #DataLinksE34 th, #DataLinksE34 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksE34 {
           margin-left : 5 em;
           }
           
           #DataLinksE34 td {vertical-align: middle;}
         </style> 
         <table id="DataLinksE34"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_34/"><b>E34 Clinical Data in PlasmoDB Downloads</b></a></td>
             <td>N/A</td>
           </tr>
           
           </table>
           </div>
	   <br><br>
<!--	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
        <p>

  -->
  </div>	
  </div>  



<div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 35: Mixed cohort of <i>Macaca mulatta</i> and <i>Macaca fascicularis</i> infected with <i>Plasmodium knowlesi</i> Malayan strain to study chronic infection.</a> </h3> 
   <div class="wdk-toggle-content">
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfo35 table, #ExpInfo35 td, #ExpInfo35 th, #ExpInfo35 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfo35 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfo35"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 33: Mixed cohort of <i>Macaca mulatta</i> and <i>Macaca fascicularis</i> infected with <i>Plasmodium knowlesi</i> Malayan strain sporozoites to produce and integrate clinical, hematological, parasitological, omics, and histopathological measures of acute primary infection.</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>A mixed cohort of seven malaria-naive male <i>Macaca mulatta</i> (n=3) and <i>Macaca fascicularis</i> (n=4) were inoculated intravenously with <i>P. knowlesi</i> Malayan strain cryo-preserved salivary gland sporozoites, obtained from Anopheles dirus infected with parasites from the Pk1A+ clone and previously confirmed in E30, E06, E07, and E34 for their infectivity of macaques. The P. knowlesi sporozoites stocks had been generated, isolated and cryopreserved at the Centers for Disease Control and Prevention, and then stored at Yerkes. The experiment was designed to contain two baseline time points at days -13 and -42 prior to sporozoite inoculation, four (<i>M. mulatta</i>) or six (<i>M. fascicularis</i>) time points after inoculation, plus terminal necropsies (for pathology studies) scheduled between days 48-50 at a time when all animals had chronic infections. Venous whole blood and bone marrow aspirate samples were collected at all time points for clinical, hematological, parasitological, immunological, functional genomics, proteomics, and metabolomics measurements, or sample storage for future testing. Sub-curative doses of artemether were administered via I.M. to the <i>M. mulatta</i> animals at the initial high parasitemia and subsequent lower rises of parasitemias when necessary to dampen the parasitemias and allow a chronic infection to develop. No subcurative doses of artemether were needed for the <i>M. fascicularis</i>, which naturally controlled their parasitemias from the time of the first rise of parasites in the blood. Daily collection of capillary samples was performed for the clinical measurement of complete blood counts, reticulocytes, and parasitemias, and for sample banking.  Within the MaHPIC, this project is known as 'Experiment 35'. This dataset was produced by Monica Cabrera-Mora at Emory University. To access other publicly available results from E35 and other MaHPIC experiments, including clinical results (specifics on drugs administered, diet, and veterinary interventions), and other omics, visit <a href="http://plasmodb.org/plasmo/mahpic.jsp">http://plasmodb.org/plasmo/mahpic.jsp</a>.  This page will be updated as datasets are released to the public.  The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC) and the MRMC Office of Research Protection Animal Care and Use Review Office (ACURO).
</td>
           </tr>
         </table>
      </div>   
      <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinks35 table, #DataLinks35 td, #DataLinks35 th, #DataLinks35 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinks35 {
           margin-left : 5 em;
           }
           
           #DataLinks35 td {vertical-align: middle;}
         </style> 
         <table id="DataLinks35"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_35/"><b>E35 Clinical Data in PlasmoDB Downloads</b></a></td>
             <td>N/A</td>
           </tr>
           
           </tr>
           </table>
           </div>
<br><br>
</div>
</div>



   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Supporting Experiment 05: Investigation of <i>P. vivax</i> trophozoite-schizont transition proteome</a> </h3> 
   <div class="wdk-toggle-content">
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfoS05 table, #ExpInfoS05 td, #ExpInfoS05 th, #ExpInfoS05 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfoS05 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfoS05"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Supporting Experiment 05: Investigation of <i>P. vivax</i> trophozoite-schizont transition proteome</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>The apicomplexan parasite <i>Plasmodium vivax</i> reportedly caused 13.8 million cases of vivax malaria in 2015. Much of the unique biology of this pathogen remains unknown. To expand our proteomics interrogation of the blood-stage interaction with its host animal model <i>Saimiri boliviensis</i>, we analyzed the proteome of infected host reticulocytes undergoing transition from the trophozoite to schizont stages. Two biological replicates analyzed using five database search engines identified 1923 <i>P. vivax</i> and 3188 <i>S. boliviensis</i> proteins.  Within the MaHPIC, this project is known as 'Integral Supporting Project 05 (S05)'.   This dataset was produced by Dave Anderson at SRI International. </td>
           </tr>
         </table>
      </div>   
      <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinksS05 table, #DataLinksS05 td, #DataLinksS05 th, #DataLinksS05 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinksS05 {
           margin-left : 5 em;
           }
           
           #DataLinksS05 td {vertical-align: middle;}
         </style> 
         <table id="DataLinksS05"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Proteomics</b></td>
             <td><b><a href="http://www.ebi.ac.uk/pride/archive/projects/PXD005769" target="_blank">S05 Proteomics Results at PRIDE</a></b></td>
             <td>N/A</td>
           </tr>
           </tr>
           </table>
           </div>
<br><br>
	 
	 
	   
	 <h4>Publication(s)</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Proteomics_Core.jpg" height="15px" width="15px">&nbsp; &nbsp;
	     A large scale <i>Plasmodium vivax</i>- <i>Saimiri boliviensis</i> trophozoite-schizont transition proteome.  <a href="http://europepmc.org/abstract/MED/28829774" target="_blank">Anderson et al. PLoS One. 2017 12(8):e0182561</a>
        </div>
        <p>

<!-- 
     <br><br> 
     <img align="middle" src="images/MaHPIC_E30_Timeline.png" height="300px" width="500px"><br>
     <a href="images/MaHPIC_E30_Timeline.png" target="_blank">View Larger Image</a><br>
  -->
        
  </div>	
  </div>  

   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 01: <i>Macaca mulatta</i> infected with <i>Plasmodium coatneyi</i> Hackeri strain infected red blood cells</a> </h3> 
   <div class="wdk-toggle-content">
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfo01 table, #ExpInfo01 td, #ExpInfo01 th, #ExpInfo01 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfo01 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfo01"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 01: <i>Macaca mulatta</i> infected with <i>Plasmodium coatneyi</i> Hackeri strain infected red blood cells</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Be aware that though this dataset is included in the body of MaHPIC results, it was produced before the MaHPIC project started. As of this writing, only the clinical results are planned for public release. Also, different from most MaHPIC datasets, there are no clinical timepoints included in the results. Before the experimental infection, the macaques received an intravenous infusion of a water-soluble biotin derivative to determine the erythrocyte lifespan via daily quantification of the biotinylated cells using flow cytometry. Clinical, hematological, parasitological, and metabolomics measures were collected in the course of the infection. Within the MaHPIC, this project is known as 'Experiment 01'. This dataset was produced by Dr. Alberto Moreno and Monica Cabrera-Mora at Emory University. To access other publicly available data from MaHPIC Experiments visit <a href="http://plasmodb.org/plasmo/mahpic.jsp">http://plasmodb.org/plasmo/mahpic.jsp</a>. This page will be updated as datasets are released to the public. The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC). </td>
           </tr>
         </table>
      </div>   
      <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinks01 table, #DataLinks01 td, #DataLinks01 th, #DataLinks01 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinks01 {
           margin-left : 5 em;
           }
           
           #DataLinks01 td {vertical-align: middle;}
         </style> 
         <table id="DataLinks01"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_01/"><b>E01 Clinical Data in PlasmoDB Downloads</b></a></td>
             <td>N/A</td>
           </tr>
           
           </tr>
           </table>
           </div>
<br><br>

  </div>	
  </div>  

<div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 02: Uninfected <i>Macaca mulatta</i> that serve as a control for <i>in vivo</i> biotinylation studies</a> </h3> 
   <div class="wdk-toggle-content">
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfo02 table, #ExpInfo02 td, #ExpInfo02 th, #ExpInfo02 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfo02 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfo02"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 02: Uninfected <i>Macaca mulatta</i> that serve as a control for <i>in vivo</i> biotinylation studies</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Be aware that though this dataset is included in the body of MaHPIC results, it was produced before the MaHPIC project started. As of this writing, only the clinical results are planned for public release. Also, different from most MaHPIC datasets, there are no clinical timepoints included in the results. The macaques received an intravenous infusion of a water-soluble biotin derivative to determine the erythrocyte lifespan via daily quantification of the biotinylated cells using flow cytometry. Clinical, hematological, and metabolomics measures were collected in the course of the follow-up. Within the MaHPIC, this project is known as 'Experiment 02'. This dataset was produced by Dr. Alberto Moreno Emory University. To access other publicly available data from MaHPIC Experiments visit <a href="http://plasmodb.org/plasmo/mahpic.jsp">http://plasmodb.org/plasmo/mahpic.jsp</a>. This page will be updated as datasets are released to the public. The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC).</td>
           </tr>
         </table>
      </div>   
      <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinks02 table, #DataLinks02 td, #DataLinks02 th, #DataLinks02 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinks02 {
           margin-left : 5 em;
           }
           
           #DataLinks02 td {vertical-align: middle;}
         </style> 
         <table id="DataLinks02"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_02/"><b>E02 Clinical Data in PlasmoDB Downloads</b></a></td>
             <td>N/A</td>
           </tr>
           
           </tr>
           </table>
           </div>
<br><br>
</div>
</div>
<div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 20: <i>Macaca mulatta</i> infected with <i>Plasmodium coatneyi</i> Hackeri strain infected red blood cells exposed to a homologous re-challenge</a> </h3> 
   <div class="wdk-toggle-content">
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfo20 table, #ExpInfo20 td, #ExpInfo20 th, #ExpInfo20 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfo20 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfo20"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 20: <i>Macaca mulatta</i> previously infected with <i>Plasmodium coatneyi</i> Hackeri strain infected red blood cells exposed to a homologous re-challenge 11 months after the first infection (E01).</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Be aware that though this dataset is included in the body of MaHPIC results, it was produced before the MaHPIC project started. As of this writing, only the clinical results are planned for public release. Also, different from most MaHPIC datasets, there are no clinical timepoints included in the results. Before the experimental infection, the macaques received an intravenous infusion of a water-soluble biotin derivative to determine the erythrocyte lifespan via daily quantification of the biotinylated cells using flow cytometry. Clinical, hematological, parasitological, and metabolomics measures were collected in the course of the infection. Within the MaHPIC, this project is known as 'Experiment 20'. This dataset was produced by Dr. Alberto Moreno at Emory University. To access other publicly available data from MaHPIC Experiments visit <a href="http://plasmodb.org/plasmo/mahpic.jsp">http://plasmodb.org/plasmo/mahpic.jsp</a>. This page will be updated as datasets are released to the public. The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC).</td>
           </tr>
         </table>
      </div>   
      <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinks20 table, #DataLinks20 td, #DataLinks20 th, #DataLinks20 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinks20 {
           margin-left : 5 em;
           }
           
           #DataLinks20 td {vertical-align: middle;}
         </style> 
         <table id="DataLinks20"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_20/"><b>E20 Clinical Data in PlasmoDB Downloads</b></a></td>
             <td>N/A</td>
           </tr>
           
           </tr>
           </table>
           </div>
<br><br>
</div>
</div>

<div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 21: Uninfected <i>Macaca mulatta</i> that serve as a control for in vivo biotinylation studies ten months after the first infusion (E02)</a> </h3> 
   <div class="wdk-toggle-content">
     
     <h4>Experiment Information</h4>
	 <div style="margin-left: 2.5em;">
	 <style>
           #ExpInfo21 table, #ExpInfo21 td, #ExpInfo21 th, #ExpInfo21 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 0px solid black;
           }
           #ExpInfo21 {
           margin-left : 5 em;
           }
           
         </style> 
         <table id="ExpInfo21"> 
           <tr>
             <td><b>Title:</b></td>
             <td>Experiment 21: Uninfected <i>Macaca mulatta</i> that serve as a control for in vivo biotinylation studies ten months after the first infusion (E02)</td>
           </tr>
           <tr>
             <td><b>Experiment Description:</b></td>
             <td>Be aware that though this dataset is included in the body of MaHPIC results, it was produced before the MaHPIC project started. As of this writing, only the clinical results are planned for public release. Also, different from most MaHPIC datasets, there are no clinical timepoints included in the results. The macaques received a second intravenous infusion of a water-soluble biotin derivative ten months after the first infusion (E02) to determine the erythrocyte lifespan via daily quantification of the biotinylated cells using flow cytometry. Clinical, hematological, and metabolomics measures were collected in the course of the follow-up. Within the MaHPIC, this project is known as 'Experiment 21'. This dataset was produced by Dr. Alberto Moreno at Emory University. To access other publicly available data from MaHPIC Experiments visit <a href="http://plasmodb.org/plasmo/mahpic.jsp">http://plasmodb.org/plasmo/mahpic.jsp</a>. This page will be updated as datasets are released to the public. The experimental design and protocols for this study were approved by the Emory University Institutional Animal Care and Use Committee (IACUC).</td>
           </tr>
         </table>
      </div>   
      <br><br>
     
	 <h4>Data Links</h4> 
       <div style="margin-left: 2.5em;">
	   <style>
           #DataLinks21 table, #DataLinks21 td, #DataLinks21 th, #DataLinks21 tr {
           text-align : left;
           padding-left: 7px;
           padding-right: 7px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinks21 {
           margin-left : 5 em;
           }
           
           #DataLinks21 td {vertical-align: middle;}
         </style> 
         <table id="DataLinks21"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
           <tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><a href="http://plasmodb.org/common/downloads/MaHPIC/Experiment_21/"><b>E21 Clinical Data in PlasmoDB Downloads</b></a></td>
             <td>N/A</td>
           </tr>
           
           </tr>
           </table>
           </div>
<br><br>
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
