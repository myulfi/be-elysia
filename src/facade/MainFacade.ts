import prisma from "../../prisma/client"
import * as ReturnHelper from "../function/ReturnHelper"
import * as FileHelper from "../function/FileHelper"

export async function logout(request: any) {
    try {
        return ReturnHelper.successResponse("common.information.logout")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function changePassword(request: any, options: any) {
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
            return ReturnHelper.failedResponse("common.information.oldPasswordWrong")
        }
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function generateLanguage() {
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
            FileHelper.append(`${Bun.env.ROOT_SRC_FOLDER}/language`, `${masterLanguage.code}.json`, "{")
            masterLangueValueList.forEach((masterLangueValue, index) => {
                FileHelper.append(
                    `${Bun.env.ROOT_SRC_FOLDER}/language`,
                    `${masterLanguage.code}.json`,
                    (index > 0 ? "," : "") + `"${masterLangueValue.languageKey.screenCode}.${masterLangueValue.languageKey.labelType}.${masterLangueValue.languageKey.keyCode}":"${masterLangueValue.value}"`
                )
            })
            FileHelper.append(`${Bun.env.ROOT_SRC_FOLDER}/language`, `${masterLanguage.code}.json`, "}")
        })

        return ReturnHelper.successResponse("common.information.generated")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function json() {
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
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function menu(request: any) {
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
                            }
                        }
                    },
                    where: {
                        deletedFlag: 0,
                        OR: roleList
                    }
                }
            },
            where: {
                deletedFlag: 0,
                menuParentId: 0,
                OR: roleList
            }
        })

        return ReturnHelper.dataResponse(masterMenuList)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}