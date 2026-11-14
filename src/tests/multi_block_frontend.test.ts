import assert from "node:assert";
import { adaptApiPage } from "../features/forms/model/adapters.ts";
import { defaultAddressPages, defaultContactInfoPages, defaultSettingsForType } from "../features/forms/model/page-defaults.ts";
import { validatePage, validateBlock } from "../shared/hooks/useFormValidation.ts";
import { resolveFormLogic, countRulesForPage } from "../shared/utils/formLogic.ts";
import { npsGroups, percent, tally } from "../pages/FormResponse/components/summaryMath.ts";
import { countryFromLocale, flagEmoji } from "../shared/constants/countries.ts";
import { countryPhoneFromTimezone, findCountryPhone, formatNationalNumber, maxNationalDigits } from "../shared/constants/country-phone.ts";
import { formatSliderNumber } from "../shared/utils/slider.ts";
import type { FormPage as ApiPage } from "../entities/form/model/types.ts";
import type { FormPage, FormLogicRule } from "../shared/types/common.ts";

console.log("--- Starting Frontend Multi-Block & UI Tests ---");

// Test 1: adaptApiPage with multiple blocks
{
  const mockApiPage: ApiPage = {
    _id: "page_123",
    formId: "form_abc",
    pageKey: "page_key_1",
    title: "Customer Onboarding",
    description: "Please fill out the following questions.",
    label: "Customer Onboarding",
    helperText: "Please fill out the following questions.",
    placeholder: "",
    type: "shortText",
    required: false,
    order: 1,
    options: [],
    logic: [],
    appearance: { width: "full", icon: "" },
    isActive: true,
    coverImage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        _id: "block_1",
        id: "block_1",
        blockKey: "block_name",
        type: "shortText",
        title: "Full Name",
        description: "Your legal name",
        required: true,
        order: 1,
      },
      {
        _id: "block_2",
        id: "block_2",
        blockKey: "block_rating",
        type: "rating",
        title: "Satisfaction Rating",
        description: "",
        required: true,
        order: 2,
        settings: {
          rating: { style: "star", max: 5 },
        },
      },
    ],
  };

  const adapted = adaptApiPage(mockApiPage, "form_abc");
  assert.strictEqual(adapted.title, "Customer Onboarding");
  assert.strictEqual(adapted.description, "Please fill out the following questions.");
  assert.strictEqual(adapted.blocks?.length, 2);
  assert.strictEqual(adapted.blocks[0].title, "Full Name");
  assert.strictEqual(adapted.blocks[0].description, ""); // description removed from question
  assert.strictEqual(adapted.blocks[0].required, true);
  assert.strictEqual(adapted.blocks[1].title, "Satisfaction Rating");
  assert.strictEqual(adapted.blocks[1].description, ""); // description removed from question
  console.log("✓ Test 1: adaptApiPage correctly maps multi-block pages with page title/desc, question titles, and no question desc");
}

// Test 2: adaptApiPage backward compatibility (synthesizes default block when blocks is empty)
{
  const mockLegacyPage: ApiPage = {
    _id: "page_legacy",
    formId: "form_abc",
    pageKey: "page_key_legacy",
    label: "Single Question",
    helperText: "Help text",
    placeholder: "Type here...",
    type: "email",
    required: true,
    order: 1,
    options: [],
    logic: [],
    appearance: { width: "full", icon: "" },
    isActive: true,
    coverImage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const adapted = adaptApiPage(mockLegacyPage, "form_abc");
  assert.strictEqual(adapted.title, "Single Question");
  assert.strictEqual(adapted.description, "Help text");
  assert.strictEqual(adapted.blocks?.length, 1);
  assert.strictEqual(adapted.blocks[0].blockKey, "page_key_legacy");
  assert.strictEqual(adapted.blocks[0].type, "email");
  // Single question: no question title, no question description
  assert.strictEqual(adapted.blocks[0].title, "");
  assert.strictEqual(adapted.blocks[0].description, "");
  assert.strictEqual(adapted.blocks[0].required, true);
  console.log("✓ Test 2: adaptApiPage backwards compatibility maps page title and ensures single question has no question title/desc");
}

// Test 3: Page title and description can both be empty string
{
  const mockEmptyTitlePage: ApiPage = {
    _id: "page_empty_titles",
    formId: "form_abc",
    pageKey: "page_empty",
    title: "",
    description: "",
    label: "",
    helperText: "",
    placeholder: "",
    type: "statement",
    required: false,
    order: 1,
    options: [],
    logic: [],
    appearance: { width: "full", icon: "" },
    isActive: true,
    coverImage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        blockKey: "blk_empty",
        type: "statement",
        title: "",
        description: "",
        required: false,
        order: 1,
      },
    ],
  };

  const adapted = adaptApiPage(mockEmptyTitlePage, "form_abc");
  assert.strictEqual(adapted.title, "");
  assert.strictEqual(adapted.description, "");
  assert.strictEqual(adapted.blocks?.[0].title, "");
  assert.strictEqual(adapted.blocks?.[0].description, "");
  console.log("✓ Test 3: Empty page title and description and empty block title and description are supported");
}

// Test 4: validatePage for multi-block pages
{
  const pageWithBlocks: FormPage = {
    _id: "page_multi",
    formId: "form_abc",
    pageKey: "page_multi",
    title: "Multi-Question Page",
    description: "Please answer all required questions",
    label: "Multi-Question Page",
    helperText: "Please answer all required questions",
    placeholder: "",
    type: "shortText",
    required: false,
    order: 1,
    options: [],
    logic: [],
    appearance: { width: "full" },
    isActive: true,
    blocks: [
      {
        blockKey: "block_name",
        type: "shortText",
        title: "Full Name",
        description: "",
        required: true,
        order: 1,
      },
      {
        blockKey: "block_email",
        type: "email",
        title: "Work Email",
        description: "",
        required: true,
        order: 2,
      },
      {
        blockKey: "block_notes",
        type: "longText",
        title: "Additional Notes",
        description: "Optional notes",
        required: false,
        order: 3,
      },
    ],
  };

  // Case A: Missing first required block
  const errorMissingName = validatePage(pageWithBlocks, {
    block_name: "",
    block_email: "test@example.com",
  });
  assert.strictEqual(errorMissingName, "This field is required.");

  // Case B: Missing second required block
  const errorMissingEmail = validatePage(pageWithBlocks, {
    block_name: "Alice Smith",
    block_email: "",
  });
  assert.strictEqual(errorMissingEmail, "This field is required.");

  // Case C: Invalid email in second block
  const errorInvalidEmail = validatePage(pageWithBlocks, {
    block_name: "Alice Smith",
    block_email: "not-an-email",
  });
  assert.strictEqual(errorInvalidEmail, "Please enter a valid email address.");

  // Case D: All valid (optional block can be empty)
  const validResult = validatePage(pageWithBlocks, {
    block_name: "Alice Smith",
    block_email: "alice@company.com",
    block_notes: "",
  });
  assert.strictEqual(validResult, null);

  console.log("✓ Test 4: validatePage validates every block in multi-block pages correctly");
}

// Test 5: validateBlock for individual blocks
{
  const statementBlock = {
    blockKey: "blk_stmt",
    type: "statement" as const,
    title: "Welcome",
    description: "Welcome to our form",
    order: 1,
    required: true, // statement is never required even if flag is true
  };
  assert.strictEqual(validateBlock(statementBlock, null), null);

  const numberBlock = {
    blockKey: "blk_num",
    type: "number" as const,
    title: "Age",
    description: "",
    order: 2,
    required: true,
    validation: { min: 18, max: 99 },
  };
  assert.strictEqual(validateBlock(numberBlock, ""), "This field is required.");
  assert.strictEqual(validateBlock(numberBlock, 15), "Minimum value is 18.");
  assert.strictEqual(validateBlock(numberBlock, 25), null);

  console.log("✓ Test 5: validateBlock validates block rules and constraints properly");
}

// Test 6: questions array and questionKey validation
{
  const pageWithQuestions: FormPage = {
    _id: "page_q",
    formId: "form_q",
    pageKey: "page_q",
    title: "Question Page",
    description: "",
    label: "Question Page",
    helperText: "",
    placeholder: "",
    type: "shortText",
    required: false,
    order: 1,
    options: [],
    logic: [],
    appearance: { width: "full" },
    isActive: true,
    questions: [
      {
        questionKey: "q_name",
        type: "shortText",
        title: "Full Name",
        description: "",
        required: true,
        order: 1,
      },
    ],
  };

  const err = validatePage(pageWithQuestions, { q_name: "" });
  assert.strictEqual(err, "This field is required.");
  const ok = validatePage(pageWithQuestions, { q_name: "John Doe" });
  assert.strictEqual(ok, null);
  console.log("✓ Test 6: validatePage validates questions with questionKey properly");
}

// Test 7: countRulesForPage counts rules referencing questions on the page
{
  const testPage: FormPage = {
    _id: "page_1",
    formId: "form_1",
    pageKey: "page_1_key",
    title: "Page 1",
    label: "Page 1",
    type: "shortText",
    required: false,
    order: 1,
    questions: [
      {
        questionKey: "q_101",
        type: "multipleChoice",
        title: "Do you like coding?",
        required: true,
        order: 1,
      },
    ],
  };

  const testRules: FormLogicRule[] = [
    {
      id: "rule_1",
      category: "branching",
      conditions: [{ sourceType: "page", sourceKey: "q_101", operator: "equals", value: "yes" }],
      actions: [{ action: "jumpToPage", targetPageKey: "page_2_key" }],
    },
    {
      id: "rule_2",
      category: "display",
      conditions: [{ sourceType: "page", sourceKey: "q_999", operator: "equals", value: "other" }],
      actions: [{ action: "showPage", targetPageKey: "page_3_key" }],
    },
  ];

  const count = countRulesForPage(testRules, "page_1_key", testPage);
  assert.strictEqual(count, 1);
  console.log("✓ Test 7: countRulesForPage properly counts rules referencing nested question keys");
}

// Test 8: resolveFormLogic maps question-level condition to parent page jump
{
  const testPages: FormPage[] = [
    {
      _id: "p1",
      formId: "form_1",
      pageKey: "page_1_key",
      title: "Page 1",
      label: "Page 1",
      type: "shortText",
      required: false,
      order: 1,
      questions: [
        {
          questionKey: "q_satisfaction",
          type: "rating",
          title: "How satisfied are you?",
          order: 1,
        },
      ],
    },
    {
      _id: "p2",
      formId: "form_1",
      pageKey: "page_2_key",
      title: "Page 2",
      label: "Page 2",
      type: "shortText",
      required: false,
      order: 2,
    },
    {
      _id: "p3",
      formId: "form_1",
      pageKey: "page_3_key",
      title: "Page 3 (VIP)",
      label: "Page 3",
      type: "shortText",
      required: false,
      order: 3,
    },
  ];

  const rules: FormLogicRule[] = [
    {
      id: "rule_branch_vip",
      category: "branching",
      conditions: [
        { sourceType: "page", sourceKey: "q_satisfaction", operator: "greaterThanOrEquals", value: 5 },
      ],
      actions: [{ action: "jumpToPage", targetPageKey: "page_3_key" }],
    },
  ];

  const resolved = resolveFormLogic({
    pages: testPages,
    answers: { q_satisfaction: 5 },
    variables: [],
    rules,
  });

  // Jump targets should be mapped to the parent page page_1_key so the navigation engine knows where to jump on submit
  assert.strictEqual(resolved.jumpTargets["page_1_key"], "page_3_key");
  console.log("✓ Test 8: resolveFormLogic resolves question-level condition to owner page jump");
}

// Test 9: a required question never borrows another question's answer
{
  // The first block's key matches the page key, as the backend stores it.
  const page: FormPage = {
    _id: "page_shared_key",
    formId: "form_abc",
    pageKey: "page_shared_key",
    title: "Two questions",
    description: "",
    label: "Two questions",
    helperText: "",
    placeholder: "",
    type: "longText",
    required: false,
    order: 1,
    options: [],
    logic: [],
    appearance: { width: "full" },
    isActive: true,
    questions: [
      { questionKey: "page_shared_key", blockKey: "page_shared_key", type: "longText", title: "First", required: true, order: 1 },
      { questionKey: "question_2", blockKey: "question_2", type: "shortText", title: "Second", required: true, order: 2 },
    ],
  };

  const err = validatePage(page, { page_shared_key: "answered first" });
  assert.strictEqual(err, "This field is required.");

  const ok = validatePage(page, { page_shared_key: "answered first", question_2: "answered second" });
  assert.strictEqual(ok, null);
  console.log("✓ Test 9: required questions validate their own answer, not the page-level one");
}

// Test 10: summary breakdown tallies answers and NPS buckets
{
  const counts = tally(["a", ["b", "c"], "a", null, undefined, ""]);
  assert.strictEqual(counts.get("a"), 2);
  assert.strictEqual(counts.get("b"), 1);
  assert.strictEqual(counts.get("c"), 1);
  assert.strictEqual(counts.size, 3);

  assert.strictEqual(percent(1, 4), 25);
  assert.strictEqual(percent(3, 0), 0);

  const nps = npsGroups(new Map([["6", 1]]), 1);
  assert.strictEqual(nps.score, -100);
  assert.strictEqual(nps.groups[0].count, 1);
  assert.strictEqual(nps.groups[2].count, 0);

  const mixed = npsGroups(new Map([["10", 1], ["9", 1], ["8", 1], ["2", 1]]), 4);
  assert.strictEqual(mixed.score, 25);
  console.log("✓ Test 10: summary breakdown tallies answers and NPS buckets");
}

// Test 11: phone country auto-detection from the browser locale
{
  assert.strictEqual(countryFromLocale("en-US")?.iso2, "US");
  assert.strictEqual(countryFromLocale("bn-BD")?.iso2, "BD");
  // Script subtags are skipped; the region still wins.
  assert.strictEqual(countryFromLocale("zh-Hant-TW")?.iso2, "TW");
  assert.strictEqual(countryFromLocale("en"), undefined);
  assert.strictEqual(flagEmoji("US"), "🇺🇸");
  // The browser timezone detects the real country even when the UI language
  // stays en-US (e.g. a respondent in Bangladesh with an English browser).
  assert.strictEqual(countryPhoneFromTimezone("Asia/Dhaka")?.iso2, "BD");
  assert.strictEqual(countryPhoneFromTimezone("America/New_York")?.iso2, "US");
  assert.strictEqual(countryPhoneFromTimezone("Europe/London")?.iso2, "GB");
  assert.strictEqual(countryPhoneFromTimezone("Etc/UTC"), undefined);
  console.log("✓ Test 11: phone country auto-detection from locale and timezone");
}

// Test 12: phone masks format national numbers per country
{
  assert.strictEqual(formatNationalNumber("2015550123", "(###) ###-####"), "(201) 555-0123");
  assert.strictEqual(formatNationalNumber("01712345678", "#####-######"), "01712-345678");
  assert.strictEqual(formatNationalNumber("201", "(###) ###-####"), "(201");
  assert.strictEqual(maxNationalDigits("(###) ###-####"), 10);
  assert.strictEqual(findCountryPhone("BD")?.dialCode, "+880");
  assert.strictEqual(findCountryPhone("US")?.example, "(201) 555-0123");
  // Countries without their own mask borrow one from the same dial code, and
  // every country still gets a numeric example placeholder.
  assert.strictEqual(findCountryPhone("GG")?.example, "07123 456789");
  assert.strictEqual(findCountryPhone("AL")?.example, "123 456 7890");
  console.log("✓ Test 12: phone masks format national numbers per country");
}

// Test 13: contactInfo question type defaults and validation
{
  const pages = defaultContactInfoPages();
  assert.strictEqual(pages.length, 5);
  assert.deepStrictEqual(
    pages.map((p) => p.key),
    ["firstName", "lastName", "email", "phone", "company"]
  );

  const defaults = defaultSettingsForType("contactInfo");
  assert.ok(defaults.contactInfo);
  assert.strictEqual(defaults.contactInfo.pages.length, 5);
  assert.ok(defaults.contactInfo.phone);
  assert.strictEqual(defaults.contactInfo.phone.countryCodeMode, "auto");
  assert.strictEqual(defaults.contactInfo.phone.phoneVerification, false);
  assert.ok(defaults.phone);
  assert.strictEqual(defaults.phone.countryCodeMode, "auto");

  assert.deepStrictEqual(defaults.contactInfo.fieldsPerRow, { desktop: 2, mobile: 1 });
  assert.strictEqual(pages[0].width, "50%");
  assert.strictEqual(pages[4].width, "100%");

  const contactPage: FormPage = {
    _id: "p_contact",
    formId: "f_contact",
    pageKey: "contact_key",
    title: "Contact Information",
    label: "Contact Information",
    type: "contactInfo",
    required: false,
    order: 1,
    settings: {
      contactInfo: {
        fieldsPerRow: { desktop: 2, mobile: 1 },
        pages: [
          { key: "firstName", label: "First name", placeholder: "", required: true, hidden: false, order: 1, width: "50%" },
          { key: "lastName", label: "Last name", placeholder: "", required: true, hidden: false, order: 2, width: "50%" },
          { key: "email", label: "Email", placeholder: "", required: false, hidden: false, order: 3, width: "50%" },
          { key: "phone", label: "Phone number", placeholder: "", required: false, hidden: false, order: 4, width: "50%" },
          { key: "company", label: "Company", placeholder: "", required: false, hidden: false, order: 5, width: "100%" },
        ],
      },
    },
  };

  // Missing required first name
  assert.strictEqual(
    validatePage(contactPage, { contact_key: { lastName: "Doe" } }),
    "First name is required."
  );

  // Missing required last name
  assert.strictEqual(
    validatePage(contactPage, { contact_key: { firstName: "Jane" } }),
    "Last name is required."
  );

  // Invalid email format
  assert.strictEqual(
    validatePage(contactPage, { contact_key: { firstName: "Jane", lastName: "Doe", email: "not-an-email" } }),
    "Please enter a valid email address."
  );

  // Valid submission
  assert.strictEqual(
    validatePage(contactPage, { contact_key: { firstName: "Jane", lastName: "Doe", email: "jane@example.com" } }),
    null
  );

  console.log("✓ Test 13: contactInfo question type defaults and validation work properly");
}

// Test 14: address question type defaults with fieldsPerRow and field widths
{
  const addressPages = defaultAddressPages();
  assert.strictEqual(addressPages.length, 6);
  assert.strictEqual(addressPages[0].width, "50%");
  assert.strictEqual(addressPages[4].width, "100%"); // zip
  assert.strictEqual(addressPages[5].width, "100%"); // country

  const defaults = defaultSettingsForType("address");
  assert.ok(defaults.address);
  assert.deepStrictEqual(defaults.address.fieldsPerRow, { desktop: 2, mobile: 1 });
  console.log("✓ Test 14: address question type defaults and layout configuration work properly");
}

// Test 15: url answers accept bare hosts without a scheme or www
{
  const urlBlock = { type: "url" as const, required: true } as unknown as FormPage;
  assert.strictEqual(validateBlock(urlBlock, "user.com"), null);
  assert.strictEqual(validateBlock(urlBlock, "www.user.com/path?x=1"), null);
  assert.strictEqual(validateBlock(urlBlock, "https://user.com"), null);
  assert.strictEqual(validateBlock(urlBlock, "not a url"), "Please enter a valid URL.");
  assert.strictEqual(validateBlock(urlBlock, "asdf"), "Please enter a valid URL.");
  console.log("✓ Test 15: url answers accept bare host names too");
}

// Test 16: slider defaults, formatting and range validation
{
  const defaults = defaultSettingsForType("slider");
  assert.ok(defaults.slider);
  assert.strictEqual(defaults.slider.min, 0);
  assert.strictEqual(defaults.slider.max, 100);
  assert.strictEqual(defaults.slider.rangeMode, false);

  assert.strictEqual(formatSliderNumber(1000, "comma"), "1,000");
  assert.strictEqual(formatSliderNumber(1000, "period"), "1.000");
  assert.strictEqual(formatSliderNumber(1000, "space"), "1 000");
  assert.strictEqual(formatSliderNumber(1000, "none"), "1000");
  assert.strictEqual(formatSliderNumber(1234.5, "comma"), "1,234.5");

  const single = {
    type: "slider",
    required: true,
    settings: { slider: { min: 0, max: 100, rangeMode: false } },
  } as unknown as FormPage;
  assert.strictEqual(validateBlock(single, 50), null);
  assert.strictEqual(
    validateBlock(single, 150),
    "Please choose a value between 0 and 100.",
  );

  const range = {
    type: "slider",
    settings: { slider: { min: 0, max: 100, rangeMode: true } },
  } as unknown as FormPage;
  assert.strictEqual(validateBlock(range, [20, 80]), null);
  assert.strictEqual(
    validateBlock(range, [80, 20]),
    "The low value cannot be greater than the high value.",
  );
  console.log("✓ Test 16: slider defaults, formatting and range validation work properly");
}

console.log("--- All Frontend Multi-Block & UI Tests Passed Successfully! ---");
