async function update(){
    const user_name = document.getElementById('name').value;
    const user_image = document.querySelector('input[name="profile-image"]:checked').value;

    const res = await fetch('/user/update', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_name, 
            user_image
        })
    });

    if(res.status == 200) window.location.href = '/home';
};

const inputs = document.getElementsByClassName('image-radio');
for(const input of inputs){
    input.addEventListener('change', function(){
        const selected = document.querySelector('input[name="profile-image"]:checked').value;
        document.getElementById('profile-image').style.backgroundImage = `url(${selected})`;
        document.getElementById('images').classList.remove('show');
    })
}