"use client";
import AuthGuard from "@/app/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, FileText, Trash2, Download, Loader2, CheckCircle2, AlertCircle, File, FileImage, FileArchive, User, Eye } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import DocumentPreview from "@/components/documents/DocumentPreview";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Document {
    doc_id: number;
    file_name: string;
    file_url: string;
    file_id: string;
    file_type: string | null;
    file_size: number | null;
    uploader_name: string;
    uploader_role: string;
    created_at: string;
    description: string | null;
    project_group_id: number | null;
}

function getFileIcon(fileType: string | null) {
    if (!fileType) return <File className="h-5 w-5 text-muted-foreground" />;
    if (fileType.startsWith("image/")) return <FileImage className="h-5 w-5 text-blue-500" />;
    if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar"))
        return <FileArchive className="h-5 w-5 text-yellow-500" />;
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    return <FileText className="h-5 w-5 text-muted-foreground" />;
}

function formatFileSize(bytes: number | null) {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Staff project groups state
    const [staffGroups, setStaffGroups] = useState<any[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");

    const fetchDocuments = useCallback(async () => {
        try {
            const res = await fetch("/api/documents");
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            }
        } catch (err) {
            console.error("Failed to fetch documents", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
        
        // Fetch staff's project groups
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.staff_id) {
                fetch(`/api/staff/groups?staff_id=${user.staff_id}`)
                    .then(res => res.json())
                    .then(groups => {
                        setStaffGroups(groups || []);
                        if (groups && groups.length > 0) {
                            setSelectedGroupId(groups[0].project_group_id.toString());
                        }
                    })
                    .catch(err => console.error("Error fetching staff groups:", err));
            }
        }
    }, [fetchDocuments]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!selectedGroupId) {
            setUploadMsg({ type: "error", text: "Please select a project group first." });
            return;
        }

        setUploading(true);
        setUploadMsg(null);

        try {
            // 1. Get auth params from server
            const authRes = await fetch("/api/documents/imagekit-auth");
            if (!authRes.ok) throw new Error("Failed to get upload auth");
            const authParams = await authRes.json();

            // 2. Upload to ImageKit
            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileName", file.name);
            formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
            formData.append("signature", authParams.signature);
            formData.append("expire", String(authParams.expire));
            formData.append("token", authParams.token);
            formData.append("folder", "/spms/documents/staff");

            const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const errData = await uploadRes.json();
                throw new Error(errData.message || "Upload failed");
            }

            const uploadData = await uploadRes.json();

            // 3. Save metadata to our DB
            const saveRes = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: uploadData.name,
                    fileUrl: uploadData.url,
                    fileId: uploadData.fileId,
                    fileType: uploadData.fileType || file.type,
                    fileSize: uploadData.size || file.size,
                    project_group_id: parseInt(selectedGroupId),
                }),
            });

            if (!saveRes.ok) throw new Error("Failed to save document metadata");

            setUploadMsg({ type: "success", text: `"${file.name}" uploaded successfully for group!` });
            fetchDocuments();
        } catch (err: any) {
            console.error("Upload error:", err);
            setUploadMsg({ type: "error", text: err.message || "Upload failed. Please try again." });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (docId: number) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            const res = await fetch(`/api/documents?id=${docId}`, { method: "DELETE" });
            if (res.ok) {
                setDocuments((prev) => prev.filter((d) => d.doc_id !== docId));
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const studentDocs = documents.filter((d) => d.uploader_role === "STUDENT");
    const staffDocs = documents.filter((d) => d.uploader_role === "STAFF");

    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Project Documents</h2>
                        <p className="text-muted-foreground">Manage and review document submissions from students.</p>
                    </div>
                </div>

                {/* Upload Message */}
                {uploadMsg && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium border ${
                        uploadMsg.type === "success"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                        {uploadMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {uploadMsg.text}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Upload Card */}
                    <Card className="bg-background/60 backdrop-blur-xl border-border/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <UploadCloud className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Upload Reference File</h3>
                            <p className="text-sm max-w-sm">
                                share format, guideline or reference material with selected project group.
                            </p>
                            
                            <div className="w-full max-w-xs space-y-2 text-left">
                                <Label htmlFor="group-select">Select Target Project Group</Label>
                                <Select
                                    value={selectedGroupId}
                                    onChange={setSelectedGroupId}
                                    placeholder="Select Project Group"
                                    options={staffGroups.map(g => ({
                                        label: g.group_name || `Group ${g.project_group_id}`,
                                        value: g.project_group_id.toString()
                                    }))}
                                />
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleUpload}
                                accept=".pdf,.doc,.docx,.zip,.rar,.pptx,.ppt,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                            />
                            <Button
                                className="mt-2 w-full max-w-xs"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading || !selectedGroupId}
                            >
                                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {uploading ? "Uploading..." : "Select File to Upload"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Student Submissions */}
                    <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                        <CardHeader>
                            <CardTitle>Student Submissions</CardTitle>
                            <CardDescription>Documents submitted by students for review.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : studentDocs.length === 0 ? (
                                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="h-6 w-6 opacity-50" />
                                        <span>No student submissions yet.</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                    {studentDocs.map((doc) => (
                                        <div
                                            key={doc.doc_id}
                                            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => setPreviewDoc(doc)}
                                        >
                                            {getFileIcon(doc.file_type)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate text-primary hover:underline">{doc.file_name}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <User className="h-3 w-3" /> {doc.uploader_name} • {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setPreviewDoc(doc)}
                                                    title="Preview"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => window.open(doc.file_url, "_blank")}
                                                    title="Download"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(doc.doc_id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Staff Reference Files */}
                <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                    <CardHeader>
                        <CardTitle>My Uploaded References</CardTitle>
                        <CardDescription>Reference files you've shared with project groups.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : staffDocs.length === 0 ? (
                            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <FileText className="h-6 w-6 opacity-50" />
                                    <span>No reference files uploaded yet.</span>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {staffDocs.map((doc) => (
                                    <div
                                        key={doc.doc_id}
                                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => setPreviewDoc(doc)}
                                    >
                                        {getFileIcon(doc.file_type)}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate text-primary hover:underline">{doc.file_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setPreviewDoc(doc)}
                                                title="Preview"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => window.open(doc.file_url, "_blank")}
                                                title="Download"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(doc.doc_id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <DocumentPreview
                    open={!!previewDoc}
                    onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}
                    file={previewDoc}
                />
            </div>
        </AuthGuard>
    );
}
