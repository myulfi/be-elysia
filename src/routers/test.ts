import Elysia, { t } from "elysia";
import { createExampleTemplate, deleteExampleTemplate, getExampleTemplateById, getExampleTemplates, updateExampleTemplate } from "../controller/ExampleTemplateController";

const Test = new Elysia({})
    .group("/test", app => app
        .get(
            '/example-template.json'
            , ({ query: { start, length, search, orderColumn, orderDir, value, date, range }, request }) => getExampleTemplates(
                start, length, search, orderColumn, orderDir, value, date, range, request
            )
            , {
                query: t.Object({
                    start: t.Numeric()
                    , length: t.Numeric()
                    , search: t.String()
                    , orderColumn: t.String()
                    , orderDir: t.String({
                        format: "regex"
                        , pattern: "^(asc|desc)$"
                    })
                    , value: t.Optional(t.String())
                    , date: t.Optional(t.String())
                    , range: t.Optional(t.String())
                })
            }
        )
        .post(
            '/example-template.json'
            , ({ body }) => createExampleTemplate(
                body as {
                    name: string;
                    description: string;
                    value: number;
                    amount: number;
                    date: string;
                    foreignId: number;
                    activeFlag: number;
                    version: 0;
                }
            )
            , {
                body: t.Object({
                    name: t.String({
                        minLength: 3,
                        maxLength: 100,
                    })
                    , description: t.String({
                        minLength: 3,
                        maxLength: 1000,
                    })
                    , value: t.Numeric()
                    , amount: t.Numeric()
                    , date: t.String({
                        format: 'date'
                    })
                    // , foreignId: t.Number({
                    //     minimum: 1000000000000000
                    //     , maximum: 9999999999999999
                    // })
                    , activeFlag: t.Numeric({
                        minimum: 0
                        , maximum: 1
                    })
                    , version: t.Numeric()
                })
            })
        .get('/:id/example-template.json', ({ params: { id } }) => getExampleTemplateById(Number(id)))
        .patch(
            '/:id/example-template.json'
            , ({ params: { id }, body }) => updateExampleTemplate(
                Number(id)
                , body as {
                    id: number;
                    name: string;
                    description: string;
                    value: number;
                    amount: number;
                    date: string;
                    foreignId: number;
                    activeFlag: number;
                    version: number;
                }
            )
            , {
                body: t.Object({
                    id: t.Numeric()
                    , name: t.String({
                        minLength: 3,
                        maxLength: 100,
                    })
                    , description: t.String({
                        minLength: 3,
                        maxLength: 1000,
                    })
                    , value: t.Numeric()
                    , amount: t.Numeric()
                    , date: t.String({
                        format: 'date'
                    })
                    // , foreignId: t.Number({
                    //     minimum: 1000000000000000
                    //     , maximum: 9999999999999999
                    // })
                    , activeFlag: t.Numeric({
                        minimum: 0
                        , maximum: 1
                    })
                    , version: t.Numeric()
                })
            })
        .delete(
            '/:id/example-template.json'
            , ({ params: { id } }) => deleteExampleTemplate(id)
            , {
                params: t.Object({
                    id: t.Numeric(),
                })
            }
        )
    );

export default Test;