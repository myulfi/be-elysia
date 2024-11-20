import { t } from 'elysia'

export const LanguageModel = t.Object({
    screenCode: t.String({
        minLength: 1,
        maxLength: 100,
    }),
    labelType: t.String({
        minLength: 1,
        maxLength: 100,
    }),
    keyCode: t.String({
        minLength: 1,
        maxLength: 100,
    }),
    languageValueList: t.Array(
        t.Object({
            languageId: t.Number({
                minimum: 1
            }),
            value: t.String({
                minLength: 1,
                maxLength: 150,
            }),
        })
    ),
    version: t.Number({
        default: 0,
    })
})