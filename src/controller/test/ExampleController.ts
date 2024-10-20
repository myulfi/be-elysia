import Elysia from "elysia"
import * as CommonModel from "../../model/CommonModel"
import * as TestModel from "../../model/TestModel"
import * as ExampleTemplateFacade from "../../facade/test/ExampleTemplateFacade"

const ExampleTemplateController = new Elysia({})
    .get(
        "/example-template.json",
        ({ query }) => ExampleTemplateFacade.get(query),
        { query: CommonModel.TableModel }
    )
    .get(
        "/:id/example-template.json",
        ({ params: { id } }) => ExampleTemplateFacade.getById(id),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/example-template.json",
        ({ request, body }) => ExampleTemplateFacade.create(request, body),
        { body: TestModel.ExampleTemplateModel }
    )
    .patch("/:id/example-template.json",
        ({ request, params: { id }, body }) => ExampleTemplateFacade.update(request, id, body),
        {
            params: CommonModel.NumericIdModel,
            body: TestModel.ExampleTemplateModel
        }
    )
    .delete(
        '/:ids/example-template.json',
        ({ request, params: { ids } }) => ExampleTemplateFacade.remove(request, ids),
        { params: CommonModel.NumericIdArrayModel }
    )

export default ExampleTemplateController