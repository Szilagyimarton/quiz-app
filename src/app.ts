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
<h3>Pick a category</h3>
<div class="categories">
  ${categories.map(category => `
    <p class="category" data-id="${category.id}" data-text="${category.name}" data-hover="click"></p>
  `).join("")}
</div>
`

const pickedCategoryComponent = (questions:Question[],randomizedAnswers:any, count:number) => `
<div> 
  <p class="result"><span class="correct">Correct answers:${correct}</span> | <span class="incorrect" >Incorrect answers: ${incorrect}</span></p>
  <p id="countdown"></p>
  <h1>${questions[0].category}</h1>
    <div class="question">
      <h3>${questions[count].question}</h3>
      ${randomizedAnswers[count].map((answer: any) => {
        return `<button class="answerOption" data-questionid="${questions[count].id}">${answer}</button>`
      }).join("")}
    </div>
    <button class="back">Back</button>
    <button class="next">Next</button>
   
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
      correctAnsw.push({
        question: question.question,
        answer: question.correct_answer,
        id: question.id
      })
      return [...question.incorrect_answers,question.correct_answer].sort((a, b) => 0.5 - Math.random());
    })
   
    makeDom(mainElement,pickedCategoryComponent(allQuestions,randomizedAnswers,count))
  }
}


const makeDom = (element:HTMLElement,component: string) => {
  element.innerHTML = ""
  element.insertAdjacentHTML("beforeend",component)
}

const nextAnswers = (e:MouseEvent,mainElement:HTMLElement,allQuestions:Question[]) => {
  const target = e.target as HTMLButtonElement
  if(target.className === "next"){
    count++
    makeDom(mainElement,pickedCategoryComponent(allQuestions,randomizedAnswers,count))
  }
} 

const clickToBack = (e:MouseEvent,mainElement:HTMLElement,categoriesComponent:(categories:Category[]) => string,categories:Category[]) => {
  const target = e.target as HTMLButtonElement
  if(target.className === "back"){
    console.log("back")
  makeDom(mainElement,categoriesComponent(categories))
  correctAnsw = []
  }
}

const checkAnswer = (e:MouseEvent) => {
  const target = e.target as HTMLButtonElement
  if(target.className === "answerOption"){
    const questionId = target.dataset.questionid
    const question = allQuestions.find(question => question.id === Number(questionId))
    const buttons = document.querySelectorAll(".answerOption")
    buttons.forEach(button => button.setAttribute("disabled",""))
    if(target.textContent === question?.correct_answer){
      correct++
      console.log("correct")
    }else{
      incorrect++
      console.log("incorrect")
      console.log(question?.correct_answer)
    }
  }
}



let start = 15
let correctAnsw:CorrectAnswer[] = []
let correct:number = 0
let incorrect:number = 0
let count:number = 0
let allQuestions:Question[] = []
let randomizedAnswers:String|Number[] = []

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