import React from 'react';
import { PageController } from 'wdk-client/Controllers';
import { Srt } from '../Srt';

/**
 * This will eventually be the view controller for the SRT page (srt.jsp).  It
 * should use the download form React components for FASTA written for the
 * step download page.  However, since this is working ok for now, we will
 * have duplicate functionality for a "limited" time. :)
 */
export default class FastaConfigController extends PageController {
  renderView() {
    return <Srt />;
  }
}
