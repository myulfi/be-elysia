import prisma from "../../prisma/client";
import { generateId, jsonParse } from "../function/Helper"

export async function getExampleTemplates() {
    try {
        const data = await prisma.exampleTemplate.findMany(
            {
                orderBy: { id: 'desc' }
            }
        );

        return {
            success: true,
            data: jsonParse(data)
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

        const data = await prisma.exampleTemplate.create({
            data: options
        });

        //return response json
        return {
            success: true,
            message: "Data Created Successfully!",
            data: jsonParse(data)
        }
    } catch (e: unknown) {
        console.error(`Error creating post: ${e}`);
    }
}

export async function getExampleTemplateById(id: number) {
    try {
        const data = await prisma.exampleTemplate.findUnique({
            where: { id: id },
        });

        if (!data) {
            return {
                sucess: true,
                message: "Detail Data Post Not Found!",
                data: null,
            }
        }

        //return response json
        return {
            success: true,
            data: jsonParse(data),
        }
    } catch (e: unknown) {
        console.error(`Error finding post: ${e}`);
    }
}

export async function updateExampleTemplate(id: number, options: any) {
    try {
        const data = await prisma.exampleTemplate.update({
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
            success: true,
            message: "Data Updated Successfully!",
            data: jsonParse(data),
        }
    } catch (e: unknown) {
        console.error(`Error updating post: ${e}`);
    }
}

export async function deleteExampleTemplate(id: string) {
    try {

        await prisma.exampleTemplate.delete({
            where: { id: parseInt(id) },
        });

        return {
            success: true,
            message: "Post Deleted Successfully!",
        }
    } catch (e: unknown) {
        console.error(`Error deleting post: ${e}`);
    }
}