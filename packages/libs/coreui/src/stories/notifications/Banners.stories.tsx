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
            pinned: true,
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
            spacing: {
              margin: '0.3125em 0',
              padding: '0.3125em 0.625em',
            },
            fontSize: '0.8125em',
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

// testing Banner timeout
export const BannerTimeout = (args) => {

  // Banner timeout related useState
  const [showBanner, setShowBanner] = useState(true);
  // hiding duration (unit in milli-second)
  const autoHideDuration = 5000;
  // fadeout effect when timeout
  const [fadeoutEffect, setFadeoutEffect] = useState(false);

  // just for testing Banner timeout - no need for actual implementation
  // it is just to show banner again by toggling after disappearance, regardless of true/false
  const [showAgain, setShowagain] = useState(false);

  return (
    <>
      <div style={{ width: '750px', height: '4em' }}>
        <Banner
          banner={{
            type: 'warning',
            // message is used as a basic text
            message: 'Smoothed mean(s) were not calculated for one or more data series.',
            pinned: true,
            intense: false,
            // Banner timeout props
            showBanner: showBanner,
            setShowBanner: setShowBanner,
            autoHideDuration: autoHideDuration,
            // fadeout effect when timeout
            fadeoutEffect: fadeoutEffect,
            setFadeoutEffect: setFadeoutEffect,
          }}
        />
      </div>
      {/* test timeout with toggle: Banner will show up whenever toggling and then disappear */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Toggle
          label="Toggle to show banner again:"
          value={showAgain}
          onChange={(newValue: boolean) => {
            setShowagain(newValue);
            setShowBanner(true);
            setFadeoutEffect(false);
          }}
        />
      </div>
      <p> auto hide duration: {autoHideDuration} ms</p>
  </>
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

  const mosaicStatsTable = () => {

    const tableThinBorder = '1px solid black';
    const tableThickBorder = '2px solid black';
    const tablePaddingDefault = '0.3em 0.5em 0.3em 0em';

    const tableColumnHeaderStyle = {
      borderRight: tableThickBorder,
      borderBottom: tableThinBorder,
      borderLeft: tableThickBorder,
      width: '20em',
      padding: tablePaddingDefault,
    };

    const tableRowHeaderStyle = {
      borderTop: tableThickBorder,
      width: '10em',
      padding: tablePaddingDefault,
    };

    const tableRowBorder = {
      borderLeft: tableThickBorder,
      borderRight: tableThickBorder,
    };

    const tableCellStyle = {
      borderBottom: tableThinBorder,
      width: '10em',
      padding: tablePaddingDefault,
    };

    return (
      <>
        <table style={{ borderCollapse: 'collapse', marginTop: '1em', textAlign: 'right' }}>
          <tr style={{ borderBottom: tableThickBorder, borderRight: tableThickBorder }}>
            <td style={{ borderRight: tableThickBorder }}>&nbsp;</td>
            <td style={tableRowHeaderStyle}><b>value</b></td>
            <td style={tableRowHeaderStyle}><b>95% CI</b></td>
            <td style={tableRowHeaderStyle}><b>P-value</b></td>
          </tr>
          <tr style={tableRowBorder}>
            <td style={tableColumnHeaderStyle}><b>Cohort or RCT: Odds ratio</b></td>
            <td style={tableCellStyle}>5</td>
            <td style={tableCellStyle}>92</td>
            <td style={tableCellStyle}>97</td>
          </tr>
          <tr style={tableRowBorder}>
            <td style={tableColumnHeaderStyle}><b>Case control or Cross-sectional: Risk ratio</b></td>
            <td style={tableCellStyle}>13</td>
            <td style={tableCellStyle}>126</td>
            <td style={tableCellStyle}>139</td>
          </tr>
          <tr style={tableRowBorder}>
            <td style={tableColumnHeaderStyle}><b>Chi-squared (df=1)</b></td>
            <td style={tableCellStyle}>18</td>
            <td style={tableCellStyle}>n/a</td>
            <td style={tableCellStyle}>236</td>
          </tr>
          <tr style={tableRowBorder}>
            <td style={tableColumnHeaderStyle}><b>Sensitivity</b></td>
            <td style={tableCellStyle}>&nbsp;</td>
            <td style={tableCellStyle}>&nbsp;</td>
            <td style={tableCellStyle}>n/a</td>
          </tr>
          <tr style={{ borderRight: tableThickBorder, borderBottom: tableThickBorder, borderLeft: tableThickBorder }}>
            <td style={tableColumnHeaderStyle}><b>Specificity</b></td>
            <td style={tableCellStyle}>&nbsp;</td>
            <td style={tableCellStyle}>&nbsp;</td>
            <td style={tableCellStyle}>n/a</td>
          </tr>
        </table>
      </>
    )
  };

  const CollapsibleStatsContent = () => {

  return (
    <div>
      Which measure of association to choose depends on whether you are working with incidence or prevalence data, which in turn depends on the type of study design used.

      Studies that collect incidence data: cohort studies and randomized controlled trials

      <ul>
      <li> Look for new cases of disease.</li>
      <li> There is some longitudinal follow-up that must occur to allow for these new cases to develop.</li>
      <li> Must start with those who were at risk (i.e., without the disease or health outcome) as our baseline.</li>
      <li> Calculate Risk ratio over the length of time of follow-up</li>
      <ul>
      <li> If the RR is greater than 1, it means that we observed less disease in the exposed group than in the unexposed group. Likewise, if the RR is less than 1, it means that we observed less disease in the exposed group than in the unexposed group. If we assume causality, an exposure with an RR &lt; 1 is preventing disease, and an exposure with an RR &gt; 1 is causing disease.</li>
      <li> "The risk of [disease] was [RR] times as high in [exposed] compared to [unexposed] over [x] days/months/years."</li>
      </ul>
      <li> Rate ratio if person time at risk.</li>
      <li> Both the risk ratio and the rate ratio are abbreviated RR. This abbreviation (and the risk ratio and/or rate ratio) is often referred to by epidemiologists as relative risk. This is an example of inconsistent lexicon in the field of epidemiology; in this book, I use risk ratio and rate ratio separately (rather than relative risk as an umbrella term) because it is helpful, in my opinion, to distinguish between studies using the population at risk vs. those using a person-time at risk approach. Regardless, a measure of association called RR always calculated as incidence in the exposed divided by incidence in the unexposed.</li>
      </ul>

      Studies that look at prevalence data: Cross sectional studies and case-control studies. For both of these, since we are not using incidence cases, we cannot calculate the RR, because we have no data on incidence. We instead calculate the odds ratio (OR).
  </div>
  )};

  return (
    <>
      <h3> Mosaic 2x2 more informatio box</h3>
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
      <br />
      <h3> Mosaic 2x2 Statistics tab box </h3>
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
          CollapsibleContent={CollapsibleStatsContent}
        />
      )}
    </div>
    <br />
    <h3> Mosaic 2x2 Statistics table </h3>
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
          CollapsibleContent={mosaicStatsTable}
        />
      )}
    </div>
    </>
  );
};