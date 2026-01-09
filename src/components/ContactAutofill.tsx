"use client";

import { useState, useEffect, useRef } from "react";

export interface Contact {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ContactAutofillProps {
  value: string;
  onChange: (value: string) => void;
  onSelectContact: (contact: Contact) => void;
  contacts: Contact[];
  placeholder?: string;
  className?: string;
}

export default function ContactAutofill({
  value,
  onChange,
  onSelectContact,
  contacts,
  placeholder = "Start typing a name...",
  className = "",
}: ContactAutofillProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const filtered = contacts.filter(c =>
        c.name.toLowerCase().includes(value.toLowerCase()) ||
        c.company?.toLowerCase().includes(value.toLowerCase()) ||
        c.email?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredContacts(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [value, contacts]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredContacts.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filteredContacts[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredContacts[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (contact: Contact) => {
    onChange(contact.name);
    onSelectContact(contact);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => value.length >= 2 && filteredContacts.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-[--bg-surface] border border-[--border-default] rounded-lg shadow-lg overflow-hidden">
          {filteredContacts.map((contact, index) => (
            <button
              key={contact.id}
              onClick={() => handleSelect(contact)}
              className={`w-full text-left px-4 py-3 transition-colors ${
                index === selectedIndex 
                  ? "bg-[--color-primary]/10 text-[--text-primary]" 
                  : "hover:bg-[--bg-elevated] text-[--text-primary]"
              }`}
            >
              <div className="font-medium">{contact.name}</div>
              {(contact.title || contact.company) && (
                <div className="text-sm text-[--text-muted]">
                  {contact.title}{contact.title && contact.company && " at "}{contact.company}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook to manage contacts
export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("contacts");
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch {
        setContacts([]);
      }
    }
  }, []);

  const saveContacts = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem("contacts", JSON.stringify(newContacts));
  };

  const addContact = (contact: Omit<Contact, "id">) => {
    const newContact = { ...contact, id: `contact-${Date.now()}` };
    saveContacts([...contacts, newContact]);
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    saveContacts(contacts.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteContact = (id: string) => {
    saveContacts(contacts.filter(c => c.id !== id));
  };

  const importFromRecipients = (recipients: Array<{ name: string; title?: string; address?: string }>) => {
    const newContacts = recipients
      .filter(r => r.name && !contacts.some(c => c.name === r.name))
      .map(r => ({
        id: `contact-${Date.now()}-${Math.random()}`,
        name: r.name,
        title: r.title,
        address: r.address,
      }));
    if (newContacts.length > 0) {
      saveContacts([...contacts, ...newContacts]);
    }
    return newContacts.length;
  };

  return { contacts, addContact, updateContact, deleteContact, importFromRecipients };
}

