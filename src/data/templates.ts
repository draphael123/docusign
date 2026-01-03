export interface DocumentTemplate {
  id: string;
  name: string;
  documentType: string;
  bodyText: string;
  description: string;
  category: string;
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: "recommendation-1",
    name: "Professional Recommendation",
    documentType: "Letter of Recommendation",
    bodyText: "I am writing to recommend [Name] for [Position/Role]. I have had the pleasure of working with [Name] for [Duration] and can confidently say they are one of the most [adjective] professionals I have encountered.\n\n[Name] consistently demonstrated [skill/quality] and [skill/quality] throughout their tenure. Their ability to [specific achievement] was particularly impressive and contributed significantly to [outcome].\n\nI highly recommend [Name] without reservation and believe they would be an excellent addition to your team. Please feel free to contact me if you need any additional information.",
    description: "A comprehensive professional recommendation letter template",
    category: "Professional",
  },
  {
    id: "termination-1",
    name: "Standard Termination",
    documentType: "Letter of Termination",
    bodyText: "This letter is to inform you that your employment with [Company Name] will be terminated effective [Date].\n\nThis decision has been made due to [Reason]. We want to thank you for your service and contributions during your time with us.\n\nYour final paycheck and any accrued benefits will be processed according to company policy. Please return all company property, including [items], by [Date].\n\nWe wish you the best in your future endeavors.",
    description: "Professional termination letter template",
    category: "HR",
  },
  {
    id: "employment-1",
    name: "Job Offer Letter",
    documentType: "Letter of Employment",
    bodyText: "We are pleased to offer you the position of [Position Title] at [Company Name]. We believe your skills and experience make you an excellent fit for our team.\n\nYour start date will be [Date]. Your compensation will be [Salary/Details], and you will be eligible for [Benefits].\n\nPlease confirm your acceptance of this offer by [Date]. We look forward to welcoming you to our team.\n\nIf you have any questions, please do not hesitate to contact us.",
    description: "Standard job offer letter template",
    category: "HR",
  },
  {
    id: "reference-1",
    name: "Character Reference",
    documentType: "Letter of Reference",
    bodyText: "I am writing to provide a character reference for [Name], whom I have known for [Duration] in my capacity as [Relationship].\n\n[Name] has consistently demonstrated [qualities] and has proven to be [description]. I have observed their [specific examples] and can attest to their [characteristics].\n\nI recommend [Name] highly and believe they would be an asset to [context]. Please feel free to contact me if you require any further information.",
    description: "Character reference letter template",
    category: "Personal",
  },
];



