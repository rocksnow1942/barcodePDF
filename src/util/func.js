import dayjs from "dayjs";

export const randomChar = () => {
    const s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz';
    return s[Math.floor(Math.random() * s.length)];
}


export const codeFormatter = (format) =>{
    let withDate = dayjs().format(format).split('')
    withDate.forEach((item, index) => {
        if(item==='X') {
            withDate[index] = randomChar()
        }
    })
    return withDate.join('')
}

