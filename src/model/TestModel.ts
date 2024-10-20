import { t } from 'elysia'

export const ExampleTemplateModel = t.Object({
    name: t.String({
        minLength: 3,
        maxLength: 100,
    }),
    description: t.String({
        minLength: 3,
        maxLength: 1000,
    }),
    value: t.Number(),
    amount: t.Number(),
    date: t.String({
        format: 'date'
    }),
    // foreignId: t.Number({
    //     minimum: 1000000000000000,
    //     maximum: 9999999999999999
    // })
    activeFlag: t.Number({
        minimum: 0,
        maximum: 1
    }),
    version: t.Number({
        default: 0,
    })
})