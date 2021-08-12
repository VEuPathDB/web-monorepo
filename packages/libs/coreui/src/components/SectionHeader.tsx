type SectionHeaderProps = {
  /** The size of the primary text. */
  headerSize: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  /** The primary text of the header. */
  text: string;
  /** Secondary header text */
  secondaryText?: string;
  /** Whether to render a divider under the header */
  divider?: boolean;
  /** Additional CSS styles to apply to the header */
  additionalHeaderStyles?: React.CSSProperties;
};

/**
 * A component used to separate different sections of a page.
 */
export default function SectionHeader({
  headerSize,
  text,
  secondaryText,
  divider = false,
  additionalHeaderStyles = {},
}: SectionHeaderProps) {
  const Header = headerSize;

  return (
    <>
      <div
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <Header
          css={{
            marginBottom: headerSize === 'h2' ? 2 : 0,
            ...additionalHeaderStyles,
          }}
        >
          {text}
        </Header>
        <h6
          css={{
            margin: 0,
            marginBottom: headerSize === 'h2' ? 5 : 3,
            opacity: 0.75,
          }}
        >
          {secondaryText}
        </h6>
      </div>
      {divider && <div css={{ height: 2, backgroundColor: '#CDCDCD' }} />}
    </>
  );
}
