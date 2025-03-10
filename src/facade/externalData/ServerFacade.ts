import { Client } from "ssh2"
import prisma from "../../../prisma/client"
import fs from "fs"

import * as FileHelper from "../../function/FileHelper"
import * as CommonModel from "../../model/CommonModel"
import * as ExternalModel from "../../model/ExternalModel"
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
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function getById(id: number, error: any) {
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
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function create(request: any, options: typeof ExternalModel.ServerModel.static, error: any) {
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
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function update(request: any, id: number, options: typeof ExternalModel.ServerModel.static, error: any) {
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
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function remove(request: any, ids: string, error: any) {
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
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function getShortcut(id: number, error: any) {
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
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function createShortcut(request: any, id: number, options: typeof ExternalModel.ServerDirectoryModel.static, error: any) {
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
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function removeShorcut(request: any, ids: string, error: any) {
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
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

async function commandExternalServer(id: number, path: string): Promise<string> {
    const externalServer = await prisma.externalServer.findUnique({
        select: {
            id: true,
            code: true,
            ip: true,
            port: true,
            username: true,
            password: true,
            privateKey: true,
        },
        where: {
            id: id,
            deletedFlag: 0
        },
    })
    if (externalServer) {
        return await new Promise((resolve, reject) => {
            const sshConfig = {
                host: externalServer.ip,
                port: externalServer.port,
                username: externalServer.username,
                privateKey: Buffer.from(externalServer.privateKey!, 'utf8')
            }

            const ssh = new Client()
            ssh.on("ready", async () => {
                ssh.exec(path, (err: any, stream: any) => {
                    if (err) {
                        reject(err)
                    }

                    stream
                        .on("close", (code: any, signal: any) => {
                            ssh.end()
                        })
                        .stderr.on('data', (data: any) => {
                            reject(err)
                        })
                }).on("error", (err: any) => {
                    reject(err)
                })
            }).connect(sshConfig)
        })
    } else {
        return "common.information.notFound"
    }
}

async function getDataExternalServer(id: number, path: string): Promise<string> {
    const externalServer = await prisma.externalServer.findUnique({
        select: {
            id: true,
            code: true,
            ip: true,
            port: true,
            username: true,
            password: true,
            privateKey: true,
        },
        where: {
            id: id,
            deletedFlag: 0
        },
    })

    if (externalServer) {
        return await new Promise((resolve, reject) => {
            const sshConfig = {
                host: externalServer.ip,
                port: externalServer.port,
                username: externalServer.username,
                privateKey: Buffer.from(externalServer.privateKey!, 'utf8')
            }

            const ssh = new Client()
            ssh.on("ready", async () => {
                ssh.exec(path, (err: any, stream: any) => {
                    if (err) {
                        reject(err)
                    }

                    stream
                        .on("close", (code: any, signal: any) => {
                            ssh.end()
                            resolve("true")
                        })
                        .on("data", (data: any) => {
                            resolve(data.toString().trim())
                        })
                        .stderr.on('data', (data: any) => {
                            reject(err)
                        })
                }).on("error", (err: any) => {
                    reject(err)
                })
            }).connect(sshConfig)
        })
    } else {
        return "common.information.notFound"
    }
}

async function uploadFileExternalServer(id: number, remotePath: string, files: File[]) {
    const externalServer = await prisma.externalServer.findUnique({
        select: {
            id: true,
            code: true,
            ip: true,
            port: true,
            username: true,
            password: true,
            privateKey: true,
        },
        where: {
            id: id,
            deletedFlag: 0
        },
    })
    if (externalServer) {
        const sshConfig = {
            host: externalServer.ip,
            port: externalServer.port,
            username: externalServer.username,
            privateKey: Buffer.from(externalServer.privateKey!, 'utf8')
        }

        const ssh = new Client()
        ssh.on("ready", () => {
            ssh.sftp((err: any, sftp: any) => {
                if (err) {
                    // reject(err)
                }

                files.map(file => {
                    sftp.writeFile(remotePath + "/" + file.name, file.arrayBuffer, (err: any) => {
                        if (err) {
                            // reject(err)
                        } else {
                            // resolve("true")
                        }
                    });
                })
            })
        }).on("error", (err: any) => {
            // reject(err)
        }).connect(sshConfig)

    } else {
        return "common.information.notFound"
    }
}

export async function getDefaultDirectoryById(id: number, error: any) {
    try {
        if (id === 0) {
            return ReturnHelper.dataResponse({ "defaultDirectory": Bun.env.ROOT_SRC_FOLDER })
        } else {
            const defaultDirectory = await getDataExternalServer(id, "pwd")
            return ReturnHelper.dataResponse({ "defaultDirectory": defaultDirectory })
        }
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function getDirectory(id: number, query: any) {
    const files = []
    if (id === 0) {
        for (const name of await fs.promises.readdir(query.directory)) {
            const stats = await fs.promises.stat(`${query.directory}/${name}`)
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
    } else {
        const lines = await getDataExternalServer(id, `ls -l --time-style='+%Y-%m-%d %H:%M:%S' "${query.directory.length > 0 ? query.directory : "/"}"`)
        for (let line of lines.split("\n").filter((line: string) => line.trim() !== "")) {
            const parts = line.split(/\s+/)
            if (parts.length >= 7) {
                const file = {
                    id: parts.slice(7).join(' '),
                    name: parts.slice(7).join(' '),
                    directoryFlag: parts[0].startsWith("d") ? 1 : 0,
                    fileFlag: parts[0].startsWith("d") ? 0 : 1,
                    size: parts[4],
                    createdDate: `${parts[5]} ${parts[6]}`,
                    modifiedDate: `${parts[5]} ${parts[6]}`,
                    ownerName: parts[2],
                    groupName: parts[3],
                    mode: parts[0],
                }
                files.push(file)
            }
        }
    }

    return ReturnHelper.dataResponse({
        fileArray: files,
        directory: query.directory
    })
}

export async function createDirectory(id: number, options: typeof ExternalModel.ServerDirectoryModel.static, error: any) {
    try {
        if (id === 0) {
            await fs.promises.mkdir(`${options.directory}/${options.name}`)
        } else {
            commandExternalServer(id, `mkdir "${options.directory}/${options.name}"`)
        }
        return ReturnHelper.response(true, "common.information.created", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function renameDirectoryFile(id: number, options: typeof ExternalModel.ServerDirectoryFileModel.static, error: any) {
    try {
        if (id === 0) {
            await fs.promises.rename(`${options.directory}/${options.oldName!}`, `${options.directory}/${options.name}`)
        } else {
            commandExternalServer(id, `mv "${options.directory}//${options.oldName}" "${options.directory}//${options.name}"`)
        }
        return ReturnHelper.response(true, "common.information.renamed", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function pasteDirectoryFile(id: number, options: typeof ExternalModel.ServerPasteDirectoryFileModel.static, error: any) {
    try {
        let newName: string = ""
        for await (const name of options.name) {
            newName = name
            while (true) {
                if (id === 0) {
                    if (fs.existsSync(`${options.destination}/${newName}`) === false) {
                        const stats = fs.statSync(`${options.source}/${name}`)
                        if (stats.isDirectory()) {
                            FileHelper.copyDirectory(`${options.source}/${name}`, `${options.destination}/${newName}`)
                        } else {
                            fs.promises.copyFile(`${options.source}/${name}`, `${options.destination}/${newName}`)
                        }
                        break
                    }
                } else {
                    var exists = await getDataExternalServer(id, `test -e "${options.destination}/${newName}" && echo 1 || echo 0`)
                    if (exists === "0") {
                        commandExternalServer(id, `cp -r "${options.source}/${name}" "${options.destination}/${newName}"`)
                        break
                    }
                }
                newName = FileHelper.renameFileautomatically(newName)
            }
        }
        return ReturnHelper.response(true, "common.information.pasted", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function removeDirectoryFile(id: number, options: typeof ExternalModel.ServerRemoveDirectoryFileModel.static, error: any) {
    try {
        if (id === 0) {
            options.name.forEach(name => {
                FileHelper.remove(`${options.directory}/${name}`)
            })
        } else {
            for await (const name of options.name) {
                commandExternalServer(id, `rm "${options.directory}/${name}" || rmdir "${options.directory}/${name}"`)
            }
        }
        return ReturnHelper.response(true, "common.information.removed", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function getFile(id: number, options: typeof ExternalModel.ServerFileModel.static, error: any) {
    try {
        let data
        if (id === 0) {
            data = await fs.promises.readFile(`${options.directory}/${options.name}`, "utf8")
        } else {
            data = await getDataExternalServer(id, `cat "${options.directory}/${options.name}"`)
        }

        return ReturnHelper.dataResponse({ content: data })
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function createFile(id: number, options: typeof ExternalModel.ServerFileModel.static, error: any) {
    try {
        if (id === 0) {
            const fileHandle = await fs.promises.open(`${options.directory}/${options.name}`, 'wx')
            await fileHandle.writeFile(options.content)
            await fileHandle.close()
        } else {
            commandExternalServer(id, `echo '${options.content.replace(/'/g, "'\\''")}' > "${options.directory}/${options.name}"`)
        }
        return ReturnHelper.response(true, "common.information.created", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function updateFile(id: number, options: typeof ExternalModel.ServerFileModel.static, error: any) {
    try {
        if (id === 0) {
            await fs.promises.writeFile(`${options.directory}/${options.name}`, options.content)
        } else {
            commandExternalServer(id, `echo '${options.content.replace(/'/g, "'\\''")}' > "${options.directory + "/" + options.name}"`)
        }
        return ReturnHelper.response(true, "common.information.updated", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function uploadFile(id: number, options: typeof ExternalModel.ServerUploadFileModel.static, error: any) {
    try {
        if (id === 0) {
            options.files.forEach(file => {
                Bun.write(`${options.directory}/${file.name}`, file)
            })
        } else {
            uploadFileExternalServer(id, options.directory, options.files)
        }
        return ReturnHelper.response(true, "common.information.uploaded", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}