import dayjs from "dayjs";

export const randomChar = (mode) => {
    let s;
    switch (mode) {
        case '&':
            s = 'abcdefghijklmnopqrstuvwxyz'
            break
        case '%':
            s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            break
        case '#':
            s = '0123456789'
            break
        case '*':
            s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            break
        case '@':
            s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
            break
        case '?':
            s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            break        
        default:
            s = mode
            break
    }    
    return s[Math.floor(Math.random() * s.length)];
}


export const codeFormatter = (format,index=0) =>{
    let f = format
    if (format.match(/\[(\d+)\]/)) {
        const s = format.match(/\[(\d+)\]/)[1]
        f = format.replace(/\[(\d+)\]/, (parseInt(s)+index).toString().padStart(s.length, '0'))
    }

    let withDate = dayjs().format(f).split('')
    withDate.forEach((item, index) => {
        withDate[index] = randomChar(item)
    })
    return withDate.join('')
}

