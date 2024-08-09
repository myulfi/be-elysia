import prisma from "../../prisma/client";
import { jsonParse } from "../function/JsonHelper";

export async function generateToken(jwt: any, body: any) {
    try {
        var error = null
        if (!body.username || !body.password) {
            error = "Credential must be filled"
        } else {
            const user = await prisma.user.findFirst({
                select: {
                    username: true
                    , userRoleList: {
                        select: {
                            id: true
                            , roleId: true
                        }
                        , where: { deletedFlag: 0 }
                    }
                }
                , where: { username: body.username, password: body.password }
            });

            if (user !== null) {
                const token = await jwt.sign({
                    username: user.username
                    , userRoleList: jsonParse(user.userRoleList)
                })

                return {
                    status: "success"
                    , data: {
                        token: token
                        , username: user.username
                    }
                }
            } else {
                error = "Credential is invalid"
            }
        }

        return {
            status: "failed"
            , message: error
        }
    } catch (e: unknown) {
        console.error(`Error generate token: ${e}`)
    }
}