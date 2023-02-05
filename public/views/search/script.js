async function search(){
    const value = $('#text-input').val()

    const fetchOptions = {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({value}) // body data type must match "Content-Type" header
    }

    const resolve = await fetch('/search', fetchOptions)
    const resolveJson = await resolve.json()

    $('.media-container').html(resolveJson.html)

    $('.container-title').text(resolveJson.html.length > 0 ? 'Results' : value.length == 0 ? '' : 'No Results Found :(')
}

const searchTimeout = {
    setup(){
        this.timeout = setTimeout(() => {

        }, 0)
    },

    set(){
        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
            search()
            console.log('searched')
        }, 300)
    }
}

searchTimeout.setup()