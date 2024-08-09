export function jsonParse(data: object) {
    return JSON.parse(JSON.stringify(
        data,
        (key, value) => (typeof value === "bigint" ? Number(value) : value)
    ));
}

export function generateId() {
    return Number(Date.now() + Math.floor(Math.random() * (Math.ceil(999) - Math.ceil(1) + 1) + 1).toString().padStart(3, "0"))
}