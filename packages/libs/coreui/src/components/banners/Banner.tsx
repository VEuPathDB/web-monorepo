import { css } from '@emotion/react';
import { ReactNode, useState, useEffect, CSSProperties, useMemo } from 'react';

import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import InfoIcon from '@material-ui/icons/Info';
import NotificationsIcon from '@material-ui/icons/Notifications';
import CloseIcon from '@material-ui/icons/Close';
// Collapsible icons
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
// using native CoreUI icons? but no mouseover event is supported
// import { CaretUp, CaretDown} from '../../assets/icons';

import { gray, warning, error, success, blue, ColorHue } from '../../definitions/colors';

export type BannerProps = {
  type: 'warning' | 'danger' | 'error' | 'success' | 'info' | 'normal';
  message: ReactNode;
  pinned?: boolean;
  intense?: boolean;
  // additionalMessage is shown next to message when clicking showMoreLinkText.
  // disappears when clicking showLess link
  // note that this additionalMessage prop is used to determine show more/less behavior or not
  // if undefined, then just show normal banner with message
  additionalMessage?: ReactNode;
  // text for showMore link
  showMoreLinkText?: ReactNode;
  // text for showless link
  showLessLinkText?: ReactNode;
  // color for show more links
  showMoreLinkColor?: string;
  // is showMoreLink bold?
  isShowMoreLinkBold?: boolean;
  // banner margin, padding, text font size
  spacing?: {
    margin?: CSSProperties['margin'],
    padding?: CSSProperties['padding'],
  };
  fontSize?: CSSProperties['fontSize'];
  // implementing Banner timeout
  showBanner?: boolean;
  setShowBanner?: (newValue: boolean) => void;
  autoHideDuration?: number;
  // fadeout effect when timeout
  fadeoutEffect?: boolean;
  setFadeoutEffect?: (newValue: boolean) => void;
}

export type BannerComponentProps = {
  banner: BannerProps;
  onClose?: () => void;
  // CollapsibleContent is a functional component: refer to Collapsible story
  CollapsibleContent?: React.FC;
}

function getIconComponentFromType(type: BannerProps['type']) {
  switch (type) {
    case 'warning':
      return WarningIcon;
    case 'danger':
    case 'error':
      return ErrorIcon;
    case 'success':
      return CheckCircleIcon;
    case 'info':
      return InfoIcon;
    case 'normal':
    default:
      return NotificationsIcon;
  }
}

function getColorTheme(type: BannerProps['type'], weight: keyof ColorHue) {
  switch (type) {
    case 'warning':
      return warning[weight];
    case 'danger':
      return error[weight];
    case 'error':
      return error[weight];
    case 'success':
      return success[weight];
    case 'info':
      return blue[weight];
    case 'normal':
      return gray[weight];
    default:
      return gray[weight];
  }
}

export default function Banner(props: BannerComponentProps) {

  // add CollapsibleContent
  const { banner, onClose, CollapsibleContent } = props;

  // set default values of showMoreLinkText and showLessLinkText
  const { type, message, pinned, intense, showMoreLinkText = 'Show more >>', showLessLinkText = 'Show less <<', showMoreLinkColor, isShowMoreLinkBold = false, additionalMessage, spacing, fontSize, showBanner = true, setShowBanner, autoHideDuration, fadeoutEffect, setFadeoutEffect } = banner;

  const [isShowMore, setIsShowMore] = useState(false);

  const IconComponent = getIconComponentFromType(type);

  // define showMore link texts
  const showMoreLink = isShowMore ? showLessLinkText : showMoreLinkText;

  // define collapsible icon component
  const collapsibleIcon = isShowMore ? <ExpandLessIcon /> : <ExpandMoreIcon />;
  // using native CoreUI icons? but no mouseover event is supported
  // const collapsibleIcon = isShowMore ? <CaretUp color={ '#000000' } /> : <CaretDown color={ '#000000' } />;

  // hover effect
  const [isHover, setIsHover] = useState(false);
  const onMouseEnter = () => { setIsHover(true); };
  const onMouseLeave = () => { setIsHover(false); };

  // Banner timeout with fadeout
  useEffect(() => {
    const autoFadeoutDuration = autoHideDuration ? autoHideDuration - 1000 : undefined;
    const fadeoutTimeout = setTimeout(() => {
      if (autoHideDuration && setFadeoutEffect) setFadeoutEffect(true);
    }, autoFadeoutDuration);

    const timeout = setTimeout(() => {
      if (autoHideDuration && setShowBanner) setShowBanner(false);
    }, autoHideDuration);
    return () => {
      clearTimeout(timeout);
      clearTimeout(fadeoutTimeout);
    };
  }, [showBanner, autoHideDuration, fadeoutEffect]);

  const iconBtnCss = useMemo(() => {
    return (
      `text-align: right;
      background: transparent;
      border: none;
      cursor: pointer;
      &:hover {
        color: ${intense ? 'black' : getColorTheme(type, 600)};
      }`
    )
  }, [type, intense])

  // conditional border color and radius with the presence of CollapsibleContent
  return (
    <>
      {showBanner && (
        <div
          css={css`
            display: flex;
            color: ${intense ? 'white' : 'black'};
            background-color: ${intense ? getColorTheme(type, 600) : getColorTheme(type, 100)};
            border: ${intense
              ? 'none'
              : CollapsibleContent != null
                ? `1px solid #dedede`
                : `1px solid ${getColorTheme(type, 600)}`
            };
            box-sizing: border-box;
            border-radius: ${CollapsibleContent != null
              ? '0'
              : '7px'
            };
            margin: ${spacing?.margin != null ? spacing.margin : '10px 0'};
            width: 100%;
            padding: ${spacing?.padding != null ? spacing.padding : '10px'};
            align-items: center;
            font-family: 'Roboto', 'Helvetica Neue', Helvetica, 'Segoe UI', Arial, freesans, sans-serif;
            font-size: ${fontSize != null ? fontSize : '13px'};
            // for fadeout effect
            opacity: ${fadeoutEffect ? 0 : 1};
            transition: ${fadeoutEffect ? 'opacity 1s ease' : undefined};
          `}
        >
        <div
          css={css`
            display: flex;
            flex-direction: column;
            width: 100%;
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <IconComponent
              css={css`
                color: ${intense
                    ? 'white'
                    : CollapsibleContent != null
                      ? '#00008B'
                      : 'black'
                };
                font-size: 1.4em;
                line-height: 1.4em;
                width: 30px;
                text-align: center;
                margin-right: 5px;
              `}>
            </IconComponent>
            <span css={css`
              margin-right: auto;
            `}>
              {/* showMore implementation */}
              {message}&nbsp;
              {(additionalMessage != null || CollapsibleContent != null) && (
                <>
                  {isShowMore && additionalMessage}
                  <button
                    css={css`
                      background-color: transparent;
                      border: none;
                      text-align: center;
                      text-decoration: ${isHover ? 'underline' : 'none' };
                      color: ${showMoreLinkColor};
                      display: inline-block;
                      cursor: pointer;
                    `}
                    onClick={() => {
                      setIsShowMore != null ? setIsShowMore(!isShowMore) : null;
                    }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  >
                    {/* set bold here: somehow font-weight does not work */}
                    {isShowMoreLinkBold ? <b>{showMoreLink}</b> : <>{showMoreLink}</>}
                  </button>
                </>
              )}

            </span>
            {pinned || !onClose ? null : (
              <button
                css={css`
                  ${iconBtnCss}
                `}
                onClick={onClose}
              >
                <CloseIcon css={css`vertical-align: middle`} />
              </button>
            )}
            {/* show CollapsibleContent icon */}
            {CollapsibleContent != null && (
              <button
                css={css`
                ${iconBtnCss}
              `}
                onClick={() => {
                  setIsShowMore != null ? setIsShowMore(!isShowMore) : null;
                }}
              >
                {collapsibleIcon}
              </button>
            )}
          </div>
          {/* show/hide CollapsibleContent */}
          {isShowMore && CollapsibleContent != null && (
            <div style={{ marginTop: '1em', marginLeft: '2.3em' }}>
              <CollapsibleContent />
            </div>
          )}
        </div>
      </div>
      )}
    </>
  );
}
