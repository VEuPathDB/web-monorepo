<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<fmt:setLocale value="en-US"/>

<%-- get wdkXmlQuestionSets saved in request scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}" />
<c:set var="datasets" value="${requestScope.datasets}"/>
<c:set var="question" value="${requestScope.question}" />
<c:set var="recordClass" value="${requestScope.recordClass}" />
<c:set var='project' value='${wdkModel.name}'/>

<imp:pageFrame banner="Data Sets" refer="data-set" >

<%--
<script>
  // capture ctrl-f/cmd-f key combo
  (function() {
    var lastKeys = [];
    $(document).on("keydown", function(e) {
      var lastKey;
      if (lastKeys.length === 0 || lastKeys.length > 1) {
        lastKeys.push(e.which);
      } else if (lastKeys.length === 1) {
        lastKey = lastKeys[0];
        if ((lastKey === 91 || lastKey === 17) && // CMD or CTRL
            (e.which === 70 || e.which === 71))  { // F or G
          $("#data-sets").find(".wdk-toggle").simpleToggle("show");
        }
      }
      return;
    }).on("keyup", function(e) {
      // clear keys 
      lastKeys = [];
    })
  })(jQuery);
</script>
--%>

<%-- show all simpleToggles if page is filtered --%>
<c:set var="show" value="${fn:length(param.reference) gt 0 or
  fn:length(param.question) gt 0 or
  fn:length(param.recordClass) gt 0 or
  fn:length(param.datasets) gt 0}"
/>

<%-- show all xml question sets --%>
<div id="data-sets">
  <a name="_top"></a>
  <h1>Data Sets 
  <a title="Please contact us with your feedback." style="padding-top:0;font-size:70%;position:relative;left:270px;bottom:20px" 
              href="<c:url value='/app/answer/DatasetQuestions.AllDatasets'/>">New Data Sets page!
                <imp:image alt="Beta feature icon" src="wdk/images/beta2-30.png" /></a>
  </h1>
   
  <div class="ui-helper-clearfix">
    <div class="toggle-all">
      <p><a class="wdk-toggle-group"
        href="#"
        data-container="#data-sets"
        data-show="true">Expand all</a><p>
      <p><a class="wdk-toggle-group"
        href="#"
        data-container="#data-sets"
        data-show="false">Collapse all</a></p>
    </div>

    <div class="smallitalics">
      (Click on a category to jump to the corresponding section in the page.
      To search for text on the page, first click
      <a class="wdk-toggle-group" href="#" data-container="#data-sets" data-show="true">Expand all</a>
      to make all details visible for searching.)
    </div> <br/>

    <ul id="toc">
      <c:forEach items="${datasets}" var="category">
        <li><a href="#${category.key}"><i>${category.key}</i></a></li>
      </c:forEach>
    </ul>
  </div>

  <br/><br/><br/>

  <c:forEach items="${datasets}" var="category">
    <div class="category">
      <div class="anchor">[ <a href="#_top">Top</a> ]</div>
      <a name="${category.key}"></a>
      <div class="h3center ctitle">${category.key}</div>

      <div class="category-content">
        <c:forEach items="${category.value}" var="record">
          <c:set var="wdkRecord" value="${record}" scope="request" />
          <c:set var="primaryKey" value="${record.primaryKey}"/>
          <c:set var="attributes" value="${record.attributes}"/>
          <c:set var="datasetId" value="${attributes['dataset_id']}" />
          <c:set var="name" value="${attributes['dataset_name']}" />
          <c:set var="displayName" value="${attributes['display_name']}" />
          <c:set var="categories" value="${attributes['category']}" />
          <c:set var="description" value="${attributes['description']}" />
          <c:set var="contact" value="${attributes['contact']}" />
          <c:set var="institution" value="${attributes['institution']}" />        
          <c:set var="org_prefix" value="${attributes['organism_prefix']}" />        
          <c:set var="tables" value="${record.tables}" />
          <c:set var="publications" value="${tables['Publications']}" />
          <c:set var="contacts" value="${tables['Contacts']}" />
          <c:set var="isolates" value="${tables['Isolates']}" />
          <c:set var="externallinks" value="${tables['HyperLinks']}" />
          <c:set var="versions" value="${tables['Version']}" /> 
          <c:set var="references" value="${tables['References']}" />
          <c:set var="genHistory" value="${tables['GenomeHistory']}" />

          <div class="data-set">

<%-------    DATASET NAME ----------------%>
            <div class="dstitle">
              <a name="${datasetId.value}"></a>
              ${displayName.value}
            </div>

            <div class="small" style="padding:6px;">
              <a href="#" class="wdk-toggle-group"
                data-container=".data-set"
                data-show="true">
                expand all
              </a> |
              <a href="#" class="wdk-toggle-group"
                 data-container=".data-set"
                 data-show="false">
                collapse all
              </a>
            </div>

<%-------    DATASET CONTENT ----------------%>
<!--
<br>
${datasetId.value}
<br>
-->
<%-------    Organisms and Contact  ----------------%>
            <div class="detail">
              <table>
              <c:if test='${not empty org_prefix.value}'>
                <tr><td><span title="In functional data sets this is not the source organism but the one the data set is mapped to, and is returned in search results." class="caption"><b>${org_prefix.displayName}:</b></span></td>
                  <td  style="font-size:120%;font-weight:bold"> ${org_prefix.value}
                  </td></tr>
              </c:if>
                <tr><td><span class="caption"><b>${contact.displayName}:</b></span></td>
                    <td>  <c:if test='${not empty contact.value}'>${contact.value}</c:if>
                         <c:if test='${not empty institution.value}'> - ${institution.value}</c:if>
                    </td></tr>
              </table>
            </div>
            
<%-------    Description ----------------%>
            <c:if test='${not empty description.value}'>
              <imp:simpleToggle name="Description" content="${description.value}" show="${show}" />
            </c:if>

<%-------    Isolates ----------------%>
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

<%-------    Publications ----------------%>
            <%-- avoiding table.tag to unify style with searches --%>
            <c:if test="${fn:length(publications) > 0}">
               <c:set var="publicationContent">
              <!--      <imp:table table="${publications}" sortable="false" showHeader="false" /> -->
                <ul>
                  <c:forEach items="${publications}" var="publication">
                        <li><a href="${publication['pubmed_link'].url}">${publication['pubmed_link'].displayText}</a></li>
                  </c:forEach>
                </ul>
              </c:set>

              <imp:simpleToggle name="${publications.displayName}" content="${publicationContent}" show="${show}" />
            </c:if>

<%-------    PI and collaborators ----------------%>
            <%-- avoiding table.tag to unify style with searches --%>
            <c:if test="${fn:length(contacts) > 0}">
               <c:set var="contactsContent">
                <ul>
                  <c:forEach items="${contacts}" var="contact">
                        <li><c:if test="${contact['contact_name'] != null}">${contact['contact_name']}</c:if> <c:if test="${contact['affiliation'] != null}">(${contact['affiliation']})</c:if></li>
                  </c:forEach>
                </ul>
              </c:set>

              <imp:simpleToggle name="${contacts.displayName}" content="${contactsContent}" show="${show}" />
            </c:if>

<%-------    Links ----------------%>
            <c:if test="${fn:length(externallinks) > 0}">
              <c:set var="extLinkContent">
               <!--   <imp:table table="${externallinks}" sortable="false" showHeader="false" />  -->
                 <ul>
                  <c:forEach items="${externallinks}" var="externallink">
                        <li><a title="${externallink['description'].value}" href="${externallink['hyper_link'].url}">${externallink['hyper_link'].displayText}</a></li>
                  </c:forEach>
                </ul>
              </c:set>
              <imp:simpleToggle name ="${externallinks.displayName}" content="${extLinkContent}" show="${show}" />
            </c:if>

<%-------    Genome History ----------------%>
            <c:if test="${fn:length(genHistory) > 0}">
              <c:set var="genHistoryContent">

              <table class="headerRow">
                <tr>
                  <th>EuPathDB Release</th>
                  <th>Genome Source</th>
                  <th>Annotation Source</th>
                  <th>Notes</th>
                </tr>

              <c:forEach items="${genHistory}" var="genHistoryRow">
                <fmt:parseDate value="${genHistoryRow['release_date']}"
                  var="releaseDate" pattern="yyyy-MM-dd"/>
                <fmt:formatDate value="${releaseDate}" var="releaseDateStr"
                  pattern="MMM d, yyyy"/>
                <tr><td>
                <c:choose>
                <c:when test="${genHistoryRow['build'] eq '0'}">
                  Initial
                </c:when>
                <c:otherwise>
                  ${genHistoryRow['build']} (${releaseDateStr}) (${project}&nbsp;${genHistoryRow['release_number']})
                </c:otherwise>
                </c:choose>
                  </td>
                  <td>${genHistoryRow['genome_source']} (${genHistoryRow['genome_version']})</td>
                  <td>${genHistoryRow['annotation_source']} (${genHistoryRow['annotation_version']})</td>
                  <td>${genHistoryRow['note']}</td>
                </tr>

              </c:forEach>
              </table>
              </c:set>
              <imp:simpleToggle name ="${genHistory.displayName}" content="${genHistoryContent}" show="${show}" /> 
            </c:if>

<%-------    Version ----------------%>
           <c:if test="${fn:length(versions) > 0}">
              <c:set var="versionContent">
                <p style="margin:1px 0;">
                The data set <i>version</i> shown here is the data provider's version number or publication date indicated on the site from which we downloaded the data.  In the rare case that these are not available, the version is the date that the data set was downloaded.</p>

              <%-- assumes sorted by organism (in model SQL) --%>
              <table class="headerRow">
                <tr><th>Organism</th>
                    <th>Provider's Version</th>
                </tr>
                <c:forEach items="${versions}" var="version">
                  <tr><td>${version['organism']}</td>&nbsp;&nbsp;&nbsp;
                      <td>${version['version']}</td>
                  </tr>
                </c:forEach>
              </table>
              </c:set>
              <imp:simpleToggle name ="${versions.displayName}" content="${versionContent}" show="${show}" /> 
            </c:if>

<%-------    Searches and Tracks (wdk references) ----------------%>
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
                        <c:set var="display" value="Identify ${question.recordClass.displayNamePlural} based on ${question.displayName}" />
                        <c:url var="questionUrl" value="/showQuestion.do?questionFullName=${question.fullName}" />
                        <c:choose>
                          <c:when test="${question.isTransform}">
                            <li>${display}</li>
                          </c:when>
                          <c:otherwise>
                            <li><a title="${question.summary}" href="${questionUrl}">${display}</a></li>
                          </c:otherwise>
                        </c:choose>
                      </c:if> 
                    </c:if>
                  </c:forEach>
                </ul>
              </c:set>
              <c:if test="${hasQuestion}">
              <imp:simpleToggle name="${references.displayName}" content="${referenceContent}" show="${show}" />
              </c:if>
            </c:if>

<%-------    Expression Graphs  ----------------%>
            <imp:profileGraphs type='dataset' tableName="ExampleGraphs"/>

          </div><hr>       <!-- .data-set -->
        </c:forEach>       <!-- all datasets in one category  -->
      </div>               <!-- .category-content -->
    </div>                 <!-- .category   -->
  </c:forEach>             <!-- all categories  -->
  

  <%-- if we came to this page to show only a few datasets (would be specified in the url) --%>
  <c:if test="${fn:length(param.reference) > 0}">
    <p style="text-align:center;font-size:120%"><a href="<c:url value='/getDataset.do?display=detail' />">
      Click here to see the complete list of Data Sets</a></p>
  </c:if>

</div>   

  <%-- This provides the deferred <wdk-ajax> loading facility --%>
  <imp:script src="wdkCustomization/js/records/allRecords.js"/>
</imp:pageFrame>
