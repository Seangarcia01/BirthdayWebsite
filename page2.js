const reasons = document.querySelectorAll(".reason");
let index = 0;

window.addEventListener("wheel", (e) => {
  if (e.deltaY > 20 && index < reasons.length - 1) {
    reasons[index].classList.remove("active");
    index++;
    reasons[index].classList.add("active");
  } else if (e.deltaY < -20 && index > 0) {
    reasons[index].classList.remove("active");
    index--;
    reasons[index].classList.add("active");
  }
});
