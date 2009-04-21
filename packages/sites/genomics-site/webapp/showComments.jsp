<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%-- 
attributes:
    comments: an array of Comment object
    stable_id: the stable id the comments are on
    project_id: the project id for the comments
--%>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

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
    padding:   3px;
    background:  #88aaca ;
    color:  #ffffff;
  }
  ul.myul {
    list-style: inherit;
    margin:auto 1.5em;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  } 
</style>


<c:choose>
    <c:when test="${fn:length(comments) == 0}">
        <p>There's currently no comment for ${stable_id}.</p>
    </c:when>
    <c:otherwise> <%-- has comments for the stable id --%>

      <c:forEach var="comment" items="${comments}">

        <table class=mybox>

            <tr>
               <th width=150>Headline:</th>
               <th> <a name=${comment.commentId}>${comment.headline}</a></th>
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

            <tr>
               <td>Content:</td> 
               <td> <p align=justify>${comment.content}</p> </td>
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
               <td>Genbank Accessions:</td>
                <td> <c:forEach items="${comment.accessions}" var="row">
                        <a href="http://www.ncbi.nlm.nih.gov/sites/entrez?db=nuccore&cmd=&term=<c:out value="${row}"/>"><c:out value="${row}"/></a>
                      </c:forEach>
                </td>
            </tr>

            <tr>
               <td>Other Related Genes:</td>
                <td> <c:forEach items="${comment.associatedStableIds}" var="row">
                       <a href="showRecord.do?name=GeneRecordClasses.GeneRecordClass&source_id=<c:out value="${row}"/>"><c:out value="${row}"/> </a>
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


