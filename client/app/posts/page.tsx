"use client";

import React, { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import marketplace from "@/app/marketplace.json";
import { WalletContext } from "@/context/Wallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Heart,
  MessageCircle,
  Share2,
  RefreshCw,
  Users,
  Megaphone,
  Clock,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import WalletButton from "@/components/WalletButton";

interface PostData {
  tokenId: bigint;
  owner: string;
  seller: string;
  price: bigint;
  metadata?: {
    name: string;
    description: string;
    image: string;
  };
  timestamp?: string;
}

const ProtestFeedPage = () => {
  const router = useRouter();
  const { userAddress, signer, isConnected } = useContext(WalletContext);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Fetch post metadata from IPFS
  const fetchMetadata = async (tokenURI: string) => {
    try {
      const response = await fetch(tokenURI);
      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.error("Error fetching metadata:", error);
      return null;
    }
  };

  // Fetch all protest posts
  const fetchAllPosts = async () => {
    if (!signer) return;

    try {
      setLoading(true);
      const contract = new ethers.Contract(
        marketplace.address,
        marketplace.abi,
        signer
      );

      const listedPosts = await contract.getAllListedNFTs();

      const postPromises = listedPosts.map(async (post: any) => {
        try {
          const tokenURI = await contract.tokenURI(post.tokenId);
          const metadata = await fetchMetadata(tokenURI);

          return {
            tokenId: post.tokenId,
            owner: post.owner,
            seller: post.seller,
            price: post.price,
            metadata,
            timestamp: new Date().toISOString() // Mock timestamp
          };
        } catch (error) {
          console.error(`Error fetching post ${post.tokenId}:`, error);
          return {
            tokenId: post.tokenId,
            owner: post.owner,
            seller: post.seller,
            price: post.price,
            metadata: null,
            timestamp: new Date().toISOString()
          };
        }
      });

      const postsWithMetadata = await Promise.all(postPromises);
      setPosts(postsWithMetadata);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  // Handle post click navigation
  const handlePostClick = (tokenId: bigint) => {
    router.push(`/posts/${tokenId.toString()}`);
  };

  // Handle like/unlike
  const handleLike = (tokenId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking like button
    const newLikedPosts = new Set(likedPosts);
    if (likedPosts.has(tokenId)) {
      newLikedPosts.delete(tokenId);
      toast.success("Removed from liked posts");
    } else {
      newLikedPosts.add(tokenId);
      toast.success("Added to liked posts");
    }
    setLikedPosts(newLikedPosts);
  };

  // Handle share
  const handleShare = (post: PostData, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking share button
    const postUrl = `${window.location.origin}/posts/${post.tokenId.toString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: post.metadata?.name || `Protest #${post.tokenId}`,
        text: post.metadata?.description || "Check out this protest",
        url: postUrl,
      });
    } else {
      navigator.clipboard.writeText(postUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  // Refresh posts
  const refreshPosts = async () => {
    setRefreshing(true);
    await fetchAllPosts();
    setRefreshing(false);
    toast.success("Feed refreshed!");
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "TRENDING";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  useEffect(() => {
    if (isConnected && signer) {
      fetchAllPosts();
    }
  }, [isConnected, signer]);

  if (!isConnected) {
    return (
      <div className="w-full py-[20vh] min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-black pt-20">
        <Card className="w-full max-w-4xl bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <div className="p-4 rounded-full bg-red-500/10 border-2 border-red-500">
                <Wallet className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-300 mb-6 text-sm sm:text-base">
                  Connect your wallet to view and interact with protest posts
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

  return (
    <div className="w-full min-h-screen bg-black pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div className="sticky top-20 z-10 bg-black/80 backdrop-blur-sm border-b border-white/10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/10 border border-red-500">
                <Megaphone className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  Protest Feed
                </h1>
                <p className="text-gray-400 text-sm">
                  Voices of change
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500">
                <Users className="w-3 h-3 mr-1" />
                {posts.length}
              </Badge>

              <Button
                onClick={refreshPosts}
                disabled={refreshing}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-500/10"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-black border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-10 h-10 rounded-full bg-white/5" />
                    <div className="flex-1">
                      <Skeleton className="h-4 bg-white/5 rounded mb-2" />
                      <Skeleton className="h-3 w-24 bg-white/5 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-4 bg-white/5 rounded mb-2" />
                  <Skeleton className="h-4 bg-white/5 rounded mb-4" />
                  <Skeleton className="w-full h-48 bg-white/5 rounded-lg mb-4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-16 bg-white/5 rounded" />
                    <Skeleton className="h-8 w-16 bg-white/5 rounded" />
                    <Skeleton className="h-8 w-16 bg-white/5 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-red-500/10 border-2 border-red-500 w-16 h-16 mx-auto mb-6">
              <Megaphone className="w-8 h-8 text-red-500 mx-auto mt-2" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No Posts Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Be the first to share your voice!
            </p>
          </div>
        )}

        {/* Posts Feed */}
        {!loading && posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card
                key={post.tokenId.toString()}
                className="bg-black border border-white/10 hover:border-red-500/50 transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-6">

                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {formatAddress(post.owner)}
                        </p>
                        
                      </div>
                    </div>

                    <Badge variant="outline" className="border-red-500/30 text-red-400">
                      #{post.tokenId.toString()}
                    </Badge>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {post.metadata?.name || `Protest #${post.tokenId}`}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {post.metadata?.description || "No description available"}
                    </p>
                  </div>

                  {/* Post Image */}
                  {post.metadata?.image && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={post.metadata.image}
                        alt={post.metadata.name || `Post #${post.tokenId}`}
                        className="w-full max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                    <Button
                      onClick={(e) => handleLike(post.tokenId.toString(), e)}
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-2 transition-colors ${likedPosts.has(post.tokenId.toString())
                          ? 'text-red-500 hover:text-red-400'
                          : 'text-gray-400 hover:text-red-500'
                        }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${likedPosts.has(post.tokenId.toString()) ? 'fill-current' : ''
                          }`}
                      />
                      <span className="text-sm">
                        {likedPosts.has(post.tokenId.toString()) ? 'Liked' : 'Like'}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtestFeedPage;