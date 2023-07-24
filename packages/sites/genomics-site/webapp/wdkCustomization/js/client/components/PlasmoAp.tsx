import React, { useCallback, useState } from 'react';

import { TextArea } from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

const cx = makeClassNameHelper('api-PlasmoAp');

const PLASMOAP_ACTION_URL = '/cgi-bin/plasmoap.cgi';
const SEQUENCE_FORM_PARAM_NAME = 'sequence';

import './PlasmoAp.scss';

export function PlasmoAp() {
  const [sequence, setSequence] = useState('');

  const clearSequence = useCallback(() => {
    setSequence('');
  }, []);

  return (
    <div className={cx('')}>
      <h1>PlasmoAP - Prediction of apicoplast targeting signals</h1>

      <p>Use the PlasmoAP algorithm to predict apicoplast-targeting signals</p>

      <div className={cx('--FormContainer')}>
        <form action={PLASMOAP_ACTION_URL} method="POST" target="_blank">
          <div className={cx('--SequenceInstructions')}>
            Please paste your entire <strong>protein</strong> sequence,{' '}
            <strong>including</strong> any signal sequence that may be present.
          </div>
          <div className={cx('--SequenceParam')}>
            <TextArea
              name={SEQUENCE_FORM_PARAM_NAME}
              value={sequence}
              onChange={setSequence}
              rows={10}
              cols={70}
            />
          </div>
          <div className={cx('--SequenceControls')}>
            <button type="button" onClick={clearSequence}>
              Clear Input
            </button>
            <button type="submit">Run</button>
          </div>
        </form>
      </div>

      <hr />

      <h2>Explanation</h2>

      <p>
        The apicoplast is a distintive subcellular structure, acquired when an
        ancestral protist 'ate' (or was invaded by) a eukaryotic alga, and
        retained the algal plastid. The apicoplast has lost photosynthetic
        function, but is nevertheless essential for parasite survival, and has
        generated considerable excitement as a potential drug target.
        Nuclear-encoded apicoplast proteins are imported into the organelle
        using a bipartite targeting signal consisting of a classical secretory
        signal sequence, followed by a plastid transit peptide.
      </p>

      <p>
        PlasmoAP is a rules-based algorithm that uses amino-acid frequency and
        distribution to identify putative apicoplast-targeting peptides.{' '}
        <strong>
          Just paste a protein sequence into the text box above, and click on
          "Run".
        </strong>{' '}
        Note that this algorithm will predict target to the apicoplast{' '}
        <strong>only</strong> if a signal sequence is present. Also note that
        PlasmoAP performs well <strong>only</strong> for <em>P. falciparum</em>{' '}
        sequences, as A+T content skews amino acid distribution. For more
        information on this tool please see Foth, BJ et al. <em>Science</em>{' '}
        299:5606 (2003).
      </p>
    </div>
  );
}
