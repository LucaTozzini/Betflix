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
    const html = await resolve.text()

    $('.media-container').html(html)

    $('.container-title').text(html.length > 0 ? 'Results' : value.length == 0 ? '' : 'No Results Found :(')
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
        }, 300)
    }
}

searchTimeout.setup()