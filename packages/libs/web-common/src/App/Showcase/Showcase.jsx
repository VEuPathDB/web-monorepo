import React, { useMemo } from 'react';
import { IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';
import CardList from './CardList';

import './Showcase.scss';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { AnalysisClient } from '@veupathdb/eda/lib/core/api/AnalysisClient';
import { edaServiceUrl } from 'ebrc-client/config';

export default function Showcase(props) {
  const { analyses, content, prefix, attemptAction } = props;
  const {
    items,
    title,
    viewAllUrl,
    viewAllAppUrl,
    filters,
    filtersLabel,
    contentType,
    contentNamePlural,
    description,
    isLoading,
    isExpandable,
    isSearchable,
    tableViewLink,
    tableViewLinkText,
    cardComponent: Card,
    getSearchStringForItem,
    matchPredicate,
    permissions,
    loadItems,
  } = content;

  const [list, setList] = React.useState(loadItems == null ? items : null);
  const [error, setError] = React.useState();
  const { wdkService } = React.useContext(WdkDependenciesContext);
  const analysisClient = useMemo(() => new AnalysisClient({ baseUrl: edaServiceUrl }, wdkService), [edaServiceUrl, wdkService]);

  React.useEffect(() => {
    if (loadItems) {
      return new Task((fulfill, reject) => {
        loadItems({ analysisClient, wdkService }).then(fulfill, reject);
      }).run(
        setList,
        setError
      );
    }
  }, [loadItems]);

  React.useEffect(() => {
    if (loadItems == null) {
      setList(items);
    }
  }, [items, loadItems]);

  return (
    <div className="stack wdk-Showcase">
      <div className="row wdk-Showcase-HeadingRow">
        {error && <div>{String(error)}</div>}
        <div className="box">
          {!title ? null : <h2>{title}</h2>}
          {!description ? null : <p>{description}</p>}
        </div>
        <div className="box wdk-Showcase-HeadingControls">
          {/*!filters ? null : <ShowcaseFilter filters={filters} onFilter={handleFilter} items={items} />*/}
          {!viewAllUrl && !viewAllAppUrl ? null : (
            <a href={viewAllAppUrl ? prefix + viewAllAppUrl : viewAllUrl}>
              <button className="ViewAll">View All <Icon fa="angle-double-right" /></button>
            </a>
          )}
        </div>
      </div>
      <div className="row wdk-Showcase-ContentRow">
        <CardList
          contentNamePlural={contentNamePlural}
          filters={filters}
          filtersLabel={filtersLabel}
          isLoading={isLoading}
          list={list}
          isExpandable={isExpandable}
          isSearchable={isSearchable}
          tableViewLink={tableViewLink}
          tableViewLinkText={tableViewLinkText}
          getSearchStringForItem={getSearchStringForItem}
          matchPredicate={matchPredicate}
          permissions={permissions}
          attemptAction={attemptAction}
          additionalClassName={contentType}
          renderCard={(card) =>
            <Card analyses={analyses} card={card} attemptAction={attemptAction} prefix={prefix} key={card.name} permissions={permissions}/>
          }
        />
      </div>
    </div>
  );
}
