let nav__toggler = document.querySelector(".nav--toggler");
const api = "https://api.ary0n.fun/";
const subBtn = document.querySelector(".btn--lg");
const input = document.querySelector("#url");
const nav_items = document.querySelectorAll(".nav__item");
const spanErr = document.querySelector('.input-error');

let links = [];
if (localStorage.getItem("links") != null)
  links = JSON.parse(localStorage.getItem("links"));

links.forEach((link) => {
  addSHortLinkContainer(link.orig_link, link.short_link);
});

function blurHandler() {
  let url = input.value;
  if (!url) {
    document.querySelector(".input-error").classList.add("empty");
    input.classList.add("error");
  } else if (!isValidURL(url)) {
    document.querySelector(".input-error").classList.add("invalid");
    input.classList.add("error");
  } else {
    document.querySelector(".input-error").classList.remove("empty", "invalid",'error');
    input.classList.remove("error");
  }
}
console.log(subBtn);
subBtn.addEventListener("click", async function () {
  console.log("clicked");
  let url = input.value;
  if (!url || !isValidURL(url)){blurHandler(); return;}
  url = ensureHTTPS(url);
  try {
    this.classList.add("move-label-up");
    this.disabled = true;
    let res = await fetch(`${api}url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    let data = await res.json();
    console.log(data);
    if (data.id) {
      let shortUrl = api + data.id;
      console.log(shortUrl);
      addSHortLinkContainer(url, shortUrl);
      links.push({ orig_link: url, short_link: shortUrl });
      updatelocalStorage();
      input.value = "";
      document.querySelectorAll(".label-up")[1].innerHTML = "Done";
    }
  } catch (err) {
    document.querySelectorAll(".label-up")[1].innerHTML = "Error";
    
    spanErr.classList.add('error');
    console.log(err);
  } finally {
    setTimeout(() => {
      this.classList.remove("move-label-up");
      setTimeout(() => {
        document.querySelectorAll(".label-up")[1].innerHTML = "Submitted";
      }, 300);
    }, 1000);
    this.disabled = false;
  }
});

nav__toggler.addEventListener("click", function () {
  let nav__menu = document.querySelector("nav");
  nav__menu.classList.toggle("collapsible--expanded");
});

nav_items.forEach((item) => {
  item.addEventListener("click", closeNavMenu);
});

function closeNavMenu() {
  let nav__menu = document.querySelector("nav");
  nav__menu.classList.remove("collapsible--expanded");
}

let touchStart;
function addEventListeners(btn) {
  btn.addEventListener("click", copyLink);

  //to avoid drag touches in mobile display
  btn.addEventListener("touchstart", function (event) {
    event.preventDefault();
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  });
  btn.addEventListener("touchend", function (e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const distanceThreshold = 10; // Adjust as needed

    const distance = Math.sqrt(
      Math.pow(touch.clientX - touchStart.x, 2) +
        Math.pow(touch.clientY - touchStart.y, 2)
    );
    if (distance <= distanceThreshold) copyLink(e);
  });
}

function copyLink(event) {
  const btn = event.currentTarget;
  const text = btn.previousElementSibling.innerHTML;
  btn.textContent = "Copied";
  btn.classList.add("copied");
  if (navigator.clipboard) navigator.clipboard.writeText(text);
  else {
    // Use the 'out of viewport hidden text area' trick
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Move textarea out of the viewport so it's not visible
    textArea.style.position = "absolute";
    textArea.style.left = "-999999px";

    document.body.prepend(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
    } catch (error) {
      console.error(error);
      window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    } finally {
      textArea.remove();
    }
  }

  setTimeout(() => {
    btn.classList.remove("copied");
    btn.textContent = "Copy";
  }, 1000);
}

function addSHortLinkContainer(originalLink, shortLink) {
  // Create the outermost div with class "history"
  const historyDiv = document.createElement("div");
  historyDiv.classList.add("history");

  // Create the div with class "orig-link" and set its text content
  const origLinkDiv = document.createElement("div");
  origLinkDiv.classList.add("orig-link");
  origLinkDiv.innerHTML = `<a href=${originalLink} target="_blank" rel="noopener noreferrer">${originalLink}</a>`;

  // Create the div with class "actions"
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("actions");

  // Create the anchor element with class "short-link" and set its href attribute and text content
  const shortLinkAnchor = document.createElement("a");
  shortLinkAnchor.classList.add("short-link");
  shortLinkAnchor.href = shortLink;
  shortLinkAnchor.target = "_blank";
  shortLinkAnchor.rel = "noopener noreferrer";
  shortLinkAnchor.textContent = shortLink;

  // Create the button element with classes "btn btn--rect btn--primary btn--copy"
  const copyButton = document.createElement("button");
  copyButton.classList.add("btn", "btn--rect", "btn--primary", "btn--copy");

  // Create the span element and set its text content
  copyButton.innerHTML = `<span>Copy</span>`;
  addEventListeners(copyButton);

  // Append the anchor element and button element to the actions div
  actionsDiv.appendChild(shortLinkAnchor);
  actionsDiv.appendChild(copyButton);

  // Append the orig-link div and actions div to the history div
  historyDiv.appendChild(origLinkDiv);
  historyDiv.appendChild(actionsDiv);

  // Append the history div to the document body or any other desired container element
  document.querySelector(".block-history").prepend(historyDiv);
}

function ensureHTTPS(url) {
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

function isValidURL(url) {
  // Regular expression pattern to validate URLs
  const urlPattern =
    /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z0-9]+(?:\/.*)?$/i;

  return urlPattern.test(url);
}

function updatelocalStorage() {
  localStorage.setItem("links", JSON.stringify(links));
}

// document.querySelector(".btn--lg").addEventListener("click", function () {
//   this.classList.toggle("move-label-up");
//   if (this.classList.contains("move-label-up"))
//     setTimeout(() => {
//       document.querySelectorAll(".label-up")[1].innerHTML = "Done";
//     }, 1000);
//   setTimeout(() => {
//     this.classList.toggle("move-label-up");
//     document.querySelectorAll(".label-up")[1].innerHTML = "Submitted";
//   }, 2000);
// });
