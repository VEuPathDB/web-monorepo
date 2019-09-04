<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="project" value="${applicationScope.wdkModel.name}" />

<c:set var="iframeSrc">
  /a/jbrowse/index.html?data=${param.data}&tracks=${param.tracks}&highlight=${param.highlight}
</c:set>


<imp:pageFrame title="${wdkModel.displayName} :: JBrowse"
               refer="jbrowse"
               banner="JBrowse"
               parentUrl="/home.jsp">



      <iframe src="${iframeSrc}"  width='100%' height='100%' scrolling='no' allowfullscreen='true' />

</imp:pageFrame>
