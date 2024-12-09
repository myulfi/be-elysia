import Elysia from "elysia"
import DatabaseController from "../controller/externalData/DatabaseController"
import ServerController from "../controller/externalData/ServerController"

const Command = new Elysia({})
    .group("/external", app => app
        .use(DatabaseController)
        .use(ServerController)
    )

export default Command