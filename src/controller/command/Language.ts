import Elysia from "elysia"
import * as CommonModel from "../../model/CommonModel"
import * as CommandModel from "../../model/CommandModel"
import * as LanguageFacade from "../../facade/command/Language"

const LanguageController = new Elysia({})
    .get(
        "/language.json",
        ({ query }) => LanguageFacade.get(query),
        { query: CommonModel.TableModel }
    )
    .get(
        "/:id/language.json",
        ({ params: { id } }) => LanguageFacade.getById(id),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/language.json",
        ({ request, body }) => LanguageFacade.create(request, body),
        { body: CommandModel.LanguageModel }
    )
    .patch("/:id/language.json",
        ({ request, params: { id }, body }) => LanguageFacade.update(request, id, body),
        {
            params: CommonModel.NumericIdModel,
            body: CommandModel.LanguageModel
        }
    )
    .put("/implement-language.json", () => LanguageFacade.implement())
    .delete(
        '/:ids/language.json',
        ({ request, params: { ids } }) => LanguageFacade.remove(request, ids),
        { params: CommonModel.NumericIdArrayModel }
    )

export default LanguageController