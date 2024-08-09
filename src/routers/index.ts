//import elysia
import { Elysia, t } from 'elysia';
import { bearer } from '@elysiajs/bearer'
import jwt from "@elysiajs/jwt";

//import controller
import { createExampleTemplate, deleteExampleTemplate, getExampleTemplateById, getExampleTemplates, updateExampleTemplate } from '../controller/ExampleTemplateController';

const Routes = new Elysia({ prefix: '/example-template' })
    .guard(
        {
            async beforeHandle({ jwt, request, set }: any) {
                const result = await jwt.verify(request.headers.get("authorization").substr("Bearer".length).trim());
                if (result == false) {
                    set.status = 401;
                    return 'Invalid Token'
                }
            }
        }
        , app => app
            .get('/', () => getExampleTemplates)
            .post(
                '/'
                , ({ body }) => createExampleTemplate(
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
                        , value: t.Number()
                        , amount: t.Number()
                        , date: t.String({
                            format: 'date'
                        })
                        // , foreignId: t.Number({
                        //     minimum: 1000000000000000
                        //     , maximum: 9999999999999999
                        // })
                        , activeFlag: t.Number({
                            minimum: 0
                            , maximum: 1
                        })
                    })
                })
            .get('/:id', ({ params: { id } }) => getExampleTemplateById(Number(id)))
            .patch(
                '/:id'
                , ({ params: { id }, body }) => updateExampleTemplate(
                    Number(id)
                    , body as {
                        name: string;
                        description: string;
                        // value: number;
                        // amount: number;
                        // date: string;
                        // foreignId: number;
                        // activeFlag: number;
                        version: number;
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
                        // , value: t.Number()
                        // , amount: t.Number()
                        // , date: t.String({
                        //     format: 'date'
                        // })
                        // , foreignId: t.Number({
                        //     minimum: 1000000000000000
                        //     , maximum: 9999999999999999
                        // })
                        // , activeFlag: t.Number({
                        //     minimum: 0
                        //     , maximum: 1
                        // })
                        , version: t.Number()
                    })
                })
            .delete('/:id', ({ params: { id } }) => deleteExampleTemplate(id))
    );

export default Routes;