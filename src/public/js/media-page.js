function background_effect(){
    const a = Math.min(Math.max(0.1, window.scrollY / 400), 0.9)
    const b = window.scrollY / 800

    document.getElementById('header-overlay').style.setProperty('--a', a)
    document.getElementById('header-overlay').style.backdropFilter = `blur(${b}rem)`
};

window.onscroll = () => {
    background_effect()
};

background_effect();

document.addEventListener('click', function(e){
    if(e.target.id != 'season'){
        document.getElementById('seasons').classList.remove('show');
    }
});

document.addEventListener('scroll', function(e){
    document.getElementById('seasons').classList.remove('show');
});

$('.episode-nav').click(function(){
    const mediaContainer = $('#episode-container');
    const mediaItem = $('.episode');
    const gap = parseFloat((mediaContainer.css('gap')).replace('px', ''));
    const len = mediaContainer.find('.episode').length;
    const pad = parseFloat(mediaContainer.css('padding-left').replace('px', ''));


    let itemsFit = parseInt(mediaContainer.width() / (mediaItem.width() + gap));
    if(mediaContainer.width() >= ((itemsFit + 1) * (mediaItem.width() + gap)) - gap) itemsFit+=1;

    let passedItems = (mediaContainer.scrollLeft() / mediaContainer.width()) * itemsFit;
    if(passedItems % 1 != 0) passedItems = parseInt(passedItems) + 1; 

    let target, offset;

    if($(this).hasClass('left')){
        target = passedItems - itemsFit;
        if(target < 0) target = 0;
        offset = mediaContainer.find(`.episode:eq(${target})`).offset().left - pad;
    }
    else if($(this).hasClass('right')){
        target = passedItems + itemsFit;
        if(target >= len) target = len - 1; 
        offset = mediaContainer.find(`.episode:eq(${target})`).offset().left - pad;
    }

    console.log(itemsFit, passedItems, len, mediaItem.width(), target);

    mediaContainer.stop(true, true).animate({
        scrollLeft: mediaContainer.scrollLeft() + offset 
    });
});

$('.cast-nav').click(function(){
    const mediaContainer = $('#cast-container');
    const mediaItem = $('.person-insert');
    const gap = parseFloat((mediaContainer.css('gap')).replace('px', ''));
    const len = mediaContainer.find('.person-insert').length;
    const pad = parseFloat(mediaContainer.css('padding-left').replace('px', ''));


    let itemsFit = parseInt(mediaContainer.width() / (mediaItem.width() + gap));
    if(mediaContainer.width() >= ((itemsFit + 1) * (mediaItem.width() + gap)) - gap) itemsFit+=1;

    let passedItems = (mediaContainer.scrollLeft() / mediaContainer.width()) * itemsFit;
    if(passedItems % 1 != 0) passedItems = parseInt(passedItems) + 1; 

    let target, offset;

    if($(this).hasClass('left')){
        target = passedItems - itemsFit;
        if(target < 0) target = 0;
        offset = mediaContainer.find(`.person-insert:eq(${target})`).offset().left - pad;
    }
    else if($(this).hasClass('right')){
        target = passedItems + itemsFit;
        if(target >= len) target = len - 1; 
        offset = mediaContainer.find(`.person-insert:eq(${target})`).offset().left - pad;
    }

    console.log(itemsFit, passedItems, len, mediaItem.width(), target);

    mediaContainer.stop(true, true).animate({
        scrollLeft: mediaContainer.scrollLeft() + offset 
    });
})