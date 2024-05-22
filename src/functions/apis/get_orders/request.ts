import { HttpRequest } from "../../../libs/Contracts/HttpRequest";

export class GetOrderRequest implements HttpRequest {
    constructor(sample: string) {
        this.sample = sample;
        console.log(this.sample);

    }
    sample: string;
}