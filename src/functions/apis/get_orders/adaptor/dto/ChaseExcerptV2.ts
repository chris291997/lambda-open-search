/* tslint:disable */
/* eslint-disable */
/**
 * Datafied Chase API
 * API that workflow and Portals use to integrate to Order Repository Chase instances
 *
 * OpenAPI spec version: 1.0.2-A2
 * Contact: L.Jeganathan@leonardo.com.au
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

 /**
 * To be returned as part of a chase search result using /v2/chases API
 *
 * @export
 * @interface ChaseExcerptV2
 */
 export interface ChaseExcerptV2 {

    /**
     * the tenant id
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    tenantId?: string;

    /**
     * the organizational unit identifier
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    orgUnitId?: string;

    /**
     * the organizational unit name
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    orgUnitName?: string;

    /**
     * project id
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example HEDIS-WC
     */
    projectId?: string;

    /**
     * the projects identifier
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example WellCare HEDIS
     */
    projectName?: string;

    /**
     * id of the bulk order
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example 26f2d05e-e49a-4689-97c3-574d0820a5e9
     */
    bulkOrderId?: string;

    /**
     * workorder id
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example 1000000000
     */
    workOrderId?: string;

    /**
     * chase id
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example 1000000000-01
     */
    id?: string;

    /**
     * Indicates the type of chase, APS or Audit. All APS chase require an Authorization
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    type?: string;

    /**
     * client chart Id
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example chart-123
     */
    chartId?: string;

    /**
     * client case id
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example case_1234
     */
    caseId?: string;

    /**
     * client claim id / policy number
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example claim_1234
     */
    claimId?: string;

    /**
     * client sample id
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example s2345
     */
    sampleId?: string;

    /**
     * phase or wave
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example 2023-1
     */
    phase?: string;

    /**
     * client's rank for the order
     *
     * @type {number}
     * @memberof ChaseExcerptV2
     * @example 123
     */
    clientRank?: number;

    /**
     * Population
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example NorCal
     */
    population?: string;

    /**
     * the measure code for the order
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example ACA
     */
    measure?: string;

    /**
     * Indicates whether the chase is marked as rush
     *
     * @type {boolean}
     * @memberof ChaseExcerptV2
     */
    rush?: boolean;

    /**
     * Additional chase instruction
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example additional chase instruction
     */
    instructions?: string;

    /**
     * Indicates the special handling notes
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    specialHandling?: string;

    /**
     * Start range for Service Date (ISO 8601)
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    serviceDateStart?: string;

    /**
     * End range for Service Date (ISO 8601)
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    serviceDateEnd?: string;

    /**
     * requestor of the chase
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    requestor?: string;

    /**
     * first name of the patient
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    patientFirstName?: string;

    /**
     * last name of the patient
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    patientLastName?: string;

    /**
     * patient date of birth
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    patientDob?: string;

    /**
     * patient social security number
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    patientSsn?: string;

    /**
     * patient's zip code
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    patientZip?: string;

    /**
     * patient's phone number
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    patientPhone?: string;

    /**
     * patient gender as per https://hl7.org/fhir/R5/patient.html
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    patientGender?: ChaseExcerptV2PatientGenderEnum;

    /**
     * Patient's Member ID
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    patientMemberId?: string;

    /**
     * Patient's MRN
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    patientMrn?: string;

    /**
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    providerProfileId?: string;

    /**
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    providerProfileName?: string;

    /**
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    providerProfileAddress?: string;

    /**
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    serviceGroupProfileId?: string;

    /**
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    serviceGroupProfileName?: string;

    /**
     * The active facility
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    facility?: string;

    /**
     * tax identifier for facility
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    facilityTin?: string;

    /**
     * The facility at the time of chase creation
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    originalFacility?: string;

    /**
     * Active Practitioner Name
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    practitionerFullName?: string;

    /**
     * Active practitioner TIN
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    practitionerTin?: string;

    /**
     * Active practitioner NPI
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    practitionerNpi?: string;

    /**
     * Original Practitioner Name
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    originalPractitionerFullName?: string;

    /**
     * Stage of the chase
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example Progressed
     */
    stage?: string;

    /**
     * Status of the chase
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example Active
     */
    status?: string;

    /**
     * Status reason code and comments in the format of ReasonCode - Comments
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example 001 - Duplicate Order in case of a Cancelled Chase
     */
    statusReason?: string;

    /**
     * chase activity
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example Review Order or Settle Fees, etc
     */
    activity?: string;

    /**
     * date when this chase needs follow-up (ISO 8601)
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    nextContactDate?: string;

    /**
     * date when provider has commited to provide records (ISO 8601)
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     */
    commitmentDate?: string;

    /**
     * user who created the chase
     *
     * @type {string}
     * @memberof ChaseExcerptV2
     * @example Active
     */
    openedBy?: string;

    /**
     * sum of pages of documents, populated when order is completed with records
     *
     * @type {number}
     * @memberof ChaseExcerptV2
     */
    pageCount?: number;

    /**
     * date and time chase first recorded (ISO 8601)
     *
     * @type {Date}
     * @memberof ChaseExcerptV2
     * @example 2022-08-02T22:17:30.098Z
     */
    createDateTime?: Date;

    /**
     * date and time chase is closed (ISO 8601)
     *
     * @type {Date}
     * @memberof ChaseExcerptV2
     * @example 2022-08-02T22:17:30.098Z
     */
    closeDateTime?: Date;

    /**
     * date and time chase last updated (ISO 8601)
     *
     * @type {Date}
     * @memberof ChaseExcerptV2
     * @example 2022-08-02T22:17:30.098Z
     */
    lastUpdateDateTime?: Date;

    /**
     * Provides ability to associate to multiple other external Ids. Displays converted list of identifiers to map of key:value pairs to enable searching
     *
     * @type {any}
     * @memberof ChaseExcerptV2
     */
    identifiers?: any;
}

/**
 * @export
 * @enum {string}
 */
export enum ChaseExcerptV2PatientGenderEnum {
    M = 'M',
    F = 'F',
    O = 'O',
    U = 'U'
}

