import Elysia from "elysia"
import LanguageController from "../controller/command/Language"

const Command = new Elysia({})
    .group("/command", app => app
        .use(LanguageController)
    )

export default Command