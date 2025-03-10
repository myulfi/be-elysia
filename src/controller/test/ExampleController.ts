import Elysia from "elysia"
import * as CommonModel from "../../model/CommonModel"
import * as TestModel from "../../model/TestModel"
import * as ExampleTemplateFacade from "../../facade/test/ExampleTemplateFacade"

const ExampleTemplateController = new Elysia({})
    .get(
        "/example-template.json",
        ({ query, error }) => ExampleTemplateFacade.get(query, error),
        { query: CommonModel.TableModel }
    )
    .get(
        "/:id/example-template.json",
        ({ params: { id }, error }) => ExampleTemplateFacade.getById(id, error),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/example-template.json",
        ({ request, body, error }) => ExampleTemplateFacade.create(request, body, error),
        { body: TestModel.ExampleTemplateModel }
    )
    .patch("/:id/example-template.json",
        ({ request, params: { id }, body, error }) => ExampleTemplateFacade.update(request, id, body, error),
        {
            params: CommonModel.NumericIdModel,
            body: TestModel.ExampleTemplateModel
        }
    )
    .delete(
        '/:ids/example-template.json',
        ({ request, params: { ids }, error }) => ExampleTemplateFacade.remove(request, ids, error),
        { params: CommonModel.NumericIdArrayModel }
    )

export default ExampleTemplateController