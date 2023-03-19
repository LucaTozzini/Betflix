import fs from 'fs';
import episode from 'episode';
import { getVideoDurationInSeconds } from 'get-video-duration'



const showMediaPath = 'C:/Users/luca_/github/Betflix/media/shows';
const movieMediaPath = 'C:/Users/luca_/github/Betflix/media/movies';

const filesUtil = {
    validShowFolders(){
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
                if(file.toLowerCase().includes('.mp4') || file.toLowerCase().includes('.m4v')){
                    valid.push(folder)
                    break
                }
            }
        }

        return valid
    },

    mediaInfoFromString(string){
        const regex = /\[(\d{4})\].*/;
        const match = string.match(regex);
        if(match){
            const year = match[1];
            const title = string.replace(regex, "").trim().replace(/[^A-Za-z0-9]/g, ' ').replace(/\s+/g, " ");;
            return {year, title};
        } 
        else{
            return false;
        }
    },

    validShows(){
        let shows = [];
        for(const folder of this.validShowFolders()){
            const info = this.mediaInfoFromString(folder);
            if(info != false){
                shows.push({info, folder, path: showMediaPath+'/'+folder});
            }
        }
        return shows;
    },

    validEpisodeFiles(folderPath){
        return new Promise(async resolve => {
            let episodes = [];
            for(const file of fs.readdirSync(folderPath)){
                const ext = file.split('.')[file.split('.').length - 1].toLowerCase(); 
                if(ext != 'mp4' && ext != 'm4v') continue;
                episodes.push({
                    path: folderPath+'/'+file,
                    season_num: (episode(file)).season,
                    episode_num: episode(file).episode,
                    duration: await getVideoDurationInSeconds(folderPath+'/'+file) 
                })
            }
            resolve(episodes);
        })
    },

    validMovieFiles(){
        const files = fs.readdirSync(movieMediaPath);
        let validMovies = [];
        for(const file of files){
            const ext = file.split('.')[file.split('.').length - 1].toLowerCase();
            if(ext == 'mp4' || ext == 'm4v'){
                validMovies.push(file);
            }
        }
        return files;
    },

    validMovies(){
        let movies = [];
        for(const file of this.validMovieFiles()){
            const info = this.mediaInfoFromString(file);
            if(info != false){
                movies.push({info, file, path: movieMediaPath+'/'+file});
            }
        }
        return movies;
    }

}


export default filesUtil;