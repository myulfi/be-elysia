import prisma from "../../../prisma/client"
import * as CommonModel from "../../model/CommonModel"
import * as TestModel from "../../model/TestModel"
import * as ReturnHelper from "../../function/ReturnHelper"
import * as CommonHelper from "../../function/CommonHelper"
import * as DateHelper from "../../function/DateHelper"

export async function get(query: typeof CommonModel.TableModel.static, error: any) {
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
                        description: {
                            contains: unescape(query.search),
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        }

        const count = await prisma.exampleTemplate.count({ where: condition })
        const exampleTemplateList = await prisma.exampleTemplate.findMany({
            skip: query.start,
            take: query.length,
            where: condition,
            orderBy: { [query.orderColumn]: query.orderDir }
        })

        return ReturnHelper.pageResponse(count, exampleTemplateList)
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function getById(id: number, error: any) {
    try {
        const exampleTemplate = await prisma.exampleTemplate.findUnique({
            where: { id: id },
        })

        return ReturnHelper.dataResponse(exampleTemplate!)
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function create(request: any, options: typeof TestModel.ExampleTemplateModel.static, error: any) {
    try {
        const exampleTemplate = await prisma.exampleTemplate.create({
            data: {
                id: CommonHelper.generateId(),
                name: options.name,
                value: options.value,
                amount: options.amount,
                date: options.date,
                activeFlag: options.activeFlag,
                deletedFlag: 0,
                createdBy: request.username,
                createdDate: DateHelper.getCurrentDateTime(),
                updatedBy: null,
                updatedDate: null,
                version: 0,
            }
        })

        return ReturnHelper.response(exampleTemplate !== null, "common.information.created", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function update(request: any, id: number, options: typeof TestModel.ExampleTemplateModel.static, error: any) {
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
                // date: options.date,
                // activeFlag: options.activeFlag,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
                version: options.version + 1
            },
        })

        return ReturnHelper.response(exampleTemplate !== null, "common.information.updated", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function remove(request: any, ids: string, error: any) {
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
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}