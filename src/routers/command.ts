import Elysia, { t } from "elysia";
import { menu } from "../controller/CommandController";

const Command = new Elysia({})
    .group("/command", app => app
        .get(
            '/menu.json'
            , ({ }) => menu()
        )
    );

export default Command;