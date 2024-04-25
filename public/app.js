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
    <p class="category" data-id="${category.id}" data-text="${category.name}" data-hover="click"></p>
  `).join("")}
</div>
`;
const pickedCategoryComponent = (questions, randomizedAnswers, count) => `
<div> 
  <p class="result"><span class="correct">Correct answers:${correct}</span> | <span class="incorrect" >Incorrect answers: ${incorrect}</span></p>
  <p id="countdown"></p>
  <h1>${questions[0].category}</h1>
    <div class="question">
      <h3>${questions[count].question}</h3>
      ${randomizedAnswers[count].map((answer) => {
    return `<button class="answerOption" data-questionid="${questions[count].id}">${answer}</button>`;
}).join("")}
    </div>
    <button class="back">Back</button>
    <button class="next">Next</button>
   
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
        correct = 0;
        incorrect = 0;
        const id = Number(target.dataset.id);
        const questions = yield fetchCategory(id);
        allQuestions = questions;
        randomizedAnswers = questions.map((question) => {
            correctAnsw.push({
                question: question.question,
                answer: question.correct_answer,
                id: question.id
            });
            return [...question.incorrect_answers, question.correct_answer].sort((a, b) => 0.5 - Math.random());
        });
        makeDom(mainElement, pickedCategoryComponent(allQuestions, randomizedAnswers, count));
    }
});
const makeDom = (element, component) => {
    element.innerHTML = "";
    element.insertAdjacentHTML("beforeend", component);
};
const nextAnswers = (e, mainElement, allQuestions) => {
    const target = e.target;
    if (target.className === "next") {
        count++;
        makeDom(mainElement, pickedCategoryComponent(allQuestions, randomizedAnswers, count));
    }
};
const clickToBack = (e, mainElement, categoriesComponent, categories) => {
    const target = e.target;
    if (target.className === "back") {
        console.log("back");
        makeDom(mainElement, categoriesComponent(categories));
        correctAnsw = [];
    }
};
const checkAnswer = (e) => {
    const target = e.target;
    if (target.className === "answerOption") {
        const questionId = target.dataset.questionid;
        const question = allQuestions.find(question => question.id === Number(questionId));
        const buttons = document.querySelectorAll(".answerOption");
        buttons.forEach(button => button.setAttribute("disabled", ""));
        if (target.textContent === (question === null || question === void 0 ? void 0 : question.correct_answer)) {
            correct++;
            console.log("correct");
        }
        else {
            incorrect++;
            console.log("incorrect");
            console.log(question === null || question === void 0 ? void 0 : question.correct_answer);
        }
    }
};
let start = 15;
let correctAnsw = [];
let correct = 0;
let incorrect = 0;
let count = 0;
let allQuestions = [];
let randomizedAnswers = [];
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const rootElement = document.getElementById('root');
        rootElement === null || rootElement === void 0 ? void 0 : rootElement.insertAdjacentHTML("beforeend", skeleton());
        const mainElement = document.querySelector('main');
        const categories = yield fetchCategories();
        mainElement === null || mainElement === void 0 ? void 0 : mainElement.insertAdjacentHTML("beforeend", categoriesComponent(categories));
        window.addEventListener("click", (e) => {
            pickCategory(e, mainElement);
            nextAnswers(e, mainElement, allQuestions);
            clickToBack(e, mainElement, categoriesComponent, categories);
            checkAnswer(e);
        });
    });
}
init();
