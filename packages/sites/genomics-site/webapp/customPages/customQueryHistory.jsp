<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkUser saved in session scope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<c:set var="dsCol" value="${param.dataset_column}"/>
<c:set var="dsColVal" value="${param.dataset_column_label}"/>

<site:header refer="customQueryHistory" />
<script type="text/javascript" lang="JavaScript 1.2">
<!-- //
var IE = document.all?true:false
var mouseX = 0;
var mouseY = 0;
var overHistoryId = 0;
var currentHistoryId = 0;

document.onmousemove = getMousePos;

//alert(IE);

// If NS -- that is, !IE -- then set up for mouse capture
if (!IE) {
   document.captureEvents(Event.CLICK);
   document.captureEvents(Event.MOUSEOVER);
   document.captureEvents(Event.MOUSEOUT);
}

function getMousePos(e) {
   if (!e)
      var e = window.event||window.Event;
      
   if('undefined'!=typeof e.pageX){
      mouseX = e.pageX;
      mouseY = e.pageY;
   } else {
      mouseX = e.clientX + document.body.scrollLeft;
      mouseY = e.clientY + document.body.scrollTop;
   }
}

function displayName(histId) {
   // alert(mouseX);
   if (overHistoryId != histId) hideAnyName();
   overHistoryId = histId;

   if (currentHistoryId == histId) return;
   if (mouseX == 0 && mouseY == 0) return;
   
   var name = document.getElementById('div_' + histId);
   name.style.position = 'absolute';
   name.style.left = mouseX+3 + "px";
   name.style.top = mouseY+3 + "px";
   name.style.display = 'block';
}

function hideName(histId) {
   if (overHistoryId == 0) return;
   
   //alert(mouseX);

   var name = document.getElementById('div_' + histId);
   name.style.display = 'none';
}

function hideAnyName() {
    hideName(overHistoryId);
}
// -->
</script>
<h1>All Queries</h1>
<site:completeHistory model="${wdkModel}" user="${wdkUser}" />
<site:footer/>
