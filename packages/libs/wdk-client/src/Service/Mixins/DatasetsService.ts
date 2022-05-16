import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import * as Decode from 'wdk-client/Utils/Json';

export type DatasetConfig = {
    sourceType: 'idList',
    sourceContent: { ids: string[] }
} | {
    sourceType: 'basket',
    sourceContent: { basketName: string }
} | {
    sourceType: 'file',
    sourceContent: {
        temporaryFileId: string,
        parser: string,
        searchName: string,
        parameterName: string
    }
} | {
    sourceType: 'strategy',
    sourceContent: { strategyId: number }
} | {
    sourceType: 'url',
    sourceContent: {
        url: string;
        parser: string,
        searchName: string,
        parameterName: string
    }
}

export default (base: ServiceBase) => {

    function createDataset(config: DatasetConfig): Promise<Number> {
        return base.sendRequest(Decode.field('id', Decode.number), {
            path: '/users/current/datasets',
            method: 'POST',
            body: JSON.stringify(config)
        }).then(response => response.id)
    }

    function getDataset(id: number): Promise<(string | null)[][]> {
        return base.sendRequest(
            Decode.arrayOf(Decode.arrayOf(
                Decode.oneOf(Decode.string, Decode.nullValue)
            )), {
            path: `/users/current/datasets/${id}`,
            method: 'GET'
        });
    }

    return { createDataset, getDataset };
}