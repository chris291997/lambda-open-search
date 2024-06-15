
import { GroupedChasesExcerpt } from '../dto/grouped-chases-excerpt';

export class GroupedChasesMapper {
    static map(data: any): GroupedChasesExcerpt | undefined {
        if (!data) {
            return undefined;
        }

        return {
            tin: data.tin,
            doctorId: data.doctorId,
            facility: data.facility,
            providerId: data.providerId,
            providerName: data.providerName,
            projectId: data.projectId,
            projectName: data.projectName,
            orgUnitName: data.orgUnitName,
            doc_count: data.doc_count,
           
        } as GroupedChasesExcerpt;
    }

    static mapArray(data: any[]): GroupedChasesExcerpt[] {
        return data.map((s) => this.map(s)).filter((s): s is GroupedChasesExcerpt => s !== undefined);
    }
}
