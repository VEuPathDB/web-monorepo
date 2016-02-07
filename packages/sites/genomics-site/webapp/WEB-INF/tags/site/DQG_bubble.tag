<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="banner" 
    type="java.lang.String"
    required="true" 
    description="Image to be displayed as the title of the bubble"
    %>

<%@ attribute name="alt_banner" 
    type="java.lang.String"
    required="true" 
    description="String to be displayed as the title of the bubble"
    %>

<%@ attribute name="recordClasses" 
    type="java.lang.String"
    required="false" 
    description="Class of queries to be displayed in the bubble"
    %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}" />
<c:set var="rootCats" value="${wdkModel.websiteRootCategories}" />

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="leftBubbleCategory" value="TranscriptRecordClasses.TranscriptRecordClass"/>

<c:choose>
  <c:when test="${wdkUser.stepCount == null}">
    <c:set var="count" value="0"/>
  </c:when>
  <c:otherwise>
    <c:set var="count" value="${wdkUser.strategyCount}"/>
  </c:otherwise>
</c:choose>

<div class="threecolumndiv">
  <imp:image id="heading" src="images/${project}/menu_lft1.png" alt="bubble round top heading" width="267" height="12" />

  <c:choose>

    <%---------------------------------   TOOLS  -------------------------%>
    <c:when test="${recordClasses == null}">
       <div class="heading">Tools</div> 
      <imp:DQG_tools />
    </c:when>

    <%---------------------------------   RECORDCLASSSES OTHER THAN GENES  -------------------------%>
    <c:when test="${recordClasses == 'others'}">
      <div class="heading">Search for Other Data Types</div>  

      <div class="info">
        <p class="small" align="center"><a href="true">Expand All</a> | <a href="false">Collapse All</a></p>
        <ul class="heading_list">
          <c:forEach items="${rootCats}" var="rootCatEntry">
            <c:if test="${rootCatEntry.key != leftBubbleCategory}">
              <c:set var="rootCat" value="${rootCatEntry.value}" />
              <c:forEach items="${rootCat.websiteChildren}" var="catEntry">
                <c:set var="cat" value="${catEntry.value}" />
                <c:if test="${fn:length(cat.websiteQuestions) > 0}">

                  <%-- SAME CODE AS IN drop_down_QG2.tag --%>
                  <%-- fixing plural and uppercase --%>

                  <c:set var="display" value="${cat.displayName}" />
                  <li>
                    <imp:image class="plus-minus plus" src="images/sqr_bullet_plus.gif" alt="" />&nbsp;&nbsp;
                    <a class="heading" href="javascript:void(0)">&nbsp;${display}

                      <c:if test="${project ne 'TrichDB' && project ne 'EuPathDB'}">
                        <c:if test="${fn:containsIgnoreCase(cat.displayName,'Pathways') || fn:containsIgnoreCase(cat.displayName,'Compounds')}">
                          <imp:image alt="Beta feature icon" title="This category is new and is under active revision, please contact us with your feedback." 
                                     src="wdk/images/beta2-30.png" />
                        </c:if>
                      </c:if>


                    </a>
                    <c:if test="${rootCatEntry.key != 'DynSpanRecordClasses.DynSpanRecordClass'}">
                      <a class="detail_link small" href="categoryPage.jsp?record=${rootCat.name}&category=${cat.name}"  target="_blank" onClick="poptastic(this.href); return false;">&nbsp;description</a>
                    </c:if>
                    <div class="sub_list">
                      <ul>
                        <c:forEach items="${cat.websiteQuestions}" var="q">
                          <c:set var="popup" value="${q.summary}"/>
                          <li>
                            <a href="showQuestion.do?questionFullName=${q.fullName}" class="dqg-tooltip" 
                               id="${q.questionSetName}_${q.name}" title="${fn:escapeXml(popup)}">${q.displayName}</a>
                            <imp:questionFeature question="${q}" />
                          </li>
                        </c:forEach>
                      </ul>
                    </div>
                  </li>
                </c:if>
              </c:forEach>
            </c:if>
          </c:forEach>

          <li> 
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <a class="heading" href="app/search/dataset/AllDatasets/result">&nbsp;Data Sets
              <imp:image alt="Beta feature icon" title="This category is new and is under active revision, please contact us with your feedback." 
                         src="wdk/images/beta2-30.png" />
            </a>
          </li>

        </ul>
      </div>
      
      <div class="infobottom">
        <%--  <div id="mysearchhist">
              <a href="<c:url value="/showApplication.do?showHistory=true"/>">My Searches: ${count}</a>
        </div>  --%>
      </div>
    </c:when>

    <%---------------------------------   GENES  -------------------------%>
    <c:otherwise>
      <div class="heading">Search for Genes by</div>  
      <div class="info">
        <p class="small" align="center"><a href="true">Expand All</a> | <a href="false">Collapse All</a></p>
        <ul class="heading_list">
          <c:set var="rootCat" value="${rootCats[leftBubbleCategory]}" />
          <c:forEach items="${rootCat.websiteChildren}" var="catEntry">
            <c:set var="cat" value="${catEntry.value}" />
         <%--    <c:if test="${fn:length(cat.websiteQuestions) > -1}"> --%>
              <li>
                <imp:image class="plus-minus plus" src="images/sqr_bullet_plus.gif" alt="" />&nbsp;&nbsp;
                <a class="heading" href="javascript:void(0)">${cat.displayName}


                  <%-- adding symbols for build14, until we get this from the model  https://redmine.apidb.org/issues/9045
                       <c:if test="${project eq 'PlasmoDB' || project eq 'EuPathDB'}">
                         <c:if test="${cat.displayName eq 'Transcript Expression'}">
                           <imp:image width="40" alt="Revised feature icon" title="This category has been revised" 
                                      src="wdk/images/revised-small.png" />
                         </c:if>
                       </c:if>
                       --%>

                </a>
                <a class="detail_link small" href="categoryPage.jsp?record=${leftBubbleCategory}&category=${cat.name}"  target="_blank" onClick="poptastic(this.href); return false;">&nbsp;<i>description</i></a>
                <div class="sub_list">
                  <ul>
                    <c:forEach items="${cat.websiteQuestions}" var="q">
                      <c:set var="popup" value="${q.summary}"/>
                      <li>
                        <a href="showQuestion.do?questionFullName=${q.fullName}" id="${q.questionSetName}_${q.name}" 
                           class="dqg-tooltip" title="${fn:escapeXml(popup)}">${q.displayName}</a>
                        <imp:questionFeature question="${q}" />


                        <%-- adding symbols for build14, until we get this from the model  https://redmine.apidb.org/issues/9045
                             <c:if test="${project eq 'PlasmoDB' || project eq 'EuPathDB'}">
                               <c:if test="${q.displayName eq 'Microarray Evidence'  || q.displayName eq 'RNA Seq Evidence'}">
                                 <imp:image width="40" alt="Revised feature icon" title="This category has been revised" 
                                            src="wdk/images/revised-small.png" />
                               </c:if>
                             </c:if>
                             --%>
                      </li>
                    </c:forEach>
                  </ul>
                </div>
              </li>
        <%--     </c:if> --%>
          </c:forEach>
        </ul> 
      </div>

      <div class="infobottom">
        <%--  <div id="mysearchhist">
              <a href="<c:url value="/showApplication.do?showHistory=true"/>">My Searches: ${count}</a>
        </div> --%>
      </div>
    </c:otherwise>
  </c:choose> 

  <!--<imp:image src="images/bubble_bottom.png" alt="" width="247" height="35" />-->
</div>
