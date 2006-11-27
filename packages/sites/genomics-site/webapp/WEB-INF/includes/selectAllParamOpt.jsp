
<c:choose>
<c:when test="${fn:length(qP.vocab) > 2}">
<br>
<input type="button" value="select all" onclick="chooseAll(1, this.form, 'myMultiProp(${pNam})' )">
<input type="button" value="clear all"  onclick="chooseAll(0, this.form, 'myMultiProp(${pNam})' )">
</c:when>
</c:choose>
