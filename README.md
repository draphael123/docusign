# Document Template Generator

A Next.js application for generating PDF document templates with dynamic content, header images, and signatory information.

## Features

- **Document Type Selection**: Choose from 16+ document types (Letters of Recommendation, Termination, Employment, etc.)
- **AI-Powered Text Generation**: Use ChatGPT-like AI to generate document text based on prompts
- **Signatory Selection**: Select from pre-configured signatories (Doron Stember or Lindsay Burden)
- **Dynamic PDF Generation**: Automatically generates PDFs with header image, body text, and signatory information
- **PDF Download**: Automatically downloads generated PDF templates ready for DocuSign

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── globals.css               # Global styles with Tailwind
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main form page
│   ├── data/
│   │   └── signatories.ts            # Signatory configuration
│   └── lib/
│       └── pdfGenerator.ts           # PDF generation utility
├── public/
│   └── header.png                    # Header image (add your image here)
└── package.json
```

## Setup Instructions

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Add Header Image**:
   - Place your header image as `header.png` in the `public/` directory
   - The PDF generator will automatically include this image at the top of each document

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   - Navigate to `http://localhost:3000`

### Deployment to Vercel

The project is configured for easy deployment to Vercel:

1. **Push to GitHub** (already done):
   - Repository: https://github.com/draphael123/docusign.git

2. **Deploy to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Import the GitHub repository: `draphael123/docusign`
   - Vercel will auto-detect Next.js and configure the build settings
   - Click "Deploy"

3. **Environment Variables**:
   - **OPENAI_API_KEY** (optional): Required for AI text generation feature
     - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
     - Add it in Vercel's project settings under "Environment Variables"
     - If not set, users can still manually enter document text

4. **Your app will be live** at: `https://your-project-name.vercel.app`

## Usage

1. Select a **Document Type** from the dropdown
2. Choose a **Signatory** using the radio buttons
3. **Generate Document Text** (optional):
   - Click "Use AI to Generate Text"
   - Enter a prompt describing what you want in the document
   - Click "Generate Text with AI" to auto-generate the content
   - Or manually enter the **Document Body** text in the textarea
4. Click **Generate PDF** to create and download the PDF template

## Signatory Configuration

Signatories are configured in `src/data/signatories.ts`:

- **Doron Stember** - Executive Director
- **Lindsay Burden** - Operations Manager

To add more signatories, edit the `signatories` array in this file.

## PDF Generation

The PDF generator automatically:
1. Loads the header image from `/public/header.png` (if available)
2. Adds the document type as a title
3. Formats the body text with proper line breaks
4. Places the signatory name and title at the bottom
5. Downloads the PDF with a descriptive filename

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **jsPDF** - PDF generation

## Notes

- The PDF generator will automatically load the header image from `/public/header.png` if it exists. If the image is not found, it will display a placeholder.
- The generated PDFs are downloaded directly to the user's device with a filename based on the document type and timestamp.

