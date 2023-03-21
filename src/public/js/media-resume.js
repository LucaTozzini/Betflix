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
})