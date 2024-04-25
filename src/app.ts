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
  incorrect_answers: Array<string|number|boolean>,
  id: number
}
type Answer = {
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
    <p class="category" data-id="${category.id}">${category.name}</p>
  `).join("")}
</div>
`

const pickedCategoryComponent = (questions:Question[],pickedCategoryAnswers:Array<Object>[]) => `
<div>
  <h1>${questions[0].category}</h1>
  <form>
  ${questions.map((question,i) => `
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
    const id = Number(target.dataset.id)
    const questions = await fetchCategory(id)
     makeDom(mainElement,pickedCategoryComponent(questions,pickedCategoryAnswers(questions)))
  }
}

const pickedCategoryAnswers = (questions:Question[]) => {
  
  return questions.map((question) => {
    answers.push({
      question: question.question,
      answer: question.correct_answer,
      id: question.id
    })
    return [...question.incorrect_answers,question.correct_answer]
  })
}
const makeDom = (element:HTMLElement,component: string) => {
  element.innerHTML = ""
  element.insertAdjacentHTML("beforeend",component)
}

const submitAnswers = (e:MouseEvent) => {
  const target  = e.target as HTMLElement
  if(target.className === "submit"){
    e.preventDefault()
    const form = document.querySelector('form') as HTMLFormElement
    const data = new FormData(form)
    let count = 1
   
    for(const entry of data){
      const question = answers.find(answer => answer.id === count ) as Answer
      console.log("question id: " + question.id + "count: " + count)
      if(question.id !== count) count++
      if(question.answer === entry[1]){
        const pElement = document.getElementById(`${question.id}`) as HTMLParagraphElement
        pElement.style.display = 'block'
        pElement.style.color = "green"
        pElement.innerHTML = "Correct!"
        count++
      }else if(question.answer !== entry[1]){
        const pElement = document.getElementById(`${question.id}`) as HTMLParagraphElement
        pElement.style.display = 'block'
        pElement.style.color = "red"
        pElement.innerHTML = "Incorrect!"
        count++
      }
    }
   
   
  }
} 
let answers:Answer[] = []
async function init(){
  const rootElement = document.getElementById('root')
  rootElement?.insertAdjacentHTML("beforeend",skeleton())
  const mainElement = document.querySelector('main') as HTMLElement
  const categories = await fetchCategories()
  mainElement?.insertAdjacentHTML("beforeend",categoriesComponent(categories))
  
  window.addEventListener("click",(e) => {
    pickCategory(e,mainElement )
    submitAnswers(e)
  })
 
 
}
init()