import Elysia from "elysia"
import * as CommonModel from "../../model/CommonModel"
import * as CommandModel from "../../model/CommandModel"
import * as LanguageFacade from "../../facade/command/LanguageFacade"

const LanguageController = new Elysia({})
    .get(
        "/language.json",
        ({ query, error }) => LanguageFacade.get(query, error),
        { query: CommonModel.TableModel }
    )
    .get(
        "/:id/language.json",
        ({ params: { id }, error }) => LanguageFacade.getById(id, error),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/language.json",
        ({ request, body, error }) => LanguageFacade.create(request, body, error),
        { body: CommandModel.LanguageModel }
    )
    .patch("/:id/language.json",
        ({ request, params: { id }, body, error }) => LanguageFacade.update(request, id, body, error),
        {
            params: CommonModel.NumericIdModel,
            body: CommandModel.LanguageModel
        }
    )
    .put("/implement-language.json", ({ error }) => LanguageFacade.implement(error))
    .delete(
        '/:ids/language.json',
        ({ request, params: { ids }, error }) => LanguageFacade.remove(request, ids, error),
        { params: CommonModel.NumericIdArrayModel }
    )

export default LanguageController