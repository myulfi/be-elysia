import Elysia from "elysia"
import BranchController from "../controller/master/BranchController"
import * as MasterFacade from "../facade/MasterFacade"

const Master = new Elysia({})
    .group("/master", app => app
        .use(BranchController)
        .get("/language.json", (error) => MasterFacade.getLanguage(error))
        .get("/database-type.json", (error) => MasterFacade.getDatabaseType(error))
    )

export default Master