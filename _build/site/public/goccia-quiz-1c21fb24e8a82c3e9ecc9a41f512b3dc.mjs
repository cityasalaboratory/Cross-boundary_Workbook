function render({ model, el }) {
  const question = model.get("question");
  const choices = model.get("choices");
  if (typeof question !== "string" || !Array.isArray(choices) || choices.length === 0) {
    throw new Error("The La Goccia quiz needs a question and at least one choice.");
  }
  if (
    choices.some(
      (choice) =>
        typeof choice.letter !== "string" ||
        typeof choice.answer !== "string" ||
        typeof choice.reflection !== "string",
    )
  ) {
    throw new Error("Each La Goccia quiz choice needs a letter, answer, and reflection.");
  }

  const form = document.createElement("form");
  const fieldset = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = question;
  fieldset.append(legend);

  const options = choices.map((choice, index) => {
    const option = document.createElement("div");
    option.className = "quiz-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "goccia-observe";
    input.value = choice.letter;
    input.id = `goccia-observe-${index}`;
    input.required = index === 0;

    const label = document.createElement("label");
    label.htmlFor = input.id;
    const letter = document.createElement("strong");
    letter.textContent = `${choice.letter}. `;
    const answer = document.createElement("span");
    answer.textContent = choice.answer;
    label.append(letter, answer);

    const reflection = document.createElement("p");
    reflection.className = "quiz-reflection";
    reflection.textContent = choice.reflection;
    reflection.hidden = true;
    reflection.setAttribute("aria-live", "polite");

    option.append(input, label, reflection);
    fieldset.append(option);
    return { input, option, reflection };
  });

  const submit = document.createElement("button");
  submit.className = "quiz-submit";
  submit.type = "submit";
  submit.textContent = "Show reflection";

  const status = document.createElement("p");
  status.className = "quiz-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  form.append(fieldset, submit);
  form.addEventListener("change", () => {
    status.textContent = "";
    options.forEach(({ option, reflection }) => {
      option.classList.remove("is-selected");
      reflection.hidden = true;
    });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = options.find(({ input }) => input.checked);
    if (!selected) {
      status.textContent = "Select an option to see its reflection.";
      return;
    }
    selected.option.classList.add("is-selected");
    selected.reflection.hidden = false;
    status.textContent = `Reflection for option ${selected.input.value}. There is no single correct answer; each framing highlights some aspects and leaves others out.`;
  });

  el.classList.add("goccia-quiz");
  el.replaceChildren(form, status);
}

export default { render };
