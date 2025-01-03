import { Client, Pool } from "pg"
import tunnelSsh from "tunnel-ssh"
import prisma from "../../../prisma/client"
import fs from "fs"

import * as FileHelper from "../../function/FileHelper"
import * as CommonInterface from "../../interface/CommonInterface"
import * as CommonModel from "../../model/CommonModel"
import * as ExternalModel from "../../model/ExternalModel"
import * as ReturnHelper from "../../function/ReturnHelper"
import * as CommonHelper from "../../function/CommonHelper"
import * as DateHelper from "../../function/DateHelper"
import * as RegexConstants from "../../constants/RegexConstants"
import * as CommonConstants from "../../constants/CommonConstants"

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
                        code: {
                            contains: unescape(query.search),
                            mode: 'insensitive'
                        }
                    },
                    {
                        description: {
                            contains: unescape(query.search),
                            mode: 'insensitive'
                        }
                    },
                    {
                        ip: {
                            contains: unescape(query.search),
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        }

        const count = await prisma.externalServer.count({ where: condition })
        const externalServerList = await prisma.externalServer.findMany({
            select: {
                id: true,
                code: true,
                description: true,
                ip: true,
                port: true,
                username: true,
                createdDate: true
            },
            skip: query.start,
            take: query.length,
            where: condition,
            orderBy: { [query.orderColumn]: query.orderDir }
        })

        return ReturnHelper.pageResponse(count, externalServerList)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function getById(id: number) {
    try {
        const externalServer = await prisma.externalServer.findUnique({
            select: {
                id: true,
                code: true,
                description: true,
                ip: true,
                port: true,
                username: true,
                password: true,
                privateKey: true,
                version: true,
            },
            where: { id: id },
        })

        return ReturnHelper.dataResponse(externalServer!)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function create(request: any, options: typeof ExternalModel.ServerModel.static) {
    try {
        const currentId = await prisma.externalServer.findFirst({ select: { id: true }, orderBy: { id: "desc" } })
        const externalServer = await prisma.externalServer.create({
            data: {
                id: currentId ? (currentId.id + 1) : 1,
                code: options.code,
                description: options.description,
                ip: options.ip,
                port: options.port,
                username: options.username,
                password: options.password,
                privateKey: options.privateKey,
                deletedFlag: 0,
                createdBy: request.username,
                createdDate: DateHelper.getCurrentDateTime(),
                updatedBy: null,
                updatedDate: null,
                version: 0,
            }
        })

        return ReturnHelper.response(externalServer !== null, "common.information.created", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function update(request: any, id: number, options: typeof ExternalModel.ServerModel.static) {
    try {
        const externalServer = await prisma.externalServer.update({
            where: {
                id: id,
                version: options.version
            },
            data: {
                code: options.code,
                description: options.description,
                ip: options.ip,
                port: options.port,
                username: options.username,
                password: options.password,
                privateKey: options.privateKey,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
                version: options.version + 1
            },
        })

        return ReturnHelper.response(externalServer !== null, "common.information.updated", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function remove(request: any, ids: string) {
    try {
        const externalServer = await prisma.externalServer.updateMany({
            data: {
                deletedFlag: 1,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
            },
            where: { id: { in: ids.split(",").map(Number) } }
        })

        return ReturnHelper.response(externalServer.count > 0, "common.information.deleted", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function getShortcut(id: number) {
    try {
        const externalServerShortcutList = await prisma.externalServerShortcut.findMany({
            select: {
                id: true,
                name: true,
                directory: true,
            },
            where: {
                externalServerId: id,
                deletedFlag: 0
            },
            orderBy: { createdDate: "desc" }
        })

        return ReturnHelper.dataResponse(externalServerShortcutList)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function createShortcut(request: any, id: number, options: typeof ExternalModel.ServerDirectoryModel.static) {
    try {
        const externalServerShorcut = await prisma.externalServerShortcut.create({
            data: {
                id: CommonHelper.generateId(),
                name: options.name,
                directory: options.directory,
                externalServerId: id,
                deletedFlag: 0,
                createdBy: request.username,
                createdDate: DateHelper.getCurrentDateTime(),
                updatedBy: null,
                updatedDate: null,
                version: 0,
            }
        })

        return ReturnHelper.dataResponse(externalServerShorcut)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function removeShorcut(request: any, ids: string) {
    try {
        const externalServer = await prisma.externalServerShortcut.updateMany({
            data: {
                deletedFlag: 1,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
            },
            where: { id: { in: ids.split(",").map(Number) } }
        })

        return ReturnHelper.response(externalServer.count > 0, "common.information.deleted", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function getDefaultDirectoryById(id: number) {
    try {
        if (id === 0) {
            return ReturnHelper.dataResponse({
                "defaultDirectory": Bun.env.ROOT_SRC_FOLDER
            })
        } else {
            return ReturnHelper.dataResponse({})
        }
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function getDirectory(id: number, query: any) {
    const files = [];
    for (const name of await fs.promises.readdir(query.directory)) {
        const stats = await fs.promises.stat(query.directory + "\\" + name)
        files.push({
            id: name,
            name: name,
            directoryFlag: stats.isDirectory(),
            fileFlag: stats.isFile(),
            size: stats.size,
            createdDate: stats.birthtime,
            modifiedDate: stats.mtime,
            ownerName: stats.uid,
            groupName: stats.gid,
            mode: stats.mode,
        })
    }
    return ReturnHelper.dataResponse({
        fileArray: files,
        directory: query.directory
    })
}

export async function createDirectory(id: number, options: typeof ExternalModel.ServerDirectoryModel.static) {
    try {
        const aa = await fs.promises.mkdir(options.directory + "\\" + options.name)
        console.log(aa)
        return ReturnHelper.response(true, "common.information.created", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function renameDirectoryFile(id: number, options: typeof ExternalModel.ServerDirectoryFileModel.static) {
    try {
        await fs.promises.rename(options.directory + "\\" + options.oldName!, options.directory + "\\" + options.name)
        return ReturnHelper.response(true, "common.information.renamed", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function removeDirectoryFile(id: number, options: typeof ExternalModel.ServerRemoveDirectoryFileModel.static) {
    try {
        options.name.forEach(name => {
            FileHelper.remove(options.directory + "\\" + name)
        })
        return ReturnHelper.response(true, "common.information.uploaded", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function getFile(id: number, options: typeof ExternalModel.ServerFileModel.static) {
    try {
        const data = await fs.promises.readFile(options.directory + "\\" + options.name, 'utf8')
        console.log(data)
        return ReturnHelper.dataResponse(
            {
                content: data
            }
        )
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function createFile(id: number, options: typeof ExternalModel.ServerFileModel.static) {
    try {
        const fileHandle = await fs.promises.open(options.directory + "\\" + options.name, 'wx')
        await fileHandle.writeFile(options.content)
        await fileHandle.close()
        return ReturnHelper.response(true, "common.information.created", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function updateFile(id: number, options: typeof ExternalModel.ServerFileModel.static) {
    try {
        await fs.promises.writeFile(options.directory + "\\" + options.name, options.content)
        return ReturnHelper.response(true, "common.information.updated", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function uploadFile(id: number, options: typeof ExternalModel.ServerUploadFileModel.static) {
    try {
        options.files.forEach(file => {
            Bun.write(options.directory + "\\" + file.name, file)
        })
        return ReturnHelper.response(true, "common.information.uploaded", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}