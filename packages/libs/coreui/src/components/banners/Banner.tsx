import { css } from '@emotion/react';
import { ReactNode, useState, useEffect, CSSProperties } from 'react';

import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import InfoIcon from '@material-ui/icons/Info';
import NotificationsIcon from '@material-ui/icons/Notifications';
import CloseIcon from '@material-ui/icons/Close';

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
  const { banner, onClose } = props;
  // set default values of showMoreLinkText and showLessLinkText
  const { type, message, pinned, intense, showMoreLinkText = 'Show more >>', showLessLinkText = 'Show less <<', showMoreLinkColor, additionalMessage, spacing, fontSize, showBanner = true, setShowBanner, autoHideDuration, fadeoutEffect, setFadeoutEffect } = banner;

  const [isShowMore, setIsShowMore] = useState(false);

  const IconComponent = getIconComponentFromType(type);

  // define showMore link texts
  const showMoreLink = isShowMore ? showLessLinkText : showMoreLinkText;

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

  return (
    <>
      {showBanner && (
        <div
          css={css`
            display: flex;
            color: ${intense ? 'white' : 'black'};
            background-color: ${intense ? getColorTheme(type, 600) : getColorTheme(type, 100)};
            border: ${intense ? 'none' : `1px solid ${getColorTheme(type, 600)}`};
            box-sizing: border-box;
            border-radius: 7px;
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
          <IconComponent
            css={css`
              color: ${intense ? 'white' : 'black'};
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
            {additionalMessage != null && (
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
                  {showMoreLink}
                </button>
              </>
            )}

          </span>
          {pinned || !onClose ? null : (
            <a
              css={css`
                text-align: right;
                padding-right: 10px;
                &:hover {
                  color: ${intense ? 'black' : getColorTheme(type, 600)};
                }
              `}
              onClick={onClose}
            >
              <CloseIcon css={css`vertical-align: middle`} />
            </a>
          )}
        </div>
      )}
    </>
  );
}
