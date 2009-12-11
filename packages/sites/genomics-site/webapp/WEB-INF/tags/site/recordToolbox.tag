<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set value="${wdkRecord.primaryKey.values}" var="vals"/>
<c:set value="${vals['source_id']}" var="id"/>
<c:set value="${vals['project_id']}" var="pid"/>
<div id="record-toolbox">
  <ul>
    <li>
        <c:set var="image" value="${wdkRecord.inBasket ? 'color' : 'gray'}" />
		<c:set var="imagevalue" value="${wdkRecord.inBasket ? '1' : '0'}"/>
        <a class="basket" href="javascript:void(0)" onClick="updateBasket(this, 'single', '${id}', '${pid}', '${wdkRecord.recordClass.fullName}')">
			<img src='/assets/images/basket_${image}.png' value="${imagevalue}"/>
			&nbsp;${wdkRecord.recordClass.type} Basket
		</a>
    </li>
    <li>
        <c:url var="downloadUrl" value="/processQuestion.do?questionFullName=GeneQuestions.GeneBySingleLocusTag&skip_to_download=1&myProp(single_gene_id)=${id}" />
        <a class="download" href="${downloadUrl}" title="Download this ${recordType}">Download</a>
    </li>
    <li>
        <a class="show-all" href="" title="Show all sections">Show All</a>
    </li>
    <li>
        <a class="hide-all" href="" title="Hide all sections">Hide All</a>
    </li>
  </ul>
</div>

