import prisma from "../../prisma/client"
import jwt from 'jsonwebtoken'
import * as CommonHelper from "../function/CommonHelper"
import * as ReturnHelper from "../function/ReturnHelper"
import { User } from "@prisma/client"

async function selectUser(parameter: {}) {
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
        where: parameter
    })

    return user
}

async function generateTokenJson(user: any) {
    const accessToken = await jwt.sign(
        {
            username: user.username,
            userRoleList: CommonHelper.jsonParse(user.userRoleList)
        },
        Bun.env.JWT_ACCESS_TOKEN_SECRET!,
        { expiresIn: Bun.env.JWT_ACCESS_TOKEN_EXPIRED! }
    )

    const refreshToken = await jwt.sign(
        {
            username: user.username
        },
        Bun.env.JWT_REFRESH_TOKEN_SECRET!,
        { expiresIn: Bun.env.JWT_REFRESH_TOKEN_EXPIRED! }
    )

    return ReturnHelper.dataResponse({
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: {
            nickName: user.nickName,
            roleList: user.userRoleList.map((userRole: any) => userRole.roleId),
        }
    })
}

export async function generateToken(body: any, error: any) {
    try {
        var errorMessage = null

        if (!body.username || !body.password) {
            errorMessage = "common.information.credentialMustBeFilled"
        } else {
            const user = await selectUser(
                {
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
            )

            if (user !== null) {
                const json = await generateTokenJson(user)
                return json
            } else {
                errorMessage = "common.information.credentialIsInvalid"
            }
        }

        return error(401, ReturnHelper.messageResponse(errorMessage))
    } catch (e: unknown) {
        console.log(e)
        return error(401, ReturnHelper.messageResponse("common.information.failed"))
    }
}

export async function refreshToken(request: any, error: any) {
    const result = await jwt.verify(request.headers.get("authorization").substr("Bearer".length).trim(), Bun.env.JWT_REFRESH_TOKEN_SECRET!)
    if (result) {
        const user = await selectUser({ username: result.username })
        if (user !== null) {
            const json = await generateTokenJson(user)
            return json
        }
    }

    return error(401, ReturnHelper.messageResponse("common.information.failed"))
}