import PropTypes from 'prop-types';
import React from 'react';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import Icon from '../../Components/Icon/IconAlt';
import EmptyField from '../../Components/AttributeFilter/EmptyField';
import MultiFieldFilter from '../../Components/AttributeFilter/MultiFieldFilter';
import SingleFieldFilter from '../../Components/AttributeFilter/SingleFieldFilter';
import { isMulti } from '../../Components/AttributeFilter/AttributeFilterUtils';

const cx = makeClassNameHelper('field-detail');
/**
 * Main interactive filtering interface for a particular field.
 */
function FieldFilter(props) {
  let className = cx('', props.hideFieldPanel && 'fullWidth');

  return (
    <div className={className}>
      {!props.activeField ? (
        <EmptyField displayName={props.displayName} />
      ) : (
        <React.Fragment>
          <h3>
            {props.activeField.display + ' '}
            {!props.activeFieldState ||
              (props.activeFieldState.loading && (
                <React.Fragment>
                  <Icon fa="circle-o-notch" className="fa-spin" />
                  <span className="sr-only">Loading...</span>
                </React.Fragment>
              ))}
          </h3>
          {props.activeField.description && (
            <div className="field-description">
              {props.activeField.description}
            </div>
          )}
          {props.activeField.variableName && (
            <div className="field-variableName">
              (<i>Provider label:</i> {props.activeField.variableName})
            </div>
          )}
          {props.activeFieldState && props.activeFieldState.errorMessage ? (
            <div style={{ color: 'darkred' }}>
              {props.activeFieldState.errorMessage}
            </div>
          ) : (props.activeFieldState &&
              props.activeFieldState.summary == null &&
              props.activeFieldState.leafSummaries == null) ||
            props.dataCount == null ? null : isMulti(props.activeField) ? (
            <MultiFieldFilter {...props} />
          ) : (
            <SingleFieldFilter {...props} />
          )}
        </React.Fragment>
      )}
    </div>
  );
}

const FieldSummary = PropTypes.shape({
  valueCounts: PropTypes.array.isRequired,
  internalsCount: PropTypes.number.isRequired,
  internalsFilteredCount: PropTypes.number.isRequired,
});

const MultiFieldSummary = PropTypes.arrayOf(
  PropTypes.shape({
    term: PropTypes.string.isRequired,
    valueCounts: PropTypes.array.isRequired,
    internalsCount: PropTypes.number.isRequired,
    internalsFilteredCount: PropTypes.number.isRequired,
  })
);

FieldFilter.propTypes = {
  displayName: PropTypes.string,
  dataCount: PropTypes.number,
  filteredDataCount: PropTypes.number,
  filters: PropTypes.array,
  activeField: PropTypes.object,
  activeFieldState: PropTypes.shape({
    loading: PropTypes.boolean,
    summary: FieldSummary,
    leafSummaries: MultiFieldSummary,
    /* member, range, multi specific settings */
  }),

  onFiltersChange: PropTypes.func,
  onMemberSort: PropTypes.func,
  onMemberSearch: PropTypes.func,
  onRangeScaleChange: PropTypes.func,

  hideFieldPanel: PropTypes.bool,
  selectByDefault: PropTypes.bool.isRequired,
};

FieldFilter.defaultProps = {
  displayName: 'Items',
};

export default FieldFilter;
