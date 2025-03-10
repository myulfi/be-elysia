import Elysia, { t } from "elysia"
import * as CommonModel from "../../model/CommonModel"
import * as ExternalModel from "../../model/ExternalModel"
import * as ServerFacade from "../../facade/externalData/ServerFacade"

const ServerController = new Elysia({})
    .get(
        "/server.json",
        ({ query, error }) => ServerFacade.get(query, error),
        { query: CommonModel.TableModel }
    )
    .get(
        "/:id/server.json",
        ({ params: { id }, error }) => ServerFacade.getById(id, error),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/server.json",
        ({ request, body, error }) => ServerFacade.create(request, body, error),
        { body: ExternalModel.ServerModel }
    )
    .patch("/:id/server.json",
        ({ request, params: { id }, body, error }) => ServerFacade.update(request, id, body, error),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerModel
        }
    )
    .delete(
        '/:ids/server.json',
        ({ request, params: { ids }, error }) => ServerFacade.remove(request, ids, error),
        { params: CommonModel.NumericIdArrayModel }
    )
    .get(
        "/:id/server-shortcut.json",
        ({ params: { id }, query, error }) => ServerFacade.getShortcut(id, error),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/:id/server-shortcut.json",
        ({ request, params: { id }, body, error }) => ServerFacade.createShortcut(request, id, body, error),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerDirectoryModel
        }
    )
    .delete(
        '/:ids/server-shortcut.json',
        ({ request, params: { ids }, error }) => ServerFacade.removeShorcut(request, ids, error),
        { params: CommonModel.NumericIdArrayModel }
    )
    .get(
        "/:id/server-default-directory.json",
        ({ params: { id }, error }) => ServerFacade.getDefaultDirectoryById(id, error),
        { params: CommonModel.NumericIdModel }
    )
    .get(
        "/:id/server-directory.json",
        ({ params: { id }, query }) => ServerFacade.getDirectory(id, query),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/:id/server-directory.json",
        ({ params: { id }, body, error }) => ServerFacade.createDirectory(id, body, error),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerDirectoryModel
        }
    )
    .patch(
        "/:id/server-rename-directory-file.json",
        ({ params: { id }, body, error }) => ServerFacade.renameDirectoryFile(id, body, error),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerDirectoryFileModel
        }
    )
    .patch(
        "/:id/server-paste-directory-file.json",
        ({ params: { id }, body, error }) => ServerFacade.pasteDirectoryFile(id, body, error),
        {
            params: CommonModel.IntegerIdModel,
            body: ExternalModel.ServerPasteDirectoryFileModel
        }
    )
    .patch(
        "/:id/server-delete-directory-file.json",
        ({ params: { id }, body, error }) => ServerFacade.removeDirectoryFile(id, body, error),
        {
            params: CommonModel.IntegerIdModel,
            body: ExternalModel.ServerRemoveDirectoryFileModel
        }
    )
    .get(
        "/:id/server-file.json",
        ({ params: { id }, query, error }) => ServerFacade.getFile(id, query, error),
        {
            params: CommonModel.NumericIdModel,
            query: ExternalModel.ServerFileModel
        }
    )
    .post(
        "/:id/server-file.json",
        ({ params: { id }, body, error }) => ServerFacade.createFile(id, body, error),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerFileModel
        }
    )
    .patch("/:id/server-file.json",
        ({ params: { id }, body, error }) => ServerFacade.updateFile(id, body, error),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerFileModel
        }
    )
    .post(
        "/:id/server-upload-file.json",
        ({ params: { id }, body, error }) => ServerFacade.uploadFile(id, body, error),
        {
            params: CommonModel.NumericIdModel,
            body: ExternalModel.ServerUploadFileModel
        }
    )
export default ServerController