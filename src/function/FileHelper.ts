import fs from 'fs'
import path from 'path'

export async function save(folder: string, file: File): Promise<string> {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })
    const filePath = path.join(folder, file.name)
    const fileStream = fs.createWriteStream(filePath)
    const buffer = await file.arrayBuffer()
    fileStream.write(Buffer.from(buffer))
    fileStream.end()
    return filePath
}

export function append(folder: string, fileName: string, content: string) {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })
    const filePath = path.join(folder, fileName)
    fs.appendFileSync(filePath, content)
}

export function clearContent(filePath: string) {
    fs.truncate(filePath, 0, () => { })
}

export function get(filePath: string) {
    const fileContent = fs.readFileSync(filePath, { encoding: "utf8" })
    return fileContent
}

export function getImage(filePath: string) {
    const fileContent = fs.readFileSync(filePath);
    return fileContent
}

export function remove(filePath: string) {
    fs.unlinkSync(filePath)
}