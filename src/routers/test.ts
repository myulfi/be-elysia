import Elysia from "elysia"
import ExampleController from "../controller/test/ExampleController"

const Test = new Elysia({})
    .group("/test", app => app
        .use(ExampleController)
    )

export default Test