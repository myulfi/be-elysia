import prisma from "../../prisma/client"
import * as ReturnHelper from "../function/ReturnHelper"

export async function getLanguage() {
    try {
        const masterLanguageList = await prisma.masterLanguage.findMany({
            select: {
                id: true,
                name: true,
            },
            where: {
                deletedFlag: 0,
            },
            orderBy: {
                id: "asc"
            }
        })

        return ReturnHelper.dataResponse(masterLanguageList)
    } catch (e: unknown) {
        console.error(e)
        return ReturnHelper.failedResponse("common.information.failed")
    }
}