
fetch("uvas.json")
.then((response) => response.json())
.then(data => {
  const uvas = data.Cant_UVA
  //init()
  console.log(uvas)
})
.catch(error => {
  console.log("error:", error)
})  

function init () {
  
}