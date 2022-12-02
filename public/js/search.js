async function populateSearch(title){
    return new Promise(async (resolve)=>{
        const data = await media.searchTitle(title)
        let html = '<div class="browseMargin"></div>'
        if(data.length > 0){
            for(let i = 0; i < data.length; i++){
                const bookmark_img = await user.isInWatchlist(data[i].type, data[i].id) ?  '../img/icons/bookmark.png' : '../img/icons/bookmark_empty.png' 
                html += await html_insert(data[i].type, data[i].id, data[i].title, data[i].year, data[i].poster, bookmark_img, this.index)
                // ADD BORDER OR MARGIN
                if(i+1 < data.length) html +='<div class="dividor"></div>'
                else{
                    html += '<div class="browseMargin"></div></div>'
                }
            }
        }
        else if(title.length >= 3){
            html += '<div style="width: 5px; height: 80px"></div>No results'

        }
        $('#search .itemScroll').html(html)
        resolve()
    })
}

$("#search input").on('change keydown paste input', function(){
    $("#search input").val($("#search input").val().trimStart())
});

let last_value
async function checkSearchValue(){
    while(true){
        const input = $("#search input").val().trim()
        if($("#search input").val().length == 0)  $('#search .itemScroll').html('')
        else if (input != last_value){
            await populateSearch(input);
            last_value = input
        }
        await new Promise((resolve)=>{setTimeout(()=>{resolve()}, 200)})
    }
}