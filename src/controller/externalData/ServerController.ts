import Elysia, { t } from "elysia"
import * as CommonModel from "../../model/CommonModel"
import * as ExternalModel from "../../model/ExternalModel"
import * as ServerFacade from "../../facade/externalData/ServerFacade"

const ServerController = new Elysia({})
    .get(
        "/server.json",
        ({ query }) => ServerFacade.get(query),
        { query: CommonModel.TableModel }
    )
    .get(
        "/:id/server.json",
        ({ params: { id } }) => ServerFacade.getById(id),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/server.json",
        ({ request, body }) => ServerFacade.create(request, body),
        { body: ExternalModel.ServerModel }
    )
    .patch("/:id/server.json",
        ({ request, params: { id }, body }) => ServerFacade.update(request, id, body),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerModel
        }
    )
    .delete(
        '/:ids/server.json',
        ({ request, params: { ids } }) => ServerFacade.remove(request, ids),
        { params: CommonModel.NumericIdArrayModel }
    )
    .get(
        "/:id/server-default-directory.json",
        ({ params: { id } }) => ServerFacade.getDefaultDirectoryById(id),
        { params: CommonModel.NumericIdModel }
    )
    .get(
        "/:id/server-directory.json",
        ({ params: { id }, query }) => ServerFacade.getDirectory(id, query),
        { params: CommonModel.NumericIdModel }
    )

export default ServerController