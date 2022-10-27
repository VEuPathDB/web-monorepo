import React, { useState } from 'react'
import { Story, Meta } from '@storybook/react/types-6-0';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { gray } from '../../definitions/colors'

import Banner, { BannerComponentProps } from '../../components/banners/Banner'
import Toggle from '../../components/widgets/Toggle';

export default {
    title: 'Notifications/Banners',
    component: Banner
} as Meta;

const Template: Story<BannerComponentProps> = (args) => {
    return (
        <UIThemeProvider
            theme={{
                palette: {
                    primary: { hue: gray, level: 200 },
                    secondary: { hue: gray, level: 500 }
                }
            }}
        >
            <Banner {...args}></Banner>
        </UIThemeProvider>
    )
}

export const Warning = Template.bind({});
Warning.args = {
    banner: {
        type: 'warning',
        message: 'This is a "warning" banner.',
        pinned: false,
        intense: false,
    },
    onClose: () => null
} as BannerComponentProps;

export const Danger = Template.bind({});
Danger.args = {
    banner: {
        type: 'danger',
        message: 'This is a "danger" banner.',
        pinned: false,
        intense: false,
    },
    onClose: () => null
} as BannerComponentProps;

export const Error = Template.bind({});
Error.args = {
    banner: {
        type: 'error',
        message: 'This is an "error" banner.',
        pinned: false,
        intense: false,
    },
    onClose: () => null
} as BannerComponentProps;

export const Success = Template.bind({});
Success.args = {
    banner: {
        type: 'success',
        message: 'This is a "success" banner.',
        pinned: false,
        intense: false,
    },
    onClose: () => null
} as BannerComponentProps;

export const Info = Template.bind({});
Info.args = {
    banner: {
        type: 'info',
        message: 'This is an "info" banner.',
        pinned: false,
        intense: false,
    },
    onClose: () => null
} as BannerComponentProps;

export const Normal = Template.bind({});
Normal.args = {
    banner: {
        type: 'normal',
        message: 'This is a "normal" banner.',
        pinned: false,
        intense: false,
    },
    onClose: () => null
} as BannerComponentProps;

// testing showMore
export const ShowMore = (args) => {
  // set showMore state to provide a toggle for easy test
  const [isShowMore, setIsShowMore] = useState(false);
  // set useState to close Banner
  const [shouldShowWarning, setShouldShowWarning] = useState<boolean>(true);
  const handleCloseWarning = () => {
    setShouldShowWarning(false);
  };

  return (
    <div style={{width: '750px'}}>
      {shouldShowWarning && (
        <Banner
          banner={{
            type: 'warning',
            // message is used as a basic text
            message: 'Smoothed mean(s) were not calculated for one or more data series.',
            pinned: false,
            intense: false,
            // text for showMore link
            showMoreLinkText: 'Why?',
            // text for showless link
            showLessLinkText: 'Read less',
            // additionalMessage is shown next to message when clicking showMoreLinkText.
            // disappears when clicking showLess link
            // note that this additionalMessage prop is used to determine show more/less behavior or not
            // if undefined, then just show normal banner with message
            additionalMessage: isShowMore
              ? 'The sample size might be too small or the data too skewed.'
              : undefined,
          }}
          onClose={handleCloseWarning}
        />
      )}
      {/* showMore toggle for easily testing */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Toggle
          label="showMore option:"
          value={isShowMore}
          onChange={setIsShowMore}
        />
      </div>
    </div>
  );
};
