
    /* ==========================================
   PART 3C-1
   DARK MODE TOGGLE
========================================== */

const themeToggle = document.querySelector(".theme-toggle");

const body = document.body;


// Check saved preference

if(localStorage.getItem("theme") === "dark"){

    body.classList.add("dark-mode");

    themeToggle.innerHTML =
    '<i class="fa-solid fa-sun"></i>';

}


themeToggle.addEventListener("click",()=>{

    body.classList.toggle("dark-mode");

    if(body.classList.contains("dark-mode")){

        themeToggle.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

        localStorage.setItem("theme","dark");

    }else{

        themeToggle.innerHTML =
        '<i class="fa-solid fa-moon"></i>';

        localStorage.setItem("theme","light");

    }

});

/* =====================================
IMAGE COMPARISON SLIDER
===================================== */

const comparison = document.querySelector(".image-comparison");

if(comparison){

const afterWrapper =
comparison.querySelector(".after-wrapper");

const slider =
comparison.querySelector(".slider-handle");

const line =
comparison.querySelector(".slider-line");

let isDragging = false;

function moveSlider(x){

const rect =
comparison.getBoundingClientRect();

let position =
x - rect.left;

if(position < 0){

position = 0;

}

if(position > rect.width){

position = rect.width;

}

const percent =
(position / rect.width) * 100;

afterWrapper.style.width =
percent + "%";

slider.style.left =
percent + "%";

line.style.left =
percent + "%";

}

slider.addEventListener("mousedown",()=>{

isDragging = true;

});

window.addEventListener("mouseup",()=>{

isDragging = false;

});

window.addEventListener("mousemove",(e)=>{

if(!isDragging) return;

moveSlider(e.clientX);

});


/* MOBILE */

slider.addEventListener("touchstart",()=>{

isDragging = true;

});

window.addEventListener("touchend",()=>{

isDragging = false;

});

window.addEventListener("touchmove",(e)=>{

if(!isDragging) return;

moveSlider(e.touches[0].clientX);

});

}


/* ======================================
PARALLAX MOUSE EFFECT
====================================== */

const parallaxItems =
document.querySelectorAll(".parallax");

document.addEventListener("mousemove",(e)=>{

const x =
e.clientX / window.innerWidth;

const y =
e.clientY / window.innerHeight;

parallaxItems.forEach(item=>{

const speed =
item.dataset.speed;

const moveX =
(x - .5) * speed * 18;

const moveY =
(y - .5) * speed * 18;

item.style.transform =
`translate(${moveX}px,${moveY}px)`;

});

});

if(window.innerWidth > 992){

    const parallaxItems =
    document.querySelectorAll(".parallax");
    
    document.addEventListener("mousemove",(e)=>{
    
    const x =
    e.clientX / window.innerWidth;
    
    const y =
    e.clientY / window.innerHeight;
    
    parallaxItems.forEach(item=>{
    
    const speed =
    item.dataset.speed;
    
    const moveX =
    (x-.5) * speed *18;
    
    const moveY =
    (y-.5) * speed *18;
    
    item.style.transform =
    `translate(${moveX}px,${moveY}px)`;
    
    });
    
    });
    
    }

    /* ======================================
   TYPING ANIMATION
====================================== */

const typingElement = document.getElementById("typing-text");

if(typingElement){

const words = [

"Shopify Developer",

"E-commerce Specialist",

"Frontend Developer",

"UX/UI Enthusiast",

"Conversion Optimizer"

];

let wordIndex = 0;
let charIndex = 0;
let deleting = false;

typingElement.insertAdjacentHTML(
    "afterend",
    '<span class="cursor"></span>'
);

function typeEffect(){

    const currentWord = words[wordIndex];

    if(!deleting){

        typingElement.textContent =
        currentWord.substring(0,charIndex);

        charIndex++;

        if(charIndex > currentWord.length){

            deleting = true;

            setTimeout(typeEffect,1800);

            return;
        }

    }else{

        typingElement.textContent =
        currentWord.substring(0,charIndex);

        charIndex--;

        if(charIndex < 0){

            deleting = false;

            wordIndex++;

            if(wordIndex >= words.length){

                wordIndex = 0;

            }

        }

    }

    setTimeout(
        typeEffect,
        deleting ? 50 : 100
    );

}

typeEffect();

}

/* ======================================
CONTACT FORM VALIDATION
====================================== */

const contactForm = document.getElementById("contactForm");

if(contactForm){

contactForm.addEventListener("submit",(e)=>{

e.preventDefault();

const name =
document.getElementById("name").value.trim();

const email =
document.getElementById("email").value.trim();

const message =
document.getElementById("message").value.trim();

if(name === ""){

alert("Please enter your name.");

return;

}

if(email === ""){

alert("Please enter your email.");

return;

}

const emailPattern =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!emailPattern.test(email)){

alert("Please enter a valid email address.");

return;

}

if(message === ""){

alert("Please enter your message.");

return;

}

const success =
document.getElementById("successMessage");

success.textContent =
"✅ Thank you! Your message has been sent successfully.";

contactForm.reset();

});

}