const todoCardsArray = [];
const progressCardsArray = [];
const completedCardsArray = [];

let cardIdGenerator = 1021;
const createCardForm = document.querySelector("#add-item-form");

const todoCardsSection = document.querySelector("#todo-cards-container >.task-list-content-container");
const progressCardsSection = document.querySelector("#in-progress-cards-container >.task-list-content-container")
const completedCardsSection = document.querySelector("#completed-cards-container >.task-list-content-container")

createCardForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newCard = buildNewCard(createCardForm.card_title.value, createCardForm.due_date.value);
    const cardTitle = createCardForm.card_title.value;
    // console.info(newCard);

    const cardstatus = newCard.querySelector(".card-status-dropdown").value;
    const cardPriority = newCard.querySelector(".priority-dropdown").value;

    // saveCard(newCard.id, cardTitle, newCard, cardstatus, cardPriority, false);
    manageCardOptions(newCard);

    moveCardToSection(newCard);

    cardIdGenerator++;

    createCardForm.reset();
})

function buildNewCard(cardTitle, dueDate) {

    const newCard = document.createElement("div");
    newCard.className = 'task-card-container';
    newCard.id = `${cardIdGenerator}`;
    newCard.innerHTML = `<div class="task-card-proper">

                                <div class="card-main">

                                    <div class="card-editable-details-container">
                                        <div class="card-title">${cardTitle}
                                        </div>
                                        <div class="card-due-date-container">
                                            <p class="card-due-date">${dueDate}</p>
                                            <input type="date" name="card-due-date-input"
                                                class="card-due-date-input hide">
                                        </div>
                                    </div>

                                    <div class="card-selectable-details-container" data-for-cardId = ${cardIdGenerator}>
                                        <select name="card-status-dropdown" class="card-status-dropdown">
                                            <option value="todo">To-Do</option>
                                            <option value="in-progress">Started</option>
                                            <option value="completed">Done</option>
                                        </select>
                                        <select name="priority-dropdown" class="priority-dropdown" select>
                                            <option value="high">High</option>
                                            <option value="mid">Mid</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="card-options" data-for-cardId=${cardIdGenerator}>
                                    <button class="save-card-changes hide">Save</button>
                                    <button class="edit-card-details material-symbols-outlined">edit</button>
                                    <button class="delete-card material-symbols-outlined">delete</button>
                                </div>
                            </div>
                        </div>`;

    newCard.querySelector(".card-status-dropdown").value = 'todo';
    newCard.querySelector(".priority-dropdown").value = 'mid';
    return newCard;
}



function saveCard(cardId, cardTitle, cardElement, cardStatus, cardPriority, update) {

    if(completedCardsArray.length === 0) {
        console.error('deleting from completedCardsArray');

    }

    // find the proper placing    
    const targetArrayRef = getTargetSectionAndArray(cardStatus).targetArrayRef;

    let cardObject;
    let cardIndex;

    // find if card priority, or status is being updated
    if (update) {
        console.info('updating');

        // find the previous status, and previous array of the card
        let previousArray;

        if (cardObject === undefined) {
            cardObject = todoCardsArray.find((element) => {
                return (element.id === cardId);
            })
            previousArray = todoCardsArray;
            console.info('deleting from todo array');
        }
        if (cardObject === undefined) {
            cardObject = progressCardsArray.find((element) => {
                return (element.id.localeCompare(cardId) === 0);
            })
            previousArray = progressCardsArray;
            console.info('deleting from progress array');
        }
        if (cardObject === undefined) {
            cardObject = completedCardsArray.find((element) => {
                return (element.id === cardId);
            });
            previousArray = completedCardsArray;
            console.info('deleting from completed array');
        }
        
        cardIndex = previousArray.indexOf(cardObject);
        
        console.log(cardObject, cardIndex, previousArray===completedCardsArray);
        previousArray.splice(cardIndex, 1);

        if(completedCardsArray.length === 0) {
            console.error('deleting from completedCardsArray');

        }
    }

    cardObject = {
        id: cardId,
        title: cardTitle,
        node: cardElement,
        status: cardStatus,
        priority: cardPriority
    };

    targetArrayRef.push(cardObject);

    console.info(targetArrayRef, cardObject);

}

function moveCardToSection(newCard) {

    const cardStatus = newCard.querySelector(".card-status-dropdown").value;
    const cardPriority = newCard.querySelector(".priority-dropdown").value;
    let update = false;
    let oldParentContainer;

    if (document.contains(newCard)) {

        oldParentContainer = newCard.parentElement.parentElement;


        const prevCards = Number(oldParentContainer.querySelector('.task-count').innerText);
        const prevHighPriorityCards = Number(oldParentContainer.querySelector('.high-priority-count').innerText);

        oldParentContainer.querySelector('.task-count').innerText = prevCards - 1;

        if (cardPriority.localeCompare('high') === 0) {
            oldParentContainer.querySelector('.high-priority-count').innerText = prevHighPriorityCards - 1;
        }

        deleteButtonClicked(newCard.querySelector('.delete-card'), true);
        update = true;
    }

    const targetCardsSection = getTargetSectionAndArray(cardStatus).targetCardsSection;

    console.info('moving from',oldParentContainer,'to', targetCardsSection,' : ',cardStatus);

    targetCardsSection.querySelector(".task-list-placeholder").classList.add("hide")
    targetCardsSection.appendChild(newCard);
    targetCardsSection.style.maxHeight = `${targetCardsSection.scrollHeight}px`;
    targetCardsSection.classList.remove('closed-accordion');

    const prevCardCount = Number(targetCardsSection.parentElement.querySelector('.task-count').innerText);
    // console.info(prevCardCount);
    targetCardsSection.parentElement.querySelector('.task-count').innerText = (prevCardCount + 1).toString();
    if (cardPriority.localeCompare('high') === 0) {
        targetCardsSection.parentElement.querySelector('.high-priority-count').innerText = Number(targetCardsSection.querySelector('.high-priority-count')) + 1;
    }

    saveCard(newCard.id, newCard.querySelector('.card-title').innerText, newCard, cardStatus, cardPriority, update);
}

function manageCardOptions(card) {

    card.addEventListener("click", (event) => {

        console.info(event.target.tagName, card.querySelector('.final-delete'));
        if (event.target.classList.contains('edit-card-details')) {
            editButtonClicked(card);
        }
        else if (event.target.classList.contains("save-card-changes")) {
            saveButtonClicked(card);
        }

        if (event.target.classList.contains('delete-card') && event.target.classList.contains('final-delete')) {
            deleteButtonClicked(event.target, true);
        }
        else if (event.target.classList.contains('delete-card')) {
            deleteButtonClicked(event.target);
        }

        if (card.querySelector('.final-delete')) {
            console.info("not delete");
            // console.log(event.target.tagName.localeCompare('BUTTON') != 0);
            if ((event.target.tagName.localeCompare('BUTTON') != 0)) {

                const finalDeleteButton = card.querySelector('.final-delete');
                finalDeleteButton.classList.remove('final-delete');
                finalDeleteButton.classList.add('material-symbols-outlined');
                finalDeleteButton.innerText = 'delete';
            }
        }
    })

    const cardStatus = card.querySelector(".card-status-dropdown");
    const cardPriority = card.querySelector(".priority-dropdown");

    cardStatus.addEventListener("change", (event) => {
        moveCardToSection(card);
    })

    cardPriority.addEventListener("change", (event) => {
        const parentContainer = document.getElementById(`${cardStatus.value}-cards-container`);

        const prevHighPriority = Number(parentContainer.querySelector('.high-priority-count').innerText);

        if (cardPriority.value.localeCompare('high') === 0) {
            parentContainer.querySelector('.high-priority-count').innerText = prevHighPriority + 1;
        }

        const targetArrayRef = getTargetSectionAndArray(cardStatus.value).targetArrayRef;
        const cardArrayElement = targetArrayRef.find( (element)=> {
            return (element.id === card.id);
        });
        cardArrayElement.priority = cardPriority.value;
    })
}
function editButtonClicked(card) {
    // make title editable
    const cardTitle = card.querySelector(".card-title");
    cardTitle.setAttribute("contenteditable", true);
    cardTitle.focus();


    // hide the displayed date, show the datepicker with the value of the current due date
    const displayedDate = card.querySelector(".card-due-date");
    displayedDate.classList.add("hide");

    const dueDate = displayedDate.textContent;

    const datePicker = displayedDate.nextElementSibling;
    datePicker.value = dueDate;
    datePicker.classList.remove("hide");


    // hide the edit button 
    card.querySelector(".edit-card-details").classList.add("hide");

    // show the save button
    card.querySelector(".save-card-changes").classList.remove('hide');
}

function saveButtonClicked(card) {
    // implement changes

    // update the title
    card.querySelector(".card-title").setAttribute("contenteditable", false);

    //update the date
    const datePicker = card.querySelector('input[type="date"]');
    const newDate = datePicker.value;
    datePicker.classList.add("hide");

    const displayedDate = card.querySelector(".card-due-date");
    displayedDate.textContent = newDate;
    displayedDate.classList.remove("hide");

    // implement changes in the parent array
    const targetArrayRef = getTargetSectionAndArray(card.querySelector('.card-status-dropdown').value).targetArrayRef;
    const cardArrayElement = targetArrayRef.find((element)=> {
        return (element.id === card.id);
    });
    cardArrayElement.title = card.querySelector('.card-title').innerText;
    console.info(cardArrayElement);

    // show the edit button 
    card.querySelector(".edit-card-details").classList.remove("hide");

    // hide the save button
    card.querySelector(".save-card-changes").classList.add('hide');
}

function deleteButtonClicked(deleteButton, finalDelete) {
    if (!finalDelete) {
        deleteButton.classList.add('final-delete');
        deleteButton.classList.remove('material-symbols-outlined');
        deleteButton.innerText = 'Delete Task?';
    }
    else {
        const targetCard = document.getElementById(deleteButton.parentElement.getAttribute('data-for-cardId'));
        const cardParentContainer = targetCard.parentElement;
        const cardParentAccordion = cardParentContainer.parentElement;

        console.info('deleting', targetCard);

        targetCard.remove();

        if (cardParentContainer.childElementCount === 1) {
            cardParentContainer.querySelector('.task-list-placeholder').classList.remove('hide');
        }

        cardStatus = targetCard.querySelector(".card-status-dropdown").value;
        let targetArrayRef = getTargetSectionAndArray(cardStatus).targetArrayRef;        

        const targetCardIdx = targetArrayRef.findIndex((element) => {
            return (element.id.localeCompare(targetCard.id) === 0);
        });
        targetArrayRef.splice(targetCardIdx, 1);

        // decrease count of cards in the accordion header, check for decrease in high priority cards
        cardParentAccordion.querySelector('.task-count').innerText = Number(cardParentAccordion.querySelector('.task-count').innerText) - 1;

        if (targetCard.querySelector('.priority-dropdown').value === 'high') {
            cardParentAccordion.querySelector('.high-priority-count').innerText = Number(cardParentAccordion.querySelector('.high-priority-count').innerText) - 1;
        }
    }
}


const searchInput = document.getElementById('search-task-input');
const filterStatusInput = document.getElementById('task-category-dropdown');
const filterPriorityInput = document.getElementById('task-priority-dropdown');

function displayFilteredSearchedCards() {

    todoCardsArray.forEach((element) => {

        element.node.classList.remove("hide");
        console.info(element.priority);
        console.info('hide card', element.node, (!element.title.includes(searchInput.value)));
        if (!element.title.toUpperCase().includes(searchInput.value.toUpperCase())) {
            element.node.classList.add('hide');
        }
        if (!(element.priority.toUpperCase().includes(filterPriorityInput.value.toUpperCase()))) {
            element.node.classList.add('hide');
        }
        if (!(element.status.toUpperCase().includes(filterStatusInput.value.toUpperCase()))) {
            element.node.classList.add('hide');
        }
    })

    progressCardsArray.forEach((element) => {

        element.node.classList.remove("hide");
        console.info(element.priority);
        if (!element.title.toUpperCase().includes(searchInput.value.toUpperCase())) {
            element.node.classList.add('hide');
        }
        if (!(element.priority.toUpperCase().includes(filterPriorityInput.value.toUpperCase()))) {
            element.node.classList.add('hide');
        }
        if (!(element.status.toUpperCase().includes(filterStatusInput.value.toUpperCase()))) {
            element.node.classList.add('hide');
        }
    })

    completedCardsArray.forEach((element) => {

        element.node.classList.remove("hide");
        console.info(element.priority);
        if (!element.title.toUpperCase().includes(searchInput.value.toUpperCase())) {
            element.node.classList.add('hide');
        }
        if (!(element.priority.toUpperCase().includes(filterPriorityInput.value.toUpperCase()))) {
            element.node.classList.add('hide');
        }
        if (!(element.status.toUpperCase().includes(filterStatusInput.value.toUpperCase()))) {
            element.node.classList.add('hide');
        }
    })
}


function getTargetSectionAndArray(cardStatus) {
    let targetCardsSection, targetArrayRef;

    if (cardStatus.localeCompare('todo') === 0) {
        targetCardsSection = todoCardsSection;
        targetArrayRef = todoCardsArray;
    }
    else if (cardStatus.localeCompare('in-progress') === 0) {
        targetCardsSection = progressCardsSection;
        targetArrayRef = progressCardsArray;
    }
    else {
        targetCardsSection = completedCardsSection;
        targetArrayRef = completedCardsArray;
    }
    console.info('target: ',targetCardsSection, targetArrayRef);

    return { targetCardsSection, targetArrayRef };
}