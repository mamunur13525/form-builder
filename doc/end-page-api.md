# End Page API & Property Documentation

**Base URL:** `http://localhost:5000/api/v1`

---

## 1. Overview & Architecture

Each Form can contain multiple **End Pages** (Thank You / Completion screens) embedded directly in the form schema (`endPages` array).

- **Multiplicity:** A form can have multiple end pages.
- **Active State (`isActive`):** Determines which end page is displayed to respondents when they finish/submit the form.
- **Automatic Initialization:** When a user creates a new form via `POST /api/v1/forms`, a default **Statement page** and a default **End page** are automatically added.

---

## 2. End Page Schema & Properties Reference

Below is the complete TypeScript interface and description of every property on an End Page object:

### TypeScript Interface

```typescript
export interface ICoverImage {
  url: string;
  fileId?: string;
  alt?: string;
}

export type EmbedProvider = "youtube" | "loom" | "vimeo" | "pdf" | "image" | "other";

export interface IEndPageEmbed {
  /** Any embeddable link (YouTube, Loom, Vimeo, PDF URL, etc.) */
  url: string;
  /** Embed provider identifier */
  provider?: EmbedProvider;
  /** Optional title for the embed */
  title?: string;
}

export interface IEndPageButton {
  /** Text displayed on the primary call-to-action button */
  text: string;
  /** URL / external link the button navigates to */
  link: string;
}

export interface IEndPageRedirect {
  /** Whether to automatically redirect the user upon reaching the end page */
  isRedirect: boolean;
  /** Destination URL to redirect to */
  link: string;
}

export interface IEndPageSocialShareMedia {
  facebook: boolean;
  twitter: boolean;
  linkedin: boolean;
  whatsapp?: boolean;
}

export type ContentAlignment = "left" | "center" | "right";

export interface IEndPage {
  /** MongoDB subdocument ID */
  _id?: string;
  /** Unique client/page key (e.g. "end_page_k8s9d2a1") */
  key?: string;
  /** Main heading / title of the end page */
  title: string;
  /** Descriptive message or subtitle */
  helperText?: string;
  /** Backward-compatible message field (matches helperText) */
  paragraph?: string;
  /** Optional cover image */
  coverImage?: ICoverImage;
  /** Media embed (video, PDF, etc.) */
  embed?: IEndPageEmbed;
  /** Text and content alignment: "left" | "center" | "right" */
  alignment: ContentAlignment;
  /** Call-to-action button */
  button: IEndPageButton;
  /** Auto-redirect settings */
  redirect: IEndPageRedirect;
  /** Trigger a confetti animation when page mounts */
  showConfetti: boolean;
  /** Whether social share buttons are enabled */
  socialShareButtons: boolean;
  /** Pre-filled message for social sharing */
  socialShareMessage: string;
  /** Enabled social share channels */
  socialShareMedia: IEndPageSocialShareMedia;
  /** Whether this end page is active/enabled */
  isActive: boolean;
  /** Display order (1-indexed) */
  order: number;
  /** Timestamps */
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
```

---

## 3. Detailed Property Breakdown

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `string` | Auto-generated | MongoDB ObjectId of the end page subdocument. |
| `key` | `string` | `end_page_<nanoid>` | Client-side identifier for keying components. |
| `title` | `string` | `"Thank you!"` | Primary headline displayed to respondent. |
| `helperText` | `string` | `"Your response has been submitted..."` | Subtitle/description text under the title. |
| `paragraph` | `string` | Matches `helperText` | Alias for `helperText` for backwards compatibility. |
| `alignment` | `"left"` \| `"center"` \| `"right"` | `"left"` | Alignment of title, helper text, and button. |
| `coverImage` | `object` \| `undefined` | `undefined` | Optional top banner / cover image `{ url, fileId, alt }`. |
| `embed` | `object` | `{ url: "" }` | Embed media `{ url, provider, title }` (Loom, YouTube, Vimeo, PDF). |
| `button` | `object` | `{ text: "Create your own form", link: "<FRONTEND_URL>" }` | Call-to-action button `{ text, link }`. |
| `redirect` | `object` | `{ isRedirect: false, link: "" }` | Auto-redirect `{ isRedirect, link }`. If `isRedirect: true`, frontend redirects to `link`. |
| `showConfetti` | `boolean` | `false` | If `true`, frontend should trigger confetti celebration animation. |
| `socialShareButtons` | `boolean` | `false` | If `true`, show social share icon buttons. |
| `socialShareMessage` | `string` | `""` | Text prefilled when sharing via social platforms. |
| `socialShareMedia` | `object` | `{ facebook: false, twitter: false, linkedin: false, whatsapp: false }` | Specific social platform toggles. |
| `isActive` | `boolean` | `true` | Indicates if this end page is currently active. |
| `order` | `number` | `1` | Order position among multiple end pages. |

---

## 4. Endpoints Returning End Pages

### 1. Create a Form (Auto-Generates Statement + End Page)
Creates a new form. Automatically populates the draft with 1 Statement page and 1 End page.

- **Method:** `POST`
- **Path:** `/api/v1/forms`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "title": "Customer Feedback Survey"
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Form created successfully",
  "data": {
    "id": "664f1a2b3c4d5e6f7a8b9c01",
    "title": "Customer Feedback Survey",
    "slug": "customer-feedback-survey-k8s9",
    "status": "draft",
    "version": 1,
    "hasUnpublishedChanges": false,
    "pages": [
      {
        "_id": "664f1a2b3c4d5e6f7a8b9c02",
        "pageKey": "page_x7y8z9a0",
        "label": "Statement",
        "type": "statement",
        "required": false,
        "order": 1,
        "helperText": "",
        "placeholder": "",
        "options": [],
        "validation": {},
        "settings": {
          "statement": {
            "embedUrl": "",
            "embedTitle": ""
          }
        },
        "appearance": {
          "width": "full",
          "icon": "",
          "submitButtonText": "",
          "submitButtonColor": ""
        },
        "isActive": true,
        "logic": []
      }
    ],
    "endPages": [
      {
        "_id": "664f1a2b3c4d5e6f7a8b9c03",
        "key": "end_page_m1n2o3p4",
        "title": "Thank you!",
        "helperText": "Your response has been submitted successfully. We appreciate you taking the time to fill this out.",
        "paragraph": "Your response has been submitted successfully. We appreciate you taking the time to fill this out.",
        "button": {
          "text": "Create your own form",
          "link": "http://localhost:5173"
        },
        "redirect": {
          "isRedirect": false,
          "link": ""
        },
        "alignment": "left",
        "showConfetti": false,
        "socialShareButtons": false,
        "socialShareMessage": "",
        "socialShareMedia": {
          "facebook": false,
          "twitter": false,
          "linkedin": false,
          "whatsapp": false
        },
        "embed": {
          "url": ""
        },
        "isActive": true,
        "order": 1
      }
    ],
    "settings": {
      "oneQuestionAtATime": true,
      "showProgressBar": true,
      "allowMultipleSubmissions": true,
      "requireLogin": false,
      "collectIP": false
    },
    "theme": { ... }
  }
}
```

---

### 2. Get Form Details (Admin / Builder)
Fetches the current draft schema of a form, including all `pages` and `endPages`.

- **Method:** `GET`
- **Path:** `/api/v1/forms/:formId`
- **Headers:** `Authorization: Bearer <token>`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "664f1a2b3c4d5e6f7a8b9c01",
    "title": "Customer Feedback Survey",
    "slug": "customer-feedback-survey-k8s9",
    "status": "draft",
    "pages": [ ... ],
    "endPages": [
      {
        "_id": "664f1a2b3c4d5e6f7a8b9c03",
        "key": "end_page_m1n2o3p4",
        "title": "Thank you!",
        "helperText": "Your response has been submitted successfully. We appreciate you taking the time to fill this out.",
        "button": {
          "text": "Create your own form",
          "link": "http://localhost:5173"
        },
        "redirect": {
          "isRedirect": false,
          "link": ""
        },
        "alignment": "left",
        "showConfetti": false,
        "socialShareButtons": false,
        "socialShareMessage": "",
        "socialShareMedia": {
          "facebook": false,
          "twitter": false,
          "linkedin": false,
          "whatsapp": false
        },
        "isActive": true,
        "order": 1
      }
    ]
  }
}
```

---

### 3. Get Public Form Schema (Respondent View)
Used by respondents when taking the live published form. Only returns `isActive: true` pages and end pages, sorted by `order`.

- **Method:** `GET`
- **Path:** `/api/v1/public/forms/:slugOrId/schema`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "form": {
      "id": "664f1a2b3c4d5e6f7a8b9c01",
      "title": "Customer Feedback Survey",
      "version": 1,
      "formVersionId": "664f1a2b3c4d5e6f7a8b9c99",
      "settings": { ... }
    },
    "pages": [ ... ],
    "endPages": [
      {
        "_id": "664f1a2b3c4d5e6f7a8b9c03",
        "key": "end_page_m1n2o3p4",
        "title": "Thank you!",
        "helperText": "Your response has been submitted successfully. We appreciate you taking the time to fill this out.",
        "paragraph": "Your response has been submitted successfully. We appreciate you taking the time to fill this out.",
        "button": {
          "text": "Create your own form",
          "link": "http://localhost:5173"
        },
        "redirect": {
          "isRedirect": false,
          "link": ""
        },
        "alignment": "left",
        "showConfetti": false,
        "socialShareButtons": false,
        "socialShareMessage": "",
        "socialShareMedia": {
          "facebook": false,
          "twitter": false,
          "linkedin": false,
          "whatsapp": false
        },
        "embed": {
          "url": ""
        },
        "isActive": true,
        "order": 1
      }
    ]
  }
}
```

---

### 4. Get Form Preview
Fetches the draft (or published) form for previewing in the builder.

- **Method:** `GET`
- **Path:** `/api/v1/public/forms/:slugOrId/preview`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "form": { ... },
    "pages": [ ... ],
    "endPages": [ ... ]
  }
}
```

---

## 5. Frontend Implementation Guide

### A. Rendering the End Page After Submission
When respondent answers the last page and submits the response (`POST /api/v1/public/forms/:slugOrId/submit`):

1. Pick the active end page:
```typescript
const activeEndPage = formSchema.endPages.find((ep) => ep.isActive) || formSchema.endPages[0];
```

2. **Confetti Trigger:**
If `activeEndPage.showConfetti === true`, trigger a confetti burst on mount (e.g. `canvas-confetti`):
```typescript
import confetti from "canvas-confetti";

useEffect(() => {
  if (activeEndPage?.showConfetti) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}, [activeEndPage]);
```

3. **Auto-Redirect:**
If `activeEndPage.redirect?.isRedirect === true` and `activeEndPage.redirect?.link` is present:
```typescript
useEffect(() => {
  if (activeEndPage?.redirect?.isRedirect && activeEndPage?.redirect?.link) {
    const timer = setTimeout(() => {
      window.location.href = activeEndPage.redirect.link;
    }, 2000); // 2 second pause before redirect
    return () => clearTimeout(timer);
  }
}, [activeEndPage]);
```

4. **Action Button:**
```tsx
{activeEndPage.button?.text && (
  <a
    href={activeEndPage.button.link || "#"}
    target="_blank"
    rel="noopener noreferrer"
    className="btn-primary"
  >
    {activeEndPage.button.text}
  </a>
)}
```

5. **Social Share Links Generation:**
```typescript
const shareUrl = encodeURIComponent(window.location.href);
const shareText = encodeURIComponent(activeEndPage.socialShareMessage || "Check out this form!");

const shareLinks = {
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
  twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
  whatsapp: `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`,
};
```
