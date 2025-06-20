import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CodeEditor from "@/components/CodeEditor";
import ResultsDashboard from "@/components/ResultsDashboard";
import { analyzeCode, generateTests } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [code, setCode] = useState("");
  const [purpose, setPurpose] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleAnalyze = async (data: any) => {
    if (!purpose.trim()) {
      toast.error("Please describe the purpose of your code");
      return;
    }

    setIsAnalyzing(true);
    try {
      let results;
      if (data.files) {
        // Handle file upload
        const formData = new FormData();
        formData.append('purpose', purpose);
        data.files.forEach((file: File) => {
          formData.append('files', file);
        });

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Analysis failed');
        }

        const responseData = await response.json();
        results = responseData.data;
      } else {
        // Handle manual code or GitHub URL
        results = await analyzeCode({ ...data, purpose });
      }

      setAnalysisResults(results);
      toast.success("Code analysis completed!");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.response?.data?.error || error.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateTests = async (data: any) => {
    if (!purpose.trim()) {
      toast.error("Please describe the purpose of your code");
      return;
    }

    setIsGeneratingTests(true);
    try {
      let results;
      if (data.files) {
        // Handle file upload
        const formData = new FormData();
        formData.append('purpose', purpose);
        data.files.forEach((file: File) => {
          formData.append('files', file);
        });

        const response = await fetch('/api/generate-tests', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Test generation failed');
        }

        const responseData = await response.json();
        results = responseData.data;
      } else {
        // Handle manual code or GitHub URL
        results = await generateTests({ ...data, purpose });
      }

      setTestResults(results);
      toast.success("Test generation completed!");
    } catch (error: any) {
      console.error("Test generation error:", error);
      toast.error(error.response?.data?.error || error.message || "Test generation failed");
    } finally {
      setIsGeneratingTests(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CodeEditor
              code={code}
              setCode={setCode}
              purpose={purpose}
              setPurpose={setPurpose}
              onAnalyze={handleAnalyze}
              onGenerateTests={handleGenerateTests}
              isAnalyzing={isAnalyzing}
              isGeneratingTests={isGeneratingTests}
            />
          </div>
          <div>
            <ResultsDashboard
              analysisResults={analysisResults}
              testResults={testResults}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
