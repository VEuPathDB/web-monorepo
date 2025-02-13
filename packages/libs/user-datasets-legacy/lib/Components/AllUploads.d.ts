/// <reference types="react" />
import { UserDatasetUpload } from '../Utils/types';
interface Props {
  baseUrl: string;
  uploadList?: Array<UserDatasetUpload>;
  errorMessage?: string;
  actions: {
    clearMessages: (ids: string[]) => void;
    cancelCurrentUpload: (id: string) => void;
  };
}
declare const AllUploads: (props: Props) => JSX.Element;
export default AllUploads;
//# sourceMappingURL=AllUploads.d.ts.map
