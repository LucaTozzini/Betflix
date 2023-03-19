import https from 'https';

function getJsonFromApi(url){
    return new Promise((resolve, reject) => {
        https.get(url ,(res) => {
            let body = "";
        
            res.on("data", (chunk) => {
                body += chunk;
            });
        
            res.on("end", () => {
                try {
                    let json = JSON.parse(body);
                    resolve(json)
                } catch (error) {
                    console.error(error.message);
                    resolve({'error':error.message})
                };
            });
        
        }).on("error", (error) => {
            console.error(error.message);
            reject(error);
        });
    })
}

export default getJsonFromApi