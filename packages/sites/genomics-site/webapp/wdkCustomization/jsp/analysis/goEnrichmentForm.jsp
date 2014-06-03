<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:fn="http://java.sun.com/jsp/jstl/functions">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>
  <html>
    <body>
      <div class="ui-helper-clearfix">
        <style>
          .evidence-codes {
            float: right;
            border: 1px solid #999;
            border-radius: 4px;
            padding: 8px;
          }
          .evidence-codes li ul {
            margin-left: 1em;
          }
          .evidence-codes div {
            text-align: right;
          }
        </style>
        <div class="evidence-codes">
          <div><a href="http://www.geneontology.org/GO.evidence.shtml" target="_blank">Details</a></div>
          <ul>
            <li> Experimental Evidence Codes
              <ul>
                <li> EXP: Inferred from Experiment </li>
                <li> IDA: Inferred from Direct Assay </li>
                <li> IPI: Inferred from Physical Interaction </li>
                <li> IMP: Inferred from Mutant Phenotype </li>
                <li> IGI: Inferred from Genetic Interaction </li>
                <li> IEP: Inferred from Expression Pattern </li>
              </ul>
            </li>
            <li> Computational Analysis Evidence Codes
              <ul>
                <li> ISS: Inferred from Sequence or Structural Similarity </li>
                <li> ISO: Inferred from Sequence Orthology </li>
                <li> ISA: Inferred from Sequence Alignment </li>
                <li> ISM: Inferred from Sequence Model </li>
                <li> IGC: Inferred from Genomic Context </li>
                <li> IBA: Inferred from Biological aspect of Ancestor </li>
                <li> IBD: Inferred from Biological aspect of Descendant </li>
                <li> IKR: Inferred from Key Residues </li>
                <li> IRD: Inferred from Rapid Divergence </li>
                <li> RCA: inferred from Reviewed Computational Analysis </li>
              </ul>
            </li>
            <li> Author Statement Evidence Codes
              <ul>
                <li> TAS: Traceable Author Statement </li>
                <li> NAS: Non-traceable Author Statement </li>
              </ul>
            </li>
            <li> Curator Statement Evidence Codes
              <ul>
                <li> IC: Inferred by Curator </li>
                <li> ND: No biological Data available </li>
              </ul>
            </li>
            <li> Automatically-assigned Evidence Codes
              <ul>
                <li> IEA: Inferred from Electronic Annotation </li>
              </ul>
            </li>
            <li> Obsolete Evidence Codes
              <ul>
                <li> NR: Not Recorded </li>
              </ul>
            </li>
          </ul>
        </div>
        <div style="text-align:center">
          <style>
            .go-form-table td {
              text-align: left;
              vertical-align: top;
            }
            .go-form-table span {
              display: inline-block;
              margin-top: 4px;
              font-weight: bold;
            }
          </style>
          <form>
            <table class="go-form-table" style="margin:0px auto">
              <tr>
                <td><span>Ontology</span></td>
                <td>
                  <c:forEach var="item" items="${viewModel.ontologyOptions}">
                    <label><input type="radio" name="goAssociationsOntologies" value="${item}"/> ${item}</label><br/>
                  </c:forEach>
                </td>
              </tr>
              <tr>
                <td><span>GO Association Sources</span></td>
                <td>
                  <div><a href="#select-all">Select all</a> | <a href="#clear-all">Clear all</a></div>
                  <c:forEach var="item" items="${viewModel.sourceOptions}">
                    <label><input type="checkbox" name="goAssociationsSources" value="${item}"/> ${item}</label><br/>
                  </c:forEach>
                </td>
              </tr>
              <tr>
                <td><span>GO Evidence Codes</span></td>
                <td>
                  <div><a href="#select-all">Select all</a> | <a href="#clear-all">Clear all</a></div>
                  <c:forEach var="item" items="${viewModel.evidCodeOptions}">
                    <label><input type="checkbox" name="goEvidenceCodes" value="${item}"/> ${item}</label><br/>
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
