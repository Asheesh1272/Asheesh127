"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams } from "next/navigation";
import { WalletContext } from "@/context/Wallet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  MessageSquare,
  Copy,
  CheckCircle,
  Share2,
  User
} from "lucide-react";
import { db } from "@/firebase/init";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { ethers } from "ethers";
import marketplace from "@/app/marketplace.json";

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
  authorAddress?: string;
}

const PostDetailPage = () => {
  const params = useParams();
  const postId = params?.id as string;

  const { userAddress, signer, isConnected } = useContext(WalletContext);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [copiedItems, setCopiedItems] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    if (!postId) return;

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      let foundPost: Post | null = null;
      let authorAddress: string | null = null;

      for (const userDoc of usersSnapshot.docs) {
        const postsRef = collection(db, "users", userDoc.id, "posts");
        const postsSnapshot = await getDocs(postsRef);

        for (const postDoc of postsSnapshot.docs) {
          if (postDoc.id === postId) {
            foundPost = {
              id: postDoc.id,
              ...postDoc.data(),
              authorAddress: userDoc.id
            } as Post;
            break;
          }
        }

        if (foundPost) break;
      }

      if (foundPost) {
        setPost(foundPost);
      } else {
        toast.error("Post not found");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to fetch post");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatAddress = (address: string) => {
    return `${address}`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopiedItems(prev => ({ ...prev, [type]: false }));
    }, 2000);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`);
  };

  const sharePost = () => {
    const url = window.location.href;
    copyToClipboard(url, "link");
  };

  const goBack = () => {
    window.history.back();
  };

  const purchaseNFT = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!post || !signer) {
      toast.error("Post or signer not available");
      return;
    }

    setPurchasing(true);
    try {
      const contract = new ethers.Contract(
        marketplace.address,
        marketplace.abi,
        signer
      );

      const price = ethers.parseEther(post.price);

      const purchasePromise = contract.purchaseToken(post.id, {
        value: price
      });

      toast.promise(purchasePromise, {
        loading: "🛒 Purchasing NFT... Please confirm the transaction",
        success: "✅ NFT purchased successfully! 🎉",
        error: "❌ Failed to purchase NFT. Please try again"
      });

      const transaction = await purchasePromise;
      await transaction.wait();

      toast.success("🎉 Congratulations! You now own this NFT!");
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      toast.error("Failed to purchase NFT");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <Card className="w-full max-w-2xl bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
              <p className="text-white text-lg">Loading post...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <Card className="w-full max-w-2xl bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="p-4 rounded-full bg-red-500/10 border-2 border-red-500">
                <MessageSquare className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Post Not Found</h3>
              <p className="text-gray-300 mb-4">The post you're looking for doesn't exist or has been removed.</p>
              <Button onClick={goBack} className="bg-red-500 hover:bg-red-600 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Back Button */}
        <Button
          onClick={goBack}
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Post Header */}
        <Card className="bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-red-400 text-xl sm:text-2xl font-bold">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500">
                  <Sparkles className="w-6 h-6 text-red-500" />
                </div>
                <span>Protest Details</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={sharePost}
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Grid with 3 Equal Cards */}
        <div className="grid grid-cols-1 gap-6">
          {/* Image */}
          <Card className="bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20 h-full">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="w-full h-full bg-white/5 rounded-lg overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {/* Title, Content, Status */}
          <Card className="bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20 h-full flex flex-col">
            <CardContent className="p-6 space-y-4 flex-grow flex flex-col justify-between">
              <div>
                <h1 className="text-white font-bold text-2xl mb-3">{post.title}</h1>
                <p className="text-gray-300 text-base leading-relaxed">{post.content}</p>
              </div>
              <div className="pt-4">
                <Separator className="bg-white/10 mb-4" />
                <Badge variant="outline" className="border-green-500 text-green-500">
                  {post.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Author Info + Created At */}
          <Card className="bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20 h-full flex flex-col">
            <CardContent className="p-6 space-y-4 flex-grow flex flex-col justify-between">

              <div>
                <h3 className="text-white font-semibold text-lg flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-red-500" />
                  Creator
                </h3>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-white font-mono text-sm">
                        {formatAddress(post.authorAddress || "")}
                      </p>
                      <p className="text-gray-400 text-xs">Creator</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(post.authorAddress || "", "address")}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    {copiedItems.address ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Separator className="bg-white/10 mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">Details</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">Created</span>
                  </div>
                  <span className="text-white text-sm">{formatDate(post.createdAt)}</span>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default PostDetailPage;