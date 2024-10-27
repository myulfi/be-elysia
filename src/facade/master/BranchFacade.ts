import prisma from "../../../prisma/client"
import * as CommonModel from "../../model/CommonModel"
import * as MasterModel from "../../model/MasterModel"
import * as ReturnHelper from "../../function/ReturnHelper"
import * as DateHelper from "../../function/DateHelper"
import * as MasterConstants from "../../constants/MasterConstants"

export async function get(query: typeof CommonModel.TableModel.static) {
    try {
        let condition = {}

        condition = {
            ...condition,
            deletedFlag: 0,
        }

        if (query.search.length > 0) {
            condition = {
                ...condition,
                OR: [
                    {
                        name: {
                            contains: unescape(query.search),
                            mode: 'insensitive'
                        }
                    },
                    {
                        address: {
                            contains: unescape(query.search),
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        }

        const count = await prisma.masterBranch.count({ where: condition })
        const masterBranchList = await prisma.masterBranch.findMany({
            select: {
                id: true,
                name: true,
                attendance: {
                    select: {
                        name: true,
                    }
                },
                qrAttendanceIn: true,
                qrAttendanceOut: true,
            },
            skip: query.start,
            take: query.length,
            where: condition,
            orderBy: { [query.orderColumn]: query.orderDir }
        })

        return ReturnHelper.pageResponse(count, masterBranchList)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function getById(id: number) {
    try {
        const masterBranch = await prisma.masterBranch.findUnique({
            select: {
                id: true,
                name: true,
                address: true,
                latitude: true,
                longitude: true,
                radius: true,
                attendanceId: true,
                attendance: {
                    select: {
                        name: true,
                    }
                },
                qrAttendanceIn: true,
                qrAttendanceOut: true,
                version: true,
            },
            where: {
                id: id,
                deletedFlag: 0
            },
        })

        return ReturnHelper.dataResponse(masterBranch!)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function create(request: any, options: typeof MasterModel.MasterBranchModel.static) {
    try {
        const currentId = await prisma.masterBranch.findFirst({ select: { id: true }, orderBy: { id: "desc" } })

        const masterBranch = await prisma.masterBranch.create({
            data: {
                id: currentId ? (currentId.id + 1) : 1,
                name: options.name,
                address: options.address,
                latitude: options.latitude,
                longitude: options.longitude,
                radius: options.radius,
                attendanceId: MasterConstants.ATTENDANCE.LOCATION,
                deletedFlag: 0,
                createdBy: request.username,
                createdDate: DateHelper.getCurrentDateTime(),
                updatedBy: null,
                updatedDate: null,
                version: 0,
            }
        })

        return ReturnHelper.response(masterBranch !== null, "common.information.created", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function update(request: any, id: number, options: typeof MasterModel.MasterBranchModel.static) {
    try {
        const masterBranch = await prisma.masterBranch.update({
            where: {
                id: id,
                version: options.version
            },
            data: {
                name: options.name,
                address: options.address,
                latitude: options.latitude,
                longitude: options.longitude,
                radius: options.radius,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
                version: options.version + 1
            },
        })

        return ReturnHelper.response(masterBranch !== null, "common.information.updated", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function remove(request: any, ids: string) {
    try {
        const masterBranch = await prisma.masterBranch.updateMany({
            data: {
                deletedFlag: 1,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
            },
            where: { id: { in: ids.split(",").map(Number) } }
        })

        return ReturnHelper.response(masterBranch.count > 0, "common.information.deleted", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}