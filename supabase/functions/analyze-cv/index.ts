import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfText, portfolioData, action, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    // Language mapping for prompts
    const languageNames: Record<string, string> = {
      id: "Indonesian (Bahasa Indonesia)",
      en: "English",
      zh: "Chinese (Simplified)",
      ar: "Arabic",
    };
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "analyze_cv") {
      // Analyze uploaded CV and extract structured data
      systemPrompt = `You are a professional CV/Resume analyzer. Extract and structure information from the CV text provided.
      
Return a JSON object with the following structure:
{
  "personal": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string"
  },
  "summary": "string - professional summary",
  "experience": [
    {
      "position": "string",
      "company": "string",
      "location": "string",
      "startDate": "string (Month Year)",
      "endDate": "string (Month Year or Present)",
      "description": "string - key responsibilities and achievements",
      "isCurrent": boolean
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string",
      "startYear": "string",
      "endYear": "string",
      "fieldOfStudy": "string",
      "description": "string"
    }
  ],
  "skills": ["string array of technical and soft skills"],
  "languages": [
    {
      "name": "string",
      "proficiency": "Native | Fluent | Advanced | Intermediate | Basic"
    }
  ],
  "trainings": [
    {
      "title": "string",
      "organization": "string",
      "year": "string",
      "description": "string"
    }
  ]
}

Be thorough and extract all relevant information. If information is not available, use null or empty arrays.`;

      userPrompt = `Analyze this CV and extract structured data:\n\n${pdfText}`;
    } else if (action === "review_cv") {
      // Review existing portfolio data for completeness and quality
      systemPrompt = `You are an expert CV consultant specializing in Oxford-style academic and professional CVs. 
Review the portfolio data and provide comprehensive feedback in Indonesian language.

Provide your review in JSON format:
{
  "overallScore": number (1-100),
  "completeness": {
    "score": number (1-100),
    "missing": ["list of missing sections or data"],
    "suggestions": ["specific suggestions to add"]
  },
  "writingQuality": {
    "score": number (1-100),
    "issues": ["list of writing issues found"],
    "improvements": ["specific rewriting suggestions"]
  },
  "structure": {
    "score": number (1-100),
    "issues": ["structural problems"],
    "recommendations": ["ordering and formatting suggestions"]
  },
  "oxfordCompliance": {
    "score": number (1-100),
    "issues": ["deviations from Oxford CV style"],
    "fixes": ["how to align with Oxford format"]
  },
  "summary": "string - overall assessment in 2-3 sentences",
  "priorityActions": ["top 3-5 immediate actions to improve the CV"]
}`;

      userPrompt = `Review this portfolio data for a professional CV:\n\n${JSON.stringify(portfolioData, null, 2)}`;
    } else if (action === "generate_oxford_cv") {
      // Generate Oxford-style CV content from portfolio data
      const targetLanguage = languageNames[language] || "Indonesian (Bahasa Indonesia)";
      const isArabic = language === "ar";
      
      systemPrompt = `You are an expert at creating Oxford-style academic CVs. Generate a professionally formatted CV in HTML that follows the Oxford University CV guidelines.

Oxford CV characteristics:
- Clean, minimal design with clear hierarchy
- Name prominently at top, followed by contact details
- Reverse chronological order for experience and education
- Clear section headings
- Concise, achievement-focused bullet points
- No photos or graphics
- Professional, academic tone

IMPORTANT: The CV MUST be written entirely in ${targetLanguage}. Translate all content including section headings, dates format, and descriptions to ${targetLanguage}.
${isArabic ? "For Arabic, add dir=\"rtl\" to the body tag and use appropriate RTL styling." : ""}

Return ONLY valid HTML content (no markdown, no code blocks) that can be directly rendered. Use inline styles for formatting. The HTML should be printable to PDF.`;

      userPrompt = `Generate an Oxford-style CV HTML from this portfolio data. The entire CV must be written in ${targetLanguage}:\n\n${JSON.stringify(portfolioData, null, 2)}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from AI");
    }

    // For analyze_cv and review_cv, parse JSON from response
    if (action === "analyze_cv" || action === "review_cv") {
      try {
        // Remove markdown code blocks if present
        let jsonStr = content;
        if (jsonStr.includes("```json")) {
          jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (jsonStr.includes("```")) {
          jsonStr = jsonStr.replace(/```\n?/g, "");
        }
        const parsed = JSON.parse(jsonStr.trim());
        return new Response(JSON.stringify({ result: parsed }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Failed to parse JSON:", e, content);
        return new Response(JSON.stringify({ result: content, raw: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // For generate_oxford_cv, return HTML directly
    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-cv error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
