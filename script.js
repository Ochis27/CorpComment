//GLOBAL
const MAX_CHARS = 150;
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api";

const textareaEl = document.querySelector(".form__textarea");
const counterEl = document.querySelector(".counter");
const formEl = document.querySelector(".form");
const feedbackListEl = document.querySelector(".feedbacks");
const submitBtnEl = document.querySelector(".submit-btn");
const spinnerEl = document.querySelector(".spinner");
const hastagListEl = document.querySelector(".hashtags");
const renderFeedbackItem = (feedbackItem) => {
  //new feedback item HTML
  const feebackItemHTML = `
<li class="feedback">
  <button class="upvote">
      <i class="fa-solid fa-caret-up upvote__icon"></i>
      <span class="upvote__count">${feedbackItem.upvoteCount}</span>
  </button>
  <section class="feedback__badge">
      <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
  </section>
  <div class="feedback__content">
      <p class="feedback__company">${feedbackItem.company}</p>
      <p class="feedback__text">${feedbackItem.text}</p>
  </div>
  <p class="feedback__date">${
    feedbackItem.daysAgo === 0 ? "NEW" : `${feedbackItem.daysAgo}d`
  }</p></li>`;

  //insert new feedback item in list
  feedbackListEl.insertAdjacentHTML("beforeend", feebackItemHTML);
};

//--COUNTER COMPONENT--
const inputHendler = () => {
  //determining the max number of characters
  const maxNrCharacters = MAX_CHARS;
  //determining the number of characters that the user has currently typed
  const currentNumberOfCharacters = textareaEl.value.length;

  //calculate the number of characters left
  let characterLeft = maxNrCharacters - currentNumberOfCharacters;

  //show number of characters left
  counterEl.textContent = characterLeft;
};

textareaEl.addEventListener("input", inputHendler);
const showVisualIndicator = (textCheck) => {
  //show valid indicatocator
  formEl.classList.add(`form--${textCheck}`);

  //remove the visual inducator
  setTimeout(() => formEl.classList.remove(`form--${textCheck}`), 2000);
};
//--SUBMIT COMPONENT--

const submitHendler = (event) => {
  //prevent the default browser action
  event.preventDefault();

  //get text from the textarea
  const text = textareaEl.value;

  //validate text(e.g check if # is present and if the text is long enough)
  if (text.includes("#") && text.length > 4) {
    showVisualIndicator("valid");
  } else {
    showVisualIndicator("invalid");

    //focus the textarea again
    textareaEl.focus();

    //stop the function execution
    return;
  }

  //we have text and we are adding it to the list
  //extract other info from the text
  const hastag = text.split(" ").find((word) => word.includes("#"));
  const company = hastag.substring(1);
  const badgeLetter = company.substring(0, 1).toUpperCase();
  const upvoteCount = 0;
  const daysAgo = 0;

  //render feedback item in list
  const feebackItem = {
    upvoteCount: upvoteCount,
    company: company,
    badgeLetter: badgeLetter,
    daysAgo: daysAgo,
    text: text,
  };

  //render feedback item
  renderFeedbackItem(feebackItem);

  //send data back to the server
  fetch(`${BASE_API_URL}/feedbacks`, {
    method: "POST",
    body: JSON.stringify(feebackItem),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.log("Something went wrong!");
        return;
      }
    })
    .catch((error) => {
      console.log(error);
    });
  //reseting the values
  //clear the text are
  textareaEl.value = "";

  //unfocusing the button
  submitBtnEl.blur();

  //reset counter
  counterEl.textContent = MAX_CHARS;
};

formEl.addEventListener("submit", submitHendler);

//Feeback List Component
const clickHandler = (event) => {
  //get clicked HTML element
  const clickedEl = event.target;

  //determine if user intended to upvote or expand
  const upvoteIntention = clickedEl.className.includes("upvote");

  //run the appropriate logic for each logic
  if (upvoteIntention) {
    //get the closest upvote button
    const upvoteBtnEl = clickedEl.closest(".upvote");

    //disable upvote button
    upvoteBtnEl.disabled = true;

    //select the upvote count element within the upvote button
    const upvoteCountEl = upvoteBtnEl.querySelector(".upvote__count");

    //get currently displayed upvote count as number (+)
    let upvoteCount = +upvoteCountEl.textContent;

    //set the updated upvote count
    upvoteCountEl.textContent = ++upvoteCount;
  } else {
    //expand the clicked feedback item
    clickedEl.closest(".feedback").classList.toggle("feedback--expand");
  }
};

feedbackListEl.addEventListener("click", clickHandler);
fetch(`${BASE_API_URL}/feedbacks`)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    //remove spinner
    spinnerEl.remove();

    //iterate over each feedback item and add them in a list
    data.feedbacks.forEach((feebackItem) => {
      renderFeedbackItem(feebackItem);
    });
  })
  .catch((error) => {
    feedbackListEl.textContent = `Failed to fetch feedback items. Error message: ${error.message}`;
  });

// --HASTAG LIST COMPONENT--
(() => {
  const clickHandler = (event) => {
    //get the clicked element
    const clickedEl = event.target;

    //stop function if click happened in the list, but outside buttons
    if (clickedEl.className === "hashtags") return;

    //extract the company name
    const companyNameFromHashtag = clickedEl.textContent
      .substring(1)
      .toLowerCase()
      .trim();

    //iterate over each feedback item in the list
    feedbackListEl.childNodes.forEach((childNode) => {
      //stop the iteration if it's a text node
      if (childNode.nodeType === 3) return;

      //extract company name
      const companyNameFromFeedbackItem = childNode
        .querySelector(".feedback__company")
        .textContent.toLowerCase()
        .trim();

      //remove feeback items from the list if company names are not equal
      if (companyNameFromHashtag !== companyNameFromFeedbackItem) {
        childNode.remove();
      }
    });
  };
  hastagListEl.addEventListener("click", clickHandler);
})();
