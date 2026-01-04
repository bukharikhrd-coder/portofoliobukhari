import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Upload, 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Star,
  TrendingUp,
  BookOpen,
  Sparkles
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CVReview {
  overallScore: number;
  completeness: {
    score: number;
    missing: string[];
    suggestions: string[];
  };
  writingQuality: {
    score: number;
    issues: string[];
    improvements: string[];
  };
  structure: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  oxfordCompliance: {
    score: number;
    issues: string[];
    fixes: string[];
  };
  summary: string;
  priorityActions: string[];
}

interface ExtractedCVData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  experience: Array<{
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    isCurrent: boolean;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    startYear: string;
    endYear: string;
    fieldOfStudy: string;
    description: string;
  }>;
  skills: string[];
  languages: Array<{
    name: string;
    proficiency: string;
  }>;
  trainings: Array<{
    title: string;
    organization: string;
    year: string;
    description: string;
  }>;
}

const AdminCVManager = () => {
  const [activeTab, setActiveTab] = useState("import");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedCVData | null>(null);
  const [review, setReview] = useState<CVReview | null>(null);
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);

  // Fetch all portfolio data for review and generation
  const { data: portfolioData } = useQuery({
    queryKey: ["portfolio_data_for_cv"],
    queryFn: async () => {
      const [
        heroRes,
        aboutRes,
        experienceRes,
        educationRes,
        skillsRes,
        languagesRes,
        trainingsRes,
        contactRes,
      ] = await Promise.all([
        supabase.from("hero_content").select("*").limit(1).maybeSingle(),
        supabase.from("about_content").select("*").limit(1).maybeSingle(),
        supabase.from("work_experience").select("*").order("order_index"),
        supabase.from("education").select("*").order("order_index"),
        supabase.from("skills").select("*").order("order_index"),
        supabase.from("language_skills").select("*").order("order_index"),
        supabase.from("trainings").select("*").order("order_index"),
        supabase.from("contact_content").select("*").limit(1).maybeSingle(),
      ]);

      return {
        hero: heroRes.data,
        about: aboutRes.data,
        experience: experienceRes.data || [],
        education: educationRes.data || [],
        skills: skillsRes.data || [],
        languages: languagesRes.data || [],
        trainings: trainingsRes.data || [],
        contact: contactRes.data,
      };
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsAnalyzing(true);
    setExtractedData(null);

    try {
      // Read PDF as text (basic extraction)
      const text = await extractTextFromPDF(file);
      
      if (!text || text.trim().length < 50) {
        toast.error("Could not extract text from PDF. Please ensure it's not a scanned image.");
        setIsAnalyzing(false);
        return;
      }

      // Send to AI for analysis
      const { data, error } = await supabase.functions.invoke("analyze-cv", {
        body: { pdfText: text, action: "analyze_cv" },
      });

      if (error) throw error;

      if (data.result) {
        setExtractedData(data.result);
        toast.success("CV analyzed successfully!");
      }
    } catch (error) {
      console.error("Error analyzing CV:", error);
      toast.error("Failed to analyze CV. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // Using PDF.js for text extraction would be ideal, but for simplicity
    // we'll use a basic approach and let AI handle messy text
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        
        // Basic text extraction from PDF (works for text-based PDFs)
        let text = "";
        let inText = false;
        let textBuffer = "";
        
        for (let i = 0; i < bytes.length; i++) {
          const byte = bytes[i];
          const char = String.fromCharCode(byte);
          
          if (byte >= 32 && byte <= 126) {
            textBuffer += char;
          } else if (byte === 10 || byte === 13) {
            if (textBuffer.length > 2) {
              text += textBuffer + " ";
            }
            textBuffer = "";
          } else {
            if (textBuffer.length > 2) {
              text += textBuffer + " ";
            }
            textBuffer = "";
          }
        }
        
        // Clean up the extracted text
        text = text
          .replace(/\s+/g, " ")
          .replace(/[^\x20-\x7E\u00C0-\u024F]/g, " ")
          .trim();
        
        resolve(text);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleReviewPortfolio = async () => {
    if (!portfolioData) {
      toast.error("No portfolio data available");
      return;
    }

    setIsReviewing(true);
    setReview(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-cv", {
        body: { portfolioData, action: "review_cv" },
      });

      if (error) throw error;

      if (data.result) {
        setReview(data.result);
        toast.success("Review completed!");
      }
    } catch (error) {
      console.error("Error reviewing portfolio:", error);
      toast.error("Failed to review portfolio. Please try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleGenerateCV = async () => {
    if (!portfolioData) {
      toast.error("No portfolio data available");
      return;
    }

    setIsGenerating(true);
    setGeneratedCV(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-cv", {
        body: { portfolioData, action: "generate_oxford_cv" },
      });

      if (error) throw error;

      if (data.result) {
        setGeneratedCV(data.result);
        toast.success("CV generated successfully!");
      }
    } catch (error) {
      console.error("Error generating CV:", error);
      toast.error("Failed to generate CV. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCV = () => {
    if (!generatedCV) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CV - Oxford Style</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${generatedCV}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleImportToPortfolio = async () => {
    if (!extractedData) return;

    toast.info("Importing data to portfolio...");
    
    try {
      // Import experience
      for (const exp of extractedData.experience) {
        await supabase.from("work_experience").insert({
          position: exp.position,
          company_name: exp.company,
          location: exp.location,
          start_date: exp.startDate,
          end_date: exp.isCurrent ? null : exp.endDate,
          description: exp.description,
          is_current: exp.isCurrent,
        });
      }

      // Import education
      for (const edu of extractedData.education) {
        await supabase.from("education").insert({
          degree: edu.degree,
          institution: edu.institution,
          location: edu.location,
          start_year: edu.startYear,
          end_year: edu.endYear,
          field_of_study: edu.fieldOfStudy,
          description: edu.description,
        });
      }

      // Import skills
      for (const skill of extractedData.skills) {
        await supabase.from("skills").insert({
          name: skill,
        });
      }

      // Import languages
      for (const lang of extractedData.languages) {
        await supabase.from("language_skills").insert({
          language_name: lang.name,
          proficiency_level: lang.proficiency,
        });
      }

      // Import trainings
      for (const training of extractedData.trainings) {
        await supabase.from("trainings").insert({
          title: training.title,
          organization: training.organization,
          year: training.year,
          description: training.description,
        });
      }

      toast.success("Data imported to portfolio successfully!");
      setExtractedData(null);
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error("Failed to import some data. Please check and retry.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">CV MANAGER</h1>
        <p className="text-muted-foreground mt-1">Import, review, and generate Oxford-style CV</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload size={16} />
            Import
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Sparkles size={16} />
            Review
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <FileText size={16} />
            Generate
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Upload size={18} className="text-primary" />
              Upload CV PDF
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your existing CV in PDF format. AI will analyze and extract data to populate your portfolio.
            </p>
            
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="cv-upload"
                disabled={isAnalyzing}
              />
              <label htmlFor="cv-upload" className="cursor-pointer">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="text-sm text-muted-foreground">Analyzing CV...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="text-muted-foreground" size={32} />
                    <span className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-muted-foreground">PDF up to 10MB</span>
                  </div>
                )}
              </label>
            </div>
          </Card>

          {/* Extracted Data Preview */}
          {extractedData && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  Extracted Data
                </h3>
                <Button onClick={handleImportToPortfolio} className="gap-2">
                  <Download size={16} />
                  Import to Portfolio
                </Button>
              </div>

              <div className="grid gap-4 text-sm">
                {extractedData.personal?.name && (
                  <div>
                    <span className="font-medium">Name:</span> {extractedData.personal.name}
                  </div>
                )}
                
                {extractedData.experience?.length > 0 && (
                  <div>
                    <span className="font-medium">Experience ({extractedData.experience.length}):</span>
                    <ul className="mt-1 ml-4 list-disc text-muted-foreground">
                      {extractedData.experience.slice(0, 3).map((exp, i) => (
                        <li key={i}>{exp.position} at {exp.company}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {extractedData.education?.length > 0 && (
                  <div>
                    <span className="font-medium">Education ({extractedData.education.length}):</span>
                    <ul className="mt-1 ml-4 list-disc text-muted-foreground">
                      {extractedData.education.map((edu, i) => (
                        <li key={i}>{edu.degree} - {edu.institution}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {extractedData.skills?.length > 0 && (
                  <div>
                    <span className="font-medium">Skills ({extractedData.skills.length}):</span>
                    <p className="text-muted-foreground">{extractedData.skills.slice(0, 10).join(", ")}</p>
                  </div>
                )}

                {extractedData.languages?.length > 0 && (
                  <div>
                    <span className="font-medium">Languages:</span>
                    <p className="text-muted-foreground">
                      {extractedData.languages.map(l => `${l.name} (${l.proficiency})`).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              AI-Powered CV Review
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get comprehensive feedback on your portfolio data for Oxford-style CV compliance.
            </p>
            
            <Button 
              onClick={handleReviewPortfolio} 
              disabled={isReviewing}
              className="gap-2"
            >
              {isReviewing ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Reviewing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Start Review
                </>
              )}
            </Button>
          </Card>

          {/* Review Results */}
          {review && (
            <div className="grid gap-4">
              {/* Overall Score */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Star size={18} className="text-primary" />
                    Overall Score
                  </h3>
                  <span className={`text-3xl font-bold ${getScoreColor(review.overallScore)}`}>
                    {review.overallScore}/100
                  </span>
                </div>
                <Progress 
                  value={review.overallScore} 
                  className="h-2"
                />
                <p className="mt-4 text-sm text-muted-foreground">{review.summary}</p>
              </Card>

              {/* Score Breakdown */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Completeness */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm flex items-center gap-2">
                      <CheckCircle size={14} />
                      Completeness
                    </span>
                    <span className={`font-bold ${getScoreColor(review.completeness.score)}`}>
                      {review.completeness.score}%
                    </span>
                  </div>
                  <Progress value={review.completeness.score} className="h-1.5 mb-3" />
                  {review.completeness.missing?.length > 0 && (
                    <div className="text-xs">
                      <span className="text-red-500 font-medium">Missing:</span>
                      <ul className="ml-3 mt-1 text-muted-foreground list-disc">
                        {review.completeness.missing.slice(0, 3).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>

                {/* Writing Quality */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm flex items-center gap-2">
                      <BookOpen size={14} />
                      Writing Quality
                    </span>
                    <span className={`font-bold ${getScoreColor(review.writingQuality.score)}`}>
                      {review.writingQuality.score}%
                    </span>
                  </div>
                  <Progress value={review.writingQuality.score} className="h-1.5 mb-3" />
                  {review.writingQuality.improvements?.length > 0 && (
                    <div className="text-xs">
                      <span className="text-yellow-500 font-medium">Suggestions:</span>
                      <ul className="ml-3 mt-1 text-muted-foreground list-disc">
                        {review.writingQuality.improvements.slice(0, 2).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>

                {/* Structure */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm flex items-center gap-2">
                      <TrendingUp size={14} />
                      Structure
                    </span>
                    <span className={`font-bold ${getScoreColor(review.structure.score)}`}>
                      {review.structure.score}%
                    </span>
                  </div>
                  <Progress value={review.structure.score} className="h-1.5 mb-3" />
                  {review.structure.recommendations?.length > 0 && (
                    <div className="text-xs">
                      <span className="text-blue-500 font-medium">Recommendations:</span>
                      <ul className="ml-3 mt-1 text-muted-foreground list-disc">
                        {review.structure.recommendations.slice(0, 2).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>

                {/* Oxford Compliance */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm flex items-center gap-2">
                      <FileText size={14} />
                      Oxford Style
                    </span>
                    <span className={`font-bold ${getScoreColor(review.oxfordCompliance.score)}`}>
                      {review.oxfordCompliance.score}%
                    </span>
                  </div>
                  <Progress value={review.oxfordCompliance.score} className="h-1.5 mb-3" />
                  {review.oxfordCompliance.fixes?.length > 0 && (
                    <div className="text-xs">
                      <span className="text-purple-500 font-medium">Fixes:</span>
                      <ul className="ml-3 mt-1 text-muted-foreground list-disc">
                        {review.oxfordCompliance.fixes.slice(0, 2).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </div>

              {/* Priority Actions */}
              {review.priorityActions?.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-primary" />
                    Priority Actions
                  </h4>
                  <ol className="list-decimal ml-5 space-y-1 text-sm text-muted-foreground">
                    {review.priorityActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ol>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Generate Oxford-Style CV
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate a professionally formatted CV from your portfolio data following Oxford University guidelines.
            </p>
            
            <Button 
              onClick={handleGenerateCV} 
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Generate CV
                </>
              )}
            </Button>
          </Card>

          {/* Generated CV Preview */}
          {generatedCV && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  Generated CV
                </h3>
                <Button onClick={handleDownloadCV} variant="outline" className="gap-2">
                  <Download size={16} />
                  Print / Download PDF
                </Button>
              </div>
              
              <div 
                className="border border-border rounded-lg p-6 bg-white text-black max-h-[600px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: generatedCV }}
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCVManager;
