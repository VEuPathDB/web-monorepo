<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="questions"
              required="true"
              description="list of question full names"
%>
<SCRIPT type="text/javascript" >

function writeData(page, div){
        if(page=="") {$(div).innerHTML = ""; return;}
	var xhr = createXMLHttpRequest();
        xhr.onreadystatechange = function() {
		if(xhr.readyState==4) {
			if(xhr.status==200){
			//	 $(div).innerHTML = xhr.responseText;
                               var questionPage = xhr.responseText;
                               var index1 = questionPage.indexOf("<div id=\"question_Form\">") + 24;
			       var index2 = questionPage.indexOf("</div>", index1);
			       var ques = questionPage.substring(index1,index2);
                        //       $(div).innerHTML = "This is index1 = "+index1+" and index 2 "+index2;
                               $(div).innerHTML = ques;
                              
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

      <c:forEach items="${questionFullNamesArray}" var="qFullName">
        <c:set var="i" value="${i+1}"/>
        <c:set var="questionFullNameArray" 
               value="${fn:split(qFullName, '.')}" />
        <c:set var="qSetName" value="${questionFullNameArray[0]}"/>
        <c:set var="qName" value="${questionFullNameArray[1]}"/>
        <c:set var="qSet" value="${wdkModel.questionSetsMap[qSetName]}"/>
        <c:set var="q" value="${qSet.questionsMap[qName]}"/>
        <c:choose>
          <c:when test="${i % 4 == 0}"></tr><tr></c:when>
        </c:choose>
  
        <td>
            <a href="javascript:writeData('<c:url value="/showQuestion.do?questionFullName=${q.fullName}"/>', 'des')">
            <font color="#000066"><b>${q.displayName}</b>${url}</font></a>
        </td>
      </c:forEach> <%-- forEach items=questions --%>
	
       </tr><tr><td colspan="3"><hr/><td></tr>
        <tr>
        <td colspan="3" align="center">
           <div id="des"></div>
        </td>
        </tr>
     
