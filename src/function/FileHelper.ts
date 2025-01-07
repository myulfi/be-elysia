import fs from "fs"
import path from "path"
import * as RegexConstants from "../constants/RegexConstants"

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
    const fileContent = fs.readFileSync(filePath)
    return fileContent
}

export async function remove(filePath: string) {
    const stats = await fs.promises.stat(filePath)
    if (stats.isDirectory()) {
        const aa = fs.promises.rmdir(filePath)
    } else {
        fs.unlinkSync(filePath)
    }
}

export function renameFileautomatically(name: string) {
    const match = name.match(RegexConstants.FILE_NAME)
    if (match) {
        const baseName = match[1];
        const copyNumber = match[2] !== undefined ? parseInt(match[2], 10) : (name.includes("copy") ? 1 : 0)
        const extension = match[3] || ''
        if (copyNumber > 0) {
            return `${baseName} copy_${copyNumber + 1}${extension.length > 1 ? "." + extension : ""}`
        } else {
            return `${baseName} copy${extension.length > 1 ? "." + extension : ""}`
        }
    } else {
        return name
    }
}