import { CSSProperties } from 'react';

import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import InfoIcon from '@material-ui/icons/Info';
import NotificationsIcon from '@material-ui/icons/Notifications';
import CloseIcon from '@material-ui/icons/Close';

import { gray, green, mutedOrange, red, blue } from '../../definitions/colors'

type BannerProps = {
  type: string;
  message: string;
  pinned: boolean;
  intense: boolean;
}

type BannerComponentProps = {
  banner: BannerProps;
  onClose: () => void;
}

export default function BannerTest(props: BannerComponentProps) {
  const { banner, onClose } = props;
  const { type, message, pinned, intense } = banner;

  function getIconFromType(type: string) {
    switch (type) {
      case 'warning':
        return <WarningIcon style={iconStyle}></WarningIcon>;
      case 'danger':
      case 'error':
        return <ErrorIcon style={iconStyle}></ErrorIcon>;
      case 'success':
        return <CheckCircleIcon style={iconStyle}></CheckCircleIcon>;
      case 'info':
        return <InfoIcon style={iconStyle}></InfoIcon>;
      case 'normal':
      default:
        return <NotificationsIcon style={iconStyle}></NotificationsIcon>;
    }
  }

  function getColorTheme(type: string, weight: number) {
    switch (type) {
      case 'warning':
        return mutedOrange[weight];
      case 'danger':
        return red[weight];
      case 'error':
        return gray[weight];
      case 'success':
        return green[weight];
      case 'info':
        return blue[weight];
      case 'normal':
        return gray[weight];
      default:
        return gray[weight];
    }
  }

  function isStandardType(type: string) {
    const types = [
      'warning',
      'danger',
      'success',
      'info',
      'normal',
    ];
    return types.indexOf(type) >= 0;
  }

  const bannerStyle: CSSProperties = {
    display: "flex",
    color: intense ? 'white' : 'black',
    backgroundColor: intense ? getColorTheme(type, 800) : getColorTheme(type, 100),
    border: intense ? 'none' : `1px solid ${getColorTheme(type, 400)}`,
    boxSizing: "border-box",
    borderRadius: "7px",
    margin: "10px 0",
    width: "100%",
    padding: "10px",
    alignItems: "center"
  }

  const iconStyle: CSSProperties = {
    color: intense ? 'white' : 'black',
    fontSize: "1.6em",
    lineHeight: "1.6em",
    width: "30px",
    textAlign: "center",
    marginRight: "5px"
  }

  const collapseLinkStyle: CSSProperties = {
    flex: '1',
    textAlign: 'right',
    paddingRight: '10px'
  }

  return (
    <div
      style={bannerStyle}
    >
      {getIconFromType(banner.type)}
      <span>{message}</span>
      {pinned || !onClose ? null : (
        <a
          style={collapseLinkStyle}
          onClick={onClose}
        >
          <CloseIcon />
        </a>
      )}
    </div>
  );
}
