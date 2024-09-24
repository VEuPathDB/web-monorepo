import ExternalContentController from '@veupathdb/web-common/lib/controllers/ExternalContentController';

interface Props {
  helpPageUrl: string;
}

export function BlastWorkspaceHelp(props: Props) {
  const { helpPageUrl } = props;

  return <ExternalContentController url={helpPageUrl} />;
}
