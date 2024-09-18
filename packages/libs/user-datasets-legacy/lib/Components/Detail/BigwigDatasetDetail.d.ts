export default BigwigDatasetDetail;
declare class BigwigDatasetDetail extends UserDatasetDetail {
  renderTracksSection(): JSX.Element | null;
  getTracksTableColumns(): {
    key: string;
    name: string;
    renderCell: ({ row }: { row: any }) => JSX.Element;
  }[];
}
import UserDatasetDetail from './UserDatasetDetail';
//# sourceMappingURL=BigwigDatasetDetail.d.ts.map
