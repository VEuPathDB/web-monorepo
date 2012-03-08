<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="questions"
              required="true"
              description="list of question full names"
%>
<%@ attribute name="columns"
              required="false"
              description="number of columns in the question table"
%>

<c:if  test="${empty columns}" >
	<c:set value="1" var="columns"/>
</c:if>

<script type="text/javascript">
  $(function() {
    initializeQuestion();
    assignTooltips('.query-tooltip');
  });
</script>

<c:set var="isInsert" value="${param.isInsert}" />


<!------------------------------------------------------------------------->
<SCRIPT type="text/javascript" >

function writeData(page, div, quesName, insertStep){
    if(page=="") {document.getElementById(div).innerHTML = ""; return;}
	var t = $("#"+div);

	$.ajax({
		url: page,
		dataType: 'html',
		success: function(data){
			if(location.href.indexOf("showApplication") != -1){
				formatFilterForm("<form>" + $("div.params",data).html() + "</form>", data, 0, insertStep, false, false, false);
			}
      t.html($.trim(data));
			$('html,body').animate({scrollTop: (t.offset().top - 50)},'fast');
			initParamHandlers(true);
			var question = new WdkQuestion();
			question.registerGroups();
		}
	});
}	

function changeDesc(myUrl) 
{
// var myUrl = document.getElementById("querySelect").options[document.getElementById("querySelect").selectedIndex].value;
 writeData(myUrl,"des");
}

function getComboElement()
{
   return document.getElementById("querySelect").options[document.getElementById("querySelect").selectedIndex].value;
}


</SCRIPT>
<!------------------------------------------------------------------------->

<c:set var="questionFullNamesArray" value="${fn:split(questions, ',')}" />

<c:set var="width" value="49%"/>  <%-- width of column 1--%>

<%-- OPEN FIRST LINE --%>
<tr>
      <%-- LOOP on the values passed (studies and questions) --%>
      <c:forEach items="${questionFullNamesArray}" var="qFullName">

<c:set var="check" value=""/>  
<c:set var="prefix" value=""/>  
<c:set var="question" value=""/>  

<%-- CHECK if this line is a STUDY or a QUESTION --%>
<c:set var="check" value="${fn:substring(qFullName,0,12)}"/>  

<c:choose>
<c:when test="${fn:containsIgnoreCase(check,'study')}">      <%-- a study is always new, 
								a study belongs to an organism and contains questions, 
								several studies can belong to the same organism --%>
        <c:set var="prefix" value="${fn:substring(check,0,4)}" />  
</c:when>
<c:otherwise>
        <%-- all this to access the question display name, which will be shown, and set the prefix: example: P.f. --%>
        <c:set var="questionFullNameArray" value="${fn:split(qFullName, '.')}" />
        <c:set var="qSetName" value="${questionFullNameArray[0]}"/>
        <c:set var="qName" value="${questionFullNameArray[1]}"/>
        <c:set var="qSet" value="${wdkModel.questionSetsMap[qSetName]}"/>
        <c:set var="q" value="${qSet.questionsMap[qName]}"/>
        <c:set var="question" value="<b>${q.displayName}</b>"/>
        <c:set var="prefix" value="${fn:substring(q.displayName,0,4)}" />  
</c:otherwise>
</c:choose>

<%--   DEBUG   
<td colspan="${columns+2}">***${check}***${prefix}***${question}***</td></tr>   
 --%>

<%-- DETERMINE organism --%>
<c:choose>
  <c:when test="${prefix == 'E.hi'}">    
      <c:set var="org" value="Entamoeba histolytica"/>
  </c:when>
<c:when test="${prefix == 'G.i.'}">    
      <c:set var="org" value="Giardia intestinalis"/>
  </c:when>
<c:when test="${prefix == 'G.l.'}">    
      <c:set var="org" value="Giardia lamblia"/>
  </c:when>
<c:when test="${prefix == 'P.f.'}">    
      <c:set var="org" value="Plasmodium falciparum"/>
  </c:when>
 <c:when test="${prefix == 'P.b.'}">    
      <c:set var="org" value="Plasmodium berghei"/>
  </c:when>
 <c:when test="${prefix == 'P.v.'}">    
      <c:set var="org" value="Plasmodium vivax"/>
  </c:when>
 <c:when test="${prefix == 'P.y.'}">    
      <c:set var="org" value="Plasmodium yoelii"/>
  </c:when>
 <c:when test="${prefix == 'T.g.'}">    
      <c:set var="org" value="Toxoplasma gondii"/>
  </c:when>
 <c:when test="${prefix == 'L.d.' || prefix == 'L.i.'}">    
      <c:set var="org" value="Leishmania infantum"/>
  </c:when>
 <c:when test="${prefix == 'T.c.'}">    
      <c:set var="org" value="Trypanosoma cruzi"/>
  </c:when>
 <c:when test="${prefix == 'T.b.'}">    
      <c:set var="org" value="Trypanosoma brucei"/>
  </c:when>
<c:when test="${prefix == 'L.m.'}">    
      <c:set var="org" value="Leishmania major"/>
  </c:when>
  <c:otherwise>
<%--if organism is not found 
	(EITHER it is not specified in displayName or study OR it is a new organism), 
	no header will be displayed 
--%>
       <c:set var="org" value=""/>
  </c:otherwise>
</c:choose>


<%--  if it is a new organism, write it and make a new line --%>
    <c:if test="${oldorg != org}">  
                </tr>
		<tr><td colspan="${columns+2}" style="padding:0">&nbsp;</td></tr>
		<tr class="subheaderrow2"><td colspan="${columns+2}" style="padding:0;"><i><b>${org}</b></i></td></tr> 
                <c:set var="i" value="1"/>  <!-- i represents the column where to write (1 or 2) -->   
                <tr>
    </c:if>


<%--- A STUDY------%>
<c:choose>
<c:when test="${fn:containsIgnoreCase(check,'study')}">
    </tr>   
    <c:set var="i" value="1"/>  <!-- i represents the column where to write (1 or 2) -->        

    <%-- access the study Name, to display --%>
    <c:set var="studyNameArray" value="${fn:split(qFullName, ':')}" />
    <td colspan="${columns+2}" style="padding:0;padding-top: .5em;"><i><b>${studyNameArray[1]}</b></i></td></tr>

    <tr>
</c:when>

<%--- A QUESTION ------%>
<c:otherwise> 
    <c:if test="${i % columns == 0}"> <c:set var="width" value="49%"/></c:if>   <!-- if we are in column 2, set this width -->

    <%-- decide whether to use /showQuestion.do or /wizard.do --%>
    <c:set var="wdkStrategy" value="${requestScope.wdkStrategy}"/>
    <c:choose>
      <c:when test="${wdkStrategy == null}">
        <c:url var="questionUrl" value="/showQuestion.do?questionFullName=${q.fullName}&partial=true" />
        <c:set var="nextCall" value="writeData('${questionUrl}', 'des','${question}','${isInsert}');" />
      </c:when>
      <c:otherwise>
        <c:set var="wdkStep" value="${requestScope.wdkStep}"/>
        <c:set var="action" value="${requestScope.action}"/>
        <c:url var="questionUrl" value="/wizard.do?stage=question&action=${action}&strategy=${wdkStrategy.strategyId}&step=${wdkStep.stepId}&questionFullName=${q.fullName}" />
        <c:set var="nextCall" value="callWizard('${questionUrl}',null,null,null,'next');" />
      </c:otherwise>
    </c:choose>

    <td width="1%" align="left">&#8226;</td>
    <td width="${width}" align="left">
			<a class="query-tooltip" id="${qName}" onclick="${nextCall}return false;" href="" title="${fn:escapeXml(q.summary)}">
			  <font color="#000066" size="3">${question}</font>
			</a>
    </td>

    <c:if test="${i % columns == 0}"></tr><tr></c:if>   <!-- if we are in column 2, make a new line -->
    <c:set var="i" value="${i+1}"/>   

</c:otherwise>
</c:choose>

<c:set var="oldorg" value="${org}" />
      </c:forEach> <%-- forEach items=questions --%>

</tr>

<tr><td colspan="${columns+2}"><hr/></td></tr>
<tr><td colspan="${columns+2}" align="left">
	<div id="des"></div>
     </td>
</tr>
        
     
