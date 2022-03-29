let user = document.getElementById('username');

const username = fetch("https://clinique.chatelet.fr/username")
.then(function(response){
    response.text()
    .then(function(val){
         user.innerHTML = val
    })
})
.catch(function(error){
    console.error(error);
})