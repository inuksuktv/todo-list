import "./style.css";
import { format, subDays } from 'date-fns';

class Todo {
  constructor(
    title = "My Todo",
    dueDate = subDays(new Date(), -1), // Default to tomorrow.
    description = "Todo Description",
    priority = "Medium",
  ) {
    this.setTitle(title);
    this.setDescription(description);
    this.setDueDate(dueDate);
    this.setPriority(priority);
    this.setIncomplete();
  }

  setTitle = (title) => { this.title = title; }
  setDueDate = (dueDate) => { this.dueDate = dueDate; }
  setDescription = (description) => { this.description = description; }

  setComplete = () => { this.complete = true; }
  setIncomplete = () => { this.complete = false; }

  setPriority = (priority) => { this.priority = priority; }
}

class Project {
  constructor(name = "My Project") {
    this.setName(name);
    this.todoList = [new Todo()];
  }

  setName = (name) => {this.name = name}
}

class ScreenController {
  constructor() {
    this.projectList = [];
    if (this.StorageAvailable()) {
      this.LoadSavedProject();
    }
    else {
      this.LoadDefaultProject(this.projectList);
      this.activeProject = this.projectList[0];
    }
    this.CreatePageEventListeners();
  }

  StorageAvailable() {
    try {
      const projectList = localStorage.getItem("projectList");
      if (projectList) return true;
    }
    catch (e) {
      e instanceof DOMException &&
      e.name === "QuotaExceededError";
    }
  }

  PopulateStorage() {
    const listString = JSON.stringify(this.projectList);
    const activeString = JSON.stringify(this.activeProject);
    localStorage.setItem("projectList", listString);
    localStorage.setItem("activeProject", activeString);
  }

  LoadSavedProject() {
    const activeProjectString = localStorage.getItem("activeProject");
    this.activeProject = JSON.parse(activeProjectString);
    const projectListString = localStorage.getItem("projectList");
    this.projectList = JSON.parse(projectListString);

    this.activeProject.todoList.forEach((todo) => {
      const card = this.CreateTodoCard(todo);
      this.AddCardToContainer(card);
    });
    this.projectList.forEach((project) => {
      this.AddProjectToSelector(project);
    });
    const projectSelector = document.getElementById("projectSelector");
    projectSelector.value = this.activeProject.name;
  }

  LoadDefaultProject(list) {
    const defaultProject = new Project();
    list.push(defaultProject);

    // Create a default todo card.
    const todo = this.projectList[0].todoList[0];
    const card = this.CreateTodoCard(todo);
    this.AddCardToContainer(card);

    // Add the default project to the dropdown menu.
    this.AddProjectToSelector(defaultProject)
  }

  AddCardToContainer(card) {
    const todoContainer = document.querySelector(".todoContainer");
    todoContainer.appendChild(card);
  }

  AddProjectToSelector(project) {
    const selector = document.getElementById("projectSelector");
    const newOption = document.createElement('option');
    newOption.text = project.name;
    newOption.value = project.name;
    selector.add(newOption);
  }

  CreatePageEventListeners() {
    const addProjectButton = document.getElementById("addProject");
    const addTodoButton = document.getElementById("addTodo");
    const clearButton = document.getElementById("clearAll");
    const projectDropdown = document.getElementById("projectSelector");

    addProjectButton.addEventListener('click', () => this.AddProjectOnClick());
    addTodoButton.addEventListener('click', () => this.AddTodoOnClick());
    clearButton.addEventListener('click', () => this.ClearButtonOnClick());
    projectDropdown.addEventListener('change', (event) => this.ProjectDropdownOnChange(event));
  }

  AddProjectOnClick() {
    const newProject = new Project("New Project");
    this.projectList.push(newProject);
    this.AddProjectToSelector(newProject);
    this.PopulateStorage();
  }

  AddTodoOnClick() {
    const newTodo = new Todo("New Todo");
    this.activeProject.todoList.push(newTodo);
    const newCard = this.CreateTodoCard(newTodo);
    this.AddCardToContainer(newCard);
    this.PopulateStorage();
  }

  ClearButtonOnClick() {
    const projectSelector = document.getElementById("projectSelector");
    const todoContainer = document.querySelector(".todoContainer");
    projectSelector.innerHTML = "";
    todoContainer.innerHTML = "";
    this.projectList = [];
    this.activeProject = "";
    this.LoadDefaultProject(this.projectList);
    this.activeProject = this.projectList[0];
  }

  ProjectDropdownOnChange(event) {
    const dropdown = event.target;
    const newIndex = dropdown.selectedIndex;
    this.activeProject = this.projectList[newIndex];
    const cardContainer = document.querySelector(".todoContainer");
    cardContainer.innerHTML = '';
    this.activeProject.todoList.forEach(todo => {
      const newCard = this.CreateTodoCard(todo);
      this.AddCardToContainer(newCard);
    });
  }

  CreateTodoCard(todo) {
    const todoCard = document.createElement("div");
    todoCard.classList.add("todoCard")
    const formattedDate = format(todo.dueDate, "yyyy-MM-dd")
    todoCard.innerHTML = `
    <h3 class="todoTitle">${todo.title}</h3>
    <p class="todoDescription">${todo.description}</p>
    <p class="todoDueDate">${formattedDate}</p>
    <p class="todoPriority">
      <select class="priorityDropdown">
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
       priority
    </p>
    <label><input type="checkbox" name="complete" class="completion"> Complete</label>
    `
    this.CreateCardEventListeners(todo, todoCard);
    return todoCard;
  }

  CreateCardEventListeners(todo, card) {
    const dropdown = card.querySelector("select");
    dropdown.value = todo.priority;
    if (todo.priority === "High") {card.classList.add("highPriority");}
    else if (todo.priority === "Low") {card.classList.add("lowPriority");}
    dropdown.addEventListener("change", (event) => this.PriorityOnChange(event))

    const checkbox = card.querySelector(".completion");
    checkbox.addEventListener('change', (event) => this.CompleteOnChange(event));
  }

  PriorityOnChange(event) {
    const dropdown = event.target;
    const priority = dropdown.value;
    const card = dropdown.closest(".todoCard");
    card.classList.remove("highPriority", "lowPriority");
    if (priority === "High") {card.classList.add("highPriority");}
    else if (priority === "Low") {card.classList.add("lowPriority");}
  }

  CompleteOnChange(event) {
    const checkbox = event.target;
    const card = checkbox.closest(".todoCard");
    console.log(card);
    card.classList.remove("complete");
    console.log("Complete event.");
    if (checkbox.checked) {card.classList.add("complete");}
  }
}

new ScreenController();