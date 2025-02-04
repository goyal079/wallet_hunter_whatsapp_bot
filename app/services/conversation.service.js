const { db } = require("../../config/database");
const moment = require("moment");
// Aligned with our actual models
const CONVERSATION_STATES = {
  INIT: "INIT",
  // Core Required Fields
  COLLECTING_SAMAJ: "COLLECTING_SAMAJ",
  COLLECTING_NAME: "COLLECTING_NAME",
  COLLECTING_GENDER: "COLLECTING_GENDER",
  COLLECTING_AGE: "COLLECTING_AGE",
  COLLECTING_BLOOD_GROUP: "COLLECTING_BLOOD_GROUP",
  COLLECTING_MOBILE1: "COLLECTING_MOBILE1",
  COLLECTING_MOBILE2: "COLLECTING_MOBILE2",
  // Optional Fields
  COLLECTING_MARITAL_STATUS: "COLLECTING_MARITAL_STATUS",
  COLLECTING_MARRIAGE_DATE: "COLLECTING_MARRIAGE_DATE",
  COLLECTING_FATHER_NAME: "COLLECTING_FATHER_NAME",
  COLLECTING_MOTHER_NAME: "COLLECTING_MOTHER_NAME",
  COLLECTING_MOTHER_TONGUE: "COLLECTING_MOTHER_TONGUE",
  COLLECTING_DOB: "COLLECTING_DOB",
  COLLECTING_EMAIL: "COLLECTING_EMAIL",
  COLLECTING_AADHAR: "COLLECTING_AADHAR",
  COLLECTING_PAN: "COLLECTING_PAN",
  COLLECTING_EDUCATION: "COLLECTING_EDUCATION",
  COLLECTING_OCCUPATION: "COLLECTING_OCCUPATION",
  COLLECTING_ANNUAL_INCOME: "COLLECTING_ANNUAL_INCOME",
  COLLECTING_BUSINESS_DETAILS: "COLLECTING_BUSINESS_DETAILS",
  COLLECTING_GOTRA: "COLLECTING_GOTRA",
  COLLECTING_DIETARY_PREFERENCE: "COLLECTING_DIETARY_PREFERENCE",
  COLLECTING_NATIVE_PLACE: "COLLECTING_NATIVE_PLACE",
  COLLECTING_CURRENT_ADDRESS: "COLLECTING_CURRENT_ADDRESS",
  COLLECTING_EMERGENCY_NAME: "COLLECTING_EMERGENCY_NAME",
  COLLECTING_EMERGENCY_NUMBER: "COLLECTING_EMERGENCY_NUMBER",
  COLLECTING_HEALTH_INSURANCE: "COLLECTING_HEALTH_INSURANCE",
  COLLECTING_HEALTH_CONDITIONS: "COLLECTING_HEALTH_CONDITIONS",
  CONFIRMATION: "CONFIRMATION",
  COMPLETED: "COMPLETED",
};

const MESSAGES = {
  WELCOME:
    "Welcome to Family Information Collection Bot!\nPlease type 'start' to begin.",

  // Core Information
  ASK_SAMAJ: "Please enter your Samaj name:",
  ASK_NAME: "Please enter your full name:",
  ASK_GENDER: "Please select your gender:\n1. Male\n2. Female\n3. Other",
  ASK_AGE: "Please enter your age (between 0-120):",
  ASK_BLOOD_GROUP:
    "Please enter your blood group (A+, A-, B+, B-, AB+, AB-, O+, O-):",
  ASK_MOBILE1: "Please enter your primary mobile number (10 digits):",
  ASK_MOBILE2:
    "Please enter your secondary mobile number (10 digits or type 'skip'):",
  ASK_DOB: "Please enter your date of birth (DD-MM-YYYY) or type 'skip':",

  // Documents
  ASK_AADHAR: "Please enter your Aadhar number or type 'skip':",
  ASK_PAN: "Please enter your PAN number or type 'skip':",

  // Education & Career
  ASK_EDUCATION:
    "Please enter your highest education qualification or type 'skip':",
  ASK_OCCUPATION: "Please enter your occupation or type 'skip':",
  ASK_ANNUAL_INCOME: "Please enter your annual income or type 'skip':",
  ASK_BUSINESS_DETAILS: "Please enter your business details or type 'skip':",

  // Religious & Cultural
  ASK_GOTRA: "Please enter your Gotra or type 'skip':",
  ASK_DIETARY_PREFERENCE:
    "Please select your dietary preference (or type 'skip'):\n1. Vegetarian\n2. Jain\n3. Non-Vegetarian",
  ASK_MARITAL_STATUS:
    "Please select your marital status:\n1. Single\n2. Married\n3. Widowed\n4. Divorced",
  ASK_MARRIAGE_DATE:
    "Please enter your date of marriage (DD-MM-YYYY) or type 'skip':",
  ASK_FATHER_NAME: "Please enter your father's name or type 'skip':",
  ASK_MOTHER_NAME: "Please enter your mother's name or type 'skip':",
  ASK_MOTHER_TONGUE: "Please enter your mother tongue or type 'skip':",
  INVALID_MARITAL_STATUS:
    "Invalid selection. Please choose 1 for Single, 2 for Married, 3 for Widowed, or 4 for Divorced",

  // Location & Contact
  ASK_NATIVE_PLACE: "Please enter your native place or type 'skip':",
  ASK_CURRENT_ADDRESS: "Please enter your current address or type 'skip':",
  ASK_EMAIL: "Please enter your email address or type 'skip':",

  // Health & Emergency
  ASK_EMERGENCY_NAME: "Please enter emergency contact name or type 'skip':",
  ASK_EMERGENCY_NUMBER: "Please enter emergency contact number or type 'skip':",
  ASK_HEALTH_INSURANCE: "Please enter health insurance details or type 'skip':",
  ASK_HEALTH_CONDITIONS: "Please enter any health conditions or type 'skip':",

  // Validation Messages
  INVALID_INPUT: "Invalid input. Please try again.",
  INVALID_MOBILE: "Please enter a valid 10-digit mobile number.",
  INVALID_EMAIL: "Please enter a valid email address or type 'skip'.",
  INVALID_AGE: "Please enter a valid age between 0 and 120.",
  INVALID_BLOOD_GROUP:
    "Invalid blood group. Please enter one of: A+, A-, B+, B-, AB+, AB-, O+, O-",
  INVALID_DATE: "Invalid date format. Please use DD-MM-YYYY format.",
  INVALID_AADHAR:
    "Invalid Aadhar number. Please enter a valid 12-digit number or type 'skip'.",
  INVALID_PAN:
    "Invalid PAN number. Format should be ABCDE1234F or type 'skip'.",

  // Confirmation
  CONFIRM:
    "Please review your information:\n{}\nIs this correct? (Type 'yes' to confirm or 'no' to restart)",
  SUCCESS: "Thank you! Your information has been saved successfully.",
  RESTART: "Let's start over. Type 'start' when ready.",
};

// Validation Functions
const validations = {
  isValidMobile: (number) => /^[0-9]{10}$/.test(number),
  isValidEmail: (email) =>
    email === "skip" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidAge: (age) => !isNaN(age) && age >= 0 && age <= 120,
  isValidBloodGroup: (bg) =>
    ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(
      bg.toUpperCase()
    ),
  isValidDate: (date) => {
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (!regex.test(date)) return false;
    const [_, day, month, year] = date.match(regex);
    const d = new Date(year, month - 1, day);
    return d && d.getMonth() === month - 1 && d.getDate() === parseInt(day);
  },
  isValidMaritalStatus: (status) => ["1", "2", "3", "4"].includes(status),

  isValidAadhar: (number) => {
    if (number.toLowerCase() === "skip") return true;

    // Remove spaces and check if it's 12 digits
    const cleanNumber = number.replace(/\s/g, "");
    return /^[0-9]{12}$/.test(cleanNumber);
  },
  isValidPAN: (pan) => {
    if (pan.toLowerCase() === "skip") return true;

    // PAN format: ABCDE1234F
    // First 5 characters are letters
    // Next 4 are numbers
    // Last character is a letter
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
  },
};

// Helper Functions
async function updateConversation(conversation, newState, newData = null) {
  try {
    conversation.currentState = newState;

    if (newData) {
      conversation.tempData = {
        ...conversation.tempData,
        ...newData,
      };
    }

    await conversation.save();
    console.log("Updated conversation:", {
      state: newState,
      tempData: conversation.tempData,
    });
  } catch (error) {
    console.error("Error updating conversation:", error);
    throw error;
  }
}

async function findOrCreateFamily(samajId, memberName) {
  // Split the full name into parts
  const nameParts = memberName.trim().split(" ");
  const lastName = nameParts[nameParts.length - 1]; // Get last name

  try {
    // First try to find existing family with same last name in same samaj
    let family = await db.Family.findOne({
      where: {
        samajId: samajId,
        lastName: lastName,
      },
    });

    // If no family exists, create new one
    if (!family) {
      family = await db.Family.create({
        samajId: samajId,
        lastName: lastName,
        name: `${lastName} Family`,
      });
    }

    return family;
  } catch (error) {
    console.error("Error in findOrCreateFamily:", error);
    throw error;
  }
}

async function saveInformation(conversation) {
  const { tempData } = conversation;
  console.log("Attempting to save data:", tempData);

  try {
    // Validate required fields
    const requiredFields = [
      "samaj",
      "name",
      "gender",
      "age",
      "bloodGroup",
      "mobile1",
    ];
    const missingFields = requiredFields.filter((field) => !tempData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Find or create samaj
    const [samaj] = await db.Samaj.findOrCreate({
      where: { name: tempData.samaj },
    });

    // Find or create family based on last name
    const family = await findOrCreateFamily(samaj.id, tempData.name);

    // Format date if it exists
    const formattedData = {
      ...tempData,
      dateOfBirth: tempData.dateOfBirth
        ? moment(tempData.dateOfBirth, "DD-MM-YYYY").format("YYYY-MM-DD")
        : null,
    };

    const member = await db.Member.create({
      ...formattedData,
      samajId: samaj.id,
      familyId: family.id,
    });

    return member;
  } catch (error) {
    console.error("Error saving information:", error);
    throw new Error(`Failed to save information: ${error.message}`);
  }
}

// Main Message Handler
async function handleMessage(from, message) {
  try {
    console.log("Received message:", { from, message });

    let conversation = await db.Conversation.findOne({
      where: { whatsappNumber: from },
    });

    if (!conversation) {
      console.log("Creating new conversation");
      conversation = await db.Conversation.create({
        whatsappNumber: from,
        currentState: CONVERSATION_STATES.INIT,
        tempData: {},
      });
    }

    console.log("Current state:", conversation.currentState);
    console.log("Current tempData:", conversation.tempData);

    switch (conversation.currentState) {
      case CONVERSATION_STATES.INIT:
        if (message.toLowerCase() === "start") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_SAMAJ
          );
          return MESSAGES.ASK_SAMAJ;
        }
        return MESSAGES.WELCOME;

      case CONVERSATION_STATES.COLLECTING_SAMAJ:
        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_NAME,
          {
            samaj: message,
          }
        );
        return MESSAGES.ASK_NAME;

      case CONVERSATION_STATES.COLLECTING_NAME:
        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_GENDER,
          {
            name: message,
          }
        );
        return MESSAGES.ASK_GENDER;

      case CONVERSATION_STATES.COLLECTING_GENDER:
        const genderMap = { 1: "Male", 2: "Female", 3: "Other" };
        const gender = genderMap[message];
        if (!gender) return MESSAGES.INVALID_INPUT;

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_AGE,
          {
            gender: gender,
          }
        );
        return MESSAGES.ASK_AGE;

      case CONVERSATION_STATES.COLLECTING_AGE:
        if (!validations.isValidAge(parseInt(message)))
          return MESSAGES.INVALID_AGE;

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_BLOOD_GROUP,
          {
            age: parseInt(message),
          }
        );
        return MESSAGES.ASK_BLOOD_GROUP;

      case CONVERSATION_STATES.COLLECTING_BLOOD_GROUP:
        if (!validations.isValidBloodGroup(message))
          return MESSAGES.INVALID_BLOOD_GROUP;

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_MOBILE1,
          {
            bloodGroup: message.toUpperCase(),
          }
        );
        return MESSAGES.ASK_MOBILE1;

      case CONVERSATION_STATES.COLLECTING_MOBILE1:
        if (!validations.isValidMobile(message)) return MESSAGES.INVALID_MOBILE;

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_MOBILE2,
          {
            mobile1: message,
          }
        );
        return MESSAGES.ASK_MOBILE2;

      case CONVERSATION_STATES.COLLECTING_MOBILE2:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_FATHER_NAME,
            {
              mobile2: null,
            }
          );
          return MESSAGES.ASK_FATHER_NAME;
        }

        if (!validations.isValidMobile(message)) {
          return MESSAGES.INVALID_MOBILE;
        }

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_FATHER_NAME,
          {
            mobile2: message,
          }
        );
        return MESSAGES.ASK_FATHER_NAME;

      case CONVERSATION_STATES.COLLECTING_FATHER_NAME:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_MOTHER_NAME,
            {
              fatherName: null,
            }
          );
          return MESSAGES.ASK_MOTHER_NAME;
        }

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_MOTHER_NAME,
          {
            fatherName: message.trim(),
          }
        );
        return MESSAGES.ASK_MOTHER_NAME;

      case CONVERSATION_STATES.COLLECTING_MOTHER_NAME:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_MOTHER_TONGUE,
            {
              motherName: null,
            }
          );
          return MESSAGES.ASK_MOTHER_TONGUE;
        }

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_MOTHER_TONGUE,
          {
            motherName: message.trim(),
          }
        );
        return MESSAGES.ASK_MOTHER_TONGUE;

      case CONVERSATION_STATES.COLLECTING_MOTHER_TONGUE:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_DOB,
            {
              motherTongue: null,
            }
          );
          return MESSAGES.ASK_DOB;
        }

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_DOB,
          {
            motherTongue: message.trim(),
          }
        );
        return MESSAGES.ASK_DOB;

      case CONVERSATION_STATES.COLLECTING_DOB:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_EMAIL,
            {
              dateOfBirth: null,
            }
          );
          return MESSAGES.ASK_EMAIL;
        }
        if (!validations.isValidDate(message)) return MESSAGES.INVALID_DATE;

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_EMAIL,
          {
            dateOfBirth: message,
          }
        );
        return MESSAGES.ASK_EMAIL;

      case CONVERSATION_STATES.COLLECTING_EMAIL:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_AADHAR,
            {
              email: null,
            }
          );
          return MESSAGES.ASK_AADHAR;
        }

        if (!validations.isValidEmail(message)) {
          return MESSAGES.INVALID_EMAIL;
        }

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_AADHAR,
          {
            email: message.toLowerCase(),
          }
        );
        return MESSAGES.ASK_AADHAR;

      case CONVERSATION_STATES.COLLECTING_AADHAR:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_PAN,
            {
              aadharNumber: null,
            }
          );
          return MESSAGES.ASK_PAN;
        }
        if (!validations.isValidAadhar(message)) {
          return MESSAGES.INVALID_AADHAR;
        }

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_PAN,
          {
            aadharNumber: message.replace(/\s/g, ""),
          }
        );
        return MESSAGES.ASK_PAN;

      case CONVERSATION_STATES.COLLECTING_PAN:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_EDUCATION,
            {
              panNumber: null,
            }
          );
          return MESSAGES.ASK_EDUCATION;
        }

        if (!validations.isValidPAN(message)) {
          return MESSAGES.INVALID_PAN;
        }

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_EDUCATION,
          {
            panNumber: message.toUpperCase(),
          }
        );
        return MESSAGES.ASK_EDUCATION;

      case CONVERSATION_STATES.COLLECTING_EDUCATION:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_OCCUPATION,
            {
              education: null,
            }
          );
          return MESSAGES.ASK_OCCUPATION;
        }

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_OCCUPATION,
          {
            education: message.trim(),
          }
        );
        return MESSAGES.ASK_OCCUPATION;

      case CONVERSATION_STATES.COLLECTING_OCCUPATION:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_ANNUAL_INCOME,
            {
              occupation: null,
            }
          );
          return MESSAGES.ASK_ANNUAL_INCOME;
        }

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_ANNUAL_INCOME,
          {
            occupation: message.trim(),
          }
        );
        return MESSAGES.ASK_ANNUAL_INCOME;

      case CONVERSATION_STATES.COLLECTING_ANNUAL_INCOME:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_BUSINESS_DETAILS,
            {
              annualIncome: null,
            }
          );
          return MESSAGES.ASK_BUSINESS_DETAILS;
        }

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_BUSINESS_DETAILS,
          {
            annualIncome: message.trim(),
          }
        );
        return MESSAGES.ASK_BUSINESS_DETAILS;

      case CONVERSATION_STATES.COLLECTING_BUSINESS_DETAILS:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_GOTRA,
            {
              businessDetails: null,
            }
          );
          return MESSAGES.ASK_GOTRA;
        }
        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_GOTRA,
          {
            businessDetails: message.trim(),
          }
        );
        return MESSAGES.ASK_GOTRA;

      case CONVERSATION_STATES.COLLECTING_GOTRA:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_DIETARY_PREFERENCE,
            {
              gotra: null,
            }
          );
          return MESSAGES.ASK_DIETARY_PREFERENCE;
        }
        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_DIETARY_PREFERENCE,
          {
            gotra: message.trim(),
          }
        );
        return MESSAGES.ASK_DIETARY_PREFERENCE;

      case CONVERSATION_STATES.COLLECTING_DIETARY_PREFERENCE:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_NATIVE_PLACE,
            {
              dietaryPreference: null,
            }
          );
          return MESSAGES.ASK_NATIVE_PLACE;
        }

        const dietaryMap = { 1: "Vegetarian", 2: "Jain", 3: "Non-Vegetarian" };
        const diet = dietaryMap[message];
        if (!diet) return MESSAGES.INVALID_INPUT;

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_NATIVE_PLACE,
          {
            dietaryPreference: diet,
          }
        );
        return MESSAGES.ASK_NATIVE_PLACE;

      case CONVERSATION_STATES.COLLECTING_NATIVE_PLACE:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_CURRENT_ADDRESS,
            {
              nativePlace: null,
            }
          );
          return MESSAGES.ASK_CURRENT_ADDRESS;
        }
        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_CURRENT_ADDRESS,
          {
            nativePlace: message.trim(),
          }
        );
        return MESSAGES.ASK_CURRENT_ADDRESS;

      case CONVERSATION_STATES.COLLECTING_CURRENT_ADDRESS:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_EMERGENCY_NAME,
            {
              currentResidentialAddress: null,
            }
          );
          return MESSAGES.ASK_EMERGENCY_NAME;
        }
        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_EMERGENCY_NAME,
          {
            currentResidentialAddress: message.trim(),
          }
        );
        return MESSAGES.ASK_EMERGENCY_NAME;

      case CONVERSATION_STATES.COLLECTING_EMERGENCY_NAME:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_EMERGENCY_NUMBER,
            {
              emergencyName: null,
            }
          );
          return MESSAGES.ASK_EMERGENCY_NUMBER;
        }
        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_EMERGENCY_NUMBER,
          {
            emergencyName: message.trim(),
          }
        );
        return MESSAGES.ASK_EMERGENCY_NUMBER;

      case CONVERSATION_STATES.COLLECTING_EMERGENCY_NUMBER:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_HEALTH_INSURANCE,
            {
              emergencyName: null,
            }
          );
          return MESSAGES.ASK_HEALTH_INSURANCE;
        }
        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_HEALTH_INSURANCE,
          {
            emergencyNumber: message.trim(),
          }
        );
        return MESSAGES.ASK_HEALTH_INSURANCE;

      case CONVERSATION_STATES.COLLECTING_HEALTH_INSURANCE:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.COLLECTING_HEALTH_CONDITIONS,
            {
              healthInsurance: null,
            }
          );
          return MESSAGES.ASK_HEALTH_CONDITIONS;
        }
        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_HEALTH_CONDITIONS,
          {
            healthInsurance: message.trim(),
          }
        );
        return MESSAGES.ASK_HEALTH_CONDITIONS;

      case CONVERSATION_STATES.COLLECTING_HEALTH_CONDITIONS:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            // CONVERSATION_STATES.CONFIRMATION,
            CONVERSATION_STATES.COLLECTING_MARITAL_STATUS,
            {
              healthConditions: null,
            }
          );
          return MESSAGES.ASK_MARITAL_STATUS;
        }

        await updateConversation(
          conversation,
          CONVERSATION_STATES.COLLECTING_MARITAL_STATUS,
          {
            healthConditions: message.trim(),
          }
        );
        return MESSAGES.ASK_MARITAL_STATUS;

      case CONVERSATION_STATES.COLLECTING_MARITAL_STATUS:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.CONFIRMATION,
            {
              maritalStatus: null,
            }
          );
          return formatConfirmationMessage(conversation.tempData);
        }

        if (!validations.isValidMaritalStatus(message)) {
          return MESSAGES.INVALID_MARITAL_STATUS;
        }

        const maritalStatusMap = {
          1: "Single",
          2: "Married",
          3: "Widowed",
          4: "Divorced",
        };

        const maritalStatus = maritalStatusMap[message];
        await updateConversation(
          conversation,
          maritalStatus === "Married"
            ? CONVERSATION_STATES.COLLECTING_MARRIAGE_DATE
            : CONVERSATION_STATES.CONFIRMATION,
          { maritalStatus }
        );

        return maritalStatus === "Married"
          ? MESSAGES.ASK_MARRIAGE_DATE
          : formatConfirmationMessage(conversation.tempData);

      case CONVERSATION_STATES.COLLECTING_MARRIAGE_DATE:
        if (message.toLowerCase() === "skip") {
          await updateConversation(
            conversation,
            CONVERSATION_STATES.CONFIRMATION,
            {
              dateOfMarriage: null,
            }
          );
          return formatConfirmationMessage(conversation.tempData);
        }

        if (!validations.isValidDate(message)) {
          return MESSAGES.INVALID_DATE;
        }

        await updateConversation(
          conversation,
          CONVERSATION_STATES.CONFIRMATION,
          {
            dateOfMarriage: message,
          }
        );
        return formatConfirmationMessage(conversation.tempData);

      case CONVERSATION_STATES.CONFIRMATION:
        if (message.toLowerCase() === "yes") {
          console.log("Final tempData before saving:", conversation.tempData);
          await saveInformation(conversation);
          await updateConversation(conversation, CONVERSATION_STATES.COMPLETED);
          return MESSAGES.SUCCESS;
        } else {
          await updateConversation(conversation, CONVERSATION_STATES.INIT, {});
          return MESSAGES.RESTART;
        }

      default:
        return MESSAGES.WELCOME;
    }
  } catch (error) {
    console.error("Error in handleMessage:", error);
    return "Sorry, there was an error. Please try again.";
  }
}

function formatConfirmationMessage(data) {
  console.log("Formatting data for confirmation:", data);

  const formatValue = (value) =>
    value === null || value === undefined ? "Skipped" : value;

  const summary = `
Please review your information:

Required Information:
-------------------
Samaj: ${formatValue(data.samaj)}
Name: ${formatValue(data.name)}
Gender: ${formatValue(data.gender)}
Age: ${formatValue(data.age)}
Blood Group: ${formatValue(data.bloodGroup)}
Primary Mobile: ${formatValue(data.mobile1)}
Secondary Mobile: ${formatValue(data.mobile2)}

Additional Information:
--------------------
Father's Name: ${formatValue(data.fatherName)}
Mother's Name: ${formatValue(data.motherName)}
Date of Birth: ${formatValue(data.dateOfBirth)}
Email: ${formatValue(data.email)}
Aadhar: ${formatValue(data.aadharNumber)}
PAN: ${formatValue(data.panNumber)}
Marital Status: ${formatValue(data.maritalStatus)}
Education: ${formatValue(data.education)}
Occupation: ${formatValue(data.occupation)}
Annual Income: ${formatValue(data.annualIncome)}
Business Details: ${formatValue(data.businessDetails)}
Gotra: ${formatValue(data.gotra)}
Dietary Preference: ${formatValue(data.dietaryPreference)}
Native Place: ${formatValue(data.nativePlace)}
Current Address: ${formatValue(data.currentResidentialAddress)}
Emergency Contact Name: ${formatValue(data.emergencyName)}
Emergency Contact Number: ${formatValue(data.emergencyNumber)}
Health Insurance: ${formatValue(data.healthInsurance)}
Health Conditions: ${formatValue(data.healthConditions)}

Is this correct? Reply 'yes' to confirm or 'no' to restart.`;

  console.log("Confirmation message:", summary);
  return summary;
}

module.exports = {
  handleMessage,
  formatConfirmationMessage,
};
