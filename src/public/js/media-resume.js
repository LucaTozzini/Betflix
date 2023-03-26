const mediaResume = {
    nav: {
        i: 0,
        len: $('#media-resume').find('.media-resume-item').length,
        run(ms){
            const con = $('#media-resume');
            const tar = con.find(`.media-resume-item:eq(${this.i})`);
            const pad = parseFloat(con.css('padding-left').replace('px', '')); 

            console.log(this.i, this.len, con.find(`.media-resume-item:eq(0)`).offset().left)
            
            con.stop().animate({
                scrollLeft: con.scrollLeft() + tar.offset().left - pad
            }, ms)            
        },
        display(){
            if(this.i == 0) $('.media-resume-nav:eq(0)').css('display', 'none');
            else $('.media-resume-nav:eq(0)').css('display', 'block');

            if(this.i + 1 == this.len) $('.media-resume-nav:eq(1)').css('display', 'none');
            else $('.media-resume-nav:eq(1)').css('display', 'block');
        },
        left(){
            if(this.i - 1 >= 0) this.i --;
            this.run(400);
            this.display();
        },
        right(){
            if(this.i + 1 < this.len) this.i ++;
            this.run(400);
            this.display();
        },
    }
}

mediaResume.nav.display();

window.addEventListener('resize', function(){
    mediaResume.nav.run(0);  
});

const resumeItems = document.getElementsByClassName('media-resume-item');
for(const item of resumeItems){
    item.addEventListener('click', function(e){
        if(e.target.tagName != 'BUTTON'){
            window.location.href = this.dataset.link;
        }
        else if(e.target.classList.contains('remove')){
            this.remove();
        }
    })
};

function removeContinue(media_id, episode_id){
    const body = JSON.stringify({media_id, episode_id});
    fetch('/user/remove/continue', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body
    });
}