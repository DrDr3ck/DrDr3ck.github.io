const list=document.getElementById("list");
const input=document.getElementById("input");

const CHECK="fa-check-circle";
const UNCHECK="fa-circle-thin";

let todos = [];
let id = 0;

let data = localStorage.getItem("TODO");
if( data ) {
    todos = JSON.parse(data);
    todos.forEach(todo => {
        addToDo(todo.name, todo.id, todo.done, todo.trash);
    });
    id=todos.length;
}

document.addEventListener("keyup", (e) => {
    if( e.target.id === "input" && e.key === "Enter" ) {
        addToDo(input.value, id, false, false);
        todos.push(
            {
                name: input.value,
                id: id,
                done: false,
                trash: false
            }
        );
        id++;
        localStorage.setItem("TODO", JSON.stringify(todos));
        input.value = "";
    }
});

list.addEventListener("click", (event) => {
    let element = event.target
    let elementJob = event.target.attributes.job.value;
    if( elementJob === "complete" ) {
        completeToDo(element);
    } else if( elementJob === "delete" ) {
        removeToDo(element);
    }
    localStorage.setItem("TODO", JSON.stringify(todos));
});

function addToDo(text, id, done, trash) {
    if( trash ) {return;}
    const doneClassName = done ? CHECK : UNCHECK;
    const spanClassName = done ? "lineThrough" : "";

    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = 
    `
            <i class="fa ${doneClassName} complete" job="complete" id=${id}></i>
            <p class="text ${spanClassName}">${text}</p>
            <i class="fa fa-trash-o delete" job="delete" id=${id}></i>
    `;
    list.insertAdjacentElement("beforeend", li);
}

function completeToDo(element) {
    element.classList.toggle(CHECK);
    element.classList.toggle(UNCHECK);
    element.parentNode.querySelector(".text").classList.toggle("lineThrough");
    todos[element.id].done = !todos[element.id].done;
}

function removeToDo(element) {
    element.parentNode.parentNode.removeChild(element.parentNode);
    todos[element.id].trash = true;
}