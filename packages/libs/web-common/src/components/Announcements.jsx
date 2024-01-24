import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { groupBy, noop } from 'lodash';

import { Link, IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

const stopIcon = (
  <span className="fa-stack" style={{ fontSize: '1.2em' }}>
    <i className="fa fa-circle fa-stack-2x" style={{ color: 'darkred' }} />
    <i className="fa fa-times fa-stack-1x" style={{ color: 'white' }} />
  </span>
);

const warningIcon = (
  <span className="fa-stack" style={{ fontSize: '1.2em' }}>
    <i
      className="fa fa-exclamation-triangle fa-stack-2x"
      style={{ color: '#ffeb3b' }}
    />
    <i
      className="fa fa-exclamation fa-stack-1x"
      style={{ color: 'black', fontSize: '1.3em', top: 2 }}
    />
  </span>
);

const infoIcon = (
  <span className="fa-stack" style={{ fontSize: '1.2em' }}>
    <i className="fa fa-circle fa-stack-2x" style={{ color: '#004aff' }} />
    <i className="fa fa-info fa-stack-1x" style={{ color: 'white' }} />
  </span>
);

// Array of announcements to show. Each element of the array is an object which specifies
// a unique id for the announcement, and a function that takes props and returns a React Element.
// Use props as an opportunity to determine if the message should be displayed for the given context.
const siteAnnouncements = [
  // alpha
  {
    id: 'alpha',
    renderDisplay: (props) => {
      if (
        param('alpha', props.location) === 'true' ||
        /^(alpha|a1|a2)/.test(window.location.hostname)
      ) {
        return (
          <div key="alpha">
            This pre-release version of {props.projectId} is available for early
            community review. Your searches and strategies saved in this alpha
            release will not be available in the official release. Please
            explore the site and{' '}
            <Link to="/contact-us" target="_blank">
              contact us
            </Link>{' '}
            with your feedback. This site is under active development so there
            may be incomplete or inaccurate data and occasional site outages can
            be expected.
          </div>
        );
      }
    },
  },
  /*
  { 
    id: 'live-beta',
    renderDisplay: props => {
      if ( isGenomicHomePage(props.projectId, props.location) ) {
        if (props.projectId == 'VectorBase' || props.projectId == 'OrthoMCL') return (
          <div key="live-beta">
            Welcome to {props.displayName} <i>beta</i> where you will find the newest versions of our interface, features, tools and data.  
            While we transition to making this beta site permanent, <a target="_blank" href={`https://legacy.${props.projectId.toLowerCase()}.${props.projectId === 'SchistoDB' ? 'net' : 'org'}`}>
            legacy.{props.projectId.toLowerCase()}.org</a> is still available. 
            Here is a <a target="_blank" href="https://upenn.co1.qualtrics.com/jfe/form/SV_9N2RTXq7ljpZnDv">form for sending your feedback</a> on the beta sites.
          </div>
        )
        else return (
          <div key="live-beta">
            Welcome to {props.displayName} <i>beta</i> where you will find the newest versions of our interface, features, tools and data.
            While we transition to making this beta site permanent, <a target="_blank" href={`https://legacy.${props.projectId.toLowerCase()}.${props.projectId === 'SchistoDB' ? 'net' : 'org'}`}>
            legacy.{props.projectId.toLowerCase()}.org</a> is still available (to be retired March 2nd).
            Here is a <a target="_blank" href="https://upenn.co1.qualtrics.com/jfe/form/SV_9N2RTXq7ljpZnDv">form for sending your feedback</a> on the beta sites.
          </div> 
        )
      }
    }
  },
*/

  /*
{   
    id: 'mbio-beta',
    renderDisplay: (props) => {
    if ( (props.projectId == 'MicrobiomeDB') && (props.location.pathname === '/') ) {
        return (
          <div>
           Welcome to the BETA version of MicrobiomeDB with the new and improved <span style={{fontWeight: 'bold', fontStyle: 'italic'}}>data exploration platform!</span>
           &nbsp;&nbsp;While we resolve bugs on the BETA site, you can access the original version of our website, 
           including your saved strategies, at <a href="https://microbiomedb.org">microbiomedbdb.org</a>.
          </div>
        );
      }
      return null;
    }
  },
*/

  /*
{  
    id: 'clinepiEDA',
    renderDisplay: (props) => {
    if ( (props.projectId == 'ClinEpiDB') && (props.location.pathname === '/') ) {
        return (
          <div>
           Welcome to ClinEpiDB’s new and improved <span style={{fontWeight: 'bold', fontStyle: 'italic'}}>data exploration platform!</span>
           &nbsp;&nbsp;Access the original version of our website, including your saved strategies, at <a href="https://legacy.clinepidb.org">legacy.clinepidb.org</a>. 
          </div>
        );
      }
      return null;
    }
  },
 
*/
  // clinepi workshop
  /* 
 {
    id: 'clinepi-workshop',
    renderDisplay: (props) => {
    if (props.projectId == 'ClinEpiDB' || props.projectId == 'AllClinEpiDB' ) {
        return (
          <div>
           Join our current <span style={{fontWeight: 'bold'}}>webinar series on Tuesdays at 2 PM UTC</span> to learn more about the different infectious disease and maternal, newborn, and child health studies in our resource! Register at: <a target="_blank" href="https://attendee.gotowebinar.com/register/5366233982916667918">https://attendee.gotowebinar.com/register/5366233982916667918</a>.
          </div>
        );
      }
      return null;
    }
  },
*/

  // beta
  //  /*isBetaSite() || */
  /*
  {
    id: 'beta-genomics',
    renderDisplay: props => {
      if ( isGenomicHomePage(props.projectId, props.location) ) return (
        <div key="beta">
          {props.displayName} <em>beta</em> is available for early community review!
          &nbsp;&nbsp;Please explore the site and <Link to="/contact-us" target="_blank">contact us</Link> with feedback.
          &nbsp;<a rel="noreferrer" href={`https://${props.projectId.toLowerCase()}.${props.projectId === 'SchistoDB' ? 'net' : 'org'}?useBetaSite=0`}>Click here to return to the legacy site.</a>
        </div>
      );
    }
  },
*/

  /*
  {
    id: 'strategies-beta',
    category: 'degraded',
    renderDisplay: props => {
      if ( isGenomicSite(props.projectId) && ( isStrategies(props.location) || isBasket(props.location) || isFavorites(props.location) ) ) return (
        <div key="strategies-beta">
          Strategies, baskets and favorites you save on this <i>beta</i> site are not permanent. 
          {
            props.projectId !== 'VectorBase' &&
            <React.Fragment>
              {' '}
              Use the <a rel="noreferrer" href={`https://${props.projectId.toLowerCase()}.${props.projectId === 'SchistoDB' ? 'net' : 'org'}`}>legacy site</a> to save them permanently.
            </React.Fragment>
          }
        </div>
      )
    }
  },
*/
  /*
  { 
    id: 'apollo-galaxy-off',
    category: 'degraded',
    renderDisplay: props => {
      if ( isGalaxy(props.location) || isApollo(props.location) ) return (
        <div>
          Apollo and the Galaxy Data export to VEuPathDB are currently <b>unavailable</b>.  We are working on fixing this issue and hope to have the export service back ASAP.
        </div>
      )
    }
  },
*/

  {
    id: 'blast-beta',
    renderDisplay: (props) => {
      if (isLegacyBlast(props.projectId, props.location)) {
        return (
          <div key="blast-beta">
            Would you like to submit multiple sequences in a single BLAST
            search? Use our <Link to="/workspace/blast/new">new BLAST</Link> and{' '}
            <Link to="/contact-us" target="_blank">
              let us know what you think
            </Link>
            .
          </div>
        );
      }

      return null;
    },
  },

  // RNASeq issue in certain datasets Jan 2023
  /* {
    id: 'rnaseqBug',
    renderDisplay: props => {
      if ( isGenomeBrowser(props.location) &&
           (props.projectId == 'AmoebaDB' || 
            props.projectId == 'CryptoDB' ||
            props.projectId == 'FungiDB' ||
            props.projectId == 'PiroplasmaDB' ||
            props.projectId == 'PlasmoDB' ||
            props.projectId == 'ToxoDB' || 
            props.projectId == 'VectorBase' || 
            props.projectId == 'HostDB')
         )
      {
        return (
          <div>
            We discovered a bug that affects RNA-Seq coverage plots in JBrowse for a number of datasets. This bug only affects the coverage representation in JBrowse. It does not affect queries, plots and splice junction analyses. For affected datasets, it will appear that coverage in introns is similar to coverage in exons. We are working on fixing this as soon as possible.
          </div>
        );
      }
      return null;
    }
  },
*/

  //VectorBase, aquasalis: https://redmine.apidb.org/issues/53436  Jan 18 2024 -patched prod 66-  for a year
  {
    id: 'aquasalis',
    renderDisplay: (props) => {
      if (
        (props.projectId == 'VectorBase' || props.projectId == 'EuPathDB') &&
        (props.location.pathname.indexOf('/record/dataset/TMPTX_aaquAaquGF1') >
          -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_44554a07c1') >
            -1 ||
          props.location.pathname.indexOf('/record/gene/AAQUA_') > -1)
      ) {
        return (
          <div key="">
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_44554a07c1">
              <i>Anopheles aquasalis</i> AaquGF1
            </a>{' '}
            has a confusion in chromosome nomenclature. The current X and Y
            designations should be replaced with XL (X long arm) and XR (X short
            arm), respectively. While the matter is being addressed in the
            primary databases/INSDC and will subsequently be handled at
            VectorBase, feel free to{' '}
            <a href="https://vectorbase.org/vectorbase/app/contact-us">
              contact us
            </a>{' '}
            for any inquiries, suggestions, or feedback.
          </div>
        );
      }
      return null;
    },
  },

  //VectorBase, albimanus: https://redmine.apidb.org/issues/53151  Nov 2023-2024
  {
    id: 'albimanus',
    renderDisplay: (props) => {
      if (
        (props.projectId == 'VectorBase' || props.projectId == 'EuPathDB') &&
        (props.location.pathname.indexOf(
          '/record/dataset/TMPTX_aalbSTECLA2020'
        ) > -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_35d1598565') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/TMPTX_aalbSTECLA') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_865dea4bd2') > -1)
      ) {
        return (
          <div key="">
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_35d1598565">
              <i>Anopheles albimanus</i> STECLA 2020
            </a>{' '}
            is the <b>new reference genome</b> for this mosquito species, which
            means that the 'omics' data sets are only aligned to this strain and
            all the site functionality is activated.{' '}
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_865dea4bd2">
              <i>Anopheles albimanus</i> STECLA
            </a>{' '}
            will remain available on VectorBase, but with limited functionality.
            Please{' '}
            <a href="https://vectorbase.org/vectorbase/app/contact-us">
              contact us
            </a>{' '}
            if you have any questions, suggestions or feedback.
          </div>
        );
      }
      return null;
    },
  },

  //VectorBase, coluzzii: https://redmine.apidb.org/issues/53153  Nov 2023-2024
  {
    id: 'coluzzii',
    renderDisplay: (props) => {
      if (
        (props.projectId == 'VectorBase' || props.projectId == 'EuPathDB') &&
        (props.location.pathname.indexOf('/record/dataset/TMPTX_acolAcolN3') >
          -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_98703c1d88') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/TMPTX_acolNgousso') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_f398fa98de') > -1)
      ) {
        return (
          <div key="">
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_98703c1d88">
              <i>Anopheles coluzzii</i> AcolN3
            </a>{' '}
            is the <b>new reference genome</b> for this mosquito species, which
            means that the 'omics' data sets are only aligned to this strain and
            all the site functionality is activated.{' '}
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_f398fa98de">
              <i>Anopheles coluzzii</i> Ngousso
            </a>{' '}
            will remain available on VectorBase, but with limited functionality.
            Please{' '}
            <a href="https://vectorbase.org/vectorbase/app/contact-us">
              contact us
            </a>{' '}
            if you have any questions, suggestions or feedback.
          </div>
        );
      }
      return null;
    },
  },

  //VectorBase, darlingi: https://redmine.apidb.org/issues/53154  Nov 2023-2024
  {
    id: 'darlingi',
    renderDisplay: (props) => {
      if (
        (props.projectId == 'VectorBase' || props.projectId == 'EuPathDB') &&
        (props.location.pathname.indexOf('/record/dataset/TMPTX_adarAdarGF1') >
          -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_13ae5590c9') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/TMPTX_adarCoari') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_252042213e') > -1)
      ) {
        return (
          <div key="">
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_13ae5590c9">
              <i>Anopheles darlingi</i> AdarGF1
            </a>{' '}
            is the <b>new reference genome</b> for this mosquito species, which
            means that the 'omics' data sets are only aligned to this strain and
            all the site functionality is activated.{' '}
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_252042213e">
              <i>Anopheles darlingi</i> Coari
            </a>{' '}
            will remain available on VectorBase, but with limited functionality.
            Please{' '}
            <a href="https://vectorbase.org/vectorbase/app/contact-us">
              contact us
            </a>{' '}
            if you have any questions, suggestions or feedback.
          </div>
        );
      }
      return null;
    },
  },

  //VectorBase, funestus: https://redmine.apidb.org/issues/53155  Nov 2023-2024
  {
    id: 'funestus',
    renderDisplay: (props) => {
      if (
        (props.projectId == 'VectorBase' || props.projectId == 'EuPathDB') &&
        (props.location.pathname.indexOf('/record/dataset/TMPTX_afunAfunGA1') >
          -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_f66e7aaf06') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/TMPTX_afunFUMOZ') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_1a787d4361') > -1)
      ) {
        return (
          <div key="">
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_f66e7aaf06">
              <i>Anopheles funestus</i> AfunGA1
            </a>{' '}
            is the <b>new reference genome</b> for this mosquito species, which
            means that the 'omics' data sets are only aligned to this strain and
            all the site functionality is activated.{' '}
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_1a787d4361">
              <i>Anopheles funestus</i> FUMOZ
            </a>{' '}
            will remain available on VectorBase, but with limited functionality.
            Please{' '}
            <a href="https://vectorbase.org/vectorbase/app/contact-us">
              contact us
            </a>{' '}
            if you have any questions, suggestions or feedback.
          </div>
        );
      }
      return null;
    },
  },

  //VectorBase, culex: https://redmine.apidb.org/issues/53158  Nov 2023-2024
  {
    id: 'culex',
    renderDisplay: (props) => {
      if (
        (props.projectId == 'VectorBase' || props.projectId == 'EuPathDB') &&
        (props.location.pathname.indexOf('/record/dataset/TMPTX_cquiJHB') >
          -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_2f1ec58add') >
            -1 ||
          props.location.pathname.indexOf(
            '/record/dataset/TMPTX_cquiJohannesburg'
          ) > -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_2f26cdb393') > -1)
      ) {
        return (
          <div key="">
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_2f1ec58add">
              <i>Culex quinquefasciatus</i> JHB 2020
            </a>{' '}
            is the <b>new reference genome</b> for this mosquito species, which
            means that the 'omics' data sets are only aligned to this strain and
            all the site functionality is activated.{' '}
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_2f26cdb393">
              <i>Culex quinquefasciatus</i> Johannesburg
            </a>{' '}
            will remain available on VectorBase, but with limited functionality.
            Please{' '}
            <a href="https://vectorbase.org/vectorbase/app/contact-us">
              contact us
            </a>{' '}
            if you have any questions, suggestions or feedback.
          </div>
        );
      }
      return null;
    },
  },

  //VectorBase, longipalpis: https://redmine.apidb.org/issues/53167  Nov 2023-2024
  {
    id: 'longipalpis',
    renderDisplay: (props) => {
      if (
        (props.projectId == 'VectorBase' || props.projectId == 'EuPathDB') &&
        (props.location.pathname.indexOf('/record/dataset/TMPTX_llonM1') > -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_c099af5258') >
            -1 ||
          props.location.pathname.indexOf(
            '/record/dataset/TMPTX_llonJacobina'
          ) > -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_75915ef5b1') > -1)
      ) {
        return (
          <div key="">
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_c099af5258">
              <i>Lutzomyia longipalpis</i> M1
            </a>{' '}
            is the <b>new reference genome</b> for this sand fly species, which
            means that the 'omics' data sets are only aligned to this strain and
            all the site functionality is activated.{' '}
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_75915ef5b1">
              <i>Lutzomyia longipalpis</i> Jacobina
            </a>{' '}
            will remain available on VectorBase, but with limited functionality.
            Please{' '}
            <a href="https://vectorbase.org/vectorbase/app/contact-us">
              contact us
            </a>{' '}
            if you have any questions, suggestions or feedback.
          </div>
        );
      }
      return null;
    },
  },

  //VectorBase, papatasi: https://redmine.apidb.org/issues/53168  Nov 2023-2024
  {
    id: 'papatasi',
    renderDisplay: (props) => {
      if (
        (props.projectId == 'VectorBase' || props.projectId == 'EuPathDB') &&
        (props.location.pathname.indexOf('/record/dataset/TMPTX_ppapM1') > -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_4582dc809c') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/TMPTX_ppapIsrael') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_a8e93bad14') > -1)
      ) {
        return (
          <div key="">
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_4582dc809c">
              <i>Phlebotomus papatasi</i> M1
            </a>{' '}
            is the <b>new reference genome</b> for this sand fly species, which
            means that the 'omics' data sets are only aligned to this strain and
            all the site functionality is activated.{' '}
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/DS_a8e93bad14">
              <i>Phlebotomus papatasi</i> Israel
            </a>{' '}
            will remain available on VectorBase, but with limited functionality.
            Please{' '}
            <a href="https://vectorbase.org/vectorbase/app/contact-us">
              contact us
            </a>{' '}
            if you have any questions, suggestions or feedback.
          </div>
        );
      }
      return null;
    },
  },

  //VectorBase, July 8 2023  FOR A YEAR  :  genome pages for Aedes albopictus Foshan FPA and Aedes albopictus Foshan  https://redmine.apidb.org/issues/51815
  {
    id: 'albopicusFoshan',
    renderDisplay: (props) => {
      if (
        (props.projectId == 'VectorBase' || props.projectId == 'EuPathDB') &&
        (props.location.pathname.indexOf('/record/dataset/TMPTX_aalbFPA') >
          -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_f18070316b') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/TMPTX_aalbFoshan') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_58c436b555') > -1)
      ) {
        return (
          <div key="albopicusFoshan">
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/TMPTX_aalbFPA">
              <i>Aedes albopictus</i> Foshan FPA
            </a>{' '}
            is the <b>new reference genome</b> for this mosquito species, which
            means that the 'omics' data sets are only aligned to this strain and
            all the site functionality is activated.{' '}
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/TMPTX_aalbFoshan">
              <i>Aedes albopictus</i> Foshan
            </a>{' '}
            will remain available on VectorBase, but with limited functionality.
            Please{' '}
            <a href="https://vectorbase.org/vectorbase/app/contact-us">
              contact us
            </a>{' '}
            if you have any questions, suggestions or feedback.
          </div>
        );
      }
      return null;
    },
  },

  //VectorBase, July 8 2023  FOR A YEAR  :  genome pages for Ixodes scapularis PalLabHiFi and  Ixodes scapularis Wikel https://redmine.apidb.org/issues/51701
  {
    id: 'ixodesScap',
    renderDisplay: (props) => {
      if (
        props.projectId == 'VectorBase' &&
        (props.location.pathname.indexOf(
          '/record/dataset/TMPTX_iscaPalLabHiFi'
        ) > -1 ||
          props.location.pathname.indexOf('/record/dataset/TMPTX_iscaWikel') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_975ab2c4c6') >
            -1 ||
          props.location.pathname.indexOf('/record/dataset/DS_bb84a3ee55') > -1)
      ) {
        return (
          <div key="ixodesScap">
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/TMPTX_iscaPalLabHiFi">
              <i>Ixodes scapularis</i> PalLabHiFi
            </a>{' '}
            is the <b>new reference genome</b> for this tick species, which
            means that the 'omics' data sets are only aligned to this strain and
            all the site functionality is activated.{' '}
            <a href="https://vectorbase.org/vectorbase/app/record/dataset/TMPTX_iscaWikel">
              <i>Ixodes scapularis</i> Wikel
            </a>{' '}
            will remain available on VectorBase, but with limited functionality.
            Please{' '}
            <a href="https://vectorbase.org/vectorbase/app/contact-us">
              contact us
            </a>{' '}
            if you have any questions, suggestions or feedback.
          </div>
        );
      }
      return null;
    },
  },

  // VectorBase gene page for Haemaphysalis longicornis HaeL-2018
  {
    id: 'HLOH',
    renderDisplay: (props) => {
      if (
        props.projectId == 'VectorBase' &&
        props.location.pathname.indexOf('/record/gene/HLOH_0') > -1
      ) {
        return (
          <div key="geneVB-HLOH">
            The <i>Haemaphysalis longicornis</i> HaeL-2018 version presented
            here was downloaded directly from NCBI (
            <a
              href="https://www.ncbi.nlm.nih.gov/assembly/GCA_013339765.2"
              target="_blank"
            >
              GCA_013339765.2
            </a>
            ). The version at Genome Warehouse (
            <a
              href="https://ngdc.cncb.ac.cn/gwh/Assembly/8865/show"
              target="_blank"
            >
              GWHAMMI00000000
            </a>
            ) may differ from this, especially for non-coding genes.
          </div>
        );
      }
      return null;
    },
  },
  // VectorBase gene page for Hyalomma asiaticum Hyas-2018
  {
    id: 'HASH',
    renderDisplay: (props) => {
      if (
        props.projectId == 'VectorBase' &&
        props.location.pathname.indexOf('/record/gene/HASH_0') > -1
      ) {
        return (
          <div key="geneVB-HASH">
            The <i>Hyalomma asiaticum</i> Hyas-2018 version presented here was
            downloaded directly from NCBI (
            <a
              href="https://www.ncbi.nlm.nih.gov/assembly/GCA_013339685.2"
              target="_blank"
            >
              GCA_013339685.2
            </a>
            ). The version at Genome Warehouse (
            <a
              href="https://ngdc.cncb.ac.cn/gwh/Assembly/8867/show"
              target="_blank"
            >
              GWHAMMK00000000
            </a>
            ) may differ from this, especially for non-coding genes.
          </div>
        );
      }
      return null;
    },
  },
  // VectorBase gene page for Ixodes persulcatus Iper-2018
  {
    id: 'IPEI',
    renderDisplay: (props) => {
      if (
        props.projectId == 'VectorBase' &&
        props.location.pathname.indexOf('/record/gene/IPEI_0') > -1
      ) {
        return (
          <div key="geneVB-IPEI">
            The <i>Ixodes persulcatus</i> Iper-2018 version presented here was
            downloaded directly from NCBI (
            <a
              href="https://www.ncbi.nlm.nih.gov/assembly/GCA_013358835.2"
              target="_blank"
            >
              GCA_013358835.2
            </a>
            ). The version at Genome Warehouse (
            <a
              href="https://ngdc.cncb.ac.cn/gwh/Assembly/8896/show"
              target="_blank"
            >
              GWHAMMH00000000.1
            </a>
            ) may differ from this, especially for non-coding genes.
          </div>
        );
      }
      return null;
    },
  },

  // TriTryp gene page for Bodo saltans strain Lake Konstanz
  {
    id: 'bodo',
    renderDisplay: (props) => {
      if (
        props.projectId == 'TriTrypDB' &&
        (props.location.pathname.indexOf('/record/gene/BS') > -1 ||
          props.location.pathname.indexOf('/record/gene/BSAL_') > -1)
      ) {
        return (
          <div key="geneFungi">
            This <i>Bodo saltans</i> genome sequence and annotation represents a
            draft version. Please carefully consider gene models and genome
            structure before drawing conclusions.
          </div>
        );
      }
      return null;
    },
  },

  // OrthoMCL enzyme/compound
  {
    id: 'ortho-enzyme',
    renderDisplay: (props) => {
      if (
        props.projectId == 'OrthoMCL' &&
        /(enzyme|compound)/i.test(window.location.href)
      ) {
        return (
          <div key="ortho-enzyme">
            Note: the Enzyme Commission (EC) numbers associated with proteins
            were obtained only from UniProt. In future releases we expect to
            include EC numbers from multiple sources including the annotation.
          </div>
        );
      }
      return null;
    },
  },
];

const fetchAnnouncementsData = async (wdkService) => {
  const [config, announcements] = await Promise.all([
    wdkService.getConfig(),
    wdkService.getSiteMessages(),
  ]);

  return {
    config,
    announcements,
  };
};

/**
 * Info boxes containing announcements.
 */
export default function Announcements({
  closedBanners = [],
  setClosedBanners = noop,
}) {
  const location = useLocation();
  const data = useWdkService(fetchAnnouncementsData, []);

  const onCloseFactory = useCallback(
    (id) => () => {
      setClosedBanners([...closedBanners, id]);
    },
    [closedBanners]
  );

  if (data == null) return null;

  const {
    down = [],
    degraded = [],
    information = [],
  } = groupBy(data.announcements, 'category');

  return (
    <div>
      {[...down, ...degraded, ...information, ...siteAnnouncements].map(
        (announcementData) => {
          const category = announcementData.category || 'page-information';

          // Currently, only announcements of category "information" are dismissible
          const dismissible = category === 'information';
          const isOpen = dismissible
            ? !closedBanners.includes(`${announcementData.id}`)
            : true;
          const onClose = dismissible
            ? onCloseFactory(`${announcementData.id}`)
            : noop;

          const display =
            typeof announcementData.renderDisplay === 'function'
              ? announcementData.renderDisplay({ ...data.config, location })
              : category !== 'information' || location.pathname === '/'
              ? toElement(announcementData)
              : null;

          return (
            <AnnouncementContainer
              key={announcementData.id}
              category={category}
              dismissible={dismissible}
              isOpen={isOpen}
              onClose={onClose}
              display={display}
            />
          );
        }
      )}
    </div>
  );
}

/**
 * Container for a single announcement banner.
 */
function AnnouncementContainer(props) {
  const icon =
    props.category === 'down'
      ? stopIcon
      : props.category === 'degraded'
      ? warningIcon
      : infoIcon;

  return <AnnouncementBanner {...props} icon={icon} />;
}

/**
 * Banner for a single announcement.
 */
function AnnouncementBanner({ isOpen, onClose, icon, display, dismissible }) {
  if (display == null) {
    return null;
  }

  return (
    <div
      className="eupathdb-Announcement"
      style={{
        margin: '3px',
        padding: '.5em',
        borderRadius: '0.5em',
        borderWidth: '1px',
        borderColor: 'lightgrey',
        borderStyle: 'solid',
        background: '#E3F2FD',
        display: isOpen ? 'block' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        {icon}
        <div
          style={{
            marginLeft: '1em',
            display: 'inline-block',
            width: 'calc(100% - 5.5em)',
            padding: '8px',
            verticalAlign: 'middle',
            color: 'black',
            fontSize: '1.2em',
          }}
        >
          {display}
        </div>
        {dismissible && (
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={onClose}
              className="link"
              style={{
                color: '#7c7c7c',
                alignSelf: 'flex-start',
                fontSize: '0.8em',
              }}
            >
              <IconAlt fa="times" className="fa-2x" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Convert html string to a React Element
 *
 * @param {string} html
 * @return {React.Element}
 */
function toElement({ message }) {
  return safeHtml(message, { key: message }, 'div');
}

/**
 * Join elements with <hr/>
 *
 * @param {React.Element[]|null} previous
 * @param {React.Element} next
 * @return {React.Element[]}
 */
function injectHr(previous, next) {
  return previous == null ? [next] : previous.concat(<hr />, next);
}

/**
 * Returns a function that takes another function and calls it with `args`.
 * @param {any[]} ...args
 * @return {(fn: Function) => any}
 */
function invokeWith(...args) {
  return (fn) => fn(...args);
}

/**
 * Find the value of the first param in the location object.
 *
 * @param {string} name The param name
 * @param {Location} location
 * @return {string?}
 */
function param(name, { search = '' }) {
  return search
    .slice(1)
    .split('&')
    .map((entry) => entry.split('='))
    .filter((entry) => entry[0] === name)
    .map((entry) => entry[1])
    .map(decodeURIComponent)
    .find(() => true);
}

function isGenomicSite(projectId) {
  return !/ClinEpiDB|MicrobiomeDB/i.test(projectId);
}
function isBetaSite() {
  return (
    param('beta', window.location) === 'true' ||
    /^(beta|b1|b2)/.test(window.location.hostname)
  );
}
function isGalaxy(routerLocation) {
  return routerLocation.pathname.startsWith('/galaxy-orientation');
}
function isGenomeBrowser(routerLocation) {
  return routerLocation.pathname.startsWith('/jbrowse');
}
function isApollo(routerLocation) {
  return routerLocation.pathname.startsWith('/static-content/apollo');
}
function isStrategies(routerLocation) {
  return routerLocation.pathname.startsWith('/workspace/strategies');
}
function isBasket(routerLocation) {
  return routerLocation.pathname.startsWith('/workspace/basket');
}
function isFavorites(routerLocation) {
  return routerLocation.pathname.startsWith('/workspace/favorites');
}
function isGenomicHomePage(projectId, routerLocation) {
  return isGenomicSite(projectId) && routerLocation.pathname === '/';
}
function isLegacyBlast(projectId, routerLocation) {
  return (
    isGenomicSite(projectId) &&
    routerLocation.pathname.startsWith('/search') &&
    (routerLocation.pathname.endsWith('UnifiedBlast') ||
      routerLocation.pathname.endsWith('BySimilarity'))
  );
}
