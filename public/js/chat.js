const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

socket.on("message", (message) => {
  console.log("message " ,message);
  const html = Mustache.render(messageTemplate, { username:message.username,message:message.text,createdAt:moment (message.createdAt).format("h:mm a") });
  $messages.insertAdjacentHTML("beforeend", html);
});
socket.on("locationMessage",(message) => {
  console.log("locationMessage " ,message);
  const html = Mustache.render(locationMessageTemplate,{username: message.username,url:message.url,createdAt: moment(message.createdAt).format("h:mm a")})
  $messages.insertAdjacentHTML("beforeend",html)

})
socket.on("roomData",({room,users}) => {
  const html = Mustache.render(sidebarTemplate,{room,users})
  document.querySelector("#sidebar").innerHTML = html
  // console.log(room)
  // console.log(users)
})

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  // console.log(document.getElementById("enterMessage").value);
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("The message was delivered!");
  });
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolaction is not supported by your browser.");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("shared location!");
      }
    );
  });
});

socket.emit("join",{username,room},(error) => {
  if(error){
    alert(error)
    location.href="/"
  }

})