<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>

<!-- get wdkRecord from proper scope -->
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<!-- display page header with recordClass type in banner -->
<c:set value="${wdkRecord.recordClass.type}" var="recordType"/>
<site:header banner="${recordType}"/>

<h2 style="text-align: center;">
<wdk:recordPageBasketIcon />
</h2>

<%-- quick tool-box for the record --%>
<site:recordToolbox />

<table width="100%">

  <!-- Added by Jerric - Display primary key content -->
  <c:set value="${wdkRecord.primaryKey}" var="primaryKey"/>
  <c:set var="pkValues" value="${primaryKey.values}" />
  <c:forEach items="${pkValues}" var="pkValue">
    <tr>
      <td><b>${pkValue.key}</b></td>
      <td>${pkValue.value}</td>
    </tr>
  </c:forEach>

  <c:forEach items="${wdkRecord.attributes}" var="attr">
    <tr>
      <td><b>${attr.value.displayName}</b></td>
      <td><c:set var="fieldVal" value="${attr.value.value}"/>
        <!-- need to know if fieldVal should be hot linked -->
        <c:choose>
          <c:when test="${fieldVal.class.name eq 'org.gusdb.wdk.model.LinkValue'}">
            <a href="${fieldVal.url}">${fieldVal.visible}</a>
          </c:when>
          <c:otherwise>
            <font class="fixed"><w:wrap size="60">${fieldVal}</w:wrap></font>
          </c:otherwise>
        </c:choose>
      </td>
    </tr>
  </c:forEach>
</table>

<!-- show all nested records for record -->

<c:forEach items="${wdkRecord.nestedRecords}" var="nrEntry">
  <br>
  Nested Records: <br>	
  <table>
  <tr><td><b>${nrEntry.key}</b></td></tr>
  <c:set var="nextNr" value="${nrEntry.value}"/>

  <!-- create table heading for next nested record -->	
  <c:forEach items="${nextNr.summaryAttributeNames}" var="recAttrName">
    <c:set value="${nextNr.attributes[recAttrName]}" var="recAttr"/>
    <c:if test="${!recAttr.internal}">
 	<tr>
          <td><b>${recAttr.displayName}</b></td>         
          <c:set var="fieldVal" value="${recAttr.briefDisplay}"/>
          <td>
            <!-- need to know if fieldVal should be hot linked -->
            <c:choose>
              <c:when test="${fieldVal.class.name eq 'org.gusdb.wdk.model.LinkValue'}">
                 <a href="${fieldVal.url}">${fieldVal.visible}</a>
              </c:when>
              <c:otherwise>
                <font class="fixed"><w:wrap size="60">${fieldVal}</w:wrap></font>
              </c:otherwise>
            </c:choose>
          </td>
        </tr>
     </c:if>
  </c:forEach>
  </table>
</c:forEach>

<!-- end nested records -->


<!-- show all nested recordLists for record -->
<c:forEach items="${wdkRecord.nestedRecordLists}" var="nrlEntry">
<br>
  <table>
  <tr><td><b>${nrlEntry.key}</b></td></tr>
    
  <c:set var="i" value="0"/>
  <c:forEach items="${nrlEntry.value}" var="nextRecord">

     <c:if test="${i == 0}">
      <!-- use first record instance to create table heading for nested record list -->	
    
      <c:forEach items="${nextRecord.summaryAttributeNames}" var="recAttrName">
         <c:set value="${nextRecord.recordClass.attributeFields[recAttrName]}" var="recAttr"/>
         <c:if test="${!recAttr.internal}">
            <th align="left">${recAttr.displayName}</th>
         </c:if>
      </c:forEach>
    </c:if>
  
      
      <!-- fill in table with one row; possible display change later -->
      <c:choose>
	  <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
          <c:otherwise><tr class="rowDark"></c:otherwise>
      </c:choose>
       
      <c:set var="j" value="0"/>
      <c:forEach items="${nextRecord.summaryAttributeNames}" var="recAttrName">
        <c:set value="${nextRecord.attributes[recAttrName]}" var="recAttr"/>
        <c:if test="${!recAttr.internal}">
          <td>
            <c:set var="recNam" value="${nextRecord.recordClass.fullName}"/>
            <c:set var="fieldVal" value="${recAttr.briefDisplay}"/>
            <c:choose>
               <c:when test="${j == 0}">
                  <!-- Added by Jerric - Display primary key content -->
                  <!-- <a href="showRecord.do?name=${recNam}&id=${nextRecord.primaryKey}">${fieldVal}</a> -->
  		  	<c:set value="${nextRecord.primaryKey}" var="nextPK"/>
                  <a href="showRecord.do?name=${recNam}&project_id=${nextPK.projectId}&primary_key=${nextPK.recordId}">${fieldVal}</a>
               </c:when>
               <c:otherwise>
 
                 <!-- need to know if fieldVal should be hot linked -->
                 <c:choose>
                    <c:when test="${fieldVal.class.name eq 'org.gusdb.wdk.model.LinkValue'}">
                       <a href="${fieldVal.url}">${fieldVal.visible}</a>
                    </c:when>
                    <c:otherwise>
                     ${fieldVal}
                    </c:otherwise>
                 </c:choose>
               </c:otherwise>
            </c:choose>
          </td>
          <c:set var="j" value="${j+1}"/>
        </c:if>
      </c:forEach>
      </tr>
 
 
  <c:set var="i" value="${i+1}"/>
  </c:forEach>
  <!-- end this record instance -->
  </table>
</c:forEach>

<!-- end nested record lists -->



<!-- show all tables for record -->
<c:forEach items="${wdkRecord.tables}"  var="tblEntry">
  <wdk:wdkTable tblName="${tblEntry.key}" isOpen="true"/>
</c:forEach>

<site:footer/>
