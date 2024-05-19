import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { DynamoModel } from './DynamoModel';
export const LOOKUP_KEY = 'NOTES';
export const REFERENCE_KEY = 'NOTES:<NOTES_ID>';

export class DynamoNotesModel extends DynamoModel {
    @attribute()
    name: string;

    @attribute()
    title: string;

    @attribute()
    content: string;

    @attribute()
    status: string;

    get note_id(): string {
        return this.id;
    }

    set note_id(uuid: string) {
        this.id = uuid;
        this.lookup_key = LOOKUP_KEY;
        this.reference_key = REFERENCE_KEY.replace('<NOTES_ID>', this.note_id);
    }
}
