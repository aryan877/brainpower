import { useState, useEffect } from "react";
import axios from "axios";

interface Template {
  category: string;
  name: string;
  description: string;
  template: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  searchTerm: string;
  onSelectTemplate: (template: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CommandPalette({
  isOpen,
  searchTerm,
  onSelectTemplate,
}: CommandPaletteProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tools`);
        setTemplates(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const filteredTemplates = templates.filter((template) => {
    const search = searchTerm.slice(1).toLowerCase(); // Remove the '/' from search
    return (
      template.name.toLowerCase().includes(search) ||
      template.description.toLowerCase().includes(search) ||
      template.template.toLowerCase().includes(search)
    );
  });

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="absolute left-0 right-0 bottom-full mb-8 bg-[var(--background-secondary)] rounded-lg shadow-2xl p-2 max-h-[300px] border border-[var(--border-color)]">
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute left-0 right-0 bottom-full mb-8 bg-[var(--background-secondary)] rounded-lg shadow-2xl p-4 border border-[var(--border-color)]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (filteredTemplates.length === 0) {
    return (
      <div className="absolute left-0 right-0 bottom-full mb-8 bg-[var(--background-secondary)] rounded-lg shadow-2xl p-4 border border-[var(--border-color)]">
        <p className="text-[var(--text-secondary)]">
          No matching templates found
        </p>
      </div>
    );
  }

  return (
    <div className="absolute left-0 right-0 bottom-full mb-8 bg-[var(--background-secondary)] rounded-lg shadow-2xl overflow-hidden border border-[var(--border-color)]">
      <div className="max-h-[300px] overflow-y-auto">
        {filteredTemplates.map((template, index) => (
          <div
            key={index}
            className={`p-3 cursor-pointer hover:bg-[var(--background)] ${
              index === selectedIndex ? "bg-[var(--background)]" : ""
            }`}
            onClick={() => {
              onSelectTemplate(template.template);
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-[var(--text-primary)]">
                {template.name}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background)] text-[var(--text-secondary)]">
                {template.category}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {template.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
