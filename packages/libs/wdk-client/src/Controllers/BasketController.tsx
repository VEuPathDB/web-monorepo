import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { wrappable } from '../Utils/ComponentUtils';
import { RecordClass } from '../Utils/WdkModel';
import { RootState } from '../Core/State/Types';
import Loading from '../Components/Loading';
import Tabs from '../Components/Tabs/Tabs';
import { Dispatch } from 'redux';
import { requestBasketCounts } from '../Actions/BasketActions';
import BasketPaneController from '../Controllers/BasketPaneController';

interface MappedProps {
  basketCounts?: Array<{
    recordClass: RecordClass;
    count: number;
  }>;
}

interface DispatchProps {
  dispatch: Dispatch;
}

function BasketController({
  basketCounts,
  dispatch,
}: DispatchProps & MappedProps) {
  useEffect(() => {
    dispatch(requestBasketCounts());
  }, []);

  const firstRecordClassUrlSegment =
    basketCounts && basketCounts.length > 0
      ? basketCounts[0].recordClass.urlSegment
      : undefined;

  const [activeTab, setActiveTab] = useState<string | undefined>();

  return (
    <React.Fragment>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <h1>My Baskets</h1>
      </div>
      {basketCounts == null ? (
        <Loading />
      ) : firstRecordClassUrlSegment == null ? (
        <div>You do not have any baskets.</div>
      ) : (
        <Tabs
          tabs={basketCounts.map(({ recordClass, count }) => ({
            key: recordClass.urlSegment,
            display: `${recordClass.displayNamePlural} (${count})`,
            content: (
              <BasketPaneController recordClass={recordClass} count={count} />
            ),
          }))}
          activeTab={activeTab || firstRecordClassUrlSegment}
          onTabSelected={setActiveTab}
        />
      )}
    </React.Fragment>
  );
}

function mapStateToProps(state: RootState): MappedProps {
  const { counts } = state.basket;
  const { recordClasses } = state.globalData;
  if (counts == null || recordClasses == null) return {};
  const basketCounts = recordClasses
    .map((recordClass) => ({
      recordClass,
      count: counts[recordClass.urlSegment],
    }))
    .filter(({ count }) => count > 0);
  return { basketCounts };
}

export default connect(mapStateToProps)(wrappable(BasketController));
