import Elysia, { t } from "elysia"
import * as MainFacade from "../facade/MainFacade"

const Main = new Elysia({})
    .group("/main", app => app
        .post("/remove-token.json", ({ request }) => MainFacade.logout(request))
        .patch(
            "/change-password.json",
            ({ request, body }) => MainFacade.changePassword(
                request,
                body as {
                    oldPassword: string;
                    newPassword: string;
                }
            ),
            {
                body: t.Object({
                    oldPassword: t.String(),
                    newPassword: t.String(),
                })
            }
        )
        .get("/role.json", () => MainFacade.json())
        .get("/menu.json", ({ request }) => MainFacade.menu(request))
    )

export default Main