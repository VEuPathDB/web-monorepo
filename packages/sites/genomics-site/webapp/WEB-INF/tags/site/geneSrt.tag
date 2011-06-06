<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="allRecordIds"
              required="false"
%>

<form action="/cgi-bin/geneSrt" method="post">
  <input type="hidden" name="project_id" value="${wdkModel.name}"/>
  <c:if test="${allRecordIds != null}">
    <input type="hidden" name="ids" value="${allRecordIds}">
  </c:if>
  
  <table border="0" width="100%" cellpadding="4">
    <c:if test="${allRecordIds == null}">
      <tr>
        <td colspan="2" valign="top"><b>Enter a list of Gene IDs (each ID on a separate line):</b></td>
      </tr>
      <tr>
        <td colspan="2">
          <textarea name="ids" rows="4" cols="60">${genesIds.default}</textarea>
        </td>
      </tr>
    </c:if>
    <tr>
      <td colspan="2">
        <b>Choose the type of sequence:</b>
        <input type="radio" name="type" value="genomic" checked onclick="setEnable(true)">genomic
        <input type="radio" name="type" value="protein" onclick="setEnable(false)">protein
        <input type="radio" name="type" value="CDS" onclick="setEnable(false)">CDS
        <input type="radio" name="type" value="processed_transcript" onclick="setEnable(false)">transcript
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <table id="offsetOptions" cellpadding="2">
          <tr>
            <td colspan="3">
              <b>Choose the region of the sequence(s):</b>
            </td>
          </tr>
          <tr>
            <td>begin at</td>
            <td align="left">
              <select name="upstreamAnchor">
                <option value="Start" selected>Transcription Start <sup>***</sup></option>
                <option value="CodeStart">Translation Start (ATG)</option>
                <option value="CodeEnd">Translation Stop Codon</option>
                <option value="End">Transcription Stop <sup>***</sup></option>
              </select>
            </td>
            <td align="left">
              <select name="upstreamSign">
                <option value="plus" selected>+</option>
                <option value="minus">-</option>
              </select>
	    </td>
            <td align="left">
              <input id="upstreamOffset" name="upstreamOffset" value="0" size="6"/> nucleotides
            </td>
          </tr>
          <tr>
            <td>end at</td>
            <td align="left">
              <select name="downstreamAnchor">
                <option value="Start">Transcription Start <sup>***</sup></option>
                <option value="CodeStart">Translation Start (ATG)</option>
                <option value="CodeEnd">Translation Stop Codon</option>
                <option value="End" selected>Transcription Stop <sup>***</sup></option>
              </select>
            </td>
            <td align="left">
              <select name="downstreamSign">
                <option value="plus" selected>+</option>
                <option value="minus">-</option>
              </select>
            </td>
            <td align="left">
              <input id="downstreamOffset" name="downstreamOffset" value="0" size="6"> nucleotides
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td valign="top" nowrap>
        <b>Download Type</b>:
        <input type="radio" name="downloadType" value="text">Save to File</input>
        <input type="radio" name="downloadType" value="plain" checked>Show in Browser</input>
      </td>
    </tr>
    <tr><td align="center"><input name="go" value="Get Sequences" type="submit"/></td></tr>
  </table>

<p><sup>***</sup> Note: If UTRs have not been annotated for a gene, then choosing "transcription start" may have the same effect as choosing "translation start".</p>
<br><br>

</form>
