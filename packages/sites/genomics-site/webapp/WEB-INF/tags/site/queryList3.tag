<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
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

<script src="<c:url value='wdk/js/wdkQuestion.js'/>" type="text/javascript"></script>

<c:set var="isInsert" value="${param.isInsert}" />

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
			var q = document.createElement('div');
			$(q).html(data);
			var qf = $("form#form_question",q);
			var qt = $("div#question_Form", q).children("h1");
			var qd = $("div#query-description-section", q);
			var qa = $("div#attributions-section", q);
			var qops = "";
			
			$("#" + div).html(qt);
document.getElementById(div).innerHTML = "<h1>" + quesName + "</h1><br/>";
			$("#" + div).append(qf);
			$("#" + div).append(qops);
 document.getElementById(div).innerHTML += "<hr/>"
			$("#" + div).append(qd);
document.getElementById(div).innerHTML += "<hr/>"
			$("#" + div).append(qa);
			htmltooltip.render();
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

      <c:set var="questionFullNamesArray" value="${fn:split(questions, ',')}" />
      <c:if test="${fn:length(questionFullNamesArray) == 1}">
        <jsp:forward page="/showQuestion.do?questionFullName=${questionFullNamesArray[0]}"/>
      </c:if>


<tr>
      <c:forEach items="${questionFullNamesArray}" var="qFullName">
       <c:set var="i" value="${i+1}"/>
        <c:set var="questionFullNameArray" 
               value="${fn:split(qFullName, '.')}" />
        <c:set var="qSetName" value="${questionFullNameArray[0]}"/>
        <c:set var="qName" value="${questionFullNameArray[1]}"/>
        <c:set var="qSet" value="${wdkModel.questionSetsMap[qSetName]}"/>
        <c:set var="q" value="${qSet.questionsMap[qName]}"/>

        <c:set var="prefix" value="${fn:substring(q.displayName,0,4)}" />    <!-- THIS CORRESPONDS TO THE ORGANISM P.F. -->

<c:choose>
  <c:when test="${prefix == 'E.hi'}">    
      <c:set var="org" value="Entamoeba histolytica"/>
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
 <c:when test="${prefix == 'L.d.'}">    
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
       <c:set var="org" value=""/>
</c:otherwise>
</c:choose>

    <%--    <c:if test="${oldprefix != prefix && i != 1}"> --%>
    <c:if test="${oldprefix != prefix}">
		</tr>

		<tr><td colspan="${columns+2}" style="padding:0">&nbsp;</td></tr>
	<%--	<tr><td colspan="${columns}" style="padding:0"><hr style="color:lightgrey"/></td></tr>  --%>
		<tr><td colspan="${columns+2}" style="padding:0"><i>${org}</i></td></tr> 

		<tr>
		<c:set var="i" value="1"/>
	</c:if>
        
	 <c:set var="width" value="39%"/>
	<c:if test="${i % columns == 0}"> <c:set var="width" value="59%"/></c:if>


<!-- if only one column, use space for the description -->
 <c:set var="question" value="<b>${q.displayName}</b>"/>
<%--
 <c:if test="${columns == 1}"> <c:set var="question" value="<b>${q.displayName}</b>:&nbsp;<font style='font-size:90%'>${q.summary}</font>" /></c:if>
--%>


<td width="1%" align="left">&#8226;</td>
<td width="${width}" align="left">
	<a id="${qName}" href="javascript:writeData('<c:url value="/showQuestion.do?questionFullName=${q.fullName}&partial=true"/>', 'des','${q.displayName}','${isInsert}')" rel="htmltooltip">
	<font color="#000066" size="3">${question}${url}</font></a>
</td>
<div id="${qName}_tip" class="htmltooltip">${q.summary}</div>


        <c:if test="${i % columns == 0}"></tr><tr></c:if>
        <c:set var="oldprefix" value="${prefix}" />

      </c:forEach> <%-- forEach items=questions --%>
	
</tr>


<tr><td colspan="${columns+2}"><hr/></td></tr>


<tr><td colspan="${columns+2}" align="left">
	<div id="des"></div>
     </td>
</tr>
        
     
