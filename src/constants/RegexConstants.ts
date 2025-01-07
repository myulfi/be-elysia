export const MANUAL_QUERY_BULK = "[\\s\\S]*[^;]"
export const MANUAL_QUERY = "(?!(;\\s)|(\\s))"
    + "("
    //+ "(('[^']+')"
    + "(('.+')"
    //+ "|(\\\"[^\\\"]+\\\")"
    + "|(\\\".+\\\")"
    + "|(--.*(\\r\\n|\\r|\\n))"
    + "|(\\/\\*[^\\/\\*]*\\*\\/)"
    + "|(\\s?BEGIN\\s.*(?=\\sEND))"
    + "|(\\s?BEGIN\\s[\\s\\S]*(?=\\sEND))"
    + ")"
    + "|[^;]"
    + ")*"
    + "[^;]+"
export const QUERY_PATTERN = "(SELECT)\\s+[\\s\\S]*\\s+FROM\\s+(\\S+)"
    + "|(INSERT)\\s+INTO\\s+(\\S+)"
    + "|(UPDATE)\\s+(\\S+)\\s+SET"
    + "|(DELETE)\\s+FROM\\s+(\\S+)"
    + "|((?:CREATE OR REPLACE|CREATE|REPLACE|ALTER|DROP) (?:FUNCTION|TABLE|VIEW|PROCEDURE))\\s+(\\S+)"

// export const QUERY_MANUAL = "(?si)((--.*(\r\n|\r|\n))|(\\/\\*.*\\*\\/))*\\s?{value}\\s.+"
export const QUERY_MANUAL = "^((--.*(\r\n|\r|\n))|(\\/\\*.*\\*\\/))*\\s?{value}\\s.+$"
export const MULTIPLE_SEARCH = "(\\\"[^\\\"]*\\\")|\\w+"
export const FILE_NAME = /^(.*?)(?:\s+copy(?:_(\d+))?)?(?:\.(\w+))?$/