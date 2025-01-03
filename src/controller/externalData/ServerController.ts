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
        "/:id/server-shortcut.json",
        ({ params: { id }, query }) => ServerFacade.getShortcut(id),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/:id/server-shortcut.json",
        ({ request, params: { id }, body }) => ServerFacade.createShortcut(request, id, body),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerDirectoryModel
        }
    )
    .delete(
        '/:ids/server-shortcut.json',
        ({ request, params: { ids } }) => ServerFacade.removeShorcut(request, ids),
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
    .post(
        "/:id/server-directory.json",
        ({ params: { id }, body }) => ServerFacade.createDirectory(id, body),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerDirectoryModel
        }
    )
    .patch(
        "/:id/server-directory-file.json",
        ({ params: { id }, body }) => ServerFacade.renameDirectoryFile(id, body),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerDirectoryFileModel
        }
    )
    .patch(
        "/:id/server-directory-file.json",
        ({ params: { id }, body }) => ServerFacade.removeDirectoryFile(id, body),
        {
            params: CommonModel.IntegerIdModel,
            body: ExternalModel.ServerRemoveDirectoryFileModel
        }
    )
    .get(
        "/:id/server-file.json",
        ({ params: { id }, query }) => ServerFacade.getFile(id, query),
        {
            params: CommonModel.NumericIdModel,
            query: ExternalModel.ServerFileModel
        }
    )
    .post(
        "/:id/server-file.json",
        ({ params: { id }, body }) => ServerFacade.createFile(id, body),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerFileModel
        }
    )
    .patch("/:id/server-file.json",
        ({ params: { id }, body }) => ServerFacade.updateFile(id, body),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerFileModel
        }
    )
    .post(
        "/:id/server-upload-file.json",
        ({ params: { id }, body }) => ServerFacade.uploadFile(id, body),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerUploadFileModel
        }
    )
export default ServerController