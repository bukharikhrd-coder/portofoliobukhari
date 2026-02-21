import { useState, useRef, useEffect } from "react";
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
  Sparkles,
  Eye,
  GraduationCap,
  Briefcase,
  Palette,
  Zap,
  Edit3,
  Save,
  RotateCcw,
  Globe,
  ExternalLink,
  FileCode,
  Printer,
  Image as ImageIcon,
  User,
  Home
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ImageUpload from "./ImageUpload";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

// Editable iframe component for CV editing
const EditableCVIframe = ({ 
  html, 
  onContentChange,
  isEditing 
}: { 
  html: string; 
  onContentChange?: (newHtml: string) => void;
  isEditing?: boolean;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { box-sizing: border-box; }
              body { 
                margin: 0; 
                padding: 24px; 
                font-family: 'Times New Roman', serif;
                background: white;
                color: black;
                outline: none;
              }
              ${isEditing ? `
                body:focus { outline: 2px solid #f59e0b; outline-offset: -2px; }
                [contenteditable]:hover { background: rgba(245, 158, 11, 0.1); }
              ` : ''}
            </style>
          </head>
          <body ${isEditing ? 'contenteditable="true"' : ''}>
            ${html}
          </body>
          </html>
        `);
        doc.close();

        // Add input listener for content changes
        if (isEditing && onContentChange) {
          doc.body.addEventListener('input', () => {
            onContentChange(doc.body.innerHTML);
          });
        }

        // Adjust height after content loads
        setTimeout(() => {
          if (iframeRef.current?.contentDocument?.body) {
            const contentHeight = iframeRef.current.contentDocument.body.scrollHeight;
            setHeight(Math.min(Math.max(contentHeight + 48, 400), 800));
          }
        }, 100);
      }
    }
  }, [html, isEditing]);

  return (
    <iframe
      ref={iframeRef}
      className={`w-full border rounded-lg bg-white ${isEditing ? 'border-primary border-2' : 'border-border'}`}
      style={{ height: `${height}px` }}
      title="CV Preview"
    />
  );
};

// Editable iframe component for Portfolio editing (dark theme)
const EditablePortfolioIframe = ({ 
  html, 
  onContentChange,
  isEditing 
}: { 
  html: string; 
  onContentChange?: (newHtml: string) => void;
  isEditing?: boolean;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // For portfolio, we write the full HTML document as it includes its own styles
        doc.open();
        
        // If editing, we need to inject contenteditable and editing styles
        if (isEditing) {
          // Parse the HTML and inject editing capabilities
          const parser = new DOMParser();
          const parsedDoc = parser.parseFromString(html, 'text/html');
          
          // Add editing styles
          const styleTag = parsedDoc.createElement('style');
          styleTag.textContent = `
            body { outline: none; }
            body:focus { outline: 2px solid #f59e0b; outline-offset: -2px; }
            [contenteditable] * { cursor: text; }
            [contenteditable] *:hover { background: rgba(245, 158, 11, 0.15) !important; }
          `;
          parsedDoc.head.appendChild(styleTag);
          
          // Make body contenteditable
          parsedDoc.body.setAttribute('contenteditable', 'true');
          
          doc.write(parsedDoc.documentElement.outerHTML);
        } else {
          doc.write(html);
        }
        doc.close();

        // Add input listener for content changes
        if (isEditing && onContentChange) {
          doc.body.addEventListener('input', () => {
            // Get the full HTML including head for portfolio
            const fullHtml = doc.documentElement.outerHTML;
            // Clean up editing attributes before saving
            const cleanHtml = fullHtml
              .replace(/\s*contenteditable="true"/g, '')
              .replace(/<style>[\s\S]*?body:focus[\s\S]*?<\/style>/g, '');
            onContentChange(doc.body.innerHTML);
          });
        }
      }
    }
  }, [html, isEditing]);

  return (
    <iframe
      ref={iframeRef}
      className={`w-full bg-black ${isEditing ? 'ring-2 ring-primary' : 'border border-border'} rounded-lg overflow-hidden`}
      style={{ height: '600px' }}
      title="Portfolio Preview"
    />
  );
};

// Read-only iframe for preview
const CVPreviewIframe = ({ html }: { html: string }) => {
  return <EditableCVIframe html={html} isEditing={false} />;
};
const CV_LANGUAGES = [
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "zh", label: "中文 (Mandarin)", flag: "🇨🇳" },
];

const CV_TEMPLATES = [
  { 
    id: "oxford", 
    label: "Oxford", 
    icon: GraduationCap,
    description: "Traditional academic style, clean and professional"
  },
  { 
    id: "ats", 
    label: "ATS-Friendly", 
    icon: Zap,
    description: "Optimized for Applicant Tracking Systems"
  },
  { 
    id: "modern", 
    label: "Modern", 
    icon: Briefcase,
    description: "Contemporary design with clean lines"
  },
  { 
    id: "creative", 
    label: "Creative", 
    icon: Palette,
    description: "Unique layout for creative industries"
  },
];

// Sample CV templates for each language
const CV_PREVIEWS: Record<string, string> = {
  id: `
    <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #000;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">NAMA LENGKAP</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #444;">Jakarta, Indonesia • email@contoh.com • +62 812 3456 7890</p>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">LinkedIn: linkedin.com/in/nama • GitHub: github.com/nama</p>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">Ringkasan Profesional</h2>
        <p style="font-size: 13px; line-height: 1.5; margin: 0; text-align: justify;">Profesional berpengalaman dengan keahlian dalam pengembangan perangkat lunak dan manajemen proyek. Memiliki rekam jejak dalam memimpin tim dan menghasilkan solusi inovatif.</p>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">Pengalaman Kerja</h2>
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="font-size: 13px;">Senior Software Engineer</strong>
            <span style="font-size: 12px; color: #666;">Jan 2022 - Sekarang</span>
          </div>
          <div style="font-style: italic; font-size: 13px; color: #444;">PT. Teknologi Indonesia, Jakarta</div>
          <ul style="margin: 6px 0 0 0; padding-left: 18px; font-size: 12px; line-height: 1.6;">
            <li>Memimpin pengembangan aplikasi enterprise dengan 50+ pengguna aktif</li>
            <li>Mengimplementasikan arsitektur microservices yang meningkatkan performa 40%</li>
          </ul>
        </div>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">Pendidikan</h2>
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <strong style="font-size: 13px;">Sarjana Teknik Informatika</strong>
          <span style="font-size: 12px; color: #666;">2015 - 2019</span>
        </div>
        <div style="font-style: italic; font-size: 13px; color: #444;">Universitas Indonesia, Depok</div>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">Keahlian</h2>
        <p style="font-size: 12px; margin: 0;">JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, Docker, AWS</p>
      </div>
      
      <div>
        <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">Bahasa</h2>
        <p style="font-size: 12px; margin: 0;">Indonesia (Native), Inggris (Fasih), Mandarin (Dasar)</p>
      </div>
    </div>
  `,
  en: `
    <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #000;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">FULL NAME</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #444;">London, United Kingdom • email@example.com • +44 7123 456789</p>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">LinkedIn: linkedin.com/in/name • GitHub: github.com/name</p>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">Professional Summary</h2>
        <p style="font-size: 13px; line-height: 1.5; margin: 0; text-align: justify;">Experienced professional with expertise in software development and project management. Proven track record of leading teams and delivering innovative solutions.</p>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">Work Experience</h2>
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="font-size: 13px;">Senior Software Engineer</strong>
            <span style="font-size: 12px; color: #666;">Jan 2022 - Present</span>
          </div>
          <div style="font-style: italic; font-size: 13px; color: #444;">Tech Company Ltd, London</div>
          <ul style="margin: 6px 0 0 0; padding-left: 18px; font-size: 12px; line-height: 1.6;">
            <li>Led development of enterprise applications with 50+ active users</li>
            <li>Implemented microservices architecture improving performance by 40%</li>
          </ul>
        </div>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">Education</h2>
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <strong style="font-size: 13px;">Bachelor of Computer Science</strong>
          <span style="font-size: 12px; color: #666;">2015 - 2019</span>
        </div>
        <div style="font-style: italic; font-size: 13px; color: #444;">University of Oxford, Oxford</div>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">Skills</h2>
        <p style="font-size: 12px; margin: 0;">JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, Docker, AWS</p>
      </div>
      
      <div>
        <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">Languages</h2>
        <p style="font-size: 12px; margin: 0;">English (Native), Indonesian (Fluent), Mandarin (Basic)</p>
      </div>
    </div>
  `,
  zh: `
    <div style="font-family: 'SimSun', 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #000;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">姓 名</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #444;">北京，中国 • email@example.com • +86 138 1234 5678</p>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">领英: linkedin.com/in/name • GitHub: github.com/name</p>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">个人简介</h2>
        <p style="font-size: 13px; line-height: 1.6; margin: 0; text-align: justify;">经验丰富的专业人士，专长于软件开发和项目管理。具有领导团队和提供创新解决方案的良好记录。</p>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">工作经历</h2>
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="font-size: 13px;">高级软件工程师</strong>
            <span style="font-size: 12px; color: #666;">2022年1月 - 至今</span>
          </div>
          <div style="font-style: italic; font-size: 13px; color: #444;">科技有限公司，北京</div>
          <ul style="margin: 6px 0 0 0; padding-left: 18px; font-size: 12px; line-height: 1.6;">
            <li>主导开发拥有50+活跃用户的企业级应用程序</li>
            <li>实施微服务架构，性能提升40%</li>
          </ul>
        </div>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">教育背景</h2>
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <strong style="font-size: 13px;">计算机科学学士</strong>
          <span style="font-size: 12px; color: #666;">2015 - 2019</span>
        </div>
        <div style="font-style: italic; font-size: 13px; color: #444;">北京大学，北京</div>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">专业技能</h2>
        <p style="font-size: 12px; margin: 0;">JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, Docker, AWS</p>
      </div>
      
      <div>
        <h2 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 1px;">语言能力</h2>
        <p style="font-size: 12px; margin: 0;">中文（母语），英语（流利），印尼语（基础）</p>
      </div>
    </div>
  `,
  ar: `
    <div dir="rtl" style="font-family: 'Traditional Arabic', 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #000; text-align: right;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">الاسم الكامل</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #444;">الرياض، المملكة العربية السعودية • email@example.com • 966+ 50 123 4567</p>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">لينكد إن: linkedin.com/in/name • جيت هب: github.com/name</p>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px;">الملخص المهني</h2>
        <p style="font-size: 13px; line-height: 1.8; margin: 0; text-align: justify;">محترف ذو خبرة في تطوير البرمجيات وإدارة المشاريع. سجل حافل في قيادة الفرق وتقديم حلول مبتكرة.</p>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px;">الخبرة العملية</h2>
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; flex-direction: row-reverse;">
            <strong style="font-size: 13px;">مهندس برمجيات أول</strong>
            <span style="font-size: 12px; color: #666;">يناير 2022 - حتى الآن</span>
          </div>
          <div style="font-style: italic; font-size: 13px; color: #444;">شركة التقنية، الرياض</div>
          <ul style="margin: 6px 0 0 0; padding-right: 18px; font-size: 12px; line-height: 1.8;">
            <li>قيادة تطوير تطبيقات المؤسسات مع أكثر من 50 مستخدمًا نشطًا</li>
            <li>تنفيذ بنية الخدمات المصغرة مما أدى إلى تحسين الأداء بنسبة 40%</li>
          </ul>
        </div>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px;">التعليم</h2>
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-direction: row-reverse;">
          <strong style="font-size: 13px;">بكالوريوس علوم الحاسب</strong>
          <span style="font-size: 12px; color: #666;">2015 - 2019</span>
        </div>
        <div style="font-style: italic; font-size: 13px; color: #444;">جامعة الملك سعود، الرياض</div>
      </div>
      
      <div style="margin-bottom: 18px;">
        <h2 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px;">المهارات</h2>
        <p style="font-size: 12px; margin: 0;">JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, Docker, AWS</p>
      </div>
      
      <div>
        <h2 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px;">اللغات</h2>
        <p style="font-size: 12px; margin: 0;">العربية (اللغة الأم)، الإنجليزية (طلاقة)، الإندونيسية (أساسي)</p>
      </div>
    </div>
  `,
};

const AdminCVManager = () => {
  const [activeTab, setActiveTab] = useState("import");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedCVData | null>(null);
  const [review, setReview] = useState<CVReview | null>(null);
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [editedCV, setEditedCV] = useState<string | null>(null);
  const [isEditingCV, setIsEditingCV] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("id");
  const [selectedTemplate, setSelectedTemplate] = useState("oxford");
  const [isGeneratingPortfolio, setIsGeneratingPortfolio] = useState(false);
  const [generatedPortfolio, setGeneratedPortfolio] = useState<string | null>(null);
  const [editedPortfolio, setEditedPortfolio] = useState<string | null>(null);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [selectedPhotoSource, setSelectedPhotoSource] = useState<"about" | "hero" | "custom">("about");
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [targetPosition, setTargetPosition] = useState("");

  // Fetch all portfolio data for review and generation
  const { data: portfolioData, refetch: refetchPortfolioData } = useQuery({
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
        heroImageRes,
        aboutImageRes,
        profileImageRes,
        projectsRes,
        toolsRes,
        portfolioUrlRes,
      ] = await Promise.all([
        supabase.from("hero_content").select("*").limit(1).maybeSingle(),
        supabase.from("about_content").select("*").limit(1).maybeSingle(),
        supabase.from("work_experience").select("*").order("order_index"),
        supabase.from("education").select("*").order("order_index"),
        supabase.from("skills").select("*").order("order_index"),
        supabase.from("language_skills").select("*").order("order_index"),
        supabase.from("trainings").select("*").order("order_index"),
        supabase.from("contact_content").select("*").limit(1).maybeSingle(),
        supabase.from("site_settings").select("value").eq("key", "hero_image_url").maybeSingle(),
        supabase.from("site_settings").select("value").eq("key", "about_image_url").maybeSingle(),
        supabase.from("site_settings").select("value").eq("key", "profile_image_url").maybeSingle(),
        supabase.from("projects").select("*").order("order_index"),
        supabase.from("video_tools").select("*").order("order_index"),
        supabase.from("site_settings").select("value").eq("key", "portfolio_url").maybeSingle(),
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
        heroImageUrl: heroImageRes.data?.value || null,
        aboutImageUrl: aboutImageRes.data?.value || null,
        profileImageUrl: profileImageRes.data?.value || null,
        projects: projectsRes.data || [],
        tools: toolsRes.data || [],
        portfolioUrl: portfolioUrlRes.data?.value || "https://portofoliobukhari.lovable.app",
      };
    },
  });

  // Get the selected photo URL based on user selection
  const getSelectedPhotoUrl = () => {
    if (selectedPhotoSource === "custom" && customPhotoUrl) {
      return customPhotoUrl;
    }
    if (selectedPhotoSource === "hero") {
      return portfolioData?.heroImageUrl || null;
    }
    // Default to about
    return portfolioData?.aboutImageUrl || portfolioData?.heroImageUrl || portfolioData?.profileImageUrl || null;
  };

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
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        
        fullText += pageText + "\n";
      }
      
      // Clean up the extracted text
      return fullText
        .replace(/\s+/g, " ")
        .trim();
    } catch (error) {
      console.error("PDF.js extraction failed:", error);
      toast.error("Failed to extract text from PDF");
      return "";
    }
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
    setEditedCV(null);
    setIsEditingCV(false);

    try {
      // Use selected photo source
      const portfolioDataWithSelectedPhoto = {
        ...portfolioData,
        profileImageUrl: getSelectedPhotoUrl(),
      };
      
      const { data, error } = await supabase.functions.invoke("analyze-cv", {
        body: { portfolioData: portfolioDataWithSelectedPhoto, action: "generate_cv", language: selectedLanguage, template: selectedTemplate, targetPosition: targetPosition.trim() || undefined },
      });

      if (error) throw error;

      if (data.result) {
        setGeneratedCV(data.result);
        setEditedCV(data.result);
        toast.success("CV generated successfully!");
      }
    } catch (error) {
      console.error("Error generating CV:", error);
      toast.error("Failed to generate CV. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePortfolio = async () => {
    if (!portfolioData) {
      toast.error("No portfolio data available");
      return;
    }

    setIsGeneratingPortfolio(true);
    setGeneratedPortfolio(null);
    setEditedPortfolio(null);
    setIsEditingPortfolio(false);

    try {
      // Use selected photo source
      const portfolioDataWithSelectedPhoto = {
        ...portfolioData,
        profileImageUrl: getSelectedPhotoUrl(),
      };
      
      const { data, error } = await supabase.functions.invoke("analyze-cv", {
        body: { portfolioData: portfolioDataWithSelectedPhoto, action: "generate_portfolio", language: selectedLanguage },
      });

      if (error) throw error;

      if (data.result) {
        setGeneratedPortfolio(data.result);
        setEditedPortfolio(data.result);
        toast.success("Portfolio generated successfully!");
      }
    } catch (error) {
      console.error("Error generating portfolio:", error);
      toast.error("Failed to generate portfolio. Please try again.");
    } finally {
      setIsGeneratingPortfolio(false);
    }
  };

  const handleDownloadCV = () => {
    const cvToDownload = editedCV || generatedCV;
    if (!cvToDownload) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CV - ${CV_TEMPLATES.find(t => t.id === selectedTemplate)?.label || 'Professional'}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${cvToDownload}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPortfolioHTML = () => {
    const portfolioToDownload = editedPortfolio || generatedPortfolio;
    if (!portfolioToDownload) return;

    // Create a downloadable HTML file
    const blob = new Blob([portfolioToDownload], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${selectedLanguage}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Portfolio HTML downloaded!");
  };

  const handleDownloadPortfolioPDF = () => {
    const portfolioToDownload = editedPortfolio || generatedPortfolio;
    if (!portfolioToDownload) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(portfolioToDownload);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleOpenPortfolioNewTab = () => {
    const portfolioToOpen = editedPortfolio || generatedPortfolio;
    if (!portfolioToOpen) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(portfolioToOpen);
      printWindow.document.close();
    }
  };

  const handleResetCV = () => {
    if (generatedCV) {
      setEditedCV(generatedCV);
      setIsEditingCV(false);
      toast.success("CV reset to original");
    }
  };

  const handleResetPortfolio = () => {
    if (generatedPortfolio) {
      setEditedPortfolio(generatedPortfolio);
      setIsEditingPortfolio(false);
      toast.success("Portfolio reset to original");
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
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
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
            CV
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Globe size={16} />
            Portfolio
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
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Generate CV
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate a professionally formatted CV from your portfolio data.
            </p>
            
            {/* Template Selection */}
            <div className="mb-5">
              <label className="text-sm font-medium mb-2 block">Select Template</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CV_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-sm font-medium transition-all ${
                        selectedTemplate === template.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border hover:bg-secondary"
                      }`}
                    >
                      <Icon size={24} />
                      <span>{template.label}</span>
                      <span className={`text-xs text-center ${
                        selectedTemplate === template.id 
                          ? "text-primary-foreground/80" 
                          : "text-muted-foreground"
                      }`}>
                        {template.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Selection */}
            <div className="mb-5">
              <label className="text-sm font-medium mb-2 block">Select Language</label>
              <div className="flex flex-wrap gap-2">
                {CV_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedLanguage === lang.code
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-secondary"
                    }`}
                  >
                    <span className="mr-1.5">{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Selection */}
            <div className="mb-5">
              <label className="text-sm font-medium mb-2 block">Select Photo</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* About Photo Option */}
                <button
                  onClick={() => setSelectedPhotoSource("about")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-sm font-medium transition-all ${
                    selectedPhotoSource === "about"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-secondary"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary border-2 border-current flex items-center justify-center">
                    {portfolioData?.aboutImageUrl ? (
                      <img src={portfolioData.aboutImageUrl} alt="About" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <span>About Section</span>
                  <span className={`text-xs ${selectedPhotoSource === "about" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {portfolioData?.aboutImageUrl ? "Available" : "Not set"}
                  </span>
                </button>

                {/* Hero Photo Option */}
                <button
                  onClick={() => setSelectedPhotoSource("hero")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-sm font-medium transition-all ${
                    selectedPhotoSource === "hero"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-secondary"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary border-2 border-current flex items-center justify-center">
                    {portfolioData?.heroImageUrl ? (
                      <img src={portfolioData.heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                    ) : (
                      <Home size={24} />
                    )}
                  </div>
                  <span>Hero Section</span>
                  <span className={`text-xs ${selectedPhotoSource === "hero" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {portfolioData?.heroImageUrl ? "Available" : "Not set"}
                  </span>
                </button>

                {/* Custom Upload Option */}
                <button
                  onClick={() => setSelectedPhotoSource("custom")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-sm font-medium transition-all ${
                    selectedPhotoSource === "custom"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-secondary"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary border-2 border-current flex items-center justify-center">
                    {customPhotoUrl ? (
                      <img src={customPhotoUrl} alt="Custom" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={24} />
                    )}
                  </div>
                  <span>Upload New</span>
                  <span className={`text-xs ${selectedPhotoSource === "custom" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {customPhotoUrl ? "Uploaded" : "Choose file"}
                  </span>
                </button>
              </div>

            {/* Custom Photo Upload */}
            {selectedPhotoSource === "custom" && (
                <div className="mt-4 p-4 border border-border rounded-lg bg-secondary/50">
                  <ImageUpload
                    currentImage={customPhotoUrl}
                    onImageChange={(url) => setCustomPhotoUrl(url)}
                    bucket="project-images"
                    folder="cv-photos"
                    label="Upload Photo for CV/Portfolio"
                    aspectRatio={1}
                  />
                </div>
              )}
            </div>

            {/* Target Position */}
            <div className="mb-5">
              <label className="text-sm font-medium mb-2 block">Target Position (Optional)</label>
              <input
                type="text"
                value={targetPosition}
                onChange={(e) => setTargetPosition(e.target.value)}
                placeholder="e.g. Frontend Developer, Data Analyst, Project Manager..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Masukkan posisi yang ingin dilamar. CV akan disesuaikan kata-kata dan fokusnya sesuai posisi tersebut. Kosongkan untuk CV umum.
              </p>
            </div>
            
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

          {/* Language Preview */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                <Eye size={18} className="text-primary" />
                Format Preview ({CV_LANGUAGES.find(l => l.code === selectedLanguage)?.label})
              </h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                Sample Template
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Preview contoh format CV Oxford dalam bahasa yang dipilih. Data Anda akan mengikuti format ini.
            </p>
            <CVPreviewIframe html={CV_PREVIEWS[selectedLanguage]} />
          </Card>

          {/* Generated CV Preview - Editable */}
          {generatedCV && (
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle size={18} className="text-green-500" />
                  Generated CV
                  {isEditingCV && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      Editing Mode
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {!isEditingCV ? (
                    <Button 
                      onClick={() => setIsEditingCV(true)} 
                      variant="outline" 
                      size="sm"
                      className="gap-2"
                    >
                      <Edit3 size={14} />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={handleResetCV} 
                        variant="outline" 
                        size="sm"
                        className="gap-2"
                      >
                        <RotateCcw size={14} />
                        Reset
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsEditingCV(false);
                          toast.success("Changes saved!");
                        }} 
                        size="sm"
                        className="gap-2"
                      >
                        <Save size={14} />
                        Done
                      </Button>
                    </>
                  )}
                  <Button onClick={handleDownloadCV} variant="outline" size="sm" className="gap-2">
                    <Download size={14} />
                    Print / PDF
                  </Button>
                </div>
              </div>
              
              {isEditingCV && (
                <p className="text-xs text-amber-500 mb-3 flex items-center gap-1">
                  <Edit3 size={12} />
                  Click on the CV below to edit text directly. Changes are saved automatically.
                </p>
              )}
              
              <EditableCVIframe 
                html={editedCV || generatedCV} 
                isEditing={isEditingCV}
                onContentChange={(newHtml) => setEditedCV(newHtml)}
              />
            </Card>
          )}
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4 mt-4">
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Globe size={18} className="text-primary" />
              Generate Portfolio Page
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate a stylish portfolio page matching your website design - dark theme, amber accents, and editorial layout.
            </p>
            
            {/* Language Selection */}
            <div className="mb-5">
              <label className="text-sm font-medium mb-2 block">Select Language</label>
              <div className="flex flex-wrap gap-2">
                {CV_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedLanguage === lang.code
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-secondary"
                    }`}
                  >
                    <span className="mr-1.5">{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Selection for Portfolio */}
            <div className="mb-5">
              <label className="text-sm font-medium mb-2 block">Select Photo</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* About Photo Option */}
                <button
                  onClick={() => setSelectedPhotoSource("about")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-sm font-medium transition-all ${
                    selectedPhotoSource === "about"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-secondary"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary border-2 border-current flex items-center justify-center">
                    {portfolioData?.aboutImageUrl ? (
                      <img src={portfolioData.aboutImageUrl} alt="About" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <span>About Section</span>
                  <span className={`text-xs ${selectedPhotoSource === "about" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {portfolioData?.aboutImageUrl ? "Available" : "Not set"}
                  </span>
                </button>

                {/* Hero Photo Option */}
                <button
                  onClick={() => setSelectedPhotoSource("hero")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-sm font-medium transition-all ${
                    selectedPhotoSource === "hero"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-secondary"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary border-2 border-current flex items-center justify-center">
                    {portfolioData?.heroImageUrl ? (
                      <img src={portfolioData.heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                    ) : (
                      <Home size={24} />
                    )}
                  </div>
                  <span>Hero Section</span>
                  <span className={`text-xs ${selectedPhotoSource === "hero" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {portfolioData?.heroImageUrl ? "Available" : "Not set"}
                  </span>
                </button>

                {/* Custom Upload Option */}
                <button
                  onClick={() => setSelectedPhotoSource("custom")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-sm font-medium transition-all ${
                    selectedPhotoSource === "custom"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-secondary"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary border-2 border-current flex items-center justify-center">
                    {customPhotoUrl ? (
                      <img src={customPhotoUrl} alt="Custom" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={24} />
                    )}
                  </div>
                  <span>Upload New</span>
                  <span className={`text-xs ${selectedPhotoSource === "custom" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {customPhotoUrl ? "Uploaded" : "Choose file"}
                  </span>
                </button>
              </div>

              {/* Custom Photo Upload */}
              {selectedPhotoSource === "custom" && (
                <div className="mt-4 p-4 border border-border rounded-lg bg-secondary/50">
                  <ImageUpload
                    currentImage={customPhotoUrl}
                    onImageChange={(url) => setCustomPhotoUrl(url)}
                    bucket="project-images"
                    folder="cv-photos"
                    label="Upload Photo for CV/Portfolio"
                    aspectRatio={1}
                  />
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleGeneratePortfolio} 
              disabled={isGeneratingPortfolio}
              className="gap-2"
            >
              {isGeneratingPortfolio ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <Globe size={16} />
                  Generate Portfolio
                </>
              )}
            </Button>
          </Card>

          {/* Generated Portfolio Preview - Editable */}
          {generatedPortfolio && (
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle size={18} className="text-green-500" />
                  Generated Portfolio
                  {isEditingPortfolio && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      Editing Mode
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {!isEditingPortfolio ? (
                    <Button 
                      onClick={() => setIsEditingPortfolio(true)} 
                      variant="outline" 
                      size="sm"
                      className="gap-2"
                    >
                      <Edit3 size={14} />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={handleResetPortfolio} 
                        variant="outline" 
                        size="sm"
                        className="gap-2"
                      >
                        <RotateCcw size={14} />
                        Reset
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsEditingPortfolio(false);
                          toast.success("Changes saved!");
                        }} 
                        size="sm"
                        className="gap-2"
                      >
                        <Save size={14} />
                        Done
                      </Button>
                    </>
                  )}
                  <Button onClick={handleOpenPortfolioNewTab} variant="outline" size="sm" className="gap-2">
                    <ExternalLink size={14} />
                    Open in New Tab
                  </Button>
                  <Button onClick={handleDownloadPortfolioHTML} variant="outline" size="sm" className="gap-2">
                    <FileCode size={14} />
                    Download HTML
                  </Button>
                  <Button onClick={handleDownloadPortfolioPDF} variant="outline" size="sm" className="gap-2">
                    <Printer size={14} />
                    Print / PDF
                  </Button>
                </div>
              </div>
              
              {isEditingPortfolio && (
                <p className="text-xs text-amber-500 mb-3 flex items-center gap-1">
                  <Edit3 size={12} />
                  Click on the portfolio below to edit text directly. Changes are saved automatically.
                </p>
              )}
              
              <EditablePortfolioIframe 
                html={editedPortfolio || generatedPortfolio} 
                isEditing={isEditingPortfolio}
                onContentChange={(newHtml) => {
                  // For portfolio, we need to reconstruct the full HTML
                  if (generatedPortfolio) {
                    // Replace body content in the original HTML
                    const updatedHtml = generatedPortfolio.replace(
                      /<body[^>]*>[\s\S]*<\/body>/i,
                      `<body>${newHtml}</body>`
                    );
                    setEditedPortfolio(updatedHtml);
                  }
                }}
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCVManager;
