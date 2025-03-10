import Elysia, { t } from "elysia"
import * as MainFacade from "../facade/MainFacade"

const Main = new Elysia({})
    .group("/main", app => app
        .get("/profile.json", ({ request, error }) => MainFacade.profile(request, error))
        .get("/branch.json", ({ request, error }) => MainFacade.branch(request, error))
        .post("/remove-token.json", ({ request, error }) => MainFacade.logout(request, error))
        .patch(
            "/change-password.json",
            ({ request, body, error }) => MainFacade.changePassword(
                request,
                body as {
                    oldPassword: string;
                    newPassword: string;
                },
                error
            ),
            {
                body: t.Object({
                    oldPassword: t.String(),
                    newPassword: t.String(),
                })
            }
        )
        .get("/role.json", (error) => MainFacade.json(error))
        .get("/menu.json", ({ request, error }) => MainFacade.menu(request, error))
    )

export default Main