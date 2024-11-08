import { t } from 'elysia'

export const DatabaseModel = t.Object({
    code: t.String({
        minLength: 1,
        maxLength: 20,
    }),
    description: t.String({
        minLength: 1,
        maxLength: 800,
    }),
    databaseTypeId: t.Number({ minimum: 1 }),
    username: t.String({
        minLength: 1,
        maxLength: 200,
    }),
    password: t.String({
        minLength: 1,
        maxLength: 200,
    }),
    databaseConnection: t.String({
        minLength: 1,
        maxLength: 350,
    }),
    version: t.Number({
        default: 0,
    })
})