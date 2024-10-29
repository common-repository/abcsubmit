/**
 * BEGIN: ABCSubmit Cookie Runtime
 * DO NOT DELETE THIS FILE. THIS FILE IS NEEDED BY NON-TYPESCRIPT PARTS OF THE PLATFORM
 * (c) 2018 www.abcsubmit.com
 */

var wp_escape_cookie_value = function (cookieValue) {

    if (!cookieValue) {
        return "";
    }

    var result = "", ESCAPE_CHAR = ".", CHR_EQUAL = 1, CHR_QUOTE = 2, CHR_SEMICOLON = 3, CHR_NEW_LINE = 5,
        CHR_LINE_FEED = 6, CHR_TAB = 7, CHR_SPACE = 8;

    for (let i = 0, len = cookieValue.length; i < len; i++) {

        switch (cookieValue.charAt(i)) {

            case '=':
                result += ESCAPE_CHAR + CHR_EQUAL;
                break;
            case '"':
                result += ESCAPE_CHAR + CHR_QUOTE;
                break;
            case ';':
                result += ESCAPE_CHAR + CHR_SEMICOLON;
                break;
            case ESCAPE_CHAR:
                result += ESCAPE_CHAR + ESCAPE_CHAR;
                break;
            case '\n':
                result += ESCAPE_CHAR + CHR_NEW_LINE;
                break;
            case '\r':
                result += ESCAPE_CHAR + CHR_LINE_FEED;
                break;
            case '\t':
                result += ESCAPE_CHAR + CHR_TAB;
                break;
            case ' ':
                result += ESCAPE_CHAR + CHR_SPACE;
                break;
            default:
                result += cookieValue.charAt(i);
                break;
        }
    }

    return result;
};

var wp_unescape_cookie_value = function (escapedCookieValue) {

    if (!escapedCookieValue) {
        return "";
    }

    var result = "", ESCAPE_CHAR = ".", CHR_EQUAL = 1, CHR_QUOTE = 2, CHR_SEMICOLON = 3, CHR_NEW_LINE = 5,
        CHR_LINE_FEED = 6, CHR_TAB = 7, CHR_SPACE = 8;

    for (var i = 0, len = escapedCookieValue.length; i < len; i++) {

        switch (escapedCookieValue.charAt(i)) {

            case ESCAPE_CHAR:

                let nextChar = escapedCookieValue.charAt(i + 1);

                if (nextChar) {

                    switch (nextChar) {

                        case String(CHR_EQUAL):
                            result += "=";
                            i++;
                            break;

                        case String(CHR_QUOTE):
                            result += "\"";
                            i++;
                            break;

                        case String(CHR_SEMICOLON):
                            result += ";";
                            i++;
                            break;

                        case ESCAPE_CHAR:
                            result += ESCAPE_CHAR;
                            i++;
                            break;

                        case String(CHR_NEW_LINE):
                            result += "\n";
                            i++;
                            break;

                        case String(CHR_LINE_FEED):
                            result += "\r";
                            i++;
                            break;

                        case String(CHR_TAB):
                            result += "\t";
                            i++;
                            break;

                        case String(CHR_SPACE):
                            result += " ";
                            i++;
                            break;

                        default:
                            result += ESCAPE_CHAR;
                            break;
                    }

                } else {

                    result += ESCAPE_CHAR;

                }

                break;

            default:

                result += escapedCookieValue.charAt(i);

                break;

        }

    }

    return result;

};

var wp_get_parsed_cookies = function () {

    var result = {}, unparsedCookies = document.cookie.split(";");

    for (var i = 0, len = unparsedCookies.length; i < len; i++) {

        unparsedCookies[i] = unparsedCookies[i].replace(/^[\s]+|[\s]+$/g, "");

        if (!unparsedCookies[i]) {
            continue;
        }

        var cookieParts = unparsedCookies[i].split("="),
            cookieName = (cookieParts[0] || "").replace(/^[\s]+|[\s]+$/g, ""),
            cookieValue = (cookieParts[1] || "").replace(/^[\s]+|[\s]+$/g, "");

        if (cookieName) {
            result[wp_unescape_cookie_value(cookieName)] = wp_unescape_cookie_value(cookieValue);
        }

    }

    return result;

};

var wp_cookie_exists = function (cookieName) {

    let parsedCookies = wp_get_parsed_cookies();

    return undefined !== parsedCookies[cookieName];

};

var wp_delete_cookie = function (cookieName) {

    if (wp_cookie_exists(cookieName)) {

        document.cookie = wp_escape_cookie_value(cookieName) + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=" + (window.location.hostname) + ";path=/";

        return undefined === wp_get_parsed_cookies()[wp_escape_cookie_value(cookieName)];

    }

    return true;
};

var wp_get_cookie = function (cookieName) {

    let parsedCookies = wp_get_parsed_cookies();

    return parsedCookies[cookieName] || null;

};

var wp_set_cookie = function (cookieName, cookieValue) {


    if (!cookieValue) {
        wp_delete_cookie(cookieValue);
    }

    var cookieData = wp_escape_cookie_value(cookieName) + "=" + wp_escape_cookie_value(cookieValue),
        expirationDate = new Date();

    expirationDate.setFullYear(expirationDate.getFullYear() + 10);
    cookieData = cookieData + ";expires=" + expirationDate + ";domain=" + (window.location.hostname) + ";path=/";

    if (wp_cookie_exists(cookieName)) {
        wp_delete_cookie(cookieName);
    }

    document.cookie = cookieData;

    return wp_get_cookie(cookieName) === cookieValue;

};

/**
 * END: ABCSubmit Cookie Runtime
 */