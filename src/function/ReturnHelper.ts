import { HTTP_STATUS } from "../constants/CommonConstants"
import * as CommonHelper from "./CommonHelper"

export function response(result: boolean, success: string, failed: string) {
    return {
        message: result ? success : failed,
        status: result ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR
    }
}

export function pageResponse(count: number, data: object) {
    return {
        status: HTTP_STATUS.OK,
        recordsTotal: count,
        data: CommonHelper.jsonParse(data)
    }
}

export function dataResponse(data: object) {
    return {
        data: CommonHelper.isDefined(data) ? CommonHelper.jsonParse(data) : null,
        // status: CommonHelper.isDefined(data) ? "success" : "failed"
        status: HTTP_STATUS.OK
    }
}

export function messageResponse(message: string) {
    return { message: message }
}