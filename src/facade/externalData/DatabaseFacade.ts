import { Client, Pool } from "pg"
import tunnelSsh from "tunnel-ssh"
import prisma from "../../../prisma/client"
import fs from "fs"
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
                        databaseConnection: {
                            contains: unescape(query.search),
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        }

        const count = await prisma.externalDatabase.count({ where: condition })
        const externalDatabaseList = await prisma.externalDatabase.findMany({
            select: {
                id: true,
                code: true,
                databaseConnection: true,
                description: true,
                lockedFlag: true,
                createdDate: true
            },
            skip: query.start,
            take: query.length,
            where: condition,
            orderBy: { [query.orderColumn]: query.orderDir }
        })

        return ReturnHelper.pageResponse(count, externalDatabaseList)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function getById(id: number) {
    try {
        const externalDatabase = await prisma.externalDatabase.findUnique({
            select: {
                id: true,
                code: true,
                description: true,
                databaseTypeId: true,
                databaseType: {
                    select: {
                        name: true,
                    }
                },
                username: true,
                password: true,
                databaseConnection: true,
                version: true,
            },
            where: { id: id },
        })

        return ReturnHelper.dataResponse(externalDatabase!)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function create(request: any, options: typeof ExternalModel.DatabaseModel.static) {
    try {
        const currentId = await prisma.externalDatabase.findFirst({ select: { id: true }, orderBy: { id: "desc" } })

        const externalDatabase = await prisma.externalDatabase.create({
            data: {
                id: currentId ? (currentId.id + 1) : 1,
                code: options.code,
                description: options.description,
                databaseTypeId: options.databaseTypeId,
                username: options.username,
                password: options.password,
                databaseConnection: options.databaseConnection,
                lockedFlag: 1,
                deletedFlag: 0,
                createdBy: request.username,
                createdDate: DateHelper.getCurrentDateTime(),
                updatedBy: null,
                updatedDate: null,
                version: 0,
            }
        })

        return ReturnHelper.response(externalDatabase !== null, "common.information.created", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function update(request: any, id: number, options: typeof ExternalModel.DatabaseModel.static) {
    try {
        const externalDatabase = await prisma.externalDatabase.update({
            where: {
                id: id,
                version: options.version
            },
            data: {
                code: options.code,
                description: options.description,
                databaseTypeId: options.databaseTypeId,
                username: options.username,
                password: options.password,
                databaseConnection: options.databaseConnection,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
                version: options.version + 1
            },
        })

        return ReturnHelper.response(externalDatabase !== null, "common.information.updated", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function remove(request: any, ids: string) {
    try {
        const externalDatabase = await prisma.externalDatabase.updateMany({
            data: {
                deletedFlag: 1,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
            },
            where: { id: { in: ids.split(",").map(Number) } }
        })

        return ReturnHelper.response(externalDatabase.count > 0, "common.information.deleted", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function unlock(request: any, id: number) {
    try {
        const externalDatabase = await prisma.externalDatabase.update({
            where: {
                id: id,
            },
            data: {
                lockedFlag: 0,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
            },
        })

        return ReturnHelper.response(externalDatabase !== null, "common.information.unlocked", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function lock(request: any, id: number) {
    try {
        const externalDatabase = await prisma.externalDatabase.update({
            where: {
                id: id,
            },
            data: {
                lockedFlag: 1,
                updatedBy: request.username,
                updatedDate: DateHelper.getCurrentDateTime(),
            },
        })

        return ReturnHelper.response(externalDatabase !== null, "common.information.locked", "common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

async function getPostgresqlConnection(id: number, func: Function, errorfunc?: Function) {
    try {
        const externalDatabase = await prisma.externalDatabase.findUnique({
            select: {
                username: true,
                password: true,
                databaseConnection: true,
                databaseType: {
                    select: {
                        url: true
                    }
                }
            },
            where: {
                id: id,
                deletedFlag: 0
            }
        })
        let response: any = null
        if (externalDatabase !== null) {
            // const postgresClient = new Client({
            //     user: 'postgres',
            //     host: 'localhost',
            //     database: 'parung',
            //     password: 'Password*123',
            //     port: 5432,
            // })

            const postgresClient = new Client(
                externalDatabase.databaseType.url
                    .replaceAll("%1$s", externalDatabase.username)
                    .replaceAll("%2$s", externalDatabase.password)
                    .replaceAll("%3$s", externalDatabase.databaseConnection!)
            )

            try {
                await postgresClient.connect()
                response = await func(postgresClient)
            } catch (e) {
                response = errorfunc !== undefined ? errorfunc(e) : ReturnHelper.failedResponse(String(e))
            } finally {
                await postgresClient.end()
            }
        } else {
            response = ReturnHelper.failedResponse("common.information.databaseNotfounded")
        }

        return response
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

async function getPostgresqlConnection2(id: number, func: Function, errorfunc?: Function) {
    try {
        const externalDatabase = await prisma.externalDatabase.findUnique({
            select: {
                username: true,
                password: true,
                databaseConnection: true,
                databaseType: {
                    select: {
                        url: true
                    }
                }
            },
            where: {
                id: id,
                deletedFlag: 0
            }
        })
        let response: any = null
        if (externalDatabase !== null) {
            // const postgresClient = new Client({
            //     user: 'postgres',
            //     host: 'localhost',
            //     database: 'parung',
            //     password: 'Password*123',
            //     port: 5432,
            // })

            let localPort = 5433
            // tunnelOptions, serverOptions, sshOptions, forwardOptions
            const [server, client] = await tunnelSsh.createTunnel(
                // { autoClose: true },
                { autoClose: false },
                { port: localPort },
                {
                    // host: '103.118.99.182',
                    // port: 2222,
                    // username: 'USER',
                    // password: 'SiAnuKiperLazio123',

                    host: '108.136.248.143',
                    port: 22,
                    username: 'ubuntu',
                    // password: 'SiAnuKiperLazio123',
                    privateKey: fs.readFileSync('C:\\Users\\Mulyadi Yulfi\\.ssh\\sippuri.pem', "utf8"),

                    // agent: 'pageant',
                    // keepaliveInterval: 1000,
                    // readyTimeout: 10000,
                    keepAlive: true,
                },
                {
                    // srcAddr: 'localhost',
                    // srcPort: localPort,
                    // dstAddr: 'localhost',
                    // dstPort: localPort,
                    dstPort: 5432
                }
            ).then(async ([server, conn]) => {
                const postgresClient = new Pool(
                    {
                        // user: 'postgres',        // Your username
                        // host: 'localhost',       // Your database host
                        // database: 'dukcapil',  // Your database name
                        // password: '243ujuUJ39Jhg',  // Your password
                        // port: localPort,              // Default PostgreSQL port
                        user: 'postgres',        // Your username
                        host: 'localhost',       // Your database host
                        database: 'sippuri',  // Your database name
                        password: 'j660ATrA1to8',  // Your password
                        port: 5433,
                    }
                    // externalDatabase.databaseType.url
                    //     .replaceAll("%1$s", externalDatabase.username)
                    //     .replaceAll("%2$s", externalDatabase.password)
                    //     .replaceAll("%3$s", externalDatabase.databaseConnection!)
                )
                try {
                    console.log("test22")
                    const result = await postgresClient.query("select * from tbl_mt")
                    console.log(result)
                    //await postgresClient.connect()
                    console.log("test23")
                    response = await func(postgresClient)
                } catch (e) {
                    console.log("test4")
                    console.log(e)
                    response = errorfunc !== undefined ? errorfunc(e) : ReturnHelper.failedResponse("common.information.timeout")
                } finally {
                    await postgresClient.end()
                    server.close()
                }

                return [server, conn];
            });

            console.log("test2")
            // console.log(server?.listening)
            // console.log(externalDatabase.databaseType.url
            //     .replaceAll("%1$s", externalDatabase.username)
            //     .replaceAll("%2$s", externalDatabase.password)
            //     .replaceAll("%3$s", externalDatabase.databaseConnection!))

            //server?
            // .listen({

            console.log(`server listen on ${server?.address()?.port}`)


        } else {
            response = ReturnHelper.failedResponse("common.information.databaseNotfounded")
        }

        return response
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function testConnection(id: number) {
    return await getPostgresqlConnection(id, () => ReturnHelper.successResponse("common.information.success"))
}

function getQueryResult(query: string) {
    const queryResult: CommonInterface.QueryResult = {
        query: query,
        name: null,
        action: null,
        error: null,
        row: 0,
    }

    const flatQuery = query
        .replaceAll("/\\*.*?\\*/", CommonConstants.BLANK_SPACE)
        .replaceAll("--.*(\\n|\\r|\\r\\n)", CommonConstants.BLANK_SPACE)
        .replaceAll("(\\n|\\r|\\r\\n)", CommonConstants.BLANK_SPACE)
        .replaceAll("\\s+", CommonConstants.BLANK_SPACE)
        .trim()

    const regex = new RegExp(RegexConstants.QUERY_PATTERN, "gi")
    const queryArray = [...flatQuery.matchAll(regex)]
    queryArray.forEach((element, index) => {
        for (let i = 10; i > 0; i -= 2) {
            if (element[i] != null) {
                queryResult.name = element[i].toLowerCase()
                queryResult.action = element[i - 1].toLowerCase()
            }
        }
    })

    if (queryResult.name === null) {
        queryResult.name = "abnormal"
        queryResult.action = "abnormal"
    }

    return queryResult
}

export async function runQueryManual(request: any, id: number, bulkExecuted: number, query: string) {
    try {
        // let selectAllowedFlag = CommonConstants.FLAG.NO
        // let dropAllowedFlag = CommonConstants.FLAG.NO
        // let createAllowedFlag = CommonConstants.FLAG.NO
        // let alterAllowedFlag = CommonConstants.FLAG.NO
        // let insertAllowedFlag = CommonConstants.FLAG.NO
        // let updateAllowedFlag = CommonConstants.FLAG.NO
        // let deleteAllowedFlag = CommonConstants.FLAG.NO
        let selectAllowedFlag = CommonConstants.FLAG.YES
        let dropAllowedFlag = CommonConstants.FLAG.YES
        let createAllowedFlag = CommonConstants.FLAG.YES
        let alterAllowedFlag = CommonConstants.FLAG.YES
        let insertAllowedFlag = CommonConstants.FLAG.YES
        let updateAllowedFlag = CommonConstants.FLAG.YES
        let deleteAllowedFlag = CommonConstants.FLAG.YES

        // if (request.userRoleList.contains(MasterConstants.ROLE.SYSTEM_ADMIN)) {
        //     selectAllowedFlag = CommonConstants.FLAG.YES
        //     dropAllowedFlag = CommonConstants.FLAG.YES
        //     createAllowedFlag = CommonConstants.FLAG.YES
        //     alterAllowedFlag = CommonConstants.FLAG.YES
        //     insertAllowedFlag = CommonConstants.FLAG.YES
        //     updateAllowedFlag = CommonConstants.FLAG.YES
        //     deleteAllowedFlag = CommonConstants.FLAG.YES
        // } else {
        //     // for (ExternalDatabaseRoleVO externalDatabaseRoleVO : externalDatabaseRoleFacade.getTableList("externalDatabaseId", id, new String[] { "roleId", "selectAllowedFlag", "dropAllowedFlag", "createAllowedFlag", "alterAllowedFlag", "insertAllowedFlag", "updateAllowedFlag", "deleteAllowedFlag"})) {
        //     //     if (getRoleList.contains(String.valueOf(externalDatabaseRoleVO.getRoleId()))) {
        //     //         if (CommonConstants.FLAG.NO == selectAllowedFlag && CommonConstants.FLAG.YES == externalDatabaseRoleVO.getSelectAllowedFlag()) selectAllowedFlag = CommonConstants.FLAG.YES
        //     //         if (CommonConstants.FLAG.NO == dropAllowedFlag && CommonConstants.FLAG.YES == externalDatabaseRoleVO.getDropAllowedFlag()) dropAllowedFlag = CommonConstants.FLAG.YES
        //     //         if (CommonConstants.FLAG.NO == createAllowedFlag && CommonConstants.FLAG.YES == externalDatabaseRoleVO.getCreateAllowedFlag()) createAllowedFlag = CommonConstants.FLAG.YES
        //     //         if (CommonConstants.FLAG.NO == alterAllowedFlag && CommonConstants.FLAG.YES == externalDatabaseRoleVO.getAlterAllowedFlag()) alterAllowedFlag = CommonConstants.FLAG.YES
        //     //         if (CommonConstants.FLAG.NO == insertAllowedFlag && CommonConstants.FLAG.YES == externalDatabaseRoleVO.getInsertAllowedFlag()) insertAllowedFlag = CommonConstants.FLAG.YES
        //     //         if (CommonConstants.FLAG.NO == updateAllowedFlag && CommonConstants.FLAG.YES == externalDatabaseRoleVO.getUpdateAllowedFlag()) updateAllowedFlag = CommonConstants.FLAG.YES
        //     //         if (CommonConstants.FLAG.NO == deleteAllowedFlag && CommonConstants.FLAG.YES == externalDatabaseRoleVO.getDeleteAllowedFlag()) deleteAllowedFlag = CommonConstants.FLAG.YES
        //     //     }
        //     // }
        // }

        bulkExecuted = 0
        // query = "SELECT * FROM tbl_mt_district; SELECT 'asd asd', 'asd\r\n"
        //     + "asd', 'asd;asd' FROM tbl_mt_city; SELECT \"asd asd\", \"asd\r\n"
        //     + "asd\", \"asd;asd\" FROM tbl_mt_city;\r\n"
        //     + "SELECT * FROM tbl_mt_district;\r\n"
        //     + "SELECT * FROM tbl_mt_district;\r\n"
        //     + "--SELECT * FROM tbl_mt_poc;\r\n"
        //     + "--SELECT * FROM; tbl_mt_poc;\r\n"
        //     + "--SELECT * FROM tbl_mt_poc\r\n"
        //     + "SELECT * FROM tbl_mt_village;\r\n"
        //     + "/*\r\n"
        //     + "SELECT HUHU;\r\n"
        //     + "FROM HIHI\r\n"
        //     + "*/\r\n"
        //     + "/*\r\n"
        //     + "SELECT HUHU;\r\n"
        //     + "FROM HIHI\r\n"
        //     + "*/\r\n"
        //     + "/*SELECT; HAHA*/\r\n"
        //     + "/*SELECT HIHI;*/\r\n"
        //     + "/*SELECT; HAHA*/\r\n"
        //     + "/*SELECT; HIHI;*/\r\n"
        //     + "/*SELECT HUHU\r\n"
        //     + "FROM HIHI\r\n"
        //     + "*/\r\n"
        //     + "SELECT * FROM tbl_mt_poc;\r\n"
        //     + "SELECT * FROM tbl_mt_poc;\r\n"
        //     + "CREATES BEGIN asdf;adaf END;\r\n"
        //     + "CREATE \r\n"
        //     + "BEGIN asdf;adaf \r\n"
        //     + "ssv \r\n"
        //     + "'hjhj'\r\n"
        //     + "\"hjhj\"\r\n"
        //     + "--wjwjwj\r\n"
        //     + "/*\r\n"
        //     + "avfwjgi;\r\n"
        //     + "hgiehg;\r\n"
        //     + "gjiej\r\n"
        //     + "*/\r\n"
        //     + "ijij;dfe\r\n"
        //     + "svsv sfvs \r\n"
        //     + "koko;\r\n"
        //     + "END;\r\n"
        //     + "SELECT * FROM tbl_mt_poc"

        // query = "INSERT INTO table_1;SELECT * FROM tbl_mt_menu;INSERT INTO table_1;INSERT INTO table_2;\r\n" +
        //     "UPDATE table_1 SET;UPDATE table_2 SET;UPDATE table_1 SET 1=1 WHERE 1;huehiuehui;UPDATE table_3 SET;"
        // query = "SELECT id, nm FROM tbl_mt_menu"
        // query = "CREATE TABLE tbl_temp (id SMALLINT, nm VARCHAR(2));"
        // query = "INSERT INTO tbl_temp VALUES (2, 'bb'), (3, 'cc'), (4, 'dd')"
        //query = "UPDATE tbl_temp SET nm = 'ee' WHERE id = 4"
        //query = "DELETE FROM tbl_temp WHERE id = 4"
        // query = "SELECT * FROM tbl_temp"

        let objectResult = null

        let queryResult = null
        let queryResultList: CommonInterface.QueryResult[] = []
        const regex = new RegExp(CommonConstants.FLAG.YES == bulkExecuted ? RegexConstants.MANUAL_QUERY_BULK : RegexConstants.MANUAL_QUERY, "gi")
        const queryArray = [...query.matchAll(regex)]
        for (const element of queryArray) {
            if (element[0].length > 1) {
                queryResult = getQueryResult(element[0])

                if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(SELECT|WITH)" }), "si").test(queryResult.query)) {
                    if (CommonConstants.FLAG.NO === selectAllowedFlag) {
                        queryResult.error = "Forbidden to do SELECT action"
                    } else if (queryResultList.length === 0) {
                        objectResult = await getDataSelection(id, queryResult.query, 0, 0)
                    }
                } else if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(DROP|CREATE|ALTER)" }), "si").test(queryResult.query)) {
                    if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(DROP)" }), "si").test(queryResult.query) && CommonConstants.FLAG.NO === dropAllowedFlag) {
                        queryResult.error = "Forbidden to do DROP action"
                    } else if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(CREATE)" }), "si").test(queryResult.query) && CommonConstants.FLAG.NO === createAllowedFlag) {
                        queryResult.error = "Forbidden to do CREATE action"
                    } else if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(ALTER)" }), "si").test(queryResult.query) && CommonConstants.FLAG.NO === alterAllowedFlag) {
                        queryResult.error = "Forbidden to do ALTER action"
                    } else {
                        queryResult = await dataDefinition(id, queryResult)
                    }
                } else if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(INSERT|UPDATE|DELETE)" }), "si").test(queryResult.query)) {
                    if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(INSERT)" }), "si").test(queryResult.query) && CommonConstants.FLAG.NO === insertAllowedFlag) {
                        queryResult.error = "Forbidden to do INSERT action"
                    } else {
                        if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(UPDATE)" }), "si").test(queryResult.query) && CommonConstants.FLAG.NO === updateAllowedFlag) {
                            queryResult.error = "Forbidden to do UPDATE action"
                        } else if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(DELETE)" }), "si").test(queryResult.query) && CommonConstants.FLAG.NO === deleteAllowedFlag) {
                            queryResult.error = "Forbidden to do DELETE action"
                        } else {
                            if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(INSERT|(UPDATE|DELETE)\\s.+\\s?WHERE)" }), "si").test(queryResult.query)) {
                                queryResult = await dataManipulation(id, queryResult)
                            } else {
                                queryResult.error = "You need WHERE clause"
                            }
                        }
                    }
                } else if (queryResult.query.match("--.*(\\r\\n|\\r|\\n)|(\\/\\*[^\\/\\*]*\\*\\/)")) {
                    return
                } else {
                    queryResult.error = "Abnormal Query"
                }

                if (
                    queryResultList.length > 0
                    && queryResult.name === queryResultList.at(-1)?.name
                    && queryResult.action === queryResultList.at(-1)?.action
                    && (
                        (queryResult.error === null && queryResultList.at(-1)?.error === null)
                        || (
                            queryResult.error !== null
                            && queryResultList.at(-1)?.error !== null
                            && queryResult.error === queryResultList.at(-1)?.error
                        )
                    )
                ) {
                    queryResultList[queryResultList.length - 1].row += queryResult.row
                } else if (
                    new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(SELECT|WITH)" }), "si").test(queryResult.query) === false
                    || queryResult.error !== null
                ) {
                    if (CommonConstants.FLAG.YES === bulkExecuted) {
                        queryResult.action = "executed"
                    }

                    queryResultList.push(queryResult)
                }
            }
        }

        if (queryResultList.length > 0) {
            return ReturnHelper.dataResponse({ result: queryResultList, header: [{ name: "Result Information" }] })
        } else if (objectResult?.data.length === 1 && objectResult?.data[0].error !== undefined) {
            return ReturnHelper.dataResponse({ result: [{ error: objectResult?.data[0].error }], header: [{ name: "Result Information" }] })
        } else {
            return ReturnHelper.dataResponse(objectResult?.data!)
        }
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function getQueryManual(request: any, queryManualId: number, start: number, length: number) {
    try {
        const queryManual = await prisma.queryManual.findUnique({
            select: {
                query: true,
                externalDatabaseId: true,
            },
            where: {
                id: queryManualId
            }
        })

        if (queryManual !== null) {
            return await getDataSelection(queryManual.externalDatabaseId, queryManual.query, start, length)
        }

        return ReturnHelper.failedResponse("common.information.failed")
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function getQueryObject(id: number, query: typeof CommonModel.TableModel.static) {
    const data = await getPostgresqlConnection(
        id,
        async (postgresClient: Client) => {
            const order = `${query.orderColumn} ${query.orderDir}`
            const condition = query.search.length > 0 ? `AND object_name LIKE \'%${unescape(query.search)}%\'` : ""
            const queryScript = `
                SELECT
					objects.object_id
					, objects.object_name
					, objects.object_type
				 FROM (
					SELECT
						pg_class.oid AS object_id
						, views.viewname AS object_name
						, 'view' AS object_type
					FROM pg_catalog.pg_views views
					LEFT JOIN pg_class ON pg_class.relname = views.viewname
					WHERE views.schemaname = 'public'
					UNION ALL
					SELECT
						pg_class.oid AS object_id
						, tables.tablename AS object_name
						, 'table' AS object_type
					FROM pg_catalog.pg_tables tables
					LEFT JOIN pg_class ON pg_class.relname = tables.tablename
					WHERE tables.schemaname = 'public'
					UNION ALL
					SELECT
						functions.pronamespace AS object_id
						, functions.proname AS object_name
						, 'function' AS object_type
					FROM pg_catalog.pg_proc functions
					WHERE functions.pronamespace IN(SELECT oid FROM pg_catalog.pg_namespace WHERE nspname = 'public')
				 ) objects
				 WHERE 1 = 1
				 ${condition}
            `

            const count = await postgresClient.query(`SELECT COUNT(*) FROM (${queryScript})`)
            const result = await postgresClient.query(queryScript.concat(` ORDER BY ${order} LIMIT ${query.length} OFFSET ${query.start}`))

            return ReturnHelper.pageResponse(count.rows[0].count, result.rows)
        },
        (err: any) => {
            return {
                header: [{ name: "Result Information" }],
                data: [{ error: `ERROR : ${err.message}` }]
            }
        }
    )

    return data

    /*
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
                        databaseConnection: {
                            contains: unescape(query.search),
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        }

        const count = await prisma.externalDatabase.count({ where: condition })
        const externalDatabaseList = await prisma.externalDatabase.findMany({
            select: {
                id: true,
                code: true,
                databaseConnection: true,
                lockedFlag: true,
                createdDate: true
            },
            skip: query.start,
            take: query.length,
            where: condition,
            orderBy: { [query.orderColumn]: query.orderDir }
        })

        return ReturnHelper.pageResponse(count, externalDatabaseList)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
        */
}

export async function getQueryWhitelist(id: number, query: typeof CommonModel.TableModel.static) {
    try {
        let condition = {}

        condition = {
            ...condition,
            deletedFlag: 0,
            externalDatabaseId: id,
        }

        if (query.search.length > 0) {
            condition = {
                ...condition,
                OR: [
                    {
                        description: {
                            contains: unescape(query.search),
                            mode: 'insensitive'
                        }
                    },
                    {
                        query: {
                            contains: unescape(query.search),
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        }

        const count = await prisma.externalDatabaseQuery.count({ where: condition })
        const externalDatabaseQueryList = await prisma.externalDatabaseQuery.findMany({
            select: {
                id: true,
                description: true,
                query: true,
                createdDate: true
            },
            skip: query.start,
            take: query.length,
            where: condition,
            orderBy: { [query.orderColumn]: query.orderDir }
        })

        return ReturnHelper.pageResponse(count, externalDatabaseQueryList)
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function runQueryExactData(request: any, id: number, objectIdentity: string) {
    try {
        let queryString = null
        if (objectIdentity.match("^[0-9]{16}$")) {
            const externalDatabaseQuery = await prisma.externalDatabaseQuery.findFirst({
                select: {
                    query: true,
                },
                where: {
                    id: Number(objectIdentity),
                    externalDatabaseId: id
                }
            })

            if (externalDatabaseQuery !== null) {
                queryString = externalDatabaseQuery.query
            }
        } else {
            queryString = `SELECT * FROM ${objectIdentity}`
        }

        if (queryString !== null) {
            const objectResult = await getDataSelection(id, queryString, 0, 0)
            return ReturnHelper.dataResponse(objectResult?.data!)
        } else {
            return ReturnHelper.failedResponse("common.information.failed")
        }
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

export async function getQueryExactData(request: any, id: number, objectIdentity: string, start: number, length: number) {
    try {
        let queryString = null
        if (objectIdentity.match("^[0-9]{16}$")) {
            const externalDatabaseQuery = await prisma.externalDatabaseQuery.findFirst({
                select: {
                    query: true,
                },
                where: {
                    id: Number(objectIdentity),
                    externalDatabaseId: id
                }
            })

            if (externalDatabaseQuery !== null) {
                queryString = externalDatabaseQuery.query
            }
        } else {
            queryString = `SELECT * FROM ${objectIdentity}`
        }

        if (queryString !== null) {
            return await getDataSelection(id, queryString, start, length)
        } else {
            return ReturnHelper.failedResponse("common.information.failed")
        }
    } catch (e: unknown) {
        console.log(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}

async function getDataSelection(id: number, query: string, page: number, limit: number) {
    return await getPostgresqlConnection(
        id,
        async (postgresClient: Client) => {
            const result = await postgresClient.query(`${query} LIMIT ${limit} OFFSET ${page}`)
            if (page === 0 && limit === 0) {
                const typeRes = await postgresClient.query('SELECT oid, typname FROM pg_type WHERE oid = ANY($1)', [[...new Set(result.fields.map(field => field.dataTypeID))]])
                let typeMap: { [key: number]: string } = {}
                typeRes.rows.forEach(row => {
                    {
                        typeMap = {
                            ...typeMap,
                            [row.oid]: row.typname,
                        }
                    }
                })

                let header: {}[] = []
                result.fields.forEach(field => {
                    header.push({
                        name: field.name,
                        type: typeMap[field.dataTypeID]
                    })
                })

                const queryManual = await prisma.queryManual.create({
                    data: {
                        id: CommonHelper.generateId(),
                        externalDatabaseId: id,
                        query: query,
                        createdBy: "system",
                        createdDate: DateHelper.getCurrentDateTime(),
                        updatedBy: null,
                        updatedDate: null,
                        version: 0,
                    }
                })

                return { data: { queryManualId: queryManual.id, header: header } }
            } else {
                const count = await postgresClient.query(query)
                return ReturnHelper.pageResponse(count.rowCount ?? 0, result.rows)
            }
        },
        (err: any) => {
            return {
                header: [{ name: "Result Information" }],
                data: [{ error: `ERROR : ${err.message}` }]
            }
        }
    )
}

async function dataDefinition(id: number, queryResult: CommonInterface.QueryResult) {
    return await getPostgresqlConnection(
        id,
        async (postgresClient: Client) => {
            queryResult.action = "defined"

            if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(DROP)" }), "si").test(queryResult.query)) {
                queryResult.action = "droped"
            } else if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(CREATE)" }), "si").test(queryResult.query)) {
                queryResult.action = "created"
            } else if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(ALTER)" }), "si").test(queryResult.query)) {
                queryResult.action = "altered"
            }

            await postgresClient.query(queryResult.query)
            queryResult.row = 1
            queryResult.error = null
            return queryResult
        },
        (err: any) => {
            queryResult.row = 0
            queryResult.error = `ERROR : ${err.message}`
            return queryResult
        }
    )
}

async function dataManipulation(id: number, queryResult: CommonInterface.QueryResult) {
    return await getPostgresqlConnection(
        id,
        async (postgresClient: Client) => {
            queryResult.action = "modified"

            if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(INSERT)" }), "si").test(queryResult.query)) {
                queryResult.action = "inserted"
            } else if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(UPDATE)" }), "si").test(queryResult.query)) {
                queryResult.action = "updated"
            } else if (new RegExp(CommonHelper.formatMessage(RegexConstants.QUERY_MANUAL, { value: "(DELETE)" }), "si").test(queryResult.query)) {
                queryResult.action = "deleted"
            }

            const result = await postgresClient.query(queryResult.query)
            queryResult.row = result.rowCount ?? 0
            queryResult.error = null
            return queryResult
        },
        (err: any) => {
            queryResult.row = 0
            queryResult.error = `ERROR : ${err.message}`
            return queryResult
        }
    )
}

function getTableName(query: string) {
    const nameArray = [...query.matchAll(new RegExp("FROM (\\w+)", "gmi"))];
    return nameArray.length > 0 && nameArray[0].length > 0 && nameArray[0][0].toLowerCase().startsWith("from ") ? nameArray[0][0].substr(5).trim() : "manual";
}

export async function getQueryInsertSql(id: number, externalDatabaseQueryTypeId: number, content: string, includeColumnNameFlag: number, numberOfLinePerAction: number) {
    return await getPostgresqlConnection(
        id,
        async (postgresClient: Client) => {
            const queryManual = await prisma.queryManual.findUnique({
                select: {
                    query: true,
                },
                where: { id: Number(content) }
            })

            if (queryManual !== null) {
                const result = await postgresClient.query(queryManual.query)
                const name = getTableName(queryManual.query)

                const typeRes = await postgresClient.query('SELECT oid, typname FROM pg_type WHERE oid = ANY($1)', [[...new Set(result.fields.map(field => field.dataTypeID))]])
                let typeMap: { [key: number]: string } = {}
                typeRes.rows.forEach(row => {
                    {
                        typeMap = {
                            ...typeMap,
                            [row.oid]: row.typname,
                        }
                    }
                })

                let header: { name: string, type: string }[] = []
                result.fields.forEach(field => {
                    header.push({
                        name: field.name,
                        type: typeMap[field.dataTypeID]
                    })
                })

                const columnName = header.map(obj => obj.name).join(", ")

                const content: string[] = []
                result.rows.forEach((row, index) => {
                    const value = header.reduce(
                        (prev, head) => `${prev}${prev.length > 0 ? ", " : ""}${row[head.name] === null ? "NULL" : head.type.includes("int") ? row[head.name] : head.type.includes("date") ? "'" + DateHelper.formatDate(row[head.name], "yyyy-MM-dd") + "'" : head.type.includes("timestamp") ? "'" + DateHelper.formatDate(row[head.name], "yyyy-MM-dd HH:mm:ss") + "'" : "'" + row[head.name] + "'"}`,
                        ""
                    )

                    if (numberOfLinePerAction === 1) {
                        if (CommonConstants.FLAG.YES === includeColumnNameFlag) {
                            content.push(`INSERT INTO ${name} (${columnName}) VALUES (${value});`)
                        } else {
                            content.push(`INSERT INTO ${name} VALUES (${value});`)
                        }
                    } else {
                        if (index % numberOfLinePerAction === 0) {
                            if (CommonConstants.FLAG.YES === includeColumnNameFlag) {
                                content.push(`INSERT INTO ${name} (${columnName}) VALUES (${value})`)
                            } else {
                                content.push(`INSERT INTO ${name} VALUES (${value})`)
                            }
                        } else {
                            content.push(`, (${value})${index % numberOfLinePerAction === numberOfLinePerAction - 1 ? ";" : ""}`)
                        }
                    }
                })

                if (content[content.length - 1].endsWith(";") === false) {
                    content[content.length - 1] = content[content.length - 1].concat(";")
                }

                content.push("")
                content.push(`/*Generated by ${Bun.env.APP_NAME} at ${DateHelper.formatDate(DateHelper.getCurrentDateTime(), "dd MMM yyyy HH:mm:ss")}*/`)

                return {
                    data: content.join("\r\n").trim(),
                    status: "success"
                }
            } else {
                return ReturnHelper.failedResponse("common.information.queryNotfounded")
            }
        }
    )
}

export async function getQueryUpdateSql(id: number, externalDatabaseQueryTypeId: number, content: string, multipleLineFlag: number, firstAmountConditioned: number) {
    return await getPostgresqlConnection(
        id,
        async (postgresClient: Client) => {
            const queryManual = await prisma.queryManual.findUnique({
                select: {
                    query: true,
                },
                where: { id: Number(content) }
            })

            if (queryManual !== null) {
                const result = await postgresClient.query(queryManual.query)
                const name = getTableName(queryManual.query)

                const typeRes = await postgresClient.query('SELECT oid, typname FROM pg_type WHERE oid = ANY($1)', [[...new Set(result.fields.map(field => field.dataTypeID))]])
                let typeMap: { [key: number]: string } = {}
                typeRes.rows.forEach(row => {
                    {
                        typeMap = {
                            ...typeMap,
                            [row.oid]: row.typname,
                        }
                    }
                })

                let header: { name: string, type: string }[] = []
                result.fields.forEach(field => {
                    header.push({
                        name: field.name,
                        type: typeMap[field.dataTypeID]
                    })
                })

                const content: string[] = []
                result.rows.forEach((row) => {
                    const set = header.reduce(
                        (prev, head) => `${prev}${CommonConstants.FLAG.YES === multipleLineFlag ? "\r\n" : ""}${prev.length > 0 ? ", " : ""}${head.name} = ${row[head.name] === null ? "NULL" : head.type.includes("int") ? row[head.name] : head.type.includes("date") ? "'" + DateHelper.formatDate(row[head.name], "yyyy-MM-dd") + "'" : head.type.includes("timestamp") ? "'" + DateHelper.formatDate(row[head.name], "yyyy-MM-dd HH:mm:ss") + "'" : "'" + row[head.name] + "'"}`,
                        ""
                    )

                    const condition = header.reduce(
                        (prev, head, index) => {
                            if (index < firstAmountConditioned) {
                                return `${prev}${prev.length > 0 ? " AND " : ""}${head.name} = ${row[head.name] === null ? "NULL" : head.type.includes("int") ? row[head.name] : head.type.includes("date") ? "'" + DateHelper.formatDate(row[head.name], "yyyy-MM-dd") + "'" : head.type.includes("timestamp") ? "'" + DateHelper.formatDate(row[head.name], "yyyy-MM-dd HH:mm:ss") + "'" : "'" + row[head.name] + "'"}`
                            } else {
                                return prev
                            }
                        },
                        ""
                    )

                    content.push(`${CommonConstants.FLAG.YES === multipleLineFlag ? "\r\n" : ""}UPDATE ${name} SET ${set}${CommonConstants.FLAG.YES === multipleLineFlag ? "\r\n" : " "}WHERE ${condition};`)
                })

                content.push("")
                content.push(`/*Generated by ${Bun.env.APP_NAME} at ${DateHelper.formatDate(DateHelper.getCurrentDateTime(), "dd MMM yyyy HH:mm:ss")}*/`)

                return {
                    data: content.join("\r\n").trim(),
                    status: "success"
                }
            } else {
                return ReturnHelper.failedResponse("common.information.queryNotfounded")
            }
        }
    )
}

export async function getQueryCsv(id: number, externalDatabaseQueryTypeId: number, content: string, headerFlag: number, delimiter: string) {
    return await getPostgresqlConnection(
        id,
        async (postgresClient: Client) => {
            const queryManual = await prisma.queryManual.findUnique({
                select: {
                    query: true,
                },
                where: { id: Number(content) }
            })

            if (queryManual !== null) {
                const result = await postgresClient.query(queryManual.query)

                const typeRes = await postgresClient.query('SELECT oid, typname FROM pg_type WHERE oid = ANY($1)', [[...new Set(result.fields.map(field => field.dataTypeID))]])
                let typeMap: { [key: number]: string } = {}
                typeRes.rows.forEach(row => {
                    {
                        typeMap = {
                            ...typeMap,
                            [row.oid]: row.typname,
                        }
                    }
                })

                let header: { name: string, type: string }[] = []
                result.fields.forEach(field => {
                    header.push({
                        name: field.name,
                        type: typeMap[field.dataTypeID]
                    })
                })

                const content: string[] = []
                if (CommonConstants.FLAG.YES === headerFlag) {
                    content.push(header.map(obj => obj.name).join(unescape(delimiter)))
                }

                result.rows.forEach((row) => {
                    content.push(
                        header.reduce(
                            (prev, head) => `${prev}${prev.length > 0 ? unescape(delimiter) : ""}${row[head.name] === null ? "NULL" : head.type.includes("int") ? row[head.name] : head.type.includes("date") ? DateHelper.formatDate(row[head.name], "yyyy-MM-dd") : head.type.includes("timestamp") ? DateHelper.formatDate(row[head.name], "yyyy-MM-dd HH:mm:ss") : row[head.name]}`,
                            ""
                        )
                    )
                })

                return {
                    data: content.join("\r\n").trim(),
                    status: "success"
                }
            } else {
                return ReturnHelper.failedResponse("common.information.queryNotfounded")
            }
        }
    )
}

export async function getQueryJson(id: number, externalDatabaseQueryTypeId: number, content: string) {
    return await getPostgresqlConnection(
        id,
        async (postgresClient: Client) => {
            const queryManual = await prisma.queryManual.findUnique({
                select: {
                    query: true,
                },
                where: { id: Number(content) }
            })

            if (queryManual !== null) {
                const result = await postgresClient.query(queryManual.query)

                return {
                    data: JSON.stringify(result.rows).toString(),
                    status: "success"
                }
            } else {
                return ReturnHelper.failedResponse("common.information.queryNotfounded")
            }
        }
    )
}

export async function getQueryXml(id: number, externalDatabaseQueryTypeId: number, content: string) {
    return await getPostgresqlConnection(
        id,
        async (postgresClient: Client) => {
            const queryManual = await prisma.queryManual.findUnique({
                select: {
                    query: true,
                },
                where: { id: Number(content) }
            })

            if (queryManual !== null) {
                const result = await postgresClient.query(queryManual.query)
                const name = getTableName(queryManual.query)

                const typeRes = await postgresClient.query('SELECT oid, typname FROM pg_type WHERE oid = ANY($1)', [[...new Set(result.fields.map(field => field.dataTypeID))]])
                let typeMap: { [key: number]: string } = {}
                typeRes.rows.forEach(row => {
                    {
                        typeMap = {
                            ...typeMap,
                            [row.oid]: row.typname,
                        }
                    }
                })

                let header: { name: string, type: string }[] = []
                result.fields.forEach(field => {
                    header.push({
                        name: field.name,
                        type: typeMap[field.dataTypeID]
                    })
                })

                const content: string[] = []
                content.push("<List>")

                result.rows.forEach((row) => {
                    content.push(`<${name}>`)
                    header.forEach((head) => {
                        content.push(`<${head.name}>${row[head.name] === null ? "NULL" : head.type.includes("int") ? row[head.name] : head.type.includes("date") ? DateHelper.formatDate(row[head.name], "yyyy-MM-dd") : head.type.includes("timestamp") ? DateHelper.formatDate(row[head.name], "yyyy-MM-dd HH:mm:ss") : row[head.name]}</${head.name}>`)
                    })
                    content.push(`</${name}>`)
                })

                return {
                    data: content.join("").trim(),
                    status: "success"
                }
            } else {
                return ReturnHelper.failedResponse("common.information.queryNotfounded")
            }
        }
    )
}