import * as CommonHelper from "./CommonHelper"

export function response(result: boolean, success: string, failed: string) {
    return {
        message: result ? success : failed,
        status: result ? "success" : "failed"
    }
}

export function pageResponse(count: number, data: object) {
    return {
        status: "success",
        recordsTotal: count,
        data: CommonHelper.jsonParse(data)
    }
}

export function dataResponse(data: object, header?: Array<{}>) {
    return {
        data: CommonHelper.isDefined(data) ? CommonHelper.jsonParse(data) : null,
        header: CommonHelper.isDefined(header) ? CommonHelper.jsonParse(header!) : null,
        status: CommonHelper.isDefined(data) ? "success" : "failed"
    }
}

export function successResponse(message: string) {
    return {
        message: message,
        status: "success"
    }
}

export function failedResponse(message: string) {
    return {
        message: message,
        status: "failed"
    }
}