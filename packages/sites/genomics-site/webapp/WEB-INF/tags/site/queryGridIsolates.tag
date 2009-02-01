<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="modelName" value="${wdkModel.displayName}"/>

<table width="100%" border="0" cellspacing="2" cellpadding="2">
<tr>

<td width="33%" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr> 
        <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByIsolateId" linktext="Isolate ID(s)" existsOn="A C P"/>
    </tr>
    <tr>
       <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByTaxon" linktext="Taxon/Strain" existsOn="A C P"/> 
    </tr>
    <tr>
      <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByHost" linktext="Host" existsOn="A C"/>
    </tr>
    </table>
</td>

<td width="34%" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
       <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByIsolationSource" linktext="Isolation Source" existsOn="A C"/>
    </tr>
    <tr>
      <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByProduct" linktext="Product Name" existsOn="A C"/>
    </tr>
    <tr>
      <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByCountry" linktext="Geographic Location" existsOn="A C P"/>
    </tr>
    <tr>
      <site:queryGridMakeEasyUrl link="/common/community/lxiao/RFLP_reference_images/Actual&#32;RFLP.htm" linktext="Reference RFLP Gel Images" linkdesc="RFLP images provided by Dr. Lihua Xiao from Centers for Disease Control and Prevention, Atlanta, Georgia, USA" existsOn="A C"  />
    </tr>

    </table>
</td>

<td width="33%" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
   
     <tr>
       <site:queryGridMakeUrl qset="UniversalQuestions" qname="UnifiedBlast" linktext="BLAST/Reference Typing Tool" type="ISOLATE" existsOn="A C P"  />
     </tr>
    <tr>
       <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolatesByTextSearch" linktext="Text" existsOn="NotYet_C"/>
    </tr>
     <tr>
       <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateBySubmitter" linktext="Submitter" existsOn="A P"  />
     </tr>
     <tr>
     <site:queryGridMakeEasyUrl link="isolateClustering.jsp" linktext="Isolate Clustering" linkdesc="View Isolates in a treeview applet" existsOn="P"  />
    </tr>
    
    </table>
</td>

</tr>
</table>
