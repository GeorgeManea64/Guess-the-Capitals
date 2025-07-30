const questionEl = document.getElementById('question');
    const optionsList = document.getElementById('options-list');
    const nextBtn = document.getElementById('next-btn');
    const quizArea = document.getElementById('quiz-area');
    const winArea = document.getElementById('win-area');
    const backBtn = document.getElementById('back-btn');
    const progressEl = document.getElementById('progress');
    const winMessage = document.getElementById('win-message');
    const scoreMessage = document.getElementById('score-message');

    let countriesData = [];
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let answered = false;

    async function fetchCountries() {
      try {
        const res = await fetch('https://restcountries.com/v3.1/region/africa');
        const data = await res.json();
        countriesData = data.filter(c => c.capital && c.capital.length > 0 && c.name && c.name.common);
        prepareQuestions();
      } catch (error) {
        questionEl.textContent = "Failed to load data. Please refresh the page.";
        console.error(error);
      }
    }

    function prepareQuestions() {
      const shuffled = countriesData.sort(() => 0.5 - Math.random());
      questions = shuffled.slice(0, 10).map(c => ({
        country: c.name.common,
        capital: c.capital[0]
      }));
      showQuestion();
    }

    function shuffleArray(arr) {
      return arr.sort(() => 0.5 - Math.random());
    }

    function showQuestion() {
      answered = false;
      nextBtn.style.display = 'none';

      const current = questions[currentQuestionIndex];
      progressEl.textContent = `Question ${currentQuestionIndex + 1} / ${questions.length}`;
      questionEl.textContent = `What is the capital of ${current.country}?`;

      // Prepare 3 wrong capitals
      let wrongOptions = countriesData
        .filter(c => c.capital && c.capital[0] !== current.capital)
        .map(c => c.capital[0]);

      wrongOptions = shuffleArray(wrongOptions).slice(0, 3);

      let options = [...wrongOptions, current.capital];
      options = shuffleArray(options);

      optionsList.innerHTML = '';
      options.forEach(option => {
        const li = document.createElement('li');
        li.textContent = option;
        li.addEventListener('click', () => selectOption(li, option));
        optionsList.appendChild(li);
      });
    }

    function selectOption(li, selectedOption) {
      if (answered) return; // prevent multiple answers

      answered = true;

      const correctCapital = questions[currentQuestionIndex].capital;

      // Disable all options
      const allOptions = optionsList.querySelectorAll('li');
      allOptions.forEach(opt => {
        opt.classList.add('disabled');
        opt.style.pointerEvents = 'none';
      });

      if (selectedOption === correctCapital) {
        li.classList.add('correct');
        score++;
      } else {
        li.classList.add('wrong');
        // Highlight correct answer as well
        allOptions.forEach(opt => {
          if (opt.textContent === correctCapital) {
            opt.classList.add('correct');
          }
        });
      }

      nextBtn.style.display = 'inline-block';
    }

    nextBtn.addEventListener('click', () => {
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        showQuestion();
      } else {
        showResults();
      }
    });

    backBtn.addEventListener('click', () => {
      window.location.href = '../index.html';
    });

    function showResults() {
      quizArea.style.display = 'none';
      winArea.style.display = 'block';

      winMessage.textContent = 'Quiz completed!';
      let message = '';

      if (score <= 4) {
        message = 'You failed. You need to do better next time.';
      } else if (score <= 7) {
        message = 'Not bad. You can do better next time.';
      } else if (score <= 9) {
        message = 'Very good. Keep up a good work next time!';
      } else {
        message = 'Congratulations! You win the game!';
      }

      scoreMessage.textContent = `Your score: ${score} / ${questions.length}. ${message}`;
    }

    fetchCountries();