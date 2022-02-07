
const oldContacts = [
    { name: "Alex", phone: "+123334551", email: "info@test.ru" },
    { name: "Max", phone: "+12345566", email: "info2@test2.ru" },
    { name: "Dima", phone: "+8872332323", email: "googl233e@appsd2.ru" },
    { name: "Sasha", phone: "+34454523", email: "sasha@apDDpsd2.ru" }
];


let openRequest = indexedDB.open("Mycontacts");
let db;
const overlay = document.querySelector(".overlay");
const searchEl = document.querySelector("#search-contact");

openRequest.onupgradeneeded = function () {
    db = openRequest.result;
    creatTables("contacts", oldContacts);
};

openRequest.onerror = function () {
    console.error("Error", openRequest.error);
};

openRequest.onsuccess = function () {
    db = openRequest.result;
    loadTable();
};

function creatTables(key, arr) {
    let objectStore = db.createObjectStore(key, {
        keyPath: 'id',
        autoIncrement: true,
    });

    for (let i in arr) {
        objectStore.add(arr[i]);
    }
}

const tbody = document.querySelector(".main__table tbody");

function loadTable() {

    tbody.innerHTML = "";

    let transaction = db.transaction('contacts')
        .objectStore("contacts");

    let contacts = transaction.getAll();
    contacts.onsuccess = function () {
        showTable(contacts.result);
    }

}

function showTable(contacts) {
    let tempHtml = contacts.map((contact, index) => {
        return `
                <tr>
                    <th scope="row">${++index}</th>
                    <td>${contact.name}</td>
                    <td>${contact.phone}</td>
                    <td>${contact.email}</td>
                    <td class="edit_td"><button type="button" class="btn btn-outline-info btn-sm edit" data-id=${contact.id}>Изменить</button></td>
                    <td class="delete_td"><button type="button" class="btn btn-outline-danger btn-sm delete" data-id=${contact.id}>Удалить</button></td>
                </tr>`;
    })
    tbody.innerHTML = tempHtml.join("");
}


function addContact() {
    const addContactBtn = document.querySelector("#add_contact");
    const userNameEl = document.querySelector("#user_name");
    const phoneEl = document.querySelector("#phone");
    const emailEl = document.querySelector("#email");

    addContactBtn.addEventListener("click", (e) => {
        const contact = {
            name: userNameEl.value,
            phone: phoneEl.value,
            email: emailEl.value,
        }

        let transaction = db.transaction('contacts', 'readwrite')
            .objectStore("contacts")
            .add(contact);

        transaction.onsuccess = function () {
            clearButtons({ userNameEl, phoneEl, emailEl });
            alert("Контакт добавлен")
            loadTable();
        }
        transaction.onerror = function () {
            console.log("...error");
        }
    })
}

function clearButtons(obj) {
    for (let el in obj) {
        obj[el].value = "";
    }
}

addContact();

function deleteContact() {
    // const deleteEl = tbody.querySelectorAll(".delete");
    tbody.addEventListener("click", (e) => {
        if (!e.target.matches(".delete")) return;

        let transaction = db.transaction(['contacts'], 'readwrite')
            .objectStore("contacts")
            .delete(+e.target.dataset.id);

        transaction.onsuccess = function () {
            alert("Конакт удален");
            loadTable();
        }
        transaction.onerror = function (e) {
            console.log(e);
        }
    })
}

deleteContact();


function editContact() {
    tbody.addEventListener("click", (e) => {
        if (!e.target.matches(".edit")) return;

        let transaction = db.transaction(['contacts'], 'readwrite')
            .objectStore("contacts")
            .get(+e.target.dataset.id);

        transaction.onsuccess = function () {
            openModal(transaction.result);
        }
    })
}

editContact();

function openModal(contact) {
    const modalHtml = `
    <div class="modal show" data-modal = "${contact.id}">
        <svg class="modal__cross" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 96 96" enable-background="new 0 0 96 96" xml:space="preserve">
        <polygon fill="black" points="96,14 82,0 48,34 14,0 0,14 34,48 0,82 14,96 48,62 82,96 96,82 62,48 "/>
        </svg>
        <div id="edit-note" class="edit-contact row">
            <div class="form-floating col-md-10">
                <input type="text"  class="form-control" id="user_name_modal"
                placeholder="Имя" value="${contact.name}">
                <label for="user_name">Имя</label>
            </div>
            <div class="form-floating col-md-10">
                <input type="text"  class="form-control" id="phone_modal"
                placeholder="Номер телефона" value="${contact.phone}">
                <label for="phone">Номер телефона</label>
            </div>
            <div class="form-floating col-md-10">
                <input type="email" class="form-control" id="email_modal"
                placeholder="Эл почта" value = "${contact.email}">
                <label for="email">Эл почта</label>
            </div>
            <div class="col-md-8 center">
            <button type="button" id="edit_contact" class="btn btn-outline-primary btn-lg">Сохранить</button>
            </div> 
            
        </div>
    </div>`;
    document.querySelector("main").insertAdjacentHTML("beforeend", modalHtml);
    overlay.classList.add("show");

    closeModal();
    saveChanges(contact)
}

function closeModal() {
    const modal = document.querySelector(".modal")
    overlay.addEventListener("click", (e) => {
        overlay.classList.remove("show");
        modal.remove();
    })

    const modalCross = document.querySelector(".modal__cross");
    if (modalCross) {
        modalCross.addEventListener("click", (e) => {
            overlay.classList.remove("show");
            modal.remove();
        })
    }
}

function saveChanges(contact) {
    const modal = document.querySelector(".modal")
    const saveBtn = modal.querySelector(".modal #edit_contact");
    const nameEl = modal.querySelector(".modal #user_name_modal");
    const phoneEl = modal.querySelector(".modal #phone_modal");
    const emailEl = modal.querySelector(".modal #email_modal");

    saveBtn.addEventListener("click", (e) => {
        let item = {
            id: contact.id,
            name: String(nameEl.value),
            phone: String(phoneEl.value),
            email: String(emailEl.value)
        }
        overlay.classList.remove("show");
        modal.remove();
        upDateBd(item);
    })
}

function upDateBd(item) {
    let transaction = db.transaction('contacts', 'readwrite')
        .objectStore("contacts")
        .put(item);
    transaction.onsuccess = function () {
        loadTable();
        alert("Конакт изменен");
    }
}


function searchContact() {
    searchEl.addEventListener("input", (e) => {
        let str = searchEl.value.toLowerCase();
        let transaction = db.transaction("contacts")
            .objectStore("contacts")
            .getAll();

        transaction.onsuccess = function () {
            let tempArr = transaction.result.filter(contact => {
                let name = contact.name.toLowerCase();
                let phone = contact.phone;
                let email = contact.email.toLowerCase();

                if (name.includes(str) || phone.includes(str) || email.includes(str)) {
                    return true;
                }
            })
            showTable(tempArr)
        };
    })
}
searchContact();