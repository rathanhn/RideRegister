
"use client";

import { useSearchParams } from 'next/navigation';
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { RideCertificate } from '@/components/ride-certificate';
import { Button } from '@/components/ui/button';
import { Loader2, Award } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { set } from 'date-fns';

// A more robust filter function
const filter = (node: HTMLElement): boolean => {
  // Do not inline any external resources, rely on the proxy for images
  if (node.tagName === 'LINK') return false;
  if (node.tagName === 'I') return false; // example for ignoring icon fonts
  return true;
};

// Function to generate image data from the certificate element
const generateImageDataUrl = async (node: HTMLElement): Promise<string> => {
    // Use toCanvas to have more control and avoid font/CORS issues
    const canvas = await htmlToImage.toCanvas(node, {
        pixelRatio: 3,
        filter: filter,
        skipFonts: true, // Prevents errors from trying to inline Google Fonts
    });
    return canvas.toDataURL('image/png', 1.0);
};

function CertificatePreviewContent() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);
    const [origin, setOrigin] = useState('');
    const certificateRef = useRef<HTMLDivElement>(null);
    const [proxiedPhotoUrl, setProxiedPhotoUrl] = useState<string | undefined>(undefined);
    const [isLoadingPhoto, setIsLoadingPhoto] = useState(true);

    const riderName = searchParams.get('name') || 'Honorable Rider';
    const riderPhotoUrl = searchParams.get('photo') || undefined;
    const registrationId = searchParams.get('regId') || '';

    useEffect(() => {
        setOrigin(window.location.origin);
        
        const fetchProxiedImage = async () => {
            if (!riderPhotoUrl) {
                setIsLoadingPhoto(false);
                return;
            }
            try {
                const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(riderPhotoUrl)}`);
                if (!response.ok) throw new Error('Failed to load image');
                const { dataUri } = await response.json();
                setProxiedPhotoUrl(dataUri);
            } catch (error) {
                console.error("Failed to proxy image for certificate", error);
                setProxiedPhotoUrl(riderPhotoUrl); // Fallback to direct URL, might not render in PDF
            } finally {
                setIsLoadingPhoto(false);
            }
        };

        fetchProxiedImage();

    }, [riderPhotoUrl]);


    const handleDownload = async () => {
        if (!certificateRef.current) {
            toast({ variant: 'destructive', title: 'Error', description: 'Certificate element not found.' });
            return;
        }

        setIsDownloading(true);

        try {
            const dataUrl = await generateImageDataUrl(certificateRef.current);
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
    
    if (isLoadingPhoto) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-4">
            <div className="transform-gpu scale-[0.3] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.8] origin-center">
                <RideCertificate 
                    ref={certificateRef}
                    riderName={riderName} 
                    riderPhotoUrl={proxiedPhotoUrl} 
                    registrationId={registrationId} 
                    origin={origin}
                />
            </div>
            <Button onClick={handleDownload} disabled={isDownloading || isLoadingPhoto} className="mt-8">
                {isDownloading || isLoadingPhoto ? (
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
