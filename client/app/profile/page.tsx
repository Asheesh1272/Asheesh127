"use client";

import React, { useContext, useState, useEffect } from "react";
import { WalletContext } from "@/context/Wallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Calendar,
    Hash,
    ImageIcon,
    ExternalLink,
    Clock,
    Sparkles,
    MessageSquare,
    DollarSign,
    TrendingUp,
    Copy,
    CheckCircle
} from "lucide-react";
import { db } from "@/firebase/init";
import { collection, getDocs, doc, getDoc, query, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import WalletButton from "@/components/WalletButton";
import Link from "next/link";

interface Post {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    metadataUrl: string;
    transactionHash: string;
    price: string;
    createdAt: string;
    timestamp: number;
    status: string;
}

interface UserStats {
    walletAddress: string;
    totalPosts: number;
    createdAt: string;
    lastPostAt: string;
    updatedAt: string;
}

const ProfilePage = () => {
    const { userAddress, isConnected } = useContext(WalletContext);
    const [posts, setPosts] = useState<Post[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedHash, setCopiedHash] = useState<string | null>(null);

    useEffect(() => {
        if (isConnected && userAddress) {
            fetchUserData();
        }
    }, [isConnected, userAddress]);

    const fetchUserData = async () => {
        if (!userAddress) return;

        setLoading(true);
        try {
            // Fetch user stats
            const userRef = doc(db, "users", userAddress);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                setUserStats(userDoc.data() as UserStats);
            }

            // Fetch user posts
            const postsRef = collection(db, "users", userAddress, "posts");
            const postsQuery = query(postsRef, orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(postsQuery);

            const userPosts: Post[] = [];
            querySnapshot.forEach((doc) => {
                userPosts.push({
                    id: doc.id,
                    ...doc.data()
                } as Post);
            });

            setPosts(userPosts);

        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Failed to fetch profile data");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatAddress = (address: string) => {
        return `${address}`;
    };

    const copyToClipboard = (text: string, type: 'address' | 'hash') => {
        navigator.clipboard.writeText(text);
        if (type === 'hash') {
            setCopiedHash(text);
            setTimeout(() => setCopiedHash(null), 2000);
        }
        toast.success(`${type === 'address' ? 'Address' : 'Transaction hash'} copied to clipboard!`);
    };

    const openPost = (postId: string) => {
        window.location.href = `/posts/${postId}`;
    };

    if (!isConnected) {
        return (
            <div className="w-full h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-black">
                <Card className="w-full max-w-2xl bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col items-center justify-center gap-6 text-center">
                            <div className="p-4 rounded-full bg-red-500/10 border-2 border-red-500">
                                <User className="w-8 h-8 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                    Connect Your Wallet
                                </h3>
                                <p className="text-gray-300 mb-6 text-sm sm:text-base">
                                    Connect your wallet to view your profile
                                </p>
                                <div className="flex justify-center">
                                    <WalletButton />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-black">
                <Card className="w-full max-w-2xl bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center justify-center gap-4 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
                            <p className="text-white text-lg">Loading profile...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-black">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Profile Header */}
                <Card className="bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center justify-center gap-3 text-red-400 text-xl sm:text-2xl font-bold">
                            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500">
                                <User className="w-6 h-6 text-red-500" />
                            </div>
                            <span>Profile</span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Wallet Address */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                                <Hash className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Wallet Address</p>
                                    <p className="text-white font-mono text-sm sm:text-base">
                                        {formatAddress(userAddress || '')}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => copyToClipboard(userAddress || '', 'address')}
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Stats */}
                        {userStats && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <MessageSquare className="w-5 h-5 text-red-500" />
                                        <span className="text-2xl font-bold text-white">{userStats.totalPosts}</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Total Protests</p>
                                </div>

                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Calendar className="w-5 h-5 text-red-500" />
                                        <span className="text-sm font-bold text-white">
                                            {formatDate(userStats.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">Member Since</p>
                                </div>

                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Clock className="w-5 h-5 text-red-500" />
                                        <span className="text-sm font-bold text-white">
                                            {formatDate(userStats.lastPostAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">Last Post</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Posts Section */}
                <Card className="bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-red-400 text-lg sm:text-xl">
                                <Sparkles className="w-5 h-5" />
                                <span>My Protests ({posts.length})</span>
                            </div>
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {posts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="p-4 rounded-full bg-red-500/10 border-2 border-red-500 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                    <MessageSquare className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-white text-lg font-semibold mb-2">No Protests Yet</h3>
                                <p className="text-gray-400 mb-4">Start creating your first protest to see it here!</p>
                                <Link href="/upload">
                                    <Button className="bg-red-500 hover:bg-red-600 text-white">
                                        Create Protest
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <Card key={post.id} className="bg-white/5 border border-white/10 hover:border-red-500/50 transition-all duration-200">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col sm:flex-row gap-4">

                                                {/* Post Image */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-full sm:w-32 h-32 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                                        <img
                                                            src={post.imageUrl}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Post Content */}
                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <h3 className="text-white font-semibold text-lg mb-1">{post.title}</h3>
                                                        <p className="text-gray-300 text-sm line-clamp-2">{post.content}</p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">

                                                        <Badge variant="outline" className="border-green-500 text-green-500">
                                                            {post.status}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{formatDate(post.createdAt)}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                onClick={() => copyToClipboard(post.transactionHash, 'hash')}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                                                            >
                                                                {copiedHash === post.transactionHash ? (
                                                                    <CheckCircle className="w-3 h-3" />
                                                                ) : (
                                                                    <Copy className="w-3 h-3" />
                                                                )}
                                                            </Button>

                                                            <Button
                                                                onClick={() => openPost(post.id)}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;