<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<%-- 
attributes:
    comments: an array of Comment object
    stable_id: the stable id the comments are on
    project_id: the project id for the comments
--%>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<site:header title="${wdkModel.displayName} : User Comments on ${stable_id}"
                 banner="Comments on ${stable_id}"/>

<head>
<style type="text/css">
  table.mybox {
    width:     90%;
    max-width: 100%;
    padding:   6px;
    color:     #000;
    cellpandding: 3;
    cellspacing: 3;
    align: center;
  }
  td {
    padding:   3px;
    vertical-align: top;
  }
  th {
    vertical-align: top;
    padding:     3px;
    background:  #88aaca ;
    color:       #250517;
    font-weight: normal;
  }
  ul.myul {
    list-style: inherit;
    margin:auto 1.5em;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  } 
</style>
<script type="text/javascript">                                         
$(document).ready(function() { 
  $("a.delete").click(function() {
    return confirm("Really delete this comment? Press OK to delete.");
  });
});
</script>     
</head>

<c:choose>
    <c:when test="${fn:length(comments) == 0}">
        <p>There's currently no comment for ${stable_id}.</p>
    </c:when>
    <c:otherwise> <%-- has comments for the stable id --%>

      <div id=menu><center>${param.commentTargetId} comments on ${stable_id}</center></div>

      <c:forEach var="comment" items="${comments}">

        <table class=mybox>

            <tr>
               <th width=150>Headline:</th>
               <th> 
               <a name=${comment.commentId}>${comment.headline}</a> 
               <c:if test="${comment.email eq wdkUser.email}">
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
                   <td> 
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
                   <td> 
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
                        <th width=100>Preview</th>
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
                      <td>
                       <a href="/common/community/${comment.projectName}/${file[1]}">
                        <img src='/common/community/${comment.projectName}/${file[1]}' width=80 height=80/></a>
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

<hr/><br/><br/>
<site:footer/>


