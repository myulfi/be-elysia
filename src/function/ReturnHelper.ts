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

export function dataResponse(data: object) {
    return {
        data: data !== null ? CommonHelper.jsonParse(data) : null,
        status: data !== null ? "success" : "failed"
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