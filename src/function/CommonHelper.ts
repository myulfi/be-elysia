export function formatMoney(value: number): string {
    return value.toString().replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export function splitId(ids: string): Array<bigint> {
    const idArray = []
    for (let i = 0; i < ids.length; i += 16) {
        idArray.push(BigInt(ids.substring(i, i + 16)))
    }
    return idArray
}

export function jsonParse(data: object) {
    return JSON.parse(JSON.stringify(
        data,
        (_, value) => (typeof value === "bigint" ? Number(value) : value)
    ))
}

export function generateId() {
    return Number(Date.now() + Math.floor(Math.random() * (Math.ceil(999) - Math.ceil(1) + 1) + 1).toString().padStart(3, "0"))
}

export function formatMessage(template: string, values: any) {
    return template.replace(/{(\w+)}/g, (placeholder, key) => values[key] || placeholder);
}

export function numberToColumn(n: number) {
    let column = ""
    while (n > 0) {
        column = String.fromCharCode(65 + ((n - 1) % 26)) + column
        n = Math.floor((n - 1) / 26)
    }
    return column
}