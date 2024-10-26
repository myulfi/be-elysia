import Elysia from "elysia"
import * as MasterFacade from "../facade/MasterFacade"

const Master = new Elysia({})
    .group("/master", app => app
        .get("/language.json", () => MasterFacade.getLanguage())
    )

export default Master