import { useTheme } from '@emotion/react';
import H1 from '../../components/headers/H1';
import H2 from '../../components/headers/H2';
import styleDefinitions from '../../styleDefinitions';

export default function ThemingDemo() {
  const theme: any = useTheme();

  return (
    <div
      css={{
        padding: theme.containerPadding,
        margin: 20,
        backgroundColor: 'rgba(100,70,100, .10)',
        borderRadius: theme.borderRadius,
        width: '50%',
      }}
    >
      <H1
        color={theme.primaryColor}
        additionalStyles={{ margin: 0 }}
        text={'Hello There'}
      />

      <p css={[styleDefinitions.typography.p, { color: theme.secondaryColor }]}>
        Emotion has built-in theming support. It will be easy to start using
        themes in our apps. You can adjust the theme colors using the Storybook
        controls below.
      </p>
      <p
        css={[
          styleDefinitions.typography.p,
          { color: theme.secondaryColor, marginBottom: 30 },
        ]}
      >
        This is a very simplistic example where I have only added a handful of
        items to the theme, but you can essentially have whatever level of
        complexity you'd like.
      </p>

      <button
        css={{
          marginRight: 10,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 10,
          paddingRight: 10,
          borderRadius: 5,
          color: 'white',
          border: 'none',
          backgroundColor: theme.primaryColor,
        }}
      >
        Primary Button
      </button>
      <button
        css={{
          marginRight: 10,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 10,
          paddingRight: 10,
          borderRadius: 5,
          color: 'white',
          border: 'none',
          backgroundColor: theme.secondaryColor,
        }}
      >
        Secondary Button
      </button>
    </div>
  );
}
