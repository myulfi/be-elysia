export function formatDate(date: Date, format: string): string {
    const year = date.getFullYear().toString()
    const fullMonthNameArray = ['January', 'February', 'March', 'April', 'May', 'Juny', 'July', 'August', 'September', 'October', 'November', 'December']
    const monthNameArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    return format
        .replace('yyyy', year)
        .replace('MMMM', fullMonthNameArray[Number(month) - 1])
        .replace('MMM', monthNameArray[Number(month) - 1])
        .replace('MM', month)
        .replace('dd', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
}

export function getDate(dateString: string, format: string): Date {
    const indexYear = format.indexOf("yyyy")
    const indexMonth = format.indexOf("MM")
    const indexDay = format.indexOf("dd")
    const indexHour = format.indexOf("HH")
    const indexMinute = format.indexOf("mm")
    const indexSecond = format.indexOf("ss")

    const year = indexYear >= 0 ? Number(dateString.substring(indexYear, indexYear + 4)) : 0
    const month = indexMonth >= 0 ? Number(dateString.substring(indexMonth, indexMonth + 2)) - 1 : 0
    const day = indexDay >= 0 ? Number(dateString.substring(indexDay, indexDay + 2)) : 0
    const hour = indexHour >= 0 ? Number(dateString.substring(indexHour, indexHour + 2)) : 0
    const minute = indexMinute >= 0 ? Number(dateString.substring(indexMinute, indexMinute + 2)) : 0
    const second = indexSecond >= 0 ? Number(dateString.substring(indexSecond, indexSecond + 2)) : 0

    return new Date(year, month, day, hour + Number(Bun.env.TIMEZONE), minute, second)
}

export function getCurrentDate(): Date {
    var current = getCurrentDateTime()
    current.setHours(current.getHours() + Number(Bun.env.TIMEZONE))
    return current
}

export function getCurrentDateTime(): Date {
    return new Date()
}