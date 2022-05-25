import { Link } from 'react-router-dom';
import { ComputationAppOverview } from '../../types/visualization';
import { ComputationPlugin } from './Types';
import { orderBy } from 'lodash';
import { H5, H6 } from '@veupathdb/coreui';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import '../visualizations/Visualizations.scss';
import { Tooltip } from '@material-ui/core';

interface Props {
  baseUrl: string;
  apps: ComputationAppOverview[];
  plugins: Record<string, ComputationPlugin>;
}

export function StartPage(props: Props) {
  const { apps, baseUrl, plugins } = props;
  const cx = makeClassNameHelper('VisualizationsContainer');
  // Used temporarily to render a disabled scatterplot for betadiv
  const helperPlugin = plugins['alphadiv'];

  return (
    apps &&
    plugins && (
      <div>
        <H5
          text={'Select a visualization'}
          additionalStyles={{ marginTop: 15, marginBottom: 5 }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* orderBy renders available apps ahead of those in development */}
          {orderBy(apps, [(app) => (plugins[app.name] ? 1 : 0)], ['desc']).map(
            (app) => (
              <div
                style={{
                  display: 'flex',
                  padding: '1em',
                  margin: '1em 0',
                }}
              >
                <div style={{ width: '25em', margin: '0 8em' }}>
                  <H6
                    text={app.displayName}
                    additionalStyles={{ margin: 0, marginBottom: 5 }}
                  />
                  <span
                    style={{
                      fontWeight: '300',
                      marginTop: '0.5em',
                    }}
                  >
                    {app.description}
                  </span>
                </div>
                {/* <Link
                to={`${baseUrl}/new/${app.name}`}
                style={{
                  pointerEvents: plugins[app.name] ? 'auto' : 'none',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                  {app.displayName}
                  {plugins[app.name] ? '' : <i> (Coming soon!)</i>}
                </div>
                <div>{app.description}</div>
              </Link> */}
                {app.visualizations?.map((vizType, index) => {
                  const disabled = plugins[app.name] === undefined;
                  const VizSelector = plugins[app.name]
                    ? plugins[app.name].visualizationTypes[vizType.name]
                        .selectorComponent
                    : helperPlugin.visualizationTypes['scatterplot']
                        .selectorComponent;
                  return (
                    <div
                      className={cx('-PickerEntry', disabled && 'disabled')}
                      key={`vizType${index}`}
                      style={{
                        margin: '0 3em',
                      }}
                    >
                      <Tooltip title={<>{vizType.description}</>}>
                        <button disabled={disabled}>
                          <VizSelector {...app} />
                        </button>
                      </Tooltip>
                      <div className={cx('-PickerEntryName')}>
                        <div>
                          {vizType.displayName
                            ?.split(/(, )/g)
                            .map((str) => (str === ', ' ? <br /> : str))}
                        </div>
                        {disabled && <i>(Coming soon!)</i>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    )
  );
}
