import fs from 'fs'

// Define The Root Directory
const showMediaPath = 'C:/Users/luca_/OneDrive/Desktop/betflix_local/media/shows'

function validShowFolders(){
    return new Promise(resolve => {
        // Get All Folders In Root Directory
        const folders =  fs.readdirSync(showMediaPath)

        // Create An Empty Array For Valid Folders
        let valid = []

        // Loop Through All Folders In Root
        for(const folder of folders){

            // Get All The Files In Folder
            const files = fs.readdirSync(`${showMediaPath}/${folder}`)

            // Loop Through Files
            for(const file of files){

                // If A Valid Format Is Found
                // Push Parent Folder To Valid Array And Break Loop
                if(file.toLowerCase().includes('.mp4') || file.toLowerCase().includes('.m4a')){
                    valid.push(folder)
                    break
                }
            }
        }

        resolve(valid)
    })
}

export default validShowFolders