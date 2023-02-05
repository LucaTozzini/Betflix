let image

selectImage($('.image:eq(0)'))

function selectImage(element){
    image = $(element).data('image')
    $('.image.selected').removeClass('selected')
    $(element).addClass('selected')
}

async function create(){
    const name = document.getElementById('name-input').value
    const child = $('#child-checkbox').is(':checked')
    
    const fetchOptions = {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'same-origin', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
        'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({name, image, child}) // body data type must match "Content-Type" header
    }
    console.log(1)
    const resolve = await fetch('/user', fetchOptions)
    console.log(2)
    if(resolve.status == 400){
        const resolveJson = await resolve.json()
        document.getElementById('error-message').innerHTML = resolveJson.error
    }
    else if(resolve.redirected){
        window.location.href = resolve.url
    }
}