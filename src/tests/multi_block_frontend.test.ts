import assert from "node:assert";
import { adaptApiPage } from "../features/forms/model/adapters.ts";
import { validatePage, validateBlock } from "../shared/hooks/useFormValidation.ts";
import type { FormPage as ApiPage } from "../entities/form/model/types.ts";
import type { FormPage } from "../shared/types/common.ts";

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
  assert.strictEqual(adapted.blocks[0].required, true);
  assert.strictEqual(adapted.blocks[1].title, "Satisfaction Rating");
  assert.strictEqual(adapted.blocks[1].description, ""); // empty description preserved
  console.log("✓ Test 1: adaptApiPage correctly maps multi-block pages and preserves empty descriptions");
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
  assert.strictEqual(adapted.blocks?.length, 1);
  assert.strictEqual(adapted.blocks[0].blockKey, "page_key_legacy");
  assert.strictEqual(adapted.blocks[0].type, "email");
  assert.strictEqual(adapted.blocks[0].title, "Single Question");
  assert.strictEqual(adapted.blocks[0].required, true);
  console.log("✓ Test 2: adaptApiPage backwards compatibility synthesizes default block");
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
  assert.strictEqual(errorMissingName, "Full Name is required.");

  // Case B: Missing second required block
  const errorMissingEmail = validatePage(pageWithBlocks, {
    block_name: "Alice Smith",
    block_email: "",
  });
  assert.strictEqual(errorMissingEmail, "Work Email is required.");

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
  assert.strictEqual(validateBlock(numberBlock, ""), "Age is required.");
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
  assert.strictEqual(err, "Full Name is required.");
  const ok = validatePage(pageWithQuestions, { q_name: "John Doe" });
  assert.strictEqual(ok, null);
  console.log("✓ Test 6: validatePage validates questions with questionKey properly");
}

console.log("--- All Frontend Multi-Block & UI Tests Passed Successfully! ---");
