import { ServiceBase } from '../../Service/ServiceBase';
import { ok } from '../../Utils/Json';

export default (base: ServiceBase) => {
  async function getXmlAnswerJson(xmlQuestionName: string) {
    return base.sendRequest(ok, {
      method: 'GET',
      path: `/xml-answer/${xmlQuestionName}`,
      useCache: true,
    });
  }

  return {
    getXmlAnswerJson,
  };
};
