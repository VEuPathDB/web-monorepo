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
            // additionalMessage is shown next to message when clicking showMoreLinkText.
            // disappears when clicking showLess link
            // note that this additionalMessage prop is used to determine show more/less behavior or not
            // if undefined, then just show normal banner with message
            additionalMessage: isShowMore
              ? 'The sample size might be too small or the data too skewed.'
              : undefined,
            // additionalMessage: isShowMore
            // ? {collapsibleContent())
            // : undefined,

            // text for showMore link
            showMoreLinkText: 'Why?',
            // text for showless link
            showLessLinkText: 'Read less',
            // color for show more links
            showMoreLinkColor: '#006699',
            // is showMoreLink bold?
            isShowMoreLinkBold: false,
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

// testing collapsible banner
export const Collapsible = (args) => {
  // set useState to close Banner
  const [shouldShowWarning, setShouldShowWarning] = useState<boolean>(true);
  const handleCloseWarning = () => {
    setShouldShowWarning(false);
  };

  const CollapsibleContent = () => {
    const tableCellStyle = {
      border: '1px solid black',
      borderSpacing: '0px',
      width: '7em',
    };

    return (
      <>
        The shorthand "A, B, C, D" is used to refer to specific quadrants in the 2x2 contingency table:
        <table style={{ borderCollapse: 'collapse', marginTop: '1em', textAlign: 'center' }}>
          <tr>
            <td style={{ width: '10em' }}>&nbsp;</td>
            <td colSpan={3}><b>X-axis:</b> outcome/disease status;<br />
              gold standard/reference test result
            </td>
          </tr>
          <tr>
            <td rowSpan={3}><b>Y-axis:</b><br />
              exposure/risk factor; <br />
              diagnostic test result
            </td>
            <td style={tableCellStyle}>&nbsp;</td>
            <td style={tableCellStyle}><b>+</b></td>
            <td style={tableCellStyle}><b>-</b></td>
          </tr>
          <tr>
            <td style={tableCellStyle}><b>+</b></td>
            <td style={tableCellStyle}>A</td>
            <td style={tableCellStyle}>B</td>
          </tr>
          <tr>
            <td style={tableCellStyle}><b>-</b></td>
            <td style={tableCellStyle}>C</td>
            <td style={tableCellStyle}>D</td>
          </tr>
        </table>
        <br />
        <b><i>If you want to investigate a measure of association:</i></b>
        <ul>
          <li>X-axis: select a value for Quadrant A representing the outcome or disease status of interest</li>
          <li>Y-axis: select a value for Quadrant A representing the exposure or risk factor of interest</li>
        </ul>
        <br />
        <b><i>If you want to investigate diagnostic test performance:</i></b>
        <ul>
          <li>X-axis: select a value for Quadrant A representing a positive result for the reference (gold standard) diagnostic test</li>
          <li>Y-axis: select values for Quadrant A representing a positive result for the diagnostic test being evaluated</li>
        </ul>
      </>
    )
  };

  return (
    <div style={{width: '960px'}}>
      {shouldShowWarning && (
        <Banner
          banner={{
            type: 'info',
            // message is used as a basic text
            message: 'The 2x2 contingency table must be properly constructed to correctly calculate statistics and interpret your results.',
            pinned: true,
            intense: false,
            additionalMessage: undefined,
            // text for showMore link
            showMoreLinkText: 'Read more...',
            // text for showless link
            showLessLinkText: 'Read less...',
            // color for show more links
            showMoreLinkColor: '#000000',
            // is showMoreLink bold?
            isShowMoreLinkBold: true,
          }}
          onClose={handleCloseWarning}
          // collapsible content: React.FC
          CollapsibleContent={CollapsibleContent}
        />
      )}
    </div>
  );
};