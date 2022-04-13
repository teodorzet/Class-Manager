window.onload = (event) => {
    const logout = async() => {
        try {
            let result = await fetch(`http://localhost:8888/api/logout`).then(resp => resp.json())
            location.href = result.redirect
        } catch (error) {
            console.error(error)
        }

    };
    document.getElementById(`logoutButton`).addEventListener(`click`, logout)
    console.log(`logout loaded`)
}