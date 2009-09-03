<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="logic" uri="http://jakarta.apache.org/struts/tags-logic" %>

<c:set var="err" scope="request" value="${requestScope['org.apache.struts.action.ERROR']}"/>
<c:set var="exp" scope="request" value="${requestScope['org.apache.struts.action.EXCEPTION']}"/>

<c:set var="props" value="${applicationScope.wdkModel.properties}" /> 
<c:set var="to" value="${wdkModel.projectId}_annotators@pcbi.upenn.edu" /> 
<c:set var="from" value="${wdkModel.projectId}_annotators@pcbi.upenn.edu" />
<c:set var="subject" value="${commentForm.commentTargetId} comment ${commentForm.stableId}" />
<c:set var="body" value="${body}" />

<c:set var="strand" value="${commentForm.strand}" /> 

<c:if test="${strand eq '-'}">
  <c:set var="pos" value="" />
  <c:set var="rev" value="checked" />
</c:if>

<c:if test="${strand ne '-'}">
  <c:set var="pos" value="checked" />
  <c:set var="rev" value="" />
</c:if>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName}.org :: Add A Comment"
                 banner="Add A Comment"/>
<head>
<script type="text/javascript">
$(document).ready(function(){
        $('#oldCommentFile td img.delete').click(function(){
    $(this).parent().parent().parent().remove();
    });
});


$(function()
{ 
 $("#trigger").click(function(event) {
 event.preventDefault();
 $("#box").slideToggle();
});
  
$("#box a").click(function(event) {
  event.preventDefault();
  $("#box").slideUp();
});
});
</script>
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
    #box {
       display: none;
    }
    div.border{
      border: 1px solid lightgrey;
      width: 600px;
    }

  
</style>

<script type="text/javascript" src="/assets/js/lib/jquery-validate/jquery.validate.pack.js"></script>
<script type="text/javascript" src="/assets/js/fileUpload.js"></script>

<script type="text/javascript">
$(document).ready(function(){
   $("#preview").click(function(){
   $("#wrapper").show();
   var pmids = $('#pmIds').val(); 
   var pmids = pmids.replace(/\D/g, "-");
   $("#quote p").load("/cgi-bin/pmid2title?pmids=" + pmids);
  });      
  $("#remove").click(function(){
   $("#wrapper").hide();
  });      
}); 
</script>

</head>

<body>

<c:choose>

  <c:when test="${empty wdkUser || wdkUser.guest}">
    <p align=center>Please login to post a comment.</p>
    <table align='center'><tr><td><site:login/></td></tr></table>
  </c:when>
  
  <c:otherwise>

    <c:choose>
      <c:when test="${submitStatus eq 'success'}">
    
        <c:choose>

          <c:when test="${commentForm.commentTargetId eq 'gene'}">
            <c:set var="returnUrl">
            <c:url value="/showRecord.do?name=GeneRecordClasses.GeneRecordClass&project_id=${wdkModel.projectId}&primary_key=${commentForm.stableId}"/>
            </c:set>
          </c:when>

          <c:when test="${commentForm.commentTargetId eq 'isolate'}">
            <c:set var="returnUrl">
            <c:url value="/showRecord.do?name=IsolateRecordClasses.IsolateRecordClass&project_id=${wdkModel.projectId}&primary_key=${commentForm.stableId}"/>
            </c:set>
          </c:when>

          <c:otherwise>
            <c:set var="returnUrl"> 
            <c:url value="/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&project_id=${wdkModel.projectId}&primary_key=${commentForm.stableId}"/>
            </c:set>
          </c:otherwise>

        </c:choose>

        <c:choose>

          <c:when test="${param.bulk ne 'yes'}">
            <site:email
                  to="${wdkUser.email}, ${to}"
                  from="${from}"
                  subject="${subject}"
                  body="${body}"
            />
          </c:when>
          <c:otherwise>
            <site:email
                  to="${to}"
                  from="${from}"
                  subject="${subject}"
                  body="${body}"
            />
          </c:otherwise>

        </c:choose>
           
        <p align=center>Thank you for the comment.
        <br/><br/>
      
         <a href="${returnUrl}">Return to ${commentForm.commentTargetId} ${commentForm.stableId} page</a>
         </p>
       </c:when>    

       <c:otherwise>

    <c:if test="${param.flag ne '0'}">
          <wdk:errors/>
    </c:if>


      <html:form method="post" action="addComment.do" styleId="uploadForm" enctype="multipart/form-data">

        <html:hidden property="commentTargetId" value="${commentForm.commentTargetId}"/>
        <html:hidden property="stableId" value="${commentForm.stableId}"/>
        <html:hidden property="externalDbName" value="${commentForm.externalDbName}"/>
        <html:hidden property="externalDbVersion" value="${commentForm.externalDbVersion}"/>
        <html:hidden property="organism" value="${commentForm.organism}"/>
        <html:hidden property="commentTargetId" value="${commentForm.commentTargetId}"/>
        <%--<html:hidden property="locations" value="${fn:replace(commentForm.locations, ',', '')}"/> --%>
        
      <table class="mybox" cellspacing=3 width=90% border=0>

      <tr>
        <td colspan=3 align=center>
          <div class="medium">
          <h3>
          <c:choose>
            <c:when test="${commentForm.commentId ne null}"> 
              Edit comment ${commentForm.commentId} ${commentForm.stableId} <br/>

              <html:hidden property="commentId" value="${commentForm.commentId}"/> 


            </c:when>

            <c:otherwise> 
               Add a comment to ${commentForm.commentTargetId} ${commentForm.stableId}
            </c:otherwise>
          </c:choose>
          </h3>
          </div>
        </td>
      </tr>

      <tr class="medium">
        <td colspan=3> 
      Please add only scientific comments to be displayed on the ${commentForm.commentTargetId} page for ${commentForm.stableId}. 
      If you want to report a problem, use the <a href="<c:url value='/help.jsp'/>">support page.</a>
      
      Your comments are appreciated. 
      
     <c:if test="${wdkModel.projectId eq 'TriTrypDB'}" > 
        They will be forwarded to the Annotation Center for review and possibly 
        included in future releases of the genome. 
    </c:if>

     <c:if test="${wdkModel.projectId eq 'CryptoDB'}" > 
        They will be forwarded to the genome curators.
    </c:if>
      
    <c:if test="${commentForm.commentTargetId eq 'gene'}">
      If this is a <b>new gene</b>, please <a href="addComment.do?stableId=${commentForm.contig}&commentTargetId=genome&externaDbName=${commentForm.externalDbName}&externalDbVersion=${commentForm.externalDbVersion}&flag=0">click here</a>.
    </c:if>

    <c:if test="${commentForm.commentTargetId eq 'genome'}">
      This form can be used for adding comments for a new gene.
    </c:if>


      </td>
      </tr>

      <tr class="medium">
        <th colspan=3>Part I: Comment</th>
      </tr>

      <tr class="medium">
        <td width=10>&nbsp;</td>
        <td>Headline <font color=red>*</font></td>
        <td>
          <html:text property="headline" size="70"/>
        </td>
      </tr>

      <tr class="medium">
        <td>&nbsp;</td>
        <td>Category<br/></td>
        <td> 
          <logic:iterate id="category" property="categoryList" name="commentForm"> 
            <bean:define id="categorybean" name="category" type="org.apache.struts.util.LabelValueBean"/>
            <html:multibox property="targetCategory">
              <bean:write name="categorybean" property="value"/>
            </html:multibox>
              <bean:write name="categorybean" property="label"/>
          </logic:iterate> 
        </td>
      </tr>
        
      <tr class="medium" valign=top>
        <td>&nbsp;</td>
        <td>Comment <font color=red>*</font></td>
        <td><html:textarea property="content" rows="5" cols="70"/></td>
      </tr>

      <c:if test="${commentForm.commentTargetId eq 'gene' || commentForm.commentTargetId eq 'genome'}">

      <tr class="medium">
        <td rowspan=2>&nbsp;</td>

        <td valign=top>Location<br/> ${locationStr}</td>

        <td class="medium">
          Strand: 
             <input type=radio name="locType" value=genomef ${pos}>Forward</input>
-            <input type=radio name="locType" value=genomer ${rev}>Reverse</input> 
        </td>
      </tr>

      <tr class="medium">
       <td></td>
        <td nowrap="true"> Genome Coordinates:
            
              <c:if test="${commentTarget.commentTargetId eq 'gene'}">
                <input type=radio name="locType" value=protein>Protein Coordinates</input>
              </c:if>

              <br>
          <html:text property="locations" size="70"/>

          <a href="javascript:void(0)" onmouseover="this.T_OFFSETY=10;return escape('<ul class=myul><li>Leave blank if Location is not applicable</li><li>Example 1: 1000-2000</li><li>Example 2: 1000-2000, 2500-2600, 3000-5000</li><li>Always use the forward strand (5\'-3\') coordinates</li><ul>')">
          <img src="/assets/images/help.png" align=bottom border=0></a>
        </td>

      </tr>
      </c:if>

      <c:if test="${commentForm.commentTargetId eq 'isolate'}">
        <input type="hidden" name="locType" value="genomef"/>
        <input type="hidden" name="locations" value=""/>
      </c:if>

      <tr class="medium">
        <th colspan=3>Part II: Evidence for This Comment (Optional)</th>
      </tr>

      <tr class="medium">
        <td>&nbsp;</td>
        <td>Upload File</td>
        <td>
        
         <c:if test="${commentForm.files ne null}"> 

         <c:forEach var="file" items="${commentForm.files}">

            <c:set var="fArray" value="${fn:split(file, '|')}" />
            <c:set var="fId" value="${fArray[0]}"/>
            <c:set var="fName" value="${fArray[1]}"/>
            <c:set var="fNote" value="${fArray[2]}"/>

         <table>
         <tr><td>

         <table id="oldCommentFile" style="border:1px solid black;background-color:#cccccc">

           <tr>
             <td>Select a file:</td>
             <td> 
              <html:text property="existingNames" value="${fName}" size="40" disabled="true"/> 
             </td>
             <td align="right">
             
              <html:hidden property="existingFiles" value="${file}"/> 
              <img class="delete" src="images/remove.gif">
             </td>
           </tr>

           <tr>
            <td style="vertical-align:top">
               Brief Description:<br>(4000 max characters)
            </td> 
            <td colspan="2">
              <textarea name="existingNotes" rows="3" cols="50" maxlength="4000" disabled>${fNote}</textarea>
            </td>
           </tr>
          </table>

          </td></tr>
          </table>

          </c:forEach>

         </c:if>


          <table id="fileSelTbl"></table>
          <table>
            <tr><td><input type="button" name="newfile" value="Add Another File" id="newfile"></td></tr>
          </table>
        </td>
      </tr>

      <tr class="medium">
        <td>&nbsp;</td>
        <td valign=top>PubMed ID(s)</td>
        <td>
          <html:text property="pmIds" styleId="pmIds" size="70"/>
          <a href="javascript:void(0)" onmouseover="this.T_BORDERWIDTH=1;this.T_OFFSETY=10;return escape('<ul class=myul><li> First, find the publcation in <a href=\'http://www.ncbi.nlm.nih.gov/pubmed\'>PubMed</a> based on author or title</li><li>Enter one or more IDs in the box above separated by \',\'</li><li>Example: 18172196,10558988</li></ul>')">
          <img src="/assets/images/help.png" align=bottom border=0></a>
          <br />
          <div id="wrapper" style="display:none;">
            <div id="quote" class="border">
            <img id="remove" src="images/remove.gif" align=right>
            <p></p></div>
          </div>
          <input type="button" id="preview" value="Preview">
        </td>
      </tr>

      <tr class="medium">
        <td>&nbsp;</td>
        <td valign=top>Genbank Accession(s)</td>
        <td>
          <html:text property="accessions" size="70"/>
          <a href="javascript:void(0)" onmouseover="this.T_BORDERWIDTH=1;this.T_OFFSETY=10;return escape('<ul class=myul><li>Enter one or more Acccession(s) in the box above separated by \',\'</li></ul>')">
          <img src="/assets/images/help.png" align=bottom border=0></a>
        </td>
      </tr>

      <tr class="medium">
        <th colspan=3>Part III: Other Genes to which you want to apply this comment (Optional)</th>
      </tr>

      <tr class="medium">
        <td>&nbsp;</td>

        <c:choose> 
          <c:when test="${commentForm.commentTargetId eq 'gene'}"> 
            <td valign=top>Gene Identifiers</td>
          </c:when>

          <c:when test="${commentForm.commentTargetId eq 'isolate'}"> 
            <td valign=top>Isolate Identifiers</td>
          </c:when>

          <c:otherwise>
            <td valign=top>Gene Identifiers</td>
          </c:otherwise>
        </c:choose>

        <td> 
          <html:textarea property="associatedStableIds" rows="3" cols="70"/>
         <a href="javascript:void(0)" onmouseover="this.T_BORDERWIDTH=1;this.T_OFFSETY=10;return escape('<ul class=myul><li>Enter asscociated Gene/Genome/Isolate Id(s) in the box above separated by space or \',\'. </li><li>The same comment and uploaded files will be showed on those associated gene/genome/isolate pages.</li></ul>')"> 
          <img src="/assets/images/help.png" align=top border=0></a>
        </td>
      </tr>
        
      <tr class="medium">
        <td colspan=3 align=center>
        <br/>
        <html:submit property="submit" value="Add Comment"/></td>
        </tr>
      
      </table>
      </html:form>

      <hr>
      
<c:set var="formatHelp" value="
        <div class=medium>
        Use the formatting commands exemplified below to add bold, italics, underline, superscript, subscript 
        and lists to your comment:
        <br/>
        <br/>
        Your comment can contain [i]italicized text[/i], some [b]bold words[/b] and a few [u]underlined words[/u]. 
        Subscripts such as A[sub]min[/sub] or superscripts such as B[sup]max[/sup] are allowed. You can also
        use numbered lists such as:
        <br/>
        [ol]<br/>
        [li] One Apple[/li]<br/>
        [li] Two Oranges[/li]<br/>
        [li] Three bananas[/li]<br/>
        [/ol]<br/>
        <br/>
        using the [OL] tag, or bulleted lists using the [UL] tag:<br/>
        [ul]<br/>
        [li] One Apple[/li]<br/>
        [li] Two Oranges[/li]<br/>
        [li] Three bananas[/li]<br/>
        [/ul]<br/>
        <br/>
        Shown below is how the above comment appears to everyone:
        </div>
        <table class=mybox>
        <tr><td>
        <div class=medium>
        Your comment can contain <i>italicized text</i>, some <b>bold words</b> and a few <u>underlined words</u>. 
        Subscripts such as A<sub>min</sub> or superscripts such as Z<sup>max</sup> are allowed. You can also
        use numbered lists such as:

        <ol>
        <li>One Apple</li>
        <li>Two Oranges</li>
        <li>Three bananas</li>
        </ol>

        using the [OL] tag, or bulleted lists using the [UL] tag:
        
        <ul>
        <li> Apples</li>
        <li> Oranges</li>
        <li> Bananas</li>
        </ul>
        </div>

        <br/>
        <br/>
        <b>Note:</b> line break tag &lt;br/&gt; <b>won't</b> be rendered. If you need a <b>new line</b>, please use the \"Enter\" key.  
        </td></tr></table>"/>
    
    <table width=60% align=center>
    <tr><td>

      <a href="#" id="trigger"><img class="plus-minus plus" src="/assets/images/sqr_bullet_plus.gif" alt="" />&nbsp; Format description</a>
      <div id="box">
      ${formatHelp}
      </div>

    </td></tr>
    </table>
    
    </c:otherwise>
    </c:choose>  
  </c:otherwise>
</c:choose> 
<br/><br/>              
<script language="JavaScript" type="text/javascript" src="/gbrowse/wz_tooltip.js"></script>
</body>
<site:footer/>
