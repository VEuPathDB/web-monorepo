import React from 'react';
export default function SrtHelp() {
  return (
    <div>
      <img src="/a/images/genemodel.gif" />
      <br />
      Types of sequences:
      <table width="100%" cellPadding="4">
        <tbody>
          <tr>
            <td>
              <i>
                <b>protein</b>
              </i>
            </td>
            <td>the predicted translation of the gene</td>
          </tr>
          <tr>
            <td>
              <i>
                <b>CDS</b>
              </i>
            </td>
            <td>the coding sequence, excluding UTRs (introns spliced out)</td>
          </tr>
          <tr>
            <td>
              <i>
                <b>transcript</b>
              </i>
            </td>
            <td>
              the processed transcript, including UTRs (introns spliced out)
            </td>
          </tr>
          <tr>
            <td>
              <i>
                <b>genomic</b>
              </i>
            </td>
            <td>
              a region of the genome.{' '}
              <i>
                Genomic sequence is always returned from 5' to 3', on the proper
                strand
              </i>
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      Regions:
      <table width="100%" cellPadding="4">
        <tbody>
          <tr>
            <td>
              <i>
                <b>relative to sequence start</b>
              </i>
            </td>
            <td>
              to retrieve, eg, the 100 bp upstream genomic region, use "begin at{' '}
              <i>start</i> - 100 end at <i>start</i> - 1".
            </td>
          </tr>
          <tr>
            <td>
              <i>
                <b>relative to sequence stop</b>
              </i>
            </td>
            <td>
              to retrieve, eg, the last 10 bp of a sequence, use "begin at{' '}
              <i>stop</i> - 9 end at <i>stop</i> + 0".
            </td>
          </tr>
          <tr>
            <td>
              <i>
                <b>relative to sequence start and stop</b>
              </i>
            </td>
            <td>
              to retrieve, eg, a CDS with the first and last 10 basepairs
              excised, use: "begin at <i>start</i> + 10 end at <i>stop</i> -
              10".
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      Note: If UTRs have not been annotated for a gene, then choosing
      "transcription start" may have the same effect as choosing "translation
      start."
      <table>
        <tbody>
          <tr>
            <td valign="top" className="dottedLeftBorder"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
