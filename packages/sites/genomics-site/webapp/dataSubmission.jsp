<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="project" value="${applicationScope.wdkModel.name}" />
<c:set var="baseUrl" value="${pageContext.request.contextPath}"/>

<imp:pageFrame title="${wdkModel.displayName} :: Data Submission">

<style>
p.MsoNoSpacing, li.MsoNoSpacing, div.MsoNoSpacing, p.MsoListParagraph {
    font-family: Calibri;
    font-size: 11pt;
    margin: 0 0 0.0001pt;
}
.WordSection1 .wdk-toggle > h3 {
    font-family: Calibri;
    font-size: 120%;
}
</style>

<div class=WordSection1>

<p class=MsoNoSpacing align=center style='text-align:center'><b
style='mso-bidi-font-weight:normal'><span style='font-size:14.0pt'>Data
Submission<o:p></o:p></span></b></p>

<p class=MsoNoSpacing align=center style='text-align:center'><b
style='mso-bidi-font-weight:normal'><span style='font-size:14.0pt'><o:p>&nbsp;</o:p></span></b></p>

<p class=MsoNoSpacing style='text-align:justify'>EuPathDB welcomes submissions
of genomic-scale data concerning eukaryotic pathogens and host-pathogen
interactions. Our most common data types include transcriptomics, proteomics,
metabolomics, epigenomics, population-level and isolates data. If you are
interested in submitting one of these data types, please review the data
submission policy and start the data submission process outlined below. </p>

<p class=MsoNoSpacing style='text-align:justify'><span style='color:#2E74B5;
mso-themecolor:accent1;mso-themeshade:191'><o:p>&nbsp;</o:p></span></p>

<p class=MsoNoSpacing style='text-align:justify'>We also accept genomic-scale data
types not listed above and are open to your suggestions. If you would like to
suggest a new data type, please <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us"><span style='color:#2E74B5;
mso-themecolor:accent1;mso-themeshade:191'>Contact Us</span></a><span
style='color:#2E74B5;mso-themecolor:accent1;mso-themeshade:191'> </span>to
discuss your data. We look forward to working with you!</p>

<p class=MsoNoSpacing style='text-align:justify'><o:p>&nbsp;</o:p></p>


<p class=MsoNoSpacing><o:p>&nbsp;</o:p></p>

<p class=MsoNoSpacing><b style='mso-bidi-font-weight:normal'>Data Submission
Policy:<o:p></o:p></b></p>

<p class=MsoNoSpacing style='text-align:justify'>EuPathDB is charged with
ensuring that genomic and other large-scale data sets pertaining to BRC-supported
pathogens are conveniently accessible to the worldwide community of biomedical
researchers. Please see our <a
href="http://${project}.org/EuPathDB_datasubm_SOP.pdf">Data Submission Policy</a>
for full details.</p>

<p class=MsoNoSpacing><o:p>&nbsp;</o:p></p>

<p class=MsoNoSpacing><o:p>&nbsp;</o:p></p>

<p class=MsoNoSpacing><b style='mso-bidi-font-weight:normal'>Data Submission
Process:<o:p></o:p></b></p>

<p class=MsoNoSpacing><b style='mso-bidi-font-weight:normal'><o:p>&nbsp;</o:p></b></p>

<p class=MsoNoSpacing style='margin-left:.25in;text-indent:-.25in;mso-list:
l9 level1 lfo12'><![if !supportLists]><b style='mso-bidi-font-weight:normal'><span
style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span
style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span></b><![endif]><b style='mso-bidi-font-weight:normal'>Contact
EuPathDB Outreach for an initial review of your data.</b> </p>

<p class=MsoNoSpacing style='margin-left:.25in;text-align:justify'>Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> link to send a
brief description (two or three sentences) of your data. We will make every
effort to reply quickly. During the data submission process, data sets are scheduled
for an upcoming release and given a release date so that we can allocate our
resources appropriately. This release date is flexible. Data will not be made
public until you, the data provider, are satisfied that the release date is
appropriate and the data representation is accurate. </p>

<p class=MsoNoSpacing style='margin-left:.25in;text-align:justify'><o:p>&nbsp;</o:p></p>

<p class=MsoNoSpacing><o:p>&nbsp;</o:p></p>

<p class=MsoNoSpacing style='margin-left:.25in;text-indent:-.25in;mso-list:
l9 level1 lfo12'><![if !supportLists]><b style='mso-bidi-font-weight:normal'><span
style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span
style='mso-list:Ignore'>2.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span></b><![endif]><b style='mso-bidi-font-weight:normal'>Submit 
your Data. </b><span style="mso-spacerun:yes">&nbsp;&nbsp;</span></p>

<p class=MsoNoSpacing style='margin-left:.25in;text-align:justify'>Find your data type below and 
expand the section to see specific instructions. </p>

<p class=MsoNoSpacing style='margin-left:.25in'><o:p>&nbsp;</o:p></p>


<!-- =========== High Throughput =========== -->

<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">High Throughput or Next Generation Sequencing</a>
   &#8211; RNA, DNA or ChIP Sequencing</h3>
<div class="wdk-toggle-content">

<!--
<p class=MsoNoSpacing style='margin-left:.25in'><b style='mso-bidi-font-weight:
normal'>High Throughput / Next Generation Sequencing</b> &#8211; RNA, DNA or ChIP
Sequencing Data in FASTQ or FASTA format</p>
-->

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l0 level1 lfo3'>
<!--  
<![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>&#8226;<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>
-->
We prefer to receive the raw read data in FASTQ
or FASTA file format. We integrate your data into the database using the raw reads. We also use the raw reads during future 
database releases to remap your data when the reference genome is reloaded and to update our analyses when needed.


</p>

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l0 level1 lfo3'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>1.<span style='font:7.0pt'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>Transfer a copy of your data to EuPathDB using
one of these three options:</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Upload
your data to a sequence read archive such as DNA Data Bank of Japan, the
European Nucleotide Archive or NCBI's Sequence Read Archive. If your data is
already submitted to a data repository, there is no need to re-transfer the
data to EuPathDB.<span style="mso-spacerun:yes">&nbsp; </span>In either case, we
will retrieve the data directly from the repository.<span
style="mso-spacerun:yes">&nbsp; </span></p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Upload
your data to our ftp site. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to request
access to our ftp site. </p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Post
your data to your ftp site and use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to send us
instructions for retrieving your data.</p>

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l0 level1 lfo3'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>2.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>Complete the appropriate data description form
making sure to enter your data archive accession numbers (if any) when
prompted.</p>

<p class=MsoNoSpacing style='margin-left:1.75in;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span class=MsoHyperlink><span
style='font-family:"Courier New";mso-fareast-font-family:"Courier New";
color:windowtext;text-decoration:none;text-underline:none'><span
style='mso-list:Ignore'>o<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;
</span></span></span></span><![endif]><a
href="https://docs.google.com/a/apidb.org/forms/d/1f4UCA6tCaAuItKkh97Xg-K_mXz8Pic5SejejOlo09QY/edit?usp=sharing">RNA
Sequencing Data Description Form</a><span class=MsoHyperlink><span
style='color:windowtext;text-decoration:none;text-underline:none'><o:p></o:p></span></span></p>

<p class=MsoNoSpacing style='margin-left:1.75in;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]><a
href="https://docs.google.com/forms/d/1z4rrMp2kjJSkqz6EbwglF6oK9xp_0_VUz9AjfPg4FWc/viewform">DNA-Seq
Data Description Form</p>

<p class=MsoNoSpacing style='margin-left:1.75in;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]><a
href="https://docs.google.com/forms/d/11Qt40E13XTmIUbdftNXVQ6lEr2VIvZPFc0__jrZILJc/viewform">ChIP-Sequencing
Data Description Form</a></p>



</div>
</div>


<!-- =========== Microarray =========== -->

<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">Microarray</a> </h3>
<div class="wdk-toggle-content">

<!--
<p class=MsoNoSpacing style='margin-left:.25in'><b style='mso-bidi-font-weight:
normal'>Microarray</b> &#8211; CEL, CSV </p>
-->

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l13 level1 lfo13'>
<!--  
<![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>
-->
Files (CEL, CSV) should include expression levels and probe
set information.</p>

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l13 level1 lfo13'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>Transfer a copy of your data to EuPathDB using
one of these four options:</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l1 level2 lfo4'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New";color:black;mso-themecolor:text1'><span
style='mso-list:Ignore'>o<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;
</span></span></span><![endif]>Upload your data to a repository such as Gene
Expression Omnibus.</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Upload
your data to our ftp site. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to request
access to our ftp site. </p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Post
your data to your ftp site and use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to send us
instructions for retrieving your data.</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l2 level2 lfo6'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Send
your data as an attachment to an email. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us"><span style='color:#0563C1'>Contact
Us</span></a><span style='color:#0563C1'> </span>form to send us an email.</p>

<p class=MsoNoSpacing style='margin-left:81.0pt'><span style='color:#C00000'><o:p>&nbsp;</o:p></span></p>

<p class=MsoListParagraph style='margin-left:49.5pt;mso-add-space:auto;
text-indent:-.25in;mso-list:l1 level1 lfo4'><![if !supportLists]><span
style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:
Symbol;color:black;mso-themecolor:text1'><span style='mso-list:Ignore'>2.<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>Complete
our <a
href="https://docs.google.com/a/apidb.org/forms/d/1pzD53hCY0rH7JYomUH8cjwJXJlOSrtZRc_mFowfFfU4/edit?usp=sharing">Microarray
Data Description Form</a> making sure to enter your data archive accession
numbers (if any) when prompted. Pay special attention to clearly indicate the
identity of columns in the data files you transferred to EuPathDB.<span
style='color:#538135;mso-themecolor:accent6;mso-themeshade:191'><o:p></o:p></span></p>

</div>
</div>



<!-- =========== Proteomics =========== -->

<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">Proteomics</a> </h3>
<div class="wdk-toggle-content">

<!--
<p class=MsoNoSpacing style='margin-left:.25in'><b style='mso-bidi-font-weight:
normal'>Proteomics</b> &#8211; Excel or tab delimited text files are preferred.
</p>
-->

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l0 level1 lfo3'>
<!--  
<![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>
-->

Excel or tab delimited text files are preferred. We can accommodate xml file format. 
Required columns include gene IDs, peptide sequences, peptide counts and scores.</p>

<!--  
<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l0 level1 lfo3'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>Required columns include gene IDs, peptide
sequences, peptide counts and scores. </p>
-->

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l0 level1 lfo3'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>Transfer a copy of your data to EuPathDB using
one of these three options: </p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Upload
your data to our ftp site. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to request access
to our ftp site. </p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Post
your data to your ftp site and use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to send us
instructions for retrieving your data.</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l2 level2 lfo6'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Send
your data as an attachment to an email. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us"><span style='color:windowtext'>Contact
Us</span></a> form to send us an email.</p>

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l3 level1 lfo5'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>2.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>Complete the <a
href="https://docs.google.com/a/apidb.org/forms/d/1Yx9qGKDyCf2Wm5lnf1-dFHArdQAQ9tVbR8gvxdY7n5A/edit?usp=sharing">Proteomics
Data Description Form</a> making sure to clearly indicate the content of each
column in your file. </p>


</div>
</div>



<!-- =========== Quantitative Proteomics =========== -->

<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">Quantitative Proteomics</a> </h3>
<div class="wdk-toggle-content">

<!--
<p class=MsoNoSpacing style='margin-left:.25in'><b style='mso-bidi-font-weight:
normal'>Quantitative Proteomics</b> &#8211; Excel or tab delimited files are
preferred.</p>
-->

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l3 level1 lfo5'>
<!-- 
<![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>
 -->
 
Excel or tab delimited files are preferred. We can accommodate xml file format. 
Required columns include gene IDs and scores. </p>

<!--  
<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l3 level1 lfo5'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]></p>
-->


<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l0 level1 lfo3'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>Transfer a copy of your data to EuPathDB using
one of these three options: </p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Upload
your data to our ftp site. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to request
access to our ftp site. </p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Post
your data to your ftp site and use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to send us
instructions for retrieving your data.</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l2 level2 lfo6'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Send
your data as an attachment to an email. . Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to send us
an email.</p>

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l1 level1 lfo4'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;color:black;
mso-themecolor:text1'><span style='mso-list:Ignore'>2.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>Complete the <a
href="https://docs.google.com/a/apidb.org/forms/d/1jC1w4wWb_tNWPoL55F0zLq8o8rqOXQjtw27dt9lKups/viewform">Quantitative 
Proteomics Data Description Form</a> making sure to include a description of data columns, for example, time course
units and arrangement if not apparent from column headers. <span
style='color:#C00000'><o:p></o:p></span></p>

<p class=MsoNoSpacing style='margin-left:49.5pt'><span style='color:#ED7D31;
mso-themecolor:accent2'><o:p>&nbsp;</o:p></span></p>

</div>
</div>



<!-- =========== ChIP-chip =========== -->

<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">ChIP-chip</a>  </h3>
<div class="wdk-toggle-content">

<!--
<p class=MsoNoSpacing style='margin-left:.25in'><b style='mso-bidi-font-weight:
normal'>ChIP-chip</b> &#8211; </p>
-->

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l12 level1 lfo7'>
<!-- 
<![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>
 -->
Your data files should include expression levels
and probe set information.</p>

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l1 level1 lfo4'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;color:black;
mso-themecolor:text1'><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>Transfer a copy of your data to EuPathDB using
one of these four options:</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l1 level2 lfo4'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New";color:black;mso-themecolor:text1'><span
style='mso-list:Ignore'>o<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;
</span></span></span><![endif]>Upload your data to a repository such as Gene
Expression Omnibus.</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Upload
your data to our ftp site. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to request
access to our ftp site. </p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Post
your data to your ftp site. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to send us
instructions for retrieving your data.</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l2 level2 lfo6'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Send
your data as an attachment to an email. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us"><span style='color:#0563C1'>Contact
Us</span></a> form to send us an email.</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l1 level2 lfo4'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New";color:black;mso-themecolor:text1'><span
style='mso-list:Ignore'>o<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;
</span></span></span><![endif]><o:p>&nbsp;</o:p></p>

<p class=MsoListParagraph style='margin-left:49.5pt;mso-add-space:auto;
text-indent:-.25in;mso-list:l1 level1 lfo4'><![if !supportLists]><span
style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:
Symbol;color:black;mso-themecolor:text1'><span style='mso-list:Ignore'>2.<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>Complete
the <a
href="https://docs.google.com/forms/d/1E1QN9dKGc9rK_Bd3t-4ugIeVAyNXZoX1Z3bcSKEIMJc/viewform">ChIP-chip
Data Description Form</a> making sure to enter the archive accession numbers (if
any) for your data when prompted. We will retrieve your data from the sequence
read archive. </p>

</div>
</div>



<!-- =========== Isolates typed by =========== -->

<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">Isolates typed by sequencing limited genetic loci</a> </h3>
<div class="wdk-toggle-content">

<!--
<p class=MsoNoSpacing style='margin-left:.25in'><b style='mso-bidi-font-weight:
normal'>Isolates typed by sequencing limited genetic loci</b> &#8211; </p>
-->

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l2 level1 lfo6'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>&#149;<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>If your data <b style='mso-bidi-font-weight:
normal'>IS</b> uploaded to Genbank, use the Contact Us to tell us about your
data. Genebank Isolate records and the associated metadata are automatically
updated with each EuPathDB release.<span style="mso-spacerun:yes">&nbsp;
</span>There is no need to complete our Isolate Submission Form. </p>

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l2 level1 lfo6'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>&#149;<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>If your data <b style='mso-bidi-font-weight:
normal'>IS NOT</b> uploaded to Genbank, we can facilitate this upload. Complete
the Isolate Submission Form 

<!-- 
<span style='color:#C00000'>(</span><span
style='font-family:Wingdings;mso-ascii-font-family:Calibri;mso-ascii-theme-font:
minor-latin;mso-hansi-font-family:Calibri;mso-hansi-theme-font:minor-latin;
color:#C00000;mso-char-type:symbol;mso-symbol-font-family:Wingdings'><span
style='mso-char-type:symbol;mso-symbol-font-family:Wingdings'>J</span></span><span
style='color:#C00000'>Susanne needs to finish) </span>
 -->
 
and we will use the
information to generate a Genbank submission for your isolates. The new isolate records will be
downloaded to EuPathDB with the release. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to send us
instructions for retrieving your data.</p>

<p>
<a href="tutorials/IsolateSubmissionEuPathDBv8.xls">Isolate Submission Form</a><br>
<a href="tutorials/EuPathDB_Isolatesubmission_genericHelp.pdf">Help for submitting Isolate Data</a><br>
</p>
</div>
</div>


<!-- =========== Isolates or Strains =========== -->

<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">Isolates or Strains typed by High Throughput Sequencing</a> </h3>
<div class="wdk-toggle-content">

<!--
<p class=MsoNoSpacing style='margin-left:.25in'><b style='mso-bidi-font-weight:
normal'>Isolates or Strains typed by High Throughput Sequencing</b> &#8211;
FastQ file format preferred</p>
-->

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l0 level1 lfo3'>We prefer to receive the raw read data in FASTQ
or FASTA file format. We integrate your data into the database using 
the raw reads. We also use the raw reads during future 
database releases to remap your data when the reference genome is 
reloaded and to update our analyses when needed.


<![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>Transfer a copy of your data to EuPathDB using
one of these three options:</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Upload
your data to a sequence read archive such as DNA Data Bank of Japan, the
European Nucleotide Archive or NCBI's Sequence Read Archive. We will retrieve
your data using the read archive’s accession numbers for your data set. </p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Upload
your data to our ftp site. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to request
access to our ftp site. </p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Post
your data to your ftp site where we can retrieve the data. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to send us
instructions for retrieving your data.</p>

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l12 level1 lfo7'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>2.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>Complete our High Throughput Sequencing Data
Description Form  making sure to enter the read archive accession
numbers for your data when prompted. We will retrieve your data from the
sequence read archive. </p>

</div>
</div>



<!-- =========== Genome Sequence =========== -->

<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">Genome Sequence and/or Annotation</a>
</h3>
<div class="wdk-toggle-content">

<!--
<p class=MsoNoSpacing style='margin-left:.25in'><b style='mso-bidi-font-weight:
normal'>Genome Sequence and/or Annotation<o:p></o:p></b></p>
-->

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l2 level1 lfo6'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>We prefer to download annotated genome sequence
from a repository which assigns gene IDs, for example, the DNA Data Bank of
Japan, the European Nucleotide Archive or NCBI's GenBank. </p>

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l2 level1 lfo6'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>If your genome <b style='mso-bidi-font-weight:
normal'>IS</b> uploaded to a repository, complete the Genome Sequence and/or
Annotation Description Form <span style='color:#C00000'>(</span><span
style='font-family:Wingdings;mso-ascii-font-family:Calibri;mso-ascii-theme-font:
minor-latin;mso-hansi-font-family:Calibri;mso-hansi-theme-font:minor-latin;
color:#C00000;mso-char-type:symbol;mso-symbol-font-family:Wingdings'><span
style='mso-char-type:symbol;mso-symbol-font-family:Wingdings'>J</span></span><span
style='color:#C00000'>Susanne needs to finish) </span>making sure to include
the accession numbers of your data when prompted. We will download your data
from the repository.</p>

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l2 level1 lfo6'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>If your data <b style='mso-bidi-font-weight:
normal'>IS NOT</b> uploaded to a repository, we can facilitate this upload.
Complete the <span style='color:#538135;mso-themecolor:accent6;mso-themeshade:
191'>Debbie’s Genome Form </span>and we will use the information to generate a
Genbank submission for your genome.<span style="mso-spacerun:yes">&nbsp;
</span>We will retrieve your genome from Genbank.</p>

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l2 level1 lfo6'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'><span
style='mso-list:Ignore'>.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>If you are <b style='mso-bidi-font-weight:normal'>submitting
only genome annotation (gff, ensemble, gtf or genbank formats)</b>, transfer a
copy of your files to EuPathDB using one of these three options:</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l2 level2 lfo6'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Upload
your data to our ftp site. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to request
access to our ftp site. </p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l2 level2 lfo6'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Post
your data to your ftp site where we can retrieve the data. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to send us
instructions for retrieving your data.</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l2 level2 lfo6'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Send
your data as an attachment to an email. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to send us
an email.</p>

</div>
</div>


<!-- =========== General Data Submission =========== -->

<div class="wdk-toggle" data-show="false">
<h3 class="wdk-toggle-name"><a href="#">General Data Submission</a>
  &#8211;use for data that does not fit any of the above categories
</h3>
<div class="wdk-toggle-content">

<!--
<p class=MsoNoSpacing style='margin-left:.25in'>General Data Submission &#8211;
use for data that does not fit any of the above categories </p>
-->

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l6 level1 lfo14'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;color:black;
mso-themecolor:text1'><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]>Transfer a copy of your data to EuPathDB using
one of these four options:</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l1 level2 lfo4'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New";color:black;mso-themecolor:text1'><span
style='mso-list:Ignore'>o<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;
</span></span></span><![endif]>Upload your data to a repository such as Gene
Expression Omnibus.</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Upload
your data to our ftp site. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to request
access to our ftp site. </p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l0 level2 lfo3'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New"'><span style='mso-list:Ignore'>o<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span></span><![endif]>Post
your data to your ftp site. Use the <a
href="${baseUrl}/contact.do" class="new-window" data-name="contact_us">Contact Us</a> form to send us
instructions for retrieving your data.</p>

<p class=MsoNoSpacing style='margin-left:81.0pt;text-indent:-.25in;mso-list:
l1 level2 lfo4'><![if !supportLists]><span style='font-family:"Courier New";
mso-fareast-font-family:"Courier New";color:black;mso-themecolor:text1'><span
style='mso-list:Ignore'>o<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;
</span></span></span><![endif]><span style='color:#C00000'>Send your data as an
attachment to an email. Do we use the EuPathDB Contact Us link here</span>?<span
style="mso-spacerun:yes">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></p>

<p class=MsoNoSpacing style='margin-left:49.5pt;text-indent:-.25in;mso-list:
l1 level1 lfo4'><![if !supportLists]><span style='font-family:Symbol;
mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;color:black;
mso-themecolor:text1'><span style='mso-list:Ignore'>2.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]><span style='color:black;mso-themecolor:text1'>Complete
the General Data Description Form </span><span style='color:#C00000'>(Susanne
needs to create) </span><span style='color:black;mso-themecolor:text1'>making
sure to clearly describe the type of data, the file formats and content of
files you are submitting.<o:p></o:p></span></p>

</div>
</div>

</div>

</imp:pageFrame>
