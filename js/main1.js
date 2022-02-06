
const subjects = [
    { "subject": "Математика", },
    { "subject": "Физика", }
];

const questions = [
    {  "subject_id": 1, "question": "1+3 = ?", "variantes": { a: "0", b: "1", c: "2", d: "undefined" }, "answer": "a" },
    {  "subject_id": 2, "question": "1+3 = ?", "variantes": { a: "0", b: "2", c: "3", d: "undefined" }, "answer": "b" },
];


let openRequest = indexedDB.open("Quiz", 1);
let db;

openRequest.onupgradeneeded = function () {
    db = openRequest.result;
    creatTables("subjects", subjects);
    creatTables("questions", questions);
};


openRequest.onerror = function () {
    console.error("Error", openRequest.error);
};

openRequest.onsuccess = function () {
    db = openRequest.result;
    loadTable();
};


function loadTable() {
    const tbody = document.querySelector(".main__table tbody");
    tbody.innerHTML = "";

    let subjects = getSubjectsArr();
    let questions = getQusetionsArr();

    subjects.onsuccess = function () {
        let tempHtml = subjects.result.map((subject, index) => {
            return `
                <tr data-id="${subject.id}">
                    <th scope="row">${++index}</th>
                    <td >${subject.subject}</td>
                    <td class="question"></td>
                </tr>`;
        })
        tbody.innerHTML = tempHtml.join("");
    }


    questions.onsuccess = function () {
        let questionTd = tbody.querySelectorAll(".question");

        questionTd.forEach(el => {
            let el_id = el.parentElement.dataset.id;
            let text = questions.result.filter(question =>question.subject_id == el_id).length;
            el.innerHTML = text;
        })
    }


}
function creatTables(key, arr) {
    let objectStore = db.createObjectStore(key, {
        keyPath: 'id',
        autoIncrement: true,
    });

    for (let i in arr) {
        objectStore.add(arr[i]);
    }
}

function getSubjectsArr() {
    let transaction = db.transaction('subjects');
    let subjectsStore = transaction.objectStore("subjects");

    let tempSubjects = subjectsStore.getAll();
    return tempSubjects;

}
function getQusetionsArr() {
    let transaction = db.transaction('questions');
    let questionStore = transaction.objectStore("questions");
    let tempQuestions = questionStore.getAll();

    return tempQuestions;
}



const addSubjectBtn = document.querySelector("#add_subject");
const subjectEl = document.querySelector("#subject_name");

addSubjectBtn.addEventListener("click", (e) => {

    const subject = {
        subject: subjectEl.value,
    }


    let transaction = db.transaction('subjects', 'readwrite')
        .objectStore("subjects")
        .add(subject);

 
    transaction.onsuccess = function () {
        clearButtons();
        alert("предмт добавлен")
        loadTable();
    }
    transaction.onerror = function () {
        console.log("...error");
    }
})

function clearButtons() {
    subjectEl.value = "";
}





