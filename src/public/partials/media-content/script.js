$(document).on('click', '.media-item', function(e){
    const id = $(this).data('id')
    const type = $(this).data('type')
    const target = $(e.target).attr('class')

    if(target == 'media-overlay-button play'){
        window.location.href = `/media/player/${type}/${id}`
    }
    else{
        window.location.href = `/media/${type}/${id}`
    }
})