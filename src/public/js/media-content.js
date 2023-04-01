$(document).on('click', '.media-item', async function(e){
    const media_id = $(this).data('media_id');
    console.log(media_id);

    if(e.target.classList.contains('play')){
        window.location.href = `/media/p/${media_id}`
    }
    else if(e.target.classList.contains('watchlist-add')){
        const res = await fetch('/user/watchlist', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({media_id})
        });

        if(res.status == 201){
            $(`.media-item[data-media_id="${media_id}"] .watchlist-rem`).addClass('show');
        }

        console.log(res.status);
    }
    else if(e.target.classList.contains('watchlist-rem')){
        const res = await fetch('/user/watchlist', {
            method: 'DELETE',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({media_id})
        });

        if(res.status == 200){
            $(`.media-item[data-media_id="${media_id}"] .watchlist-rem`).removeClass('show');
        }

        console.log(res.status);
    }
    else{
        window.location.href = `/media/i/${media_id}`
    }
});

$('.nav').click(function(){
    const className = $(this).attr('class');
    const mediaContainer = $(this).parent().parent().parent().find('.media-container');
    const mediaItem = mediaContainer.find('*:first-child');
    const gap = parseFloat((mediaContainer.css('gap')).replace('px', ''));
    const len = mediaContainer.find('.media-item').length;
    const pad = parseFloat(mediaContainer.css('padding-left').replace('px', ''));

    let itemsFit = parseInt(mediaContainer.width() / (mediaItem.width() + gap));
    if(mediaContainer.width() >= ((itemsFit + 1) * (mediaItem.width() + gap)) - gap) itemsFit+=1;

    let passedItems = (mediaContainer.scrollLeft() / mediaContainer.width()) * itemsFit;
    if(passedItems % 1 != 0) passedItems = parseInt(passedItems) + 1; 

    let target, offset;

    if(className == 'nav left'){
        target = passedItems - itemsFit;
        if(target < 0) target = 0;
        offset = mediaContainer.find(`.media-item:eq(${target})`).offset().left - pad;
    }
    else if(className == 'nav right'){
        target = passedItems + itemsFit;
        if(target >= len) target = len - 1; 
        offset = mediaContainer.find(`.media-item:eq(${target})`).offset().left - pad;
    }

    mediaContainer.stop(true, true).animate({
        scrollLeft: mediaContainer.scrollLeft() + offset 
    });
})