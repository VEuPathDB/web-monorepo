<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
          xmlns:jsp="http://java.sun.com/JSP/Page"
          xmlns:c="http://java.sun.com/jsp/jstl/core"
          xmlns:wdk="urn:jsptagdir:/WEB-INF/tags/wdk"
          xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp"
          xmlns:fn="http://java.sun.com/jsp/jstl/functions">

  <jsp:directive.attribute
     name="primaryKeyAttributeValue"
     type="org.gusdb.wdk.model.record.attribute.PrimaryKeyAttributeValue"
     required="true"
     description="The primary key AttributeValue instance"
     />

  <jsp:directive.attribute
     name="recordClass"
     type="org.gusdb.wdk.model.jspwrap.RecordClassBean"
     required="true"
     description="The full name of the record class"
     />

  <jsp:directive.attribute
     name="displayValue"
     required="true"
     description="The display name of the primarykey"
     />

  <jsp:directive.attribute
     name="record"
     type="org.gusdb.wdk.model.jspwrap.RecordBean"
     required="true"
     description="will tell us if in basket or not"
     />

  <c:set var="modelName" value="${applicationScope.wdkModel.name}" />
  <c:set var="basket">
    <c:set var="basket_img" value="basket_gray.png"/>
    <c:set var="basketId" value="basket${fn:replace(primaryKeyAttributeValue.value,'.','_')}" />
    <c:choose>
      <c:when test="${!wdkUser.guest}">    <!-- REGISTERED USER -->
        <c:set value="${record.attributes['in_basket']}" var="is_basket"/>
        <c:set var="basketTitle" value="Click to add this item to the basket." />
        <c:if test="${is_basket == '1'}">
          <c:set var="basket_img" value="basket_color.png"/>
          <c:set var="basketTitle" value="Click to remove this item from the basket." />
        </c:if>
        <c:set var="basketClick" value="wdk.basket.updateBasket(this,'single', '${primaryKeyAttributeValue.value}', '${modelName}', '${recordClass.fullName}')" />
      </c:when>
      <c:otherwise>                         <!-- GUEST USER -->
        <c:set var="basketClick" value="wdk.user.login();" />
        <c:set var="basketTitle" value="Please log in to use the basket." />
      </c:otherwise>
    </c:choose>
    <a id="${basketId}" href="javascript:void(0)" onclick="${basketClick}">
      <imp:image title="${basketTitle}" class="basket" value="${is_basket}" src="wdk/images/${basket_img}" width="16" height="16"/>
    </a>
  </c:set>

  <c:set var="wdkView" value="${requestScope.wdkView}" />

  <c:url var="recordLink" value="/app/record/${recordClass.urlSegment}" />
  <c:choose>          <!-- PATHWAYS: use old URL, we need to keep using the old record page until ported to react -->
    <c:when test="${recordClass.fullName eq 'PathwayRecordClasses.PathwayRecordClass'}">
      <wdk:recordLink
         displayValue="${displayValue}"
         primaryKeyAttributeValue="${primaryKeyAttributeValue}"
         recordClass="${recordClass}"/>
    </c:when>         <!-- TRANSCRIPTS: do not want to show transcript and project in URL-->
    <c:when test="${recordClass.fullName eq 'TranscriptRecordClasses.TranscriptRecordClass'}">
      <c:set var="recordLink" value="${recordLink}/${primaryKeyAttributeValue.values['gene_source_id']}" />

      <!-- this is the gene id column in the transcripts view, which is the primary key column -->
      <c:choose>
        <c:when test="${wdkView.name  eq '_default'}">
          <a href="${recordLink}">${displayValue}</a>
        </c:when>
        <c:otherwise> <!-- in transcript view we want to add the basket icon/checkbox by the geneid -->
          <a href="${recordLink}">${basket} ${displayValue}</a>
        </c:otherwise>
      </c:choose>

    </c:when>
    <c:otherwise>      <!-- REST of recordtypes, using all PK parts n URL, eg:  source_id, project_id, etc) -->
      <c:forEach items="${primaryKeyAttributeValue.values}" var="pkValue" varStatus="loop">
        <c:set var="recordLink" value="${recordLink}/${pkValue.value}" />
      </c:forEach>
      <a href="${recordLink}">${displayValue}</a>
    </c:otherwise>

  </c:choose>

</jsp:root>
