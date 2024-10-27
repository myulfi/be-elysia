import Elysia from "elysia"
import LanguageController from "../controller/command/LanguageController"

const Command = new Elysia({})
    .group("/command", app => app
        .use(LanguageController)
    )

export default Command