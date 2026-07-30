import mongoose, { Schema, model, models } from "mongoose";

/* -----------------------------
   FORM
------------------------------ */
const formSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    theme: {
      primaryColor: { type: String, default: "#000000" },
      backgroundColor: { type: String, default: "#ffffff" },
      textColor: { type: String, default: "#111111" },
    },

    settings: {
      oneQuestionAtATime: { type: Boolean, default: true },
      showProgressBar: { type: Boolean, default: true },
      allowMultipleSubmissions: { type: Boolean, default: true },
      requireLogin: { type: Boolean, default: false },
      collectIP: { type: Boolean, default: false },
    },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/* -----------------------------
   FORM FIELD
------------------------------ */
const formFieldSchema = new Schema(
  {
    formId: { type: Schema.Types.ObjectId, ref: "Form", required: true, index: true },

    fieldKey: { type: String, required: true }, // unique key inside form
    label: { type: String, required: true },
    helperText: { type: String, default: "" },
    placeholder: { type: String, default: "" },

    type: {
      type: String,
      enum: [
        "shortText",
        "longText",
        "email",
        "phone",
        "number",
        "date",
        "time",
        "radio",
        "checkbox",
        "select",
        "multiSelect",
        "file",
        "rating",
        "yesNo",
        "url",
      ],
      required: true,
    },

    required: { type: Boolean, default: false },
    order: { type: Number, required: true },

    options: [
      {
        label: { type: String },
        value: { type: String },
      },
    ],

    validation: {
      minLength: { type: Number },
      maxLength: { type: Number },
      min: { type: Number },
      max: { type: Number },
      pattern: { type: String },
      message: { type: String },
    },

    logic: [
      {
        whenFieldKey: { type: String }, // condition based on another field
        operator: {
          type: String,
          enum: ["equals", "notEquals", "contains", "greaterThan", "lessThan"],
        },
        value: { type: Schema.Types.Mixed },
        action: {
          type: String,
          enum: ["show", "hide", "goToField", "goToEnd"],
        },
        targetFieldKey: { type: String },
      },
    ],

    appearance: {
      width: { type: String, enum: ["full", "half"], default: "full" },
      icon: { type: String, default: "" },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

formFieldSchema.index({ formId: 1, order: 1 });
formFieldSchema.index({ formId: 1, fieldKey: 1 }, { unique: true });

/* -----------------------------
   FORM RESPONSE
------------------------------ */
const formResponseSchema = new Schema(
  {
    formId: { type: Schema.Types.ObjectId, ref: "Form", required: true, index: true },

    respondentId: { type: Schema.Types.ObjectId, ref: "User" }, // optional if logged in
    sessionId: { type: String, default: "" },

    answers: [
      {
        fieldKey: { type: String, required: true },
        label: { type: String, required: true },
        type: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
      },
    ],

    metadata: {
      ipAddress: { type: String, default: "" },
      userAgent: { type: String, default: "" },
      referrer: { type: String, default: "" },
      country: { type: String, default: "" },
      city: { type: String, default: "" },
    },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

formResponseSchema.index({ formId: 1, submittedAt: -1 });

/* -----------------------------
   FORM SHARE / SETTINGS OPTIONAL
------------------------------ */
const formShareSchema = new Schema(
  {
    formId: { type: Schema.Types.ObjectId, ref: "Form", required: true, unique: true },

    publicUrl: { type: String, required: true },
    isPublic: { type: Boolean, default: true },
    password: { type: String, default: "" },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

/* -----------------------------
   USER
------------------------------ */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "viewer",
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

/* -----------------------------
   MODELS
------------------------------ */
export const User = models.User || model("User", userSchema);
export const Form = models.Form || model("Form", formSchema);
export const FormField = models.FormField || model("FormField", formFieldSchema);
export const FormResponse = models.FormResponse || model("FormResponse", formResponseSchema);
export const FormShare = models.FormShare || model("FormShare", formShareSchema);
