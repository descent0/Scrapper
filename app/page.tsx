"use client";

import { useState } from "react";
import Image from "next/image";

interface PersonData {
  name: string;
  googleSnippets: string[];
  googleKnowledge: {
    title: string;
    subtitle: string;
    description: string;
    born: string;
  };
  wikipedia: {
    extract: string;
    title: string;
    thumbnail: string | null;
  };
}

export default function Page() {
  const [name, setName] = useState("");
  const [data, setData] = useState<PersonData | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/person?name=${encodeURIComponent(name)}`);
      const result = await res.json();
      setData(result.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="Enter a person's name (e.g., Narendra Modi, Elon Musk)..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && search()}
            />
            <button
              onClick={search}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold text-lg transition shadow-lg"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Results */}
        {data && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header with Image */}
            {data.wikipedia.title && (
              <div className="flex items-start gap-6 mb-8">
                {data.wikipedia.thumbnail && (
                  <div className="flex-shrink-0">
                    <img
                      src={data.wikipedia.thumbnail}
                      alt={data.wikipedia.title}
                      className="w-32 h-32 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-3xl font-bold text-gray-800">{data.wikipedia.title}</h2>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Wikipedia</span>
                  </div>
                  {data.googleKnowledge.subtitle && (
                    <p className="text-lg text-gray-600 mb-3 font-medium">{data.googleKnowledge.subtitle}</p>
                  )}
                  {data.googleKnowledge.born && (
                    <p className="text-sm text-gray-500 mb-3">📅 Born: {data.googleKnowledge.born}</p>
                  )}
                  <p className="text-gray-700 leading-relaxed">{data.wikipedia.extract}</p>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 my-8"></div>

            {/* Google Knowledge Panel */}
            {data.googleKnowledge.description && (
              <>
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Google Knowledge</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Live Data</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{data.googleKnowledge.description}</p>
                </div>
                <div className="border-t border-gray-200 my-8"></div>
              </>
            )}

            {/* Google Snippets */}
            {data.googleSnippets && data.googleSnippets.length > 0 && (
              <>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Key Information</h3>
                  <div className="space-y-3">
                    {data.googleSnippets.map((snippet, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed flex-1">{snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-200 my-8"></div>
              </>
            )}

            {/* Download Button */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">📄 Export Report</h3>
              <p className="text-gray-600 mb-6">Download a comprehensive PDF report with all the information above</p>
              <a
                href={`/api/pdf?name=${encodeURIComponent(name)}`}
                className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition shadow-lg hover:shadow-xl"
              >
                Download Full Report (PDF)
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
