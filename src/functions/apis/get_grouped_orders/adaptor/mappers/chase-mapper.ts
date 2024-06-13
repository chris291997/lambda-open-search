import { ChaseExcerptV2 } from '../dto/ChaseExcerptV2';

export class ChasesMapper {
    static map(data: any): ChaseExcerptV2 | undefined {
        if (!data) {
            return undefined;
        }

        const fullAddress = `${data.providerProfile.address.addressLine1}${
            data.providerProfile.address.addressLine2 ? `, ${data.providerProfile.address.addressLine2}` : ''
        }, ${data.providerProfile.address.city}, ${data.providerProfile.address.state}, ${
            data.providerProfile.address.zip
        }`;

        return {
            tenantId: data.tenantId,
            orgUnitId: data.orgUnitId,
            orgUnitName: data.orgUnitName,
            projectId: data.projectId,
            projectName: data.projectName,
            bulkOrderId: data.bulkOrderId,
            workOrderId: data.workOrderId,
            id: data.id ?? '',
            type: data.type,
            chartId: data.chartId,
            caseId: data.caseId,
            claimId: data.claimId,
            sampleId: data.sampleId,
            phase: data.phase,
            clientRank: data.clientRank,
            population: data.population,
            measure: data.measure,
            rush: data.rush,
            instructions: data.instructions,
            specialHandling: data.specialHandling,
            serviceDateStart: data.serviceDateStart,
            serviceDateEnd: data.serviceDateEnd,
            requestor: data.requestor,
            patientFirstName: data.patient.firstName,
            patientLastName: data.patient.lastName,
            patientId: data.patient.memberId,
            patientDob: data.patient.dob,
            patientSsn: data.patient.ssn,
            patientZip: data.patient.address.zip,
            patientPhone:
                data.patient.contactDetails.find((contact: { type: string; value: string }) => contact.type === 'phone')
                    ?.value ?? '',
            patientGender: data.patient.gender,
            patientMrn: data.patient.mrn,
            providerProfileId: data.providerProfile.id ?? '',
            providerProfileName: data.providerProfile.name,
            providerProfileAddress: fullAddress,
            facility: data.providerProfile?.fullName ?? '',
            facilityTin: data.providerProfile?.tin ?? '',
            originalFacility: data.providerProfile.name,
            practitionerFullName: data.practitioner?.fullname ?? '',
            practitionerTin: data.practitioner?.tin ?? '',
            practitionerNpi: data.practitioner?.npi ?? '',
            originalPractitionerFullName: data.originalPractitioner?.fullName ?? '',
            stage: data.stage ?? '',
            status: data.status ?? '',
            statusReason: data.statusReason ?? '',
            activity: data.activity ?? '',
            nextContactDate: data.nextContactDate,
            commitmentDate: data.commitmentDate ?? '',
            openedBy: data.openedBy ?? '',
            createDateTime: data.createDateTime,
            closeDateTime: data.closeDateTime ?? '',
            lastUpdateDateTime: data.lastUpdateDateTime,
            identifiers: data.identifiers || [],
        } as ChaseExcerptV2;
    }

    static mapArray(data: any[]): ChaseExcerptV2[] {
        return data.map((s) => this.map(s)).filter((s): s is ChaseExcerptV2 => s !== undefined);
    }
}
