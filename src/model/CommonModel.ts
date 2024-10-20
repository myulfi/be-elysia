import { t } from 'elysia'

export const NumericIdModel = t.Object({
    id: t.Numeric({
        format: "regex",
        pattern: "^[0-9]{16}$"
    }),
})

export const NumericIdArrayModel = t.Object({
    ids: t.String({
        format: "regex",
        pattern: "^\\d{16}(?:\\d{16})*$",
    }),
})

export const IntegerIdModel = t.Object({
    id: t.Numeric(),
})

export const IntegerIdArrayModel = t.Object({
    ids: t.String({
        format: "regex",
        pattern: "^\\d+(,\\d+)*$",
    }),
})

export const TablePaginationModel = t.Object({
    start: t.Number(),
    length: t.Number(),
    search: t.String(),
    orderColumn: t.String(),
    orderDir: t.String({
        format: "regex",
        pattern: "^(asc|desc)$",
    }),
})