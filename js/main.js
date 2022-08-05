const ddPastry = document.getElementById("ddPastry");
const randomDiv = document.getElementById("randomDiv");
const answerDiv = document.getElementById("answerDiv");
const correctAnswerDiv = document.getElementById("correctAnswerDiv");
const btnShowCorrectAnswer = document.getElementById("btnShowCorrectAnswer");

let currStep = document.querySelector('.currStep');
let answerArr = new Array();
//split given string and insert into an array in random position
//procArr = Recipe steps string array
//will return an array of random string from recipe steps
function mixSteps(procArr){
    const randomWords = new Array();
    //split each steps
    procArr.forEach((steps) => {
        steps.forEach(e => randomWords.push(e));
    });
    //change random implementation
    return randomWords.sort();
}

function allowDrop(ev) {
    ev.preventDefault();
}
  
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.dataTransfer.setData("word-element", true);
}
  
function drop(ev) {
    //only allow to drop on dragabble divs
    if(ev.target.classList.contains('dropDiv') && 
        ev.dataTransfer.getData("word-element") == 'true'){
        ev.preventDefault();    
        let data = ev.dataTransfer.getData("text");
        ev.target.appendChild(document.getElementById(data));        
        clearHighlight(document.getElementById(data));
    }
}

function addRemoveItem(event){
    let elem = event.target;

    if(elem.nodeName == 'DIV'){//prevent trigger from input
        //remove from answer div
        if(elem.classList.contains('active')){
            elem.classList.remove("active");
            elem.classList.remove("valid");
            elem.classList.remove("invalid");
            randomDiv.appendChild(elem);
        }else{
            if(currStep !== null){
                //add to answer div
                elem.classList.add("active");
                currStep.appendChild(elem);
            }
        }
    }

    //highlight li
    let parentContainer = elem.parentElement;
    if(parentContainer.nodeName == 'LI' && !parentContainer.classList.contains("currStep")){
        highlightStepElem(parentContainer);
    }
}

function createItem(str, index){
    let itemDiv = document.createElement("div");
    itemDiv.id = "word"+index;
    let divText = str;
    if(str.charAt(0) == "{") {        
        itemDiv.appendChild(createMeasurementInput());
        divText = str.replace("{","").replace("}","").split(":")[1];
        itemDiv.classList.add("ingredient");
    }

    itemDiv.classList.add("words");
    itemDiv.append(divText);    
    itemDiv.setAttribute("draggable", "true");
    itemDiv.addEventListener("dragstart", drag);
    itemDiv.addEventListener("click", addRemoveItem);
    return itemDiv;
}

function createMeasurementInput(){
    let measurement = document.createElement("input");
    measurement.setAttribute("type","text");
    measurement.classList.add("measurement");
    return measurement;
}

function dragStep(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function removeStep(ev) {     
    //to remove last step by default
    let steps = answerDiv.firstElementChild.lastElementChild;
    
    if(ev !== undefined){
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        document.getElementById(data).remove();
    }       
    
    while(steps.hasChildNodes()){
        let word = steps.firstChild;
        randomDiv.appendChild(word);
        clearHighlight(word);
    }
    steps.remove();
    currStep = answerDiv.firstElementChild.lastElementChild;
}

function highlightStepElem(elem){
    if(elem.classList.contains("steps")){//limit highlighting to li.steps only
        Array.from(document.getElementsByClassName("steps"))
        .forEach(e => e.classList.remove("currStep"));
    
        elem.classList.add("currStep");
        currStep = elem;
    }
}

function highlightStep(event){
    highlightStepElem(event.target);
}

function addStep(){
    let stepDiv = document.createElement("li");
    stepDiv.className = "steps dropDiv currStep";
    stepDiv.setAttribute("draggable","true");
    stepDiv.addEventListener("drop", drop);
    stepDiv.addEventListener("dragover", allowDrop);
    stepDiv.addEventListener("click", highlightStep);
    highlightStepElem(stepDiv);
    answerDiv.firstElementChild.appendChild(stepDiv);
}

//will return an array of string containing steps
function loadRecipe(pastry){
    answerArr = new Array();
    if(pastry != ''){
        //changed with file read

        let txtRecipe = pastryDict[pastry].recipe;
        if(txtRecipe != ''){
            let recipeStepArr = txtRecipe.split("\n");
            recipeStepArr.forEach(e => answerArr.push(e.split(" ")));
        }
    }
    return answerArr;
}

function populateRandomWords(stepsArr){
    //clear current items
    while(randomDiv.hasChildNodes()) randomDiv.removeChild(randomDiv.firstChild);
     //clear current answers
    let answerList = answerDiv.firstElementChild;
    while(answerList.hasChildNodes()) answerList.removeChild(answerList.firstChild);
    currStep = null;
    //list random words
    mixSteps(stepsArr).forEach((e,i) => randomDiv.appendChild(createItem(e,i)));
}

function convertWordElementToString(elem){
    let word = "";
    if(elem.childElementCount == 1){//has input field
        let measurement = elem.firstChild.value;
        let ingredient = elem.textContent;
        word = `{${measurement}:${ingredient}}`
    }else{
        word = elem.textContent;
    }

    return word;
}

function clearHighlight(e){
    e.classList.remove("invalid");
    e.classList.remove("valid");
    e.classList.remove("active");
}



function validateRecipe(){
    //mark all as invalid by default
    Array.from(answerDiv.getElementsByClassName("words"))
    .forEach(e => {
        clearHighlight(e);
        e.classList.add("invalid");
    });
    //iterate answer array and compare user answer
    answerArr.forEach((step, stepIndex) => {
        step.forEach((word, wordIndex) => {
            try{
                let wordElement = answerDiv.firstElementChild.children[stepIndex].children[wordIndex];
                if(word == convertWordElementToString(wordElement)){
                    wordElement.classList.remove("invalid")
                    wordElement.classList.add("valid")
                } 
            }catch(err){}//do nothing
        });
    });
}

function convertIngredient(word){
    
    if(word.charAt(0) == '{'){
        let ingredient = word.replace("{","").replace("}","").split(":");
        return ingredient[0]+" " + ingredient[1];
    }else{
        return word;
    }
}

function populateCorrectAnswer(){

    correctAnswerDiv.firstElementChild.remove();
    let ol = document.createElement("ol");
    correctAnswerDiv.appendChild(ol);

    answerArr.forEach((step, stepIndex) => {
        let stepElem = document.createElement("li");
        let stepDesc = "";
        step.forEach((word, wordIndex) => {
            stepDesc += convertIngredient(word)+ " ";
        });
        stepElem.innerText = stepDesc;
        correctAnswerDiv.firstElementChild.append(stepElem);
    });

    correctAnswerDiv.firstElementChild.style.display = "none";
    btnShowCorrectAnswer.textContent = 'Show Answer';
}

function showHideCorrectAnswer(){
    if(btnShowCorrectAnswer.textContent == 'Show Answer'){
        correctAnswerDiv.firstElementChild.style.display = "block";
        btnShowCorrectAnswer.textContent = 'Hide Answer';
    }else{
        correctAnswerDiv.firstElementChild.style.display = "none";
        btnShowCorrectAnswer.textContent = 'Show Answer';
    }
}

ddPastry.addEventListener("change", (e) => {
    populateRandomWords(loadRecipe(e.target.value));
    populateCorrectAnswer();
});


window.onload = function(e) {
    Object.entries(pastryDict).forEach(pastry =>{
        let option = document.createElement("option");
        option.value = pastry[0];
        option.text = pastry[1].description;
        ddPastry.appendChild(option);
    });
};