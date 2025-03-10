import prisma from "../../prisma/client"
import * as ReturnHelper from "../function/ReturnHelper"

export async function logout(request: any, error: any) {
    try {
        return ReturnHelper.messageResponse("common.information.logout")
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function profile(request: any, error: any) {
    try {
        const user = await prisma.user.findFirst({
            select: {
                nickName: true,
            },
            where: {
                username: request.username,
            }
        })
        return ReturnHelper.dataResponse(user!)
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function branch(request: any, error: any) {
    try {
        const masterBranch = await prisma.masterBranch.findMany({
            select: {
                latitude: true,
                longitude: true,
                radius: true,
                attendanceId: true,
                qrAttendanceIn: true,
                qrAttendanceOut: true,
            },
            where: {
                userBranchList: {
                    every: {
                        username: request.username
                    }
                },
            }
        })
        return ReturnHelper.dataResponse(masterBranch!)
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function changePassword(request: any, options: any, error: any) {
    try {
        const user = await prisma.user.findFirst({
            select: {
                username: true,
            },
            where: {
                username: request.username,
                password: atob(atob(atob(atob(options.oldPassword))))
            }
        })

        if (user !== null) {
            const userUpdated = await prisma.user.update({
                data: {
                    password: atob(atob(atob(atob(options.newPassword))))
                },
                where: {
                    username: request.username,
                }
            })

            return ReturnHelper.response(
                userUpdated != null,
                "common.information.changePassword",
                "common.information.failed"
            )
        } else {
            return error(500, ReturnHelper.messageResponse("common.information.oldPasswordWrong"))
        }
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function json(error: any) {
    try {
        const masterJsonList = await prisma.masterJson.findMany({
            select: {
                id: true,
                notation: true,
                httpMethod: {
                    select: {
                        id: true,
                        code: true
                    }
                },
                jsonRoleList: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            where: {
                deletedFlag: 0,
                httpMethod: {
                    deletedFlag: 0
                }
            }
        })

        return ReturnHelper.dataResponse(masterJsonList)
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function menu(request: any, error: any) {
    try {
        const roleList = [
            {
                menuRoleList: {
                    none: {}
                },
            },
            {
                menuRoleList: {
                    every: {
                        roleId: {
                            in: [...new Set(request.userRoleList.map((userRole: any) => userRole.roleId))].map(Number)
                        }
                    }
                }
            }
        ]

        const masterMenuList = await prisma.masterMenu.findMany({
            select: {
                id: true,
                name: true,
                sequence: true,
                color: true,
                icon: true,
                path: true,
                children: {
                    select: {
                        id: true,
                        name: true,
                        sequence: true,
                        color: true,
                        icon: true,
                        path: true,
                        children: {
                            select: {
                                id: true,
                                name: true,
                                sequence: true,
                                color: true,
                                icon: true,
                                path: true,
                            },
                            where: {
                                deletedFlag: 0,
                                OR: roleList
                            },
                            orderBy: { sequence: "asc" }
                        }
                    },
                    where: {
                        deletedFlag: 0,
                        OR: roleList
                    },
                    orderBy: { sequence: "asc" }
                }
            },
            where: {
                deletedFlag: 0,
                menuParentId: 0,
                OR: roleList
            },
            orderBy: { sequence: "asc" }
        })

        return ReturnHelper.dataResponse(masterMenuList)
    } catch (e: unknown) {
        console.log(e)
        return error(500, ReturnHelper.messageResponse("common.information.failed"))
    }
}