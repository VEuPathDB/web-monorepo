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
            .pathway-form-table td {
              text-align: left;
              vertical-align: top;
            }
            .pathway-form-table span {
              display: inline-block;
              margin-top: 4px;
            }
          </style>
          <form>
            <table class="pathway-form-table" style="margin:0px auto">
              <tr>
                <td>
                  <label>
                    <span style="font-weight:bold">Organism</span>
                    <imp:image class="help-link" style="cursor:pointer;padding:1px" src="/wdk/images/question.png"
                        title="${fn:escapeXml(viewModel.organismParamHelp)}"/>
                  </label>
                </td>
                <td>
                  <select name="organism">
                    <c:forEach var="item" items="${viewModel.organismOptions}">
                      <option value="${item.term}">${item.display}</option>
                    </c:forEach>
                  </select>
                </td>
              </tr>
              <tr>
                <td><span>Pathway Sources</span></td>
                <td>
                  <div><a href="#select-all">Select all</a> | <a href="#clear-all">Clear all</a></div>
                  <c:forEach var="item" items="${viewModel.sourceOptions}">
                    <label><input checked="checked"  type="checkbox" name="pathwaysSources" value="${item.term}"/> ${item.display}</label><br/>
                  </c:forEach>
                </td>
              </tr>
              <tr>
                <td><span>P-Value Cutoff <span style="color:blue;font-size:0.95em;font-family:monospace">(0 - 1.0)</span></span></td>
                <td><input type="text" name="pValueCutoff" size="10" value="0.05"/></td>
              </tr>
              <tr>
                <td colspan="2" style="text-align:center">
                  <input type="submit" value="Submit"/>
                </td>
              </tr>
            </table>
          </form>
        </div>
      </div>
    </body>
  </html>
</jsp:root>
