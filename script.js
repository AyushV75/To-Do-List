const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");

// Counter variable to track the task index
let taskIndex = 1;
// console.log(taskForm,taskList);

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const taskInput = document.getElementById("task-input");
  const taskText = taskInput.value.trim();

  // console.log(taskText);
  if (taskText === "") {
    alert("Please enter a valid Task!");
    return;
  } else if (taskText !== "") {
    // Create a new task item

    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");
    taskItem.textContent = `${taskIndex}- ${taskText}`;
    taskItem.addEventListener("click", function () {
      console.log("completed");
      this.classList.toggle("completed");
    });
    // Add another click event listener to remove the completed task
    taskItem.addEventListener("click", function (event) {
      if (event.target.classList.contains("completed")) {
        // Remove the completed task item
        taskList.removeChild(taskItem);
      }
    });

    // Append the task item to the task list
    taskList.appendChild(taskItem);

    // increment the task index
    taskIndex++;
    taskInput.value = "";
  }
});
