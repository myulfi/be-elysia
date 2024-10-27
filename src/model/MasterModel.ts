import { t } from 'elysia'

export const MasterBranchModel = t.Object({
    name: t.String({
        minLength: 1,
        maxLength: 20,
    }),
    address: t.String({
        minLength: 1,
        maxLength: 100,
    }),
    latitude: t.Numeric(),
    longitude: t.Numeric(),
    radius: t.Number(),
    version: t.Number({
        default: 0,
    })
})