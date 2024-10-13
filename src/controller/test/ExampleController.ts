import Elysia from "elysia"
import * as CommonModel from "../../model/commonModel"
import * as TestModel from "../../model/TestModel"
import * as ExampleTemplateFacade from "../../facade/test/ExampleTemplateFacade"

const ExampleTemplateController = new Elysia({})
    .get(
        '/example-template.json',
        ({ query: { start, length, search, orderColumn, orderDir } }) => ExampleTemplateFacade.get(
            start, length, search, orderColumn, orderDir
        ),
        { query: CommonModel.PagingModel }
    )
    .get(
        '/:id/example-template.json',
        ({ params: { id } }) => ExampleTemplateFacade.getById(
            id
        ),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        '/example-template.json'
        , ({ request, body }) => ExampleTemplateFacade.create(
            request,
            body as {
                name: string;
                description: string;
                value: number;
                amount: number;
                date: string;
                foreignId: number;
                activeFlag: number;
            }
        )
        , { body: TestModel.ExampleTemplateModel }
    )
    .patch(
        '/:id/example-template.json',
        ({ request, params: { id }, body }) => ExampleTemplateFacade.update(
            request,
            id,
            body as {
                name: string;
                description: string;
                value: number;
                amount: number;
                date: string;
                // foreignId: number;
                activeFlag: number;
                version: number;
            }
        ),
        {
            params: CommonModel.NumericIdModel,
            body: TestModel.ExampleTemplateModel
        })
    .delete(
        '/:ids',
        ({ request, params: { ids } }) => ExampleTemplateFacade.remove(
            request,
            ids
        ),
        { params: CommonModel.NumericIdArrayModel }
    )

export default ExampleTemplateController