<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>

<c:set var="err" scope="request" value="${requestScope['org.apache.struts.action.ERROR']}"/>
<c:set var="exp" scope="request" value="${requestScope['org.apache.struts.action.EXCEPTION']}"/>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName}.org :: Add A Comment"
                 banner="Add A Comment"/>
<head>
<script type="text/javascript">
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

  
</style>

<script type="text/javascript" src="/assets/js/fileUpload.js"></script>

</head>

<body onload='addFileSelRow();'>

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

          <c:otherwise>
            <c:set var="returnUrl"> 
            <c:url value="/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&project_id=${wdkModel.projectId}&primary_key=${commentForm.stableId}"/>
            </c:set>
          </c:otherwise>

        </c:choose>
            
         <p align=center>Thank you for the comment.
         <br/><br/>
      
         <a href="${returnUrl}">Return to ${commentTarget.displayName} ${commentForm.stableId} page</a>
         </p>
       </c:when>    

       <c:otherwise>

    <c:if test="${param.flag ne '0'}">
          <wdk:errors/>
    </c:if>


      <html:form method="post" action="addComment.do" enctype="multipart/form-data">
        <html:hidden property="commentTargetId" value="${commentForm.commentTargetId}"/>
        <html:hidden property="stableId" value="${commentForm.stableId}"/>
        <html:hidden property="externalDbName" value="${commentForm.externalDbName}"/>
        <html:hidden property="externalDbVersion" value="${commentForm.externalDbVersion}"/>
        <html:hidden property="organism" value="${commentForm.organism}"/>
        <html:hidden property="locations" value="${fn:replace(commentForm.locations, ',', '')}"/>
        
      <table class="mybox" cellspacing=3 width=90% border=0>

      <tr>
        <td colspan=3 align=center><div class="medium"><h3>Add a comment to ${commentForm.commentTargetId} ${commentForm.stableId}</h3></div></td>
      </tr>

      <tr class="medium">
        <td colspan=3> 
      Please add only scientific comments to be displayed on the ${commentForm.commentTargetId} page for ${commentForm.stableId}. 
      If you want to report a problem, use the <a href="<c:url value='/help.jsp'/>">support page.</a>
      
      Your comments are appreciated. They will be forwarded to the Annotation Center for review and possibly 
      included in future releases of the genome. 
      
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
          <a href="javascript:void(0)" onmouseover="this.T_OFFSETY=10;return escape('test')" ><img src="/assets/images/help.png" align=bottom border=0></a>
        </td>
      </tr>


      <!--  gene_model      = 1 in comments2.TargetCategory -->
      <!--  gene_name       = 2 in comments2.TargetCategory -->
      <!--  gene_function   = 3 in comments2.TargetCategory -->
      <!--  gene_expression = 4 in comments2.TargetCategory -->
      <!--  gene_sequence   = 5 in comments2.TargetCategory -->
      <!--  gene_other      = 6 in comments2.TargetCategory -->

      <tr class="medium">
        <td>&nbsp;</td>
        <td>Category<br/></td>
        <td>
          <c:if test="${commentForm.commentTargetId eq 'gene'}">
            <html:checkbox property="targetCategory" value="1">Gene Model</html:checkbox> 
            <html:checkbox property="targetCategory" value="2">Name/Product</html:checkbox> 
            <html:checkbox property="targetCategory" value="3">Function</html:checkbox> 
            <html:checkbox property="targetCategory" value="4">Expression</html:checkbox> 
            <html:checkbox property="targetCategory" value="5">Sequence</html:checkbox>
          </c:if>
          <c:if test="${commentForm.commentTargetId eq 'isolate'}">
            <html:checkbox property="targetCategory" value="7">Characteristics/Overview</html:checkbox> 
            <html:checkbox property="targetCategory" value="8">Reference</html:checkbox> 
            <html:checkbox property="targetCategory" value="9">Sequence</html:checkbox> 
          </c:if>
          <c:if test="${commentForm.commentTargetId eq 'genome'}">
            <html:checkbox property="targetCategory" value="10">New Gene</html:checkbox> 
            <html:checkbox property="targetCategory" value="11">New Feature</html:checkbox> 
            <html:checkbox property="targetCategory" value="12">Centromere</html:checkbox> 
            <html:checkbox property="targetCategory" value="13">Genomic Assembly</html:checkbox> 
            <html:checkbox property="targetCategory" value="14">Sequence</html:checkbox> 
          </c:if>
          <c:if test="${commentForm.commentTargetId eq 'snp'}">
            <html:checkbox property="targetCategory" value="15">Characteristics/Overview</html:checkbox> 
            <html:checkbox property="targetCategory" value="16">Gene Context</html:checkbox> 
            <html:checkbox property="targetCategory" value="17">Strains</html:checkbox> 
          </c:if> 
          <c:if test="${commentForm.commentTargetId eq 'est'}">
            <html:checkbox property="targetCategory" value="19">Characteristics/Overview</html:checkbox> 
            <html:checkbox property="targetCategory" value="20">Alignment</html:checkbox> 
            <html:checkbox property="targetCategory" value="21">Sequence</html:checkbox> 
            <html:checkbox property="targetCategory" value="22">Assembly</html:checkbox> 
          </c:if>
          <c:if test="${commentForm.commentTargetId eq 'assembly'}">
            <html:checkbox property="targetCategory" value="23">Characteristics/Overview</html:checkbox> 
            <html:checkbox property="targetCategory" value="24">Consensus Sequence</html:checkbox> 
            <html:checkbox property="targetCategory" value="25">Alignment</html:checkbox> 
            <html:checkbox property="targetCategory" value="26">Include Est's</html:checkbox> 
          </c:if>
          <c:if test="${commentForm.commentTargetId eq 'sage'}">
            <html:checkbox property="targetCategory" value="27">Characteristics/Overview</html:checkbox> 
            <html:checkbox property="targetCategory" value="28">Gene</html:checkbox> 
            <html:checkbox property="targetCategory" value="29">Alignment</html:checkbox> 
            <html:checkbox property="targetCategory" value="30">Library Counts</html:checkbox> 
          </c:if>
          <c:if test="${commentForm.commentTargetId eq 'orf'}">
            <html:checkbox property="targetCategory" value="31">Alignment</html:checkbox> 
            <html:checkbox property="targetCategory" value="32">Sequence</html:checkbox> 
          </c:if>
        </td>
      </tr>
        
      <tr class="medium" valign=top>
        <td>&nbsp;</td>
        <td>Comment <font color=red>*</font></td>
        <td><html:textarea property="content" rows="5" cols="70"/></td>
      </tr>

      <tr class="medium">
        <td rowspan=2>&nbsp;</td>

        <td valign=top>Location<br/> ${locationStr}</td>

        <td class="medium">
          Strand:
             <input type=radio name="locType" value=genomef checked>Forward</input>
             <input type=radio name="locType" value=genomer>Reverse</input>
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

      <tr class="medium">
        <th colspan=3>Part II: Evidence for This Comment (Optional)</th>
      </tr>

      <tr class="medium">
        <td>&nbsp;</td>
        <td>Upload File</td>
        <td><table id="fileSelTbl"></table></td>
      </tr>

      <tr class="medium">
        <td>&nbsp;</td>
        <td valign=top>PMID(s)</td>
        <td>
          <html:text property="pmIds" size="70"/>
          <a href="javascript:void(0)" onmouseover="this.T_BORDERWIDTH=1;this.T_OFFSETY=10;return escape('<ul class=myul><li> First, find the publcation in <a href=\'http://www.ncbi.nlm.nih.gov/pubmed\'>PubMed</a> based on author or title</li><li>Enter one or more IDs in the box above separated by \',\'</li><li>Example: 18172196,10558988</li></ul>')">
          <img src="/assets/images/help.png" align=bottom border=0></a>
        </td>
      </tr>

      <tr class="medium">
        <td>&nbsp;</td>
        <td valign=top>Genbank Accession(s)</td>
        <td>
          <html:text property="accessions" size="70"/>
            <ul class="myul">
              <li>Enter one or more Acccession(s) in the box above separated by ','</li>
            </ul>
        </td>
      </tr>

      <tr class="medium">
        <th colspan=3>Part III: Other Genes Relating to This Comment (Optional)</th>
      </tr>

      <tr class="medium">
        <td>&nbsp;</td>
        <td valign=top>Other Related Genes</td>
        <td> <html:textarea property="associatedStableIds" rows="3" cols="70"/>
            <ul class="myul">
              <li>Enter one or more Gene Id(s) in the box above separated by ','. </li>
              <li>The same comment and files will be appear on those gene ids.</li>
            </ul>
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
        <p/>
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
