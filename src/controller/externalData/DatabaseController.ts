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
    .get(
        '/:id/query-object-database.json',
        ({ params: { id }, query }) => DatabaseFacade.getQueryObject(id, query),
        {
            params: CommonModel.IntegerIdModel,
            query: CommonModel.TableModel
        }
    )
    .get(
        '/:id/query-whitelist-database.json',
        ({ params: { id }, query }) => DatabaseFacade.getQueryWhitelist(id, query),
        {
            params: CommonModel.IntegerIdModel,
            query: CommonModel.TableModel
        }
    )
    .patch(
        '/:id/:objectIdentity/query-exact-data-database.json',
        ({ request, params: { id, objectIdentity } }) => DatabaseFacade.runQueryExactData(request, id, objectIdentity),
        {
            params: t.Object({
                id: t.Numeric(),
                objectIdentity: t.String({
                    format: "regex",
                    pattern: "^\\w+$|^[0-9]{16}$"
                }),
            }),
        }
    )
    .get(
        '/:id/:externalDatabaseQueryTypeId/query-exact-data-database.json',
        ({ request, params: { id, externalDatabaseQueryTypeId }, query: { start, length } }) => DatabaseFacade.getQueryExactData(request, id, externalDatabaseQueryTypeId, start, length),
        {
            params: t.Object({
                id: t.Numeric(),
                externalDatabaseQueryTypeId: t.String({
                    format: "regex",
                    pattern: "^\\w+$|^[0-9]{16}$"
                }),
            }),
            query: t.Object({
                start: t.Number(),
                length: t.Number(),
            })
        }
    )
    .get(
        "/:id/:externalDatabaseQueryTypeId/:content/insert/:includeColumnNameFlag/:numberOfLinePerAction/database-query-sql.json",
        ({ params: { id, externalDatabaseQueryTypeId, content, includeColumnNameFlag, numberOfLinePerAction } }) => DatabaseFacade.getQueryInsertSql(id, externalDatabaseQueryTypeId, content, includeColumnNameFlag, numberOfLinePerAction),
        {
            params: t.Object({
                id: t.Number(),
                externalDatabaseQueryTypeId: t.Number(),
                content: t.String(),
                includeColumnNameFlag: t.Number(),
                numberOfLinePerAction: t.Number(),
            })
        }
    )
    .get(
        "/:id/:externalDatabaseQueryTypeId/:content/update/:multipleLineFlag/:firstAmountConditioned/database-query-sql.json",
        ({ params: { id, externalDatabaseQueryTypeId, content, multipleLineFlag, firstAmountConditioned } }) => DatabaseFacade.getQueryUpdateSql(id, externalDatabaseQueryTypeId, content, multipleLineFlag, firstAmountConditioned),
        {
            params: t.Object({
                id: t.Number(),
                externalDatabaseQueryTypeId: t.Number(),
                content: t.String(),
                multipleLineFlag: t.Number(),
                firstAmountConditioned: t.Number(),
            })
        }
    )
    .get(
        "/:id/:externalDatabaseQueryTypeId/:content/:headerFlag/:delimiter/database-query-csv.json",
        ({ params: { id, externalDatabaseQueryTypeId, content, headerFlag, delimiter } }) => DatabaseFacade.getQueryCsv(id, externalDatabaseQueryTypeId, content, headerFlag, delimiter),
        {
            params: t.Object({
                id: t.Number(),
                externalDatabaseQueryTypeId: t.Number(),
                content: t.String(),
                headerFlag: t.Number(),
                delimiter: t.String(),
            })
        }
    )
    .get(
        "/:id/:externalDatabaseQueryTypeId/:content/database-query-json.json",
        ({ params: { id, externalDatabaseQueryTypeId, content } }) => DatabaseFacade.getQueryJson(id, externalDatabaseQueryTypeId, content),
        {
            params: t.Object({
                id: t.Number(),
                externalDatabaseQueryTypeId: t.Number(),
                content: t.String(),
            })
        }
    )
    .get(
        "/:id/:externalDatabaseQueryTypeId/:content/database-query-xml.json",
        ({ params: { id, externalDatabaseQueryTypeId, content } }) => DatabaseFacade.getQueryXml(id, externalDatabaseQueryTypeId, content),
        {
            params: t.Object({
                id: t.Number(),
                externalDatabaseQueryTypeId: t.Number(),
                content: t.String(),
            })
        }
    )

export default DatabaseController