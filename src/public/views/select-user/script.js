$('.user-image:not(#add)').click( async function(){
    const userId = $(this).data('id')
    const fetchOptions = {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({userId}) // body data type must match "Content-Type" header
    }
    console.log(123)
    const resolve = await fetch('/user/log/in', fetchOptions)
    if(resolve.status == 200){
        window.location.href = '/home'
    }
})

$('.user-image#add').click(function(){
    console.log('Add')
})