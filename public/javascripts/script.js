document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("IronGenerator JS imported successfully!");
  },
  false
);

//filter function

//sidebar

document.ready(function () {
  "#sidebarCollapse".on("click", function () {
    "#sidebar".toggleClass("active");
  });
});
