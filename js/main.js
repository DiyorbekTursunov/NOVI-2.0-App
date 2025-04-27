document.addEventListener("DOMContentLoaded", function () {
    // Set the progress value for circle
    initMainProgressCircle();

    // Initialize the dynamic calendar
    initDynamicCalendar();

    // Sample task data for different dates
    const taskData = {
      // Format: "YYYY-MM-DD": { tasks: [...], completion: "X/Y" }
      "2025-04-23": {
        completion: "7/10",
        tasks: [
          {
            title: "Chat Application",
            status: "overdue",
            date: "Apr 23, 2025",
            progress: 70,
            color: "blue",
            members: [
              "./images/profile_photo_2.png",
              "./images/profile_photo_4.png",
              "./images/profile_photo_5.png",
            ],
          },
          {
            title: "NFT Website",
            status: "scheduled",
            date: "Apr 23, 2025",
            progress: 80,
            color: "orange",
            members: [
              "./images/profile_photo_1.png",
              "./images/profile_photo_3.png",
            ],
          },
          {
            title: "Mobile App",
            status: "completing",
            date: "Apr 23, 2025",
            progress: 100,
            color: "cyan",
            members: ["./images/profile_photo_5.png"],
          },
        ],
      },
      "2025-04-24": {
        completion: "5/8",
        tasks: [
          {
            title: "Dashboard Redesign",
            status: "scheduled",
            date: "Apr 24, 2025",
            progress: 45,
            color: "blue",
            members: [
              "./images/profile_photo_1.png",
              "./images/profile_photo_4.png",
            ],
          },
          {
            title: "User Research",
            status: "overdue",
            date: "Apr 24, 2025",
            progress: 100,
            color: "orange",
            members: [
              "./images/profile_photo_2.png",
              "./images/profile_photo_3.png",
              "./images/profile_photo_5.png",
            ],
          },
        ],
      },
      "2025-04-25": {
        completion: "3/5",
        tasks: [
          {
            title: "API Integration",
            status: "completing",
            date: "Apr 25, 2025",
            progress: 100,
            color: "cyan",
            members: [
              "./images/profile_photo_1.png",
              "./images/profile_photo_2.png",
            ],
          },
          {
            title: "Database Optimization",
            status: "scheduled",
            date: "Apr 25, 2025",
            progress: 60,
            color: "blue",
            members: [
              "./images/profile_photo_3.png",
              "./images/profile_photo_4.png",
            ],
          },
        ],
      },
      "2025-04-26": {
        completion: "2/6",
        tasks: [
          {
            title: "Content Writing",
            status: "scheduled",
            date: "Apr 26, 2025",
            progress: 30,
            color: "blue",
            members: ["./images/profile_photo_5.png"],
          },
          {
            title: "Video Editing",
            status: "overdue",
            date: "Apr 26, 2025",
            progress: 65,
            color: "orange",
            members: [
              "./images/profile_photo_1.png",
              "./images/profile_photo_3.png",
            ],
          },
          {
            title: "Social Media Post",
            status: "completing",
            date: "Apr 26, 2025",
            progress: 100,
            color: "cyan",
            members: ["./images/profile_photo_2.png"],
          },
        ],
      },
      "2025-04-27": {
        completion: "4/7",
        tasks: [
          {
            title: "Social Media Campaign",
            status: "scheduled",
            date: "Apr 27, 2025",
            progress: 50,
            color: "blue",
            members: [
              "./images/profile_photo_4.png",
              "./images/profile_photo_5.png",
            ],
          },
          {
            title: "Email Newsletter",
            status: "completing",
            date: "Apr 27, 2025",
            progress: 100,
            color: "cyan",
            members: ["./images/profile_photo_2.png"],
          },
        ],
      },
    };

    // Keep track of the current filter state
    let currentFilter = "left"; // Default to "left" (incomplete tasks)

    // Function to initialize the main progress circle
    function initMainProgressCircle(percentage = 70) {
      const progressBar = document.querySelector(".progress-bar");
      const progressPercentage = document.querySelector(".progress-percentage");
      const circumference = 2 * Math.PI * 45; // 2πr where r=45

      // Calculate the dash offset based on progress
      const dashOffset = circumference - (percentage / 100) * circumference;

      // Set the dash offset and text
      progressBar.style.strokeDasharray = circumference;
      progressBar.style.strokeDashoffset = dashOffset;

      // Update the percentage text
      if (progressPercentage) {
        progressPercentage.textContent = `${percentage}%`;
      }
    }

    // Calendar functionality - Will be applied to dynamically created elements
    function setupCalendarInteractions() {
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

        // Update tasks and task summary based on selected date
        updateTasksForSelectedDate(selectedDay);
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
          // Initialize tasks for today's date
          updateTasksForSelectedDate(activeDay);
        }, 100);
      }

      // Initial centering
      centerDayItems();
    }

    // Function to create dynamic calendar
    function initDynamicCalendar() {
      const today = new Date();
      const calendarContainer = document.getElementById("calendar");

      // Clear existing calendar items
      calendarContainer.innerHTML = "";

      // Generate 10 days (3 days before today, today, and 6 days after)
      for (let i = -3; i <= 6; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);

        // Create day element
        const dayItem = document.createElement("div");
        dayItem.className = "day-item";
        if (i === 0) dayItem.classList.add("active"); // Mark today as active

        // Store date information for tasks lookup
        const dateStr = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
        dayItem.setAttribute("data-date", dateStr);
        dayItem.setAttribute("data-day", date.getDate());

        // Day number
        const dayNumber = document.createElement("div");
        dayNumber.className = "day-number";
        dayNumber.textContent = date.getDate();

        // Day name
        const dayName = document.createElement("div");
        dayName.className = "day-name";

        // Get short day name (Sun, Mon, Tue, etc.)
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        dayName.textContent = dayNames[date.getDay()];

        // Append to day item
        dayItem.appendChild(dayNumber);
        dayItem.appendChild(dayName);

        // Add to calendar
        calendarContainer.appendChild(dayItem);
      }

      // Setup calendar interactions after creating the items
      setupCalendarInteractions();
    }

    // Function to calculate overall task completion percentage for a date
    function calculateOverallProgress(tasks) {
      if (!tasks || tasks.length === 0) return 0;

      const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
      return Math.round(totalProgress / tasks.length);
    }

    // Function to filter tasks based on current filter mode (left/done)
    function filterTasks(tasks) {
      if (!tasks || tasks.length === 0) return [];

      if (currentFilter === "left") {
        // Filter for incomplete tasks (<100%)
        return tasks.filter((task) => task.progress < 100);
      } else if (currentFilter === "done") {
        // Filter for completed tasks (=100%)
        return tasks.filter((task) => task.progress === 100);
      }

      // Default: return all tasks
      return tasks;
    }

    // Function to update tasks based on selected date
    function updateTasksForSelectedDate(selectedDay) {
      const selectedDate = selectedDay.getAttribute("data-date");
      const tasksContainer = document.querySelector(".tasks-container");
      const taskSummary = document.querySelector(".task-summary-2 p");

      // Apply fade-out effect
      tasksContainer.classList.add("fade-out");

      // Format date for display in header (e.g., "Mar 22")
      const dateForHeader = new Date(selectedDate);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const formattedDate =
        months[dateForHeader.getMonth()] + " " + dateForHeader.getDate();

      // Update date in the task-meta section
      document.querySelector(".task-date").textContent = formattedDate;

      // Get task data for selected date, or use default if not found
      const dateData = taskData[selectedDate] || {
        completion: "0/0",
        tasks: [],
      };

      // Calculate overall progress for the date and update main progress circle
      const overallProgress = calculateOverallProgress(dateData.tasks);
      initMainProgressCircle(overallProgress);

      // Update task summary and populate tasks after a short delay for transition
      setTimeout(() => {
        // Update task completion summary
        taskSummary.textContent = `(${dateData.completion}) Completed`;

        // Filter tasks based on current filter mode
        const filteredTasks = filterTasks(dateData.tasks);

        // Update tasks container
        if (filteredTasks.length === 0) {
          // No tasks for this date or filter
          let message = "No tasks scheduled for this date.";
          if (dateData.tasks.length > 0) {
            message =
              currentFilter === "left"
                ? "No incomplete tasks for this date."
                : "No completed tasks for this date.";
          }

          tasksContainer.innerHTML = `
              <div class="no-task-message" style="text-align:center; padding:40px 0;">
                <p>${message}</p>
              </div>
            `;
        } else {
          // Generate HTML for each filtered task
          let tasksHTML = "";

          filteredTasks.forEach((task, index) => {
            const isLast = index === filteredTasks.length - 1;
            const taskClass = isLast ? "task-item-last" : "task-item";

            // Generate member avatars HTML
            let membersHTML = "";
            task.members.forEach((member) => {
              membersHTML += `<img width="41" height="41" src="${member}" alt="Team Member" class="member-avatar">`;
            });

            tasksHTML += `
              <a href="/home_3.html">
                          <div class="${taskClass}">
                  <div class="task-progress-circle ${task.color}">
                    <svg width="70" height="70" viewBox="0 0 70 70">
                      <circle class="progress-background" cx="35" cy="35" r="30"></circle>
                      <circle class="progress-bar" cx="35" cy="35" r="30" style="stroke-dashoffset: ${
                        188.4 - (task.progress / 100) * 188.4
                      }"></circle>
                    </svg>
                    <span class="task-percentage">${task.progress}%</span>
                  </div>
                  <div class="task-details">
                    <h3>${task.title}</h3>
                    <p class="${task.status}">• ${
              task.status.charAt(0).toUpperCase() + task.status.slice(1)
            }<span>, ${task.date}</span></p>
                  </div>
                  <div class="task-members">
                    <div class="member-avatars">
                      ${membersHTML}
                    </div>
                  </div>
                </div>
              </a>
              `;
          });

          tasksContainer.innerHTML = tasksHTML;

          // Initialize task progress circles
          const taskItems = tasksContainer.querySelectorAll(
            ".task-item, .task-item-last"
          );
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
        }

        // Apply fade-in effect
        tasksContainer.classList.remove("fade-out");
        tasksContainer.classList.add("fade-in");

        // Remove fade-in class after animation completes
        setTimeout(() => {
          tasksContainer.classList.remove("fade-in");
        }, 300);
      }, 300); // Delay for fade out effect
    }

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
    if (btnLeft && btnDone) {
      setActiveButton(btnLeft, btnDone);
      currentFilter = "left"; // Set default filter

      // Add click event listeners
      btnLeft.addEventListener("click", function () {
        setActiveButton(btnLeft, btnDone);
        currentFilter = "left"; // Set filter to show incomplete tasks

        // Refresh task list based on current day selection
        const activeDay = document.querySelector(".day-item.active");
        if (activeDay) {
          updateTasksForSelectedDate(activeDay);
        }
      });

      btnDone.addEventListener("click", function () {
        setActiveButton(btnDone, btnLeft);
        currentFilter = "done"; // Set filter to show completed tasks

        // Refresh task list based on current day selection
        const activeDay = document.querySelector(".day-item.active");
        if (activeDay) {
          updateTasksForSelectedDate(activeDay);
        }
      });
    }

  });

  document.addEventListener('DOMContentLoaded', function() {
      // Elements
      const taskMeta = document.querySelector('.task-meta');
      const calendarModal = document.getElementById('calendarModal');
      const closeCalendarBtn = document.getElementById('closeCalendar');
      const prevMonthBtn = document.getElementById('prevMonth');
      const nextMonthBtn = document.getElementById('nextMonth');
      const currentMonthEl = document.getElementById('currentMonth');
      const calendarGrid = document.querySelector('.calendar-grid');

      // Calendar data
      let currentDate = new Date();
      let selectedDate = new Date();

      // Special dates (active dates in your calendar)
      const activeDates = [2, 3, 4, 7, 12, 16, 18, 28]; // June 2024 from your image

      // Open calendar modal when clicking task-meta
      if (taskMeta) {
        taskMeta.addEventListener('click', function() {
          renderCalendar();
          calendarModal.style.display = 'block';
        });
      }

      // Close calendar modal
      if (closeCalendarBtn) {
        closeCalendarBtn.addEventListener('click', function() {
          calendarModal.style.display = 'none';
        });
      }

      // Close modal when clicking outside of it
      window.addEventListener('click', function(event) {
        if (event.target === calendarModal) {
          calendarModal.style.display = 'none';
        }
      });

      // Previous month button
      if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
          currentDate.setMonth(currentDate.getMonth() - 1);
          renderCalendar();
        });
      }

      // Next month button
      if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
          currentDate.setMonth(currentDate.getMonth() + 1);
          renderCalendar();
        });
      }

      // Render the calendar
      function renderCalendar() {
        // Set current month text
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        currentMonthEl.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        // Clear previous days
        const dayElements = document.querySelectorAll('.day');
        dayElements.forEach(day => day.remove());

        // Get first day of month and last day of month
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Get day of week for first day (0 = Sunday, 6 = Saturday)
        const startingDay = firstDay.getDay();

        // Add days from previous month
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
          const day = document.createElement('div');
          day.classList.add('day', 'other-month');
          day.textContent = prevMonthLastDay - i;
          calendarGrid.appendChild(day);
        }

        // Add days for current month
        const today = new Date();
        for (let i = 1; i <= lastDay.getDate(); i++) {
          const day = document.createElement('div');
          day.classList.add('day');
          day.textContent = i;
          day.setAttribute('data-date', `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${i}`);

          // Check if this day is today
          if (today.getDate() === i && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()) {
            day.classList.add('today');
          }

          // Check if this day is selected
          if (selectedDate.getDate() === i && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear()) {
            day.classList.add('selected');
          }

          // Check if this day has event (for June 2024 as example)
          if (currentDate.getMonth() === 5 && currentDate.getFullYear() === 2024 && activeDates.includes(i)) {
            day.classList.add('has-event');
          }

          // Add click event to select date
          day.addEventListener('click', function() {
            // Remove selected class from all days
            document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));

            // Add selected class to clicked day
            this.classList.add('selected');

            // Update selected date
            const [year, month, date] = this.getAttribute('data-date').split('-');
            selectedDate = new Date(year, month - 1, date);

            // Update the calendar section (the horizontal scroll calendar)
            updateCalendarSection(selectedDate);

            // Close the modal after selection
            setTimeout(() => {
              calendarModal.style.display = 'none';
            }, 300);
          });

          calendarGrid.appendChild(day);
        }

        // Add days from next month
        const totalCells = 42; // 6 rows x 7 columns
        const remainingCells = totalCells - (startingDay + lastDay.getDate());
        for (let i = 1; i <= remainingCells; i++) {
          const day = document.createElement('div');
          day.classList.add('day', 'other-month');
          day.textContent = i;
          calendarGrid.appendChild(day);
        }
      }

      // Update the horizontal scroll calendar based on selected date
      function updateCalendarSection(date) {
        // Find or create the selected day item in the calendar section
        const calendarContainer = document.getElementById('calendar');
        if (!calendarContainer) return;

        // First create a date range for the calendar section (7 days back, 7 days forward)
        const startDate = new Date(date);
        startDate.setDate(date.getDate() - 3);

        // Clear existing calendar
        calendarContainer.innerHTML = '';

        // Create 7 days
        for (let i = 0; i < 7; i++) {
          const currentDay = new Date(startDate);
          currentDay.setDate(startDate.getDate() + i);

          const dayItem = document.createElement('div');
          dayItem.classList.add('day-item');

          // If this is the selected date, add active class
          if (currentDay.getDate() === date.getDate() &&
              currentDay.getMonth() === date.getMonth() &&
              currentDay.getFullYear() === date.getFullYear()) {
            dayItem.classList.add('active');
          }

          // Create the day number element
          const dayNumber = document.createElement('div');
          dayNumber.classList.add('day-number');
          dayNumber.textContent = currentDay.getDate();

          // Create the day name element
          const dayName = document.createElement('div');
          dayName.classList.add('day-name');
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          dayName.textContent = days[currentDay.getDay()];

          // Append elements to day item
          dayItem.appendChild(dayNumber);
          dayItem.appendChild(dayName);

          // Add click event to select date
          dayItem.addEventListener('click', function() {
            // Remove active class from all days
            document.querySelectorAll('.day-item').forEach(d => d.classList.remove('active'));

            // Add active class to clicked day
            this.classList.add('active');

            // Update selected date
            selectedDate = new Date(currentDay);
          });

          // Append day item to calendar container
          calendarContainer.appendChild(dayItem);
        }

        // Scroll to the selected date (center it)
        const activeDay = calendarContainer.querySelector('.day-item.active');
        if (activeDay) {
          const containerWidth = calendarContainer.offsetWidth;
          const dayWidth = activeDay.offsetWidth;
          const scrollPosition = activeDay.offsetLeft - (containerWidth / 2) + (dayWidth / 2);
          calendarContainer.scrollLeft = scrollPosition;
        }
      }
    });
