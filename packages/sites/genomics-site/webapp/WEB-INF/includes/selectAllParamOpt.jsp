
<c:choose>
<c:when test="${fn:length(qP.vocab) > 2}">
<br>
<a href="javascript:void(0)" onclick="chooseAll(1, $(this).parents('form').get(0), 'myMultiProp(${pNam})' )">select all</a>
 &nbsp;|&nbsp; <a href="javascript:void(0)" onclick="chooseAll(0, $(this).parents('form').get(0), 'myMultiProp(${pNam})' )">clear all</a>
</c:when>
</c:choose>
