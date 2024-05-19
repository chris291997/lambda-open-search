import { DynamoNotesModel, LOOKUP_KEY } from '../models/DynamoNotesModel';
import { DynamoRepository, DynamoPaginationInfo } from './DynamoRepository';

export class DynamoNotesRepository extends DynamoRepository<DynamoNotesModel> {
    async getPaginateList(
        page_info: DynamoPaginationInfo,
    ): Promise<{ limit: number; key: string; forward: boolean; data: DynamoNotesModel[] }> {
        const item = await this.paginateQuery(page_info, 'lookup_key = :lookup_key', {
            ':lookup_key': LOOKUP_KEY,
        });

        const data =
            item.data?.map((item) => {
                return Object.assign(new DynamoNotesModel(), item);
            }) || [];

        return {
            limit: page_info.limit,
            key: item.key,
            forward: item.forward,
            data,
        };
    }

    async getUserInfo(user_id: string): Promise<{ data: DynamoNotesModel[] }> {
        const item = await this.singleQuery('lookup_key = :lookup_key and reference_key = :reference_key', {
            ':lookup_key': LOOKUP_KEY,
            ':reference_key': user_id,
        });

        const data =
            item.data?.map((item) => {
                return Object.assign(new DynamoNotesModel(), item);
            }) || [];

        return {
            data,
        };
    }
}
