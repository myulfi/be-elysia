import prisma from "../../prisma/client"
import { jsonParse } from "../function/JsonHelper"

export async function menu() {
    try {
        const masterMenuList = await prisma.masterMenu.findMany({
            select: {
                name: true
                , sequence: true
                , color: true
                , icon: true
                , path: true
                , children: {
                    select: {
                        name: true
                        , sequence: true
                        , color: true
                        , icon: true
                        , path: true
                        , children: {
                            select: {
                                name: true
                                , sequence: true
                                , color: true
                                , icon: true
                                , path: true
                            }
                            , where: {
                                deletedFlag: 0
                            }
                        }
                    }
                    , where: {
                        deletedFlag: 0
                    }
                }
            }
            , where: {
                deletedFlag: 0,
                menuParentId: 0
            }
        })

        return {
            data: jsonParse(masterMenuList)
            , status: "success"
        }
    } catch (e: unknown) {
        console.error(e)
    }
}