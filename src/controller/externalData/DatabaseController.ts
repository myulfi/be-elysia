import Elysia, { t } from "elysia"
import * as CommonModel from "../../model/CommonModel"
import * as ExternalModel from "../../model/ExternalModel"
import * as DatabaseFacade from "../../facade/externalData/DatabaseFacade"

const DatabaseController = new Elysia({})
    .get(
        "/database.json",
        ({ query }) => DatabaseFacade.get(query),
        { query: CommonModel.TableModel }
    )
    .get(
        "/:id/database.json",
        ({ params: { id } }) => DatabaseFacade.getById(id),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/database.json",
        ({ request, body }) => DatabaseFacade.create(request, body),
        { body: ExternalModel.DatabaseModel }
    )
    .patch("/:id/database.json",
        ({ request, params: { id }, body }) => DatabaseFacade.update(request, id, body),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.DatabaseModel
        }
    )
    .delete(
        '/:ids/database.json',
        ({ request, params: { ids } }) => DatabaseFacade.remove(request, ids),
        { params: CommonModel.NumericIdArrayModel }
    )
    .patch(
        '/:id/unlock-database.json',
        ({ request, params: { id } }) => DatabaseFacade.unlock(request, id),
        { params: CommonModel.IntegerIdModel }
    )
    .patch(
        '/:id/lock-database.json',
        ({ request, params: { id } }) => DatabaseFacade.lock(request, id),
        { params: CommonModel.IntegerIdModel }
    )
    .get(
        '/:id/test-connetion-database.json',
        ({ params: { id } }) => DatabaseFacade.testConnection(id),
        { params: CommonModel.IntegerIdModel }
    )
    .patch(
        '/:id/query-manual-database.json',
        ({ request, params: { id }, body }) => DatabaseFacade.runQueryManual(request, id, 0, body.query),
        {
            params: CommonModel.IntegerIdModel,
            body: ExternalModel.DatabaseQueryString
        }
    )
    .get(
        '/:id/query-manual-database.json',
        ({ request, params: { id }, query: { start, length } }) => DatabaseFacade.getQueryManual(request, id, start, length),
        {
            params: CommonModel.IntegerIdModel,
            query: t.Object({
                start: t.Number(),
                length: t.Number(),
            })
        }
    )

export default DatabaseController