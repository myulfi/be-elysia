import prisma from "../../../prisma/client"
import * as CommonModel from "../../model/CommonModel"
import * as CommandModel from "../../model/CommandModel"
import * as ReturnHelper from "../../function/ReturnHelper"
import * as CommonHelper from "../../function/CommonHelper"
import * as DateHelper from "../../function/DateHelper"
import * as FileHelper from "../../function/FileHelper"

export async function get(query: typeof CommonModel.TableModel.static) {
    try {
        let condition = {}

        condition = {
            ...condition,
            deletedFlag: 0,
        }

        // if (query.search.length > 0) {
        //     condition = {
        //         ...condition,
        //         OR: [
        //             {
        //                 name: {
        //                     contains: unescape(query.search),
        //                     mode: 'insensitive'
        //                 }
        //             },
        //             {
        //                 description: {
        //                     contains: unescape(query.search),
        //                     mode: 'insensitive'
        //                 }
        //             }
        //         ]
        //     }
        // }

        const count = await prisma.masterLanguageKey.count({ where: condition })
        const languageList = await prisma.masterLanguageKey.findMany({
            select: {
                id: true,
                screenCode: true,
                labelType: true,
                keyCode: true,
                languageValueList: {
                    select: {
                        languageId: true,
                        value: true,
                    },
                },
                createdDate: true
            },
            skip: query.start,
            take: query.length,
            where: condition,
            orderBy: { [query.orderColumn]: query.orderDir }
        })

        return ReturnHelper.pageResponse(count, languageList)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function getById(id: number) {
    try {
        const language = await prisma.masterLanguageKey.findUnique({
            select: {
                id: true,
                screenCode: true,
                labelType: true,
                keyCode: true,
                languageValueList: {
                    select: {
                        languageId: true,
                        value: true,
                    },
                },
                version: true
            },
            where: { id: id },
        })

        return ReturnHelper.dataResponse(language!)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function create(request: any, options: typeof CommandModel.LanguageModel.static) {
    try {
        const language = await prisma.masterLanguageKey.create({
            data: {
                id: CommonHelper.generateId(),
                screenCode: options.screenCode,
                labelType: options.labelType,
                keyCode: options.keyCode,
                deletedFlag: 0,
                createdBy: request.username,
                createdDate: DateHelper.getCurrentDateTime(),
                updatedBy: null,
                updatedDate: null,
                version: 0,
            }
        })

        if (language !== null) {
            await prisma.masterLanguageValue.createMany({
                data: options.languageValueList.map((masterLanguageValue: any) => {
                    return {
                        id: CommonHelper.generateId(),
                        languageKeyId: language.id,
                        deletedFlag: 0,
                        createdBy: request.username,
                        createdDate: DateHelper.getCurrentDateTime(),
                        updatedBy: null,
                        updatedDate: null,
                        version: 0,
                        ...masterLanguageValue,
                    }
                })
            })
        }

        return ReturnHelper.response(language !== null, "common.information.created", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function update(request: any, id: number, options: typeof CommandModel.LanguageModel.static) {
    try {
        const language = await prisma.masterLanguageKey.update({
            where: {
                id: id,
                version: options.version
            },
            data: {
                screenCode: options.screenCode,
                labelType: options.labelType,
                keyCode: options.keyCode,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
                version: options.version + 1
            },
        })

        if (language != null) {
            await prisma.masterLanguageValue.updateMany({
                where: {
                    languageKeyId: language.id,
                },
                data: {
                    deletedFlag: 1
                }
            })

            const insertedAmount = await prisma.masterLanguageValue.createMany({
                data: options.languageValueList.map((languageValue: any) => {
                    return {
                        id: CommonHelper.generateId(),
                        languageKeyId: language.id,
                        deletedFlag: 0,
                        createdBy: request.username,
                        createdDate: DateHelper.getCurrentDateTime(),
                        updatedBy: null,
                        updatedDate: null,
                        version: 0,
                        ...languageValue,
                    }
                })
            })

            if (insertedAmount.count > 0) {
                await prisma.masterLanguageValue.deleteMany({
                    where: {
                        languageKeyId: language.id,
                        deletedFlag: 1
                    },
                })
            }
        }

        return ReturnHelper.response(language !== null, "common.information.updated", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function implement() {
    try {
        const masterLanguageList = await prisma.masterLanguage.findMany({
            select: {
                id: true,
                code: true,
            },
            where: {
                deletedFlag: 0
            }
        })

        let masterLangueValueList = null
        masterLanguageList.forEach(async masterLanguage => {
            masterLangueValueList = await prisma.masterLanguageValue.findMany({
                select: {
                    languageKey: {
                        select: {
                            screenCode: true,
                            labelType: true,
                            keyCode: true
                        },
                    },
                    value: true,
                },
                where: {
                    deletedFlag: 0,
                    languageId: masterLanguage.id,
                    languageKey: {
                        deletedFlag: 0
                    }
                }
            })

            FileHelper.clearContent(`${Bun.env.ROOT_SRC_FOLDER}/language/${masterLanguage.code}.json`)
            FileHelper.append(`${Bun.env.ROOT_SRC_FOLDER}/language`, `${masterLanguage.code}.json`, "{\"\":\"\"")
            masterLangueValueList.forEach((masterLangueValue, index) => {
                FileHelper.append(
                    `${Bun.env.ROOT_SRC_FOLDER}/language`,
                    `${masterLanguage.code}.json`,
                    `,"${masterLangueValue.languageKey.screenCode}.${masterLangueValue.languageKey.labelType}.${masterLangueValue.languageKey.keyCode}":"${masterLangueValue.value}"`
                )
            })
            FileHelper.append(`${Bun.env.ROOT_SRC_FOLDER}/language`, `${masterLanguage.code}.json`, "}")
        })

        return ReturnHelper.successResponse("common.information.implemented")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function remove(request: any, ids: string) {
    try {
        console.log(ids)
        const language = await prisma.masterLanguageKey.updateMany({
            data: {
                deletedFlag: 1,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
            },
            where: { id: { in: CommonHelper.splitId(ids) } }
        })

        return ReturnHelper.response(language.count > 0, "common.information.deleted", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}