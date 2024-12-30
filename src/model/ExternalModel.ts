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

export const DatabaseQueryString = t.Object({
    query: t.String({
        minLength: 1,
    })
})

export const DatabaseQueryWhitelist = t.Object({
    description: t.String({
        minLength: 1,
        maxLength: 800,
    }),
    queryManualId: t.Numeric({
        format: "regex",
        pattern: "^[0-9]{16}$"
    }),
})

export const ServerModel = t.Object({
    code: t.String({
        minLength: 1,
        maxLength: 20,
    }),
    description: t.String({
        minLength: 1,
        maxLength: 500,
    }),
    ip: t.String({
        minLength: 1,
        maxLength: 15,
    }),
    port: t.Number({ minimum: 1 }),
    username: t.String({
        minLength: 1,
        maxLength: 200,
    }),
    password: t.String({
        minLength: 1,
        maxLength: 200,
    }),
    privateKey: t.String({
        minLength: 1,
    }),
    version: t.Number({
        default: 0,
    })
})

export const ServerDirectoryModel = t.Object({
    name: t.String({
        minLength: 1,
    }),
    directory: t.String({
        minLength: 1,
    }),
})

export const ServerDirectoryFileModel = t.Object({
    name: t.String({
        minLength: 1,
    }),
    oldName: t.String({
        minLength: 1,
        maxLength: 500,
    }),
    directory: t.String({
        minLength: 1,
    }),
})

export const ServerFileModel = t.Object({
    name: t.String({
        minLength: 1,
    }),
    content: t.String({
        minLength: 1,
    }),
    directory: t.String({
        minLength: 1,
    }),
})