<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<c:set var="props" value="${applicationScope.wdkModel.properties}" /> 
<c:set var="to" value="${props['SITE_ADMIN_EMAIL']}" />
<c:set var="from" value="phenotype_comment_${phenotypeForm.stableId}@${wdkModel.displayName}.org" />
<c:set var="subject" value="${subject}" />
<c:set var="body" value="${body}" />

<site:header title="${wdkModel.displayName}.org :: Add A Phenotype Comment"
                 banner="Add A Phenotype Comment"/>
<head>

<style type="text/css">
    table.mybox {
      width:     90%;
      max-width: 100%;
      padding:   6px;
      color:     #000;
      cellpandding: 3;
      cellspacing: 3;
    }
    td {
      vertical-align: top;
      padding:   3px;
    }
    th {
      vertical-align: top;
      padding:   3px;
      background:  #88aaca ;
      color:  #ffffff;
    }
    ul.myul {
      list-style: inherit;
      margin:auto 1.5em;
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }

  
</style>


<script type="text/javascript" src="/assets/js/fileUpload.js"></script>

</head>

<body onload='addFileSelRow();'>

<c:choose>

  <c:when test="${empty wdkUser || wdkUser.guest}">
    <p align=center>Please login to post a comment.</p>
    <table align='center'><tr><td><site:login/></td></tr></table>
  </c:when>
  
  <c:otherwise>

    <c:choose>
      <c:when test="${submitStatus eq 'success'}">
      
        <c:set var="returnUrl">
        <c:url value="/showRecord.do?name=GeneRecordClasses.GeneRecordClass&project_id=${wdkModel.projectId}&primary_key=${phenotypeForm.stableId}"/>
        </c:set>

        <site:email
              to="${to}"
              from="${from}"
              subject="${subject}"
              body="${body}"
        />

        <p align=center>Thank you for the comment.
        <br/><br/>
      
        <a href="${returnUrl}">Return to ${commentTarget.displayName} ${phenotypeForm.stableId} page</a>
        </p>
       </c:when>

      <c:otherwise>

        <c:if test="${param.flag ne '0'}">
          <wdk:errors/>

      Stable ID: ${phenotypeForm.stableId} <br>
      commentTargetId: ${phenotypeForm.commentTargetId}<br>
      organism: ${phenotypeForm.organism}<br>
      externalDbName: ${phenotypeForm.externalDbName}<br>
      externalDbVersion: ${phenotypeForm.externalDbVersion}<br>

        </c:if>
         
      <html:form method="post" action="addPhenotype.do"  enctype="multipart/form-data">
        <html:hidden property="commentTargetId" value="${phenotypeForm.commentTargetId}"/>
        <html:hidden property="stableId" value="${phenotypeForm.stableId}"/>
        <html:hidden property="externalDbName" value="${phenotypeForm.externalDbName}"/>
        <html:hidden property="externalDbVersion" value="${phenotypeForm.externalDbVersion}"/>
        <html:hidden property="organism" value="${phenotypeForm.organism}"/>
      
      <table width=90% cellspacing=3 cellpadding=3 bgcolor="#88aaca" align=center border=0>

      <tr class="medium">
        <th colspan=2 align=center>Add phenotype comment for gene ${phenotypeForm.stableId}</td>
      </tr>
    
      <tr class="medium">
        <td width=150>Headline <font color=red>*</font></td>
        <td><html:text property="headline" size="60"/></td>
      </tr>

      <tr class="medium">
         <td>Mutant Status</td>
         <td>
            <input type=radio name="mutantStatus" value=1 checked>Successful</input>
            <input type=radio name="mutantStatus" value=2>Failed</input>
            <input type=radio name="mutantStatus" value=3>In Progress</input>
          </td>
      </tr>

      <tr class="medium">
        <td>Genetic Background</td>
        <td>
           <html:text property="background" size="60"/> <br>
           <ul class="myul">
            <li>
           Genotype, strain, other mutations/markers), other genotypic information</li>

           </ul>

        </td>
      </tr>

      <tr class="medium">
         <td>Mutation Type</td>
         <td>
            <input type=radio name="mutationType" value=1>Gene knock out</input>
            <input type=radio name="mutationType" value=2>Gene knock in</input>
            <input type=radio name="mutationType" value=3>Induced mutation</input>
            <input type=radio name="mutationType" value=4>Inducible/Conditional mutation</input>
            <br>
            <input type=radio name="mutationType" value=5>Random insertion</input>
            <input type=radio name="mutationType" value=6>Point mutation</input>
            <input type=radio name="mutationType" value=7>Transient/Knock down</input>
            <input type=radio name="mutationType" value=8>Dominant negative</input>
            <input type=radio name="mutationType" value=9>Spontaneous</input>
          </td>
      </tr>

      <tr class="medium">
         <td>Mutation Method</td>
         <td>
            <html:select property="mutationMethod">
              <html:option value="1">Transgene (over)expression</html:option>
              <html:option value="2">Pharmacological KO</html:option>
              <html:option value="3">Homologous recombination (DKO)</html:option>
              <html:option value="4">Spontaneous mutant</html:option>
              <html:option value="5">ENU mutagenesis</html:option>
              <html:option value="6">Xray mutagenesis</html:option>
              <html:option value="7">DKO</html:option>
              <html:option value="8">Conditional KO</html:option>
              <html:option value="9">Destabilization</html:option>
              <html:option value="10">Antisense/siRNA</html:option>
              <html:option value="11">Other</html:option>
            </html:select>
          </td>
      </tr>

      <tr class="medium">
        <td>Mutation Method Description</td>
        <td><html:textarea property="mutationMethodDescription" rows="5" cols="70"/>
          <ul class="myul">
            <li>Description of targeting construct</li>
            <li>Assay & method</li>
          </ul>
        </td>
      </tr>

      <tr class="medium">
         <td>Reporters</td>
         <td>
            <html:checkbox property="marker" value="1">Luciferase</html:checkbox>
            <html:checkbox property="marker" value="2">Fluorescent Protein (GFP, RFP, etc)</html:checkbox>
          </td>
      </tr>

      <tr class="medium">
         <td>Selectable Marker(s)</td>
         <td>
            <html:checkbox property="marker" value="1">BLE</html:checkbox>
          </td>
      </tr>

      <tr class="medium">
         <td>Phenotype Category</td>
         <td>
            <html:select property="phenotypeCategory" multiple="true" size="5">
              <html:option value="1">Growth</html:option>
              <html:option value="2">Invasion</html:option>
              <html:option value="3">Motility</html:option>
              <html:option value="4">Differentiation</html:option>
              <html:option value="5">Replication</html:option>
              <html:option value="6">EGRESS</html:option>
              <html:option value="7">Host Response</html:option>
              <html:option value="8">Other</html:option>
            </html:select>
          </td>
      </tr>

      <tr class="medium">
        <td>Phenotype Description <font color=red>*</font></td>
        <td><html:textarea property="phenotypeDescription" rows="5" cols="70"/>
           <ul class="myul">
             <li>Description of the observed phenotype</li>
          </ul>
        
        </td>
      </tr>

      <tr class="medium">
         <td>Phenotype Tested In</td>
         <td>
            <input type=radio name="expression" value=1>in vitro</input>
            <input type=radio name="expression" value=2>in vivo</input>
            <input type=radio name="expression" value=3>both</input>
          </td>
      </tr>


      <tr class="medium">
         <td>Expression</td>
         <td>
            <input type=radio name="expression" value=1>Stable</input>
            <input type=radio name="expression" value=2>Transient</input>
            <input type=radio name="expression" value=3 checked>Don't Know</input>
          </td>
      </tr>

      <tr class="medium">
        <td>Upload/Link</div></td>
        <td><table id="fileSelTbl"></table></td>
      </tr>

      <tr class="medium">
        <td valign=top>PMID(s)</div></td>
        <td>
          <html:text property="pmIds" size="50"/><br/>
          <ul class="myul">
            <li> First, find the publcation in <a href='http://www.ncbi.nlm.nih.gov/pubmed'>PubMed</a> based on author or title</li>
            <li>Enter one or more IDs in the box above separated by ','</li>
            <li>Example: 18172196,10558988</li>
          </ul>
        </td>
      </tr>

      <tr class="medium">
        <td colspan=2 align=center>
        <br/>
        <html:submit property="submit" value="Add Comment"/></td>
        </tr>
      
      </table>
      </html:form>

      </c:otherwise>
    </c:choose>
      
    </c:otherwise>
</c:choose>  

<br/>
<site:footer/>
