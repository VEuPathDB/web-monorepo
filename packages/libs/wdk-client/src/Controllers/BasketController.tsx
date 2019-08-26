import React, {useEffect, useState} from 'react';
import { connect } from 'react-redux';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import {RecordClass} from 'wdk-client/Utils/WdkModel';
import {RootState} from 'wdk-client/Core/State/Types';
import Loading from 'wdk-client/Components/Loading';
import Tabs from 'wdk-client/Components/Tabs/Tabs';
import {Dispatch} from 'redux';
import {requestBasketCounts} from 'wdk-client/Actions/BasketActions';
import BasketPaneController from 'wdk-client/Controllers/BasketPaneController';

interface MappedProps {
  basketCounts?: Array<{
    recordClass: RecordClass,
    count: number
  }>
}

interface DispatchProps {
  dispatch: Dispatch;
}

function BasketController({ basketCounts, dispatch }: DispatchProps &  MappedProps) {
  useEffect(() => {
    dispatch(requestBasketCounts());
  }, [])

  const firstRecordClassUrlSegment = basketCounts && basketCounts.length > 0
    ? basketCounts[0].recordClass.urlSegment
    : undefined

  const [ activeTab, setActiveTab ] = useState<string | undefined>()

  if (basketCounts == null) return <Loading/>;

  if (firstRecordClassUrlSegment == null) return (
    <div>You do not have any baskets</div>
  );

  return (
    <React.Fragment>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h1>My Baskets</h1>
        <div style={{ textAlign: 'right' }}>
          <div>In case of Error: Fix Basket</div>
          <div>On new releases IDs sometimes change or are retired. Why?</div>
          <div>Old IDs are mapped to new IDs when possible. Retired IDs will not be in the basket.</div>
          <div>To keep a copy of your current basket please download your IDs now</div>
        </div>
      </div>
      <Tabs
        tabs={basketCounts.map(({ recordClass, count }) => ({
          key: recordClass.urlSegment,
          display: `${recordClass.displayNamePlural} (${count})`,
          content: <BasketPaneController recordClassName={recordClass.urlSegment}/>
        }))}
        activeTab={activeTab || firstRecordClassUrlSegment}
        onTabSelected={setActiveTab}
      />
    </React.Fragment>
  );
}

function mapStateToProps(state: RootState): MappedProps {
  const { counts } = state.basket;
  const { recordClasses } = state.globalData;
  if (counts == null || recordClasses == null) return {};
  const basketCounts = recordClasses
    .map(recordClass => ({ recordClass, count: counts[recordClass.urlSegment] }))
    .filter(({ count }) => count > 0)
  return { basketCounts };
}

export default connect(mapStateToProps)(wrappable(BasketController));
