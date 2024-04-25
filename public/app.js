"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const skeleton = () => `
<header></header>
<main></main>
<footer></footer>`;
const categoriesComponent = (categories) => `
<h3>Pick a category</h3>
<div class="categories">
  ${categories.map(category => `
    <p class="category" data-id="${category.id}">${category.name}</p>
  `).join("")}
</div>
`;
const pickedCategoryComponent = (questions, pickedCategoryAnswers) => `
<div>
  <h1>${questions[0].category}</h1>
  <form>
  ${questions.map((question, i) => `
    <h4>${question.question}</h4>
    <div class="answers">
    ${pickedCategoryAnswers[i].map((answer) => `
      <input type="radio" value="${answer}" id="${answer}" name="${question.question}" />
      <label for="${answer}">${answer}</label>
      `).join("")}
      <p id="${question.id}" style="display:none"></p>
    </div>
    
    `)}
    <button class="submit">Send</button>
    </form>
  </div>
`;
const fetchCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch("https://opentdb.com/api_category.php");
    const data = yield res.json();
    return data["trivia_categories"];
});
const fetchCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(`https://opentdb.com/api.php?amount=10&category=${id}`);
    const data = yield response.json();
    const questions = data.results.map((question, i) => {
        return Object.assign(Object.assign({}, question), { id: i + 1 });
    });
    return questions;
});
const pickCategory = (e, mainElement) => __awaiter(void 0, void 0, void 0, function* () {
    const target = e.target;
    if (target.className === "category") {
        const id = Number(target.dataset.id);
        const questions = yield fetchCategory(id);
        makeDom(mainElement, pickedCategoryComponent(questions, pickedCategoryAnswers(questions)));
    }
});
const pickedCategoryAnswers = (questions) => {
    return questions.map((question) => {
        answers.push({
            question: question.question,
            answer: question.correct_answer,
            id: question.id
        });
        return [...question.incorrect_answers, question.correct_answer];
    });
};
const makeDom = (element, component) => {
    element.innerHTML = "";
    element.insertAdjacentHTML("beforeend", component);
};
const submitAnswers = (e) => {
    const target = e.target;
    if (target.className === "submit") {
        e.preventDefault();
        const form = document.querySelector('form');
        const data = new FormData(form);
        let count = 1;
        for (const entry of data) {
            const question = answers.find(answer => answer.id === count);
            console.log("question id: " + question.id + "count: " + count);
            if (question.id !== count)
                count++;
            if (question.answer === entry[1]) {
                const pElement = document.getElementById(`${question.id}`);
                pElement.style.display = 'block';
                pElement.style.color = "green";
                pElement.innerHTML = "Correct!";
                count++;
            }
            else if (question.answer !== entry[1]) {
                const pElement = document.getElementById(`${question.id}`);
                pElement.style.display = 'block';
                pElement.style.color = "red";
                pElement.innerHTML = "Incorrect!";
                count++;
            }
        }
    }
};
let answers = [];
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const rootElement = document.getElementById('root');
        rootElement === null || rootElement === void 0 ? void 0 : rootElement.insertAdjacentHTML("beforeend", skeleton());
        const mainElement = document.querySelector('main');
        const categories = yield fetchCategories();
        mainElement === null || mainElement === void 0 ? void 0 : mainElement.insertAdjacentHTML("beforeend", categoriesComponent(categories));
        window.addEventListener("click", (e) => {
            pickCategory(e, mainElement);
            submitAnswers(e);
        });
    });
}
init();
