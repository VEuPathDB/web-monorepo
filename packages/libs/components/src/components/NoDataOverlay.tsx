interface NoDataOverlayProps {
  plotTitle?: string;
  opacity?: number;
}

export default ({ plotTitle, opacity = 0.97 }: NoDataOverlayProps) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background:
        plotTitle === 'No data'
          ? 'repeating-linear-gradient(45deg, #f8f8f8, #f8f8f8 10px, #fafafa 10px, #fafafa 20px)'
          : '#f8f8f8',
      opacity: opacity,
      fontSize: 24,
      color: '#C1C1C1',
      userSelect: 'none',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 450,
    }}
  >
    {plotTitle === 'No data' ? 'No missing data' : 'No data'}
  </div>
);
