window.addEventListener('scroll', function(){
    if(window.pageYOffset > 0){
        document.getElementById('menu').classList.add('stick')
    }
    else{
        document.getElementById('menu').classList.remove('stick')
    }
});

if(window.pageYOffset > 0){
    document.getElementById('menu').classList.add('stick')
}
else{
    document.getElementById('menu').classList.remove('stick')
}

window.addEventListener('click', function(e){
    if(e.target.id != 'user-icon'){
        document.getElementById('user-dropdown-menu').classList.remove('show');
    }
})