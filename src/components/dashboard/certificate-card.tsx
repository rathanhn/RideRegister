
"use client";

import { useState } from 'react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import type { AppUser } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Loader2, Share2, Sparkles, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RideCertificate } from '../ride-certificate';

interface CertificateCardProps {
    user: AppUser;
}

// Filter function to exclude problematic elements for html-to-image
function filter(node: HTMLElement): boolean {
  if (node.tagName === 'i') return false;
  if (node.tagName === 'LINK' && (node as HTMLLinkElement).href.includes('fonts.googleapis.com')) {
    return false;
  }
  return true;
}

export function CertificateCard({ user }: CertificateCardProps) {
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const certificateRef = React.createRef<HTMLDivElement>();

    const riderName = user.displayName || "Valued Rider";
    const riderPhotoUrl = user.photoURL || undefined;

    const handleDownload = async () => {
        if (!certificateRef.current) return;
        setIsDownloading(true);
        try {
            await document.fonts.ready;
            const dataUrl = await htmlToImage.toPng(certificateRef.current, { pixelRatio: 3, useCORS: true, cacheBust: true, filter });
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1123, 794] });
            pdf.addImage(dataUrl, 'PNG', 0, 0, 1123, 794);
            pdf.save(`${riderName}-certificate.pdf`);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not download certificate.' });
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleShare = async () => {
        if (!certificateRef.current) return;
        setIsSharing(true);
        try {
            await document.fonts.ready;
            const dataUrl = await htmlToImage.toPng(certificateRef.current, { pixelRatio: 3, useCORS: true, cacheBust: true, filter });
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `${riderName}-certificate.png`, { type: blob.type });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                 await navigator.share({
                    title: 'TeleFun Freedom Ride Certificate',
                    text: `I completed the TeleFun Freedom Ride! Here's my certificate.`,
                    files: [file],
                });
            } else {
                 const link = document.createElement('a');
                 link.download = `${riderName}-freedom-ride-certificate.png`;
                 link.href = dataUrl;
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
                 toast({
                     title: 'Image Saved!',
                     description: "Your browser doesn't support direct sharing, so the certificate image has been downloaded. You can share it manually!",
                 });
            }
        } catch (e: any) {
             if (e.name !== 'AbortError') {
                 console.error(e);
                toast({ variant: 'destructive', title: 'Share Failed', 'description': 'Could not share the certificate image.' });
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <>
            <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Award className="h-6 w-6 text-primary" /> Certificate of Completion</CardTitle>
                    <CardDescription>
                        Congratulations on completing the ride! Download your certificate below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleDownload} disabled={isDownloading} className="w-full">
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                        Download (PDF)
                    </Button>
                     <Button onClick={handleShare} disabled={isSharing} variant="outline" className="w-full">
                        {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Share2 className="mr-2 h-4 w-4" />}
                        Share Certificate
                    </Button>
                </CardContent>
            </Card>
            {/* Hidden certificate for image generation */}
            <div className="fixed -z-50 -left-[2000px] top-0">
                 <RideCertificate ref={certificateRef} riderName={riderName} riderPhotoUrl={riderPhotoUrl} />
            </div>
        </>
    );
}
