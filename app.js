const prices = {
  propertyBase: {
    unit: 200,
    townhouse: 280,
    house: 330
  },
  bedroom: 65,
  bathroom: 50,
  carpetRoom: 35,
  carpetMinimum: 90,
  pestControl: 160,
  walls: {
    standard: 0,
    light: 40,
    heavy: 90
  },
  oven: {
    standard: 0,
    detail: 45,
    heavy: 85
  },
  petHair: 45,
  heavyDust: 60
};

const labels = {
  propertyType: {
    unit: "unit / apartment",
    townhouse: "townhouse",
    house: "house"
  },
  walls: {
    standard: "standard wall marks",
    light: "extra wall spot cleaning",
    heavy: "heavy wall marks"
  },
  oven: {
    standard: "standard oven condition",
    detail: "oven needing extra detail",
    heavy: "heavy oven grease"
  }
};

const fields = {
  propertyType: document.querySelector("#propertyType"),
  bedrooms: document.querySelector("#bedrooms"),
  bathrooms: document.querySelector("#bathrooms"),
  carpetRooms: document.querySelector("#carpetRooms"),
  pestControl: document.querySelector("#pestControl"),
  wallCondition: document.querySelector("#wallCondition"),
  ovenCondition: document.querySelector("#ovenCondition"),
  petHair: document.querySelector("#petHair"),
  heavyDust: document.querySelector("#heavyDust")
};

const priceOutput = document.querySelector("#price");
const summaryOutput = document.querySelector("#summary");
const messageOutput = document.querySelector("#customerMessage");
const copyButton = document.querySelector("#copyButton");
const copyStatus = document.querySelector("#copyStatus");
const confirmationFields = {
  customerName: document.querySelector("#customerName"),
  propertyAddress: document.querySelector("#propertyAddress"),
  cleaningDate: document.querySelector("#cleaningDate"),
  startTime: document.querySelector("#startTime"),
  startingPrice: document.querySelector("#startingPrice"),
  depositRequired: document.querySelector("#depositRequired"),
  paymentCondition: document.querySelector("#paymentCondition"),
  extraChargeNotice: document.querySelector("#extraChargeNotice")
};
const confirmationEmail = document.querySelector("#confirmationEmail");
const smsMessage = document.querySelector("#smsMessage");

function money(amount) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0
  }).format(amount);
}

function getQuote() {
  const propertyType = fields.propertyType.value;
  const bedrooms = Number(fields.bedrooms.value);
  const bathrooms = Number(fields.bathrooms.value);
  const carpetRooms = Number(fields.carpetRooms.value);
  const pestControl = fields.pestControl.value === "yes";
  const wallCondition = fields.wallCondition.value;
  const ovenCondition = fields.ovenCondition.value;
  const petHair = fields.petHair.checked;
  const heavyDust = fields.heavyDust.checked;

  let total = prices.propertyBase[propertyType] + bedrooms * prices.bedroom + bathrooms * prices.bathroom;
  const items = ["bond cleaning"];
  const conditionItems = [labels.walls[wallCondition], labels.oven[ovenCondition]];

  if (carpetRooms > 0) {
    total += Math.max(carpetRooms * prices.carpetRoom, prices.carpetMinimum);
    items.push(`carpet steam cleaning for ${carpetRooms} room${carpetRooms === 1 ? "" : "s"}`);
  }

  if (pestControl) {
    total += prices.pestControl;
    items.push("pest control");
  }

  total += prices.walls[wallCondition] + prices.oven[ovenCondition];

  if (petHair) {
    total += prices.petHair;
    conditionItems.push("pet hair");
  }

  if (heavyDust) {
    total += prices.heavyDust;
    conditionItems.push("heavy dust");
  }

  return {
    total,
    propertyType,
    bedrooms,
    bathrooms,
    carpetRooms,
    pestControl,
    wallCondition,
    ovenCondition,
    petHair,
    heavyDust,
    items,
    conditionItems
  };
}

function buildMessage(quote) {
  const serviceList = quote.items.join(", ");
  const carpetText = quote.carpetRooms > 0 ? `${quote.carpetRooms} carpeted room${quote.carpetRooms === 1 ? "" : "s"}` : "no carpet steam cleaning selected";
  const pestText = quote.pestControl ? "pest control included" : "pest control not included";
  const conditionText = quote.conditionItems.join(", ");

  return `Hi, thanks for your enquiry with Franklean Cleaning.

Based on the details provided, the estimated starting price is ${money(quote.total)} for ${serviceList}.

Property details: ${quote.bedrooms} bedroom${quote.bedrooms === 1 ? "" : "s"}, ${quote.bathrooms} bathroom${quote.bathrooms === 1 ? "" : "s"}, ${labels.propertyType[quote.propertyType]}, ${carpetText}, ${pestText}. Condition notes: ${conditionText}.

Please note this is a starting price only. The final price must be confirmed after inspection or discussion before cleaning starts.

Extra charges may apply depending on property condition, including walls, oven, rangehood, windows, tracks, shower screens, pet hair, mould, heavy dust, and additional requests.

Blinds, curtains, ceilings, rubbish removal, and non-standard cleaning are excluded unless agreed separately.`;
}

function updateQuote() {
  const quote = getQuote();
  priceOutput.textContent = `from ${money(quote.total)}`;
  summaryOutput.textContent = `${quote.bedrooms} bedroom ${labels.propertyType[quote.propertyType]} with ${quote.bathrooms} bathroom${quote.bathrooms === 1 ? "" : "s"}.`;
  messageOutput.value = buildMessage(quote);
  copyStatus.textContent = "";
}

async function copyMessage() {
  await copyText(messageOutput, copyStatus, "Message copied.");
}

async function copyText(source, status, successMessage) {
  try {
    await navigator.clipboard.writeText(source.value);
    status.textContent = successMessage;
  } catch (error) {
    source.select();
    document.execCommand("copy");
    status.textContent = successMessage;
  }
}

function getFieldValue(field, fallback) {
  return field.value.trim() || fallback;
}

function formatDate(value) {
  if (!value) {
    return "the scheduled cleaning date";
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatTime(value) {
  if (!value) {
    return "the agreed start time";
  }

  const [hour, minute] = value.split(":").map(Number);
  const date = new Date(2026, 0, 1, hour, minute);

  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatStartingPrice(value) {
  const amount = Number(value);
  return amount > 0 ? money(amount) : "the agreed starting price";
}

function getConfirmationDetails() {
  const depositRequired = confirmationFields.depositRequired.value === "yes";

  return {
    customerName: getFieldValue(confirmationFields.customerName, "Customer"),
    propertyAddress: getFieldValue(confirmationFields.propertyAddress, "the property address provided"),
    cleaningDate: formatDate(confirmationFields.cleaningDate.value),
    startTime: formatTime(confirmationFields.startTime.value),
    startingPrice: formatStartingPrice(confirmationFields.startingPrice.value),
    depositRequired,
    depositText: depositRequired
      ? "A deposit is required as specified to secure this booking."
      : "No deposit is required unless specified.",
    paymentCondition: getFieldValue(
      confirmationFields.paymentCondition,
      "Bank transfer, cash, or card as agreed."
    ),
    extraChargeNotice: getFieldValue(
      confirmationFields.extraChargeNotice,
      "Extra charges may apply depending on property condition."
    )
  };
}

function buildConfirmationEmail(details) {
  return `Subject: Cleaning Booking Confirmation

Hi ${details.customerName},

Thank you for booking with Franklean Cleaning. This email confirms your cleaning appointment for ${details.propertyAddress}.

Booking details:
Date: ${details.cleaningDate}
Start time: ${details.startTime}
Starting price: ${details.startingPrice}

${details.depositText}

Please note the final price will be discussed and agreed on the day before cleaning starts. Payment must be completed after final price agreement and before cleaning starts.

Payment condition: ${details.paymentCondition}

${details.extraChargeNotice}

Please let us know if you have any questions.

Kind regards,
Franklean Cleaning`;
}

function buildSms(details) {
  return `Hi ${details.customerName}, Franklean Cleaning confirms your booking at ${details.propertyAddress} on ${details.cleaningDate} at ${details.startTime}. Starting price: ${details.startingPrice}. ${details.depositText} Final price will be discussed and agreed on the day before cleaning starts. Payment must be completed after final price agreement and before cleaning starts. Payment condition: ${details.paymentCondition}. Extra charges may apply depending on property condition. Please let us know if you have any questions.`;
}

function updateConfirmationMessages() {
  const details = getConfirmationDetails();
  confirmationEmail.value = buildConfirmationEmail(details);
  smsMessage.value = buildSms(details);
  document.querySelector("#emailCopyStatus").textContent = "";
  document.querySelector("#smsCopyStatus").textContent = "";
}

document.querySelector("#quoteForm").addEventListener("input", updateQuote);
copyButton.addEventListener("click", copyMessage);
document.querySelector("#confirmationForm").addEventListener("input", updateConfirmationMessages);
document.querySelectorAll(".copy-result").forEach((button) => {
  button.addEventListener("click", () => {
    const source = document.querySelector(`#${button.dataset.copyTarget}`);
    const status = document.querySelector(`#${button.dataset.statusTarget}`);
    copyText(source, status, "Copied.");
  });
});

updateQuote();
updateConfirmationMessages();
