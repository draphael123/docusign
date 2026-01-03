export interface Signatory {
  id: string;
  name: string;
  title: string;
  company?: string;
  phone?: string;
  email?: string;
}

export const signatories: Signatory[] = [
  {
    id: "doron-stember",
    name: "Doron Stember",
    title: "Chief Medical Officer",
    company: "Fountain Vitality",
  },
  {
    id: "lindsay-burden",
    name: "Lindsay Burden",
    title: "Chief Clinical Operations Officer",
    company: "Fountain Vitality",
    phone: "213-237-1454",
    email: "Support@fountain.net",
  },
];

