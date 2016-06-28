/* global wdk */
import $ from 'jquery';
import { Component, PropTypes } from 'react';
let { AttributeFilter } = wdk.components.attributeFilter;
let { LazyFilterService } = wdk.models.filter;

export class FilterParam extends Component {
  constructor(props) {
    super(props);
    this.state = { isVocabLoading: true };
    this.handleServiceChange = () => {
      let serviceState = this.filterService.getState();
      this.setState(serviceState)
      this.props.onChange(serviceState);
    };
  }

  componentDidMount() {
    let { questionName, dependedValue } = this.props;
    $.getJSON(wdk.webappUrl('/getVocab.do?' +
      'questionFullName=' + questionName +
      '&name=ngsSnp_strain_meta' +
      '&dependedValue=' + JSON.stringify(dependedValue) +
      '&json=true'))
    .then(filterData => {
      this.filterService = new LazyFilterService({
        name: 'ngsSnp_strain_meta',
        fields: Object.keys(filterData.metadataSpec).map(key => Object.assign({
          term: key,
          display: key
        }, filterData.metadataSpec[key])),
        data: filterData.values,
        questionName: 'GeneQuestions.GenesByNgsSnps',
        dependedValue
      });
      this.handleServiceChange();
      this.setState({ isVocabLoading: false });
      this.filterService.on('change', this.handleServiceChange);
    });
  }

  componentWillUnmount() {
    this.filterService && this.filterService.off('change', this.setStateFromService);
  }

  render() {
    let {
      isVocabLoading,
      fields,
      filters,
      data,
      filteredData,
      ignoredData,
      columns,
      selectedField,
      distributionMap,
      fieldMetadataMap,
      isLoading,
      invalidFilters
    } = this.state;

    return isVocabLoading ? <div>Loading...</div> : (
      <div className="filter-param">
        <AttributeFilter
          displayName={this.props.displayName}
          fields={fields}
          filters={filters}
          dataCount={data.length}
          filteredData={filteredData}
          ignoredData={ignoredData}
          columns={columns}
          activeField={selectedField}
          activeFieldSummary={selectedField && distributionMap[selectedField.term]}
          fieldMetadataMap={fieldMetadataMap}

          isLoading={isLoading}
          invalidFilters={invalidFilters}

          onActiveFieldChange={this.filterService.selectField}
          onFiltersChange={this.filterService.updateFilters}
          onColumnsChange={this.filterService.updateColumns}
          onIgnoredDataChange={this.filterService.updateIgnoredData}
        />
      </div>
    )
  }
}

FilterParam.propTypes = {
  displayName: PropTypes.string.isRequired,
  questionName: PropTypes.string.isRequired,
  dependedValue: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  onChange: PropTypes.func.isRequired
};
