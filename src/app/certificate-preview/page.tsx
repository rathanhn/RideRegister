
"use client";

import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { RideCertificate } from '@/components/ride-certificate';
import { Button } from '@/components/ui/button';
import { Loader2, Award } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

function filter(node: HTMLElement): boolean {
  if (node.tagName === 'i') return false;
  if (node.tagName === 'LINK' && (node as HTMLLinkElement).href.includes('fonts.googleapis.com')) {
    return false;
  }
  return true;
}

function CertificatePreviewContent() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = React.useState(false);

    const riderName = searchParams.get('name') || 'Honorable Rider';
    const riderPhotoUrl = searchParams.get('photo') || undefined;

    const handleDownload = async () => {
        const node = document.getElementById('certificate');
        if (!node) {
            toast({ variant: 'destructive', title: 'Error', description: 'Certificate element not found.' });
            return;
        }

        setIsDownloading(true);

        try {
            await document.fonts.ready;
            
            const dataUrl = await htmlToImage.toPng(node, {
                cacheBust: true,
                pixelRatio: 3,
                useCORS: true,
                filter: filter,
            });

            const pdf = new jsPDF({ 
                orientation: 'landscape', 
                unit: 'px', 
                format: [1123, 794] 
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, 1123, 794);
            pdf.save(`${riderName}-certificate.pdf`);

        } catch (e) {
          console.error(e);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not download certificate.' });
        } finally {
          setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-4">
            <div className="transform-gpu scale-[0.3] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.8] origin-center">
                <RideCertificate riderName={riderName} riderPhotoUrl={riderPhotoUrl} />
            </div>
            <Button onClick={handleDownload} disabled={isDownloading} className="mt-8">
                {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Award className="mr-2 h-4 w-4" />
                )}
                {isDownloading ? "Generating PDF..." : "Download as PDF"}
            </Button>
        </div>
    );
}


export default function CertificatePreviewPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CertificatePreviewContent />
        </Suspense>
    );
}
