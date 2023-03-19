window.onscroll = () => {
    const a = Math.min(Math.max(0.1, window.scrollY / 400), 0.9)
    const b = window.scrollY / 800

    document.getElementById('header-overlay').style.setProperty('--a', a)
    document.getElementById('header-overlay').style.backdropFilter = `blur(${b}rem)`
}