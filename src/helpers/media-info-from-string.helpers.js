function mediaInfoFromString(string){
    return new Promise(resolve =>{
        const regex = /\[(\d{4})\].*/;
        const match = string.match(regex);
        if (match) {
            const year = match[1];
            const title = string.replace(regex, "").trim();
            resolve({title, year})
        } else {
            resolve(false);
        }
    })
}

export default mediaInfoFromString