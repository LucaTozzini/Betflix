const progressBar = document.getElementById('progress-fill');
const updates = document.getElementById('updates');
const buttons = document.getElementById('controls').getElementsByTagName('button')

async function updater(){
    const res = await fetch('/media/manager/updater');
    const json = await res.json();
    
    progressBar.style.width = (json.progress != null ? json.progress : 0)+'%';
    updates.innerHTML = json.update;

    for(const button of buttons){
        if(json.busy){
            button.style.opacity = 0.2;
            button.style.pointerEvents = 'none';
        }
        else{
            button.style.opacity = 1;
            button.style.pointerEvents = 'all';
        }
    }


    await new Promise(resolve => {
        setTimeout(()=>{
            resolve()
        }, 200)
    })

    updater();
}

updater();

function reset(){
    fetch('/media/manager/reset');
}

function addShows(){
    fetch('/media/manager/add/shows');
}

function addMovies(){
    fetch('/media/manager/add/movies');
}

function addCredits(){
    fetch('/media/manager/add/credits');
}