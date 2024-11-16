import Elysia from "elysia"
import DatabaseController from "../controller/externalData/DatabaseController"

const Command = new Elysia({})
    .group("/external", app => app
        .use(DatabaseController)
    )

export default Command