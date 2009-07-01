<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="version" value="${wdkModel.version}"/>
<c:set var="site" value="${wdkModel.displayName}"/>

<!-- get wdkModel name to display as page header -->
<site:header title="${site}.org :: Support Feedback"
                 banner="${site} Support Feedback"
                 parentDivision="${site}"
                 parentUrl="/home.jsp"
                 divisionName="Generic"
                 division="help"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<!-- begin page table -->

<table border=0 width=100% cellpadding=10><tr><td valign=top>

<h1>Thank you!</h1>
  <hr class=brown>
<center><a style="font-size:14px" href="javascript:window.close()">Close this window.</a></center>  
    <hr class=brown>
<font size ="-1">
&nbsp;&nbsp;&nbsp;YOUR MESSAGE HAS BEEN SENT TO THE ${site} TEAM.<br><br>
&nbsp;&nbsp;&nbsp;A copy has been sent to the email provided, for your records.<br>

</font>
</td></tr>
</table> 

<site:footer/>


