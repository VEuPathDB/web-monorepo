<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="project" value="${applicationScope.wdkModel.name}" />
<c:set var="baseUrl" value="${pageContext.request.contextPath}"/>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<imp:pageFrame title="${wdkModel.displayName} :: MaHPIC">

<h1>Access Data from MaHPIC &ndash<br>The Malaria Host-Pathogen Interaction Center</h1>
<center><a href="http://www.systemsbiology.emory.edu/index.html">MaHPIC Info at Emory</a> &nbsp; &nbsp; &ndash; &nbsp; &nbsp; <a href="https://www.niaid.nih.gov/research/malaria-host-pathogen-interaction-center-mahpic">MaHPIC info at NIH</a></center>
<h2>An Introduction to MaHPIC</h2>
<div style="margin-left: 1em;">


<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">What is MaHPIC</a></h3>
<div class="wdk-toggle-content">

 <!-- <h3>What is MaHPIC?</h3> -->
    <section>
	The <a href="http://www.systemsbiology.emory.edu/index.html">Malaria Host-Pathogen Interaction Center (MaHPIC)</a> was established 
	in September 2012 by the 
	<a href="https://www.niaid.nih.gov/research/malaria-host-pathogen-interaction-center-mahpic">National Institute of Allergy and Infectious Diseases</a>, 
	part of the US National Institutes of Health. The MaHPIC team uses a "systems biology" strategy to study how malaria parasites 
	interact with their human and other animal hosts to cause disease in molecular detail. The central hypothesis is that 
	"Non-Human Primate host interactions with Plasmodium pathogens as model systems will provide insights into mechanisms, 
	as well as indicators for, human malarial disease conditions".
	<p>
	The MaHPIC effort includes many groups working together to produce and analyze data and metadata.  These groups include Clinical Malaria, 
	Functional Genomics, Proteomics, Lipidomics, Immunology, Metabolomics, Bioinformatics, and Computational Modeling teams. This research is 
	fundamental to developing and evaluating new malaria diagnostic tools, antimalarial drugs and vaccines for different types of malaria.
	</section>
	<p>
</div>
</div>	

<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">What is the MaHPIC-PlasmoDB Interaction?</a></h3>
<div class="wdk-toggle-content">

<section>
	<img align="middle" src="images/MaHPICtoPlasmo.png" height="300px" width="400px">
	<p>
	PlasmoDB integrates and displays MaHPIC data.  blah blah
	</section>
	<p>
</div>
</div>	



<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">What is a MaHPIC 'Experiment'?</a></h3>
<div class="wdk-toggle-content">	
	
	 <!-- <h3>What is a MaHPIC Experiment?</h3> 
	<section>
	The MaHPIC strategy is to collect physical specimens from non-human primates (NHPs) over the course of an experiment.  Experiments are usually 
	planned for 100 day periods.  In addition to uninfected control experiments, NHPs are infected with Plasmodium parasites and physical samples 
	are collected either daily or at specific time points, depending on the specimen type (blood, bone marrow, etc) as the infection progresses.  
	Samples are then analyzed by the MaHPIC teams and a diverse set of data and metadata are produced.  
	</section>
	<p>
	-->
	<div style="margin-left: 1em;">	
	
	<section>
	<b>Suggested by Susanne:</b><br>
	MaHPIC experiments are longitudinal studies of Plasmodium infections in non-human primates 
	designed to elucidate host-pathogen interactions. 
    Infected animals and uninfected controls are monitored daily over 100 days for clinical parameters.  
    In addition, blood and bone marrow samples are collected at certain milestones of disease progression, 
    and analyzed with 5 omics technologies by the MaHPIC teams. The experimental strategy produces a diverse set of data and 
	metadata.  The result is a comprehensive array of omics data sets plus clinical data and 
	metadata that are publicly available either at official repositories, here on PlasmoDB or on HostDB.<br><br>
	</section>
	Example timeline of an Experiment:<br>
	<img align="middle" src="images/expt3WF.jpg" height="300px" width="400px">
	
	</div>
</div>
</div>

<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">Which MaHPIC Data are Available?</a></h3>
<div class="wdk-toggle-content">

  <div style="margin-left: 1em;">   
  <h3>Which MaHPIC Data are Available?</h3>
    <section>
	Susanne would like to make some suggestions for the What is MaHPIC section but this will have to wait till next week.
	</section>
	<p>
	<section>
	As part of the MaHPIC's data deposition effort, datasets composed of experimental results from the Clinical Malaria team are being hosted 
	at PlasmoDB and HostDB.  Results include a rich collection of data and metadata collected over the course of individual MaHPIC experiments. 
	Each ‘dataset’ consists of a set of files, including a descriptive README, that contain clinical, veterinary, and animal husbandry results 
	from a MaHPIC Experiment.  The results produced by the MaHPIC Malaria Core are the backbone of MaHPIC experiments.<br><br>
	The list of available datasets, publications, and associated data in other public repositories shown below will be updated!
    </section>
   </div>
</div>
</div>

<div style="margin-left: 1em;">	
  <h3>MaHPIC Experiments</h3>
  <div style="margin-left: 1em;">	
   <h4>Experiment 4</h4>
    <section>
    MaHPIC Experiment 04 consisted of 5 Rhesus macaques (Macacca mulatta), infected with Plasmodium cynomolgi (B strain) over a 100-day period.
    
    <img align="middle" src="images/expt3WF.jpg" height="208px" width="400px">
    
	 <ul>
	  <li>Description of experiment goals</li>
	  <li>Experiment start and end dates</li>
	  <li>Link to dataset at PlasmoDB / HostDB download pages</li>
	  <li>Description of publications including these results</li>
	  <li>Lists of links to other public respositories with data from this Experiment.</li>
	 </ul> 
  </div>
</div>	
</body>





</imp:pageFrame>
