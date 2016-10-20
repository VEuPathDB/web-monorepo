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

  <center> <img align="middle" src="images/MaHPIC_TopCenter_5.png" height="120px" width="550px"></center>
  <h1>How to Access Data from MaHPIC -<br>The Malaria Host-Pathogen Interaction Center</h1> 
  
<div class="item">
  <h3 id="DataLinks">Where to Access MaHPIC Data</h3>
  <div style="margin-left: 1em;">	
   
   <div class="wdk-toggle" data-show="false">
   <h3 class="wdk-toggle-name"> <a href="#">Experiment 4: Relapse of <i>M. mulata</i> infected with <i>P. cynomolgi</i> B strain</a></h3> 
   <div class="wdk-toggle-content">
   
    <img align="middle" src="images/MaHPIC_Ex04_Timeline.png" height="300px" width="500px"><br>
    <a href="images/MaHPIC_Ex04_Timeline.png" target="_blank">View Larger Image</a><br>
    
     <h4>Experiment Information</h4>
	 <ul>
	  <li><b>Title:</b> Five <i>Macaca mulatta</i> individuals infected with <i>Plasmodium cynomolgi</i> B strain and 
      treated with artemether over a 100-day study to observe multiple disease relapses.</li>
	  <li><b>Experiment Description:</b> The experimental design of this <i>Plasmodium cynomolgi</i> B strain infection of <i>Macaca mulatta</i> was approved by the Emory University Institutional Animal Care and Use Committee (IACUC) and is as follows. Five naive males (RFa14, RFv13, Rlc14, RMe14, RSb14) approximately 2 years of age were inoculated intravenously with a preparation of Anopheles dirus salivary gland material that included malaria sporozoites and then profiled for clinical and omic measurements over the course of a 100-day experiment. The drug Artemether was administered to subjects during the 100-day experiment.   Samples were generated and analyzed as part of a multi-omic approach to understanding at the molecular level the course and effects of infection and relapse on both host and parasite.  Samples were generated daily and at an additional 7 time points over the experiment.  The drugs chloroquine and primaquine were administered to subjects at the end of the 100-day experiment.</li>
	  <li><b>MaHPIC's Read Me:</b> <a href="http://plasmodb.org/common/downloads/MaHPIC/E04ClinicalMalaria/E04M99MEMmCyDaWB_07122016-README_MULTIPL.txt">E04 READ ME (Text file)</a></li>
	  <li><b>Experimental Details File:</b> <a href="http://plasmodb.org/common/downloads/MaHPIC/E04ClinicalMalaria/EX04_Sub_Template.xlsx">Submission Template (Excel file)</a></li>	  
	 </ul> 
	 
	 
	 <h4>Data Links</h4> 
	    
	   
	   <div style="margin-left: 2.5em;">

	   <style>
           #DataLinks table, #DataLinks td, #DataLinks th, #DataLinks tr {
           text-align : center;
           padding-left: 5px;
           padding-right: 5px;
           padding-top: 5px;
           padding-bottom: 5px;
           border: 1px solid black;
           }
           #DataLinks {
           margin-left : 5 em;
           }
         </style> 
         <table id="DataLinks"> 
           <tr>
             <th>Data from MaHPIC Team</th>
             <th>Data Available from</th>
             <th>Data Integrated into PlasmoDB Searches</th>
           </tr>
             <td><img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px"> <b>Clinical Malaria</b></td>
             <td><a href="http://plasmodb.org/common/downloads/">PlasmoDB Downloads</a></td>
             <td>N/A</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Functional_Genomics_Core.jpg" height="13px" width="13px"> <b>Functional Genomics</b></td>
             <td> <a href="https://www.ncbi.nlm.nih.gov/sra">E04 Sequence data on NCBI's SRA</a><br><a href="https://www.ncbi.nlm.nih.gov/geo/">E04 Expression Results on NCBI's GEO</a></td>
             <td>N/A</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Proteomics_Core.jpg" height="13px" width="13px"> <b>Proteomics</b></td>
             <td><a href="https://www.ebi.ac.uk/pride/archive/">E04 Proteomics at EBI's PRIDE</a><br><a href="https://massive.ucsd.edu/ProteoSAFe/static/massive.jsp">E04 Proteomics at UC San Diego's MassIVE</a></td>
             <td>N/A</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Lipidoimics_Core.jpg" height="13px" width="13px"> <b>Lipidomics</b></td>
             <td><a href="https://massive.ucsd.edu/ProteoSAFe/static/massive.jsp">E04 Lipidomics at UC San Diego's MassIVE</a></td>
             <td>N/A</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Immune_Profiling_Core.jpg" height="13px" width="13px"> <b>Immune Profiling</b></td>
             <td><a href="https://immport.niaid.nih.gov/immportWeb/home/home.do?loginType=full">E04 Immune Profiles at NIAID's ImmPort</a></td>
             <td>N/A</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Metabolomics_Core.jpg" height="13px" width="13px"> <b>Metabolomics</b></td>
             <td><a href="https://massive.ucsd.edu/ProteoSAFe/static/massive.jsp">E04 Metabolomics at UC San Diego's MassIVE</a></td>
             <td>N/A</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Informatics_Core.jpg" height="13px" width="13px"> <b>Informatics</b></td>
             <td>Coming soon</td>
             <td>N/A</td>
           </tr>
           </tr>
             <td><img src="images/MaHPIC_Math_Modeling_Core.jpg" height="13px" width="13px"><b>Computational Modeling</b></td>
             <td>Coming soon</td>
             <td>N/A</td>
           </tr>
           </table>
           </div>
<br><br>
	   
	 <h4>Publication</h4>
	    <div style="margin-left: 2.5em;">
        <img src="images/MaHPIC_Malaria_Core.jpg" height="13px" width="13px">
	     <i>Plasmodium cynomolgi</i> infections in rhesus macaques display clinical and parasitological features pertinent to modelling vivax malaria pathology and relapse infections.  <a href="https://www.ncbi.nlm.nih.gov/pubmed/27590312" target="_blank">Joyner et al. Malar J. 2016 Sep 2;15(1):451.</a>
        </div>
  </div>	
  </div>
     <div class="wdk-toggle" data-show="false">
     <h3 class="wdk-toggle-name"><a href="#">Experiment 13: Coming Soon</a></h3>
     <div class="wdk-toggle-content">

  </div>
  </div>
  
  </div>  
  
 
  
<div class="item">

  <h3>An Introduction to MaHPIC</h3>

  <div style="margin-left: 1em;">
    <a href="http://www.systemsbiology.emory.edu/index.html">MaHPIC</a> is an 
    <a href="https://www.niaid.nih.gov/research/malaria-host-pathogen-interaction-center-mahpic">NIAID</a>-funded initiative to characterize host-pathogen interactions during malaria 
    infections of non-human primates. 
    <a href="http://www.systemsbiology.emory.edu/research/cores/index.html">MaHPIC's 8 teams</a> of 
    <a href="http://www.systemsbiology.emory.edu/people/investigators/index.html">transdisciplinary scientists</a> 
    use a "systems biology" approach to study the molecular details of how malaria parasites 
	interact with their human and other animal hosts to cause disease. (NIAID Contract: # HHSN272201200031C)<br><br>
	
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

   </div>
	
	<a href="#" class="read_more">Read More...</a><br>

     <span class="more_text">
      MaHPIC is organized into a compendium of 22 experiments.  Experiments are carefully planned and monitored, producing results data sets (clinical 
      and a wide range of omics) that will be made available to the public. In total, MaHPIC results data sets will be 
      composed of thousands of files and several data types. Results datasets will offer unprecedented 
      detail on disease progression, recrudescence, relapse, and host susceptibility and will be instrumental in 
      the development of new diagnostics, drugs, and vaccines to reduce the global suffering caused by this disease.
      <p>
      
	  MaHPIC was established in September 2012 by the 
	  National Institute of Allergy and Infectious Diseases, 
	  part of the US National Institutes of Health. The MaHPIC team uses a "systems biology" strategy to study how malaria parasites 
	  interact with their human and other animal hosts to cause disease in molecular detail. The central hypothesis is that 
	  "Non-Human Primate host interactions with Plasmodium pathogens as model systems will provide insights into mechanisms, 
	  as well as indicators for, human malarial disease conditions".
	  <p>
	  The MaHPIC effort includes many teams working together to produce and analyze data and metadata.  These teams are briefly described below 
	  but more detailed information can be found at 
	  <a href="http://www.systemsbiology.emory.edu/research/cores/index.html">Emory's MaHPIC site</a>. 
      <p>
	 </span>

   </div>
</div>


   
<div class="item">  
   <h3>MaHPIC Experimental Design</h3>
   
   <div style="margin-left: 1em;">
     For the study of malaria in the context of the MaHPIC project, “systems biology” means collecting and analyzing comprehensive data on 
     how a <i>Plasmodium</i> parasite infection produces changes in host and parasite gene expression, proteins, lipids, metabolism and the host immune response.
     MaHPIC experiments are longitudinal studies of <i>Plasmodium</i> infections (or uninfected controls) in non-human primates. <br>
     <a href="#" class="read_more">Read More...</a><br>
   
     <span class="more_text">
       <img align="middle" src="images/MaHPIC_Generic_Timeline.png" height="260px" width="520px"><br>
       <a href="images/MaHPIC_Generic_Timeline.png" >View Larger Image</a><br><br>
       
       The MaHPIC strategy is to collect physical specimens from non-human primates (NHPs) over the course of an experiment.  The clinical parameters 
       of infected animals and uninfected controls are monitored daily for about 100 days. During the experiment, animals receive blood-stage 
       treatments that clear parasites from the blood but not the liver, which is the source of relapse.  Animals receive a curative treatment 
       at the end of the experiment. At specific milestones during disease progression, blood and bone marrow samples are collected and 
       analyzed by the MaHPIC teams and a diverse set of data and metadata are produced.<br><br>

 
	 </span>
   </div>	
</div>

  </div>
  </div>
  
  </div>
</div>
</div>
</imp:pageFrame>
