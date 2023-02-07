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
        The shorthand "A, B, C, D" is used to refer to specific quadrants in the 2x2 table:
        <table style={{ borderCollapse: 'collapse', marginTop: '1em', textAlign: 'center' }}>
          <tr>
            <td style={{ width: '10em' }}>&nbsp;</td>
            <td colSpan={3}><b>Columns (X-axis):<br />
              </b> outcome/disease status;<br />
              gold standard/reference test result
            </td>
          </tr>
          <tr>
            <td rowSpan={3}><b>Rows (Y-axis):</b><br />
              exposure/risk factor; <br />
              diagnostic test result
            </td>
            <td style={tableCellStyle}>&nbsp;</td>
            <td style={tableCellStyle}><b>+</b></td>
            <td style={tableCellStyle}><b>-</b></td>
          </tr>
          <tr>
            <td style={tableCellStyle}><b>+</b></td>
            <td style={tableCellStyle}><b>A</b></td>
            <td style={tableCellStyle}><b>B</b></td>
          </tr>
          <tr>
            <td style={tableCellStyle}><b>-</b></td>
            <td style={tableCellStyle}><b>C</b></td>
            <td style={tableCellStyle}><b>D</b></td>
          </tr>
        </table>
        <br />
        <b><i>If you want to investigate a measure of association:</i></b>
        <ul>
          <li>Columns (X-axis): select a value for Quadrant A representing the outcome or disease status of interest.</li>
          <li>Rows (Y-axis): select a value for Quadrant A representing the exposure or risk factor of interest.</li>
        </ul>
        <br />
        <b><i>If you want to investigate diagnostic test performance:</i></b>
        <ul>
          <li>Columns (X-axis): select a value for Quadrant A representing a positive result for the reference (gold standard) diagnostic test.</li>
          <li>Rows (Y-axis): select values for Quadrant A representing a positive result for the diagnostic test being evaluated.</li>
        </ul>
      </>
    )
  };

  const mosaicStatsTable = () => {

    const tableThinBorder = '1px solid black';
    const tableThickBorder = '2px solid black';
    const tablePaddingDefault = '0.3em 0.5em 0.3em 0em';

    const tableFirstColumnHeaderStyle = {
      borderRight: tableThickBorder,
      borderBottom: tableThinBorder,
      borderLeft: tableThickBorder,
      width: '21em',
      padding: tablePaddingDefault,
    };

    const tableSecondColumnHeaderStyle = {
      borderRight: tableThickBorder,
      borderBottom: tableThinBorder,
      borderLeft: tableThickBorder,
      width: '13em',
      padding: tablePaddingDefault,
    };

    const tableRowHeaderStyle = {
      borderTop: tableThickBorder,
      width: '7em',
      // padding: tablePaddingDefault,
      backgroundColor: 'lightgray',
      margin: 'auto',
    };

    const tableRowBorder = {
      borderLeft: tableThickBorder,
      borderRight: tableThickBorder,
    };

    const tableCellStyle = {
      borderBottom: tableThinBorder,
      width: '7em',
    };

    const tableCellAlignCenter = {
      textAlign: 'center'
    }

    return (
      <>
        <table style={{ borderCollapse: 'collapse', marginTop: '1em', textAlign: 'right' }}>
          <tr style={{ borderBottom: tableThickBorder, borderRight: tableThickBorder }}>
            <td style={{}}>&nbsp;</td>
            <td style={{ borderRight: tableThickBorder }}>&nbsp;</td>
            <td style={tableRowHeaderStyle}><b>value</b></td>
            <td style={tableRowHeaderStyle}><b>95% CI</b></td>
            <td style={tableRowHeaderStyle}><b>P-value</b></td>
          </tr>
          <tr style={tableRowBorder}>
            <td style={tableFirstColumnHeaderStyle}>Association between 2 categorical variables</td>
            <td style={tableSecondColumnHeaderStyle}><b>Chi-squared (df=1)</b></td>
            <td style={tableCellStyle}>2.82</td>
            <td style={tableCellStyle}>n/a</td>
            <td style={tableCellStyle}>&lt; 0.0001</td>
          </tr>
          <tr style={tableRowBorder}>
            <td style={tableFirstColumnHeaderStyle}>Association between 2 categorical variables</td>
            <td style={tableSecondColumnHeaderStyle}><b>Fisher's Exact Test</b></td>
            <td style={tableCellStyle}>0.34</td>
            <td style={tableCellStyle}>(0.32-0.39)</td>
            <td style={tableCellStyle}>0.66</td>
          </tr>
          <tr style={tableRowBorder}>
            <td style={tableFirstColumnHeaderStyle}>Cross-sectional studies</td>
            <td style={tableSecondColumnHeaderStyle}><b>Prevalence</b></td>
            <td style={tableCellStyle}>1.82</td>
            <td style={tableCellStyle}>(0.87, 59.30)</td>
            <td style={tableCellStyle}>0.041</td>
          </tr>
          <tr style={tableRowBorder}>
            <td style={tableFirstColumnHeaderStyle}>Case control or Cross-sectional: Risk ratio</td>
            <td style={tableSecondColumnHeaderStyle}><b>Odds ratio</b></td>
            <td style={tableCellStyle}>3.27</td>
            <td style={tableCellStyle}>(3.00, 4.01)</td>
            <td style={tableCellStyle}>0.0054</td>
          </tr>
          <tr style={tableRowBorder}>
            <td style={tableFirstColumnHeaderStyle}>Cohort studies & randomized controlled trials</td>
            <td style={tableSecondColumnHeaderStyle}><b>Risk Ratio</b></td>
            <td style={tableCellStyle}>0.55</td>
            <td style={tableCellStyle}>(0.22, 70.30)</td>
            <td style={tableCellStyle}>0.64</td>
          </tr>
          <tr style={tableRowBorder}>
            <td style={tableFirstColumnHeaderStyle}>Diagnostic test performance</td>
            <td style={tableSecondColumnHeaderStyle}><b>Sensitivity</b></td>
            <td style={tableCellStyle}>0.92</td>
            <td style={tableCellStyle}>(0.87, 0.98)</td>
            <td style={tableCellStyle}>n/a</td>
          </tr>
          <tr style={tableRowBorder}>
            <td style={tableFirstColumnHeaderStyle}>Diagnostic test performance</td>
            <td style={tableSecondColumnHeaderStyle}><b>Specificity</b></td>
            <td style={tableCellStyle}>0.87</td>
            <td style={tableCellStyle}>(0.70, 0.96)</td>
            <td style={tableCellStyle}>n/a</td>
          </tr>
          <tr style={tableRowBorder}>
            <td style={tableFirstColumnHeaderStyle}>Diagnostic test performance</td>
            <td style={tableSecondColumnHeaderStyle}><b>Positive Predictive Value</b></td>
            <td style={tableCellStyle}>0.89</td>
            <td style={tableCellStyle}>(0.75, 0.94)</td>
            <td style={tableCellStyle}>n/a</td>
          </tr>
          <tr style={{ borderRight: tableThickBorder, borderBottom: tableThickBorder, borderLeft: tableThickBorder }}>
            <td style={tableFirstColumnHeaderStyle}>Diagnostic test performance</td>
            <td style={tableSecondColumnHeaderStyle}><b>Negative Predictive Value</b></td>
            <td style={tableCellStyle}>0.91</td>
            <td style={tableCellStyle}>(0.85, 0.96)</td>
            <td style={tableCellStyle}>n/a</td>
          </tr>
        </table>
      </>
    )
  };

  const CollapsibleStatsContent = () => {

    const tableCellStyleNormal = {
      border: '1px solid black',
      borderSpacing: '0px',
      width: '7em',
    };

    const tableCellStyleMoreWidth = {
      border: '1px solid black',
      borderSpacing: '0px',
      width: '8em',
    };

    const tableCellStyleBold = {
      border: '1px solid black',
      borderSpacing: '0px',
      width: '7em',
    };

    return (
      <div>
        The appropriate measure of association or diagnostic test performance depends on the study design.
        The shorthand "A, B, C, D" is used to refer to specific quadrants in the 2x2 contingency table:
        <table style={{ borderCollapse: 'collapse', marginTop: '1em', textAlign: 'center' }}>
            <tr>
              <td style={{ width: '10em' }}>&nbsp;</td>
              <td colSpan={4}><b>Columns (X-axis):<br />
                </b> outcome/disease status;<br />
                gold standard/reference test result
              </td>
            </tr>
            <tr>
              <td rowSpan={4}><b>Rows (Y-axis):</b><br />
                exposure/risk factor; <br />
                diagnostic test result
              </td>
              <td style={tableCellStyleBold}>&nbsp;</td>
              <td style={tableCellStyleBold}><b>+</b></td>
              <td style={tableCellStyleBold}><b>-</b></td>
              <td style={tableCellStyleMoreWidth}><i>Row Totals</i></td>
            </tr>
            <tr>
              <td style={tableCellStyleBold}><b>+</b></td>
              <td style={tableCellStyleBold}><b>A</b></td>
              <td style={tableCellStyleBold}><b>B</b></td>
              <td style={tableCellStyleMoreWidth}><i>A + B</i></td>
            </tr>
            <tr>
              <td style={tableCellStyleBold}><b>-</b></td>
              <td style={tableCellStyleBold}><b>C</b></td>
              <td style={tableCellStyleBold}><b>D</b></td>
              <td style={tableCellStyleMoreWidth}><i>C + D</i></td>
            </tr>
            <tr>
              <td style={tableCellStyleNormal}><i>Column Totals</i></td>
              <td style={tableCellStyleNormal}><i>A + C</i></td>
              <td style={tableCellStyleNormal}><i>B + D</i></td>
              <td style={tableCellStyleMoreWidth}><i>n = A + B + C + D</i></td>
            </tr>
          </table>
          <br />

        <b>All studies:</b>
        <ul>
          <li><b><i>Chi-squared Statistic (&chi;<sup>2</sup>)</i></b>: &Sigma; (O<sub>i</sub> - EO<sub>i</sub>)<sup>2</sup> / EO<sub>i</sub>
            <ul>
              <li>Tests whether there is an association between the two 2x2 table variables.</li>
              <li>If sample sizes are small, use Fisher’s Exact Test.</li>
              <li>For more information, see: <a href="https://www.bmj.com/about-bmj/resources-readers/publications/statistics-square-one/8-chi-squared-tests" target="_blank">https://www.bmj.com/about-bmj/resources-readers/publications/statistics-square-one/8-chi-squared-tests</a></li>
            </ul>
          </li>
          <br />
          <li>
            <b><i>Fisher’s Exact Test</i></b>: [ (A + B)! (C + D)! (A + C)! (B + D)! ] / ( A! B! C! D! n! )
            <ul>
              <li>Tests whether there is an association between the two 2x2 table variables.</li>
            </ul>
          </li>
        </ul>

        <br />
        <b>Studies that use prevalence data:</b>
        <br /><br />
        <u>Cross-sectional Studies:</u>
        <ul>
          <li><b><i>Prevalence</i></b>: (A + C) / (A + B + C + D)</li>
          <ul>
            <li>The proportion of the population who have the disease specified in the columns (X-axis) at the examined point in time was [<i>Prevalence</i>].</li>
          </ul>
          <li><b><i>Odds Ratio</i></b>: (A / B) / (C / D)</li>
          <ul>
            <li>The odds of having the disease specified in the columns (X-axis) was [<i>Odds Ratio</i>] times as high in those exposed to the potential risk factor indicated in the rows (Y-axis), as compared to those unexposed.</li>
          </ul>
        </ul>
        {/* <br /> */}
        <u>Case-Control Studies:</u>
        <ul>
          <li><b><i>Odds Ratio</i></b>: (A / B) / (C / D)</li>
          <ul>
            <li>The odds of having the disease specified in the columns (X-axis) was [<i>Odds Ratio</i>] times as high in those exposed to the potential risk factor indicated in the rows (Y-axis) in the time period of interest, as compared to those unexposed.</li>
          </ul>
        </ul>

        <br />
        <b>Studies that use incidence data:</b>
        <br /><br />
        <u>Cohort Studies and Randomized Controlled Trials:</u>
        <ul>
          <li><b><i>Risk Ratio</i></b> (for studies using a population at risk approach): [A / (A + B)] / [C / (C + D)]</li>
          <ul>
            <li>The risk of having the disease specified in the columns (X-axis) over the follow-up period was [<i>Risk Ratio</i>] times as high in those exposed to the potential risk factor indicated in the rows (Y-axis), as compared to those unexposed.</li>
          </ul>
        </ul>

        <br />
        <b>Studies that investigate diagnostic test performance:</b>
        <ul>
          <li><b><i>Sensitivity</i></b>: A / (A + C)</li>
          <ul>
            <li>The probability of being positive by the diagnostic test indicated in the rows (Y-axis) when the disease specified in the columns (X-axis) is present is [<i>Sensitivity</i>].</li>
          </ul>

          <li><b><i>Specificity</i></b>: D / (B + D)</li>
          <ul>
            <li>The probability of being negative by the diagnostic test indicated in the rows (Y-axis) when the disease specified in the columns (X-axis) is absent is [<i>Specificity</i>].</li>
          </ul>

          <li><b><i>Positive Predictive Value</i></b>: A / (A + B)</li>
          <ul>
            <li>The probability that a person testing positive by the diagnostic test indicated in the rows (Y-axis) actually has the disease specified in the columns (X-axis) is [<i>Positive Predictive Value</i>].</li>
          </ul>

          <li><b><i>Negative Predictive Value</i></b>: D / (C + D)</li>
          <ul>
            <li>The probability that a person testing negative by the diagnostic test indicated in the rows (Y-axis) does NOT actually have the disease specified in the columns (X-axis) is [<i>Negative Predictive Value</i>].</li>
          </ul>
        </ul>
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
              message: 'Learn how to set up a 2x2 table in order for statistics to be calculated correctly.',
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
            message: 'Learn about appropriate statistics for each study design.',
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