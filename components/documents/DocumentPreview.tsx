"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, FileText, FileArchive } from "lucide-react";

interface DocumentPreviewProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: {
        file_name: string;
        file_url: string;
        file_type: string | null;
    } | null;
}

export default function DocumentPreview({ open, onOpenChange, file }: DocumentPreviewProps) {
    if (!file) return null;

    const isImage = file.file_type?.startsWith("image/");
    const isPdf = file.file_type?.includes("pdf") || file.file_name?.toLowerCase().endsWith(".pdf");
    const isVideo = file.file_type?.startsWith("video/");
    const isAudio = file.file_type?.startsWith("audio/");

    const renderPreview = () => {
        if (isImage) {
            return (
                <div className="flex items-center justify-center w-full h-full bg-black/5 rounded-lg overflow-hidden">
                    <img
                        src={file.file_url}
                        alt={file.file_name}
                        className="max-w-full max-h-[65vh] object-contain rounded"
                    />
                </div>
            );
        }

        if (isPdf) {
            return (
                <iframe
                    src={file.file_url}
                    className="w-full h-[65vh] rounded-lg border"
                    title={file.file_name}
                />
            );
        }

        if (isVideo) {
            return (
                <video
                    src={file.file_url}
                    controls
                    className="w-full max-h-[65vh] rounded-lg"
                >
                    Your browser does not support the video tag.
                </video>
            );
        }

        if (isAudio) {
            return (
                <div className="flex flex-col items-center justify-center gap-6 py-12">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-primary" />
                    </div>
                    <audio src={file.file_url} controls className="w-full max-w-md" />
                </div>
            );
        }

        // Fallback for non-previewable files
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
                <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
                    <FileArchive className="h-10 w-10" />
                </div>
                <p className="text-sm font-medium text-foreground">{file.file_name}</p>
                <p className="text-sm">Preview is not available for this file type.</p>
                <Button onClick={() => window.open(file.file_url, "_blank")} className="mt-2">
                    <Download className="mr-2 h-4 w-4" /> Download to View
                </Button>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-background">
                <DialogTitle className="sr-only">{file.file_name}</DialogTitle>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
                    <p className="text-sm font-semibold truncate flex-1 mr-4">{file.file_name}</p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.file_url, "_blank")}
                        >
                            <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                    </div>
                </div>
                {/* Preview Area */}
                <div className="p-4 min-h-[200px]">
                    {renderPreview()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
