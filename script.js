// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  // Select elements
  const header = document.querySelector(".header h1");
  const boxes = document.querySelectorAll(".box");
  const input = document.getElementById("submitName");
  const greetBtn = document.querySelector(".submitName");

  // Assign colors to boxes based on their text
  const colorMap = {
    Red: "red",
    Blue: "blue",
    Green: "green",
    Yellow: "yellow",
  };

  // Add click event for each box
  boxes.forEach((box) => {
    box.addEventListener("click", () => {
      const color = colorMap[box.textContent.trim()];
      box.style.backgroundColor = color;
      box.style.color = "white";
      box.style.border = `3px solid ${color}`;
    });
  });

  // Greet button event
  greetBtn.addEventListener("click", () => {
    const name = input.value.trim();
    if (name === "") {
      header.textContent = "Hello";
    } else {
      header.textContent = `Hello ${name}!`;
    }
  });
});
