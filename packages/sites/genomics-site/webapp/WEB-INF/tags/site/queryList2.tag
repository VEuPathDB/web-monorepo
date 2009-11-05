<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="questions"
              required="true"
              description="list of question full names"
%>
<script src="assets/js/parameterHandlers.js" type="text/javascript"></script>
<SCRIPT type="text/javascript" >


function writeData(page, div, quesName){
    if(page=="") {document.getElementById(div).innerHTML = ""; return;}
	var t = $("#"+div);
	$.ajax({
		url: page,
		dataType: 'html',
		success: function(data){
			var q = document.createElement('div');
			$(q).html(data);
			var qf = $("form#form_question",q);
			var qt = $("div#question_Form", q).children("h1");
			var qd = $("div#query-description-section", q);
			var qa = $("div#attributions-section", q);


			$("#" + div).html(qt);
document.getElementById(div).innerHTML = "<h1>" + quesName + "</h1><br/>";
			$("#" + div).append(qf);
 document.getElementById(div).innerHTML += "<hr/>"
			$("#" + div).append(qd);
document.getElementById(div).innerHTML += "<hr/>"
			$("#" + div).append(qa);
			htmltooltip.render();
			initParamHandlers(true);
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
        
<td align="left"><a title="${q.summary}" 
	href="javascript:writeData('<c:url value="/showQuestion.do?questionFullName=${q.fullName}&partial=true"/>', 'des','${q.displayName}' )">
		<font color="#000066" size="3"><b>${q.displayName}</b>${url}</font></a><br/>
</td> 

        <c:if test="${i % 2 == 0}"></tr><tr></c:if>
      </c:forEach> <%-- forEach items=questions --%>
	
</tr>

<tr><td colspan="4"><hr/><td></tr>
<tr><td colspan="4" align="left">
	<div id="des"></div>
     </td>
</tr>
        
     
