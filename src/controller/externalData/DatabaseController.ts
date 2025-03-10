import Elysia, { t } from "elysia"
import * as CommonModel from "../../model/CommonModel"
import * as ExternalModel from "../../model/ExternalModel"
import * as DatabaseFacade from "../../facade/externalData/DatabaseFacade"

const DatabaseController = new Elysia({})
    .get(
        "/database.json",
        ({ query, error }) => DatabaseFacade.get(query, error),
        { query: CommonModel.TableModel }
    )
    .get(
        "/:id/database.json",
        ({ params: { id }, error }) => DatabaseFacade.getById(id, error),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/database.json",
        ({ request, body, error }) => DatabaseFacade.create(request, body, error),
        { body: ExternalModel.DatabaseModel }
    )
    .patch("/:id/database.json",
        ({ request, params: { id }, body, error }) => DatabaseFacade.update(request, id, body, error),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.DatabaseModel
        }
    )
    .delete(
        '/:ids/database.json',
        ({ request, params: { ids }, error }) => DatabaseFacade.remove(request, ids, error),
        { params: CommonModel.NumericIdArrayModel }
    )
    .patch(
        '/:id/unlock-database.json',
        ({ request, params: { id }, error }) => DatabaseFacade.unlock(request, id, error),
        { params: CommonModel.IntegerIdModel }
    )
    .patch(
        '/:id/lock-database.json',
        ({ request, params: { id }, error }) => DatabaseFacade.lock(request, id, error),
        { params: CommonModel.IntegerIdModel }
    )
    .get(
        '/:id/test-connetion-database.json',
        ({ params: { id }, error }) => DatabaseFacade.testConnection(id, error),
        { params: CommonModel.IntegerIdModel }
    )
    .patch(
        '/:id/query-manual-database.json',
        ({ request, params: { id }, body, error }) => DatabaseFacade.runQueryManual(request, id, 0, body.query, error),
        {
            params: CommonModel.IntegerIdModel,
            body: ExternalModel.DatabaseQueryString
        }
    )
    .get(
        '/:id/query-manual-database.json',
        ({ request, params: { id }, query: { start, length }, error }) => DatabaseFacade.getQueryManual(request, id, start, length, error),
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
        ({ params: { id }, query, error }) => DatabaseFacade.getQueryObject(id, query, error),
        {
            params: CommonModel.IntegerIdModel,
            query: CommonModel.TableModel
        }
    )
    .get(
        '/:id/query-whitelist-database.json',
        ({ params: { id }, query, error }) => DatabaseFacade.getQueryWhitelist(id, query, error),
        {
            params: CommonModel.IntegerIdModel,
            query: CommonModel.TableModel
        }
    )
    .post(
        "/query-whitelist-database.json",
        ({ request, body, error }) => DatabaseFacade.createQueryWhitelist(request, body, error),
        { body: ExternalModel.DatabaseQueryWhitelist }
    )
    .delete(
        '/:ids/:externalDatabaseId/query-whitelist-database.json',
        ({ request, params: { ids, externalDatabaseId }, error }) => DatabaseFacade.removeQueryWhitelist(request, ids, externalDatabaseId, error),
        {
            params: t.Object({
                ids: t.String({
                    format: "regex",
                    pattern: "^\\d{16}(?:\\d{16})*$",
                }),
                externalDatabaseId: t.Number(),
            })
        }
    )
    .patch(
        '/:id/:objectIdentity/query-exact-data-database.json',
        ({ request, params: { id, objectIdentity }, error }) => DatabaseFacade.runQueryExactData(request, id, objectIdentity, error),
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
        ({ request, params: { id, externalDatabaseQueryTypeId }, query: { start, length }, error }) => DatabaseFacade.getQueryExactData(request, id, externalDatabaseQueryTypeId, start, length, error),
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
        ({ params: { id, externalDatabaseQueryTypeId, content, includeColumnNameFlag, numberOfLinePerAction }, error }) => DatabaseFacade.getQueryInsertSql(id, externalDatabaseQueryTypeId, content, includeColumnNameFlag, numberOfLinePerAction, error),
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
        ({ params: { id, externalDatabaseQueryTypeId, content, multipleLineFlag, firstAmountConditioned }, error }) => DatabaseFacade.getQueryUpdateSql(id, externalDatabaseQueryTypeId, content, multipleLineFlag, firstAmountConditioned, error),
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
        ({ params: { id, externalDatabaseQueryTypeId, content, headerFlag, delimiter }, error }) => DatabaseFacade.getQueryCsv(id, externalDatabaseQueryTypeId, content, headerFlag, delimiter, error),
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
        ({ params: { id, externalDatabaseQueryTypeId, content }, error }) => DatabaseFacade.getQueryJson(id, externalDatabaseQueryTypeId, content, error),
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
        ({ params: { id, externalDatabaseQueryTypeId, content }, error }) => DatabaseFacade.getQueryXml(id, externalDatabaseQueryTypeId, content, error),
        {
            params: t.Object({
                id: t.Number(),
                externalDatabaseQueryTypeId: t.Number(),
                content: t.String(),
            })
        }
    )

export default DatabaseController