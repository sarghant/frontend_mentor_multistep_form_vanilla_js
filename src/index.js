// DOM
const listSteps = [...document.querySelectorAll("[data-list-step]")];
const stepsForm = document.querySelector("[data-steps-form]");
const steps = [...stepsForm.querySelectorAll("[data-step]")];
const stepControls = [...document.querySelectorAll(".card__footer > .btn")];
const stepEnd = document.querySelector("[data-step-end]");
const btnBack = stepControls[0];
const btnNext = stepControls[1];
let currentStep = +steps.find((step) => step.classList.contains("step_active"))
  .dataset.step;

// Personal info data (1st step)
const inputs = [...steps[0].querySelectorAll("input")];

// Plan select (2nd step)
const plans = [...steps[1].querySelectorAll(".plans__item")];
const durationToggler = steps[1].querySelector(".btn-toggle");
const billDurationSpans = [
  ...steps[1].querySelectorAll("[data-bill-duration]"),
];
const yearly = billDurationSpans.find(
    (span) => span.dataset.billDuration === "yearly"
  ),
  monthly = billDurationSpans.find(
    (span) => span.dataset.billDuration === "monthly"
  );
let isYearly = false;
let didSelectPlan = false;
let selectedPlan; //Will have the value of an object containing the name and price props of the currently selected plan

// Addon select (3rd step)
const addons = [...steps[2].querySelectorAll("[data-addon]")];
const addonPrices = [...steps[2].querySelectorAll("[data-addon-price]")];
let checkedAddons = [];
for (let addon of addons) {
  addon.addEventListener("change", (e) =>
    setCheckedAddons(e.target.checked, addon)
  );
}
//
// Summary (4th final step)
const pickedPlanName = steps[3].querySelector("[data-picked-plan]");
const pickedPlanPrice = steps[3].querySelector("[data-picked-plan-price]");
const summaryAddonsParent = steps[3].querySelector("[data-summary-addons]");
const totalElm = steps[3].querySelector("[data-total]");
const totalPriceElm = totalElm.querySelector("[data-total-price]");
const btnChange = steps[3].querySelector(".btn-change");

durationToggler.addEventListener("click", (e) => {
  e.preventDefault();
  e.target.classList.toggle("btn-toggle_yearly");
  if (e.target.classList.contains("btn-toggle_yearly")) {
    yearly.classList.add("options__option_active");
    monthly.classList.remove("options__option_active");
    plans.forEach((plan) => plan.classList.add("plans__item_yearly"));
    isYearly = true;
  } else {
    yearly.classList.remove("options__option_active");
    monthly.classList.add("options__option_active");
    plans.forEach((plan) => plan.classList.remove("plans__item_yearly"));
    isYearly = false;
  }
  setPlanPrices(isYearly);
  setAddonPrices(isYearly);
});

//Assign active css classes to selected (clicked) plans
//also retrieve the name and price of each individual plan
for (let plan of plans) {
  const selected = "plans__item_selected";

  plan.addEventListener("click", (e) => {
    e.preventDefault();
    if (plan.classList.contains(selected)) {
      plans.forEach((p) => p.classList.remove(selected));
      didSelectPlan = false;
    } else {
      plans.forEach((p) => p.classList.remove(selected)); //Remove selected class from other plans when selecting a new one (only one can be selected)
      plan.classList.add(selected);
      didSelectPlan = true;
    }
  });
}

// Setup event listeners for buttons to navigate between steps
stepControls.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    //Perform input checks for the first step
    if (currentStep === 1 && !checkInputs(inputs)) {
      highlightErrorFields(inputs);
      return;
    }
    //Check if a payment plan was selected for the second step
    if (currentStep === 2 && !didSelectPlan) return;
    //Set the name and price of the picked plan
    if (currentStep === 2) setPickedPlan();
    //Display picked addons
    if (currentStep === 3) showAddons();
    // Remove remaining error messages before progressing to the next step
    inputs.forEach((input) => input.classList.remove("error"));
    //Remove active classes prior to altering currentStep
    handleActiveSteps(currentStep - 1, true);
    //
    if (e.target.dataset.btnNext) {
      btnBack.classList.remove("btn_hide");
      currentStep++;
      if (currentStep >= steps.length) {
        changeBtnProps(true, btnNext);
      }
      handleActiveSteps(currentStep - 1);
    } else if (e.target.dataset.btnBack) {
      if (currentStep === steps.length) {
        changeBtnProps(false, btnNext);
      }
      currentStep--;
      if (currentStep === 1) {
        btnBack.classList.add("btn_hide");
      }
      handleActiveSteps(currentStep - 1);
    } else if (e.target.dataset.btnSubmit && currentStep === steps.length) {
      steps[currentStep - 1].classList.remove("step_active");
      listSteps[currentStep - 1].classList.add("step_active");
      stepControls.forEach((b) => b.classList.add("btn_hide"));
      stepEnd.classList.remove("step-end_hide");
    }
  });
});

// Go back to the second step to change the plan
btnChange.addEventListener("click", (e) => {
  e.preventDefault();
  changeBtnProps(false, btnNext);
  handleActiveSteps(currentStep - 1, true);
  currentStep = 2;
  handleActiveSteps(currentStep - 1);
});

function handleActiveSteps(current, removeClasses = false) {
  if (removeClasses) {
    steps[current].classList.remove("step_active");
    listSteps[current].classList.remove("step_active");
  } else {
    steps[current].classList.add("step_active");
    listSteps[current].classList.add("step_active");
  }
}

function checkInputs(inputs) {
  return inputs.every((input) => input.checkValidity());
}

function highlightErrorFields(inputs) {
  for (let input of inputs) {
    const messageSpan = input.nextElementSibling;
    if (!input.checkValidity()) {
      input.classList.add("error");
      messageSpan.innerText = "This field is required";
      if (input.type === "email" && input.value.length > 0)
        messageSpan.innerText = "Must be a valid email";
      if (input.type === "tel" && input.value.length > 0)
        messageSpan.innerText = "Must be a valid phone number";
    } else input.classList.remove("error");
  }
}
function setPlanPrices(yearly = false) {
  for (let p of plans) {
    const priceElm = p.querySelector("[data-plan-price]");
    let price = +priceElm.dataset.planPrice;
    if (yearly) price *= 10;
    else price /= 10;
    priceElm.setAttribute("data-plan-price", price);
    priceElm.innerHTML = `$${price}/mo`;
  }
}

function setPickedPlan() {
  const plan = plans.find((p) => p.classList.contains("plans__item_selected"));
  const name = plan.querySelector("[data-plan-name]").dataset.planName;
  const price = +plan.querySelector("[data-plan-price]").dataset.planPrice;
  selectedPlan = { name, price };
  pickedPlanName.innerHTML = `${selectedPlan.name} (${
    isYearly ? "Yearly" : "Monthly"
  })`;
  pickedPlanPrice.innerHTML = `$${selectedPlan.price}/${
    isYearly ? "yr" : "mo"
  }`;
}

function showAddons() {
  // Clear the parent element upon calling the function again to avoid duplication
  summaryAddonsParent.innerHTML = "";
  let addonsTotalPrice = 0;
  for (let o of checkedAddons) {
    const name = o.addon.querySelector("[data-addon-name]").dataset.addonName;
    const price =
      +o.addon.querySelector("[data-addon-price]").dataset.addonPrice;
    const div = document.createElement("div");
    addonsTotalPrice += price;
    div.className = "summary__addon mb-2";
    div.innerHTML = `
    <h5>${name}</h5>
                  <span class="summary__addon__price">+$${price}/${
      isYearly ? "yr" : "mo"
    }</span>
    `;
    summaryAddonsParent.append(div);
  }
  displayTotal(selectedPlan.price, addonsTotalPrice);
}

function displayTotal(planPrice, addonsPrice) {
  const totalPrice = planPrice + addonsPrice;
  totalElm.querySelector("h5").innerHTML = `Total (per ${
    isYearly ? "year" : "month"
  })`;
  totalPriceElm.innerHTML = `+$${totalPrice}/${isYearly ? "yr" : "mo"}`;
}

function setAddonPrices(yearly = false) {
  for (let a of addonPrices) {
    let price = a.dataset.addonPrice;
    if (yearly) price *= 10;
    else price /= 10;
    a.setAttribute("data-addon-price", price);
    a.innerHTML = `+$${price}/mo`;
  }
}

function setCheckedAddons(checked, addon) {
  const id = addon.dataset.addon;
  if (checked)
    checkedAddons.push({
      id,
      addon,
    });
  else checkedAddons = checkedAddons.filter((a) => a.id !== id);
}

// Transform the next button into a confirm(submit) button or the other way around.
function changeBtnProps(submit, btn) {
  if (submit) {
    btn.className = "btn btn-submit";
    btn.innerText = "Confirm";
    btn.setAttribute("data-btn-submit", "submit");
    btn.removeAttribute("data-btn-next");
  } else {
    btn.className = "btn btn-next";
    btn.innerText = "Next";
    btn.setAttribute("data-btn-next", "next");
    btn.removeAttribute("data-btn-submit");
  }
}
