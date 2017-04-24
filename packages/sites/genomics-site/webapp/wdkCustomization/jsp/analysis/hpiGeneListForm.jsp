<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <html>
    <body>
      <div class="ui-helper-clearfix">
        <div style="text-align:center">
          <style>
            .hpi-form-table td {
              text-align: left;
              vertical-align: top;
            }
            .hpi-form-table span {
              display: inline-block;
              margin-top: 4px;
              font-weight: bold;
            }
          </style>
          <form>
            <table class="hpi-form-table" style="margin:0px auto">

              <tr>
                <td>
                  <label>
                    <span style="font-weight:bold">BRC</span>
                    <imp:image class="help-link" style="cursor:pointer;padding:1px" src="wdk/images/question.png"
                        title="${fn:escapeXml(viewModel.brcParamHelp)}"/>
                  </label>
                </td>
                <td>
                  <select name="brcParam">
                    <c:forEach var="item" items="${viewModel.brcOptions}">
                      <option value="${item.term}">${item.display}</option>
                    </c:forEach>
                  </select>
                </td>
              </tr>

              <tr>
                <td>
                  <label>
                    <span style="font-weight:bold">Threshold Type</span>
                    <imp:image class="help-link" style="cursor:pointer;padding:1px" src="wdk/images/question.png"
                        title="${fn:escapeXml(viewModel.thresholdTypeParamHelp)}"/>
                  </label>
                </td>
                <td>
                  <select name="thresholdTypeParam">
                    <c:forEach var="item" items="${viewModel.thresholdTypeOptions}">
                      <option value="${item.term}">${item.display}</option>
                    </c:forEach>
                  </select>
                </td>
              </tr>

              <tr>
                <td>
                  <label>
                    <span style="font-weight:bold">
                      Threshold <span style="color:blue;font-size:0.95em;font-family:monospace">(number)</span>
                    </span>
                    <imp:image class="help-link" style="cursor:pointer;padding:1px" src="wdk/images/question.png"
                        title="${fn:escapeXml(viewModel.thresholdParamHelp)}"/>
                  </label>
                </td>
                <td>
                  <input type="text" name="thresholdParam" size="10" value="80"/>
                </td>
              </tr>


              <tr>
                <td>
                  <label>
                    <span style="font-weight:bold">Use Orthology</span>
                    <imp:image class="help-link" style="cursor:pointer;padding:1px" src="wdk/images/question.png"
                        title="${fn:escapeXml(viewModel.useOrthologyParamHelp)}"/>
                  </label>
                </td>
                <td>
                  <select name="useOrthologyParam">
                    <c:forEach var="item" items="${viewModel.useOrthologyOptions}">
                      <option value="${item.term}">${item.display}</option>
                    </c:forEach>
                  </select>
                </td>
              </tr>

            </table>
          </form>
        </div>
      </div>
    </body>
  </html>
</jsp:root>
