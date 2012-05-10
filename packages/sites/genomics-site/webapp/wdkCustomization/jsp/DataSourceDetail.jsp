<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkXmlQuestionSets saved in request scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}" />
<c:set var="dataSources" value="${requestScope.dataSources}"/>
<c:set var="question" value="${requestScope.question}" />
<c:set var="recordClass" value="${requestScope.recordClass}" />
<c:set var="reference">
  <c:choose>
    <c:when test="${question != null}">?question=${question}</c:when>
    <c:when test="${recordClass != null}">?recordClass=${recordClass}</c:when>
    <c:otherwise></c:otherwise>
  </c:choose>
</c:set>

<imp:header banner="Data Contents" refer="data-source" />

<!-- show all xml question sets -->
<div id="data-sources">
  <a name="_top"></a>
  <h1>Data Sources</h1>
  <h3>Categories</h3>
  <ul id="toc">
    <c:forEach items="${dataSources}" var="category">
      <li><a href="#${category.key}"><i>${category.key}</i></a></li>
    </c:forEach>
  </ul>
  <br />

  <c:forEach items="${dataSources}" var="category">
    <div class="category">
      <div class="anchor">[ <a href="#_top">Top</a> ]</div>
      <h3><a name="${category.key}">${category.key}</a></h3>
      <div class="category-content">
        <c:forEach items="${category.value}" var="record">
          <c:set var="wdkRecord" value="${record}" scope="request" />
          <c:set var="primaryKey" value="${record.primaryKey}"/>
          <c:set var="attributes" value="${record.attributes}"/>
          <c:set var="name" value="${attributes['data_source_name']}" />
          <c:set var="displayName" value="${attributes['display_name']}" />
          <c:set var="version" value="${attributes['version']}" />
          <c:set var="publicUrl" value="${attributes['public_url']}" />
          <c:set var="categories" value="${attributes['category']}" />
          <c:set var="organism" value="${attributes['organism']}" />
          <c:set var="description" value="${attributes['description']}" />
          <c:set var="contact" value="${attributes['contact']}" />
          <c:set var="institution" value="${attributes['institution']}" />
        
          <c:set var="tables" value="${record.tables}" />
          <c:set var="publications" value="${tables['Publications']}" />
          <c:set var="contacts" value="${tables['Contacts']}" />
          <c:set var="externallinks" value="${tables['ExternalLinks']}" />
          <c:set var="references" value="${tables['References']}" />
          <div class="data-source">
            <div>
              <a name="${name.value}"></a>
              <b>${displayName.value}</b>
              (<span class="caption">${version.displayName}</span>: ${version.value})
            </div>
            <div class="detail">
              <div><span class="caption">${categories.displayName}</span>: ${categories.value}</div>
              <div><span class="caption">${organism.displayName}</span>: ${organism.value}</div>
              <div><span class="caption">${contact.displayName}</span>: ${contact.value}</div>
              <div><span class="caption">${institution.displayName}</span>: ${institution.value}</div>
              <div><span class="caption">Description:</span></div>
              <p class="description">${description.value}</p>
            </div>
          
            <c:if test="${fn:length(publications) > 0}">
              <c:set var="publicationContent">
                <imp:table table="${publications}" sortable="false" />
              </c:set>
              <imp:simpleToggle name="${publications.name}" content="${publicationContent}" />
            </c:if>

<%--
            <c:if test="${fn:length(contacts) > 0}">
              <c:set var="contactContent">
                <imp:table table="${contacts}" sortable="false" />
              </c:set>
              <imp:simpleToggle name="${contacts.name}" content="${contactContent}" show="false" />
            </c:if>

            <c:if test="${fn:length(externallinks) > 0}">
              <c:set var="extLinkContent">
                <imp:table table="${externallinks}" sortable="false" />
              </c:set>
              <imp:simpleToggle name="${externallinks.name}" content="${extLinkContent}" show="false" />
            </c:if>
--%>

            <c:if test="${fn:length(references) > 0}">
              <c:set var="hasQuestion" value="${false}" />
              <c:set var="referenceContent">
                <ul>
                  <c:forEach items="${references}" var="reference">
                    <c:if test="${reference['target_type'] eq 'question'}">
                      <jsp:setProperty name="wdkModel" property="questionName" value="${reference['target_name']}" />
                      <c:set var="question" value="${wdkModel.question}" />
                      <c:if test="${question != null}">
                        <c:set var="hasQuestion" value="${true}" />
                        <c:url var="questionUrl" value="/showQuestion.do?questionFullName=${question.fullName}" />
                        <li><a href="${questionUrl}">${question.displayName}</a></li>
                      </c:if> 
                    </c:if>
                  </c:forEach>
                </ul>
              </c:set>
              <c:if test="${hasQuestion}">
                <imp:simpleToggle name="${references.name}" content="${referenceContent}" show="false" />
              </c:if>
            </c:if>

          </div>
        
        </c:forEach>
      </div>
    </div>
  </c:forEach>
  
  <c:if test="${fn:length(reference) > 0}">
    <p><a href="<c:url value='/getDataSource.do?display=detail' />">Click here to see the complete list of Data Sources</a></p>
  </c:if>
</div>


<imp:footer/>
