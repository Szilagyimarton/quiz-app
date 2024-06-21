type CategoriesResponse = {
  trivia_categories: Category[]
}

type PickedCategoryResponse = {
  results: Question[]
}

type Category = {
  id: number,
  name: string
} 

type Question = {
  type: string,
  difficulty: string,
  category: string,
  question:string,
  correct_answer: string,
  incorrect_answers: Array<string|number>,
  id: number
}
type CorrectAnswer = {
  question: string,
  answer: string | number,
  id:number
}




const skeleton = () => `
<header></header>
<main></main>
<footer></footer>`

const categoriesComponent = (categories:Category[]) => `
<h3 class="title">Pick a category</h3>
<div class="categories">
  ${categories.map(category => `
    <p class="category" data-id="${category.id}" data-text="${category.name}" data-hover="click"></p>
  `).join("")}
</div>
`

const pickedCategoryComponent = (questions:Question[],randomizedAnswers:any, count:number) => `
<div class="pickedCategory"> 
  <div class="informations">
    <p id="countdown">10</p>
    <p class="result"><span class="material-symbols-outlined"> thumb_up </span>${correct}  |  <span class="material-symbols-outlined">thumb_down</span> ${incorrect}</p>
  </div>
  <h1>${questions[0].category}</h1>
    <div class="question">
      <h3>${questions[count].question}</h3>
      <div class="answers">
        ${randomizedAnswers[count].map((answer: any) => {
          return `<button class="answerOption" data-questionid="${questions[count].id}">${answer}</button>`
        }).join("")}
      </div>
    </div>
    <div class="buttonContainer">
      <button class="back">Back</button>
      <button class="next" disabled>Next</button>
    </div>
   
  </div>
`
const showResultComponent = () => `
        <div class="showResult">
        <h3>Your result:</h3>
        <p>Correct: ${correct}</p>
        <p>Incorrect: ${incorrect}</p>
        <button class="back">Back</p>
        </div>
`

const fetchCategories = async () => {
  const res = await fetch("https://opentdb.com/api_category.php")
  const data:CategoriesResponse = await res.json()
  return data["trivia_categories"]
}
const fetchCategory = async( id:number) => {
  const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${id}`)
  const data:PickedCategoryResponse = await response.json()
  const questions = data.results.map((question,i) => {
    return {...question,id: i+1}
  })
  return questions
}

const pickCategory = async (e:MouseEvent,mainElement:HTMLElement) => {
  const target = e.target as HTMLElement
  if(target.className === "category"){
    correct = 0
    incorrect = 0
    const id = Number(target.dataset.id)
    const questions = await fetchCategory(id)
    allQuestions = questions
    randomizedAnswers = questions.map((question) => {
      return [...question.incorrect_answers,question.correct_answer].sort((a, b) => 0.5 - Math.random());
    })
    
    makeDom(mainElement,pickedCategoryComponent(allQuestions,randomizedAnswers,count))
    countDown(mainElement)
    clearTimer = false
  }
}


const makeDom = (element:HTMLElement,component: string) => {
  element.innerHTML = ""
  element.insertAdjacentHTML("beforeend",component)
  
}

const nextAnswers = (e:MouseEvent,mainElement:HTMLElement,allQuestions:Question[]) => {
  const target = e.target as HTMLButtonElement
  if(target.className === "next"){
    isThereChosenAnswer = false
      count++
      if(count === allQuestions.length){
        showResult(mainElement,showResultComponent)
      }else{
        makeDom(mainElement,pickedCategoryComponent(allQuestions,randomizedAnswers,count))
        countDown(mainElement)
        clearTimer = false
      }
  }
 
} 

const clickToBack = (e:MouseEvent,mainElement:HTMLElement,categoriesComponent:(categories:Category[]) => string,categories:Category[]) => {
  const target = e.target as HTMLButtonElement
  if(target.className === "back"){
    makeDom(mainElement,categoriesComponent(categories))
    count = 0
    clearTimer = true
  }
}

const checkAnswer = (e:MouseEvent) => {
  const target = e.target as HTMLButtonElement
 
  if(target.className === "answerOption"){
    isThereChosenAnswer = true
    const next = document.querySelector(".next") as HTMLButtonElement
    next.disabled = false
    clearTimer = true
    const questionId = target.dataset.questionid
    const question = allQuestions.find(question => question.id === Number(questionId))
    const buttons = document.querySelectorAll(".answerOption")
    buttons.forEach(button => button.setAttribute("disabled",""))
    if(target.textContent === question?.correct_answer){
      correct++
      target.classList.add("correct")
    }else{
      incorrect++
      target.classList.add("incorrect")
      const answers = document.querySelectorAll(".answerOption")
      const rightAnswer = Array.from(answers).find(answ => question?.correct_answer === answ.textContent)
      rightAnswer?.classList.add("rightAnswer")
    }
  }

}

const showResult = (mainElement:HTMLElement,showResultComponent:() => string) => {
  makeDom(mainElement,showResultComponent())
}

const countDown = (mainElement:HTMLElement) => {
  let counter = 10;
  const countDownElement = document.querySelector("#countdown") as HTMLParagraphElement
  const timer = setInterval(function() {
    counter--;
    if (counter === 0 || clearTimer) {
        clearInterval(timer);
      if(counter === 0 && !isThereChosenAnswer){
        count++
        incorrect++
        makeDom(mainElement,pickedCategoryComponent(allQuestions,randomizedAnswers,count))
        countDown(mainElement)
        clearTimer = false
        clearInterval(timer)
      }
    }else{
      countDownElement.innerHTML = String(counter)
    }
}, 1000);
}

let start = 15
let correct:number = 0
let incorrect:number = 0
let count:number = 0
let allQuestions:Question[] = []
let randomizedAnswers: (string | number)[][] = []
let isThereChosenAnswer:boolean = false
let clearTimer:boolean = false

async function init(){
  const rootElement = document.getElementById('root')
  rootElement?.insertAdjacentHTML("beforeend",skeleton())
  const mainElement = document.querySelector('main') as HTMLElement
  const categories = await fetchCategories()
  mainElement?.insertAdjacentHTML("beforeend",categoriesComponent(categories))
  
  window.addEventListener("click",(e) => {
    pickCategory(e,mainElement )
    nextAnswers(e,mainElement,allQuestions)
    clickToBack(e,mainElement,categoriesComponent,categories)
    checkAnswer(e)
  })
 
 
}
init()