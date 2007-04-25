<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="questions"
              required="true"
              description="list of question full names"
%>
<SCRIPT type="text/javascript" >

function writeData(page, div, quesName){
        if(page=="") {$(div).innerHTML = ""; return;}
	var xhr = createXMLHttpRequest();
        xhr.onreadystatechange = function() {
		if(xhr.readyState==4) {
			if(xhr.status==200){
		              // $(div).innerHTML = xhr.responseText;
                               var questionPage = xhr.responseText;
                               var index1 = questionPage.indexOf("<div id=\"question_Form\">") + 24;
			       var index2 = questionPage.indexOf("</div>", index1);
			       var ques = questionPage.substring(index1,index2);

                               var desc1 = questionPage.indexOf("<p><b>Query description");
 			       var desc2 = questionPage.substring(desc1).indexOf("</p>");
                               var desc = questionPage.substring(desc1, desc2+desc1);

 			       var help1 = questionPage.indexOf("<BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR>");
 			       var help2 = questionPage.substring(help1).indexOf("</div>");
                               var help = questionPage.substring(help1, help2+help1);


			       $(div).innerHTML = "<font size='5' align='center'><b>" + quesName + "</b></font><br/><br/>";
                               $(div).innerHTML += ques;
			       $(div).innerHTML += "<hr/>" + desc;
			       $(div).innerHTML += help;
                              
			}else{
				alert("Message returned, but with an error status");
			}
	     	}
	 }	
	 xhr.open("GET", page, true);
 xhr.send(null);
}

function $(id) {return document.getElementById(id);}

function createXMLHttpRequest() {
	try{return new ActiveXObject("Msxml2.XMLHTTP");}catch(e){}
	try{return new ActiveXObject("Microsoft.XMLHTTP");}catch(e){}
	try{return new XMLHttpRequest();}catch(e){}
        alert("XMLHttpRequest is not support");
	return null;
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
        
        <td align="left">
            <a href="javascript:writeData('<c:url value="/showQuestion.do?questionFullName=${q.fullName}"/>', 'des','${q.displayName}' )"

           onmouseover = "return overlib('${q.summary}',
		FGCOLOR, 'white',
		BGCOLOR, '#003366',
		TEXTCOLOR, '#003366',
		TEXTSIZE, '12px',
		WIDTH, 350,
		DELAY, 150,
		CELLPAD, 5)"
        onmouseout = "return nd();"

      >
            <font color="#000066" size="3"><b>${q.displayName}</b>${url}</font></a><br/>
        </td> 
        <c:choose>
          <c:when test="${i % 2 == 0}"></tr><tr></c:when>
        </c:choose>
      </c:forEach> <%-- forEach items=questions --%>
	
       </tr><tr><td colspan="4"><hr/><td></tr>
        <tr>
        <td colspan="4" align="left">
           <div id="des"></div>
        </td>
        </tr>
        
     
