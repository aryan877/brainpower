import { useState, useEffect } from "react";
import axios from "axios";

interface Template {
  category: string;
  name: string;
  description: string;
  template: string;
}

interface TemplatesPanelProps {
  onSelectTemplate: (template: string) => void;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function TemplatesPanel({
  onSelectTemplate,
  onClose,
}: TemplatesPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchTemplates();
  }, []);

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.template.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      matchesSearch &&
      (!selectedCategory || template.category === selectedCategory)
    );
  });

  if (loading) {
    return (
      <div className="absolute left-4 right-4 bottom-[88px] bg-[var(--background-secondary)] backdrop-blur-xl rounded-lg shadow-2xl p-4 h-[200px] flex items-center justify-center z-[99999] border border-[var(--border-color)]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-[var(--text-secondary)]">
            Loading templates...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute left-4 right-4 bottom-[88px] bg-[var(--background-secondary)] backdrop-blur-xl rounded-lg shadow-2xl p-4 h-[200px] flex items-center justify-center z-[99999] border border-[var(--border-color)]">
        <div className="text-red-500 text-center">
          <p className="mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-500 hover:text-blue-400"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute left-4 right-4 bottom-[88px] bg-[var(--background-secondary)] backdrop-blur-xl rounded-lg shadow-2xl p-4 max-h-[70vh] overflow-hidden flex flex-col z-[99999] border border-[var(--border-color)]">
      <div className="sticky top-0 bg-[var(--background-secondary)] pt-2 pb-4 z-[99999] border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Templates
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--background)] rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[var(--text-secondary)]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <input
          type="text"
          placeholder="Search templates..."
          className="w-full p-2 rounded-md bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              !selectedCategory
                ? "bg-blue-500 text-white"
                : "bg-[var(--background)] text-[var(--text-secondary)]"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-[var(--background)] text-[var(--text-secondary)]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent bg-[var(--background-secondary)]">
        {filteredTemplates.map((template, index) => (
          <div
            key={index}
            className="bg-[var(--background)] p-3 rounded-lg cursor-pointer"
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium text-[var(--text-primary)]">
                {template.name}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--background-secondary)] text-[var(--text-secondary)]">
                {template.category}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              {template.description}
            </p>
            <div className="text-sm font-mono p-2 rounded bg-[var(--background-secondary)] text-[var(--text-primary)]">
              {template.template}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTemplate(template.template);
                  onClose();
                }}
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
