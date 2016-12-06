<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>

<%-- get wdkRecord from proper scope --%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:set value="${wdkRecord.recordClass.displayName}" var="recordName"/>

<c:catch var="err">
<%-- force RecordInstance.fillColumnAttributeValues() to run
      and set isValidRecord to false if appropriate. 
      wdkRecord.isValidRecord is tested in the project's RecordClass --%>
<c:set var="junk" value="${attrs['organism']}"/>
</c:catch>

<imp:pageFrame title="${wdkRecord.primaryKey}"
             divisionName="${recordName} Record"
             refer="recordPage"
             division="queries_tools">


<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">
  The ${fn:toLowerCase(recordName)} '${id}' was not found.</h2>
</c:when>

<c:otherwise>

<%-- quick tool-box for the record --%>
<imp:recordToolbox />

<div class="h2center" style="font-size:160%">
 	Isolate ${primaryKey}<br>
</div>

<div class="h3center" style="font-size:130%">

<c:set var="count" value="0"/>
<c:forEach var="row" items="${wdkRecord.tables['IsolateComments'].iterator}">
<c:set var="count" value="${count +  1}"/>
</c:forEach>
<c:choose>
<c:when test="${count == 0}">
<a style="font-size:70%;font-weight:normal;cursor:hand" href="${commentsUrl}">Add the first user comment
</c:when>
<c:otherwise>
<a style="font-size:70%;font-weight:normal;cursor:hand" href="#Annotation" onclick="wdk.api.showLayer('UserComments')">This isolate has <span style='color:red'>${count}
    </span> user comments
		</c:otherwise>
		</c:choose>
		<imp:image style="position:relative;top:2px" width="28" src="images/commentIcon12.png"/>
		</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 

	<imp:recordPageBasketIcon />
</div>

<%--#############################################################--%>

<c:set var="attr" value="${attrs['overview']}" />

<imp:panel
    displayName="${attr.displayName}"
        content="${attr.value}" attribute="${attr.name}" />
<br>

<%--#############################################################--%>

<%-- References ------------------------------------------------%>

<imp:wdkTable tblName="Reference" isOpen="true"/>

<br>

<%--#############################################################--%>

<%-- User Comments ------------------------------------------------%>

<c:url var="commentsUrl" value="addComment.do">
  <c:param name="stableId" value="${id}"/>
	<c:param name="commentTargetId" value="isolate"/>
	<c:param name="externalDbName" value="${attrs['external_db_name'].value}" />
	<c:param name="externalDbVersion" value="${attrs['external_db_version'].value}" />
	<c:param name="organism" value="${attrs['organism'].value}" />
	<c:param name="flag" value="0" />
</c:url>

<a name="user-comment"/>

<b>
<a href="${commentsUrl}"><font size='-2'>Add a comment on ${id}</font></a>
<imp:image style="position:relative;top:2px" width="28" src="images/commentIcon12.png"/>
</b>

<br/><br/>

<c:catch var="e">
     <imp:wdkTable tblName="IsolateComments"/>
</c:catch>
<c:if test="${e != null}">

  <table  width="100%" cellpadding="3">
    <tr><td><b>User Comments</b> 
      <imp:embeddedError
        msg="<font size='-1'><b>User Comments</b> is temporarily unavailable.</font>"
        e="${e}"
    />
    </td></tr>
  </table>
</c:if>
<br>

<%--#############################################################--%>

<%-- Alignments and Genes ------------------------------------------------%>

<imp:wdkTable tblName="GeneOverlap" isOpen="true"
     attribution=""/>

<br>


<%--#############################################################--%>


<%-- Protein Sequence(s) ------------------------------------------------%>

<c:set value="${wdkRecord.tables['ProteinSequence']}" var="proteinSequenceTable" />

<c:forEach var="row" items="${proteinSequenceTable.iterator}">

<c:set var="proteinSeq">    
  <noindex> <%-- exclude htdig --%>    
  <font class="fixed">
    <w:wrap size="60" break="<br>">${row['protein_sequence'].value}</w:wrap>
  </font>
  </noindex>
</c:set>

<imp:panel
  displayName="Protein"
  content="${proteinSeq}" />
<br>

</c:forEach>

<%-- GENOME SEQUENCE ------------------------------------------------%>
<c:set var="attr" value="${attrs['sequence']}" />
<c:set var="seq">    
  <noindex> <%-- exclude htdig --%>    
  <font class="fixed">
    <w:wrap size="60" break="<br>">${attr.value}</w:wrap>
  </font>
  </noindex>
</c:set>

<imp:panel
  displayName="${attr.displayName}"
  content="${seq}" />
<br>

</c:otherwise>
</c:choose>

<hr>

</imp:pageFrame>

<script language='JavaScript' type='text/javascript' src='/gbrowse/wz_tooltip_3.45.js'></script>

