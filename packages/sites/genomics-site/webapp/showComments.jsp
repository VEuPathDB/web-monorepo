<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %> 
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>

<%-- 
attributes:
    comments: an array of Comment object
    stable_id: the stable id the comments are on
    project_id: the project id for the comments
--%>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<imp:pageFrame title="${wdkModel.displayName} : User Comments on ${stable_id}" >

<head>
<script type="text/javascript">                                         
$(document).ready(function() { 
  $("a.delete").click(function() {
    return confirm("Really delete this comment? Press OK to delete.");
  });
});
</script>     
</head>

<c:choose>
  <c:when test="${comment_target_id eq 'gene'}">
    <c:set var="returnUrl">
      <c:url value="/showRecord.do?name=GeneRecordClasses.GeneRecordClass&project_id=${wdkModel.projectId}&primary_key=${stable_id}"/>
    </c:set>
  </c:when>

  <c:when test="${comment_target_id eq 'isolate'}">
    <c:set var="returnUrl">
      <c:url value="/showRecord.do?name=IsolateRecordClasses.IsolateRecordClass&project_id=${wdkModel.projectId}&primary_key=${stable_id}"/>
    </c:set>
  </c:when>

  <c:otherwise>
    <c:set var="returnUrl"> 
      <c:url value="/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&project_id=${wdkModel.projectId}&primary_key=${stable_id}"/>
    </c:set>
  </c:otherwise>
</c:choose> 

<c:choose>
  <c:when test="${fn:length(comments) == 0}">
    <p>There's currently no comment for <a href="${returnUrl}">${stable_id}</a>.</p>
  </c:when>
  <c:otherwise> <%-- has comments for the stable id --%>

      <p align="center">${comment_target_id} comments on <a href="${returnUrl}">${stable_id}</a></p>
      <br/>

      <c:forEach var="comment" items="${comments}">
        <table style="table-layout: fixed; width: 100%">
            <tr>
               <th width=250>Headline:</th>
               <th style="word-wrap: break-word"> 
               <a name=${comment.commentId}>${comment.headline}</a> 
               <c:if test="${comment.userId eq wdkUser.userId}">
               &nbsp;&nbsp;&nbsp; 

               <a href="editComment.do?projectId=${comment.projectName}&stableId=${comment.stableId}&commentTargetId=${comment.commentTarget}&commentId=${comment.commentId}&email=${wdkUser.email}">[edit comment]</a>

               <a href="deleteComment.do?projectId=${comment.projectName}&stableId=${comment.stableId}&commentTargetId=${comment.commentTarget}&commentId=${comment.commentId}&email=${wdkUser.email}" class="delete">[delete comment]</a>
               </c:if>
               </th>
            </tr>

            <tr>
               <td>Comment Id:</td>
               <td>${comment.commentId}</td>
            </tr>

            <tr>
               <td>Comment Target:</td>
               <td>${comment.commentTarget} ${comment.stableId}</td>
            </tr>

            <tr>
               <td>Author:</td>
                <td>${comment.userName}, ${comment.organization} </td>
            </tr>

            <c:choose>
            <c:when test="${comment.authors ne null}">
            <tr>
               <td>Other Author(s):</td>
                <td> <c:forEach items="${comment.authors}" var="row">
                          ${row} 
                      </c:forEach>
                </td>
            </tr> 
            </c:when>
            </c:choose>

            <tr>
               <td>Project:</td>
                <td>${comment.projectName}, version ${comment.projectVersion} </td>
            </tr>

            <tr>
               <td>Organism:</td>
                <td>${comment.organism}</td>
            </tr>

            <tr> 
               <td>Date:</td>
                <td>${comment.commentDate}</td>
            </tr>

            <c:choose>
              <c:when test="${param.commentTargetId eq 'phenotype'}">
                <tr>
                 <td>Mutant Status:</td>
                 <td>${comment.mutantStatusName}</td>
                </tr> 

                <tr>
                 <td>Genetic Background:</td>
                 <td>${comment.background}</td>
                </tr> 

                <tr>
                 <td>Mutant Type:</td>
                 <td>${comment.mutantTypeName}</td>
                </tr> 

                <tr>
                 <td>Mutation Method:</td>
                 <td>${comment.mutationMethodName}</td>
                </tr> 

                <tr>
                 <td>Mutation Method Description:</td>
                 <td>${comment.mutationDescription}</td>
                </tr> 

                <tr>
                 <td>Mutant Reporter:</td>
                  <td> 
                    <c:set var="i" value="0"/>
                    <c:forEach items="${comment.mutantReporterNames}" var="row">
                      <c:set var="i" value="${i+1}"/>
                        ${i}) <c:out value="${row}"/>
                    </c:forEach>
                  </td>
                </tr> 

                <tr>
                 <td>Mutant Marker:</td>
                  <td> 
                    <c:set var="i" value="0"/>
                    <c:forEach items="${comment.mutantMarkerNames}" var="row">
                      <c:set var="i" value="${i+1}"/>
                        ${i}) <c:out value="${row}"/>
                    </c:forEach>
                  </td>
                </tr> 

                <tr>
                 <td>Phenotype Category:</td>
                 <td>${comment.mutantCategoryName}</td>
                </tr> 

                <tr>
                   <td>Phenotype Description:</td> 
                   <td style="word-wrap: break-word"> 
                   <site:BBCode content="${comment.content}" />
                   </td>
                </tr>

                <tr>
                 <td>Phenotype Tested in:</td>
                 <td>${comment.phenotypeLocName}</td>
                </tr> 

                <tr>
                 <td>Mutant Expression:</td>
                 <td>${comment.mutantExpressionName}</td>
                </tr> 

              </c:when>

              <c:otherwise>

                <tr>
                   <td>Content:</td> 
                   <td style="word-wrap: break-word"> 
                   <site:BBCode content="${comment.content}" />
                   </td>
                </tr>

                <tr>
                   <td>Genbank Accessions:</td>
                    <td> <c:forEach items="${comment.accessions}" var="row">
                            <a href="http://www.ncbi.nlm.nih.gov/sites/entrez?db=nuccore&cmd=&term=<c:out value="${row}"/>"><c:out value="${row}"/></a>
                          </c:forEach>
                    </td>
                </tr>

                <tr>
                   <td>Other Related Genes:</td>
                    <td> 
                    <c:forEach items="${comment.associatedStableIds}" var="row">

                     <c:if test="${comment.commentTarget eq 'gene'}">
                     <a href="showRecord.do?name=GeneRecordClasses.GeneRecordClass&source_id=<c:out value="${row}"/>"><c:out value="${row}"/> </a>
                     </c:if>

                     <c:if test="${comment.commentTarget eq 'isolate'}">
                     <a href="showRecord.do?name=IsolateRecordClasses.IsolateRecordClass&source_id=<c:out value="${row}"/>"><c:out value="${row}"/> </a>
                     </c:if>

                     </c:forEach>

                    </td>
                </tr>

                <tr>
                 <td>Category:</td>
                  <td> 
                    <c:set var="i" value="0"/>
                    <c:forEach items="${comment.targetCategoryNames}" var="row">
                      <c:set var="i" value="${i+1}"/>
                        ${i}) <c:out value="${row}"/>
                    </c:forEach>
                  </td>
                </tr>

              <tr>
               <td>Location:</td>

                        <%-- display locations --%>
                    <c:set var="locations" value="${comment.locations}" />
                    <c:if test="${fn:length(locations) > 0}">
                      
                         <td>
                      <c:set var="firstItem" value="1" />
                      <c:forEach var="location" items="${locations}">
                          <c:choose>
                              <c:when test="${firstItem == 1}">
                                  <c:set var="firstItem" value="0" />
                              </c:when>
                              <c:otherwise>, </c:otherwise>
                          </c:choose>
                          ${location.coordinateType}: ${location.locationStart}-${location.locationEnd}
                          <c:if test="${location.reversed}">(reversed)</c:if>
                      </c:forEach>
                        </td>
                    </c:if>
                </tr>

               </c:otherwise>
            </c:choose>

            <tr>
               <td>Digital Object Identifier(DOI) Name(s):</td>
                <td> <c:forEach items="${comment.dois}" var="row">
                        <a href="http://dx.doi.org/<c:out value="${row}"/>"><c:out value="${row}"/></a>
                      </c:forEach>
                </td>
            </tr>

            <tr>
               <td>PMID(s):</td>
                <td> <c:forEach items="${comment.pmIds}" var="row">
                        <c:import url="http://${pageContext.request.serverName}/cgi-bin/pmid2title">
                          <c:param name="pmids" value="${row}"/>
                        </c:import>
                      </c:forEach>
                </td>
            </tr> 

            <tr>
               <td>Uploaded files:</td>
               <td> 
                  <table border=1>
                  <c:set var="i" value="0"/>
                  <c:forEach items="${comment.files}" var="row">
                    <c:if test="${i == 0}">
                      <tr align=center>
                        <th width=20>#</th>
                        <th width=150>Name/Link</th>
                        <th width=200>Description</th>
                        <th width=100>Preview<br><span style="font-size:70%;">(only if image)</span></th>
                      </tr>
                    </c:if>

                     <c:set var="i" value="${i+1}"/>
                     <c:set var="file" value="${fn:split(row, '|')}"/>
                     <tr>
                       <td align=center>${i}</td>
                       <td><a href="/common/community/${comment.projectName}/${file[1]}">
                        <c:out value="${file[1]}"/></a>
                      </td>
                      <td>${file[2]}</td>
                      <td>&nbsp;
  <c:if test="${ fn:containsIgnoreCase(file[1], '.png') || 
                 fn:containsIgnoreCase(file[1], '.jpg') ||
                 fn:containsIgnoreCase(file[1], '.jpeg')   }">
                       <a href="/common/community/${comment.projectName}/${file[1]}">
                        <img src='/common/community/${comment.projectName}/${file[1]}' width=80 height=80/></a>
  </c:if>
                      </td>

                    </tr>
                  </c:forEach>
                  </table>
               </td>
            </tr> 
                    
            <tr>
               <td>External Database:</td>

                    <%-- display external database info --%>
                    <c:set var="externalDbs" value="${comment.externalDbs}" />
                    <c:if test="${fn:length(externalDbs) > 0}">
                        <td>
                      <c:set var="firstItem" value="1" />
                      <c:forEach var="externalDb" items="${externalDbs}">
                          <c:choose>
                              <c:when test="${firstItem == 1}">
                                  <c:set var="firstItem" value="0" />
                              </c:when>
                              <c:otherwise>, </c:otherwise>
                          </c:choose>
                          ${externalDb.externalDbName} ${externalDb.externalDbVersion}
                      </c:forEach>
                        </td>
                    </c:if>
              </tr>


                <tr>
               <td>Status:</td>
                <td>
                  <c:if test="${comment.reviewStatus == 'accepted'}">
                      Status: <em>included in the Annotation Center's official annotation</em> 
                   </c:if>
                </td>
                </tr> 

               </table>
            <br />
          </c:forEach>
    </c:otherwise> <%-- has comments for the stable id --%>
</c:choose>
</imp:pageFrame>
