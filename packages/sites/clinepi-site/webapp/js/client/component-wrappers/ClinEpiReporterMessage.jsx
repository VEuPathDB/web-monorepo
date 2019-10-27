import React from 'react';

// wrapping WDKClient ReporterSortMessage for adding sentence
function ClinEpiReporterMessage(props) {
  return (
    <React.Fragment>
      <div style={{margin: '1em 0 0 0'}}>
        <b>Note: All dates were obfuscated per participant through the application of a random number algorithm 
           that shifted dates no more than seven days to comply with the ethical conduct of human subjects research.</b> 
      </div>
      <props.DefaultComponent
        {...props}
      />
    </React.Fragment>
  );
}

export default ClinEpiReporterMessage;
