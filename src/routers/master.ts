import Elysia from "elysia"
import BranchController from "../controller/master/BranchController"
import * as MasterFacade from "../facade/MasterFacade"

const Master = new Elysia({})
    .group("/master", app => app
        .use(BranchController)
        .get("/language.json", () => MasterFacade.getLanguage())
    )

export default Master