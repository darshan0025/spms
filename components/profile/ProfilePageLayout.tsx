"use client";

import { useState } from "react";
import ProfileView from "@/components/profile/ProfileView";
import ProfileEdit from "@/components/profile/ProfileEdit";
import ChangePassword from "@/components/profile/ChangePassword";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Lock } from "lucide-react";

interface ProfilePageLayoutProps {
    user: any;
    refreshProfile: () => void;
}

export default function ProfilePageLayout({ user, refreshProfile }: ProfilePageLayoutProps) {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Profile & Settings</h2>
                <p className="text-muted-foreground">Manage your personal information and account security.</p>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <User className="h-4 w-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="edit" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Edit Details
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <ProfileView 
                        user={user} 
                        onEdit={() => setActiveTab("edit")} 
                        onChangePassword={() => setActiveTab("security")}
                    />
                </TabsContent>

                <TabsContent value="edit" className="space-y-4">
                    <ProfileEdit
                        user={user}
                        onCancel={() => setActiveTab("overview")}
                        onSave={() => {
                            refreshProfile();
                            setActiveTab("overview");
                        }}
                    />
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <ChangePassword />
                </TabsContent>
            </Tabs>
        </div>
    );
}
