import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Eye, X } from "lucide-react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


const JobSeekerCertificates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [previewCertificate, setPreviewCertificate] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["certificates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 2000,
  });

  const generateDemoCertificate = async () => {
    if (!user?.id) return;
    try {
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      const userName = profile?.full_name || user?.email?.split('@')[0] || "Demo Candidate";

      await supabase.from("certificates").insert({
        user_id: user.id,
        name: userName,
        title: "IT Technical Interview Certification",
        assessment_score: 85,
        interview_score: 88,
        status: "issued",
        certificate_number: `CERT-DEMO-${Date.now().toString().slice(-6)}`,
      });

      toast({ title: "Demo Certificate Created!", description: "A demo certificate has been generated for you." });
    } catch (err) {
      console.error("Error creating demo certificate:", err);
      toast({ title: "Error", description: "Failed to create demo certificate", variant: "destructive" });
    }
  };

  const downloadPDF = async (cert: any) => {
    setIsDownloading(cert.id);
    try {
      const { default: jsPDFModule } = await import('jspdf');
      const pdf = new jsPDFModule("landscape", "mm", "a4");
      const width = 297;
      const height = 210;
      const issuer = "InterQ Certification Authority";
      const issueDate = new Date(cert.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, width, height, "F");

      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(3);
      pdf.rect(10, 10, width - 20, height - 20);

      pdf.setDrawColor(147, 197, 253);
      pdf.setLineWidth(1);
      pdf.rect(15, 15, width - 30, height - 30);

      pdf.setFontSize(28);
      pdf.setTextColor(59, 130, 246);
      pdf.setFont("helvetica", "bold");
      pdf.text("InterQ", width / 2, 35, { align: "center" });

      pdf.setFontSize(32);
      pdf.setTextColor(30, 41, 59);
      pdf.text("Certificate of Completion", width / 2, 60, { align: "center" });

      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(80, 70, width - 80, 70);

      pdf.setFontSize(14);
      pdf.setTextColor(107, 114, 128);
      pdf.text("This certificate is proudly presented to", width / 2, 90, { align: "center" });

      pdf.setFontSize(24);
      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "bold");
      pdf.text(cert.name, width / 2, 105, { align: "center" });

      pdf.setFontSize(14);
      pdf.setTextColor(107, 114, 128);
      pdf.setFont("helvetica", "normal");
      pdf.text("For successfully completing the", width / 2, 125, { align: "center" });

      pdf.setFontSize(22);
      pdf.setTextColor(59, 130, 246);
      pdf.setFont("helvetica", "bold");
      pdf.text(cert.title, width / 2, 140, { align: "center" });

      pdf.setFontSize(12);
      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Assessment Score: ${cert.assessment_score}%`, width / 2 - 50, 160);
      pdf.text(`Interview Score: ${cert.interview_score}%`, width / 2 + 50, 160);

      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Date of Completion: ${issueDate}`, width / 2, 180, { align: "center" });

      pdf.setFontSize(10);
      pdf.setTextColor(156, 163, 175);
      pdf.text(`Certificate No: ${cert.certificate_number}`, width / 2, 195, { align: "center" });

      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Issued by: ${issuer}`, 30, 195);

      pdf.save(`InterQ-Certificate-${cert.name.replace(/\s+/g, '-')}.pdf`);
      toast({ title: "Downloaded!", description: "Certificate PDF downloaded successfully." });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
    } finally {
      setIsDownloading(null);
    }
  };

  const CertificatePreview = ({ cert, onClose }: { cert: any; onClose: () => void }) => {
    const issueDate = new Date(cert.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const issuer = "InterQ Certification Authority";

    return (
      <div className="relative w-full max-w-4xl mx-auto">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="border-4 border-blue-600 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-white shadow-2xl">
          <div className="text-center space-y-6">
            <div className="text-4xl font-bold text-blue-600 tracking-wide">InterQ</div>
            <div className="text-sm text-gray-500 uppercase tracking-widest font-semibold">
              Certificate of Completion
            </div>

            <div className="py-6">
              <div className="text-sm text-gray-500 mb-2">This certificate is proudly presented to</div>
              <div className="text-3xl font-bold text-gray-800">{cert.name}</div>
            </div>

            <div className="py-4">
              <div className="text-sm text-gray-500 mb-2">For successfully completing the</div>
              <div className="text-2xl font-semibold text-blue-600">{cert.title}</div>
            </div>

            <div className="flex justify-center gap-16 py-6 border-t-2 border-b-2 border-blue-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800">{cert.assessment_score}%</div>
                <div className="text-sm text-gray-600 font-medium">Assessment Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800">{cert.interview_score}%</div>
                <div className="text-sm text-gray-600 font-medium">Interview Score</div>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Date of Completion:</span> {issueDate}
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-semibold">Certificate No:</span> {cert.certificate_number}
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-semibold">Issued by:</span> {issuer}
              </div>
            </div>

            <div className="pt-6 border-t border-blue-200">
              <div className="text-xs text-gray-400 italic">
                This certificate verifies that the named individual has successfully completed
                the required assessment and interview components with demonstrated proficiency.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          Your Certificates
        </h2>
        <p className="text-sm text-muted-foreground">{certificates.length} certificate(s) earned</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Award className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No certificates yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Complete assessments and interviews to earn certificates</p>
            <Button onClick={generateDemoCertificate} variant="outline">
              <Award className="w-4 h-4 mr-2" />
              Generate Demo Certificate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certificates.map((cert: any) => (
            <Card key={cert.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="border-2 border-blue-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-white">
                  <div className="text-center space-y-4">
                    <div className="text-2xl font-bold text-blue-600">InterQ</div>
                    <div className="text-sm text-gray-500 uppercase tracking-widest">Certificate of Completion</div>
                    
                    <div className="py-4">
                      <div className="text-xs text-gray-400 mb-1">This certificate is presented to</div>
                      <div className="text-xl font-bold text-gray-800">{cert.name}</div>
                    </div>

                    <div className="py-2">
                      <div className="text-xs text-gray-400 mb-1">For successfully completing</div>
                      <div className="text-lg font-semibold text-blue-600">{cert.title}</div>
                    </div>

                    <div className="flex justify-center gap-8 py-4 border-t border-b border-blue-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{cert.assessment_score}%</div>
                        <div className="text-xs text-gray-500">Assessment</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{cert.interview_score}%</div>
                        <div className="text-xs text-gray-500">Interview</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400">
                      {new Date(cert.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => setPreviewCertificate(cert)} 
                    variant="outline" 
                    className="flex-1"
                    aria-label={`Preview certificate for ${cert.name}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    onClick={() => downloadPDF(cert)} 
                    className="flex-1"
                    disabled={isDownloading === cert.id}
                    aria-label={`Download PDF certificate for ${cert.name}`}
                  >
                    {isDownloading === cert.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!previewCertificate} onOpenChange={() => setPreviewCertificate(null)}>
        <DialogContent 
          className="max-w-5xl max-h-[90vh] overflow-y-auto"
          aria-describedby="certificate-preview-description"
        >
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {previewCertificate && (
            <CertificatePreview cert={previewCertificate} onClose={() => setPreviewCertificate(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobSeekerCertificates;