import Wdk from 'wdk';

// Import custom Components
import {
  DatasetRecord
} from './records/DatasetRecordClasses.DatasetRecordClass';

let Link = ReactRouter.Link;
let Sticky = Wdk.client.Components.Sticky;

let Img = React.createClass({

  render() {
    return (
      <img {...this.props} src={wdk.assetsUrl(this.props.src)}/>
    );
  }

});

// Footer
let Footer = React.createClass({
  render() {
    let siteName = wdk.MODEL_NAME;
    let buildNumber = wdk.VERSION;
    let today = new Date;
    let releaseDate = today.toDateString();
    let copyrightYear = today.getFullYear();

    return (
      <div id="fixed-footer">
        <div className="left">
          <div className="build-info">
            <a href={location.origin}>{siteName}</a> {buildNumber}
            <span className="release"> {releaseDate}</span><br/>
          </div>
          <div className="copyright">&copy;{copyrightYear} The EuPathDB Project Team</div>
        </div>

        <div className="right">
          <ul className="attributions">
            <li>
              <a href="http://code.google.com/p/strategies-wdk/">
                <Img border="0" src="wdk/images/stratWDKlogo.png" width="120"/>
              </a>
            </li>
          </ul>
        </div>

        <div className="bottom">
          <ul className="site-icons">
            <li title="EuPathDB.org">
              <a href="http://www.eupathdb.org">
                <Img src="images/eupathdblink.png" alt="Link to EuPathDB homepage"/>
              </a>
            </li>
            <li className="short-space" title="AmoebaDB.org">
              <a href="http://amoebadb.org">
                <Img src="images/AmoebaDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="CryptoDB.org">
              <a href="http://cryptodb.org">
                <Img src="images/CryptoDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="FungiDB.org">
              <a href="http://fungidb.org">
                <Img src="images/FungiDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="GiardiaDB.org">
              <a href="http://giardiadb.org">
                <Img src="images/GiardiaDB/footer-logo.png"/>
              </a>
            </li>
            <li className="long-space" title="MicrosporidiaDB.org">
              <a href="http://microsporidiadb.org">
                <Img src="images/MicrosporidiaDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="PiroplasmaDB.org">
              <a href="http://piroplasmadb.org">
                <Img src="images/PiroplasmaDB/footer-logo.png"/>
              </a>
            </li>
            <li className="long-space" title="PlasmoDB.org">
              <a href="http://plasmodb.org">
                <Img src="images/PlasmoDB/footer-logo.png"/>
              </a>
            </li>
            <li className="long-space" title="ToxoDB.org">
              <a href="http://toxodb.org">
                <Img src="images/ToxoDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="TrichDB.org">
              <a href="http://trichdb.org">
                <Img src="images/TrichDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="TriTrypDB.org">
              <a href="http://tritrypdb.org">
                <Img src="images/TriTrypDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="OrthoMCL.org">
              <a href="http://orthomcl.org">
                <Img src="images/OrthoMCL/footer-logo.png"/>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});

// Add footer to main content
Wdk.client.Components.Main.wrapComponent(function(Main) {
  let ApiMain = React.createClass({
    render() {
      return (
        <Main {...this.props}>
          <div
            className="eupathdb-Beta-Announcement"
            title="BETA means pre-release; a beta page is given out to a large group of users to try under real conditions. Beta versions have gone through alpha testing inhouse and are generally fairly close in look, feel and function to the final product; however, design changes often occur as a result.">
              You are viewing a <strong>BETA</strong> (pre-release) page. <a data-name="contact_us" className="new-window" href="contact.do">Feedback and comments</a> are welcome!
          </div>
          {this.props.children}
          <Footer/>
        </Main>
      );
    }
  });
  return ApiMain;
});

// Customize the Record Component
Wdk.client.Components.RecordUI.wrapComponent(function(RecordUI) {
  // Map record class names to custom Components
  function recordComponent(recordClassName) {
    switch (recordClassName) {
      case 'DatasetRecordClasses.DatasetRecordClass':
        return DatasetRecord;

      default:
        return RecordUI;
    }
  }

  // This React Component will delegate to custom Components defined in the
  // Object defined above.
  let RecordComponentResolver =  React.createClass({
    render() {
      let Component = recordComponent(this.props.recordClass.fullName);
      return (
        <Component {...this.props}/>
      );
    }
  });

  return RecordComponentResolver;
});

let TranscriptList = React.createClass({

  mixins: [ ReactRouter.Navigation ],

  render() {
    let { record, recordClass } = this.props;
    let params = { class: recordClass.fullName };
    if (record.tables.GeneTranscripts == null) return null;

    return (
      <div>
        <div>Transcript</div>
        <ul className="eupathdb-TranscriptRecordNavList">
          {record.tables.GeneTranscripts.map(row => {
            let { transcript_id } = row;
            let query = React.addons.update(record.id, {
              source_id: { $set: transcript_id }
            });
            return (
              <li key={transcript_id}>
                <Link to="record" params={params} query={query} onClick={() => scrollToElementById('trans_parent')}>
                  {row.transcript_id}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

});

Wdk.client.Components.RecordUI.wrapComponent(function(RecordUI) {
  let TranscriptRecord = React.createClass({
    componentDidMount() {
      this.handleNewProps(this.props);
    },
    componentWillReceiveProps(nextProps) {
      this.handleNewProps(nextProps);
    },
    handleNewProps(props) {
      if (!('GeneTranscripts' in props.record.tables)) {
        if (this.fetching) return;
        let { recordClass } = props;
        let spec = {
          primaryKey: props.record.id,
          attributes: [],
          tables: [ 'GeneTranscripts' ]
        };
        this.fetching = true;
        setTimeout(() => {
          props.actions.fetchRecordDetails(recordClass.fullName, spec)
        });
      }
      else {
        this.fetching = false;
        this.setState(props);
      }
    },
    render() {
      if (this.state === null) return null;
      return (
        <RecordUI {...this.state}/>
      );
    }
  });

  let ApiRecord = React.createClass({
    render() {
      let { recordClass } = this.props;
      switch(recordClass.fullName) {
        case 'DatasetRecordClasses.DatasetRecordClass':
          return <DatasetRecord {...this.props}/>
        case 'TranscriptRecordClasses.TranscriptRecordClass':
          // return <TranscriptRecord {...this.props}/>
        default:
          return <RecordUI {...this.props}/>
      }
    }
  });

  return ApiRecord;
});

Wdk.client.Components.RecordNavigationSection.wrapComponent(function(RecordNavigationSection) {
  let ApiRecordNavigationSection = React.createClass({
    render() {
      let { recordClass, categories } = this.props;
      if (recordClass.fullName == 'TranscriptRecordClasses.TranscriptRecordClass') {
        let geneCategory = categories.find(cat => cat.name === 'gene_parent');
        let transCategory = categories.find(cat => cat.name === 'trans_parent');
        return (
          <div>
            <RecordNavigationSection
              {...this.props}
              categories={geneCategory.subCategories}
              heading="Gene"
            />
            <RecordNavigationSection
              {...this.props}
              categories={transCategory.subCategories}
              heading={<TranscriptList {...this.props}/>}
            />
          </div>
        );
      }
      return <RecordNavigationSection {...this.props}/>
    }
  });
  return ApiRecordNavigationSection;
});

Wdk.client.Components.RecordMainSection.wrapComponent(function(RecordMainSection) {
  let ApiRecordMainSection = React.createClass({

    render() {
      let { recordClass, categories, depth = 1 } = this.props;

      if (recordClass.fullName == 'TranscriptRecordClasses.TranscriptRecordClass' && depth == 1) {
        let uncategorized = categories.find(c => c.name === undefined);
        categories = categories.filter(c => c !== uncategorized);
        return(
          <div>
            {categories.map(this.renderCategory)}
          </div>
        );
      }

      return (
        <RecordMainSection {...this.props} categories={categories}/>
      );
    },

    renderCategory(category) {
      if (category.name == 'gene_parent') {
        return this.renderGeneCategory(category);
      }
      if (category.name == 'trans_parent') {
        return this.renderTransCategory(category);
      }
      return (
        <section id={category.name} key={category.name}>
          <h1>{category.displayName}</h1>
          <RecordMainSection {...this.props} categories={[category]}/>
        </section>
      );
    },

    renderGeneCategory(category) {
      return (
        <section id={category.name} key={category.name}>
          <RecordMainSection {...this.props} categories={category.subCategories}/>
        </section>
      );
    },

    renderTransCategory(category) {
      let { recordClass, record, collapsedCategories } = this.props;
      let allCategoriesHidden = category.subCategories.every(cat => collapsedCategories.includes(cat.name));
      return (
        <section id={category.name} key={category.name}>
          <Sticky className="eupathdb-TranscriptSticky" fixedClassName="eupathdb-TranscriptSticky-fixed">
            <h1 className="eupathdb-TranscriptHeading">Transcript</h1>
            <nav className="eupathdb-TranscriptTabList">
              {this.props.record.tables.GeneTranscripts.map(row => {
                let { transcript_id } = row;
                let isActive = transcript_id === record.id.source_id;
                let query = Object.assign({}, record.id, { source_id: transcript_id });
                let params = { class: recordClass.fullName };
                return (
                  <Link
                    to="record"
                    params={params}
                    query={query}
                    className="eupathdb-TranscriptLink"
                    activeClassName="eupathdb-TranscriptLink-active"
                  >
                    {transcript_id}
                  </Link>
                );
              })}
            </nav>
          </Sticky>
          <div className="eupathdb-TranscriptTabContent">
            {allCategoriesHidden
              ? <p>All Transcript categories are currently hidden.</p>
              :  <RecordMainSection {...this.props} categories={category.subCategories}/>}
          </div>
        </section>
      );
    }

  });

  return ApiRecordMainSection;
});

function scrollToElementById(id) {
  let el = document.getElementById(id);
  if (el === undefined) return;
  let rect = el.getBoundingClientRect();
  if (rect.top < 0) return;
  el.scrollIntoView();
}

// Bootstrap the WDK client application

// getApiClientConfig() is defined in /client/index.jsp
let config = window.getApiClientConfig();
let app = window._app = Wdk.client.run({
  rootUrl: config.rootUrl,
  endpoint: config.endpoint,
  rootElement: config.rootElement
});

// TODO Convert initialData to an action
if (config.initialData) {
  let action = config.initialData;
  app.store.dispatch(action);
}
