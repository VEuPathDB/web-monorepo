export let contexts = [
  {
    name: 'dna_gtracks',
    start: 'context_start',
    end: 'context_end',
    thumbnail: true
  }
];

let gbrowseScripts = [ '/gbrowse/apiGBrowsePopups.js', '/gbrowse/wz_tooltip.js' ]

export function GbrowseContext(props) {
  let { context } = props;

  let {
    sequence_id,
    source_id,
  } = props.record.attributes;

  let tracks = props.record.attributes[props.name];
  let contextStart = props.record.attributes[context.start];
  let contextEnd = props.record.attributes[context.end];
  let lowerProjectId = wdk.MODEL_NAME.toLowerCase();
  let lowerGeneId = source_id.toLowerCase();

  let queryParams = {
    name: `${sequence_id}:${contextStart}..${contextEnd}`,
    hmap: 'gbrowseSyn',
    l: tracks,
    width: 800,
    embed: 1,
    h_feat: `${lowerGeneId}@yellow`,
    genepage: 1
  };

  let queryParamString = Object.keys(queryParams).reduce((str, key) => `${str};${key}=${queryParams[key]}` , '');
  let iframeUrl = `/cgi-bin/gbrowse_img/${lowerProjectId}/?${queryParamString}`;
  let gbrowseUrl = `/cgi-bin/gbrowse/${lowerProjectId}/?name=${sequence_id}:${contextStart}..${contextEnd};h_feat=${lowerGeneId}@yellow`;

  return (
    <div id="genomic-context">
      <center>
        <strong>Genomic Context</strong>
        <a id="gbView" href={gbrowseUrl}>View in Genome Browser</a>
        <div>(<i>use right click or ctrl-click to open in a new window</i>)</div>
        <div id="${gnCtxDivId}"></div>
        <iframe src={iframeUrl} seamless style={{ width: '100%', border: 'none' }} onLoad={injectGbrowseScripts} />
        <a id="gbView" href={gbrowseUrl}>View in Genome Browser</a>
        <div>(<i>use right click or ctrl-click to open in a new window</i>)</div>
      </center>
    </div>
  );
}

export function ProteinContext(props) {
  let { source_id, protein_length, protein_gtracks } = props.record.attributes;

  return (
    <div id="protein-features">
      <strong>Protein Features</strong>
      <iframe
        src={`/cgi-bin/gbrowse_img/${wdk.MODEL_NAME.toLowerCase()}aa/?name=${source_id}:1..${protein_length};l=${protein_gtracks};hmap=pbrowse;width=800;embed=1;genepage=1`}
        seamless
        style={{ width: '100%', border: 'none' }}
        onLoad={resizeIframe}
      />
    </div>
  );
}

function injectGbrowseScripts(event) {
  resizeIframe(event);
  let iframe = event.target;

  let gbrowseWindow = iframe.contentWindow.window;
  let gbrowseDocumentBody = iframe.contentWindow.document.body;

  gbrowseWindow.wdk = wdk;
  gbrowseWindow.jQuery = jQuery;

  for (let scriptUrl of gbrowseScripts) {
    let script = document.createElement('script');
    script.src = scriptUrl;
    gbrowseDocumentBody.appendChild(script);
  }
}

function resizeIframe(event) {
  let iframe = event.target;
  iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 20 + 'px';
}

