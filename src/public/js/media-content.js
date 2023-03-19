$('.media-item').click(function(e){
    const media_id = $(this).data('media_id')
    const target = $(e.target).attr('class')

    if(target == 'media-overlay-button play'){
        window.location.href = `/media/p/${media_id}`
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

    let itemsFit = parseInt(mediaContainer.width() / (mediaItem.width() + gap));
    if(mediaContainer.width() >= ((itemsFit + 1) * (mediaItem.width() + gap)) - gap) itemsFit+=1;

    let passedItems = (mediaContainer.scrollLeft() / mediaContainer.width()) * itemsFit;
    if(passedItems % 1 != 0) passedItems = parseInt(passedItems) + 1; 
    console.log(itemsFit, passedItems)

    if(className == 'nav left'){
        mediaContainer.stop(true, true).animate({
            scrollLeft: (passedItems * (mediaItem.width() + gap)) - (itemsFit * (mediaItem.width() + gap))
        });
    }
    else if(className == 'nav right'){
        mediaContainer.stop(true, true).animate({
            scrollLeft: (passedItems * (mediaItem.width() + gap)) + (itemsFit * (mediaItem.width() + gap))
        });
    }
})