import prisma from "../../prisma/client";
import { generateId, jsonParse } from "../function/JsonHelper";

export async function getExampleTemplates(start: any, length: number, search: string, orderColumn: string, orderDir: string, value: any, date: any, range: any, request: any) {
    try {
        //console.log(length, value, date, range)
        const count = await prisma.exampleTemplate.count({
            where: {
                deletedFlag: 0
                , OR: [
                    {
                        name: {
                            contains: search
                            , mode: 'insensitive'
                        }
                    }
                    , {
                        description: {
                            contains: search
                            , mode: 'insensitive'
                        }
                    }
                ]
            }
        })
        const exampleTemplateList = await prisma.exampleTemplate.findMany({
            skip: start
            , take: length
            , where: {
                deletedFlag: 0
                , OR: [
                    {
                        name: {
                            contains: search
                            , mode: 'insensitive'
                        }
                    }
                    , {
                        description: {
                            contains: search
                            , mode: 'insensitive'
                        }
                    }
                ]
            }
            , orderBy: {
                [orderColumn]: orderDir
            }
        });

        return {
            success: true
            , recordsTotal: count
            , data: jsonParse(exampleTemplateList)
        };
    } catch (e: unknown) {
        console.error(`Error getting posts: ${e}`);
    }
}

//export async function createExampleTemplate(options: { name: string; description: string }) {
export async function createExampleTemplate(options: any) {
    try {
        options.id = generateId()
        options.deletedFlag = 0
        options.createdBy = 'elysia'
        options.createdDate = new Date()
        options.updatedBy = null
        options.updatedDate = null
        options.version = 0
        options.date = new Date(options.date)

        const exampleTemplate = await prisma.exampleTemplate.create({
            data: options
        });

        return {
            data: jsonParse(exampleTemplate),
            message: exampleTemplate != null ? "Data has already created" : "Data hasn't created ",
            status: exampleTemplate != null ? "success" : "failed",
        }
    } catch (e: unknown) {
        console.error(`Error : ${e}`);
    }
}

export async function getExampleTemplateById(id: number) {
    try {
        const exampleTemplate = await prisma.exampleTemplate.findUnique({
            where: { id: id },
        });

        return {
            data: jsonParse(exampleTemplate!),
            status: exampleTemplate != null ? "success" : "failed",
        }
    } catch (e: unknown) {
        console.error(`Error : ${e}`);
    }
}

export async function updateExampleTemplate(id: number, options: any) {
    try {
        const exampleTemplate = await prisma.exampleTemplate.update({
            where: {
                id: id,
                version: options.version
            },
            data: {
                name: options.name
                , description: options.description
                // , value: options.value
                // , amount: options.amount
                // , date: new Date(options.date)
                // , activeFlag: options.activeFlag
                , updatedBy: 'elysia'
                , updatedDate: new Date()
                , version: options.version + 1
            },
        });

        return {
            data: jsonParse(exampleTemplate),
            message: exampleTemplate != null ? "Data already has updated" : "You cannot update",
            status: exampleTemplate != null ? "success" : "failed",
        }
    } catch (e: unknown) {
        console.error(`Error : ${e}`);
    }
}

export async function deleteExampleTemplate(id: number) {
    try {
        const exampleTemplate = await prisma.exampleTemplate.update({
            data: {
                deletedFlag: 1
            }
            , where: { id: id }
        });

        return {
            message: exampleTemplate !== null ? "Data have been deleted" : "Data haven't been deleted",
            status: exampleTemplate !== null ? "success" : "failed",
        }
    } catch (e: unknown) {
        console.error(`Error : ${e}`);
    }
}