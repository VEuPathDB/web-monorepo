<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- get wdkXmlQuestionSets saved in request scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}" />
<c:set var="dataSources" value="${requestScope.dataSources}"/>
<c:set var="question" value="${requestScope.question}" />
<c:set var="recordClass" value="${requestScope.recordClass}" />

<imp:header banner="Data Contents" refer="data-source" />

<%-- show all xml question sets --%>
<div id="data-sources">
  <a name="_top"></a>
  <h1>Data Sources</h1>
   
  <div class="smallitalics">(Click on a category to jump to the corresponding section in the page)</div> <br/>

  <ul id="toc">
    <c:forEach items="${dataSources}" var="category">
      <li><a href="#${category.key}"><i>${category.key}</i></a></li>
    </c:forEach>
  </ul>
  <br/><br/><br/>

  <c:forEach items="${dataSources}" var="category">
  <div class="category">
      <div class="anchor">[ <a href="#_top">Top</a> ]</div>
      <a name="${category.key}"></a>
      <div class="h3center ctitle">${category.key}</div>

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
          <c:set var="isolates" value="${tables['Isolates']}" />
          <c:set var="externallinks" value="${tables['ExternalLinks']}" />
          <c:set var="references" value="${tables['References']}" />

          <div class="data-source">

<%-------    DATASET NAME ----------------%>
            <div class="dstitle">
              <a name="${name.value}"></a>
              ${displayName.value}
              (<span class="caption">${version.displayName}</span>: ${version.value})
            </div>


<%-------    DATASET CONTENT ----------------%>
            <div class="detail">
              <table>
                <c:if test='${not empty organism.value}'>    <tr><td><span class="caption">${organism.displayName} </span></td><td> ${organism.value}</td></tr>  </c:if>
                <tr><td><span class="caption">${contact.displayName}</span></td>
                  <td> <c:if test='${not empty contact.value}'>${contact.value}</c:if>
                  <c:if test='${not empty institution.value}'> - ${institution.value}</c:if>
                </td></tr>
       <!--         <tr><td><span class="caption">Description </span></td><td> ${description.value}</td></tr> -->
              </table>
            </div>
            
            <c:if test='${not empty description.value}'>
                <imp:simpleToggle name="Description" content="${description.value}" show="false" />
            </c:if>


            <%-- avoiding table.tag to unify style with searches --%>
            <c:if test="${fn:length(isolates) > 0}">
               <c:set var="isolatesContent">
                <ul>
                  <c:forEach items="${isolates}" var="isolate">
                        <li><a href="${isolate['isolate_link'].url}">${isolate['isolate_link'].displayText}</a> </li>
                  </c:forEach>
                </ul>
              </c:set>

              <imp:simpleToggle name="${isolates.displayName}" content="${isolatesContent}" show="true" />
            </c:if>



            <%-- avoiding table.tag to unify style with searches --%>
            <c:if test="${fn:length(publications) > 0}">
               <c:set var="publicationContent">
              <!--      <imp:table table="${publications}" sortable="false" showHeader="false" /> -->
                <ul>
                  <c:forEach items="${publications}" var="publication">
                        <li>${publication['citation']}</li>
                  </c:forEach>
                </ul>
              </c:set>

              <imp:simpleToggle name="${publications.displayName}" content="${publicationContent}" show="false" />
            </c:if>



            <%-- avoiding table.tag to unify style with searches --%>
            <c:if test="${fn:length(contacts) > 0}">
               <c:set var="contactsContent">
                <ul>
                  <c:forEach items="${contacts}" var="contact">
                        <li><c:if test="${contact['name'] != null}">${contact['name']}</c:if> <c:if test="${contact['affiliation'] != null}">(${contact['affiliation']})</c:if></li>
                  </c:forEach>
                </ul>
              </c:set>

              <imp:simpleToggle name="${contacts.displayName}" content="${contactsContent}" show="false" />
            </c:if>


            <c:if test="${fn:length(externallinks) > 0}">
              <c:set var="extLinkContent">
               <!--   <imp:table table="${externallinks}" sortable="false" showHeader="false" />  -->
                 <ul>
                  <c:forEach items="${externallinks}" var="externallink">
                        <li>${externallink['url']}</li>
                  </c:forEach>
                </ul>
              </c:set>
              <imp:simpleToggle name ="${externallinks.displayName}" content="${extLinkContent}" show="false" />
            </c:if>

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
                        <li><a title="${question.summary}" href="${questionUrl}">Identify ${question.recordClass.type}s based on ${question.displayName}</a></li>
                      </c:if> 
                    </c:if>
                  </c:forEach>
                </ul>
              </c:set>
              <c:if test="${hasQuestion}">
                <imp:simpleToggle name="${references.displayName}" content="${referenceContent}" show="false" />
              </c:if>
            </c:if>

          </div><hr>       <!-- .data-source -->
        </c:forEach>       <!-- all datasets in one category  -->

      </div>   <!-- .category-content -->
  </div>       <!-- .category   -->
  </c:forEach> <!-- all categories  -->
  

   <%-- if we came to this page to show only a few datasets (would be specified in the url) --%>
  <c:if test="${fn:length(param.reference) > 0}">
    <p style="text-align:center;font-size:120%"><a href="<c:url value='/getDataSource.do?display=detail' />">Click here to see the complete list of Data Sources</a></p>
  </c:if>

</div>      <!-- #data-sources   -->


<imp:footer/>
