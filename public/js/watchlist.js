class populateWatchlist{
    index = 0
    async mainBuild(){
        const data = await user.getWatchlist()
        let html = ''
        if(data.length > 0){
            for(let i = 0; i < data.length; i++){
                this.index++
                let itemData = await media.search(data[i].type, data[i].itemID)
                // console.log(itemData);continue 
                html += await html_insert(data[i].type, data[i].itemID, itemData.title, itemData.year, itemData.poster, '../img/icons/bookmark.png', this.index)
            }
        }
        else{
            html += '<div style="margin-left: calc(var(--browseMarginWidth) + 3px); height: 80px; font-size: 20px; display:flex; align-items:center" >No items in your watchlist</div>'

        }
        $('#watchlist .itemScroll').html(html)
    }
}