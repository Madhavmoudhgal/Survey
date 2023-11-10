function getSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = Date.now().toString();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

let currentQuestion = 0;
const totalQuestions = 5;
const questions = [
  { text: "How satisfied are you with our products?", type: "rating", options: 5 },
  { text: "How fair are the prices compared to similar retailers?", type: "rating", options: 5 },
  { text: "How satisfied are you with the value for money of your purchase?", type: "rating", options: 5 },
  { text: "On a scale of 1-10, how would you recommend us to your friends and family?", type: "rating", options: 10 },
  { text: "What could we do to improve our service?", type: "text" },
];
const answers=[];

function submitSurvey() {
  const surveyData = {
    sessionId: getSessionId(),
    answers: answers,
    completed: true,
  };

  const surveyJson = JSON.stringify(surveyData, null, 2);

  const surveyWindow = window.open('', '_blank');

  surveyWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Survey Results</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        pre {
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <h1>Survey Results</h1>
      <pre>${surveyJson}</pre>
    </body>
    </html>
  `);

  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(surveyData),
  })
    .then(response => {

      if (!response.ok) {
        throw new Error('Survey submission failed');
      }
      return response.text();
    })
    .then(data => {
      try {
       
        const parsedData = JSON.parse(data);
        console.log('Survey submitted:', parsedData);
      } catch (error) {
        
        console.error('Error parsing JSON:', error);
      }
      showThankYouScreen();
    })
    .catch(error => {
      console.error('Error submitting survey:', error);
    });
}


function saveAnswer() {
  const answer = document.getElementById('answer').value;

  const answerObject = {
    sessionId: getSessionId(),
    questionId: currentQuestion,
    answer: answer,
  };
  answers.push(answerObject);

  localStorage.setItem('surveyAnswers', JSON.stringify(answers));
}

function showThankYouScreen() {
  const thankYouScreen = document.getElementById('thank-you-screen');
  const surveyScreen = document.getElementById('survey-screen');

  surveyScreen.style.display = 'none';
  thankYouScreen.style.display = 'block';

  setTimeout(() => {
    resetSurvey();
  }, 5000);
}

function resetSurvey() {
  currentQuestion = 0;
  answers.length = 0;

  localStorage.removeItem('surveyAnswers');


  document.getElementById('thank-you-screen').style.display = 'none';
  document.getElementById('welcome-screen').style.display = 'block';
}

function questionExists(index) {
  return index >= 0 && index < questions.length;
}

function showQuestion() {
  const questionContainer = document.getElementById('survey-screen');

  if (questionExists(currentQuestion)) {
    questionContainer.innerHTML = `
      <h3>Question ${currentQuestion + 1}/${totalQuestions}</h3>
      <p>${getQuestionText(currentQuestion)}</p>
      <div id="answer-container">${getAnswerInput(currentQuestion)}</div>
      <button onclick="prevQuestion()">Previous</button>
      <button onclick="skipQuestion()">Skip</button>
      <button onclick="nextQuestion()">Next</button>
    `;
  } else {
    showThankYouScreen();
  }
}

function skipQuestion() {

  const skippedAnswer = "Skipped";
  const answerObject = {
    sessionId: getSessionId(),
    questionId: currentQuestion,
    answer: skippedAnswer,
  };
  answers.push(answerObject);

  currentQuestion++;
  showQuestion();
}


function startSurvey() {
  document.getElementById('welcome-screen').style.display = 'none';
  document.getElementById('survey-screen').style.display = 'block';
  showQuestion();
}

function getQuestionText(index) {
  return questionExists(index) ? questions[index].text : '';
}

function getAnswerInput(index) {
  if (!questionExists(index)) return '';

  const questionType = questions[index].type;

  if (questionType === 'rating') {
    const options = questions[index].options;
    let inputHtml = `<select id="answer" required>`;
    for (let i = 1; i <= options; i++) {
      inputHtml += `<option value="${i}">${i}</option>`;
    }
    inputHtml += `</select>`;
    return inputHtml;
  } else if (questionType === 'text') {
    return `<textarea id="answer" rows="4" cols="50" placeholder="Type your answer here" required></textarea>`;
  }

  return '';
}


function nextQuestion() {
  saveAnswer();
  currentQuestion++;
  if (currentQuestion < totalQuestions) {
    showQuestion();
  } else {

    const userConfirmed = confirm('Do you want to submit the survey?');
    if (userConfirmed) {

      submitSurvey();
    } else {
      showThankYouScreen();
    }
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
}
