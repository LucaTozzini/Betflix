$(document).on('click', '.media-item', function(e){
    console.log(e)
    const id = $(this).data('id')
    const type = $(this).data('type')
    const target = $(e.target).attr('class')

    if(target == 'media-overlay-button play'){
    }
    else{
        window.location.href = `/${type}/${id}/`
    }
})