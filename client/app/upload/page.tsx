"use client";

import React, { useContext, useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/pinata";
import { toast } from "sonner";
import { ethers } from "ethers";
import marketplace from "@/app/marketplace.json";
import { WalletContext } from "@/context/Wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ImageIcon, Sparkles, Upload, X } from "lucide-react";
import WalletButton from "@/components/WalletButton";
import { db } from "@/firebase/init";
import { collection, addDoc, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const nftPrice = "1000";
  const { userAddress, signer, isConnected } = useContext(WalletContext);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  async function uploadImageToPinata() {
    if (!image) return null;
    try {
      const fd = new FormData();
      fd.append("file", image as Blob);

      const uploadPromise = uploadFileToIPFS(fd);
      toast.promise(uploadPromise, {
        loading: "Listing post...",
        success: "Post listed successfully!",
        error: "Failed to list post",
      });

      const response = await uploadPromise;
      return response.success ? response.pinataURL : null;
    } catch {
      toast.error("Error uploading post");
      return null;
    }
  }

  async function uploadMetadataToIPFS() {
    if (!title || !content || !image) {
      toast.error("Title, content, and image are required");
      return null;
    }

    const imageFileUrl = await uploadImageToPinata();
    if (!imageFileUrl) return null;

    const nftJSON = {
      name: title,
      description: content,
      price: nftPrice,
      image: imageFileUrl,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      return response.success ? response.pinataURL : null;
    } catch (e) {
      console.log("Error uploading JSON metadata: ", e);
      toast.error("Failed to upload metadata");
      return null;
    }
  }

  async function savePostToFirebase(postData: {
    title: string;
    content: string;
    imageUrl: string;
    metadataUrl: string;
    transactionHash: string;
    price: string;
  }) {
    try {
      if (!userAddress) {
        throw new Error("No wallet address available");
      }

      const postDoc = {
        ...postData,
        walletAddress: userAddress,
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
        status: "active"
      };

      // Create/update user document first
      const userRef = doc(db, "users", userAddress);

      try {
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          // User exists, increment post count
          await updateDoc(userRef, {
            totalPosts: increment(1),
            lastPostAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else {
          // User doesn't exist, create new user document
          await setDoc(userRef, {
            walletAddress: userAddress,
            totalPosts: 1,
            createdAt: new Date().toISOString(),
            lastPostAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (userError) {
        console.error("Error updating user document:", userError);
        // Continue with post creation even if user update fails
      }

      // Add the post to the user's posts subcollection
      const userPostsRef = collection(db, "users", userAddress, "posts");
      const docRef = await addDoc(userPostsRef, postDoc);

      console.log("Post saved to Firebase with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error saving post to Firebase: ", error);
      throw error;
    }
  }

  async function listNFT() {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      const metadataURLPromise = uploadMetadataToIPFS();
      toast.promise(metadataURLPromise, {
        loading: "📤 Uploading metadata... Please wait!",
        success: "✅ Metadata uploaded successfully! You're all set 🚀",
        error: "❌ Oops! Metadata upload failed. Please try again 🔁",
      });

      const metadataURL = await metadataURLPromise;
      if (!metadataURL) return;

      const contract = new ethers.Contract(
        marketplace.address,
        marketplace.abi,
        signer
      );
      const price = ethers.parseEther(nftPrice);

      const transactionPromise = contract.createToken(metadataURL, price);
      toast.promise(transactionPromise, {
        loading: "✊ Creating your protest... Please hold on!",
        success: "✅ Protest listed successfully! Your voice is now live 📢",
        error: "❌ Failed to create protest. Please try again 🔁",
      });

      const transaction = await transactionPromise;
      await transaction.wait();

      // Save post to Firebase after successful blockchain transaction
      try {
        const imageUrl = await uploadImageToPinata();
        if (imageUrl) {
          const postData = {
            title,
            content,
            imageUrl,
            metadataUrl: metadataURL,
            transactionHash: transaction.hash,
            price: nftPrice
          };

          await savePostToFirebase(postData);
          console.log("Post successfully saved to Firebase");
        }
      } catch (firebaseError) {
        console.error("Firebase save error:", firebaseError);
        // Don't show toast error for Firebase issues
      }

      toast.success("🎉 Protest listed successfully!");

      // Reset form
      setTitle("");
      setContent("");
      setImage(null);
      setImagePreview(null);
    } catch (e) {
      toast.error("Failed to list Protest");
      console.log("Error listing Protest: ", e);
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="w-full h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-black">
        <Card className="w-full max-w-2xl bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <div className="p-4 rounded-full bg-red-500/10 border-2 border-red-500">
                <Sparkles className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-300 mb-6 text-sm sm:text-base">
                  Connect your wallet to start creating and listing Protests
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
    <div className="w-full h-screen py-[10vh] max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="w-full bg-black border-2 border-red-500 shadow-2xl shadow-red-500/20 sticky top-8">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <CardTitle className="flex items-center justify-center gap-3 text-red-400 text-lg sm:text-xl font-semibold">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500">
              <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <span>Create New Protest</span>
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500">
              <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
          </CardTitle>
        </CardHeader>


        <CardContent className="space-y-6 px-4 sm:px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white font-medium text-sm sm:text-base">
              Title
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your protest title..."
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-white font-medium text-sm sm:text-base">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your protest message..."
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500 min-h-[100px] resize-none text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-white font-medium text-sm sm:text-base">
              Image
            </Label>

            {!imagePreview ? (
              <div className="relative">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white/5 border-2 border-dashed border-white/20 rounded-lg hover:border-red-500 transition-colors">
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-4" />
                  <p className="text-white text-sm sm:text-base font-medium mb-2">
                    Click to upload image
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm text-center">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative p-2 bg-white/5 rounded-lg border border-white/20">
                <button
                  onClick={removeImage}
                  className="absolute top-4 right-4 z-10 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-[400px] sm:max-h-[500px] object-contain rounded-md transition-all duration-300"
                />
              </div>
            )}
          </div>


          <div className="pt-4 border-t border-white/10">

            <Button
              onClick={listNFT}
              disabled={loading || !title || !content || !image}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Protest...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create & List Protest
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePost;