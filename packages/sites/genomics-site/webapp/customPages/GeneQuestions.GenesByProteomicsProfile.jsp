<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set value="${sessionScope.wdkQuestion}" var="wdkQuestion"/>

<!-- display page header with wdkQuestion displayName as banner -->
<site:header title="Queries & Tools :: Proteomics Profile Question"
                 banner="${wdkQuestion.displayName}"
                 parentDivision="Queries & Tools"
                 parentUrl="/showQuestionSetsFlat.do"
                 divisionName="Proteomics Profile Question"
                 division="queries_tools"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<c:set var="qParams" value="${wdkQuestion.paramsMap}"/>

<c:set var="proteomicsProfile" value="${qParams['proteomics_profile']}"/>
<c:set var="proteomicsProfileName" value="${proteomicsProfile.name}"/>

<c:set var="lcs" value="${qParams['lifecycle_stages']}"/>
<c:set var="lifecycleStagesMap" value="${lcs.vocabMap}"/>

<script type="text/javascript" lang="JavaScript 1.2">
<!-- //

<c:set var="lcsCount" value="${fn:length(lifecycleStagesMap)}"/>
var lifecycleStages = new Array(${lcsCount});
var i=0;
<c:forEach items="${lifecycleStagesMap}" var="lcs">
    lifecycleStages[i++] = '${lcs.key}';
</c:forEach>

function updateProfile() {
    var profile="";
    for (var i=0; i<lifecycleStages.length; i++) {
        //alert(lifecycleStages[i]);
        alert(document.getElementById(lifecycleStages[i]).checked);
        if (document.getElementById(lifecycleStages[i]).checked) {
            profile += '1';
        } else {
            profile += '0';
        }
    }
    document.forms[0]['myProp(${proteomicsProfileName})'].value = profile;
}

// -->
</script>

<p><b>${wdkQuestion.displayName}</b></p>

<html:form method="post" action="/processQuestion.do">
<input type="hidden" name="questionFullName" value="${wdkQuestion.fullName}"/>
<input type="hidden" name="lifecycle_stages" value="gametocyte"/>

<!-- show error messages, if any -->
<wdk:errors/>

<table>
<tr><td colspan="2">
    <table cellpadding="2" cellspacing="2"><tr>
    <c:forEach items="${lifecycleStagesMap}" var="lcs">
        <td><input type="checkbox" id="${lcs.key}" onclick="updateProfile();">${lcs.key}</td>
    </c:forEach>
    </tr></table>
</td></tr>

<tr>
  <td colspan="2">
    <html:text property="myProp(${proteomicsProfileName})" value="00000"/>
  </td>
</tr>

  <tr><td>&nbsp;</td>
      <td><html:submit property="questionSubmit" value="Get Answer"/></td></tr>
</table>
</html:form>

<hr>

<!-- display description for wdkQuestion -->
<p><b>Query description:</b> <jsp:getProperty name="wdkQuestion" property="description"/></p>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
