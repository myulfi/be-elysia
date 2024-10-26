import prisma from "../../prisma/client"
import * as CommonHelper from "../function/CommonHelper"
import * as ReturnHelper from "../function/ReturnHelper"

export async function generateToken(jwt: any, body: any) {
    try {
        var error = null

        if (!body.username || !body.password) {
            error = "common.information.credentialMustBeFilled"
        } else {
            const user = await prisma.user.findFirst({
                select: {
                    username: true,
                    nickName: true,
                    userRoleList: {
                        select: {
                            id: true,
                            roleId: true
                        },
                        where: { deletedFlag: 0 }
                    }
                },
                where: {
                    OR: [
                        {
                            username: atob(atob(atob(body.username))),
                            password: atob(atob(atob(atob(body.password))))
                        },
                        // {
                        //     username: body.username,
                        //     password: body.password
                        // }
                    ]
                }
            })

            if (user !== null) {
                const token = await jwt.sign({
                    username: user.username,
                    userRoleList: CommonHelper.jsonParse(user.userRoleList)
                })

                return ReturnHelper.dataResponse({
                    token: token,
                    user: {
                        nickName: user.nickName,
                        roleList: user.userRoleList.map((userRole: any) => userRole.roleId),
                    }
                })
            } else {
                error = "common.information.credentialIsInvalid"
            }
        }

        return ReturnHelper.failedResponse(error)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}