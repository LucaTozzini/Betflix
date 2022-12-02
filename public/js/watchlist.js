class populateWatchlist{
    index = 0
    async mainBuild(){
        const data = await user.getWatchlist()
        let html = '<div class="browseMargin"></div>'
        if(data.length > 0){
            for(let i = 0; i < data.length; i++){
                this.index++
                let itemData = await media.search(data[i].type, data[i].itemID)
                // console.log(itemData);continue 
                html += await html_insert(data[i].type, data[i].itemID, itemData.title, itemData.year, itemData.poster, '../img/icons/bookmark.png', this.index)
                // ADD BORDER OR MARGIN
                if(i+1 < data.length) html +='<div class="dividor"></div>'
                else{
                    html += '<div class="browseMargin"></div></div>'
                }
            }
        }
        else{
            html += '<div style="width: 5px; height: 80px"></div>No movies or shows in your watchlist'

        }
        $('#watchlist .itemScroll').html(html)
    }
}