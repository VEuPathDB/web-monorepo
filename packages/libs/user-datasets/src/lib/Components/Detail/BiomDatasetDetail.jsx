import UserDatasetDetail from './UserDatasetDetail';

class BiomDatasetDetail extends UserDatasetDetail {
  getPageSections() {
    const [headerSection, , fileSection] = super.getPageSections();
    return [headerSection, fileSection];
  }
}

export default BiomDatasetDetail;
