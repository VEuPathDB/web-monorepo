import colors from '../../definitions/colors';
import typographyStyles from '../../styleDefinitions/typography';
import H1 from '../../components/headers/H1';
import H2 from '../../components/headers/H2';
import H3 from '../../components/headers/H3';

export default function TypographyDemo() {
  return (
    <div
      css={{
        display: 'flex',
        padding: 25,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      <div css={{ flex: 1, marginRight: 50, marginBottom: 50, flexBasis: 500 }}>
        <div
          css={{
            backgroundColor: 'black',
            color: 'white',
            padding: 10,
            paddingRight: 50,
            marginBottom: 10,
          }}
        >
          <p css={[typographyStyles.h5, { margin: 0 }]}>
            Option 1: Quickly Utilize Pre-Defined Styles
          </p>
          <p css={[typographyStyles.p, { color: 'white', marginTop: 0 }]}>
            No need to reference design guides, complex CSS files, or write
            custom CSS rules.
          </p>
          <pre
            css={[
              typographyStyles.pre,
              { color: 'white', whiteSpace: 'pre-line' },
            ]}
          >
            {`import typographyStyles from '../../styles/typography'
            ...
            <h1 css={typographyStyles.h1}>Header 1</h1>
          <h2 css={typographyStyles.h2}>Header 2</h2>
          <h3 css={typographyStyles.h3}>Header 3</h3>
          <h4 css={typographyStyles.h4}>Header 4</h4>
          <h5 css={typographyStyles.h5}>Header 5</h5>`}
          </pre>
        </div>
        <h1 css={typographyStyles.h1}>Header 1</h1>
        <h2 css={typographyStyles.h2}>Header 2</h2>
        <h3 css={typographyStyles.h3}>Header 3</h3>
        <h4 css={typographyStyles.h4}>Header 4</h4>
        <h5 css={typographyStyles.h5}>Header 5</h5>
      </div>
      <div css={{ flex: 1, marginRight: 50, marginBottom: 50, flexBasis: 500 }}>
        <div
          css={{
            backgroundColor: 'black',
            color: 'white',
            padding: 10,
            paddingRight: 50,
            marginBottom: 10,
          }}
        >
          <p css={[typographyStyles.h5, { margin: 0 }]}>
            Option 2: Utilize Pre-Defined Styles & Add Custom Rules
          </p>
          <p css={[typographyStyles.p, { color: 'white', marginTop: 0 }]}>
            Quickly compose established styles along with any necessary
            customizations.
          </p>
          <pre
            css={[
              typographyStyles.pre,
              { color: 'white', whiteSpace: 'pre-line' },
            ]}
          >
            {`import typographyStyles from '../../styles/typography'
            ...
            <h1 css={[typographyStyles.h1, { color: LIGHT_COLORS[0] }]}>Header 1</h1>
        <h2 css={[typographyStyles.h2, { color: LIGHT_COLORS[1] }]}>Header 2</h2>
        <h3 css={[typographyStyles.h3, { color: LIGHT_COLORS[2] }]}>Header 3</h3>
        <h4 css={[typographyStyles.h4, { color: LIGHT_COLORS[3] }]}>Header 4</h4>
        <h5 css={[typographyStyles.h5, { color: LIGHT_COLORS[4] }]}>Header 5</h5>`}
          </pre>
        </div>
        <h1 css={[typographyStyles.h1, { color: colors.blue[400] }]}>
          Header 1
        </h1>
        <h2 css={[typographyStyles.h2, { color: colors.cyan[400] }]}>
          Header 2
        </h2>
        <h3 css={[typographyStyles.h3, { color: colors.teal[400] }]}>
          Header 3
        </h3>
        <h4 css={[typographyStyles.h4, { color: colors.yellow[400] }]}>
          Header 4
        </h4>
        <h5 css={[typographyStyles.h5, { color: colors.orange[400] }]}>
          Header 5
        </h5>
      </div>
      <div css={{ flex: 1, marginRight: 50, marginBottom: 50, flexBasis: 500 }}>
        <div
          css={{
            background: `linear-gradient(45deg, ${colors.blue[400]} 33%, ${colors.orange[400]} 100%)`,
            color: 'white',
            padding: 10,
            paddingRight: 50,
            marginBottom: 10,
          }}
        >
          <p css={[typographyStyles.h5, { margin: 0 }]}>
            Option 3: Use "Core" Components
          </p>
          <p css={[typographyStyles.p, { color: 'white', marginTop: 0 }]}>
            Core components will be a separate NPM library that will grow over
            time containing low-level "building blocks" that developers can
            arrange in to complex components without having to even think about
            CSS.
          </p>
          <pre
            css={[
              typographyStyles.pre,
              { color: 'white', whiteSpace: 'pre-line' },
            ]}
          >
            {`import {H1, H2, H3} from '@vuepathdb/core';
            ...
            <H1 underline>Prebuilt H1</H1>
            <H2 color={DARK_BLUE} textTransform="uppercase">Prebuilt H2</H2>
            <H3 color={DARK_RED} textTransform="lowercase">Prebuilt H3</H3>`}
          </pre>
        </div>
        <H1 underline text='Prebuilt H1' />
        <H2
          color={colors.blue[500]}
          textTransform='uppercase'
          text='Prebuilt H2'
        />
        <H3
          color={colors.red[500]}
          textTransform='lowercase'
          text='Prebuilt H3'
        />
      </div>
    </div>
  );
}
