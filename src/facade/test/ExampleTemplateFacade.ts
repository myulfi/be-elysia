import prisma from "../../../prisma/client"
import * as ReturnHelper from "../../function/ReturnHelper"
import * as CommonHelper from "../../function/CommonHelper"
import * as DateHelper from "../../function/DateHelper"

export async function get(start: any, length: number, search: string, orderColumn: string, orderDir: string) {
    try {
        const count = await prisma.exampleTemplate.count({
            where: {
                deletedFlag: 0,
                OR: [
                    {
                        name: {
                            contains: unescape(search),
                            mode: 'insensitive'
                        }
                    },
                    {
                        description: {
                            contains: unescape(search),
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        })
        const exampleTemplateList = await prisma.exampleTemplate.findMany({
            skip: start,
            take: length,
            where: {
                deletedFlag: 0,
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        description: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            orderBy: {
                [orderColumn]: orderDir
            }
        })

        return ReturnHelper.pageResponse(count, exampleTemplateList)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function getById(id: number) {
    try {
        const exampleTemplate = await prisma.exampleTemplate.findUnique({
            where: { id: id },
        })

        return ReturnHelper.dataResponse(exampleTemplate!)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function create(request: any, options: any) {
    try {
        options.id = CommonHelper.generateId()
        options.deletedFlag = 0
        options.createdBy = request.username
        options.createdDate = DateHelper.getCurrentDateTime()
        options.updatedBy = null
        options.updatedDate = null
        options.version = 0
        options.date = new Date(options.date)

        const exampleTemplate = await prisma.exampleTemplate.create({
            data: options
        });

        return ReturnHelper.response(exampleTemplate !== null, "common.information.created", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function update(request: any, id: number, options: any) {
    try {
        const exampleTemplate = await prisma.exampleTemplate.update({
            where: {
                id: id,
                version: options.version
            },
            data: {
                name: options.name,
                description: options.description,
                // value: options.value,
                // amount: options.amount,
                // date: new Date(options.date),
                // activeFlag: options.activeFlag,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
                version: options.version + 1
            },
        });

        return ReturnHelper.response(exampleTemplate !== null, "common.information.updated", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function remove(request: any, ids: string) {
    try {
        const exampleTemplate = await prisma.exampleTemplate.updateMany({
            data: {
                deletedFlag: 1,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
            },
            where: { id: { in: CommonHelper.splitId(ids) } }
        })

        return ReturnHelper.response(exampleTemplate.count > 0, "common.information.deleted", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}