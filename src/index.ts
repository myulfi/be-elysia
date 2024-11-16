import cors from "@elysiajs/cors"
import jwt from "@elysiajs/jwt"
import { Elysia } from "elysia"
import * as ReturnHelper from "./function/ReturnHelper"
import * as FileHelper from "./function/FileHelper"
import { generateToken } from "./controller/JsonWebTokenController"
import prisma from "../prisma/client"
import Main from "./routers/main"
import Master from "./routers/master"
import External from "./routers/external"
import Command from "./routers/command"
import Test from "./routers/test"

const app = new Elysia()
    .get("/", () => "Hello Elysia")
    .use(cors())
    .use(
        jwt({
            name: "jwt",
            secret: Bun.env.JWT_SECRET!
        })
    )
    .post(
        "/generate-token.json",
        ({ jwt, body }) => generateToken(
            jwt,
            body as {
                username: string;
                password: string;
            }
        )
    )
    .get(
        "/:lng/language.json",
        ({ params: { lng } }) => {
            try {
                return JSON.parse(FileHelper.get(`${__dirname}/language/${lng}.json`))
            } catch (e) {
                console.log(e)
            }
        }
    )
    .guard(
        {
            async beforeHandle({ jwt, request, path, params, error }: any) {
                try {
                    const result = await jwt.verify(request.headers.get("authorization").substr("Bearer".length).trim())
                    if (result == false) {
                        return error(401, ReturnHelper.failedResponse("common.information.invalidToken"))
                    } else {
                        let pattern = path
                        if (params !== undefined) {
                            const keyList = Object.keys(params)
                            for (let i = 0; i < keyList.length; i++) {
                                pattern = pattern.replace(`/${params[keyList[i]]}`, `/:${keyList[i]}`)
                            }
                        }

                        const masterJson = await prisma.masterJson.findFirst({
                            select: {
                                jsonRoleList: {
                                    select: { roleId: true },
                                    where: { deletedFlag: 0 }
                                }
                            },
                            where: {
                                notation: pattern,
                                httpMethod: {
                                    code: request.method
                                },
                                deletedFlag: 0
                            }
                        })

                        if (masterJson !== null) {
                            const masterJsonArray = masterJson.jsonRoleList.map((masterJson: any) => masterJson.roleId)
                            const userRoleArrayArray = result.userBranchList.map((userBranch: any) => userBranch.roleId)
                            if (masterJsonArray.filter(item => userRoleArrayArray.includes(item)).length === 0) {
                                return error(403, ReturnHelper.failedResponse("common.information.forbidden"))
                            }
                        }

                        request.username = result.username
                        request.userRoleList = result.userRoleList
                    }
                } catch (e: unknown) {
                    return error(401, ReturnHelper.failedResponse("common.information.needCredential"))
                }
            }
        },
        (app: any) =>
            app
                .use(Main)
                .use(Master)
                .use(External)
                .use(Command)
                .use(Test)
    )
    .listen(Bun.env.SERVER_PORT!)

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
