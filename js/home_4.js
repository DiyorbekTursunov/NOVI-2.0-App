document.addEventListener("DOMContentLoaded", function () {
  // Set the progress value for circle
  const progressValue = 70;
  const progressBar = document.querySelector(".progress-bar");
  const circumference = 2 * Math.PI * 45; // 2πr where r=45

  // Calculate the dash offset based on progress
  const dashOffset = circumference - (progressValue / 100) * circumference;

  // Set the dash offset
  progressBar.style.strokeDasharray = circumference;
  progressBar.style.strokeDashoffset = dashOffset;

  // Calendar functionality
  const calendarContainer = document.getElementById("calendar");
  const dayItems = document.querySelectorAll(".day-item");

  // Function to center all day items and handle positioning
  const centerDayItems = () => {
    const containerWidth = calendarContainer.offsetWidth;
    const dayItemWidth = dayItems[0].offsetWidth;
    const gap = 10; // Gap between items (from CSS)

    // Calculate left padding to center items
    const activeDayIndex = Array.from(dayItems).findIndex((day) =>
      day.classList.contains("active")
    );
    if (activeDayIndex === -1) return;

    // Calculate the position where the active day should be centered
    const centerPosition = containerWidth / 2;

    // Calculate total width of all items to the left of the active item
    // This ensures that no matter the screen size, the active item will be centered
    let leftWidth = 0;
    for (let i = 0; i < activeDayIndex; i++) {
      leftWidth += dayItems[i].offsetWidth + gap;
    }

    const paddingLeft = centerPosition - dayItemWidth / 2 - leftWidth;

    // Apply padding to the first item which shifts everything
    dayItems[0].style.marginLeft = Math.max(0, paddingLeft) + "px";
  };

  // Function to calculate the center position of an element
  const calculateCenterPosition = (element) => {
    const containerWidth = calendarContainer.offsetWidth;
    const elementOffset = element.offsetLeft;
    const elementWidth = element.offsetWidth;
    return elementOffset - containerWidth / 2 + elementWidth / 2;
  };

  // Function to handle day selection
  const selectDay = (selectedDay, withScroll = true) => {
    // Remove active class from all days
    dayItems.forEach((d) => d.classList.remove("active"));

    // Add active class to selected day
    selectedDay.classList.add("active");

    // Re-center all items to ensure the active one is in the center
    centerDayItems();

    if (withScroll) {
      // Calculate scroll position to center the selected item
      const scrollToPosition = calculateCenterPosition(selectedDay);

      // Smoothly scroll to center the selected day
      calendarContainer.scrollTo({
        left: scrollToPosition,
        behavior: "smooth",
      });
    }
  };

  // Handle day selection click events
  dayItems.forEach((day) => {
    day.addEventListener("click", function () {
      selectDay(this);
    });
  });

  // Touch swipe functionality for calendar
  let startX;
  let scrollLeft;
  let isDragging = false;
  let startTime;
  let lastSelectedDay = document.querySelector(".day-item.active");

  calendarContainer.addEventListener(
    "touchstart",
    function (e) {
      startX = e.touches[0].pageX;
      scrollLeft = calendarContainer.scrollLeft;
      isDragging = true;
      startTime = new Date().getTime();
    },
    { passive: true }
  );

  calendarContainer.addEventListener(
    "touchmove",
    function (e) {
      if (!isDragging) return;
      const x = e.touches[0].pageX;
      const walk = startX - x;
      calendarContainer.scrollLeft = scrollLeft + walk;

      // Prevent default scrolling behavior
      e.preventDefault();
    },
    { passive: false }
  );

  calendarContainer.addEventListener(
    "touchend",
    function (e) {
      if (!isDragging) return;
      isDragging = false;

      const endTime = new Date().getTime();
      const timeElapsed = endTime - startTime;
      const endX = e.changedTouches[0].pageX;
      const distance = startX - endX;

      // Detect swipe
      if (Math.abs(distance) > 50 && timeElapsed < 300) {
        // Fast swipe - move to next or previous day
        const activeDay = document.querySelector(".day-item.active");
        const activeIndex = Array.from(dayItems).indexOf(activeDay);

        let newIndex;
        if (distance > 0) {
          // Swipe left - next day
          newIndex = Math.min(activeIndex + 1, dayItems.length - 1);
        } else {
          // Swipe right - previous day
          newIndex = Math.max(activeIndex - 1, 0);
        }

        selectDay(dayItems[newIndex]);
      } else {
        // Slow drag or small movement
        // Find which day is closest to the center
        const containerCenter =
          calendarContainer.getBoundingClientRect().left +
          calendarContainer.offsetWidth / 2;
        let closestDay = null;
        let closestDistance = Infinity;

        dayItems.forEach((day) => {
          const dayRect = day.getBoundingClientRect();
          const dayCenter = dayRect.left + dayRect.width / 2;
          const distance = Math.abs(dayCenter - containerCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestDay = day;
          }
        });

        if (closestDay) {
          selectDay(closestDay);
        }
      }
    },
    { passive: true }
  );

  // Handle window resize to keep active day centered
  window.addEventListener("resize", function () {
    const activeDay = document.querySelector(".day-item.active");
    if (activeDay) {
      // Re-center without scroll animation on resize
      centerDayItems();
    }
  });

  // Center active day on load
  const activeDay = document.querySelector(".day-item.active");
  if (activeDay) {
    setTimeout(() => {
      centerDayItems();
    }, 100);
  }

  // Initial centering
  centerDayItems();
});

// Get references to the buttons
const btnLeft = document.querySelector(".btn-left");
const btnDone = document.querySelector(".btn-done");

// Function to toggle active state
function setActiveButton(activeButton, inactiveButton) {
  // Update active button
  activeButton.style.backgroundColor = "#ffffff";
  activeButton.style.color = "#000000";
  activeButton.style.borderRadius = "40px";

  // Update inactive button
  inactiveButton.style.backgroundColor = "transparent";
  inactiveButton.style.color = "#ffffff";
  inactiveButton.style.borderRadius = "0";
}

// Set initial state (Left button is active by default based on your design)
setActiveButton(btnLeft, btnDone);

// Add click event listeners
btnLeft.addEventListener("click", function () {
  setActiveButton(btnLeft, btnDone);
});

btnDone.addEventListener("click", function () {
  setActiveButton(btnDone, btnLeft);
});

// Add this to your main.js file

document.addEventListener("DOMContentLoaded", function () {
  // Set the progress for the main task summary circle
  const progressBar = document.querySelector(".task-summary .progress-bar");
  const progressPercentage = 70; // 70% as shown in the design
  const circumference = 2 * Math.PI * 45; // 2πr where r=45
  const offset = circumference - (progressPercentage / 100) * circumference;

  if (progressBar) {
    progressBar.style.strokeDasharray = circumference;
    progressBar.style.strokeDashoffset = offset;
  }

  // Initialize task items' progress circles
  const taskItems = document.querySelectorAll(".task-item");

  taskItems.forEach((item) => {
    const progressCircle = item.querySelector(".progress-bar");
    const percentText = item.querySelector(".task-percentage");

    if (progressCircle && percentText) {
      const percent = parseInt(percentText.textContent);
      const radius = parseFloat(progressCircle.getAttribute("r"));
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (percent / 100) * circumference;

      progressCircle.style.strokeDasharray = circumference;
      progressCircle.style.strokeDashoffset = offset;
    }
  });
});
