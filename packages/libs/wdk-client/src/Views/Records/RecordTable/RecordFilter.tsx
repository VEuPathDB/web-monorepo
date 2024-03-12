import { useState, useCallback, useEffect } from 'react';
import {
  RealTimeSearchBox,
  HelpIcon,
  TabbableContainer,
} from '../../../Components';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import { CheckboxList } from '@veupathdb/coreui';
import { LinksPosition } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';

type FilterAttribute = {
  value: string;
  display: string;
};

type RecordFilterSelectorProps = {
  filterAttributes: FilterAttribute[];
  selectedColumnFilters: FilterAttribute['value'][];
  onColumnFilterChange: (value: FilterAttribute['value'][]) => void;
  toggleFilterFieldSelector: () => void;
  containerClassName: string;
};

interface RecordFilterProps
  extends Omit<
    RecordFilterSelectorProps,
    'toggleFilterFieldSelect' | 'containerClassName'
  > {
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  recordDisplayName: string;
}

export function RecordFilter({
  searchTerm,
  onSearchTermChange,
  recordDisplayName,
  filterAttributes,
  selectedColumnFilters,
  onColumnFilterChange,
}: RecordFilterProps) {
  const [showFieldSelector, setShowFieldSelector] = useState(false);

  const toggleFilterFieldSelector = useCallback(
    () => setShowFieldSelector(!showFieldSelector),
    [showFieldSelector, setShowFieldSelector]
  );

  return (
    <>
      <div style={{ display: 'flex' }}>
        <RealTimeSearchBox
          searchTerm={searchTerm}
          className="wdk-RecordFilterSearchBox"
          placeholderText="Search this table..."
          onSearchTermChange={onSearchTermChange}
          delayMs={0}
          iconName=""
          cancelBtnRightMargin="3em"
        />
        <div
          style={{
            position: 'relative',
            width: 0,
            right: '2.75em',
            top: '0.25em',
          }}
        >
          <Tooltip title="Show search fields">
            <button
              className="fa fa-caret-down"
              style={{ background: 'none', border: 'none' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFilterFieldSelector();
              }}
            />
          </Tooltip>
        </div>
        <HelpIcon>
          <div>
            <ul>
              <li>
                The {recordDisplayName} in your refined list will contain ALL
                your terms (or phrases, when using double quotes), in ANY of the
                selected fields.
              </li>
              <li>
                Click on the arrow inside the box to select/unselect fields.{' '}
              </li>
              <li>
                Your terms are matched at the start; for example, the term{' '}
                <i>typ</i> will match{' '}
                <i>
                  <u>typ</u>ically
                </i>{' '}
                and{' '}
                <i>
                  <u>typ</u>e
                </i>
                , but <strong>not</strong>{' '}
                <i>
                  <u>atyp</u>ical
                </i>
                .
              </li>
              <li>
                Your terms may include * wildcards; for example, the term{' '}
                <i>*typ</i> will match{' '}
                <i>
                  <u>typ</u>ically
                </i>
                ,{' '}
                <i>
                  <u>typ</u>e
                </i>
                , and{' '}
                <i>
                  a<u>typ</u>ical
                </i>
                .
              </li>
            </ul>
          </div>
        </HelpIcon>
      </div>
      {showFieldSelector && (
        <RecordTableFilterSelector
          filterAttributes={filterAttributes}
          selectedColumnFilters={selectedColumnFilters}
          onColumnFilterChange={onColumnFilterChange}
          toggleFilterFieldSelector={toggleFilterFieldSelector}
          containerClassName="wdk-Answer-filterFieldSelector"
        />
      )}
    </>
  );
}

function RecordTableFilterSelector({
  filterAttributes,
  selectedColumnFilters,
  onColumnFilterChange,
  toggleFilterFieldSelector,
  containerClassName,
}: RecordFilterSelectorProps) {
  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      toggleFilterFieldSelector();
    }
  };

  const handleDocumentClick = (e: MouseEvent) => {
    const clickedElement = e.target as HTMLElement;
    if (!clickedElement.closest(`.${containerClassName}`)) {
      toggleFilterFieldSelector();
    }
  };

  return (
    <TabbableContainer
      autoFocus
      onKeyDown={handleKeyPress}
      className={containerClassName}
    >
      <CheckboxList
        items={filterAttributes}
        // must ensure referential equality, thus unable to simply pass in selectedColumnFilters as the value prop
        value={filterAttributes
          .filter((attr) => selectedColumnFilters.includes(attr.value))
          .map((attr) => attr.value)}
        onChange={onColumnFilterChange}
        linksPosition={LinksPosition.Top}
      />
      <div className="wdk-Answer-filterFieldSelectorCloseIconWrapper">
        <button
          className="fa fa-close wdk-Answer-filterFieldSelectorCloseIcon"
          onClick={toggleFilterFieldSelector}
        />
      </div>
    </TabbableContainer>
  );
}
