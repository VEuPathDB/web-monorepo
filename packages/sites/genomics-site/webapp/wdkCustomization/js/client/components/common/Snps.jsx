/* global wdk */
import $ from 'jquery';
import {PureComponent} from 'wdk-client/ComponentUtils';

export class SnpsAlignmentTable extends PureComponent {
  componentDidMount() {
    $(this.node)
    .on('click', '.select-all', event => {
      event.preventDefault();
      this.getCheckboxes().prop('checked', true);
      this.udpateSubmitDisabled();
    })
    .on('click', '.clear-all', event => {
      event.preventDefault();
      this.getCheckboxes().prop('checked', false);
      this.udpateSubmitDisabled();
    })
    .on('change', '[name="isolate_ids"]:checkbox', () => {
      this.udpateSubmitDisabled();
    })

  }

  getCheckboxes() {
    return $(this.node).find('[name="isolate_ids"]:checkbox');
  }

  udpateSubmitDisabled() {
    let isDisabled = this.getCheckboxes().filter(':checked').length === 0;
    $(this.node).find(':submit').prop('disabled', isDisabled);
  }

  renderFormButtons() {
    return (
      <p>
        <input type="submit" value="Run Clustalw on Selected Strains" disabled={true} />{' '}
        <a className="select-all" href="#">Select all</a>{' | '}
        <a className="clear-all" href="#">Clear all</a>
      </p>
    )
  }

  render() {
    let { strainAttributeName, startAttributeName, endAttributeName, record } = this.props;
    let start = record.attributes[startAttributeName];
    let end = record.attributes[endAttributeName];
    let sid = record.attributes.seq_source_id;
    let value = this.props.value.map((row) => {
      let strain = row[strainAttributeName];
      return Object.assign({}, row, {
        [strainAttributeName]: `<label><input name="isolate_ids" value="${strain}" type="checkbox"/> ${strain}</label>`
      })
    });
    return (
      <div ref={node => this.node = node}>
        <form action="/cgi-bin/isolateClustalw" method="post" target="_blank">
          <input name="project_id" value={wdk.MODEL_NAME} type="hidden"/>
          <input name="type" value="htsSnp" type="hidden"/>
          <input name="sid" value={sid} type="hidden"/>
          <input name="end" value={end} type="hidden"/>
          <input name="start" value={start} type="hidden"/>

          {this.renderFormButtons()}
          <this.props.DefaultComponent {...this.props} value={value}/>
          {this.renderFormButtons()}
        </form>
      </div>
    )
  }
}